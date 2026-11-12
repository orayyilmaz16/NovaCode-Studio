import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GitBranch, Cloud, Tag, Plus, Check, Loader2 } from 'lucide-react';
import type { GitRefs, GitResult } from '../types';
import { t } from '../i18n/uiText';
import { explainGit } from '../services/gitExplain';
import '../i18n/uiTextScm';

// VS Code'daki "dal veya etiket seç" hızlı seçici: dal geç, yeni dal, birleştir, dal/etiket sil.
// Durum çubuğundaki dal düğmesi ve Git panelindeki menüler bunu açar.
export type PickerMode = 'checkout' | 'merge' | 'delete' | 'deleteTag' | 'from';

interface Props {
  repo: string;
  mode: PickerMode;
  current?: string;
  onClose: () => void;
  /** İşlem bitince (başarılı/başarısız) bildirim metniyle çağrılır; çağıran durumu yeniler. */
  onResult: (r: { ok: boolean; text: string }) => void;
}

type Row =
  | { kind: 'header'; label: string }
  | { kind: 'action'; id: 'create' | 'createFrom'; label: string }
  | { kind: 'ref'; type: 'local' | 'remote' | 'tag'; name: string; hash: string; subject?: string; current?: boolean };

export const BranchPicker: React.FC<Props> = ({ repo, mode: initialMode, current, onClose, onResult }) => {
  const api = window.electronAPI;
  const [mode, setMode] = useState<PickerMode>(initialMode);
  const [refs, setRefs] = useState<GitRefs | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [busy, setBusy] = useState(false);
  // 'name' adımı: yeni dal adı soruluyor (from: hangi daldan/etiketten)
  const [naming, setNaming] = useState<{ from?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let off = false;
    // Eski ana süreç (uygulama yeniden başlatılmadı) bu kanalı bilmez: istek reddedilir; sonsuz yükleme yerine hata göster
    const call = api?.gitRefs ? api.gitRefs(repo) : Promise.reject(new Error('unavailable'));
    void call.then((r) => { if (off) return; if (r && r.success) setRefs(r); else setLoadError(true); }).catch(() => { if (!off) setLoadError(true); });
    return () => { off = true; };
  }, [api, repo]);
  useEffect(() => { inputRef.current?.focus(); }, [naming, mode]);

  const rows = useMemo<Row[]>(() => {
    if (!refs || naming) return [];
    const f = q.trim().toLowerCase();
    const match = (n: string, s?: string) => !f || n.toLowerCase().includes(f) || (s ?? '').toLowerCase().includes(f);
    const local = refs.local.filter((b) => match(b.name, b.subject) && !((mode === 'merge' || mode === 'delete') && b.current));
    const remote = refs.remote.filter((b) => match(b.name, b.subject));
    const tags = refs.tags.filter((b) => match(b.name, b.subject));
    const out: Row[] = [];
    if (mode === 'checkout' && !f) {
      out.push({ kind: 'action', id: 'create', label: t('bpCreate') }, { kind: 'action', id: 'createFrom', label: t('bpCreateFrom') });
    }
    if (mode !== 'deleteTag' && local.length) {
      out.push({ kind: 'header', label: t('bpLocal') });
      local.forEach((b) => out.push({ kind: 'ref', type: 'local', name: b.name, hash: b.hash, subject: b.subject, current: b.current }));
    }
    if ((mode === 'checkout' || mode === 'merge' || mode === 'from') && remote.length) {
      out.push({ kind: 'header', label: t('bpRemote') });
      remote.forEach((b) => out.push({ kind: 'ref', type: 'remote', name: b.name, hash: b.hash, subject: b.subject }));
    }
    if ((mode === 'checkout' || mode === 'from' || mode === 'deleteTag') && tags.length) {
      out.push({ kind: 'header', label: t('bpTags') });
      tags.forEach((b) => out.push({ kind: 'ref', type: 'tag', name: b.name, hash: b.hash, subject: b.subject }));
    }
    return out;
  }, [refs, q, mode, naming]);

  const selectable = useMemo(() => rows.map((r, i) => (r.kind === 'header' ? -1 : i)).filter((i) => i >= 0), [rows]);
  useEffect(() => { setSel(0); }, [q, mode, naming, refs]);
  useEffect(() => {
    const idx = selectable[sel];
    listRef.current?.querySelector<HTMLElement>(`[data-row="${idx}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [sel, selectable]);

  const finish = async (fn: () => Promise<GitResult>, okText: string) => {
    if (!api || busy) return;
    setBusy(true);
    try {
      const res = await fn();
      onResult(res.success ? { ok: true, text: okText } : { ok: false, text: explainGit(res) });
    } catch (err) {
      onResult({ ok: false, text: String(err) });
    } finally {
      setBusy(false);
      onClose();
    }
  };

  const pick = async (row: Row) => {
    if (!api || row.kind === 'header') return;
    if (row.kind === 'action') {
      if (row.id === 'create') { setNaming({}); setQ(''); }
      else { setMode('from'); setQ(''); }
      return;
    }
    const name = row.name;
    if (mode === 'from') { setNaming({ from: name }); setQ(''); return; }
    if (mode === 'checkout') return finish(() => api.gitCheckoutRef(repo, name), t('scmChecked').replace('{n}', name));
    if (mode === 'merge') return finish(() => api.gitMerge(repo, name), t('scmMergedOk'));
    if (mode === 'deleteTag') return finish(() => api.gitDeleteTag(repo, name), t('scmBranchDeleted'));
    if (mode === 'delete') {
      return finish(async () => {
        const res = await api.gitDeleteBranch(repo, name, false);
        if (!res.success && res.stderr === 'not-merged' && window.confirm(t('scmNotMerged'))) return api.gitDeleteBranch(repo, name, true);
        return res;
      }, t('scmBranchDeleted'));
    }
  };

  const submitName = () => {
    const name = q.trim();
    if (!api || !name) return;
    void finish(() => (naming?.from ? api.gitCreateBranchFrom(repo, name, naming.from) : api.gitCreateBranch(repo, name)), t('scmChecked').replace('{n}', name));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (naming) { if (e.key === 'Enter') { e.preventDefault(); submitName(); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(selectable.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); const r = rows[selectable[sel]]; if (r) void pick(r); }
  };

  const title =
    naming ? t('bpNameTitle')
      : mode === 'merge' ? t('bpMergeTitle')
        : mode === 'delete' ? t('bpDeleteTitle')
          : mode === 'deleteTag' ? t('bpDeleteTagTitle')
            : mode === 'from' ? t('bpFromTitle')
              : t('bpPlaceholder');

  return (
    <div className="fixed inset-0 z-[200]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="absolute left-1/2 -translate-x-1/2 top-10 w-[min(600px,92vw)] rounded-lg border border-zinc-700 bg-nv-side shadow-2xl overflow-hidden animate-fade-in"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-2 px-3 h-10 border-b border-zinc-700/70">
          {busy ? <Loader2 size={14} className="animate-spin text-zinc-500" /> : <GitBranch size={14} className="text-zinc-500" />}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={naming ? t('bpNameHint') : title}
            spellCheck={false}
            aria-label={title}
            className="flex-1 bg-transparent outline-none text-[13px] text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        {naming ? (
          <div className="px-3 py-2 text-[12px] text-zinc-500">
            {naming.from ? <span className="font-mono text-indigo-300">{naming.from}</span> : null}
            {naming.from ? ' → ' : ''}
            {title}
          </div>
        ) : (
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1" role="listbox">
            {!refs && !loadError && <div className="px-3 py-3 text-[12px] text-zinc-500"><Loader2 size={13} className="animate-spin inline" /></div>}
            {!refs && loadError && <div className="px-3 py-3 text-[12px] text-rose-300 leading-relaxed">{t('bpError')}</div>}
            {refs && rows.length === 0 && <div className="px-3 py-3 text-[12px] text-zinc-500">{t('bpNoResults')}</div>}
            {rows.map((r, i) => {
              if (r.kind === 'header') {
                return <div key={`h-${i}`} className="px-3 pt-2 pb-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{r.label}</div>;
              }
              const active = selectable[sel] === i;
              const icon = r.kind === 'action' ? <Plus size={14} /> : r.type === 'tag' ? <Tag size={14} /> : r.type === 'remote' ? <Cloud size={14} /> : <GitBranch size={14} />;
              return (
                <button
                  key={r.kind === 'action' ? r.id : `${r.type}-${r.name}`}
                  data-row={i}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setSel(selectable.indexOf(i))}
                  onClick={() => void pick(r)}
                  className={`w-full flex items-center gap-2 px-3 h-7 text-left text-[13px] ${active ? 'bg-nv-hover text-zinc-100' : 'text-zinc-300'}`}
                >
                  <span className="text-zinc-500 shrink-0">{icon}</span>
                  <span className="truncate">{r.kind === 'action' ? r.label : r.name}</span>
                  {r.kind === 'ref' && (r.current || r.name === current) && r.type === 'local' && <Check size={13} className="text-emerald-400 shrink-0" aria-label={t('bpCurrent')} />}
                  {r.kind === 'ref' && <span className="ml-auto shrink-0 font-mono text-[11px] text-zinc-500">{r.hash}</span>}
                  {r.kind === 'ref' && r.subject && <span className="truncate max-w-[40%] text-[11px] text-zinc-500">{r.subject}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
