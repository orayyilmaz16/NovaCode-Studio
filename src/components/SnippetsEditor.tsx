import React, { useEffect, useRef, useState } from 'react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextDev';
import { useFocusTrap } from '../services/useFocusTrap';

type Scope = 'user' | 'workspace';

const SAMPLE = `{
  "Log": {
    "prefix": "clg",
    "body": ["console.log($1);", "$0"],
    "description": "console.log",
    "language": "javascript"
  }
}
`;

/** Snippet ekle/düzenle: genel dosya (userData) veya çalışma klasörü .nova/snippets.json. Doğrulama ana süreçte yapılır. */
export const SnippetsEditor: React.FC<{ hasFolder: boolean; onSaved: () => void; onClose: () => void }> = ({ hasFolder, onSaved, onClose }) => {
  const api = window.electronAPI?.snippets;
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  const [scope, setScope] = useState<Scope>('user');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMsg(null);
    if (!api) return;
    if (scope === 'workspace' && !hasFolder) { setText(''); setMsg({ ok: false, text: t('snNoFolder') }); return; }
    let live = true;
    void api.read(scope).then((r) => { if (live) setText(r.success ? (r.text?.trim() ? r.text : SAMPLE) : ''); });
    return () => { live = false; };
  }, [api, scope, hasFolder]);

  const save = async () => {
    if (!api || busy) return;
    setBusy(true);
    try {
      const r = await api.save(scope, text);
      if (r.success) {
        setMsg({ ok: true, text: t('snSaved').replace('{n}', String(r.count ?? 0)) });
        onSaved();
      } else if (r.error === 'no-folder') setMsg({ ok: false, text: t('snNoFolder') });
      else if (r.error === 'invalid') setMsg({ ok: false, text: t('snInvalid').replace('{e}', (r.errors ?? []).slice(0, 3).join(', ')) });
      else setMsg({ ok: false, text: t('snFailed') });
    } finally {
      setBusy(false);
    }
  };

  const scopeBtn = (id: Scope, label: string) => (
    <button onClick={() => setScope(id)} className={`motion-fade px-3 h-7 rounded text-[12px] ${scope === id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>{label}</button>
  );

  return (
    <div className="app-no-drag fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 animate-editor-in">
      <div ref={ref} role="dialog" aria-modal="true" aria-label={t('snTitle')} className="animate-dialog flex max-h-[85vh] w-[min(640px,100%)] flex-col rounded-xl border border-nv-border bg-nv-editor p-5 text-zinc-300">
        <h2 className="mb-1 text-[15px] font-medium text-zinc-100">{t('snTitle')}</h2>
        <p className="mb-3 text-[12px] leading-relaxed text-zinc-500">{t('snHint')}</p>
        <div className="mb-2 flex flex-wrap gap-1">
          {scopeBtn('user', t('snScopeUser'))}
          {scopeBtn('workspace', t('snScopeWorkspace'))}
        </div>
        <textarea
          data-autofocus
          value={text}
          onChange={(e) => { setText(e.target.value); setMsg(null); }}
          spellCheck={false}
          dir="ltr"
          disabled={!api || (scope === 'workspace' && !hasFolder)}
          className="min-h-[240px] flex-1 resize-none rounded border border-nv-border bg-nv-side p-3 font-mono text-[12px] leading-relaxed text-zinc-200 outline-none focus:border-zinc-500"
        />
        <div className="mt-3 flex items-center justify-end gap-2">
          {msg && <span className={`me-auto text-[12px] ${msg.ok ? 'text-zinc-400' : 'text-red-400'}`} role="status">{msg.text}</span>}
          <button className="btn-ghost" onClick={onClose}>{t('snClose')}</button>
          <button className="btn-primary" disabled={busy || !api || (scope === 'workspace' && !hasFolder)} onClick={() => void save()}>{t('snSave')}</button>
        </div>
      </div>
    </div>
  );
};
