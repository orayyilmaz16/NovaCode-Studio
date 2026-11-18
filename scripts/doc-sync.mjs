#!/usr/bin/env node
// Belge otomasyonu: her istemde hatırlatır, her tur sonunda "kod değişti ama beyin güncellenmedi" durumunu yakalar,
// değişiklik günlüğünü (docs/brain/LOG.md) kendisi yazar. Kural: docs/brain/actions/doc-sync.md
//
// Kullanım (hook'lar .claude/settings.json içinde):
//   node scripts/doc-sync.mjs prompt   → UserPromptSubmit: Claude'a belgeleme kuralını hatırlatır (bağlama ekler).
//   node scripts/doc-sync.mjs stop     → Stop: denetle → günlüğe yaz → scripts/auto-commit.mjs'i çalıştır.
//   node scripts/doc-sync.mjs check    → yalnız denetim, sonucu yazdırır (elle/test için; hiçbir şeyi değiştirmez).
//
// Davranış (stop):
//  - Kod değişmişse (src/, electron-*, server/, scripts/, .github/) ve gereken belge güncellenmemişse tur BİR KEZ engellenir
//    (decision: block); Claude eksik belgeyi yazıp tekrar bitirir. İkinci kez (stop_hook_active) engellenmez: döngü yok, eksik günlüğe işlenir.
//  - Engellenirse auto-commit çalışmaz (yarım belgeli commit çıkmaz); belgeler tamamlanınca sonraki Stop'ta gider.
//  - Günlüğe istem METNİ yazılmaz (gizli bilgi/kişisel veri riski, KVKK); yalnız dosya yolları, alanlar ve belge durumu.
//  - Belge tamamsa sürüm de hazırlanır (scripts/release.mjs prepare; kapatmak için NOVA_RELEASE=off).
// Kapatmak için: NOVA_DOCSYNC=off
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const MODE = process.argv[2] || "check";
const OFF = process.env.NOVA_DOCSYNC === "off";
const LOG = "docs/brain/LOG.md";
const MAX_ENTRIES = 40;

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trimEnd();
const tryRun = (cmd, args) => { try { return run(cmd, args); } catch { return ""; } };
const RISKY = /(^|\/)(\.env(\..*)?|.*\.(pem|key|pfx|p12)|id_rsa.*|credentials.*)$/i;

// ---------- Sınıflandırma ----------
const isCode = (f) => /^(src\/|server\/|electron-[^/]+\.cjs$|scripts\/|\.github\/)/.test(f);
const isUi = (f) => /^(src\/|electron-[^/]+\.cjs$|server\/)/.test(f) && !/\.test\.[cm]?[jt]sx?$/.test(f);
const isGenerated = (f) => f === "docs/brain/STATE.md" || f === "docs/brain/AUDIT.md" || f === LOG;
const isDoc = (f) => /^(CHANGELOG\.md|AGENT\.md|CLAUDE\.md|docs\/brain\/.+\.md)$/.test(f) && !isGenerated(f);
const isBrainDoc = (f) => /^(AGENT\.md|CLAUDE\.md|docs\/brain\/(actions\/.+|DECISIONS|PROJECT|BRAIN)\.md)$/.test(f);

// Yol → aksiyon dosyası (öneri için). İlk eşleşen kazanır.
const AREAS = [
  [/aiCompletion|CompletionMenu|CompletionIcon|electron-ai|AIAssistant|ModelMenu/, "ai-assistant"],
  [/electron-git|electron-github|GitPanel|BranchPicker/, "git-github"],
  [/settings|Settings|settingsSchema/, "settings"],
  [/FileTree|explorer/i, "explorer"],
  [/Terminal|electron-pty|electron-term/i, "terminal"],
  [/electron-ext|Extension/, "extensions"],
  [/CommandPalette|electron-search/, "search-palette"],
  [/debug/i, "debugging"],
  [/lsp/i, "lsp"],
  [/Preview/, "preview"],
  [/style\.css|motion/i, "motion"],
  [/i18n|uiText/, "i18n"],
  [/UpdateDialog|UpdateIndicator|electron-update/i, "updates"],
  [/textbuffer|text-buffer|TextBuffer/i, "text-buffer"],
  [/Diff|source-control|Problems/, "source-control"],
  [/release\.mjs|release\.test|check-version/, "versioning"],
  [/^\.github\/|check-bundle/, "ci-cd"],
  [/scripts\/tests\//, "testing"],
  [/electron-main|electron-preload|electron-secrets/, "security-kvkk"],
  [/^scripts\/audit-scan/, "audit"],
  [/^scripts\/(brain|doc-sync|auto-commit)/, "brain-maintenance"],
  [/.*/, "ui-design"],
];
const areaOf = (f) => AREAS.find(([re]) => re.test(f))[1];

// ---------- Değişiklikler (commit edilmemiş: bu turun işi) ----------
function changedFiles() {
  const out = tryRun("git", ["-c", "core.quotepath=off", "status", "--porcelain", "-uall"]);
  const files = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    let p = line.slice(3).trim();
    if (p.includes(" -> ")) p = p.split(" -> ").pop();
    p = p.replace(/^"|"$/g, "").replace(/\\/g, "/");
    if (p) files.push(p);
  }
  return [...new Set(files)];
}

function assess(files) {
  const safe = files.filter((f) => !RISKY.test(f));
  const code = safe.filter(isCode);
  const docs = safe.filter(isDoc);
  const need = [];
  const areas = [...new Set(code.map(areaOf))];
  if (code.length) {
    if (!docs.some(isBrainDoc)) {
      const targets = areas.map((a) => (existsSync(`docs/brain/actions/${a}.md`) ? `docs/brain/actions/${a}.md` : null)).filter(Boolean);
      need.push(`ilgili aksiyon dosyasını güncelle (${targets.length ? targets.join(", ") : "docs/brain/actions/*"}) ve karar varsa docs/brain/DECISIONS.md'ye tarihli kayıt ekle`);
    }
    if (code.some(isUi) && !docs.includes("CHANGELOG.md")) need.push("CHANGELOG.md → `## Unreleased` altında `### tr` ve `### en` maddesi ekle (kullanıcıya görünen değişiklik)");
  }
  return { safe, code, docs, areas, need, hidden: files.length - safe.length };
}

// ---------- Günlük (docs/brain/LOG.md) ----------
const HEAD = [
  "# Değişiklik günlüğü (otomatik)",
  "",
  "`scripts/doc-sync.mjs` her Claude turu sonunda yazar; **elle düzenleme**. Yeniden üretilen [[STATE]] gibi koddan türer, ama yalnız son " + MAX_ENTRIES + " tur tutulur.",
  "İstem metni kaydedilmez (KVKK/gizli bilgi); yalnız dosya yolları, alanlar ve belge durumu. Kural: [[doc-sync]]. Neden/karar için [[DECISIONS]], kullanıcı notu için [[CHANGELOG]].",
  "",
].join("\n");

const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function writeLog(a, status) {
  if (!a.code.length && !a.docs.length) return false; // kayda değer değişiklik yok
  const branch = tryRun("git", ["rev-parse", "--abbrev-ref", "HEAD"]) || "?";
  const list = (xs, n) => xs.slice(0, n).map((x) => "`" + x + "`").join(", ") + (xs.length > n ? ` … (+${xs.length - n})` : "");
  const sig = [...a.code, "|", ...a.docs, "|", status].join(",");
  const entry = [
    `## ${stamp()} · ${branch}`,
    `<!-- sig:${Buffer.from(sig).toString("base64").slice(0, 40)} -->`,
    `- Alan: ${a.areas.length ? a.areas.map((x) => `[[${x}]]`).join(", ") : "—"}`,
    `- Kod (${a.code.length}): ${a.code.length ? list(a.code, 12) : "—"}`,
    `- Belge (${a.docs.length}): ${a.docs.length ? list(a.docs, 8) : "—"}`,
    `- Durum: ${status}`,
    "",
  ].join("\n");

  const prev = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
  const body = prev.includes("\n## ") ? prev.slice(prev.indexOf("\n## ") + 1) : "";
  const entries = body ? body.split(/\n(?=## )/).filter(Boolean) : [];
  if (entries[0] && entries[0].includes(entry.split("\n")[1])) return false; // aynı imza: tekrar yazma
  const next = HEAD + "\n" + [entry, ...entries].slice(0, MAX_ENTRIES).map((e) => e.trimEnd()).join("\n\n") + "\n";
  mkdirSync(dirname(LOG), { recursive: true });
  writeFileSync(LOG, next);
  return true;
}

// ---------- Kipler ----------
const out = (o) => process.stdout.write(JSON.stringify(o));

function readStdin() {
  try { return JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

if (OFF) {
  if (MODE === "stop") { try { execFileSync(process.execPath, ["scripts/auto-commit.mjs"], { stdio: ["ignore", "inherit", "inherit"] }); } catch { /* auto-commit kendi raporunu verir */ } }
  process.exit(0);
}

if (MODE === "prompt") {
  readStdin(); // istem metni okunur ama saklanmaz/yazılmaz
  out({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext:
        "Belgeleme kuralı (otomatik, docs/brain/actions/doc-sync.md): bu istemde kod/ayar/davranış değişirse turu bitirmeden önce " +
        "(1) ilgili docs/brain/actions/<alan>.md, (2) karar varsa docs/brain/DECISIONS.md (tarihli), (3) kullanıcıya görünen değişiklikte CHANGELOG.md `Unreleased` tr+en, " +
        "(4) yeni metinse 8 dil i18n güncelle. Stop hook eksikse turu bir kez engeller. docs/brain/LOG.md ve STATE.md otomatiktir, elle yazma.",
    },
  });
  process.exit(0);
}

const files = changedFiles();
const a = assess(files);

if (MODE === "check") {
  console.log(JSON.stringify({ code: a.code.length, docs: a.docs.length, areas: a.areas, eksik: a.need, gizliAtlandi: a.hidden }, null, 2));
  process.exit(a.need.length ? 1 : 0);
}

if (MODE === "stop") {
  const input = readStdin();
  if (a.need.length && !input.stop_hook_active) {
    out({
      decision: "block",
      reason:
        "Belge otomasyonu: kod değişti ama beyin güncellenmedi. Bitirmeden önce: " + a.need.map((x, i) => `${i + 1}) ${x}`).join("; ") +
        ". Sonra `npm run brain` çalıştır. (docs/brain/LOG.md ve STATE.md otomatik; elle yazma.) Kural: docs/brain/actions/doc-sync.md",
    });
    process.exit(0); // auto-commit çalışmaz: yarım belgeli commit çıkmasın
  }
  let status = a.need.length ? `⚠ eksik belge: ${a.need.map((x) => x.split(" (")[0].split(" →")[0]).join("; ")}` : a.code.length ? "✓ belgelendi" : "✓ yalnız belge değişti";
  // Sürüm hazırlığı: belge tamamsa CHANGELOG Unreleased maddelerinden sürümü hazırlar (package.json, CHANGELOG, release-notes, VERSIONS.md,
  // CLAUDE.md/AGENT.md blokları). Etiketi PR birleşince CI atar. Belgesiz tur sürüm çıkarmaz. Kural: docs/brain/actions/versioning.md
  if (!a.need.length && process.env.NOVA_RELEASE !== "off") {
    const firstLine = (t) => String(t).split(/\r?\n/).find(Boolean) || "";
    try { status += " · " + firstLine(run(process.execPath, ["scripts/release.mjs", "prepare"])); } catch (e) { status += " · sürüm hazırlanamadı: " + firstLine(e.stderr || e.message); }
  }
  try { writeLog(a, status); } catch { /* günlük yazılamadıysa akış durmaz */ }
  try { execFileSync(process.execPath, ["scripts/auto-commit.mjs"], { stdio: ["ignore", "inherit", "inherit"] }); } catch { /* auto-commit kendi raporunu verir */ }
}
