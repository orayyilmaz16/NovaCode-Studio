import React, { useEffect, useState } from 'react';
import { LogOut, Copy, Check, Loader2, UserPlus } from 'lucide-react';
import { t } from '../i18n/uiText';
import { useGithubAuth } from '../services/useGithubAuth';

const Github: React.FC<{ size?: number; className?: string }> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

type Pending = { userCode: string; verificationUri: string } | null;

export const GithubAccount: React.FC = () => {
  const { auth, ready, refresh, available } = useGithubAuth();
  const api = window.electronAPI?.github;
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Cihaz akışı sonucu (onay / ret / süre doldu) ana süreçten gerçek zamanlı gelir.
  useEffect(() => {
    if (!api) return;
    return api.onAuth((ev) => {
      if (ev.state === 'connected') {
        setPending(null);
        setError(null);
      } else if (ev.state === 'error') {
        setPending(null);
        setError(ev.error === 'denied' ? t('ghDenied') : ev.error === 'expired' ? t('ghExpired') : t('ghLoginFailed'));
      }
    });
  }, [api]);

  if (!available || !ready) return null;

  const login = async () => {
    setBusy(true);
    setError(null);
    const res = await api!.login();
    setBusy(false);
    if (res.success && res.userCode && res.verificationUri) {
      setPending({ userCode: res.userCode, verificationUri: res.verificationUri });
      setCopied(true); // ana süreç kodu otomatik kopyaladı
      setTimeout(() => setCopied(false), 1500);
    } else {
      setError(res.error === 'client-id-missing' ? t('ghNotConfigured') : t('ghLoginFailed'));
      void refresh();
    }
  };

  const cancel = async () => {
    await api!.cancel();
    setPending(null);
  };

  const copyCode = async () => {
    if (!pending) return;
    try {
      await navigator.clipboard.writeText(pending.userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* pano erişimi yoksa kod ekranda görünür kalır */
    }
  };

  const btn = 'flex items-center justify-center gap-1.5 py-1.5 rounded font-medium transition-colors cursor-pointer text-xs';

  return (
    <div className="p-3 border-b border-zinc-800/80 text-xs bg-nv-side">
      <div className="flex items-center gap-2 mb-2 text-zinc-200 font-semibold">
        <Github size={14} className="text-zinc-300" />
        <span>{t('ghTitle')}</span>
      </div>

      {auth.connected && auth.profile ? (
        <div className="flex items-center gap-2">
          {auth.profile.avatarUrl && (
            <img src={auth.profile.avatarUrl} alt="" className="w-7 h-7 rounded-full border border-zinc-700" referrerPolicy="no-referrer" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-zinc-100">{auth.profile.name || auth.profile.login}</div>
            <div className="truncate text-zinc-500">@{auth.profile.login}</div>
          </div>
          <button onClick={() => api!.logout()} title={t('ghDisconnect')} aria-label={t('ghDisconnect')} className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <LogOut size={14} />
          </button>
        </div>
      ) : pending ? (
        <div className="space-y-2">
          <p className="text-zinc-400">{t('ghCodeHint')}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-center text-lg tracking-widest font-mono py-1.5 rounded bg-nv-editor border border-zinc-700 text-indigo-300 select-all">
              {pending.userCode}
            </code>
            <button onClick={copyCode} title={t('ghCopyCode')} aria-label={t('ghCopyCode')} className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 size={12} className="animate-spin" />
            <span className="flex-1">{t('ghWaiting')}</span>
            <button onClick={cancel} className="text-zinc-400 hover:text-zinc-100 underline">
              {t('ghCancel')}
            </button>
          </div>
        </div>
      ) : !auth.hasClientId ? (
        <p className="text-amber-300/90 leading-relaxed">{t('ghNotConfigured')}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-zinc-500 leading-relaxed">{t('ghSignInForLive')}</p>
          <p className="text-[11px] text-zinc-500 leading-relaxed">{t('ghScopes')}</p>
          <button onClick={login} disabled={busy} className={`${btn} w-full bg-zinc-100 hover:bg-white text-zinc-900 disabled:opacity-60`}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
            <span>{t('ghConnect')}</span>
          </button>
          <button
            onClick={() => api!.openExternal('https://github.com/signup')}
            className={`${btn} w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200`}
          >
            <UserPlus size={14} />
            <span>{t('ghCreateAccount')}</span>
          </button>
          <p className="text-[10px] text-zinc-600 leading-relaxed">{auth.canStoreToken ? t('ghPrivacy') : t('ghNoSecureStore')}</p>
        </div>
      )}

      {error && <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded px-2 py-1">{error}</div>}
    </div>
  );
};
