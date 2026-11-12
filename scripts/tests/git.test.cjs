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

  // ---- Fark (diff) ----
  fs.writeFileSync(path.join(dir, 'a.txt'), 'a\nyeni satır\n');
  let d = await call('git:diffFile', dir, { path: 'a.txt', staged: false });
  ok(d.success && d.original === 'a' && d.modified === 'a\nyeni satır\n', 'diff (sahnelenmemiş): index ↔ çalışma ağacı');
  await call('git:stage', dir, ['a.txt']);
  d = await call('git:diffFile', dir, { path: 'a.txt', staged: true });
  ok(d.success && d.original === 'a' && d.modified === 'a\nyeni satır\n', 'diff (sahnelenmiş): HEAD ↔ index');
  fs.writeFileSync(path.join(dir, 'yeni.txt'), 'yeni');
  d = await call('git:diffFile', dir, { path: 'yeni.txt', staged: false });
  ok(d.success && d.original === '' && d.modified === 'yeni', 'diff (izlenmeyen): boş ↔ dosya');
  fs.rmSync(path.join(dir, 'yeni.txt'));
  fs.rmSync(path.join(dir, 'a.txt'));
  d = await call('git:diffFile', dir, { path: 'a.txt', staged: false });
  ok(d.success && d.modified === '' && d.original === 'a\nyeni satır\n', 'diff (silinmiş): sağ taraf boş');
  ok(!(await call('git:diffFile', dir, { path: '../x', staged: false })).success, 'diff: yol geçişi reddedildi');
  ok(!(await call('git:diffFile', dir, { path: 'a.txt', ref: '--output=/tmp/x' })).success, 'diff: tehlikeli ref reddedildi');
  fs.writeFileSync(path.join(dir, 'bin.dat'), Buffer.from([1, 2, 0, 3, 4]));
  d = await call('git:diffFile', dir, { path: 'bin.dat', staged: false });
  ok(d.success && d.binary === true, 'diff: ikili dosya içerik taşımaz');
  fs.rmSync(path.join(dir, 'bin.dat'));
  g('checkout', '--', 'a.txt'); g('reset', '-q'); g('checkout', '--', '.');
  fs.writeFileSync(path.join(dir, 'a.txt'), 'a');

  // ---- Commit düzeltme / geri alma ----
  fs.writeFileSync(path.join(dir, 'b.txt'), 'b');
  await call('git:stage', dir, ['b.txt']);
  ok((await call('git:commit', dir, 'feat: second')).success, 'ikinci commit');
  const cf = await call('git:commitFiles', dir, 'HEAD'.length ? g('rev-parse', '--short', 'HEAD').trim() : '');
  ok(cf.success && cf.files.length === 1 && cf.files[0].path === 'b.txt' && cf.files[0].status === 'A', 'commit dosyaları: b.txt eklendi');
  d = await call('git:diffFile', dir, { path: 'b.txt', ref: g('rev-parse', '--short', 'HEAD').trim() });
  ok(d.success && d.original === '' && d.modified === 'b', 'commit farkı: üst yok → boş ↔ b');
  ok((await call('git:amend', dir, 'feat: second (düzeltildi)')).success && (await call('git:log', dir)).commits[0].subject === 'feat: second (düzeltildi)', 'amend mesajı değiştirdi');
  ok((await call('git:undoCommit', dir)).success, 'son commit geri alındı (soft)');
  st = await call('git:status', dir);
  ok(st.files.find((f) => f.path === 'b.txt').index === 'A', 'geri almada değişiklik sahnede kaldı');
  ok((await call('git:commit', dir, 'feat: second')).success, 'yeniden commit');

  // ---- Dallar, etiketler, birleştirme ----
  ok((await call('git:createTag', dir, 'v0.1', 'ilk')).success, 'etiket oluşturuldu');
  ok(!(await call('git:createTag', dir, '-x')).success && !(await call('git:createTag', dir, 'a..b')).success, 'geçersiz etiket adları reddedildi');
  const refs = await call('git:refs', dir);
  ok(refs.success && refs.local.some((b) => b.name === 'main' && b.current) && refs.tags.some((x) => x.name === 'v0.1'), 'refs: dal ve etiket listelendi');
  ok((await call('git:createBranchFrom', dir, 'dev', 'v0.1')).success && (await call('git:refs', dir)).local.some((b) => b.name === 'dev' && b.current), 'etiketten dal oluştur');
  fs.writeFileSync(path.join(dir, 'c.txt'), 'dev'); await call('git:stage', dir, ['c.txt']); await call('git:commit', dir, 'feat: dev');
  ok((await call('git:checkoutRef', dir, 'main')).success, 'checkoutRef main');
  ok((await call('git:checkoutRef', dir, 'v0.1')).success && (await call('git:status', dir)).detached, 'etiket → detached HEAD');
  ok((await call('git:checkoutRef', dir, 'main')).success, 'detached → main');
  ok(!(await call('git:checkoutRef', dir, 'yok-boyle-bir-ref')).success && !(await call('git:checkoutRef', dir, '--orphan')).success, 'olmayan/tehlikeli ref reddedildi');
  ok((await call('git:merge', dir, 'dev')).success && fs.existsSync(path.join(dir, 'c.txt')), 'merge dev → main');
  ok(!(await call('git:deleteBranch', dir, 'main')).success, 'geçerli dal silinemez');
  ok((await call('git:deleteBranch', dir, 'dev')).success, 'birleşmiş dal silindi');
  ok((await call('git:deleteTag', dir, 'v0.1')).success, 'etiket silindi');

  // çakışma: iki dal aynı satırı değiştirir
  g('switch', '-c', 'k1'); fs.writeFileSync(path.join(dir, 'a.txt'), 'k1'); g('commit', '-qam', 'k1');
  g('switch', 'main'); fs.writeFileSync(path.join(dir, 'a.txt'), 'main2'); g('commit', '-qam', 'main2');
  const mc = await call('git:merge', dir, 'k1');
  ok(!mc.success && mc.stderr === 'merge-conflict', 'merge çakışması bildirildi');
  st = await call('git:status', dir);
  ok(st.merging === true && st.files.some((f) => f.path === 'a.txt' && f.conflict), 'durum: merging + çakışan dosya');
  ok((await call('git:resolve', dir, 'a.txt', 'theirs')).success && fs.readFileSync(path.join(dir, 'a.txt'), 'utf8') === 'k1', 'çakışma: onlarınki seçildi');
  ok((await call('git:mergeContinue', dir)).success && !(await call('git:status', dir)).merging, 'birleştirme tamamlandı');
  g('switch', '-c', 'k2', 'HEAD~1'); fs.writeFileSync(path.join(dir, 'a.txt'), 'k2'); g('commit', '-qam', 'k2');
  g('switch', 'main');
  fs.writeFileSync(path.join(dir, 'a.txt'), 'main3'); g('commit', '-qam', 'main3');
  await call('git:merge', dir, 'k2');
  ok((await call('git:mergeAbort', dir)).success && !(await call('git:status', dir)).merging, 'birleştirme iptal edildi');
  ok(!(await call('git:merge', dir, '--abort')).success, 'merge: tehlikeli ref reddedildi');

  // ---- Stash ----
  fs.writeFileSync(path.join(dir, 'a.txt'), 'stashed'); fs.writeFileSync(path.join(dir, 'u.txt'), 'untracked');
  ok((await call('git:stashPush', dir, 'deneme')).success, 'stash push (izlenmeyen dahil)');
  ok(!fs.existsSync(path.join(dir, 'u.txt')), 'stash sonrası izlenmeyen dosya kalktı');
  const sl = await call('git:stashList', dir);
  ok(sl.stashes.length === 1 && /deneme/.test(sl.stashes[0].message), 'stash listesi');
  ok((await call('git:stashPop', dir, 0)).success && fs.readFileSync(path.join(dir, 'a.txt'), 'utf8') === 'stashed', 'stash pop geri getirdi');
  ok(!(await call('git:stashPop', dir, -1)).success && !(await call('git:stashDrop', dir, '0; x')).success, 'geçersiz stash indeksi reddedildi');
  g('checkout', '--', '.'); g('clean', '-fq');

  const sync = await call('git:sync', dir);
  ok(!sync.success, 'uzak olmadan sync hata verir (beklenen): ' + sync.step);

  connected = false;
  const locked = await call('git:status', dir);
  ok(locked.locked === true && locked.files.length === 0, 'bağlı değilken kilitli');
  ok((await call('git:commit', dir, 'x')).stderr === 'github-required', 'bağlı değilken commit reddedilir');
  fs.rmSync(dir, { recursive: true, force: true });
})();
