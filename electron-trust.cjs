// Çalışma klasörü güveni (workspace trust) ve kalıcı rıza/izin deposu (ana süreç).
// Veri: güvenilen klasör yolları, rıza verilen sağlayıcı adresleri, anahtar gönderimine izin verilen özel adresler (userData/ai-trust.json).
// Amaç: güvenlik kararlarının hatırlanması. Hukuki sebep: kullanıcının açık onayı (yönetici adına onay verilemez; yalnız geri alınabilir).
// Saklama: kullanıcı kaldırana ya da dosyayı silene dek, yalnız bu bilgisayarda. Yurt dışı aktarım yok.
// Kısıtlı mod (güvenilmeyen klasör): LSP ve hata ayıklayıcı başlamaz, git yalnız okuma komutlarını çalıştırır (hook/filtre/harici fark kapalı).
const fs = require('fs');
const os = require('os');
const path = require('path');

const FIELDS = ['folders', 'consent', 'bases'];
const MAX_ITEMS = 200;

let dirOverride = null;
let cache = null;
let onChange = null;

function storeDir() {
  if (dirOverride) return dirOverride;
  return require('electron').app.getPath('userData');
}
const storeFile = () => path.join(storeDir(), 'ai-trust.json');

const emptyStore = () => ({ folders: [], consent: [], bases: [], names: {} });

function normalize(j) {
  const arr = (x) => (Array.isArray(x) ? x.filter((v) => typeof v === 'string' && v.length < 4096).slice(0, MAX_ITEMS) : []);
  const names = {};
  if (j && j.names && typeof j.names === 'object') {
    for (const [k, v] of Object.entries(j.names).slice(0, MAX_ITEMS)) if (typeof v === 'string' && v.length < 4096) names[k] = v;
  }
  return { folders: arr(j && j.folders), consent: arr(j && j.consent), bases: arr(j && j.bases), names };
}

function loadStore() {
  if (cache) return cache;
  try { cache = normalize(JSON.parse(fs.readFileSync(storeFile(), 'utf8'))); } catch { cache = emptyStore(); }
  return cache;
}
function saveStore(st) {
  cache = normalize(st);
  try { fs.writeFileSync(storeFile(), JSON.stringify(cache), { mode: 0o600 }); } catch { /* yazılamadı: bu oturumda geçerli kalır */ }
  if (onChange) { try { onChange(); } catch { /* dinleyici hatası güveni etkilemez */ } }
}

// Windows'ta büyük/küçük harf duyarsız karşılaştırma; sembolik bağlantılar çözülür.
const folderKey = (root) => {
  let p = String(root || '');
  try { p = fs.realpathSync(p); } catch { /* yol yok */ }
  return process.platform === 'win32' ? p.toLowerCase() : p;
};
const isTrusted = (root) => !!root && loadStore().folders.includes(folderKey(root));

function trustFolder(root) {
  if (!root) return false;
  const key = folderKey(root);
  const st = loadStore();
  if (!st.folders.includes(key)) st.folders.push(key);
  st.names[key] = String(root);
  saveStore(st);
  return true;
}

function addToStore(field, value) {
  if (!FIELDS.includes(field) || typeof value !== 'string') return;
  const st = loadStore();
  if (!st[field].includes(value)) { st[field].push(value); saveStore(st); }
}

// Yalnız kaldırma vardır (ekleme arayüzden yapılamaz): rıza yalnız kullanıcının onay penceresiyle verilir.
function removeFromStore(field, value) {
  if (!FIELDS.includes(field) || typeof value !== 'string') return false;
  const st = loadStore();
  const i = st[field].indexOf(value);
  if (i < 0) return false;
  st[field].splice(i, 1);
  if (field === 'folders') delete st.names[value];
  saveStore(st);
  return true;
}

function listStore() {
  const st = loadStore();
  return {
    folders: st.folders.map((key) => ({ key, label: st.names[key] || key })),
    consent: [...st.consent],
    bases: [...st.bases]
  };
}

// ---------- Git komut sınıflandırması ----------
const READ_CMDS = new Set(['status', 'log', 'diff', 'show', 'rev-parse', 'rev-list', 'ls-files', 'ls-tree', 'for-each-ref', 'cat-file', 'describe', 'blame', 'shortlog', 'merge-base', 'check-ignore', 'name-rev']);
const BRANCH_READ = /^(--show-current|-a|-r|-v|-vv|--all|--remotes|--list|-l|--verbose|--merged|--no-merged|--format=[^\0]*|--sort=[^\0]*)$/;

// 'read': hook/filtre tetiklemeyen okuma komutu · 'write': değiştiren ya da hook/filtre/ağ tetikleyebilen komut
function classifyGit(args) {
  if (!Array.isArray(args) || args.length === 0 || args.some((a) => typeof a !== 'string')) return 'write';
  const cmd = args[0];
  const rest = args.slice(1);
  if (READ_CMDS.has(cmd)) return 'read';
  if (cmd === 'branch') return rest.every((a) => BRANCH_READ.test(a)) ? 'read' : 'write';
  if (cmd === 'remote') return rest.length === 0 || (rest.length === 1 && rest[0] === '-v') || (rest.length === 2 && rest[0] === 'get-url') ? 'read' : 'write';
  if (cmd === 'stash') return rest[0] === 'list' ? 'read' : 'write';
  if (cmd === 'tag') return rest.length === 0 || rest[0] === '-l' || rest[0] === '--list' ? 'read' : 'write';
  return 'write';
}

// Boş kanca dizini: kısıtlı modda core.hooksPath buraya yönlenir (hiç kanca çalışmaz).
function emptyHooksDir() {
  const dir = path.join(storeDir(), 'empty-hooks');
  try { fs.mkdirSync(dir, { recursive: true }); } catch { /* oluşturulamadı: var olmayan dizin de kanca çalıştırmaz */ }
  return dir;
}

// .git/config içindeki filter.<ad> bölümleri (clean/smudge/process dış komut çalıştırır): kısıtlı modda boşaltılır.
function filterOverrides(root) {
  const out = [];
  try {
    const cfg = path.join(root, '.git', 'config');
    if (!fs.statSync(cfg).isFile()) return out;
    const text = fs.readFileSync(cfg, 'utf8').slice(0, 1024 * 1024);
    const seen = new Set();
    const re = /^\s*\[\s*filter\s+"([^"\\\r\n]{1,100})"\s*\]/gim;
    let m;
    while ((m = re.exec(text)) && seen.size < 50) {
      const name = m[1];
      if (seen.has(name) || /[=\0]/.test(name)) continue;
      seen.add(name);
      for (const k of ['clean', 'smudge', 'process']) out.push('-c', `filter.${name}.${k}=`);
      out.push('-c', `filter.${name}.required=false`);
    }
  } catch { /* .git yok ya da okunamadı */ }
  return out;
}

// Karar: { allow, args, error }. Güvenilir klasörde argümanlar olduğu gibi gider.
function gateGit(args, root, trusted) {
  if (trusted) return { allow: true, args };
  if (classifyGit(args) !== 'read') return { allow: false, error: 'trust-required' };
  let a = args;
  if (['diff', 'log', 'show'].includes(args[0])) a = [args[0], '--no-ext-diff', '--no-textconv', ...args.slice(1)];
  const pre = ['-c', 'core.hooksPath=' + emptyHooksDir(), '-c', 'credential.helper=', '-c', 'core.fsmonitor=false', ...filterOverrides(root)];
  return { allow: true, args: [...pre, ...a] };
}

// ---------- IPC ----------
function register({ getWindow, getRoot }) {
  const { ipcMain } = require('electron');
  onChange = () => {
    const w = getWindow && getWindow();
    if (w && !w.isDestroyed()) w.webContents.send('trust:changed', { root: getRoot() || '', trusted: isTrusted(getRoot()) });
  };
  ipcMain.handle('trust:status', () => {
    const root = getRoot();
    return { root: root || '', trusted: root ? isTrusted(root) : true };
  });
  // Yalnız açık çalışma klasörüne güven verilebilir; renderer rastgele yol gönderemez.
  ipcMain.handle('trust:grant', () => {
    const root = getRoot();
    if (!root) return { success: false, trusted: false };
    return { success: trustFolder(root), trusted: true };
  });
  ipcMain.handle('trust:list', () => listStore());
  ipcMain.handle('trust:revoke', (_e, kind, value) => ({ success: removeFromStore(String(kind), String(value)) }));
}

module.exports = {
  register, loadStore, saveStore, folderKey, isTrusted, trustFolder, addToStore, removeFromStore, listStore,
  classifyGit, gateGit,
  _test: { setStoreDir: (d) => { dirOverride = d; cache = null; }, resetCache: () => { cache = null; }, filterOverrides, emptyHooksDir }
};
