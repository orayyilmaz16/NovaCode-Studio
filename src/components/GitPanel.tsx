import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  AlertCircle,
  CircleDot,
  ExternalLink,
  Plus,
  Minus,
  Undo2,
  RefreshCcw,
  History,
  Loader2,
  CloudUpload,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Tag,
  Archive,
  Check,
  X
} from 'lucide-react';
import type { FileItem, GitCommitFile, GitCommitInfo, GitFile, GitResult, GitStash, GitStatus, GithubRepoInfo } from '../types';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';
import { useGithubAuth } from '../services/useGithubAuth';
import { useSettings } from '../services/SettingsContext';
import { explainGit, splitPath } from '../services/gitExplain';
import { languageFromName } from '../services/lang';
import { FileTypeIcon } from './FileTypeIcon';
import { PopupMenu, type MenuItem } from './Menu';
import type { PickerMode } from './BranchPicker';

interface GitPanelProps {
  status: GitStatus;
  currentRepoPath: string | null;
  onRefresh: () => void | Promise<void>;
  onLog?: (type: 'info' | 'error', text: string) => void;
  /** Fark sekmesi aç (salt okunur). */
  onOpenDiff: (item: FileItem) => void;
  onOpenFile: (path: string) => void;
  /** Dal/etiket seçiciyi aç (uygulama kabuğunda durur; durum çubuğuyla ortaktır). */
  onPicker: (mode: PickerMode) => void;
  /** Seçici gibi dış kaynaklı işlem sonuçları. */
  notice?: { id: number; ok: boolean; text: string } | null;
}

type Feedback = { kind: 'ok' | 'err'; text: string } | null;
type Ask = { kind: 'tag'; name: string; msg: string } | { kind: 'stash'; msg: string } | null;

const STATUS_COLOR: Record<string, string> = {
  M: 'text-amber-400',
  A: 'text-emerald-400',
  U: 'text-emerald-400',
  D: 'text-rose-400',
  R: 'text-sky-400',
  C: 'text-sky-400',
  '!': 'text-rose-400'
};
const NAME_COLOR: Record<string, string> = {
  M: 'text-amber-200',
  A: 'text-emerald-200',
  U: 'text-emerald-200',
  D: 'text-rose-300 line-through',
  R: 'text-sky-200',
  '!': 'text-rose-300'
};

const iconBtn = 'p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent';
const field = 'w-full bg-nv-editor border border-zinc-700/80 rounded px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500';
const primaryBtn = 'w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded font-medium transition-colors cursor-pointer text-xs';

interface FileRowProps {
  f: GitFile;
  side: 'staged' | 'unstaged' | 'conflict';
  busy: boolean;
  onOpenDiff: (f: GitFile, side: 'staged' | 'unstaged') => void;
  onOpenFile: (f: GitFile) => void;
  onStage: (f: GitFile) => void;
  onUnstage: (f: GitFile) => void;
  onDiscard: (f: GitFile) => void;
  onResolve: (f: GitFile, side: 'ours' | 'theirs') => void;
}

const FileRow: React.FC<FileRowProps> = ({ f, side, busy, onOpenDiff, onOpenFile, onStage, onUnstage, onDiscard, onResolve }) => {
  const { dir, name } = splitPath(f.path);
  const letter = side === 'conflict' ? '!' : side === 'staged' ? f.index : f.untracked ? 'U' : f.worktree;
  return (
    <div
      className="flex items-center gap-1.5 pl-3 pr-2 h-[22px] rounded hover:bg-zinc-800/50 group cursor-pointer"
      title={f.orig ? `${f.orig} → ${f.path}` : f.path}
      onClick={() => (side === 'conflict' ? onOpenFile(f) : onOpenDiff(f, side))}
    >
      <FileTypeIcon name={name} size={15} />
      <span className="truncate flex-1 min-w-0">
        <span className={NAME_COLOR[letter] ?? 'text-zinc-200'}>{name}</span>
        {dir && <span className="text-zinc-600 ml-1.5 text-[11px]">{dir}</span>}
      </span>
      <span className="hidden group-hover:flex items-center" onClick={(e) => e.stopPropagation()}>
        {side !== 'conflict' && letter !== 'D' && (
          <button className={iconBtn} title={t('scmOpenFile')} aria-label={t('scmOpenFile')} onClick={() => onOpenFile(f)}>
            <FileText size={12} />
          </button>
        )}
        {side === 'conflict' && (
          <>
            <button className={iconBtn} title={t('scmAcceptOurs')} aria-label={t('scmAcceptOurs')} disabled={busy} onClick={() => onResolve(f, 'ours')}>
              <Undo2 size={12} />
            </button>
            <button className={iconBtn} title={t('scmAcceptTheirs')} aria-label={t('scmAcceptTheirs')} disabled={busy} onClick={() => onResolve(f, 'theirs')}>
              <DownloadCloud size={12} />
            </button>
          </>
        )}
        {side === 'unstaged' && (
          <button className={iconBtn} title={t('gitDiscard')} aria-label={t('gitDiscard')} disabled={busy} onClick={() => onDiscard(f)}>
            <Undo2 size={12} />
          </button>
        )}
        {side === 'unstaged' || side === 'conflict' ? (
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

const Section: React.FC<{ title: string; count: number; open: boolean; onToggle: () => void; actions?: React.ReactNode; children: React.ReactNode }> = ({ title, count, open, onToggle, actions, children }) => (
  <div className="py-1 border-b border-zinc-800/80">
    <div className="group/sec flex items-center h-6 pr-2 text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
      <button onClick={onToggle} aria-expanded={open} title={t('scmCollapse')} className="flex items-center gap-1 flex-1 min-w-0 pl-1.5 h-full text-left hover:text-zinc-200">
        {open ? <ChevronDown size={13} className="shrink-0" /> : <ChevronRight size={13} className="shrink-0" />}
        <span className="truncate">{title}</span>
      </button>
      <span className="hidden group-hover/sec:flex items-center">{actions}</span>
      <span className="ml-1 px-1.5 rounded-full bg-zinc-700/70 text-[10px] text-zinc-300 normal-case tracking-normal">{count}</span>
    </div>
    {open && <div className="px-1">{children}</div>}
  </div>
);

export const GitPanel: React.FC<GitPanelProps> = ({ status, currentRepoPath, onRefresh, onLog, onOpenDiff, onOpenFile, onPicker, notice }) => {
  const { auth } = useGithubAuth();
  const { values } = useSettings();
  const statusMs = Math.max(3, Number(values.gitStatusInterval) || 8) * 1000;
  const fetchMs = Math.max(15, Number(values.gitFetchInterval) || 60) * 1000;
  const autoFetch = values.gitAutoFetch !== false;
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [ask, setAsk] = useState<Ask>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; kind: 'more' | 'commit' } | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ merge: true, staged: true, changes: true, stash: true });
  const [prOpen, setPrOpen] = useState(false);
  const [pr, setPr] = useState({ title: '', body: '', draft: false });
  const [pubOpen, setPubOpen] = useState(false);
  const [pub, setPub] = useState({ name: '', isPrivate: true });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [commits, setCommits] = useState<GitCommitInfo[]>([]);
  const [stashes, setStashes] = useState<GitStash[]>([]);
  const [openCommit, setOpenCommit] = useState<string | null>(null);
  const [commitFiles, setCommitFiles] = useState<Record<string, GitCommitFile[]>>({});
  const [repoInfo, setRepoInfo] = useState<GithubRepoInfo | null>(null);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isRepo = status.isRepo;
  const hasRemote = status.hasRemote;
  const files: GitFile[] = status.files ?? [];
  const conflicts = files.filter((f) => f.conflict);
  const staged = files.filter((f) => !f.conflict && f.index);
  const unstaged = files.filter((f) => !f.conflict && (f.worktree || f.untracked));
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

  // Dış kaynaklı sonuç (dal seçici vb.) bu panelde de görünür
  useEffect(() => {
    if (notice) setFeedback({ kind: notice.ok ? 'ok' : 'err', text: notice.text });
  }, [notice]);

  // Bir Git işlemini çalıştırır: meşgul göstergesi, hata çevirisi, sonra durumu yeniler.
  const run = async (label: string, fn: () => Promise<GitResult>, okText?: string): Promise<boolean> => {
    if (busy) return false;
    setBusy(label);
    try {
      const res = await fn();
      if (res.success) {
        if (okText) say('ok', okText);
      } else {
        say('err', explainGit(res));
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

  // 4) Geçmiş ve stash listesi, durum her yenilendiğinde tazelenir.
  useEffect(() => {
    if (!currentRepoPath || !isRepo || !api) return;
    let cancelled = false;
    void api.gitLog(currentRepoPath).then((r) => {
      if (!cancelled && r.success) setCommits(r.commits);
    });
    void api.gitStashList(currentRepoPath).then((r) => {
      if (!cancelled && r.success) setStashes(r.stashes);
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
  const sep = repo.includes('\\') ? '\\' : '/';
  const absOf = (rel: string) => `${repo.replace(/[\\/]+$/, '')}${sep}${rel.split('/').join(sep)}`;

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

  // ---- Fark sekmesi ----
  const openFileDiff = async (req: { path: string; orig?: string; staged?: boolean; ref?: string }, title: string) => {
    const res = await api.gitDiffFile(repo, req);
    if (!res.success) {
      say('err', explainGit(res));
      return;
    }
    const name = splitPath(req.path).name;
    const idKey = req.ref ? `commit:${req.ref}` : req.staged ? 'staged' : 'unstaged';
    onOpenDiff({
      id: `diff:${idKey}:${req.path}`,
      name: title,
      type: 'file',
      language: languageFromName(name),
      diff: {
        original: res.original ?? '',
        modified: res.modified ?? '',
        filePath: absOf(req.path),
        note: res.binary ? 'binary' : res.tooLarge ? 'tooLarge' : undefined,
        source: req.ref ? undefined : { repo, path: req.path, orig: req.orig, staged: req.staged }
      }
    });
  };
  const showDiff = (f: GitFile, side: 'staged' | 'unstaged') =>
    openFileDiff({ path: f.path, orig: f.orig, staged: side === 'staged' }, t(side === 'staged' ? 'scmDiffStaged' : 'scmDiffWorking').replace('{n}', splitPath(f.path).name));
  const showCommitDiff = (hash: string, cf: GitCommitFile) =>
    openFileDiff({ path: cf.path, orig: cf.orig, ref: hash }, t('scmDiffCommit').replace('{n}', splitPath(cf.path).name).replace('{h}', hash));

  const toggleCommit = async (hash: string) => {
    if (openCommit === hash) {
      setOpenCommit(null);
      return;
    }
    setOpenCommit(hash);
    if (!commitFiles[hash]) {
      const r = await api.gitCommitFiles(repo, hash);
      if (r.success) setCommitFiles((m) => ({ ...m, [hash]: r.files }));
    }
  };

  // ---- Eylemler ----
  const doCommit = async (e?: React.FormEvent, thenPush = false) => {
    e?.preventDefault();
    if (!message.trim() || staged.length === 0) return;
    const ok = await run('commit', () => api.gitCommit(repo, message), t('gitCommitDone'));
    if (!ok) return;
    setMessage('');
    if (thenPush) await run('push', () => api.gitPush(repo), t('gitDone'));
  };

  const doAmend = async () => {
    if (!window.confirm(t('scmAmendConfirm'))) return;
    if (await run('commit', () => api.gitAmend(repo, message), t('gitCommitDone'))) setMessage('');
  };

  const doUndoCommit = async () => {
    if (!window.confirm(t('scmUndoConfirm'))) return;
    await run('undo', () => api.gitUndoCommit(repo));
  };

  const doDiscard = async (list: GitFile[], all = false) => {
    if (!window.confirm(all ? t('scmDiscardAllConfirm') : t('gitDiscardConfirm'))) return;
    await run('discard', () => api.gitDiscard(repo, list.map((f) => ({ path: f.path, untracked: f.untracked }))));
  };

  const doSubmitAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ask) return;
    if (ask.kind === 'stash') {
      if (await run('stash', () => api.gitStashPush(repo, ask.msg, true), t('scmStashDone'))) setAsk(null);
      return;
    }
    const name = ask.name.trim();
    if (!name) return;
    if (await run('tag', () => api.gitCreateTag(repo, name, ask.msg), t('gitDone'))) {
      setAsk(null);
      if (hasRemote && window.confirm(t('scmTagPushAsk'))) await run('pushtag', () => api.gitPushTag(repo, name), t('gitDone'));
    }
  };

  const doMergeAbort = async () => {
    if (!window.confirm(t('scmMergeAbortConfirm'))) return;
    await run('merge', () => api.gitMergeAbort(repo));
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
  const tog = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const rowProps = {
    busy: isBusy,
    onOpenDiff: (f: GitFile, side: 'staged' | 'unstaged') => void showDiff(f, side),
    onOpenFile: (f: GitFile) => onOpenFile(absOf(f.path)),
    onStage: (x: GitFile) => void run('stage', () => api.gitStage(repo, [x.path])),
    onUnstage: (x: GitFile) => void run('unstage', () => api.gitUnstage(repo, [x.path])),
    onDiscard: (x: GitFile) => void doDiscard([x]),
    onResolve: (x: GitFile, side: 'ours' | 'theirs') => void run('resolve', () => api.gitResolve(repo, x.path, side))
  };
  const sectionBtn = 'p-0.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/70';

  const moreItems: MenuItem[] = [
    { label: t('gitPull'), icon: <DownloadCloud size={14} />, disabled: !hasRemote, onClick: () => void run('pull', () => api.gitPull(repo), t('gitDone')) },
    { label: t('gitPush'), icon: <UploadCloud size={14} />, disabled: !hasRemote, onClick: () => void run('push', () => api.gitPush(repo), t('gitDone')) },
    { label: t('scmFetch'), icon: <RefreshCw size={14} />, disabled: !hasRemote, onClick: () => void run('fetch', () => api.gitFetch(repo), t('gitDone')) },
    { label: t('gitSync'), icon: <RefreshCcw size={14} />, disabled: !hasRemote, onClick: () => void run('sync', () => api.gitSync(repo), t('gitSyncDone')) },
    { separator: true },
    { label: t('gitNewBranch'), icon: <Plus size={14} />, onClick: () => onPicker('checkout') },
    { label: t('bpCreateFrom'), icon: <GitBranch size={14} />, onClick: () => onPicker('from') },
    { label: t('scmMerge'), icon: <GitMerge size={14} />, onClick: () => onPicker('merge') },
    { label: t('scmDeleteBranch'), icon: <X size={14} />, onClick: () => onPicker('delete') },
    { separator: true },
    { label: t('scmNewTag'), icon: <Tag size={14} />, onClick: () => setAsk({ kind: 'tag', name: '', msg: '' }) },
    { label: t('scmDeleteTag'), icon: <Tag size={14} />, onClick: () => onPicker('deleteTag') },
    { separator: true },
    { label: t('scmStash'), icon: <Archive size={14} />, disabled: files.length === 0, onClick: () => setAsk({ kind: 'stash', msg: '' }) },
    { separator: true },
    { label: t('scmUndoCommit'), icon: <Undo2 size={14} />, disabled: commits.length === 0, onClick: () => void doUndoCommit() },
    { label: t('scmDiscardAll'), icon: <Undo2 size={14} />, danger: true, disabled: files.length === 0, onClick: () => void doDiscard(files, true) }
  ];
  const commitItems: MenuItem[] = [
    { label: t('scmCommitPush'), icon: <UploadCloud size={14} />, disabled: !message.trim() || staged.length === 0 || !hasRemote, onClick: () => void doCommit(undefined, true) },
    { label: t('scmAmend'), icon: <GitCommit size={14} />, disabled: commits.length === 0, onClick: () => void doAmend() },
    { label: t('scmUndoCommit'), icon: <Undo2 size={14} />, disabled: commits.length === 0, onClick: () => void doUndoCommit() }
  ];

  return (
    <div className="flex flex-col h-full bg-nv-side text-zinc-300 select-none text-xs overflow-y-auto">
      {/* Başlık: dal düğmesi + eşzamanla */}
      <div className="px-3 py-2.5 border-b border-zinc-800/80 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPicker('checkout')}
            disabled={isBusy}
            title={t('scmBranchTip')}
            aria-label={t('scmBranchTip')}
            className="flex-1 min-w-0 flex items-center gap-1.5 bg-nv-editor border border-zinc-700/80 hover:border-indigo-500 rounded px-2 py-1 text-indigo-300 font-mono text-[11px] text-left"
          >
            <GitBranch size={13} className="shrink-0" />
            <span className="truncate flex-1">{status.branch}</span>
            <ChevronDown size={12} className="shrink-0 text-zinc-500" />
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
            <button className={iconBtn} title={t('scmRefreshTip')} aria-label={t('scmRefreshTip')} onClick={() => void onRefresh()}>
              <RefreshCw size={13} />
            </button>
            <button
              className={iconBtn}
              title={t('scmMore')}
              aria-label={t('scmMore')}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setMenu({ x: r.right - 200, y: r.bottom + 4, kind: 'more' });
              }}
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {hasRemote === false && <p className="text-[11px] text-amber-300/90 leading-relaxed">{t('gitNoRemote')}</p>}

        {/* Birleştirme sürüyor */}
        {status.merging && (
          <div className="rounded border border-amber-700/50 bg-amber-950/25 p-2 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-200 font-medium">
              <GitMerge size={13} />
              <span>{t('scmMerging')}</span>
            </div>
            {conflicts.length > 0 && <p className="text-[11px] text-amber-300/90 leading-relaxed">{t('scmMergeConflictMsg')}</p>}
            <div className="flex gap-1.5">
              <button
                disabled={isBusy || conflicts.length > 0}
                onClick={() => run('merge', () => api.gitMergeContinue(repo), t('scmMergedOk'))}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white"
              >
                <Check size={12} />
                <span>{t('scmMergeContinue')}</span>
              </button>
              <button disabled={isBusy} onClick={() => void doMergeAbort()} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-50">
                {t('scmMergeAbort')}
              </button>
            </div>
          </div>
        )}

        {/* Etiket / stash için satır içi giriş (Electron'da prompt() yok) */}
        {ask && (
          <form onSubmit={doSubmitAsk} className="space-y-1.5">
            {ask.kind === 'tag' && (
              <input value={ask.name} onChange={(e) => setAsk({ ...ask, name: e.target.value })} placeholder={t('scmTagName')} spellCheck={false} autoFocus className={`${field} font-mono`} />
            )}
            <input
              value={ask.msg}
              onChange={(e) => setAsk({ ...ask, msg: e.target.value })}
              placeholder={ask.kind === 'tag' ? t('scmTagMsg') : t('scmStashPrompt')}
              autoFocus={ask.kind === 'stash'}
              className={field}
            />
            <div className="flex gap-1.5">
              <button type="submit" disabled={isBusy || (ask.kind === 'tag' && !ask.name.trim())} className="flex-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white">
                {t('gitCreate')}
              </button>
              <button type="button" onClick={() => setAsk(null)} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300" aria-label="Cancel">
                <X size={13} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Commit */}
      <form onSubmit={(e) => void doCommit(e)} className="p-3 border-b border-zinc-800/80 space-y-2">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('gitCommitPlaceholder')} className={`${field} resize-none h-16 font-sans`} />
        <div className="flex">
          <button type="submit" disabled={!message.trim() || staged.length === 0 || isBusy} className={`${primaryBtn} !rounded-r-none`}>
            {busy === 'commit' ? <Loader2 size={14} className="animate-spin" /> : <GitCommit size={14} />}
            <span>
              {t('gitCommit')} ({staged.length})
            </span>
          </button>
          <button
            type="button"
            disabled={isBusy}
            title={t('scmMore')}
            aria-label={t('scmMore')}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setMenu({ x: r.right - 220, y: r.bottom + 4, kind: 'commit' });
            }}
            className="px-1.5 rounded-r bg-indigo-700 hover:bg-indigo-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white border-l border-indigo-500/40"
          >
            <ChevronDown size={14} />
          </button>
        </div>
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

      {/* Çakışmalar */}
      {conflicts.length > 0 && (
        <Section
          title={t('scmMergeChanges')}
          count={conflicts.length}
          open={!!open.merge}
          onToggle={() => tog('merge')}
          actions={
            <button className={sectionBtn} title={t('gitStageAll')} aria-label={t('gitStageAll')} disabled={isBusy} onClick={() => run('stage', () => api.gitStage(repo, conflicts.map((f) => f.path)))}>
              <Plus size={13} />
            </button>
          }
        >
          {conflicts.map((f) => (
            <FileRow key={`c-${f.path}`} f={f} side="conflict" {...rowProps} />
          ))}
        </Section>
      )}

      {/* Sahnelenenler */}
      {staged.length > 0 && (
        <Section
          title={t('gitStaged')}
          count={staged.length}
          open={!!open.staged}
          onToggle={() => tog('staged')}
          actions={
            <button className={sectionBtn} title={t('gitUnstageAll')} aria-label={t('gitUnstageAll')} disabled={isBusy} onClick={() => run('unstage', () => api.gitUnstage(repo, staged.map((f) => f.path)))}>
              <Minus size={13} />
            </button>
          }
        >
          {staged.map((f) => (
            <FileRow key={`s-${f.path}`} f={f} side="staged" {...rowProps} />
          ))}
        </Section>
      )}

      {/* Değişiklikler */}
      <Section
        title={t('gitChanges')}
        count={unstaged.length}
        open={!!open.changes}
        onToggle={() => tog('changes')}
        actions={
          unstaged.length > 0 ? (
            <>
              <button className={sectionBtn} title={t('scmDiscardAll')} aria-label={t('scmDiscardAll')} disabled={isBusy} onClick={() => void doDiscard(unstaged, true)}>
                <Undo2 size={13} />
              </button>
              <button className={sectionBtn} title={t('gitStageAll')} aria-label={t('gitStageAll')} disabled={isBusy} onClick={() => run('stage', () => api.gitStageAll(repo))}>
                <Plus size={13} />
              </button>
            </>
          ) : null
        }
      >
        {unstaged.length === 0
          ? staged.length === 0 && conflicts.length === 0 && (
              <div className="p-3 text-center text-zinc-500">
                <Check size={20} className="mx-auto mb-1 text-emerald-400 opacity-80" />
                <p>{t('gitClean')}</p>
              </div>
            )
          : unstaged.map((f) => <FileRow key={`u-${f.path}`} f={f} side="unstaged" {...rowProps} />)}
      </Section>

      {/* Stash */}
      {stashes.length > 0 && (
        <Section title={t('scmStashes')} count={stashes.length} open={!!open.stash} onToggle={() => tog('stash')}>
          {stashes.map((s) => (
            <div key={s.index} className="group flex items-center gap-1.5 pl-3 pr-2 h-[22px] rounded hover:bg-zinc-800/50" title={`${s.message} · ${s.when}`}>
              <Archive size={13} className="text-zinc-500 shrink-0" />
              <span className="truncate flex-1 text-zinc-300">{s.message}</span>
              <span className="hidden group-hover:flex items-center">
                <button className={iconBtn} title={t('scmStashApply')} aria-label={t('scmStashApply')} disabled={isBusy} onClick={() => run('stash', () => api.gitStashApply(repo, s.index))}>
                  <Plus size={12} />
                </button>
                <button className={iconBtn} title={t('scmStashPop')} aria-label={t('scmStashPop')} disabled={isBusy} onClick={() => run('stash', () => api.gitStashPop(repo, s.index))}>
                  <DownloadCloud size={12} />
                </button>
                <button
                  className={iconBtn}
                  title={t('scmStashDrop')}
                  aria-label={t('scmStashDrop')}
                  disabled={isBusy}
                  onClick={() => window.confirm(t('scmStashDropConfirm')) && void run('stash', () => api.gitStashDrop(repo, s.index))}
                >
                  <X size={12} />
                </button>
              </span>
              <span className="text-[10px] text-zinc-600 shrink-0">{s.when}</span>
            </div>
          ))}
        </Section>
      )}

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

      {/* Geçmiş: commit'e tıkla → dosyaları listelenir; dosyaya tıkla → fark */}
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
              <div key={c.hash}>
                <div
                  onClick={() => void toggleCommit(c.hash)}
                  className="px-2 py-1 rounded hover:bg-zinc-800/50 cursor-pointer"
                  title={`${c.author} · ${c.when}`}
                  role="button"
                  aria-expanded={openCommit === c.hash}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-zinc-200 flex-1">{c.subject}</span>
                    {c.refs?.slice(0, 3).map((r) => (
                      <span key={r} className="shrink-0 max-w-[90px] truncate px-1.5 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-mono">{r}</span>
                    ))}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {c.hash} · {c.author} · {c.when}
                  </div>
                </div>
                {openCommit === c.hash &&
                  (commitFiles[c.hash] ?? []).map((cf) => (
                    <div
                      key={`${c.hash}-${cf.path}`}
                      onClick={() => void showCommitDiff(c.hash, cf)}
                      title={cf.orig ? `${cf.orig} → ${cf.path}` : cf.path}
                      className="flex items-center gap-1.5 pl-5 pr-2 h-[22px] rounded hover:bg-zinc-800/50 cursor-pointer"
                    >
                      <FileTypeIcon name={splitPath(cf.path).name} size={14} />
                      <span className={`truncate flex-1 ${NAME_COLOR[cf.status] ?? 'text-zinc-200'}`}>
                        {splitPath(cf.path).name}
                        <span className="text-zinc-600 ml-1.5 text-[11px]">{splitPath(cf.path).dir}</span>
                      </span>
                      <span className={`font-mono text-[10px] font-bold w-4 text-center ${STATUS_COLOR[cf.status] ?? 'text-zinc-400'}`}>{cf.status}</span>
                    </div>
                  ))}
              </div>
            ))
          ))}
      </div>

      {menu && <PopupMenu x={menu.x} y={menu.y} items={menu.kind === 'more' ? moreItems : commitItems} onClose={() => setMenu(null)} />}
    </div>
  );
};
