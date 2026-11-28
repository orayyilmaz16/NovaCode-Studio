import React, { useCallback, useRef, useState } from 'react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';

// Yan panel bölümü gövdesi: alt kenardaki tutamaçla sürükleyerek yükseklik ayarlanır (çift tıklama: otomatiğe döner).
// Yükseklik bölüm kimliğine göre yerelde saklanır (yalnız arayüz tercihi; kişisel veri yok).
const KEY = 'nova.git.heights.v1';
const MIN = 64;
const MAX = 900;

const read = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, number>; } catch { return {}; }
};
const write = (id: string, h: number | null) => {
  try {
    const all = read();
    if (h === null) delete all[id]; else all[id] = h;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* depolama kapalı */ }
};

export const ResizableBody: React.FC<{ id: string; defaultHeight?: number; children: React.ReactNode }> = ({ id, defaultHeight, children }) => {
  const [h, setH] = useState<number | null>(() => read()[id] ?? defaultHeight ?? null);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; h: number } | null>(null);

  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, h: box.current?.getBoundingClientRect().height ?? h ?? 200 };
    document.documentElement.setAttribute('data-resizing', '');
  }, [h]);
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setH(Math.max(MIN, Math.min(MAX, Math.round(d.h + e.clientY - d.y))));
  };
  const end = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    document.documentElement.removeAttribute('data-resizing');
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* yakalama yok */ }
    setH((cur) => { write(id, cur); return cur; });
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const base = h ?? box.current?.getBoundingClientRect().height ?? 200;
    const next = Math.max(MIN, Math.min(MAX, Math.round(base + (e.key === 'ArrowDown' ? 24 : -24))));
    setH(next);
    write(id, next);
  };

  return (
    <div className="relative">
      <div ref={box} className={h === null ? '' : 'overflow-y-auto overflow-x-hidden'} style={h === null ? undefined : { height: h }}>
        {children}
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label={t('scmResizeSection')}
        title={`${t('scmResizeSection')} · ${t('scmResizeReset')}`}
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={onKey}
        onDoubleClick={() => { setH(null); write(id, null); }}
        className="group/rs relative h-2 -mb-1 cursor-row-resize touch-none focus-visible:outline-none"
      >
        <span className="absolute inset-x-6 top-[3px] h-[2px] rounded-full bg-transparent group-hover/rs:bg-indigo-400/70 group-focus-visible/rs:bg-indigo-400 group-active/rs:bg-indigo-400 transition-colors duration-(--dur-fast)" />
      </div>
    </div>
  );
};
