import React, { useRef, useState } from 'react';
import { PopupMenu, type MenuItem } from './Menu';

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

// VS Code tarzı üst menü çubuğu: tıklayınca açılır; biri açıkken fare diğer başlığa geçince menü de geçer.
// Açılır menüler animasyonludur (Menu.tsx → PopupMenu), klavye ile gezilir (↑ ↓ Enter Esc).
export const MenuBar: React.FC<{ menus: MenuGroup[] }> = ({ menus }) => {
  const [open, setOpen] = useState<{ id: string; x: number; y: number } | null>(null);
  const closedAt = useRef<{ id: string; t: number } | null>(null);

  const openFor = (id: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOpen({ id, x: r.left, y: r.bottom + 2 });
  };

  const current = open ? menus.find((m) => m.id === open.id) : undefined;

  return (
    <nav
      aria-label="Menu"
      className="no-scrollbar app-no-drag flex items-center h-full pl-1 min-w-0 shrink overflow-x-auto overflow-y-hidden"
      // Dar pencerede başlıklar yatay kayar (fare tekerleği de yatay çevrilir)
      onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}
      onScroll={() => setOpen(null)}
    >
      {menus.map((m) => (
        <button
          key={m.id}
          aria-haspopup="menu"
          aria-expanded={open?.id === m.id}
          data-active={open?.id === m.id}
          onClick={(e) => {
            const last = closedAt.current;
            // Menü bu başlığa basarken dışarı-tıklama ile zaten kapandıysa yeniden açma (aç/kapa davranışı)
            if (last && last.id === m.id && Date.now() - last.t < 250) return;
            openFor(m.id, e.currentTarget);
          }}
          onMouseEnter={(e) => { if (open && open.id !== m.id) openFor(m.id, e.currentTarget); }}
          className={`h-6 px-2 rounded text-[12px] whitespace-nowrap shrink-0 transition-colors ${
            open?.id === m.id ? 'bg-nv-active text-zinc-50' : 'text-zinc-400 hover:bg-nv-hover hover:text-zinc-200'
          }`}
        >
          {m.label}
        </button>
      ))}
      {open && current && (
        <PopupMenu
          key={open.id}
          x={open.x}
          y={open.y}
          items={current.items}
          onClose={() => {
            closedAt.current = { id: open.id, t: Date.now() };
            setOpen(null);
          }}
        />
      )}
    </nav>
  );
};
