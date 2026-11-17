// Yol doğrulama testleri (electron-paths.cjs): traversal, symlink/junction kaçışı, Windows yolları, env izin listesi.
// Çalıştırma: node scripts/tests/paths.test.cjs
const fs = require('fs');
const os = require('os');
const path = require('path');
const { isValidPath, realpathNearest, relInside, createGuards, safeEnv } = require(path.join(__dirname, '..', '..', 'electron-paths.cjs'));

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };

const base = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-paths-'));
const root = path.join(base, 'ws');
const outside = path.join(base, 'outside');
fs.mkdirSync(path.join(root, 'src'), { recursive: true });
fs.mkdirSync(outside);
fs.writeFileSync(path.join(root, 'src', 'a.txt'), 'a');
fs.writeFileSync(path.join(outside, 'secret.txt'), 's');
fs.mkdirSync(path.join(root, '..foo'));

const g = createGuards(() => root);
const within = (...p) => g.withinWorkspace(path.join(root, ...p));
const inside = (p, follow = true) => g.insideWorkspace(path.join(root, ...p), follow);

// ---- isValidPath ----
ok(isValidPath('C:\\a\\b', 'win32'), 'geçerli Windows yolu');
ok(!isValidPath('', 'win32') && !isValidPath(null) && !isValidPath(42), 'boş/dize olmayan reddedilir');
ok(!isValidPath('a\0b'), 'NUL baytı reddedilir');
ok(!isValidPath('x'.repeat(5000)), 'çok uzun yol reddedilir');
ok(!isValidPath('C:\\ws\\dosya.txt:gizli', 'win32'), 'Windows alternatif veri akışı reddedilir');
ok(!isValidPath('C:\\ws\\a:b', 'win32') && isValidPath('/home/u/a:b', 'linux'), 'iki nokta yalnız Windows için tuzak');
ok(isValidPath('\\\\?\\C:\\ws\\a', 'win32'), 'uzun yol öneki (\\\\?\\C:) geçerli');

// ---- relInside ----
ok(relInside('/r', '/r/a', false) && !relInside('/r', '/r', false) && relInside('/r', '/r', true), 'relInside: kök ve alt yol');
ok(!relInside(path.resolve('/r'), path.resolve('/x'), true), 'relInside: kardeş klasör dışarıdadır');

// ---- çalışma klasörü sınırı ----
ok(within('src', 'a.txt'), 'içerideki dosya geçerli');
ok(g.withinWorkspace(root) && !g.insideWorkspace(root), 'kök: withinWorkspace evet, insideWorkspace hayır');
ok(!within('..', 'outside', 'secret.txt'), '../ ile dışarı çıkış reddedilir');
ok(!within('src', '..', '..', 'outside'), 'src/../../ kaçışı reddedilir');
ok(!g.withinWorkspace(outside), 'tamamen dışarıdaki yol reddedilir');
ok(!g.withinWorkspace(root + '-kardes'), 'önek benzeri kardeş klasör (ws-kardes) reddedilir');
ok(within('..foo'), '"..foo" adlı klasör geçerli (yalnız ".." bileşeni kaçıştır)');
ok(inside(['yeni', 'derin', 'dosya.txt']), 'olmayan hedef: en yakın var olan üst dizin içeride ise geçerli');
ok(!g.withinWorkspace(path.join(root, '..', 'outside', 'olmayan', 'x')), 'olmayan hedef dışarıdaysa reddedilir');
ok(!g.withinWorkspace('') && !g.withinWorkspace(undefined), 'boş yol reddedilir');
ok(!createGuards(() => '').withinWorkspace(path.join(root, 'src')), 'çalışma klasörü yokken hiçbir yol geçerli değil');
if (process.platform === 'win32') {
  ok(within('SRC', 'A.TXT'), 'Windows: büyük/küçük harf duyarsız');
  ok(!g.withinWorkspace('D:\\baska\\yer') || path.parse(root).root.toLowerCase() === 'd:\\', 'Windows: başka sürücü reddedilir');
  ok(!within('src', 'a.txt:akis'), 'Windows: alternatif veri akışı reddedilir');
}

// ---- symlink / junction kaçışı (S-10) ----
let linkOk = true;
const link = path.join(root, 'cikis');
try { fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir'); } catch { linkOk = false; }
if (!linkOk) {
  console.log('atla  symlink/junction oluşturulamadı (izin yok); symlink testleri atlandı');
} else {
  ok(!within('cikis', 'secret.txt'), 'symlink üzerinden dışarıdaki dosya okunamaz');
  ok(!inside(['cikis', 'yeni.txt']), 'symlink üzerinden dışarıya yeni dosya yazılamaz');
  ok(!within('cikis'), 'dışarıyı gösteren symlink klasörü içeride sayılmaz');
  ok(!inside(['cikis'], true), 'bağın kendisi (izlenirse) dışarı çıkar');
  ok(inside(['cikis'], false), 'silme/yeniden adlandırma: bağın kendisi (izlenmeden) içeride');
  ok(!inside(['cikis', 'secret.txt'], false), 'son bileşeni izlemeden de ara dizin symlink ise dışarı reddedilir');
  ok(realpathNearest(path.join(link, 'olmayan', 'x.txt')).startsWith(fs.realpathSync(outside)), 'realpathNearest: olmayan hedef symlink üst dizininin gerçek yoluna çözülür');
}
// boşta (dangling) symlink dışarıyı göstersin: hedef yok → sahte "içeride" sonucu verilmemeli
if (process.platform !== 'win32') {
  const dang = path.join(root, 'bos');
  try {
    fs.symlinkSync(path.join(outside, 'henuz-yok.txt'), dang);
    ok(!within('bos'), 'dışarıyı gösteren boşta symlink içeride sayılmaz');
  } catch { /* oluşturulamadı */ }
}
ok(realpathNearest(path.join(root, 'src', 'a.txt')) === fs.realpathSync(path.join(root, 'src', 'a.txt')), 'realpathNearest: var olan yol realpath ile aynı');

// ---- env izin listesi ----
const env = safeEnv({ NOVA: '1' }, { PATH: '/bin', Path: 'C:\\x', SystemRoot: 'C:\\Windows', HOME: '/h', LC_ALL: 'C', OPENAI_API_KEY: 'gizli', GITHUB_TOKEN: 'gizli', DATABASE_URL: 'gizli', XDG_DATA_HOME: '/d', GOPATH: '/go' });
ok(env.PATH === '/bin' && env.Path === 'C:\\x' && env.SystemRoot === 'C:\\Windows' && env.HOME === '/h', 'safeEnv: PATH/SystemRoot/HOME korunur');
ok(env.LC_ALL === 'C' && env.XDG_DATA_HOME === '/d' && env.GOPATH === '/go', 'safeEnv: LC_*/XDG_*/GOPATH korunur');
ok(!('OPENAI_API_KEY' in env) && !('GITHUB_TOKEN' in env) && !('DATABASE_URL' in env), 'safeEnv: gizli değişkenler elenir');
ok(env.NOVA === '1', 'safeEnv: ek değişkenler eklenir');

try { fs.rmSync(base, { recursive: true, force: true }); } catch { /* geçici dizin */ }
console.log(fails ? `\n${fails} test başarısız` : '\ntüm testler geçti');
