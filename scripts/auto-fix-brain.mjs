// Deterministik düzeltici (LLM yok, anahtar yok, ücret yok): proje beynindeki ÇÖZÜLMEYEN [[bağlantılar]]ı onarır.
// Kural: yazım benzeri bir dosya adı varsa (düzenleme uzaklığı ≤ 3 veya büyük/küçük harf farkı) en yakınına bağlanır;
// yoksa köşeli parantez kaldırılır ve ad kod biçiminde (`ad`) bırakılır. Kod, test ve yapılandırmaya dokunmaz.
// Kullanım: node scripts/auto-fix-brain.mjs            (değişiklik yazar; sonucu stdout'a döker)
//           node scripts/auto-fix-brain.mjs --dry-run  (yalnız rapor)
// Testler: scripts/tests/autofix.test.cjs. Kural: docs/brain/actions/autopilot.md
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Düzenleme uzaklığı (Levenshtein)
export function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

// En yakın bilinen ad; yoksa null. Eşleşme: büyük/küçük harf farkı veya uzaklık ≤ 3 (kısa adlarda ≤ 1).
export function closestName(name, known) {
  const lower = name.toLowerCase();
  const ci = known.find((k) => k.toLowerCase() === lower);
  if (ci) return ci;
  let best = null, bestD = Infinity;
  for (const k of known) {
    const d = editDistance(lower, k.toLowerCase());
    if (d < bestD) { bestD = d; best = k; }
  }
  const limit = name.length <= 6 ? 1 : 3;
  return best && bestD <= limit ? best : null;
}

// Tek bir içerikteki çözülmeyen bağlantıları onarır. Dönen: { content, changes: [{from, to}] }
export function fixBrainLinks(content, unresolved, known) {
  const changes = [];
  let out = content;
  for (const name of unresolved) {
    const target = closestName(name, known);
    const replacement = target ? `[[${target}]]` : `\`${name}\``;
    const re = new RegExp(`\\[\\[${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\]`, 'g');
    const before = out;
    out = out.replace(re, replacement);
    if (out !== before) changes.push({ from: name, to: target || '(düz metin)' });
  }
  return { content: out, changes };
}

// brain.mjs --check çıktısındaki "HATA: <dosya>: [[ad]] bağlantısı çözülmüyor" satırlarını ayıklar.
export function parseUnresolved(output) {
  const map = new Map(); // dosya -> Set(ad)
  for (const line of String(output).split(/\r?\n/)) {
    const m = /HATA: (.+?): \[\[(.+?)\]\] bağlantısı çözülmüyor/.exec(line);
    if (!m) continue;
    if (!map.has(m[1])) map.set(m[1], new Set());
    map.get(m[1]).add(m[2].trim());
  }
  return map;
}

function walkMd(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkMd(p, out);
    else if (e.endsWith('.md')) out.push(p);
  }
  return out;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const check = spawnSync(process.execPath, ['scripts/brain.mjs', '--check'], { encoding: 'utf8' });
  const unresolved = parseUnresolved(`${check.stdout || ''}\n${check.stderr || ''}`);
  if (unresolved.size === 0) {
    console.log('Çözülmeyen bağlantı yok; düzeltilecek bir şey bulunamadı.');
    return;
  }
  // brain.mjs ile aynı kümeyi kullan: docs/brain altı + kök dizindeki .md dosyaları
  const rootMd = readdirSync('.').filter((f) => f.endsWith('.md'));
  const known = [...walkMd('docs/brain'), ...rootMd].map((p) => basename(p, '.md'));
  let total = 0;
  for (const [file, names] of unresolved) {
    const original = readFileSync(file, 'utf8');
    const { content, changes } = fixBrainLinks(original, [...names], known);
    for (const c of changes) console.log(`${file}: [[${c.from}]] → ${c.to === '(düz metin)' ? '`' + c.from + '`' : '[[' + c.to + ']]'}`);
    total += changes.length;
    if (!dryRun && content !== original) writeFileSync(file, content);
  }
  console.log(`Toplam düzeltme: ${total}${dryRun ? ' (kuru çalıştırma, dosya yazılmadı)' : ''}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
