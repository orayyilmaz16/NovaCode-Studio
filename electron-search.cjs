// Proje içi dosya listesi (hızlı aç, Ctrl+P) ve metin arama (Ctrl+Shift+F). Yalnız açık çalışma klasörü içinde çalışır.
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const IGNORED = new Set(['.git', 'node_modules', 'dist', 'release', '.vscode', '.idea', '.venv', '__pycache__', '.next', 'coverage']);
const MAX_FILES = 20000;
const MAX_FILE_SIZE = 1024 * 1024;
const BINARY_EXT = /\.(png|jpe?g|gif|webp|ico|bmp|pdf|zip|gz|7z|rar|exe|dll|bin|woff2?|ttf|otf|mp[34]|mov|avi|wasm|node|lock)$/i;
const SECRET = /(^|[\\/])(\.env(\..*)?|.*\.(pem|key|p12|pfx)|id_(rsa|ed25519|ecdsa)|\.npmrc|\.netrc)$/i;

async function walk(root, onFile) {
  const stack = [root];
  let count = 0;
  while (stack.length && count < MAX_FILES) {
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

async function listFiles(root) {
  const out = [];
  await walk(root, (f) => { out.push(f); });
  return out.sort((a, b) => a.localeCompare(b));
}

async function searchText(root, { query, regex = false, caseSensitive = false, maxResults = 300 }) {
  if (typeof query !== 'string' || !query || query.length > 300) return { results: [], truncated: false };
  let re;
  try { re = new RegExp(regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? '' : 'i'); } catch { return { results: [], truncated: false, error: 'regex' }; }
  const results = [];
  let truncated = false;
  await walk(root, async (file) => {
    if (BINARY_EXT.test(file) || SECRET.test(file)) return;
    let st;
    try { st = await fs.promises.stat(file); } catch { return; }
    if (st.size > MAX_FILE_SIZE) return;
    let text;
    try { text = await fs.promises.readFile(file, 'utf8'); } catch { return; }
    if (text.includes('\0')) return;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        results.push({ path: file, rel: path.relative(root, file).split(path.sep).join('/'), line: i + 1, text: lines[i].trim().slice(0, 200) });
        if (results.length >= maxResults) { truncated = true; return false; }
      }
    }
  });
  return { results, truncated };
}

// Çalışma alanı türü (Çalıştır menüsü için): package.json betikleri ve proje dosyaları
function detectWorkspace(root) {
  const has = (f) => fs.existsSync(path.join(root, f));
  const kinds = [];
  let scripts = [];
  if (has('package.json')) {
    kinds.push('node');
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
      scripts = Object.keys(pkg.scripts || {}).filter((n) => /^[\w:.-]{1,40}$/.test(n)).slice(0, 30);
    } catch { /* bozuk package.json */ }
  }
  if (has('go.mod')) kinds.push('go');
  if (has('Cargo.toml')) kinds.push('rust');
  if (has('composer.json')) kinds.push('php');
  if (has('pom.xml') || has('build.gradle') || has('build.gradle.kts')) kinds.push('java');
  if (has('pyproject.toml') || has('requirements.txt') || has('main.py') || has('app.py')) kinds.push('python');
  try { if (fs.readdirSync(root).some((f) => /\.(csproj|sln)$/i.test(f))) kinds.push('dotnet'); } catch { /* okunamadı */ }
  if (has('Makefile')) kinds.push('make');
  if (has('docker-compose.yml') || has('docker-compose.yaml')) kinds.push('docker');
  const pm = has('pnpm-lock.yaml') ? 'pnpm' : has('yarn.lock') ? 'yarn' : has('bun.lockb') || has('bun.lock') ? 'bun' : 'npm';
  return { pm, scripts, kinds };
}

function register({ getRoot }) {
  ipcMain.handle('workspace:detect', () => {
    const root = getRoot();
    return root ? detectWorkspace(root) : { pm: 'npm', scripts: [], kinds: [] };
  });
  ipcMain.handle('search:files', async () => {
    const root = getRoot();
    return root ? { root, files: await listFiles(root) } : { root: '', files: [] };
  });
  ipcMain.handle('search:text', async (_e, opts) => {
    const root = getRoot();
    if (!root || !opts || typeof opts !== 'object') return { results: [], truncated: false };
    return searchText(root, { query: opts.query, regex: !!opts.regex, caseSensitive: !!opts.caseSensitive, maxResults: 300 });
  });
}

module.exports = { register, searchText, listFiles, IGNORED };
