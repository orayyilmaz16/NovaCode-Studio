import React, { useEffect, useRef, useState } from 'react';
import { Brain, Check } from 'lucide-react';
import { t, type TextKey } from '../i18n/uiText';
import '../i18n/uiTextAi'; // AI metinleri (gecikmeli yüklenen ek sözlük)

// Yapay zekâ panelinde düşünme seviyesi + yanıt uzunluğu (token) menüsü. Etkin modun (Sohbet/Ajan) ayarını doğrudan değiştirir.
// Ajan modunda ek olarak otonomi seviyesi ve adım sınırı gösterilir.
export type ThinkingLevel = 'fast' | 'balanced' | 'deep';
export type Autonomy = 'ask' | 'edits' | 'auto';

const LEVELS: { id: ThinkingLevel; name: TextKey; desc: TextKey }[] = [
  { id: 'fast', name: 'optThinkFast', desc: 'aiThinkFastDesc' },
  { id: 'balanced', name: 'optThinkBalanced', desc: 'aiThinkBalancedDesc' },
  { id: 'deep', name: 'optThinkDeep', desc: 'aiThinkDeepDesc' }
];
const AUTONOMY: { id: Autonomy; name: TextKey; desc: TextKey; dot: string }[] = [
  { id: 'ask', name: 'optAutoAsk', desc: 'aiAutoAskDesc', dot: 'bg-emerald-400' },
  { id: 'edits', name: 'optAutoEdits', desc: 'aiAutoEditsDesc', dot: 'bg-amber-400' },
  { id: 'auto', name: 'optAutoFull', desc: 'aiAutoFullDesc', dot: 'bg-rose-400' }
];

interface AgentProps {
  autonomy: Autonomy;
  onAutonomy: (a: Autonomy) => void;
  maxSteps: number;
  onMaxSteps: (n: number) => void;
}
interface Props {
  level: ThinkingLevel;
  onLevel: (l: ThinkingLevel) => void;
  maxTokens: number;
  onMaxTokens: (n: number) => void;
  /** Verilirse (Ajan modu) otonomi ve adım sınırı da gösterilir. */
  agent?: AgentProps;
  disabled?: boolean;
}

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-wide text-zinc-500">{children}</div>
);

export const ThinkingMenu: React.FC<Props> = ({ level, onLevel, maxTokens, onMaxTokens, agent, disabled }) => {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const cur = LEVELS.find((l) => l.id === level) ?? LEVELS[1];
  const autoCur = agent ? AUTONOMY.find((a) => a.id === agent.autonomy) ?? AUTONOMY[0] : null;

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);

  // Otonom seviye riskli: ilk seçimde açık onay istenir (düzenleme + derleme/test komutları sorulmadan çalışır)
  const pickAutonomy = (a: Autonomy) => {
    if (!agent || a === agent.autonomy) return;
    if (a === 'auto' && !window.confirm(t('aiAutonomyConfirm'))) return;
    agent.onAutonomy(a);
  };

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={`${t('aiThinkingLevel')}: ${t(cur.name)}${autoCur ? ` · ${t('aiAutonomyLabel')}: ${t(autoCur.name)}` : ''}`}
        aria-label={t('aiThinkingLevel')}
        className={`h-7 px-1.5 rounded-md flex items-center gap-1 text-[11px] transition-colors disabled:opacity-40 ${open ? 'bg-nv-hover text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover'}`}
      >
        <Brain size={14} className={level === 'deep' ? 'text-purple-300' : level === 'fast' ? 'text-amber-300' : ''} />
        <span className="hidden min-[330px]:inline">{t(cur.name)}</span>
        {autoCur && autoCur.id !== 'ask' && <span className={`w-1.5 h-1.5 rounded-full ${autoCur.dot}`} />}
      </button>

      {open && (
        <div role="dialog" aria-label={t('aiThinkingLevel')} className="animate-menu absolute bottom-full left-0 mb-1.5 z-30 w-[268px] max-h-[min(70vh,460px)] overflow-y-auto rounded-xl border border-zinc-700/80 bg-zinc-900 p-1.5 shadow-2xl shadow-black/50">
          <Section>{t('aiThinkingLevel')}</Section>
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

          {agent && (
            <>
              <div className="mt-1 border-t border-zinc-800" />
              <Section>{t('aiAutonomyLabel')}</Section>
              {AUTONOMY.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={a.id === agent.autonomy}
                  onClick={() => pickAutonomy(a.id)}
                  className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${a.id === agent.autonomy ? 'bg-nv-active text-zinc-50' : 'text-zinc-300 hover:bg-nv-hover'}`}
                >
                  <span className="mt-0.5 w-3.5 shrink-0">{a.id === agent.autonomy ? <Check size={13} className="text-violet-300" /> : <span className={`block w-1.5 h-1.5 mt-1 ml-1 rounded-full ${a.dot}`} />}</span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] leading-tight">{t(a.name)}</span>
                    <span className="block text-[10.5px] leading-snug text-zinc-500">{t(a.desc)}</span>
                  </span>
                </button>
              ))}
            </>
          )}

          <div className="mt-1 border-t border-zinc-800 px-2 pt-2 pb-1 space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <label htmlFor="ai-max-tokens">{t('set_aiMaxTokens')}</label>
                <span className="font-mono text-zinc-300">{maxTokens}</span>
              </div>
              <input id="ai-max-tokens" type="range" min={1024} max={16000} step={512} value={maxTokens} onChange={(e) => onMaxTokens(Number(e.target.value))} className="mt-1.5 w-full accent-indigo-500" />
            </div>
            {agent && (
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <label htmlFor="ai-max-steps">{t('aiMaxStepsLabel')}</label>
                  <span className="font-mono text-zinc-300">{agent.maxSteps}</span>
                </div>
                <input id="ai-max-steps" type="range" min={6} max={40} step={2} value={agent.maxSteps} onChange={(e) => agent.onMaxSteps(Number(e.target.value))} className="mt-1.5 w-full accent-violet-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
