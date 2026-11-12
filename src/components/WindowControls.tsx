import React, { useEffect, useState } from 'react';
import { t } from '../i18n/uiText';

// Özel pencere düğmeleri (Windows/Linux): başlık çubuğuyla aynı renk ve yükseklik; macOS'ta sistemin trafik ışıkları kullanılır.
const base = 'icon-btn app-no-drag focus-visible:outline-none focus-visible:bg-white/10';
const glyph = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, shapeRendering: 'crispEdges' } as const;

export const WindowControls: React.FC = () => {
  const api = window.electronAPI;
  const wc = api?.windowControls;
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!wc) return;
    let alive = true;
    void wc.isMaximized().then((v) => alive && setMaximized(v)).catch(() => undefined);
    const off = wc.onMaximized(setMaximized);
    return () => { alive = false; off(); };
  }, [wc]);

  if (!wc || api?.platform === 'darwin') return null;

  return (
    <div className="flex items-center gap-0.5 shrink-0 ml-1 pl-1.5 pr-2 border-l border-nv-border/70 h-4">
      <button onClick={() => void wc.minimize()} title={t('wcMinimize')} aria-label={t('wcMinimize')} className={`${base}`}>
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden><path d="M0 5.5h10" {...glyph} /></svg>
      </button>
      <button
        onClick={() => void wc.toggleMaximize().then(setMaximized).catch(() => undefined)}
        title={maximized ? t('wcRestore') : t('wcMaximize')}
        aria-label={maximized ? t('wcRestore') : t('wcMaximize')}
        className={`${base}`}
      >
        {maximized ? (
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
            <path d="M2.5 2.5V.5h7v7h-2" {...glyph} />
            <rect x=".5" y="2.5" width="7" height="7" {...glyph} />
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden><rect x=".5" y=".5" width="9" height="9" {...glyph} /></svg>
        )}
      </button>
      <button onClick={() => void wc.close()} title={t('wcClose')} aria-label={t('wcClose')} className={`${base} hover:!bg-[#e81123] hover:!text-white`}>
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden><path d="M0 0l10 10M10 0L0 10" {...glyph} shapeRendering="auto" /></svg>
      </button>
    </div>
  );
};
