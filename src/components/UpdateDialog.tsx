import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpCircle, CheckCircle2, Download, ExternalLink, Info, Loader2, RefreshCw, X } from 'lucide-react';
import { t } from '../i18n/uiText';
import { Markdown } from './Markdown';
import { checkForUpdates, downloadUpdate, formatBytes, installUpdate, useUpdate } from '../services/updateService';
import type { ReleaseInfo } from '../types';

type Tab = 'update' | 'notes';

// VS Code tarzı güncelleme penceresi: sürüm, notlar, indirme yüzdesi, "yeniden başlat ve güncelle".
export const UpdateDialog: React.FC<{ initialTab: Tab; autoDownload: boolean; onClose: () => void }> = ({ initialTab, autoDownload, onClose }) => {
  const u = useUpdate();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [releases, setReleases] = useState<ReleaseInfo[] | null>(null);
  const [relErr, setRelErr] = useState(false);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  useEffect(() => {
    if (tab !== 'notes' || releases) return;
    void window.electronAPI?.update.releases().then((r) => { if (r.success) setReleases(r.releases); else setRelErr(true); }).catch(() => setRelErr(true));
  }, [tab, releases]);

  const errText = u.error === 'network' ? t('updErrNetwork') : u.error === 'no-release' ? t('updErrNoRelease') : u.error === 'checksum' ? t('updErrChecksum') : t('updErrFailed');
  const btn = 'h-8 px-3 rounded-md text-[12.5px] flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors disabled:opacity-50';
  const primary = `${btn} bg-indigo-600 hover:bg-indigo-500 text-white`;
  const ghost = `${btn} bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200`;
  const tabBtn = (on: boolean) => `h-8 px-3 text-[12.5px] border-b-2 transition-colors ${on ? 'border-indigo-500 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 px-4" onMouseDown={onClose}>
      <div role="dialog" aria-label={t('updTitle')} onMouseDown={(e) => e.stopPropagation()} className="animate-menu w-[min(580px,94vw)] max-h-[82vh] flex flex-col rounded-xl border border-nv-border bg-nv-side shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 pl-4 pr-2 h-11 border-b border-nv-border shrink-0">
          <div className="flex items-center gap-1 min-w-0 h-full">
            <button className={tabBtn(tab === 'update')} onClick={() => setTab('update')}>{t('updTabUpdate')}</button>
            <button className={tabBtn(tab === 'notes')} onClick={() => setTab('notes')}>{t('updTabNotes')}</button>
          </div>
          <button className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover" onClick={onClose} aria-label={t('aiRemove')}><X size={16} /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
          {tab === 'update' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-nv-active flex items-center justify-center shrink-0">
                  {u.status === 'checking' || u.status === 'downloading' ? <Loader2 size={20} className="animate-spin text-indigo-300" />
                    : u.status === 'error' ? <AlertTriangle size={20} className="text-amber-300" />
                    : u.status === 'unsupported' ? <Info size={20} className="text-sky-300" />
                    : u.status === 'available' || u.status === 'ready' ? <ArrowUpCircle size={20} className="text-indigo-300" />
                    : <CheckCircle2 size={20} className="text-emerald-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-zinc-100 break-words">
                    {u.status === 'checking' ? t('updChecking')
                      : u.status === 'available' ? t('updAvailable').replace('{v}', u.latest)
                      : u.status === 'downloading' ? t('updDownloading').replace('{p}', String(u.percent))
                      : u.status === 'ready' ? t('updReady')
                      : u.status === 'error' ? errText
                      : u.status === 'unsupported' ? t('updUnsupported')
                      : t('updUpToDate').replace('{v}', u.current)}
                  </div>
                  <div className="text-[11.5px] text-zinc-500 mt-0.5">
                    {t('updCurrent').replace('{v}', u.current)}{u.checkedAt ? ` · ${t('updLastChecked').replace('{t}', new Date(u.checkedAt).toLocaleTimeString())}` : ''}
                  </div>
                </div>
              </div>

              {u.status === 'downloading' && (
                <div>
                  <div className="h-2 rounded-full bg-zinc-700 overflow-hidden"><div className="h-full bg-indigo-400 transition-[width] duration-300" style={{ width: `${u.percent}%` }} /></div>
                  <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                    <span>%{u.percent}</span>
                    <span>{formatBytes(u.transferred)} / {formatBytes(u.total)}{u.speed ? ` · ${formatBytes(u.speed)}/s` : ''}</span>
                  </div>
                </div>
              )}

              {(u.status === 'available' || u.status === 'downloading' || u.status === 'ready') && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">{t('updTabNotes')}</div>
                  <div className="max-h-56 overflow-y-auto overflow-x-hidden rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                    {u.notes ? <Markdown source={u.notes} compact /> : <span className="text-zinc-500 text-[12px]">{t('updNoNotes')}</span>}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {u.status === 'available' && u.channel === 'stable' && <button className={primary} onClick={() => void downloadUpdate()}><Download size={14} />{t('updDownload')}</button>}
                {u.status === 'available' && u.channel === 'dev' && u.releaseUrl && <button className={primary} onClick={() => void window.electronAPI?.openLink(u.releaseUrl)}><ExternalLink size={14} />{t('updOpenRelease')}</button>}
                {u.status === 'ready' && <button className={primary} onClick={() => void installUpdate()}><RefreshCw size={14} />{t('updRestart')}</button>}
                {(u.status === 'idle' || u.status === 'none' || u.status === 'error') && (u.supported || u.channel === 'dev') && (
                  <button className={primary} onClick={() => void checkForUpdates(autoDownload)}><RefreshCw size={14} />{u.status === 'error' ? t('updRetry') : t('updCheckNow')}</button>
                )}
                <button className={ghost} onClick={onClose}>{u.status === 'available' || u.status === 'ready' ? t('updLater') : t('updClose')}</button>
              </div>
              {u.channel === 'dev' && <p className="text-[11.5px] text-sky-300/90 leading-snug">{t('updDevNote')}</p>}
              <p className="text-[10.5px] text-zinc-500 leading-snug">{t('updPrivacy')}</p>
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-4">
              {!releases && !relErr && <div className="flex items-center gap-2 text-zinc-500 text-[12.5px]"><Loader2 size={14} className="animate-spin" />{t('updChecking')}</div>}
              {relErr && <p className="text-amber-300 text-[12.5px]">{t('updReleasesFailed')}</p>}
              {releases?.length === 0 && <p className="text-zinc-500 text-[12.5px]">{t('updNoNotes')}</p>}
              {releases?.map((r) => (
                <div key={r.version} className="min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="text-[13.5px] font-semibold text-zinc-100 truncate">v{r.version}{r.version === u.current ? <span className="ml-2 text-[10.5px] font-normal px-1.5 py-0.5 rounded-full bg-nv-active text-indigo-200">{t('updInstalledTag')}</span> : null}</div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-500">
                      {r.date && <span>{new Date(r.date).toLocaleDateString()}</span>}
                      {r.url && <button className="hover:text-indigo-300" title={t('updOpenGithub')} aria-label={t('updOpenGithub')} onClick={() => void window.electronAPI?.openLink(r.url)}><ExternalLink size={12} /></button>}
                    </div>
                  </div>
                  <div className="mt-1 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                    {r.notes ? <Markdown source={r.notes} compact /> : <span className="text-zinc-500 text-[12px]">{t('updNoNotes')}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Durum çubuğu göstergesi: yalnız anlamlı durumlarda görünür; üzerine gelince yüzde/boyut, tıklayınca pencere.
export const UpdateIndicator: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const u = useUpdate();
  if (!['available', 'downloading', 'ready', 'checking', 'error'].includes(u.status)) return null;
  const tip = u.status === 'downloading' ? `${t('updStatusProgress').replace('{p}', String(u.percent))} (${formatBytes(u.transferred)} / ${formatBytes(u.total)})`
    : u.status === 'available' ? t('updStatusAvail').replace('{v}', u.latest)
    : u.status === 'ready' ? t('updStatusReady')
    : u.status === 'checking' ? t('updChecking')
    : t('updErrFailed');
  return (
    <button className="status-item" onClick={onOpen} title={tip} aria-label={tip}>
      {u.status === 'checking' ? <Loader2 size={12} className="animate-spin" />
        : u.status === 'downloading' ? <Download size={12} className="text-indigo-300" />
        : u.status === 'error' ? <AlertTriangle size={12} className="text-amber-300" />
        : <ArrowUpCircle size={12} className="text-indigo-300" />}
      {u.status === 'downloading' ? (
        <span className="flex items-center gap-1.5">
          <span className="w-14 h-1 rounded-full bg-zinc-700 overflow-hidden"><span className="block h-full bg-indigo-400" style={{ width: `${u.percent}%` }} /></span>
          <span className="font-mono">%{u.percent}</span>
        </span>
      ) : u.status === 'available' ? <span>v{u.latest}</span>
        : u.status === 'ready' ? <span>{t('updStatusReady')}</span> : null}
    </button>
  );
};
