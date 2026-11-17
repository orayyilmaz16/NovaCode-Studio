// Çalışma klasörü güveni (renderer tarafı). Karar ve depo ana süreçtedir (electron-trust.cjs); burada yalnız durum ve pencere bayrağı tutulur.
// Web sürümünde güven kavramı yoktur: her zaman güvenilir sayılır.
import { useSyncExternalStore } from 'react';

interface TrustState {
  root: string;
  trusted: boolean;
  /** Güven penceresi açık mı. */
  prompt: boolean;
}

let state: TrustState = { root: '', trusted: true, prompt: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<TrustState>) => { state = { ...state, ...patch }; emit(); };

let wired = false;
function wire() {
  if (wired) return;
  wired = true;
  // Ajan onayı ya da ayarlardan geri alma gibi başka yerlerde değişen güveni yansıt.
  window.electronAPI?.trust?.onChange((s) => {
    if (s.root === state.root || !state.root) set({ root: s.root, trusted: s.trusted, prompt: s.trusted ? false : state.prompt });
  });
}

/** Klasör açıldığında çağrılır: güvenilmiyorsa pencere açılır ("Kısıtlı modda aç" seçilirse kısıtlı kalır). */
export function trustOnOpen(root: string, trusted: boolean | undefined) {
  wire();
  const ok = trusted !== false; // alan yoksa (web / eski ana süreç) güvenilir
  set({ root, trusted: ok, prompt: !ok });
}

export function openTrustPrompt() { set({ prompt: true }); }
export function closeTrustPrompt() { set({ prompt: false }); }

export async function grantTrust(): Promise<boolean> {
  const r = await window.electronAPI?.trust?.grant();
  const ok = !!r?.trusted;
  set({ trusted: ok || state.trusted, prompt: false });
  return ok;
}

export function useTrust(): TrustState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state
  );
}
