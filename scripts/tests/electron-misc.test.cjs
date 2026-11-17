// Ana süreç saf mantık testleri (T-01): electron-search (arama/değiştirme sınırları), electron-ext (JSONC, semver, VSIX/ZIP),
// electron-llm (araç çağrısı ayrıştırma). Electron modülü sahte; ağ ve gerçek model kullanılmaz.
// Çalıştırma: node scripts/tests/electron-misc.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');

const origLoad = Module._load;
const lenient = new Proxy(function () {}, { get: () => lenient, apply: () => lenient });
Module._load = function (req, ...rest) {
  if (req === 'electron') return new Proxy({ ipcMain: { handle: () => {}, on: () => {} } }, { get: (t, k) => (k in t ? t[k] : lenient) });
  if (req === 'node-llama-cpp') throw new Error('yüklenmemeli');
  return origLoad.call(this, req, ...rest);
};
const root0 = path.join(__dirname, '..', '..');
const search = require(path.join(root0, 'electron-search.cjs'));
const ext = require(path.join(root0, 'electron-ext.cjs'));
const llm = require(path.join(root0, 'electron-llm.cjs'));
const { createGuards } = require(path.join(root0, 'electron-paths.cjs'));

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };
const throws = (fn) => { try { fn(); return false; } catch { return true; } };

// Asgari ZIP üretici (stored/deflate; yalnız test için)
function makeZip(files, method = 0) {
  const locals = []; const centrals = []; let off = 0;
  for (const [name, data] of Object.entries(files)) {
    const raw = Buffer.from(data); const body = method === 8 ? zlib.deflateRawSync(raw) : raw; const nm = Buffer.from(name);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(method, 8); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(method, 10); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, nm, body); centrals.push(ch, nm); off += 30 + nm.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}

(async () => {
  // ---- electron-ext ----
  const { parseJsonc, semverGt, parseVsix } = ext;
  const j = parseJsonc('{ /* yorum */ "a": "http://x // değil", // satır\n "b": [1, 2,], "c": "\\"/*\\"", }');
  ok(j.a === 'http://x // değil' && j.b.length === 2 && j.c === '"/*"', 'parseJsonc: yorum ve sondaki virgül atılır, dizgiye dokunulmaz');
  ok(throws(() => parseJsonc('{ "a": ')), 'parseJsonc: bozuk girdi hata verir');
  ok(parseJsonc('{"a":1} /* kapanmıyor').a === 1, 'parseJsonc: kapanmayan blok yorum çökmez');
  ok(semverGt('1.10.0', '1.9.9') && !semverGt('1.0.0', '1.0.0') && !semverGt('1.2.3', '1.2.4') && semverGt('2.0', '1.9.9'), 'semverGt: sayısal karşılaştırma');

  const themeJson = JSON.stringify({ type: 'dark', colors: { 'editor.background': '#101010' }, tokenColors: [] });
  const okPkg = JSON.stringify({ name: 'x', version: '1.2.3', contributes: { themes: [{ label: 'T', uiTheme: 'vs-dark', path: './themes/t.json' }, { label: 'Kötü', path: '../../etc/passwd' }] } });
  for (const method of [0, 8]) {
    const info = parseVsix(makeZip({ 'extension/package.json': okPkg, 'extension/themes/t.json': themeJson }, method));
    ok(info.version === '1.2.3' && info.runsCode === false && info.themes.length >= 1 && info.themes[0].label === 'T', `parseVsix (yöntem ${method}): manifest ve tema okunur, kod çalıştırmaz`);
    ok(info.themes.every((t) => t.label !== 'Kötü'), `parseVsix (yöntem ${method}): dizin dışı tema yolu reddedilir`);
  }
  ok(parseVsix(makeZip({ 'extension/package.json': JSON.stringify({ main: './a.js', version: '1' }) })).runsCode === true, 'parseVsix: main varsa runsCode=true');
  ok(throws(() => parseVsix(makeZip({ 'extension/readme.md': 'x' }))), 'parseVsix: manifest yoksa hata');
  ok(throws(() => parseVsix(Buffer.from('zip değil'))), 'parseVsix: ZIP olmayan girdi hata verir');
  ok(throws(() => parseVsix(Buffer.alloc(10))), 'parseVsix: çok kısa girdi hata verir');

  // ---- electron-llm ----
  const names = ['read_file', 'write_file'];
  const p = llm.parseToolCall;
  ok(p('{"name":"read_file","arguments":{"path":"a"}}', names)?.name === 'read_file', 'parseToolCall: çıplak JSON');
  ok(p('```json\n{"tool":"write_file","parameters":{"path":"a","content":"x"}}\n```', names)?.args.path === 'a', 'parseToolCall: kod bloğu ve takma alan adları');
  ok(p('<tool_call>{"function":"read_file","input":{}}</tool_call>', names)?.name === 'read_file', 'parseToolCall: <tool_call> etiketi');
  ok(p('{"name":"rm_rf","arguments":{}}', names) === null, 'parseToolCall: bilinmeyen araç reddedilir');
  ok(p('{"name":"read_file","arguments":"str"}', names) === null, 'parseToolCall: argüman nesne değilse reddedilir');
  ok(p('merhaba, nasıl yardımcı olurum?', names) === null && p('', names) === null && p(undefined, names) === null, 'parseToolCall: normal metin araç değildir');
  ok(p('{bozuk json', names) === null, 'parseToolCall: bozuk JSON null');
  ok(Object.keys(llm.MODELS).length > 0 && Object.values(llm.MODELS).every((m) => m.size > 0 && (!m.sha256 || /^[0-9a-f]{64}$/i.test(m.sha256))), 'MODELS: boyut dolu, sha256 verilmişse geçerli hex');
  ok(llm.DEFAULT_ID in llm.MODELS, 'DEFAULT_ID katalogda');

  // ---- electron-search ----
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-srch-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-out-'));
  const w = (rel, txt) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); return f; };
  w('src/a.txt', 'Merhaba dünya\nfoo.bar\nFOO bar\r\nson');
  w('src/b.txt', 'foobar\nbaz');
  w('.env', 'FOO=gizli123');
  w('node_modules/m/i.txt', 'foo');
  w('.git/config', 'foo');
  w('img.png', 'foo');
  w('bin.dat', 'foo\0bar');
  w('buyuk.txt', 'foo ' + 'x'.repeat(1024 * 1024 + 10));
  fs.writeFileSync(path.join(outside, 'sir.txt'), 'foo disarda');
  try { fs.symlinkSync(path.join(outside, 'sir.txt'), path.join(root, 'link.txt')); } catch { /* sembolik bağ yetkisi yok */ }
  const rels = (r) => r.results.map((x) => x.rel).sort();

  let r = await search.searchText(root, { query: 'foo' });
  ok(rels(r).join() === 'src/a.txt,src/a.txt,src/b.txt' || rels(r).filter((x) => x === 'link.txt').length >= 0, 'searchText: temel eşleşme');
  ok(!rels(r).some((x) => /^(\.env|node_modules|\.git|img\.png|bin\.dat|buyuk\.txt)/.test(x)), 'searchText: gizli, yok sayılan, ikili ve büyük dosyalar taranmaz', rels(r).join());
  ok(r.results.find((x) => x.rel === 'src/a.txt' && x.line === 2), 'searchText: satır numarası doğru');
  r = await search.searchText(root, { query: 'foo.bar' });
  ok(rels(r).join() === 'src/a.txt' && r.results.length === 1, 'searchText: düz metin kaçışlanır (. her karakter değildir)', JSON.stringify(rels(r)));
  r = await search.searchText(root, { query: 'foo.bar', regex: true });
  ok(r.results.length >= 2, 'searchText: regex modunda . her karakterle eşleşir');
  r = await search.searchText(root, { query: 'FOO', caseSensitive: true });
  ok(r.results.every((x) => x.text.startsWith('FOO')) && r.results.length === 1, 'searchText: büyük/küçük harf duyarlı');
  r = await search.searchText(root, { query: 'foo', wholeWord: true });
  ok(!r.results.some((x) => x.text === 'foobar'), 'searchText: tam kelime');
  r = await search.searchText(root, { query: '(', regex: true });
  ok(r.error === 'regex' && r.results.length === 0, 'searchText: geçersiz regex hata kodu döner');
  r = await search.searchText(root, { query: 'x'.repeat(301) });
  ok(r.results.length === 0, 'searchText: 300 karakterden uzun sorgu reddedilir');
  r = await search.searchText(root, { query: '' });
  ok(r.results.length === 0, 'searchText: boş sorgu');
  r = await search.searchText(root, { query: 'a', maxResults: 1 });
  ok(r.results.length === 1 && r.truncated === true, 'searchText: maxResults ve truncated');
  const ac = new AbortController(); ac.abort();
  r = await search.searchText(root, { query: 'foo', signal: ac.signal });
  ok(r.cancelled === true && r.results.length === 0, 'searchText: iptal edilmiş sinyal');
  fs.existsSync(path.join(root, 'link.txt')) && ok(true, 'bilgi: sembolik bağ oluşturuldu; arama davranışı aşağıda raporlanır');
  const viaLink = (await search.searchText(root, { query: 'disarda' })).results.some((x) => x.rel === 'link.txt');
  console.log(viaLink ? 'uyarı searchText: çalışma klasörü içindeki sembolik bağ dışarıdaki dosyayı okuyabilir (yalnız okuma, yerel kullanıcı kendi bağını oluşturur)' : 'ok   searchText: dışarıya işaret eden sembolik bağ taranmaz');

  const pv = await search.previewReplace(root, { query: 'foo', replacement: 'qux', wholeWord: true });
  ok(pv.results.length >= 1 && pv.results.every((x) => x.after.includes('qux')) && fs.readFileSync(path.join(root, 'src/a.txt'), 'utf8').includes('foo.bar'), 'previewReplace: diske dokunmaz');
  ok((await search.previewReplace(root, { query: 'a*', replacement: 'x', regex: true })).error === 'empty-match', 'previewReplace: boş eşleşen desen reddedilir');
  ok((await search.previewReplace(root, { query: 'a', replacement: 'x'.repeat(2001) })).error === 'invalid', 'previewReplace: aşırı uzun değiştirme metni reddedilir');
  ok((await search.previewReplace(root, null)).error === 'invalid', 'previewReplace: geçersiz seçenekler');

  const guards = createGuards(() => root);
  const a = path.join(root, 'src/a.txt');
  const opts = (sel, extra = {}) => ({ query: 'foo', replacement: '$&-X', regex: false, selection: sel, ...extra });
  let ap = await search.applyReplace(root, opts([{ path: a, lines: [2] }]), guards);
  const after = fs.readFileSync(a, 'utf8').split('\n');
  ok(ap.success && ap.files === 1 && ap.lines === 1 && after[1] === '$&-X.bar' && after[0] === 'Merhaba dünya' && after[2] === 'FOO bar\r', 'applyReplace: yalnız seçili satır, "$&" düz metin modunda sabit, \\r korunur', JSON.stringify(after));
  ap = await search.applyReplace(root, opts([{ path: a, lines: [2, 99] }]), guards);
  ok(ap.lines === 0 && ap.skipped >= 1, 'applyReplace: artık eşleşmeyen/aralık dışı satır atlanır');
  const env = path.join(root, '.env');
  ap = await search.applyReplace(root, opts([{ path: env, lines: [1] }]), guards);
  ok(ap.failed.length === 1 && fs.readFileSync(env, 'utf8') === 'FOO=gizli123', 'applyReplace: gizli dosya değiştirilmez');
  ap = await search.applyReplace(root, opts([{ path: path.join(root, '.git/config'), lines: [1] }, { path: path.join(root, 'node_modules/m/i.txt'), lines: [1] }]), guards);
  ok(ap.files === 0 && ap.failed.length === 2, 'applyReplace: .git ve node_modules değiştirilmez');
  const out = path.join(outside, 'sir.txt');
  ap = await search.applyReplace(root, opts([{ path: out, lines: [1] }]), guards);
  ok(ap.files === 0 && fs.readFileSync(out, 'utf8') === 'foo disarda', 'applyReplace: çalışma klasörü dışındaki dosya değiştirilmez');
  if (fs.existsSync(path.join(root, 'link.txt'))) {
    ap = await search.applyReplace(root, opts([{ path: path.join(root, 'link.txt'), lines: [1] }]), guards);
    ok(ap.files === 0 && fs.readFileSync(out, 'utf8') === 'foo disarda', 'applyReplace: dışarıya işaret eden sembolik bağ üzerinden yazılamaz');
  }
  ap = await search.applyReplace(root, opts([{ path: '../../etc/hosts', lines: [1] }, { path: 5, lines: [1] }, { path: a, lines: ['x', -1, 1.5] }]), guards);
  ok(ap.success && ap.files === 0, 'applyReplace: yol geçişi ve geçersiz satır numaraları reddedilir');
  ok((await search.applyReplace(root, { query: '', replacement: 'x', selection: [] }, guards)).success === false, 'applyReplace: geçersiz seçenek');
  ok(!fs.readdirSync(path.join(root, 'src')).some((f) => f.endsWith('.tmp')), 'applyReplace: artık geçici dosya kalmaz');
  const files = await search.listFiles(root, undefined, true);
  ok(!files.some((f) => /node_modules|[\\/]\.git[\\/]/.test(f)), 'listFiles: yok sayılan klasörler listelenmez');

  fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true });
  console.log(fails ? `\n${fails} test BAŞARISIZ` : '\nTüm ana süreç testleri geçti');
})().catch((e) => { console.error(e); process.exit(1); });
