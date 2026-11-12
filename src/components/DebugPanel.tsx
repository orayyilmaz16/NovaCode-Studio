import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Bug, ChevronRight, Pause, Play, Square, StepForward, X } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextDev'; // hata ayıklama metinleri (gecikmeli yüklenen ek sözlük)
import {
  clearBreakpoints, evalExpr, isDebuggable, pauseDebug, resumeDebug, selectFrame, startDebug, stepInto, stepOut, stepOver, stopDebug,
  toggleBreakpoint, useDebug
} from '../services/debugStore';
import type { DebugVar } from '../types';

interface Props {
  rootPath: string | null;
  activeFile: { path?: string; name: string } | null;
  onOpenFile: (path: string, line?: number) => void;
}

const baseName = (p: string) => p.split(/[\\/]/).pop() ?? p;
const btn = 'w-7 h-7 rounded-md flex items-center justify-center text-zinc-300 hover:bg-nv-hover hover:text-zinc-50 disabled:opacity-35 disabled:hover:bg-transparent transition-colors';

const Section: React.FC<{ title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean; action?: React.ReactNode }> = ({ title, count, children, defaultOpen = true, action }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-t border-nv-border">
      <div className="flex items-center h-7 pr-2">
        <button className="flex-1 min-w-0 flex items-center gap-1 pl-1.5 h-full text-left text-[11px] uppercase tracking-wide text-zinc-400 hover:text-zinc-200" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <ChevronRight size={13} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
          <span className="truncate">{title}</span>
          {count !== undefined && count > 0 && <span className="px-1.5 rounded-full bg-white/10 text-[10px] text-zinc-300">{count}</span>}
        </button>
        {action}
      </div>
      {open && <div className="pb-1.5">{children}</div>}
    </section>
  );
};

// Değişken ağacı: nesneler tıklanınca ana süreçten tembel yüklenir
const VarNode: React.FC<{ v: DebugVar; depth: number }> = ({ v, depth }) => {
  const [open, setOpen] = useState(false);
  const [kids, setKids] = useState<DebugVar[] | null>(null);
  const toggle = async () => {
    if (!v.ref) return;
    if (!open && kids === null) {
      const r = await window.electronAPI?.debug?.properties(v.ref);
      setKids(r?.props ?? []);
    }
    setOpen((o) => !o);
  };
  return (
    <>
      <div className="flex items-baseline gap-1.5 min-w-0 h-5 text-[12px] hover:bg-nv-hover" style={{ paddingLeft: 8 + depth * 12 }}>
        <button className={`w-3 shrink-0 text-zinc-500 ${v.ref ? '' : 'invisible'}`} onClick={() => void toggle()} aria-label={v.name}><ChevronRight size={11} className={`transition-transform ${open ? 'rotate-90' : ''}`} /></button>
        <span className="text-sky-300 shrink-0 font-mono">{v.name}</span>
        <span className={`truncate font-mono min-w-0 ${v.type === 'string' ? 'text-amber-200' : v.type === 'number' ? 'text-emerald-300' : 'text-zinc-300'}`} title={v.value}>{v.value}</span>
      </div>
      {open && kids?.map((k) => <VarNode key={k.name} v={k} depth={depth + 1} />)}
    </>
  );
};

const ScopeNode: React.FC<{ name: string; reference: string; open0: boolean }> = ({ name, reference, open0 }) => {
  const [open, setOpen] = useState(open0);
  const [kids, setKids] = useState<DebugVar[] | null>(null);
  useEffect(() => {
    if (!open || kids !== null) return;
    let alive = true;
    void window.electronAPI?.debug?.properties(reference).then((r) => { if (alive) setKids(r?.props ?? []); });
    return () => { alive = false; };
  }, [open, kids, reference]);
  return (
    <div>
      <button className="w-full flex items-center gap-1 h-5 pl-2 text-left text-[12px] text-zinc-200 hover:bg-nv-hover" onClick={() => setOpen((o) => !o)}>
        <ChevronRight size={12} className={`transition-transform ${open ? 'rotate-90' : ''}`} />{name}
      </button>
      {open && (kids === null ? null : kids.length === 0 ? <div className="pl-6 text-[11px] text-zinc-500">{t('dbgEmpty')}</div> : kids.map((k) => <VarNode key={k.name} v={k} depth={1} />))}
    </div>
  );
};

const Scopes: React.FC<{ frameId: string }> = ({ frameId }) => {
  const [scopes, setScopes] = useState<{ name: string; ref: string; expanded: boolean }[] | null>(null);
  useEffect(() => {
    let alive = true;
    setScopes(null);
    void window.electronAPI?.debug?.scopes(frameId).then((r) => { if (alive) setScopes(r?.scopes ?? []); });
    return () => { alive = false; };
  }, [frameId]);
  if (!scopes) return null;
  return <>{scopes.map((s) => <ScopeNode key={frameId + s.ref} name={s.name} reference={s.ref} open0={s.expanded} />)}</>;
};

export const DebugPanel: React.FC<Props> = ({ rootPath, activeFile, onOpenFile }) => {
  const s = useDebug();
  const [expr, setExpr] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const api = window.electronAPI?.debug;
  const canStart = !!rootPath && !!activeFile?.path && isDebuggable(activeFile.name);
  const live = s.status !== 'idle';
  const bpFiles = Object.entries(s.breakpoints);
  const bpCount = bpFiles.reduce((n, [, l]) => n + l.length, 0);
  // Node'un iç çerçeveleri (dosyası olmayan) gürültü yapar: kullanıcı kodu varsa yalnız onlar gösterilir
  const userFrames = s.frames.filter((f) => f.file);
  const shownFrames = userFrames.length ? userFrames : s.frames;

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [s.lines.length]);

  if (!api) return <div className="p-4 text-[12px] text-zinc-400">{t('dbgDesktopOnly')}</div>;

  const hint = !rootPath ? t('dbgNeedFolder') : !live && !canStart ? (activeFile ? t('dbgOnlyJs') : t('dbgNoSession')) : '';
  const statusText = s.status === 'starting' ? t('dbgStarting') : s.status === 'running' ? t('dbgRunning') : s.status === 'paused' ? `${t('dbgPausedAt')}${s.reason && s.reason !== 'other' ? ` · ${s.reason}` : ''}` : '';

  return (
    <div className="flex flex-col h-full min-h-0 text-zinc-300 bg-nv-side">
      <div className="h-9 flex items-center gap-1.5 pl-4 pr-2 text-[11px] uppercase tracking-wide text-zinc-400 shrink-0">
        <Bug size={13} />{t('dbgTitle')}
      </div>

      {/* Araç çubuğu */}
      <div className="flex items-center gap-0.5 px-2 pb-2 shrink-0">
        {!live ? (
          <button className={`${btn} !w-auto px-2 gap-1 bg-emerald-600/20 text-emerald-200 hover:!bg-emerald-600/30`} disabled={!canStart} onClick={() => activeFile?.path && void startDebug(activeFile.path)} title={t('dbgStart')} aria-label={t('dbgStart')}>
            <Play size={13} className="fill-current" /><span className="text-[12px]">{t('dbgStart')}</span>
          </button>
        ) : (
          <>
            {s.status === 'paused'
              ? <button className={btn} onClick={() => void resumeDebug()} title={t('dbgContinue')} aria-label={t('dbgContinue')}><Play size={14} className="fill-current text-emerald-300" /></button>
              : <button className={btn} onClick={() => void pauseDebug()} disabled={s.status !== 'running'} title={t('dbgPause')} aria-label={t('dbgPause')}><Pause size={14} /></button>}
            <button className={btn} onClick={() => void stepOver()} disabled={s.status !== 'paused'} title={t('dbgStepOver')} aria-label={t('dbgStepOver')}><StepForward size={14} /></button>
            <button className={btn} onClick={() => void stepInto()} disabled={s.status !== 'paused'} title={t('dbgStepInto')} aria-label={t('dbgStepInto')}><ArrowDownToLine size={14} /></button>
            <button className={btn} onClick={() => void stepOut()} disabled={s.status !== 'paused'} title={t('dbgStepOut')} aria-label={t('dbgStepOut')}><ArrowUpFromLine size={14} /></button>
            <button className={`${btn} text-rose-300`} onClick={() => void stopDebug()} title={t('dbgStop')} aria-label={t('dbgStop')}><Square size={13} className="fill-current" /></button>
            <span className="ml-1 text-[11px] text-zinc-400 truncate">{statusText}</span>
          </>
        )}
      </div>
      {hint && <p className="px-4 pb-2 text-[11.5px] text-zinc-500 leading-snug">{hint}</p>}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <Section title={t('dbgVariables')}>
          {s.status === 'paused' && s.frameId ? <Scopes frameId={s.frameId} /> : <p className="px-4 py-1 text-[11.5px] text-zinc-500">{t('dbgEmpty')}</p>}
        </Section>

        <Section title={t('dbgCallStack')} count={shownFrames.length}>
          {shownFrames.map((f) => (
            <button
              key={f.id}
              className={`w-full flex items-baseline gap-2 min-w-0 h-6 px-3 text-left text-[12px] hover:bg-nv-hover ${f.id === s.frameId ? 'bg-nv-active text-zinc-50' : f.file ? 'text-zinc-300' : 'text-zinc-500'}`}
              onClick={() => { selectFrame(f.id); if (f.file) onOpenFile(f.file, f.line); }}
              title={f.file ?? f.url}
            >
              <span className="truncate shrink-0 max-w-[55%]">{f.name}</span>
              <span className="truncate text-[11px] text-zinc-500 min-w-0">{f.file ? `${baseName(f.file)}:${f.line}` : baseName(f.url)}</span>
            </button>
          ))}
        </Section>

        <Section
          title={t('dbgBreakpoints')}
          count={bpCount}
          action={bpCount > 0 ? <button className="text-[10.5px] text-zinc-500 hover:text-rose-300" onClick={clearBreakpoints}>{t('dbgRemoveAll')}</button> : undefined}
        >
          {bpCount === 0 && <p className="px-4 py-1 text-[11.5px] text-zinc-500 leading-snug">{t('dbgNoBreakpoints')}</p>}
          {bpFiles.map(([file, lines]) => lines.map((l) => (
            <div key={`${file}:${l}`} className="group flex items-center gap-2 h-6 px-3 text-[12px] hover:bg-nv-hover">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e51400] shrink-0" />
              <button className="flex-1 min-w-0 flex items-baseline gap-2 text-left" onClick={() => onOpenFile(file, l)} title={file}>
                <span className="truncate">{baseName(file)}</span><span className="text-zinc-500 text-[11px]">:{l}</span>
              </button>
              <button className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-100" onClick={() => toggleBreakpoint(file, l)} aria-label={t('dbgToggleBp')}><X size={12} /></button>
            </div>
          )))}
        </Section>

        <Section title={t('dbgConsole')} defaultOpen>
          <div className="px-3 max-h-56 overflow-y-auto font-mono text-[11.5px] leading-[1.45]">
            {s.lines.map((ln) => (
              <div key={ln.id} className={`whitespace-pre-wrap break-all ${ln.kind === 'stderr' || ln.kind === 'error' ? 'text-rose-300' : ln.kind === 'eval' ? 'text-sky-300' : ln.kind === 'info' ? 'text-zinc-500' : 'text-zinc-200'}`}>
                {ln.kind === 'info' && ln.text.startsWith('exit:') ? t('dbgExited').replace('{c}', ln.text.slice(5)) : ln.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && expr.trim()) { void evalExpr(expr); setExpr(''); } }}
            disabled={!live}
            placeholder={t('dbgEvalPlaceholder')}
            aria-label={t('dbgEvalPlaceholder')}
            spellCheck={false}
            className="mx-3 mt-1.5 w-[calc(100%-1.5rem)] h-7 px-2 rounded bg-nv-input border border-zinc-700 text-[12px] font-mono text-zinc-100 outline-none focus:border-indigo-500 disabled:opacity-40 placeholder:text-zinc-500"
          />
        </Section>
      </div>
    </div>
  );
};
