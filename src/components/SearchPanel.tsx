import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CaseSensitive, ChevronRight, Regex, Replace, Search as SearchIcon, WholeWord } from 'lucide-react';
import { t } from '../i18n/uiText';
import { FileTypeIcon } from './FileTypeIcon';
import type { ReplaceHit, SearchHit } from '../types';
import '../i18n/uiTextAi'; // AI metinleri (gecikmeli yüklenen ek sözlük)
import '../i18n/uiTextTheme'; // taşınan metinler (gecikmeli sözlük)

interface Props {
  hasFolder: boolean;
  onOpenResult: (path: string, line: number) => void;
  /** Kaydedilmemiş değişikliği olan açık dosyaların yolları (değiştirme öncesi uyarı için). */
  dirtyPaths?: string[];
}

const norm = (p: string) => p.replace(/\\/g, '/').toLowerCase();
const hitKey = (h: { path: string; line: number }) => `${h.path}\u0000${h.line}`;
const btnBase = 'px-2 h-5 text-[11px] shrink-0 rounded disabled:opacity-50';

export const SearchPanel: React.FC<Props> = ({ hasFolder, onOpenResult, dirtyPaths = [] }) => {
  const [query, setQuery] = useState('');
  const [caseSensitive, setCase] = useState(false);
  const [regex, setRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [replacement, setReplacement] = useState('');
  // Önizleme: null = normal arama görünümü
  const [preview, setPreview] = useState<{ hits: ReplaceHit[]; truncated: boolean } | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set()); // hariç tutulan "yol\0satır" anahtarları
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [rerun, setRerun] = useState(0);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bad, setBad] = useState(false);
  const seq = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); }, []);

  useEffect(() => {
    const api = window.electronAPI?.search;
    if (!api || !hasFolder || query.trim().length < 2 || preview) {
      setResults([]); setTruncated(false); setBad(false);
      return;
    }
    const my = ++seq.current;
    setLoading(true);
    const reqId = `s${my}`;
    const id = setTimeout(() => {
      void api.text({ query, regex, caseSensitive, wholeWord, id: reqId }).then((r) => {
        if (seq.current !== my || r.cancelled) return;
        setResults(r.results); setTruncated(r.truncated); setBad(r.error === 'regex'); setLoading(false);
      }).catch(() => { if (seq.current === my) setLoading(false); });
    }, 300);
    return () => { clearTimeout(id); void api.cancel?.(reqId); };
  }, [query, regex, caseSensitive, wholeWord, hasFolder, preview, rerun]);

  const groups = useMemo(() => {
    const m = new Map<string, SearchHit[]>();
    for (const r of results) m.set(r.rel, [...(m.get(r.rel) ?? []), r]);
    return [...m.entries()];
  }, [results]);

  const pvGroups = useMemo(() => {
    const m = new Map<string, ReplaceHit[]>();
    for (const r of preview?.hits ?? []) m.set(r.rel, [...(m.get(r.rel) ?? []), r]);
    return [...m.entries()];
  }, [preview]);
  const chosen = useMemo(() => (preview?.hits ?? []).filter((h) => !off.has(hitKey(h))), [preview, off]);

  const startPreview = async () => {
    const api = window.electronAPI?.search;
    if (!api?.replace || busy || query.length < 1) return;
    setBusy(true); setNote(null);
    try {
      const r = await api.replace({ mode: 'preview', query, replacement, regex, caseSensitive, wholeWord, id: 'rp' });
      if (r.cancelled) return;
      if (r.error === 'empty-match') setNote({ ok: false, text: t('srEmptyMatch') });
      else if (r.error === 'regex') setBad(true);
      else if (!r.results?.length) setNote({ ok: false, text: t('srNoChange') });
      else { setBad(false); setOff(new Set()); setPreview({ hits: r.results, truncated: !!r.truncated }); }
    } catch { setNote({ ok: false, text: t('srNoChange') }); } finally { setBusy(false); }
  };

  const applyChosen = async () => {
    const api = window.electronAPI?.search;
    if (!api?.replace || busy || !chosen.length) return;
    const paths = new Set(chosen.map((h) => norm(h.path)));
    const dirty = dirtyPaths.filter((p) => paths.has(norm(p))).length;
    const msg = (dirty ? `${t('srDirtyWarn').replace('{n}', String(dirty))}\n\n` : '') + t('srConfirm').replace('{n}', String(chosen.length));
    if (!window.confirm(msg)) return;
    const byFile = new Map<string, number[]>();
    for (const h of chosen) byFile.set(h.path, [...(byFile.get(h.path) ?? []), h.line]);
    setBusy(true);
    try {
      const r = await api.replace({ mode: 'apply', query, replacement, regex, caseSensitive, wholeWord, selection: [...byFile].map(([path, lines]) => ({ path, lines })) });
      if (!r.success) { setNote({ ok: false, text: t('srFailed').replace('{n}', String(byFile.size)) }); return; }
      const parts = [t('srDone').replace('{n}', String(r.lines ?? 0)).replace('{f}', String(r.files ?? 0))];
      if (r.skipped) parts.push(t('srSkipped').replace('{n}', String(r.skipped)));
      if (r.failed?.length) parts.push(t('srFailed').replace('{n}', String(r.failed.length)));
      setNote({ ok: !r.failed?.length, text: parts.join(' — ') });
      setPreview(null); setRerun((n) => n + 1);
    } catch { setNote({ ok: false, text: t('srFailed').replace('{n}', String(byFile.size)) }); } finally { setBusy(false); }
  };

  const toggleHit = (h: ReplaceHit) => setOff((p) => { const n = new Set(p); const k = hitKey(h); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const toggleFile = (hits: ReplaceHit[]) => setOff((p) => {
    const n = new Set(p);
    const allOn = hits.every((h) => !n.has(hitKey(h)));
    for (const h of hits) { if (allOn) n.add(hitKey(h)); else n.delete(hitKey(h)); }
    return n;
  });

  const tog = (on: boolean) => `icon-btn ${on ? 'text-indigo-300 bg-nv-hover' : ''}`;

  return (
    <div className="flex flex-col h-full text-[12px]">
      <div className="h-9 flex items-center pl-4 text-[11px] uppercase tracking-wide text-zinc-400 shrink-0">{t('actSearch')}</div>
      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center gap-1 bg-nv-input border border-zinc-700 rounded px-2 h-7 focus-within:border-indigo-500">
          <button className="icon-btn shrink-0" onClick={() => { setShowReplace((v) => !v); setPreview(null); setNote(null); }} title={t('srReplaceToggle')} aria-label={t('srReplaceToggle')} aria-expanded={showReplace}>
            <ChevronRight size={12} className={showReplace ? 'rotate-90' : ''} />
          </button>
          <SearchIcon size={12} className="text-zinc-500 shrink-0" />
          <input
            ref={input}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPreview(null); setNote(null); }}
            placeholder={t('searchPlaceholder')}
            aria-label={t('actSearch')}
            className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-zinc-200"
          />
          <button className={tog(caseSensitive)} onClick={() => { setCase((v) => !v); setPreview(null); }} title={t('searchCase')} aria-pressed={caseSensitive}><CaseSensitive size={13} /></button>
          <button className={tog(wholeWord)} onClick={() => { setWholeWord((v) => !v); setPreview(null); }} title={t('srWord')} aria-label={t('srWord')} aria-pressed={wholeWord}><WholeWord size={13} /></button>
          <button className={tog(regex)} onClick={() => { setRegex((v) => !v); setPreview(null); }} title={t('searchRegex')} aria-pressed={regex}><Regex size={13} /></button>
        </div>
        {showReplace && (
          <div className="mt-1 flex items-center gap-1 bg-nv-input border border-zinc-700 rounded px-2 h-7 focus-within:border-indigo-500">
            <Replace size={12} className="text-zinc-500 shrink-0" />
            <input
              value={replacement}
              onChange={(e) => { setReplacement(e.target.value); setPreview(null); }}
              placeholder={t('srReplacePlaceholder')}
              aria-label={t('srReplacePlaceholder')}
              maxLength={2000}
              className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-zinc-200"
            />
            <button className={`${btnBase} bg-nv-hover text-zinc-200 hover:text-white`} disabled={busy || !!preview || query.length < 1} onClick={() => void startPreview()}>{t('srReplaceAll')}</button>
          </div>
        )}
        {bad && <p className="mt-1 text-rose-400">{t('searchBadRegex')}</p>}
        {note && <p className={`mt-1 ${note.ok ? 'text-zinc-400' : 'text-rose-400'}`} role="status">{note.text}</p>}
      </div>
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {preview ? (
          <>
            <div className="px-3 pb-1 flex items-center gap-2 text-zinc-500">
              <span className="flex-1 min-w-0 truncate">
                {t('srPreviewCount').replace('{n}', String(chosen.length)).replace('{f}', String(new Set(chosen.map((h) => h.path)).size))}
                {preview.truncated ? ` — ${t('searchTruncated')}` : ''}
              </span>
              <button className={`${btnBase} bg-nv-hover text-zinc-200`} onClick={() => setPreview(null)}>{t('srBack')}</button>
              <button className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-500`} disabled={busy || !chosen.length} onClick={() => void applyChosen()}>{t('srApply').replace('{n}', String(chosen.length))}</button>
            </div>
            {pvGroups.map(([rel, hits]) => (
              <div key={rel} className="mb-1">
                <label className="px-3 py-0.5 text-zinc-300 flex items-center gap-1.5 cursor-pointer" title={`${rel} — ${t('srExclude')}`}>
                  <input type="checkbox" className="shrink-0" checked={hits.every((h) => !off.has(hitKey(h)))} onChange={() => toggleFile(hits)} aria-label={`${t('srExclude')}: ${rel}`} />
                  <FileTypeIcon name={rel.split('/').pop() ?? rel} size={13} />
                  <span className="truncate">{rel}</span>
                </label>
                {hits.map((h) => (
                  <div key={hitKey(h)} className="pl-6 pr-2 py-0.5 flex gap-2 items-start hover:bg-nv-hover">
                    <input type="checkbox" className="mt-1 shrink-0" checked={!off.has(hitKey(h))} onChange={() => toggleHit(h)} aria-label={`${t('srExclude')}: ${rel}:${h.line}`} />
                    <button className="min-w-0 flex-1 text-left font-mono" onClick={() => onOpenResult(h.path, h.line)} title={`${rel}:${h.line}`}>
                      <span className="block truncate text-rose-300/80 line-through">{h.line}: {h.before}</span>
                      <span className="block truncate text-emerald-300/90">{h.line}: {h.after}</span>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : !hasFolder ? (
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
                <div className="px-3 py-0.5 text-zinc-300 truncate flex items-center gap-1.5" title={rel}><FileTypeIcon name={rel.split('/').pop() ?? rel} size={13} />{rel}</div>
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
