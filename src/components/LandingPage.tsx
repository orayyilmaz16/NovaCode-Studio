import React from 'react';
import { FilePlus, FileCode2, FolderOpen, Folder, GitBranch, Sparkles, SquareTerminal, ChevronRight, Server } from 'lucide-react';
import { Logo } from './Logo';
import { t } from '../i18n/uiText';
import '../i18n/uiTextTheme'; // taşınan metinler (gecikmeli sözlük)
import '../i18n/uiTextRemote'; // uzak sunucu metinleri

interface LandingPageProps {
  onNewFile: () => void;
  onOpenFiles: () => void;
  onOpenFolder: () => void;
  onOpenRemote?: () => void;
  onOpenGit: () => void;
  onOpenAI: () => void;
  onOpenTerminal: () => void;
  onOpenRecent: (path: string) => void;
  recentFolders: { path: string; name: string }[];
  githubLogin?: string | null;
  showOnStartup: boolean;
  onToggleStartup: (value: boolean) => void;
}

// VS Code "Karşılama" sayfası: üstte plakalı logo ve hızlı eylemler, solda başlangıç/son klasörler, sağda keşfet kartları ve ipuçları.
const LinkRow: React.FC<{ icon: React.ReactNode; label: string; hint?: string; onClick: () => void }> = ({ icon, label, hint, onClick }) => (
  <button
    onClick={onClick}
    className="group motion-press flex items-center gap-2.5 h-8 px-2 -mx-2 rounded-md text-[13px] text-indigo-300 hover:text-indigo-200 hover:bg-nv-hover w-full text-start"
  >
    <span className="shrink-0 text-indigo-400">{icon}</span>
    <span className="truncate">{label}</span>
    {hint && <kbd className="ms-auto motion-hint text-[11px] font-mono text-zinc-500">{hint}</kbd>}
  </button>
);

const Card: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick: () => void; index: number }> = ({ icon, title, desc, onClick, index }) => (
  <button
    onClick={onClick}
    style={{ ['--i' as string]: index }}
    className="motion-rise motion-card group flex items-start gap-3 p-3.5 rounded-lg text-start w-full"
  >
    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-nv-active text-indigo-300">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] text-zinc-100">{title}</span>
      <span className="block text-[12px] text-zinc-500 leading-relaxed mt-0.5">{desc}</span>
    </span>
    <ChevronRight size={14} className="motion-arrow mt-2.5 text-zinc-500 shrink-0" />
  </button>
);

const Tip: React.FC<{ label: string; keys: string; index: number }> = ({ label, keys, index }) => (
  <li style={{ ['--i' as string]: index + 3 }} className="motion-rise flex items-center justify-between gap-3 h-7 text-[12px] text-zinc-400">
    <span className="truncate">{label}</span>
    <kbd className="shrink-0 px-1.5 py-px rounded border border-nv-border bg-nv-input text-[11px] font-mono text-zinc-300">{keys}</kbd>
  </li>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onNewFile,
  onOpenFiles,
  onOpenFolder,
  onOpenRemote,
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
    <div className="animate-fade-in bg-nv-editor flex-1 h-full w-full overflow-y-auto select-none">
      <div className="min-h-full max-w-[920px] mx-auto px-10 pt-12 pb-8 flex flex-col">
        {/* Başlık: plakalı logo + hızlı eylemler */}
        <header className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12">
          <Logo size={60} animated shadow />
          <div className="flex-1 min-w-0">
            <h1 className="text-[30px] leading-tight font-light tracking-tight text-zinc-50">NovaCode Studio</h1>
            <p className="text-[14px] text-zinc-500 mt-1">{t('splashTagline')}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={onOpenFolder}
                className="btn-primary"
              >
                <FolderOpen size={15} />
                {t('openFolder')}
              </button>
              <button
                onClick={onNewFile}
                className="btn-ghost"
              >
                <FilePlus size={15} className="text-indigo-400" />
                {t('newFile')}
              </button>
            </div>
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
              {onOpenRemote && <LinkRow icon={<Server size={16} />} label={t('rmConnect')} onClick={onOpenRemote} />}
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
                    className="group motion-press flex items-baseline gap-3 h-8 px-2 -mx-2 rounded-md text-[13px] hover:bg-nv-hover w-full text-start"
                  >
                    <Folder size={14} className="self-center shrink-0 text-zinc-500" />
                    <span className="text-indigo-300 group-hover:text-indigo-200 shrink-0">{f.name}</span>
                    <span className="text-zinc-500 text-[12px] truncate" dir="ltr">{f.path}</span>
                  </button>
                ))
              )}
            </section>
          </div>

          {/* Sağ: keşfet + ipuçları */}
          <div className="space-y-9">
            <section aria-labelledby="wel-walk">
              <h2 id="wel-walk" className="text-[16px] font-normal text-zinc-200 mb-3">
                {t('welWalkthroughs')}
              </h2>
              <div className="space-y-2">
                <Card index={0} icon={<GitBranch size={18} />} title={t('welGitTitle')} desc={t('welGitDesc')} onClick={onOpenGit} />
                <Card index={1} icon={<Sparkles size={18} />} title={t('welAiTitle')} desc={t('welAiDesc')} onClick={onOpenAI} />
                <Card index={2} icon={<SquareTerminal size={18} />} title={t('welTermTitle')} desc={t('welTermDesc')} onClick={onOpenTerminal} />
              </div>
            </section>

            <section aria-labelledby="wel-tips">
              <h2 id="wel-tips" className="text-[16px] font-normal text-zinc-200 mb-2">
                {t('welTips')}
              </h2>
              <ul>
                <Tip label={t('welTipQuickOpen')} keys="Ctrl+P" index={0} />
                <Tip label={t('welTipPalette')} keys="Ctrl+Shift+P" index={1} />
                <Tip label={t('welTipSearch')} keys="Ctrl+Shift+F" index={2} />
                <Tip label={t('welTipAi')} keys="Ctrl+Shift+L" index={3} />
                <Tip label={t('welTipTerminal')} keys="Ctrl+`" index={4} />
                <Tip label={t('welTipSettings')} keys="Ctrl+," index={5} />
              </ul>
            </section>
          </div>
        </div>

        {/* Alt: açılışta göster */}
        <footer className="mt-10 pt-4 flex items-center justify-between text-[12px] text-zinc-500">
          <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 motion-press">
            <input type="checkbox" checked={showOnStartup} onChange={(e) => onToggleStartup(e.target.checked)} className="accent-indigo-500" />
            {t('welShowOnStartup')}
          </label>
          <span className="font-mono">v{__APP_VERSION__}</span>
        </footer>
      </div>
    </div>
  );
};
