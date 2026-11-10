import React, { useEffect, useRef, useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw, 
  FileDiff, 
  Check, 
  AlertCircle,
  CircleDot,
  GitPullRequest,
  ExternalLink
} from 'lucide-react';
import type { GitStatus, GithubRepoInfo } from '../types';
import { t } from '../i18n/uiText';
import { useGithubAuth } from '../services/useGithubAuth';

interface GitPanelProps {
  status: GitStatus;
  currentRepoPath: string | null;
  onRefresh: () => void;
  onCommit: (message: string) => Promise<boolean>;
  onPush: () => Promise<boolean>;
  onPull: () => Promise<boolean>;
}

export const GitPanel: React.FC<GitPanelProps> = ({
  status,
  currentRepoPath,
  onRefresh,
  onCommit,
  onPush,
  onPull
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [repoInfo, setRepoInfo] = useState<GithubRepoInfo | null>(null);
  const { auth } = useGithubAuth();
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;
  const isRepo = status.isRepo;
  const hasRemote = status.hasRemote;

  // Gerçek zamanlı Git: terminalde veya dışarıda yapılan commit/checkout 8 sn içinde panele yansır.
  useEffect(() => {
    if (!currentRepoPath || !isRepo) return;
    const tick = () => {
      if (!document.hidden) refreshRef.current();
    };
    const id = setInterval(tick, 8000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [currentRepoPath, isRepo]);

  // Uzak depodaki yeni commit'leri (ahead/behind için) dakikada bir sessizce getir.
  useEffect(() => {
    const api = window.electronAPI;
    if (!currentRepoPath || !isRepo || !hasRemote || !api?.gitFetch) return;
    let cancelled = false;
    const run = async () => {
      if (document.hidden) return;
      await api.gitFetch(currentRepoPath);
      if (!cancelled) refreshRef.current();
    };
    void run();
    const id = setInterval(run, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentRepoPath, isRepo, hasRemote, auth.connected]);

  // GitHub'daki canlı durum (açık PR'lar, son Actions koşuları): bağlıysa 30 sn'de bir.
  useEffect(() => {
    const api = window.electronAPI?.github;
    if (!currentRepoPath || !isRepo || !hasRemote || !auth.connected || !api) {
      setRepoInfo(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      if (document.hidden) return;
      const info = await api.repoInfo(currentRepoPath);
      if (!cancelled) setRepoInfo(info);
    };
    void run();
    const id = setInterval(run, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentRepoPath, isRepo, hasRemote, auth.connected]);

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim() || loading) return;
    setLoading(true);
    setFeedback('Commit yapılıyor...');
    const success = await onCommit(commitMessage);
    if (success) {
      setCommitMessage('');
      setFeedback('Commit başarıyla oluşturuldu!');
    } else {
      setFeedback('Commit işlemi başarısız oldu.');
    }
    setLoading(false);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handlePush = async () => {
    setLoading(true);
    setFeedback('Değişiklikler gönderiliyor (Push)...');
    const ok = await onPush();
    setFeedback(ok ? 'Push işlemi başarılı!' : 'Push başarısız oldu.');
    setLoading(false);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handlePull = async () => {
    setLoading(true);
    setFeedback('Güncellemeler alınıyor (Pull)...');
    const ok = await onPull();
    setFeedback(ok ? 'Pull işlemi başarılı!' : 'Pull başarısız oldu.');
    setLoading(false);
    setTimeout(() => setFeedback(null), 3500);
  };

  if (!currentRepoPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-zinc-500 text-xs">
        <GitBranch size={32} className="mb-2 text-zinc-600 opacity-60" />
        <p className="font-medium text-zinc-400">Git Entegrasyonu</p>
        <p className="mt-1">Git kontrollerini görmek için bir yerel proje klasörü açın.</p>
      </div>
    );
  }

  if (!status.isRepo) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-zinc-500 text-xs">
        <AlertCircle size={32} className="mb-2 text-amber-500 opacity-80" />
        <p className="font-semibold text-zinc-300">Git Reposu Bulunamadı</p>
        <p className="mt-1">Açılan klasör bir Git deposu değil veya `.git` dizini eksik.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#131620] text-zinc-300 select-none text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <GitBranch size={14} className="text-indigo-400" />
          <span className="font-semibold text-zinc-200">KAYNAK KONTROLÜ</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-300 font-mono text-[10px]">
            {status.branch || 'main'}
          </span>
          {status.hasUpstream && (status.ahead || status.behind) ? (
            <span
              title={t('gitAheadBehind')}
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]"
            >
              <span className="text-emerald-400">↑{status.ahead ?? 0}</span> <span className="text-amber-300">↓{status.behind ?? 0}</span>
            </span>
          ) : null}
          <span title={t('gitLive')} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onRefresh}
            title="Yenile"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handlePull}
            title="Git Pull (Çek)"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
          >
            <DownloadCloud size={13} />
          </button>
          <button
            onClick={handlePush}
            title="Git Push (Gönder)"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
          >
            <UploadCloud size={13} />
          </button>
        </div>
      </div>

      {/* Commit Input Area */}
      <form onSubmit={handleCommit} className="p-3 border-b border-zinc-800/80 space-y-2">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit mesajı yazın (örn: feat: update editor)..."
          className="w-full bg-[#0d1017] border border-zinc-700/80 rounded p-2 text-xs text-zinc-200 outline-none focus:border-indigo-500 resize-none h-16 font-sans"
        />
        <button
          type="submit"
          disabled={!commitMessage.trim() || loading || status.changes.length === 0}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded font-medium transition-colors cursor-pointer"
        >
          <GitCommit size={14} />
          <span>Commit & Sahnele ({status.changes.length})</span>
        </button>
        {feedback && (
          <div className="text-[11px] text-center text-indigo-300 py-1 bg-indigo-950/40 rounded border border-indigo-800/50">
            {feedback}
          </div>
        )}
      </form>

      {status.hasRemote === false && (
        <div className="px-3 py-2 text-[11px] text-amber-300/90 bg-amber-950/20 border-b border-amber-900/40">{t('gitNoRemote')}</div>
      )}

      {auth.connected && repoInfo?.available && (
        <div className="px-3 py-2 border-b border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{t('ghLive')}</span>
            <button
              onClick={() => repoInfo.url && window.electronAPI?.github.openExternal(repoInfo.url)}
              title={repoInfo.fullName}
              className="flex items-center gap-1 text-zinc-300 hover:text-white truncate max-w-[60%]"
            >
              <span className="truncate">{repoInfo.fullName}</span>
              <ExternalLink size={11} className="shrink-0" />
            </button>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="flex items-center gap-1"><GitPullRequest size={12} /> {t('ghOpenPulls')}: {repoInfo.pulls?.length ?? 0}</span>
            <span className="flex items-center gap-1"><CircleDot size={12} /> {repoInfo.openIssues ?? 0}</span>
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider pt-1">{t('ghActions')}</div>
          {repoInfo.runs && repoInfo.runs.length > 0 ? (
            repoInfo.runs.map((r) => {
              const color =
                r.status !== 'completed' ? 'bg-amber-400 animate-pulse' : r.conclusion === 'success' ? 'bg-emerald-400' : r.conclusion === 'cancelled' || r.conclusion === 'skipped' ? 'bg-zinc-500' : 'bg-rose-400';
              return (
                <button
                  key={r.id}
                  onClick={() => window.electronAPI?.github.openExternal(r.url)}
                  className="w-full flex items-center gap-2 text-left text-zinc-300 hover:text-white"
                >
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

      {/* Changed Files List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-2 py-1 uppercase tracking-wider">
          <span>Değişen Dosyalar</span>
          <span>{status.changes.length}</span>
        </div>

        {status.changes.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-xs">
            <Check size={20} className="mx-auto mb-1 text-emerald-400 opacity-80" />
            <p>Çalışma ağacı temiz. Değişiklik yok.</p>
          </div>
        ) : (
          <div className="space-y-1 mt-1">
            {status.changes.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-zinc-800/50 group"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileDiff size={14} className="text-zinc-400 shrink-0" />
                  <span className="truncate text-zinc-200">{item.file}</span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 rounded bg-zinc-800 text-amber-400">
                  {item.code || 'M'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
