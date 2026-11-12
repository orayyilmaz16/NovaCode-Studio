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

    const [branchRes, statusRes, abRes, remoteRes, headRes, mergeRes] = await Promise.all([
      runGit(['branch', '--show-current'], repoPath),
      runGit(['status', '--porcelain=v1', '-z', '--untracked-files=normal'], repoPath, { raw: true }),
      runGit(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], repoPath),
      runGit(['remote', 'get-url', 'origin'], repoPath),
      runGit(['rev-parse', '--short', 'HEAD'], repoPath),
      runGit(['rev-parse', '-q', '--verify', 'MERGE_HEAD'], repoPath)
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
      merging: mergeRes.success,
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
    const res = await runGit(['log', '-n', '30', '--pretty=format:%h%x1f%an%x1f%ar%x1f%s%x1f%D'], repoPath);
    if (!res.success) return { success: true, commits: [] }; // henüz commit yok
    return {
      success: true,
      commits: res.stdout.split('\n').filter(Boolean).map((l) => {
        const [hash, author, when, subject, decor] = l.split('\x1f');
        const refs = (decor || '').split(',').map((s) => s.trim().replace(/^HEAD -> /, '').replace(/^tag: /, '')).filter((s) => s && s !== 'HEAD');
        return { hash, author, when, subject, refs };
      })
    };
  }));

  // ---- Ref (dal / etiket / commit) doğrulama: git'e yalnız var olan, "-" ile başlamayan adlar gider ----
  const REF_RE = /^[A-Za-z0-9._\/@{}~^-]{1,200}$/;
  const SHA_RE = /^[0-9a-f]{4,40}$/i;
  const refOk = async (repoPath, ref) => {
    if (typeof ref !== 'string' || ref.startsWith('-') || !REF_RE.test(ref)) return false;
    return (await runGit(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], repoPath)).success;
  };
  const tagOk = async (repoPath, name) =>
    typeof name === 'string' && /^[A-Za-z0-9._\/-]{1,100}$/.test(name) && !name.startsWith('-') &&
    (await runGit(['check-ref-format', `refs/tags/${name}`], repoPath)).success;
  const stashRef = (i) => (Number.isInteger(i) && i >= 0 && i < 1000 ? `stash@{${i}}` : null);
  const bad = (code) => ({ success: false, stdout: '', stderr: code });

  // ---- Fark: bir dosyanın iki sürümü (arayüz Monaco DiffEditor'da gösterir) ----
  // staged: HEAD ↔ index · unstaged: index ↔ çalışma ağacı · commit: üst ↔ commit. Metin dışı/çok büyük dosya içerik taşımaz.
  const MAX_DIFF = 2 * 1024 * 1024;
  ipcMain.handle('git:diffFile', guard(async (repoPath, opts) => {
    const o = opts && typeof opts === 'object' ? opts : {};
    const rel = safeRelPaths(repoPath, [o.path]);
    if (!rel) return bad('invalid-paths');
    const orig = o.orig ? safeRelPaths(repoPath, [o.orig]) : null;
    const base = (orig && orig[0]) || rel[0];
    const show = async (spec) => {
      const r = await runGit(['show', spec], repoPath, { raw: true });
      return r.success ? r.stdout : null;
    };
    let original = '';
    let modified = '';
    if (o.ref !== undefined) {
      if (!(typeof o.ref === 'string' && (SHA_RE.test(o.ref) || (await refOk(repoPath, o.ref))))) return bad('invalid-ref');
      original = (await show(`${o.ref}^:${base}`)) ?? '';
      modified = (await show(`${o.ref}:${rel[0]}`)) ?? '';
    } else if (o.staged) {
      original = (await show(`HEAD:${base}`)) ?? '';
      modified = (await show(`:${rel[0]}`)) ?? '';
    } else {
      original = (await show(`:${rel[0]}`)) ?? '';
      const abs = path.resolve(repoPath, rel[0]);
      try {
        const real = fs.realpathSync(abs);
        const root = fs.realpathSync(repoPath);
        const inside = path.relative(root, real);
        if (inside.startsWith('..') || path.isAbsolute(inside)) return bad('invalid-paths');
        const st = fs.statSync(real);
        if (st.isFile()) {
          if (st.size > MAX_DIFF) return { success: true, original: '', modified: '', tooLarge: true };
          modified = fs.readFileSync(real, 'utf8');
        }
      } catch { /* silinmiş dosya: sağ taraf boş */ }
    }
    if (original.length > MAX_DIFF || modified.length > MAX_DIFF) return { success: true, original: '', modified: '', tooLarge: true };
    if (original.slice(0, 8000).includes('\0') || modified.slice(0, 8000).includes('\0')) return { success: true, original: '', modified: '', binary: true };
    return { success: true, original, modified };
  }));

  // Bir commit'in değiştirdiği dosyalar (geçmişte genişletince listelenir)
  ipcMain.handle('git:commitFiles', guard(async (repoPath, hash) => {
    if (typeof hash !== 'string' || !SHA_RE.test(hash)) return { success: false, files: [] };
    const res = await runGit(['diff-tree', '--no-commit-id', '--name-status', '-r', '-M', '--root', '-z', hash], repoPath, { raw: true });
    if (!res.success) return { success: false, files: [] };
    const parts = res.stdout.split('\0').filter((x) => x !== '');
    const files = [];
    for (let i = 0; i < parts.length; i++) {
      const code = parts[i][0];
      if (code === 'R' || code === 'C') {
        files.push({ status: code, orig: parts[i + 1], path: parts[i + 2] });
        i += 2;
      } else {
        files.push({ status: code, path: parts[i + 1] });
        i += 1;
      }
    }
    return { success: true, files: files.filter((f) => f.path) };
  }));

  // ---- Dallar, uzak dallar, etiketler ----
  ipcMain.handle('git:refs', guard(async (repoPath) => {
    const res = await runGit(['for-each-ref', '--sort=-committerdate', '--format=%(refname)%1f%(refname:short)%1f%(objectname:short)%1f%(HEAD)%1f%(upstream:short)%1f%(subject)', 'refs/heads', 'refs/remotes', 'refs/tags'], repoPath);
    if (!res.success) return { success: false, local: [], remote: [], tags: [] };
    const local = [];
    const remote = [];
    const tags = [];
    for (const line of res.stdout.split('\n').filter(Boolean)) {
      const [full, name, hash, head, upstream, subject] = line.split('\x1f');
      if (full.startsWith('refs/heads/')) local.push({ name, hash, current: head === '*', upstream: upstream || undefined, subject });
      else if (full.startsWith('refs/remotes/')) { if (!full.endsWith('/HEAD')) remote.push({ name, hash, subject }); }
      else if (full.startsWith('refs/tags/')) tags.push({ name, hash, subject });
    }
    return { success: true, local, remote, tags };
  }));

  // Dal / uzak dal / etiket / commit'e geç. Etiket ve commit "detached HEAD"dir; uzak dal yerel izleyici dal oluşturur.
  ipcMain.handle('git:checkoutRef', guard(async (repoPath, ref) => {
    if (typeof ref !== 'string' || ref.startsWith('-') || !REF_RE.test(ref)) return bad('invalid-branch');
    const has = async (full) => (await runGit(['show-ref', '--verify', '--quiet', full], repoPath)).success;
    if (await has(`refs/heads/${ref}`)) return runGit(['switch', ref], repoPath);
    if (await has(`refs/remotes/${ref}`)) {
      const short = ref.slice(ref.indexOf('/') + 1);
      if (await has(`refs/heads/${short}`)) return runGit(['switch', short], repoPath);
      return runGit(['switch', '--track', ref], repoPath);
    }
    if ((await has(`refs/tags/${ref}`)) || SHA_RE.test(ref)) {
      if (!(await refOk(repoPath, ref))) return bad('invalid-ref');
      return runGit(['switch', '--detach', ref], repoPath);
    }
    return bad('invalid-ref');
  }));

  ipcMain.handle('git:createBranchFrom', guard(async (repoPath, name, from) => {
    if (!(await branchOk(repoPath, name))) return bad('invalid-branch');
    if (!(await refOk(repoPath, from))) return bad('invalid-ref');
    return runGit(['switch', '-c', name, from], repoPath);
  }));

  ipcMain.handle('git:deleteBranch', guard(async (repoPath, name, force) => {
    if (!(await branchOk(repoPath, name))) return bad('invalid-branch');
    const res = await runGit(['branch', force === true ? '-D' : '-d', name], repoPath);
    if (!res.success && /not fully merged/i.test(res.stderr)) return { ...res, stderr: 'not-merged' };
    return res;
  }));

  // ---- Birleştirme (merge): çakışırsa durum "merging" olur; arayüz çözümü ve iptali yönetir ----
  ipcMain.handle('git:merge', guard(async (repoPath, ref) => {
    if (!(await refOk(repoPath, ref))) return bad('invalid-ref');
    const res = await runGit(['merge', '--no-edit', ref], repoPath);
    if (!res.success && /CONFLICT|Automatic merge failed/i.test(`${res.stdout}\n${res.stderr}`)) return { ...res, stderr: 'merge-conflict' };
    return res;
  }));
  ipcMain.handle('git:mergeAbort', guard(async (repoPath) => runGit(['merge', '--abort'], repoPath)));
  ipcMain.handle('git:mergeContinue', guard(async (repoPath) => runGit(['commit', '--no-edit'], repoPath)));
  // Çakışan dosyada bir tarafı seç ("bizimki" / "onlarınki") ve sahneye al
  ipcMain.handle('git:resolve', guard(async (repoPath, file, side) => {
    const rel = safeRelPaths(repoPath, [file]);
    if (!rel || (side !== 'ours' && side !== 'theirs')) return bad('invalid-paths');
    const co = await runGit(['checkout', `--${side}`, '--', rel[0]], repoPath);
    if (!co.success) return co;
    return runGit(['add', '--', rel[0]], repoPath);
  }));

  // ---- Commit düzeltme / geri alma ----
  ipcMain.handle('git:amend', guard(async (repoPath, message) => {
    if (message !== undefined && message !== '' && (typeof message !== 'string' || message.length > 2000)) return bad('invalid-message');
    return runGit(message && message.trim() ? ['commit', '--amend', '-m', message.trim()] : ['commit', '--amend', '--no-edit'], repoPath);
  }));
  // Soft reset: değişiklikler silinmez, sahnede kalır
  ipcMain.handle('git:undoCommit', guard(async (repoPath) => {
    if (!(await runGit(['rev-parse', '--verify', '--quiet', 'HEAD~1'], repoPath)).success) return bad('no-parent');
    return runGit(['reset', '--soft', 'HEAD~1'], repoPath);
  }));

  // ---- Etiketler ----
  ipcMain.handle('git:createTag', guard(async (repoPath, name, message, ref) => {
    if (!(await tagOk(repoPath, name))) return bad('invalid-tag');
    if (ref !== undefined && ref !== '' && !(await refOk(repoPath, ref))) return bad('invalid-ref');
    if (message !== undefined && typeof message !== 'string') return bad('invalid-message');
    const args = message && message.trim() ? ['tag', '-a', name, '-m', message.trim().slice(0, 500)] : ['tag', name];
    if (ref) args.push(ref);
    return runGit(args, repoPath);
  }));
  ipcMain.handle('git:deleteTag', guard(async (repoPath, name) => {
    if (!(await tagOk(repoPath, name))) return bad('invalid-tag');
    return runGit(['tag', '-d', name], repoPath);
  }));
  ipcMain.handle('git:pushTag', guard(async (repoPath, name) => {
    if (!(await tagOk(repoPath, name))) return bad('invalid-tag');
    return runGit(['push', 'origin', `refs/tags/${name}`], repoPath, { auth: true });
  }));

  // ---- Stash (rafa kaldır) ----
  ipcMain.handle('git:stashList', guard(async (repoPath) => {
    const res = await runGit(['stash', 'list', '--format=%gs%x1f%cr'], repoPath);
    if (!res.success) return { success: true, stashes: [] };
    return { success: true, stashes: res.stdout.split('\n').filter(Boolean).map((l, index) => { const [msg, when] = l.split('\x1f'); return { index, message: msg, when }; }) };
  }));
  ipcMain.handle('git:stashPush', guard(async (repoPath, message, includeUntracked) => {
    if (message !== undefined && typeof message !== 'string') return bad('invalid-message');
    const args = ['stash', 'push'];
    if (includeUntracked !== false) args.push('--include-untracked');
    if (message && message.trim()) args.push('-m', message.trim().slice(0, 200));
    return runGit(args, repoPath);
  }));
  const stashDo = (act) => async (repoPath, index) => {
    const ref = stashRef(index);
    return ref ? runGit(['stash', act, ref], repoPath) : bad('invalid-stash');
  };
  ipcMain.handle('git:stashApply', guard(stashDo('apply')));
  ipcMain.handle('git:stashPop', guard(stashDo('pop')));
  ipcMain.handle('git:stashDrop', guard(stashDo('drop')));

  // ---- Klasörü depo yap ----
  ipcMain.handle('git:init', guard(async (repoPath) => {
    if (!fs.existsSync(repoPath)) return { success: false, stdout: '', stderr: 'invalid-path' };
    return runGit(['init', '-b', 'main'], repoPath);
  }));
}

module.exports = { register, BRANCH_RE };
