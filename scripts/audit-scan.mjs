#!/usr/bin/env node
// Sürekli denetim: güvenlik, performans, kalite sezgisel taraması → docs/brain/AUDIT.md (otomatik).
//   node scripts/audit-scan.mjs            → AUDIT.md + audit-baseline.json üretir
//   node scripts/audit-scan.mjs --check    → temel çizgiye göre YENİ yüksek/kritik bulgu varsa çıkış 1 (CI)
//   --quiet                                → çıktıyı bastırır
// Ağa çıkmaz, yapay zekâ çağrısı yok; saniyeler sürer. Değer/sır yazdırmaz, yalnız dosya:satır.
// Derin (elle/ajan) bulgular docs/brain/BACKLOG.md içinde tutulur. Kural: docs/brain/actions/audit.md
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const check = args.has("--check");
const quiet = args.has("--quiet");
const OUT = "docs/brain/AUDIT.md";
const BASE = "docs/brain/audit-baseline.json";

const SKIP = new Set(["node_modules", "dist", "release", "dist-electron", ".git", "build", "coverage", ".venv"]);
const walk = (dir, re, out = []) => {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return out;
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) walk(rel, re, out);
    else if (re.test(e.name)) out.push(rel);
  }
  return out;
};
const read = (p) => readFileSync(join(ROOT, p), "utf8").replace(/\r\n/g, "\n");

const MAIN = readdirSync(ROOT).filter((f) => /^electron-.*\.cjs$/.test(f));
const SRC = walk("src", /\.(ts|tsx)$/);
const SERVER = walk("server", /\.(mjs|cjs|js)$/);
const ALL_CODE = [...MAIN, ...SRC, ...SERVER];
const cache = new Map();
const text = (f) => (cache.has(f) ? cache.get(f) : (cache.set(f, read(f)), cache.get(f)));

// bulgu: { id, sev: kritik|yüksek|orta|düşük, cat: güvenlik|performans|kalite, file, line, msg }
const findings = [];
const add = (id, sev, cat, file, line, msg) => findings.push({ id, sev, cat, file, line, msg });

// Satır bazlı kural: regex eşleşen her satır (yorum satırları atlanır)
function rule(files, re, id, sev, cat, msg, { skip, once } = {}) {
  for (const f of files) {
    const lines = text(f).split("\n");
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (/^\s*(\/\/|\*|\/\*)/.test(l)) continue;
      if (re.test(l) && !(skip && skip.test(l))) {
        add(id, sev, cat, f, i + 1, msg);
        if (once) break;
      }
    }
  }
}

// ---------- Güvenlik ----------
rule(["electron-main.cjs"], /sandbox:\s*false/, "SEC-SANDBOX", "yüksek", "güvenlik", "BrowserWindow sandbox kapalı (renderer ele geçirilirse etki büyür)");
rule(MAIN, /nodeIntegration:\s*true|contextIsolation:\s*false|webSecurity:\s*false|allowRunningInsecureContent:\s*true/, "SEC-WEBPREFS", "kritik", "güvenlik", "Tehlikeli webPreferences ayarı");
rule(ALL_CODE, /\beval\s*\(|new Function\s*\(/, "SEC-EVAL", "yüksek", "güvenlik", "eval / new Function kullanımı");
rule(SRC, /dangerouslySetInnerHTML|\.innerHTML\s*=|insertAdjacentHTML/, "SEC-HTML", "orta", "güvenlik", "Ham HTML basımı; DOMPurify ile temizlendiğini doğrula", { skip: /DOMPurify|sanitize/i });
rule(MAIN, /shell\.openExternal\(/, "SEC-OPENEXT", "orta", "güvenlik", "openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et");
rule(MAIN, /\b(exec|execSync)\s*\(\s*[`'"].*(\$\{|\+)/, "SEC-EXEC", "yüksek", "güvenlik", "Birleştirilmiş dizeyle exec: komut enjeksiyonu riski (execFile + argüman dizisi kullan)");
rule(MAIN, /spawn\([^)]*shell:\s*true/, "SEC-SHELL", "yüksek", "güvenlik", "spawn shell:true: argüman enjeksiyonu riski");
rule(ALL_CODE, /http:\/\/(?!localhost|127\.0\.0\.1|\[::1\]|www\.w3\.org)/, "SEC-HTTP", "düşük", "güvenlik", "Şifresiz http:// adresi");
rule(ALL_CODE, /rejectUnauthorized:\s*false|NODE_TLS_REJECT_UNAUTHORIZED/, "SEC-TLS", "kritik", "güvenlik", "TLS doğrulaması kapatılmış");
rule(ALL_CODE, /\b(?:sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,})/, "SEC-SECRET", "kritik", "güvenlik", "Kodda gizli anahtar benzeri değer (değer gösterilmez)");
rule(MAIN, /ipcMain\.(handle|on)\(['"`][^'"`]+['"`]\s*,\s*(async\s*)?\(\s*\)\s*=>/, "SEC-IPC-NOEVT", "düşük", "güvenlik", "IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor");

// CSP
if (existsSync(join(ROOT, "index.html"))) {
  const html = text("index.html");
  if (!/Content-Security-Policy/i.test(html) && !MAIN.some((f) => /Content-Security-Policy/i.test(text(f)))) {
    add("SEC-CSP", "orta", "güvenlik", "index.html", 1, "Content-Security-Policy tanımı yok (index.html ve ana süreçte)");
  }
}
// Açık yüzey: preload'dan sızan genel IPC (invoke(channel) kaçışı)
if (existsSync(join(ROOT, "electron-preload.cjs"))) {
  const lines = text("electron-preload.cjs").split("\n");
  lines.forEach((l, i) => {
    if (/ipcRenderer\.(invoke|send|on)\(\s*(channel|ch|name)\b/.test(l)) add("SEC-PRELOAD-GENERIC", "yüksek", "güvenlik", "electron-preload.cjs", i + 1, "Preload keyfi kanal adı iletiyor (kanal beyaz listesi yok)");
  });
}
// Eylem sabitleme (CI)
for (const wf of walk(".github/workflows", /\.ya?ml$/)) {
  text(wf).split("\n").forEach((l, i) => {
    const m = l.match(/uses:\s*([\w./-]+)@([\w.-]+)/);
    if (m && !/^[0-9a-f]{40}$/.test(m[2]) && !/^(actions|github)\//.test(m[1])) add("SEC-ACTION-PIN", "düşük", "güvenlik", wf, i + 1, `3. parti action sürüm etiketiyle çağrılıyor (SHA'ya sabitle): ${m[1]}`);
  });
}

// ---------- Performans ----------
rule(["electron-main.cjs"], /^(const|let|var)\s.*require\(['"](node-llama-cpp|@node-llama-cpp|yjs|y-websocket|electron-llm)/, "PERF-EAGER-REQ", "orta", "performans", "Ağır modül açılışta yükleniyor (tembel require'a çevir)");
rule(MAIN, /\b(readFileSync|writeFileSync|readdirSync|statSync|existsSync|execSync|spawnSync)\(/, "PERF-SYNC-FS", "düşük", "performans", "Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar)", { once: false });
rule(SRC, /new\s+RegExp\([^)]*\+/, "PERF-DYN-RE", "düşük", "performans", "Döngüde dinamik RegExp üretimi olabilir");
rule(SRC, /JSON\.parse\(JSON\.stringify\(/, "PERF-DEEPCLONE", "düşük", "performans", "JSON ile derin kopya (structuredClone kullan)");
rule(SRC, /localStorage\.setItem\(/, "PERF-LS-WRITE", "düşük", "performans", "localStorage yazımı: sık tetikleniyorsa debounce et", { skip: /debounce/ });

// Temizlenmeyen dinleyiciler: dosya bazında addEventListener sayısı > removeEventListener
for (const f of SRC.filter((x) => x.endsWith(".tsx"))) {
  const t = text(f);
  const a = (t.match(/addEventListener\(/g) || []).length;
  const r = (t.match(/removeEventListener\(/g) || []).length;
  if (a > r) add("PERF-LISTENER-LEAK", "orta", "performans", f, 1, `addEventListener (${a}) > removeEventListener (${r}): temizlenmeyen dinleyici olabilir`);
  const si = (t.match(/setInterval\(/g) || []).length;
  const ci = (t.match(/clearInterval\(/g) || []).length;
  if (si > ci) add("PERF-INTERVAL-LEAK", "orta", "performans", f, 1, `setInterval (${si}) > clearInterval (${ci})`);
}

// Büyük dosyalar (tek bileşen şişmesi → gereksiz yeniden render)
const sizes = ALL_CODE.map((f) => ({ f, n: text(f).split("\n").length })).sort((a, b) => b.n - a.n);
for (const { f, n } of sizes.filter((s) => s.n >= 1200)) add("PERF-BIGFILE", "orta", "performans", f, 1, `${n} satır: bölünmeli / memo ile ayrıştırılmalı`);

// Paket boyutu (dist varsa)
const distAssets = existsSync(join(ROOT, "dist/assets")) ? readdirSync(join(ROOT, "dist/assets")).filter((f) => f.endsWith(".js")).map((f) => ({ f, kb: Math.round(statSync(join(ROOT, "dist/assets", f)).size / 1024) })).sort((a, b) => b.kb - a.kb) : [];
const initialKb = distAssets.reduce((s, a) => s + a.kb, 0);
for (const a of distAssets.filter((x) => x.kb > 1500)) add("PERF-CHUNK", "orta", "performans", `dist/assets/${a.f}`, 1, `${a.kb} KB: kod bölme ile küçült`);

// ---------- Kalite ----------
rule(ALL_CODE, /catch\s*(\([^)]*\))?\s*\{\s*\}/, "Q-EMPTY-CATCH", "düşük", "kalite", "Boş catch: hata yutuluyor");
rule(ALL_CODE, /\b(TODO|FIXME|HACK|XXX)\b/, "Q-TODO", "düşük", "kalite", "Açık TODO/FIXME");
rule(SRC, /:\s*any\b|as any\b/, "Q-ANY", "düşük", "kalite", "`any` kullanımı (strict tip güvenliği)");
rule(SRC, /\bconsole\.(log|debug)\(/, "Q-CONSOLE", "düşük", "kalite", "Kalan console.log");
rule(SRC, /\btransition[^;]*\b\d{2,4}ms|animation[^;]*\b\d{2,4}ms/, "Q-HARDMS", "düşük", "kalite", "Sabit ms (CLAUDE.md kural 9: motion jetonları kullan)");

// i18n: görünür sabit metin kuşkusu (JSX içinde düz Türkçe/İngilizce kelime)
rule(SRC.filter((f) => f.endsWith(".tsx")), />\s*[A-ZÇĞİÖŞÜ][a-zçğıöşü]{3,}(\s+[a-zçğıöşü]+){0,4}\s*</, "Q-I18N-HARD", "orta", "kalite", "JSX içinde sabit metin olabilir (8 dil kuralı)", { skip: /t\(|\{/ });

// Erişilebilirlik: etiketsiz simge düğmesi
rule(SRC.filter((f) => f.endsWith(".tsx")), /<button(?![^>]*(aria-label|title))[^>]*>\s*<(svg|Icon|[A-Z]\w*Icon)/, "Q-A11Y-BTN", "orta", "kalite", "Etiketsiz simge düğmesi (aria-label/title yok)");

// ---------- Sıralama ve özet ----------
const SEV = { kritik: 0, yüksek: 1, orta: 2, düşük: 3 };
findings.sort((a, b) => SEV[a.sev] - SEV[b.sev] || a.id.localeCompare(b.id) || a.file.localeCompare(b.file) || a.line - b.line);

// Aynı kuralın aynı dosyadaki çok sayıdaki satırı tek satıra katlanır (rapor okunur kalsın)
const groups = new Map();
for (const f of findings) {
  const k = `${f.id}|${f.file}`;
  const g = groups.get(k) || { ...f, lines: [], count: 0 };
  g.lines.push(f.line); g.count++;
  groups.set(k, g);
}
const grouped = [...groups.values()];
const fp = (g) => `${g.id}|${g.file}`; // parmak izi: satır kaymasından etkilenmez

const prev = existsSync(join(ROOT, BASE)) ? JSON.parse(read(BASE)) : null;
const prevMap = new Map((prev?.items || []).map((i) => [i.k, i.n]));
const cur = grouped.map((g) => ({ k: fp(g), n: g.count, sev: g.sev }));
const curMap = new Map(cur.map((i) => [i.k, i.n]));
const added = grouped.filter((g) => !prevMap.has(fp(g)) || g.count > prevMap.get(fp(g)));
const resolved = [...prevMap.keys()].filter((k) => !curMap.has(k));

const tally = (cat) => Object.fromEntries(["kritik", "yüksek", "orta", "düşük"].map((s) => [s, findings.filter((f) => f.cat === cat && f.sev === s).length]));
const T = { güvenlik: tally("güvenlik"), performans: tally("performans"), kalite: tally("kalite") };

if (check) {
  const bad = added.filter((g) => g.sev === "kritik" || g.sev === "yüksek");
  if (prev && bad.length) {
    console.log(`::error::Denetim: temel çizgiye göre ${bad.length} YENİ yüksek/kritik bulgu`);
    for (const g of bad) console.log(`  [${g.sev}] ${g.id} ${g.file}:${g.lines[0]} — ${g.msg}`);
    process.exit(1);
  }
  if (!quiet) console.log(`Denetim ✓ (yeni yüksek/kritik yok; kritik ${findings.filter((f) => f.sev === "kritik").length})`);
  process.exit(0);
}

const date = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
const row = (g) => `| ${g.sev} | ${g.id} | \`${g.file}:${g.lines.slice(0, 3).join(",")}${g.count > 3 ? `…(+${g.count - 3})` : ""}\` | ${g.msg}${g.count > 1 ? ` (${g.count}×)` : ""} |`;
const section = (title, cat) => {
  const rows = grouped.filter((g) => g.cat === cat);
  return `## ${title}\n| Önem | Kural | Konum | Sorun |\n|---|---|---|---|\n${rows.length ? rows.map(row).join("\n") : "| — | — | — | Bulgu yok |"}\n`;
};
const cnt = (cat) => { const t = T[cat]; return `kritik ${t.kritik} · yüksek ${t.yüksek} · orta ${t.orta} · düşük ${t.düşük}`; };

const md = `<!-- Bu dosya scripts/audit-scan.mjs tarafından otomatik üretilir; elle düzenleme. -->
# Denetim raporu (otomatik)

Son tarama: ${date} · Kaynak: \`npm run audit\` (her Claude turunda ve CI'da haftalık/her push'ta) · Derin/elle bulgular: [[BACKLOG]] · Kural: [[audit]]

## Özet
| Alan | Bulgu |
|---|---|
| Güvenlik | ${cnt("güvenlik")} |
| Performans | ${cnt("performans")} |
| Kalite | ${cnt("kalite")} |

Bu sezgisel taramadır (regex); yanlış pozitif olabilir. Gerçek açıklar ve ayrıntılı bulgular [[BACKLOG]] içinde doğrulanmış olarak tutulur. Bağımlılık açıkları \`npm audit\` ve CodeQL/gitleaks ile ayrıca taranır ([[ci-cd]]).

## Önceki taramaya göre
- Yeni/artan: ${added.length ? added.map((g) => `\`${g.id}\` ${g.file}`).slice(0, 15).join(", ") : "yok"}
- Giderilen: ${resolved.length ? resolved.map((k) => `\`${k.split("|").join(" ")}\``).slice(0, 15).join(", ") : "yok"}

${section("Güvenlik", "güvenlik")}
${section("Performans", "performans")}
${section("Kalite ve arayüz", "kalite")}
## Ölçümler
- En büyük kaynak dosyalar: ${sizes.slice(0, 6).map((s) => `\`${s.f}\` ${s.n}`).join(", ")}
- Üretim paketi (dist varsa): ${distAssets.length ? `toplam JS ${initialKb} KB; en büyük: ${distAssets.slice(0, 4).map((a) => `${a.f} ${a.kb} KB`).join(", ")}` : "dist yok (\`npm run build\` sonrası dolar)"}
`;

writeFileSync(join(ROOT, OUT), md);
writeFileSync(join(ROOT, BASE), JSON.stringify({ date, items: cur }, null, 1) + "\n");
if (!quiet) console.log(`AUDIT.md güncellendi — güvenlik: ${cnt("güvenlik")} | performans: ${cnt("performans")} | kalite: ${cnt("kalite")}`);
