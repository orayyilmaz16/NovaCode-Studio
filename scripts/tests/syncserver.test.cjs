// Senkron sunucusu: bozuk istek/mesaj süreci düşürmez, token alt protokolle taşınır, oran sınırı çalışır.
// Çalıştırma: node scripts/tests/syncserver.test.cjs
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const WebSocket = require('ws');

const PORT = 20000 + Math.floor(Math.random() * 20000);
const TOKEN = 'test-token-' + Math.random().toString(36).slice(2);
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) process.exitCode = 1; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function rawRequest(payload) {
  return new Promise((resolve) => {
    const s = net.connect(PORT, '127.0.0.1', () => s.write(payload));
    let data = '';
    s.on('data', (d) => { data += d; });
    s.on('close', () => resolve(data));
    s.on('error', () => resolve(data));
    setTimeout(() => { s.destroy(); resolve(data); }, 1500);
  });
}
function wsOpen(room, protocols, opts) {
  return new Promise((resolve) => {
    const w = new WebSocket(`ws://127.0.0.1:${PORT}/${room}`, protocols, opts);
    w.on('open', () => resolve({ w, ok: true }));
    w.on('unexpected-response', (_q, res) => { resolve({ ok: false, status: res.statusCode }); });
    w.on('error', () => resolve({ ok: false }));
  });
}
const auth = (t) => ['nova-sync', 'nova-auth.' + Buffer.from(t).toString('base64url')];

(async () => {
  const child = spawn(process.execPath, [path.join(__dirname, '..', '..', 'server', 'sync-server.mjs')], {
    env: { ...process.env, PORT: String(PORT), NOVA_SYNC_TOKEN: TOKEN, NOVA_SYNC_ROOM_TTL_MS: '200' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let logs = '';
  child.stdout.on('data', (d) => { logs += d; });
  child.stderr.on('data', (d) => { logs += d; });
  let exited = false;
  child.on('exit', () => { exited = true; });
  for (let i = 0; i < 100 && !logs.includes('dinliyor'); i++) await sleep(100);

  await rawRequest('GET /% HTTP/1.1\r\nHost: x\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n\r\n');
  await rawRequest('GARBAGE\r\n\r\n');
  ok(!exited, 'bozuk istek (/%) süreci düşürmedi');

  const bad = await wsOpen('r1', auth('yanlis'));
  ok(!bad.ok && bad.status === 401, 'yanlış token 401');
  const queryOnly = await wsOpen('r1?token=' + TOKEN, ['nova-sync']);
  ok(!queryOnly.ok, 'URL query token varsayılan olarak kabul edilmez');
  const origin = await wsOpen('r1', auth(TOKEN), { origin: 'https://evil.example' });
  ok(!origin.ok && origin.status === 403, 'yabancı Origin reddedilir');

  const good = await wsOpen('r1', auth(TOKEN));
  ok(good.ok && good.w.protocol === 'nova-sync', 'doğru token alt protokolle bağlanır, token yanıta yansımaz');
  if (good.ok) {
    let closeCode = 0;
    good.w.on('close', (c) => { closeCode = c; });
    good.w.send(Buffer.from([0, 99, 255, 255, 255]));  // bozuk sync mesajı
    await sleep(300);
    ok(!exited && closeCode === 1003, 'bozuk mesaj süreci düşürmedi, bağlantı 1003 ile kapandı');
  }
  ok(!logs.includes(TOKEN), 'token günlüğe yazılmadı');

  // oran sınırı: 10 başarısız denemeden sonra doğru token bile 429
  for (let i = 0; i < 10; i++) await wsOpen('r2', auth('x' + i));
  const blocked = await wsOpen('r2', auth(TOKEN));
  ok(!blocked.ok && blocked.status === 429, 'çok başarısız denemeden sonra IP engellenir (429)');

  child.kill();
})();
