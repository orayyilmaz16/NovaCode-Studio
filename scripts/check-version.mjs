#!/usr/bin/env node
// Sürüm denetimi: package.json (tek kaynak) ↔ package-lock ↔ son etiket ↔ CHANGELOG ↔ uygulamadaki sürüm göstergesi.
// Kullanım: node scripts/check-version.mjs [--quiet]   (hata varsa çıkış kodu 1; her Claude turunda hook ve CI çalıştırır)
// Kurallar CI'ın sürüm işiyle aynıdır (scripts/bump-version.mjs): package.json sürümü son etiketten BÜYÜKSE olduğu gibi
// yayınlanır; eşit/küçükse CI PATCH artırır. Yalnız docs:/ci:/test: değişiklikleri sürüm çıkarmaz.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const quiet = process.argv.includes("--quiet");
const errors = [];
const notes = [];

const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const cmp = (a, b) => {
  const pa = a.split(/[.+-]/).slice(0, 3).map(Number);
  const pb = b.split(/[.+-]/).slice(0, 3).map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] > pb[i] ? 1 : -1;
  return 0;
};

const pkg = JSON.parse(read("package.json"));
const version = String(pkg.version || "");
if (!SEMVER.test(version)) errors.push(`package.json sürümü geçerli SemVer değil: "${version}"`);

// package-lock sürümü package.json ile aynı olmalı
if (existsSync("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  const lv = lock.version;
  const lv2 = lock.packages && lock.packages[""] && lock.packages[""].version;
  if (lv !== version || (lv2 !== undefined && lv2 !== version)) errors.push(`package-lock sürümü (${lv}/${lv2}) package.json (${version}) ile uyuşmuyor; "npm install --package-lock-only" çalıştır.`);
}

// Son etiket
let lastTag = "";
try {
  const tags = execFileSync("git", ["tag", "--list", "v*", "--sort=-v:refname"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    .split("\n").map((t) => t.trim()).filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
  lastTag = tags[0] || "";
} catch { /* git yok */ }
if (lastTag && SEMVER.test(version)) {
  const c = cmp(version, lastTag.slice(1));
  if (c > 0) notes.push(`sürüm ${version} > son etiket ${lastTag}: CI ${version}'i olduğu gibi yayınlar`);
  else notes.push(`sürüm ${version} ≤ son etiket ${lastTag}: değişiklik sürüm gerektiriyorsa CI PATCH artırır`);
} else if (!lastTag) notes.push("henüz sürüm etiketi yok");

// CHANGELOG: Unreleased bölümü ve tr/en başlıkları
if (!existsSync("CHANGELOG.md")) errors.push("CHANGELOG.md yok");
else {
  const cl = read("CHANGELOG.md");
  const m = /## Unreleased\n([\s\S]*?)(?=\n## |$)/.exec(cl);
  if (!m) errors.push("CHANGELOG.md içinde '## Unreleased' bölümü yok");
  else {
    const body = m[1];
    const section = (lang) => new RegExp(`### ${lang}\\n([\\s\\S]*?)(?=\\n### |$)`).exec(body);
    for (const lang of ["tr", "en"]) {
      const s = section(lang);
      if (!s) errors.push(`CHANGELOG Unreleased bölümünde '### ${lang}' yok`);
      else if (!/^- /m.test(s[1])) notes.push(`CHANGELOG Unreleased/${lang} boş (kullanıcıya görünen değişiklik varsa madde ekle)`);
    }
  }
}

// Uygulamadaki sürüm göstergesi package.json'dan gelmeli (vite define) ve güncelleyici aynı sürümü kullanmalı
const vite = existsSync("vite.config.ts") ? read("vite.config.ts") : "";
if (!/__APP_VERSION__\s*:\s*JSON\.stringify\(pkg\.version\)/.test(vite)) errors.push("vite.config.ts: __APP_VERSION__ package.json sürümüne bağlı değil");
if (!pkg.build || !Array.isArray(pkg.build.publish) || !pkg.build.publish.some((p) => p.provider === "github")) errors.push("package.json build.publish (GitHub) yok: uygulama içi güncelleme çalışmaz");

const line = `sürüm ${version}${lastTag ? ` (son etiket ${lastTag})` : ""}: ${errors.length ? `${errors.length} HATA` : "tamam"}${notes.length ? " — " + notes.join("; ") : ""}`;
if (!quiet || errors.length) {
  console.log(line);
  for (const e of errors) console.error("HATA: " + e);
} else console.log(line);
process.exit(errors.length ? 1 : 0);
