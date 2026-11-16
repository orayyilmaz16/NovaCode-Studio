// Ayar geçişi (v1 → v2) testi: eski AI tamamlama varsayılanları yeni hızlı varsayılanlara taşınır, kullanıcının özel değerleri korunur.
// Gerçek src/services/settings.ts, Vite SSR yükleyicisiyle çalıştırılır. Çalıştırma: node scripts/tests/settings-migrate.test.cjs
const path = require('path');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };

(async () => {
  const root = path.join(__dirname, '..', '..');
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const store = new Map();
    globalThis.window = { localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) } };
    const m = await vite.ssrLoadModule('/src/services/settings.ts');
    const KEY = m.STORAGE_KEY;
    const OLD = { aiCompletionDelay: 450, aiCompletionCooldown: 600, aiCompletionMaxTokens: 80, aiCompletionPrefix: 6000, aiCompletionSuffix: 2000 };

    // 1) v1 kayıt, eski varsayılanlar: yeni varsayılana taşınır
    store.set(KEY, JSON.stringify({ v: 1, values: { ...OLD, fontSize: 18 } }));
    let s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 250 && s.aiCompletionCooldown === 300 && s.aiCompletionMaxTokens === 64 && s.aiCompletionPrefix === 4000 && s.aiCompletionSuffix === 1500, 'eski varsayılanlar yeni hızlı varsayılanlara taşınır', JSON.stringify(s));
    ok(s.fontSize === 18, 'ilgisiz ayar korunur');

    // 2) v1 kayıt, kullanıcı kendi değerini seçmiş: dokunulmaz
    store.set(KEY, JSON.stringify({ v: 1, values: { ...OLD, aiCompletionDelay: 700, aiCompletionPrefix: 9000 } }));
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 700 && s.aiCompletionPrefix === 9000, 'kullanıcının özel değerleri korunur');
    ok(s.aiCompletionMaxTokens === 64, 'özel olmayanlar yine yeni varsayılana geçer');

    // 3) v2 kayıt: kullanıcı bilerek eski değeri seçtiyse geçiş uygulanmaz
    store.set(KEY, JSON.stringify({ v: 2, values: { ...OLD } }));
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 450 && s.aiCompletionMaxTokens === 80, 'v2 kayıtta geçiş yok (bilinçli seçim korunur)');

    // 4) Kayıt sürümü v2 yazılır; kayıt yoksa yeni varsayılanlar
    m.saveSettings({ values: s });
    ok(JSON.parse(store.get(KEY)).v === 2, 'kayıt v2 olarak yazılır');
    store.clear();
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 250 && s.aiCompletionCooldown === 300, 'kayıt yokken varsayılanlar hızlı değerler');
    ok(m.sanitizeAll({ aiCompletionDelay: 50 }).aiCompletionDelay === 100, 'gecikme alt sınırı 100 ms');
  } finally {
    await vite.close();
  }
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm testler geçti');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('HATA', e); process.exit(1); });
