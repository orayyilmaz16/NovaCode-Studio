'use strict';
// Ana süreç ortak yardımcıları (Electron'a bağımlı değildir, düz Node ile test edilir):
//  • Yol doğrulama: çalışma klasörü sınırı, gerçek yol (symlink/junction) çözümü, Windows'a özgü tuzaklar
//  • Alt süreç için env izin listesi (gizli değişkenler çocuğa geçmez)
//  • Süreç ağacı sonlandırma (Windows'ta `taskkill /T /F`)
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const MAX_PATH_LEN = 4096;

// Geçerli yol: dize, boş değil, makul uzunluk, NUL yok; Windows'ta sürücü harfi dışında ':' yok (NTFS alternatif veri akışı: dosya.txt:akış).
function isValidPath(p, platform = process.platform) {
  if (typeof p !== 'string' || p.length === 0 || p.length >= MAX_PATH_LEN || p.includes('\0')) return false;
  if (platform === 'win32' && p.replace(/^(\\\\[?.]\\)?[A-Za-z]:/, '').includes(':')) return false;
  return true;
}

// Gerçek (symlink/junction çözülmüş) yol. Hedef yoksa en yakın var olan üst dizin çözülür, kalan bölüm eklenir.
// followLast=false: son bileşen (ör. silinecek/yeniden adlandırılacak symlink'in kendisi) izlenmez.
// Boşta kalan (dangling) symlink'ler elle çözülür; döngü/çok derin zincirde null döner.
function realpathNearest(p, followLast = true, fsImpl = fs) {
  let head = path.resolve(p);
  const tail = [];
  if (!followLast) {
    const parent = path.dirname(head);
    if (parent !== head) { tail.unshift(path.basename(head)); head = parent; }
  }
  for (let hops = 0; hops < 64; hops++) {
    try {
      const real = fsImpl.realpathSync(head);
      return tail.length ? path.join(real, ...tail) : real;
    } catch {
      let link = null;
      try {
        if (fsImpl.lstatSync(head).isSymbolicLink()) link = fsImpl.readlinkSync(head);
      } catch { /* yok */ }
      if (link !== null) {
        head = path.resolve(path.dirname(head), link);
        continue;
      }
      const parent = path.dirname(head);
      if (parent === head) return null;
      tail.unshift(path.basename(head));
      head = parent;
    }
  }
  return null;
}

// Hedef kökün içinde mi? (rel '..' ile BAŞLAYAN adlar, ör. "..foo", geçerlidir; yalnız '..' bileşeni kaçıştır.)
function relInside(rootReal, targetReal, allowRoot) {
  const rel = path.relative(rootReal, targetReal);
  if (rel === '') return !!allowRoot;
  return !(rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel));
}

function createGuards(getRoot, fsImpl = fs) {
  const rootReal = () => {
    const r = getRoot();
    return r && isValidPath(r) ? realpathNearest(r, true, fsImpl) : null;
  };
  const check = (p, allowRoot, followLast) => {
    if (!isValidPath(p)) return false;
    const root = rootReal();
    if (!root) return false;
    const target = realpathNearest(p, followLast, fsImpl);
    return !!target && relInside(root, target, allowRoot);
  };
  return {
    isValidPath,
    // Kök dahil, çalışma klasörünün içinde (gerçek yol)
    withinWorkspace: (p) => check(p, true, true),
    // Kökün kendisi hariç; followLast=false ise son bileşen symlink olsa bile izlenmez (silme/yeniden adlandırma)
    insideWorkspace: (p, followLast = true) => check(p, false, followLast),
    // Yazma için güvenli gerçek hedef (ya da null)
    resolveReal: (p, followLast = true) => realpathNearest(p, followLast, fsImpl)
  };
}

// ---- Alt süreç env izin listesi ----
const ENV_ALLOW = new Set([
  'PATH', 'PATHEXT', 'SYSTEMROOT', 'SYSTEMDRIVE', 'WINDIR', 'COMSPEC', 'TEMP', 'TMP', 'TMPDIR',
  'HOME', 'HOMEDRIVE', 'HOMEPATH', 'USERPROFILE', 'USERNAME', 'USER', 'LOGNAME', 'USERDOMAIN',
  'APPDATA', 'LOCALAPPDATA', 'PROGRAMDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'PROGRAMW6432', 'COMMONPROGRAMFILES',
  'NUMBER_OF_PROCESSORS', 'PROCESSOR_ARCHITECTURE', 'OS', 'LANG', 'LANGUAGE', 'SHELL', 'TERM', 'TZ', 'DISPLAY',
  'GOPATH', 'GOROOT', 'GOCACHE', 'GOMODCACHE', 'GOPROXY', 'GOFLAGS', 'CARGO_HOME', 'RUSTUP_HOME',
  'DOTNET_ROOT', 'JAVA_HOME', 'NODE_PATH', 'VIRTUAL_ENV', 'PYTHONPATH', 'PYTHONHOME', 'PYTHONIOENCODING'
]);
const ENV_PREFIX = ['LC_', 'XDG_'];

// process.env'den yalnız zararsız değişkenleri alır (API anahtarı, token vb. çocuğa geçmez); `extra` eklenir.
function safeEnv(extra = {}, source = process.env) {
  const out = {};
  for (const [k, v] of Object.entries(source)) {
    if (typeof v !== 'string') continue;
    const u = k.toUpperCase();
    if (ENV_ALLOW.has(u) || ENV_PREFIX.some((p) => u.startsWith(p))) out[k] = v;
  }
  return { ...out, ...extra };
}

// ---- Süreç ağacı sonlandırma ----
const validPid = (pid) => Number.isInteger(pid) && pid > 0;

function killTree(pid) {
  if (!validPid(pid)) return Promise.resolve();
  if (process.platform === 'win32') {
    return new Promise((res) => {
      try {
        const k = spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        k.on('exit', () => res());
        k.on('error', () => res());
      } catch { res(); }
    });
  }
  try { process.kill(pid, 'SIGTERM'); } catch { /* bitmiş */ }
  return Promise.resolve();
}

// Kapanışta kullanılır: bloklar (en çok ~1,5 sn), birden çok süreç tek çağrıda.
function killTreeSync(pids) {
  const list = (pids || []).filter(validPid);
  if (!list.length) return;
  if (process.platform === 'win32') {
    try {
      spawnSync('taskkill', ['/T', '/F', ...list.flatMap((p) => ['/pid', String(p)])], { windowsHide: true, stdio: 'ignore', timeout: 1500 });
    } catch { /* taskkill yok/zaman aşımı */ }
    return;
  }
  for (const pid of list) { try { process.kill(pid, 'SIGKILL'); } catch { /* bitmiş */ } }
}

module.exports = { isValidPath, realpathNearest, relInside, createGuards, safeEnv, killTree, killTreeSync, MAX_PATH_LEN };
