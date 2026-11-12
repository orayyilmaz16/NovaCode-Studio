import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CaseSensitive, Regex, Search as SearchIcon } from 'lucide-react';
import { t } from '../i18n/uiText';
import type { SearchHit } from '../types';

interface Props {
  hasFolder: boolean;
  onOpenResult: (path: string, line: number) => void;
}

export const SearchPanel: React.FC<Props> = ({ hasFolder, onOpenResult }) => {
  const [query, setQuery] = useState('');
  const [caseSensitive, setCase] = useState(false);
  const [regex, setRegex] = useState(false);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bad, setBad] = useState(false);
  const seq = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); }, []);

  useEffect(() => {
    const api = window.electronAPI?.search;
    if (!api || !hasFolder || query.trim().length < 2) {
      setResults([]); setTruncated(false); setBad(false);
      return;
    }
    const my = ++seq.current;
    setLoading(true);
    const id = setTimeout(() => {
      void api.text({ query, regex, caseSensitive }).then((r) => {
        if (seq.current !== my) return;
        setResults(r.results); setTruncated(r.truncated); setBad(r.error === 'regex'); setLoading(false);
      }).catch(() => { if (seq.current === my) setLoading(false); });
    }, 300);
    return () => clearTimeout(id);
  }, [query, regex, caseSensitive, hasFolder]);

  const groups = useMemo(() => {
    const m = new Map<string, SearchHit[]>();
    for (const r of results) m.set(r.rel, [...(m.get(r.rel) ?? []), r]);
    return [...m.entries()];
  }, [results]);

  const tog = (on: boolean) => `icon-btn ${on ? 'text-indigo-300 bg-nv-hover' : ''}`;

  return (
    <div className="flex flex-col h-full text-[12px]">
      <div className="h-9 flex items-center pl-4 text-[11px] uppercase tracking-wide text-zinc-400 shrink-0">{t('actSearch')}</div>
      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center gap-1 bg-nv-input border border-zinc-700 rounded px-2 h-7 focus-within:border-indigo-500">
          <SearchIcon size={12} className="text-zinc-500 shrink-0" />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('actSearch')}
            className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-zinc-200"
          />
          <button className={tog(caseSensitive)} onClick={() => setCase((v) => !v)} title={t('searchCase')} aria-pressed={caseSensitive}><CaseSensitive size={13} /></button>
          <button className={tog(regex)} onClick={() => setRegex((v) => !v)} title={t('searchRegex')} aria-pressed={regex}><Regex size={13} /></button>
        </div>
        {bad && <p className="mt-1 text-rose-400">{t('searchBadRegex')}</p>}
      </div>
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {!hasFolder ? (
          <p className="px-3 text-zinc-500">{t('searchNoFolder')}</p>
        ) : query.trim().length >= 2 && !loading && results.length === 0 && !bad ? (
          <p className="px-3 text-zinc-500">{t('cpNoResults')}</p>
        ) : (
          <>
            {results.length > 0 && (
              <p className="px-3 pb-1 text-zinc-500">
                {t('searchCount').replace('{n}', String(results.length)).replace('{f}', String(groups.length))}
                {truncated ? ` — ${t('searchTruncated')}` : ''}
              </p>
            )}
            {groups.map(([rel, hits]) => (
              <div key={rel} className="mb-1">
                <div className="px-3 py-0.5 text-zinc-300 truncate" title={rel}>{rel}</div>
                {hits.map((h) => (
                  <button key={`${h.line}-${h.text}`} className="w-full flex gap-2 pl-6 pr-2 h-6 text-left hover:bg-nv-hover" onClick={() => onOpenResult(h.path, h.line)}>
                    <span className="text-zinc-500 shrink-0 w-8 text-right">{h.line}</span>
                    <span className="truncate text-zinc-400 font-mono">{h.text}</span>
                  </button>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
