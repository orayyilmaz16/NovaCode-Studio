import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';
import { PopupMenu, type MenuItem } from './Menu';
import { AccordionMenu } from './AccordionMenu';
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

  // Gruptaki tüm öğeler kapalıysa (ör. klasör açık değil) başlık koyu görünür
  const allOff = (m: MenuGroup) => {
    const real = m.items.filter((i) => !i.separator);
    return real.length > 0 && real.every((i) => i.disabled);
  };

  // Pencere boyutu değişip kompakt mod geçince açık menü eski konumunda kalmasın
  useEffect(() => { setOpen(null); }, [compact]);

  const current = open && open.id !== '__root' ? menus.find((m) => m.id === open.id) : undefined;

  return (
    <nav
      aria-label={t('mnMenu')}
      className="no-scrollbar app-no-drag flex items-center gap-0.5 h-full ps-1 min-w-0 shrink overflow-x-auto overflow-y-hidden"
      // Dar kapta başlıklar yatay kayar (fare tekerleği de yatay çevrilir)
      onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}
      onScroll={close}
    >
      {compact ? (
        <button
          aria-haspopup="menu"
          aria-expanded={open !== null}
          title={t('mnMenu')}
          aria-label={t('mnMenu')}
          data-active={open !== null}
          onClick={(e) => { if (!justClosed('__root')) openFor('__root', e.currentTarget); }}
          className={`mb-btn rounded-md flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors duration-(--dur-fast) ${open ? 'bg-white/[0.09] text-zinc-50' : 'text-zinc-300 hover:bg-white/[0.07]'}`}
        >
          <MenuIcon size={14} />
          <span>{t('mnMenu')}</span>
          <ChevronDown size={12} className={`shrink-0 opacity-70 transition-transform duration-(--dur-base) ${open ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        menus.map((m) => (
          <button
            key={m.id}
            aria-haspopup="menu"
            aria-expanded={open?.id === m.id}
            data-active={open?.id === m.id}
            disabled={allOff(m)}
            onClick={(e) => { if (!allOff(m) && !justClosed(m.id)) openFor(m.id, e.currentTarget); }}
            onMouseEnter={(e) => { if (open && open.id !== m.id && !allOff(m)) openFor(m.id, e.currentTarget); }}
            // Kullanılabilir başlık beyaz, açık olan vurgulu; hiç öğesi kullanılamayan (dosya/klasör yok) başlık koyu kalır
            data-off={allOff(m) || undefined}
            className={`mb-btn relative rounded-md whitespace-nowrap shrink-0 transition-[color,background-color] duration-(--dur-base) ease-(--ease-out-soft) ${
              open?.id === m.id ? 'bg-white/[0.10] text-white' : allOff(m) ? 'text-zinc-700 pointer-events-none cursor-default' : 'text-zinc-100 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {m.label}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-x-2 bottom-0.5 h-0.5 rounded-full bg-indigo-400 origin-center transition-[transform,opacity] duration-(--dur-base) ease-(--ease-out-soft) ${open?.id === m.id ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
            />
          </button>
        ))
      )}
      {open && open.id === '__root' && <AccordionMenu key="__root" x={open.x} y={open.y} groups={menus} onClose={close} />}
      {open && current && <PopupMenu key={open.id} x={open.x} y={open.y} items={current.items} onClose={close} />}
    </nav>
  );
};
