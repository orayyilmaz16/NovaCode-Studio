import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, CalendarDays, Check, ChevronDown, Download, MessageSquare, Pencil, Pin, PinOff, Search, Tag, Trash2, X, Zap } from 'lucide-react';
import { t, getUiLang, type TextKey } from '../i18n/uiText';
import '../i18n/uiTextAi'; // AI metinleri (gecikmeli yüklenen ek sözlük)
import { CATEGORY_IDS, CATEGORY_STYLE, dateGroup, relativeTime, type AiSession, type CategoryId, type DateGroup } from '../services/aiClient';

// Sohbet seçici: başlıkta ad + açılır liste. Arama (başlık + ileti metni), kategori süzgeci, tarih/kategori gruplama,
// sıralama, sabitleme, yeniden adlandırma, kategori atama, Markdown dışa aktarma ve onaylı silme.
// Açılır liste en yakın konumlu üst öğeye (panel başlığı) göre yayılır.
interface Props {
  /** Listelenecek (kaydedilmiş, dolu) sohbetler. */
  sessions: AiSession[];
  /** Başlıkta gösterilen etkin sohbet; henüz boşsa listede yer almaz ama burada görünür. */
  current?: AiSession;
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
  /** null = otomatik (konudan yeniden hesaplanır). */
  onSetCategory: (id: string, cat: CategoryId | null) => void;
  onClearUnpinned: () => void;
}

type GroupBy = 'date' | 'category';
type SortBy = 'recent' | 'name' | 'messages';

const DATE_KEY: Record<DateGroup, TextKey> = { today: 'aiGroupToday', yesterday: 'aiGroupYesterday', week: 'aiGroupWeek', older: 'aiGroupOlder' };
const CAT_KEY: Record<CategoryId, TextKey> = { bug: 'catBug', feature: 'catFeature', explain: 'catExplain', refactor: 'catRefactor', test: 'catTest', docs: 'catDocs', general: 'catGeneral' };
const SORT_KEY: Record<SortBy, TextKey> = { recent: 'aiSortRecent', name: 'aiSortName', messages: 'aiSortMessages' };

const label = (s: AiSession) => s.title || t('aiNewSession');
const catOf = (s: AiSession): CategoryId => s.category ?? 'general';
const msgCount = (s: AiSession) => s.messages.filter((m) => m.text).length;
const act = 'w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent';

const readPref = <T extends string>(key: string, allowed: readonly T[], def: T): T => {
  try { const v = window.localStorage.getItem(key); return (allowed as readonly string[]).includes(v ?? '') ? (v as T) : def; } catch { return def; }
};
const writePref = (key: string, v: string) => { try { window.localStorage.setItem(key, v); } catch { /* depolama kapalı */ } };

const CatChip: React.FC<{ id: CategoryId; active?: boolean; count?: number; onClick?: () => void; small?: boolean }> = ({ id, active, count, onClick, small }) => {
  const st = CATEGORY_STYLE[id];
  const cls = `inline-flex items-center gap-1 rounded-full whitespace-nowrap ${small ? 'px-1.5 h-4 text-[10px]' : 'px-2 h-5 text-[11px]'} ${st.chip} ${active ? 'ring-1 ring-current' : ''}`;
  const body = (<><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{t(CAT_KEY[id])}{count !== undefined && <span className="opacity-70">{count}</span>}</>);
  return onClick ? <button type="button" onClick={onClick} className={`${cls} hover:brightness-125 transition`}>{body}</button> : <span className={cls}>{body}</span>;
};

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

export const ChatSessions: React.FC<Props> = ({ sessions, current, activeId, busy, busyId, renameId, setRenameId, onSelect, onRename, onPin, onDelete, onExport, onSetCategory, onClearUnpinned }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(0);
  const [confirm, setConfirm] = useState<string | null>(null); // satır silme onayı ('*' = sabitlenmemişleri sil)
  const [tagFor, setTagFor] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<CategoryId | null>(null);
  const [groupBy, setGroupByState] = useState<GroupBy>(() => readPref('nova.ai.groupBy', ['date', 'category'] as const, 'date'));
  const [sortBy, setSortByState] = useState<SortBy>(() => readPref('nova.ai.sortBy', ['recent', 'name', 'messages'] as const, 'recent'));
  const setGroupBy = (g: GroupBy) => { setGroupByState(g); writePref('nova.ai.groupBy', g); };
  const setSortBy = (s: SortBy) => { setSortByState(s); writePref('nova.ai.sortBy', s); };
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lang = getUiLang();
  const active = current ?? sessions.find((s) => s.id === activeId) ?? sessions[0];

  const close = () => { setOpen(false); setQ(''); setConfirm(null); setTagFor(null); if (renameId) setRenameId(null); };

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

  // Listede bulunan kategoriler ve sayıları (süzgeç çipleri)
  const catCounts = useMemo(() => {
    const c: Partial<Record<CategoryId, number>> = {};
    for (const s of sessions) c[catOf(s)] = (c[catOf(s)] ?? 0) + 1;
    return c;
  }, [sessions]);
  // Süzgeçteki kategori artık listede yoksa (silindi/değişti) süzgeç kalkar
  useEffect(() => { if (catFilter && !catCounts[catFilter]) setCatFilter(null); }, [catCounts, catFilter]);

  // Arama başlık ve ileti metninde; sabitlenenler üstte, sonra seçili gruplama (tarih veya kategori); grup içi sıralama seçilene göre
  const groups = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    const hit = (s: AiSession) => (!catFilter || catOf(s) === catFilter) && (!needle || s.title.toLocaleLowerCase().includes(needle) || s.messages.some((m) => m.text.toLocaleLowerCase().includes(needle)));
    const cmp = (a: AiSession, b: AiSession) =>
      sortBy === 'name' ? label(a).localeCompare(label(b), lang) || b.updatedAt - a.updatedAt
        : sortBy === 'messages' ? msgCount(b) - msgCount(a) || b.updatedAt - a.updatedAt
          : b.updatedAt - a.updatedAt;
    const sorted = sessions.filter(hit).sort(cmp);
    const out: { key: string; title: string; cat?: CategoryId; items: AiSession[] }[] = [];
    const pinned = sorted.filter((s) => s.pinned);
    if (pinned.length) out.push({ key: 'pinned', title: t('aiGroupPinned'), items: pinned });
    const rest = sorted.filter((s) => !s.pinned);
    if (groupBy === 'category') {
      CATEGORY_IDS.forEach((id) => {
        const items = rest.filter((s) => catOf(s) === id);
        if (items.length) out.push({ key: `cat-${id}`, title: t(CAT_KEY[id]), cat: id, items });
      });
    } else {
      (['today', 'yesterday', 'week', 'older'] as DateGroup[]).forEach((g) => {
        const items = rest.filter((s) => dateGroup(s.updatedAt) === g);
        if (items.length) out.push({ key: g, title: t(DATE_KEY[g]), items });
      });
    }
    return out;
  }, [sessions, q, catFilter, groupBy, sortBy, lang]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => { setHi(0); }, [q, open, catFilter, groupBy, sortBy]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [hi]);

  const pick = (id: string) => { if (busy) return; onSelect(id); close(); };
  const unpinnedCount = sessions.filter((s) => !s.pinned && s.id !== activeId).length;
  const presentCats = CATEGORY_IDS.filter((id) => catCounts[id]);

  const onKey = (e: React.KeyboardEvent) => {
    if (renameId) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setHi((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && flat[hi]) { e.preventDefault(); pick(flat[hi].id); }
    else if (e.key === 'F2' && flat[hi]) { e.preventDefault(); setRenameId(flat[hi].id); }
  };

  const seg = (on: boolean) => `h-6 px-2 rounded-md flex items-center gap-1 text-[11px] transition-colors ${on ? 'bg-nv-active text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'}`;

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
            className={`group w-full flex items-center gap-1.5 h-7 px-1.5 rounded-md text-left transition-colors hover:bg-nv-hover ${open ? 'bg-nv-hover' : ''}`}
          >
            {active?.pinned && <Pin size={11} className="shrink-0 text-amber-300/90 fill-amber-300/30" />}
            {active?.category && <span className={`shrink-0 w-2 h-2 rounded-full ${CATEGORY_STYLE[active.category].dot}`} title={t(CAT_KEY[active.category])} />}
            <span className={`truncate text-[12.5px] font-medium ${active?.title ? 'text-zinc-100' : 'text-zinc-400'}`}>{label(active)}</span>
            <ChevronDown size={12} className={`ml-auto shrink-0 text-zinc-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          onKeyDown={onKey}
          className="animate-menu absolute left-2 right-2 top-[42px] z-30 flex flex-col max-h-[min(72vh,480px)] rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden"
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

          {/* Kategori süzgeci */}
          {presentCats.length > 1 && (
            <div className="no-scrollbar flex items-center gap-1 px-2.5 py-1.5 overflow-x-auto border-b border-zinc-800 shrink-0">
              <button type="button" onClick={() => setCatFilter(null)} className={`inline-flex items-center rounded-full px-2 h-5 text-[11px] whitespace-nowrap transition-colors ${!catFilter ? 'bg-nv-active text-zinc-50' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                {t('aiAllCats')} <span className="ml-1 opacity-70">{sessions.length}</span>
              </button>
              {presentCats.map((id) => <CatChip key={id} id={id} count={catCounts[id]} active={catFilter === id} onClick={() => setCatFilter(catFilter === id ? null : id)} />)}
            </div>
          )}

          {/* Gruplama ve sıralama */}
          <div className="flex items-center justify-between gap-2 px-2.5 h-8 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-nv-input/60" role="group" aria-label={t('aiGroupBy')}>
              <button type="button" className={seg(groupBy === 'date')} onClick={() => setGroupBy('date')} aria-pressed={groupBy === 'date'} title={`${t('aiGroupBy')}: ${t('aiGroupByDate')}`}><CalendarDays size={11} />{t('aiGroupByDate')}</button>
              <button type="button" className={seg(groupBy === 'category')} onClick={() => setGroupBy('category')} aria-pressed={groupBy === 'category'} title={`${t('aiGroupBy')}: ${t('aiGroupByCategory')}`}><Tag size={11} />{t('aiGroupByCategory')}</button>
            </div>
            <label className="flex items-center gap-1 text-[11px] text-zinc-400 min-w-0">
              <ArrowUpDown size={11} className="shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                aria-label={t('aiSortBy')}
                className="min-w-0 bg-transparent outline-none cursor-pointer text-zinc-300 hover:text-zinc-100"
              >
                {(Object.keys(SORT_KEY) as SortBy[]).map((k) => <option key={k} value={k} className="bg-zinc-800">{t(SORT_KEY[k])}</option>)}
              </select>
            </label>
          </div>

          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto py-1">
            {flat.length === 0 && <p className="px-3 py-6 text-center text-[12px] text-zinc-500">{t('aiSessionNone')}</p>}
            {groups.map((g) => (
              <div key={g.key}>
                <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-zinc-500">
                  {g.cat && <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_STYLE[g.cat].dot}`} />}
                  {g.title}
                  <span className="opacity-60">{g.items.length}</span>
                </div>
                {g.items.map((s) => {
                  const i = flat.indexOf(s);
                  const isActive = s.id === active?.id;
                  const running = s.id === busyId;
                  const sure = confirm === s.id;
                  return (
                    <div key={s.id}>
                      <div
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
                              <div className="flex items-center gap-1.5 min-w-0 text-[10.5px] text-zinc-500">
                                {groupBy !== 'category' && <CatChip id={catOf(s)} small />}
                                <span className="truncate">{t('aiMsgCount').replace('{n}', String(msgCount(s)))} · {relativeTime(s.updatedAt, lang)}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {renameId !== s.id && (
                          <div className={`flex items-center shrink-0 ${sure || tagFor === s.id || i === hi ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'} transition-opacity`} onClick={(e) => e.stopPropagation()}>
                            {sure ? (
                              <>
                                <span className="px-1 text-[11px] text-rose-300">{t('aiConfirmDelete')}</span>
                                <button className={`${act} !text-rose-300`} onClick={() => { setConfirm(null); onDelete(s.id); }} aria-label={t('aiDeleteSession')}><Check size={13} /></button>
                                <button className={act} onClick={() => setConfirm(null)} aria-label={t('aiRemove')}><X size={13} /></button>
                              </>
                            ) : (
                              <>
                                <button className={act} onClick={() => onPin(s.id)} title={s.pinned ? t('aiUnpin') : t('aiPin')} aria-label={s.pinned ? t('aiUnpin') : t('aiPin')}>{s.pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
                                <button className={`${act} ${tagFor === s.id ? '!text-indigo-300' : ''}`} onClick={() => setTagFor(tagFor === s.id ? null : s.id)} title={t('aiSetCategory')} aria-label={t('aiSetCategory')} aria-expanded={tagFor === s.id}><Tag size={12} /></button>
                                <button className={act} onClick={() => setRenameId(s.id)} title={`${t('aiRename')} (F2)`} aria-label={t('aiRename')}><Pencil size={12} /></button>
                                <button className={act} onClick={() => onExport(s.id)} disabled={!s.messages.some((m) => m.text)} title={t('aiExport')} aria-label={t('aiExport')}><Download size={12} /></button>
                                <button className={act} onClick={() => setConfirm(s.id)} disabled={running || (busy && isActive)} title={t('aiDeleteSession')} aria-label={t('aiDeleteSession')}><Trash2 size={12} /></button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {tagFor === s.id && (
                        <div className="mx-2 mb-1 mt-0.5 flex flex-wrap items-center gap-1 rounded-lg bg-zinc-800/60 px-2 py-1.5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => { onSetCategory(s.id, null); setTagFor(null); }} className={`inline-flex items-center rounded-full px-2 h-5 text-[11px] transition-colors ${!s.categoryLocked ? 'bg-nv-active text-zinc-50' : 'bg-zinc-700/60 text-zinc-400 hover:text-zinc-200'}`}>{t('optAuto')}</button>
                          {CATEGORY_IDS.map((id) => <CatChip key={id} id={id} active={!!s.categoryLocked && s.category === id} onClick={() => { onSetCategory(s.id, id); setTagFor(null); }} />)}
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
