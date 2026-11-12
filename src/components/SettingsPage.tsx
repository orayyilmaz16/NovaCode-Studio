import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Palette,
  Type,
  Files,
  SquareTerminal,
  GitBranch,
  Users,
  Sparkles,
  Play,
  Puzzle,
  Keyboard,
  Info,
  Search,
  RotateCcw,
  X,
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  Check
} from 'lucide-react';
import { t, type UiTextKey } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { useUpdate } from '../services/updateService';
import { BUILTIN_THEMES, extThemeName, listExtThemes, uninstallExt, useActiveEditorTheme, useExtensions, setMonacoForExtensions } from '../services/extensionsService';
import { saveCollabToken, useCollabToken } from '../services/useCollabToken';
import { defineNovaThemes } from '../services/editorTheme';
import {
  ACCENTS,
  CATEGORIES,
  SCHEMA,
  isVisible,
  resolveEditorTheme,
  toMonacoOptions,
  type SettingDef,
  type SettingOption,
  type SettingValue
} from '../services/settings';

const ICONS: Record<string, React.ReactNode> = {
  Palette: <Palette size={16} />,
  Type: <Type size={16} />,
  Files: <Files size={16} />,
  SquareTerminal: <SquareTerminal size={16} />,
  GitBranch: <GitBranch size={16} />,
  Users: <Users size={16} />,
  Sparkles: <Sparkles size={16} />,
  Play: <Play size={16} />,
  Puzzle: <Puzzle size={16} />,
  Keyboard: <Keyboard size={16} />,
  Info: <Info size={16} />
};

const tk = (key: string) => t(key as UiTextKey);
const optLabel = (o: SettingOption) => (o.labelKey ? tk(o.labelKey) : String(o.label ?? o.value));

const field =
  'bg-nv-input border border-zinc-700 rounded px-2 h-7 text-[13px] text-zinc-200 outline-none focus:border-indigo-500 transition-colors';

// ---------- Denetimler ----------
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${checked ? 'bg-indigo-500' : 'bg-zinc-600'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-150 ${checked ? 'translate-x-4' : ''}`}
    />
  </button>
);

const Control: React.FC<{ def: SettingDef; value: SettingValue; onChange: (v: SettingValue) => void; label: string }> = ({ def, value, onChange, label }) => {
  switch (def.type) {
    case 'toggle':
      return <Toggle checked={value === true} onChange={onChange} label={label} />;
    case 'select':
      return (
        <select
          aria-label={label}
          value={String(value)}
          onChange={(e) => {
            const hit = def.options?.find((o) => String(o.value) === e.target.value);
            if (hit) onChange(hit.value);
          }}
          className={`${field} min-w-[170px]`}
        >
          {def.options?.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {optLabel(o)}
            </option>
          ))}
        </select>
      );
    case 'slider':
      return (
        <div className="flex items-center gap-3 min-w-[240px]">
          <input
            type="range"
            aria-label={label}
            min={def.min}
            max={def.max}
            step={def.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <span className="w-16 text-right font-mono text-[12px] text-zinc-400">
            {Number(value)}
            {def.unit ? ` ${def.unit}` : ''}
          </span>
        </div>
      );
    case 'text':
      return (
        <input
          aria-label={label}
          type="text"
          value={String(value)}
          maxLength={def.maxLength}
          placeholder={def.placeholder}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} w-[280px] font-mono`}
        />
      );
    case 'accent':
      return (
        <div className="flex items-center gap-2" role="radiogroup" aria-label={label}>
          {def.options?.map((o) => {
            const on = String(o.value) === String(value);
            return (
              <button
                key={String(o.value)}
                role="radio"
                aria-checked={on}
                aria-label={optLabel(o)}
                title={optLabel(o)}
                onClick={() => onChange(o.value)}
                className={`w-6 h-6 rounded-full flex items-center justify-center ring-offset-2 ring-offset-[var(--color-nv-editor)] transition-all hover:scale-110 ${on ? 'ring-2 ring-zinc-300' : ''}`}
                style={{ background: ACCENTS[String(o.value)]?.swatch }}
              >
                {on && <Check size={13} className="text-white" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      );
  }
};

const Row: React.FC<{ def: SettingDef }> = ({ def }) => {
  const { values, set, reset, isModified } = useSettings();
  if (!isVisible(def, values)) return null;
  const label = tk(`set_${def.id}`);
  const modified = isModified(def.id);
  return (
    <div className="flex flex-col @lg:flex-row items-start @lg:justify-between gap-2 @lg:gap-6 py-3 border-b border-nv-border/70 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[13px] text-zinc-100">
          {modified && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" title={t('setModified')} />}
          <span>{label}</span>
          {modified && (
            <button onClick={() => reset(def.id)} title={t('setResetOne')} aria-label={t('setResetOne')} className="icon-btn !w-5 !h-5">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
        {def.desc && <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed max-w-[520px]">{tk(`setDesc_${def.id}`)}</p>}
      </div>
      <div className="@lg:shrink-0 pt-0.5 max-w-full">
        <Control def={def} value={values[def.id]} onChange={(v) => set(def.id, v)} label={label} />
      </div>
    </div>
  );
};

// ---------- Canlı editör önizlemesi: tüm editör ayarları, tema anında görünür ----------
const SAMPLE = `function greet(name: string) {
  const message = \`Hello, \${name}!\`;
  if (name !== '' && name.length >= 2) {
    return message; // == === != <= >= =>
  }
  return 'anonymous';
}
`;

const EditorPreview: React.FC = () => {
  const { values } = useSettings();
  const editorThemeName = useActiveEditorTheme();
  const options = useMemo(() => ({ ...toMonacoOptions(values), scrollBeyondLastLine: false }), [values]);
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">{t('setPreview')}</div>
      <div className="h-[210px] rounded border border-nv-border overflow-hidden">
        <Editor
          height="100%"
          language="typescript"
          theme={editorThemeName}
          defaultValue={SAMPLE}
          beforeMount={(monaco) => {
            defineNovaThemes(monaco);
            setMonacoForExtensions(monaco);
          }}
          options={options}
        />
      </div>
    </div>
  );
};

// ---------- Ortak düzenleme token'ı (şifreli saklanır) ----------
const TokenField: React.FC = () => {
  const { token } = useCollabToken();
  const [value, setValue] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const shown = value ?? token;
  return (
    <div className="flex flex-col @lg:flex-row items-start @lg:justify-between gap-2 @lg:gap-6 py-3 border-b border-nv-border/70">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-zinc-100">{t('set_collabToken')}</div>
        <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed max-w-[520px]">{t('setDesc_collabToken')}</p>
        {msg && <p className="mt-1 text-[12px] text-emerald-400">{msg}</p>}
      </div>
      <div className="@lg:shrink-0 flex flex-wrap gap-2 max-w-full">
        <input
          type="password"
          autoComplete="off"
          aria-label={t('set_collabToken')}
          value={shown}
          onChange={(e) => setValue(e.target.value)}
          maxLength={2048}
          className={`${field} w-[220px] max-w-full font-mono`}
        />
        <button
          onClick={async () => {
            const res = await saveCollabToken(shown);
            setValue(null);
            setMsg(res.encrypted ? t('setTokenSaved') : t('setTokenNoEnc'));
          }}
          className="h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] transition-colors"
        >
          {t('ghSave')}
        </button>
      </div>
    </div>
  );
};

// ---------- Yapay zekâ API anahtarları (ana süreçte şifreli; arayüze geri okunmaz) ----------
const AI_KEYS: { id: 'aiKey_anthropic' | 'aiKey_openai'; label: UiTextKey }[] = [
  { id: 'aiKey_anthropic', label: 'aiKeyAnthropic' },
  { id: 'aiKey_openai', label: 'aiKeyOpenai' }
];

const AiKeyRow: React.FC<{ id: 'aiKey_anthropic' | 'aiKey_openai'; label: UiTextKey }> = ({ id, label }) => {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    void window.electronAPI?.secrets.get(id).then((r) => setSaved('value' in r && !!r.value));
  }, [id]);
  const save = async (v: string) => {
    const res = await window.electronAPI?.secrets.set(id, v);
    if (res?.success) { setSaved(v !== ''); setValue(''); setMsg(null); } else setMsg(t('aiKeyNoEncrypt'));
  };
  return (
    <div className="flex flex-col @lg:flex-row items-start @lg:justify-between gap-2 @lg:gap-6 py-3 border-b border-nv-border/70">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-zinc-100">{t(label)}</div>
        <p className={`mt-1 text-[12px] ${saved ? 'text-emerald-400' : 'text-zinc-500'}`}>{saved === null ? '' : saved ? t('aiKeySet') : t('aiKeyNotSet')}</p>
        {msg && <p className="mt-1 text-[12px] text-rose-400">{msg}</p>}
      </div>
      <div className="@lg:shrink-0 flex flex-wrap gap-2 max-w-full">
        <input
          type="password"
          autoComplete="off"
          aria-label={t(label)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={2048}
          placeholder={saved ? '••••••••' : ''}
          className={`${field} w-[220px] max-w-full font-mono`}
        />
        <button disabled={!value.trim()} onClick={() => void save(value.trim())} className="h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[12px] transition-colors">{t('aiKeySave')}</button>
        {saved && <button onClick={() => void save('')} className="h-7 px-3 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-[12px] transition-colors">{t('aiKeyClear')}</button>}
      </div>
    </div>
  );
};

const AiKeys: React.FC = () => (
  <div className="mt-4">
    <h3 className="text-[13px] text-zinc-200">{t('aiKeyTitle')}</h3>
    <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed max-w-[560px]">{t('aiKeyDesc')}</p>
    {window.electronAPI ? AI_KEYS.map((k) => <AiKeyRow key={k.id} {...k} />) : <p className="mt-2 text-[12px] text-zinc-500">{t('aiDesktopOnly')}</p>}
  </div>
);

// ---------- Eklentiler (ayarlara entegre): tema seçici + yüklü eklentiler ----------
const ExtensionsSettings: React.FC<{ onOpenStore?: () => void }> = ({ onOpenStore }) => {
  const { values, set } = useSettings();
  const { installed, updates } = useExtensions();
  const themes = listExtThemes(installed);
  const extTheme = String(values.extTheme || '');
  const extActive = themes.some((th) => th.id === extTheme);
  const current = extActive ? extTheme : String(values.editorTheme || 'auto');
  // Seçim anında uygulanır (editör ve önizleme gerçek zamanlı değişir)
  const pick = (v: string) => { if (themes.some((th) => th.id === v)) set('extTheme', v); else set('editorTheme', v); };
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col @lg:flex-row items-start @lg:justify-between gap-2 @lg:gap-6 py-3 border-b border-nv-border/70">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] text-zinc-100">{t('setExtThemePick')}</div>
          <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed max-w-[520px]">{t('setExtThemePickDesc')}</p>
        </div>
        <select value={current} onChange={(e) => pick(e.target.value)} aria-label={t('setExtThemePick')} className={`${field} w-[240px] max-w-full`}>
          <optgroup label={t('setExtBuiltin')}>{BUILTIN_THEMES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</optgroup>
          {themes.length > 0 && <optgroup label={t('extTitle')}>{themes.map((th) => <option key={th.id} value={th.id}>{th.label} — {th.ext}</option>)}</optgroup>}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-[13px] text-zinc-200">{t('extInstalled')} ({installed.length})</h3>
          {onOpenStore && <button onClick={onOpenStore} className="h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] whitespace-nowrap transition-colors">{t('setExtOpenStore')}</button>}
        </div>
        {installed.length === 0 ? (
          <p className="text-[12px] text-zinc-500">{t('extNoInstalled')}</p>
        ) : (
          <ul className="divide-y divide-nv-border/70 rounded border border-nv-border/70">
            {installed.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3 py-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-zinc-100 truncate">{e.displayName} <span className="text-zinc-500 text-[11.5px]">{e.version}</span>{updates[e.id] && <span className="ml-2 text-[10.5px] px-1.5 py-0.5 rounded-full bg-indigo-500/25 text-indigo-200">{t('extUpdateTo').replace('{v}', updates[e.id])}</span>}</div>
                  <div className="text-[11.5px] text-zinc-500 truncate">{e.id} · {t('extThemeCount').replace('{n}', String(e.themes.length))}</div>
                </div>
                <button
                  onClick={() => { if (e.themes.some((th) => extThemeName(e.id, th.label) === extTheme)) set('extTheme', ''); void uninstallExt(e.id); }}
                  className="h-7 px-2.5 rounded text-[12px] text-zinc-400 hover:text-rose-300 hover:bg-nv-hover whitespace-nowrap transition-colors"
                >{t('extUninstall')}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ---------- Kısayollar ve hakkında ----------
const SHORTCUTS: [string, UiTextKey][] = [
  ['Ctrl+N', 'newFile'],
  ['Ctrl+O', 'openFolder'],
  ['Ctrl+Shift+O', 'openFiles'],
  ['Ctrl+S', 'scSave'],
  ['Ctrl+B', 'scToggleSidebar'],
  ['Ctrl+`', 'scToggleTerminal'],
  ['Ctrl+,', 'actSettings'],
  ['Ctrl+W', 'closeTab'],
  ['Ctrl+Tab / Ctrl+Shift+Tab', 'scNextTab'],
  ['Ctrl+P', 'cmdQuickOpen'],
  ['Ctrl+Shift+P / F1', 'cpTitle'],
  ['Ctrl+G', 'cmdGoToLine'],
  ['Ctrl+Shift+F', 'cmdFindInFiles'],
  ['Ctrl+Shift+L', 'cmdOpenAI'],
  ['Ctrl+Shift+X', 'extTitle'],
  ['Ctrl+L', 'scClearTerminal'],
  ['Ctrl+Q', 'quit']
];

const Shortcuts: React.FC = () => (
  <div>
    {SHORTCUTS.map(([keys, label]) => (
      <div key={keys} className="flex items-center justify-between py-2.5 border-b border-nv-border/70 last:border-0 text-[13px]">
        <span className="text-zinc-300">{t(label)}</span>
        <kbd className="px-2 py-0.5 rounded bg-nv-input text-[12px] font-mono text-zinc-300">{keys}</kbd>
      </div>
    ))}
  </div>
);

const About: React.FC = () => {
  const { exportJson, importJson, resetAll } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const versions = window.electronAPI?.versions;
  const update = useUpdate();

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novacode-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file?: File) => {
    if (!file) return;
    if (file.size > 1_000_000) return setMsg({ ok: false, text: t('setImportFailed') });
    const ok = importJson(await file.text());
    setMsg({ ok, text: ok ? t('setImportDone') : t('setImportFailed') });
  };

  const info: [string, string][] = [
    [t('aboutVersion'), `NovaCode Studio ${__APP_VERSION__}`],
    [t('updChannelLabel'), update.channel === 'stable' ? t('updChannelStable') : t('updChannelDev')],
    ...(versions
      ? ([
          ['Electron', versions.electron],
          ['Chromium', versions.chrome],
          ['Node.js', versions.node]
        ] as [string, string][])
      : [[t('aboutRuntime'), 'Web']] as [string, string][])
  ];

  return (
    <div className="space-y-6">
      <div>
        {info.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b border-nv-border/70 text-[13px]">
            <span className="text-zinc-400">{k}</span>
            <span className="font-mono text-zinc-200">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-zinc-500 leading-relaxed max-w-[560px]">{t('aboutStorage')}</p>
      <p className="text-[12px] text-zinc-500">
        {t('aboutDocs')}: <code className="font-mono text-zinc-300">docs/brain/BRAIN.md</code>
      </p>
      <div className="flex flex-wrap gap-2">
        <button onClick={doExport} className="flex items-center gap-1.5 h-8 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[12px] transition-colors">
          <Download size={14} />
          {t('setExport')}
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 h-8 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[12px] transition-colors">
          <Upload size={14} />
          {t('setImport')}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void doImport(e.target.files?.[0])} />
        <button
          onClick={() => window.confirm(t('setResetAllConfirm')) && resetAll()}
          className="flex items-center gap-1.5 h-8 px-3 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[12px] transition-colors"
        >
          <RotateCcw size={14} />
          {t('setResetAll')}
        </button>
      </div>
      {msg && <p className={`text-[12px] ${msg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{msg.text}</p>}
    </div>
  );
};

// ---------- Sayfa ----------
interface SettingsPageProps {
  onClose: () => void;
  /** Eklentiler ayar bölümündeki \"Mağazayı aç\": ayarları kapatır ve eklentiler panelini açar. */
  onOpenExtensions?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, onOpenExtensions }) => {
  const { values, isModified } = useSettings();
  // Menüden (Yardım → Kısayollar/Hakkında) belirli kategoriyle açılabilir; bir kez okunur ve silinir.
  const [cat, setCat] = useState(() => {
    try {
      const want = window.localStorage.getItem('nova.settings.category');
      window.localStorage.removeItem('nova.settings.category');
      if (want && ['shortcuts', 'about', 'ai', 'extensions'].includes(want)) return want;
    } catch { /* depolama kapalı */ }
    return 'appearance';
  });
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return null;
    return SCHEMA.filter((d) => {
      if (!isVisible(d, values)) return false;
      const hay = `${d.id} ${tk(`set_${d.id}`)} ${d.desc ? tk(`setDesc_${d.id}`) : ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [q, values]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of SCHEMA) if (isModified(d.id)) c[d.category] = (c[d.category] ?? 0) + 1;
    return c;
  }, [values, isModified]);

  const current = CATEGORIES.find((c) => c.id === cat) ?? CATEGORIES[0];
  const rows = SCHEMA.filter((d) => d.category === current.id && !d.hidden);

  return (
    <div className="@container animate-fade-in flex flex-col flex-1 h-full min-w-0 bg-nv-editor select-none">
      <header className="flex items-center gap-2 @md:gap-4 h-12 px-3 @md:px-6 border-b border-nv-border shrink-0">
        <h1 className="text-[15px] @md:text-[16px] font-normal text-zinc-100 whitespace-nowrap">{t('setTitle')}</h1>
        <div className="relative flex-1 max-w-[460px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('setSearch')}
            aria-label={t('setSearch')}
            spellCheck={false}
            className={`${field} w-full !h-8 pl-8`}
          />
        </div>
        <span className="hidden lg:block text-[12px] text-zinc-500 ml-auto">{t('setAutoSaved')}</span>
        <button onClick={onClose} title={t('setClose')} aria-label={t('setClose')} className="icon-btn">
          <X size={15} />
        </button>
      </header>

      <div className="flex flex-col @2xl:flex-row flex-1 min-h-0">
        <nav aria-label={t('setTitle')} className="no-scrollbar flex @2xl:block gap-1 @2xl:gap-0 w-full @2xl:w-56 shrink-0 border-b @2xl:border-b-0 @2xl:border-r border-nv-border bg-nv-side p-2 overflow-x-auto @2xl:overflow-x-hidden @2xl:overflow-y-auto">
          {CATEGORIES.map((c) => {
            const active = !q && c.id === cat;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setQuery('');
                  setCat(c.id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`@2xl:w-full shrink-0 flex items-center gap-2.5 h-8 px-2.5 rounded text-[13px] text-left whitespace-nowrap transition-colors ${
                  active ? 'bg-nv-active text-zinc-50' : 'text-zinc-400 hover:bg-nv-hover hover:text-zinc-200'
                }`}
              >
                <span className="shrink-0">{ICONS[c.icon]}</span>
                <span className="truncate flex-1">{tk(c.labelKey)}</span>
                {counts[c.id] ? <span className="text-[10px] px-1.5 rounded-full bg-indigo-500/20 text-indigo-300">{counts[c.id]}</span> : null}
              </button>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto px-3 @md:px-8 py-4 @md:py-5">
          <div className="max-w-[860px]">
            {matches ? (
              matches.length === 0 ? (
                <p className="text-[13px] text-zinc-500">{t('setNoResults')}</p>
              ) : (
                CATEGORIES.map((c) => {
                  const list = matches.filter((d) => d.category === c.id);
                  return list.length ? (
                    <section key={c.id} className="mb-6">
                      <h2 className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">{tk(c.labelKey)}</h2>
                      {list.map((d) => (
                        <Row key={d.id} def={d} />
                      ))}
                    </section>
                  ) : null;
                })
              )
            ) : (
              <section key={current.id} className="animate-fade-in">
                <h2 className="text-[20px] font-light text-zinc-100 mb-3">{tk(current.labelKey)}</h2>
                {current.id === 'editor' && <EditorPreview />}
                {rows.map((d) => (
                  <Row key={d.id} def={d} />
                ))}
                {current.id === 'collab' && (
                  <>
                    <TokenField />
                    {String(values.collabUrl) && !/^(wss:\/\/|ws:\/\/(localhost|127\.0\.0\.1)[:/])/.test(String(values.collabUrl).trim()) && (
                      <p className="mt-2 text-[12px] text-rose-400">{t('setCollabUrlInvalid')}</p>
                    )}
                  </>
                )}
                {current.id === 'ai' && <AiKeys />}
                {current.id === 'extensions' && <ExtensionsSettings onOpenStore={onOpenExtensions} />}
                {current.id === 'shortcuts' && <Shortcuts />}
                {current.id === 'about' && <About />}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
