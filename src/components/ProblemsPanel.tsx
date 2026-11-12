import React, { useMemo, useState } from 'react';
import { XCircle, AlertTriangle, Info, CheckCircle2, ChevronDown } from 'lucide-react';
import { useProblems, type Problem } from '../services/problems';
import { FileTypeIcon } from './FileTypeIcon';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';

// Sorunlar paneli: açık dosyalardaki hata/uyarı/bilgi işaretçileri dosyaya göre gruplanır; tıklayınca ilgili satıra gider.
const ICON = {
  error: <XCircle size={13} className="text-rose-400 shrink-0" />,
  warning: <AlertTriangle size={13} className="text-amber-300 shrink-0" />,
  info: <Info size={13} className="text-sky-300 shrink-0" />,
  hint: <Info size={13} className="text-zinc-500 shrink-0" />
} as const;

const dirOf = (p: string) => p.slice(0, Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\')));

export const ProblemsPanel: React.FC<{ rootPath?: string }> = ({ rootPath }) => {
  const { items, errors, warnings } = useProblems();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groups = useMemo(() => {
    const m = new Map<string, Problem[]>();
    for (const p of items) (m.get(p.path) ?? m.set(p.path, []).get(p.path)!).push(p);
    return [...m];
  }, [items]);

  const rel = (p: string) => {
    const root = (rootPath ?? '').split('\\').join('/').replace(/\/+$/, '').toLowerCase();
    const n = dirOf(p).split('\\').join('/');
    return root && n.toLowerCase().startsWith(root) ? n.slice(root.length).replace(/^\//, '') : n;
  };

  const open = (p: Problem) => window.dispatchEvent(new CustomEvent('nova:open-file', { detail: { path: p.path, line: p.line } }));

  if (items.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-zinc-500 font-sans text-[12px]">
        <CheckCircle2 size={22} className="text-emerald-400 opacity-80" />
        <span>{t('prbEmpty')}</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto font-sans text-[12px] select-text" role="tree" aria-label={t('prbTab')}>
      <div className="sticky top-0 z-10 flex items-center gap-3 px-3 h-6 bg-nv-side/95 border-b border-nv-border text-zinc-400">
        <span className="flex items-center gap-1"><XCircle size={12} className="text-rose-400" />{errors}</span>
        <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-amber-300" />{warnings}</span>
      </div>
      {groups.map(([path, list]) => {
        const isClosed = collapsed[path];
        const name = path.slice(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1);
        return (
          <div key={path}>
            <button
              onClick={() => setCollapsed((c) => ({ ...c, [path]: !c[path] }))}
              className="w-full flex items-center gap-1.5 px-2 h-6 text-left hover:bg-nv-hover text-zinc-200"
              aria-expanded={!isClosed}
              title={path}
            >
              <ChevronDown size={13} className={`shrink-0 text-zinc-500 transition-transform ${isClosed ? '-rotate-90' : ''}`} />
              <FileTypeIcon name={name} size={14} />
              <span className="truncate">{name}</span>
              <span className="truncate text-zinc-500 text-[11px]">{rel(path)}</span>
              <span className="ml-auto shrink-0 px-1.5 rounded-full bg-zinc-700/70 text-[10px] text-zinc-300">{list.length}</span>
            </button>
            {!isClosed &&
              list.map((p, i) => (
                <button
                  key={`${p.line}:${p.col}:${i}`}
                  onClick={() => open(p)}
                  className="w-full flex items-start gap-2 pl-8 pr-3 py-[3px] text-left hover:bg-nv-hover text-zinc-300"
                >
                  <span className="pt-[2px]">{ICON[p.severity]}</span>
                  <span className="min-w-0 flex-1 break-words">
                    {p.message}
                    {(p.source || p.code) && <span className="ml-1.5 text-zinc-500">{[p.source, p.code].filter(Boolean).join(' ')}</span>}
                  </span>
                  <span className="shrink-0 text-zinc-500 font-mono text-[11px] pt-px">[{p.line}, {p.col}]</span>
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
};
