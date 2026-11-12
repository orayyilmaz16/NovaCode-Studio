#!/usr/bin/env node
// material-icon-theme (MIT) manifestinden küçük bir eşleme üretir: src/data/fileIcons.json
// Çıktı: { d: varsayılan simge, e: { uzantı: simge }, n: { dosyaAdı: simge } }  (simge = icons/<ad>.svg)
// Paket güncellenince yeniden çalıştır: npm run icons:gen
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename } from "node:path";

const m = JSON.parse(readFileSync("node_modules/material-icon-theme/dist/material-icons.json", "utf8"));
const nameOf = (id) => {
  const p = m.iconDefinitions[id]?.iconPath;
  return p ? basename(p, ".svg") : null;
};
const pick = (obj) => {
  const out = {};
  for (const [k, id] of Object.entries(obj)) {
    const n = nameOf(id);
    if (n) out[k.toLowerCase()] = n;
  }
  return out;
};
mkdirSync("src/data", { recursive: true });
const data = { d: nameOf(m.file) ?? "file", e: pick(m.fileExtensions), n: pick(m.fileNames) };
writeFileSync("src/data/fileIcons.json", JSON.stringify(data));
console.log(`fileIcons.json: ${Object.keys(data.e).length} uzantı, ${Object.keys(data.n).length} dosya adı`);
