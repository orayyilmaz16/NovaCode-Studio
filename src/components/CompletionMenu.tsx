import React, { useEffect, useRef } from 'react';
import { Sparkles, Settings2, Wand2 } from 'lucide-react';
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
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${on ? 'bg-indigo-500' : 'bg-zinc-600'}`}>
    <span className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${on ? 'translate-x-[14px]' : ''}`} />
  </button>
);

const Segmented: React.FC<{ value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; label: string }> = ({ value, options, onChange, label }) => (
  <div role="radiogroup" aria-label={label} className="flex rounded bg-nv-editor border border-zinc-700/70 p-0.5 gap-0.5">
    {options.map((o) => (
      <button
        key={o.value}
        role="radio"
        aria-checked={value === o.value}
        onClick={() => onChange(o.value)}
        className={`flex-1 px-2 h-6 rounded text-[11px] truncate transition-colors ${value === o.value ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="px-3 py-1.5">
    <div className="text-[11px] text-zinc-400 mb-1">{label}</div>
    {children}
  </div>
);

const Range: React.FC<{ id: string; min: number; max: number; step: number; value: number; set: (id: string, v: number) => void; label: string; fmt?: (n: number) => string }> = ({ id, min, max, step, value, set, label, fmt }) => (
  <Row label={label}>
    <div className="flex items-center gap-2">
      <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => set(id, Number(e.target.value))} className="flex-1 accent-indigo-500 h-1" />
      <span className="w-12 text-right font-mono text-[11px] text-zinc-300">{fmt ? fmt(value) : value}</span>
    </div>
  </Row>
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

  return (
    <div className="fixed inset-0 z-[200]" onMouseDown={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-label={t('set_aiCompletion')}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ left, bottom, maxHeight: `calc(100vh - ${bottom + 16}px)` }}
        className="absolute w-[340px] overflow-y-auto rounded-lg border border-zinc-700 bg-nv-side shadow-2xl animate-fade-in outline-none text-zinc-300"
      >
        <div className="flex items-center gap-2 px-3 h-10 border-b border-zinc-700/70">
          <Sparkles size={15} className="text-indigo-300" />
          <span className="text-[13px] font-medium text-zinc-100 flex-1 truncate">{t('grpAiCompletion')}</span>
          <Switch on={enabled} onChange={(v) => set('aiCompletion', v)} label={t('set_aiCompletion')} />
        </div>

        <div className="px-3 py-2 text-[11px] border-b border-zinc-700/70">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-zinc-200">{statusText}</span>
          </div>
          <div className="text-zinc-500 mt-0.5">{t('cmModel').replace('{m}', 'qwen2.5-coder:7b')}</div>
        </div>

        <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
          {language && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700/70">
              <span className="text-[12px] flex-1 truncate">{t('cmThisLang').replace('{l}', language)}</span>
              <Switch on={langOn} onChange={toggleLang} label={t('cmThisLang').replace('{l}', language)} />
            </div>
          )}

          <Row label={t('set_aiCompletionTrigger')}>
            <Segmented
              label={t('set_aiCompletionTrigger')}
              value={values.aiCompletionTrigger === 'manual' ? 'manual' : 'auto'}
              options={[{ value: 'auto', label: t('optCompAuto') }, { value: 'manual', label: t('optCompManual') }]}
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
              options={[{ value: 'line', label: t('optLenLine').split(' ')[0] }, { value: 'block', label: t('optLenBlock').split(' (')[0] }, { value: 'long', label: t('optLenLong').split(' (')[0] }]}
              onChange={(v) => set('aiCompletionLength', v)}
            />
          </Row>

          <Range id="aiCompletionDelay" min={200} max={1500} step={50} value={num('aiCompletionDelay', 450)} set={set} label={t('set_aiCompletionDelay')} fmt={(n) => `${n} ms`} />
          <Range id="aiCompletionMaxTokens" min={16} max={256} step={8} value={num('aiCompletionMaxTokens', 80)} set={set} label={t('set_aiCompletionMaxTokens')} />
          <Range id="aiCompletionPrefix" min={500} max={12000} step={500} value={num('aiCompletionPrefix', 6000)} set={set} label={t('set_aiCompletionPrefix')} />
          <Range id="aiCompletionSuffix" min={0} max={4000} step={250} value={num('aiCompletionSuffix', 2000)} set={set} label={t('set_aiCompletionSuffix')} />
          <Range id="aiCompletionTemperature" min={0} max={1} step={0.05} value={num('aiCompletionTemperature', 0.1)} set={set} label={t('set_aiCompletionTemperature')} fmt={(n) => n.toFixed(2)} />
          <Range id="aiCompletionCount" min={1} max={3} step={1} value={num('aiCompletionCount', 1)} set={set} label={t('set_aiCompletionCount')} />

          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-[12px] flex-1 truncate">{t('set_aiCompletionToolbar')}</span>
            <Switch on={values.aiCompletionToolbar !== false} onChange={(v) => set('aiCompletionToolbar', v)} label={t('set_aiCompletionToolbar')} />
          </div>
        </div>

        <div className="border-t border-zinc-700/70 py-1">
          <button
            disabled={!enabled}
            onClick={() => { onClose(); window.setTimeout(() => runEditorAction('editor.action.inlineSuggest.trigger'), 60); }}
            className="w-full flex items-center gap-2 px-3 h-8 text-left text-[12px] hover:bg-nv-hover disabled:opacity-40"
          >
            <Wand2 size={14} className="text-zinc-500" />
            {t('cmNow')}
          </button>
          <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full flex items-center gap-2 px-3 h-8 text-left text-[12px] hover:bg-nv-hover">
            <Settings2 size={14} className="text-zinc-500" />
            {t('cmAllSettings')}
          </button>
        </div>
        <div className="px-3 py-2 border-t border-zinc-700/70 text-[10.5px] leading-relaxed text-zinc-500">{t('cmShortcuts')}</div>
      </div>
    </div>
  );
};
