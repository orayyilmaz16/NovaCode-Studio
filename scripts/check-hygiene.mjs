#!/usr/bin/env node
// .gitignore bakımı + takip edilen ama ignore'lu dosyalar + sır taraması.
// Kullanım: node scripts/check-hygiene.mjs [--fix]
// --fix: eksik .gitignore satırlarını ekler, ignore'lu takip edilen dosyaları indeksten çıkarır (diskten silmez).
// Sır bulunursa değer yazdırılmaz, yalnız dosya:satır raporlanır ve süreç 1 ile çıkar.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";

const fix = process.argv.includes("--fix");
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28 });

const REQUIRED = [
  "node_modules", "dist", "dist-electron", "release", "build", ".venv",
  ".env", ".env.*", "!.env.example", "*.log", ".DS_Store", "Thumbs.db",
  "*.pem", "*.key", "*.pfx", "coverage",
];

let problems = 0;
const fixed = [];

// 1) .gitignore
const gi = existsSync(".gitignore") ? readFileSync(".gitignore", "utf8") : "";
const have = new Set(gi.split(/\r?\n/).map((l) => l.trim()));
const missing = REQUIRED.filter((r) => !have.has(r) && !have.has(r + "/") && !have.has("/" + r));
if (missing.length) {
  if (fix) {
    writeFileSync(".gitignore", gi.replace(/\s*$/, "\n") + "\n# Otomatik eklenenler (scripts/check-hygiene.mjs)\n" + missing.join("\n") + "\n");
    fixed.push(`.gitignore'a eklendi: ${missing.join(", ")}`);
  } else {
    console.log(`::warning::.gitignore eksik satırlar: ${missing.join(", ")}`);
  }
}

// 2) Takip edilen ama ignore'lu dosyalar
const tracked = git("ls-files", "-ci", "--exclude-standard", "-z").split("\0").filter(Boolean);
if (tracked.length) {
  if (fix) {
    for (let i = 0; i < tracked.length; i += 200) {
      execFileSync("git", ["rm", "--cached", "--quiet", "--", ...tracked.slice(i, i + 200)]);
    }
    fixed.push(`${tracked.length} dosya git indeksinden çıkarıldı (diskte duruyor)`);
  } else {
    console.log(`::warning::${tracked.length} dosya ignore edilmesine rağmen takip ediliyor`);
  }
}

// 3) Sır taraması (takip edilen metin dosyaları)
const PATTERNS = [
  [/-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/, "özel anahtar"],
  [/AKIA[0-9A-Z]{16}/, "AWS anahtarı"],
  [/gh[pousr]_[A-Za-z0-9]{36,}/, "GitHub token"],
  [/sk-ant-[A-Za-z0-9_-]{20,}/, "Anthropic anahtarı"],
  [/(api[_-]?key|secret|token|password)\s*[:=]\s*["'][A-Za-z0-9_\-/+=]{20,}["']/i, "olası sır"],
];
const SKIP = /(^|\/)(package-lock\.json|dist\/|release\/|node_modules\/|public\/.*\.(js|map)$)|\.(png|jpg|ico|woff2?|ttf|exe|zip)$/;
const files = git("ls-files", "-z").split("\0").filter((f) => f && !SKIP.test(f) && existsSync(f));
for (const f of files) {
  if (statSync(f).size > 1_000_000) continue;
  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [re, name] of PATTERNS) {
      if (re.test(line) && !/<[A-Z_]+>|example|placeholder|your-/i.test(line)) {
        console.log(`::error file=${f},line=${i + 1}::${name} bulundu (değer gizlendi). Anahtarı yenile ve geçmişten temizle.`);
        problems++;
      }
    }
  });
}

if (!existsSync(".claudeignore")) console.log("::warning::.claudeignore yok");
fixed.forEach((m) => console.log(`FIX: ${m}`));
if (process.env.GITHUB_OUTPUT && fixed.length) {
  writeFileSync(process.env.GITHUB_OUTPUT, "hygiene_fixed=true\n", { flag: "a" });
}
process.exit(problems ? 1 : 0); // yalnız sır bulgusu hata sayılır
