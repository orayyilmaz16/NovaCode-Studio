// Anonim kullanım sayacı (ana süreç). Kural ve KVKK envanteri: docs/brain/actions/analytics.md
//
// İLKELER (gevşetilmez):
//  - Açık rıza olmadan hiçbir şey sayılmaz, saklanmaz, gönderilmez (varsayılan KAPALI). Rıza yalnız kullanıcının kendi eyleminden gelir;
//    ayar içe aktarma ile açılamaz (settings.parseImport). Rıza geri alınınca birikmiş sayaçlar silinir.
//  - KİMLİK YOK: cihaz/kurulum/oturum kimliği, çerez, kullanıcı adı, yol, dosya adı, içerik, IP saklama yok. Gönderilen yalnız:
//    { v, app (sürüm), os (win|mac|linux), lang (8 arayüz dilinden biri), counts: { <izinli olay>: sayı } }.
//    Tarih bile gönderilmez (sunucu kendi gününü yazar). Kimlik olmadığı için sunucu kişiyi yeniden tanıyamaz (anonim).
//  - Olaylar sabit izin listesindedir (EVENTS); bilinmeyen ad sessizce atılır. Sayılar üst sınırlıdır.
//  - Günde en çok bir toplu gönderim. Adres derleme zamanı sabitidir (ENDPOINT); boşsa hiçbir ağ isteği ve sayım olmaz.
//  - Ağ yalnız bu süreçten çıkar (renderer'dan değil), yalnız https (geliştirmede 127.0.0.1 http), çerezsiz, 10 sn zaman aşımı.
const fs = require('fs');
const path = require('path');

// Toplama sunucusu adresi (https). Sunucu kurulunca (server/analytics-server.mjs) buraya yazılır; boşken analitik tamamen kapalıdır.
const ENDPOINT = '';

const EVENTS = Object.freeze([
  'app_start', 'panel_files', 'panel_search', 'panel_git', 'panel_extensions', 'panel_debug',
  'panel_terminal', 'panel_ai', 'panel_settings', 'file_save', 'code_run',
  // Dil dağılımı: açılan dosyanın DİLİ (içerik, ad, yol değil). Sabit liste dışındakiler lang_other olur.
  'lang_javascript', 'lang_typescript', 'lang_python', 'lang_html', 'lang_css', 'lang_json', 'lang_markdown', 'lang_rust', 'lang_go',
  'lang_java', 'lang_csharp', 'lang_cpp', 'lang_php', 'lang_ruby', 'lang_shell', 'lang_sql', 'lang_yaml', 'lang_other',
  // Oturum/güncelleme/sağlık: yalnız SAYI (hesap adı, sürüm metni, hata mesajı yok)
  'github_login', 'github_logout', 'update_check', 'update_install', 'app_error',
]);
const OSES = Object.freeze(['win', 'mac', 'linux']);
const LANGS = Object.freeze(['tr', 'en', 'de', 'ru', 'ar', 'es', 'fr', 'az']);
const MAX_COUNT = 100000;
const SEMVER = /^\d+\.\d+\.\d+$/;

const osOf = (platform) => ({ win32: 'win', darwin: 'mac', linux: 'linux' }[platform] || '');
const localDay = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// https zorunlu; yalnız geliştirmede yerel http. Geçersiz = '' (analitik kapalı).
function normalizeEndpoint(url, allowLocal) {
  try {
    const u = new URL(String(url || ''));
    if (u.username || u.password) return '';
    if (u.protocol === 'https:') return u.toString();
    if (allowLocal && u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost')) return u.toString();
  } catch { /* geçersiz */ }
  return '';
}

function createAnalytics({ file, endpoint, version, platform, fetchFn, now = Date.now, fsImpl = fs }) {
  const base = { enabled: false, asked: false, consentAt: 0, lastSentDay: '', counts: {} };
  let st = { ...base };
  let lang = '';
  let timer = null;
  try {
    const j = JSON.parse(fsImpl.readFileSync(file, 'utf8'));
    st.enabled = j.enabled === true;
    st.asked = j.asked === true;
    st.consentAt = Number(j.consentAt) || 0;
    st.lastSentDay = typeof j.lastSentDay === 'string' ? j.lastSentDay.slice(0, 10) : '';
    for (const k of EVENTS) { const n = Number(j.counts && j.counts[k]); if (n > 0) st.counts[k] = Math.min(n, MAX_COUNT); }
  } catch { /* ilk çalıştırma */ }
  if (!endpoint) st = { ...base, asked: st.asked };

  const configured = () => !!endpoint;
  const active = () => configured() && st.enabled;

  function save() {
    clearTimeout(timer); timer = null;
    try {
      fsImpl.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.tmp`;
      fsImpl.writeFileSync(tmp, JSON.stringify(st));
      fsImpl.renameSync(tmp, file);
    } catch { /* yazılamadıysa sayaç bellekte kalır */ }
  }
  const saveSoon = () => { if (!timer) { timer = setTimeout(save, 5000); if (timer.unref) timer.unref(); } };

  const api = {
    status: () => ({ configured: configured(), enabled: active(), asked: st.asked }),
    setConsent(on) {
      on = on === true;
      if (on === st.enabled) return api.status();
      st.enabled = on && configured();
      if (st.enabled) st.consentAt = now();
      else { st.counts = {}; st.consentAt = 0; } // geri alma: birikmiş her şey silinir
      save();
      return api.status();
    },
    markAsked() { if (!st.asked) { st.asked = true; save(); } return api.status(); },
    setLang(l) { lang = LANGS.includes(l) ? l : ''; },
    track(name) {
      if (!active() || !EVENTS.includes(name)) return false;
      st.counts[name] = Math.min((st.counts[name] || 0) + 1, MAX_COUNT);
      saveSoon();
      return true;
    },
    // Gönderilecek tam yük; test ve şeffaflık için dışarı açıktır.
    buildPayload() {
      const os = osOf(platform);
      if (!SEMVER.test(String(version)) || !os || !lang) return null;
      const counts = {};
      for (const k of EVENTS) if (st.counts[k] > 0) counts[k] = Math.min(st.counts[k], MAX_COUNT);
      if (!Object.keys(counts).length) return null;
      return { v: 1, app: String(version), os, lang, counts };
    },
    async flush() {
      if (!active()) return { sent: false, reason: 'inactive' };
      const today = localDay(now());
      if (st.lastSentDay === today) return { sent: false, reason: 'already-sent-today' };
      const payload = api.buildPayload();
      if (!payload) return { sent: false, reason: 'nothing' };
      try {
        const res = await fetchFn(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'user-agent': 'NovaCode-Analytics' },
          body: JSON.stringify(payload),
          credentials: 'omit',
          redirect: 'error',
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { sent: false, reason: `http-${res.status}` };
        st.counts = {}; st.lastSentDay = today; save();
        return { sent: true };
      } catch {
        return { sent: false, reason: 'network' }; // sayaçlar korunur, sonraki denemede gider
      }
    },
    flushToDisk: save,
  };
  return api;
}

function register({ app, ipcMain, net }) {
  const ep = normalizeEndpoint(!app.isPackaged && process.env.NOVA_ANALYTICS_URL ? process.env.NOVA_ANALYTICS_URL : ENDPOINT, !app.isPackaged);
  const a = createAnalytics({
    file: path.join(app.getPath('userData'), 'analytics.json'),
    endpoint: ep,
    version: app.getVersion(),
    platform: process.platform,
    fetchFn: (u, o) => net.fetch(u, o),
  });
  ipcMain.handle('analytics:status', () => a.status());
  ipcMain.handle('analytics:set-consent', (_e, on) => a.setConsent(on));
  ipcMain.handle('analytics:mark-asked', () => a.markAsked());
  ipcMain.handle('analytics:payload', () => a.buildPayload()); // "ne gönderiliyor?" şeffaflığı
  ipcMain.on('analytics:set-lang', (_e, l) => a.setLang(l));
  ipcMain.on('analytics:track', (_e, name) => { if (typeof name === 'string') a.track(name); });
  const tick = () => { void a.flush(); };
  const first = setTimeout(tick, 60 * 1000); if (first.unref) first.unref();
  const every = setInterval(tick, 3 * 60 * 60 * 1000); if (every.unref) every.unref();
  app.on('before-quit', () => a.flushToDisk());
  return a;
}

module.exports = { register, createAnalytics, normalizeEndpoint, EVENTS, OSES, LANGS };
