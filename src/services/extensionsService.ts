// Eklenti mağazası istemcisi: yüklü eklenti deposu, Monaco tema dönüştürücü, snippet katkısı.
// Kapsam: VS Code temaları ve snippet'leri. Kod çalıştıran eklentiler (eklenti sunucusu) desteklenmez.
import { useSyncExternalStore } from 'react';
import { setExtensionSnippets } from './snippetProvider';
import type { Snippet } from '../types';

export interface ExtTheme {
  label: string;
  uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  colors: Record<string, string>;
  tokenColors: { scope: string[]; foreground?: string; fontStyle?: string }[];
}

export interface InstalledExt {
  id: string;
  namespace: string;
  name: string;
  version: string;
  displayName: string;
  description: string;
  icon: string;
  installedAt: number;
  themes: ExtTheme[];
  snippets: { language: string; items: { name: string; prefix: string; body: string; description: string }[] }[];
  partial?: boolean;
}

export interface StoreItem {
  id: string;
  namespace: string;
  name: string;
  version: string;
  displayName: string;
  description: string;
  icon: string;
  downloads: number;
  rating: number | null;
}

type State = { installed: InstalledExt[]; loaded: boolean; updates: Record<string, string>; busy: string[]; checking: boolean };
let state: State = { installed: [], loaded: false, updates: {}, busy: [], checking: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  syncDerived();
  emit();
};

let monacoRef: { editor: { defineTheme: (n: string, d: unknown) => void } } | null = null;
// Monaco tema adı yalnız [a-z0-9-] kabul eder (aksi halde 'Illegal theme name!' atar)
export const extThemeName = (extId: string, label: string) => `ext-${`${extId}-${label}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;

// ---------- VS Code teması → Monaco teması ----------
const SCOPE_MAP: [string, string[]][] = [
  ['comment', ['comment']],
  ['string.regexp', ['regexp']],
  ['string', ['string']],
  ['constant.numeric', ['number']],
  ['constant', ['constant']],
  ['keyword.operator', ['operator']],
  ['keyword', ['keyword']],
  ['storage', ['keyword']],
  ['entity.name.type', ['type', 'type.identifier']],
  ['entity.name.class', ['type', 'type.identifier']],
  ['support.class', ['type', 'type.identifier']],
  ['support.type', ['type', 'type.identifier']],
  ['entity.name.function', ['function']],
  ['support.function', ['function']],
  ['variable', ['variable']],
  ['punctuation', ['delimiter']],
  ['entity.name.tag', ['tag']],
  ['entity.other.attribute-name', ['attribute.name']],
  ['invalid', ['invalid']]
];

const hex6 = (c: string) => {
  const h = c.replace('#', '');
  if (h.length === 3 || h.length === 4) return h.slice(0, 3).split('').map((x) => x + x).join('');
  return h.slice(0, 6);
};

export function convertTheme(t: ExtTheme) {
  const rules: { token: string; foreground?: string; fontStyle?: string }[] = [];
  const byToken = new Map<string, { token: string; foreground?: string; fontStyle?: string }>();
  for (const tc of t.tokenColors) {
    for (const scope of tc.scope) {
      const hit = SCOPE_MAP.find(([p]) => scope === p || scope.startsWith(p + '.'));
      if (!hit) continue;
      for (const token of hit[1]) {
        byToken.set(token, { token, ...(tc.foreground ? { foreground: hex6(tc.foreground) } : {}), ...(tc.fontStyle ? { fontStyle: tc.fontStyle } : {}) });
      }
    }
  }
  rules.push(...byToken.values());
  const base = t.uiTheme === 'hc-light' ? 'hc-light' : t.uiTheme;
  return { base, inherit: true, rules, colors: t.colors };
}

function defineAll() {
  if (!monacoRef) return;
  for (const ext of state.installed) {
    for (const th of ext.themes) {
      try { monacoRef.editor.defineTheme(extThemeName(ext.id, th.label), convertTheme(th)); } catch (err) { console.warn('Eklenti teması tanımlanamadı:', ext.id, th.label, err); }
    }
  }
}

export function setMonacoForExtensions(monaco: unknown) {
  monacoRef = monaco as typeof monacoRef;
  defineAll();
}

function syncDerived() {
  defineAll();
  const list: Snippet[] = [];
  for (const ext of state.installed) {
    ext.snippets.forEach((g, gi) =>
      g.items.forEach((it, ii) =>
        list.push({ id: `ext-${ext.id}-${gi}-${ii}`, label: it.name, prefix: it.prefix, description: it.description || ext.displayName, language: g.language, body: it.body })
      )
    );
  }
  setExtensionSnippets(list);
}

// ---------- Eylemler ----------
export async function refreshInstalled() {
  const api = window.electronAPI?.ext;
  if (!api) return set({ loaded: true });
  try {
    set({ installed: await api.list(), loaded: true });
  } catch {
    set({ loaded: true });
  }
}

export async function checkUpdates() {
  const api = window.electronAPI?.ext;
  if (!api || state.checking) return;
  set({ checking: true });
  try {
    const ups = await api.checkUpdates();
    set({ updates: Object.fromEntries(ups.map((u) => [u.id, u.latest])), checking: false });
  } catch {
    set({ checking: false });
  }
}

export async function installExt(item: { namespace: string; name: string; id: string }): Promise<{ success: boolean; error?: string; partial?: boolean }> {
  const api = window.electronAPI?.ext;
  if (!api || state.busy.includes(item.id)) return { success: false, error: 'failed' };
  set({ busy: [...state.busy, item.id] });
  try {
    const res = await api.install(item.namespace, item.name);
    await refreshInstalled();
    if (res.success) { const { [item.id]: _gone, ...rest } = state.updates; void _gone; set({ updates: rest }); }
    return res;
  } catch {
    return { success: false, error: 'failed' };
  } finally {
    set({ busy: state.busy.filter((b) => b !== item.id) });
  }
}

export async function uninstallExt(id: string) {
  await window.electronAPI?.ext.uninstall(id);
  await refreshInstalled();
}

let started = false;
export function useExtensions() {
  if (!started) {
    started = true;
    queueMicrotask(() => void refreshInstalled());
  }
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state
  );
}
