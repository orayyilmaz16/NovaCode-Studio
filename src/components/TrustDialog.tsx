import React, { useEffect } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextTheme'; // güven ve rıza metinleri (gecikmeli yüklenen ek sözlük)
import { closeTrustPrompt, grantTrust, openTrustPrompt, useTrust } from '../services/trustService';

const tx = (k: string) => t(k as Parameters<typeof t>[0]);

// Klasör açılınca güven penceresi: "Güven" ya da "Kısıtlı modda aç". Kısıtlı mod ana pencerede rozetle görünür.
export const TrustDialog: React.FC = () => {
  const { root, trusted, prompt } = useTrust();
  const open = prompt && !trusted;

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTrustPrompt(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open]);

  if (!open) return null;
  const name = root.split(/[\\/]/).filter(Boolean).pop() || root;
  const btn = 'h-8 px-3 rounded-md text-[12.5px] flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors';
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 px-4">
      <div role="alertdialog" aria-modal="true" aria-label={tx('trTitle')} className="animate-menu w-[min(520px,94vw)] max-h-[82vh] flex flex-col rounded-xl border border-nv-border bg-nv-side overflow-hidden">
        <div className="flex items-start gap-3 p-4 min-h-0 overflow-y-auto">
          <div className="w-10 h-10 rounded-xl bg-nv-active flex items-center justify-center shrink-0"><ShieldAlert size={20} className="text-amber-300" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-medium text-zinc-100">{tx('trTitle')}</h2>
            <p className="mt-1 text-[12.5px] font-mono text-zinc-300 break-all" title={root}>{name}</p>
            <p className="mt-2 text-[12.5px] text-zinc-400 leading-relaxed">{tx('trBody')}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 px-4 py-3 border-t border-nv-border shrink-0">
          <button className={`${btn} bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200`} onClick={closeTrustPrompt}>{tx('trRestrictedBtn')}</button>
          <button className={`${btn} bg-indigo-600 hover:bg-indigo-500 text-white`} onClick={() => void grantTrust()} autoFocus><ShieldCheck size={14} />{tx('trTrust')}</button>
        </div>
      </div>
    </div>
  );
};

// Durum çubuğu rozeti: yalnız kısıtlı modda görünür; tıklayınca güven penceresi açılır.
export const TrustBadge: React.FC = () => {
  const { root, trusted } = useTrust();
  if (!root || trusted) return null;
  return (
    <button className="status-item text-amber-300" onClick={openTrustPrompt} title={tx('trBadgeTip')} aria-label={tx('trBadgeTip')}>
      <ShieldAlert size={12} />
      <span>{tx('trBadge')}</span>
    </button>
  );
};
