// i18n eksiksizlik testi (T-03): 6 uiText sözlüğünde 8 dil dolu mu, şüpheli aynı metinler, kullanılmayan anahtarlar (uyarı), AI rıza/güven kartı MSG tablosu.
// Hata: boş/eksik dil, tanımsız ek dil. Uyarı (hata değil): >=4 dilde aynı metin (tr==en hariç), kullanılmayan anahtar. Çalıştırma: node scripts/tests/i18n.test.cjs [--verbose]
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LANGS = ['tr', 'en', 'de', 'ru', 'ar', 'es', 'fr', 'az'];
const verbose = process.argv.includes('--verbose');
let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };
const warn = (m) => console.log('uyarı', m);
const root = path.join(__dirname, '..', '..');

// Kısa terimler, marka adları ve kısaltmalar diller arası aynı kalabilir: yalnız uzun metinler şüpheli sayılır.
const SAME_MIN_LEN = 12;

function checkDict(file, name, dict) {
  const keys = Object.keys(dict);
  let bad = 0;
  const suspicious = [];
  for (const k of keys) {
    const e = dict[k];
    const missing = LANGS.filter((l) => typeof e[l] !== 'string' || !e[l].trim());
    const extra = Object.keys(e).filter((l) => !LANGS.includes(l));
    if (missing.length || extra.length) { bad++; ok(false, `${file}: ${k} eksik/boş dil [${missing}] fazla dil [${extra}]`); continue; }
    // Yer tutucu ({host}, {n}) her dilde aynı olmalı
    const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',');
    const base = ph(e.en);
    const diff = LANGS.filter((l) => ph(e[l]) !== base);
    if (diff.length) { bad++; ok(false, `${file}: ${k} yer tutucular en ile uyuşmuyor [${diff}]`, base); }
    // tr==en dışında >=4 dilde aynı mı
    const counts = new Map();
    for (const l of LANGS) { if (l === 'tr') continue; const v = e[l].trim(); counts.set(v, (counts.get(v) || 0) + 1); }
    const [txt, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (n >= 4 && txt.length >= SAME_MIN_LEN) suspicious.push(k);
  }
  ok(bad === 0, `${file}: ${keys.length} anahtarın tamamında 8 dil dolu`);
  if (suspicious.length) warn(`${file}: ${suspicious.length} anahtarda >=4 dilde aynı uzun metin (çeviri eksik olabilir)${verbose ? ': ' + suspicious.join(', ') : ''}`);
  return keys;
}

(async () => {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  const all = [];
  try {
    const files = [['uiText', 'UI_TEXT'], ['uiTextAi', 'AI_TEXT'], ['uiTextComp', 'COMP_TEXT'], ['uiTextDev', 'DEV_TEXT'], ['uiTextScm', 'SCM_TEXT'], ['uiTextTheme', 'THEME_TEXT']];
    const seen = new Map();
    for (const [f, exp] of files) {
      const mod = await vite.ssrLoadModule(`/src/i18n/${f}.ts`);
      ok(mod[exp] && typeof mod[exp] === 'object', `${f}: ${exp} dışa aktarılıyor`);
      const keys = checkDict(f, exp, mod[exp] || {});
      for (const k of keys) {
        if (seen.has(k)) ok(false, `${f}: "${k}" anahtarı ${seen.get(k)} içinde de tanımlı (çakışma)`);
        else seen.set(k, f);
        all.push(k);
      }
    }
  } finally {
    await vite.close();
  }

  // Kullanılmayan anahtarlar: src altında (i18n sözlükleri hariç) anahtar adı geçmiyor. Dinamik anahtarlar yanlış pozitif verebilir.
  const srcFiles = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx?|json)$/.test(e.name) && !/[\\/]i18n[\\/]uiText\w*\.ts$/.test(p)) srcFiles.push(p);
    }
  })(path.join(root, 'src'));
  const blob = srcFiles.map((p) => fs.readFileSync(p, 'utf8')).join('\n');
  // i18n dosyalarının kendi içinde (yardımcı/anahtar listeleri) kullanılanları da say: sözlük dışı kısımlar için dosya başı/sonu yeterli değil, bu yüzden yalnız src dışı aranır.
  const unused = all.filter((k) => !blob.includes(k));
  if (unused.length) warn(`${unused.length}/${all.length} anahtar src içinde (t('...') veya ad olarak) geçmiyor; dinamik anahtar olabilir${verbose ? ': ' + unused.join(', ') : ' (tam liste için --verbose)'}`);
  else console.log('ok   kullanılmayan anahtar yok');

  // AI rıza/güven kartı MSG tablosu (brain:check bunu görmüyor)
  const src = fs.readFileSync(path.join(root, 'electron-ai.cjs'), 'utf8');
  const start = src.indexOf('const MSG = {');
  const end = src.indexOf('\nconst tx = ', start);
  ok(start >= 0 && end > start, 'electron-ai.cjs: MSG tablosu bulundu');
  if (start >= 0 && end > start) {
    const MSG = vm.runInNewContext(`(${src.slice(start + 'const MSG = '.length, end).trim().replace(/;$/, '')})`);
    const keys = Object.keys(MSG);
    ok(['trustTitle', 'trustBody', 'consentTitle', 'consentBody', 'baseNote', 'denied'].every((k) => keys.includes(k)), 'MSG: güven/rıza anahtarları var');
    for (const k of keys) {
      const missing = LANGS.filter((l) => typeof MSG[k][l] !== 'string' || !MSG[k][l].trim());
      ok(missing.length === 0, `MSG.${k}: 8 dil dolu`, `eksik: ${missing}`);
      const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');
      ok(LANGS.every((l) => ph(MSG[k][l]) === ph(MSG[k].en)), `MSG.${k}: yer tutucular tüm dillerde aynı`);
    }
    ok(LANGS.every((l) => MSG.consentTitle[l].includes('{host}')), 'MSG.consentTitle: {host} her dilde var');
    const tail = src.slice(end);
    const used = [...src.matchAll(/\btx\('(\w+)'/g)].map((m) => m[1]);
    ok(used.every((k) => keys.includes(k)), 'tx() çağrılarının tümü MSG içinde tanımlı', used.filter((k) => !keys.includes(k)).join(','));
    void tail;
  }
  console.log(fails ? `\n${fails} test BAŞARISIZ` : '\nTüm i18n testleri geçti');
})().catch((e) => { console.error(e); process.exit(1); });
