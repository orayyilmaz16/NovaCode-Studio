import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight } from 'lucide-react';
import type { MenuItem } from './Menu';

export interface AccordionGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

interface Props {
  x: number;
  y: number;
  groups: AccordionGroup[];
  onClose: () => void;
}

// Kompakt "Menü" açılırı: gruplar (Dosya, Düzen…) satır içi açılıp kapanır; aynı anda tek grup açık kalır.
// Klavye: ↑ ↓ gezinir, Enter/Boşluk açar-kapatır ya da çalıştırır, → açar, ← kapatır, Esc kapatır.
type Row = { kind: 'group'; gid: string } | { kind: 'item'; gid: string; idx: number };

export const AccordionMenu: React.FC<Props> = ({ x, y, groups, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });
  const [active, setActive] = useState(0);

  const allOff = (g: AccordionGroup) => {
    const real = g.items.filter((i) => !i.separator);
    return real.length > 0 && real.every((i) => i.disabled);
  };
  const rows: Row[] = [];
  for (const g of groups) {
    if (allOff(g)) continue; // tamamı kapalı kategori: gezilmez, açılmaz
    rows.push({ kind: 'group', gid: g.id });
    if (g.id === openId) g.items.forEach((it, idx) => { if (!it.separator && !it.disabled) rows.push({ kind: 'item', gid: g.id, idx }); });
  }
  const isActive = (r: Row) => {
    const a = rows[active];
    return !!a && a.kind === r.kind && a.gid === r.gid && (a.kind === 'group' || (r.kind === 'item' && a.idx === r.idx));
  };

  // Konum: açılıp kapanınca yükseklik değişir; ekrandan taşmasın
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      left: Math.max(4, Math.min(x, window.innerWidth - r.width - 4)),
      top: Math.max(4, Math.min(y, window.innerHeight - r.height - 4))
    });
  }, [x, y, openId]);

  const toggle = (gid: string) => {
    if (allOff(groups.find((g) => g.id === gid) ?? { id: '', label: '', items: [] })) return;
    const next = openId === gid ? null : gid;
    setOpenId(next);
    // Etkin satır, açılan/kapanan grubun başlığında kalsın
    setActive(indexOfGroup(gid, next));
  };
  // Başlığın düz satır sırası: önceki açık grubun öğeleri sayılır
  const indexOfGroup = (gid: string, nextOpen: string | null) => {
    let n = 0;
    for (const g of groups) {
      if (allOff(g)) continue;
      if (g.id === gid) return n;
      n++;
      if (g.id === nextOpen) n += g.items.filter((it) => !it.separator && !it.disabled).length;
    }
    return 0;
  };

  const run = (it: MenuItem) => {
    if (it.disabled) return;
    it.onClick?.();
    onClose();
  };

  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      const cur = rows[active];
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length);
      } else if (e.key === 'ArrowRight' && cur?.kind === 'group' && openId !== cur.gid) {
        e.preventDefault();
        toggle(cur.gid);
      } else if (e.key === 'ArrowLeft' && cur) {
        e.preventDefault();
        if (openId === cur.gid) toggle(cur.gid);
      } else if ((e.ctrlKey || e.metaKey) && e.key.length === 1) {
        onClose();
      } else if ((e.key === 'Enter' || e.key === ' ') && cur) {
        e.preventDefault();
        if (cur.kind === 'group') toggle(cur.gid);
        else {
          const it = groups.find((g) => g.id === cur.gid)?.items[cur.idx];
          if (it) run(it);
        }
      }
    };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('keydown', key, true);
    window.addEventListener('blur', onClose);
    return () => {
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('keydown', key, true);
      window.removeEventListener('blur', onClose);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, openId, groups, onClose]);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={{ left: pos.left, top: pos.top }}
      className="animate-menu fixed z-[70] w-[270px] max-w-[92vw] max-h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden py-1.5 rounded-lg border border-nv-border bg-nv-side shadow-[0_10px_32px_rgba(0,0,0,0.4)] text-[13px] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {groups.map((g, gi) => {
        const open = g.id === openId;
        const head: Row = { kind: 'group', gid: g.id };
        return (
          <div key={g.id} className={gi > 0 ? 'mt-px' : ''}>
            <button
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={open}
              disabled={allOff(g)}
              tabIndex={allOff(g) ? -1 : 0}
              onMouseEnter={() => { if (!allOff(g)) setActive(rows.findIndex((r) => r.kind === 'group' && r.gid === g.id)); }}
              onClick={() => toggle(g.id)}
              className={`w-full flex items-center gap-2 h-8 ps-2.5 pe-3 text-start font-medium transition-colors disabled:pointer-events-none disabled:cursor-default ${
                open ? 'bg-nv-active/60 text-zinc-50 shadow-[inset_2px_0_0_var(--color-indigo-500)]' : isActive(head) ? 'bg-nv-hover text-zinc-100' : allOff(g) ? 'text-zinc-700' : 'text-zinc-100'
              }`}
            >
              <ChevronRight size={14} className={`shrink-0 transition-transform duration-(--dur-base) ${open ? 'rotate-90 text-indigo-300' : 'text-zinc-500'}`} />
              <span className="flex-1 truncate">{g.label}</span>
            </button>
            <div
              inert={!open}
              aria-hidden={!open}
              style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows var(--dur-base) var(--ease-out-soft)' }}
            >
              <div className="overflow-hidden min-h-0">
                <div className="ms-[19px] my-0.5 border-s border-nv-border">
                  {g.items.map((it, i) =>
                    it.separator ? (
                      <div key={`s${i}`} role="separator" className="my-1 ms-2 h-px bg-nv-border" />
                    ) : (
                      <button
                        key={`${it.label}-${i}`}
                        role={it.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'}
                        aria-checked={it.checked}
                        aria-disabled={it.disabled || undefined}
                        title={it.disabled ? it.hint : undefined}
                        onMouseEnter={() => { if (!it.disabled) setActive(rows.findIndex((r) => r.kind === 'item' && r.gid === g.id && r.idx === i)); }}
                        onClick={() => run(it)}
                        className={`w-full flex items-center gap-2.5 h-7 ps-2.5 pe-3 text-start transition-colors ${
                          it.disabled ? 'text-zinc-700 cursor-default' : isActive({ kind: 'item', gid: g.id, idx: i }) ? 'bg-nv-active text-zinc-50' : it.danger ? 'text-rose-400' : 'text-zinc-300'
                        }`}
                      >
                        <span className="w-4 shrink-0 flex items-center justify-center">{it.checked ? <Check size={13} /> : it.icon}</span>
                        <span className="flex-1 truncate whitespace-nowrap">{it.label}</span>
                        {it.shortcut && <span className={`text-[11px] font-mono whitespace-nowrap shrink-0 ps-3 ${it.disabled ? 'text-zinc-700' : 'text-zinc-500'}`}>{it.shortcut}</span>}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
