// Ayar geçişi (v1 → v2 → v3) testi: eski AI tamamlama varsayılanları Hızlı profile taşınır, kullanıcının özel değerleri korunur.
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
    ok(s.aiCompletionDelay === 100 && s.aiCompletionCooldown === 100 && s.aiCompletionMaxTokens === 32 && s.aiCompletionPrefix === 2000 && s.aiCompletionSuffix === 600 && s.aiCompletionEffort === 'fast' && s.aiCompletionTemperature === 0.05, 'v1 eski varsayılanlar zincirle (v2 → v3) Hızlı profile taşınır', JSON.stringify({ d: s.aiCompletionDelay, c: s.aiCompletionCooldown, t: s.aiCompletionMaxTokens, e: s.aiCompletionEffort }));
    ok(s.fontSize === 18, 'ilgisiz ayar korunur');

    // 2) v1 kayıt, kullanıcı kendi değerini seçmiş: dokunulmaz
    store.set(KEY, JSON.stringify({ v: 1, values: { ...OLD, aiCompletionDelay: 700, aiCompletionPrefix: 9000 } }));
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 700 && s.aiCompletionPrefix === 9000, 'kullanıcının özel değerleri korunur');
    ok(s.aiCompletionMaxTokens === 64 && s.aiCompletionCooldown === 300 && s.aiCompletionDelay === 700, 'özel olmayanlar v2 değerine geçer; biri bile özelse (gecikme 700) v3 Hızlı profile ZORLANMAZ');

    // 3) v2 kayıt: kullanıcı bilerek eski değeri seçtiyse geçiş uygulanmaz
    store.set(KEY, JSON.stringify({ v: 2, values: { ...OLD } }));
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 450 && s.aiCompletionMaxTokens === 80, 'v2 kayıtta geçiş yok (bilinçli seçim korunur)');

    // 4) v2 kayıt, tüm değerler v2 Dengeli varsayılanı: v3'te yeni varsayılan Hızlı profile geçer
    store.set(KEY, JSON.stringify({ v: 2, values: { aiCompletionEffort: 'balanced', aiCompletionDelay: 250, aiCompletionCooldown: 300, aiCompletionMaxTokens: 64, aiCompletionPrefix: 4000, aiCompletionSuffix: 1500, aiCompletionTemperature: 0.1 } }));
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 100 && s.aiCompletionMaxTokens === 32 && s.aiCompletionEffort === 'fast', 'v2 Dengeli varsayılanında kalan kullanıcı Hızlı profile geçer');
    // 4b) v2 kayıt, bir değer bilerek değiştirilmiş: dokunulmaz
    store.set(KEY, JSON.stringify({ v: 2, values: { aiCompletionEffort: 'balanced', aiCompletionDelay: 250, aiCompletionCooldown: 300, aiCompletionMaxTokens: 64, aiCompletionPrefix: 5000, aiCompletionSuffix: 1500 } }));
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 250 && s.aiCompletionPrefix === 5000 && s.aiCompletionEffort === 'balanced', 'v2 kayıtta bir ayar bile özelse (önceki bağlam 5000) v3 geçişi uygulanmaz');
    // 5) v3 kayıt: dokunulmaz
    store.set(KEY, JSON.stringify({ v: 3, values: { aiCompletionEffort: 'balanced', aiCompletionDelay: 250, aiCompletionCooldown: 300, aiCompletionMaxTokens: 64, aiCompletionPrefix: 4000, aiCompletionSuffix: 1500 } }));
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 250 && s.aiCompletionEffort === 'balanced', 'v3 kayıtta geçiş yok (bilinçli seçim korunur)');

    // 5b) v3 kayıt, tamamlama modeli eski varsayılan (7b): v4'te 0.5b'ye geçer; başka seçim korunur
    store.set(KEY, JSON.stringify({ v: 3, values: { aiCompletionModel: 'qwen2.5-coder:7b' } }));
    ok(m.loadSettings().values.aiCompletionModel === 'qwen2.5-coder:0.5b', 'v3 kayıtta eski varsayılan model 0.5b olur');
    store.set(KEY, JSON.stringify({ v: 3, values: { aiCompletionModel: 'qwen2.5-coder:1.5b' } }));
    ok(m.loadSettings().values.aiCompletionModel === 'qwen2.5-coder:1.5b', 'v3 kayıtta özel model korunur');
    store.set(KEY, JSON.stringify({ v: 4, values: { aiCompletionModel: 'qwen2.5-coder:7b' } }));
    ok(m.loadSettings().values.aiCompletionModel === 'qwen2.5-coder:7b', 'v4 kayıtta bilinçli 7b seçimi korunur');

    // 6) Kayıt sürümü v4 yazılır; kayıt yoksa yeni varsayılanlar (Hızlı)
    m.saveSettings({ values: s });
    ok(JSON.parse(store.get(KEY)).v === 4, 'kayıt v4 olarak yazılır');
    store.clear();
    s = m.loadSettings().values;
    ok(s.aiCompletionDelay === 100 && s.aiCompletionCooldown === 100 && s.aiCompletionEffort === 'fast' && s.aiCompletionModel === 'qwen2.5-coder:0.5b' && s.aiAskModel === 'qwen2.5-coder:7b', 'kayıt yokken varsayılanlar: Hızlı profil, tamamlama 0.5b, sohbet 7b');
    ok(m.sanitizeAll({ aiCompletionDelay: -5 }).aiCompletionDelay === 0 && m.sanitizeAll({ aiCompletionDelay: 99999 }).aiCompletionDelay === 3000, 'tamamlama süresi sınırı 0–3000 ms');
    ok(m.sanitizeAll({ aiCompletionEffort: 'instant' }).aiCompletionEffort === 'instant' && m.sanitizeAll({ aiCompletionEffort: 'bogus' }).aiCompletionEffort === 'fast', 'Anında profili geçerli, bilinmeyen değer varsayılana döner');
  } finally {
    await vite.close();
  }
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm testler geçti');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('HATA', e); process.exit(1); });
