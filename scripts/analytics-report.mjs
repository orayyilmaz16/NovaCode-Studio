// Anonim analitik raporu: toplama sunucusundan toplam sayıları okuyup okunur tablo olarak yazar (kişi/IP yok, zaten toplanmıyor).
// Kullanım: ANALYTICS_URL=https://<adres> ANALYTICS_TOKEN=<TOKEN> node scripts/analytics-report.mjs [--days 30] [--json]
// Token yalnız ortam değişkeninden okunur; ekrana, dosyaya veya komut satırına yazılmaz.
import { pathToFileURL } from "node:url";
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

export function normalizeBase(u) {
  try {
    const x = new URL(String(u || ""));
    const local = x.hostname === "127.0.0.1" || x.hostname === "localhost";
    if (x.username || x.password) return "";
    if (x.protocol === "https:" || (x.protocol === "http:" && local)) return x.origin;
  } catch { /* geçersiz */ }
  return "";
}

export function render(stats) {
  const sorted = (o) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]);
  const section = (title, o) => `\n${title}\n` + (sorted(o).map(([k, n]) => `  ${k.padEnd(18)} ${String(n).padStart(8)}`).join("\n") || "  (veri yok)");
  const days = Object.keys(stats.perDay || {}).sort();
  const trend = days.slice(-14).map((d) => `  ${d}  gönderim ${String(stats.perDay[d].batches).padStart(5)}`).join("\n") || "  (veri yok)";
  return [
    `Son ${stats.days} gün · toplu gönderim: ${stats.total.batches}  (≈ günlük aktif kurulum toplamı; kimlik olmadığı için tekil kişi sayılamaz)`,
    section("Olaylar (toplam sayı)", stats.total.counts),
    section("İşletim sistemi (gönderim)", stats.total.os),
    section("Dil (gönderim)", stats.total.lang),
    section("Sürüm (gönderim)", stats.total.version),
    "\nGünlük gönderim (son 14 gün)\n" + trend,
  ].join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const base = normalizeBase(process.env.ANALYTICS_URL);
  const token = process.env.ANALYTICS_TOKEN || "";
  if (!base || token.length < 24) { console.error("ANALYTICS_URL (https) ve ANALYTICS_TOKEN (≥24 karakter) ortam değişkenleri gerekli."); process.exit(2); }
  const days = Math.min(Math.max(parseInt(val("--days", "30"), 10) || 30, 1), 400);
  const res = await fetch(`${base}/v1/stats?days=${days}`, { headers: { authorization: `Bearer ${token}` }, redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!res.ok) { console.error(`Sunucu yanıtı: HTTP ${res.status}`); process.exit(1); }
  const stats = await res.json();
  console.log(flag("--json") ? JSON.stringify(stats, null, 2) : render(stats));
}
