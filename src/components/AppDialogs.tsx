import React, { useRef } from 'react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextComp';
import { useFocusTrap } from '../services/useFocusTrap';

export type UnsavedChoice = 'save' | 'discard' | 'cancel';

interface ShellProps {
  title: string;
  onEscape: () => void;
  children: React.ReactNode;
  actions: React.ReactNode;
}

// Düz yüzey, tek kenarlık; gölge yok. Katman: Ayarlar (150) üstünde.
const Shell: React.FC<ShellProps> = ({ title, onEscape, children, actions }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onEscape);
  return (
    <div className="app-no-drag fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 animate-editor-in">
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="animate-dialog w-[min(440px,100%)] rounded-xl border border-nv-border bg-nv-editor p-5 text-zinc-300"
      >
        <h2 className="mb-2 text-[15px] font-medium text-zinc-100">{title}</h2>
        <div className="mb-5 text-[13px] leading-relaxed text-zinc-400">{children}</div>
        <div className="flex flex-wrap justify-end gap-2">{actions}</div>
      </div>
    </div>
  );
};

/** Kaydedilmemiş değişiklik onayı: Kaydet / Kaydetme / İptal. */
export const UnsavedDialog: React.FC<{ names: string[]; hasUntitled: boolean; onChoose: (c: UnsavedChoice) => void }> = ({ names, hasUntitled, onChoose }) => (
  <Shell title={t('appUnsavedTitle')} onEscape={() => onChoose('cancel')} actions={
    <>
      <button className="btn-ghost" onClick={() => onChoose('cancel')}>{t('appCancel')}</button>
      <button className="btn-ghost" onClick={() => onChoose('discard')}>{t('appDontSave')}</button>
      <button data-autofocus className="btn-primary" onClick={() => onChoose('save')}>{t('appSaveBtn')}</button>
    </>
  }>
    <p>{names.length === 1 ? t('appUnsavedOne').replace('{n}', names[0]) : t('appUnsavedMany').replace('{n}', String(names.length))}</p>
    {names.length > 1 && (
      <ul className="mt-2 max-h-28 overflow-y-auto font-mono text-[12px] text-zinc-300">
        {names.slice(0, 8).map((n, i) => <li key={`${n}-${i}`} className="truncate">{n}</li>)}
        {names.length > 8 && <li className="text-zinc-500">…</li>}
      </ul>
    )}
    {hasUntitled && <p className="mt-2 text-[12px] text-zinc-500">{t('appUntitledNote')}</p>}
  </Shell>
);

/** Açılışta önceki oturumu geri yükleme önerisi (kullanıcı onayı olmadan hiçbir klasör/dosya açılmaz). */
export const RestoreSessionDialog: React.FC<{ tabs: number; unsaved: number; onRestore: () => void; onDismiss: () => void }> = ({ tabs, unsaved, onRestore, onDismiss }) => (
  <Shell title={t('appRestoreTitle')} onEscape={onDismiss} actions={
    <>
      <button className="btn-ghost" onClick={onDismiss}>{t('appRestoreDismiss')}</button>
      <button data-autofocus className="btn-primary" onClick={onRestore}>{t('appRestoreBtn')}</button>
    </>
  }>
    <p>{t('appRestoreBody').replace('{n}', String(tabs)).replace('{m}', String(unsaved))}</p>
  </Shell>
);
