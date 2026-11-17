// Proje içi dosya listesi (hızlı aç, Ctrl+P) ve metin arama (Ctrl+Shift+F). Yalnız açık çalışma klasörü içinde çalışır.
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

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

async function searchText(root, { query, regex = false, caseSensitive = false, maxResults = 300, signal }) {
  if (typeof query !== 'string' || !query || query.length > 300) return { results: [], truncated: false };
  let re;
  try { re = new RegExp(regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? '' : 'i'); } catch { return { results: [], truncated: false, error: 'regex' }; }
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
      return await searchText(root, { query: opts.query, regex: !!opts.regex, caseSensitive: !!opts.caseSensitive, maxResults: 300, signal: ac.signal });
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

module.exports = { register, searchText, listFiles, invalidateFileList, IGNORED };
