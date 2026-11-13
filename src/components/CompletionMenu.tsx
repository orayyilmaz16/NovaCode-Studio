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

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-400';
// Tüm kontroller aynı sağ sütunu (CTRL_W) paylaşır: kenarlar hizalı kalır.
const CTRL_W = 'w-[176px]';

const Switch: React.FC<{ on: boolean; onChange: (v: boolean) => void; label: string }> = ({ on, onChange, label }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`flex items-center box-border w-8 h-[18px] p-[2px] rounded-full transition-colors shrink-0 cursor-pointer ${FOCUS} ${on ? 'justify-end bg-indigo-600' : 'justify-start bg-zinc-600'}`}>
    <span className="block w-[14px] h-[14px] rounded-full bg-white shadow-sm shrink-0" />
  </button>
);

const Segmented: React.FC<{ value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; label: string }> = ({ value, options, onChange, label }) => (
  <div role="radiogroup" aria-label={label} className={`grid grid-flow-col auto-cols-fr ${CTRL_W} rounded-md bg-nv-input border border-nv-border p-0.5 gap-0.5`}>
    {options.map((o) => (
      <button
        key={o.value}
        role="radio"
        aria-checked={value === o.value}
        onClick={() => onChange(o.value)}
        className={`h-5 px-1.5 rounded text-[11px] font-medium truncate cursor-pointer transition-colors ${FOCUS} ${value === o.value ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// Tek satır: solda etiket, sağda sabit genişlikli kontrol sütunu
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-3 px-3.5 h-8">
    <span className="text-xs text-zinc-300 flex-1 min-w-0 truncate" title={label}>{label}</span>
    <div className={`${CTRL_W} flex justify-end shrink-0`}>{children}</div>
  </div>
);

const Range: React.FC<{ id: string; min: number; max: number; step: number; value: number; set: (id: string, v: number) => void; label: string; fmt?: (n: number) => string }> = ({ id, min, max, step, value, set, label, fmt }) => (
  <div className="flex items-center gap-3 px-3.5 h-8">
    <span className="text-xs text-zinc-300 flex-1 min-w-0 truncate" title={label}>{label}</span>
    <div className={`${CTRL_W} flex items-center gap-2 shrink-0`}>
      <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => set(id, Number(e.target.value))} className={`flex-1 min-w-0 accent-indigo-500 h-1 cursor-pointer ${FOCUS}`} />
      <span className="w-[44px] text-right font-mono tabular-nums text-[11px] text-zinc-400 shrink-0">{fmt ? fmt(value) : value}</span>
    </div>
  </div>
);

const Divider: React.FC = () => <div className="h-px bg-nv-border mx-3.5 my-1" />;

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

  const left = Math.max(8, Math.min(anchor.x - 200, window.innerWidth - 408));
  const bottom = Math.max(8, window.innerHeight - anchor.y + 6);

  const [adv, setAdv] = useState(false);
  const short = (x: string) => x.split(' (')[0].split(' ')[0];

  return (
    <div className="fixed inset-0 z-[70] app-no-drag" onMouseDown={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-label={t('set_aiCompletion')}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ left, bottom, maxHeight: `calc(100vh - ${bottom + 16}px)` }}
        className="absolute w-[400px] max-w-[calc(100vw-16px)] overflow-y-auto overflow-x-hidden rounded-[var(--frame-r)] border border-nv-border bg-nv-side shadow-xl animate-fade-in outline-none text-zinc-300"
      >
        <div className="flex items-center gap-3 px-3.5 py-3 border-b border-nv-border">
          <span className="w-8 h-8 rounded-md bg-nv-active flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-indigo-300" />
          </span>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[13px] font-semibold text-zinc-100 truncate">{t('grpAiCompletion')}</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-400" title={t('cmModel').replace('{m}', 'qwen2.5-coder:7b')}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />
              <span className="truncate">{statusText}</span>
            </div>
          </div>
          <Switch on={enabled} onChange={(v) => set('aiCompletion', v)} label={t('set_aiCompletion')} />
        </div>

        <div className={`py-1.5 ${enabled ? '' : 'opacity-50 pointer-events-none'}`}>
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
          <Divider />
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

          <Divider />
          <button onClick={() => setAdv((v) => !v)} aria-expanded={adv} className={`w-full flex items-center gap-1.5 px-3.5 h-8 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover cursor-pointer ${FOCUS}`}>
            <ChevronRight size={13} className={`transition-transform ${adv ? 'rotate-90' : ''}`} />
            {t('cmAdvanced')}
          </button>
          {adv && (
            <div className="pb-1 animate-fade-in">
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

        <div className="flex border-t border-nv-border">
          <button
            disabled={!enabled}
            onClick={() => { onClose(); window.setTimeout(() => runEditorAction('editor.action.inlineSuggest.trigger'), 60); }}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 h-9 text-xs text-zinc-200 hover:bg-nv-hover disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer ${FOCUS}`}
          >
            <Wand2 size={14} className="text-indigo-300 shrink-0" />
            <span className="truncate">{t('cmNow')}</span>
          </button>
          <button onClick={() => { onClose(); onOpenSettings(); }} className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 h-9 text-xs text-zinc-200 hover:bg-nv-hover border-l border-nv-border cursor-pointer ${FOCUS}`}>
            <Settings2 size={14} className="text-zinc-400 shrink-0" />
            <span className="truncate">{t('cmAllSettings')}</span>
          </button>
        </div>
        <div className="px-3.5 py-2 border-t border-nv-border text-[10.5px] leading-snug text-zinc-500 break-words [overflow-wrap:anywhere]" title={t('cmShortcuts')}>{t('cmShortcuts')}</div>
      </div>
    </div>
  );
};
