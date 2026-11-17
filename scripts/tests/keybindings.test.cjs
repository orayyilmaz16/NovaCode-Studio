// Kısayol özelleştirme (F-04) ve bölünmüş editör mantığı (F-03) testleri: saf modüller Vite SSR yükleyicisiyle çalışır.
// Çalıştırma: node scripts/tests/keybindings.test.cjs
const path = require('path');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

(async () => {
  const root = path.join(__dirname, '..', '..');
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const store = new Map();
    globalThis.window = { localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) } };
    const K = await vite.ssrLoadModule('/src/services/keybindings.ts');
    const S = await vite.ssrLoadModule('/src/services/splitLayout.ts');

    // ---- Katalog ----
    const ids = K.COMMANDS.map((c) => c.id);
    ok(new Set(ids).size === ids.length, 'komut kimlikleri benzersiz');
    const defs = K.COMMANDS.filter((c) => c.def).map((c) => c.def);
    ok(new Set(defs).size === defs.length, 'varsayılan kısayollar çakışmıyor');
    ok(defs.every((d) => K.normalizeCombo(d) === d), 'varsayılanlar normalize biçimde');
    ok(K.COMMANDS.every((c) => !c.def || K.checkAssignable(c.def).ok), 'varsayılanlar atanabilir kurallara uyar');
    ok(K.COMMANDS.filter((c) => c.scope === 'editor').every((c) => c.monaco), 'editör komutlarının Monaco eylemi var');
    ok(K.getCommand('splitRight').def === 'Ctrl+\\', 'Ctrl+\\ sağa böl');
    ok(!defs.some((d) => K.RESERVED.includes(d)), 'varsayılanlar sabit tuşlarla çakışmıyor');

    // ---- Biçim ----
    ok(K.normalizeCombo('ctrl + shift + p') === 'Ctrl+Shift+P', 'normalize: boşluk/küçük harf');
    ok(K.normalizeCombo('Shift+Ctrl+p') === 'Ctrl+Shift+P', 'normalize: sıra');
    ok(K.normalizeCombo('cmd+k') === 'Ctrl+K', 'normalize: cmd = Ctrl');
    ok(K.normalizeCombo('Ctrl++') === 'Ctrl++', 'normalize: artı tuşu');
    ok(K.normalizeCombo('Ctrl+Foo') === null && K.normalizeCombo('') === null && K.normalizeCombo('Hyper+A') === null, 'normalize: geçersiz null');
    ok(K.normalizeCombo('alt+arrowup') === 'Alt+Up', 'normalize: ok tuşu');
    ok(K.formatCombo('Alt+Up') === 'Alt+↑', 'gösterim: ok sembolü');

    // ---- Olaydan birleşim ----
    ok(K.comboFromEvent({ key: 'p', code: 'KeyP', ctrlKey: true, shiftKey: true }) === 'Ctrl+Shift+P', 'olay: Ctrl+Shift+P');
    ok(K.comboFromEvent({ key: 'P', code: 'KeyP', metaKey: true }) === 'Ctrl+P', 'olay: Cmd = Ctrl');
    ok(K.comboFromEvent({ key: 'з', code: 'KeyP', ctrlKey: true }) === 'Ctrl+P', 'olay: Kiril düzende fiziksel tuş');
    ok(K.comboFromEvent({ key: '`', code: 'Backquote', ctrlKey: true }) === 'Ctrl+`', 'olay: Ctrl+`');
    ok(K.comboFromEvent({ key: '\\', code: 'Backslash', ctrlKey: true }) === 'Ctrl+\\', 'olay: Ctrl+\\');
    ok(K.comboFromEvent({ key: 'Control', code: 'ControlLeft', ctrlKey: true }) === null, 'olay: yalnız değiştirici null');
    ok(K.comboFromEvent({ key: 'Tab', code: 'Tab', ctrlKey: true, shiftKey: true }) === 'Ctrl+Shift+Tab', 'olay: Ctrl+Shift+Tab');
    ok(K.comboFromEvent({ key: 'ArrowUp', code: 'ArrowUp', altKey: true }) === 'Alt+Up', 'olay: Alt+Up');
    ok(K.comboFromEvent({ key: 'F5' }) === 'F5', 'olay: F5 (code yok)');

    // ---- Atanabilirlik ----
    ok(K.checkAssignable('A').reason === 'needMod', 'düz harf atanamaz');
    ok(K.checkAssignable('Shift+A').reason === 'needMod', 'Shift+harf atanamaz');
    ok(K.checkAssignable('Ctrl+C').reason === 'reserved', 'Ctrl+C sabit');
    ok(K.checkAssignable('F5').reason === 'reserved', 'F5 sabit');
    ok(K.checkAssignable('F7').ok === true, 'F7 atanabilir');
    ok(K.checkAssignable('Ctrl+Alt+K').ok === true, 'Ctrl+Alt+K atanabilir');
    ok(K.checkAssignable('zz').reason === 'invalid', 'geçersiz');

    // ---- Çözümleme ve çakışma ----
    const base = K.resolveBindings({});
    ok(base.quickOpen === 'Ctrl+P' && base.find === 'Ctrl+F' && base.run === null, 'varsayılan eşleme');
    ok(Object.keys(K.findConflicts(base)).length === 0, 'varsayılanlarda çakışma yok');
    ok(K.commandForEvent({ key: 's', code: 'KeyS', ctrlKey: true }, base) === 'save', 'olay -> save');
    ok(K.commandForEvent({ key: 'f', code: 'KeyF', ctrlKey: true }, base, 'app') === null, 'kapsam: Ctrl+F uygulama kapsamında değil');
    ok(K.commandForEvent({ key: 'f', code: 'KeyF', ctrlKey: true }, base, 'editor') === 'find', 'kapsam: Ctrl+F editör');

    const r1 = K.assign({}, 'quickOpen', 'Ctrl+S');
    ok(!r1.ok && eq(r1.conflicts, ['save']), 'çakışma bildirilir, değişiklik yapılmaz');
    ok(eq(r1.overrides, {}), 'çakışmada geçersiz kılma değişmez');
    const r2 = K.assign({}, 'quickOpen', 'ctrl+s', true);
    ok(r2.ok && r2.overrides.quickOpen === 'Ctrl+S' && r2.overrides.save === null, 'steal: çakışanın kısayolu kalkar');
    const b2 = K.resolveBindings(r2.overrides);
    ok(Object.keys(K.findConflicts(b2)).length === 0, 'steal sonrası çakışma yok');
    ok(K.commandForEvent({ key: 's', code: 'KeyS', ctrlKey: true }, b2) === 'quickOpen', 'yeni atama çalışır');
    ok(K.commandForEvent({ key: 'p', code: 'KeyP', ctrlKey: true }, b2) === null, 'eski kısayol artık çalışmaz');
    const r3 = K.assign({}, 'run', 'Ctrl+Alt+R');
    ok(r3.ok && r3.overrides.run === 'Ctrl+Alt+R', 'varsayılanı olmayan komuta atama');
    const r4 = K.assign(r3.overrides, 'run', null);
    ok(r4.ok && eq(r4.overrides, {}), 'varsayılanı null olan komutu kaldırınca temizlenir');
    const r5 = K.assign({}, 'save', 'Ctrl+S');
    ok(r5.ok && eq(r5.overrides, {}), 'varsayılanla aynı atama kaydı büyütmez');
    ok(!K.assign({}, 'save', 'A').ok, 'geçersiz atama reddedilir');
    ok(!K.assign({}, 'olmayan', 'Ctrl+K').ok, 'bilinmeyen komut reddedilir');
    ok(eq(K.resetOne({ save: null, find: 'Ctrl+K' }, 'save'), { find: 'Ctrl+K' }), 'tek komut sıfırlama');

    // ---- Temizleme ve kalıcılık ----
    ok(eq(K.sanitizeOverrides({ save: 'ctrl+k', x: 'Ctrl+K', find: 5, replace: null, goLine: 'A' }), { save: 'Ctrl+K', replace: null }), 'sanitize: bilinmeyen/geçersiz atılır');
    ok(eq(K.sanitizeOverrides('bozuk'), {}), 'sanitize: bozuk girdi');
    K.setOverrides({ save: 'Ctrl+K' });
    ok(K.getBindings().save === 'Ctrl+K' && K.loadOverrides(globalThis.window.localStorage).save === 'Ctrl+K', 'kalıcılık: yaz/oku');
    let ping = 0; const off = K.subscribeBindings(() => { ping++; });
    K.setOverrides({}); off(); K.setOverrides({ save: 'Ctrl+K' });
    ok(ping === 1 && K.getBindings().save === 'Ctrl+K', 'abonelik bildirir, ayrılınca susar');
    store.set(K.KB_STORAGE_KEY, '{bozuk json');
    ok(eq(K.loadOverrides(globalThis.window.localStorage), {}), 'bozuk kayıt boş döner');
    K.setOverrides({});

    // ---- Monaco varsayılanını yutma ----
    const sh = K.shadowedEditorDefaults(K.resolveBindings({ find: 'Ctrl+Alt+F' }));
    ok(sh.has('Ctrl+F') && sh.size === 1, 'değişen editör komutunun eski tuşu yutulur');
    ok(K.shadowedEditorDefaults(base).size === 0, 'değişiklik yoksa yutulan yok');
    const sh2 = K.shadowedEditorDefaults(K.resolveBindings({ find: 'Ctrl+Alt+F', quickOpen: 'Ctrl+F' }));
    ok(!sh2.has('Ctrl+F'), 'eski tuş başka komuta atandıysa yutulmaz');

    // ---- Menü etiketi ----
    ok(K.remapShortcutLabel('Ctrl+N', K.resolveBindings({ newFile: 'Ctrl+Alt+N' })) === 'Ctrl+Alt+N', 'menü etiketi güncel atamayı gösterir');
    ok(K.remapShortcutLabel('Ctrl+N', base) === 'Ctrl+N', 'değişmeyen etiket aynı');
    ok(K.remapShortcutLabel('Shift+Alt+F', K.resolveBindings({ format: 'Ctrl+Alt+L' })) === 'Ctrl+Alt+L', 'menü: sıra farklı yazılmış etiket eşleşir');
    ok(K.remapShortcutLabel('Alt+↑', K.resolveBindings({ moveLineUp: null })) === '', 'menü: kaldırılan kısayol boş');
    ok(K.remapShortcutLabel('Ctrl+Z', base) === 'Ctrl+Z', 'menü: katalogda olmayan etiket aynı');

    // ---- Bölünmüş editör ----
    const pool = ['f1', 'f2', 'f3'];
    ok(S.splitInto(null, pool, null, 'row') === null, 'etkin dosya yokken bölünmez');
    const s0 = S.splitInto(null, pool, 'f2', 'row');
    ok(eq(s0.a, pool) && eq(s0.b, ['f2']) && s0.focus === 'b' && s0.bActive === 'f2', 'sağa böl: etkin dosya yeni grupta, odak yeni grupta');
    ok(S.normalizeSplit(s0, pool, 'f2') === s0, 'normalize: değişiklik yoksa aynı nesne');
    const nf = S.normalizeSplit(s0, [...pool, 'f4'], 'f4');
    ok(nf.b.includes('f4') && !nf.a.includes('f4') && nf.bActive === 'f4', 'yeni dosya odaktaki gruba eklenir');
    const toA = S.normalizeSplit(s0, pool, 'f1');
    ok(toA.focus === 'a' && toA.aActive === 'f1', 'etkin dosya öteki gruptaysa odak oraya geçer');
    const closed = S.normalizeSplit(s0, ['f1', 'f3'], 'f1');
    ok(closed === null, 'bir grup boşalınca bölme kapanır');
    const rm = S.normalizeSplit(S.splitInto(s0, pool, 'f2', 'col'), ['f1', 'f3'], 'f1');
    ok(rm === null || !rm.b.includes('f2'), 'havuzdan kalkan dosya listelerden düşer');
    const dup = S.splitInto(S.selectInGroup(s0, 'a', 'f1'), pool, 'f1', 'row');
    ok(dup.focus === 'b' && dup.b.includes('f1') && dup.bActive === 'f1' && dup.a.includes('f1'), 'açık bölmede komut: etkin dosya diğer gruba da konur');
    const dir = S.splitInto(s0, pool, 'f2', 'col');
    ok(dir.dir === 'col', 'açık bölmede yön değişebilir');
    const mv = S.moveToGroup(S.selectInGroup(s0, 'a', 'f1'), 'f1', 'a', 'b');
    ok(!mv.a.includes('f1') && mv.b.includes('f1') && mv.focus === 'b' && mv.bActive === 'f1' && mv.aActive !== 'f1', 'sürükle: sekme taşınır, kaynak etkini güncellenir');
    const cp = S.moveToGroup(s0, 'f1', 'a', 'b', true);
    ok(cp.a.includes('f1') && cp.b.includes('f1'), 'kopyala: iki grupta da var');
    const empty = S.normalizeSplit(S.moveToGroup({ ...s0, a: ['f1'], aActive: 'f1' }, 'f1', 'a', 'b'), pool, 'f1');
    ok(empty === null, 'son sekmeyi taşıyınca boş grup kapanır');
    const rg = S.removeFromGroup(dup, 'f1', 'b');
    ok(!rg.b.includes('f1') && rg.a.includes('f1') && rg.bActive === 'f2', 'gruptan çıkar: dosya öteki grupta kalır');
    ok(S.neighborIn(['x', 'y', 'z'], 'y') === 'z' && S.neighborIn(['x', 'y', 'z'], 'z') === 'y' && S.neighborIn(['x'], 'x') === null, 'komşu sekme');
    // iki grupta aynı dosya: normalize ikisinde de tutar
    ok(S.normalizeSplit(dup, pool, 'f1').a.includes('f1') && S.normalizeSplit(dup, pool, 'f1').b.includes('f1'), 'aynı dosya iki grupta kalır');

    // ---- Oturum dönüşümü ----
    const sv = S.splitToSaved(dup, (id) => pool.indexOf(id));
    ok(sv && eq(sv.a, [0, 1, 2]) && eq(sv.b, [1, 0]) && sv.focus === 'b', 'oturum: kimlikten dizine');
    const back = S.savedToSplit(JSON.parse(JSON.stringify(sv)), (i) => pool[i]);
    ok(back && eq(back.a, dup.a) && eq(back.b, dup.b) && back.dir === dup.dir && back.focus === dup.focus, 'oturum: gidiş dönüş');
    ok(S.savedToSplit({ dir: 'x', a: [0], b: [1] }, (i) => pool[i]) === null, 'oturum: geçersiz yön');
    ok(S.savedToSplit({ dir: 'row', a: [0], b: [9], aActive: 0, bActive: 9, focus: 'a' }, (i) => pool[i]) === null, 'oturum: eksik sekme -> bölme yok');
    ok(S.savedToSplit(undefined, (i) => pool[i]) === null, 'oturum: kayıt yok');
  } finally {
    await vite.close();
  }
  console.log(fails ? `\n${fails} test BAŞARISIZ` : '\nTüm testler geçti');
})().catch((e) => { console.error(e); process.exit(1); });
