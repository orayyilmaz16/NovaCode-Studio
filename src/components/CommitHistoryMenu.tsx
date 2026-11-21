import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GitBranch, GitCommitHorizontal, ExternalLink, RefreshCcw, ArrowDown, ArrowUp, Tag } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';
import type { GitCommitInfo, GithubRepoInfo } from '../types';

// Durum çubuğundaki commit geçmişi menüsü (VS Code "Source Control Graph" benzeri, sade liste):
// dal + uzak depo bilgisi üstte, son commit'ler altta (kısa karma, mesaj, yazar, zaman, dal/etiket rozetleri).
interface Props {
  anchor: { x: number; y: number };
  repo: string;
  branch?: string;
  hasRemote?: boolean;
  ahead?: number;
  behind?: number;
  onClose: () => void;
  onOpenGit: () => void;
}

const initials = (name: string) => (name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('') || '?').toUpperCase();

export const CommitHistoryMenu: React.FC<Props> = ({ anchor, repo, branch, hasRemote, ahead, behind, onClose, onOpenGit }) => {
  const api = window.electronAPI;
  const ref = useRef<HTMLDivElement>(null);
  const [commits, setCommits] = useState<GitCommitInfo[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [info, setInfo] = useState<GithubRepoInfo | null>(null);
  const [loading, setLoading] = useState(false);

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
          <span className="size-7 rounded-md bg-nv-active flex items-center justify-center shrink-0"><GitCommitHorizontal size={15} className="text-indigo-300" /></span>
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

        <div className="flex-1 min-h-0 overflow-y-auto py-1" role="list">
          {commits === null ? (
            <div className="px-3.5 py-6 text-center text-xs text-zinc-500">{t('histLoading')}</div>
          ) : failed ? (
            <div className="px-3.5 py-6 text-center text-xs text-rose-300">{t('histError')}</div>
          ) : commits.length === 0 ? (
            <div className="px-3.5 py-6 text-center text-xs text-zinc-500">{t('histEmpty')}</div>
          ) : (
            commits.map((c, i) => (
              <button
                key={c.hash}
                role="listitem"
                onClick={openGit}
                title={`${c.hash} — ${c.subject}`}
                style={{ animationDelay: `${Math.min(i, 8) * 20}ms` }}
                className="group w-full text-start flex items-start gap-2.5 px-3.5 py-1.5 hover:bg-nv-hover focus-visible:bg-nv-hover focus-visible:outline-none transition-colors animate-fade-in"
              >
                <span className="flex flex-col items-center self-stretch shrink-0 pt-1.5">
                  <span className={`size-2 rounded-full transition-colors ${i === 0 ? 'bg-indigo-400' : 'bg-zinc-500 group-hover:bg-zinc-300'}`} />
                  {i < commits.length - 1 && <span className="flex-1 w-px bg-nv-border mt-1" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] text-zinc-200 truncate">{c.subject}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 min-w-0">
                    <span className="size-4 rounded-full bg-zinc-700/70 text-[8px] leading-4 text-center text-zinc-300 font-semibold shrink-0">{initials(c.author)}</span>
                    <span className="truncate">{c.author}</span>
                    <span className="shrink-0">· {c.when}</span>
                    <span className="font-mono shrink-0 ms-auto">{c.hash}</span>
                  </span>
                  {c.refs && c.refs.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {c.refs.slice(0, 4).map((r) => {
                        const remote = r.includes('/');
                        return (
                          <span key={r} className={`inline-flex items-center gap-1 h-4 px-1.5 rounded-full text-[10px] max-w-[160px] ${remote ? 'bg-zinc-700/50 text-zinc-400' : 'bg-indigo-500/15 text-indigo-300'}`}>
                            {remote ? null : <GitBranch size={9} className="shrink-0" />}
                            <span className="truncate">{r}</span>
                          </span>
                        );
                      })}
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>

        <button
          onClick={openGit}
          className="shrink-0 flex items-center justify-center gap-1.5 h-9 border-t border-nv-border text-xs text-zinc-200 hover:bg-nv-hover transition-colors focus-visible:outline-none focus-visible:bg-nv-hover"
        >
          <Tag size={13} className="text-zinc-400" />{t('histOpenPanel')}
        </button>
      </div>
    </div>
  );
};
