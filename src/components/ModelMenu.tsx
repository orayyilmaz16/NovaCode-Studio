import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Cpu } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextAi'; // AI metinleri (gecikmeli yüklenen ek sözlük)

// Sohbet/Ajan modeli (yerel Ollama'da kurulu modeller) ve dikte modeli (kurulu Whisper dosyaları) seçici.
// Seçim panelden yapılır; Ayarlar'da model seçimi yoktur. Liste yalnız bu bilgisayarda kurulu modellerden gelir.
interface Props {
  mode: 'ask' | 'agent';
  model: string;
  onModel: (m: string) => void;
  ollama: { running: boolean; models: string[] } | null;
  whisper: { id: string; size: number }[];
  dictModel: string;
  onDictModel: (m: string) => void;
  disabled?: boolean;
  onRefresh: () => void;
}

const mb = (n: number) => (n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(1)} GB` : `${Math.round(n / 1024 ** 2)} MB`);
// Boyut ipucu: küçük (≤1.5B / tiny-base-small) "Hızlı", büyük "Güçlü"
const ollamaTier = (name: string) => { const m = /:(\d+(?:\.\d+)?)b/i.exec(name); return m && Number(m[1]) <= 1.5 ? 'aiTierFast' : 'aiTierStrong'; };
const whisperTier = (id: string) => (/tiny|base|small/i.test(id) && !/medium|large/i.test(id) ? 'aiTierFast' : 'aiTierStrong');
const whisperLabel = (id: string) => id.replace(/^ggml-/, '').replace(/\.bin$/, '');

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-wide text-zinc-500">{children}</div>
);

const Row: React.FC<{ active: boolean; label: string; hint: string; onClick: () => void }> = ({ active, label, hint, onClick }) => (
  <button type="button" role="menuitemradio" aria-checked={active} onClick={onClick}
    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-start motion-press ${active ? 'bg-nv-active text-zinc-50' : 'text-zinc-300 hover:bg-nv-hover'}`}>
    <span className="w-3.5 shrink-0">{active && <Check size={13} className="text-indigo-300" />}</span>
    <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{label}</span>
    <span className="shrink-0 text-[10.5px] text-zinc-500">{hint}</span>
  </button>
);

export const ModelMenu: React.FC<Props> = ({ mode, model, onModel, ollama, whisper, dictModel, onDictModel, disabled, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    onRefresh(); // menü açılınca kurulu modelleri yeniden oku (yeni indirilen görünsün)
    const down = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const models = ollama?.models ?? [];
  const list = models.includes(model) ? models : [model, ...models]; // seçili model kurulu değilse de görünür (uyarı panelde)
  return (
    <div ref={box} className="min-w-0 flex-1">
      <button type="button" onClick={() => setOpen((v) => !v)} disabled={disabled} aria-haspopup="dialog" aria-expanded={open}
        title={t('aiModelPick')} aria-label={t('aiModelPick')}
        className={`max-w-full h-7 px-1.5 rounded-md flex items-center gap-1 text-[10.5px] motion-press disabled:opacity-40 ${open ? 'bg-nv-hover text-zinc-100' : 'text-zinc-500 hover:text-zinc-200 hover:bg-nv-hover'}`}>
        <Cpu size={12} className="shrink-0" />
        <span className="truncate">{model}</span>
        <ChevronDown size={11} className="shrink-0" />
      </button>
      {open && (
        <div role="dialog" aria-label={t('aiModelPick')} className="animate-menu absolute bottom-full inset-x-0 mb-1.5 z-30 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-zinc-700/80 bg-zinc-900 p-1.5">
          <Section>{t(mode === 'agent' ? 'aiModelSecAgent' : 'aiModelSecAsk')}</Section>
          {ollama && (!ollama.running || !models.length) ? (
            <p className="px-2 py-1.5 text-[11px] leading-snug text-amber-300/90">{ollama.running ? t('aiModelNone') : t('aiOllamaDown')}</p>
          ) : list.map((m) => (
            <Row key={m} active={m === model} label={m} hint={models.includes(m) ? t(ollamaTier(m)) : ''} onClick={() => { onModel(m); setOpen(false); }} />
          ))}
          {ollama?.running && !models.includes(model) && <p className="px-2 pb-1 text-[10.5px] leading-snug text-amber-300/90 font-mono">{t('aiModelPull').split('{m}').join(model)}</p>}
          <div className="mt-1 border-t border-zinc-800" />
          <Section>{t('aiModelSecVoice')}</Section>
          {whisper.length === 0 ? (
            <p className="px-2 py-1.5 text-[11px] leading-snug text-zinc-500">{t('aiModelNone')}</p>
          ) : whisper.map((w) => (
            <Row key={w.id} active={w.id === dictModel} label={whisperLabel(w.id)} hint={`${t(whisperTier(w.id))} · ${mb(w.size)}`} onClick={() => onDictModel(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
};
