// Electron'un son kararlı sürümünü (onunla gelen Chromium ve Node.js dahil) resmî dizinden okur, package.json ile karşılaştırır.
// Kullanım: node scripts/runtime-watch.mjs   → stdout'a JSON; GITHUB_OUTPUT varsa outdated/electron/chrome/node yazar.
// Ağ: yalnız electronjs.org sürüm dizini (kişisel veri yok). Chromium ve Node.js ayrı yükseltilemez, Electron ile birlikte gelir.
import { readFileSync, appendFileSync } from "node:fs";

const num = (v) => String(v).split(".").map((x) => parseInt(x, 10) || 0);
const gt = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };

const res = await fetch("https://electronjs.org/headers/index.json", { headers: { "user-agent": "NovaCode-Studio-runtime-watch" }, redirect: "follow" });
if (!res.ok) { console.error("Sürüm dizini okunamadı: HTTP " + res.status); process.exit(1); }
const list = await res.json();
let best = null;
for (const r of Array.isArray(list) ? list : []) {
  if (!r || typeof r.version !== "string" || r.version.includes("-")) continue; // beta/nightly hariç
  if (!best || gt(r.version, best.version)) best = r;
}
if (!best) { console.error("Kararlı sürüm bulunamadı"); process.exit(1); }

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const current = String((pkg.devDependencies || {}).electron || (pkg.dependencies || {}).electron || "").replace(/^[\^~>=<\s]+/, "");
const out = { outdated: !!current && gt(best.version, current), current, electron: best.version, chrome: String(best.chrome || ""), node: String(best.node || "") };
console.log(JSON.stringify(out));
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(out).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
}
