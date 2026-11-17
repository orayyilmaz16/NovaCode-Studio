// Yerel geçmiş (F-07): her kayıttan önce dosyanın eski içeriği `userData/local-history/<çalışma-klasörü-özeti>/<dosya-özeti>/<zaman>.txt`
// altına anlık görüntü olarak yazılır. Yalnız bu bilgisayarda kalır (3. tarafa gitmez); dosya başına en çok N sürüm,
// çalışma klasörü başına toplam boyut sınırı vardır; büyük ve ikili dosyalar atlanır. Kullanıcı silince ya da ayardan kapatınca silinir.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_FILE_BYTES = 1024 * 1024;          // bundan büyük dosya anlık görüntülenmez
const DEFAULT_MAX_VERSIONS = 30;
const HARD_MAX_VERSIONS = 30;
const MAX_WORKSPACE_BYTES = 150 * 1024 * 1024; // çalışma klasörü başına toplam sınır
const META = 'meta.json';
const VERSION_RE = /^(\d{10,16})\.txt$/;

// ---- Saf yardımcılar (test edilir) ----
const digest = (s) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 16);
const pathKey = (p) => digest(path.resolve(String(p)).toLowerCase());
const versionName = (ts) => `${ts}.txt`;
const parseVersion = (name) => { const m = VERSION_RE.exec(name); return m ? Number(m[1]) : null; };
/** Metin gibi görünmüyorsa (NUL bayt) false. */
const looksText = (buf) => !buf.subarray(0, 8192).includes(0);
/** Sürüm adlarından (eskiden yeniye sıralı olmayabilir) sınırı aşan en eskileri döndürür. */
function pickPrune(names, maxCount) {
  const vers = names.filter((n) => parseVersion(n) !== null).sort((a, b) => parseVersion(a) - parseVersion(b));
  const extra = vers.length - Math.max(1, maxCount);
  return extra > 0 ? vers.slice(0, extra) : [];
}
/** { key, name, size, ts } girdilerinden toplam boyutu sınırın altına indirmek için silinecek en eski girdiler. */
function pickPruneTotal(entries, maxBytes) {
  let total = entries.reduce((n, e) => n + e.size, 0);
  const out = [];
  for (const e of [...entries].sort((a, b) => a.ts - b.ts)) {
    if (total <= maxBytes) break;
    out.push(e);
    total -= e.size;
  }
  return out;
}

function create({ userDataDir, getRoot, isInside, notify = () => {} }) {
  const base = path.join(userDataDir, 'local-history');
  const cfg = { enabled: true, maxVersions: DEFAULT_MAX_VERSIONS };
  let counter = 0;

  const rootKey = () => { const r = getRoot(); return r ? digest(path.resolve(r).toLowerCase()) : '_external'; };
  const wsDir = () => path.join(base, rootKey());
  const fileDir = (filePath) => path.join(wsDir(), pathKey(filePath));

  async function listNames(dir) {
    try { return (await fs.promises.readdir(dir)).filter((n) => parseVersion(n) !== null); } catch { return []; }
  }

  async function enforceTotal() {
    const dir = wsDir();
    let subs;
    try { subs = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return; }
    const entries = [];
    for (const s of subs) {
      if (!s.isDirectory()) continue;
      for (const n of await listNames(path.join(dir, s.name))) {
        try {
          const st = await fs.promises.stat(path.join(dir, s.name, n));
          entries.push({ key: s.name, name: n, size: st.size, ts: parseVersion(n) });
        } catch { /* yarışta silinmiş */ }
      }
    }
    for (const e of pickPruneTotal(entries, MAX_WORKSPACE_BYTES)) {
      await fs.promises.rm(path.join(dir, e.key, e.name), { force: true }).catch(() => {});
    }
  }

  /** Dosyanın şu anki (eski) içeriğini kaydeder. newContent verilirse ve aynıysa atlanır. Hata fırlatmaz. */
  async function snapshot(filePath, newContent) {
    if (!cfg.enabled) return false;
    try {
      const st = await fs.promises.stat(filePath);
      if (!st.isFile() || st.size === 0 || st.size > MAX_FILE_BYTES) return false;
      const buf = await fs.promises.readFile(filePath);
      if (!looksText(buf)) return false;
      const text = buf.toString('utf8');
      if (typeof newContent === 'string' && (newContent === text || '﻿' + newContent === text)) return false;
      const dir = fileDir(filePath);
      const names = await listNames(dir);
      const latest = names.sort((a, b) => parseVersion(b) - parseVersion(a))[0];
      if (latest) {
        try { if ((await fs.promises.readFile(path.join(dir, latest), 'utf8')) === text) return false; } catch { /* okunamazsa yeni sürüm yazılır */ }
      }
      await fs.promises.mkdir(dir, { recursive: true });
      let ts = Date.now();
      const last = latest ? parseVersion(latest) : 0;
      if (ts <= last) ts = last + 1;
      await fs.promises.writeFile(path.join(dir, versionName(ts)), text, 'utf8');
      await fs.promises.writeFile(path.join(dir, META), JSON.stringify({ path: path.resolve(filePath) }), 'utf8');
      for (const old of pickPrune([...names, versionName(ts)], Math.min(HARD_MAX_VERSIONS, cfg.maxVersions))) {
        await fs.promises.rm(path.join(dir, old), { force: true }).catch(() => {});
      }
      if (++counter % 20 === 0) await enforceTotal();
      return true;
    } catch {
      return false; // yeni dosya, okunamadı vb.: kaydı engellemez
    }
  }

  async function list(filePath) {
    const dir = fileDir(filePath);
    const out = [];
    for (const n of await listNames(dir)) {
      try { out.push({ id: n, time: parseVersion(n), size: (await fs.promises.stat(path.join(dir, n))).size }); } catch { /* atla */ }
    }
    return out.sort((a, b) => b.time - a.time);
  }

  async function read(filePath, id) {
    if (typeof id !== 'string' || parseVersion(id) === null) throw new Error('invalid-id');
    return fs.promises.readFile(path.join(fileDir(filePath), id), 'utf8');
  }

  /** Diskte artık olmayan ama geçmişi bulunan dosyalar (silinmiş dosya kurtarma). */
  async function deleted() {
    const dir = wsDir();
    const out = [];
    let subs;
    try { subs = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return out; }
    for (const s of subs) {
      if (!s.isDirectory()) continue;
      try {
        const meta = JSON.parse(await fs.promises.readFile(path.join(dir, s.name, META), 'utf8'));
        if (!meta || typeof meta.path !== 'string' || !isInside(meta.path)) continue;
        const exists = await fs.promises.access(meta.path).then(() => true, () => false);
        if (exists) continue;
        const names = await listNames(path.join(dir, s.name));
        if (names.length) out.push({ path: meta.path, versions: names.length, last: Math.max(...names.map(parseVersion)) });
      } catch { /* bozuk üst veri atlanır */ }
    }
    return out.sort((a, b) => b.last - a.last).slice(0, 200);
  }

  async function clear(scope, filePath) {
    if (scope === 'file' && filePath) await fs.promises.rm(fileDir(filePath), { recursive: true, force: true });
    else if (scope === 'workspace') await fs.promises.rm(wsDir(), { recursive: true, force: true });
    else if (scope === 'all') await fs.promises.rm(base, { recursive: true, force: true });
    else return { success: false };
    return { success: true };
  }

  function setConfig(c) {
    if (c && typeof c.enabled === 'boolean') cfg.enabled = c.enabled;
    if (c && Number.isFinite(c.maxVersions)) cfg.maxVersions = Math.min(HARD_MAX_VERSIONS, Math.max(1, Math.floor(c.maxVersions)));
    return { ...cfg };
  }

  function register({ ipcMain, fromMain }) {
    const guard = (e, p) => fromMain(e) && typeof p === 'string' && isInside(p);
    ipcMain.handle('history:list', async (e, p) => (guard(e, p) ? list(p) : []));
    ipcMain.handle('history:read', async (e, p, id) => {
      try { return guard(e, p) ? { success: true, content: await read(p, id) } : { success: false }; } catch { return { success: false }; }
    });
    ipcMain.handle('history:deleted', async (e) => (fromMain(e) ? deleted() : []));
    ipcMain.handle('history:clear', async (e, scope, p) => {
      if (!fromMain(e)) return { success: false };
      if (scope === 'file' && !guard(e, p)) return { success: false };
      try { return await clear(scope, p); } catch { return { success: false }; }
    });
    ipcMain.handle('history:config', (e, c) => (fromMain(e) ? { success: true, ...setConfig(c) } : { success: false }));
    notify();
  }

  return { snapshot, list, read, deleted, clear, setConfig, register, _cfg: cfg };
}

module.exports = { create, digest, pathKey, parseVersion, versionName, looksText, pickPrune, pickPruneTotal, MAX_FILE_BYTES, MAX_WORKSPACE_BYTES };
