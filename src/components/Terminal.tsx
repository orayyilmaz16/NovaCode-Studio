import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Square } from 'lucide-react';
import type { ConsoleLog } from '../types';

interface TerminalProps {
  logs: ConsoleLog[];
  onClear: () => void;
  cwd?: string | null;
}

type ShellId = 'powershell' | 'cmd';
type TabId = ShellId | 'log';

const TABS: { id: TabId; label: string }[] = [
  { id: 'powershell', label: 'PowerShell' },
  { id: 'cmd', label: 'CMD' },
  { id: 'log', label: 'Günlük' }
];

const MAX_OUTPUT = 200_000;
// ANSI kaçış dizilerini temizle (renk/imleç kodları düz metinde görünmesin)
const ANSI = /\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07]*\x07/g;

export const Terminal: React.FC<TerminalProps> = ({ logs, onClear, cwd }) => {
  const [tab, setTab] = useState<TabId>('powershell');
  const [output, setOutput] = useState<Record<ShellId, string>>({ powershell: '', cmd: '' });
  const [running, setRunning] = useState<Record<ShellId, boolean>>({ powershell: false, cmd: false });
  const [status, setStatus] = useState<Record<ShellId, string>>({ powershell: '', cmd: '' });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const hasShell = !!api?.termStart;

  // Çıktı akışını bir kez bağla (preload'da kaldırma API'si yok). Her shell kendi çıktısına yazar.
  useEffect(() => {
    if (!api?.onTermOutput || !api?.onTermExit) return;
    api.onTermOutput(({ shell, text }) => {
      const clean = text.replace(ANSI, '');
      setOutput((prev) => ({ ...prev, [shell]: (prev[shell] + clean).slice(-MAX_OUTPUT) }));
    });
    api.onTermExit(({ shell, code }) => {
      setRunning((prev) => ({ ...prev, [shell]: false }));
      setStatus((prev) => ({ ...prev, [shell]: `Shell kapandı (kod ${code ?? '?'}). Sekmeye tekrar tıklayarak yeniden başlatın.` }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sekme açılınca veya klasör değişince shell'i başlat. Zaten çalışıyorsa main süreç yeniden kullanır.
  useEffect(() => {
    if (tab === 'log' || !hasShell) return;
    const shell = tab;
    if (!cwd) {
      setStatus((prev) => ({ ...prev, [shell]: 'Shell için önce bir klasör açın.' }));
      return;
    }
    let cancelled = false;
    setStatus((prev) => ({ ...prev, [shell]: 'Shell başlatılıyor...' }));
    api!.termStart(shell, cwd).then((res) => {
      if (cancelled) return;
      setRunning((prev) => ({ ...prev, [shell]: res.success }));
      setStatus((prev) => ({ ...prev, [shell]: res.success ? '' : res.error || 'Shell başlatılamadı.' }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, cwd]);

  // Yeni çıktıda en alta kaydır
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [output, logs, tab]);

  const shellId: ShellId | null = tab === 'log' ? null : tab;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shellId || !running[shellId] || !api?.termInput) return;
    const line = input;
    setInput('');
    setOutput((prev) => ({ ...prev, [shellId]: prev[shellId] + `> ${line}\n` }));
    const res = await api.termInput(shellId, line);
    if (!res.success) setStatus((prev) => ({ ...prev, [shellId]: res.error || 'Komut gönderilemedi.' }));
  };

  const handleStop = async () => {
    if (!shellId) return;
    await api?.termStop(shellId);
    setRunning((prev) => ({ ...prev, [shellId]: false }));
    setStatus((prev) => ({ ...prev, [shellId]: 'Shell durduruldu.' }));
  };

  const currentStatus = shellId ? status[shellId] : '';

  return (
    <div className="flex flex-col h-full bg-[#0c0f16] text-zinc-300 font-mono text-xs">
      <div className="flex items-center justify-between px-2 h-8 border-b border-zinc-800/80 bg-[#10131c]">
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 h-6 rounded text-[11px] transition-colors ${
                tab === t.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
              {t !== TABS[2] && running[t.id as ShellId] && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {shellId && running[shellId] && (
            <button onClick={handleStop} title="Shell'i durdur" className="p-1 rounded text-zinc-500 hover:text-zinc-200">
              <Square size={12} />
            </button>
          )}
          <button
            onClick={() => (shellId ? setOutput((p) => ({ ...p, [shellId]: '' })) : onClear())}
            title="Temizle"
            className="p-1 rounded text-zinc-500 hover:text-zinc-200"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2">
        {shellId === null ? (
          logs.length === 0 ? (
            <div className="text-zinc-600">Henüz kayıt yok.</div>
          ) : (
            logs.map((log) => {
              const color =
                log.type === 'error' ? 'text-rose-400' : log.type === 'warn' ? 'text-amber-300' : log.type === 'info' ? 'text-sky-300' : 'text-zinc-300';
              return (
                <div key={log.id} className="flex gap-2 leading-relaxed">
                  <span className="text-zinc-600 text-[10px] shrink-0">[{log.time}]</span>
                  <span className={`break-all whitespace-pre-wrap ${color}`}>{log.text}</span>
                </div>
              );
            })
          )
        ) : (
          <pre className="whitespace-pre-wrap break-all leading-relaxed text-zinc-300 m-0">
            {output[shellId] || (currentStatus ? '' : 'Komut yazın ve Enter’a basın.')}
          </pre>
        )}
        {shellId && currentStatus && <div className="text-amber-300/90 mt-1">{currentStatus}</div>}
      </div>

      {shellId && (
        <form onSubmit={handleSubmit} className="flex items-center px-3 h-9 border-t border-zinc-800/80 bg-[#10131c]">
          <span className="text-zinc-500 mr-2 select-none">{shellId === 'cmd' ? '>' : 'PS>'}</span>
          <input
            type="text"
            value={input}
            disabled={!running[shellId]}
            onChange={(e) => setInput(e.target.value)}
            placeholder={running[shellId] ? 'Komut yazın...' : 'Shell hazır değil'}
            className="flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-50"
          />
        </form>
      )}
    </div>
  );
};
