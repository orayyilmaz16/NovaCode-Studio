import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { setUiLang } from '../i18n/uiText';
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

export function useSettings(): SettingsApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings: SettingsProvider eksik');
  return v;
}

// Görünümü anında uygular: tema, vurgu rengi, yazı tipi, hareket (yakınlaştırma ve pencere rengi ayrı efektlerde).
function applyAppearance(values: SettingsValues, mode: ResolvedMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
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

  const mode = resolveMode(values.themeMode, prefersDark);

  // Dil render sırasında ayarlanır: aynı render'da t() yeni dili kullanır (idempotent, yan etkisi yok)
  setUiLang(String(values.language));

  useEffect(() => {
    applyAppearance(values, mode);
  }, [values.themeMode, values.accent, values.uiFont, values.animations, mode]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};
