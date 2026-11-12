// Git işlemleri (ana süreç). Tüm komutlar execFile ile argüman dizisi olarak çalışır; kabuk yoktur.
// GitHub hesabı bağlı değilken hiçbir Git verisi renderer'a verilmez.
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const BRANCH_RE = /^(?!-)(?!.*\.\.)(?!.*\/\/)(?!.*\.lock(\/|$))[A-Za-z0-9._\/-]{1,100}(?<![\/.])$/;
const MAX_PATHS = 500;

function register({ runGit, github, isValidPath }) {
  const LOCKED = { success: false, stdout: '', stderr: 'github-required' };
  const guard = (fn) => async (event, repoPath, ...rest) => {
    if (!github.isConnected()) return LOCKED;
    if (!isValidPath(repoPath)) return { success: false, stdout: '', stderr: 'invalid-path' };
    return fn(repoPath, ...rest);
  };

  // Renderer'dan gelen göreli yolları depo içinde mi diye doğrula (path traversal koruması).
  function safeRelPaths(repoPath, paths) {
    if (!Array.isArray(paths) || paths.length === 0 || paths.length > MAX_PATHS) return null;
    const root = path.resolve(repoPath);
    const out = [];
    for (const p of paths) {
      if (typeof p !== 'string' || !p || p.includes('\0') || p.startsWith('-')) return null;
      const abs = path.resolve(root, p);
      const rel = path.relative(root, abs);
      if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
      out.push(rel.split(path.sep).join('/'));
    }
    return out;
  }

  // ---- Durum: sahnelenmiş / sahnelenmemiş ayrımı (porcelain v1, NUL ayrımlı) ----
  ipcMain.handle('git:status', async (_e, repoPath) => {
    if (!github.isConnected()) return { isRepo: false, locked: true, changes: [], files: [] };
    if (!isValidPath(repoPath)) return { isRepo: false, changes: [], files: [] };
    const check = await runGit(['rev-parse', '--is-inside-work-tree'], repoPath);
    if (!check.success || check.stdout !== 'true') return { isRepo: false, changes: [], files: [] };

    const [branchRes, statusRes, abRes, remoteRes, headRes] = await Promise.all([
      runGit(['branch', '--show-current'], repoPath),
      runGit(['status', '--porcelain=v1', '-z', '--untracked-files=normal'], repoPath, { raw: true }),
      runGit(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], repoPath),
      runGit(['remote', 'get-url', 'origin'], repoPath),
      runGit(['rev-parse', '--short', 'HEAD'], repoPath)
    ]);

    const files = [];
    const parts = (statusRes.stdout || '').split('\0');
    for (let i = 0; i < parts.length; i++) {
      const entry = parts[i];
      if (entry.length < 4) continue;
      const x = entry[0];
      const y = entry[1];
      const file = entry.slice(3);
      let orig;
      if (x === 'R' || x === 'C') orig = parts[++i]; // yeniden adlandırmada eski ad sonraki alandadır
      files.push({
        path: file,
        orig,
        index: x === ' ' || x === '?' ? '' : x,
        worktree: y === ' ' ? '' : y === '?' ? 'U' : y,
        untracked: x === '?',
        conflict: x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D')
      });
    }

    let behind = 0;
    let ahead = 0;
    let hasUpstream = false;
    if (abRes.success) {
      const [b, a] = abRes.stdout.split(/\s+/).map(Number);
      behind = b || 0;
      ahead = a || 0;
      hasUpstream = true;
    }
    return {
      isRepo: true,
      branch: branchRes.stdout || (headRes.success ? `HEAD@${headRes.stdout}` : 'main'),
      detached: !branchRes.stdout,
      ahead,
      behind,
      hasUpstream,
      hasRemote: remoteRes.success,
      files,
      // Eski arayüzle uyum: tek liste
      changes: files.map((f) => ({ code: f.untracked ? '??' : `${f.index || ' '}${f.worktree || ' '}`.trim(), file: f.path }))
    };
  });

  // ---- Sahneleme ----
  ipcMain.handle('git:stage', guard(async (repoPath, paths) => {
    const rel = safeRelPaths(repoPath, paths);
    if (!rel) return { success: false, stdout: '', stderr: 'invalid-paths' };
    return runGit(['add', '--', ...rel], repoPath);
  }));

  ipcMain.handle('git:stageAll', guard(async (repoPath) => runGit(['add', '-A'], repoPath)));

  ipcMain.handle('git:unstage', guard(async (repoPath, paths) => {
    const rel = safeRelPaths(repoPath, paths);
    if (!rel) return { success: false, stdout: '', stderr: 'invalid-paths' };
    // HEAD yoksa (ilk commit öncesi) restore --staged çalışmaz; rm --cached kullan.
    const hasHead = (await runGit(['rev-parse', '--verify', 'HEAD'], repoPath)).success;
    return hasHead
      ? runGit(['restore', '--staged', '--', ...rel], repoPath)
      : runGit(['rm', '--cached', '-r', '--', ...rel], repoPath);
  }));

  // Geri alınamaz: arayüz onay ister. İzlenmeyen dosyalar silinir, izlenenler HEAD'e döner.
  ipcMain.handle('git:discard', guard(async (repoPath, files) => {
    if (!Array.isArray(files)) return { success: false, stdout: '', stderr: 'invalid-paths' };
    const tracked = safeRelPaths(repoPath, files.filter((f) => f && !f.untracked).map((f) => f.path));
    const untracked = safeRelPaths(repoPath, files.filter((f) => f && f.untracked).map((f) => f.path));
    let last = { success: true, stdout: '', stderr: '' };
    if (tracked) last = await runGit(['restore', '--source=HEAD', '--staged', '--worktree', '--', ...tracked], repoPath);
    if (last.success && untracked) last = await runGit(['clean', '-f', '--', ...untracked], repoPath);
    return last;
  }));

  // ---- Commit: yalnız sahnelenmiş değişiklikler ----
  ipcMain.handle('git:commit', guard(async (repoPath, message) => {
    if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return { success: false, stdout: '', stderr: 'invalid-message' };
    }
    return runGit(['commit', '-m', message.trim()], repoPath);
  }));

  // ---- Uzak depo: push / pull / fetch / sync ----
  const push = async (repoPath) => {
    const res = await runGit(['push'], repoPath, { auth: true });
    if (!res.success && /no upstream branch|has no upstream/i.test(res.stderr)) {
      return runGit(['push', '--set-upstream', 'origin', 'HEAD'], repoPath, { auth: true });
    }
    return res;
  };
  ipcMain.handle('git:push', guard(push));
  ipcMain.handle('git:fetch', guard((repoPath) => runGit(['fetch', '--prune'], repoPath, { auth: true, timeout: 30000 })));
  ipcMain.handle('git:pull', guard((repoPath) => runGit(['pull', '--ff-only'], repoPath, { auth: true })));

  // Eşzamanla: fetch → (gerideyse) fast-forward pull → (ilerideyse/upstream yoksa) push.
  ipcMain.handle('git:sync', guard(async (repoPath) => {
    const fetched = await runGit(['fetch', '--prune'], repoPath, { auth: true, timeout: 60000 });
    if (!fetched.success) return { ...fetched, step: 'fetch' };
    const ab = await runGit(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], repoPath);
    let behind = 0;
    let ahead = 0;
    if (ab.success) {
      [behind, ahead] = ab.stdout.split(/\s+/).map((n) => Number(n) || 0);
    }
    if (behind > 0 && ahead > 0) {
      return { success: false, stdout: '', stderr: 'diverged', step: 'pull' }; // sessizce birleştirme/yeniden yazma yapma
    }
    if (behind > 0) {
      const pulled = await runGit(['pull', '--ff-only'], repoPath, { auth: true });
      if (!pulled.success) return { ...pulled, step: 'pull' };
    }
    if (ahead > 0 || !ab.success) {
      const pushed = await push(repoPath);
      if (!pushed.success) return { ...pushed, step: 'push' };
    }
    return { success: true, stdout: '', stderr: '', step: 'done', pulled: behind, pushed: ahead };
  }));

  // ---- Dallar ----
  ipcMain.handle('git:branches', guard(async (repoPath) => {
    const res = await runGit(['for-each-ref', '--format=%(refname:short)|%(HEAD)', 'refs/heads'], repoPath);
    if (!res.success) return { success: false, branches: [], current: '' };
    const branches = [];
    let current = '';
    for (const line of res.stdout.split('\n').filter(Boolean)) {
      const [name, head] = line.split('|');
      branches.push(name);
      if (head === '*') current = name;
    }
    return { success: true, branches, current };
  }));

  const branchOk = async (repoPath, name) => {
    if (typeof name !== 'string' || !BRANCH_RE.test(name)) return false;
    return (await runGit(['check-ref-format', '--branch', name], repoPath)).success;
  };

  ipcMain.handle('git:checkout', guard(async (repoPath, name) => {
    if (!(await branchOk(repoPath, name))) return { success: false, stdout: '', stderr: 'invalid-branch' };
    return runGit(['switch', name], repoPath);
  }));

  ipcMain.handle('git:createBranch', guard(async (repoPath, name) => {
    if (!(await branchOk(repoPath, name))) return { success: false, stdout: '', stderr: 'invalid-branch' };
    return runGit(['switch', '-c', name], repoPath);
  }));

  // ---- Geçmiş ----
  ipcMain.handle('git:log', guard(async (repoPath) => {
    const res = await runGit(['log', '-n', '15', '--pretty=format:%h%x1f%an%x1f%ar%x1f%s'], repoPath);
    if (!res.success) return { success: true, commits: [] }; // henüz commit yok
    return {
      success: true,
      commits: res.stdout.split('\n').filter(Boolean).map((l) => {
        const [hash, author, when, subject] = l.split('\x1f');
        return { hash, author, when, subject };
      })
    };
  }));

  // ---- Klasörü depo yap ----
  ipcMain.handle('git:init', guard(async (repoPath) => {
    if (!fs.existsSync(repoPath)) return { success: false, stdout: '', stderr: 'invalid-path' };
    return runGit(['init', '-b', 'main'], repoPath);
  }));
}

module.exports = { register, BRANCH_RE };
