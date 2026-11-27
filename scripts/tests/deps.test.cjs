// Bağımlılık otopilotu saf fonksiyon testleri (scripts/dep-update.mjs). Çalıştırma: node scripts/tests/deps.test.cjs
const path = require('path');
const { pathToFileURL } = require('url');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m, JSON.stringify(a) + ' != ' + JSON.stringify(b));

(async () => {
  const d = await import(pathToFileURL(path.join(__dirname, '..', 'dep-update.mjs')).href);

  eq(d.bumpType('1.2.3', '1.2.9'), 'patch', 'patch');
  eq(d.bumpType('1.2.3', '1.9.0'), 'minor', 'minor');
  eq(d.bumpType('1.2.3', '2.0.0'), 'major', 'major');
  eq(d.bumpType('0.4.1', '0.5.0'), 'major', '0.x minor artışı kırıcı sayılır');
  eq(d.bumpType('0.4.1', '0.4.9'), 'patch', '0.x patch');
  ok(d.cmp('1.10.0', '1.9.0') === 1 && d.cmp('2.0.0', '2.0.0') === 0 && d.cmp('1.0.0', '1.0.1') === -1, 'semver karşılaştırma');
  eq(d.strip('^1.2.3'), '1.2.3', 'aralık öneki soyulur');
  eq(d.prefixOf('~1.2.3') + d.prefixOf('1.2.3') + d.prefixOf('^1.0.0'), '~^', 'önek korunur');
  ok(d.globMatch('@electron/*', '@electron/get') && !d.globMatch('electron', 'electron-builder'), 'glob eşleşmesi');

  const c = d.classify({
    react: { current: '19.0.0', wanted: '19.1.0', latest: '19.1.0', type: 'dependencies' },
    vite: { current: '8.0.0', wanted: '8.1.0', latest: '9.0.0', type: 'devDependencies' },
    electron: { current: '42.0.0', wanted: '42.0.0', latest: '43.0.0', type: 'devDependencies' },
    '@electron/get': { current: '3.0.0', wanted: '3.0.0', latest: '3.1.0', type: 'devDependencies' },
    eskisi: { current: '1.0.0', wanted: '1.0.0', latest: '1.0.0', type: 'dependencies' },
    garip: { current: 'git+https://x', wanted: 'git', latest: '2.0.0', type: 'dependencies' },
  }, { ignore: ['electron', '@electron/*'] });
  eq(c.safe.map((r) => r.name + ':' + r.to), ['react:19.1.0', 'vite:8.1.0'], 'güvenli: aynı major en son, major varsa aralık içi sürüm');
  eq(c.major.map((r) => r.name + ':' + r.to), ['vite:9.0.0'], 'major ayrı listelenir');
  eq(c.skipped.map((r) => r.name), ['@electron/get', 'electron'], 'electron yığını otopilot dışı');

  eq(d.parseBumpTitle('chore(deps): bump vite from 8.0.1 to 8.0.4'), { name: 'vite', from: '8.0.1', to: '8.0.4' }, 'dependabot başlığı');
  eq(d.parseBumpTitle('chore(deps): bump the electron-stack group with 3 updates'), null, 'gruplu başlık null');
  ok(/^\d{4}-w\d{2}$/.test(d.isoWeek(new Date('2026-11-27'))), 'hafta etiketi biçimi');
  eq(d.isoWeek(new Date('2026-01-01')), '2026-w01', 'ISO hafta 1');
  ok(d.tableOf([]).includes('Yok') && d.tableOf(c.safe).includes('react'), 'tablo çıktısı');

  console.log(fails ? `\n${fails} başarısız` : '\ntüm testler geçti');
})();
