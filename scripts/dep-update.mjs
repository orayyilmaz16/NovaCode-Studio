// Bağımlılık otopilotu (kural ve akış: docs/brain/actions/updates.md → "Bağımlılık otopilotu").
// Modlar:
//   report                 npm outdated + npm audit → rapor (md/json), değişim parmak izi
//   apply                  güvenli (patch/minor) güncellemeleri uygular; tsc+test+build geçmezse tek tek dener, geçmeyeni geri alır
//   apply --major <paket>  tek paketi en son (major dahil) sürüme çıkarır; doğrulama sonucu rapora yazılır, değişiklik korunur
//   housekeeping           eskimiş/yinelenen bağımlılık PR'larını kapatır (gh gerekir)
// Çıktı klasörü: DEP_OUT (varsayılan .dep-autopilot/). GITHUB_OUTPUT varsa adım çıktıları yazılır.
// Ağ: yalnız npm kayıt defteri (paket adları ve sürümler; kişisel veri yok). Yapılandırma: .github/dep-autopilot.json
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// ---------- saf yardımcılar (testli: scripts/tests/deps.test.cjs) ----------
export const strip = (v) => String(v || "").replace(/^[\^~>=<\s]+/, "");
export const prefixOf = (range) => (String(range || "").match(/^[\^~]/) || [""])[0];
const SEMVER = /^\d+\.\d+\.\d+$/;
const NAME = /^(@[a-z0-9~][a-z0-9._~-]*\/)?[a-z0-9~][a-z0-9._~-]*$/;
const num = (v) => String(v).split("-")[0].split(".").map((x) => parseInt(x, 10) || 0);
export function cmp(a, b) {
  const x = num(a), y = num(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
  return 0;
}
export function bumpType(from, to) {
  const x = num(from), y = num(to);
  if (x[0] !== y[0]) return "major";
  // 0.x sürümlerde minor artışı kırıcı sayılır (caret semantiği)
  if (x[0] === 0 && x[1] !== y[1]) return "major";
  if (x[1] !== y[1]) return "minor";
  return "patch";
}
export function globMatch(pattern, name) {
  const re = new RegExp("^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
  return re.test(name);
}
export const isIgnored = (name, ignore = []) => ignore.some((p) => globMatch(p, name));

// npm outdated --json çıktısını {safe, major, skipped} olarak ayırır
export function classify(outdated, { ignore = [] } = {}) {
  const safe = [], major = [], skipped = [];
  for (const [name, o] of Object.entries(outdated || {})) {
    if (!NAME.test(name)) continue;
    const current = strip(o.current), wanted = strip(o.wanted), latest = strip(o.latest);
    if (!SEMVER.test(current) || !SEMVER.test(latest)) continue; // git/dosya bağımlılıkları, belirsiz sürüm
    const type = o.type === "dependencies" ? "dependencies" : "devDependencies";
    const row = { name, current, wanted, latest, type };
    if (isIgnored(name, ignore)) { skipped.push({ ...row, reason: "ignore" }); continue; }
    if (cmp(latest, current) <= 0) continue;
    // Güvenli hedef: en son sürüm aynı ana sürümdeyse o; değilse aralık içindeki (wanted) sürüm
    if (bumpType(current, latest) !== "major") {
      safe.push({ ...row, to: latest, bump: bumpType(current, latest) });
    } else {
      if (SEMVER.test(wanted) && cmp(wanted, current) > 0 && bumpType(current, wanted) !== "major") {
        safe.push({ ...row, to: wanted, bump: bumpType(current, wanted) });
      }
      major.push({ ...row, to: latest, bump: "major" });
    }
  }
  const by = (a, b) => a.name.localeCompare(b.name);
  return { safe: safe.sort(by), major: major.sort(by), skipped: skipped.sort(by) };
}
// Dependabot başlığı: "bump X from A to B" (tek paket). Gruplu/çok paketli başlıkta null döner.
export function parseBumpTitle(title) {
  const m = /\bbump\s+(\S+)\s+from\s+v?(\d+\.\d+\.\d+)\S*\s+to\s+v?(\d+\.\d+\.\d+)/i.exec(String(title || ""));
  return m ? { name: m[1], from: m[2], to: m[3] } : null;
}
export const isoWeek = (d = new Date()) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7);
  return `${y}-w${String(w).padStart(2, "0")}`;
};
const link = (n) => `[${n}](https://www.npmjs.com/package/${n})`;
export const tableOf = (rows, extra) =>
  rows.length
    ? ["| Paket | Sürüm | Tür | Not |", "|---|---|---|---|", ...rows.map((r) => `| ${link(r.name)} | ${r.current} → ${r.to} | ${r.type === "dependencies" ? "çalışma zamanı" : "geliştirme"} | ${extra ? extra(r) : r.bump} |`)].join("\n")
    : "_Yok._";

// ---------- yürütme yardımcıları ----------
const win = process.platform === "win32";
function run(cmd, args, { capture = true, timeout = 15 * 60 * 1000 } = {}) {
  try {
    const out = execFileSync(cmd, args, { encoding: "utf8", stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit", shell: win, timeout, maxBuffer: 64 * 1024 * 1024 });
    return { ok: true, out: out || "" };
  } catch (e) {
    return { ok: false, out: String((e.stdout || "") + (e.stderr || "") || e.message), code: e.status };
  }
}
const tail = (s, n = 25) => String(s).trim().split("\n").slice(-n).join("\n");
const config = () => {
  const def = { ignore: ["electron", "electron-builder", "@electron/*"], verify: [["npx", "tsc", "--noEmit"], ["npm", "test"], ["npm", "run", "build"]], maxIndividualTries: 12 };
  try { return { ...def, ...JSON.parse(readFileSync(".github/dep-autopilot.json", "utf8")) }; } catch { return def; }
};
const OUT = process.env.DEP_OUT || ".dep-autopilot";
const save = (file, data) => { mkdirSync(OUT, { recursive: true }); writeFileSync(join(OUT, file), typeof data === "string" ? data : JSON.stringify(data, null, 2)); };
const ghOut = (obj) => { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(obj).map(([k, v]) => `${k}=${v}`).join("\n") + "\n"); };

function verify(cfg) {
  for (const [cmd, ...args] of cfg.verify) {
    const r = run(cmd, args);
    if (!r.ok) return { ok: false, step: [cmd, ...args].join(" "), log: tail(r.out) };
  }
  return { ok: true };
}
const snapshot = () => ({ pkg: readFileSync("package.json", "utf8"), lock: existsSync("package-lock.json") ? readFileSync("package-lock.json", "utf8") : null });
function restore(s) {
  writeFileSync("package.json", s.pkg);
  if (s.lock !== null) writeFileSync("package-lock.json", s.lock);
  run("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
}
// package.json aralığını günceller (^/~ öneki korunur), sonra kilidi yeniler
function setVersions(list) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  for (const r of list) {
    const field = pkg[r.type] && pkg[r.type][r.name] ? r.type : (pkg.dependencies?.[r.name] ? "dependencies" : "devDependencies");
    if (!pkg[field] || !pkg[field][r.name]) continue;
    pkg[field][r.name] = prefixOf(pkg[field][r.name]) + r.to;
  }
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  return run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"]);
}
function outdated() {
  const r = run("npm", ["outdated", "--json"]); // güncel olmayan varsa çıkış kodu 1 döner, JSON yine stdout'tadır
  try { return JSON.parse(r.out.slice(r.out.indexOf("{")) || "{}"); } catch { return {}; }
}
function auditCounts() {
  const r = run("npm", ["audit", "--json"]);
  try { const v = JSON.parse(r.out).metadata?.vulnerabilities || {}; return { critical: v.critical || 0, high: v.high || 0, moderate: v.moderate || 0, low: v.low || 0 }; } catch { return null; }
}
function openDepPrs() {
  const r = run("gh", ["pr", "list", "--state", "open", "--label", "dependencies", "--json", "number,title,updatedAt,url", "--limit", "50"]);
  try { return JSON.parse(r.out); } catch { return []; }
}

// ---------- modlar ----------
function modeReport() {
  const cfg = config();
  const c = classify(outdated(), cfg);
  const audit = auditCounts();
  const prs = openDepPrs();
  const fingerprint = createHash("sha256").update(JSON.stringify([c.safe.map((x) => x.name + x.to), c.major.map((x) => x.name + x.to), audit])).digest("hex").slice(0, 12);
  const md = [
    `## Bağımlılık durumu (${new Date().toISOString().slice(0, 10)})`,
    "",
    `**Güvenli güncellemeler (patch/minor): ${c.safe.length}** — haftalık PR'a girer, doğrulama (tsc + test + build) geçerse otomatik birleşir.`,
    tableOf(c.safe),
    "",
    `**Major güncellemeler: ${c.major.length}** — otomatik birleşmez; elle başlatmak için *Actions → Bağımlılık otopilotu → Run workflow → major* alanına paket adını yaz.`,
    tableOf(c.major, () => "kırıcı olabilir"),
    "",
    `**Güvenlik taraması (npm audit):** ` + (audit ? `kritik ${audit.critical}, yüksek ${audit.high}, orta ${audit.moderate}, düşük ${audit.low}` : "okunamadı"),
    "",
    `**Açık bağımlılık PR'ları: ${prs.length}**` + (prs.length ? "\n" + prs.map((p) => `- #${p.number} ${p.title}`).join("\n") : ""),
    c.skipped.length ? `\n_Otopilot dışı (kendi izleyicisi var): ${c.skipped.map((s) => s.name).join(", ")}_` : "",
    "",
    `<!-- fingerprint:${fingerprint} -->`,
  ].join("\n");
  save("report.md", md); save("report.json", { ...c, audit, fingerprint });
  ghOut({ safe_count: c.safe.length, major_count: c.major.length, fingerprint, report_file: join(OUT, "report.md") });
  console.log(md);
}

function modeApply(majorName) {
  const cfg = config();
  const c = classify(outdated(), cfg);
  const snap = snapshot();
  let applied = [], failed = [], verified = true, note = "";

  if (majorName) {
    const t = c.major.find((m) => m.name === majorName);
    if (!t) { console.error(`'${majorName}' için bekleyen major güncelleme yok (ya da otopilot dışı).`); ghOut({ applied_count: 0, failed_count: 0, verified: "false" }); process.exit(0); }
    const inst = setVersions([t]);
    const v = inst.ok ? verify(cfg) : { ok: false, step: "npm install", log: tail(inst.out) };
    applied = [t]; verified = v.ok; if (!v.ok) note = `Doğrulama başarısız (\`${v.step}\`):\n\`\`\`\n${v.log}\n\`\`\``;
  } else {
    if (!c.safe.length) { ghOut({ applied_count: 0, failed_count: 0, verified: "true" }); console.log("Güvenli güncelleme yok."); return; }
    const inst = setVersions(c.safe);
    let v = inst.ok ? verify(cfg) : { ok: false, step: "npm install", log: tail(inst.out) };
    if (v.ok) applied = c.safe;
    else {
      // Toplu deneme düştü: temiz duruma dön, paketleri tek tek dene, geçmeyeni dışarıda bırak
      restore(snap);
      let tries = 0;
      for (const r of c.safe) {
        if (tries++ >= cfg.maxIndividualTries) { failed.push({ ...r, log: "deneme sınırı aşıldı (sonraki hafta yeniden denenir)" }); continue; }
        const before = snapshot();
        const i1 = setVersions([r]);
        const v1 = i1.ok ? verify(cfg) : { ok: false, step: "npm install", log: tail(i1.out) };
        if (v1.ok) applied.push(r); else { failed.push({ ...r, log: `${v1.step}: ${tail(v1.log, 8)}` }); restore(before); }
      }
      note = `Toplu doğrulama düştü (\`${v.step}\`); paketler tek tek denendi.`;
    }
  }
  const md = [
    majorName ? `### Major güncelleme: ${majorName}` : "### Güvenli güncellemeler (patch/minor)",
    "",
    tableOf(applied),
    verified ? "" : "\n> **Doğrulama başarısız:** bu PR taslaktır; elle düzeltme gerekir.",
    failed.length ? `\n**Uygulanamayan (geri alındı):**\n${failed.map((f) => `- ${f.name} ${f.current} → ${f.to}: ${f.log.split("\n")[0]}`).join("\n")}` : "",
    note ? `\n${note}` : "",
    "",
    "Doğrulama: tip kontrolü, `npm test`, `npm run build`. Ardından CI ve güvenlik taraması çalışır; zorunlu kontroller yeşil olmadan birleşmez.",
  ].join("\n");
  save("pr-body.md", md); save("apply.json", { applied, failed, verified });
  ghOut({ applied_count: applied.length, failed_count: failed.length, verified: String(verified), body_file: join(OUT, "pr-body.md"), week: isoWeek() });
  console.log(md);
}

function modeHousekeeping() {
  const base = JSON.parse(readFileSync("package.json", "utf8"));
  const have = { ...base.devDependencies, ...base.dependencies };
  const list = run("gh", ["pr", "list", "--state", "open", "--json", "number,title,headRefName", "--limit", "100"]);
  let prs = []; try { prs = JSON.parse(list.out); } catch { console.log("PR listesi okunamadı."); return; }
  const close = (n, why) => { run("gh", ["pr", "close", String(n), "--delete-branch", "--comment", why]); console.log(`#${n} kapatıldı: ${why}`); };
  const autos = prs.filter((p) => /^auto\/deps-/.test(p.headRefName)).sort((a, b) => b.headRefName.localeCompare(a.headRefName));
  autos.slice(1).forEach((p) => close(p.number, "Otopilot: daha yeni bir haftalık güncelleme PR'ı açıldığı için bu PR kapatıldı."));
  for (const p of prs.filter((x) => /^dependabot\//.test(x.headRefName))) {
    const t = parseBumpTitle(p.title);
    if (t && have[t.name] && cmp(strip(have[t.name]), t.to) >= 0) close(p.number, `Otopilot: ${t.name} main'de zaten ${strip(have[t.name])} (hedef ${t.to}); PR gereksiz.`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const [mode, flag, name] = process.argv.slice(2);
  if (mode === "report") modeReport();
  else if (mode === "apply") modeApply(flag === "--major" ? name : "");
  else if (mode === "housekeeping") modeHousekeeping();
  else { console.error("Kullanım: dep-update.mjs report | apply [--major <paket>] | housekeeping"); process.exit(2); }
}
