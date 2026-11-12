// AI kod tamamlama (FIM) testleri: sahte yerel Ollama sunucusu; istem biçimi, gizli dosya, yalnız-yerel kuralı, durdurma jetonları, iptal.
// Çalıştırma: node scripts/tests/ai-complete.test.cjs
const Module = require('module');
const http = require('http');
const path = require('path');

const lenient = new Proxy(function () {}, { get: () => lenient, apply: () => lenient });
const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return new Proxy({ ipcMain: { handle: () => {}, on: () => {} } }, { get: (t, k) => (k in t ? t[k] : lenient) });
  return origLoad.call(this, req, ...rest);
};
const { _test } = require(path.join(__dirname, '..', '..', 'electron-ai.cjs'));
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };

(async () => {
  const seen = [];
  let mode = 'ok';
  const srv = http.createServer((req, res) => {
    let b = '';
    req.on('data', (d) => (b += d));
    req.on('end', () => {
      seen.push({ url: req.url, body: b ? JSON.parse(b) : null });
      if (mode === 'missing') { res.statusCode = 404; return res.end('{}'); }
      if (mode === 'slow') return; // asılı kalır (iptal testi)
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ response: '  return a + b;<|endoftext|>garbage' }));
    });
  }).listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const sig = new AbortController().signal;

  let r = await _test.completeCode({ prefix: 'function add(a, b) {\n', suffix: '\n}', fileName: 'a.js', baseUrl: base }, sig);
  ok(r.success && r.text === '  return a + b;', 'öneri döner, durdurma jetonundan sonrası kesilir: ' + JSON.stringify(r.text));
  const body = seen[0].body;
  ok(seen[0].url === '/api/generate' && body.raw === true && body.stream === false, 'yerel /api/generate, ham FIM isteği');
  ok(body.prompt === '<|fim_prefix|>function add(a, b) {\n<|fim_suffix|>\n}<|fim_middle|>', 'FIM istem biçimi doğru');
  ok(body.model === 'qwen2.5-coder:7b' && body.options.num_predict <= 128, 'sabit model, kısa çıktı sınırı');

  seen.length = 0;
  r = await _test.completeCode({ prefix: 'KEY=1', suffix: '', fileName: 'C:/proje/.env', baseUrl: base }, sig);
  ok(r.success && r.text === '' && r.skipped === 'secret' && seen.length === 0, 'GİZLİ DOSYA (.env) modele gönderilmez');
  r = await _test.completeCode({ prefix: 'x', suffix: '', fileName: 'id_rsa', baseUrl: base }, sig);
  ok(r.skipped === 'secret' && seen.length === 0, 'anahtar dosyası gönderilmez');

  let threw = false;
  try { r = await _test.completeCode({ prefix: 'x', suffix: '', fileName: 'a.js', baseUrl: 'https://example.com' }, sig); } catch { threw = true; }
  ok(threw || r.success === false, 'yerel olmayan adrese kod gönderilmez');
  threw = false;
  try { r = await _test.completeCode({ prefix: 'x', suffix: '', fileName: 'a.js', baseUrl: 'https://127.0.0.1.evil.example' }, sig); } catch { threw = true; }
  ok(threw || r.success === false, 'yerel görünümlü ama farklı alan adı reddedilir');

  ok((await _test.completeCode({ prefix: '  ', suffix: '\n', fileName: 'a.js', baseUrl: base }, sig)).text === '', 'boş bağlamda istek yok');
  ok((await _test.completeCode(null, sig)).success === false, 'bozuk istek reddedilir');

  seen.length = 0;
  await _test.completeCode({ prefix: 'a'.repeat(20000), suffix: 'b'.repeat(9000), fileName: 'a.js', baseUrl: base }, sig);
  ok(seen[0].body.prompt.length < 8200, 'bağlam sınırlandı (' + seen[0].body.prompt.length + ' karakter)');

  mode = 'missing';
  r = await _test.completeCode({ prefix: 'x', suffix: '', fileName: 'a.js', baseUrl: base }, sig);
  ok(r.success === false && r.error === 'http-404', 'model yoksa hata kodu döner (404)');

  mode = 'slow';
  const ac = new AbortController();
  const p = _test.completeCode({ prefix: 'x', suffix: '', fileName: 'a.js', baseUrl: base }, ac.signal).then(() => 'bitti', () => 'iptal');
  setTimeout(() => ac.abort(), 150);
  ok((await p) === 'iptal', 'iptal sinyali isteği keser');

  srv.closeAllConnections?.();
  srv.close();
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm AI tamamlama testleri geçti');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('HATA', e); process.exit(1); });
