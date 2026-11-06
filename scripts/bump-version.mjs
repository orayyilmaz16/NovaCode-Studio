#!/usr/bin/env node
// Conventional Commits -> SemVer. Son "vX.Y.Z" etiketinden bu yana commitleri okur,
// package.json / package-lock.json / CHANGELOG.md dosyalarını günceller.
// Çıktı: GITHUB_OUTPUT'a version, bumped, release.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";

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

// İlk çalışma: mevcut sürümü olduğu gibi etiketle, artırma.
if (!lastTag) {
  out("version", pkg.version);
  out("bumped", "false");
  out("release", "true");
  process.exit(0);
}

const raw = git("log", `${lastTag}..HEAD`, "--format=%H%n%s%n%b%x00");
const commits = raw.split("\0").map((c) => c.trim()).filter(Boolean)
  .map((c) => {
    const nl = c.indexOf("\n");
    return { sha: c.slice(0, nl), text: c.slice(nl + 1).trim() };
  })
  .filter((c) => !/^chore\(release\)/.test(c.text));

// Otomatik kayıt commit'leri (chore(auto)) kaynak kodu değiştirdiyse yama sürümü sayılır.
const CODE_PATH = /^(src\/|electron-[^/]+\.cjs$|electron-builder|package\.json$)/;

let level = 0; // 1 patch, 2 minor, 3 major
const notes = { feat: [], fix: [], other: [] };
for (const { sha, text: c } of commits) {
  const [subject] = c.split("\n");
  const m = /^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/.exec(subject);
  let type = m?.[1] ?? "other";
  if (type === "chore" && m?.[2] === "(auto)") {
    const files = git("diff-tree", "--no-commit-id", "--name-only", "-r", sha).split("\n");
    type = files.some((f) => CODE_PATH.test(f)) ? "fix" : "other";
  }
  const breaking = !!m?.[3] || /BREAKING CHANGE:/.test(c);
  if (breaking) level = 3;
  else if (type === "feat") level = Math.max(level, 2);
  else if (["fix", "perf", "refactor"].includes(type)) level = Math.max(level, 1);
  const line = `- ${m?.[4] ?? subject}`;
  (type === "feat" ? notes.feat : type === "fix" || type === "perf" ? notes.fix : notes.other).push(line);
}

if (level === 0) {
  out("version", pkg.version);
  out("bumped", "false");
  out("release", "false");
  process.exit(0);
}

const [maj, min, pat] = lastTag.slice(1).split(".").map(Number);
const next = level === 3 ? `${maj + 1}.0.0` : level === 2 ? `${maj}.${min + 1}.0` : `${maj}.${min}.${pat + 1}`;

pkg.version = next;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
if (existsSync("package-lock.json")) {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  lock.version = next;
  if (lock.packages?.[""]) lock.packages[""].version = next;
  writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
}

const date = new Date().toLocaleDateString("tr-TR").replace(/\//g, ".");
const section = [
  `## ${next} - ${date}`,
  notes.feat.length && `### Yeni\n${notes.feat.join("\n")}`,
  notes.fix.length && `### Düzeltme ve iyileştirme\n${notes.fix.join("\n")}`,
  notes.other.length && `### Diğer\n${notes.other.join("\n")}`,
].filter(Boolean).join("\n\n");
const old = existsSync("CHANGELOG.md") ? readFileSync("CHANGELOG.md", "utf8").replace(/^# Changelog\s*/, "") : "";
writeFileSync("CHANGELOG.md", `# Changelog\n\n${section}\n\n${old}`.trimEnd() + "\n");

out("version", next);
out("bumped", "true");
out("release", "true");
