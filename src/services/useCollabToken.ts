import { useSyncExternalStore } from 'react';

// Ortak düzenleme sunucu token'ı: diskte yalnız ana süreçte şifreli saklanır (electron-secrets.cjs).
// Renderer bellekte tutar; şifreli depo yoksa yalnız bu oturumda geçerlidir.
type State = { token: string; loaded: boolean; encrypted: boolean };
let state: State = { token: '', loaded: false, encrypted: true };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

let started = false;
async function load() {
  if (started) return;
  started = true;
  const api = window.electronAPI?.secrets;
  if (!api) return set({ loaded: true });
  try {
    const res = await api.get('collabToken');
    let token = 'value' in res ? res.value : '';
    // Eski sürümden taşıma: düz metin localStorage token'ı şifreli depoya alınır ve silinir
    try {
      const legacy = window.localStorage.getItem('nova.collab.token');
      if (legacy) {
        if (!token) {
          const saved = await api.set('collabToken', legacy);
          if (saved.success) token = legacy;
        }
        window.localStorage.removeItem('nova.collab.token');
      }
    } catch {
      /* depolama kapalı */
    }
    set({ token, loaded: true });
  } catch {
    set({ loaded: true });
  }
}

export async function saveCollabToken(value: string): Promise<{ encrypted: boolean }> {
  const api = window.electronAPI?.secrets;
  let encrypted = false;
  if (api) {
    try {
      const res = await api.set('collabToken', value);
      encrypted = res.success;
    } catch {
      encrypted = false;
    }
  }
  set({ token: value, encrypted: encrypted || value === '' });
  return { encrypted: encrypted || value === '' };
}

export function useCollabToken() {
  void load();
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
  return snap;
}
