// AI güvenlik testleri: .git yazma reddi, gizli dosya kalıpları, klasör güveni, gizli kalıp temizleme, kapanışta öldürme, arama iptali/paralellik.
// Çalıştırma: node scripts/tests/ai-security.test.cjs
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
const root0 = path.join(__dirname, '..', '..');
const ai = require(path.join(root0, 'electron-ai.cjs'));
const search = require(path.join(root0, 'electron-search.cjs'));
const { runTool, scrubSecrets, isRiskyPath, resolveInRoot } = ai._test;

const ok = (c, m) => { if (!c) process.exitCode = 1; console.log(c ? 'ok  ' : 'FAIL', m); };
const throws = async (fn) => { try { await fn(); return false; } catch { return true; } };

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-sec-'));
  fs.mkdirSync(path.join(root, '.git', 'hooks'), { recursive: true });
  fs.writeFileSync(path.join(root, '.git', 'config'), '[core]\n');
  fs.writeFileSync(path.join(root, 'ok.js'), 'const a = 1;\n');
  const ctx = { root, autoApproveEdits: true, allowCommands: true, changed: new Set(), approve: async () => true };

  // S-06: .git altına yazma reddi
  ok(await throws(() => runTool('write_file', { path: '.git/hooks/pre-commit', content: 'x' }, ctx)), 'write_file .git/hooks reddedilir');
  ok(await throws(() => runTool('replace_in_file', { path: '.git/config', old: 'core', new: 'x' }, ctx)), '.git/config düzenleme reddedilir');
  ok(await throws(() => resolveInRoot(root, '.GIT/x', true)), '.git büyük/küçük harf fark etmeden reddedilir');
  ok(isRiskyPath(root, path.join(root, '.git', 'hooks', 'x')), 'isRiskyPath .git altını riskli sayar');
  ok(!!resolveInRoot(root, 'ok.js', true), 'normal dosya yazma yolu serbest');

  // S-25: gizli dosya kalıpları (okuma)
  for (const p of ['.git/config', '.pypirc', '.docker/config.json', '.aws/credentials', '.ssh/known_hosts']) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), 'x');
    ok(await throws(() => runTool('read_file', { path: p }, ctx)), `read_file ${p} reddedilir`);
  }

  // S-05: güvenilmeyen klasör
  let asked = 0;
  const untrusted = { root, allowCommands: true, autoSafeCommands: true, trusted: false, changed: new Set(), approve: async () => { asked++; return false; }, requestTrust: async () => false };
  let out = await runTool('run_command', { command: 'node --check ok.js' }, untrusted);
  ok(asked === 1 && /reddetti/.test(out), 'güvenilmeyen klasörde güvenli komut bile onay ister');
  const trustNow = { ...untrusted, approve: async () => { asked++; return false; }, requestTrust: async () => true };
  asked = 0;
  out = await runTool('run_command', { command: 'node --check ok.js' }, trustNow);
  ok(asked === 0 && !/reddetti/.test(out), 'klasör güveni verilince güvenli komut onaysız çalışır');

  // S-26: gizli kalıp temizleme
  const dirty = 'key sk-ant-abcdefghijklmnopqrstuvwx\ntoken = "abcd1234efgh5678"\n-----BEGIN RSA PRIVATE KEY-----\nMIIabc\n-----END RSA PRIVATE KEY-----\nconst token = getToken();';
  const clean = scrubSecrets(dirty);
  ok(!/sk-ant-abc|abcd1234efgh|MIIabc/.test(clean), 'anahtar, token ve özel anahtar bloğu temizlenir');
  ok(/getToken\(\)/.test(clean), 'normal kod değişmez');

  // P-10: killAll
  ok(typeof ai.killAll === 'function' && ai.stopAll === ai.killAll, 'killAll/stopAll dışa aktarılır');
  ai.killAll();
  ok(true, 'killAll boş durumda hata vermez');

  // P-15: arama iptali ve paralel okuma
  const sroot = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-srch-'));
  for (let i = 0; i < 60; i++) fs.writeFileSync(path.join(sroot, `f${i}.txt`), i % 10 === 0 ? 'needle here\n' : 'nothing\n');
  const res = await search.searchText(sroot, { query: 'needle' });
  ok(res.results.length === 6 && !res.cancelled, 'paralel aramada tüm eşleşmeler bulunur');
  const ac = new AbortController();
  ac.abort();
  const cancelled = await search.searchText(sroot, { query: 'needle', signal: ac.signal });
  ok(cancelled.cancelled === true && cancelled.results.length === 0, 'iptal edilen arama erken döner');
  const l1 = await search.listFiles(sroot);
  fs.writeFileSync(path.join(sroot, 'new.txt'), 'x');
  const l2 = await search.listFiles(sroot);
  ok(l2.length === l1.length, 'dosya listesi önbellekten gelir');
  search.invalidateFileList(sroot);
  ok((await search.listFiles(sroot)).length === l1.length + 1, 'önbellek geçersiz kılınınca yeni dosya görünür');

  fs.rmSync(root, { recursive: true, force: true });
  fs.rmSync(sroot, { recursive: true, force: true });
  setTimeout(() => process.exit(process.exitCode || 0), 50);
})();
