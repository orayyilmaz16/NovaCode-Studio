#!/usr/bin/env node
// Proje beyni: docs/brain/STATE.md dosyasını koddan üretir ve beynin tutarlılığını denetler.
//   node scripts/brain.mjs            → STATE.md'yi yeniden üretir (hook her Claude turu sonunda çalıştırır)
//   node scripts/brain.mjs --check    → yapıyı denetler (bağlantılar, aksiyon başlıkları, IPC, i18n); hata varsa çıkış kodu 1
//   --quiet                           → çıktıyı bastırır
// Yapay zekâ çağrısı yoktur; tamamen deterministiktir ve ağa çıkmaz.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = process.cwd();
const BRAIN_DIR = join(ROOT, "docs", "brain");
const STATE_FILE = join(BRAIN_DIR, "STATE.md");
const args = new Set(process.argv.slice(2));
const quiet = args.has("--quiet");
const say = (...m) => { if (!quiet) console.log(...m); };

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const exists = (p) => existsSync(join(ROOT, p));
const countLines = (t) => t.split("\n").length - (t.endsWith("\n") ? 1 : 0);

function listFiles(dir, re) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((f) => re.test(f) && statSync(join(abs, f)).isFile())
    .sort()
    .map((f) => `${dir}/${f}`);
}

function walkMd(dir) {
  const out = [];
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return out;
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...walkMd(rel));
    else if (e.name.endsWith(".md")) out.push(rel);
  }
  return out.sort();
}

// ---------- md dizini ----------
const rootMd = listFiles(".", /\.md$/).map((p) => p.replace(/^\.\//, ""));
const brainMd = walkMd("docs/brain");
const mdIndex = new Map(); // ad -> yol
const errors = [];
const warnings = [];
for (const p of [...rootMd, ...brainMd]) {
  const name = basename(p, ".md");
  if (mdIndex.has(name)) errors.push(`Aynı ad iki md dosyasında: ${name} (${mdIndex.get(name)}, ${p})`);
  else mdIndex.set(name, p);
}

function parseFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text.replace(/\r\n/g, "\n"));
  if (!m) return null;
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const v = kv[2].trim();
    if (v.startsWith("[")) {
      out[kv[1]] = v.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else {
      out[kv[1]] = v.replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

// ---------- STATE üretimi ----------
const pkg = JSON.parse(read("package.json"));
const dep = (n) => pkg.dependencies?.[n] ?? pkg.devDependencies?.[n] ?? "—";

function fileTable(title, files) {
  if (!files.length) return "";
  const rows = files.map((f) => `| \`${f}\` | ${countLines(read(f))} |`).join("\n");
  return `### ${title}\n| Dosya | Satır |\n|---|---|\n${rows}\n`;
}

const mainFiles = listFiles(".", /^electron-.*\.cjs$/).map((p) => p.replace(/^\.\//, ""));
const mainSrc = mainFiles.map((f) => ({ f, text: read(f) }));
const handles = new Map(); // kanal -> dosya
const sends = new Set();
for (const { f, text } of mainSrc) {
  for (const m of text.matchAll(/ipcMain\.handle\(\s*'([^']+)'/g)) handles.set(m[1], f);
  for (const m of text.matchAll(/webContents\.send\(\s*'([^']+)'/g)) sends.add(m[1]);
  for (const m of text.matchAll(/sendTerm\(\s*'([^']+)'/g)) sends.add(m[1]);
  for (const m of text.matchAll(/\bsend\(\s*'([^']+)'/g)) sends.add(m[1]);
}
const preload = exists("electron-preload.cjs") ? read("electron-preload.cjs") : "";
const invokes = new Set([...preload.matchAll(/ipcRenderer\.invoke\(\s*'([^']+)'/g)].map((m) => m[1]));
const listens = new Set([...preload.matchAll(/ipcRenderer\.on\(\s*'([^']+)'/g)].map((m) => m[1]));
for (const c of invokes) if (!handles.has(c)) errors.push(`IPC: preload '${c}' çağırıyor ama ana süreçte handler yok`);
for (const c of handles.keys()) if (!invokes.has(c)) warnings.push(`IPC: '${c}' ana süreçte var ama preload'da açılmamış`);
for (const c of listens) if (!sends.has(c)) errors.push(`IPC: preload '${c}' olayını dinliyor ama ana süreç göndermiyor`);

function ipcSection() {
  const groups = new Map();
  for (const [c, f] of [...handles.entries()].sort()) {
    const g = c.includes(":") ? c.split(":")[0] : "diğer";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(`\`${c}\``);
  }
  const rows = [...groups.entries()].map(([g, list]) => `| ${g} | ${list.join(", ")} |`).join("\n");
  return `| Grup | Kanallar |\n|---|---|\n${rows}\n\n**Olaylar (ana süreç → arayüz):** ${[...sends].sort().map((c) => `\`${c}\``).join(", ") || "—"}\n`;
}

// ---------- i18n ----------
const LANGS = ["tr", "en", "de", "ru", "ar", "es", "fr", "az"];
let i18nKeys = 0;
// Metinler iki dosyada: uiText.ts (ana paket) ve uiTextAi.ts (AI paneli + ayarlar, gecikmeli yüklenir)
const readUiTexts = () => ["src/i18n/uiText.ts", "src/i18n/uiTextAi.ts", "src/i18n/uiTextDev.ts", "src/i18n/uiTextScm.ts"].filter(exists).map(read).join("\n").replace(/\r\n/g, "\n");
if (exists("src/i18n/uiText.ts")) {
  const ui = readUiTexts();
  for (const m of ui.matchAll(/^  (\w+): \{\n([\s\S]*?)\n  \},/gm)) {
    i18nKeys++;
    const found = new Set([...m[2].matchAll(/\b(tr|en|de|ru|ar|es|fr|az):\s*['"`]/g)].map((x) => x[1]));
    const missing = LANGS.filter((l) => !found.has(l));
    if (missing.length) errors.push(`i18n: '${m[1]}' anahtarında eksik dil: ${missing.join(", ")}`);
  }
}

// ---------- Ayar şeması (src/services/settingsSchema.json: tek kaynak) ----------
const uiTextSrc = exists("src/i18n/uiText.ts") ? readUiTexts() : "";
const uiKeys = new Map(); // anahtar -> Türkçe metin
for (const m of uiTextSrc.matchAll(/^  (\w+): \{\n([\s\S]*?)\n  \},/gm)) {
  const tr = /\btr:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/.exec(m[2]);
  uiKeys.set(m[1], tr ? tr[2].replace(/\\(.)/g, "$1") : "");
}
const schema = exists("src/services/settingsSchema.json") ? JSON.parse(read("src/services/settingsSchema.json")) : { categories: [], settings: [] };

function validateSchema() {
  const catIds = new Set(schema.categories.map((c) => c.id));
  const ids = new Set();
  const need = (key, where) => { if (!uiKeys.has(key)) errors.push(`ayar şeması: ${where} için i18n anahtarı yok: ${key}`); };
  for (const c of schema.categories) need(c.labelKey, `kategori ${c.id}`);
  for (const s of schema.settings) {
    if (ids.has(s.id)) errors.push(`ayar şeması: yinelenen id ${s.id}`);
    ids.add(s.id);
    if (!catIds.has(s.category)) errors.push(`ayar şeması: ${s.id} bilinmeyen kategori '${s.category}'`);
    need(`set_${s.id}`, s.id);
    if (s.desc) need(`setDesc_${s.id}`, `${s.id} açıklaması`);
    for (const o of s.options ?? []) if (o.labelKey) need(o.labelKey, `${s.id} seçeneği`);
    const t = s.type;
    if (t === "toggle" && typeof s.default !== "boolean") errors.push(`ayar şeması: ${s.id} varsayılanı boolean olmalı`);
    if (t === "slider" && !(typeof s.default === "number" && s.default >= s.min && s.default <= s.max)) errors.push(`ayar şeması: ${s.id} varsayılanı min/max dışında`);
    if ((t === "select" || t === "accent") && !(s.options ?? []).some((o) => o.value === s.default)) errors.push(`ayar şeması: ${s.id} varsayılanı seçeneklerde yok`);
    if (t === "text" && typeof s.default !== "string") errors.push(`ayar şeması: ${s.id} varsayılanı metin olmalı`);
    if (s.showWhen && !schema.settings.some((x) => x.id === s.showWhen.id)) errors.push(`ayar şeması: ${s.id} showWhen bilinmeyen ayara bağlı`);
  }
  for (const k of ["setTitle", "setSearch", "setAutoSaved"]) need(k, "ayarlar sayfası");
}

function settingsSection() {
  if (!schema.settings.length) return "—\n";
  const cat = new Map(schema.categories.map((c) => [c.id, uiKeys.get(c.labelKey) || c.id]));
  const rows = schema.settings.map((s) => {
    let range = "";
    if (s.type === "slider") range = `${s.min}–${s.max}${s.unit ? " " + s.unit : ""}`;
    else if (s.options) range = s.options.map((o) => o.value).join(", ");
    else if (s.type === "text") range = `≤${s.maxLength ?? 200} karakter`;
    return `| ${cat.get(s.category)} | \`${s.id}\` | ${uiKeys.get(`set_${s.id}`) || ""} | ${s.type} | \`${JSON.stringify(s.default)}\` | ${range} |`;
  });
  return `${schema.settings.length} ayar, ${schema.categories.length} kategori. Tek kaynak: \`src/services/settingsSchema.json\`. Ekleme kuralı: [[settings]].\n\n| Kategori | Kimlik | Ad (tr) | Tür | Varsayılan | Aralık / seçenekler |\n|---|---|---|---|---|---|\n${rows.join("\n")}\n`;
}

// ---------- İş akışları ----------
function workflows() {
  const out = [];
  for (const f of listFiles(".github/workflows", /\.ya?ml$/)) {
    const lines = read(f).replace(/\r\n/g, "\n").split("\n");
    const title = (lines.find((l) => /^name:/.test(l)) ?? "").replace(/^name:\s*/, "").replace(/^["']|["']$/g, "");
    const jobs = [];
    let inJobs = false;
    for (let i = 0; i < lines.length; i++) {
      if (/^jobs:\s*$/.test(lines[i])) { inJobs = true; continue; }
      if (inJobs && /^\S/.test(lines[i])) inJobs = false;
      const j = inJobs ? /^  (\w[\w-]*):\s*$/.exec(lines[i]) : null;
      if (j) {
        const nm = /^    name:\s*(.*)$/.exec(lines[i + 1] ?? "");
        jobs.push(`\`${j[1]}\`${nm ? ` (${nm[1].replace(/^["']|["']$/g, "")})` : ""}`);
      }
    }
    out.push(`| \`${f}\` | ${title} | ${jobs.join(", ") || "—"} |`);
  }
  return out.length ? `| Dosya | Ad | İşler |\n|---|---|---|\n${out.join("\n")}\n` : "—\n";
}

function mdMap() {
  const rows = [];
  for (const [name, p] of [...mdIndex.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const text = read(p);
    const fm = parseFrontmatter(text);
    const heading = (/^# (.+)$/m.exec(text.replace(/^---\n[\s\S]*?\n---\n/, "")) ?? [])[1] ?? name;
    rows.push(`| [[${name}]] | \`${p}\` | ${fm?.purpose ?? heading} |`);
  }
  return `| Ad | Yol | Amaç |\n|---|---|---|\n${rows.join("\n")}\n`;
}

function buildState() {
  const scriptsTable = Object.entries(pkg.scripts ?? {}).map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join("\n");
  return [
    "# Proje durumu (otomatik üretilir)",
    "",
    "> Bu dosya `scripts/brain.mjs` tarafından koddan üretilir; **elle düzenleme**. Yenilemek için `npm run brain`. Bkz. [[BRAIN]].",
    "",
    "## Sürümler",
    `- Uygulama: **${pkg.version}**`,
    `- Electron ${dep("electron")} · React ${dep("react")} · Vite ${dep("vite")} · TypeScript ${dep("typescript")} · Tailwind ${dep("tailwindcss")}`,
    `- Monaco: \`@monaco-editor/react\` ${dep("@monaco-editor/react")}, \`monaco-editor\` ${dep("monaco-editor")}`,
    `- GitHub OAuth Client ID tanımlı: ${pkg.novaGithubClientId ? "evet" : "hayır"}`,
    "",
    "## npm betikleri",
    "| Betik | Komut |",
    "|---|---|",
    scriptsTable,
    "",
    "## Dosya haritası",
    fileTable("Ana süreç ve preload", [...mainFiles, "electron-preload.cjs"].filter((f, i, a) => exists(f) && a.indexOf(f) === i)),
    fileTable("Arayüz kabuğu", ["src/App.tsx", "src/main.tsx", "src/types.ts"].filter(exists)),
    fileTable("Bileşenler", listFiles("src/components", /\.tsx$/)),
    fileTable("Servisler", listFiles("src/services", /\.tsx?$/)),
    fileTable("i18n", listFiles("src/i18n", /\.ts$/)),
    fileTable("Betikler", listFiles("scripts", /\.(mjs|cjs)$/)),
    fileTable("Testler", listFiles("scripts/tests", /\.(mjs|cjs)$/)),
    fileTable("Sunucu", listFiles("server", /\.mjs$/)),
    "## IPC kanalları",
    ipcSection(),
    "## i18n",
    `- ${i18nKeys} anahtar; her biri ${LANGS.length} dilde (${LANGS.join(", ")}) dolu olmalı. Denetim: \`npm run brain:check\`.`,
    "",
    "## Ayarlar",
    settingsSection(),
    "## GitHub Actions",
    workflows(),
    "## Md haritası",
    mdMap()
  ].join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}

const state = buildState();
const current = existsSync(STATE_FILE) ? readFileSync(STATE_FILE, "utf8").replace(/\r\n/g, "\n") : "";

// ---------- Denetim ----------
function check() {
  const REQUIRED = ["action", "purpose", "reads", "writes"];
  const link = /\[\[([^\]|#]+)\]\]/g;
  const actionFiles = brainMd.filter((p) => p.startsWith("docs/brain/actions/"));

  for (const p of actionFiles) {
    const fm = parseFrontmatter(read(p));
    if (!fm) { errors.push(`${p}: başında frontmatter yok`); continue; }
    for (const k of REQUIRED) if (!(k in fm)) errors.push(`${p}: '${k}' alanı eksik`);
    if (fm.action && fm.action !== basename(p, ".md")) errors.push(`${p}: action alanı dosya adıyla aynı olmalı (${fm.action})`);
    for (const k of ["reads", "writes"]) {
      for (const ref of fm[k] ?? []) if (!mdIndex.has(ref)) errors.push(`${p}: ${k} içindeki '${ref}' bir md dosyasına çözülmüyor`);
    }
  }

  for (const p of brainMd) {
    for (const m of read(p).matchAll(link)) {
      if (!mdIndex.has(m[1].trim())) errors.push(`${p}: [[${m[1]}]] bağlantısı çözülmüyor`);
    }
  }

  const brainIndex = exists("docs/brain/BRAIN.md") ? read("docs/brain/BRAIN.md") : "";
  for (const p of actionFiles) {
    const n = basename(p, ".md");
    if (!brainIndex.includes(`[[${n}]]`)) errors.push(`BRAIN.md aksiyonu listelemiyor: ${n}`);
  }
  for (const req of ["CLAUDE", "AGENT"]) if (!mdIndex.has(req)) errors.push(`Kök dosya yok: ${req}.md`);

  validateSchema();
  if (current !== state) warnings.push("STATE.md güncel değil (npm run brain ile yenile)");
}

// ---------- Çalıştır ----------
if (args.has("--check")) {
  check();
  for (const w of warnings) say(`uyarı: ${w}`);
  for (const e of errors) console.error(`HATA: ${e}`);
  if (errors.length) {
    console.error(`\nBeyin denetimi başarısız (${errors.length} hata).`);
    process.exit(1);
  }
  say(`Beyin denetimi tamam: ${mdIndex.size} md, ${i18nKeys} i18n anahtarı, ${handles.size} IPC kanalı.`);
} else {
  if (!existsSync(BRAIN_DIR)) mkdirSync(BRAIN_DIR, { recursive: true });
  if (current !== state) {
    writeFileSync(STATE_FILE, state);
    say("STATE.md güncellendi.");
  } else {
    say("STATE.md zaten güncel.");
  }
  for (const e of errors) say(`uyarı (yapı): ${e}`); // üretim modunda sert hata verme: hook'u engellemesin
}
