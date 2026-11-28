import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';

// Yan panel bölümleri (VS Code bölme düzeni gibi): bir bölümün alt tutamacı sürüklenince o bölüm büyürken altındaki açık bölüm küçülür
// (toplam sabit kalır). Bölüm içeriğinden yüksek olamaz (boşluk oluşmaz) ve en az MIN px kalır; sınıra gelince sürükleme durur.
// Yükseklikler bölüm kimliğine göre yerelde saklanır (yalnız arayüz tercihi; kişisel veri yok).
const KEY = 'nova.git.heights.v2';
const MIN = 56;
const STEP = 24;
const ORDER: Record<string, number> = { merge: 1, staged: 2, changes: 3, stash: 4, history: 5 };

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

interface Pane {
  order: number;
  /** İçeriğin doğal yüksekliği */
  content: () => number;
  /** Şu an görünen yükseklik (içerikten büyük olamaz) */
  eff: () => number;
  apply: (h: number | null) => void;
}
const panes = new Map<string, Pane>();

const openPanes = () => [...panes.entries()].sort((a, b) => a[1].order - b[1].order);

/** id bölümünün alt sınırını d px kaydırır: kendisi +d, altındaki açık bölüm −d. Dönen değer: gerçekten uygulanan kayma. */
function move(id: string, d: number, from?: { a: number; b: number | null }): number {
  const list = openPanes();
  const i = list.findIndex(([k]) => k === id);
  if (i < 0) return 0;
  const A = list[i][1];
  const B = list[i + 1]?.[1];
  const eA = from?.a ?? A.eff();
  const eB = B ? (from?.b ?? B.eff()) : 0;
  const cA = A.content();
  const cB = B ? B.content() : 0;
  const lo = Math.max(MIN - eA, B ? eB - cB : -Infinity);
  const hi = Math.min(cA - eA, B ? eB - MIN : Infinity);
  if (lo > hi) return 0; // sıkışık: kayma yok
  const dd = Math.max(lo, Math.min(hi, d));
  A.apply(Math.round(eA + dd));
  if (B) B.apply(Math.round(eB - dd));
  return dd;
}

export const ResizableBody: React.FC<{ id: string; defaultHeight?: number; children: React.ReactNode }> = ({ id, defaultHeight, children }) => {
  const [size, setSize] = useState<number | null>(() => read()[id] ?? defaultHeight ?? null);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const inner = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(0);
  const contentRef = useRef(0);
  const start = useRef<{ y: number; a: number; b: number | null } | null>(null);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => { contentRef.current = el.getBoundingClientRect().height; setContent(contentRef.current); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    panes.set(id, {
      order: ORDER[id] ?? 99,
      content: () => contentRef.current,
      eff: () => Math.min(sizeRef.current ?? Infinity, contentRef.current),
      apply: (h) => { sizeRef.current = h; setSize(h); },
    });
    return () => { panes.delete(id); };
  }, [id]);

  const persistAll = () => { for (const [k, p] of panes) write(k, p.eff() >= contentRefFor(k) ? null : p.eff()); };
  const contentRefFor = (k: string) => panes.get(k)?.content() ?? Infinity;

  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const list = openPanes();
    const i = list.findIndex(([k]) => k === id);
    start.current = { y: e.clientY, a: list[i]?.[1].eff() ?? 0, b: list[i + 1]?.[1].eff() ?? null };
    document.documentElement.setAttribute('data-resizing', '');
  }, [id]);
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (s) move(id, e.clientY - s.y, { a: s.a, b: s.b });
  };
  const end = (e: React.PointerEvent) => {
    if (!start.current) return;
    start.current = null;
    document.documentElement.removeAttribute('data-resizing');
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* yakalama yok */ }
    persistAll();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    move(id, e.key === 'ArrowDown' ? STEP : -STEP);
    persistAll();
  };

  // Gövde yüksekliği içeriği aşmaz: boşluk oluşmaz; içerik sığmıyorsa kaydırılır
  const capped = size !== null && size < content;
  return (
    <div className="relative">
      <div className={capped ? 'overflow-y-auto overflow-x-hidden' : ''} style={capped ? { height: size ?? undefined } : undefined}>
        <div ref={inner}>{children}</div>
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
        onDoubleClick={() => { panes.get(id)?.apply(null); write(id, null); }}
        className="group/rs relative h-2 -mb-1 cursor-row-resize touch-none focus-visible:outline-none"
      >
        <span className="absolute inset-x-6 top-[3px] h-[2px] rounded-full bg-transparent group-hover/rs:bg-indigo-400/70 group-focus-visible/rs:bg-indigo-400 group-active/rs:bg-indigo-400 transition-colors duration-(--dur-fast)" />
      </div>
    </div>
  );
};
