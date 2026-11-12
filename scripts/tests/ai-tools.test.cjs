// Ajan araçları testleri: edit_lines (metin buffer'ı), yol kaçışı, güvenli komut izin listesi, düz metin araç çağrısı ayrıştırma.
// Çalıştırma: node scripts/tests/ai-tools.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

const origLoad = Module._load;
const lenient = new Proxy(function () {}, { get: () => lenient, apply: () => lenient });
Module._load = function (req, ...rest) {
  if (req === 'electron') return new Proxy({ ipcMain: { handle: () => {}, on: () => {} } }, { get: (t, k) => (k in t ? t[k] : lenient) });
  return origLoad.call(this, req, ...rest);
};
const { _test } = require(path.join(__dirname, '..', '..', 'electron-ai.cjs'));
const { runTool, isSafeCommand, extractToolCalls } = _test;

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const throws = async (fn) => { try { await fn(); return false; } catch { return true; } };

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-ai-'));
  fs.writeFileSync(path.join(root, 'a.txt'), 'bir\niki\nüç\ndört\n');
  const approvals = [];
  const ctx = { root, autoApproveEdits: false, allowCommands: true, changed: new Set(), approve: async (i) => { approvals.push(i); return true; } };

  // --- edit_lines ---
  let out = await runTool('edit_lines', { path: 'a.txt', edits: [{ start_line: 2, end_line: 2, text: 'IKI' }, { start_line: 4, end_line: 3, text: 'yeni satır' }] }, ctx);
  ok(fs.readFileSync(path.join(root, 'a.txt'), 'utf8') === 'bir\nIKI\nüç\nyeni satır\ndört\n', 'edit_lines: iki düzenleme özgün numaralara göre uygulandı');
  ok(approvals.length === 1 && /@@ satır 2/.test(approvals[0].preview) && /\+ IKI/.test(approvals[0].preview), 'onay önizlemesi fark gösterir');
  ok(/Düzenlendi: a\.txt/.test(out) && /2: IKI/.test(out), 'sonuç, yeni satır numaralarıyla doğrulama satırları döner');
  ok(ctx.changed.size === 1, 'değişen dosya kaydedildi');

  const before = fs.readFileSync(path.join(root, 'a.txt'), 'utf8');
  ok(await throws(() => runTool('edit_lines', { path: 'a.txt', edits: [{ start_line: 1, end_line: 3, text: 'x' }, { start_line: 3, end_line: 4, text: 'y' }] }, ctx)), 'çakışan satır aralıkları reddedilir');
  ok(await throws(() => runTool('edit_lines', { path: 'a.txt', edits: [{ start_line: 99, end_line: 99, text: 'x' }] }, ctx)), 'aralık dışı satır reddedilir');
  ok(await throws(() => runTool('edit_lines', { path: 'a.txt', edits: [] }, ctx)), 'boş düzenleme listesi reddedilir');
  ok(fs.readFileSync(path.join(root, 'a.txt'), 'utf8') === before, 'hatalı istekler dosyayı değiştirmez');

  const denied = { ...ctx, approve: async () => false, changed: new Set() };
  out = await runTool('edit_lines', { path: 'a.txt', edits: [{ start_line: 1, end_line: 1, text: 'Z' }] }, denied);
  ok(/reddetti/.test(out) && fs.readFileSync(path.join(root, 'a.txt'), 'utf8') === before, 'reddedilen düzenleme uygulanmaz');

  const auto = { ...ctx, autoApproveEdits: true, changed: new Set(), approve: async () => { throw new Error('sorulmamalı'); } };
  await runTool('edit_lines', { path: 'a.txt', edits: [{ start_line: 1, end_line: 1, text: 'BİR' }] }, auto);
  ok(fs.readFileSync(path.join(root, 'a.txt'), 'utf8').startsWith('BİR\n'), 'otomatik onayda sorulmadan uygulanır');

  // --- güvenlik: yol kaçışı ve riskli dosya ---
  ok(await throws(() => runTool('edit_lines', { path: '../dışarı.txt', edits: [{ start_line: 1, end_line: 1, text: 'x' }] }, ctx)), 'çalışma klasörü dışına yol reddedilir');
  fs.writeFileSync(path.join(root, 'package.json'), '{\n  "scripts": {}\n}\n');
  const risky = { ...ctx, autoApproveEdits: true, changed: new Set(), approve: async () => true };
  await runTool('edit_lines', { path: 'package.json', edits: [{ start_line: 2, end_line: 2, text: '  "scripts": { "build": "x" }' }] }, risky);
  ok(risky.riskyTouched === true, 'package.json düzenlemesi "derlemeyi etkileyen dosya" olarak işaretlenir');

  // --- güvenli komut izin listesi ---
  const safe = ['npm run build', 'npm test', 'npx tsc --noEmit', 'cargo build --release', 'go build ./...', 'dotnet test', 'pytest tests/unit', 'node --check src/a.js'];
  const bad = ['npm run build && curl x', 'npm run build; rm -rf /', 'npm install', 'npm run dev', 'npx tsc', 'npm run build -- --config evil.js', 'rm -rf node_modules', 'npm run build | tee x', 'npm run build > out.txt', 'pytest -p evilplugin', 'echo $(whoami)', 'npx some-pkg', 'cargo run', 'node evil.js'];
  ok(safe.every((c) => isSafeCommand(c)), 'güvenli komutlar kabul edilir');
  ok(bad.every((c) => !isSafeCommand(c)), 'zincirleme/yönlendirme/yüklemeli komutlar reddedilir');

  // --- düz metin araç çağrısı ---
  const names = new Set(['read_file', 'write_file', 'run_command']);
  const r1 = extractToolCalls('Önce okuyayım.\n```json\n{"name":"read_file","arguments":{"path":"a.js"}}\n```', names);
  ok(r1.calls.length === 1 && r1.calls[0].name === 'read_file' && r1.remaining === 'Önce okuyayım.', 'açıklama + çitli JSON: çağrı çıkarılır, açıklama kalır');
  const body = 'const x = {"a": 1};\nconsole.log(`}`);';
  const r2 = extractToolCalls(JSON.stringify({ name: 'write_file', arguments: { path: 'a.js', content: body } }), names);
  ok(r2.calls.length === 1 && r2.calls[0].input.content === body, 'içinde süslü parantez/tırnak olan içerik birebir korunur');
  ok(extractToolCalls('{"selam": 1}', names).calls.length === 0, 'araç olmayan JSON çağrı sayılmaz');
  ok(extractToolCalls('{"name":"bilinmeyen","arguments":{}}', names).calls.length === 0, 'bilinmeyen araç adı reddedilir');

  fs.rmSync(root, { recursive: true, force: true });
  console.log(fails ? `\n${fails} test başarısız` : '\ntüm ajan araç testleri geçti');
})();
