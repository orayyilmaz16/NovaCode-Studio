import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, CircleX, Copy, Info, ScrollText, Search, TriangleAlert, X } from 'lucide-react';
import type { ConsoleLog } from '../types';
import { t } from '../i18n/uiText';
import '../i18n/uiTextDev';

// Alt panel "Çıktı" sekmesi: uygulama, git ve görev olayları. Düzey süzgeci, arama, kopyalama ve otomatik kaydırma.
type Level = 'all' | 'error' | 'warn' | 'info';

const LEVEL_ICON = {
  error: { Icon: CircleX, tone: 'text-rose-400', bar: 'bg-rose-400' },
  warn: { Icon: TriangleAlert, tone: 'text-amber-300', bar: 'bg-amber-300' },
  info: { Icon: Info, tone: 'text-sky-300', bar: 'bg-sky-300' },
  log: { Icon: ChevronRight, tone: 'text-zinc-500', bar: 'bg-transparent' },
} as const;

export const OutputPanel: React.FC<{ logs: ConsoleLog[]; lineHeight: number }> = ({ logs, lineHeight }) => {
  const [level, setLevel] = useState<Level>('all');
  const [query, setQuery] = useState('');
  const [auto, setAuto] = useState(true);
  const [copied, setCopied] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => ({
    all: logs.length,
    error: logs.filter((l) => l.type === 'error').length,
    warn: logs.filter((l) => l.type === 'warn').length,
    info: logs.filter((l) => l.type === 'info').length,
  }), [logs]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => (level === 'all' || l.type === level) && (!q || l.text.toLowerCase().includes(q)));
  }, [logs, level, query]);

  useEffect(() => {
    if (auto && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [shown, auto]);

  const copyAll = async () => {
    const text = shown.map((l) => `[${l.time}] ${l.type.toUpperCase()} ${l.text}`).join('\n');
    // Ana süreç panosu varsa o (odak/izin sorunu yok), yoksa tarayıcı panosu
    try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1400); } catch { /* pano kapalı */ }
  };

  const chip = (id: Level, label: string, n: number, tone: string) => (
    <button
      key={id}
      onClick={() => setLevel(id)}
      aria-pressed={level === id}
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11.5px] transition-colors duration-(--dur-fast) ${level === id ? 'bg-indigo-500/20 text-indigo-100' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'}`}
    >
      {label}
      {n > 0 && <span className={`px-1.5 rounded-full text-[10px] bg-white/10 ${id === 'all' ? 'text-zinc-300' : tone}`}>{n}</span>}
    </button>
  );

  return (
    <div className="absolute inset-0 flex flex-col font-sans" dir="ltr">
      <div className="flex items-center gap-1 px-2.5 h-10 shrink-0">
        {chip('all', t('pnlFilterAll'), counts.all, '')}
        {chip('error', t('pnlFilterErrors'), counts.error, 'text-rose-300')}
        {chip('warn', t('pnlFilterWarn'), counts.warn, 'text-amber-200')}
        {chip('info', t('pnlFilterInfo'), counts.info, 'text-sky-300')}
        <div className="flex-1" />
        <label className="relative flex items-center">
          <Search size={12} className="absolute start-2.5 text-zinc-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('pnlSearch')}
            aria-label={t('pnlSearch')}
            spellCheck={false}
            className="h-7 w-40 focus:w-56 transition-[width,background-color,box-shadow] duration-(--dur-base) ps-7 pe-6 rounded-md bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] focus:shadow-[inset_0_-2px_0_var(--color-indigo-400)] text-[11.5px] text-zinc-200 placeholder:text-zinc-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="×" className="absolute end-1.5 text-zinc-500 hover:text-zinc-200"><X size={12} /></button>
          )}
        </label>
        <button onClick={() => void copyAll()} title={t('pnlCopyAll')} aria-label={t('pnlCopyAll')} className="icon-btn">
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
        <button onClick={() => setAuto((v) => !v)} aria-pressed={auto} title={t('pnlAutoScroll')} aria-label={t('pnlAutoScroll')} data-active={auto} className="icon-btn">
          <ScrollText size={14} />
        </button>
      </div>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          if (!atEnd && auto) setAuto(false);
        }}
        className="flex-1 min-h-0 overflow-y-auto px-1.5 pb-1.5 font-mono select-text"
        style={{ lineHeight }}
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-500 font-sans text-[12.5px] px-6 text-center">
            <ScrollText size={20} className="opacity-60" />
            {t('pnlOutputEmpty')}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-4 py-3 text-zinc-500 font-sans text-[12.5px]">{t('pnlNoMatch')}</div>
        ) : (
          shown.map((log) => {
            const lv = LEVEL_ICON[log.type] ?? LEVEL_ICON.log;
            return (
              <div key={log.id} className="group relative flex items-start gap-2 ps-3 pe-3 py-px rounded-md hover:bg-white/[0.05] transition-colors duration-(--dur-fast)">
                <span className={`absolute start-0.5 top-1 bottom-1 w-[3px] rounded-full ${lv.bar}`} />
                <span className="text-zinc-500 text-[10.5px] shrink-0 tabular-nums pt-px">{log.time}</span>
                <lv.Icon size={12} className={`shrink-0 mt-[0.28em] ${lv.tone}`} />
                <span className={`break-all whitespace-pre-wrap min-w-0 ${log.type === 'error' ? 'text-rose-300' : log.type === 'warn' ? 'text-amber-200' : log.type === 'info' ? 'text-sky-200' : 'text-zinc-300'}`}>{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
