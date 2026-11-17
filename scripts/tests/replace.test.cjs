// Bul-değiştir testleri: önizleme, seçili satır uygulama, regex/tam kelime, çalışma klasörü dışı reddi, boş eşleşme reddi.
// Çalıştırma: node scripts/tests/replace.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

const origLoad = Module._load;
const lenient = new Proxy(function () {}, { get: () => lenient, apply: () => lenient });
Module._load = function (req, ...rest) {
  if (req === 'electron') return new Proxy({ ipcMain: { handle: () => {}, on: () => {} } }, { get: (t, k) => (k in t ? t[k] : lenient) });
  return origLoad.call(this, req, ...rest);
};
const root0 = path.join(__dirname, '..', '..');
const search = require(path.join(root0, 'electron-search.cjs'));
const { createGuards } = require(path.join(root0, 'electron-paths.cjs'));
const ok = (c, m) => { if (!c) process.exitCode = 1; console.log(c ? 'ok  ' : 'FAIL', m); };

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-rep-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-out-'));
  const a = path.join(root, 'a.txt');
  const b = path.join(root, 'b.txt');
  const o = path.join(outside, 'o.txt');
  fs.writeFileSync(a, 'foo bar\r\nfoobar foo\nnone\n');
  fs.writeFileSync(b, 'foo\n');
  fs.writeFileSync(o, 'foo\n');
  const guards = createGuards(() => root);
  const base = { query: 'foo', replacement: 'baz' };

  let pv = await search.previewReplace(root, base);
  ok(pv.results.length === 3, 'önizleme 3 satır bulur');
  ok(fs.readFileSync(a, 'utf8').includes('foo bar'), 'önizleme diske yazmaz');
  const l1 = pv.results.find((h) => h.rel === 'a.txt' && h.line === 1);
  ok(l1 && l1.before === 'foo bar' && l1.after === 'baz bar', 'eski/yeni fark doğru');

  pv = await search.previewReplace(root, { ...base, wholeWord: true });
  ok(pv.results.length === 3 && pv.results.every((h) => h.line !== 2 || h.after === 'foobar baz'), 'tam kelime foobar içini değiştirmez');

  pv = await search.previewReplace(root, { query: '(o+)', regex: true, replacement: '<$1>' });
  ok(pv.results.some((h) => h.after === 'f<oo> bar'), 'regex yakalama grubu çalışır');

  ok((await search.previewReplace(root, { query: 'a*', regex: true, replacement: 'x' })).error === 'empty-match', 'boş eşleşen desen reddedilir');
  ok((await search.previewReplace(root, { query: '(', regex: true, replacement: 'x' })).error === 'regex', 'geçersiz regex hata döner');

  // Yalnız seçili satır; CRLF korunur
  let r = await search.applyReplace(root, { ...base, selection: [{ path: a, lines: [1] }] }, guards);
  ok(r.success && r.files === 1 && r.lines === 1, 'yalnız işaretli satır değişir');
  ok(fs.readFileSync(a, 'utf8') === 'baz bar\r\nfoobar foo\nnone\n', 'CRLF korunur, diğer satırlar dokunulmaz');
  ok(fs.readFileSync(b, 'utf8') === 'foo\n', 'seçilmeyen dosya dokunulmaz');
  ok(fs.readdirSync(root).every((n) => !n.endsWith('.tmp')), 'geçici dosya kalmaz');

  // Eski (artık eşleşmeyen) satır atlanır
  r = await search.applyReplace(root, { ...base, selection: [{ path: a, lines: [1] }] }, guards);
  ok(r.success && r.lines === 0 && r.skipped === 1, 'eşleşmeyen satır atlanır');

  // Çalışma klasörü dışı yazma reddi
  r = await search.applyReplace(root, { ...base, selection: [{ path: o, lines: [1] }] }, guards);
  ok(r.failed.length === 1 && fs.readFileSync(o, 'utf8') === 'foo\n', 'klasör dışı dosya değişmez');
  r = await search.applyReplace(root, { ...base, selection: [{ path: path.join(root, '..', path.basename(outside), 'o.txt'), lines: [1] }] }, guards);
  ok(r.failed.length === 1 && fs.readFileSync(o, 'utf8') === 'foo\n', '.. ile kaçış değişmez');

  // Gizli dosya
  fs.writeFileSync(path.join(root, '.env'), 'foo\n');
  r = await search.applyReplace(root, { ...base, selection: [{ path: path.join(root, '.env'), lines: [1] }] }, guards);
  ok(r.failed.length === 1 && fs.readFileSync(path.join(root, '.env'), 'utf8') === 'foo\n', 'gizli dosya değişmez');

  // Literal: $& yorumlanmaz
  r = await search.applyReplace(root, { query: 'foo', replacement: '$&$&', selection: [{ path: b, lines: [1] }] }, guards);
  ok(fs.readFileSync(b, 'utf8') === '$&$&\n', 'düz metinde $ özel anlam taşımaz');
})();
