#!/usr/bin/env node
// Her güncelleme PATCH sürümü alır (SemVer). Kırıcı değişiklik (feat!/BREAKING CHANGE) MAJOR artırır.
// Yalnız docs/ci/test commit'leri sürüm çıkarmaz.
// Sürüm notları: CHANGELOG.md içindeki "## Unreleased" bölümü (### tr ve ### en maddeleri).
// Notlar yoksa commit konularından İngilizce not üretilir; Türkçe kısım uyarı olarak yazılır.
// Çıktılar: package.json, package-lock.json, CHANGELOG.md, release-notes/vX.Y.Z.md
// GITHUB_OUTPUT'a version, bumped, release, notes_file yazılır.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";

const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
const out = (k, v) => {
  console.log(`${k}=${v}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
};

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
let lastTag = "";
try {
  lastTag = git("describe", "--tags", "--abbrev=0", "--match", "v[0-9]*.[0-9]*.[0-9]*", "--exclude", "v*-*");
} catch { /* henüz sürüm etiketi yok */ }

// CHANGELOG'dan Unreleased bölümünü oku
const changelogRaw = existsSync("CHANGELOG.md") ? readFileSync("CHANGELOG.md", "utf8") : "# Changelog\n";
const unreleasedMatch = /## Unreleased\s*([\s\S]*?)(?=\n## |$)/.exec(changelogRaw);
const unreleasedBody = unreleasedMatch?.[1] ?? "";
const bullets = (lang) => {
  const re = new RegExp(`### ${lang}\\s*([\\s\\S]*?)(?=\\n### |$)`);
  const block = re.exec(unreleasedBody)?.[1] ?? "";
  return block.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
};
const manualTr = bullets("tr");
const manualEn = bullets("en");

// İlk çalışma: mevcut sürümü etiketle, artırma (kendi sürüm notunu da üretir).
let level = 0; // 1 patch, 3 major
let commitSubjects = [];
if (lastTag) {
  const raw = git("log", `${lastTag}..HEAD`, "--format=%H%n%s%n%b%x00");
  const commits = raw.split("\0").map((c) => c.trim()).filter(Boolean)
    .map((c) => {
      const nl = c.indexOf("\n");
      return { sha: c.slice(0, nl), text: c.slice(nl + 1).trim() };
    })
    .filter((c) => !/^chore\(release\)/.test(c.text));

  for (const { text } of commits) {
    const subject = text.split("\n")[0];
    const m = /^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/.exec(subject);
    const type = m?.[1] ?? "other";
    const breaking = !!m?.[3] || /BREAKING CHANGE:/.test(text);
    if (breaking) level = 3;
    else if (!["docs", "ci", "test"].includes(type)) level = Math.max(level, 1);
    if (!/^chore\(auto\)/.test(subject)) commitSubjects.push(m?.[4] ?? subject);
  }
  if (commits.length && !commitSubjects.length) commitSubjects = ["Otomatik kayıt (oturum değişiklikleri)"];

  if (level === 0) {
    out("version", pkg.version);
    out("bumped", "false");
    out("release", "false");
    out("notes_file", "");
    process.exit(0);
  }
}

const base = lastTag ? lastTag.slice(1).split(".").map(Number) : pkg.version.split(".").map(Number);
const [maj, min, pat] = base;
const next = !lastTag
  ? pkg.version
  : level === 3 ? `${maj + 1}.0.0` : `${maj}.${min}.${pat + 1}`;

if (lastTag) {
  pkg.version = next;
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  if (existsSync("package-lock.json")) {
    const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
    lock.version = next;
    if (lock.packages?.[""]) lock.packages[""].version = next;
    writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
  }
}

// Notlar: manuel TR/EN maddeleri öncelikli; yoksa İngilizce konulardan üret.
const tr = manualTr.length ? manualTr : ["Otomatik güncelleme. Ayrıntılar için İngilizce notlara bakın."];
const en = manualEn.length ? manualEn : (commitSubjects.length ? commitSubjects : ["Automatic update."]).map((s) => s);
const enList = [...new Set(en)].map((s) => `- ${s}`).join("\n");
const trList = [...new Set(tr)].map((s) => `- ${s}`).join("\n");

const date = new Date().toLocaleDateString("tr-TR").replace(/\//g, ".");
const notesDir = "release-notes";
mkdirSync(notesDir, { recursive: true });
const notesFile = `${notesDir}/v${next}.md`;
writeFileSync(notesFile, [
  `# NovaCode Studio v${next}`,
  "",
  "## Türkçe",
  trList,
  "",
  "## English",
  enList,
  "",
].join("\n"));

// CHANGELOG: yeni sürüm bölümü + boş Unreleased
const section = [
  `## ${next} - ${date}`,
  "### Türkçe",
  trList,
  "",
  "### English",
  enList,
].join("\n");
const withoutUnreleased = changelogRaw.replace(/^# Changelog\s*/, "").replace(/## Unreleased[\s\S]*?(?=\n## |$)/, "").trim();
const emptyUnreleased = "## Unreleased\n\n### tr\n\n### en\n";
writeFileSync("CHANGELOG.md", `# Changelog\n\n${emptyUnreleased}\n${section}\n\n${withoutUnreleased}`.trimEnd() + "\n");

out("version", next);
out("bumped", lastTag ? "true" : "false");
out("release", "true");
out("notes_file", notesFile);
