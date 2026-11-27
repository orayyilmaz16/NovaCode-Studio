#!/usr/bin/env node
// Sağlık ve güvenlik izleyici: bağımlılık açıkları, statik denetim, paket boyutu/derleme süresi eğilimi, dış servis sağlığı.
//   node scripts/health-monitor.mjs [--build] [--out health-out] [--history health-out/history.json]
//   --build   önce `npm run build` çalıştırır ve süreyi ölçer (CI'da)
// Çıktı: <out>/report.json (tam), <out>/report.md (özet), GITHUB_OUTPUT: status=ok|warn|alert, alerts, warns, fingerprint.
// Gizlilik: kişisel veri toplanmaz. Giden istekler yalnız public uç noktalara (GitHub API, Open VSX, electronjs.org) ve
// isteğe bağlı NOVA_SYNC_HEALTH_URL'e gider; bu adres çıktıya/günlüğe YAZILMAZ. Açık (zaafiyet) ayrıntısı özete konmaz:
// statik bulgularda yalnız kural kimliği ve sayı, dosya:satır yok (repo public). Kural: docs/brain/actions/monitoring.md
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { dirname, join } from "node:path";

const ARGS = process.argv.slice(2);
const argVal = (k, d) => { const i = ARGS.indexOf(k); return i >= 0 && ARGS[i + 1] ? ARGS[i + 1] : d; };
const OUT_DIR = argVal("--out", "health-out");
const HISTORY_FILE = argVal("--history", join(OUT_DIR, "history.json"));
const HISTORY_MAX = 60;
const SHELL = process.platform === "win32";

const BUDGET = { js: +(process.env.MAX_JS_KB || 700), css: +(process.env.MAX_CSS_KB || 150), gzipJs: +(process.env.MAX_GZIP_JS_KB || 230) };
const WARN_RATIO = 0.85; // bütçenin %85'inde erken uyarı
const GROWTH_WARN = 0.1; // önceki ölçüme göre %10 büyüme
const BUILD_WARN_S = 180;
const HTTP_TIMEOUT_MS = 10_000;
const SLOW_MS = 4_000;

const findings = []; // { id, area, sev: info|warn|alert, title }
const metrics = {};
const add = (id, area, sev, title) => findings.push({ id, area, sev, title });
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: "utf8", shell: SHELL, maxBuffer: 64 * 1024 * 1024, ...opts });

const readJson = (p, fallback) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; } };
const history = readJson(HISTORY_FILE, { runs: [] });
const prev = history.runs.at(-1) || null;

// ---------- 1) Derleme süresi ----------
if (ARGS.includes("--build")) {
  const t0 = Date.now();
  const r = run("npm", ["run", "build", "--silent"], { stdio: ["ignore", "ignore", "ignore"] });
  metrics.buildSeconds = Math.round((Date.now() - t0) / 1000);
  if (r.status !== 0) add("build-fail", "performans", "alert", "Web build başarısız");
  else if (metrics.buildSeconds > BUILD_WARN_S) add("build-slow", "performans", "warn", `Web build yavaş: ${metrics.buildSeconds} sn (eşik ${BUILD_WARN_S} sn)`);
  else if (prev?.metrics?.buildSeconds && metrics.buildSeconds > prev.metrics.buildSeconds * 1.5 && metrics.buildSeconds > 30) {
    add("build-regress", "performans", "warn", `Web build süresi arttı: ${prev.metrics.buildSeconds} → ${metrics.buildSeconds} sn`);
  }
}

// ---------- 2) Paket boyutu ----------
const assets = "dist/assets";
if (existsSync(assets)) {
  let js = 0, css = 0, gz = 0, maxJs = 0, maxCss = 0, maxGz = 0;
  for (const f of readdirSync(assets)) {
    const p = join(assets, f);
    if (f.endsWith(".js")) {
      const buf = readFileSync(p);
      const kb = buf.length / 1024, g = gzipSync(buf).length / 1024;
      js += kb; gz += g; maxJs = Math.max(maxJs, kb); maxGz = Math.max(maxGz, g);
    } else if (f.endsWith(".css")) {
      const kb = statSync(p).size / 1024; css += kb; maxCss = Math.max(maxCss, kb);
    }
  }
  Object.assign(metrics, { jsKB: Math.round(js), cssKB: Math.round(css), gzipJsKB: Math.round(gz), maxJsKB: Math.round(maxJs), maxCssKB: Math.round(maxCss), maxGzipJsKB: Math.round(maxGz) });
  const checks = [["JS (en büyük parça)", maxJs, BUDGET.js], ["JS gzip (en büyük parça)", maxGz, BUDGET.gzipJs], ["CSS (en büyük parça)", maxCss, BUDGET.css]];
  for (const [name, v, limit] of checks) {
    if (v > limit) add(`budget-${name}`, "performans", "alert", `${name} bütçeyi aştı: ${Math.round(v)} KB > ${limit} KB`);
    else if (v > limit * WARN_RATIO) add(`budget-near-${name}`, "performans", "warn", `${name} bütçeye yaklaştı: ${Math.round(v)} / ${limit} KB`);
  }
  if (prev?.metrics?.jsKB && js > prev.metrics.jsKB * (1 + GROWTH_WARN) && js - prev.metrics.jsKB > 20) {
    add("bundle-growth", "performans", "warn", `Toplam JS büyüdü: ${prev.metrics.jsKB} → ${Math.round(js)} KB (+%${Math.round((js / prev.metrics.jsKB - 1) * 100)})`);
  }
} else {
  add("no-dist", "performans", "info", "dist/ yok; paket boyutu ölçülmedi (--build kullan)");
}

// ---------- 3) Bağımlılık açıkları (npm audit) ----------
function npmAudit(omitDev) {
  const r = run("npm", ["audit", "--json", ...(omitDev ? ["--omit=dev"] : [])]);
  try { return JSON.parse(r.stdout).metadata.vulnerabilities; } catch { return null; }
}
for (const [label, omit] of [["tümü", false], ["çalışma zamanı", true]]) {
  const v = npmAudit(omit);
  if (!v) { add(`npm-audit-${label}`, "güvenlik", "warn", `npm audit okunamadı (${label}); kayıt defteri erişilemiyor olabilir`); continue; }
  metrics[`vuln_${omit ? "runtime" : "all"}`] = { critical: v.critical, high: v.high, moderate: v.moderate, low: v.low };
  if (v.critical || v.high) add(`npm-high-${label}`, "güvenlik", "alert", `Bağımlılık açığı (${label}): kritik ${v.critical}, yüksek ${v.high}`);
  else if (v.moderate) add(`npm-mod-${label}`, "güvenlik", "warn", `Bağımlılık açığı (${label}): orta ${v.moderate}`);
}

// ---------- 4) Statik denetim ----------
{
  const r = run(process.execPath, ["scripts/audit-scan.mjs", "--check", "--quiet"]);
  const base = readJson("docs/brain/audit-baseline.json", { items: [] });
  const sev = { yüksek: 0, kritik: 0, orta: 0 };
  for (const it of base.items || []) if (it.sev in sev) sev[it.sev] += it.n || 1;
  metrics.static = sev;
  if (r.status !== 0) add("static-new-high", "güvenlik", "alert", "Statik denetim: temel çizgiye göre yeni yüksek/kritik bulgu (ayrıntı: npm run audit, yerelde)");
  else if (sev.yüksek || sev.kritik) add("static-high", "güvenlik", "warn", `Statik denetim: kabul edilmiş yüksek/kritik bulgu var (yüksek ${sev.yüksek}, kritik ${sev.kritik})`);
}

// ---------- 5) Eskimiş bağımlılıklar (yalnız bilgi) ----------
{
  const r = run("npm", ["outdated", "--json", "--omit=dev"]);
  const o = readJsonString(r.stdout, {});
  const majors = Object.values(o).filter((x) => x?.current && x?.latest && String(x.latest).split(".")[0] !== String(x.current).split(".")[0]).length;
  metrics.outdatedMajor = majors;
  if (majors > 5) add("outdated-major", "bakım", "info", `${majors} çalışma zamanı paketi bir major geride`);
}
function readJsonString(s, d) { try { return JSON.parse(s); } catch { return d; } }

// ---------- 6) Dış servis sağlığı ----------
async function probe(name, url, { headers = {}, expect = (res) => res.ok } = {}) {
  const t0 = Date.now();
  let ok = false, status = 0;
  try {
    const res = await fetch(url, { headers: { "user-agent": "NovaCode-Studio-health-monitor", ...headers }, signal: AbortSignal.timeout(HTTP_TIMEOUT_MS), redirect: "follow" });
    status = res.status;
    ok = await expect(res);
  } catch { /* zaman aşımı/ağ hatası = kapalı */ }
  const ms = Date.now() - t0;
  const prevDown = prev?.services?.[name]?.ok === false;
  metrics[`ms_${name}`] = ms;
  if (!ok) {
    // Tek seferlik kesinti geçici olabilir: ilk kez uyarı, art arda ikinci kez alarm
    add(`svc-${name}`, "servis", prevDown ? "alert" : "warn", `${name} yanıt vermiyor${status ? ` (HTTP ${status})` : ""}${prevDown ? " — art arda ikinci ölçüm" : ""}`);
  } else if (ms > SLOW_MS) {
    add(`svc-slow-${name}`, "servis", "warn", `${name} yavaş: ${ms} ms`);
  }
  return { ok, ms };
}

const services = {};
services.githubApi = await probe("GitHub API", "https://api.github.com/rate_limit");
services.openVsx = await probe("Open VSX (eklenti mağazası)", "https://open-vsx.org/api/-/search?size=1");
services.electronIndex = await probe("Electron sürüm dizini", "https://electronjs.org/headers/index.json", { expect: async (r) => r.ok });
if (process.env.NOVA_SYNC_HEALTH_URL) {
  // Adres gizli: ad dışında hiçbir yerde yazılmaz
  services.sync = await probe("Senkron sunucusu", process.env.NOVA_SYNC_HEALTH_URL, { expect: async (r) => r.ok && /NovaCode sync server/.test(await r.text()) });
}

// Senkron sunucusu metrikleri (/metrics, token ister): kapasite, bellek, hata ve saldırı işareti.
// Token yalnız bu istekte Authorization başlığıyla gider; hiçbir çıktıya yazılmaz.
if (process.env.NOVA_SYNC_HEALTH_URL && process.env.NOVA_SYNC_METRICS_TOKEN) {
  try {
    const url = new URL("metrics", process.env.NOVA_SYNC_HEALTH_URL.endsWith("/") ? process.env.NOVA_SYNC_HEALTH_URL : process.env.NOVA_SYNC_HEALTH_URL + "/");
    const res = await fetch(url, { headers: { authorization: `Bearer ${process.env.NOVA_SYNC_METRICS_TOKEN}`, "user-agent": "NovaCode-Studio-health-monitor" }, signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) });
    if (!res.ok) {
      add("sync-metrics", "senkron", "warn", `Senkron /metrics okunamadı (HTTP ${res.status}); token yanlış ya da sunucu eski sürüm`);
    } else {
      const text = await res.text();
      // Regex yok: satırları 'ad değer' olarak ayır (etiketli ölçü adı olduğu gibi anahtar olur)
      const table = new Map();
      for (const line of text.split('\n')) { if (!line || line.startsWith('#')) continue; const sp = line.lastIndexOf(' '); if (sp > 0) table.set(line.slice(0, sp), Number(line.slice(sp + 1))); }
      const val = (name) => table.get(name) ?? 0;
      const sm = {
        uptime: val("nova_sync_uptime_seconds"), conns: val("nova_sync_connections"), connsMax: val("nova_sync_connections_max"),
        rooms: val("nova_sync_rooms"), roomsMax: val("nova_sync_rooms_max"), rssMB: Math.round(val("nova_sync_memory_rss_bytes") / 1048576),
        errors: val("nova_sync_errors_total"), authRejects: val('nova_sync_rejected_total{reason="auth"}') + val('nova_sync_rejected_total{reason="blocked"}'), blockedIps: val("nova_sync_blocked_ips"),
      };
      Object.assign(metrics, Object.fromEntries(Object.entries(sm).map(([k, v]) => [`sync_${k}`, v])));
      const p = prev?.metrics || {};
      const restarted = typeof p.sync_uptime === "number" && sm.uptime < p.sync_uptime;
      if (restarted) add("sync-restart", "senkron", "warn", "Senkron sunucusu yeniden başlamış (çalışma süresi sıfırlandı)");
      // Sayaçlar yeniden başlatmada sıfırlanır: önceki ölçümden küçükse delta = güncel değer
      const delta = (cur, old) => (typeof old !== "number" || cur < old ? cur : cur - old);
      const dErr = delta(sm.errors, p.sync_errors);
      if (dErr > 0) add("sync-errors", "senkron", "warn", `Senkron sunucusu son ölçümden beri ${dErr} hata kaydetti`);
      const dAuth = delta(sm.authRejects, p.sync_authRejects);
      if (dAuth >= 50) add("sync-auth", "senkron", "warn", `Senkron sunucusuna ${dAuth} başarısız kimlik denemesi (saldırı işareti olabilir)`);
      if (sm.connsMax && sm.conns >= sm.connsMax * 0.8) add("sync-cap-conns", "senkron", "warn", `Senkron bağlantı kapasitesinin %80'i doldu (${sm.conns}/${sm.connsMax})`);
      if (sm.roomsMax && sm.rooms >= sm.roomsMax * 0.8) add("sync-cap-rooms", "senkron", "warn", `Senkron oda kapasitesinin %80'i doldu (${sm.rooms}/${sm.roomsMax})`);
      if (sm.rssMB > 400) add("sync-mem", "senkron", "warn", `Senkron sunucusu belleği yüksek: ${sm.rssMB} MB (limit 512 MB)`);
    }
  } catch { add("sync-metrics", "senkron", "warn", "Senkron /metrics zaman aşımına uğradı"); }
}

// Güncelleme servisi: son GitHub Release'te her platformun paketi ve latest.yml var mı?
{
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo) {
    try {
      const h = { accept: "application/vnd.github+json", "user-agent": "NovaCode-Studio-health-monitor", ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
      const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: h, signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) });
      if (!res.ok) add("release-missing", "servis", "warn", `Son release okunamadı (HTTP ${res.status})`);
      else {
        const rel = await res.json();
        const names = (rel.assets || []).map((a) => a.name);
        const need = { "latest.yml (otomatik güncelleme)": (n) => n === "latest.yml", "Windows .exe": (n) => n.endsWith(".exe"), "macOS .dmg/.zip": (n) => n.endsWith(".dmg") || n.endsWith(".zip"), "Linux .AppImage/.deb": (n) => n.endsWith(".AppImage") || n.endsWith(".deb") };
        const missing = Object.entries(need).filter(([, f]) => !names.some(f)).map(([k]) => k);
        metrics.latestRelease = rel.tag_name;
        if (missing.length) add("release-assets", "servis", "alert", `${rel.tag_name} release'inde eksik varlık: ${missing.join(", ")}`);
        const ageDays = Math.floor((Date.now() - new Date(rel.published_at).getTime()) / 864e5);
        metrics.latestReleaseAgeDays = ageDays;
        if (ageDays > 60) add("release-stale", "bakım", "info", `Son sürüm ${ageDays} gün önce yayınlandı`);
      }
    } catch { add("release-missing", "servis", "warn", "Son release kontrolü zaman aşımına uğradı"); }
  }
}

// ---------- Sonuç ----------
const order = { alert: 0, warn: 1, info: 2 };
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.id.localeCompare(b.id));
const alerts = findings.filter((f) => f.sev === "alert").length;
const warns = findings.filter((f) => f.sev === "warn").length;
const status = alerts ? "alert" : warns ? "warn" : "ok";
const fingerprint = createHash("sha256").update(findings.filter((f) => f.sev !== "info").map((f) => `${f.id}:${f.sev}`).join("|")).digest("hex").slice(0, 12);
const now = new Date().toISOString();

// probe() geçmişi görünen ada göre arar
const svcByName = {};
for (const [name, key] of [["GitHub API", "githubApi"], ["Open VSX (eklenti mağazası)", "openVsx"], ["Electron sürüm dizini", "electronIndex"], ["Senkron sunucusu", "sync"]]) if (services[key]) svcByName[name] = { ok: services[key].ok };

const report = { generatedAt: now, status, alerts, warns, fingerprint, metrics, findings };
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));

const icon = { alert: "🔴", warn: "🟡", info: "ℹ️" };
const md = [
  `### Sağlık ve güvenlik izleme — ${status === "ok" ? "🟢 sağlıklı" : status === "warn" ? "🟡 uyarı" : "🔴 alarm"}`,
  `Ölçüm: ${now} · alarm ${alerts} · uyarı ${warns}`,
  "",
  findings.length ? findings.map((f) => `- ${icon[f.sev]} **${f.area}:** ${f.title}`).join("\n") : "Açık bulgu yok.",
  "",
  "| Metrik | Değer |", "|---|---|",
  ...Object.entries(metrics).filter(([, v]) => typeof v !== "object").map(([k, v]) => `| ${k} | ${v} |`),
  "",
].join("\n");
writeFileSync(join(OUT_DIR, "report.md"), md);
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `status=${status}\nalerts=${alerts}\nwarns=${warns}\nfingerprint=${fingerprint}\n`);

// Geçmiş (eğilim için): son 60 ölçüm
mkdirSync(dirname(HISTORY_FILE), { recursive: true });
history.runs.push({ at: now, status, metrics, services: svcByName });
history.runs = history.runs.slice(-HISTORY_MAX);
writeFileSync(HISTORY_FILE, JSON.stringify(history));
