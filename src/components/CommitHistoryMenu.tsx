import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GitBranch, GitCommitHorizontal, ExternalLink, RefreshCcw, ArrowDown, ArrowUp, PanelLeftOpen, PanelLeftClose, UserRound, Clock, FilePlus2, FileMinus2, FilePen, FileSymlink, Copy, Check } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';
import { timeAgo } from '../services/timeAgo';
import { GitHistory } from './GitHistory';
import type { GitCommitFile, GitCommitInfo, GithubCommitAuthor, GithubRepoInfo } from '../types';

// Avatar küçük (s=32) indirilir: hızlı yükleme
const avatarSmall = (url: string) => {
  try {
    const u = new URL(url);
    u.searchParams.set('s', '32');
    return u.toString();
  } catch {
    return url;
  }
};

interface Props {
  anchor: { x: number; y: number };
  repo: string;
  branch?: string;
  hasRemote?: boolean;
  ahead?: number;
  behind?: number;
  /** Git yan paneli şu an açık mı (alt düğme aç/kapat arasında geçer) */
  gitPanelOpen?: boolean;
  onClose: () => void;
  onOpenGit: () => void;
}

const STATUS: Record<string, { Icon: React.ElementType; tone: string }> = {
  A: { Icon: FilePlus2, tone: 'text-emerald-400' },
  D: { Icon: FileMinus2, tone: 'text-rose-400' },
  R: { Icon: FileSymlink, tone: 'text-sky-400' },
  C: { Icon: FileSymlink, tone: 'text-sky-400' },
};
const statusOf = (code: string) => STATUS[code] ?? { Icon: FilePen, tone: 'text-amber-300' };

/**
 * Durum çubuğundaki commit geçmişi menüsü. Liste, git panelindeki GitHistory grafıyla aynıdır
 * (dal şeritleri, birleştirme halkaları, açılır ayrıntılar); ayrıca hover kartı bu menüde kapalıdır.
 */
export const CommitHistoryMenu: React.FC<Props> = ({ anchor, repo, branch, hasRemote, ahead, behind, gitPanelOpen, onClose, onOpenGit }) => {
  const api = window.electronAPI;
  const ref = useRef<HTMLDivElement>(null);
  const [commits, setCommits] = useState<GitCommitInfo[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [info, setInfo] = useState<GithubRepoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  // Tek açık commit (git paneliyle aynı davranış); dosyalar açılınca yüklenir ve önbelleğe alınır
  const [openCommit, setOpenCommit] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, GitCommitFile[] | 'error'>>({});
  // GitHub yazar profili: hash başına, satıra gelince istenir; önbellek yalnız bu menünün ömründe
  const [profiles, setProfiles] = useState<Record<string, GithubCommitAuthor | null>>({});
  const [copied, setCopied] = useState<{ hash: string; ok: boolean } | null>(null);
  const requested = useRef(new Set<string>());
  const copyTimer = useRef<number | undefined>(undefined);

  const fetchAuthor = useCallback((hash: string) => {
    if (!api?.github?.commitAuthor || !hasRemote) return Promise.resolve(null);
    return api.github.commitAuthor(repo, hash);
  }, [api, repo, hasRemote]);

  const loadProfile = useCallback((hash: string) => {
    if (!api?.github?.commitAuthor || !hasRemote || requested.current.has(hash)) return;
    requested.current.add(hash);
    void fetchAuthor(hash)
      .then((p) => {
        if (p?.avatarUrl) new Image().src = avatarSmall(p.avatarUrl);
        setProfiles((m) => ({ ...m, [hash]: p }));
      })
      .catch(() => setProfiles((m) => ({ ...m, [hash]: null })));
  }, [api, hasRemote, fetchAuthor]);

  const copyHash = async (hash: string) => {
    // Önce ana süreç (pano izni gerektirmez), olmazsa tarayıcı panosu; sonucu düğmede göster
    let ok = false;
    try {
      ok = !!(await api?.github?.copyHash(hash))?.success;
    } catch (err) {
      console.warn('[git] copyHash başarısız:', err);
    }
    if (!ok) {
      try {
        await navigator.clipboard.writeText(hash);
        ok = true;
      } catch (err) {
        console.warn('[git] pano yazılamadı:', err);
      }
    }
    setCopied({ hash, ok });
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 1500);
  };
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const load = useCallback(async () => {
    if (!api?.gitLog) { setFailed(true); setCommits([]); return; }
    setLoading(true);
    try {
      const r = await api.gitLog(repo);
      setCommits(r.success ? r.commits : []);
      setFailed(!r.success);
    } catch {
      setCommits([]);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [api, repo]);

  useEffect(() => { void load(); }, [load]);

  const toggle = (hash: string) => {
    const next = openCommit === hash ? null : hash;
    setOpenCommit(next);
    if (!next) return;
    loadProfile(hash);
    if (files[hash] || !api?.gitCommitFiles) return;
    api.gitCommitFiles(repo, hash)
      .then((r) => setFiles((m) => ({ ...m, [hash]: r.success ? r.files : 'error' })))
      .catch(() => setFiles((m) => ({ ...m, [hash]: 'error' })));
  };

  useEffect(() => {
    if (!hasRemote || !api?.github?.repoInfo) return;
    let alive = true;
    void api.github.repoInfo(repo).then((i) => { if (alive) setInfo(i); }).catch(() => undefined);
    return () => { alive = false; };
  }, [api, repo, hasRemote]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const W = 380;
  const left = Math.max(8, Math.min(anchor.x - W / 2, window.innerWidth - W - 8));
  const bottom = Math.max(8, window.innerHeight - anchor.y + 6);
  const remoteName = info?.available && info.fullName ? info.fullName : null;
  const openGit = () => { onClose(); onOpenGit(); };

  // Açılan commit'in ayrıntıları ve dosyaları (GitHistory her satırda yalnız açıkken çağırır)
  const renderDetails = (hash: string) => {
    const c = commits?.find((x) => x.hash === hash);
    if (!c) return null;
    const p = profiles[hash];
    const isCopied = copied?.hash === hash;
    return (
      <div className="ms-1 me-2 mb-1.5 pb-1">
        <div className="py-1 flex flex-col gap-1 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-zinc-300 truncate">{c.hash}</span>
            <button
              type="button"
              onClick={() => void copyHash(hash)}
              className={`shrink-0 inline-flex items-center gap-1 h-[18px] px-1.5 rounded hover:bg-white/[0.08] transition-colors ${isCopied ? (copied?.ok ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-400'}`}
            >
              {isCopied && copied?.ok ? <Check size={11} /> : <Copy size={11} />}
              {isCopied ? t(copied?.ok ? 'histCardCopied' : 'histCardCopyFailed') : t('histCardCopy')}
            </button>
          </div>
          <div className="truncate">{c.ts ? new Date(c.ts).toLocaleString() : c.when}</div>
          {p?.login && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate text-zinc-300">@{p.login}</span>
              {p.profileUrl && (
                <button type="button" onClick={() => void api?.github?.openExternal(p.profileUrl!)} className="shrink-0 inline-flex items-center gap-1 h-[18px] px-1.5 rounded hover:bg-white/[0.08] text-zinc-400">
                  <ExternalLink size={11} />{t('histCardOpenProfile')}
                </button>
              )}
            </div>
          )}
          {c.parents && c.parents.length > 1 && (
            <div className="font-mono text-zinc-500">{t('histCardMerge')}: {c.parents.map((x) => x.slice(0, 7)).join(' ')}</div>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto">
          {!files[hash] ? (
            <div className="py-1 text-[11px] text-zinc-500">{t('histLoading')}</div>
          ) : files[hash] === 'error' ? (
            <div className="py-1 text-[11px] text-rose-300">{t('histError')}</div>
          ) : (
            (files[hash] as GitCommitFile[]).map((f) => {
              const { Icon, tone } = statusOf(f.status);
              const cut = Math.max(f.path.lastIndexOf('/'), f.path.lastIndexOf('\\'));
              const name = f.path.slice(cut + 1);
              const dir = cut > 0 ? f.path.slice(0, cut) : '';
              return (
                <div key={f.path} className="flex items-center gap-1.5 h-[22px] text-[11.5px] min-w-0" title={f.orig ? `${f.orig} → ${f.path}` : f.path}>
                  <Icon size={12} className={`shrink-0 ${tone}`} />
                  <span className="text-zinc-300 truncate shrink-0 max-w-[55%]">{name}</span>
                  {dir && <span className="text-zinc-600 truncate min-w-0 flex-1">{dir}</span>}
                  {!dir && <span className="flex-1" />}
                  {f.binary ? (
                    <span className="shrink-0 text-[10px] text-zinc-500">bin</span>
                  ) : (
                    <span className="shrink-0 font-mono tabular-nums flex items-center gap-1.5">
                      {f.added ? <span className="text-emerald-400">+{f.added}</span> : null}
                      {f.deleted ? <span className="text-rose-400">−{f.deleted}</span> : null}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] app-no-drag" onMouseDown={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-label={t('histTitle')}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ left, bottom, width: W, maxHeight: `min(460px, calc(100vh - ${bottom + 16}px))` }}
        className="absolute max-w-[calc(100vw-16px)] flex flex-col overflow-hidden rounded-[var(--frame-r)] border border-nv-border bg-nv-side float-card animate-dialog outline-none text-zinc-300"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-nv-border shrink-0">
          <span className="size-7 flex items-center justify-center shrink-0"><GitCommitHorizontal size={16} className="text-indigo-300" /></span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[13px] font-semibold text-zinc-100 truncate">{t('histTitle')}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 min-w-0">
              <GitBranch size={11} className="shrink-0" />
              <span className="font-mono truncate">{branch}</span>
              {hasRemote && (behind || ahead) ? (
                <span className="inline-flex items-center gap-1 font-mono shrink-0"><ArrowDown size={10} />{behind ?? 0}<ArrowUp size={10} />{ahead ?? 0}</span>
              ) : null}
            </div>
          </div>
          <button onClick={() => void load()} title={t('histRefresh')} aria-label={t('histRefresh')} className="icon-btn shrink-0">
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {commits && commits[0] && (
          <div className="px-3.5 py-1.5 border-b border-nv-border text-[11px] text-zinc-400 flex items-center gap-x-3 gap-y-0.5 flex-wrap shrink-0">
            <span className="text-zinc-500">{t('histLastCommit')}</span>
            <span className="inline-flex items-center gap-1 min-w-0 text-zinc-300"><UserRound size={11} className="shrink-0" /><span className="truncate max-w-[140px]">{commits[0].author}</span></span>
            <span className="inline-flex items-center gap-1" title={commits[0].ts ? new Date(commits[0].ts).toLocaleString() : undefined}><Clock size={11} className="shrink-0" />{commits[0].ts ? timeAgo(commits[0].ts) : commits[0].when}</span>
          </div>
        )}

        <div className="px-3.5 py-1.5 border-b border-nv-border text-[11px] text-zinc-400 flex items-center gap-1.5 min-w-0 shrink-0">
          {hasRemote ? (
            <>
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate flex-1" title={remoteName ?? t('histRemoteSet')}>{remoteName ?? t('histRemoteSet')}</span>
              {info?.url && (
                <button onClick={() => void api?.github?.openExternal(info.url!)} className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-100 shrink-0 transition-colors">
                  <ExternalLink size={11} />{t('histOpenRepo')}
                </button>
              )}
            </>
          ) : (
            <>
              <span className="size-1.5 rounded-full bg-zinc-500 shrink-0" />
              <span className="truncate">{t('histLocalOnly')}</span>
            </>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto py-1">
          {commits === null ? (
            <div className="px-3.5 py-6 text-center text-xs text-zinc-500">{t('histLoading')}</div>
          ) : failed ? (
            <div className="px-3.5 py-6 text-center text-xs text-rose-300">{t('histError')}</div>
          ) : commits.length === 0 ? (
            <div className="px-3.5 py-6 text-center text-xs text-zinc-500">{t('histEmpty')}</div>
          ) : (
            <>
              {commits.every((c) => c.added === undefined) && (
                <div className="mx-3.5 mb-1 px-2 py-1 rounded bg-amber-500/10 text-[11px] text-amber-300">{t('histNeedRestart')}</div>
              )}
              <GitHistory
                commits={commits}
                currentBranch={branch}
                openCommit={openCommit}
                onToggle={toggle}
                fetchAuthor={hasRemote ? fetchAuthor : undefined}
                hoverCards={false}
                renderFiles={renderDetails}
              />
            </>
          )}
        </div>

        <button
          onClick={openGit}
          aria-pressed={!!gitPanelOpen}
          className="group shrink-0 flex items-center justify-center gap-2 h-9 border-t border-nv-border text-xs font-medium text-zinc-200 hover:bg-nv-hover hover:text-zinc-50 transition-colors focus-visible:outline-none focus-visible:bg-nv-hover"
        >
          {gitPanelOpen
            ? <PanelLeftClose size={14} className="text-zinc-400 group-hover:text-indigo-300 transition-colors" />
            : <PanelLeftOpen size={14} className="text-indigo-300 transition-transform duration-(--dur-base) group-hover:translate-x-0.5" />}
          {gitPanelOpen ? t('histClosePanel') : t('histOpenPanel')}
        </button>
      </div>
    </div>
  );
};
