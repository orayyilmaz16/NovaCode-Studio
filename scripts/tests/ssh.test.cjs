// Uzak çalışma alanı (SSH) çekirdeği testleri (electron-ssh-core.cjs): sanal yol, kapsama, profil doğrulama, parmak izi, depolar.
// Çalıştırma: node scripts/tests/ssh.test.cjs
const fs = require('fs');
const os = require('os');
const path = require('path');
const core = require(path.join(__dirname, '..', '..', 'electron-ssh-core.cjs'));

const ok = (c, m) => { if (!c) process.exitCode = 1; console.log(c ? 'ok  ' : 'FAIL', m); };

// ---- sanal yol ----
ok(core.isRemote('ssh://h1/home/a'), 'uzak yol tanınır');
ok(!core.isRemote('C:\\a\\b') && !core.isRemote('/home/a'), 'yerel yol uzak sayılmaz');
const p = core.parseRemote('ssh://h1/home/a/b.txt');
ok(p && p.hostId === 'h1' && p.path === '/home/a/b.txt', 'parseRemote: ana + yol');
ok(core.parseRemote('ssh://h1/') && core.parseRemote('ssh://h1/').path === '/', 'kök yol');
ok(core.parseRemote('ssh://h1/home/a/') && core.parseRemote('ssh://h1/home/a/').path === '/home/a', 'sondaki eğik çizgi atılır');
ok(core.parseRemote('ssh://h1/home/../etc/passwd') === null, '.. kaçışı reddedilir (normalize sonrası da)');
ok(core.parseRemote('ssh://h1/home/a/../../etc') === null, 'çoklu .. reddedilir');
ok(core.parseRemote('ssh://H1/x') === null, 'büyük harfli kimlik reddedilir');
ok(core.parseRemote('ssh:///x') === null && core.parseRemote('ssh://h1') === null, 'boş kimlik / yolsuz reddedilir');
ok(core.parseRemote('ssh://h1/a\0b') === null && core.parseRemote('ssh://h1/a\nb') === null, 'NUL / satır sonu reddedilir');
ok(core.parseRemote('ssh://h1/' + 'a'.repeat(5000)) === null, 'aşırı uzun yol reddedilir');
ok(core.makeRemote('h1', '/home/a') === 'ssh://h1/home/a' && core.makeRemote('h1', '/') === 'ssh://h1/', 'makeRemote');

// ---- sözcüksel kapsama ----
ok(core.insideRoot('/srv/app', '/srv/app/src/a.js', false), 'kökün içi');
ok(!core.insideRoot('/srv/app', '/srv/app', false) && core.insideRoot('/srv/app', '/srv/app', true), 'kök: allowRoot kontrolü');
ok(!core.insideRoot('/srv/app', '/srv/app2/x', true), 'ön ek benzeri kardeş klasör dışarıda');
ok(!core.insideRoot('/srv/app', '/etc/passwd', true), 'dış yol');
ok(!core.insideRoot('/srv/app', '/srv/app/../etc', true), '.. ile kaçış dışarıda');
ok(core.insideRoot('/', '/etc/passwd', true), 'kök "/" altı içeride');

// ---- kabuk alıntısı ----
ok(core.shellQuote("a b") === "'a b'", 'tek tırnak');
ok(core.shellQuote("it's") === "'it'\\''s'", "içteki ' kaçırılır");
ok(core.shellQuote('$(rm -rf /)') === "'$(rm -rf /)'", 'komut yerine koyma etkisiz');

// ---- profil doğrulama ----
const good = { name: 'Sunucum', host: 'example.com', port: '2222', user: 'deploy', auth: 'agent', root: '/srv/app' };
const c = core.cleanProfile({ ...good, id: 'abc-1' });
ok(c && c.port === 2222 && c.id === 'abc-1' && c.keyPath === '' && c.root === '/srv/app', 'geçerli profil');
ok(!core.cleanProfile({ ...good, host: '-oProxyCommand=x', id: 'a' }), 'tire ile başlayan ana bilgisayar (seçenek enjeksiyonu) reddedilir');
ok(!core.cleanProfile({ ...good, host: 'a b', id: 'a' }) && !core.cleanProfile({ ...good, host: 'a/b', id: 'a' }), 'boşluk/eğik çizgili host reddedilir');
ok(!core.cleanProfile({ ...good, user: 'a b', id: 'a' }) && !core.cleanProfile({ ...good, user: '', id: 'a' }), 'geçersiz kullanıcı');
ok(!core.cleanProfile({ ...good, port: 0, id: 'a' }) && !core.cleanProfile({ ...good, port: 70000, id: 'a' }) && !core.cleanProfile({ ...good, port: 'x', id: 'a' }), 'geçersiz port');
ok(!core.cleanProfile({ ...good, auth: 'none', id: 'a' }), 'bilinmeyen kimlik doğrulama yöntemi');
ok(!core.cleanProfile({ ...good, auth: 'key', keyPath: '', id: 'a' }), 'anahtar yöntemi yol ister');
ok(!core.cleanProfile({ ...good, root: 'relative/path', id: 'a' }) && !core.cleanProfile({ ...good, root: '/a/../b', id: 'a' }), 'geçersiz başlangıç klasörü');
ok(core.cleanProfile({ ...good, port: undefined, id: 'a' }).port === 22, 'varsayılan port 22');
const withSecret = core.cleanProfile({ ...good, id: 'a', password: 'gizli', passphrase: 'x' });
ok(withSecret && !('password' in withSecret) && !('passphrase' in withSecret) && !JSON.stringify(withSecret).includes('gizli'), 'parola/parola cümlesi profile girmez');
const nid = core.newId();
ok(core.ID_RE.test(nid), 'newId kimlik kalıbına uyar: ' + nid);

// ---- parmak izi ----
const fp = core.fingerprint(Buffer.from('anahtar-verisi'));
ok(/^SHA256:[A-Za-z0-9+/]{43}$/.test(fp), 'parmak izi biçimi (OpenSSH, dolgusuz): ' + fp);
ok(core.fingerprint(Buffer.from('a')) !== core.fingerprint(Buffer.from('b')), 'farklı anahtar farklı parmak izi');

// ---- depolar ----
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-ssh-'));
const kh = core.createKnownHosts(path.join(dir, 'kh.json'));
ok(kh.get('Example.com', 22) === null, 'bilinmeyen sunucu');
kh.set('Example.com', 22, fp);
ok(kh.get('example.com', 22) === fp, 'ana bilgisayar adı büyük/küçük harf duyarsız');
ok(kh.get('example.com', 2222) === null, 'port ayrı kayıt');
const kh2 = core.createKnownHosts(path.join(dir, 'kh.json'));
ok(kh2.get('example.com', 22) === fp, 'diskten geri yüklenir');
fs.writeFileSync(path.join(dir, 'kh.json'), JSON.stringify({ 'x:22': 'bozuk', 'y:22': fp }));
const kh3 = core.createKnownHosts(path.join(dir, 'kh.json'));
ok(kh3.get('x', 22) === null && kh3.get('y', 22) === fp, 'bozuk girdiler elenir');
kh2.remove('example.com', 22);
ok(kh2.get('example.com', 22) === null, 'unutma');

const hs = core.createHostStore(path.join(dir, 'hosts.json'));
ok(hs.upsert(core.cleanProfile({ ...good, id: 'h-a' })) && hs.list().length === 1, 'profil eklenir');
ok(hs.upsert(core.cleanProfile({ ...good, name: 'Yeni', id: 'h-a' })) && hs.list().length === 1 && hs.get('h-a').name === 'Yeni', 'aynı kimlik güncellenir');
const hs2 = core.createHostStore(path.join(dir, 'hosts.json'));
ok(hs2.get('h-a') && hs2.get('h-a').name === 'Yeni', 'profil diskten geri yüklenir');
ok(!fs.readFileSync(path.join(dir, 'hosts.json'), 'utf8').match(/password|passphrase/i), 'diskteki dosyada gizli alan yok');
hs.remove('h-a');
ok(hs.list().length === 0, 'profil silinir');
fs.rmSync(dir, { recursive: true, force: true });
