import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Palette, ChevronRight, Hash, Search as SearchIcon, Terminal } from 'lucide-react';
import { t } from '../i18n/uiText';
import { baseName } from '../services/lang';
import { FileTypeIcon } from './FileTypeIcon';

export interface PaletteCommand {
  id: string;
  label: string;
  shortcut?: string;
  run: () => void;
}

interface Props {
  /** '' dosya, '>' komut, ':' satır */
  initial: '' | '>' | ':';
  rootPath: string | null;
  commands: PaletteCommand[];
  fallbackFiles: string[];
  onOpenFile: (path: string) => void;
  onGoToLine: (line: number) => void;
  onClose: () => void;
  /** Tema seçici modu: verilirse palet tema listesi gösterir; ok tuşlarıyla gezilirken tema CANLI uygulanır, Esc geri alır. */
  themes?: { id: string; label: string; ext?: string }[];
  currentTheme?: string;
  onThemePreview?: (id: string) => void;
  onThemeRevert?: () => void;
}

// Basit bulanık eşleşme: harfler sırayla geçmeli; ardışık ve kelime başı eşleşmeler daha yüksek puan alır.
function score(text: string, q: string): number {
  if (!q) return 1;
  const a = text.toLowerCase();
  const b = q.toLowerCase();
  let i = 0;
  let s = 0;
  let prev = -2;
  for (const ch of b) {
    const j = a.indexOf(ch, i);
    if (j < 0) return 0;
    s += 1 + (j === prev + 1 ? 2 : 0) + (j === 0 || /[\\/._\- ]/.test(a[j - 1]) ? 2 : 0);
    prev = j;
    i = j + 1;
  }
  return s - a.length * 0.01;
}

type Item = { key: string; icon: React.ReactNode; label: string; detail?: string; right?: string; run: () => void };

export const CommandPalette: React.FC<Props> = ({ initial, rootPath, commands, fallbackFiles, onOpenFile, onGoToLine, onClose, themes, currentTheme, onThemePreview, onThemeRevert }) => {
  const [query, setQuery] = useState<string>(initial);
  const [sel, setSel] = useState(0);
  const [files, setFiles] = useState<string[]>(fallbackFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    let alive = true;
    void window.electronAPI?.search?.files().then((r) => { if (alive && r.files.length) setFiles(r.files); }).catch(() => undefined);
    return () => { alive = false; };
  }, []);

  const themeMode = !!themes;
  const mode: '' | '>' | ':' | 'theme' = themeMode ? 'theme' : query.startsWith('>') ? '>' : query.startsWith(':') ? ':' : '';
  const q = themeMode ? query.trim() : mode ? query.slice(1).trim() : query.trim();
  const committed = useRef(false);
  const touched = useRef(false);

  const items = useMemo<Item[]>(() => {
    const norm = (p: string) => p.split('\\').join('/');
    const rel = (p: string) => {
      const r = rootPath ? norm(rootPath).replace(/\/+$/, '') + '/' : '';
      return r && norm(p).startsWith(r) ? norm(p).slice(r.length) : norm(p);
    };
    if (mode === 'theme') {
      return (themes ?? [])
        .map((th) => ({ th, s: Math.max(score(th.label, q), score(th.ext ?? '', q) * 0.5) }))
        .filter((x) => x.s > 0)
        .map(({ th }) => ({ key: th.id, icon: <Palette size={13} />, label: th.label, detail: th.ext, right: th.id === currentTheme ? '✓' : '', run: () => { committed.current = true; onThemePreview?.(th.id); } }));
    }
    if (mode === '>') {
      return commands
        .map((c) => ({ c, s: score(c.label, q) }))
        .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 50)
        .map(({ c }) => ({ key: c.id, icon: <Terminal size={13} />, label: c.label, right: c.shortcut, run: c.run }));
    }
    if (mode === ':') {
      const n = parseInt(q, 10);
      return [{ key: 'line', icon: <Hash size={13} />, label: Number.isFinite(n) ? t('cpGoLineN').replace('{n}', String(n)) : t('cpGoLineHint'), run: () => { if (Number.isFinite(n)) onGoToLine(n); } }];
    }
    return files
      .map((f) => ({ f, s: score(rel(f), q) + (score(baseName(f), q) > 0 ? 3 : 0) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 50)
      .map(({ f }) => ({ key: f, icon: <FileTypeIcon name={baseName(f)} size={14} />, label: baseName(f), detail: rel(f), run: () => onOpenFile(f) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, q, commands, files, rootPath, themes, currentTheme]);

  useEffect(() => { setSel(0); }, [query]);

  // Tema modu: gezilen satırdaki tema canlı uygulanır; Enter olmadan kapanırsa özgün tema geri yüklenir
  useEffect(() => {
    if (mode === 'theme' && touched.current && items[sel]) onThemePreview?.(items[sel].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, mode]);
  useEffect(() => () => { if (themeMode && !committed.current) onThemeRevert?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { listRef.current?.querySelector('[data-sel="true"]')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const accept = (i: Item | undefined) => {
    if (!i) return;
    onClose();
    i.run();
  };

  return (
    <div className="fixed inset-0 z-[200]" onMouseDown={onClose}>
      <div
        className="absolute left-1/2 -translate-x-1/2 top-10 w-[min(600px,92vw)] rounded-lg border border-zinc-700 bg-nv-side shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t('cpTitle')}
      >
        <div className="flex items-center gap-2 px-3 h-10 border-b border-zinc-700/70">
          {mode === '>' ? <ChevronRight size={14} className="text-zinc-500" /> : <SearchIcon size={14} className="text-zinc-500" />}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); onClose(); }
              else if (e.key === 'ArrowDown') { e.preventDefault(); touched.current = true; setSel((s) => Math.min(items.length - 1, s + 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); touched.current = true; setSel((s) => Math.max(0, s - 1)); }
              else if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); accept(items[sel]); }
            }}
            placeholder={themeMode ? t('cpThemePlaceholder') : t('cpPlaceholder')}
            aria-label={t('cpTitle')}
            className="flex-1 bg-transparent outline-none text-[13px] text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {items.length === 0 && <div className="px-3 py-3 text-[12px] text-zinc-500">{t('cpNoResults')}</div>}
          {items.map((it, i) => (
            <button
              key={it.key}
              data-sel={i === sel}
              onMouseMove={() => { if (sel !== i) { touched.current = true; setSel(i); } }}
              onClick={() => accept(it)}
              className={`w-full flex items-center gap-2 px-3 h-7 text-left text-[13px] ${i === sel ? 'bg-nv-hover text-zinc-100' : 'text-zinc-300'}`}
            >
              <span className="text-zinc-500 shrink-0">{it.icon}</span>
              <span className="truncate">{it.label}</span>
              {it.detail && <span className="truncate text-[11px] text-zinc-500">{it.detail}</span>}
              {it.right && <kbd className="ml-auto shrink-0 px-1.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">{it.right}</kbd>}
            </button>
          ))}
        </div>
        <div className="flex gap-3 px-3 h-6 items-center border-t border-zinc-700/70 text-[10px] text-zinc-500">
          <span>{t('cpHintFiles')}</span>
          <span>{'> '}{t('cpHintCommands')}</span>
          <span>{': '}{t('cpHintLine')}</span>
        </div>
      </div>
    </div>
  );
};
