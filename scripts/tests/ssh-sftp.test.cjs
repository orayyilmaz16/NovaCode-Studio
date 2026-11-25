// Uzak çalışma alanı uçtan uca testi: `ssh2` ile yerel sahte SSH/SFTP sunucusu (bellek içi dosya sistemi) + electron-ssh.cjs.
// Doğrular: sunucu parmak izi onayı / değişen anahtarın reddi, parola doğrulama, dizin/okuma/yazma/oluşturma/yeniden adlandırma/silme,
// kök dışı ve symlink kaçışı reddi, kabuk oturumu. `ssh2` kurulu değilse atlanır. Çalıştırma: node scripts/tests/ssh-sftp.test.cjs
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

let ssh2;
try { ssh2 = require('ssh2'); } catch { console.log('atlandı: ssh2 kurulu değil'); process.exit(0); }
const { Server, utils } = ssh2;
const { STATUS_CODE, OPEN_MODE } = utils.sftp;

// ---- electron taklidi ----
const handlers = new Map();
const events = [];
const fakeWin = { isDestroyed: () => false, webContents: { send: (_ch, payload) => events.push(payload) } };
const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return { ipcMain: { handle: (ch, fn) => handlers.set(ch, fn) }, dialog: {} };
  return origLoad.call(this, req, ...rest);
};
const ipc = (ch, ...args) => handlers.get(ch)({ sender: 'main' }, ...args);

let failed = 0;
const ok = (c, m) => { if (!c) { failed++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };

// ---- bellek içi dosya sistemi ----
const M = new Map(); // yol -> { t:'file'|'dir'|'link', data?, target?, mode }
const dir = (p) => M.set(p, { t: 'dir' });
const file = (p, s) => M.set(p, { t: 'file', data: Buffer.from(s), mode: 0o100644 });
dir('/'); dir('/home'); dir('/home/u'); dir('/home/u/proj'); dir('/home/u/proj/src'); dir('/home/u/proj/node_modules'); dir('/etc');
file('/home/u/proj/a.txt', 'merhaba'); file('/home/u/proj/src/b.js', 'console.log(1)'); file('/etc/passwd', 'root:x:0:0');
file('/home/u/proj/bin.dat', 'ab\0cd'); file('/home/u/proj/node_modules/x.js', 'x');
M.set('/home/u/proj/escape', { t: 'link', target: '/etc' });
M.set('/home/u/proj/escape-file', { t: 'link', target: '/etc/passwd' });

const dirname = (p) => path.posix.dirname(p);
function resolve(p, follow = true, depth = 0) {
  if (depth > 20) return null;
  const parts = path.posix.normalize(p).split('/').filter(Boolean);
  let cur = '';
  for (let i = 0; i < parts.length; i++) {
    cur += '/' + parts[i];
    const e = M.get(cur);
    if (e && e.t === 'link' && (follow || i < parts.length - 1)) return resolve(path.posix.join(e.target, ...parts.slice(i + 1)), follow, depth + 1);
  }
  return cur || '/';
}
const attrsOf = (e) => ({ mode: e.t === 'dir' ? 0o040755 : e.t === 'link' ? 0o120777 : (e.mode || 0o100644), size: e.data ? e.data.length : 0, uid: 1, gid: 1, atime: 0, mtime: 0 });

function sftpServer(sftp) {
  const handles = new Map();
  let n = 0;
  const newHandle = (v) => { const h = Buffer.from(String(++n).padStart(4, '0')); handles.set(h.toString(), v); return h; };
  const st = (id, code) => sftp.status(id, code);
  sftp.on('REALPATH', (id, p) => {
    const r = resolve(!p || p === '.' ? '/home/u' : p);
    if (!r || !M.has(r)) return st(id, STATUS_CODE.NO_SUCH_FILE); // OpenSSH gibi: var olmayan yol hata verir
    sftp.name(id, [{ filename: r, longname: r, attrs: {} }]);
  });
  const statLike = (follow) => (id, p) => { const r = resolve(p, follow); const e = r && M.get(r); return e ? sftp.attrs(id, attrsOf(e)) : st(id, STATUS_CODE.NO_SUCH_FILE); };
  sftp.on('STAT', statLike(true));
  sftp.on('LSTAT', statLike(false));
  sftp.on('OPENDIR', (id, p) => { const r = resolve(p); const e = M.get(r); if (!e || e.t !== 'dir') return st(id, STATUS_CODE.NO_SUCH_FILE); sftp.handle(id, newHandle({ dir: r, done: false })); });
  sftp.on('READDIR', (id, h) => {
    const x = handles.get(h.toString());
    if (!x || x.done) return st(id, STATUS_CODE.EOF);
    x.done = true;
    const items = [];
    for (const [p, e] of M) if (p !== '/' && dirname(p) === x.dir) items.push({ filename: path.posix.basename(p), longname: path.posix.basename(p), attrs: attrsOf(e) });
    sftp.name(id, items);
  });
  sftp.on('OPEN', (id, p, flags) => {
    const r = resolve(p); let e = M.get(r);
    if (flags & OPEN_MODE.WRITE) {
      if ((flags & OPEN_MODE.EXCL) && e) return st(id, STATUS_CODE.FAILURE);
      if (!M.get(dirname(r))) return st(id, STATUS_CODE.NO_SUCH_FILE);
      if (!e) { e = { t: 'file', data: Buffer.alloc(0), mode: 0o100644 }; M.set(r, e); } else if (flags & OPEN_MODE.TRUNC) e.data = Buffer.alloc(0);
    } else if (!e || e.t !== 'file') return st(id, STATUS_CODE.NO_SUCH_FILE);
    sftp.handle(id, newHandle({ file: r }));
  });
  sftp.on('READ', (id, h, off, len) => { const x = handles.get(h.toString()); const e = x && M.get(x.file); if (!e || off >= e.data.length) return st(id, STATUS_CODE.EOF); sftp.data(id, e.data.subarray(off, off + len)); });
  sftp.on('WRITE', (id, h, off, data) => {
    const x = handles.get(h.toString()); const e = x && M.get(x.file); if (!e) return st(id, STATUS_CODE.FAILURE);
    const buf = Buffer.alloc(Math.max(e.data.length, off + data.length)); e.data.copy(buf); data.copy(buf, off); e.data = buf; st(id, STATUS_CODE.OK);
  });
  sftp.on('FSTAT', (id, h) => { const x = handles.get(h.toString()); const e = x && M.get(x.file); e ? sftp.attrs(id, attrsOf(e)) : st(id, STATUS_CODE.FAILURE); });
  sftp.on('FSETSTAT', (id) => st(id, STATUS_CODE.OK));
  sftp.on('SETSTAT', (id) => st(id, STATUS_CODE.OK));
  sftp.on('CLOSE', (id, h) => { handles.delete(h.toString()); st(id, STATUS_CODE.OK); });
  sftp.on('MKDIR', (id, p) => { const r = resolve(p); if (M.has(r) || !M.has(dirname(r))) return st(id, STATUS_CODE.FAILURE); dir(r); st(id, STATUS_CODE.OK); });
  sftp.on('RMDIR', (id, p) => { const r = resolve(p, false); for (const k of M.keys()) if (k !== r && dirname(k) === r) return st(id, STATUS_CODE.FAILURE); M.delete(r) ? st(id, STATUS_CODE.OK) : st(id, STATUS_CODE.NO_SUCH_FILE); });
  sftp.on('REMOVE', (id, p) => { const r = resolve(p, false); M.delete(r) ? st(id, STATUS_CODE.OK) : st(id, STATUS_CODE.NO_SUCH_FILE); });
  sftp.on('RENAME', (id, a, b) => {
    const x = resolve(a, false), y = resolve(b, false);
    if (!M.has(x) || M.has(y)) return st(id, STATUS_CODE.FAILURE);
    for (const k of [...M.keys()]) if (k === x || k.startsWith(x + '/')) { M.set(y + k.slice(x.length), M.get(k)); M.delete(k); }
    st(id, STATUS_CODE.OK);
  });
}

const hostKeyA = utils.generateKeyPairSync('ed25519').private;
const mkServer = (hostKey) => new Server({ hostKeys: [hostKey] }, (client) => {
  client.on('authentication', (ctx) => (ctx.method === 'password' && ctx.username === 'tester' && ctx.password === 'pw' ? ctx.accept() : ctx.reject(['password'])));
  client.on('ready', () => client.on('session', (accept) => {
    const session = accept();
    session.on('sftp', (acc) => sftpServer(acc()));
    session.on('pty', (acc) => acc && acc());
    session.on('window-change', (acc) => acc && acc());
    session.on('shell', (acc) => { const ch = acc(); ch.write('welcome\r\n'); ch.on('data', (d) => ch.write('echo:' + d.toString())); });
  }));
  client.on('error', () => {});
});

(async () => {
  const server = mkServer(hostKeyA);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-ssh-int-'));
  let workspaceCleared = 0;
  const mod = require(path.join(__dirname, '..', '..', 'electron-ssh.cjs')).create({
    getWindow: () => fakeWin, userDataDir, ignoredDirs: new Set(['node_modules', '.git']), tmpPrefix: '.nova-tmp-',
    languageFromExt: (e) => e || 'plaintext', fromMain: (e) => e.sender === 'main', onWorkspaceOpened: () => { workspaceCleared++; }
  });
  mod.register();

  ok((await handlers.get('ssh:status')({ sender: 'evil' })).error === 'forbidden', 'ana pencere dışından IPC reddedilir');
  const bad = await ipc('ssh:hostSave', { name: 'x', host: '-oProxyCommand=calc', user: 'u', auth: 'agent' });
  ok(!bad.success, 'tehlikeli ana bilgisayar adı kaydedilmez');
  const keyBad = await ipc('ssh:hostSave', { name: 'x', host: '127.0.0.1', user: 'u', auth: 'key', keyPath: '/etc/shadow' });
  ok(keyBad.error === 'key-not-picked', 'diyalogla seçilmemiş anahtar yolu reddedilir');
  const saved = await ipc('ssh:hostSave', { name: 'Test', host: '127.0.0.1', port: port, user: 'tester', auth: 'password', root: '/home/u/proj' });
  ok(saved.success && saved.host.id, 'ana bilgisayar kaydedilir');
  const id = saved.host.id;
  ok(!fs.readFileSync(path.join(userDataDir, 'ssh-hosts.json'), 'utf8').includes('"pw"'), 'diskte parola yok');

  // 1) parola yok
  ok((await ipc('ssh:connect', id, '')).error === 'secret-required', 'parola yöntemi boş parolayı reddeder');

  // 2) ilk bağlantı: parmak izi onayı istenir; reddedilirse bağlanmaz
  events.length = 0;
  const pReject = ipc('ssh:connect', id, 'pw');
  await new Promise((r) => { const t = setInterval(() => { if (events.some((e) => e.type === 'hostkey')) { clearInterval(t); r(); } }, 10); });
  const hk = events.find((e) => e.type === 'hostkey');
  ok(/^SHA256:/.test(hk.fingerprint) && hk.host === '127.0.0.1', 'parmak izi onay olayı gelir');
  await ipc('ssh:hostKeyAnswer', hk.reqId, false);
  const rej = await pReject;
  ok(!rej.success && rej.error === 'host-key-rejected', 'reddedilen parmak izi bağlantıyı keser: ' + rej.error);
  ok(JSON.parse(fs.existsSync(path.join(userDataDir, 'ssh-known-hosts.json')) ? fs.readFileSync(path.join(userDataDir, 'ssh-known-hosts.json'), 'utf8') : '{}')['127.0.0.1:' + port] === undefined, 'reddedilen anahtar kaydedilmez');

  // 3) yanlış parola (önce onay ver)
  events.length = 0;
  const pWrong = ipc('ssh:connect', id, 'yanlis');
  await new Promise((r) => { const t = setInterval(() => { if (events.some((e) => e.type === 'hostkey')) { clearInterval(t); r(); } }, 10); });
  await ipc('ssh:hostKeyAnswer', events.find((e) => e.type === 'hostkey').reqId, true);
  const wrong = await pWrong;
  ok(!wrong.success && wrong.error === 'auth-failed', 'yanlış parola auth-failed: ' + wrong.error);

  // 4) doğru parola: parmak izi artık kayıtlı, soru yok
  events.length = 0;
  const conn = await ipc('ssh:connect', id, 'pw');
  ok(conn.success && conn.home === '/home/u', 'doğru parola ile bağlanır; ana dizin: ' + conn.home);
  ok(!events.some((e) => e.type === 'hostkey'), 'bilinen parmak izi tekrar sorulmaz');

  // 5) klasör seçici
  const br = await ipc('ssh:browse', id, '/home/u/proj');
  ok(br.success && br.dirs.includes('src') && br.dirs.includes('escape') && !br.dirs.includes('a.txt'), 'browse yalnız klasörleri listeler (symlink-klasör dahil)');

  // 6) çalışma alanı
  const ws = await ipc('ssh:open', id, '/home/u/proj');
  ok(ws.rootPath === `ssh://${id}/home/u/proj` && ws.rootName === 'proj' && ws.trusted === true && workspaceCleared === 1, 'çalışma alanı açılır, yerel kök temizlenir');
  const names = ws.tree.map((x) => x.name);
  ok(names.includes('src') && names.includes('a.txt') && !names.includes('node_modules'), 'ağaç: node_modules gizli, klasörler önce: ' + names.join(','));
  ok(ws.tree[0].type === 'folder' && ws.tree.find((x) => x.name === 'src').children.some((c) => c.name === 'b.js'), 'alt klasör içeriği taranır');
  ok(ws.tree.find((x) => x.name === 'escape').children.length === 0, 'symlink klasörün içine inilmez');

  const R = (p) => `ssh://${id}${p}`;
  // 7) okuma
  const a = await require_fs().readFile(R('/home/u/proj/a.txt'));
  ok(a === 'merhaba', 'dosya okunur');
  const bin = await require_fs().readFile(R('/home/u/proj/bin.dat'));
  ok(bin && bin.error === 'binary-file', 'ikili dosya reddedilir');
  const big = await require_fs().readFile(R('/home/u/proj/a.txt'), { maxBytes: 1024 });
  ok(big === 'merhaba', 'küçük dosya eşik altında okunur');

  // 8) kök dışı ve symlink kaçışı
  const out1 = await require_fs().readFile(R('/etc/passwd')).catch((e) => ({ err: e.sshCode }));
  ok(out1 && out1.err === 'outside', 'kök dışı okuma reddedilir');
  const out2 = await require_fs().readFile(R('/home/u/proj/escape-file')).catch((e) => ({ err: e.sshCode }));
  ok(out2 && out2.err === 'outside', 'symlink ile kök dışına kaçış (dosya) reddedilir');
  const out3 = await require_fs().readFile(R('/home/u/proj/escape/passwd')).catch((e) => ({ err: e.sshCode }));
  ok(out3 && out3.err === 'outside', 'symlink ile kök dışına kaçış (klasör) reddedilir');
  const out4 = await require_fs().writeFile(R('/home/u/proj/escape/pwn.txt'), 'x');
  ok(!out4.success && out4.error === 'outside' && !M.has('/etc/pwn.txt'), 'symlink üzerinden dışarı yazma reddedilir');
  const out5 = await require_fs().writeFile(R('/home/u/other/x.txt'), 'x');
  ok(!out5.success && out5.error === 'outside', 'kardeş klasöre yazma reddedilir');
  const out6 = await require_fs().readFile(R('/home/u/proj/../../../etc/passwd')).catch((e) => ({ err: e.sshCode }));
  ok(out6 && out6.err === 'outside', '.. içeren sanal yol reddedilir');
  ok((await require_fs().readFile('ssh://zzz/home/u/proj/a.txt').catch((e) => ({ err: e.sshCode }))).err === 'outside', 'başka ana bilgisayara yönlendirme reddedilir');
  ok((await require_fs().deleteItem(R('/home/u/proj'), { permanent: true })).success === false, 'çalışma klasörünün kökü silinemez');

  // 9) yazma (atomik/yedek yol), BOM, yeni dosya
  const w1 = await require_fs().writeFile(R('/home/u/proj/a.txt'), 'yeni içerik ç');
  ok(w1.success && M.get('/home/u/proj/a.txt').data.toString() === 'yeni içerik ç', 'yazma: ' + JSON.stringify(w1));
  ok(![...M.keys()].some((k) => k.includes('.nova-tmp-')), 'geçici dosya kalmaz');
  M.get('/home/u/proj/a.txt').data = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from('bomlu')]);
  const bomRead = await require_fs().readFile(R('/home/u/proj/a.txt'));
  ok(bomRead === 'bomlu', 'BOM okurken atılır');
  await require_fs().writeFile(R('/home/u/proj/a.txt'), 'bomlu2');
  ok(M.get('/home/u/proj/a.txt').data[0] === 0xEF, 'BOM yazarken geri eklenir');

  // 10) oluştur / klasör / yeniden adlandır / sil
  ok((await require_fs().createFile(R('/home/u/proj/yeni.txt'))).success && M.has('/home/u/proj/yeni.txt'), 'dosya oluşturulur');
  ok((await require_fs().createFile(R('/home/u/proj/yeni.txt'))).success, 'var olan dosyaya dokunulmaz (hata yok)');
  ok((await require_fs().createFolder(R('/home/u/proj/x/y/z'))).success && M.has('/home/u/proj/x/y/z'), 'iç içe klasör (mkdir -p)');
  ok((await require_fs().renameItem(R('/home/u/proj/yeni.txt'), R('/home/u/proj/src/yeni2.txt'))).success && M.has('/home/u/proj/src/yeni2.txt'), 'taşıma/yeniden adlandırma');
  ok((await require_fs().renameItem(R('/home/u/proj/src/yeni2.txt'), R('/home/u/proj/a.txt'))).error === 'Aynı adlı bir öğe zaten var.', 'üzerine yazma reddedilir');
  ok((await require_fs().renameItem(R('/home/u/proj/src'), R('/home/u/proj/src/alt'))).success === false, 'klasör kendi içine taşınamaz');
  ok((await require_fs().renameItem(R('/home/u/proj/a.txt'), '/tmp/yerel')).success === false, 'karışık yerel/uzak hedef reddedilir');
  const del1 = await require_fs().deleteItem(R('/home/u/proj/x'));
  ok(del1.success === false && del1.trashFailed === true && M.has('/home/u/proj/x/y/z'), 'çöp kutusu yok: kalıcı silme onayı istenir, silinmez');
  const del2 = await require_fs().deleteItem(R('/home/u/proj/x'), { permanent: true });
  ok(del2.success && ![...M.keys()].some((k) => k.startsWith('/home/u/proj/x')), 'kalıcı özyinelemeli silme');
  const delLink = await require_fs().deleteItem(R('/home/u/proj/escape'), { permanent: true });
  ok(delLink.success && M.has('/etc/passwd'), 'symlink silinince hedefine dokunulmaz');

  // 11) kabuk
  const chunks = [];
  let closed = false;
  const sh = await mod.openShell(id, { cols: 80, rows: 24, cwd: R('/home/u/proj/src') }, (d) => chunks.push(d), () => { closed = true; });
  ok(sh.success, 'uzak kabuk açılır');
  await new Promise((r) => setTimeout(r, 300));
  sh.handle.write('merhaba\n');
  await new Promise((r) => setTimeout(r, 300));
  const out = chunks.join('');
  ok(out.includes('welcome') && out.includes("echo: cd -- '/home/u/proj/src'") && out.includes('echo:merhaba'), 'kabuk çıktısı + başlangıç klasörüne cd');
  const shBad = await mod.openShell(id, { cols: 80, rows: 24, cwd: R('/etc') }, () => {}, () => {});
  ok(!shBad.success && shBad.error === 'no-folder', 'kök dışı başlangıç klasörü reddedilir');
  ok(mod.sshProfiles().some((p) => p.id === 'ssh:' + id), 'PTY profili listesinde SSH girdisi');
  sh.handle.kill();
  await new Promise((r) => setTimeout(r, 50));
  ok(closed, 'kabuk kapanınca bildirim gelir');

  // 12) bağlantı kopması
  events.length = 0;
  mod.leaveWorkspace();
  ok(events.some((e) => e.type === 'disconnected' && e.id === id) && mod.activeHostId() === null, 'çalışma alanından çıkınca bağlantı kapanır');
  ok((await require_fs().readFile(R('/home/u/proj/a.txt')).catch((e) => ({ err: e.sshCode }))).err === 'outside', 'bağlantı kapalıyken uzak okuma reddedilir');

  // 13) değişen sunucu anahtarı: aynı ana bilgisayar/port, farklı anahtar -> kesin ret (onay sorulmaz)
  await new Promise((r) => server.close(r));
  const server2 = mkServer(utils.generateKeyPairSync('ed25519').private);
  await new Promise((r) => server2.listen(port, '127.0.0.1', r));
  events.length = 0;
  const chg = await ipc('ssh:connect', id, 'pw');
  ok(!chg.success && chg.error === 'host-key-changed' && events.some((e) => e.type === 'hostkey-changed') && !events.some((e) => e.type === 'hostkey'), 'değişen anahtar reddedilir (MITM koruması), onay sorulmaz');
  await ipc('ssh:forgetHostKey', id);
  ok(JSON.parse(fs.readFileSync(path.join(userDataDir, 'ssh-known-hosts.json'), 'utf8'))['127.0.0.1:' + port] === undefined, 'kullanıcı kaydı açıkça silebilir');
  await new Promise((r) => server2.close(r));

  fs.rmSync(userDataDir, { recursive: true, force: true });
  console.log(failed ? `\n${failed} test başarısız` : '\ntümü geçti');
  process.exit(failed ? 1 : 0);

  function require_fs() { return mod.fs; }
})().catch((e) => { console.error('test çöktü:', e); process.exit(1); });
