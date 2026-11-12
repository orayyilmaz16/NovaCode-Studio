import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  Check,
  AlertCircle,
  CircleDot,
  ExternalLink,
  Plus,
  Minus,
  Undo2,
  RefreshCcw,
  History,
  Loader2,
  CloudUpload
} from 'lucide-react';
import type { GitCommitInfo, GitFile, GitResult, GitStatus, GithubRepoInfo } from '../types';
import { t } from '../i18n/uiText';
import { useGithubAuth } from '../services/useGithubAuth';
import { useSettings } from '../services/SettingsContext';

interface GitPanelProps {
  status: GitStatus;
  currentRepoPath: string | null;
  onRefresh: () => void | Promise<void>;
  onLog?: (type: 'info' | 'error', text: string) => void;
}

type Feedback = { kind: 'ok' | 'err'; text: string } | null;

const STATUS_COLOR: Record<string, string> = {
  M: 'text-amber-400',
  A: 'text-emerald-400',
  U: 'text-emerald-400',
  D: 'text-rose-400',
  R: 'text-sky-400',
  C: 'text-sky-400'
};

const splitPath = (p: string) => {
  const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return i < 0 ? { dir: '', name: p } : { dir: p.slice(0, i + 1), name: p.slice(i + 1) };
};

// Git/GitHub hata kodlarını kullanıcı diline çevirir; bilinmeyenlerde git'in kendi mesajı gösterilir.
function explain(res: Pick<GitResult, 'stderr'>): string {
  const e = res.stderr || '';
  if (e === 'diverged') return t('gitDiverged');
  if (e === 'github-required') return t('gitLocked');
  return e && e.length < 400 ? e : t('gitFailed');
}

const iconBtn = 'p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent';
const field = 'w-full bg-nv-editor border border-zinc-700/80 rounded px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500';
const primaryBtn = 'w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded font-medium transition-colors cursor-pointer text-xs';

interface FileRowProps {
  f: GitFile;
  side: 'staged' | 'unstaged';
  busy: boolean;
  onStage: (f: GitFile) => void;
  onUnstage: (f: GitFile) => void;
  onDiscard: (f: GitFile) => void;
}

const FileRow: React.FC<FileRowProps> = ({ f, side, busy, onStage, onUnstage, onDiscard }) => {
  const { dir, name } = splitPath(f.path);
  const letter = side === 'staged' ? f.index : f.untracked ? 'U' : f.worktree;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-800/50 group" title={f.orig ? `${f.orig} → ${f.path}` : f.path}>
      <span className="truncate flex-1 min-w-0">
        <span className={f.conflict ? 'text-rose-300' : 'text-zinc-200'}>{name}</span>
        {dir && <span className="text-zinc-600 ml-1.5">{dir}</span>}
        {f.conflict && <span className="ml-1.5 text-[10px] text-rose-400">{t('gitConflict')}</span>}
      </span>
      <span className="hidden group-hover:flex items-center">
        {side === 'unstaged' && (
          <button className={iconBtn} title={t('gitDiscard')} aria-label={t('gitDiscard')} disabled={busy} onClick={() => onDiscard(f)}>
            <Undo2 size={12} />
          </button>
        )}
        {side === 'unstaged' ? (
          <button className={iconBtn} title={t('gitStage')} aria-label={t('gitStage')} disabled={busy} onClick={() => onStage(f)}>
            <Plus size={12} />
          </button>
        ) : (
          <button className={iconBtn} title={t('gitUnstage')} aria-label={t('gitUnstage')} disabled={busy} onClick={() => onUnstage(f)}>
            <Minus size={12} />
          </button>
        )}
      </span>
      <span className={`font-mono text-[10px] font-bold w-4 text-center ${STATUS_COLOR[letter] ?? 'text-zinc-400'}`}>{letter}</span>
    </div>
  );
};

export const GitPanel: React.FC<GitPanelProps> = ({ status, currentRepoPath, onRefresh, onLog }) => {
  const { auth } = useGithubAuth();
  const { values } = useSettings();
  const statusMs = Math.max(3, Number(values.gitStatusInterval) || 8) * 1000;
  const fetchMs = Math.max(15, Number(values.gitFetchInterval) || 60) * 1000;
  const autoFetch = values.gitAutoFetch !== false;
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [newBranchOpen, setNewBranchOpen] = useState(false);
  const [newBranch, setNewBranch] = useState('');
  const [prOpen, setPrOpen] = useState(false);
  const [pr, setPr] = useState({ title: '', body: '', draft: false });
  const [pubOpen, setPubOpen] = useState(false);
  const [pub, setPub] = useState({ name: '', isPrivate: true });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [commits, setCommits] = useState<GitCommitInfo[]>([]);
  const [repoInfo, setRepoInfo] = useState<GithubRepoInfo | null>(null);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isRepo = status.isRepo;
  const hasRemote = status.hasRemote;
  const files: GitFile[] = status.files ?? [];
  const staged = files.filter((f) => f.index);
  const unstaged = files.filter((f) => f.worktree || f.untracked);
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;

  const say = useCallback(
    (kind: 'ok' | 'err', text: string) => {
      setFeedback({ kind, text });
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), kind === 'ok' ? 3500 : 9000);
      onLog?.(kind === 'ok' ? 'info' : 'error', text);
    },
    [onLog]
  );

  // Bir Git işlemini çalıştırır: meşgul göstergesi, hata çevirisi, sonra durumu yeniler.
  const run = async (label: string, fn: () => Promise<GitResult>, okText?: string): Promise<boolean> => {
    if (busy) return false;
    setBusy(label);
    try {
      const res = await fn();
      if (res.success) {
        if (okText) say('ok', okText);
      } else {
        say('err', explain(res));
      }
      await refreshRef.current();
      return res.success;
    } catch (err) {
      say('err', String(err));
      return false;
    } finally {
      setBusy(null);
    }
  };

  // ---- Canlı güncellemeler ----
  // 1) Terminal/başka araçta yapılan değişiklikler en geç 8 sn içinde yansır (anlık güncelleme .git izleyicisinden gelir).
  useEffect(() => {
    if (!currentRepoPath || !isRepo) return;
    const tick = () => {
      if (!document.hidden) void refreshRef.current();
    };
    const id = setInterval(tick, statusMs);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [currentRepoPath, isRepo, statusMs]);

  // 2) Uzak depodaki yeni commit'ler (ahead/behind için) dakikada bir sessizce getirilir.
  useEffect(() => {
    if (!autoFetch || !currentRepoPath || !isRepo || !hasRemote || !auth.connected || !api?.gitFetch) return;
    let cancelled = false;
    const go = async () => {
      if (document.hidden) return;
      await api.gitFetch(currentRepoPath);
      if (!cancelled) void refreshRef.current();
    };
    void go();
    const id = setInterval(go, fetchMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentRepoPath, isRepo, hasRemote, auth.connected, api, autoFetch, fetchMs]);

  // 3) GitHub'daki açık PR'lar ve Actions koşuları 30 sn'de bir.
  useEffect(() => {
    const gh = window.electronAPI?.github;
    if (!currentRepoPath || !isRepo || !hasRemote || !auth.connected || !gh) {
      setRepoInfo(null);
      return;
    }
    let cancelled = false;
    const go = async () => {
      if (document.hidden) return;
      const info = await gh.repoInfo(currentRepoPath);
      if (!cancelled) setRepoInfo(info);
    };
    void go();
    const id = setInterval(go, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentRepoPath, isRepo, hasRemote, auth.connected]);

  // 4) Dal listesi ve geçmiş, durum her yenilendiğinde tazelenir.
  useEffect(() => {
    if (!currentRepoPath || !isRepo || !api) return;
    let cancelled = false;
    void api.gitBranches(currentRepoPath).then((r) => {
      if (!cancelled && r.success) setBranches(r.branches);
    });
    void api.gitLog(currentRepoPath).then((r) => {
      if (!cancelled && r.success) setCommits(r.commits);
    });
    return () => {
      cancelled = true;
    };
  }, [status, currentRepoPath, isRepo, api]);

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  // ---- Durum ekranları ----
  const center = 'flex flex-col items-center justify-center h-full p-4 text-center text-zinc-500 text-xs';

  if (!auth.connected || status.locked) {
    return (
      <div className={center}>
        <AlertCircle size={32} className="mb-2 text-indigo-400 opacity-80" />
        <p className="mt-1 leading-relaxed">{t('gitLocked')}</p>
      </div>
    );
  }

  if (!currentRepoPath || !api) {
    return (
      <div className={center}>
        <GitBranch size={32} className="mb-2 text-zinc-600 opacity-60" />
        <p className="mt-1">{t('gitOpenFolder')}</p>
      </div>
    );
  }

  const repo = currentRepoPath;

  if (!isRepo) {
    return (
      <div className={center}>
        <AlertCircle size={32} className="mb-2 text-amber-500 opacity-80" />
        <p className="font-semibold text-zinc-300">{t('gitNotRepo')}</p>
        <button onClick={() => run('init', () => api.gitInit(repo))} disabled={!!busy} className={`${primaryBtn} mt-3 max-w-[220px]`}>
          {busy === 'init' ? <Loader2 size={14} className="animate-spin" /> : <GitBranch size={14} />}
          <span>{t('gitInit')}</span>
        </button>
        {feedback && <p className={`mt-2 ${feedback.kind === 'err' ? 'text-rose-300' : 'text-emerald-300'}`}>{feedback.text}</p>}
      </div>
    );
  }

  // ---- Eylemler ----
  const doCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || staged.length === 0) return;
    if (await run('commit', () => api.gitCommit(repo, message), t('gitCommitDone'))) setMessage('');
  };

  const doCheckout = async (name: string) => {
    if (name && name !== status.branch) await run('checkout', () => api.gitCheckout(repo, name));
  };

  const doCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.trim()) return;
    if (await run('branch', () => api.gitCreateBranch(repo, newBranch.trim()))) {
      setNewBranch('');
      setNewBranchOpen(false);
    }
  };

  const doDiscard = async (list: GitFile[]) => {
    if (!window.confirm(t('gitDiscardConfirm'))) return;
    await run('discard', () => api.gitDiscard(repo, list.map((f) => ({ path: f.path, untracked: f.untracked }))));
  };

  const doCreatePr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pr.title.trim() || busy) return;
    setBusy('pr');
    try {
      const res = await api.github.createPr(repo, pr);
      if (res.success) {
        say('ok', t('prCreated'));
        setPr({ title: '', body: '', draft: false });
        setPrOpen(false);
        if (res.url) void api.github.openExternal(res.url);
      } else {
        say('err', res.error === 'on-default-branch' ? t('prOnDefault') : res.error === 'pr-exists' ? t('prExists') : res.detail || t('gitFailed'));
      }
      await refreshRef.current();
    } finally {
      setBusy(null);
    }
  };

  const doPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pub.name.trim() || busy) return;
    setBusy('publish');
    try {
      const res = await api.github.publishRepo(repo, { name: pub.name.trim(), isPrivate: pub.isPrivate });
      if (res.success) {
        say('ok', t('pubDone'));
        setPubOpen(false);
      } else {
        say('err', res.error === 'no-commits' ? t('pubNoCommits') : res.error === 'repo-exists' ? t('pubExists') : res.detail || t('gitFailed'));
      }
      await refreshRef.current();
    } finally {
      setBusy(null);
    }
  };

  const defaultBranch = repoInfo?.defaultBranch;
  const canPr = !!hasRemote && !!status.branch && !status.detached && (!defaultBranch || defaultBranch !== status.branch);
  const canPublish = hasRemote === false;
  const isBusy = !!busy;

  return (
    <div className="flex flex-col h-full bg-nv-side text-zinc-300 select-none text-xs overflow-y-auto">
      {/* Başlık: dal seçici + eşzamanla */}
      <div className="px-3 py-2.5 border-b border-zinc-800/80 space-y-2">
        <div className="flex items-center gap-1.5">
          <GitBranch size={14} className="text-indigo-400 shrink-0" />
          <select
            value={status.detached ? '' : status.branch}
            onChange={(e) => doCheckout(e.target.value)}
            disabled={isBusy}
            aria-label={t('gitBranch')}
            className="flex-1 min-w-0 bg-nv-editor border border-zinc-700/80 rounded px-1.5 py-1 text-indigo-300 font-mono text-[11px] outline-none focus:border-indigo-500"
          >
            {status.detached && <option value="">{status.branch}</option>}
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <button className={iconBtn} title={t('gitNewBranch')} aria-label={t('gitNewBranch')} onClick={() => setNewBranchOpen((v) => !v)}>
            <Plus size={14} />
          </button>
          <span title={t('gitLive')} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>

        <div className="flex items-center justify-between">
          <span title={t('gitAheadBehind')} className="font-mono text-[10px] text-zinc-400">
            {status.hasUpstream ? (
              <>
                <span className={status.ahead ? 'text-emerald-400' : ''}>↑{status.ahead ?? 0}</span>{' '}
                <span className={status.behind ? 'text-amber-300' : ''}>↓{status.behind ?? 0}</span>
              </>
            ) : null}
          </span>
          <div className="flex items-center">
            <button className={iconBtn} title={t('gitSync')} aria-label={t('gitSync')} disabled={isBusy || !hasRemote} onClick={() => run('sync', () => api.gitSync(repo), t('gitSyncDone'))}>
              {busy === 'sync' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
            </button>
            <button className={iconBtn} title={t('gitPull')} aria-label={t('gitPull')} disabled={isBusy || !hasRemote} onClick={() => run('pull', () => api.gitPull(repo), t('gitDone'))}>
              <DownloadCloud size={14} />
            </button>
            <button className={iconBtn} title={t('gitPush')} aria-label={t('gitPush')} disabled={isBusy || !hasRemote} onClick={() => run('push', () => api.gitPush(repo), t('gitDone'))}>
              <UploadCloud size={14} />
            </button>
            <button className={iconBtn} title="Refresh" aria-label="Refresh" onClick={() => void onRefresh()}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {newBranchOpen && (
          <form onSubmit={doCreateBranch} className="flex gap-1.5">
            <input value={newBranch} onChange={(e) => setNewBranch(e.target.value)} placeholder={t('gitBranchPlaceholder')} spellCheck={false} autoFocus className={`${field} font-mono`} />
            <button type="submit" disabled={!newBranch.trim() || isBusy} className="px-2.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white">
              {t('gitCreate')}
            </button>
          </form>
        )}
        {hasRemote === false && <p className="text-[11px] text-amber-300/90 leading-relaxed">{t('gitNoRemote')}</p>}
      </div>

      {/* Commit */}
      <form onSubmit={doCommit} className="p-3 border-b border-zinc-800/80 space-y-2">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('gitCommitPlaceholder')} className={`${field} resize-none h-16 font-sans`} />
        <button type="submit" disabled={!message.trim() || staged.length === 0 || isBusy} className={primaryBtn}>
          {busy === 'commit' ? <Loader2 size={14} className="animate-spin" /> : <GitCommit size={14} />}
          <span>
            {t('gitCommit')} ({staged.length})
          </span>
        </button>
        {staged.length === 0 && unstaged.length > 0 && <p className="text-[11px] text-zinc-500">{t('gitNothingStaged')}</p>}
        {feedback && (
          <div
            role="status"
            className={`text-[11px] py-1 px-2 rounded border leading-relaxed ${
              feedback.kind === 'ok' ? 'text-emerald-300 bg-emerald-950/30 border-emerald-800/50' : 'text-rose-300 bg-rose-950/30 border-rose-800/50'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </form>

      {/* Sahnelenenler */}
      {staged.length > 0 && (
        <div className="p-2 border-b border-zinc-800/80">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-2 py-1 uppercase tracking-wider">
            <span>
              {t('gitStaged')} · {staged.length}
            </span>
            <button className="normal-case font-normal text-zinc-500 hover:text-zinc-200" disabled={isBusy} onClick={() => run('unstage', () => api.gitUnstage(repo, staged.map((f) => f.path)))}>
              {t('gitUnstageAll')}
            </button>
          </div>
          {staged.map((f) => (
            <FileRow
              key={`s-${f.path}`}
              f={f}
              side="staged"
              busy={isBusy}
              onStage={(x) => run('stage', () => api.gitStage(repo, [x.path]))}
              onUnstage={(x) => run('unstage', () => api.gitUnstage(repo, [x.path]))}
              onDiscard={(x) => doDiscard([x])}
            />
          ))}
        </div>
      )}

      {/* Değişiklikler */}
      <div className="p-2 border-b border-zinc-800/80">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-2 py-1 uppercase tracking-wider">
          <span>
            {t('gitChanges')} · {unstaged.length}
          </span>
          {unstaged.length > 0 && (
            <button className="normal-case font-normal text-zinc-500 hover:text-zinc-200" disabled={isBusy} onClick={() => run('stage', () => api.gitStageAll(repo))}>
              {t('gitStageAll')}
            </button>
          )}
        </div>
        {unstaged.length === 0
          ? staged.length === 0 && (
              <div className="p-3 text-center text-zinc-500">
                <Check size={20} className="mx-auto mb-1 text-emerald-400 opacity-80" />
                <p>{t('gitClean')}</p>
              </div>
            )
          : unstaged.map((f) => (
              <FileRow
                key={`u-${f.path}`}
                f={f}
                side="unstaged"
                busy={isBusy}
                onStage={(x) => run('stage', () => api.gitStage(repo, [x.path]))}
                onUnstage={(x) => run('unstage', () => api.gitUnstage(repo, [x.path]))}
                onDiscard={(x) => doDiscard([x])}
              />
            ))}
      </div>

      {/* Pull request / yayınla */}
      {(canPr || canPublish) && (
        <div className="p-3 border-b border-zinc-800/80 space-y-2">
          {canPr && (
            <>
              <button onClick={() => setPrOpen((v) => !v)} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
                <GitPullRequest size={14} />
                <span>{t('prOpen')}</span>
              </button>
              {prOpen && (
                <form onSubmit={doCreatePr} className="space-y-2">
                  <input value={pr.title} onChange={(e) => setPr({ ...pr, title: e.target.value })} placeholder={t('prTitle')} maxLength={256} className={field} />
                  <textarea value={pr.body} onChange={(e) => setPr({ ...pr, body: e.target.value })} placeholder={t('prBody')} className={`${field} resize-none h-16 font-sans`} />
                  <label className="flex items-center gap-2 text-zinc-400">
                    <input type="checkbox" checked={pr.draft} onChange={(e) => setPr({ ...pr, draft: e.target.checked })} />
                    {t('prDraft')}
                  </label>
                  <button type="submit" disabled={!pr.title.trim() || isBusy} className={primaryBtn}>
                    {busy === 'pr' ? <Loader2 size={14} className="animate-spin" /> : <GitPullRequest size={14} />}
                    <span>{t('prSubmit')}</span>
                  </button>
                </form>
              )}
            </>
          )}
          {canPublish && (
            <>
              <button onClick={() => setPubOpen((v) => !v)} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
                <CloudUpload size={14} />
                <span>{t('pubTitle')}</span>
              </button>
              {pubOpen && (
                <form onSubmit={doPublish} className="space-y-2">
                  <input
                    value={pub.name}
                    onChange={(e) => setPub({ ...pub, name: e.target.value })}
                    placeholder={t('pubName')}
                    pattern="[A-Za-z0-9._\-]{1,100}"
                    spellCheck={false}
                    className={`${field} font-mono`}
                  />
                  <label className="flex items-center gap-2 text-zinc-400">
                    <input type="checkbox" checked={pub.isPrivate} onChange={(e) => setPub({ ...pub, isPrivate: e.target.checked })} />
                    {t('pubPrivate')}
                  </label>
                  <button type="submit" disabled={!pub.name.trim() || isBusy} className={primaryBtn}>
                    {busy === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                    <span>{t('pubSubmit')}</span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* GitHub'da canlı durum */}
      {repoInfo?.available && (
        <div className="px-3 py-2 border-b border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{t('ghLive')}</span>
            <button onClick={() => repoInfo.url && api.github.openExternal(repoInfo.url)} title={repoInfo.fullName} className="flex items-center gap-1 text-zinc-300 hover:text-white truncate max-w-[60%]">
              <span className="truncate">{repoInfo.fullName}</span>
              <ExternalLink size={11} className="shrink-0" />
            </button>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="flex items-center gap-1">
              <GitPullRequest size={12} /> {t('ghOpenPulls')}: {repoInfo.pulls?.length ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <CircleDot size={12} /> {repoInfo.openIssues ?? 0}
            </span>
          </div>
          {repoInfo.pulls?.map((p) => (
            <button key={p.number} onClick={() => api.github.openExternal(p.url)} className="w-full flex items-center gap-2 text-left text-zinc-300 hover:text-white">
              <GitPullRequest size={11} className="text-emerald-400 shrink-0" />
              <span className="truncate flex-1">
                #{p.number} {p.title}
              </span>
            </button>
          ))}
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider pt-1">{t('ghActions')}</div>
          {repoInfo.runs && repoInfo.runs.length > 0 ? (
            repoInfo.runs.map((r) => {
              const color =
                r.status !== 'completed'
                  ? 'bg-amber-400 animate-pulse'
                  : r.conclusion === 'success'
                    ? 'bg-emerald-400'
                    : r.conclusion === 'cancelled' || r.conclusion === 'skipped'
                      ? 'bg-zinc-500'
                      : 'bg-rose-400';
              return (
                <button key={r.id} onClick={() => api.github.openExternal(r.url)} className="w-full flex items-center gap-2 text-left text-zinc-300 hover:text-white">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                  <span className="truncate flex-1">{r.name}</span>
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[40%]">{r.branch}</span>
                </button>
              );
            })
          ) : (
            <div className="text-zinc-600">{t('ghNoRuns')}</div>
          )}
        </div>
      )}

      {/* Geçmiş */}
      <div className="p-2">
        <button onClick={() => setHistoryOpen((v) => !v)} className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-400 font-semibold uppercase tracking-wider hover:text-zinc-200">
          <History size={12} />
          <span>{t('gitHistory')}</span>
          <span className="ml-auto">{commits.length}</span>
        </button>
        {historyOpen &&
          (commits.length === 0 ? (
            <div className="p-3 text-center text-zinc-600">{t('gitNoCommits')}</div>
          ) : (
            commits.map((c) => (
              <div key={c.hash} className="px-2 py-1 rounded hover:bg-zinc-800/50" title={`${c.author} · ${c.when}`}>
                <div className="truncate text-zinc-200">{c.subject}</div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {c.hash} · {c.author} · {c.when}
                </div>
              </div>
            ))
          ))}
      </div>
    </div>
  );
};
