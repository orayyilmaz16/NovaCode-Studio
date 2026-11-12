import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextAi'; // AI metinleri (gecikmeli yüklenen ek sözlük)

// Yatay kaydırıcı: sığmayan çipler (ör. ajan görev şablonları) için sağ/sol düğmeler, fare tekerleği ve dokunmatik kaydırma.
// Düğmeler yalnız içerik taşıyorsa görünür; uca gelince soluklaşır.
export const ChipSlider: React.FC<{ children: React.ReactNode; label?: string; className?: string }> = ({ children, label, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState({ over: false, left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const over = el.scrollWidth > el.clientWidth + 2;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setSt((s) => (s.over === over && s.left === left && s.right === right ? s : { over, left, right }));
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const go = (dir: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.7), behavior: 'smooth' });
  };

  const arrow = 'absolute top-0 h-full w-7 flex items-center text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-300 transition-opacity';

  return (
    <div className={`relative ${className}`} role="group" aria-label={label}>
      <div
        ref={ref}
        onScroll={update}
        onWheel={(e) => {
          const el = ref.current;
          if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY; // dikey tekerlek yatay kaydırır
        }}
        className={`no-scrollbar flex items-center gap-1.5 overflow-x-auto scroll-smooth ${st.over ? 'px-7' : ''}`}
      >
        {children}
      </div>
      {st.over && (
        <>
          <button type="button" onClick={() => go(-1)} disabled={!st.left} aria-label={t('aiScrollLeft')} title={t('aiScrollLeft')} className={`${arrow} left-0 justify-start bg-gradient-to-r from-nv-side via-nv-side/95 to-transparent`}><ChevronLeft size={15} /></button>
          <button type="button" onClick={() => go(1)} disabled={!st.right} aria-label={t('aiScrollRight')} title={t('aiScrollRight')} className={`${arrow} right-0 justify-end bg-gradient-to-l from-nv-side via-nv-side/95 to-transparent`}><ChevronRight size={15} /></button>
        </>
      )}
    </div>
  );
};
