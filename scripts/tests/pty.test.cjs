// Gerçek terminal (PTY) testleri: kimlik/kabuk/klasör reddi, gerçek PowerShell oturumu, gerçek Ctrl+C, yeniden boyutlandırma, çıkış.
// Çalıştırma: node scripts/tests/pty.test.cjs
const Module = require('module');
const os = require('os');
const path = require('path');

const handlers = {};
const sent = [];
const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return { app: { on: () => {} }, ipcMain: { handle: (n, fn) => (handlers[n] = fn) } };
  return origLoad.call(this, req, ...rest);
};

const mod = require(path.join(__dirname, '..', '..', 'electron-pty.cjs'));
mod.register({
  getWindow: () => ({ isDestroyed: () => false, webContents: { send: (c, p) => sent.push([c, p]) } }),
  isValidPath: (p) => typeof p === 'string' && p.length > 0 && !p.includes('\0')
});
const call = (n, ...a) => handlers[n]({}, ...a);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const textOf = (id) => sent.filter(([c, p]) => c === 'pty:data' && p.id === id).map(([, p]) => p.data).join('');
const wait = (cond, ms = 20000) => new Promise((res) => {
  const t0 = Date.now();
  const tick = () => (cond() ? res(true) : Date.now() - t0 > ms ? res(false) : setTimeout(tick, 80));
  tick();
});

(async () => {
  // --- doğrulama ---
  ok((await call('pty:start', { id: '../x', shell: 'cmd', cwd: os.tmpdir() })).error === 'invalid-id', 'geçersiz kimlik reddedilir');
  ok((await call('pty:start', { id: 'a b', shell: 'cmd', cwd: os.tmpdir() })).error === 'invalid-id', 'boşluklu kimlik reddedilir');
  ok((await call('pty:start', { id: 'p1', shell: 'bash -c evil', cwd: os.tmpdir() })).error === 'invalid-shell', 'izinsiz kabuk reddedilir');
  ok((await call('pty:start', { id: 'p1', shell: 'cmd', cwd: path.join(os.tmpdir(), 'nova-yok-dizin') })).error === 'no-folder', 'olmayan klasör reddedilir');
  ok((await call('pty:write', 'yok', 'x')).success === false, 'olmayan oturuma yazma reddedilir');
  ok((await call('pty:write', 5, 'x')).success === false, 'sayısal kimlikle yazma reddedilir');
  ok((await call('pty:available')).available === true, 'PTY paketi yüklü');

  if (process.platform !== 'win32') { console.log('(Windows dışında gerçek kabuk turu atlandı)'); process.exit(fails ? 1 : 0); }

  // --- gerçek PowerShell oturumu ---
  const id = 'pty-ps';
  const st = await call('pty:start', { id, shell: 'powershell', cwd: os.tmpdir(), cols: 120, rows: 30 });
  ok(st.success, 'PowerShell PTY başladı');
  ok((await call('pty:start', { id, shell: 'powershell', cwd: os.tmpdir() })).error === 'exists', 'aynı kimlik iki kez açılamaz');
  ok(await wait(() => /PS .*>/.test(textOf(id))), 'istem göründü');
  await call('pty:write', id, 'Write-Output ("PTY" + "TEST"); $Host.UI.RawUI.WindowSize.Width\r');
  ok(await wait(() => /PTYTEST/.test(textOf(id)) && /120/.test(textOf(id))), 'komut çalıştı ve konsol genişliği 120 (gerçek PTY boyutu)');

  const rz = await call('pty:resize', id, 90, 25);
  ok(rz.success, 'yeniden boyutlandırma kabul edildi');
  await call('pty:write', id, '$Host.UI.RawUI.WindowSize.Width\r');
  ok(await wait(() => /90\r\nPS /.test(textOf(id))), 'boyut kabuğa yansıdı (90)');
  ok((await call('pty:resize', id, 'x', 5)).success === false, 'geçersiz boyut reddedilir');

  // --- gerçek Ctrl+C: uzun komutu keser (boru tabanlı terminalde mümkün değildi) ---
  await call('pty:write', id, 'ping -n 30 127.0.0.1\r');
  ok(await wait(() => /Reply from 127\.0\.0\.1/.test(textOf(id))), 'uzun komut çalışıyor');
  const mark = textOf(id).length;
  await call('pty:write', id, '\x03');
  ok(await wait(() => /Control-C/.test(textOf(id).slice(mark)), 8000), 'Ctrl+C uzun komutu kesti (Control-C yazdı)');
  // Ctrl+C konsol girdi tamponunu boşaltır: yeni komut kesmeden sonra gönderilmelidir
  await wait(() => /Control-C\r\nPS /.test(textOf(id).slice(mark)), 8000);
  await call('pty:write', id, 'Write-Output ("CC" + "OK")\r');
  ok(await wait(() => /CCOK/.test(textOf(id).slice(mark)), 8000), 'kesmeden sonra kabuk yeni komut aldı');

  // --- çıkış ---
  await call('pty:write', id, 'exit\r');
  ok(await wait(() => sent.some(([c, p]) => c === 'pty:exit' && p.id === id)), 'exit sonrası çıkış olayı geldi');
  ok((await call('pty:write', id, 'x')).success === false, 'bitmiş oturuma yazma reddedilir');

  // --- cmd ve durdurma ---
  const cid = 'pty-cmd';
  ok((await call('pty:start', { id: cid, shell: 'cmd', cwd: os.tmpdir() })).success, 'CMD PTY başladı');
  await call('pty:write', cid, 'echo CMD' + 'TEST\r');
  ok(await wait(() => /CMDTEST/.test(textOf(cid))), 'CMD komutu çalıştı');
  await call('pty:stop', cid);
  ok((await call('pty:write', cid, 'x')).success === false, 'durdurulan oturum kapandı');

  mod.stopAll();
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm PTY testleri geçti');
  setTimeout(() => process.exit(fails ? 1 : 0), 300);
})().catch((e) => { console.error('HATA', e); process.exit(1); });
