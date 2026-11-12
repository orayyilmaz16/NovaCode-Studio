import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Settings2, Wand2, ChevronRight } from 'lucide-react';
import { useSettings } from '../services/SettingsContext';
import { EFFORT_PRESETS, useCompletionStatus } from '../services/aiCompletion';
import { runEditorAction } from '../services/editorBridge';
import { t } from '../i18n/uiText';
import '../i18n/uiTextAi';
import '../i18n/uiTextScm';
import '../i18n/uiTextComp';

// Alt çubuktaki ✦ düğmesinin açtığı AI kod tamamlama menüsü (GitHub Copilot durum menüsü gibi):
// aç/kapa, tetikleme, çaba (düşünme seviyesi) ön ayarı, öneri biçimi, aralık (slider) ayarları ve kısayollar.
interface Props {
  /** Düğmenin ekran konumu: menü bunun üstünde açılır. */
  anchor: { x: number; y: number };
  /** Etkin dosyanın dil kimliği (dil bazında kapatma için). */
  language?: string;
  onClose: () => void;
  onOpenSettings: () => void;
}

const Switch: React.FC<{ on: boolean; onChange: (v: boolean) => void; label: string }> = ({ on, onChange, label }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative w-7 h-4 rounded-full transition-colors shrink-0 ${on ? 'bg-indigo-500' : 'bg-zinc-600'}`}>
    <span className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform ${on ? 'translate-x-3' : ''}`} />
  </button>
);

const Segmented: React.FC<{ value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; label: string }> = ({ value, options, onChange, label }) => (
  <div role="radiogroup" aria-label={label} className="flex rounded bg-nv-editor border border-zinc-700/70 p-px gap-px">
    {options.map((o) => (
      <button
        key={o.value}
        role="radio"
        aria-checked={value === o.value}
        onClick={() => onChange(o.value)}
        className={`px-2 h-[18px] rounded-[3px] text-[10.5px] whitespace-nowrap transition-colors ${value === o.value ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// Tek satır: solda etiket, sağda kontrol
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2 px-3 h-7">
    <span className="text-[11.5px] text-zinc-400 flex-1 min-w-0 truncate" title={label}>{label}</span>
    {children}
  </div>
);

const Range: React.FC<{ id: string; min: number; max: number; step: number; value: number; set: (id: string, v: number) => void; label: string; fmt?: (n: number) => string }> = ({ id, min, max, step, value, set, label, fmt }) => (
  <div className="flex items-center gap-2 px-3 h-6">
    <span className="text-[11.5px] text-zinc-400 w-[118px] shrink-0 truncate" title={label}>{label}</span>
    <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => set(id, Number(e.target.value))} className="flex-1 min-w-0 accent-indigo-500 h-1" />
    <span className="w-[46px] text-right font-mono text-[10.5px] text-zinc-300 shrink-0">{fmt ? fmt(value) : value}</span>
  </div>
);

export const CompletionMenu: React.FC<Props> = ({ anchor, language, onClose, onOpenSettings }) => {
  const { values, set } = useSettings();
  const status = useCompletionStatus();
  const ref = useRef<HTMLDivElement>(null);
  const num = (k: string, d: number) => (Number.isFinite(Number(values[k])) && values[k] !== '' && values[k] !== undefined ? Number(values[k]) : d);
  const enabled = values.aiCompletion !== false;
  const effort = (['fast', 'balanced', 'deep'] as const).find((x) => x === values.aiCompletionEffort) ?? 'balanced';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const applyEffort = (k: 'fast' | 'balanced' | 'deep') => {
    const p = EFFORT_PRESETS[k];
    set('aiCompletionEffort', k);
    set('aiCompletionDelay', p.delay);
    set('aiCompletionMaxTokens', p.maxTokens);
    set('aiCompletionPrefix', p.prefixChars);
    set('aiCompletionSuffix', p.suffixChars);
    set('aiCompletionTemperature', p.temperature);
    set('aiCompletionLength', p.length);
  };

  const offList = String(values.aiCompletionOffLangs ?? '').split(/[,\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
  const langOn = !!language && !offList.includes(language.toLowerCase());
  const toggleLang = (on: boolean) => {
    if (!language) return;
    const l = language.toLowerCase();
    set('aiCompletionOffLangs', (on ? offList.filter((x) => x !== l) : [...offList.filter((x) => x !== l), l]).join(', '));
  };

  const statusText = !enabled || status.state === 'off' ? t('cmStatusOff')
    : status.state === 'busy' ? t('aiCompBusy')
      : status.state === 'unavailable' ? (status.reason === 'no-api' ? t('cmNoApi') : status.reason === 'no-model' ? t('cmNoModel') : t('cmNoOllama'))
        : t('cmStatusOn');
  const statusColor = !enabled || status.state === 'off' ? 'bg-zinc-500' : status.state === 'busy' ? 'bg-amber-400 animate-pulse' : status.state === 'unavailable' ? 'bg-rose-400' : 'bg-emerald-400';

  const left = Math.max(8, Math.min(anchor.x - 170, window.innerWidth - 348));
  const bottom = Math.max(8, window.innerHeight - anchor.y + 6);

  const [adv, setAdv] = useState(false);
  const short = (x: string) => x.split(' (')[0].split(' ')[0];

  return (
    <div className="fixed inset-0 z-[200]" onMouseDown={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-label={t('set_aiCompletion')}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ left, bottom, maxHeight: `calc(100vh - ${bottom + 16}px)` }}
        className="absolute w-[348px] overflow-y-auto rounded-lg border border-zinc-700 bg-nv-side shadow-2xl animate-fade-in outline-none text-zinc-300"
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700/70">
          <Sparkles size={14} className="text-indigo-300 shrink-0" />
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[12.5px] font-medium text-zinc-100 truncate">{t('grpAiCompletion')}</div>
            <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-400" title={t('cmModel').replace('{m}', 'qwen2.5-coder:7b')}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />
              <span className="truncate">{statusText}</span>
            </div>
          </div>
          <Switch on={enabled} onChange={(v) => set('aiCompletion', v)} label={t('set_aiCompletion')} />
        </div>

        <div className={`py-1 ${enabled ? '' : 'opacity-50 pointer-events-none'}`}>
          {language && (
            <Row label={t('cmThisLang').replace('{l}', language)}>
              <Switch on={langOn} onChange={toggleLang} label={t('cmThisLang').replace('{l}', language)} />
            </Row>
          )}
          <Row label={t('set_aiCompletionTrigger')}>
            <Segmented
              label={t('set_aiCompletionTrigger')}
              value={values.aiCompletionTrigger === 'manual' ? 'manual' : 'auto'}
              options={[{ value: 'auto', label: short(t('optCompAuto')) }, { value: 'manual', label: short(t('optCompManual')) }]}
              onChange={(v) => set('aiCompletionTrigger', v)}
            />
          </Row>
          <Row label={t('set_aiCompletionEffort')}>
            <Segmented
              label={t('set_aiCompletionEffort')}
              value={effort}
              options={[{ value: 'fast', label: t('optThinkFast') }, { value: 'balanced', label: t('optThinkBalanced') }, { value: 'deep', label: t('optThinkDeep') }]}
              onChange={(v) => applyEffort(v as 'fast' | 'balanced' | 'deep')}
            />
          </Row>
          <Row label={t('set_aiCompletionLength')}>
            <Segmented
              label={t('set_aiCompletionLength')}
              value={['line', 'long'].includes(String(values.aiCompletionLength)) ? String(values.aiCompletionLength) : 'block'}
              options={[{ value: 'line', label: short(t('optLenLine')) }, { value: 'block', label: short(t('optLenBlock')) }, { value: 'long', label: short(t('optLenLong')) }]}
              onChange={(v) => set('aiCompletionLength', v)}
            />
          </Row>
          <Range id="aiCompletionDelay" min={200} max={1500} step={50} value={num('aiCompletionDelay', 450)} set={set} label={t('set_aiCompletionDelay')} fmt={(n) => `${n} ms`} />

          <button onClick={() => setAdv((v) => !v)} aria-expanded={adv} className="w-full flex items-center gap-1 px-3 h-6 text-[11px] text-zinc-500 hover:text-zinc-200">
            <ChevronRight size={12} className={`transition-transform ${adv ? 'rotate-90' : ''}`} />
            {t('cmAdvanced')}
          </button>
          {adv && (
            <div className="pb-1">
              <Range id="aiCompletionMaxTokens" min={16} max={256} step={8} value={num('aiCompletionMaxTokens', 80)} set={set} label={t('set_aiCompletionMaxTokens')} />
              <Range id="aiCompletionPrefix" min={500} max={12000} step={500} value={num('aiCompletionPrefix', 6000)} set={set} label={t('set_aiCompletionPrefix')} />
              <Range id="aiCompletionSuffix" min={0} max={4000} step={250} value={num('aiCompletionSuffix', 2000)} set={set} label={t('set_aiCompletionSuffix')} />
              <Range id="aiCompletionTemperature" min={0} max={1} step={0.05} value={num('aiCompletionTemperature', 0.1)} set={set} label={t('set_aiCompletionTemperature')} fmt={(n) => n.toFixed(2)} />
              <Range id="aiCompletionCount" min={1} max={3} step={1} value={num('aiCompletionCount', 1)} set={set} label={t('set_aiCompletionCount')} />
              <Row label={t('set_aiCompletionToolbar')}>
                <Switch on={values.aiCompletionToolbar !== false} onChange={(v) => set('aiCompletionToolbar', v)} label={t('set_aiCompletionToolbar')} />
              </Row>
            </div>
          )}
        </div>

        <div className="flex border-t border-zinc-700/70">
          <button
            disabled={!enabled}
            onClick={() => { onClose(); window.setTimeout(() => runEditorAction('editor.action.inlineSuggest.trigger'), 60); }}
            className="flex-1 min-w-0 flex items-center gap-1.5 px-3 h-7 text-left text-[11.5px] hover:bg-nv-hover disabled:opacity-40"
          >
            <Wand2 size={13} className="text-zinc-500 shrink-0" />
            <span className="truncate">{t('cmNow')}</span>
          </button>
          <button onClick={() => { onClose(); onOpenSettings(); }} className="flex items-center gap-1.5 px-3 h-7 text-[11.5px] hover:bg-nv-hover border-l border-zinc-700/70">
            <Settings2 size={13} className="text-zinc-500 shrink-0" />
            <span className="truncate">{t('cmAllSettings')}</span>
          </button>
        </div>
        <div className="px-3 py-1 border-t border-zinc-700/70 text-[10px] leading-snug text-zinc-500" title={t('cmShortcuts')}>{t('cmShortcuts')}</div>
      </div>
    </div>
  );
};
