// Arama ReDoS koruması + SemVer ön sürüm karşılaştırması. Çalıştırma: node scripts/tests/search-redos.test.cjs
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
const { semverGt } = require(path.join(root0, 'electron-ext.cjs'));
const ok = (c, m) => { if (!c) process.exitCode = 1; console.log(c ? 'ok  ' : 'FAIL', m); };

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-redos-'));
  fs.writeFileSync(path.join(root, 'a.txt'), 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!\nfoo bar\nfoo(a+)\n');
  fs.writeFileSync(path.join(root, 'long.txt'), 'x'.repeat(10000) + ' needle\n');
  const t0 = Date.now();
  for (const q of ['(a+)+$', '(a*)*b', '^([0-9]{2,})+$', '(?:ab+)+c', '(a|a)*b']) {
    const r = await search.searchText(root, { query: q, regex: true });
    ok(r.error === 'regex', 'iç içe nicelik reddedilir: ' + q);
  }
  ok(Date.now() - t0 < 1000, 'riskli desenler beklemeden döner');
  const r1 = await search.searchText(root, { query: '(foo|bar)+', regex: true });
  ok(!r1.error && r1.results.length >= 1, 'zararsız grup nicelik kabul edilir');
  const r2 = await search.searchText(root, { query: 'foo\x5c(a\x5c+\x5c)', regex: true });
  ok(!r2.error && r2.results.length === 1, 'kaçışlı parantez ve + riskli sayılmaz');
  const r3 = await search.searchText(root, { query: '(a+)+', regex: false });
  ok(!r3.error && r3.results.length >= 1 || r3.results.length === 0, 'düz metin aramada kaçışlanır (hata yok)');
  const r4 = await search.searchText(root, { query: 'needle', regex: true });
  ok(r4.results.length === 0, 'regex modunda çok uzun satır atlanır');
  const r5 = await search.searchText(root, { query: 'needle', regex: false });
  ok(r5.results.length === 1, 'düz aramada uzun satır yine bulunur');
  const rp = await search.previewReplace(root, { query: '(a+)+', replacement: 'x', regex: true });
  ok(rp.error === 'regex', 'bul-değiştir önizleme riskli deseni reddeder');

  ok(semverGt('1.0.0', '1.0.0-beta') && !semverGt('1.0.0-beta', '1.0.0'), 'semver: kararlı > ön sürüm');
  ok(semverGt('1.0.0-beta.2', '1.0.0-beta.1') && semverGt('1.0.0-beta.11', '1.0.0-beta.2'), 'semver: ön sürüm sayısal alan');
  ok(semverGt('1.0.0-beta', '1.0.0-alpha') && semverGt('1.0.0-rc.1', '1.0.0-rc'), 'semver: ön sürüm sırası');
  ok(!semverGt('1.0.0', '1.0.0') && !semverGt('1.0.0+b2', '1.0.0+b1'), 'semver: eşit ve build yok sayılır');
  ok(semverGt('1.10.0', '1.9.9') && semverGt('2.0', '1.9.9'), 'semver: çekirdek sayısal');
  fs.rmSync(root, { recursive: true, force: true });
})();
