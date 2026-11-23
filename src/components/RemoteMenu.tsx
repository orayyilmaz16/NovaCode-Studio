import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronsLeftRight, Cloud, Container, ExternalLink, GitFork, Globe, Network, Terminal, Waypoints } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextDev';
import type { GithubRepoInfo } from '../types';

// "Uzak pencere aç" seçicisi (VS Code'daki uzak pencere menüsü gibi). Yalnız gerçekten çalışan eylemler etkindir:
// SSH satırı mevcut Uzak Sunucu penceresini (RemoteDialog, bkz. docs/brain/actions/remote-ssh.md) açar;
// github.dev / GitHub / Codespaces tarayıcıda açılır; WSL entegre terminalde çalışır. Tünel ve Dev Container henüz yok ("Yakında").
interface Props {
  repo: string | null;
  branch?: string;
  hasRemote?: boolean;
  onRunInTerminal: (command: string) => void;
  onOpenSsh: () => void;
  onClose: () => void;
}

interface Item {
  id: string;
  icon: React.ReactNode;
  label: string;
  right?: string;
  disabled?: string; // doluysa: pasif ve ipucu metni
  external?: boolean;
  run: () => void;
}

export const RemoteMenu: React.FC<Props> = ({ repo, branch, hasRemote, onRunInTerminal, onOpenSsh, onClose }) => {
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const [sel, setSel] = useState(0);
  const [info, setInfo] = useState<GithubRepoInfo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isWin = api?.platform === 'win32';

  useEffect(() => {
    if (!repo || !hasRemote || !api?.github?.repoInfo) return;
    let alive = true;
    void api.github.repoInfo(repo).then((i) => { if (alive) setInfo(i); }).catch(() => undefined);
    return () => { alive = false; };
  }, [api, repo, hasRemote]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const open = (url: string) => { void api?.github?.openExternal(url); };
  const fullName = info?.available ? info.fullName : undefined;

  const items: Item[] = useMemo(() => {
    const soon = t('rwSoon');
    const noRepo = t('rwNeedRepo');
    const noFolder = t('rwNeedFolder');
    const list: Item[] = [
      {
        id: 'githubdev', icon: <Globe size={14} />, label: t('rwGithubDev'), right: 'GitHub', external: true,
        disabled: fullName ? undefined : noRepo,
        run: () => open(`https://github.dev/${fullName}${branch && /^[\w./-]+$/.test(branch) ? `/tree/${branch}` : ''}`),
      },
      { id: 'tunnel', icon: <Waypoints size={14} />, label: t('rwTunnel'), right: soon, disabled: soon, run: () => undefined },
      { id: 'ssh', icon: <Network size={14} />, label: 'SSH', right: 'SFTP', run: () => onOpenSsh() },
      { id: 'devcontainer', icon: <Container size={14} />, label: t('rwDevContainer'), right: soon, disabled: soon, run: () => undefined },
    ];
    if (isWin) {
      list.push({
        id: 'wsl', icon: <Terminal size={14} />, label: 'WSL', right: t('rwTerminalBadge'),
        disabled: api ? (repo ? undefined : noFolder) : t('rwDesktopOnly'),
        run: () => onRunInTerminal('wsl'),
      });
    }
    list.push(
      { id: 'codespace', icon: <Cloud size={14} />, label: t('rwCodespace'), right: 'GitHub', external: true, run: () => open('https://github.com/codespaces') },
      {
        id: 'remoterepo', icon: <GitFork size={14} />, label: t('rwRemoteRepo'), right: 'GitHub', external: true,
        disabled: info?.url ? undefined : noRepo,
        run: () => { if (info?.url) open(info.url); },
      },
    );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, branch, info?.url, repo, isWin, api]);

  // İlk açılışta (ve liste değişince) seçili satır etkin değilse ilk etkin satıra geçer
  useEffect(() => {
    setSel((s) => (items[s] && !items[s].disabled ? s : Math.max(0, items.findIndex((i) => !i.disabled))));
  }, [items]);
  useEffect(() => { listRef.current?.querySelector('[data-sel="true"]')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const accept = (it: Item | undefined) => {
    if (!it || it.disabled) return;
    onClose();
    it.run();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
    const step = (dir: 1 | -1) => {
      if (enabled.length === 0) return;
      const at = enabled.indexOf(sel);
      setSel(enabled[(at + dir + enabled.length) % enabled.length] ?? enabled[0]);
    };
    if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); accept(items[sel]); }
  };

  return (
    <div className="fixed inset-0 z-[200]" onMouseDown={onClose}>
      <div
        className="animate-dialog absolute left-1/2 -translate-x-1/2 top-10 w-[min(520px,92vw)] rounded-[var(--r-lg)] border border-nv-border bg-nv-side float-card overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t('rwTitle')}
      >
        <div className="p-2">
          <div className="flex items-center gap-2 px-2.5 h-8 rounded-md bg-white/[0.05] focus-within:bg-white/[0.08] focus-within:shadow-[inset_0_-2px_0_var(--color-indigo-400)] transition-[background-color,box-shadow] duration-(--dur-base)">
            <ChevronsLeftRight size={14} className="text-indigo-300 shrink-0" />
            <input
              ref={inputRef}
              value=""
              readOnly
              onKeyDown={onKey}
              placeholder={t('rwPlaceholder')}
              aria-label={t('rwTitle')}
              spellCheck={false}
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-zinc-100 placeholder:text-zinc-500 cursor-default"
            />
          </div>
        </div>

        <div ref={listRef} className="pb-1.5 px-1.5 max-h-[50vh] overflow-y-auto" role="listbox">
          {items.map((it, i) => (
            <button
              key={it.id}
              role="option"
              aria-selected={i === sel}
              aria-disabled={!!it.disabled}
              data-sel={i === sel}
              title={it.disabled}
              onMouseMove={() => { if (!it.disabled && sel !== i) setSel(i); }}
              onClick={() => accept(it)}
              className={`w-full flex items-center gap-2.5 px-2.5 h-8 rounded-md text-start text-[13px] transition-colors duration-(--dur-fast) ${it.disabled ? 'text-zinc-600 cursor-default' : i === sel ? 'bg-indigo-500/20 text-zinc-50' : 'text-zinc-300 hover:bg-white/[0.05]'}`}
            >
              <span className={`shrink-0 ${it.disabled ? '' : i === sel ? 'text-indigo-300' : 'text-zinc-500'}`}>{it.icon}</span>
              <span className="truncate">{it.label}</span>
              {it.right && (
                <span className={`ms-auto shrink-0 inline-flex items-center gap-1 text-[11px] ${it.disabled ? 'text-zinc-600' : i === sel ? 'text-indigo-200' : 'text-zinc-500'}`}>
                  {it.right}
                  {!it.disabled && it.external && <ExternalLink size={10} />}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
