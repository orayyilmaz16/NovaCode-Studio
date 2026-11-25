import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Temaya uyumlu, gecikmeli ipucu (yerel `title` kutusu yerine): hover/odaktan sonra kısa bir gecikmeyle yumuşakça belirir,
// ayrılınca hemen kapanır. Sekme çubuğu gibi `overflow` ile kırpılan yerlerde de görünsün diye body'ye (portal) çizilir.
const SHOW_DELAY = 420; // ms; ana eylem değil, ikincil bilgi (motion.md kural 7)

export function useHoverTip(render: () => React.ReactNode) {
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hide = useCallback(() => { clearTimeout(timer.current); setTip(null); }, []);
  const show = useCallback((el: HTMLElement) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const r = el.getBoundingClientRect();
      setTip({ x: r.left, y: r.bottom + 6 });
    }, SHOW_DELAY);
  }, []);
  useEffect(() => hide, [hide]);
  useEffect(() => {
    if (!tip) return;
    const off = () => setTip(null);
    window.addEventListener('blur', off);
    window.addEventListener('scroll', off, true);
    return () => { window.removeEventListener('blur', off); window.removeEventListener('scroll', off, true); };
  }, [tip]);

  const props = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => show(e.currentTarget),
    onMouseLeave: hide,
    onFocus: (e: React.FocusEvent<HTMLElement>) => show(e.currentTarget),
    onBlur: hide,
    onMouseDown: hide,
    onDragStart: hide
  };
  const node = tip
    ? createPortal(
        <div
          role="tooltip"
          className="hover-tip fixed z-[70] pointer-events-none max-w-[min(520px,calc(100vw-16px))] rounded-lg border border-nv-border bg-nv-side px-2.5 py-1.5 text-[11.5px] leading-snug text-zinc-200"
          style={{ left: Math.max(8, Math.min(tip.x, window.innerWidth - 8 - 280)), top: tip.y }}
        >
          {render()}
        </div>,
        document.body
      )
    : null;
  return { props, node };
}
