'use strict';
// Uzak SSH çalışma alanı: Electron'dan bağımsız saf yardımcılar (düz Node ile test edilir: scripts/tests/ssh.test.cjs).
//  • Sanal yol: `ssh://<anaId>/<mutlak/posix/yol>`; renderer yalnız bu biçimi görür, ağ/kimlik bilgisi ana süreçte kalır.
//  • Profil doğrulama (gizli değer YOK: parola/parola cümlesi hiçbir yere yazılmaz, her bağlantıda sorulur).
//  • Sunucu parmak izi (SHA256, OpenSSH biçimi) ve known_hosts benzeri yerel depo.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PREFIX = 'ssh://';
const ID_RE = /^[a-z0-9-]{1,40}$/;
const HOST_RE = /^[A-Za-z0-9._\-:[\]]{1,253}$/; // ana bilgisayar adı / IPv4 / IPv6; boşluk, eğik çizgi, '@' yok
const USER_RE = /^[A-Za-z0-9._][A-Za-z0-9._\-]{0,63}$/;
const AUTH = new Set(['agent', 'key', 'password']);
const MAX_PATH = 4096;
const MAX_HOSTS = 50;

// Mutlak posix yol: NUL/denetim karakteri yok, '..' bileşeni normalize sonrası kalmaz. Geçersizse null.
function cleanPosix(p) {
  if (typeof p !== 'string' || p.length === 0 || p.length >= MAX_PATH) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(p) || !p.startsWith('/')) return null;
  if (p.split('/').includes('..')) return null; // ham girdide '..' bileşeni yok (normalize ile sessizce çözülmesine izin verilmez)
  const n = path.posix.normalize(p);
  return n.length > 1 ? n.replace(/\/+$/, '') : n;
}

// 'ssh://id/yol' -> { hostId, path } | null
function parseRemote(p) {
  if (typeof p !== 'string' || !p.startsWith(PREFIX) || p.length >= MAX_PATH + 64) return null;
  const rest = p.slice(PREFIX.length);
  const slash = rest.indexOf('/');
  if (slash < 1) return null;
  const hostId = rest.slice(0, slash);
  if (!ID_RE.test(hostId)) return null;
  const clean = cleanPosix(rest.slice(slash));
  return clean ? { hostId, path: clean } : null;
}

const isRemote = (p) => typeof p === 'string' && p.startsWith(PREFIX);
const makeRemote = (hostId, p) => `${PREFIX}${hostId}${p === '/' ? '/' : p}`;

// Sözcüksel kapsama: p, root'un içinde mi? (allowRoot=false: kökün kendisi hariç)
function insideRoot(root, p, allowRoot = true) {
  const r = cleanPosix(root);
  const t = cleanPosix(p);
  if (!r || !t) return false;
  if (t === r) return !!allowRoot;
  return t.startsWith(r === '/' ? '/' : r + '/');
}

// POSIX tek tırnak (kabuk komutuna yol gömmek için)
const shellQuote = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;

// Ham profil -> temiz profil | null. Bilinmeyen alanlar atılır.
function cleanProfile(raw, existingId) {
  const r = raw && typeof raw === 'object' ? raw : null;
  if (!r) return null;
  const id = existingId || (typeof r.id === 'string' && ID_RE.test(r.id) ? r.id : null);
  const name = typeof r.name === 'string' ? r.name.trim().slice(0, 60) : '';
  const host = typeof r.host === 'string' ? r.host.trim() : '';
  const user = typeof r.user === 'string' ? r.user.trim() : '';
  const port = r.port === undefined || r.port === '' ? 22 : Number(r.port);
  const auth = typeof r.auth === 'string' ? r.auth : 'agent';
  if (!id || !name || !HOST_RE.test(host) || host.startsWith('-') || !USER_RE.test(user)) return null;
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !AUTH.has(auth)) return null;
  let keyPath = '';
  if (auth === 'key') {
    keyPath = typeof r.keyPath === 'string' ? r.keyPath : '';
    if (!keyPath || keyPath.length >= MAX_PATH || keyPath.includes('\0')) return null;
  }
  let root = '';
  if (r.root !== undefined && r.root !== '') {
    root = cleanPosix(String(r.root)) || '';
    if (!root) return null;
  }
  return { id, name, host, port, user, auth, keyPath, root };
}

const newId = () => 'h' + crypto.randomBytes(5).toString('hex'); // 'h' + 10 hex = 11 karakter, ID_RE uyumlu

// OpenSSH biçimi: SHA256:<base64, dolgusuz>
function fingerprint(keyBuf) {
  return 'SHA256:' + crypto.createHash('sha256').update(keyBuf).digest('base64').replace(/=+$/, '');
}

// Yerel known_hosts deposu: { "host:port": "SHA256:..." } (yalnız parmak izi; kişisel veri yok, yurt dışına gitmez)
function createKnownHosts(file) {
  let map = null;
  const load = () => {
    if (map) return map;
    map = {};
    try {
      const j = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (j && typeof j === 'object') for (const [k, v] of Object.entries(j)) if (typeof v === 'string' && /^SHA256:[A-Za-z0-9+/]{20,64}$/.test(v)) map[k] = v;
    } catch { /* yok/bozuk: boş */ }
    return map;
  };
  const save = () => { try { fs.writeFileSync(file, JSON.stringify(map), { mode: 0o600 }); } catch { /* yazılamadı: oturum içinde geçerli kalır */ } };
  const keyOf = (host, port) => `${String(host).toLowerCase()}:${port}`;
  return {
    get: (host, port) => load()[keyOf(host, port)] || null,
    set: (host, port, fp) => { load()[keyOf(host, port)] = fp; save(); },
    remove: (host, port) => { delete load()[keyOf(host, port)]; save(); },
    list: () => ({ ...load() })
  };
}

// Profil listesi deposu (parola/parola cümlesi yok)
function createHostStore(file) {
  let list = null;
  const load = () => {
    if (list) return list;
    list = [];
    try {
      const j = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Array.isArray(j)) for (const x of j) { const c = cleanProfile(x, x && x.id); if (c && list.length < MAX_HOSTS) list.push(c); }
    } catch { /* yok/bozuk */ }
    return list;
  };
  const save = () => { try { fs.writeFileSync(file, JSON.stringify(list), { mode: 0o600 }); } catch { /* yazılamadı */ } };
  return {
    list: () => load().map((h) => ({ ...h })),
    get: (id) => load().find((h) => h.id === id) || null,
    upsert: (p) => {
      const l = load();
      const i = l.findIndex((h) => h.id === p.id);
      if (i >= 0) l[i] = p; else if (l.length < MAX_HOSTS) l.push(p); else return false;
      save();
      return true;
    },
    remove: (id) => { const l = load(); const i = l.findIndex((h) => h.id === id); if (i >= 0) { l.splice(i, 1); save(); } }
  };
}

module.exports = { PREFIX, ID_RE, isRemote, parseRemote, makeRemote, cleanPosix, insideRoot, shellQuote, cleanProfile, newId, fingerprint, createKnownHosts, createHostStore };
