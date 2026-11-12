'use strict';
// Gerçek terminal (PTY): Windows'ta ConPTY, diğerlerinde pty. vim/htop gibi tam ekran programlar, gerçek Ctrl+C, renk, yeniden boyutlandırma.
// Klasik (boru tabanlı) terminal `electron-term.cjs` içinde kalır; bu modül yanına eklenir.
//
// Güvenlik: yalnız izinli kabuklar (PowerShell/pwsh, CMD; diğer sistemlerde kullanıcının kabuğu); çalışma klasörü açık çalışma klasörü içinde olmalı;
// kimlik yalnız [a-z0-9-]{1,40}; yazma boyutu ve oturum sayısı sınırlı. Renderer rastgele program çalıştıramaz, yalnız kabuk oturumu açar.
// Yerel paket `@lydell/node-pty` tembel yüklenir: yoksa/yüklenemezse `pty:start` 'no-pty' döner ve klasik terminal çalışmaya devam eder.
const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

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

function shellCommand(shell) {
  if (process.platform !== 'win32') return { file: process.env.SHELL || '/bin/sh', args: [] };
  if (shell === 'cmd') return { file: 'cmd.exe', args: [] };
  return { file: findOnPath('pwsh.exe') || 'powershell.exe', args: ['-NoLogo'] };
}

const clampInt = (n, lo, hi, def) => (Number.isInteger(n) ? Math.min(hi, Math.max(lo, n)) : def);

function kill(s) {
  // Çıkmış sürece kill çağrısı ConPTY'de "AttachConsole failed" hatasıyla süreci düşürür: yalnız canlıysa
  if (s.exited) return;
  s.exited = true;
  try { s.p.kill(); } catch { /* bitmiş */ }
}

function register({ getWindow, isValidPath }) {
  api = { getWindow, isValidPath };

  ipcMain.handle('pty:start', async (_e, req) => {
    const r = req || {};
    if (typeof r.id !== 'string' || !ID_RE.test(r.id)) return { success: false, error: 'invalid-id' };
    if (r.shell !== 'powershell' && r.shell !== 'cmd') return { success: false, error: 'invalid-shell' };
    if (sessions.has(r.id)) return { success: false, error: 'exists' };
    if (sessions.size >= MAX_SESSIONS) return { success: false, error: 'too-many' };
    if (typeof r.cwd !== 'string' || !api.isValidPath(r.cwd) || !fs.existsSync(r.cwd) || !fs.statSync(r.cwd).isDirectory()) return { success: false, error: 'no-folder' };
    const pty = loadLib();
    if (!pty) return { success: false, error: 'no-pty' };
    const { file, args } = shellCommand(r.shell);
    let p;
    try {
      p = pty.spawn(file, args, {
        name: 'xterm-256color',
        cols: clampInt(r.cols, 10, 500, 100),
        rows: clampInt(r.rows, 2, 200, 24),
        cwd: r.cwd,
        env: { ...process.env, TERM_PROGRAM: 'NovaCode', COLORTERM: 'truecolor' }
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

  ipcMain.handle('pty:available', () => ({ available: !!loadLib() }));
}

function stopAll() {
  for (const [id, s] of sessions) { kill(s); sessions.delete(id); }
}

module.exports = { register, stopAll };
