import { useSyncExternalStore } from 'react';

// Dil sunucusu durumu (dil kimliğine göre). Durum çubuğu ve istemci buradan okur/yazar.
export interface LspEntry {
  name: string;
  state: 'starting' | 'ready' | 'error' | 'missing';
  /** Sunucu kurulu değilse kurulum ipucu (ör. "npm install -g pyright"). */
  hint?: string;
}

let byLang: Record<string, LspEntry> = {};
const listeners = new Set<() => void>();
const emitChange = () => listeners.forEach((l) => l());

export const getLsp = () => byLang;
export const subscribeLsp = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useLsp = () => useSyncExternalStore(subscribeLsp, getLsp, getLsp);

export function setLspEntry(lang: string, entry: LspEntry) {
  const cur = byLang[lang];
  if (cur && cur.name === entry.name && cur.state === entry.state && cur.hint === entry.hint) return;
  byLang = { ...byLang, [lang]: entry };
  emitChange();
}

/** Sunucu adına göre durum güncellemesi (aynı sunucu birden çok dili kapsayabilir, ör. clangd → c/cpp). */
export function setLspStateByName(name: string, state: LspEntry['state']) {
  let changed = false;
  const next: Record<string, LspEntry> = {};
  for (const [lang, e] of Object.entries(byLang)) {
    if (e.name === name && e.state !== state) { next[lang] = { ...e, state }; changed = true; } else next[lang] = e;
  }
  if (changed) { byLang = next; emitChange(); }
}
