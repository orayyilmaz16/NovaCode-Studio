#!/usr/bin/env node
// Sürüm otomasyonu (tek giriş): sürüm düzeyini belirler, sürüm dosyalarını yazar, etiket kararını verir.
// Kural ve gerekçe: docs/brain/actions/versioning.md
//
//   node scripts/release.mjs plan                   → ne olurdu? (hiçbir şeyi değiştirmez)
//   node scripts/release.mjs prepare [--level L]    → sürümü hazırlar: package.json(+lock), CHANGELOG, release-notes/vX.Y.Z.md,
//                                                     docs/brain/VERSIONS.md, CLAUDE.md/AGENT.md sürüm blokları. Yerelde Stop hook çalıştırır.
//   node scripts/release.mjs tag                    → CI: package.json sürümü için etiket atılmalı mı? (GITHUB_OUTPUT: version, release, tag_message_file)
//   node scripts/release.mjs history                → VERSIONS.md'de eksik etiket satırlarını tamamlar
//
// Neden yerelde hazırlanır? main korumalıdır (PR zorunlu): CI botu main'e commit atamaz. Sürüm değişikliği bu yüzden PR'ın içinde gelir;
// birleşince CI yalnız etiketi atar ve GitHub Release'i çıkarır (commit yok, döngü yok).
//
// Sürüm düzeyi (SemVer): CHANGELOG `## Unreleased` maddelerinin etiketlerinden gelir ( [breaking] → MAJOR, [feat] → MINOR, diğerleri → PATCH ),
// ayrıca commit'lerde `feat!:` / `BREAKING CHANGE:` (MAJOR) ve `feat:` (MINOR). Madde yoksa sürüm çıkmaz. `--level` yalnız yükseltir.
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const MODE = process.argv[2] || "plan";
const ARGS = process.argv.slice(3);
const argVal = (k) => { const i = ARGS.indexOf(k); return i >= 0 ? ARGS[i + 1] : undefined; };

const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryGit = (...a) => { try { return git(...a); } catch { return ""; } };
const out = (k, v) => { console.log(`${k}=${v}`); if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); };

// ---------- Sabitler ----------
const TAGS = { breaking: 3, feat: 2, fix: 1, perf: 1, improve: 1, security: 1, docs: 0 };
const LEVEL_NAME = { 1: "patch", 2: "minor", 3: "major" };
const CATS = [
  // [etiketler, tr başlık, en başlık]
  [["breaking"], "Kırıcı değişiklikler", "Breaking changes"],
  [["feat"], "Yeni özellikler", "New features"],
  [["fix"], "Düzeltmeler", "Fixes"],
  [["security"], "Güvenlik", "Security"],
  [["perf", "improve"], "İyileştirmeler", "Improvements"],
  [["docs"], "Belgeler", "Documentation"],
];
const SEMVER_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

const cmp = (a, b) => {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};
const bumpFrom = (v, level) => {
  const [a, b, c] = v.split(".").map(Number);
  return level === 3 ? `${a + 1}.0.0` : level === 2 ? `${a}.${b + 1}.0` : `${a}.${b}.${c + 1}`;
};
const today = () => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`; };

// ---------- Etiketler ----------
function allVersionTags() {
  return tryGit("tag", "--list", "v*").split("\n").map((t) => t.trim()).filter((t) => SEMVER_TAG.test(t)).sort((a, b) => cmp(b.slice(1), a.slice(1)));
}
/** En yüksek SemVer etiketi. `git describe` KULLANILMAZ: etiket main geçmişinde olmayabilir (eski sürümlerde öyleydi). */
const lastTagOf = () => allVersionTags()[0] || "";

// ---------- CHANGELOG ----------
function parseUnreleased(changelog) {
  const m = /## Unreleased\n([\s\S]*?)(?=\n## |$)/.exec(changelog);
  const body = m ? m[1] : "";
  const bullets = (lang) => {
    const block = new RegExp(`### ${lang}\\n([\\s\\S]*?)(?=\\n### |$)`).exec(body)?.[1] ?? "";
    return block.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => {
      const raw = l.slice(2);
      const t = /^\[(\w+)\]\s*/.exec(raw);
      const tag = t && t[1] in TAGS ? t[1] : "improve"; // etiketsiz madde = iyileştirme (patch)
      return { tag, tagged: !!(t && t[1] in TAGS), text: t && t[1] in TAGS ? raw.slice(t[0].length) : raw };
    });
  };
  return { tr: bullets("tr"), en: bullets("en") };
}

function levelFromBullets(b) {
  return Math.max(0, ...[...b.tr, ...b.en].map((x) => TAGS[x.tag]));
}

function levelFromCommits(lastTag) {
  if (!lastTag) return 0;
  let range = `${lastTag}..HEAD`;
  // Etiket HEAD'in atası değilse (squash/yeniden yazım) ortak atadan başla
  if (!tryGit("merge-base", "--is-ancestor", lastTag, "HEAD") && tryGit("rev-parse", "-q", "--verify", lastTag)) {
    const mb = tryGit("merge-base", lastTag, "HEAD");
    range = mb ? `${mb}..HEAD` : "";
  }
  if (!range) return 0;
  const raw = tryGit("log", range, "--format=%s%n%b%x00");
  let level = 0;
  for (const c of raw.split("\0").map((x) => x.trim()).filter(Boolean)) {
    const subject = c.split("\n")[0];
    if (/^chore\(release\)/.test(subject)) continue;
    const m = /^(\w+)(\([^)]*\))?(!)?:/.exec(subject);
    if (m?.[3] || /BREAKING CHANGE:/.test(c)) level = 3;
    else if (m?.[1] === "feat" && m?.[2] !== "(auto)") level = Math.max(level, 2);
  }
  return level;
}

// ---------- Plan ----------
function plan() {
  const pkg = JSON.parse(read("package.json"));
  const lastTag = lastTagOf();
  const last = lastTag ? lastTag.slice(1) : "";
  const changelog = existsSync("CHANGELOG.md") ? read("CHANGELOG.md") : "# Changelog\n";
  const b = parseUnreleased(changelog);
  const count = Math.max(b.tr.length, b.en.length);
  const warns = [];
  if (b.tr.length !== b.en.length) warns.push(`TR (${b.tr.length}) ve EN (${b.en.length}) madde sayısı farklı`);
  const untagged = [...b.tr, ...b.en].filter((x) => !x.tagged).length;
  if (untagged) warns.push(`${untagged} etiketsiz madde (iyileştirme/patch sayıldı; [feat] [fix] [improve] [perf] [security] [breaking] [docs] kullan)`);

  const base = { current: pkg.version, last, bullets: { tr: b.tr.length, en: b.en.length }, warns };
  if (!count) return { ...base, action: "none", reason: "CHANGELOG Unreleased boş: sürüm çıkmaz" };

  // Hazırlanmış ama henüz etiketlenmemiş sürüm (PR birleşmeyi bekliyor): yenisini üst üste bindirme
  if (last && cmp(pkg.version, last) > 0) return { ...base, action: "pending", reason: `v${pkg.version} hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır` };

  const forced = { patch: 1, minor: 2, major: 3 }[argVal("--level")] || 0;
  const level = Math.max(levelFromBullets(b), levelFromCommits(lastTag), forced);
  if (level === 0) return { ...base, action: "none", reason: "yalnız belge maddeleri ([docs]): sürüm çıkmaz" };
  const from = last || pkg.version;
  const next = bumpFrom(from, level);
  return { ...base, action: "release", level, levelName: LEVEL_NAME[level], next, from, bulletsData: b };
}

// ---------- Çıktı üretimi ----------
const firstSentence = (s) => {
  const bold = /^\*\*(.+?)\*\*/.exec(s);
  const t = (bold ? bold[1] : s).replace(/[:.]\s*$/, "");
  return t.length > 110 ? t.slice(0, 107).trimEnd() + "…" : t;
};

function renderGroups(items, lang) {
  const idx = lang === "tr" ? 1 : 2;
  const lines = [];
  for (const [tags, ...titles] of CATS) {
    const hit = items.filter((x) => tags.includes(x.tag));
    if (!hit.length) continue;
    lines.push(`#### ${titles[idx - 1]}`, ...hit.map((x) => `- ${x.text}`), "");
  }
  return lines.join("\n").trimEnd();
}

function summaryCounts(b) {
  const n = (tags, arr) => arr.filter((x) => tags.includes(x.tag)).length;
  const en = b.en.length ? b.en : b.tr;
  const parts = [];
  if (n(["breaking"], en)) parts.push(`${n(["breaking"], en)} breaking`);
  if (n(["feat"], en)) parts.push(`${n(["feat"], en)} new`);
  if (n(["fix"], en)) parts.push(`${n(["fix"], en)} fix`);
  if (n(["perf", "improve"], en)) parts.push(`${n(["perf", "improve"], en)} improved`);
  if (n(["security"], en)) parts.push(`${n(["security"], en)} security`);
  return parts.join(", ") || "update";
}

function replaceBlock(file, name, content) {
  if (!existsSync(file)) return false;
  const s = read(file);
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(s)) return false;
  writeFileSync(file, s.replace(re, (_m, a, z) => `${a}\n${content}\n${z}`));
  return true;
}

const VERSIONS = "docs/brain/VERSIONS.md";
const VERSIONS_HEAD = [
  "# Sürüm geçmişi (otomatik)",
  "",
  "`scripts/release.mjs` yazar; **elle düzenleme**. Her satır bir GitHub etiketidir (`vX.Y.Z`). Tür: **major** (kırıcı), **minor** (yeni özellik), **patch** (düzeltme/iyileştirme). Kurallar: [[versioning]]. Sürüm notları: `release-notes/`; kullanıcı metni: [[CHANGELOG]].",
  "",
  "| Sürüm | Tarih | Tür | Özet | Notlar |",
  "|---|---|---|---|---|",
].join("\n");

function versionRow(v, date, type, summary) {
  const notes = existsSync(`release-notes/v${v}.md`) ? `[v${v}](../../release-notes/v${v}.md)` : "—";
  return `| v${v} | ${date} | ${type} | ${summary} | ${notes} |`;
}

function readVersions() {
  const s = existsSync(VERSIONS) ? read(VERSIONS) : VERSIONS_HEAD + "\n";
  const lines = s.split("\n");
  const start = lines.findIndex((l) => l.startsWith("|---"));
  const rows = start >= 0 ? lines.slice(start + 1).filter((l) => /^\| v\d/.test(l)) : [];
  return rows;
}
function writeVersions(rows) {
  const sorted = [...new Set(rows)].sort((a, b) => cmp(/^\| v([\d.]+)/.exec(b)[1], /^\| v([\d.]+)/.exec(a)[1]));
  mkdirSync("docs/brain", { recursive: true });
  writeFileSync(VERSIONS, VERSIONS_HEAD + "\n" + sorted.join("\n") + "\n");
}

/** Etiketlerden eksik satırları tamamlar (geçmiş sürümler). Mevcut satırlara dokunmaz. */
function syncHistory() {
  const rows = readVersions();
  const have = new Set(rows.map((r) => /^\| v([\d.]+)/.exec(r)[1]));
  const tags = allVersionTags().sort((a, b) => cmp(a.slice(1), b.slice(1)));
  let prev = "";
  for (const t of tags) {
    const v = t.slice(1);
    if (!have.has(v)) {
      const date = (tryGit("log", "-1", "--format=%cd", "--date=format:%d.%m.%Y", t) || "—");
      const [a, b, c] = v.split(".").map(Number);
      const [pa, pb] = prev ? prev.split(".").map(Number) : [a, b];
      const type = !prev ? "—" : a > pa ? "major" : b > pb ? "minor" : "patch";
      rows.push(versionRow(v, date, type, "geçmiş sürüm (otomasyondan önce)"));
      void c;
    }
    prev = v;
  }
  writeVersions(rows);
}

function applyPrepare(p) {
  const { next, levelName, bulletsData: b } = p;
  const date = today();

  // package.json + lock
  const pkg = JSON.parse(read("package.json"));
  pkg.version = next;
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  if (existsSync("package-lock.json")) {
    const lock = JSON.parse(read("package-lock.json"));
    lock.version = next;
    if (lock.packages?.[""]) lock.packages[""].version = next;
    writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
  }

  // Notlar (TR + EN, kategorili)
  const tr = b.tr.length ? b.tr : b.en;
  const en = b.en.length ? b.en : b.tr;
  const trTxt = renderGroups(tr, "tr");
  const enTxt = renderGroups(en, "en");
  mkdirSync("release-notes", { recursive: true });
  writeFileSync(`release-notes/v${next}.md`, [`# NovaCode Studio v${next}`, "", `**${levelName[0].toUpperCase()}${levelName.slice(1)} sürümü / ${levelName} release** · ${date}`, "", "## Türkçe", trTxt, "", "## English", enTxt, ""].join("\n"));

  // CHANGELOG: yeni sürüm bölümü + boş Unreleased
  const raw = read("CHANGELOG.md");
  const section = [`## ${next} - ${date}`, `<!-- level: ${levelName} -->`, "### Türkçe", trTxt, "", "### English", enTxt].join("\n");
  const rest = raw.replace(/^# Changelog\s*/, "").replace(/## Unreleased[\s\S]*?(?=\n## |$)/, "").trim();
  writeFileSync("CHANGELOG.md", `# Changelog\n\n## Unreleased\n\n### tr\n\n### en\n\n${section}\n\n${rest}`.trimEnd() + "\n");

  // Beyin: sürüm geçmişi
  syncHistory();
  const rows = readVersions().filter((r) => !r.startsWith(`| v${next} `));
  rows.push(versionRow(next, date, levelName, `${summaryCounts({ tr, en })}: ${firstSentence([...en].sort((x, y) => CATS.findIndex(([t]) => t.includes(x.tag)) - CATS.findIndex(([t]) => t.includes(y.tag)))[0]?.text ?? "update")}`));
  writeVersions(rows);

  // Ajan sözleşmeleri: CLAUDE.md ve AGENT.md sürüm blokları
  const link = `\`release-notes/v${next}.md\``;
  replaceBlock("CLAUDE.md", "version", `Güncel sürüm: **v${next}** (${levelName}, ${date}) · notlar: ${link} · geçmiş: \`docs/brain/VERSIONS.md\` · kural: \`docs/brain/actions/versioning.md\`. Bu blok \`scripts/release.mjs\` ile otomatik güncellenir, elle yazma.`);
  // Özette önem sırası: kırıcı > yeni özellik > düzeltme > güvenlik > iyileştirme (aynı kategoride yazım sırası korunur)
  const rank = (x) => CATS.findIndex(([t]) => t.includes(x.tag));
  const ranked = [...tr].sort((x, y) => rank(x) - rank(y));
  const top = ranked.slice(0, 5).map((x) => `- ${CATS[rank(x)][1]}: ${firstSentence(x.text)}`);
  replaceBlock("AGENT.md", "release", [`**Son sürüm v${next}** (${levelName}, ${date}) · notlar ${link} · geçmiş \`docs/brain/VERSIONS.md\` · otomatik güncellenir`, ...top, ...(tr.length > 5 ? [`- … ve ${tr.length - 5} madde daha (${link})`] : [])].join("\n"));
}

// ---------- Kipler ----------
if (MODE === "plan" || MODE === "prepare") {
  const p = plan();
  const show = { action: p.action, current: p.current, last: p.last || "—", next: p.next, level: p.levelName, bullets: p.bullets, reason: p.reason, warns: p.warns };
  if (MODE === "plan") { console.log(JSON.stringify(show, null, 2)); process.exit(0); }
  if (p.action !== "release") { console.log(`sürüm: ${p.reason}`); process.exit(0); }
  applyPrepare(p);
  console.log(`sürüm hazırlandı: v${p.from} → v${p.next} (${p.levelName})${p.warns.length ? " · uyarı: " + p.warns.join("; ") : ""}`);
} else if (MODE === "history") {
  syncHistory();
  console.log("VERSIONS.md geçmiş satırları tamamlandı");
} else if (MODE === "tag") {
  // CI: package.json sürümü için etiket yoksa ve notlar hazırsa etiketle. Commit/push yok (main korumalı).
  const v = JSON.parse(read("package.json")).version;
  const tagName = `v${v}`;
  const exists = !!tryGit("rev-parse", "-q", "--verify", `refs/tags/${tagName}`);
  const notes = `release-notes/${tagName}.md`;
  const hasNotes = existsSync(notes);
  out("version", v);
  if (exists) { out("release", "false"); out("reason", "etiket zaten var"); }
  else if (!hasNotes) { out("release", "false"); out("reason", `${notes} yok: sürüm hazırlanmamış`); }
  else { out("release", "true"); out("tag_message_file", notes); }
} else {
  console.error("kullanım: release.mjs plan|prepare|tag|history");
  process.exit(2);
}
