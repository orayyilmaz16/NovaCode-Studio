import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpCircle, Check, Download, Loader2, Palette, Puzzle, RefreshCw, Search as SearchIcon, Trash2, Braces } from 'lucide-react';
import { t, type UiTextKey } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { checkUpdates, extThemeName, installExt, uninstallExt, useExtensions, type StoreItem } from '../services/extensionsService';

type Tab = 'installed' | 'store';
type Cat = '' | 'Themes' | 'Snippets';

const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
const errKey = (e?: string): UiTextKey => (e === 'runs-code' ? 'extErrRunsCode' : e === 'nothing-supported' ? 'extErrNothing' : e === 'too-big' ? 'extErrTooBig' : 'extErrFailed');

const Icon: React.FC<{ src?: string }> = ({ src }) =>
  src ? (
    <img src={src} alt="" referrerPolicy="no-referrer" loading="lazy" className="w-9 h-9 rounded object-cover bg-zinc-800 shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded bg-zinc-800 flex items-center justify-center shrink-0"><Puzzle size={16} className="text-zinc-500" /></div>
  );

export const ExtensionsPanel: React.FC = () => {
  const { values, set: setSetting } = useSettings();
  const { installed, updates, busy, checking } = useExtensions();
  const api = window.electronAPI?.ext;
  const [tab, setTab] = useState<Tab>('installed');
  const [cat, setCat] = useState<Cat>('Themes');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<StoreItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [netErr, setNetErr] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const seq = useRef(0);
  const extTheme = String(values.extTheme || '');
  const updateIds = Object.keys(updates);

  const search = useCallback(async (offset: number) => {
    if (!api) return;
    const my = ++seq.current;
    setLoading(true);
    setNetErr(false);
    const res = await api.search({ query, category: cat, offset }).catch(() => ({ success: false, items: [] as StoreItem[], total: 0 }));
    if (seq.current !== my) return;
    setLoading(false);
    if (!res.success) { setNetErr(true); if (offset === 0) setItems([]); return; }
    setTotal(res.total);
    setItems((prev) => (offset === 0 ? res.items : [...prev, ...res.items]));
  }, [api, query, cat]);

  // Mağaza sekmesi: yazarken 400 ms gecikmeli ara
  useEffect(() => {
    if (tab !== 'store') return;
    const id = setTimeout(() => void search(0), 400);
    return () => clearTimeout(id);
  }, [tab, query, cat, search]);

  // Panel açılınca (bir kez) güncellemeleri denetle
  useEffect(() => { void checkUpdates(); }, []);

  const doInstall = async (it: { namespace: string; name: string; id: string }) => {
    setMsg(null);
    const res = await installExt(it);
    setMsg(res.success ? (res.partial ? t('extPartial') : t('extInstalledOk')) : t(errKey(res.error)));
  };

  if (!api) {
    return <div className="p-4 text-[12px] text-zinc-400">{t('extDesktopOnly')}</div>;
  }

  const isInstalled = (id: string) => installed.some((e) => e.id === id);
  const seg = (on: boolean) => `flex-1 h-6 text-[12px] rounded transition-colors ${on ? 'bg-nv-active text-zinc-50' : 'text-zinc-400 hover:bg-nv-hover'}`;
  const chip = (on: boolean) => `px-2 h-5 rounded-full text-[11px] border transition-colors ${on ? 'border-indigo-500 text-indigo-300 bg-nv-active' : 'border-zinc-700 text-zinc-400 hover:bg-nv-hover'}`;
  const btn = 'h-6 px-2 rounded text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50';

  return (
    <div className="flex flex-col h-full min-h-0 text-[12px]">
      <div className="h-9 flex items-center pl-4 text-[11px] uppercase tracking-wide text-zinc-400 shrink-0">{t('extTitle')}</div>
      <div className="px-3 pb-2 space-y-2 shrink-0">
        <div className="flex gap-1 p-0.5 rounded bg-nv-input/60">
          <button className={seg(tab === 'installed')} onClick={() => setTab('installed')}>{t('extInstalled')}{installed.length ? ` (${installed.length})` : ''}</button>
          <button className={seg(tab === 'store')} onClick={() => setTab('store')}>{t('extStore')}</button>
        </div>
        {tab === 'store' && (
          <>
            <div className="flex items-center gap-1.5 bg-nv-input border border-zinc-700 rounded px-2 h-7 focus-within:border-indigo-500">
              <SearchIcon size={12} className="text-zinc-500 shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('extSearchPlaceholder')} aria-label={t('extSearchPlaceholder')} className="flex-1 min-w-0 bg-transparent outline-none text-zinc-200" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button className={chip(cat === 'Themes')} onClick={() => setCat('Themes')}>{t('extThemes')}</button>
              <button className={chip(cat === 'Snippets')} onClick={() => setCat('Snippets')}>{t('extSnippets')}</button>
            </div>
          </>
        )}
        {tab === 'installed' && (
          <div className="flex gap-1.5">
            <button className={`${btn} bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200`} disabled={checking} onClick={() => void checkUpdates()}>
              {checking ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}{t('extCheckUpdates')}
            </button>
            {updateIds.length > 0 && (
              <button className={`${btn} bg-indigo-600 hover:bg-indigo-500 text-white`} onClick={async () => { for (const id of updateIds) { const e = installed.find((x) => x.id === id); if (e) await installExt(e); } }}>
                <ArrowUpCircle size={12} />{t('extUpdateAll')}
              </button>
            )}
          </div>
        )}
        {msg && <p className="text-amber-300 leading-snug">{msg}</p>}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 pb-2">
        {tab === 'installed' && (
          installed.length === 0 ? (
            <p className="px-2 text-zinc-500 leading-relaxed">{t('extNoInstalled')}</p>
          ) : (
            installed.map((e) => (
              <div key={e.id} className="p-2 mb-1.5 rounded border border-zinc-800 hover:border-zinc-700 min-w-0">
                <div className="flex gap-2 min-w-0">
                  <Icon src={e.icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-zinc-100 truncate font-medium">{e.displayName}</span>
                      <span className="text-zinc-500 shrink-0">{e.version}</span>
                    </div>
                    <div className="text-zinc-500 truncate">{e.id}</div>
                    <div className="text-zinc-400 flex gap-2 mt-0.5">
                      {e.themes.length > 0 && <span className="flex items-center gap-1"><Palette size={11} />{t('extThemeCount').replace('{n}', String(e.themes.length))}</span>}
                      {e.snippets.length > 0 && <span className="flex items-center gap-1"><Braces size={11} />{t('extSnippetCount').replace('{n}', String(e.snippets.reduce((n, g) => n + g.items.length, 0)))}</span>}
                    </div>
                  </div>
                </div>
                {e.themes.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {e.themes.map((th) => {
                      const name = extThemeName(e.id, th.label);
                      const on = extTheme === name;
                      return (
                        <button key={name} onClick={() => setSetting('extTheme', on ? '' : name)} title={on ? t('extResetTheme') : t('extApplyTheme')} className={`${btn} border ${on ? 'border-indigo-500 bg-nv-active text-zinc-50' : 'border-zinc-700 text-zinc-300 hover:bg-nv-hover'} max-w-full`}>
                          {on && <Check size={11} />}<span className="truncate">{th.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="mt-1.5 flex gap-1.5">
                  {updates[e.id] && (
                    <button className={`${btn} bg-indigo-600 hover:bg-indigo-500 text-white`} disabled={busy.includes(e.id)} onClick={() => void doInstall(e)}>
                      {busy.includes(e.id) ? <Loader2 size={12} className="animate-spin" /> : <ArrowUpCircle size={12} />}{t('extUpdateTo').replace('{v}', updates[e.id])}
                    </button>
                  )}
                  <button className={`${btn} text-zinc-400 hover:text-rose-300 hover:bg-nv-hover`} onClick={() => { if (e.themes.some((th) => extThemeName(e.id, th.label) === extTheme)) setSetting('extTheme', ''); void uninstallExt(e.id); }}>
                    <Trash2 size={12} />{t('extUninstall')}
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {tab === 'store' && (
          <>
            {netErr && <p className="px-2 text-rose-300">{t('extNetworkErr')}</p>}
            {!netErr && !loading && items.length === 0 && <p className="px-2 text-zinc-500">{t('cpNoResults')}</p>}
            {items.map((it) => (
              <div key={it.id} className="flex gap-2 p-2 mb-1.5 rounded border border-zinc-800 hover:border-zinc-700 min-w-0">
                <Icon src={it.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-zinc-100 truncate font-medium">{it.displayName}</span>
                    <span className="text-zinc-500 shrink-0">{it.version}</span>
                  </div>
                  <div className="text-zinc-400 line-clamp-2 leading-snug">{it.description}</div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-zinc-500 flex items-center gap-1 truncate"><Download size={11} />{t('extDownloads').replace('{n}', fmt(it.downloads))}</span>
                    {isInstalled(it.id) ? (
                      <span className="text-emerald-400 flex items-center gap-1 shrink-0"><Check size={12} />{t('extInstalled')}</span>
                    ) : (
                      <button className={`${btn} bg-indigo-600 hover:bg-indigo-500 text-white shrink-0`} disabled={busy.includes(it.id)} onClick={() => void doInstall(it)}>
                        {busy.includes(it.id) ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}{t('extInstall')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-center py-3 text-zinc-500"><Loader2 size={14} className="animate-spin" /></div>}
            {!loading && items.length > 0 && items.length < total && (
              <button className={`${btn} mx-auto bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200`} onClick={() => void search(items.length)}>{t('extLoadMore')}</button>
            )}
          </>
        )}
      </div>
      <p className="px-3 py-2 border-t border-nv-border text-[10px] leading-snug text-zinc-500 shrink-0">{t('extNote')}</p>
    </div>
  );
};
