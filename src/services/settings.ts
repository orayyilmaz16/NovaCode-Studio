// Ayarlar çekirdeği: şema, varsayılanlar, doğrulama, kalıcılık (yalnız yerel) ve türetilmiş değerler.
// Şema tek kaynaktır: settingsSchema.json. Yeni ayar = şemaya satır + i18n etiketi (bkz. docs/brain/actions/settings.md).
import schemaJson from './settingsSchema.json';
import type { Snippet } from '../types';

export type SettingValue = string | number | boolean;
export type SettingsValues = Record<string, SettingValue>;

export interface SettingOption {
  value: string | number;
  labelKey?: string;
  label?: string;
}
export interface SettingDef {
  id: string;
  category: string;
  type: 'toggle' | 'select' | 'slider' | 'text' | 'accent';
  default: SettingValue;
  options?: SettingOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  maxLength?: number;
  placeholder?: string;
  desc?: boolean;
  /** Ayarlar sayfasında satır olarak gösterilmez (başka bir arayüz yönetir, ör. eklenti teması). */
  hidden?: boolean;
  showWhen?: { id: string; equals: SettingValue };
}
export interface CategoryDef {
  id: string;
  labelKey: string;
  icon: string;
}

export const CATEGORIES = schemaJson.categories as CategoryDef[];
export const SCHEMA = schemaJson.settings as SettingDef[];
const BY_ID = new Map(SCHEMA.map((s) => [s.id, s]));

export const DEFAULTS: SettingsValues = Object.fromEntries(SCHEMA.map((s) => [s.id, s.default]));

export const STORAGE_KEY = 'nova.settings.v1';
const MAX_SNIPPETS = 200;

// ---------- Doğrulama ----------
export function sanitizeValue(def: SettingDef, raw: unknown): SettingValue {
  switch (def.type) {
    case 'toggle':
      return typeof raw === 'boolean' ? raw : def.default;
    case 'slider': {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) return def.default;
      const min = def.min ?? -Infinity;
      const max = def.max ?? Infinity;
      return Math.min(max, Math.max(min, n));
    }
    case 'text':
      return typeof raw === 'string' ? raw.slice(0, def.maxLength ?? 200) : def.default;
    case 'select':
    case 'accent': {
      const hit = def.options?.find((o) => String(o.value) === String(raw));
      return hit ? hit.value : def.default; // tür (sayı/metin) seçeneğin kendisinden gelir
    }
  }
}

export function sanitizeAll(raw: unknown): SettingsValues {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out: SettingsValues = {};
  for (const def of SCHEMA) out[def.id] = def.id in src ? sanitizeValue(def, src[def.id]) : def.default;
  return out;
}

export function sanitizeSnippets(raw: unknown): Snippet[] {
  if (!Array.isArray(raw)) return [];
  const out: Snippet[] = [];
  for (const r of raw.slice(0, MAX_SNIPPETS)) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const prefix = typeof o.prefix === 'string' ? o.prefix.trim().slice(0, 40) : '';
    const body = typeof o.body === 'string' ? o.body.slice(0, 20000) : '';
    if (!prefix || !body || /\s/.test(prefix)) continue;
    const description = typeof o.description === 'string' ? o.description.slice(0, 120) : '';
    out.push({
      id: typeof o.id === 'string' && o.id ? o.id.slice(0, 60) : `u-${out.length}-${prefix}`,
      label: description || prefix,
      prefix,
      description,
      language: typeof o.language === 'string' && /^[\w*-]{1,30}$/.test(o.language) ? o.language : '*',
      body
    });
  }
  return out;
}

export interface StoredSettings {
  values: SettingsValues;
  userSnippets: Snippet[];
}

// ---------- Kalıcılık (yalnız bu cihazda, localStorage) ----------
export function loadSettings(): StoredSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const j = JSON.parse(raw);
      return { values: sanitizeAll(j.values), userSnippets: sanitizeSnippets(j.userSnippets) };
    }
    // İlk açılış: eski anahtarlardan taşı (token hariç; o ayrıca şifreli depoya taşınır)
    const legacy: Record<string, unknown> = {};
    const lsGet = (k: string) => window.localStorage.getItem(k);
    if (lsGet('nova.collab.enabled') !== null) legacy.collabEnabled = lsGet('nova.collab.enabled') === '1';
    if (lsGet('nova.collab.url') !== null) legacy.collabUrl = lsGet('nova.collab.url');
    if (lsGet('nova.welcome') !== null) legacy.welcomeOnStartup = lsGet('nova.welcome') !== '0';
    return { values: sanitizeAll(legacy), userSnippets: [] };
  } catch {
    return { values: { ...DEFAULTS }, userSnippets: [] };
  }
}

export function saveSettings(s: StoredSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, values: s.values, userSnippets: s.userSnippets }));
  } catch {
    /* depolama kapalı: ayarlar bu oturumda kalır */
  }
}

export function parseImport(text: string): StoredSettings | null {
  try {
    const j = JSON.parse(text);
    if (!j || typeof j !== 'object' || !('values' in j)) return null;
    return { values: sanitizeAll(j.values), userSnippets: sanitizeSnippets(j.userSnippets) };
  } catch {
    return null;
  }
}

export function getDef(id: string): SettingDef | undefined {
  return BY_ID.get(id);
}

export function isVisible(def: SettingDef, values: SettingsValues): boolean {
  return !def.showWhen || values[def.showWhen.id] === def.showWhen.equals;
}

// ---------- Türetilmiş değerler ----------
export type ResolvedMode = 'dark' | 'light';

export function resolveMode(mode: SettingValue, prefersDark: boolean): ResolvedMode {
  if (mode === 'light') return 'light';
  if (mode === 'system') return prefersDark ? 'dark' : 'light';
  return 'dark';
}

export function resolveEditorTheme(editorTheme: SettingValue, mode: ResolvedMode): string {
  if (editorTheme === 'auto') return mode === 'light' ? 'nova-light' : 'nova-dark';
  return String(editorTheme);
}

// Vurgu rengi tabloları: [200, 300, 400, 500, 600, 700] tonları (koyu/açık zemin için ayrı)
export const ACCENTS: Record<string, { dark: string[]; light: string[]; swatch: string }> = {
  indigo: {
    swatch: '#6d75f5',
    dark: ['#d2d5ff', '#aeb4ff', '#8b93ff', '#6d75f5', '#5359e0', '#4146b8'],
    light: ['#2b2f8f', '#3a3fb0', '#4a50d0', '#5359e0', '#4146b8', '#33378f']
  },
  blue: {
    swatch: '#2f9bf0',
    dark: ['#cfe8ff', '#9fd0ff', '#6cb6ff', '#2f9bf0', '#0e72c9', '#0a5aa3'],
    light: ['#0a3f73', '#0b5aa8', '#0e72c9', '#1f84dc', '#0e72c9', '#0a5aa3']
  },
  teal: {
    swatch: '#2bb5a8',
    dark: ['#c5f3ee', '#8ee6dc', '#4fd1c5', '#2bb5a8', '#0f9488', '#0b7a70'],
    light: ['#08524c', '#0a6a62', '#0d8277', '#119a8e', '#0d8277', '#0a6a62']
  },
  green: {
    swatch: '#34b85e',
    dark: ['#d1f7d9', '#9be8ac', '#5fd47e', '#34b85e', '#1f9d4a', '#177a3a'],
    light: ['#0f5a29', '#157a36', '#17883d', '#1f9d4a', '#17883d', '#127032']
  },
  orange: {
    swatch: '#f08a1f',
    dark: ['#ffe2c2', '#ffc78a', '#ffa94d', '#f08a1f', '#d9730d', '#b05a08'],
    light: ['#7a3a05', '#984a08', '#b05a08', '#c26709', '#b05a08', '#8f4806']
  },
  pink: {
    swatch: '#ec4899',
    dark: ['#ffd3e8', '#ffa8d1', '#ff7ab8', '#ec4899', '#d12c80', '#a8206a'],
    light: ['#7d1650', '#a01f68', '#be2178', '#d12c80', '#be2178', '#9a1c65']
  }
};
export const ACCENT_VARS = ['200', '300', '400', '500', '600', '700'] as const;

export const UI_FONTS: Record<string, string> = {
  system: '"Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  segoe: '"Segoe UI", system-ui, sans-serif',
  arial: 'Arial, "Helvetica Neue", sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  tahoma: 'Tahoma, Geneva, sans-serif',
  mono: '"Cascadia Code", "Cascadia Mono", Consolas, "Courier New", monospace'
};

export const CODE_FONTS: Record<string, string> = {
  cascadia: "'Cascadia Code', 'Cascadia Mono', Consolas, 'Courier New', monospace",
  fira: "'Fira Code', 'Cascadia Code', Consolas, monospace",
  jetbrains: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
  consolas: "Consolas, 'Courier New', monospace",
  courier: "'Courier New', Courier, monospace",
  monospace: 'monospace'
};

// Özel yazı tipi alanı CSS'e girdiği için yalnız güvenli karakterlere izin verilir.
export function safeFontFamily(custom: string): string | null {
  const v = custom.trim();
  return v && /^[A-Za-z0-9 ,'"._-]{1,120}$/.test(v) ? v : null;
}

export function codeFontFamily(values: SettingsValues): string {
  const id = String(values.fontFamily);
  if (id === 'custom') {
    const custom = safeFontFamily(String(values.fontFamilyCustom));
    return custom ? `${custom}, ${CODE_FONTS.monospace}` : CODE_FONTS.cascadia;
  }
  return CODE_FONTS[id] ?? CODE_FONTS.cascadia;
}

// Monaco seçenekleri (gerçek zamanlı: ayar değişince doğrudan güncellenir)
export function toMonacoOptions(v: SettingsValues): Record<string, unknown> {
  const rulers = String(v.rulers)
    .split(/[ ,]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0 && n < 500);
  const b = (id: string) => v[id] === true;
  return {
    fontFamily: codeFontFamily(v),
    fontSize: Number(v.fontSize),
    lineHeight: Number(v.lineHeight),
    fontWeight: String(v.fontWeight),
    letterSpacing: Number(v.letterSpacing),
    fontLigatures: b('fontLigatures'),
    tabSize: Number(v.tabSize),
    insertSpaces: b('insertSpaces'),
    wordWrap: String(v.wordWrap),
    lineNumbers: String(v.lineNumbers),
    minimap: { enabled: b('minimap'), renderCharacters: false },
    renderWhitespace: String(v.renderWhitespace),
    cursorStyle: String(v.cursorStyle),
    cursorBlinking: String(v.cursorBlinking),
    cursorSmoothCaretAnimation: b('smoothCaret') ? 'on' : 'off',
    smoothScrolling: b('smoothScrolling'),
    bracketPairColorization: { enabled: b('bracketColorization') },
    guides: { bracketPairs: b('bracketColorization'), indentation: b('indentGuides') },
    renderLineHighlight: String(v.renderLineHighlight),
    folding: b('folding'),
    stickyScroll: { enabled: b('stickyScroll') },
    scrollBeyondLastLine: b('scrollBeyondLastLine'),
    formatOnPaste: b('formatOnPaste'),
    formatOnType: b('formatOnType'),
    autoClosingBrackets: String(v.autoClosingBrackets),
    quickSuggestions: b('quickSuggestions'),
    suggestOnTriggerCharacters: b('suggestOnTriggerCharacters'),
    snippetSuggestions: String(v.snippetSuggestions),
    parameterHints: { enabled: b('parameterHints') },
    hover: { enabled: b('hover') },
    rulers,
    automaticLayout: true,
    padding: { top: 8 },
    roundedSelection: false
  };
}
