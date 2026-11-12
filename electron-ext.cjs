// Eklenti mağazası (ana süreç): Open VSX (open-vsx.org) arama/indirme, .vsix ayrıştırma, yükleme/güncelleme/kaldırma.
// Kapsam (dürüst sınır): VS Code eklenti sunucusu YOK; kod çalıştıran eklentiler çalışmaz ve yüklenmez.
// Desteklenen katkılar: renk temaları (contributes.themes) ve kod parçaları (contributes.snippets).
// Güvenlik:
// - Yalnız https://open-vsx.org (API) ve Eclipse Foundation CDN'i (indirme yönlendirmesi) kullanılır; konak yönlendirme sonrası da denetlenir; kullanıcı verisi gönderilmez.
// - .vsix diske AÇILMAZ: yalnız gereken girdiler bellekte okunur (zip-slip yok); boyut/girdi sınırları vardır.
// - Kayıt dosyaları yalnız userData/extensions altına, doğrulanmış kimlikle yazılır.
const { app, ipcMain } = require('electron');
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

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (new URL(res.url).hostname !== HOST) throw new Error('beklenmeyen-konak');
  if (!res.ok) throw new Error('http-' + res.status);
  return res.json();
}

async function getBuffer(url) {
  const u = new URL(url);
  if (u.protocol !== 'https:' || u.hostname !== HOST) throw new Error('izinsiz-adres');
  const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  const fin = new URL(res.url);
  if (fin.protocol !== 'https:' || !DOWNLOAD_HOSTS.has(fin.hostname) || !res.ok) throw new Error('indirilemedi');
  const len = Number(res.headers.get('content-length') || 0);
  if (len > MAX_VSIX) throw new Error('cok-buyuk');
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_VSIX) throw new Error('cok-buyuk');
  return buf;
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
  const snippets = [];
  for (const sn of (Array.isArray(c.snippets) ? c.snippets : []).slice(0, 40)) {
    if (!sn || typeof sn.path !== 'string' || typeof sn.language !== 'string') continue;
    try {
      const txt = zipRead(buf, entries, path.posix.normalize(path.posix.join('extension', sn.path)));
      if (!txt) continue;
      const obj = parseJsonc(txt);
      const items = [];
      for (const [name, v] of Object.entries(obj).slice(0, 400)) {
        if (!v || typeof v !== 'object' || v.prefix == null) continue;
        const body = Array.isArray(v.body) ? v.body.join('\n') : String(v.body ?? '');
        const prefixes = (Array.isArray(v.prefix) ? v.prefix : [v.prefix]).map(String).filter((p) => p && !/\s/.test(p)).slice(0, 4);
        for (const prefix of prefixes) items.push({ name: name.slice(0, 80), prefix: prefix.slice(0, 40), body: body.slice(0, 20000), description: String(v.description || '').slice(0, 120) });
      }
      if (items.length) snippets.push({ language: sn.language.replace(/[^\w*-]/g, '').slice(0, 30), items });
    } catch { /* bozuk dosya atlanır */ }
  }
  const runsCode = !!(pkg.main || pkg.browser);
  return { themes, snippets, runsCode, version: String(pkg.version || '0.0.0').slice(0, 40) };
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
  if (parsed.themes.length === 0 && parsed.snippets.length === 0) return { success: false, error: parsed.runsCode ? 'runs-code' : 'nothing-supported' };
  const id = `${namespace}.${name}`;
  fs.mkdirSync(dir(), { recursive: true });
  const record = { id, namespace, name, version: parsed.version, displayName: String(info.displayName || name).slice(0, 100), description: String(info.description || '').slice(0, 300), icon: info.files.icon && String(info.files.icon).startsWith('https://open-vsx.org/') ? info.files.icon : '', installedAt: Date.now(), themes: parsed.themes, snippets: parsed.snippets, partial: parsed.runsCode };
  fs.writeFileSync(fileFor(id), JSON.stringify(record), { mode: 0o600 });
  return { success: true, id, partial: parsed.runsCode };
}

function register() {
  ipcMain.handle('ext:search', async (_e, opts) => {
    try {
      const q = String((opts && opts.query) || '').slice(0, 100);
      const cat = ['Themes', 'Snippets'].includes(opts && opts.category) ? opts.category : '';
      const offset = Math.max(0, Math.min(1000, Number(opts && opts.offset) || 0));
      const url = `${API}/-/search?query=${encodeURIComponent(q)}&size=20&offset=${offset}&sortBy=downloadCount&sortOrder=desc${cat ? '&category=' + cat : ''}`;
      const j = await getJson(url);
      return { success: true, total: Number(j.totalSize) || 0, items: (Array.isArray(j.extensions) ? j.extensions : []).slice(0, 20).map(mapItem) };
    } catch { return { success: false, error: 'network', items: [], total: 0 }; }
  });

  ipcMain.handle('ext:list', () => listInstalled());

  ipcMain.handle('ext:install', async (_e, namespace, name) => {
    try { return await install(String(namespace), String(name)); } catch (err) { return { success: false, error: err && err.message === 'cok-buyuk' ? 'too-big' : 'failed' }; }
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
