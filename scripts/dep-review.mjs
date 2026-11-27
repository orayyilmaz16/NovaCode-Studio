// Bağımlılık PR incelemesi: iki package.json (taban, PR) arasındaki bağımlılık farkını Markdown yorum olarak yazar (stdout).
// Kullanım: node scripts/dep-review.mjs <taban package.json> <PR package.json>
// Yalnız dosya okur; PR kodu çalıştırılmaz. Yorumdaki `<!-- has-major -->` işareti iş akışında etiket kararı için okunur.
import { readFileSync } from "node:fs";
import { bumpType, cmp, isIgnored, strip } from "./dep-update.mjs";

export function diffDeps(base, head, ignore = []) {
  const rows = [];
  for (const field of ["dependencies", "devDependencies"]) {
    const names = new Set([...Object.keys(base[field] || {}), ...Object.keys(head[field] || {})]);
    for (const name of names) {
      const a = strip((base[field] || {})[name]), b = strip((head[field] || {})[name]);
      if (a === b) continue;
      const row = { name, field, from: a, to: b };
      if (!a) row.kind = "eklendi";
      else if (!b) row.kind = "kaldırıldı";
      else if (!/^\d+\.\d+\.\d+/.test(a) || !/^\d+\.\d+\.\d+/.test(b)) row.kind = "aralık";
      else if (cmp(b, a) < 0) row.kind = "düşürüldü";
      else row.kind = bumpType(a, b);
      row.stack = isIgnored(name, ignore); // Electron yığını: politika gereği major da otomatik birleşir
      rows.push(row);
    }
  }
  return rows.sort((x, y) => x.name.localeCompare(y.name));
}

export function renderReview(rows) {
  const majors = rows.filter((r) => r.kind === "major" && !r.stack);
  const runtime = rows.filter((r) => r.field === "dependencies" && r.kind !== "patch");
  const out = ["<!-- dep-review -->", "## Bağımlılık incelemesi (otomatik)", ""];
  if (!rows.length) {
    out.push("`package.json` bağımlılıklarında değişiklik yok (yalnız kilit dosyası ya da Actions güncellemesi).");
  } else {
    out.push("| Paket | Değişim | Tür | Risk |", "|---|---|---|---|");
    for (const r of rows) {
      const risk = r.kind === "major" ? (r.stack ? "major (Electron yığını, otomatik)" : "**major, insan incelemesi**") : r.kind;
      out.push(`| ${r.name} | ${r.from || "—"} → ${r.to || "—"} | ${r.field === "dependencies" ? "çalışma zamanı" : "geliştirme"} | ${risk} |`);
    }
    out.push("");
    if (majors.length) out.push(`> **Major:** ${majors.map((m) => m.name).join(", ")}. Otomatik birleşmez; değişiklik notlarını oku, CI yeşil olunca elle birleştir.`);
    else out.push("> Kırıcı değişiklik beklenmiyor (patch/minor). Zorunlu kontroller yeşil olunca birleşir.");
    if (runtime.length) out.push(`> Çalışma zamanı bağımlılığı değişiyor (${runtime.map((r) => r.name).join(", ")}): son kullanıcıya ulaşır, uygulama içinde bir kez dene.`);
  }
  out.push("", "Bu yorum her gönderimde güncellenir. Güvenlik taraması ve testler için CI/CD ve Güvenlik Taraması sonuçlarına bak.");
  if (majors.length) out.push("<!-- has-major -->");
  return out.join("\n");
}

import { pathToFileURL } from "node:url";
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const read = (f) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return {}; } };
  const [baseFile, headFile] = process.argv.slice(2);
  let ignore = [];
  try { ignore = JSON.parse(readFileSync(".github/dep-autopilot.json", "utf8")).ignore || []; } catch { /* varsayılan */ }
  console.log(renderReview(diffDeps(read(baseFile), read(headFile), ignore)));
}
