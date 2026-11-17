// Proje içi dosya listesi (hızlı aç, Ctrl+P) ve metin arama (Ctrl+Shift+F). Yalnız açık çalışma klasörü içinde çalışır.
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { createGuards } = require('./electron-paths.cjs');

const IGNORED = new Set(['.git', 'node_modules', 'dist', 'release', '.vscode', '.idea', '.venv', '__pycache__', '.next', 'coverage']);
const MAX_FILES = 20000;
const MAX_FILE_SIZE = 1024 * 1024;
const BINARY_EXT = /\.(png|jpe?g|gif|webp|ico|bmp|pdf|zip|gz|7z|rar|exe|dll|bin|woff2?|ttf|otf|mp[34]|mov|avi|wasm|node|lock)$/i;
const SECRET = /(^|[\\/])(\.env(\..*)?|.*\.(pem|key|p12|pfx)|id_(rsa|ed25519|ecdsa)|\.npmrc|\.netrc|\.pypirc|\.git-credentials|\.docker[\\/]config\.json|\.aws[\\/].*|\.ssh[\\/].*)$/i;
const PARALLEL = 12; // aynı anda okunan dosya sayısı
const LIST_TTL_MS = 10000; // dosya listesi önbelleği (izleyici olmadığı için kısa ömürlü)

async function walk(root, onFile, signal) {
  const stack = [root];
  let count = 0;
  while (stack.length && count < MAX_FILES) {
    if (signal && signal.aborted) return;
    const dir = stack.pop();
    let ents;
    try { ents = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      if (IGNORED.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile()) {
        count++;
        if ((await onFile(full)) === false) return;
      }
    }
  }
}

const listCache = new Map(); // kök -> { at, files }
function invalidateFileList(root) {
  if (root) listCache.delete(root); else listCache.clear();
}
async function listFiles(root, signal, fresh = false) {
  const hit = listCache.get(root);
  if (!fresh && hit && Date.now() - hit.at < LIST_TTL_MS) return hit.files;
  const out = [];
  await walk(root, (f) => { out.push(f); }, signal);
  const files = out.sort((a, b) => a.localeCompare(b));
  if (!(signal && signal.aborted)) listCache.set(root, { at: Date.now(), files });
  return files;
}

// Arama deseni: düz metin kaçışlanır; tam kelime seçeneği \b ile sarar. Geçersizse null.
function buildRe(query, regex, caseSensitive, wholeWord, flags = '') {
  if (typeof query !== 'string' || !query || query.length > 300) return null;
  let src = regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (wholeWord) src = `\\b(?:${src})\\b`;
  try { return new RegExp(src, (caseSensitive ? '' : 'i') + flags); } catch { return null; }
}

async function searchText(root, { query, regex = false, caseSensitive = false, wholeWord = false, maxResults = 300, signal }) {
  if (typeof query !== 'string' || !query || query.length > 300) return { results: [], truncated: false };
  const re = buildRe(query, regex, caseSensitive, wholeWord);
  if (!re) return { results: [], truncated: false, error: 'regex' };
  const results = [];
  let truncated = false;
  // Bir dosyayı oku ve eşleşmelerini döndür (paralel çalışır; sonuç sırası dosya sırasına göre birleştirilir)
  const scan = async (file) => {
    if (signal && signal.aborted) return [];
    if (BINARY_EXT.test(file) || SECRET.test(file)) return [];
    let st;
    try { st = await fs.promises.stat(file); } catch { return []; }
    if (st.size > MAX_FILE_SIZE) return [];
    let text;
    try { text = await fs.promises.readFile(file, 'utf8'); } catch { return []; }
    if (text.includes('\0')) return [];
    const lines = text.split('\n');
    const hits = [];
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        hits.push({ path: file, rel: path.relative(root, file).split(path.sep).join('/'), line: i + 1, text: lines[i].trim().slice(0, 200) });
        if (hits.length >= maxResults) break;
      }
    }
    return hits;
  };
  const files = await listFiles(root, signal, true);
  for (let i = 0; i < files.length && !truncated; i += PARALLEL) {
    if (signal && signal.aborted) return { results, truncated, cancelled: true };
    const batch = await Promise.all(files.slice(i, i + PARALLEL).map(scan));
    for (const hits of batch) {
      for (const h of hits) {
        results.push(h);
        if (results.length >= maxResults) { truncated = true; break; }
      }
      if (truncated) break;
    }
  }
  if (signal && signal.aborted) return { results, truncated, cancelled: true };
  return { results, truncated };
}

// ---- Çalışma alanında bul-değiştir (önizleme + onaylı uygulama) ----
const MAX_REPLACEMENT = 2000;
const MAX_PREVIEW = 500; // önizlemede en çok satır
const SHOW_LEN = 300;

// Tek satırda değiştirme; satır sonundaki \r korunur. Eşleşme yoksa null.
function replaceLine(line, reTest, reGlobal, replacement, regex) {
  const cr = line.endsWith('\r');
  const body = cr ? line.slice(0, -1) : line;
  reTest.lastIndex = 0;
  if (!reTest.test(body)) return null;
  reGlobal.lastIndex = 0;
  const out = regex ? body.replace(reGlobal, replacement) : body.replace(reGlobal, () => replacement);
  return (cr ? out + '\r' : out);
}

function replaceOpts(o) {
  if (!o || typeof o !== 'object') return null;
  const { query, replacement } = o;
  if (typeof query !== 'string' || !query || typeof replacement !== 'string' || replacement.length > MAX_REPLACEMENT) return null;
  const regex = !!o.regex;
  const reTest = buildRe(query, regex, !!o.caseSensitive, !!o.wholeWord);
  const reGlobal = buildRe(query, regex, !!o.caseSensitive, !!o.wholeWord, 'g');
  if (!reTest || !reGlobal) return { error: 'regex' };
  if (reTest.test('')) return { error: 'empty-match' }; // boş eşleşen desen her yere ekleme yapar
  return { reTest, reGlobal, replacement, regex };
}

async function previewReplace(root, o, signal) {
  const p = replaceOpts(o);
  if (!p) return { results: [], truncated: false, error: 'invalid' };
  if (p.error) return { results: [], truncated: false, error: p.error };
  const files = await listFiles(root, signal, true);
  const results = [];
  let truncated = false;
  const scan = async (file) => {
    if (signal && signal.aborted) return [];
    if (BINARY_EXT.test(file) || SECRET.test(file)) return [];
    let st;
    try { st = await fs.promises.stat(file); } catch { return []; }
    if (st.size > MAX_FILE_SIZE) return [];
    let text;
    try { text = await fs.promises.readFile(file, 'utf8'); } catch { return []; }
    if (text.includes('\0')) return [];
    const rel = path.relative(root, file).split(path.sep).join('/');
    const hits = [];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const after = replaceLine(lines[i], p.reTest, p.reGlobal, p.replacement, p.regex);
      if (after !== null && after !== lines[i]) hits.push({ path: file, rel, line: i + 1, before: lines[i].trim().slice(0, SHOW_LEN), after: after.trim().slice(0, SHOW_LEN) });
      if (hits.length >= MAX_PREVIEW) break;
    }
    return hits;
  };
  for (let i = 0; i < files.length && !truncated; i += PARALLEL) {
    if (signal && signal.aborted) return { results, truncated, cancelled: true };
    const batch = await Promise.all(files.slice(i, i + PARALLEL).map(scan));
    for (const hits of batch) {
      for (const h of hits) {
        results.push(h);
        if (results.length >= MAX_PREVIEW) { truncated = true; break; }
      }
      if (truncated) break;
    }
  }
  return { results, truncated };
}

// Atomik yazım: aynı dizinde geçici dosya + rename (yarım yazılmış dosya kalmaz).
async function writeAtomic(target, content, mode) {
  const tmp = path.join(path.dirname(target), `.${path.basename(target)}.nova-${process.pid}-${Date.now().toString(36)}.tmp`);
  try {
    await fs.promises.writeFile(tmp, content, { encoding: 'utf8', mode, flag: 'wx' });
    await fs.promises.rename(tmp, target);
  } catch (e) {
    try { await fs.promises.unlink(tmp); } catch { /* yok */ }
    throw e;
  }
}

// selection: [{ path, lines: [n, ...] }] — yalnız işaretlenen satırlar değişir; satır artık eşleşmiyorsa atlanır.
async function applyReplace(root, o, guards) {
  const p = replaceOpts(o);
  if (!p) return { success: false, error: 'invalid' };
  if (p.error) return { success: false, error: p.error };
  const sel = Array.isArray(o.selection) ? o.selection.slice(0, 5000) : [];
  let files = 0; let lines = 0; let skipped = 0;
  const failed = [];
  for (const item of sel) {
    const file = item && item.path;
    const wanted = new Set(Array.isArray(item && item.lines) ? item.lines.filter((n) => Number.isInteger(n) && n > 0) : []);
    if (typeof file !== 'string' || !wanted.size) continue;
    const rel = guards.isValidPath(file) ? path.relative(root, path.resolve(file)) : '';
    const segs = rel.split(path.sep);
    if (!rel || BINARY_EXT.test(file) || SECRET.test(file) || segs.some((s) => IGNORED.has(s)) || !guards.insideWorkspace(file)) { failed.push(rel || '?'); continue; }
    try {
      const target = guards.resolveReal(file);
      if (!target || !guards.insideWorkspace(target)) { failed.push(rel); continue; }
      const st = await fs.promises.stat(target);
      if (!st.isFile() || st.size > MAX_FILE_SIZE) { failed.push(rel); continue; }
      const text = await fs.promises.readFile(target, 'utf8');
      if (text.includes('\0')) { failed.push(rel); continue; }
      const arr = text.split('\n');
      let n = 0;
      for (const ln of wanted) {
        if (ln > arr.length) { skipped++; continue; }
        const after = replaceLine(arr[ln - 1], p.reTest, p.reGlobal, p.replacement, p.regex);
        if (after === null) { skipped++; continue; }
        if (after !== arr[ln - 1]) { arr[ln - 1] = after; n++; }
      }
      if (n) { await writeAtomic(target, arr.join('\n'), st.mode & 0o777); files++; lines += n; }
    } catch { failed.push(rel); }
  }
  return { success: true, files, lines, skipped, failed };
}

function register({ getRoot }) {
  ipcMain.handle('search:files', async () => {
    const root = getRoot();
    return root ? { root, files: await listFiles(root) } : { root: '', files: [] };
  });
  // İstek kimliği (id): yeni arama eskisini iptal eder; search:cancel ile de iptal edilebilir.
  const active = new Map(); // id -> AbortController
  ipcMain.handle('search:text', async (_e, opts) => {
    const root = getRoot();
    if (!root || !opts || typeof opts !== 'object') return { results: [], truncated: false };
    const id = typeof opts.id === 'string' && opts.id.length <= 40 ? opts.id : '';
    for (const a of active.values()) a.abort();
    active.clear();
    const ac = new AbortController();
    if (id) active.set(id, ac);
    try {
      return await searchText(root, { query: opts.query, regex: !!opts.regex, caseSensitive: !!opts.caseSensitive, wholeWord: !!opts.wholeWord, maxResults: 300, signal: ac.signal });
    } finally {
      if (active.get(id) === ac) active.delete(id);
    }
  });
  // Bul-değiştir: mode 'preview' (diske dokunmaz) | 'apply' (yalnız seçilen satırlar, atomik yazım, çalışma klasörü içinde)
  const guards = createGuards(getRoot);
  ipcMain.handle('search:replace', async (_e, opts) => {
    const root = getRoot();
    if (!root || !opts || typeof opts !== 'object') return { results: [], truncated: false, error: 'invalid' };
    if (opts.mode === 'apply') return applyReplace(root, opts, guards);
    const id = typeof opts.id === 'string' && opts.id.length <= 40 ? opts.id : '';
    for (const a of active.values()) a.abort();
    active.clear();
    const ac = new AbortController();
    if (id) active.set(id, ac);
    try {
      return await previewReplace(root, opts, ac.signal);
    } finally {
      if (active.get(id) === ac) active.delete(id);
    }
  });
  ipcMain.handle('search:cancel', (_e, id) => {
    const a = active.get(String(id));
    if (a) a.abort();
    return { success: true };
  });
}

module.exports = { register, searchText, previewReplace, applyReplace, listFiles, invalidateFileList, IGNORED };
