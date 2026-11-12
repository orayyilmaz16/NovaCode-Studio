// Eklenti mağazası (ana süreç): Open VSX (open-vsx.org) arama/indirme, .vsix ayrıştırma, yükleme/güncelleme/kaldırma.
// Kapsam (dürüst sınır): VS Code eklenti sunucusu YOK; kod çalıştıran eklentiler çalışmaz ve yüklenmez.
// Desteklenen katkı: renk temaları (contributes.themes). Kod parçaları (snippet) ve kod çalıştıran eklentiler desteklenmez.
// Güvenlik:
// - Yalnız https://open-vsx.org (API) ve Eclipse Foundation CDN'i (indirme yönlendirmesi) kullanılır; konak yönlendirme sonrası da denetlenir; kullanıcı verisi gönderilmez.
// - .vsix diske AÇILMAZ: yalnız gereken girdiler bellekte okunur (zip-slip yok); boyut/girdi sınırları vardır.
// - Kayıt dosyaları yalnız userData/extensions altına, doğrulanmış kimlikle yazılır.
const { app, ipcMain, net } = require('electron');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

const API = 'https://open-vsx.org/api';
const HOST = 'open-vsx.org';
// İndirmeler Eclipse Foundation CDN'ine yönlenir; yalnız bu iki konağa izin verilir.
const DOWNLOAD_HOSTS = new Set(['open-vsx.org', 'openvsx.eclipsecontent.org']);
const MAX_VSIX = 30 * 1024 * 1024;
const MAX_ENTRY = 5 * 1024 * 1024;
const ID_PART = /^[A-Za-z0-9_.-]{1,80}$/;

const dir = () => path.join(app.getPath('userData'), 'extensions');
const fileFor = (id) => path.join(dir(), id + '.json');
const validId = (ns, name) => ID_PART.test(ns) && ID_PART.test(name) && !ns.includes('..') && !name.includes('..');

// Ağ: Chromium ağ yığını (net.request) kullanılır → sistem proxy ayarlarına, kurumsal sertifikalara ve VPN'e uyar.
// Node'un düz fetch'i sistem proxy'sini görmez (bazı ağlarda "internet hatası"nın nedeni buydu).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function classify(e) {
  const m = String((e && e.message) || e);
  if (/timeout|aborted|TimeoutError/i.test(m)) return 'timeout';
  if (/^http-(\d+)/.test(m)) return 'http-' + m.match(/^http-(\d+)/)[1];
  if (/ERR_INTERNET_DISCONNECTED|ENOTFOUND|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|ERR_PROXY|ECONN|ENETUNREACH|ERR_NETWORK|fetch failed|net::/i.test(m)) return 'offline';
  return 'failed';
}

// GET: net.request ile; her yönlendirme TEK TEK denetlenir (yalnız https + izinli konak). (net.fetch yönlendirme sonrası adresi bildirmez.)
function httpGet(url, { hosts, timeout = 25000, max = 5 * 1024 * 1024, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const check = (u) => {
      const x = new URL(u);
      if (x.protocol !== 'https:' || x.username || x.password || !hosts.has(x.hostname)) throw new Error('izinsiz-adres');
    };
    try { check(url); } catch (e) { return reject(e); }
    const req = net.request({ url, redirect: 'manual', method: 'GET' });
    for (const [k, v] of Object.entries(headers)) req.setHeader(k, v);
    let done = false;
    const finish = (fn, val) => { if (done) return; done = true; clearTimeout(timer); fn(val); };
    const timer = setTimeout(() => { try { req.abort(); } catch { /* kapalı */ } finish(reject, new Error('timeout')); }, timeout);
    let hops = 0;
    req.on('redirect', (_status, _method, redirectUrl) => {
      try {
        if (++hops > 5) throw new Error('cok-yonlendirme');
        check(redirectUrl);
        req.followRedirect();
      } catch (e) { try { req.abort(); } catch { /* kapalı */ } finish(reject, e); }
    });
    req.on('response', (res) => {
      const chunks = [];
      let size = 0;
      res.on('data', (c) => {
        size += c.length;
        if (size > max) { try { req.abort(); } catch { /* kapalı */ } finish(reject, new Error('cok-buyuk')); return; }
        chunks.push(c);
      });
      res.on('end', () => finish(resolve, { status: res.statusCode, body: Buffer.concat(chunks) }));
      res.on('error', (e) => finish(reject, e));
    });
    req.on('error', (e) => finish(reject, e));
    req.end();
  });
}

// Ağ hatasında bir kez daha dene (HTTP hataları yeniden denenmez)
async function withRetry(fn, tries = 2) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      if (!/timeout|net::|ERR_|ECONN|ENOTFOUND/i.test(String(e && e.message))) break;
      if (i < tries - 1) await sleep(700);
    }
  }
  throw last;
}

async function getJson(url) {
  const r = await withRetry(() => httpGet(url, { hosts: new Set([HOST]), headers: { accept: 'application/json' }, max: 4 * 1024 * 1024 }));
  if (r.status < 200 || r.status >= 300) throw new Error('http-' + r.status);
  return JSON.parse(r.body.toString('utf8'));
}

async function getText(url, max = 200 * 1024) {
  const r = await withRetry(() => httpGet(url, { hosts: DOWNLOAD_HOSTS, max: 2 * 1024 * 1024 }), 1);
  if (r.status < 200 || r.status >= 300) throw new Error('http-' + r.status);
  return r.body.toString('utf8').slice(0, max);
}

async function getBuffer(url) {
  if (new URL(url).hostname !== HOST) throw new Error('izinsiz-adres');
  const r = await withRetry(() => httpGet(url, { hosts: DOWNLOAD_HOSTS, timeout: 90000, max: MAX_VSIX }));
  if (r.status < 200 || r.status >= 300) throw new Error('http-' + r.status);
  return r.body;
}

// ---------- Asgari ZIP okuyucu (yalnız bellekte; zip64 desteklenmez) ----------
function zipEntries(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('gecersiz-zip');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const map = new Map();
  for (let n = 0; n < count && n < 5000; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('gecersiz-zip');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28);
    const elen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const off = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    map.set(name, { method, csize, usize, off });
    p += 46 + nlen + elen + clen;
  }
  return map;
}

function zipRead(buf, entries, name) {
  const e = entries.get(name);
  if (!e) return null;
  if (e.usize > MAX_ENTRY) throw new Error('girdi-cok-buyuk');
  if (buf.readUInt32LE(e.off) !== 0x04034b50) throw new Error('gecersiz-zip');
  const start = e.off + 30 + buf.readUInt16LE(e.off + 26) + buf.readUInt16LE(e.off + 28);
  const raw = buf.subarray(start, start + e.csize);
  const out = e.method === 0 ? raw : e.method === 8 ? zlib.inflateRawSync(raw, { maxOutputLength: MAX_ENTRY }) : null;
  if (!out) throw new Error('desteklenmeyen-sikistirma');
  return out.toString('utf8').replace(/^﻿/, '');
}

// JSONC (yorum + sondaki virgül) → nesne. Dizgi içindekilere dokunmaz.
function parseJsonc(text) {
  let out = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < n && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j + 1;
    } else if (c === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') i++;
    } else if (c === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2);
      i = i < 0 ? n : i + 2;
    } else { out += c; i++; }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function loadTheme(buf, entries, base, rel, depth = 0) {
  const file = path.posix.normalize(path.posix.join(base, rel));
  if (file.startsWith('..')) return null;
  const txt = zipRead(buf, entries, file);
  if (!txt) return null;
  const t = parseJsonc(txt);
  let colors = {};
  let tokenColors = [];
  if (typeof t.include === 'string' && depth < 2) {
    const inc = loadTheme(buf, entries, path.posix.dirname(file), t.include, depth + 1);
    if (inc) { colors = { ...inc.colors }; tokenColors = [...inc.tokenColors]; }
  }
  for (const [k, v] of Object.entries(t.colors || {})) if (typeof v === 'string' && HEX.test(v) && /^[\w.-]{1,80}$/.test(k)) colors[k] = v;
  const tc = Array.isArray(t.tokenColors) ? t.tokenColors : [];
  for (const r of tc.slice(0, 600)) {
    const s = r && r.settings;
    if (!s) continue;
    tokenColors.push({
      scope: Array.isArray(r.scope) ? r.scope.map(String).slice(0, 20) : typeof r.scope === 'string' ? r.scope.split(',').map((x) => x.trim()) : [],
      foreground: typeof s.foreground === 'string' && HEX.test(s.foreground) ? s.foreground : undefined,
      fontStyle: typeof s.fontStyle === 'string' ? s.fontStyle.slice(0, 40) : undefined
    });
  }
  return { colors, tokenColors };
}

function parseVsix(buf) {
  const entries = zipEntries(buf);
  const manifestTxt = zipRead(buf, entries, 'extension/package.json');
  if (!manifestTxt) throw new Error('manifest-yok');
  const pkg = JSON.parse(manifestTxt);
  const c = pkg.contributes || {};
  const themes = [];
  for (const th of (Array.isArray(c.themes) ? c.themes : []).slice(0, 12)) {
    if (!th || typeof th.path !== 'string') continue;
    try {
      const data = loadTheme(buf, entries, 'extension', th.path);
      if (data) themes.push({ label: String(th.label || th.id || 'Theme').slice(0, 80), uiTheme: ['vs', 'vs-dark', 'hc-black', 'hc-light'].includes(th.uiTheme) ? th.uiTheme : 'vs-dark', ...data });
    } catch { /* bozuk tema atlanır */ }
  }
  const runsCode = !!(pkg.main || pkg.browser);
  return { themes, runsCode, version: String(pkg.version || '0.0.0').slice(0, 40) };
}

const semverGt = (a, b) => {
  const pa = String(a).split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  const pb = String(b).split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < 4; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0); }
  return false;
};

function mapItem(e) {
  return {
    id: `${e.namespace}.${e.name}`,
    namespace: String(e.namespace), name: String(e.name), version: String(e.version || ''),
    displayName: String(e.displayName || e.name).slice(0, 100),
    description: String(e.description || '').slice(0, 300),
    icon: e.files && typeof e.files.icon === 'string' && e.files.icon.startsWith('https://open-vsx.org/') ? e.files.icon : '',
    downloads: Number(e.downloadCount) || 0,
    rating: typeof e.averageRating === 'number' ? e.averageRating : null
  };
}

function listInstalled() {
  try {
    return fs.readdirSync(dir()).filter((f) => f.endsWith('.json')).map((f) => {
      try { return JSON.parse(fs.readFileSync(path.join(dir(), f), 'utf8')); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

async function install(namespace, name) {
  if (!validId(namespace, name)) return { success: false, error: 'invalid-id' };
  const info = await getJson(`${API}/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`);
  const url = info && info.files && info.files.download;
  if (typeof url !== 'string') return { success: false, error: 'no-download' };
  const parsed = parseVsix(await getBuffer(url));
  if (parsed.themes.length === 0) return { success: false, error: parsed.runsCode ? 'runs-code' : 'nothing-supported' };
  const id = `${namespace}.${name}`;
  fs.mkdirSync(dir(), { recursive: true });
  const record = { id, namespace, name, version: parsed.version, displayName: String(info.displayName || name).slice(0, 100), description: String(info.description || '').slice(0, 300), icon: info.files.icon && String(info.files.icon).startsWith('https://open-vsx.org/') ? info.files.icon : '', installedAt: Date.now(), themes: parsed.themes, partial: parsed.runsCode };
  fs.writeFileSync(fileFor(id), JSON.stringify(record), { mode: 0o600 });
  return { success: true, id, partial: parsed.runsCode };
}

function register() {
  ipcMain.handle('ext:search', async (_e, opts) => {
    try {
      const q = String((opts && opts.query) || '').slice(0, 100);
      const cat = 'Themes'; // yalnız tema eklentileri desteklenir
      const offset = Math.max(0, Math.min(1000, Number(opts && opts.offset) || 0));
      const url = `${API}/-/search?query=${encodeURIComponent(q)}&size=20&offset=${offset}&sortBy=downloadCount&sortOrder=desc${cat ? '&category=' + cat : ''}`;
      const j = await getJson(url);
      return { success: true, total: Number(j.totalSize) || 0, items: (Array.isArray(j.extensions) ? j.extensions : []).slice(0, 20).map(mapItem) };
    } catch (e) { console.warn('Open VSX arama hatası:', e && e.message); return { success: false, error: classify(e), items: [], total: 0 }; }
  });

  // VS Code'daki ayrıntı sayfası: açıklama (README), değişiklikler, yayıncı, lisans, kategori, depo
  ipcMain.handle('ext:details', async (_e, namespace, name) => {
    try {
      if (!validId(String(namespace), String(name))) return { success: false, error: 'invalid-id' };
      const j = await getJson(`${API}/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`);
      const f = j.files || {};
      const safeUrl = (u) => (typeof u === 'string' && u.startsWith('https://') ? u : '');
      const [readme, changelog] = await Promise.all([
        f.readme ? getText(f.readme).catch(() => '') : '',
        f.changelog ? getText(f.changelog).catch(() => '') : ''
      ]);
      return {
        success: true,
        details: {
          id: `${namespace}.${name}`,
          version: String(j.version || ''),
          displayName: String(j.displayName || name),
          description: String(j.description || '').slice(0, 500),
          publisher: String(j.namespace || namespace),
          license: String(j.license || ''),
          repository: safeUrl(j.repository),
          homepage: safeUrl(j.homepage),
          categories: (Array.isArray(j.categories) ? j.categories : []).map(String).slice(0, 8),
          tags: (Array.isArray(j.tags) ? j.tags : []).map(String).slice(0, 12),
          downloads: Number(j.downloadCount) || 0,
          rating: typeof j.averageRating === 'number' ? j.averageRating : null,
          reviews: Number(j.reviewCount) || 0,
          updated: String(j.timestamp || ''),
          icon: f.icon && String(f.icon).startsWith('https://open-vsx.org/') ? f.icon : '',
          readme, changelog
        }
      };
    } catch (e) { return { success: false, error: classify(e) }; }
  });

  ipcMain.handle('ext:list', () => listInstalled());

  ipcMain.handle('ext:install', async (_e, namespace, name) => {
    try { return await install(String(namespace), String(name)); } catch (err) { return { success: false, error: err && err.message === 'cok-buyuk' ? 'too-big' : classify(err) }; }
  });

  ipcMain.handle('ext:uninstall', (_e, id) => {
    if (typeof id !== 'string' || !ID_PART.test(id)) return { success: false };
    try { fs.rmSync(fileFor(id), { force: true }); return { success: true }; } catch { return { success: false }; }
  });

  ipcMain.handle('ext:checkUpdates', async () => {
    const updates = [];
    for (const ext of listInstalled().slice(0, 100)) {
      try {
        const j = await getJson(`${API}/${encodeURIComponent(ext.namespace)}/${encodeURIComponent(ext.name)}`);
        if (j && typeof j.version === 'string' && semverGt(j.version, ext.version)) updates.push({ id: ext.id, latest: j.version });
      } catch { /* ağ yok: atla */ }
    }
    return updates;
  });
}

module.exports = { register, parseVsix, parseJsonc, semverGt };
