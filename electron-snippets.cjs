// Kullanıcı snippet'leri (F-06): çalışma klasörü `.nova/snippets.json` + genel dosya `userData/snippets.json`.
// Şema: { "<ad>": { "prefix": "dize | dize[]", "body": "dize | dize[]", "description": "", "language": "ts" } }
// Doğrulama ve boyut sınırı burada; renderer yalnız doğrulanmış listeyi alır. Veri yalnız yerelde kalır, hiçbir yere gönderilmez.
const fs = require('fs');
const path = require('path');

const MAX_BYTES = 256 * 1024;
const MAX_SNIPPETS = 500;
const MAX_PREFIXES = 10;
const MAX_BODY = 20000;
const LANG_RE = /^[a-z0-9_.+-]{1,30}$/i;

/** Metni ayrıştırıp doğrular. { snippets: [{name,prefix[],body,description,language?}], errors: string[] } */
function parseSnippets(text) {
  const out = { snippets: [], errors: [] };
  if (typeof text !== 'string') { out.errors.push('not-text'); return out; }
  if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) { out.errors.push('too-large'); return out; }
  if (!text.trim()) return out;
  let data;
  try { data = JSON.parse(text); } catch (e) { out.errors.push('invalid-json'); return out; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) { out.errors.push('not-object'); return out; }
  let n = 0;
  for (const [name, def] of Object.entries(data)) {
    if (n >= MAX_SNIPPETS) { out.errors.push('too-many'); break; }
    if (name === '__proto__' || !name || name.length > 80) { out.errors.push(`bad-name:${String(name).slice(0, 40)}`); continue; }
    if (!def || typeof def !== 'object' || Array.isArray(def)) { out.errors.push(`bad-def:${name}`); continue; }
    const prefixRaw = Array.isArray(def.prefix) ? def.prefix : [def.prefix];
    const prefix = prefixRaw.filter((p) => typeof p === 'string' && p.length > 0 && p.length <= 40 && !/\s/.test(p)).slice(0, MAX_PREFIXES);
    if (!prefix.length) { out.errors.push(`bad-prefix:${name}`); continue; }
    const body = Array.isArray(def.body) ? (def.body.every((l) => typeof l === 'string') ? def.body.join('\n') : null) : typeof def.body === 'string' ? def.body : null;
    if (body === null || !body.length || body.length > MAX_BODY) { out.errors.push(`bad-body:${name}`); continue; }
    const description = typeof def.description === 'string' ? def.description.slice(0, 200) : '';
    let language;
    if (def.language !== undefined) {
      if (typeof def.language !== 'string' || !LANG_RE.test(def.language)) { out.errors.push(`bad-language:${name}`); continue; }
      language = def.language.toLowerCase();
    }
    out.snippets.push(language ? { name, prefix, body, description, language } : { name, prefix, body, description });
    n++;
  }
  return out;
}

function register({ getRoot, userDataDir, isInside, fromMain }) {
  const { ipcMain } = require('electron');
  const userFile = () => path.join(userDataDir, 'snippets.json');
  const wsFile = () => { const r = getRoot(); return r ? path.join(r, '.nova', 'snippets.json') : null; };
  const fileFor = (scope) => (scope === 'user' ? userFile() : scope === 'workspace' ? wsFile() : null);

  async function readRaw(file) {
    if (!file) return '';
    try {
      const st = await fs.promises.stat(file);
      if (!st.isFile() || st.size > MAX_BYTES) return st.size > MAX_BYTES ? null : '';
      return await fs.promises.readFile(file, 'utf8');
    } catch { return ''; }
  }

  // Yüklenmiş (doğrulanmış) snippet'ler: çalışma klasörü kayıtları genel olanların üstüne yazar (aynı ad)
  ipcMain.handle('snippets:load', async (e) => {
    if (!fromMain(e)) return { snippets: [], errors: [] };
    const res = { snippets: [], errors: [] };
    const seen = new Set();
    for (const scope of ['workspace', 'user']) {
      const raw = await readRaw(fileFor(scope));
      if (raw === null) { res.errors.push(`${scope}:too-large`); continue; }
      const p = parseSnippets(raw);
      p.errors.forEach((er) => res.errors.push(`${scope}:${er}`));
      for (const s of p.snippets) {
        if (seen.has(s.name)) continue;
        seen.add(s.name);
        res.snippets.push({ ...s, scope });
      }
    }
    return res;
  });

  // Düzenleyici için ham metin (boşsa örnek şablon renderer'da gösterilir)
  ipcMain.handle('snippets:read', async (e, scope) => {
    if (!fromMain(e)) return { success: false };
    const file = fileFor(scope);
    if (!file) return { success: false, error: 'no-folder' };
    const raw = await readRaw(file);
    return raw === null ? { success: false, error: 'too-large' } : { success: true, text: raw };
  });

  ipcMain.handle('snippets:save', async (e, scope, text) => {
    if (!fromMain(e)) return { success: false };
    const file = fileFor(scope);
    if (!file) return { success: false, error: 'no-folder' };
    const parsed = parseSnippets(text);
    if (parsed.errors.length) return { success: false, error: 'invalid', errors: parsed.errors.slice(0, 10) };
    try {
      if (scope === 'workspace' && !isInside(path.dirname(file)) && !isInside(file)) return { success: false, error: 'outside' };
      await fs.promises.mkdir(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      await fs.promises.writeFile(tmp, text, 'utf8');
      await fs.promises.rename(tmp, file);
      return { success: true, count: parsed.snippets.length };
    } catch (err) {
      return { success: false, error: err && err.message ? err.message : 'write-failed' };
    }
  });
}

module.exports = { parseSnippets, register, MAX_BYTES, MAX_SNIPPETS };
