// Dil sunucusu köprüsü testleri: güvenlik (proje içi program çalıştırılmaz), doğrulama ve (PATH'te pyright varsa) gerçek bir sunucuyla
// tanılama, üzerine gelme, tamamlama. Pyright yoksa gerçek sunucu bölümü atlanır.
// Çalıştırma: node scripts/tests/lsp.test.cjs   (NOVA_TEST_PATH ile ek PATH klasörü verilebilir)
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.NOVA_TEST_PATH) process.env.PATH = process.env.NOVA_TEST_PATH + path.delimiter + process.env.PATH;

const handlers = {};
const events = [];
const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return { app: { on: () => {} }, ipcMain: { handle: (n, fn) => (handlers[n] = fn) } };
  return origLoad.call(this, req, ...rest);
};

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-lsp-'));
const mod = require(path.join(__dirname, '..', '..', 'electron-lsp.cjs'));
mod.register({
  getWindow: () => ({ isDestroyed: () => false, webContents: { send: (c, p) => events.push(p) } }),
  getRoot: () => root
});
const call = (n, a) => handlers[n]({}, a);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const waitFor = (pred, ms = 60000) => new Promise((res) => {
  const t0 = Date.now();
  const tick = () => { const e = events.find(pred); return e ? res(e) : Date.now() - t0 > ms ? res(null) : setTimeout(tick, 100); };
  tick();
});

(async () => {
  // --- doğrulama ---
  ok((await call('lsp:status', { lang: 'cobol' })).supported === false, 'desteklenmeyen dil bildirilir');
  const st = await call('lsp:status', { lang: 'python' });
  ok(st.supported === true && typeof st.name === 'string' && typeof st.hint === 'string', 'python için sunucu adı ve kurulum ipucu döner: ' + st.name);
  ok((await call('lsp:start', { lang: 'cobol' })).error === 'unsupported', 'desteklenmeyen dilde sunucu başlatılmaz');
  ok((await call('lsp:request', { lang: 'python', method: 'textDocument/hover', path: path.join(root, 'a.py'), params: {} })).success === false, 'sunucu yokken istek reddedilir');
  ok((await call('lsp:request', { lang: 'python', method: 'workspace/executeCommand', path: path.join(root, 'a.py'), params: {} })).success === false, 'izinsiz LSP yöntemi reddedilir');

  // --- güvenlik: proje içindeki program ASLA çalıştırılmaz (kötü niyetli proje kod çalıştıramaz) ---
  const evilBin = path.join(root, 'node_modules', '.bin');
  fs.mkdirSync(evilBin, { recursive: true });
  const marker = path.join(root, 'PWNED.txt');
  fs.writeFileSync(path.join(evilBin, 'pyright-langserver.cmd'), `@echo pwned > "${marker}"\r\n`);
  fs.writeFileSync(path.join(evilBin, 'pyright-langserver'), `#!/bin/sh\necho pwned > "${marker}"\n`, { mode: 0o755 });
  const savedPath = process.env.PATH;
  process.env.PATH = path.join(os.tmpdir(), 'nova-bos-path'); // gerçek sunucu PATH'te yok
  const miss = await call('lsp:start', { lang: 'python' });
  ok(miss.error === 'missing' && !!miss.hint, 'PATH dışındaki sunucu "kurulu değil" döner ve ipucu verir');
  await new Promise((r) => setTimeout(r, 800));
  ok(!fs.existsSync(marker), 'GÜVENLİK: proje içindeki node_modules/.bin programı çalıştırılmadı');
  process.env.PATH = savedPath;
  fs.rmSync(evilBin, { recursive: true, force: true });

  // --- gerçek sunucu (pyright PATH'te ise) ---
  const real = await call('lsp:status', { lang: 'python' });
  if (!real.available) {
    console.log('(PATH\'te pyright-langserver yok: gerçek sunucu bölümü atlandı)');
  } else {
    const file = path.join(root, 'main.py');
    fs.writeFileSync(file, 'x: int = "merhaba"\nimport os\nos.pa\n');
    const t0 = Date.now();
    const start = await call('lsp:start', { lang: 'python' });
    ok(start.success && start.state === 'ready', `${real.name} başladı (${Date.now() - t0} ms)`);
    ok(Array.isArray(start.triggers), 'tamamlama tetikleyicileri döner');

    const text = fs.readFileSync(file, 'utf8');
    await call('lsp:notify', { lang: 'python', method: 'textDocument/didOpen', path: file, params: { textDocument: { languageId: 'python', version: 1, text } } });
    const diag = await waitFor((e) => e.type === 'diagnostics' && e.path.toLowerCase() === file.toLowerCase() && e.diagnostics.length > 0);
    ok(!!diag && diag.diagnostics.some((d) => /int/.test(d.message) && d.range.start.line === 0), 'tanılama: x: int = "merhaba" satırı tür hatası verdi: ' + (diag && diag.diagnostics[0] && diag.diagnostics[0].message.slice(0, 70)));

    const hov = await call('lsp:request', { lang: 'python', method: 'textDocument/hover', path: file, params: { position: { line: 0, character: 0 } } });
    const hovText = JSON.stringify(hov.result || '');
    ok(hov.success && /int/.test(hovText), 'üzerine gelince tür bilgisi: x → int');

    const comp = await call('lsp:request', { lang: 'python', method: 'textDocument/completion', path: file, params: { position: { line: 2, character: 3 }, context: { triggerKind: 1 } } });
    const items = Array.isArray(comp.result) ? comp.result : (comp.result && comp.result.items) || [];
    ok(comp.success && items.some((i) => i.label === 'path'), `tamamlama: "os." sonrası ${items.length} öneri, "path" dahil`);

    // belge düzeltilince tanılama temizlenir (didChange tam metin)
    await call('lsp:notify', { lang: 'python', method: 'textDocument/didChange', path: file, params: { textDocument: { version: 2 }, contentChanges: [{ text: 'x: int = 5\n' }] } });
    const cleared = await waitFor((e) => e.type === 'diagnostics' && e.path.toLowerCase() === file.toLowerCase() && e.diagnostics.length === 0);
    ok(!!cleared, 'didChange sonrası tanılama temizlendi');

    // klasör dışı dosya reddedilir
    ok((await call('lsp:notify', { lang: 'python', method: 'textDocument/didOpen', path: path.join(os.tmpdir(), 'dışarıda.py'), params: { textDocument: { languageId: 'python', version: 1, text: 'x' } } })).success === false, 'klasör dışı dosya bildirimi reddedilir');
    await mod.stopAll();
    ok(!!(await waitFor((e) => e.type === 'state' && e.state === 'stopped', 10000)), 'durdurunca sunucu süreç ağacı kapandı');
  }

  try { fs.rmSync(root, { recursive: true, force: true }); } catch { /* Windows'ta geç kapanan sunucu klasörü bir süre kilitleyebilir */ }
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm dil sunucusu testleri geçti');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('HATA', e); process.exit(1); });
