// Bağımlılık değişikliğinden otomatik CHANGELOG maddesi (tr+en) üretir; sürümü release.mjs hazırlar.
// Kapsam: Electron yığını (Chromium + Node.js getirir) ve çalışma zamanı `dependencies`. Yalnız geliştirme araçları
// (vite, typescript vb.) kullanıcıya ulaşmadığı için sürüm çıkarmaz.
// Kullanım: node scripts/dep-changelog.mjs   (çıktı: eklenen madde sayısı; 0 ise sürüm çıkmaz)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
const strip = (v) => String(v || "").replace(/^[\^~>=<\s]+/, "");

const lastTag = git("describe", "--tags", "--abbrev=0", "--match", "v[0-9]*");
if (!lastTag) { console.log("0"); process.exit(0); }
const now = JSON.parse(readFileSync("package.json", "utf8"));
// Sürüm zaten hazırlanmış ama henüz etiketlenmemişse (PR birleşmeyi bekliyor) tekrar madde ekleme
if (now.version !== lastTag.replace(/^v/, "")) { console.log("0"); process.exit(0); }
const old = JSON.parse(git("show", `${lastTag}:package.json`) || "{}");

const ELECTRON = /^(electron|electron-builder|@electron\/.+)$/;
const changes = [];
const scan = (field, keep) => {
  for (const [name, range] of Object.entries(now[field] || {})) {
    const before = strip((old[field] || {})[name]);
    const after = strip(range);
    if (before && before !== after && keep(name)) changes.push({ name, before, after, field });
  }
};
scan("devDependencies", (n) => ELECTRON.test(n));
scan("dependencies", () => true);
if (changes.length === 0) { console.log("0"); process.exit(0); }

let cl = readFileSync("CHANGELOG.md", "utf8");
const crlf = cl.includes("\r\n");
cl = cl.replace(/\r\n/g, "\n");
const unreleased = cl.split(/^## /m).find((s) => s.startsWith("Unreleased")) || "";
if (/^- /m.test(unreleased)) { console.log("0"); process.exit(0); } // elle yazılmış madde varsa o yeter

const electron = changes.find((c) => c.name === "electron");
const others = changes.filter((c) => c.name !== "electron");
const list = others.slice(0, 8).map((c) => `${c.name} ${c.before} → ${c.after}`).join(", ") + (others.length > 8 ? ` (+${others.length - 8})` : "");
const tr = [];
const en = [];
if (electron) {
  tr.push(`- [security] **Electron ${electron.before} → ${electron.after}:** Uygulamanın Chromium ve Node.js sürümü güncellendi (güvenlik ve performans düzeltmeleri).`);
  en.push(`- [security] **Electron ${electron.before} → ${electron.after}:** The app's Chromium and Node.js versions are updated (security and performance fixes).`);
}
if (others.length) {
  tr.push(`- [improve] **Bağımlılıklar güncellendi:** ${list}.`);
  en.push(`- [improve] **Dependencies updated:** ${list}.`);
}
cl = cl.replace("### tr\n\n", `### tr\n\n${tr.join("\n")}\n`).replace("### en\n\n", `### en\n\n${en.join("\n")}\n`);
writeFileSync("CHANGELOG.md", crlf ? cl.replace(/\n/g, "\r\n") : cl);
console.log(String(tr.length));
