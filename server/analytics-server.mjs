// Anonim kullanım sayacı toplama sunucusu (kendi sunucunda, bağımlılık yok). Kural: docs/brain/actions/analytics.md
//   POST /v1/ingest   uygulamadan günde bir toplu sayaç (kimlik yok). Yanıt 204.
//   GET  /v1/stats    yalnız Bearer ANALYTICS_TOKEN ile; son N günün toplamları (?days=30).
//   GET  /healthz     canlılık.
// KVKK: kayıt tutulmaz. Saklanan yalnız GÜNLÜK TOPLAM sayaçlardır (sürüm, işletim sistemi, dil ve olay için ayrı ayrı marjinal sayılar;
// bunların birleşimi/kombinasyonu saklanmaz, tek bir yükün izi kalmaz). IP, başlık, user-agent diske veya konsola yazılmaz;
// hız sınırı yalnız bellekte tutulur ve saatlik silinir. Ters vekil (Caddy/nginx) erişim günlüğünü KAPALI tutmalıdır.
// Ortam: ANALYTICS_TOKEN (zorunlu, ≥24 karakter), PORT (8788), HOST (127.0.0.1), ANALYTICS_DATA (./analytics-data), RETENTION_DAYS (400).
import http from "node:http";
import { mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync, renameSync, existsSync } from "node:fs";
import { join } from "node:path";
import { timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";

export const EVENTS = ["app_start", "panel_files", "panel_search", "panel_git", "panel_extensions", "panel_debug", "panel_terminal", "panel_ai", "panel_settings", "file_save", "code_run"];
const OSES = ["win", "mac", "linux"];
const LANGS = ["tr", "en", "de", "ru", "ar", "es", "fr", "az"];
const SEMVER = /^\d+\.\d+\.\d+$/;
const MAX_BODY = 2048;
const MAX_COUNT = 100000;

// Yükü katı biçimde doğrular; geçersizse null. Fazla alan = ret (kimlik sızdırma girişimi dahil).
export function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const keys = Object.keys(body).sort().join(",");
  if (keys !== "app,counts,lang,os,v") return null;
  if (body.v !== 1 || typeof body.app !== "string" || !SEMVER.test(body.app) || body.app.length > 20) return null;
  if (!OSES.includes(body.os) || !LANGS.includes(body.lang)) return null;
  const c = body.counts;
  if (!c || typeof c !== "object" || Array.isArray(c)) return null;
  const out = {};
  for (const [k, n] of Object.entries(c)) {
    if (!EVENTS.includes(k) || !Number.isInteger(n) || n < 1 || n > MAX_COUNT) return null;
    out[k] = n;
  }
  if (!Object.keys(out).length) return null;
  return { app: body.app, os: body.os, lang: body.lang, counts: out };
}

const emptyDay = () => ({ batches: 0, version: {}, os: {}, lang: {}, counts: {} });
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
export function addToDay(day, p) {
  day.batches++;
  bump(day.version, p.app); bump(day.os, p.os); bump(day.lang, p.lang);
  for (const [k, n] of Object.entries(p.counts)) bump(day.counts, k, n);
  return day;
}
export const utcDay = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10);

export function createStore(dir, retentionDays = 400) {
  mkdirSync(dir, { recursive: true });
  const fileOf = (d) => join(dir, `${d}.json`);
  const read = (d) => { try { return JSON.parse(readFileSync(fileOf(d), "utf8")); } catch { return emptyDay(); } };
  return {
    add(p, day = utcDay()) {
      const d = addToDay(read(day), p);
      const tmp = fileOf(day) + ".tmp";
      writeFileSync(tmp, JSON.stringify(d)); renameSync(tmp, fileOf(day));
    },
    stats(days) {
      const total = emptyDay(); const perDay = {};
      for (let i = 0; i < days; i++) {
        const d = utcDay(Date.now() - i * 86400000);
        if (!existsSync(fileOf(d))) continue;
        const x = read(d); perDay[d] = { batches: x.batches, counts: x.counts };
        total.batches += x.batches;
        for (const g of ["version", "os", "lang", "counts"]) for (const [k, n] of Object.entries(x[g])) bump(total[g], k, n);
      }
      return { days, total, perDay };
    },
    prune() {
      const cutoff = utcDay(Date.now() - retentionDays * 86400000);
      for (const f of readdirSync(dir)) if (/^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f.slice(0, 10) < cutoff) unlinkSync(join(dir, f));
    },
  };
}

function safeEq(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function createServer({ token, store, rateLimit = 20 }) {
  let hits = new Map(); // yalnız bellek; kalıcı değil
  const timer = setInterval(() => { hits = new Map(); }, 3600 * 1000); if (timer.unref) timer.unref();
  const server = http.createServer((req, res) => {
    const end = (code, body, type = "application/json") => { res.writeHead(code, { "content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff" }); res.end(body); };
    const url = new URL(req.url || "/", "http://x");
    if (req.method === "GET" && url.pathname === "/healthz") return end(200, '{"ok":true}');
    if (req.method === "GET" && url.pathname === "/v1/stats") {
      const m = /^Bearer (.+)$/.exec(req.headers.authorization || "");
      if (!m || !safeEq(m[1], token)) return end(401, '{"error":"unauthorized"}');
      const days = Math.min(Math.max(parseInt(url.searchParams.get("days") || "30", 10) || 30, 1), 400);
      return end(200, JSON.stringify(store.stats(days)));
    }
    if (req.method === "POST" && url.pathname === "/v1/ingest") {
      const ip = req.socket.remoteAddress || "?";
      const n = (hits.get(ip) || 0) + 1; hits.set(ip, n);
      if (n > rateLimit) return end(429, '{"error":"rate"}');
      let size = 0; const chunks = [];
      req.on("data", (c) => { size += c.length; if (size > MAX_BODY) { req.destroy(); } else chunks.push(c); });
      req.on("end", () => {
        let p = null;
        try { p = validate(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch { /* geçersiz */ }
        if (!p) return end(400, '{"error":"invalid"}');
        store.add(p);
        res.writeHead(204, { "cache-control": "no-store" }); res.end();
      });
      return;
    }
    end(404, '{"error":"not found"}');
  });
  server.on("close", () => clearInterval(timer));
  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const token = process.env.ANALYTICS_TOKEN || "";
  if (token.length < 24) { console.error("ANALYTICS_TOKEN en az 24 karakter olmalı."); process.exit(1); }
  const store = createStore(process.env.ANALYTICS_DATA || "./analytics-data", parseInt(process.env.RETENTION_DAYS || "400", 10) || 400);
  store.prune(); setInterval(() => store.prune(), 24 * 3600 * 1000).unref();
  const port = parseInt(process.env.PORT || "8788", 10);
  createServer({ token, store }).listen(port, process.env.HOST || "127.0.0.1", () => console.log(`analytics sunucusu :${port} (kayıt tutulmaz)`));
}
