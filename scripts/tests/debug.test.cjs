// Hata ayıklayıcı testleri: gerçek bir Node sürecine bağlanır (V8 Inspector). Kesme noktası, değişkenler, adım adım, ifade, çıktı, güvenlik.
// Çalıştırma: node scripts/tests/debug.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

const handlers = {};
const events = [];
const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return { app: { on: () => {} }, ipcMain: { handle: (n, fn) => (handlers[n] = fn) } };
  return origLoad.call(this, req, ...rest);
};

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-dbg-'));
const script = path.join(root, 'app.js');
fs.writeFileSync(script, [
  'function add(a, b) {',        // 1
  '  const sum = a + b;',        // 2
  '  return sum;',               // 3
  '}',                           // 4
  'let total = 0;',              // 5
  'for (let i = 0; i < 3; i++) {', // 6
  '  total = add(total, i);',    // 7
  '}',                           // 8
  'console.log("bitti", total);', // 9
  ''
].join('\n'));

const dbg = require(path.join(__dirname, '..', '..', 'electron-debug.cjs'));
dbg.register({
  getWindow: () => ({ isDestroyed: () => false, webContents: { send: (c, p) => events.push(p) } }),
  getRoot: () => root
});
const call = (n, a) => handlers[n]({}, a);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const waitFor = (pred, ms = 15000) => new Promise((res) => {
  const t0 = Date.now();
  const tick = () => { const e = events.find(pred); return e ? res(e) : Date.now() - t0 > ms ? res(null) : setTimeout(tick, 40); };
  tick();
});
const nextPause = async () => { const i = events.findIndex((e) => e.type === 'paused'); if (i < 0) return null; return events.splice(i, 1)[0]; };

(async () => {
  // --- güvenlik / doğrulama ---
  ok((await call('dbg:start', { file: path.join(os.tmpdir(), 'dışarıda.js') })).error === 'invalid-file', 'çalışma klasörü dışındaki dosya reddedilir');
  ok((await call('dbg:start', { file: '../etc/passwd' })).error === 'invalid-file', 'yol kaçışı reddedilir');
  fs.writeFileSync(path.join(root, 'notes.txt'), 'x');
  ok((await call('dbg:start', { file: path.join(root, 'notes.txt') })).error === 'invalid-file', 'JavaScript olmayan dosya reddedilir');
  ok((await call('dbg:setBreakpoints', { file: '/dışarı/a.js', lines: [1] })).error === 'invalid-file', 'klasör dışı kesme noktası reddedilir');
  ok((await call('dbg:resume')).success === false, 'oturum yokken komut hata döner');

  // --- kesme noktası ile başlat ---
  const bp = await call('dbg:setBreakpoints', { file: script, lines: [2, 'x', -4, 99999999] });
  ok(bp.success && bp.breakpoints.length === 1 && bp.breakpoints[0].line === 2, 'geçersiz satırlar elenir, geçerli kesme noktası kaydedilir');
  const started = await call('dbg:start', { file: script });
  ok(started.success, 'hata ayıklama başladı: ' + JSON.stringify(started));

  let p = await waitFor((e) => e.type === 'paused');
  events.splice(events.indexOf(p), 1);
  ok(p && p.frames[0].name === 'add' && p.frames[0].line === 2 && p.frames[0].file === script, 'ilk kesme noktasında durdu (add, satır 2): ' + JSON.stringify(p && p.frames[0]));
  ok(p.frames.length >= 2 && p.frames[1].line === 7, 'çağrı yığını: add ← ana betik satır 7');

  const sc = await call('dbg:scopes', { frameId: p.frames[0].id });
  const local = sc.scopes.find((s) => s.name === 'Yerel');
  ok(sc.success && local, 'kapsamlar alındı');
  const props = await call('dbg:properties', { ref: local.ref });
  const names = props.props.map((x) => `${x.name}=${x.value}`);
  ok(names.includes('a=0') && names.includes('b=0'), 'yerel değişkenler: ' + names.join(', '));

  const ev1 = await call('dbg:evaluate', { frameId: p.frames[0].id, expr: 'a + b + 10' });
  ok(ev1.success && ev1.value === '10', 'ifade değerlendirme çerçevede: ' + JSON.stringify(ev1));
  const ev2 = await call('dbg:evaluate', { frameId: p.frames[0].id, expr: 'yokDegisken.x' });
  ok(ev2.success && /ReferenceError/.test(ev2.error || ''), 'hatalı ifade hata metni döner');

  // --- adım adım ---
  await call('dbg:stepOver');
  p = await waitFor((e) => e.type === 'paused');
  events.splice(events.indexOf(p), 1);
  ok(p && p.frames[0].line === 3, 'adım at (stepOver) → satır 3');
  await call('dbg:resume');
  p = await waitFor((e) => e.type === 'paused');
  events.splice(events.indexOf(p), 1);
  const sc2 = await call('dbg:scopes', { frameId: p.frames[0].id });
  const pr2 = await call('dbg:properties', { ref: sc2.scopes.find((s) => s.name === 'Yerel').ref });
  ok(p && p.frames[0].line === 2 && pr2.props.some((x) => x.name === 'b' && x.value === '1'), 'devam → döngünün ikinci turunda aynı kesme noktası (b=1)');

  // --- kesme noktalarını kaldır ve bitir ---
  const clear = await call('dbg:setBreakpoints', { file: script, lines: [] });
  ok(clear.success, 'kesme noktaları kaldırıldı (canlı oturumda)');
  await call('dbg:resume');
  const exited = await waitFor((e) => e.type === 'exited');
  ok(exited && exited.code === 0, 'süreç 0 koduyla bitti: ' + JSON.stringify(exited));
  const out = events.filter((e) => e.type === 'output' && e.stream === 'stdout').map((e) => e.text).join('');
  ok(/bitti 3/.test(out), 'program çıktısı yakalandı: ' + JSON.stringify(out.trim()));

  // --- durdur ---
  events.length = 0;
  fs.writeFileSync(path.join(root, 'loop.js'), 'setInterval(() => {}, 1000);\n');
  const st = await call('dbg:start', { file: path.join(root, 'loop.js'), stopOnEntry: true });
  const entry = await waitFor((e) => e.type === 'paused');
  ok(st.success && entry, 'stopOnEntry: ilk satırda durur');
  await call('dbg:stop');
  const ex2 = await waitFor((e) => e.type === 'exited');
  ok(!!ex2, 'durdur: süreç sonlandırıldı');

  fs.rmSync(root, { recursive: true, force: true });
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm hata ayıklayıcı testleri geçti');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('HATA', e); process.exit(1); });
