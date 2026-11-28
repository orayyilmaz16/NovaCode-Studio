// GitHub modülü testleri (electron-github.cjs): cihaz akışı (Device Flow), token saklama ve geri yükleme, yenileme,
// PR / yeni depo / commit yazarı / depo durumu işleyicileri, git kimlik bilgisi ve izin listeleri.
// Ağ yok: global fetch taklit edilir. `electron` (safeStorage, clipboard, shell), package.json (Client ID) ve
// runGit taklit edilir. Her testte denetlenir: token renderer'a gitmez, diske düz metin yazılmaz, token yalnız
// api.github.com'a gider, istekler yalnız github.com ve api.github.com'a yapılır.
// Çalıştırma: node scripts/tests/github.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MOD = path.join(__dirname, '..', '..', 'electron-github.cjs');
const REPO = 'C:/proje/depo';
// Sahte jetonlar çalışma zamanında birleştirilir: kaynakta sır görünümlü bir değer kalmaz (check-hygiene.mjs).
const fake = (...parts) => parts.join('_');
const TOKEN = fake('gho', 'TEST', 'TOKEN', '9f3a7c21');
const TOKEN_NEW = fake('gho', 'TEST', 'NEW', '1234');
const REFRESH_OLD = fake('ghr', 'TEST', 'OLD', '77');
const REFRESH_NEW = fake('ghr', 'TEST', 'NEW', '88');
const PROFILE = { login: 'octo', name: 'Octo Cat', avatar_url: 'https://avatars.example/1' };
const DEVICE = 'POST https://github.com/login/device/code';
const TOKEN_URL = 'POST https://github.com/login/oauth/access_token';
const ME = 'GET https://api.github.com/user';
const DEVICE_BODY = { device_code: 'DEV-CODE-XYZ', user_code: 'ABCD-1234', verification_uri: 'https://github.com/login/device', expires_in: 900, interval: 1 };

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-gh-'));
const tokenFile = path.join(userData, 'github-token.bin');
const XOR = 0x3c;
const encrypt = (s) => Buffer.from(Buffer.from(s, 'utf8').map((b) => b ^ XOR));
const decrypt = (buf) => Buffer.from(buf).map((b) => b ^ XOR).toString('utf8');

// Cihaz akışı yoklaması en az 5 sn bekler; testte 1 sn+ gecikmeler anında biter (yalnız bekleme süresi değişir).
const realSetTimeout = global.setTimeout;
global.setTimeout = (fn, ms, ...rest) => realSetTimeout(fn, ms >= 1000 ? 0 : ms, ...rest);

const pkg = { novaGithubClientId: 'test-client-id' };
const state = { encrypt: true };
const clip = [];
const opened = [];
const events = [];
const handlers = {};
let gitMap = {};
const electron = {
  app: {
    getPath: (name) => { if (name !== 'userData') throw new Error('beklenmeyen yol: ' + name); return userData; },
    whenReady: () => Promise.resolve()
  },
  clipboard: { writeText: (t) => { clip.push(String(t)); } },
  ipcMain: { handle: (ch, fn) => { handlers[ch] = fn; }, on: () => {} },
  safeStorage: {
    isAsyncEncryptionAvailable: async () => state.encrypt,
    encryptStringAsync: async (s) => encrypt(s),
    decryptStringAsync: async (buf) => ({ result: decrypt(buf) })
  },
  shell: { openExternal: async (u) => { opened.push(String(u)); } }
};

const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return electron;
  if (req === './package.json') return pkg;
  return origLoad.call(this, req, ...rest);
};

const win = { isDestroyed: () => false, webContents: { send: (ch, payload) => events.push({ ch, payload }) } };
// Gerçek runGitCommand çıktıyı kırpar (raw değilse); mock de aynısını yapar.
const runGit = async (args) => {
  const r = gitMap[args.join(' ')] || { success: false, stdout: '', stderr: 'mock: komut tanımsız' };
  return { success: r.success, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
};
const isValidPath = (p) => p === REPO;

function freshModule() {
  delete require.cache[MOD];
  for (const k of Object.keys(handlers)) delete handlers[k];
  const gh = require(MOD);
  gh.register({ getWindow: () => win, runGit, isValidPath });
  return gh;
}

// Sahte HTTP: anahtar "METOD URL". Değer: yanıt, hata (fırlatılır) veya sıra (son eleman tekrarlanır).
const calls = [];
const table = {};
const res = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
function serve(key) {
  const h = table[key];
  if (h === undefined) throw new TypeError('fetch failed: rota yok: ' + key);
  const v = Array.isArray(h) ? (h.length > 1 ? h.shift() : h[0]) : h;
  if (v instanceof Error) throw v;
  return v;
}
global.fetch = async (url, init = {}) => {
  const key = `${init.method || 'GET'} ${String(url)}`;
  calls.push({ key, url: String(url), body: init.body ? JSON.parse(init.body) : null, auth: init.headers && init.headers.Authorization });
  return serve(key);
};

const until = async (fn, ms = 2000) => {
  const t0 = Date.now();
  while (!(await fn())) {
    if (Date.now() - t0 > ms) return false;
    await new Promise((r) => realSetTimeout(r, 5));
  }
  return true;
};
const pollCount = () => calls.filter((c) => c.key === TOKEN_URL).length;
const connectedSince = (mark) => events.slice(mark).some((e) => e.ch === 'github:auth' && e.payload.state === 'connected');

// Diskte kayıtlı oturumla yeni bir ana süreç örneği açar ve bağlanmasını bekler.
async function connectFresh() {
  fs.writeFileSync(tokenFile, encrypt(JSON.stringify({ access: TOKEN, refresh: null, expiresAt: 0 })), { mode: 0o600 });
  table[ME] = res(200, PROFILE);
  const mark = events.length;
  const gh = freshModule();
  await until(() => connectedSince(mark));
  return gh;
}

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const section = (t) => console.log(`\n# ${t}`);

(async () => {
  // ---------------------------------------------------------------- kanal sözleşmesi ve bağlı değilken
  section('kanal sözleşmesi ve bağlı değilken');
  let gh = freshModule();
  const CHANNELS = ['git:copyHash', 'github:cancel', 'github:commitAuthor', 'github:copyCode', 'github:createPr', 'github:login',
    'github:logout', 'github:openExternal', 'github:publishRepo', 'github:repoInfo', 'github:status'];
  ok(JSON.stringify(Object.keys(handlers).sort()) === JSON.stringify(CHANNELS), 'kayıtlı kanallar sabit listeyle birebir aynı');
  const st0 = await handlers['github:status']({});
  ok(JSON.stringify(Object.keys(st0).sort()) === JSON.stringify(['canStoreToken', 'connected', 'hasClientId', 'profile'])
    && st0.connected === false && st0.profile === null, 'github:status yanıt şekli sabit; token alanı yok; bağlı değil');
  const e0 = await handlers['github:repoInfo']({}, REPO);
  const e1 = await handlers['github:commitAuthor']({}, REPO, 'abc1234');
  ok(e0.available === false && e1 === null && gh.gitAuthEnv().GIT_CONFIG_COUNT === undefined && gh.isConnected() === false && calls.length === 0,
    'bağlı değilken depo ve commit sorguları ağa gitmez, boş döner');

  // ---------------------------------------------------------------- izin listeleri
  section('izin listeleri');
  ok((await handlers['git:copyHash']({}, 'a1b2c3d')).success === true && clip.at(-1) === 'a1b2c3d', 'git:copyHash geçerli onaltılık hash\'i panoya yazar');
  const badHashes = ['xyz', 'abc', 'a'.repeat(41), '../../etc', 'ab cd1234', '', undefined, 123, { h: 'a1b2c3d' }];
  const badHashRes = await Promise.all(badHashes.map((h) => handlers['git:copyHash']({}, h)));
  ok(badHashRes.every((r) => r.success === false) && clip.at(-1) === 'a1b2c3d', 'geçersiz hash (kısa, uzun, yol, boşluk, tip hatası) panoya yazılmaz');
  ok((await handlers['github:copyCode']({})).success === false, 'bekleyen cihaz kodu yokken github:copyCode başarısız');
  const okUrls = ['https://github.com/octo/proje', 'https://docs.github.com/tr/rest', 'https://github.dev/octo/proje'];
  const badUrls = ['https://github.com.evil.example/', 'https://github.com@evil.example/', 'http://github.com/octo', 'file:///C:/Windows/win.ini', 'javascript:alert(1)', 42, null];
  const oRes = [];
  for (const u of okUrls) oRes.push((await handlers['github:openExternal']({}, u)).success);
  const bRes = [];
  for (const u of badUrls) bRes.push((await handlers['github:openExternal']({}, u)).success);
  ok(oRes.every(Boolean) && opened.length === okUrls.length && bRes.every((v) => v === false),
    'dış bağlantı yalnız izinli https GitHub önekleriyle açılır; sahte host ve şemalar reddedilir');

  // ---------------------------------------------------------------- Client ID yok
  section('Client ID yok');
  pkg.novaGithubClientId = '';
  const cBefore = calls.length;
  gh = freshModule();
  const noId = await handlers['github:login']({});
  ok(noId.success === false && noId.error === 'client-id-missing' && calls.length === cBefore, 'Client ID yokken giriş başlamaz ve ağa istek gitmez');
  ok((await handlers['github:status']({})).hasClientId === false, 'github:status hasClientId: false');
  pkg.novaGithubClientId = 'test-client-id';

  // ---------------------------------------------------------------- cihaz akışı: başarı
  section('cihaz akışı: başarı');
  table[DEVICE] = res(200, DEVICE_BODY);
  table[TOKEN_URL] = [res(200, { error: 'authorization_pending' }), res(200, { error: 'slow_down' }), res(200, { access_token: TOKEN, token_type: 'bearer', scope: 'repo,read:user' })];
  table[ME] = res(200, PROFILE);
  const mark = events.length;
  const r = await handlers['github:login']({});
  ok(r.success === true && r.userCode === 'ABCD-1234' && r.expiresIn === 900, 'cihaz akışı kullanıcı kodu ve süre döner');
  ok(clip.at(-1) === 'ABCD-1234', 'kullanıcı kodu panoya ana süreçten kopyalanır');
  ok(opened.at(-1) === 'https://github.com/login/device?user_code=ABCD-1234', 'tarayıcı yalnız github.com doğrulama sayfasını kodla açar');
  ok(await until(() => connectedSince(mark)), 'onaydan sonra oturum bağlanır ve renderer\'a bildirilir');
  const conn = events.slice(mark).find((e) => e.ch === 'github:auth' && e.payload.state === 'connected');
  ok(conn.payload.profile.login === 'octo' && conn.payload.stored === true, 'bildirim profil (login) taşır ve token kaydedildi (stored: true)');
  ok(pollCount() === 3, 'bekleme → yavaşlatma → onay: üç yoklama yapılır');
  const stat = await handlers['github:status']({});
  ok(stat.connected === true && stat.profile.login === 'octo' && stat.canStoreToken === true, 'github:status bağlı ve profil döner');
  const raw = fs.readFileSync(tokenFile);
  ok(!raw.includes(TOKEN) && decrypt(raw).includes(TOKEN), 'token diskte şifreli: düz metin yok, şifre çözülünce var');
  if (process.platform !== 'win32') ok((fs.statSync(tokenFile).mode & 0o777) === 0o600, 'token dosyası 0600 izniyle yazılır');
  ok(!JSON.stringify({ events, r, stat }).includes(TOKEN), 'token hiçbir renderer bildirimine ya da yanıtına girmez');

  // ---------------------------------------------------------------- cihaz akışı: hata durumları
  section('cihaz akışı: hata durumları');
  const runFlow = async (tokenResponses) => {
    table[DEVICE] = res(200, DEVICE_BODY);
    table[TOKEN_URL] = tokenResponses;
    const m = events.length;
    await handlers['github:login']({});
    const got = await until(() => events.slice(m).some((e) => e.ch === 'github:auth'));
    return got ? events.slice(m).find((e) => e.ch === 'github:auth').payload : null;
  };
  let note = await runFlow([res(200, { error: 'access_denied' })]);
  ok(note && note.state === 'error' && note.error === 'denied', 'kullanıcı reddederse hata "denied" bildirilir');
  note = await runFlow([res(200, { error: 'expired_token' })]);
  ok(note && note.error === 'expired', 'kod süresi dolarsa "expired" bildirilir');
  note = await runFlow([res(200, { error: 'incorrect_device_code' })]);
  ok(note && note.error === 'incorrect_device_code', 'bilinmeyen OAuth hatası aynen bildirilir');
  note = await runFlow([new TypeError('fetch failed'), res(200, { error: 'access_denied' })]);
  ok(note && note.error === 'denied', 'geçici ağ hatasında yoklama sürer ve sonuç bildirilir');
  for (const bad of ['https://evil.example/device', 'http://github.com/login/device']) {
    const openedBefore = opened.length;
    const clipBefore = clip.length;
    table[DEVICE] = res(200, { ...DEVICE_BODY, verification_uri: bad });
    const rr = await handlers['github:login']({});
    ok(rr.success === false && rr.error === 'Doğrulama adresi geçersiz.' && opened.length === openedBefore && clip.length === clipBefore,
      `güvenilmeyen doğrulama adresi reddedilir (${bad}): tarayıcı açılmaz, kod panoya gitmez`);
  }
  section('cihaz akışı: iptal');
  table[DEVICE] = res(200, DEVICE_BODY);
  table[TOKEN_URL] = res(200, { error: 'authorization_pending' });
  const mc = events.length;
  await handlers['github:login']({});
  await until(() => pollCount() >= 2);
  await handlers['github:cancel']({});
  const atCancel = pollCount();
  await new Promise((r) => realSetTimeout(r, 40));
  ok(pollCount() === atCancel && !events.slice(mc).some((e) => e.ch === 'github:auth'), 'iptal edilince yoklama durur ve bildirim gelmez');

  // ---------------------------------------------------------------- şifreleme yok
  section('şifreleme yok');
  await handlers['github:logout']({}); // önceki başarılı girişten kalan token dosyasını temizle
  state.encrypt = false;
  table[DEVICE] = res(200, DEVICE_BODY);
  table[TOKEN_URL] = res(200, { access_token: TOKEN });
  table[ME] = res(200, PROFILE);
  const mn = events.length;
  await handlers['github:login']({});
  await until(() => events.slice(mn).some((e) => e.ch === 'github:auth'));
  const nv = events.slice(mn).find((e) => e.ch === 'github:auth');
  ok(nv && nv.payload.state === 'connected' && nv.payload.stored === false, 'şifreleme yokken oturum bu çalışmada bağlanır, stored: false bildirilir');
  ok(!fs.existsSync(tokenFile), 'şifreleme yokken token diske yazılmaz (düz metin yedeği yok)');
  ok((await handlers['github:status']({})).canStoreToken === false, 'github:status canStoreToken: false');
  state.encrypt = true;

  // ---------------------------------------------------------------- çıkış
  section('çıkış');
  const lo = await handlers['github:logout']({});
  ok(lo.success === true && !fs.existsSync(tokenFile), 'çıkış token dosyasını siler');
  ok(events.some((e) => e.ch === 'github:auth' && e.payload.state === 'disconnected'), 'çıkış renderer\'a bildirilir');
  ok((await handlers['github:status']({})).connected === false, 'çıkıştan sonra bağlı değil');

  // ---------------------------------------------------------------- açılışta geri yükleme ve yenileme
  section('açılışta geri yükleme ve yenileme');
  gh = await connectFresh();
  ok((await handlers['github:status']({})).connected === true, 'kayıtlı oturum açılışta sessizce geri yüklenir');
  fs.writeFileSync(tokenFile, encrypt(JSON.stringify({ access: 'gho_STALE', refresh: REFRESH_OLD, expiresAt: Date.now() - 5000 })));
  table[TOKEN_URL] = res(200, { access_token: TOKEN_NEW, refresh_token: REFRESH_NEW, expires_in: 28800 });
  table[ME] = res(200, PROFILE);
  let mRef = events.length;
  freshModule();
  await until(() => connectedSince(mRef));
  const rf = decrypt(fs.readFileSync(tokenFile));
  ok(rf.includes(TOKEN_NEW) && rf.includes(REFRESH_NEW) && !rf.includes('gho_STALE'), 'süresi dolan token yenilenir; yeni token çifti diske yazılır');
  ok(calls.some((c) => c.key === TOKEN_URL && c.body && c.body.grant_type === 'refresh_token' && c.body.refresh_token === REFRESH_OLD),
    'yenileme yalnız refresh_token ile istenir');

  fs.writeFileSync(tokenFile, encrypt(JSON.stringify({ access: 'gho_STALE', refresh: REFRESH_OLD, expiresAt: Date.now() - 5000 })));
  table[TOKEN_URL] = res(200, { error: 'bad_refresh_token' });
  mRef = events.length;
  freshModule();
  const gone = await until(() => !fs.existsSync(tokenFile));
  ok(gone && (await handlers['github:status']({})).connected === false && !connectedSince(mRef),
    'geçersiz yenileme token\'ı oturumu ve token dosyasını temizler');

  fs.writeFileSync(tokenFile, encrypt(JSON.stringify({ access: 'gho_STALE', refresh: REFRESH_OLD, expiresAt: Date.now() - 5000 })));
  table[TOKEN_URL] = new TypeError('fetch failed');
  table[ME] = new TypeError('fetch failed');
  const n0 = calls.length;
  freshModule();
  await until(() => calls.slice(n0).some((c) => c.key === ME));
  ok(fs.existsSync(tokenFile), 'yenileme ağ hatasıyla biterse token silinmez (oturum sonraki denemede korunur)');
  table[ME] = res(200, PROFILE);

  // ---------------------------------------------------------------- pull request
  section('pull request');
  gh = await connectFresh();
  gitMap = {
    'remote get-url origin': { success: true, stdout: 'https://github.com/octo/proje.git\n', stderr: '' },
    'branch --show-current': { success: true, stdout: 'ozellik/x\n', stderr: '' },
    'push --set-upstream origin HEAD': { success: true, stdout: '', stderr: '' }
  };
  table['GET https://api.github.com/repos/octo/proje'] = res(200, { default_branch: 'main', full_name: 'octo/proje' });
  table['POST https://api.github.com/repos/octo/proje/pulls'] = res(201, { html_url: 'https://github.com/octo/proje/pull/7', number: 7 });
  const pr = await handlers['github:createPr']({}, REPO, { title: '  Yeni özellik  ', body: 'Açıklama', draft: true });
  ok(pr.success === true && pr.number === 7 && pr.url === 'https://github.com/octo/proje/pull/7', 'PR açılır; numara ve adres döner');
  const prBody = calls.filter((c) => c.key === 'POST https://api.github.com/repos/octo/proje/pulls').pop().body;
  ok(prBody.title === 'Yeni özellik' && prBody.head === 'ozellik/x' && prBody.base === 'main' && prBody.draft === true,
    'başlık kırpılır; dal, taban ve taslak bayrağı doğru gider');
  const prBadInputs = [
    ['izin verilmeyen yol', ['..', { title: 'x' }], 'invalid-input'],
    ['girdi yok', [REPO, undefined], 'invalid-input'],
    ['boş başlık', [REPO, { title: '   ' }], 'invalid-input'],
    ['256 üstü başlık', [REPO, { title: 'a'.repeat(257) }], 'invalid-input'],
    ['65536 üstü gövde', [REPO, { title: 'x', body: 'b'.repeat(65537) }], 'invalid-input']
  ];
  for (const [label, args, err] of prBadInputs) {
    const rr = await handlers['github:createPr']({}, ...args);
    ok(rr.success === false && rr.error === err, `PR girdisi reddedilir: ${label}`);
  }
  gitMap['remote get-url origin'] = { success: false, stdout: '', stderr: 'fatal' };
  ok((await handlers['github:createPr']({}, REPO, { title: 'x' })).error === 'no-remote', 'origin yoksa no-remote');
  gitMap['remote get-url origin'] = { success: true, stdout: 'https://gitlab.com/octo/proje.git' };
  ok((await handlers['github:createPr']({}, REPO, { title: 'x' })).error === 'no-remote', 'GitHub dışı origin için no-remote');
  gitMap['remote get-url origin'] = { success: true, stdout: 'https://github.com/octo/proje.git' };
  gitMap['branch --show-current'] = { success: true, stdout: '' };
  ok((await handlers['github:createPr']({}, REPO, { title: 'x' })).error === 'detached', 'dal adı yoksa (ayrık HEAD) detached');
  gitMap['branch --show-current'] = { success: true, stdout: 'main' };
  ok((await handlers['github:createPr']({}, REPO, { title: 'x' })).error === 'on-default-branch', 'varsayılan dalda PR açılmaz');
  gitMap['branch --show-current'] = { success: true, stdout: 'ozellik/x' };
  gitMap['push --set-upstream origin HEAD'] = { success: false, stdout: '', stderr: 'remote: Permission denied' };
  const pf = await handlers['github:createPr']({}, REPO, { title: 'x' });
  ok(pf.error === 'push-failed' && pf.detail === 'remote: Permission denied', 'push başarısızsa PR açılmaz ve hata ayrıntısı döner');
  gitMap['push --set-upstream origin HEAD'] = { success: true, stdout: '', stderr: '' };
  table['POST https://api.github.com/repos/octo/proje/pulls'] = res(422, { message: 'Validation Failed', errors: [{ message: 'A pull request already exists for octo:ozellik/x.' }] });
  ok((await handlers['github:createPr']({}, REPO, { title: 'x' })).error === 'pr-exists', 'aynı dal için PR varsa pr-exists');

  // ---------------------------------------------------------------- yeni depo yayınlama
  section('yeni depo yayınlama');
  gitMap = {
    'remote get-url origin': { success: false, stdout: '', stderr: 'fatal: No such remote' },
    'rev-parse --verify HEAD': { success: true, stdout: 'abc1234', stderr: '' },
    'remote add origin https://github.com/octo/yeni.git': { success: true, stdout: '', stderr: '' },
    'push --set-upstream origin HEAD': { success: true, stdout: '', stderr: '' }
  };
  table['POST https://api.github.com/user/repos'] = res(201, { clone_url: 'https://github.com/octo/yeni.git', html_url: 'https://github.com/octo/yeni' });
  const pub = await handlers['github:publishRepo']({}, REPO, { name: 'yeni' });
  ok(pub.success === true && pub.url === 'https://github.com/octo/yeni', 'yeni depo açılır, origin eklenir ve gönderilir');
  const pubBody = calls.filter((c) => c.key === 'POST https://api.github.com/user/repos').pop().body;
  ok(pubBody.name === 'yeni' && pubBody.private === true, 'varsayılan yeni depo özeldir (private: true)');
  await handlers['github:publishRepo']({}, REPO, { name: 'acik', isPrivate: false });
  ok(calls.filter((c) => c.key === 'POST https://api.github.com/user/repos').pop().body.private === false,
    'herkese açık depo yalnız isPrivate: false ile istenirse açılır');
  for (const bad of ['bad name', '../x', '', 'a'.repeat(101), 42]) {
    const rr = await handlers['github:publishRepo']({}, REPO, { name: bad });
    ok(rr.error === 'invalid-input', `depo adı reddedilir: ${JSON.stringify(bad).slice(0, 30)}`);
  }
  gitMap['remote get-url origin'] = { success: true, stdout: 'https://github.com/octo/x.git' };
  ok((await handlers['github:publishRepo']({}, REPO, { name: 'yeni' })).error === 'has-remote', 'origin zaten varsa has-remote');
  gitMap['remote get-url origin'] = { success: false, stdout: '', stderr: '' };
  gitMap['rev-parse --verify HEAD'] = { success: false, stdout: '', stderr: '' };
  ok((await handlers['github:publishRepo']({}, REPO, { name: 'yeni' })).error === 'no-commits', 'commit yoksa no-commits');
  gitMap['rev-parse --verify HEAD'] = { success: true, stdout: 'abc1234', stderr: '' };
  table['POST https://api.github.com/user/repos'] = res(422, { message: 'Repository creation failed.', errors: [{ message: 'name already exists on this account' }] });
  ok((await handlers['github:publishRepo']({}, REPO, { name: 'yeni' })).error === 'repo-exists', 'aynı adlı depo varsa repo-exists');
  table['POST https://api.github.com/user/repos'] = res(201, { clone_url: 'https://github.com/octo/yeni.git', html_url: 'https://github.com/octo/yeni' });
  gitMap['push --set-upstream origin HEAD'] = { success: false, stdout: '', stderr: 'remote: Permission denied' };
  const pp = await handlers['github:publishRepo']({}, REPO, { name: 'yeni' });
  ok(pp.error === 'push-failed' && pp.url === 'https://github.com/octo/yeni', 'gönderme başarısızsa push-failed; oluşan depo adresi yine döner');
  gitMap['push --set-upstream origin HEAD'] = { success: true, stdout: '', stderr: '' };

  // ---------------------------------------------------------------- commit yazarı
  section('commit yazarı');
  gitMap['remote get-url origin'] = { success: true, stdout: 'https://github.com/octo/proje.git' };
  table['GET https://api.github.com/repos/octo/proje/commits/abc1234'] = res(200, {
    author: { login: 'octo', avatar_url: 'https://avatars.example/1', html_url: 'https://github.com/octo' },
    commit: { author: { name: 'Octo Cat' } }
  });
  const ca = await handlers['github:commitAuthor']({}, REPO, 'abc1234');
  ok(ca.login === 'octo' && ca.name === 'Octo Cat' && ca.profileUrl === 'https://github.com/octo' && ca.avatarUrl === 'https://avatars.example/1',
    'commit yazarı GitHub profiline eşlenir');
  const cBad = calls.length;
  ok((await handlers['github:commitAuthor']({}, REPO, 'xyz')) === null && (await handlers['github:commitAuthor']({}, '..', 'abc1234')) === null && calls.length === cBad,
    'geçersiz hash veya yol: null, ağ isteği yok');
  table['GET https://api.github.com/repos/octo/proje/commits/abc1234'] = res(404, { message: 'Not Found' });
  ok((await handlers['github:commitAuthor']({}, REPO, 'abc1234')) === null, 'API hatasında null');

  // ---------------------------------------------------------------- depo durumu ve oturum süresi
  section('depo durumu');
  table['GET https://api.github.com/repos/octo/proje'] = res(200, { full_name: 'octo/proje', html_url: 'https://github.com/octo/proje', default_branch: 'main', stargazers_count: 3, open_issues_count: 2 });
  table['GET https://api.github.com/repos/octo/proje/actions/runs?per_page=3'] = res(200, { workflow_runs: [{ id: 11, name: 'CI', status: 'completed', conclusion: 'success', html_url: 'https://github.com/octo/proje/actions/runs/11', head_branch: 'main' }] });
  table['GET https://api.github.com/repos/octo/proje/pulls?state=open&per_page=5'] = res(200, [{ number: 5, title: 'Düzeltme', html_url: 'https://github.com/octo/proje/pull/5', user: { login: 'octo' } }]);
  const ri = await handlers['github:repoInfo']({}, REPO);
  ok(ri.available === true && ri.fullName === 'octo/proje' && ri.openIssues === 2 && ri.runs.length === 1 && ri.runs[0].conclusion === 'success' && ri.pulls[0].author === 'octo',
    'depo durumu: açık PR ve son Actions koşuları eşlenir');
  table['GET https://api.github.com/repos/octo/proje/actions/runs?per_page=3'] = new TypeError('fetch failed');
  const ri2 = await handlers['github:repoInfo']({}, REPO);
  ok(ri2.available === true && Array.isArray(ri2.runs) && ri2.runs.length === 0, 'Actions yanıtı yoksa depo durumu yine döner (koşular boş)');
  table['GET https://api.github.com/repos/octo/proje'] = res(401, { message: 'Bad credentials' });
  const ri3 = await handlers['github:repoInfo']({}, REPO);
  ok(ri3.available === false && /oturumu geçersiz/.test(ri3.error) && !fs.existsSync(tokenFile) && (await handlers['github:status']({})).connected === false,
    '401 yanıtında (yenileme yok) oturum ve token dosyası temizlenir');

  // ---------------------------------------------------------------- git kimlik bilgisi
  section('git kimlik bilgisi');
  gh = await connectFresh();
  const env = gh.gitAuthEnv();
  const b64 = Buffer.from(`x-access-token:${TOKEN}`).toString('base64');
  ok(env.GIT_CONFIG_COUNT === '1' && env.GIT_CONFIG_KEY_0 === 'http.https://github.com/.extraheader' && env.GIT_CONFIG_VALUE_0 === `Authorization: Basic ${b64}`,
    'git kimlik bilgisi yalnız github.com için ortam değişkeniyle verilir (argüman değil)');
  ok(gh.isConnected() === true, 'isConnected bağlıyken true');
  await handlers['github:logout']({});
  ok(Object.keys(gh.gitAuthEnv()).length === 0 && gh.isConnected() === false, 'çıkıştan sonra git kimlik bilgisi yok');

  // ---------------------------------------------------------------- genel denetimler
  section('genel denetimler');
  // Host, URL ayrıştırılarak denetlenir (alt dize eşleşmesi değil).
  const hostOf = (u) => new URL(u).hostname;
  ok(calls.every((c) => new URL(c.url).protocol === 'https:' && ['github.com', 'api.github.com'].includes(hostOf(c.url))),
    'tüm ağ istekleri yalnız https://github.com ve https://api.github.com adreslerine yapıldı');
  ok(calls.filter((c) => c.auth).every((c) => hostOf(c.url) === 'api.github.com'),
    'Authorization başlığı (token) yalnız api.github.com isteklerinde gönderildi');
  ok(!JSON.stringify(events).includes(TOKEN) && !JSON.stringify(events).includes(TOKEN_NEW) && !JSON.stringify(events).includes(REFRESH_NEW),
    'hiçbir renderer bildirimi token veya yenileme token\'ı içermez');

  fs.rmSync(userData, { recursive: true, force: true });
  Module._load = origLoad;
  console.log(fails ? `\n${fails} test başarısız` : '\nTüm GitHub testleri geçti');
})().catch((e) => { console.error('FAIL beklenmeyen hata:', e); process.exitCode = 1; });
