import React, { useRef } from 'react';

interface ResizeHandleProps {
  /** horizontal: dikey çizgi, sağa/sola sürüklenir. vertical: yatay çizgi, yukarı/aşağı sürüklenir. */
  direction: 'horizontal' | 'vertical';
  /** Her harekette farkı (px) bildirir. */
  onResize: (delta: number) => void;
  title?: string;
}

// Pointer olaylarıyla sürükleme. Pointer yakalandığı için fare panelin dışına çıksa da çalışır.
export const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, onResize, title }) => {
  const last = useRef<number | null>(null);
  const isH = direction === 'horizontal';

  return (
    <div
      role="separator"
      aria-orientation={isH ? 'vertical' : 'horizontal'}
      title={title}
      onPointerDown={(e) => {
        last.current = isH ? e.clientX : e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
        document.body.style.cursor = isH ? 'col-resize' : 'row-resize';
        document.documentElement.dataset.resizing = '1';
      }}
      onPointerMove={(e) => {
        if (last.current === null) return;
        const current = isH ? e.clientX : e.clientY;
        const delta = current - last.current;
        last.current = current;
        if (delta !== 0) onResize(delta);
      }}
      onPointerUp={(e) => {
        last.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
        document.body.style.cursor = '';
        delete document.documentElement.dataset.resizing;
      }}
      className={`shrink-0 group relative z-10 ${
        isH ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
      } bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500/60 transition-colors`}
    />
  );
};

/** Localstorage'da saklanan sayıyı güvenle okur; hata olursa varsayılanı döner. */
export function loadStoredNumber(key: string, fallback: number): number {
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredNumber(key: string, value: number): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* depolama kapalıysa sessizce geç */
  }
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
