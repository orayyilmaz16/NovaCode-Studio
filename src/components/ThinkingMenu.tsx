import React, { useEffect, useRef, useState } from 'react';
import { Brain, Check } from 'lucide-react';
import { t, type UiTextKey } from '../i18n/uiText';

// Yapay zekâ panelinde düşünme seviyesi + yanıt uzunluğu (token) menüsü. Etkin modun (Sohbet/Ajan) ayarını doğrudan değiştirir.
export type ThinkingLevel = 'fast' | 'balanced' | 'deep';

const LEVELS: { id: ThinkingLevel; name: UiTextKey; desc: UiTextKey }[] = [
  { id: 'fast', name: 'optThinkFast', desc: 'aiThinkFastDesc' },
  { id: 'balanced', name: 'optThinkBalanced', desc: 'aiThinkBalancedDesc' },
  { id: 'deep', name: 'optThinkDeep', desc: 'aiThinkDeepDesc' }
];

interface Props {
  level: ThinkingLevel;
  onLevel: (l: ThinkingLevel) => void;
  maxTokens: number;
  onMaxTokens: (n: number) => void;
  disabled?: boolean;
}

export const ThinkingMenu: React.FC<Props> = ({ level, onLevel, maxTokens, onMaxTokens, disabled }) => {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const cur = LEVELS.find((l) => l.id === level) ?? LEVELS[1];

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={`${t('aiThinkingLevel')}: ${t(cur.name)}`}
        aria-label={t('aiThinkingLevel')}
        className={`h-7 px-1.5 rounded-md flex items-center gap-1 text-[11px] transition-colors disabled:opacity-40 ${open ? 'bg-nv-hover text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover'}`}
      >
        <Brain size={14} className={level === 'deep' ? 'text-purple-300' : level === 'fast' ? 'text-amber-300' : ''} />
        <span className="hidden min-[330px]:inline">{t(cur.name)}</span>
      </button>

      {open && (
        <div role="dialog" aria-label={t('aiThinkingLevel')} className="animate-menu absolute bottom-full left-0 mb-1.5 z-30 w-[248px] rounded-xl border border-zinc-700/80 bg-zinc-900 p-1.5 shadow-2xl shadow-black/50">
          <div className="px-2 pt-1 pb-1.5 text-[10px] uppercase tracking-wide text-zinc-500">{t('aiThinkingLevel')}</div>
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="menuitemradio"
              aria-checked={l.id === level}
              onClick={() => onLevel(l.id)}
              className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${l.id === level ? 'bg-nv-active text-zinc-50' : 'text-zinc-300 hover:bg-nv-hover'}`}
            >
              <span className="mt-0.5 w-3.5 shrink-0">{l.id === level && <Check size={13} className="text-indigo-300" />}</span>
              <span className="min-w-0">
                <span className="block text-[12.5px] leading-tight">{t(l.name)}</span>
                <span className="block text-[10.5px] leading-snug text-zinc-500">{t(l.desc)}</span>
              </span>
            </button>
          ))}
          <div className="mt-1 border-t border-zinc-800 px-2 pt-2 pb-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <label htmlFor="ai-max-tokens">{t('set_aiMaxTokens')}</label>
              <span className="font-mono text-zinc-300">{maxTokens}</span>
            </div>
            <input
              id="ai-max-tokens"
              type="range"
              min={1024}
              max={16000}
              step={512}
              value={maxTokens}
              onChange={(e) => onMaxTokens(Number(e.target.value))}
              className="mt-1.5 w-full accent-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
