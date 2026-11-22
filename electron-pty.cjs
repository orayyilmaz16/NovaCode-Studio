'use strict';
// Gerçek terminal (PTY): Windows'ta ConPTY, diğerlerinde pty. vim/htop gibi tam ekran programlar, gerçek Ctrl+C, renk, yeniden boyutlandırma.
// Klasik (boru tabanlı) terminal `electron-term.cjs` içinde kalır; bu modül yanına eklenir.
//
// Güvenlik: yalnız izinli kabuklar (PowerShell/pwsh, CMD, Git Bash; diğer sistemlerde kullanıcının kabuğu); çalışma klasörü açık çalışma klasörü içinde olmalı;
// kimlik yalnız [a-z0-9-]{1,40}; yazma boyutu ve oturum sayısı sınırlı. Renderer rastgele program çalıştıramaz, yalnız kabuk oturumu açar.
// Yerel paket `@lydell/node-pty` tembel yüklenir: yoksa/yüklenemezse `pty:start` 'no-pty' döner ve klasik terminal çalışmaya devam eder.
const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { killTree, killTreeSync } = require('./electron-paths.cjs');

let lib = null; // null: denenmedi, false: yok
const loadLib = () => {
  if (lib !== null) return lib;
  try { lib = require('@lydell/node-pty'); } catch { lib = false; }
  return lib;
};

const sessions = new Map(); // id -> { p, exited, buf, timer }
const MAX_SESSIONS = 8;
const ID_RE = /^[a-z0-9-]{1,40}$/;
const MAX_WRITE = 1 << 20;

let api = { getWindow: () => null, isValidPath: () => false };
const send = (channel, payload) => {
  const w = api.getWindow();
  if (w && !w.isDestroyed()) w.webContents.send(channel, payload);
};

function findOnPath(name) {
  for (const dir of (process.env.PATH || process.env.Path || '').split(path.delimiter)) {
    try { const f = path.join(dir, name); if (fs.existsSync(f)) return f; } catch { /* erişilemez */ }
  }
  return null;
}

// Git for Windows'un bash.exe'si: yalnız bilinen kurulum yolları ve PATH'teki git.exe'ye göre bulunur (renderer yol veremez).
// System32'deki WSL bash.exe bilerek aranmaz.
function findGitBash() {
  if (process.platform !== 'win32') return null;
  const e = process.env;
  const cands = [e.ProgramFiles, e.ProgramW6432, e['ProgramFiles(x86)'], e.LOCALAPPDATA && path.join(e.LOCALAPPDATA, 'Programs')]
    .filter(Boolean).map((b) => path.join(b, 'Git', 'bin', 'bash.exe'));
  const git = findOnPath('git.exe'); // Git\cmd\git.exe (ya da mingw64\bin\git.exe)
  if (git) cands.push(path.join(path.dirname(git), '..', 'bin', 'bash.exe'), path.join(path.dirname(git), '..', '..', 'bin', 'bash.exe'));
  return firstExisting(cands);
}

function firstExisting(cands) {
  for (const f of cands) { try { if (fs.existsSync(f)) return path.resolve(f); } catch { /* erişilemez */ } }
  return null;
}

// ---- Kurulu kabuk profilleri (VS Code'daki gibi): yalnız burada bulunanlar açılabilir ----
// Renderer yalnız profil kimliği (`id`) gönderir; çalıştırılacak dosya ve argümanlar her zaman burada, bilinen konumlardan çözülür.
// CHERE_INVOKING: oturum açma kabuğu çalışma klasöründe kalsın (yoksa ev klasörüne atlar).
const POSIX_LOGIN = { args: ['--login', '-i'], env: { CHERE_INVOKING: '1' } };

// WSL dağıtımları: `wsl -l -q` çıktısı UTF-16LE'dir; docker-desktop gibi iç dağıtımlar elenir. Yoksa/yüklü değilse boş liste.
function wslDistros() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve([]);
    execFile('wsl.exe', ['-l', '-q'], { encoding: 'buffer', timeout: 4000, windowsHide: true }, (err, out) => {
      if (err || !out || !out.length) return resolve([]);
      const utf16 = out.subarray(0, 40).includes(0);
      const text = out.toString(utf16 ? 'utf16le' : 'utf8').replace(/\uFEFF/g, '');
      const names = text.split(/\r?\n/).map((l) => l.replace(/\0/g, '').trim())
        .filter((n) => /^[A-Za-z0-9][\w.-]{0,63}$/.test(n) && !/^docker-desktop/i.test(n)); // boşluklu satır = hata/yardım metni
      resolve([...new Set(names)].slice(0, 12));
    });
  });
}

async function buildProfiles() {
  const list = []; // { id, label, file, args | argsFor(cwd), env }
  const add = (id, label, file, extra = {}) => { if (file) list.push({ id, label, file, args: [], env: {}, ...extra }); };
  if (process.platform !== 'win32') {
    // Windows dışı: kullanıcının kabuğu ('powershell' kimliği geriye dönük uyum için bu) + /etc/shells'teki diğerleri
    const mine = process.env.SHELL || '/bin/sh';
    add('powershell', path.basename(mine), mine);
    try {
      for (const l of fs.readFileSync('/etc/shells', 'utf8').split('\n')) {
        const f = l.trim();
        if (f.startsWith('/') && f !== mine && fs.existsSync(f) && !/nologin|false$/.test(f)) add(`sh:${f}`, path.basename(f), f);
      }
    } catch { /* /etc/shells yok */ }
    return list;
  }
  const e = process.env;
  const pf = [e.ProgramFiles, e.ProgramW6432, e['ProgramFiles(x86)']].filter(Boolean);
  const pwsh = findOnPath('pwsh.exe') || firstExisting(pf.map((b) => path.join(b, 'PowerShell', '7', 'pwsh.exe')));
  add('powershell', 'PowerShell', pwsh || 'powershell.exe', { args: ['-NoLogo'] });
  if (pwsh) add('winps', 'Windows PowerShell', 'powershell.exe', { args: ['-NoLogo'] });
  add('cmd', 'CMD', 'cmd.exe');
  add('gitbash', 'Git Bash', findGitBash(), POSIX_LOGIN);
  const sysRoot = e.SystemRoot || 'C:\\Windows';
  for (const d of await wslDistros()) {
    // --cd: dağıtım açık çalışma klasöründe başlar (Windows yolu kabul edilir)
    add(`wsl:${d}`, `${d} (WSL)`, path.join(sysRoot, 'System32', 'wsl.exe'), { argsFor: (cwd) => ['-d', d, '--cd', cwd] });
  }
  add('cygwin', 'Cygwin', firstExisting(['C:\\cygwin64\\bin\\bash.exe', 'C:\\cygwin\\bin\\bash.exe']), POSIX_LOGIN);
  const msys = firstExisting(['C:\\msys64\\usr\\bin\\bash.exe']);
  if (msys) add('msys2', 'MSYS2', msys, { args: POSIX_LOGIN.args, env: { ...POSIX_LOGIN.env, MSYSTEM: fs.existsSync('C:\\msys64\\ucrt64') ? 'UCRT64' : 'MINGW64' } });
  add('nu', 'Nushell', findOnPath('nu.exe'));
  return list;
}

let profCache = { at: 0, list: [] };
async function detectProfiles(force = false) {
  const age = Date.now() - profCache.at;
  if (profCache.at && (age < 2000 || (!force && age < 15000))) return profCache.list;
  profCache = { at: Date.now(), list: await buildProfiles() };
  return profCache.list;
}

const clampInt = (n, lo, hi, def) => (Number.isInteger(n) ? Math.min(hi, Math.max(lo, n)) : def);

function kill(s, sync = false) {
  // Çıkmış sürece kill çağrısı ConPTY'de "AttachConsole failed" hatasıyla süreci düşürür: yalnız canlıysa
  if (s.exited) return;
  s.exited = true;
  // Kabuğun torunları (dev sunucusu vb.) yetim kalmasın (P-10): Windows'ta süreç ağacı `taskkill /T /F` ile kapanır;
  // ağaç öldürüldükten sonra ayrıca p.kill() çağrılmaz (ölmüş sürece ConPTY kill'i "AttachConsole failed" verir), onExit temizler.
  const pid = s.p && s.p.pid;
  if (process.platform === 'win32' && pid) { if (sync) killTreeSync([pid]); else void killTree(pid); return; }
  try { s.p.kill(); } catch { /* bitmiş */ }
}

function register({ getWindow, isValidPath }) {
  api = { getWindow, isValidPath };

  ipcMain.handle('pty:start', async (_e, req) => {
    const r = req || {};
    if (typeof r.id !== 'string' || !ID_RE.test(r.id)) return { success: false, error: 'invalid-id' };
    if (typeof r.shell !== 'string' || r.shell.length > 120) return { success: false, error: 'invalid-shell' };
    if (sessions.has(r.id)) return { success: false, error: 'exists' };
    if (sessions.size >= MAX_SESSIONS) return { success: false, error: 'too-many' };
    if (typeof r.cwd !== 'string' || !api.isValidPath(r.cwd) || !fs.existsSync(r.cwd) || !fs.statSync(r.cwd).isDirectory()) return { success: false, error: 'no-folder' };
    const pty = loadLib();
    if (!pty) return { success: false, error: 'no-pty' };
    // Kabuk, kurulu profil listesinde olmalı (liste dışı kimlik/yol asla çalıştırılmaz)
    let prof = (await detectProfiles()).find((x) => x.id === r.shell);
    if (!prof) prof = (await detectProfiles(true)).find((x) => x.id === r.shell); // yeni kurulmuş olabilir: bir kez yenile
    if (!prof) return { success: false, error: r.shell === 'gitbash' ? 'no-gitbash' : 'invalid-shell' };
    const file = prof.file;
    const args = prof.argsFor ? prof.argsFor(r.cwd) : prof.args;
    const env = prof.env;
    let p;
    try {
      p = pty.spawn(file, args, {
        name: 'xterm-256color',
        cols: clampInt(r.cols, 10, 500, 100),
        rows: clampInt(r.rows, 2, 200, 24),
        cwd: r.cwd,
        env: { ...process.env, ...env, TERM_PROGRAM: 'NovaCode', COLORTERM: 'truecolor' }
      });
    } catch (err) {
      return { success: false, error: 'spawn-failed' };
    }
    const s = { p, exited: false, buf: '', timer: null };
    sessions.set(r.id, s);
    // Çıktı küçük aralıklarla toplanıp tek IPC mesajı olarak gider (her bayt için ayrı mesaj göndermemek için)
    const flush = () => { s.timer = null; if (s.buf) { const data = s.buf; s.buf = ''; send('pty:data', { id: r.id, data }); } };
    p.onData((d) => { s.buf += d; if (!s.timer) s.timer = setTimeout(flush, 8); });
    p.onExit(({ exitCode }) => {
      s.exited = true;
      if (s.timer) { clearTimeout(s.timer); flush(); }
      sessions.delete(r.id);
      send('pty:exit', { id: r.id, code: exitCode });
    });
    return { success: true };
  });

  ipcMain.handle('pty:write', (_e, id, data) => {
    const s = typeof id === 'string' ? sessions.get(id) : null;
    if (!s || s.exited || typeof data !== 'string' || data.length > MAX_WRITE) return { success: false };
    try { s.p.write(data); return { success: true }; } catch { return { success: false }; }
  });

  ipcMain.handle('pty:resize', (_e, id, cols, rows) => {
    const s = typeof id === 'string' ? sessions.get(id) : null;
    if (!s || s.exited || !Number.isInteger(cols) || !Number.isInteger(rows)) return { success: false };
    try { s.p.resize(clampInt(cols, 10, 500, 100), clampInt(rows, 2, 200, 24)); return { success: true }; } catch { return { success: false }; }
  });

  ipcMain.handle('pty:stop', (_e, id) => {
    const s = typeof id === 'string' ? sessions.get(id) : null;
    if (!s) return { success: true };
    kill(s);
    sessions.delete(id);
    return { success: true };
  });

  ipcMain.handle('pty:available', () => ({ available: !!loadLib(), gitBash: !!findGitBash() }));
  // Kurulu kabuk profilleri (yalnız kimlik + ad; dosya yolu renderer'a verilmez). `force`: önbelleği atla (menü açılırken)
  ipcMain.handle('pty:profiles', async (_e, force) => (await detectProfiles(force === true)).map(({ id, label }) => ({ id, label })));
}

// Kapanışta eşzamanlı: ağaçlar tek `taskkill` çağrısıyla kapatılır
function stopAll() {
  const live = [...sessions.values()].filter((s) => !s.exited);
  killTreeSync(live.map((s) => s.p && s.p.pid));
  if (process.platform !== 'win32') for (const s of live) { try { s.p.kill(); } catch { /* bitmiş */ } }
  for (const s of sessions.values()) s.exited = true;
  sessions.clear();
}

module.exports = { register, stopAll };
