// Saf servis testleri (T-02): previewKind, lang, terminalText, recentFolders, session, collabRoom, problems.normPath, settings büyük dosya yardımcıları.
// Gerçek .ts dosyaları Vite SSR yükleyicisiyle çalışır (palettes.test.cjs ile aynı yöntem). Çalıştırma: node scripts/tests/services.test.cjs
const path = require('path');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m, `beklenen ${JSON.stringify(b)}, gelen ${JSON.stringify(a)}`);

(async () => {
  const root = path.join(__dirname, '..', '..');
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const store = new Map();
    const ls = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
    globalThis.window = { localStorage: ls, setTimeout, clearTimeout };

    // previewKind
    const { previewKind } = await vite.ssrLoadModule('/src/services/previewKind.ts');
    eq([previewKind('a.HTML'), previewKind('a.htm'), previewKind('x.svg'), previewKind('r.md'), previewKind('r.markdown'), previewKind('s.css'), previewKind('s.mjs'), previewKind('a.ts'), previewKind(undefined), previewKind('noext')],
      ['html', 'html', 'svg', 'md', 'md', 'webasset', 'webasset', 'none', 'none', 'none'], 'previewKind: uzantıdan tür');

    // lang
    const L = await vite.ssrLoadModule('/src/services/lang.ts');
    eq([L.languageFromName('a.ts'), L.languageFromName('A.PY'), L.languageFromName('x.unknown'), L.languageFromName('Makefile')], ['typescript', 'python', 'plaintext', 'plaintext'], 'languageFromName');
    eq([L.languageLabel('csharp'), L.languageLabel('CPP'), L.languageLabel('plaintext'), L.languageLabel('zig')], ['C#', 'C++', 'Plain Text', 'Zig'], 'languageLabel: bilinen ve bilinmeyen');
    eq([L.baseName('C:\\a\\b.txt'), L.baseName('/a/b/c.js'), L.baseName('x')], ['b.txt', 'c.js', 'x'], 'baseName');

    // terminalText
    const T = await vite.ssrLoadModule('/src/services/terminalText.ts');
    const E = '\u001b';
    eq(T.parseAnsi('düz'), [{ text: 'düz' }], 'parseAnsi: düz metin');
    const red = T.parseAnsi(`${E}[31mhata${E}[0m ok`);
    ok(red.length === 2 && red[0].color === 'var(--ansi-1)' && red[1].color === undefined && red[1].text === ' ok', 'parseAnsi: renk ve sıfırlama');
    const rgb = T.parseAnsi(`${E}[38;2;300;0;5mx`);
    ok(rgb[0].color === 'rgb(255,0,5)', 'parseAnsi: rgb değerleri 0-255 aralığına sıkıştırılır', JSON.stringify(rgb));
    ok(T.parseAnsi(`${E}[38;5;196mx`)[0].color === 'rgb(255,0,0)', 'parseAnsi: 256 renk küpü');
    ok(T.parseAnsi(`${E}[1;4mx`)[0].bold === true && T.parseAnsi(`${E}[1;4mx`)[0].underline === true, 'parseAnsi: kalın ve altı çizili');
    eq(T.parseAnsi(`a${E}[2Kb${E}]0;başlık\u0007c`).map((s) => s.text).join(''), 'abc', 'parseAnsi: renk dışı CSI ve OSC dizileri atılır');
    ok(!T.parseAnsi(`x${E}y\r\nz`).some((s) => s.text.includes(E) || s.text.includes('\r')), 'parseAnsi: artık ESC ve CR kalmaz');
    eq(T.parseAnsi(`${E}[31m`), [], 'parseAnsi: yalnız stil dizisi boş çıktı verir');
    const kinds = (l, sh = 'powershell') => T.tokenizeCommand(l, sh).filter((t) => t.kind !== 'space').map((t) => t.kind);
    eq(kinds('git commit -m "x y" $env:PATH | more'), ['command', 'text', 'flag', 'string', 'variable', 'operator', 'command'], 'tokenizeCommand: powershell');
    eq(T.tokenizeCommand('a  b', 'cmd').map((t) => t.text).join(''), 'a  b', 'tokenizeCommand: metin kaybolmaz');
    ok(T.commandToAnsi('ls -la', 'powershell').includes(`${E}[38;5;2mls`) && T.commandToAnsi('', 'cmd') === '', 'commandToAnsi');
    ok(T.shortenPath('kısa') === 'kısa' && T.shortenPath('C:\\Users\\biri\\Belgeler\\çok\\uzun\\bir\\yol\\dosya.txt', 30).length === 30, 'shortenPath: üst sınır');

    // recentFolders: eşzamanlı çağrılar birleşir, TTL önbelleği, hata -> []
    let calls = 0;
    globalThis.window.electronAPI = { recentFolders: async () => { calls++; return [{ path: '/p', name: 'p' }]; } };
    const R = await vite.ssrLoadModule('/src/services/recentFolders.ts');
    const [a, b] = await Promise.all([R.getRecentFolders(), R.getRecentFolders()]);
    ok(calls === 1 && a === b, 'recentFolders: eşzamanlı çağrılar tek istekte birleşir');
    await R.getRecentFolders();
    ok(calls === 1, 'recentFolders: TTL içinde önbellekten döner');
    R.invalidateRecentFolders(); await R.getRecentFolders();
    ok(calls === 2, 'recentFolders: invalidate sonrası yeniden sorar');
    await R.getRecentFolders(true);
    ok(calls === 3, 'recentFolders: force önbelleği atlar');
    globalThis.window.electronAPI = { recentFolders: async () => { throw new Error('x'); } };
    eq(await R.getRecentFolders(true), [], 'recentFolders: hata boş listeye döner');
    globalThis.window.electronAPI = undefined;
    eq(await R.getRecentFolders(true), [], 'recentFolders: API yoksa boş liste');

    // session
    const S = await vite.ssrLoadModule('/src/services/session.ts');
    eq(S.loadSession(), null, 'session: boşken null');
    const files = [
      { id: '1', name: 'a.ts', path: '/r/a.ts', language: 'typescript' },
      { id: '2', name: 'b.ts', path: '/r/b.ts', isModified: true },
      { id: '3', name: 'Adsız', isModified: true },
      { id: '4', name: 'Boş' },
      { id: '5', name: 'fark', path: '/r/c.ts', diff: {} },
      { id: '6', name: 'büyük', isModified: true }
    ];
    const content = { 2: 'taslak', 3: 'adsız içerik', 6: 'x'.repeat(500_001) };
    S.saveSession({ root: '/r', rootName: 'r', activeId: '3', files, getContent: (id) => content[id] });
    const s = S.loadSession();
    eq(s.tabs.map((t) => t.name), ['a.ts', 'b.ts', 'Adsız'], 'session: fark, boş adsız ve aşırı büyük adsız sekmeler atlanır');
    ok(s.tabs[0].draft === undefined && s.tabs[1].draft === 'taslak' && s.tabs[2].draft === 'adsız içerik', 'session: yalnız değişmiş/adsız sekmeler taslak taşır');
    ok(s.active === 2, 'session: etkin sekme dizini');
    S.saveSession({ root: '/r', rootName: 'r', activeId: '2', files, getContent: (id) => content[id], withDrafts: false });
    const s2 = S.loadSession();
    ok(s2.tabs.length === 2 && s2.tabs.every((t) => t.draft === undefined), 'session: withDrafts=false taslak yazmaz');
    S.saveSession({ root: null, rootName: '', activeId: null, files: [], getContent: () => '' });
    eq(S.loadSession(), null, 'session: klasörsüz ve sekmesiz oturum temizlenir');
    store.set('nova.session.v1', '{bozuk');
    eq(S.loadSession(), null, 'session: bozuk JSON null');
    store.set('nova.session.v1', JSON.stringify({ v: 1, tabs: [{ name: 'a' }, null, { name: 5 }, { name: 'b', path: 3 }] }));
    eq(S.loadSession().tabs.map((t) => t.name), ['a'], 'session: geçersiz sekmeler süzülür');
    store.set('nova.session.v1', JSON.stringify({ v: 2, tabs: [] }));
    eq(S.loadSession(), null, 'session: bilinmeyen sürüm yok sayılır');
    ok(!S.isRestorable(null) && !S.isRestorable({ tabs: [] }) && S.isRestorable({ tabs: [{ name: 'a' }] }), 'session: isRestorable');
    for (let i = 0; i < 25; i++) S.rememberClosed({ path: `/f${i}`, name: `f${i}` });
    S.rememberClosed({ path: '/f24', name: 'f24' });
    S.rememberClosed({ name: 'adsız' });
    S.rememberClosed({ path: '/d', name: 'd', diff: {} });
    ok(S.popClosed().path === '/f24' && S.popClosed().path === '/f23', 'session: kapatılanlar en yeni önce, tekrarlar birleşir');
    let n = 2; while (S.popClosed()) n++;
    ok(n === 20, `session: en çok 20 kapatılan sekme tutulur (${n})`);

    // collabRoom
    const C = await vite.ssrLoadModule('/src/services/collabRoom.ts');
    const id1 = C.getCollabRoomId('/proj');
    ok(id1.length >= 16 && C.getCollabRoomId('/proj') === id1 && C.getCollabRoomId('/baska') !== id1, 'collabRoom: klasör başına kalıcı rastgele kimlik');
    eq(C.getCollabRoomId(''), '', 'collabRoom: boş yol boş kimlik');
    C.setCollabRoomId('/proj', '  ortak-oda  ');
    ok(C.getCollabRoomId('/proj') === 'ortak-oda', 'collabRoom: setCollabRoomId kırpar');
    C.setCollabRoomId('/proj', 'x'.repeat(300));
    ok(C.getCollabRoomId('/proj').length === 128, 'collabRoom: kimlik 128 karakterle sınırlı');
    C.setCollabRoomId('/proj', '   ');
    ok(C.getCollabRoomId('/proj').length === 128, 'collabRoom: boş kimlik yok sayılır');
    const r1 = await C.collabFileRoom('oda', 'C:\\Users\\biri\\proj', 'C:\\Users\\biri\\proj\\src\\a.ts');
    const r2 = await C.collabFileRoom('oda', '/baska/yer/proj/', '/baska/yer/proj/src/a.ts');
    ok(r1 === r2 && /^oda\/[0-9a-f]{64}$/.test(r1), 'collabRoom: oda adı yoldan bağımsız, mutlak yol/dosya adı sızmaz', r1);
    ok(!r1.includes('biri') && !r1.includes('a.ts'), 'collabRoom: kullanıcı adı ve dosya adı oda adında yok');
    ok((await C.collabFileRoom('a b', '/p', '/p/x')).startsWith('a%20b/'), 'collabRoom: oda kimliği URL kodlanır');
    eq(C.collabProtocols(''), ['nova-sync'], 'collabProtocols: tokensız');
    const pr = C.collabProtocols('tok/+?é');
    ok(pr.length === 2 && /^nova-auth\.[A-Za-z0-9_-]+$/.test(pr[1]) && Buffer.from(pr[1].slice(10).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8') === 'tok/+?é', 'collabProtocols: base64url, URL-güvenli, geri çözülebilir', pr[1]);

    // problems.normPath (yalnız saf kısım)
    const P = await vite.ssrLoadModule('/src/services/problems.ts');
    ok(P.normPath('C:\\Users\\X\\A.ts') === 'c:/users/x/a.ts', 'problems.normPath');

    // settings: büyük dosya koruması
    const St = await vite.ssrLoadModule('/src/services/settings.ts');
    ok(!St.isLargeFile({ chars: St.LARGE_FILE_CHARS, lines: St.LARGE_FILE_LINES }), 'settings: sınırın kendisi büyük sayılmaz');
    ok(St.isLargeFile({ chars: St.LARGE_FILE_CHARS + 1, lines: 1 }) && St.isLargeFile({ chars: 1, lines: St.LARGE_FILE_LINES + 1 }), 'settings: karakter veya satır aşımı büyük sayılır');
    const ov = St.largeFileOverrides();
    ok(ov.minimap.enabled === false && ov.folding === false && ov.renderWhitespace === 'none', 'settings: ağır özellikler kapanır');
    const small = St.toMonacoOptionsForFile(St.DEFAULTS, { chars: 10, lines: 1 });
    const big = St.toMonacoOptionsForFile(St.DEFAULTS, { chars: 1e7, lines: 1 });
    ok(big.minimap.enabled === false && big.folding === false && small.folding !== false, 'settings: toMonacoOptionsForFile yalnız büyük dosyada kısar');
    ok(St.toMonacoOptionsForFile(St.DEFAULTS).folding === small.folding, 'settings: boyut verilmezse kısma yok');
  } finally {
    await vite.close();
  }
  console.log(fails ? `\n${fails} test BAŞARISIZ` : '\nTüm servis testleri geçti');
})().catch((e) => { console.error(e); process.exit(1); });
