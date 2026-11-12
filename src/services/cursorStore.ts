import { useSyncExternalStore } from 'react';

// İmleç konumu (satır, sütun, seçili karakter sayısı): durum çubuğu buradan okur, EditorArea yazar.
export interface CursorPos { line: number; col: number; selected: number }
let pos: CursorPos | null = null;
const listeners = new Set<() => void>();

export const setCursor = (p: CursorPos | null) => {
  if (pos === p) return;
  if (pos && p && pos.line === p.line && pos.col === p.col && pos.selected === p.selected) return;
  pos = p;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useCursor = () => useSyncExternalStore(subscribe, () => pos, () => pos);
