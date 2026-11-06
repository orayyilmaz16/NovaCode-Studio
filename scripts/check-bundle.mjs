#!/usr/bin/env node
// Performans bütçesi: dist/assets içindeki JS/CSS boyutları. Aşılırsa süreç 1 ile çıkar.
// Bütçeler ortam değişkeniyle ayarlanır (KB): MAX_JS_KB, MAX_CSS_KB, MAX_GZIP_JS_KB.
import { readdirSync, readFileSync, statSync, appendFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const dir = "dist/assets";
if (!existsSync(dir)) { console.error("dist/assets yok; önce build çalıştır."); process.exit(1); }

const budget = {
  js: +(process.env.MAX_JS_KB || 600),
  css: +(process.env.MAX_CSS_KB || 100),
  gzipJs: +(process.env.MAX_GZIP_JS_KB || 200),
};
const rows = [];
let fail = false;
for (const f of readdirSync(dir)) {
  const ext = f.endsWith(".js") ? "js" : f.endsWith(".css") ? "css" : null;
  if (!ext) continue;
  const p = join(dir, f);
  const kb = statSync(p).size / 1024;
  const gz = ext === "js" ? gzipSync(readFileSync(p)).length / 1024 : 0;
  const over = kb > budget[ext] || (ext === "js" && gz > budget.gzipJs);
  if (over) fail = true;
  rows.push(`| ${f} | ${kb.toFixed(0)} KB | ${gz ? gz.toFixed(0) + " KB" : "-"} | ${over ? "AŞILDI" : "ok"} |`);
}
const md = `### Performans bütçesi\n| Dosya | Boyut | Gzip | Durum |\n|---|---|---|---|\n${rows.join("\n")}\n\nBütçe: JS ${budget.js} KB (gzip ${budget.gzipJs}), CSS ${budget.css} KB\n`;
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
process.exit(fail ? 1 : 0);
