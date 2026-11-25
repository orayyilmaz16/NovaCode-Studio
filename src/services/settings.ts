// Ayarlar çekirdeği: şema, varsayılanlar, doğrulama, kalıcılık (yalnız yerel) ve türetilmiş değerler.
// Şema tek kaynaktır: settingsSchema.json. Yeni ayar = şemaya satır + i18n etiketi (bkz. docs/brain/actions/settings.md).
import schemaJson from './settingsSchema.json';
import { getPalette, paletteEditorTheme } from './palettes';

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
  type: 'toggle' | 'select' | 'slider' | 'text' | 'accent' | 'palette';
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
  /** Aynı kategoride alt başlık (i18n anahtarı): ör. Genel / Sohbet / Ajan. */
  group?: string;
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
const STORAGE_VERSION = 4;

// v2: AI tamamlama varsayılanları hızlandı. Kullanıcı değiştirmemişse (değer eski varsayılanla aynı) yenisine taşınır;
// ayarlar tüm değerlerle kaydedildiği için bu olmadan eski varsayılanlar sonsuza dek kalırdı.
const V2_BALANCED: Record<string, number> = { aiCompletionDelay: 250, aiCompletionCooldown: 300, aiCompletionMaxTokens: 64, aiCompletionPrefix: 4000, aiCompletionSuffix: 1500 };
const V3_FAST: Record<string, number | string> = { aiCompletionEffort: 'fast', aiCompletionDelay: 100, aiCompletionCooldown: 100, aiCompletionMaxTokens: 32, aiCompletionPrefix: 2000, aiCompletionSuffix: 600, aiCompletionTemperature: 0.05 };
const MIGRATE_V2: Record<string, [number, number]> = {
  aiCompletionDelay: [450, 250], aiCompletionCooldown: [600, 300], aiCompletionMaxTokens: [80, 64], aiCompletionPrefix: [6000, 4000], aiCompletionSuffix: [2000, 1500]
};


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
    case 'accent':
    case 'palette': {
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

export interface StoredSettings {
  values: SettingsValues;
}

// ---------- Kalıcılık (yalnız bu cihazda, localStorage) ----------
export function loadSettings(): StoredSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const j = JSON.parse(raw);
      const values = sanitizeAll(j.values);
      if ((j.v ?? 1) < 2) for (const [k, [oldDef, newDef]] of Object.entries(MIGRATE_V2)) if (values[k] === oldDef) values[k] = newDef;
      // v3: hiçbirini değiştirmemiş (v2 Dengeli varsayılanları) kullanıcı yeni varsayılan Hızlı profile geçer; birini bile değiştirmişse dokunulmaz
      if ((j.v ?? 1) < 3 && Object.entries(V2_BALANCED).every(([k, v]) => values[k] === v)) Object.assign(values, V3_FAST);
      // v4: tamamlama modeli varsayılanı 7b → 0.5b (hız); eski varsayılanda kalmış kayıt yeni varsayılana geçer, başka bilinçli seçime dokunulmaz
      if ((j.v ?? 1) < 4 && values.aiCompletionModel === 'qwen2.5-coder:7b') values.aiCompletionModel = 'qwen2.5-coder:0.5b';
      return { values };
    }
    // İlk açılış: eski anahtarlardan taşı (token hariç; o ayrıca şifreli depoya taşınır)
    const legacy: Record<string, unknown> = {};
    const lsGet = (k: string) => window.localStorage.getItem(k);
    if (lsGet('nova.collab.enabled') !== null) legacy.collabEnabled = lsGet('nova.collab.enabled') === '1';
    if (lsGet('nova.collab.url') !== null) legacy.collabUrl = lsGet('nova.collab.url');
    if (lsGet('nova.welcome') !== null) legacy.welcomeOnStartup = lsGet('nova.welcome') !== '0';
    return { values: sanitizeAll(legacy) };
  } catch {
    return { values: { ...DEFAULTS } };
  }
}

export function saveSettings(s: StoredSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, values: s.values }));
  } catch {
    /* depolama kapalı: ayarlar bu oturumda kalır */
  }
}

export function parseImport(text: string): StoredSettings | null {
  try {
    const j = JSON.parse(text);
    if (!j || typeof j !== 'object' || !('values' in j)) return null;
    return { values: sanitizeAll(j.values) };
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

/** Etkin moda göre çözümlenmiş Monaco teması. "auto": renk teması seçiliyse onun editör teması, yoksa Nova koyu/açık. */
export function resolveEditorTheme(editorTheme: SettingValue, mode: ResolvedMode, colorTheme?: SettingValue): string {
  if (editorTheme === 'auto') {
    if (getPalette(colorTheme)) return paletteEditorTheme(String(colorTheme));
    return mode === 'light' ? 'nova-light' : 'nova-dark';
  }
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
  },
  violet: {
    swatch: '#8b5cf6',
    dark: ['#e4d9ff', '#c8b3ff', '#a98aff', '#8b5cf6', '#7340dd', '#5b2fb8'],
    light: ['#3a1880', '#4b2299', '#5e30b8', '#7340dd', '#5e30b8', '#4b2699']
  },
  cyan: {
    swatch: '#1fb6d4',
    dark: ['#c6f1fa', '#8fe3f3', '#4fd0e8', '#1fb6d4', '#0c93ad', '#0a758a'],
    light: ['#064a58', '#086274', '#0a7b90', '#0c93ad', '#0a7b90', '#08657a']
  },
  red: {
    swatch: '#ef4444',
    dark: ['#ffd2d2', '#ffa3a3', '#ff7373', '#ef4444', '#d12a2a', '#a82020'],
    light: ['#7a1414', '#9c1c1c', '#bd2424', '#d12a2a', '#bd2424', '#9c1c1c']
  },
  amber: {
    swatch: '#f2b01e',
    dark: ['#fff0c2', '#ffe08a', '#ffcd4d', '#f2b01e', '#b87a06', '#8f5e05'],
    light: ['#6b4403', '#855603', '#a06a05', '#b87d07', '#a06a05', '#845503']
  },
  lime: {
    swatch: '#84cc16',
    dark: ['#e6f9c0', '#cdf08a', '#aee050', '#84cc16', '#5d9209', '#4a7507'],
    light: ['#2f4a05', '#3f6208', '#50790a', '#5d9209', '#50790a', '#3f6208']
  }
};
export const ACCENT_VARS = ['200', '300', '400', '500', '600', '700'] as const;

export const UI_FONTS: Record<string, string> = {
  system: '"Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  segoe: '"Segoe UI", system-ui, sans-serif',
  bahnschrift: 'Bahnschrift, "Segoe UI", system-ui, sans-serif',
  calibri: 'Calibri, "Segoe UI", system-ui, sans-serif',
  corbel: 'Corbel, "Segoe UI", system-ui, sans-serif',
  trebuchet: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
  inter: 'Inter, "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif',
  roboto: 'Roboto, "Segoe UI", system-ui, sans-serif',
  ibmplex: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
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
  sourcecode: "'Source Code Pro', 'Cascadia Code', Consolas, monospace",
  ibmplex: "'IBM Plex Mono', 'Cascadia Code', Consolas, monospace",
  hack: "Hack, 'Cascadia Code', Consolas, monospace",
  iosevka: "Iosevka, 'Cascadia Code', Consolas, monospace",
  dejavu: "'DejaVu Sans Mono', 'Cascadia Code', Consolas, monospace",
  lucida: "'Lucida Console', Consolas, monospace",
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
    parameterHints: { enabled: b('parameterHints') },
    hover: { enabled: b('hover') },
    rulers,
    automaticLayout: true,
    padding: { top: 8 },
    roundedSelection: true
  };
}

// ---------- Büyük dosya koruması (P-25) ----------
// Çok büyük dosyada minimap, kıvırma ve parantez renklendirme editörü yavaşlatır; kullanıcı ayarına dokunmadan o dosya için kapatılır.
export const LARGE_FILE_CHARS = 2 * 1024 * 1024;
export const LARGE_FILE_LINES = 20000;

export interface FileSize {
  /** Karakter sayısı (model.getValueLength() veya içerik uzunluğu). */
  chars: number;
  /** Satır sayısı (model.getLineCount()). */
  lines: number;
}

export function isLargeFile(size: FileSize): boolean {
  return size.chars > LARGE_FILE_CHARS || size.lines > LARGE_FILE_LINES;
}

/** Büyük dosyada Monaco seçeneklerinin üstüne yazılacak ağır özelliklerin kapalı hali. */
export function largeFileOverrides(): Record<string, unknown> {
  return {
    minimap: { enabled: false },
    folding: false,
    bracketPairColorization: { enabled: false },
    guides: { bracketPairs: false, indentation: false },
    cursorSmoothCaretAnimation: 'off',
    smoothScrolling: false,
    stickyScroll: { enabled: false },
    renderWhitespace: 'none'
  };
}

/** Ayarlardan Monaco seçenekleri; dosya büyükse ağır özellikler kapatılır. */
export function toMonacoOptionsForFile(v: SettingsValues, size?: FileSize): Record<string, unknown> {
  const base = toMonacoOptions(v);
  return size && isLargeFile(size) ? { ...base, ...largeFileOverrides() } : base;
}
