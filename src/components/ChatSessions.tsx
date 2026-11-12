import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Download, MessageSquare, Pencil, Pin, PinOff, Search, Trash2, X, Zap } from 'lucide-react';
import { t, getUiLang } from '../i18n/uiText';
import { dateGroup, relativeTime, type AiSession, type DateGroup } from '../services/aiClient';

// Sohbet seçici: başlıkta ad + açılır liste (arama, tarih grupları, sabitleme, yeniden adlandırma, dışa aktarma, silme).
// Açılır liste en yakın konumlu üst öğeye (panel başlığı) göre yayılır.
interface Props {
  sessions: AiSession[];
  activeId: string;
  busy: boolean;
  /** Yanıt akan sohbet: silinemez. */
  busyId?: string | null;
  renameId: string | null;
  setRenameId: (id: string | null) => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onClearUnpinned: () => void;
}

const GROUP_KEY: Record<DateGroup, 'aiGroupToday' | 'aiGroupYesterday' | 'aiGroupWeek' | 'aiGroupOlder'> = {
  today: 'aiGroupToday', yesterday: 'aiGroupYesterday', week: 'aiGroupWeek', older: 'aiGroupOlder'
};

const label = (s: AiSession) => s.title || t('aiNewSession');
const act = 'w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent';

const RenameInput: React.FC<{ initial: string; onCommit: (v: string) => void; onCancel: () => void; className?: string }> = ({ initial, onCommit, onCancel, className = '' }) => {
  const [v, setV] = useState(initial);
  const done = useRef(false);
  const finish = (save: boolean) => {
    if (done.current) return;
    done.current = true;
    if (save) onCommit(v.trim().slice(0, 80)); else onCancel();
  };
  return (
    <input
      autoFocus
      value={v}
      maxLength={80}
      placeholder={t('aiRenamePlaceholder')}
      aria-label={t('aiRename')}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setV(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={() => finish(true)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) finish(true);
        else if (e.key === 'Escape') finish(false);
      }}
      className={`min-w-0 bg-nv-input border border-indigo-500/70 rounded-md px-1.5 h-6 text-[12.5px] text-zinc-100 outline-none placeholder:text-zinc-500 ${className}`}
    />
  );
};

export const ChatSessions: React.FC<Props> = ({ sessions, activeId, busy, busyId, renameId, setRenameId, onSelect, onRename, onPin, onDelete, onExport, onClearUnpinned }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(0);
  const [confirm, setConfirm] = useState<string | null>(null); // satır silme onayı ('*' = sabitlenmemişleri sil)
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lang = getUiLang();
  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const close = () => { setOpen(false); setQ(''); setConfirm(null); if (renameId) setRenameId(null); };

  // Dışarı tıklayınca kapat
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) close(); };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, renameId]);

  // Başlıktaki kalem düğmesi yeniden adlandırmayı başlatınca liste kapanır
  useEffect(() => { if (renameId && renameId === active?.id && open) setOpen(false); }, [renameId, active?.id, open]);

  // Arama başlık ve ileti metninde; sıralama: sabitlenenler, sonra tarih grupları (yeniden eskiye)
  const groups = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    const hit = (s: AiSession) => !needle || s.title.toLocaleLowerCase().includes(needle) || s.messages.some((m) => m.text.toLocaleLowerCase().includes(needle));
    const sorted = [...sessions].filter(hit).sort((a, b) => b.updatedAt - a.updatedAt);
    const out: { key: string; title: string; items: AiSession[] }[] = [];
    const pinned = sorted.filter((s) => s.pinned);
    if (pinned.length) out.push({ key: 'pinned', title: t('aiGroupPinned'), items: pinned });
    (['today', 'yesterday', 'week', 'older'] as DateGroup[]).forEach((g) => {
      const items = sorted.filter((s) => !s.pinned && dateGroup(s.updatedAt) === g);
      if (items.length) out.push({ key: g, title: t(GROUP_KEY[g]), items });
    });
    return out;
  }, [sessions, q]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => { setHi(0); }, [q, open]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [hi]);

  const pick = (id: string) => { if (busy) return; onSelect(id); close(); };
  const unpinnedCount = sessions.filter((s) => !s.pinned && s.id !== activeId).length;

  const onKey = (e: React.KeyboardEvent) => {
    if (renameId) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setHi((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && flat[hi]) { e.preventDefault(); pick(flat[hi].id); }
    else if (e.key === 'F2' && flat[hi]) { e.preventDefault(); setRenameId(flat[hi].id); }
  };

  return (
    <div ref={boxRef} className="contents">
      {/* Başlıktaki ad: tıkla = liste, çift tıkla = yeniden adlandır */}
      <div className="min-w-0 flex-1">
        {renameId && renameId === active?.id && !open ? (
          <RenameInput initial={active.title} onCommit={(v) => onRename(active.id, v)} onCancel={() => setRenameId(null)} className="w-full" />
        ) : (
          <button
            onClick={() => setOpen((v) => !v)}
            onDoubleClick={() => { setOpen(false); setRenameId(active?.id ?? null); }}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={t('aiSessions')}
            title={label(active)}
            className={`group w-full flex items-center gap-1 h-7 px-1.5 rounded-md text-left transition-colors hover:bg-nv-hover ${open ? 'bg-nv-hover' : ''}`}
          >
            {active?.pinned && <Pin size={11} className="shrink-0 text-amber-300/90 fill-amber-300/30" />}
            <span className={`truncate text-[12.5px] font-medium ${active?.title ? 'text-zinc-100' : 'text-zinc-400'}`}>{label(active)}</span>
            <ChevronDown size={12} className={`ml-auto shrink-0 text-zinc-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          onKeyDown={onKey}
          className="animate-menu absolute left-2 right-2 top-[42px] z-30 flex flex-col max-h-[min(70vh,440px)] rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="flex items-center gap-1.5 px-2.5 h-9 border-b border-zinc-800 shrink-0">
            <Search size={13} className="text-zinc-500 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKey}
              placeholder={t('aiSessionSearch')}
              aria-label={t('aiSessionSearch')}
              className="flex-1 min-w-0 bg-transparent text-[12.5px] text-zinc-100 outline-none placeholder:text-zinc-500"
            />
            {q && <button className={act} onClick={() => setQ('')} aria-label={t('aiRemove')}><X size={12} /></button>}
          </div>

          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto py-1">
            {flat.length === 0 && <p className="px-3 py-6 text-center text-[12px] text-zinc-500">{t('aiSessionNone')}</p>}
            {groups.map((g) => (
              <div key={g.key}>
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-zinc-500">{g.title}</div>
                {g.items.map((s) => {
                  const i = flat.indexOf(s);
                  const isActive = s.id === active?.id;
                  const running = s.id === busyId;
                  const sure = confirm === s.id;
                  return (
                    <div
                      key={s.id}
                      data-i={i}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setHi(i)}
                      onClick={() => renameId !== s.id && pick(s.id)}
                      className={`group relative mx-1 flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg cursor-pointer transition-colors ${i === hi ? 'bg-nv-hover' : ''} ${isActive ? 'text-zinc-50' : 'text-zinc-300'}`}
                    >
                      {isActive && <span className="absolute left-0.5 top-2 bottom-2 w-[3px] rounded-full bg-indigo-500" />}
                      <span className={`shrink-0 ${s.mode === 'agent' ? 'text-purple-300' : 'text-zinc-500'}`} title={s.mode === 'agent' ? t('aiModeAgent') : t('aiModeAsk')}>
                        {s.mode === 'agent' ? <Zap size={13} /> : <MessageSquare size={13} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        {renameId === s.id ? (
                          <RenameInput initial={s.title} onCommit={(v) => onRename(s.id, v)} onCancel={() => setRenameId(null)} className="w-full" />
                        ) : (
                          <>
                            <div className="flex items-center gap-1 min-w-0">
                              {s.pinned && <Pin size={10} className="shrink-0 text-amber-300/90 fill-amber-300/30" />}
                              <span className={`truncate text-[12.5px] ${s.title ? '' : 'text-zinc-400'}`}>{label(s)}</span>
                              {running && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            </div>
                            <div className="truncate text-[10.5px] text-zinc-500">
                              {t('aiMsgCount').replace('{n}', String(s.messages.filter((m) => m.text).length))} · {relativeTime(s.updatedAt, lang)}
                            </div>
                          </>
                        )}
                      </div>
                      {renameId !== s.id && (
                        <div className={`flex items-center shrink-0 ${sure || i === hi ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'} transition-opacity`} onClick={(e) => e.stopPropagation()}>
                          {sure ? (
                            <>
                              <span className="px-1 text-[11px] text-rose-300">{t('aiConfirmDelete')}</span>
                              <button className={`${act} !text-rose-300`} onClick={() => { setConfirm(null); onDelete(s.id); }} aria-label={t('aiDeleteSession')}><Check size={13} /></button>
                              <button className={act} onClick={() => setConfirm(null)} aria-label={t('aiRemove')}><X size={13} /></button>
                            </>
                          ) : (
                            <>
                              <button className={act} onClick={() => onPin(s.id)} title={s.pinned ? t('aiUnpin') : t('aiPin')} aria-label={s.pinned ? t('aiUnpin') : t('aiPin')}>{s.pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
                              <button className={act} onClick={() => setRenameId(s.id)} title={`${t('aiRename')} (F2)`} aria-label={t('aiRename')}><Pencil size={12} /></button>
                              <button className={act} onClick={() => onExport(s.id)} disabled={!s.messages.some((m) => m.text)} title={t('aiExport')} aria-label={t('aiExport')}><Download size={12} /></button>
                              <button className={act} onClick={() => setConfirm(s.id)} disabled={running || (busy && isActive)} title={t('aiDeleteSession')} aria-label={t('aiDeleteSession')}><Trash2 size={12} /></button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 px-3 h-8 border-t border-zinc-800 text-[10.5px] text-zinc-500 shrink-0">
            <span>{t('aiSessionCount').replace('{n}', String(sessions.length))}</span>
            {unpinnedCount > 0 && (
              confirm === '*' ? (
                <span className="flex items-center gap-1">
                  <span className="text-rose-300">{t('aiConfirmDelete')}</span>
                  <button className={`${act} !w-5 !h-5 !text-rose-300`} disabled={busy} onClick={() => { setConfirm(null); onClearUnpinned(); }} aria-label={t('aiClearUnpinned')}><Check size={12} /></button>
                  <button className={`${act} !w-5 !h-5`} onClick={() => setConfirm(null)} aria-label={t('aiRemove')}><X size={12} /></button>
                </span>
              ) : (
                <button className="hover:text-rose-300 transition-colors disabled:opacity-40" disabled={busy} onClick={() => setConfirm('*')}>{t('aiClearUnpinned')}</button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
