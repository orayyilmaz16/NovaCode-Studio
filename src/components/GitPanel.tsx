import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw, 
  FileDiff, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import type { GitStatus } from '../types';

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
