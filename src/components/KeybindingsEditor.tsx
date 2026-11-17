import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Pencil, RotateCcw, Search, X } from 'lucide-react';
import { t, type TextKey } from '../i18n/uiText';
import '../i18n/uiTextComp';
import { useFocusTrap } from '../services/useFocusTrap';
import {
  COMMANDS, assign, checkAssignable, comboFromEvent, conflictsFor, findConflicts, formatCombo, getCommand, getOverrides, resolveBindings,
  resetOne, setOverrides, subscribeBindings, type KbCommand
} from '../services/keybindings';

// Klavye kısayolu düzenleyici (F-04). Ayarlar sayfasına gömülebilir (embedded) ya da pencere olarak açılır.
// Sözleşme: <KeybindingsEditor embedded /> (ayarlar sayfası içi) veya <KeybindingsEditor onClose={...} /> (pencere).
// Kayıt: services/keybindings.ts (yalnız bu cihazda localStorage); kişisel veri yok, ağa gitmez.

const labelOf = (c: KbCommand) => t(c.labelKey as TextKey).replace(/\s*\([^)]*\)\s*$/, '');

type Pending = { id: string; combo: string; clash: string[] };

export const KeybindingsEditor: React.FC<{ onClose?: () => void; embedded?: boolean }> = ({ onClose, embedded = false }) => {
  const overrides = useSyncExternalStore(subscribeBindings, getOverrides, getOverrides);
  const bindings = useMemo(() => resolveBindings(overrides), [overrides]);
  const conflicts = useMemo(() => findConflicts(bindings), [bindings]);
  const [query, setQuery] = useState('');
  const [capturing, setCapturing] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [err, setErr] = useState<TextKey | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<string | null>(null);
  capRef.current = capturing;
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  useFocusTrap(rootRef, !embedded, () => { if (!capRef.current) onClose?.(); });

  // Tuş yakalama: uygulama kısayolları ve Monaco çalışmasın diye pencerede yakalama aşamasında yutulur
  useEffect(() => {
    if (!capturing) return;
    document.body.dataset.kbCapture = '1';
    const id = capturing;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) { setCapturing(null); setErr(null); return; }
      const combo = comboFromEvent(e);
      if (!combo) return; // yalnız değiştirici tuş
      const chk = checkAssignable(combo);
      if (!chk.ok) { setErr((chk as { reason: string }).reason === 'reserved' ? 'kbReserved' : 'kbNeedMod'); return; }
      const clash = conflictsFor(combo, id, bindingsRef.current);
      if (clash.length) { setPending({ id, combo, clash }); setCapturing(null); setErr(null); return; }
      setOverrides(assign(getOverrides(), id, combo).overrides);
      setCapturing(null);
      setErr(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => { window.removeEventListener('keydown', onKey, true); delete document.body.dataset.kbCapture; };
  }, [capturing]);

  const q = query.trim().toLowerCase();
  const rows = COMMANDS.filter((c) => !q || labelOf(c).toLowerCase().includes(q) || (bindings[c.id] ?? '').toLowerCase().includes(q));
  const customCount = Object.keys(overrides).length;

  const body = (
    <div ref={rootRef} className={embedded ? 'text-zinc-300' : 'animate-dialog w-[min(720px,100%)] max-h-[min(640px,100%)] flex flex-col rounded-xl border border-nv-border bg-nv-editor text-zinc-300'} role={embedded ? undefined : 'dialog'} aria-modal={embedded ? undefined : true} aria-label={t('kbTitle')}>
      <div className={`flex items-center gap-2 ${embedded ? 'mb-3' : 'px-4 pt-4 pb-3'}`}>
        {!embedded && <h2 className="text-[15px] font-medium text-zinc-100 flex-1">{t('kbTitle')}</h2>}
        <label className="flex items-center gap-2 h-8 px-2 rounded border border-nv-border bg-nv-side text-[13px] flex-1 min-w-0">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input
            data-autofocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('kbSearch')}
            aria-label={t('kbSearch')}
            className="bg-transparent outline-none flex-1 min-w-0 text-zinc-200 placeholder:text-zinc-500"
          />
        </label>
        {customCount > 0 && (
          <button className="btn-ghost shrink-0" onClick={() => { setOverrides({}); setCapturing(null); setPending(null); setErr(null); }}>{t('kbResetAll')}</button>
        )}
        {!embedded && onClose && (
          <button className="icon-btn shrink-0" onClick={onClose} aria-label={t('updClose')} title={t('updClose')}><X size={15} /></button>
        )}
      </div>

      {Object.keys(conflicts).length > 0 && (
        <div role="alert" className={`text-[12px] text-amber-300 ${embedded ? 'mb-2' : 'px-4 pb-2'}`}>{t('kbConflictsBanner')}</div>
      )}
      {(err || pending) && (
        <div role="alert" className={`flex flex-wrap items-center gap-2 text-[12px] text-amber-300 ${embedded ? 'mb-2' : 'px-4 pb-2'}`}>
          {err && <span>{t(err)}</span>}
          {pending && (
            <>
              <span className="min-w-0">{t('kbConflict').replace('{k}', formatCombo(pending.combo)).replace('{c}', pending.clash.map((id) => { const c = getCommand(id); return c ? labelOf(c) : id; }).join(', '))}</span>
              <button className="btn-ghost !h-6" onClick={() => { setOverrides(assign(getOverrides(), pending.id, pending.combo, true).overrides); setPending(null); }}>{t('kbAssignAnyway')}</button>
              <button className="btn-ghost !h-6" onClick={() => setPending(null)}>{t('appCancel')}</button>
            </>
          )}
        </div>
      )}

      <div className={`${embedded ? '' : 'flex-1 min-h-0 overflow-y-auto px-2'}`}>
        <div role="list">
          {rows.map((c) => {
            const combo = bindings[c.id];
            const isCustom = c.id in overrides;
            const isCap = capturing === c.id;
            const clash = !!combo && !!conflicts[combo];
            return (
              <div key={c.id} role="listitem" className="flex items-center gap-2 min-h-9 px-2 rounded hover:bg-nv-hover text-[13px]">
                <span className="flex-1 min-w-0 truncate" title={labelOf(c)}>
                  {labelOf(c)}
                  {c.scope === 'editor' && <span className="ms-2 text-[11px] text-zinc-500">{t('kbEditorTag')}</span>}
                </span>
                {isCustom && <span className="text-[11px] text-indigo-400 shrink-0">{t('kbCustom')}</span>}
                <span className="w-44 shrink-0 flex justify-end">
                  {isCap ? (
                    <span className="text-[12px] text-indigo-300 truncate" aria-live="polite">{t('kbPress')}</span>
                  ) : combo ? (
                    <kbd className={`px-1.5 rounded bg-zinc-800 text-[11px] font-mono ${clash ? 'text-amber-300' : 'text-zinc-300'}`}>{formatCombo(combo)}</kbd>
                  ) : (
                    <span className="text-[11px] text-zinc-500">{t('kbNone')}</span>
                  )}
                </span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <button className="icon-btn" onClick={() => { setPending(null); setErr(null); setCapturing(isCap ? null : c.id); }} aria-label={`${labelOf(c)} — ${t('kbChange')}`} title={t('kbChange')} aria-pressed={isCap}><Pencil size={13} /></button>
                  <button className="icon-btn" disabled={!combo} onClick={() => setOverrides(assign(getOverrides(), c.id, null).overrides)} aria-label={`${labelOf(c)} — ${t('kbRemove')}`} title={t('kbRemove')}><X size={13} /></button>
                  <button className="icon-btn" disabled={!isCustom} onClick={() => setOverrides(resetOne(getOverrides(), c.id))} aria-label={`${labelOf(c)} — ${t('kbReset')}`} title={t('kbReset')}><RotateCcw size={13} /></button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className={`text-[11px] text-zinc-500 ${embedded ? 'mt-3' : 'px-4 py-3 border-t border-nv-border'}`}>{t('kbNote')}</p>
    </div>
  );

  if (embedded) return body;
  return (
    <div className="app-no-drag fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 animate-editor-in" onMouseDown={(e) => { if (e.target === e.currentTarget && !capturing) onClose?.(); }}>
      {body}
    </div>
  );
};

export default KeybindingsEditor;
