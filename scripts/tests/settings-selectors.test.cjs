// Ayar seçici testleri: Monaco seçeneklerinin anahtar gruplarına bölünmesi birebir eşdeğer mi, seçici anahtar listeleri eksiksiz mi,
// seçici/yan etki yardımcıları yalnız ilgili anahtar değişince tepki veriyor mu. Vite SSR ile gerçek .ts dosyaları yüklenir.
// Çalıştırma: node scripts/tests/settings-selectors.test.cjs
const path = require('path');
const { isDeepStrictEqual } = require('util');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };

// Refactor öncesi toMonacoOptions (birebir kopya): eşdeğerlik için referans (oracle).
function legacyToMonacoOptions(St, v) {
  const rulers = String(v.rulers).split(/[ ,]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n < 500);
  const b = (id) => v[id] === true;
  return {
    fontFamily: St.codeFontFamily(v), fontSize: Number(v.fontSize), lineHeight: Number(v.lineHeight), fontWeight: String(v.fontWeight),
    letterSpacing: Number(v.letterSpacing), fontLigatures: b('fontLigatures'), tabSize: Number(v.tabSize), insertSpaces: b('insertSpaces'),
    wordWrap: String(v.wordWrap), lineNumbers: String(v.lineNumbers), minimap: { enabled: b('minimap'), renderCharacters: false },
    renderWhitespace: String(v.renderWhitespace), cursorStyle: String(v.cursorStyle), cursorBlinking: String(v.cursorBlinking),
    cursorSmoothCaretAnimation: b('smoothCaret') ? 'on' : 'off', smoothScrolling: b('smoothScrolling'),
    bracketPairColorization: { enabled: b('bracketColorization') }, guides: { bracketPairs: b('bracketColorization'), indentation: b('indentGuides') },
    renderLineHighlight: String(v.renderLineHighlight), folding: b('folding'), stickyScroll: { enabled: b('stickyScroll') },
    scrollBeyondLastLine: b('scrollBeyondLastLine'), formatOnPaste: b('formatOnPaste'), formatOnType: b('formatOnType'),
    autoClosingBrackets: String(v.autoClosingBrackets), quickSuggestions: b('quickSuggestions'),
    suggestOnTriggerCharacters: b('suggestOnTriggerCharacters'), parameterHints: { enabled: b('parameterHints') }, hover: { enabled: b('hover') },
    rulers, automaticLayout: true, padding: { top: 8 }, roundedSelection: true
  };
}

// Deterministik rastgele (mulberry32): her çalıştırmada aynı girdiler.
function prng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const TEXT_SAMPLES = {
  rulers: ['', '80', '80, 120', ' 100 ,abc,0,-3,600', '1e2', '2.5 7', '500 499'],
  fontFamilyCustom: ['', 'Fira Code', 'x;y', 'Foo Bar, Baz', 'Iosevka']
};

(async () => {
  const root = path.join(__dirname, '..', '..');
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const store = new Map();
    globalThis.window = { localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }, setTimeout, clearTimeout };
    const St = await vite.ssrLoadModule('/src/services/settings.ts');
    const { SCHEMA, DEFAULTS, MONACO_KEYS, EDITOR_OPTION_KEYS, AI_COMPLETION_KEYS, sanitizeValue, getDef, toMonacoOptions, toMonacoEditorOptions, toMonacoOptionsForFile, largeFileOverrides, isLargeFile, applyFileSize, createSlice, createChangeDetector } = St;

    // 1) Anahtar listeleri: var olan, tekrarsız ayarlar
    const allKeys = [...EDITOR_OPTION_KEYS, ...AI_COMPLETION_KEYS];
    ok(allKeys.every((k) => getDef(k)), 'seçici anahtarları şemada tanımlı');
    ok(new Set(EDITOR_OPTION_KEYS).size === EDITOR_OPTION_KEYS.length, 'EDITOR_OPTION_KEYS tekrarsız');
    ok(Object.values(MONACO_KEYS).flat().length === new Set(Object.values(MONACO_KEYS).flat()).size, 'grup anahtarları arasında çakışma yok');

    // 2) Eşdeğerlik: DEFAULTS + rastgele geçerli değer kombinasyonları
    const rnd = prng(20261128);
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const randomValue = (def) => {
      switch (def.type) {
        case 'toggle': return rnd() < 0.5;
        case 'slider': return def.min + rnd() * ((def.max ?? def.min + 10) - def.min);
        case 'text': return pick(TEXT_SAMPLES[def.id] ?? ['a', 'b c', '']);
        default: return pick(def.options.map((o) => o.value));
      }
    };
    const combos = [{ ...DEFAULTS }, { ...DEFAULTS, fontFamily: 'custom', fontFamilyCustom: 'Fira Code' }];
    for (let i = 0; i < 600; i++) {
      const v = {};
      for (const def of SCHEMA) v[def.id] = sanitizeValue(def, randomValue(def));
      combos.push(v);
    }
    let mismatch = null;
    for (const v of combos) {
      const a = toMonacoOptions(v);
      const b = legacyToMonacoOptions(St, v);
      if (!isDeepStrictEqual(a, b)) { mismatch = { v, a, b }; break; }
    }
    ok(!mismatch, `toMonacoOptions = eski uygulama (${combos.length} kombinasyon)`, mismatch ? JSON.stringify(mismatch.a) + ' != ' + JSON.stringify(mismatch.b) : '');

    // 3) Düzenleyici seçenekleri = eski {...toMonacoOptions, inlineSuggest}
    let edMismatch = null;
    for (const v of combos) {
      const expected = { ...legacyToMonacoOptions(St, v), inlineSuggest: { enabled: v.aiCompletion !== false, showToolbar: v.aiCompletionToolbar === false ? 'onHover' : 'always', suppressSuggestions: false } };
      if (!isDeepStrictEqual(toMonacoEditorOptions(v), expected)) { edMismatch = v; break; }
    }
    ok(!edMismatch, 'toMonacoEditorOptions = eski editorOptions (inlineSuggest dahil)');

    // 4) Dosya boyutu kuralı: büyük dosyada ağır özellikler kapanır, küçükte değişmez
    let fileMismatch = null;
    for (const v of combos.slice(0, 200)) {
      for (const size of [undefined, { chars: 10, lines: 1 }, { chars: 1e7, lines: 1 }, { chars: 1, lines: 50000 }]) {
        const base = legacyToMonacoOptions(St, v);
        const expected = size && isLargeFile(size) ? { ...base, ...largeFileOverrides() } : base;
        if (!isDeepStrictEqual(toMonacoOptionsForFile(v, size), expected) || !isDeepStrictEqual(applyFileSize(toMonacoEditorOptions(v), size), { ...expected, inlineSuggest: toMonacoEditorOptions(v).inlineSuggest })) { fileMismatch = { v, size }; break; }
      }
      if (fileMismatch) break;
    }
    ok(!fileMismatch, 'toMonacoOptionsForFile / applyFileSize eski davranışla aynı');

    // 5) Anahtar eksiksizliği: düzenleyici seçeneklerini etkilemeyen ayar değişince çıktı değişmemeli;
    //    listedeki her ayar çıktıyı gerçekten değiştirmeli (listenin bayatlamadığını kanıtlar).
    const baseEd = { ...DEFAULTS, fontFamily: 'custom', fontFamilyCustom: 'Fira Code', rulers: '80' };
    const altValue = (def, cur) => {
      switch (def.type) {
        case 'toggle': return !cur;
        case 'slider': return cur !== def.min ? def.min : def.max;
        case 'text': return cur === 'zz' ? 'yy' : 'zz';
        default: return def.options.map((o) => o.value).find((x) => String(x) !== String(cur));
      }
    };
    const editorKeys = new Set(EDITOR_OPTION_KEYS);
    const outside = [];
    const inactive = [];
    const baseOut = JSON.stringify(toMonacoEditorOptions(baseEd));
    for (const def of SCHEMA) {
      const raw = altValue(def, baseEd[def.id]);
      if (raw === undefined) continue;
      const v = { ...baseEd, [def.id]: sanitizeValue(def, raw) };
      if (v[def.id] === baseEd[def.id]) continue;
      const changed = JSON.stringify(toMonacoEditorOptions(v)) !== baseOut;
      if (!editorKeys.has(def.id) && changed) outside.push(def.id);
      if (editorKeys.has(def.id) && !changed) inactive.push(def.id);
    }
    ok(outside.length === 0, 'listede olmayan ayarlar düzenleyici çıktısını değiştirmez', outside.join(', '));
    ok(inactive.length === 0, 'listedeki her ayar düzenleyici çıktısını değiştirir', inactive.join(', '));

    // 6) createSlice: yalnız ilgili anahtar değişince yeni nesne; aksi halde aynı referans
    const sl = createSlice(['fontSize', 'tabSize'], (v) => ({ fs: v.fontSize, ts: v.tabSize }));
    const s1 = sl({ ...DEFAULTS });
    const s2 = sl({ ...DEFAULTS, aiCompletionDelay: 999 });
    const s3 = sl({ ...DEFAULTS, fontSize: 20 });
    const s4 = sl({ ...DEFAULTS, fontSize: 20, aiCompletionDelay: 5 });
    ok(s1 === s2, 'createSlice: ilgisiz ayar değişince aynı nesne');
    ok(s3 !== s1 && s3.fs === 20, 'createSlice: ilgili ayar değişince yeni nesne');
    ok(s4 === s3, 'createSlice: değişmeyen ilgili değerde yeniden hesap yok');
    let calls = 0;
    const counted = createSlice(['tabSize'], (v) => { calls++; return v.tabSize; });
    for (let i = 0; i < 5; i++) counted({ ...DEFAULTS, tabSize: 4 });
    ok(calls === 1, 'createSlice: aynı değerle tekrar çağrıda seçici çalışmaz', `çağrı sayısı ${calls}`);

    // 7) createChangeDetector: ilk çağrı true; sonra yalnız izlenen anahtar değişince true
    const cd = createChangeDetector(['fontSize']);
    const c1 = cd({ ...DEFAULTS });
    const c2 = cd({ ...DEFAULTS, tabSize: 8 });
    const c3 = cd({ ...DEFAULTS, tabSize: 8, fontSize: 18 });
    ok(c1 === true && c2 === false && c3 === true, 'createChangeDetector: ilk çağrı ve izlenen anahtar değişimi');
  } finally {
    await vite.close();
  }
  console.log(fails ? `\n${fails} test BAŞARISIZ` : '\nTüm ayar seçici testleri geçti');
})().catch((e) => { console.error(e); process.exit(1); });
