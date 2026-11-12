import React from 'react';
import { FilePlus, FileCode2, FolderOpen, Folder, GitBranch, Sparkles, SquareTerminal, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { t } from '../i18n/uiText';

interface LandingPageProps {
  onNewFile: () => void;
  onOpenFiles: () => void;
  onOpenFolder: () => void;
  onOpenGit: () => void;
  onOpenAI: () => void;
  onOpenTerminal: () => void;
  onOpenRecent: (path: string) => void;
  recentFolders: { path: string; name: string }[];
  githubLogin?: string | null;
  showOnStartup: boolean;
  onToggleStartup: (value: boolean) => void;
}

// VS Code "Karşılama" sayfası: solda başlangıç bağlantıları ve son klasörler, sağda keşfet kartları.
const LinkRow: React.FC<{ icon: React.ReactNode; label: string; hint?: string; onClick: () => void }> = ({ icon, label, hint, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-2.5 h-7 px-1.5 -mx-1.5 rounded text-[13px] text-indigo-300 hover:text-indigo-200 hover:bg-nv-hover transition-colors w-full text-left"
  >
    <span className="shrink-0 text-indigo-400">{icon}</span>
    <span className="truncate">{label}</span>
    {hint && <kbd className="ml-auto text-[11px] font-mono text-zinc-500 group-hover:text-zinc-400">{hint}</kbd>}
  </button>
);

const Card: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick: () => void }> = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-start gap-3 p-3 rounded-md text-left border border-transparent hover:border-nv-border hover:bg-nv-side transition-colors w-full"
  >
    <span className="mt-0.5 text-indigo-400 shrink-0">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] text-zinc-100">{title}</span>
      <span className="block text-[12px] text-zinc-500 leading-relaxed mt-0.5">{desc}</span>
    </span>
    <ChevronRight size={14} className="mt-1 text-zinc-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
  </button>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onNewFile,
  onOpenFiles,
  onOpenFolder,
  onOpenGit,
  onOpenAI,
  onOpenTerminal,
  onOpenRecent,
  recentFolders,
  githubLogin,
  showOnStartup,
  onToggleStartup
}) => {
  return (
    <div className="animate-fade-in flex-1 h-full w-full bg-nv-editor overflow-y-auto select-none">
      <div className="min-h-full max-w-[880px] mx-auto px-10 pt-14 pb-8 flex flex-col">
        {/* Başlık */}
        <header className="flex items-center gap-4 mb-12">
          <Logo size={48} animated />
          <div>
            <h1 className="text-[28px] leading-tight font-light tracking-tight text-zinc-100">NovaCode Studio</h1>
            <p className="text-[14px] text-zinc-500 mt-0.5">{t('splashTagline')}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10 flex-1 content-start">
          {/* Sol: başlangıç + son açılanlar */}
          <div className="space-y-9">
            <section aria-labelledby="wel-start">
              <h2 id="wel-start" className="text-[16px] font-normal text-zinc-200 mb-3">
                {t('welStart')}
              </h2>
              <LinkRow icon={<FilePlus size={16} />} label={t('newFile')} hint="Ctrl+N" onClick={onNewFile} />
              <LinkRow icon={<FileCode2 size={16} />} label={t('openFiles')} hint="Ctrl+Shift+O" onClick={onOpenFiles} />
              <LinkRow icon={<FolderOpen size={16} />} label={t('openFolder')} hint="Ctrl+O" onClick={onOpenFolder} />
              <LinkRow
                icon={<GitBranch size={16} />}
                label={githubLogin ? t('welConnected').replace('{login}', githubLogin) : t('ghConnect')}
                onClick={onOpenGit}
              />
            </section>

            <section aria-labelledby="wel-recent">
              <h2 id="wel-recent" className="text-[16px] font-normal text-zinc-200 mb-3">
                {t('welRecent')}
              </h2>
              {recentFolders.length === 0 ? (
                <p className="text-[13px] text-zinc-500">{t('welNoRecent')}</p>
              ) : (
                recentFolders.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => onOpenRecent(f.path)}
                    title={f.path}
                    className="group flex items-baseline gap-3 h-7 px-1.5 -mx-1.5 rounded text-[13px] hover:bg-nv-hover transition-colors w-full text-left"
                  >
                    <Folder size={14} className="self-center shrink-0 text-zinc-500" />
                    <span className="text-indigo-300 group-hover:text-indigo-200 shrink-0">{f.name}</span>
                    <span className="text-zinc-600 text-[12px] truncate">{f.path}</span>
                  </button>
                ))
              )}
            </section>
          </div>

          {/* Sağ: keşfet */}
          <section aria-labelledby="wel-walk">
            <h2 id="wel-walk" className="text-[16px] font-normal text-zinc-200 mb-3">
              {t('welWalkthroughs')}
            </h2>
            <div className="space-y-1.5 -mx-3">
              <Card icon={<GitBranch size={18} />} title={t('welGitTitle')} desc={t('welGitDesc')} onClick={onOpenGit} />
              <Card icon={<Sparkles size={18} />} title={t('welAiTitle')} desc={t('welAiDesc')} onClick={onOpenAI} />
              <Card icon={<SquareTerminal size={18} />} title={t('welTermTitle')} desc={t('welTermDesc')} onClick={onOpenTerminal} />
            </div>
          </section>
        </div>

        {/* Alt: açılışta göster */}
        <footer className="mt-10 pt-4 flex items-center justify-between text-[12px] text-zinc-500">
          <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors">
            <input type="checkbox" checked={showOnStartup} onChange={(e) => onToggleStartup(e.target.checked)} className="accent-indigo-500" />
            {t('welShowOnStartup')}
          </label>
          <span className="font-mono">v{__APP_VERSION__}</span>
        </footer>
      </div>
    </div>
  );
};
