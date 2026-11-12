// Eşzamanlama testleri: yerel bare depo ile fetch/pull/push ve ayrışma davranışı.
// Çalıştırma: node scripts/tests/sync.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile, execFileSync } = require('child_process');
const handlers = {};
const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return { ipcMain: { handle: (n, fn) => (handlers[n] = fn) } };
  return origLoad.call(this, req, ...rest);
};
function runGit(args, cwd, { raw = false } = {}) {
  return new Promise((resolve) => {
    execFile('git', args, { cwd, env: { ...process.env, LC_ALL: 'C', GIT_TERMINAL_PROMPT: '0' }, windowsHide: true, maxBuffer: 1e7 }, (error, stdout, stderr) => {
      resolve({ success: !error, stdout: stdout ? (raw ? stdout : stdout.trim()) : '', stderr: stderr ? stderr.trim() : error ? error.message : '' });
    });
  });
}
require(process.argv[2] || require('path').join(__dirname, '..', '..', 'electron-git.cjs')).register({ runGit, github: { isConnected: () => true }, isValidPath: (p) => typeof p === 'string' && p.length > 0 });
const call = (n, ...a) => handlers[n]({}, ...a);
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) process.exitCode = 1; };
const sh = (cwd, ...a) => execFileSync('git', a, { cwd, windowsHide: true }).toString().trim();

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-sync-'));
  const bare = path.join(root, 'remote.git');
  const A = path.join(root, 'A');
  const B = path.join(root, 'B');
  fs.mkdirSync(A); execFileSync('git', ['init', '--bare', '-b', 'main', bare], { windowsHide: true });
  sh(A, 'init', '-b', 'main'); sh(A, 'config', 'user.email', 't@example.invalid'); sh(A, 'config', 'user.name', 'T');
  fs.writeFileSync(path.join(A, 'f.txt'), '1'); sh(A, 'add', '.'); sh(A, 'commit', '-m', 'c1'); sh(A, 'remote', 'add', 'origin', bare);

  let r = await call('git:sync', A);          // upstream yok -> push --set-upstream
  ok(r.success, 'ilk sync upstream ayarlar ve gönderir ' + (r.stderr || ''));
  let st = await call('git:status', A);
  ok(st.hasUpstream && st.ahead === 0 && st.behind === 0 && st.hasRemote, 'durum: senkron');

  execFileSync('git', ['clone', '-q', bare, B], { windowsHide: true });
  sh(B, 'config', 'user.email', 't@example.invalid'); sh(B, 'config', 'user.name', 'T');
  fs.writeFileSync(path.join(B, 'g.txt'), '2'); sh(B, 'add', '.'); sh(B, 'commit', '-m', 'c2'); sh(B, 'push', '-q');

  r = await call('git:sync', A);              // geride -> pull --ff-only
  ok(r.success && r.pulled === 1 && fs.existsSync(path.join(A, 'g.txt')), 'geride: fast-forward çekti');

  fs.writeFileSync(path.join(A, 'h.txt'), '3'); sh(A, 'add', '.'); sh(A, 'commit', '-m', 'c3');
  st = await call('git:status', A);
  ok(st.ahead === 1 && st.behind === 0, 'durum: 1 ileride');
  r = await call('git:sync', A);
  ok(r.success && r.pushed === 1, 'ileride: gönderdi');

  sh(B, 'pull', '-q', '--ff-only'); fs.writeFileSync(path.join(B, 'i.txt'), '4'); sh(B, 'add', '.'); sh(B, 'commit', '-m', 'c4'); sh(B, 'push', '-q');
  fs.writeFileSync(path.join(A, 'j.txt'), '5'); sh(A, 'add', '.'); sh(A, 'commit', '-m', 'c5');
  r = await call('git:sync', A);              // ayrışmış
  ok(!r.success && r.stderr === 'diverged', 'ayrışmış: sessizce birleştirmedi');
  fs.rmSync(root, { recursive: true, force: true });
})();
