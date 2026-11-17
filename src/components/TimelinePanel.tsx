import React, { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextDev';
import type { FileItem } from '../types';
import { languageFromName } from '../services/lang';
import { useFocusTrap } from '../services/useFocusTrap';

interface Version { id: string; time: number; size: number }
interface DeletedFile { path: string; versions: number; last: number }

interface Props {
  /** Etkin dosyanın gerçek yolu (yoksa null). */
  filePath: string | null;
  enabled: boolean;
  /** Etkin dosyanın şu anki (düzenleyicideki) içeriği: karşılaştırma için. */
  getCurrent: () => string;
  onOpenDiff: (item: FileItem) => void;
  /** Sürümü diske yazar (mevcut içerik ana süreçte yerel geçmişe alınır) ve sekmeyi yeniler. */
  onRestore: (path: string, content: string) => Promise<boolean>;
  onClose: () => void;
}

const baseName = (p: string) => p.split(/[\\/]/).pop() ?? p;
const fmtTime = (ms: number) => new Date(ms).toLocaleString();
const fmtSize = (n: number) => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`);

/** Zaman çizelgesi (yerel geçmiş): dosya sürümleri, güncelle fark, geri yükleme ve silinen dosyaları kurtarma. */
export const TimelinePanel: React.FC<Props> = ({ filePath, enabled, getCurrent, onOpenDiff, onRestore, onClose }) => {
  const api = window.electronAPI?.history;
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  const [tab, setTab] = useState<'file' | 'deleted'>(filePath ? 'file' : 'deleted');
  const [versions, setVersions] = useState<Version[]>([]);
  const [deleted, setDeleted] = useState<DeletedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [deletedTarget, setDeletedTarget] = useState<string | null>(null); // seçili silinmiş dosya (sürümleri listelenir)
  const target = tab === 'file' ? filePath : deletedTarget;

  const load = useCallback(async () => {
    if (!api) return;
    setDeleted(await api.deleted());
    if (target) setVersions(await api.list(target));
    else setVersions([]);
  }, [api, target]);
  useEffect(() => { void load(); }, [load]);

  const read = async (v: Version): Promise<string | null> => {
    if (!api || !target) return null;
    const r = await api.read(target, v.id);
    return r.success && typeof r.content === 'string' ? r.content : null;
  };

  const compare = async (v: Version) => {
    if (!target) return;
    const old = await read(v);
    if (old === null) return;
    const name = baseName(target);
    onOpenDiff({
      id: `diff:history:${target}:${v.id}`,
      name: t('tlDiffTitle').replace('{n}', name),
      type: 'file',
      language: languageFromName(name),
      diff: { original: old, modified: tab === 'file' ? getCurrent() : '', filePath: target }
    });
    onClose();
  };

  const restore = async (v: Version) => {
    if (!target || busy) return;
    if (!window.confirm(t('tlRestoreConfirm'))) return;
    const content = await read(v);
    if (content === null) return;
    setBusy(true);
    try {
      if (await onRestore(target, content)) onClose();
    } finally {
      setBusy(false);
    }
  };

  const clear = async (scope: 'file' | 'all') => {
    if (!api || !window.confirm(t('tlClearConfirm'))) return;
    await api.clear(scope, scope === 'file' ? target ?? undefined : undefined);
    setDeletedTarget(null);
    await load();
  };

  const tabBtn = (id: 'file' | 'deleted', label: string, disabled = false) => (
    <button
      disabled={disabled}
      onClick={() => setTab(id)}
      className={`motion-fade px-3 h-7 rounded text-[12px] ${tab === id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} disabled:opacity-40`}
    >
      {label}
    </button>
  );

  return (
    <div className="app-no-drag fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 animate-editor-in">
      <div ref={ref} role="dialog" aria-modal="true" aria-label={t('tlTitle')} className="animate-dialog flex max-h-[80vh] w-[min(560px,100%)] flex-col rounded-xl border border-nv-border bg-nv-editor p-5 text-zinc-300">
        <h2 className="mb-1 text-[15px] font-medium text-zinc-100">{t('tlTitle')}{tab === 'file' && filePath ? ` · ${baseName(filePath)}` : ''}</h2>
        <p className="mb-3 text-[12px] text-zinc-500">{t('tlLocalNote')}</p>
        {!enabled || !api ? (
          <p className="mb-4 text-[13px] text-zinc-400">{t('tlOff')}</p>
        ) : (
          <>
            <div className="mb-3 flex gap-1">
              {tabBtn('file', t('tlTabFile'), !filePath)}
              {tabBtn('deleted', t('tlTabDeleted'))}
            </div>
            <div className="min-h-[120px] flex-1 overflow-y-auto">
              {tab === 'file' && !filePath && <p className="text-[13px] text-zinc-400">{t('tlNoFile')}</p>}
              {tab === 'deleted' && !deletedTarget && (
                deleted.length === 0 ? <p className="text-[13px] text-zinc-400">{t('tlDeletedNone')}</p> : (
                  <ul>
                    {deleted.map((d) => (
                      <li key={d.path} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-zinc-800/50">
                        <span className="min-w-0 flex-1 truncate text-[13px]" title={d.path}>{baseName(d.path)}</span>
                        <span className="shrink-0 text-[11px] text-zinc-500">{t('tlVersionsCount').replace('{n}', String(d.versions))} · {fmtTime(d.last)}</span>
                        <button className="btn-ghost" onClick={() => setDeletedTarget(d.path)}>{t('tlRecover')}</button>
                      </li>
                    ))}
                  </ul>
                )
              )}
              {target && (tab === 'file' || deletedTarget) && (
                versions.length === 0 ? <p className="text-[13px] text-zinc-400">{t('tlEmpty')}</p> : (
                  <ul>
                    {versions.map((v) => (
                      <li key={v.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-zinc-800/50">
                        <span className="flex-1 text-[13px]">{fmtTime(v.time)}</span>
                        <span className="shrink-0 text-[11px] text-zinc-500">{fmtSize(v.size)}</span>
                        <button className="btn-ghost" onClick={() => void compare(v)}>{t('tlCompare')}</button>
                        <button className="btn-ghost" disabled={busy} onClick={() => void restore(v)}>{t('tlRestore')}</button>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </>
        )}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {api && target && versions.length > 0 && <button className="btn-ghost" onClick={() => void clear('file')}>{t('tlClearFile')}</button>}
          {api && <button className="btn-ghost" onClick={() => void clear('all')}>{t('tlClearAll')}</button>}
          <button data-autofocus className="btn-primary" onClick={onClose}>{t('snClose')}</button>
        </div>
      </div>
    </div>
  );
};
