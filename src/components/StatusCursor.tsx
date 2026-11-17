import React from 'react';
import { TriangleAlert, XCircle } from 'lucide-react';
import { t } from '../i18n/uiText';
import { useProblems } from '../services/problems';
import { useCursor } from '../services/cursorStore';
import { useCompletionState } from '../services/aiCompletion';
import { useLsp } from '../services/lspStore';
import { languageFromName } from '../services/lang';
import { CompletionIcon } from './CompletionIcon';

// Durum çubuğunun sık değişen parçaları kendi aboneliğini taşır: imleç/tanı/LSP değişince yalnız bu küçük bileşenler çizilir,
// 1600 satırlık App değil (P-02).

export const StatusProblems = React.memo(function StatusProblems({ onOpen }: { onOpen: () => void }) {
  const problems = useProblems();
  return (
    <button className="status-item" onClick={onOpen} title={t('prbTip').replace('{e}', String(problems.errors)).replace('{w}', String(problems.warnings))} aria-label={t('prbTab')}>
      <XCircle size={12} className={problems.errors ? 'text-rose-400' : ''} />
      <span>{problems.errors}</span>
      <TriangleAlert size={12} className={problems.warnings ? 'text-amber-300' : ''} />
      <span>{problems.warnings}</span>
    </button>
  );
});

export const StatusCursor = React.memo(function StatusCursor({ onOpen }: { onOpen: () => void }) {
  const cursor = useCursor();
  if (!cursor) return null;
  return (
    <button className="status-item" onClick={onOpen} title={`${t('cmdGoToLine')} (Ctrl+G)`}>
      {t('scmLnCol').replace('{l}', String(cursor.line)).replace('{c}', String(cursor.col))}
      {cursor.selected > 0 && <span className="text-zinc-500">{t('scmSelected').replace('{n}', String(cursor.selected))}</span>}
    </button>
  );
});

export const StatusCompletion = React.memo(function StatusCompletion({ onOpenMenu }: { onOpenMenu: (anchor: { x: number; y: number }) => void }) {
  const compState = useCompletionState();
  return (
    <button
      className="status-item"
      title={compState === 'busy' ? t('aiCompBusy') : compState === 'unavailable' ? t('aiCompUnavailable') : t('aiCompReady')}
      aria-label={t('set_aiCompletion')}
      aria-haspopup="dialog"
      onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onOpenMenu({ x: r.left + r.width / 2, y: r.top }); }}
    >
      <CompletionIcon size={12} off={compState === 'off'} className={compState === 'off' ? 'text-zinc-500' : compState === 'busy' ? 'text-indigo-400 animate-pulse' : compState === 'unavailable' ? 'text-rose-400' : 'text-indigo-300'} />
    </button>
  );
});

export const StatusLsp = React.memo(function StatusLsp({ fileName }: { fileName: string }) {
  const lspMap = useLsp();
  const e = lspMap[languageFromName(fileName)];
  if (!e) return null;
  const tip = e.state === 'ready' ? t('lspReady').replace('{n}', e.name)
    : e.state === 'starting' ? t('lspStarting').replace('{n}', e.name)
      : e.state === 'missing' ? t('lspMissing').replace('{n}', e.name).replace('{h}', e.hint ?? '')
        : t('lspError').replace('{n}', e.name);
  return (
    <span className="status-item" title={tip}>
      <span className={`w-1.5 h-1.5 rounded-full ${e.state === 'ready' ? 'bg-emerald-400' : e.state === 'starting' ? 'bg-amber-400 animate-pulse' : e.state === 'missing' ? 'bg-zinc-500' : 'bg-rose-400'}`} />
      <span className="hidden @md:inline">{e.name}</span>
    </span>
  );
});
