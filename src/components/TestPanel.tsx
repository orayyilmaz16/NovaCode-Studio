import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleX, FlaskConical, FolderOpen, LoaderCircle, Play, X } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextDev';
import { loadTasks, runTask, type Task } from '../services/tasks';
import { isTestTask, parseTestOutput } from '../services/testParse';
import { tapPty } from '../services/ptyBus';

// Alt panel "Test" sekmesi: projedeki test betiklerini bulur, terminalde çalıştırır (sekmeden ayrılmadan) ve çıktıdan
// başarılı/başarısız/atlanan sayılarını, süreyi ve başarısız test adlarını özetler. Kod veya çıktı dışarı gönderilmez.
interface Props {
  root: string | null;
  /** Etkin terminal oturumu ve ham çıktısını okuyan işlev */
  sessionId: string | null;
  readOutput: () => string;
  /** Klasik (boru) oturumlarda çıktı React durumundadır: uzunluğu değişince yeniden okunur */
  pipeTick: number;
  clearKey: number;
  onShowTerminal: () => void;
  onOpenFolder?: () => void;
}

export const TestPanel: React.FC<Props> = ({ root, sessionId, readOutput, pipeTick, clearKey, onShowTerminal, onOpenFolder }) => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [started, setStarted] = useState<string | null>(null); // çalıştırılan görevin etiketi
  const [, force] = useState(0);
  const baseline = useRef(new Map<string, number>());
  const sid = useRef(sessionId);
  sid.current = sessionId;

  useEffect(() => {
    if (!root) { setTasks([]); return; }
    let alive = true;
    void loadTasks(root).then((r) => { if (alive) setTasks(r.tasks.filter((x) => isTestTask(x.label))); }).catch(() => { if (alive) setTasks([]); });
    return () => { alive = false; };
  }, [root]);

  // Terminal çıktısı geldikçe özet tazelenir (kare başına en çok bir kez)
  useEffect(() => {
    let raf = 0;
    const off = tapPty((id) => {
      if (id !== sid.current || raf) return;
      raf = requestAnimationFrame(() => { raf = 0; force((n) => n + 1); });
    });
    return () => { off(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    // Sonucu temizle (üst çubuktaki çöp kutusu)
    if (clearKey === 0) return;
    setStarted(null);
    baseline.current.set(sid.current ?? '', readOutput().length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearKey]);

  const run = useCallback(async (task: Task) => {
    if (!root) return;
    baseline.current.set(sid.current ?? '', sid.current ? readOutput().length : 0);
    setStarted(task.label);
    const ok = await runTask(task, root, { stay: true });
    if (!ok) setStarted(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  void pipeTick; // yalnız yeniden çizimi tetikler
  const result = started ? parseTestOutput(readOutput().slice(baseline.current.get(sessionId ?? '') ?? 0)) : null;

  const running = !!started && !result;
  const ok = result ? result.failed === 0 : false;
  const total = result ? Math.max(result.total, result.passed + result.failed + result.skipped, 1) : 1;
  const pct = (n: number) => `${(n / total) * 100}%`;

  if (!root) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 font-sans text-[13px]">
        <FlaskConical size={20} className="opacity-60" />
        <span>{t('pnlTestNeedFolder')}</span>
        {onOpenFolder && (
          <button onClick={onOpenFolder} className="flex items-center gap-1.5 h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] transition-colors">
            <FolderOpen size={13} />{t('openFolder')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col font-sans" dir="ltr">
      <div className="flex items-center gap-1.5 px-3 h-11 shrink-0 overflow-x-auto [scrollbar-width:none]">
        <FlaskConical size={14} className="text-zinc-500 shrink-0" />
        <span className="text-[11.5px] text-zinc-500 shrink-0 me-1">{t('pnlTestScripts')}</span>
        {tasks === null ? null : tasks.length === 0 ? (
          <span className="text-[12px] text-zinc-500 truncate">{t('pnlTestNoScripts')}</span>
        ) : (
          tasks.map((task) => {
            const on = started === task.label;
            return (
              <button
                key={`${task.source}:${task.label}`}
                onClick={() => void run(task)}
                disabled={running}
                title={task.command}
                className={`group shrink-0 inline-flex items-center gap-1.5 h-7 ps-2.5 pe-3 rounded-full text-[12px] transition-[background-color,color,transform] duration-(--dur-fast) active:scale-[0.97] disabled:opacity-60 ${on ? 'bg-indigo-500/20 text-indigo-100' : 'bg-white/[0.06] text-zinc-200 hover:bg-white/[0.1]'}`}
              >
                {on && running ? <LoaderCircle size={12} className="animate-spin text-indigo-300" /> : <Play size={11} className="fill-current text-emerald-400 transition-transform duration-(--dur-base) group-hover:scale-110" />}
                <span className="font-mono">{task.label.replace(/^npm run /, '')}</span>
              </button>
            );
          })
        )}
        <div className="flex-1" />
        {started && (
          <button onClick={onShowTerminal} className="shrink-0 text-[11.5px] text-zinc-400 hover:text-zinc-100 transition-colors">{t('termTab')}</button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {!started ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center text-zinc-500 text-[12.5px] px-6">
            <FlaskConical size={22} className="opacity-60" />
            <span className="max-w-[420px] leading-snug">{t('pnlTestWaiting')}</span>
          </div>
        ) : running ? (
          <div className="h-full flex items-center justify-center gap-2 text-zinc-400 text-[13px]">
            <LoaderCircle size={16} className="animate-spin text-indigo-300" />{t('pnlTestRunning')}
          </div>
        ) : result ? (
          <div className="animate-fade-in max-w-[680px] rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2.5">
              {ok ? <CheckCircle2 size={22} className="text-emerald-400" /> : <CircleX size={22} className="text-rose-400" />}
              <div className="leading-tight">
                <div className={`text-[14px] font-semibold ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>{ok ? t('pnlTestAllPassed') : t('pnlTestSomeFailed')}</div>
                <div className="text-[11.5px] text-zinc-500 mt-0.5">
                  {started}
                  {result.duration !== undefined && <> · {t('pnlTestDuration')}: {result.duration < 10 ? result.duration.toFixed(2) : result.duration.toFixed(1)} s</>}
                  {' · '}{t('pnlTestRunner').replace('{r}', result.runner)}
                </div>
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full overflow-hidden bg-white/[0.08] flex" aria-hidden>
              <div className="h-full bg-emerald-500 transition-[width] duration-(--dur-slow)" style={{ width: pct(result.passed) }} />
              <div className="h-full bg-rose-500 transition-[width] duration-(--dur-slow)" style={{ width: pct(result.failed) }} />
              <div className="h-full bg-zinc-500 transition-[width] duration-(--dur-slow)" style={{ width: pct(result.skipped) }} />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {([
                ['passed', result.passed, 'text-emerald-300', t('pnlTestPassed')],
                ['failed', result.failed, 'text-rose-300', t('pnlTestFailed')],
                ['skipped', result.skipped, 'text-zinc-300', t('pnlTestSkipped')],
                ['total', result.total, 'text-zinc-100', t('pnlTestTotal')],
              ] as const).map(([k, n, tone, label]) => (
                <div key={k} className="rounded-lg bg-white/[0.05] py-2.5">
                  <div className={`text-[18px] font-semibold tabular-nums ${tone}`}>{n}</div>
                  <div className="text-[10.5px] uppercase tracking-wide text-zinc-500">{label}</div>
                </div>
              ))}
            </div>

            {result.failures.length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">{t('pnlTestFailures')}</div>
                <ul className="rounded-lg bg-rose-500/[0.07] divide-y divide-rose-500/10 overflow-hidden">
                  {result.failures.map((f) => (
                    <li key={f} className="flex items-start gap-2 px-2.5 py-1.5 text-[12px] text-rose-200">
                      <X size={12} className="shrink-0 mt-[3px] text-rose-400" /><span className="break-words min-w-0">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
