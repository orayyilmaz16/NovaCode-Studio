import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { t } from '../i18n/uiText';
import { loadTasks, type Task } from '../services/tasks';
import { useFocusTrap } from '../services/useFocusTrap';
import '../i18n/uiTextAi';
import '../i18n/uiTextTheme'; // taşınan metinler (gecikmeli sözlük)

// "Görevi çalıştır": .nova/tasks.json + package.json scripts listesi; seçilen görev terminalde çalışır.
interface Props {
  root: string;
  onClose: () => void;
  onPick: (task: Task) => void;
}

export const TaskPicker: React.FC<Props> = ({ root, onClose, onPick }) => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [invalid, setInvalid] = useState(0);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box, true, onClose);

  useEffect(() => {
    let off = false;
    void loadTasks(root).then((r) => { if (!off) { setTasks(r.tasks); setInvalid(r.invalid); } });
    return () => { off = true; };
  }, [root]);

  const items = useMemo(() => {
    const f = q.trim().toLowerCase();
    return (tasks ?? []).filter((x) => !f || x.label.toLowerCase().includes(f) || x.command.toLowerCase().includes(f));
  }, [tasks, q]);
  useEffect(() => { setSel(0); }, [q]);

  return (
    <div className="fixed inset-0 z-[200]" onMouseDown={onClose}>
      <div
        ref={box}
        role="dialog"
        aria-label={t('taskRun')}
        className="animate-dialog absolute left-1/2 -translate-x-1/2 top-10 w-[min(600px,92vw)] rounded-[var(--r-lg)] border border-zinc-700 bg-nv-side overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 h-10 border-b border-zinc-700/70">
          <Play size={14} className="text-zinc-500" />
          <input
            data-autofocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, Math.max(0, items.length - 1))); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); onPick(items[sel]); }
            }}
            placeholder={t('taskPlaceholder')}
            aria-label={t('taskPlaceholder')}
            className="flex-1 bg-transparent outline-none text-[13px] text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {tasks && items.length === 0 && <div className="px-3 py-3 text-[12px] text-zinc-500">{tasks.length === 0 ? t('taskNone') : t('cpNoResults')}</div>}
          {items.map((x, i) => (
            <button
              key={`${x.source}:${x.label}:${i}`}
              className={`w-full flex items-center gap-2 px-3 h-7 text-left text-[13px] ${i === sel ? 'bg-nv-hover text-zinc-100' : 'text-zinc-300'}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => onPick(x)}
            >
              <span className="truncate">{x.label}</span>
              {x.label !== x.command && <span className="truncate text-[11px] text-zinc-500 font-mono">{x.command}</span>}
              {x.cwd && <span className="ml-auto shrink-0 text-[11px] text-zinc-500 font-mono">{x.cwd}</span>}
            </button>
          ))}
        </div>
        {invalid > 0 && <div className="px-3 h-6 flex items-center border-t border-zinc-700/70 text-[11px] text-amber-400">{t('taskInvalid').replace('{n}', String(invalid))}</div>}
      </div>
    </div>
  );
};
