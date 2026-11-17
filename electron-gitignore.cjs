// Basit ve güvenli .gitignore eşleyici (P-16): yalnız kök .gitignore, ağaç taramasını sınırlamak için.
// Desteklenen: yorum, boş satır, `!` olumsuzlama, sondaki `/` (yalnız klasör), baştaki `/` veya araya giren `/` (köke bağlı),
// `*`, `?`, `**`. Köşeli parantez sınıfları desteklenmez (düz karakter sayılır). Desen sayısı ve uzunluğu sınırlıdır.
const MAX_PATTERNS = 400;
const MAX_PATTERN_LEN = 200;

function escapeRe(ch) {
  return /[.+^${}()|[\]\\]/.test(ch) ? '\\' + ch : ch;
}

// Tek desen -> { re, negate, dirOnly } ya da null
function compilePattern(raw) {
  let line = String(raw).replace(/\r$/, '');
  if (!line || line.startsWith('#')) return null;
  // Sondaki boşluklar yok sayılır (ters eğik çizgiyle kaçırılmadıysa)
  line = line.replace(/(?<!\\)\s+$/, '');
  if (!line || line.length > MAX_PATTERN_LEN) return null;
  let negate = false;
  if (line.startsWith('!')) { negate = true; line = line.slice(1); }
  else if (line.startsWith('\\!') || line.startsWith('\\#')) line = line.slice(1);
  let dirOnly = false;
  if (line.endsWith('/')) { dirOnly = true; line = line.replace(/\/+$/, ''); }
  if (!line) return null;
  const anchored = line.includes('/');
  line = line.replace(/^\/+/, '');
  let out = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '*') {
      if (line[i + 1] === '*') {
        // `**/` = sıfır veya daha çok klasör; sondaki `**` = her şey
        if (line[i + 2] === '/') { out += '(?:.*/)?'; i += 2; }
        else { out += '.*'; i += 1; }
      } else out += '[^/]*';
    } else if (c === '?') out += '[^/]';
    else if (c === '\\' && i + 1 < line.length) { out += escapeRe(line[i + 1]); i += 1; }
    else out += escapeRe(c);
  }
  const re = new RegExp(anchored ? `^${out}$` : `(?:^|/)${out}$`);
  return { re, negate, dirOnly };
}

/** .gitignore metninden eşleyici üretir: (göreli posix yol, klasör mü) => yok sayılsın mı. */
function createIgnoreMatcher(text) {
  const rules = [];
  for (const raw of String(text || '').split('\n')) {
    if (rules.length >= MAX_PATTERNS) break;
    try {
      const r = compilePattern(raw);
      if (r) rules.push(r);
    } catch { /* bozuk desen atlanır */ }
  }
  if (!rules.length) return () => false;
  return (relPath, isDir) => {
    const p = String(relPath).split('\\').join('/').replace(/^\/+/, '');
    let ignored = false;
    for (const r of rules) {
      if (r.dirOnly && !isDir) continue;
      if (r.re.test(p)) ignored = !r.negate;
    }
    return ignored;
  };
}

module.exports = { createIgnoreMatcher, compilePattern };
