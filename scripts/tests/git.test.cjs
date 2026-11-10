// Git modülü testleri: gerçek git + geçici dizin; Electron ipcMain taklit edilir.
// Çalıştırma: node scripts/tests/git.test.cjs
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
let connected = true;
require(process.argv[2] || require('path').join(__dirname, '..', '..', 'electron-git.cjs')).register({
  runGit,
  github: { isConnected: () => connected },
  isValidPath: (p) => typeof p === 'string' && p.length > 0 && !p.includes('\0')
});
const call = (n, ...a) => handlers[n]({}, ...a);
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) process.exitCode = 1; };

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-git-'));
  const g = (...a) => execFileSync('git', a, { cwd: dir, windowsHide: true }).toString();
  g('init', '-b', 'main'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 'T');
  fs.writeFileSync(path.join(dir, ' lead space.txt'), 'x');
  fs.writeFileSync(path.join(dir, 'a.txt'), 'a');
  fs.writeFileSync(path.join(dir, 'ç-ünicode.txt'), 'u');

  let st = await call('git:status', dir);
  ok(st.isRepo && st.files.length === 3, 'status 3 dosya: ' + st.files.map((f) => JSON.stringify(f.path)).join(','));
  ok(st.files.some((f) => f.path === ' lead space.txt' && f.untracked), 'baştaki boşluklu ad bozulmadı');
  ok(st.files.some((f) => f.path === 'ç-ünicode.txt'), 'unicode ad bozulmadı');

  ok((await call('git:stage', dir, ['a.txt'])).success, 'stage a.txt');
  st = await call('git:status', dir);
  ok(st.files.find((f) => f.path === 'a.txt').index === 'A', 'a.txt sahnelendi');
  ok(!(await call('git:stage', dir, ['../evil'])).success, 'path traversal reddedildi');
  ok(!(await call('git:stage', dir, ['--all'])).success, '-- ile başlayan yol reddedildi');
  ok(!(await call('git:stage', dir, [path.resolve(dir, '..')])).success, 'dış mutlak yol reddedildi');

  const c1 = await call('git:commit', dir, 'feat: first');
  ok(c1.success, 'commit ' + c1.stderr);
  ok(!(await call('git:commit', dir, '   ')).success, 'boş mesaj reddedildi');
  st = await call('git:status', dir);
  ok(st.files.length === 2 && !st.hasUpstream && st.hasRemote === false, 'commit sonrası 2 izlenmeyen, uzak yok');

  fs.writeFileSync(path.join(dir, 'a.txt'), 'changed');
  ok((await call('git:stage', dir, ['a.txt'])).success, 'a.txt stage (değişiklik)');
  ok((await call('git:unstage', dir, ['a.txt'])).success, 'unstage');
  st = await call('git:status', dir);
  ok(st.files.find((f) => f.path === 'a.txt').worktree === 'M' && st.files.find((f) => f.path === 'a.txt').index === '', 'a.txt yalnız çalışma ağacında M');
  ok((await call('git:discard', dir, [{ path: 'a.txt', untracked: false }, { path: ' lead space.txt', untracked: true }])).success, 'discard');
  ok(fs.readFileSync(path.join(dir, 'a.txt'), 'utf8') === 'a' && !fs.existsSync(path.join(dir, ' lead space.txt')), 'discard etkisi doğru');

  ok((await call('git:createBranch', dir, 'feature/x')).success, 'dal oluştur');
  ok(!(await call('git:createBranch', dir, '-bad')).success, '-bad reddedildi');
  ok(!(await call('git:createBranch', dir, 'a..b')).success, 'a..b reddedildi');
  ok(!(await call('git:checkout', dir, 'x; rm -rf')).success, 'enjeksiyon reddedildi');
  const br = await call('git:branches', dir);
  ok(br.current === 'feature/x' && br.branches.includes('main'), 'dallar: ' + br.branches.join(','));
  ok((await call('git:checkout', dir, 'main')).success, 'checkout main');
  const lg = await call('git:log', dir);
  ok(lg.commits.length === 1 && lg.commits[0].subject === 'feat: first', 'log');

  const sync = await call('git:sync', dir);
  ok(!sync.success, 'uzak olmadan sync hata verir (beklenen): ' + sync.step);

  connected = false;
  const locked = await call('git:status', dir);
  ok(locked.locked === true && locked.files.length === 0, 'bağlı değilken kilitli');
  ok((await call('git:commit', dir, 'x')).stderr === 'github-required', 'bağlı değilken commit reddedilir');
  fs.rmSync(dir, { recursive: true, force: true });
})();
