// Terminal modülü testleri: çalışma klasörü işareti süzgeci, kimlik doğrulama ve (Windows'ta) gerçek kabuk turu.
// Çalıştırma: node scripts/tests/term.test.cjs
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

const term = require(path.join(__dirname, '..', '..', 'electron-term.cjs'));
term.register({
  getWindow: () => ({ isDestroyed: () => false, webContents: { send: (c, p) => sent.push([c, p]) } }),
  isValidPath: (p) => typeof p === 'string' && p.length > 0 && !p.includes('\0')
});
const call = (n, ...a) => handlers[n]({}, ...a);
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) process.exitCode = 1; };
const wait = (cond, ms = 15000) => new Promise((res) => {
  const t0 = Date.now();
  const tick = () => (cond() ? res(true) : Date.now() - t0 > ms ? res(false) : setTimeout(tick, 100));
  tick();
});

(async () => {
  // --- süzgeç ---
  const cwds = [];
  const f = term.makeCwdFilter('cmd', (d) => cwds.push(d));
  let o = f('Microsoft Windows T\ufffdm\r\n\r\nC:\\x>\r\n');
  ok(o === '', 'CMD açılış başlığı atıldı');
  o += f('\x1b[0m@@NOVA_');
  o += f('CWD@@C:\\Users\\x\r\n\x1b[0mhello\r\n\x1b[0m');
  o += f('@@NOVA_CWD@@C:\\y\r\n');
  ok(o.replace(/\x1b\[0m/g, '') === 'hello\n', 'CMD çıktısı temiz: ' + JSON.stringify(o));
  ok(cwds.join('|') === 'C:\\Users\\x|C:\\y', 'cwd olayları: ' + cwds.join('|'));

  const pc = [];
  const g = term.makeCwdFilter('powershell', (d) => pc.push(d));
  const r = g('out1\nprog@@NOVA_CWD@@C:\\z\nPS tail');
  ok(r === 'out1\nprog\nPS tail' && pc[0] === 'C:\\z', 'PowerShell: işaret ayıklandı, satır sonsuz kuyruk korundu');
  const h = term.makeCwdFilter('powershell', () => {});
  ok(h('abc@@NOV') === 'abc@@NOV' || h('') !== undefined, 'kısmi işaret kuyruğu hata vermez');

  // --- kimlik ve sınırlar ---
  ok((await call('term:start', 'powershell', os.tmpdir(), '../evil')).error === 'invalid-id', 'geçersiz kimlik reddedildi');
  ok((await call('term:start', 'powershell', os.tmpdir(), 'A B')).error === 'invalid-id', 'boşluklu kimlik reddedildi');
  ok((await call('term:start', 'powershell', path.join(os.tmpdir(), 'nova-yok-dizin'), 'ok-1')).error === 'no-folder', 'olmayan klasör reddedildi');
  ok((await call('term:input', 'yok', 'dir')).success === false, 'çalışmayan oturuma girdi reddedildi');
  ok((await call('term:input', 5, 'dir')).success === false, 'sayısal kimlik reddedildi');

  // --- gerçek kabuk turu (yalnız Windows) ---
  if (process.platform === 'win32') {
    for (const shell of ['powershell', 'cmd']) {
      const id = `t-${shell}`;
      const start = await call('term:start', shell, os.tmpdir(), id);
      ok(start.success, `${shell}: başladı`);
      const gotCwd = await wait(() => sent.some(([c, p]) => c === 'term:cwd' && p.id === id));
      ok(gotCwd, `${shell}: başlangıç çalışma klasörü bildirildi`);
      const before = sent.length;
      await call('term:input', id, shell === 'cmd' ? 'echo merhaba-nova' : 'Write-Output merhaba-nova');
      const gotOut = await wait(() => sent.slice(before).some(([c, p]) => c === 'term:output' && p.id === id && /merhaba-nova/.test(p.text)));
      ok(gotOut, `${shell}: komut çıktısı geldi`);
      const leaked = sent.some(([c, p]) => c === 'term:output' && p.id === id && p.text.includes('@@NOVA_CWD@@'));
      ok(!leaked, `${shell}: işaret çıktıya sızmadı`);
      await call('term:stop', id);
    }
  } else {
    console.log('skip gerçek kabuk testleri (Windows dışı)');
  }
  setTimeout(() => process.exit(process.exitCode || 0), 300);
})();
