import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { setUiLang, getUiLang } from '../i18n/uiText';
import { PALETTE_VAR_KEYS, getPalette, paletteVars, type PaletteSeed } from './palettes';
import {
  ACCENTS,
  ACCENT_VARS,
  DEFAULTS,
  UI_FONTS,
  loadSettings,
  parseImport,
  resolveMode,
  saveSettings,
  getDef,
  sanitizeValue,
  createChangeDetector,
  createSlice,
  type ResolvedMode,
  type SettingValue,
  type SettingsValues
} from './settings';

export interface SettingsApi {
  values: SettingsValues;
  /** Sistem temasına göre çözümlenmiş mod (koyu/açık). */
  mode: ResolvedMode;
  set: (id: string, value: SettingValue) => void;
  reset: (id: string) => void;
  resetAll: () => void;
  isModified: (id: string) => boolean;
  exportJson: () => string;
  importJson: (text: string) => boolean;
}

const Ctx = createContext<SettingsApi | null>(null);

// Seçici erişim (P-13): değerler küçük bir dış depoda tutulur; useSettingValue(id) yalnız o anahtar değişince bileşeni yeniden çizer.
interface SettingsStore {
  values: SettingsValues;
  listeners: Set<() => void>;
}
const StoreCtx = createContext<SettingsStore | null>(null);
// Eylemler (set/reset/...) kararlıdır; değerler değişince bu bağlamı kullananlar yeniden çizilmez.
type SettingsActions = Pick<SettingsApi, 'set' | 'reset' | 'resetAll' | 'exportJson' | 'importJson'>;
const ActionsCtx = createContext<SettingsActions | null>(null);

/** Tek bir ayarı okur; yalnız o ayar değişince yeniden çizilir (useSettings() tüm değişikliklerde çizer). */
export function useSettingValue(id: string): SettingValue {
  const store = useContext(StoreCtx);
  if (!store) throw new Error('useSettingValue: SettingsProvider eksik');
  const subscribe = useCallback((fn: () => void) => { store.listeners.add(fn); return () => { store.listeners.delete(fn); }; }, [store]);
  return useSyncExternalStore(subscribe, () => store.values[id]);
}

/**
 * Ayar grubunun türetilmiş değeri (ör. Monaco seçenekleri). `keys` ve `select` modül düzeyinde sabit olmalı.
 * Dönen nesne yalnız `keys` içinden bir ayar değişince değişir: diğer ayarların değişimi çizimi tetiklemez.
 */
export function useSettingsSlice<T>(keys: readonly string[], select: (v: SettingsValues) => T): T {
  const store = useContext(StoreCtx);
  if (!store) throw new Error('useSettingsSlice: SettingsProvider eksik');
  const slice = useMemo(() => createSlice(keys, select), [keys, select]);
  const subscribe = useCallback((fn: () => void) => { store.listeners.add(fn); return () => { store.listeners.delete(fn); }; }, [store]);
  const getSnapshot = useCallback(() => slice(store.values), [slice, store]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Yan etki (DOM dışı servis çağrısı vb.) için: `keys` ayarlarından biri değişince `effect` çağrılır, bileşen yeniden çizilmez.
 * Mount'ta bir kez de çağrılır (useEffect ile aynı davranış).
 */
export function useSettingsEffect(keys: readonly string[], effect: (v: SettingsValues) => void): void {
  const store = useContext(StoreCtx);
  if (!store) throw new Error('useSettingsEffect: SettingsProvider eksik');
  const effectRef = useRef(effect);
  useLayoutEffect(() => { effectRef.current = effect; });
  useEffect(() => {
    const changed = createChangeDetector(keys);
    const run = () => { if (changed(store.values)) effectRef.current(store.values); };
    run();
    store.listeners.add(run);
    return () => { store.listeners.delete(run); };
  }, [store, keys]);
}

/** Ayar değiştirici eylemler (değer okumaz, değişimde yeniden çizilmez). */
export function useSettingsActions(): SettingsActions {
  const v = useContext(ActionsCtx);
  if (!v) throw new Error('useSettingsActions: SettingsProvider eksik');
  return v;
}

export function useSettings(): SettingsApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings: SettingsProvider eksik');
  return v;
}

let fadeTimer = 0;
let lastThemeKey = '';

// Görünümü anında uygular: tema, vurgu rengi, yazı tipi, hareket (yakınlaştırma ve pencere rengi ayrı efektlerde).
function applyAppearance(values: SettingsValues, mode: ResolvedMode, palette: PaletteSeed | null) {
  const root = document.documentElement;
  // Tema (mod veya renk teması) gerçekten değişiyorsa (ilk yükleme değil) renkler yumuşakça döner: kısa süre data-theme-fading
  const themeKey = `${mode}:${palette ? String(values.colorTheme) : 'auto'}`;
  if (lastThemeKey && lastThemeKey !== themeKey) {
    root.dataset.themeFading = '';
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => { delete root.dataset.themeFading; }, Math.round(parseFloat(getComputedStyle(root).getPropertyValue('--dur-slow')) || 260) + 60);
  }
  lastThemeKey = themeKey;
  root.dataset.theme = mode;
  // Renk teması yüzeyleri: seçiliyse satır içi yazılır, "auto"da kaldırılır (style.css'teki Nova geçerli olur)
  if (palette) for (const [k, v] of Object.entries(paletteVars(palette))) root.style.setProperty(k, v);
  else for (const k of PALETTE_VAR_KEYS) root.style.removeProperty(k);
  // Dil ve yazı yönü: ekran okuyucu/yazım denetimi doğru dili bilir, Arapça arayüz sağdan sola akar (editör/terminal kendi alanında dir="ltr" tutar)
  const lang = getUiLang();
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.dataset.motion = values.animations === false ? 'off' : 'on';
  root.style.setProperty('--font-sans', UI_FONTS[String(values.uiFont)] ?? UI_FONTS.system);

  const accent = ACCENTS[String(values.accent)] ?? ACCENTS.indigo;
  const shades = accent[mode];
  ACCENT_VARS.forEach((n, i) => root.style.setProperty(`--color-indigo-${n}`, shades[i]));

}

// Yakınlaştırma ayrı uygulanır: tema/renk gibi ucuz işlerle birlikte her seferinde yeniden çalışmasın.
function applyZoom(percent: number) {
  const zoom = Math.round(Math.min(150, Math.max(80, Number(percent) || 100))) / 100;
  const api = window.electronAPI?.ui;
  if (api) api.setZoom(zoom);
  else document.documentElement.style.zoom = String(zoom);
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stored, setStored] = useState(loadSettings);
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true);
  const { values } = stored;

  // Sistem teması değişince ("Sistem" modunda) anında izle
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Renk teması seçiliyse mod temadan gelir (koyu/açık temanın kendisine bağlıdır); "auto"da Tema modu geçerlidir
  const palette = getPalette(values.colorTheme);
  const mode = palette ? palette.mode : resolveMode(values.themeMode, prefersDark);

  // Dil render sırasında ayarlanır: aynı render'da t() yeni dili kullanır (idempotent, yan etkisi yok)
  setUiLang(String(values.language));

  useEffect(() => {
    applyAppearance(values, mode, palette);
  }, [values.themeMode, values.colorTheme, values.accent, values.uiFont, values.animations, values.language, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pencere zemin rengi yalnız mod değişince
  useEffect(() => { void window.electronAPI?.ui.setTheme(mode); }, [mode]);

  // Ölçek: bir sonraki çizim karesinde tek sefer uygulanır (art arda değişiklikler birleşir, takılma olmaz)
  useEffect(() => {
    const id = requestAnimationFrame(() => applyZoom(Number(values.uiZoom)));
    return () => cancelAnimationFrame(id);
  }, [values.uiZoom]);

  // Kalıcılık: kısa gecikmeyle (kaydırıcı sürüklerken her adımda yazma)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveSettings(stored), 200);
    return () => clearTimeout(timer.current);
  }, [stored]);

  const set = useCallback((id: string, value: SettingValue) => {
    const def = getDef(id);
    if (!def) return;
    const v = sanitizeValue(def, value);
    // Yerleşik editör teması seçilince eklenti teması bırakılır
    setStored((s) => (s.values[id] === v ? s : { ...s, values: { ...s.values, [id]: v, ...(id === 'editorTheme' ? { extTheme: '' } : {}) } }));
  }, []);

  const reset = useCallback((id: string) => {
    setStored((s) => ({ ...s, values: { ...s.values, [id]: DEFAULTS[id] } }));
  }, []);

  const resetAll = useCallback(() => {
    setStored({ values: { ...DEFAULTS } });
  }, []);

  const exportJson = useCallback(() => JSON.stringify({ v: 1, values }, null, 2), [values]);

  const importJson = useCallback((text: string) => {
    const parsed = parseImport(text);
    if (!parsed) return false;
    setStored(parsed);
    return true;
  }, []);

  // Seçici depo: render sırasında güncel değer yazılır (aynı geçişteki çocuklar taze okur), aboneler yerleşimden sonra uyarılır
  const store = useRef<SettingsStore>({ values, listeners: new Set() }).current;
  store.values = values;
  useLayoutEffect(() => { store.listeners.forEach((fn) => fn()); }, [values, store]);
  const actions = useMemo<SettingsActions>(() => ({ set, reset, resetAll, exportJson: () => JSON.stringify({ v: 1, values: store.values }, null, 2), importJson }), [set, reset, resetAll, importJson, store]);

  const api = useMemo<SettingsApi>(
    () => ({
      values,
      mode,
      set,
      reset,
      resetAll,
      isModified: (id) => values[id] !== DEFAULTS[id],
      exportJson,
      importJson
    }),
    [values, mode, set, reset, resetAll, exportJson, importJson]
  );

  return (
    <StoreCtx.Provider value={store}>
      <ActionsCtx.Provider value={actions}>
        <Ctx.Provider value={api}>{children}</Ctx.Provider>
      </ActionsCtx.Provider>
    </StoreCtx.Provider>
  );
};
