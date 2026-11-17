// Renk temaları testi: her tema geçerli renkler üretir, okunabilirlik (WCAG kontrastı) eşiklerini geçer, şema ile tablo tutarlıdır.
// Gerçek src/services/palettes.ts + settings.ts Vite SSR yükleyicisiyle çalışır. Çalıştırma: node scripts/tests/palettes.test.cjs
const path = require('path');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.replace('#', '').slice(i - 1, i + 1), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

(async () => {
  const root = path.join(__dirname, '..', '..');
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const store = new Map();
    globalThis.window = { localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) } };
    const P = await vite.ssrLoadModule('/src/services/palettes.ts');
    const S = await vite.ssrLoadModule('/src/services/settings.ts');
    const hex = /^#[0-9a-f]{6}$/i;

    ok(P.PALETTE_IDS.length >= 10, `en az 10 renk teması var (${P.PALETTE_IDS.length})`);
    const dark = P.PALETTE_IDS.filter((i) => P.PALETTES[i].mode === 'dark').length;
    ok(dark >= 4 && P.PALETTE_IDS.length - dark >= 3, `hem koyu (${dark}) hem açık (${P.PALETTE_IDS.length - dark}) tema yeterli`);

    for (const id of P.PALETTE_IDS) {
      const p = P.PALETTES[id];
      const v = P.paletteVars(p);
      ok(Object.values(v).filter((x) => x.startsWith('#')).every((x) => hex.test(x)), `${id}: tüm yüzey değişkenleri geçerli hex`);
      ok(Object.keys(v).length === P.PALETTE_VAR_KEYS.length, `${id}: değişken kümesi tam`);
      const body = contrast(p.fg, p.editor);
      ok(body >= 7, `${id}: gövde metni kontrastı ≥ 7 (${body.toFixed(1)})`);
      ok(contrast(v['--color-zinc-400'], p.editor) >= 3.5, `${id}: ikincil metin (zinc-400) kontrastı ≥ 3.5 (${contrast(v['--color-zinc-400'], p.editor).toFixed(1)})`);
      ok(contrast(v['--color-zinc-500'], p.editor) >= 2.5, `${id}: soluk metin (zinc-500) kontrastı ≥ 2.5 (${contrast(v['--color-zinc-500'], p.editor).toFixed(1)})`);
      for (const [name, c] of Object.entries(p.tokens)) {
        const min = name === 'comment' ? 2.8 : 4;
        const r = contrast('#' + c, p.editor);
        ok(r >= min, `${id}: sözdizimi ${name} kontrastı ≥ ${min} (${r.toFixed(1)})`);
      }
      ok(contrast(p.fg, p.side) >= 6.5, `${id}: panel üstünde gövde metni kontrastı ≥ 6.5 (${contrast(p.fg, p.side).toFixed(1)})`);
      ok(Math.abs(lum(p.editor) - lum(p.side)) < 0.2 && (p.mode === 'dark' ? lum(p.editor) < 0.2 : lum(p.editor) > 0.8), `${id}: zemin modla uyumlu (${p.mode})`);
    }

    // Şema ↔ tablo tutarlılığı
    const def = S.getDef('colorTheme');
    ok(def && def.type === 'palette' && def.default === 'auto', 'colorTheme ayarı palette türünde, varsayılan auto');
    const optIds = def.options.map((o) => o.value).filter((x) => x !== 'auto').sort().join();
    ok(optIds === [...P.PALETTE_IDS].sort().join(), 'şema seçenekleri PALETTES ile birebir');
    ok(S.sanitizeAll({ colorTheme: 'bogus' }).colorTheme === 'auto' && S.sanitizeAll({ colorTheme: 'ember' }).colorTheme === 'ember', 'bilinmeyen tema auto\'ya döner, geçerli korunur');

    // Editör teması çözümü
    ok(S.resolveEditorTheme('auto', 'dark', 'midnight') === 'nova-midnight', 'auto + renk teması → nova-<id>');
    ok(S.resolveEditorTheme('auto', 'light', 'auto') === 'nova-light' && S.resolveEditorTheme('auto', 'dark', 'auto') === 'nova-dark', 'auto + auto → Nova koyu/açık');
    ok(S.resolveEditorTheme('vs', 'dark', 'ember') === 'vs', 'açık editör teması seçimi renk temasını ezer');

    // Vurgu ve yazı tipleri
    for (const [id, a] of Object.entries(S.ACCENTS)) {
      ok(a.dark.length === 6 && a.light.length === 6 && a.dark.every((x) => hex.test(x)) && a.light.every((x) => hex.test(x)), `vurgu ${id}: 6 ton, geçerli hex`);
      // btn-primary: beyaz metin, indigo-600 zemin
      ok(contrast('#ffffff', a.dark[4]) >= 3 && contrast('#ffffff', a.light[4]) >= 3, `vurgu ${id}: düğme (beyaz/600) kontrastı ≥ 3 (${contrast('#ffffff', a.dark[4]).toFixed(1)} / ${contrast('#ffffff', a.light[4]).toFixed(1)})`);
    }
    const accOpts = S.getDef('accent').options.map((o) => o.value);
    ok(accOpts.every((x) => S.ACCENTS[x]) && accOpts.length === Object.keys(S.ACCENTS).length, 'vurgu seçenekleri ACCENTS ile birebir');
    ok(S.getDef('uiFont').options.every((o) => S.UI_FONTS[o.value]), 'her arayüz yazı tipi seçeneğinin yığını var');
    ok(S.getDef('fontFamily').options.filter((o) => o.value !== 'custom').every((o) => S.CODE_FONTS[o.value]), 'her kod yazı tipi seçeneğinin yığını var');
    ok(Object.values(S.UI_FONTS).concat(Object.values(S.CODE_FONTS)).every((f) => /(sans-serif|serif|monospace|system-ui)\s*$/.test(f)), 'her yazı tipi yığını genel yedekle biter');
  } finally {
    await vite.close();
  }
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm testler geçti');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('HATA', e); process.exit(1); });
