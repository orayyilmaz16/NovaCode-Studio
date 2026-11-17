// Çalışma klasörü güveni testleri: kalıcı depo, git komut sınıflandırması, kısıtlı mod argümanları.
// Çalıştırma: node scripts/tests/trust.test.cjs
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
const trust = require(path.join(__dirname, '..', '..', 'electron-trust.cjs'));

const ok = (c, m) => { if (!c) process.exitCode = 1; console.log(c ? 'ok  ' : 'FAIL', m); };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-trust-'));
trust._test.setStoreDir(dir);
const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-proj-'));
fs.mkdirSync(path.join(proj, '.git'));
fs.writeFileSync(path.join(proj, '.git', 'config'), '[core]\n\tfsmonitor = evil\n[filter "lfsx"]\n\tclean = evil-clean\n\tsmudge = evil-smudge\n');

// ---- Depo ----
ok(!trust.isTrusted(proj), 'yeni klasör güvenilmez');
ok(!trust.isTrusted(''), 'boş yol güvenilmez');
trust.trustFolder(proj);
ok(trust.isTrusted(proj), 'güven verilince klasör güvenilir');
trust._test.resetCache();
ok(trust.isTrusted(proj), 'güven diske yazıldı (yeniden yükleme sonrası)');
ok(fs.existsSync(path.join(dir, 'ai-trust.json')), 'ai-trust.json deposu kullanılır');
const list = trust.listStore();
ok(list.folders.length === 1 && list.folders[0].label === proj, 'liste özgün yolu gösterir');
trust.addToStore('consent', 'https://api.example.com');
trust.addToStore('bases', 'https://llm.example.org');
ok(trust.listStore().consent.length === 1 && trust.listStore().bases.length === 1, 'rıza ve taban adresi eklenir (yapay zekâ akışı)');
ok(trust.removeFromStore('consent', 'https://api.example.com') && trust.listStore().consent.length === 0, 'rıza geri alınır');
ok(!trust.removeFromStore('consent', 'https://yok.example.com'), 'olmayan kayıt kaldırılamaz');
ok(!trust.removeFromStore('names', 'x') && !trust.removeFromStore('__proto__', 'x'), 'geçersiz alan reddedilir');
ok(trust.removeFromStore('folders', trust.listStore().folders[0].key) && !trust.isTrusted(proj), 'güvenilen klasör kaldırılır');
// Bozuk dosya: boş depoya düşer
fs.writeFileSync(path.join(dir, 'ai-trust.json'), '{bozuk');
trust._test.resetCache();
ok(!trust.isTrusted(proj) && trust.listStore().folders.length === 0, 'bozuk depo güvenli şekilde boş sayılır');

// ---- Git sınıflandırma ----
const cls = trust.classifyGit;
for (const a of [['status', '--porcelain=v2'], ['log', '-n', '5'], ['diff', '--cached'], ['branch', '--show-current'], ['branch', '-a'], ['remote', 'get-url', 'origin'], ['rev-parse', '-q', '--verify', 'HEAD'], ['stash', 'list'], ['show', 'HEAD']]) {
  ok(cls(a) === 'read', 'okuma: git ' + a.join(' '));
}
for (const a of [['commit', '-m', 'x'], ['checkout', 'main'], ['merge', 'x'], ['pull', '--ff-only'], ['stash', 'push'], ['stash', 'pop'], ['add', '-A'], ['push'], ['fetch'], ['branch', '-D', 'x'], ['branch', 'yeni'], ['remote', 'add', 'o', 'u'], ['tag', 'v1'], ['config', 'core.x', 'y'], ['init'], ['bilinmeyen']]) {
  ok(cls(a) === 'write', 'yazma/hook: git ' + a.join(' '));
}
ok(cls([]) === 'write' && cls(null) === 'write' && cls([1]) === 'write', 'geçersiz argüman = yazma');

// ---- Kapı ----
const trustedGate = trust.gateGit(['commit', '-m', 'x'], proj, true);
ok(trustedGate.allow && trustedGate.args.join(' ') === 'commit -m x', 'güvenilir klasörde argümanlar değişmez');
const deny = trust.gateGit(['commit', '-m', 'x'], proj, false);
ok(!deny.allow && deny.error === 'trust-required', 'kısıtlı modda commit güven ister');
const gate = trust.gateGit(['diff', '--cached'], proj, false);
const joined = gate.args.join(' ');
ok(gate.allow, 'kısıtlı modda diff çalışır');
ok(/core\.hooksPath=/.test(joined) && joined.includes(path.join(dir, 'empty-hooks')), 'core.hooksPath boş dizine yönlenir');
ok(fs.existsSync(path.join(dir, 'empty-hooks')) && fs.readdirSync(path.join(dir, 'empty-hooks')).length === 0, 'boş kanca dizini gerçekten boş');
ok(joined.includes('--no-ext-diff') && joined.includes('--no-textconv'), 'harici fark ve textconv kapatılır');
ok(joined.includes('filter.lfsx.clean=') && joined.includes('filter.lfsx.smudge='), '.git/config içindeki filtre komutları boşaltılır');
ok(joined.includes('credential.helper=') && joined.includes('core.fsmonitor=false'), 'kimlik yardımcısı ve fsmonitor kapalı');
ok(gate.args[gate.args.length - 1] === '--cached', 'özgün argümanlar korunur');
const st = trust.gateGit(['status', '--porcelain=v2'], path.join(proj, 'yok'), false);
ok(st.allow && !st.args.some((a) => a.startsWith('filter.')), 'depo olmayan klasörde filtre geçersiz kılma yok');

fs.rmSync(dir, { recursive: true, force: true });
fs.rmSync(proj, { recursive: true, force: true });
