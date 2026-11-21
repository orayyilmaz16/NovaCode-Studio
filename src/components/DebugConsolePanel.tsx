import React, { useEffect, useRef, useState } from 'react';
import { Bug, ChevronRight } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextDev';
import { evalExpr, useDebug } from '../services/debugStore';

// Alt panel "Hata ayıklama konsolu": oturumun çıktısı (stdout/stderr), ifade sonuçları ve bilgi satırları + ifade girişi.
const STATUS_TONE = { idle: 'bg-zinc-500', starting: 'bg-amber-400 animate-pulse', running: 'bg-emerald-400', paused: 'bg-amber-400' } as const;

export const DebugConsolePanel: React.FC<{ lineHeight: number }> = ({ lineHeight }) => {
  const s = useDebug();
  const [expr, setExpr] = useState('');
  const [hist, setHist] = useState<string[]>([]);
  const pos = useRef(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const live = s.status !== 'idle';

  useEffect(() => {
    const el = scroller.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 80) el.scrollTop = el.scrollHeight;
  }, [s.lines]);

  const statusText = s.status === 'paused' ? t('pnlStatusPaused') : s.status === 'idle' ? t('pnlStatusIdle') : t('pnlStatusRunning');

  const submit = () => {
    const v = expr.trim();
    if (!v || !live) return;
    void evalExpr(v);
    setHist((h) => [...h.filter((x) => x !== v), v].slice(-50));
    pos.current = -1;
    setExpr('');
  };

  return (
    <div className="absolute inset-0 flex flex-col font-sans" dir="ltr">
      <div className="flex items-center gap-2 px-3 h-9 border-b border-nv-border shrink-0 text-[11.5px] text-zinc-400">
        <span className={`size-1.5 rounded-full ${STATUS_TONE[s.status]}`} />
        <span className="text-zinc-300">{statusText}</span>
        {s.file && <span className="truncate text-zinc-500 min-w-0">· {s.file.split(/[\\/]/).pop()}</span>}
      </div>

      <div ref={scroller} className="flex-1 min-h-0 overflow-y-auto px-3 py-1.5 font-mono select-text" style={{ lineHeight }}>
        {s.lines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center text-zinc-500 font-sans text-[12.5px] px-6">
            <Bug size={20} className="opacity-60" />
            <span className="text-zinc-400">{t('pnlDbgIdle')}</span>
            <span className="max-w-[460px] leading-snug">{t('pnlDbgIdleHint')}</span>
          </div>
        ) : (
          s.lines.map((ln) => {
            const tone = ln.kind === 'stderr' || ln.kind === 'error' ? 'text-rose-300' : ln.kind === 'eval' ? 'text-sky-300' : ln.kind === 'info' ? 'text-zinc-500' : 'text-zinc-300';
            return (
              <div key={ln.id} className={`whitespace-pre-wrap break-all ${tone} ${ln.kind === 'eval' && ln.text.startsWith('>') ? 'opacity-80' : ''}`}>
                {ln.kind === 'info' && ln.text.startsWith('exit:') ? t('dbgExited').replace('{c}', ln.text.slice(5)) : ln.text}
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-1.5 px-3 h-9 border-t border-nv-border shrink-0">
        <ChevronRight size={14} className={live ? 'text-indigo-400' : 'text-zinc-600'} />
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit();
            else if (e.key === 'ArrowUp' && hist.length) {
              e.preventDefault();
              pos.current = Math.min(hist.length - 1, pos.current + 1);
              setExpr(hist[hist.length - 1 - pos.current]);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              pos.current = Math.max(-1, pos.current - 1);
              setExpr(pos.current < 0 ? '' : hist[hist.length - 1 - pos.current]);
            }
          }}
          disabled={!live}
          placeholder={live ? t('pnlDbgEvalHint') : t('pnlDbgIdle')}
          aria-label={t('dbgEvalPlaceholder')}
          spellCheck={false}
          className="flex-1 min-w-0 h-full bg-transparent text-[12px] font-mono text-zinc-100 placeholder:text-zinc-600 outline-none disabled:opacity-60"
        />
      </div>
    </div>
  );
};
