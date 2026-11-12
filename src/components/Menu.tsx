import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';

export interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Kapalı öğenin neden kapalı olduğunu söyleyen ipucu (üzerine gelince görünür). */
  hint?: string;
  /** İşaretli seçenek (✓): görünüm seçenekleri menüleri için. */
  checked?: boolean;
  separator?: boolean;
}

interface PopupMenuProps {
  /** Ekran koordinatı (viewport): menü imlecin/düğmenin yanında açılır, ekrandan taşarsa içeri çekilir. */
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

// VS Code tarzı açılır menü: yumuşak giriş animasyonu, klavye (↑ ↓ Enter Esc), dışarı tıklayınca kapanır.
export const PopupMenu: React.FC<PopupMenuProps> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });
  const actionable = items.map((it, i) => (!it.separator && !it.disabled ? i : -1)).filter((i) => i >= 0);
  const [active, setActive] = useState<number>(actionable[0] ?? -1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      left: Math.max(4, Math.min(x, window.innerWidth - r.width - 4)),
      top: Math.max(4, Math.min(y, window.innerHeight - r.height - 4))
    });
  }, [x, y, items.length]);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const i = actionable.indexOf(active);
        const next = actionable[(i + (e.key === 'ArrowDown' ? 1 : -1) + actionable.length) % actionable.length];
        setActive(next);
      } else if ((e.ctrlKey || e.metaKey) && e.key.length === 1) {
        onClose(); // Ctrl+P gibi kısayol menüyü kapatır, kısayol çalışmaya devam eder
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        items[active].onClick?.();
        onClose();
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
  }, [active, actionable, items, onClose]);

  // Menü document.body'ye çizilir: kenar çubuğu/panel gibi taşmayı kırpan (overflow-hidden) ata öğelerden etkilenmez
  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={{ left: pos.left, top: pos.top }}
      className="animate-menu fixed z-[70] min-w-[230px] max-w-[min(420px,92vw)] max-h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden py-1.5 rounded-lg border border-nv-border bg-nv-side shadow-[0_10px_32px_rgba(0,0,0,0.4)] text-[13px] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((it, i) =>
        it.separator ? (
          <div key={`s${i}`} role="separator" className="my-1 h-px bg-nv-border" />
        ) : (
          <button
            key={`${it.label}-${i}`}
            style={{ animationDelay: `${Math.min(i, 12) * 12}ms` }}
            role={it.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'}
            aria-checked={it.checked}
            aria-disabled={it.disabled || undefined}
            title={it.disabled ? it.hint : undefined}
            onMouseEnter={() => setActive(it.disabled ? -1 : i)}
            onClick={() => {
              // Kapalı öğe tıklanabilir görünmez ama fare üzerinde gezinebilir (menü kapanmaz)
              if (it.disabled) return;
              it.onClick?.();
              onClose();
            }}
            className={`animate-menu-item w-full flex items-center gap-2.5 h-7 px-3 text-left transition-colors ${
              it.disabled ? 'opacity-40 cursor-default hover:bg-nv-hover/40' : active === i ? 'bg-nv-active text-zinc-50' : it.danger ? 'text-rose-400' : 'text-zinc-300'
            }`}
          >
            <span className="w-4 shrink-0 flex items-center justify-center">{it.checked ? <Check size={13} /> : it.icon}</span>
            <span className="flex-1 truncate whitespace-nowrap">{it.label}</span>
            {it.shortcut && <span className="text-[11px] text-zinc-500 font-mono whitespace-nowrap shrink-0 pl-4">{it.shortcut}</span>}
          </button>
        )
      )}
    </div>,
    document.body
  );
};
