import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Palette,
  Type,
  BookOpen,
  Files,
  SquareTerminal,
  GitBranch,
  Users,
  Sparkles,
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
import type { Snippet } from '../types';
import { t, type UiTextKey } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { saveCollabToken, useCollabToken } from '../services/useCollabToken';
import { defineNovaThemes } from '../services/editorTheme';
import { registerSnippetProvider, setSnippetSource } from '../services/snippetProvider';
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
  BookOpen: <BookOpen size={16} />,
  Files: <Files size={16} />,
  SquareTerminal: <SquareTerminal size={16} />,
  GitBranch: <GitBranch size={16} />,
  Users: <Users size={16} />,
  Sparkles: <Sparkles size={16} />,
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
    <div className="flex items-start justify-between gap-6 py-3 border-b border-nv-border/70 last:border-0">
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
      <div className="shrink-0 pt-0.5">
        <Control def={def} value={values[def.id]} onChange={(v) => set(def.id, v)} label={label} />
      </div>
    </div>
  );
};

// ---------- Canlı editör önizlemesi: tüm editör ayarları, tema ve snippet'ler anında görünür ----------
const SAMPLE = `function greet(name: string) {
  const message = \`Hello, \${name}!\`;
  if (name !== '' && name.length >= 2) {
    return message; // == === != <= >= =>
  }
  return 'anonymous';
}
`;

const EditorPreview: React.FC = () => {
  const { values, userSnippets, mode } = useSettings();
  const options = useMemo(() => ({ ...toMonacoOptions(values), scrollBeyondLastLine: false }), [values]);
  useEffect(() => {
    setSnippetSource({ user: userSnippets, includeBuiltIn: values.defaultSnippetsInEditor === true });
  }, [userSnippets, values.defaultSnippetsInEditor]);
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">{t('setPreview')}</div>
      <div className="h-[210px] rounded border border-nv-border overflow-hidden">
        <Editor
          height="100%"
          language="typescript"
          theme={resolveEditorTheme(values.editorTheme, mode)}
          defaultValue={SAMPLE}
          beforeMount={(monaco) => {
            defineNovaThemes(monaco);
            registerSnippetProvider(monaco);
          }}
          options={options}
        />
      </div>
    </div>
  );
};

// ---------- Snippet yöneticisi ----------
const LANGS = ['javascript', 'typescript', 'html', 'css', 'json', 'python', 'markdown', 'java', 'cpp', 'go', 'rust', 'sql', 'shell', 'yaml', 'plaintext'];
const blank: Snippet = { id: '', label: '', prefix: '', description: '', language: '*', body: '' };

const SnippetManager: React.FC<{ builtInCount: number }> = ({ builtInCount }) => {
  const { userSnippets, setUserSnippets } = useSettings();
  const [draft, setDraft] = useState<Snippet | null>(null);
  const [error, setError] = useState(false);

  const save = () => {
    if (!draft) return;
    const prefix = draft.prefix.trim();
    if (!prefix || /\s/.test(prefix) || !draft.body.trim()) return setError(true);
    const item: Snippet = { ...draft, prefix, label: draft.description.trim() || prefix, id: draft.id || `u-${Date.now()}` };
    setUserSnippets(draft.id ? userSnippets.map((s) => (s.id === draft.id ? item : s)) : [...userSnippets, item]);
    setDraft(null);
    setError(false);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] text-zinc-100">{t('snipUser')}</h3>
        {!draft && (
          <button onClick={() => setDraft({ ...blank })} className="flex items-center gap-1.5 h-7 px-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] transition-colors">
            <Plus size={13} />
            {t('snipAdd')}
          </button>
        )}
      </div>
      <p className="text-[12px] text-zinc-500 mb-3">{t('snipBuiltinCount').replace('{n}', String(builtInCount))}</p>

      {draft && (
        <div className="mb-4 p-3 rounded border border-nv-border bg-nv-side space-y-2.5 animate-fade-in">
          <div className="grid grid-cols-2 gap-2.5">
            <label className="text-[12px] text-zinc-400 space-y-1">
              <span>{t('snipPrefix')}</span>
              <input value={draft.prefix} onChange={(e) => setDraft({ ...draft, prefix: e.target.value })} maxLength={40} spellCheck={false} className={`${field} w-full font-mono`} />
            </label>
            <label className="text-[12px] text-zinc-400 space-y-1">
              <span>{t('snipLanguage')}</span>
              <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} className={`${field} w-full`}>
                <option value="*">{t('snipLanguageAll')}</option>
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-[12px] text-zinc-400 space-y-1">
            <span>{t('snipDescription')}</span>
            <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={120} className={`${field} w-full`} />
          </label>
          <label className="block text-[12px] text-zinc-400 space-y-1">
            <span>{t('snipBody')}</span>
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              spellCheck={false}
              rows={7}
              className="w-full bg-nv-input border border-zinc-700 rounded p-2 text-[12px] text-zinc-200 outline-none focus:border-indigo-500 font-mono resize-y"
            />
          </label>
          <p className="text-[11px] text-zinc-500 leading-relaxed">{t('snipHelp')}</p>
          {error && <p className="text-[12px] text-rose-400">{t('snipInvalid')}</p>}
          <div className="flex gap-2">
            <button onClick={save} className="h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] transition-colors">
              {t('snipSave')}
            </button>
            <button
              onClick={() => {
                setDraft(null);
                setError(false);
              }}
              className="h-7 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[12px] transition-colors"
            >
              {t('ghCancel')}
            </button>
          </div>
        </div>
      )}

      {userSnippets.length === 0 && !draft ? (
        <p className="text-[13px] text-zinc-500">{t('snipEmpty')}</p>
      ) : (
        userSnippets.map((s) => (
          <div key={s.id} className="group flex items-center gap-3 py-2 border-b border-nv-border/70 last:border-0">
            <code className="px-1.5 py-0.5 rounded bg-nv-input text-[12px] text-indigo-300 font-mono">{s.prefix}</code>
            <span className="flex-1 min-w-0 truncate text-[13px] text-zinc-300">{s.description || s.body.split('\n')[0]}</span>
            <span className="text-[11px] text-zinc-500">{s.language === '*' ? t('snipLanguageAll') : s.language}</span>
            <button className="icon-btn" title={t('snipEdit')} aria-label={t('snipEdit')} onClick={() => setDraft(s)}>
              <Pencil size={13} />
            </button>
            <button className="icon-btn" title={t('snipDelete')} aria-label={t('snipDelete')} onClick={() => setUserSnippets(userSnippets.filter((x) => x.id !== s.id))}>
              <Trash2 size={13} />
            </button>
          </div>
        ))
      )}
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
    <div className="flex items-start justify-between gap-6 py-3 border-b border-nv-border/70">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-zinc-100">{t('set_collabToken')}</div>
        <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed max-w-[520px]">{t('setDesc_collabToken')}</p>
        {msg && <p className="mt-1 text-[12px] text-emerald-400">{msg}</p>}
      </div>
      <div className="shrink-0 flex gap-2">
        <input
          type="password"
          autoComplete="off"
          aria-label={t('set_collabToken')}
          value={shown}
          onChange={(e) => setValue(e.target.value)}
          maxLength={2048}
          className={`${field} w-[220px] font-mono`}
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
    <div className="flex items-start justify-between gap-6 py-3 border-b border-nv-border/70">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-zinc-100">{t(label)}</div>
        <p className={`mt-1 text-[12px] ${saved ? 'text-emerald-400' : 'text-zinc-500'}`}>{saved === null ? '' : saved ? t('aiKeySet') : t('aiKeyNotSet')}</p>
        {msg && <p className="mt-1 text-[12px] text-rose-400">{msg}</p>}
      </div>
      <div className="shrink-0 flex gap-2">
        <input
          type="password"
          autoComplete="off"
          aria-label={t(label)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={2048}
          placeholder={saved ? '••••••••' : ''}
          className={`${field} w-[220px] font-mono`}
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
  builtInSnippetCount: number;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, builtInSnippetCount }) => {
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
    <div className="animate-fade-in flex flex-col flex-1 h-full min-w-0 bg-nv-editor select-none">
      <header className="flex items-center gap-4 h-12 px-6 border-b border-nv-border shrink-0">
        <h1 className="text-[16px] font-normal text-zinc-100">{t('setTitle')}</h1>
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

      <div className="flex flex-1 min-h-0">
        <nav aria-label={t('setTitle')} className="w-56 shrink-0 border-r border-nv-border bg-nv-side p-2 overflow-y-auto">
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
                className={`w-full flex items-center gap-2.5 h-8 px-2.5 rounded text-[13px] text-left transition-colors ${
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

        <main className="flex-1 min-w-0 overflow-y-auto px-8 py-5">
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
                {(current.id === 'editor' || current.id === 'snippets') && <EditorPreview />}
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
                {current.id === 'snippets' && <SnippetManager builtInCount={builtInSnippetCount} />}
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
