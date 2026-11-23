import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Folder, KeyRound, Pencil, Plug, RefreshCcw, Server, ShieldAlert, Trash2, X } from 'lucide-react';
import { t } from '../i18n/uiText';
import { type RemoteTextKey } from '../i18n/uiTextRemote';
import '../i18n/uiTextRemote'; // uzak sunucu metinleri (gecikmeli yüklenen ek sözlük)
import { useFocusTrap } from '../services/useFocusTrap';
import type { FileItem, SshEvent, SshHost } from '../types';

type OpenResult = { rootPath: string; rootName: string; trusted?: boolean; remote?: { hostId: string; name: string }; tree: FileItem[] };
type View = 'list' | 'edit' | 'secret' | 'connecting' | 'hostkey' | 'changed' | 'folder';
type Form = { id?: string; name: string; host: string; port: string; user: string; auth: SshHost['auth']; keyPath: string; keyName: string; root: string };

const EMPTY: Form = { name: '', host: '', port: '22', user: '', auth: 'agent', keyPath: '', keyName: '', root: '' };
const tx = (k: RemoteTextKey, h = '') => t(k).replace('{h}', h);

// Ana süreçten gelen hata kodu -> yerelleştirilmiş metin anahtarı (ham hata metni arayüze sızmaz)
const ERR: Record<string, RemoteTextKey> = {
  'auth-failed': 'rmErrAuth', 'secret-required': 'rmErrAuth', passphrase: 'rmErrPass', 'host-not-found': 'rmErrNotFound', refused: 'rmErrRefused',
  timeout: 'rmErrTimeout', unreachable: 'rmErrUnreachable', 'no-agent': 'rmErrAgent', 'bad-key': 'rmErrKey', 'host-key-rejected': 'rmErrReject',
  'no-ssh2': 'rmErrNoLib', 'invalid-host': 'rmErrInvalid', 'key-not-picked': 'rmErrInvalid', 'no-folder': 'rmErrFolder', 'not-a-folder': 'rmErrFolder', 'bad-path': 'rmErrFolder'
};
const errKey = (code?: string): RemoteTextKey => (code && ERR[code]) || 'rmErrGeneric';

const field = 'h-8 w-full px-2.5 rounded-md bg-nv-input text-[12.5px] text-zinc-100 outline-none border border-transparent focus:border-indigo-500 placeholder:text-zinc-500';
const btn = 'motion-press h-8 px-3 rounded-md text-[12.5px] flex items-center justify-center gap-1.5 whitespace-nowrap';
const btnGhost = `${btn} bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200`;
const btnPrimary = `${btn} bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50`;

// Modül düzeyinde: render içinde tanımlanırsa her tuş vuruşunda yeniden oluşur ve girdi odağını kaybeder.
const Label: React.FC<{ k: RemoteTextKey; children: React.ReactNode }> = ({ k, children }) => (
  <label className="block"><span className="block mb-1 text-[11.5px] text-zinc-400">{tx(k)}</span>{children}</label>
);

interface Props {
  onClose: () => void;
  /** Klasör açıldı: App çalışma alanını uygular. */
  onOpened: (result: OpenResult) => void;
}

// VS Code "Remote - SSH" benzeri: sunucu listesi -> bağlan (parmak izi onayı) -> uzak klasör seç.
// Parola ve anahtar parolası yalnız bu bileşenin geçici durumunda ve ana süreçte kalır; kaydedilmez, kapanınca silinir.
export const RemoteDialog: React.FC<Props> = ({ onClose, onOpened }) => {
  const api = window.electronAPI?.ssh;
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>('list');
  const [hosts, setHosts] = useState<SshHost[]>([]);
  const [available, setAvailable] = useState(true);
  const [err, setErr] = useState<RemoteTextKey | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [sel, setSel] = useState<SshHost | null>(null);
  const [secret, setSecret] = useState('');
  const [hk, setHk] = useState<Extract<SshEvent, { type: 'hostkey' }> | null>(null);
  const [changed, setChanged] = useState<Extract<SshEvent, { type: 'hostkey-changed' }> | null>(null);
  const [listing, setListing] = useState<{ path: string; parent: string | null; dirs: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  // Bağlanma sürerken kapatılırsa bekleyen parmak izi isteği reddedilir (ana süreç 90 sn sonra da düşürür)
  const hkRef = useRef(hk);
  hkRef.current = hk;
  const close = useCallback(() => {
    if (hkRef.current) void api?.hostKeyAnswer(hkRef.current.reqId, false);
    setSecret('');
    onClose();
  }, [api, onClose]);
  useFocusTrap(ref, true, close);

  const reload = useCallback(async () => {
    if (!api) return;
    const s = await api.status();
    setHosts(s.hosts);
    setAvailable(s.available);
  }, [api]);
  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    if (!api) return;
    return api.onEvent((ev) => {
      if (ev.type === 'hostkey') { setHk(ev); setView('hostkey'); }
      else if (ev.type === 'hostkey-changed') setChanged(ev);
      else if (ev.type === 'disconnected') void reload();
    });
  }, [api, reload]);

  if (!api) return null;

  const browse = async (h: SshHost, dir?: string) => {
    setBusy(true);
    const r = await api.browse(h.id, dir);
    setBusy(false);
    if (r.success && r.path) { setListing({ path: r.path, parent: r.parent ?? null, dirs: r.dirs ?? [] }); setErr(null); setView('folder'); }
    else { setErr(errKey(r.error)); if (!listing) setView('list'); }
  };

  const connect = async (h: SshHost, pw: string) => {
    setSel(h); setErr(null); setChanged(null); setView('connecting');
    const r = await api.connect(h.id, pw);
    setSecret('');
    setHk(null);
    if (r.success) { await reload(); await browse(h, h.root || r.home); return; }
    if (r.error === 'host-key-changed') { setView('changed'); return; }
    setErr(errKey(r.error));
    setView(h.auth !== 'agent' && (r.error === 'auth-failed' || r.error === 'passphrase' || r.error === 'secret-required') ? 'secret' : 'list');
  };

  const start = (h: SshHost) => {
    if (h.connected) void browse(h, h.root || undefined);
    else if (h.auth === 'agent') void connect(h, '');
    else { setSel(h); setSecret(''); setErr(null); setView('secret'); }
  };

  const answerKey = async (allow: boolean) => {
    if (!hk) return;
    await api.hostKeyAnswer(hk.reqId, allow);
    setHk(null);
    setView('connecting'); // izin verildiyse bağlanma sürer; reddedilirse connect() dönüşü hatayı gösterir
  };

  const saveHost = async () => {
    setBusy(true);
    const r = await api.hostSave({ id: form.id, name: form.name || form.host, host: form.host, port: Number(form.port) || 22, user: form.user, auth: form.auth, keyPath: form.auth === 'key' ? form.keyPath : undefined, root: form.root });
    setBusy(false);
    if (!r.success) { setErr(errKey(r.error)); return; }
    setErr(null);
    await reload();
    setView('list');
  };

  const pickKey = async () => {
    const r = await api.pickKey();
    if (r.success && r.path) setForm((f) => ({ ...f, keyPath: r.path as string, keyName: r.name ?? '' }));
  };

  const openHere = async () => {
    if (!sel || !listing) return;
    setBusy(true);
    const r = await api.open(sel.id, listing.path);
    setBusy(false);
    if ('error' in r) { setErr(errKey(r.error)); return; }
    onOpened(r);
    close();
  };

  const edit = (h?: SshHost) => {
    setErr(null);
    setForm(h ? { id: h.id, name: h.name, host: h.host, port: String(h.port), user: h.user, auth: h.auth, keyPath: '', keyName: h.keyName, root: h.root } : EMPTY);
    setView('edit');
  };

  const title = view === 'folder' ? tx('rmFolderTitle') : tx('rmTitle');
  const sub = sel?.name ?? '';
  const formValid = !!form.host.trim() && !!form.user.trim() && (form.auth !== 'key' || !!form.keyName);

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/50 px-4" onMouseDown={(e) => { if (e.target === e.currentTarget && view !== 'connecting') close(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={tx('rmTitle')} className="animate-dialog w-[min(560px,94vw)] max-h-[86vh] flex flex-col rounded-xl border border-nv-border bg-nv-side overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-12 border-b border-nv-border shrink-0">
          <Server size={16} className="text-indigo-400 shrink-0" />
          <h2 className="text-[13.5px] font-medium text-zinc-100 truncate">{title}{view === 'folder' && sub ? <span className="text-zinc-400 font-normal"> · {sub}</span> : null}</h2>
          <button className="icon-btn ms-auto" onClick={close} aria-label={tx('rmCancel')}><X size={15} /></button>
        </div>

        <div className="p-4 min-h-0 overflow-y-auto space-y-3">
          {!available && <p role="alert" className="text-[12.5px] text-amber-300 leading-relaxed">{tx('rmErrNoLib')}</p>}
          {err && <p role="alert" className="text-[12.5px] text-rose-300 leading-relaxed">{tx(err)}</p>}

          {view === 'list' && (
            <>
              <div className="text-[11.5px] uppercase tracking-wide text-zinc-500">{tx('rmHosts')}</div>
              {hosts.length === 0 && <p className="text-[12.5px] text-zinc-400">{tx('rmNone')}</p>}
              <ul className="space-y-1">
                {hosts.map((h) => (
                  <li key={h.id} className="group flex items-center gap-1 rounded-md hover:bg-nv-hover">
                    <button className="motion-press flex-1 min-w-0 flex items-center gap-2.5 h-11 px-2.5 text-start" onClick={() => start(h)}>
                      <Plug size={15} className={h.connected ? 'text-emerald-400 shrink-0' : 'text-zinc-500 shrink-0'} />
                      <span className="min-w-0">
                        <span className="block text-[13px] text-zinc-100 truncate">{h.name}</span>
                        <span className="block text-[11.5px] text-zinc-500 font-mono truncate">{h.user}@{h.host}{h.port !== 22 ? `:${h.port}` : ''}</span>
                      </span>
                    </button>
                    <button className="icon-btn" onClick={() => edit(h)} aria-label={tx('rmEdit')} title={tx('rmEdit')}><Pencil size={14} /></button>
                    <button className="icon-btn me-1" onClick={async () => { await api.hostRemove(h.id); await reload(); }} aria-label={tx('rmDelete')} title={tx('rmDelete')}><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed">{tx('rmPrivacy')}</p>
            </>
          )}

          {view === 'edit' && (
            <div className="space-y-3">
              <Label k="rmName"><input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} data-autofocus /></Label>
              <div className="grid grid-cols-[1fr_88px] gap-2">
                <Label k="rmHost"><input className={`${field} font-mono`} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="example.com" spellCheck={false} autoCapitalize="off" dir="ltr" /></Label>
                <Label k="rmPort"><input className={`${field} font-mono`} value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value.replace(/\D/g, '').slice(0, 5) })} inputMode="numeric" dir="ltr" /></Label>
              </div>
              <Label k="rmUser"><input className={`${field} font-mono`} value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} spellCheck={false} autoCapitalize="off" dir="ltr" /></Label>
              <Label k="rmAuth">
                <select className={field} value={form.auth} onChange={(e) => setForm({ ...form, auth: e.target.value as Form['auth'] })}>
                  <option value="agent">{tx('rmAuthAgent')}</option>
                  <option value="key">{tx('rmAuthKey')}</option>
                  <option value="password">{tx('rmAuthPassword')}</option>
                </select>
              </Label>
              {form.auth === 'key' && (
                <div className="flex items-center gap-2">
                  <button className={btnGhost} onClick={() => void pickKey()}><KeyRound size={14} />{tx('rmPickKey')}</button>
                  <span className="text-[12px] text-zinc-400 font-mono truncate">{form.keyName || tx('rmKeyNone')}</span>
                </div>
              )}
              <Label k="rmStartDir"><input className={`${field} font-mono`} value={form.root} onChange={(e) => setForm({ ...form, root: e.target.value })} placeholder="/home/user/project" spellCheck={false} dir="ltr" /></Label>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed">{tx('rmPrivacy')}</p>
            </div>
          )}

          {view === 'secret' && sel && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void connect(sel, secret); }}>
              <p className="text-[12.5px] text-zinc-300 font-mono" dir="ltr">{sel.user}@{sel.host}</p>
              <Label k={sel.auth === 'key' ? 'rmPassphrase' : 'rmPassword'}>
                <input className={field} type="password" value={secret} onChange={(e) => setSecret(e.target.value)} autoComplete="off" spellCheck={false} data-autofocus />
              </Label>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed">{tx('rmSecretNote')}</p>
              <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
            </form>
          )}

          {view === 'connecting' && (
            <div className="flex items-center gap-3 py-6 justify-center text-[13px] text-zinc-300" role="status">
              <RefreshCcw size={15} className="animate-spin text-indigo-400" />{tx('rmConnecting', sel?.name ?? '')}
            </div>
          )}

          {view === 'hostkey' && hk && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ShieldAlert size={20} className="text-amber-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-medium text-zinc-100">{tx('rmHkTitle')}</h3>
                  <p className="mt-1 text-[12.5px] text-zinc-400 leading-relaxed">{tx('rmHkBody', `${hk.host}${hk.port !== 22 ? `:${hk.port}` : ''}`)}</p>
                </div>
              </div>
              <div className="rounded-md bg-nv-input px-3 py-2">
                <div className="text-[11px] text-zinc-500 mb-0.5">{tx('rmHkFp')}</div>
                <code className="block text-[12px] font-mono text-zinc-100 break-all select-all" dir="ltr">{hk.fingerprint}</code>
              </div>
            </div>
          )}

          {view === 'changed' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ShieldAlert size={20} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-medium text-rose-300">{tx('rmHkChangedTitle')}</h3>
                  <p className="mt-1 text-[12.5px] text-zinc-400 leading-relaxed">{tx('rmHkChangedBody', sel?.host ?? '')}</p>
                </div>
              </div>
              {changed && (
                <div className="rounded-md bg-nv-input px-3 py-2 space-y-1.5" dir="ltr">
                  <code className="block text-[11.5px] font-mono text-zinc-400 break-all">− {changed.expected}</code>
                  <code className="block text-[11.5px] font-mono text-zinc-100 break-all">+ {changed.fingerprint}</code>
                </div>
              )}
            </div>
          )}

          {view === 'folder' && listing && sel && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button className="icon-btn" disabled={!listing.parent || busy} onClick={() => listing.parent && void browse(sel, listing.parent)} aria-label={tx('rmUp')} title={tx('rmUp')}><ArrowUp size={15} /></button>
                <code className="flex-1 min-w-0 truncate rounded-md bg-nv-input px-2.5 py-1.5 text-[12px] font-mono text-zinc-200" dir="ltr" title={listing.path}>{listing.path}</code>
              </div>
              <ul className="max-h-[38vh] overflow-y-auto rounded-md border border-nv-border">
                {listing.dirs.length === 0 && <li className="px-3 py-3 text-[12.5px] text-zinc-500">{tx('rmNoSub')}</li>}
                {listing.dirs.map((d) => (
                  <li key={d}>
                    <button className="motion-press w-full flex items-center gap-2 h-8 px-3 text-start text-[12.5px] text-zinc-200 hover:bg-nv-hover" onClick={() => void browse(sel, `${listing.path === '/' ? '' : listing.path}/${d}`)}>
                      <Folder size={14} className="text-indigo-300 shrink-0" /><span className="truncate" dir="ltr">{d}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed">{tx('rmLimits')}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 px-4 py-3 border-t border-nv-border shrink-0">
          {view === 'list' && <button className={btnPrimary} onClick={() => edit()}><Server size={14} />{tx('rmAdd')}</button>}
          {view === 'edit' && (<>
            <button className={btnGhost} onClick={() => { setErr(null); setView('list'); }}>{tx('rmBack')}</button>
            <button className={btnPrimary} disabled={!formValid || busy} onClick={() => void saveHost()}>{tx('rmSave')}</button>
          </>)}
          {view === 'secret' && sel && (<>
            <button className={btnGhost} onClick={() => { setSecret(''); setErr(null); setView('list'); }}>{tx('rmBack')}</button>
            <button className={btnPrimary} disabled={sel.auth === 'password' && !secret} onClick={() => void connect(sel, secret)}>{tx('rmConnectBtn')}</button>
          </>)}
          {view === 'hostkey' && (<>
            <button className={btnGhost} onClick={() => void answerKey(false)}>{tx('rmCancel')}</button>
            <button className={btnPrimary} onClick={() => void answerKey(true)}>{tx('rmHkTrust')}</button>
          </>)}
          {view === 'changed' && sel && (<>
            <button className={btnGhost} onClick={() => setView('list')}>{tx('rmBack')}</button>
            <button className={btnGhost} onClick={async () => { await api.forgetHostKey(sel.id); setChanged(null); setErr(null); setView('list'); }}>{tx('rmForget')}</button>
          </>)}
          {view === 'folder' && sel && (<>
            <button className={btnGhost} onClick={async () => { await api.disconnect(sel.id); await reload(); setListing(null); setView('list'); }}>{tx('rmDisconnect')}</button>
            <button className={btnPrimary} disabled={busy} onClick={() => void openHere()}>{tx('rmOpenHere')}</button>
          </>)}
        </div>
      </div>
    </div>
  );
};
