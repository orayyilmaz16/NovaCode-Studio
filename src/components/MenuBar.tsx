import React, { useRef, useState } from 'react';
import { ChevronRight, Menu as MenuIcon } from 'lucide-react';
import { PopupMenu, type MenuItem } from './Menu';
import { t } from '../i18n/uiText';

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

interface Props {
  menus: MenuGroup[];
  /** Dar pencerede başlıklar tek bir "Menü" düğmesine toplanır (başlık çubuğu ortalı kalsın diye). */
  compact?: boolean;
}

// VS Code tarzı üst menü çubuğu: tıklayınca açılır; biri açıkken fare diğer başlığa geçince menü de geçer.
// Açılır menüler animasyonludur (Menu.tsx → PopupMenu), klavye ile gezilir (↑ ↓ Enter Esc).
export const MenuBar: React.FC<Props> = ({ menus, compact }) => {
  // id: grup kimliği ya da '__root' (kompakt modda grup listesi)
  const [open, setOpen] = useState<{ id: string; x: number; y: number } | null>(null);
  const closedAt = useRef<{ id: string; t: number } | null>(null);

  const openFor = (id: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOpen({ id, x: r.left, y: r.bottom + 2 });
  };

  const close = () => {
    if (open) closedAt.current = { id: open.id, t: Date.now() };
    setOpen(null);
  };

  // Menü bu başlığa basarken dışarı-tıklama ile zaten kapandıysa yeniden açma (aç/kapa davranışı)
  const justClosed = (id: string) => {
    const last = closedAt.current;
    return !!last && last.id === id && Date.now() - last.t < 250;
  };

  const current = open && open.id !== '__root' ? menus.find((m) => m.id === open.id) : undefined;

  // Kompakt: tek düğme → grup listesi → seçilen grubun menüsü (aynı konumda)
  const rootItems: MenuItem[] = menus.map((m) => ({
    label: m.label,
    icon: <ChevronRight size={12} />,
    onClick: () => {
      const pos = open;
      window.setTimeout(() => { if (pos) setOpen({ id: m.id, x: pos.x, y: pos.y }); }, 0);
    }
  }));

  return (
    <nav
      aria-label="Menu"
      className="no-scrollbar app-no-drag flex items-center h-full pl-1 min-w-0 shrink overflow-x-auto overflow-y-hidden"
      // Dar kapta başlıklar yatay kayar (fare tekerleği de yatay çevrilir)
      onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}
      onScroll={() => setOpen(null)}
    >
      {compact ? (
        <button
          aria-haspopup="menu"
          aria-expanded={open !== null}
          title={t('mnMenu')}
          aria-label={t('mnMenu')}
          data-active={open !== null}
          onClick={(e) => { if (!justClosed('__root')) openFor('__root', e.currentTarget); }}
          className={`h-6 px-2 rounded flex items-center gap-1.5 text-[12px] whitespace-nowrap shrink-0 transition-colors ${open ? 'bg-nv-active text-zinc-50' : 'text-zinc-300 hover:bg-nv-hover'}`}
        >
          <MenuIcon size={14} />
          <span>{t('mnMenu')}</span>
        </button>
      ) : (
        menus.map((m) => (
          <button
            key={m.id}
            aria-haspopup="menu"
            aria-expanded={open?.id === m.id}
            data-active={open?.id === m.id}
            onClick={(e) => { if (!justClosed(m.id)) openFor(m.id, e.currentTarget); }}
            onMouseEnter={(e) => { if (open && open.id !== m.id) openFor(m.id, e.currentTarget); }}
            className={`h-6 px-2 rounded text-[12px] whitespace-nowrap shrink-0 transition-colors ${
              open?.id === m.id ? 'bg-nv-active text-zinc-50' : 'text-zinc-400 hover:bg-nv-hover hover:text-zinc-200'
            }`}
          >
            {m.label}
          </button>
        ))
      )}
      {open && open.id === '__root' && <PopupMenu key="__root" x={open.x} y={open.y} items={rootItems} onClose={close} />}
      {open && current && <PopupMenu key={open.id} x={open.x} y={open.y} items={current.items} onClose={close} />}
    </nav>
  );
};
