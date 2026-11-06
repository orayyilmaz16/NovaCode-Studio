import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Square } from 'lucide-react';
import type { ConsoleLog } from '../types';

interface TerminalProps {
  logs: ConsoleLog[];
  onClear: () => void;
  cwd?: string | null;
}

type TabId = 'powershell' | 'cmd' | 'log';

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
  const [output, setOutput] = useState<Record<'powershell' | 'cmd', string>>({ powershell: '', cmd: '' });
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<string>('');
  const [running, setRunning] = useState(false);
  const activeShell = useRef<'powershell' | 'cmd' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const hasShell = !!api?.termStart;

  // Çıktı akışını bir kez bağla (preload'da kaldırma API'si yok)
  useEffect(() => {
    if (!api?.onTermOutput || !api?.onTermExit) return;
    api.onTermOutput((text: string) => {
      const shell = activeShell.current;
      if (!shell) return;
      const clean = text.replace(ANSI, '');
      setOutput((prev) => {
        const next = (prev[shell] + clean).slice(-MAX_OUTPUT);
        return { ...prev, [shell]: next };
      });
    });
    api.onTermExit((code: number | null) => {
      activeShell.current = null;
      setRunning(false);
      setStatus(`Shell kapandı (kod ${code ?? '?'}). Sekmeye tekrar tıklayarak yeniden başlatın.`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sekme veya klasör değişince shell'i (yeniden) başlat
  useEffect(() => {
    if (tab === 'log' || !hasShell) return;
    if (!cwd) {
      setRunning(false);
      setStatus('Shell için önce bir klasör açın.');
      return;
    }
    let cancelled = false;
    setStatus('Shell başlatılıyor...');
    api!.termStart(tab, cwd).then((res: { success: boolean; error?: string }) => {
      if (cancelled) return;
      if (res.success) {
        activeShell.current = tab;
        setRunning(true);
        setStatus('');
      } else {
        setRunning(false);
        setStatus(res.error || 'Shell başlatılamadı.');
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!running || tab === 'log' || !api?.termInput) return;
    const line = input;
    setInput('');
    setOutput((prev) => ({ ...prev, [tab]: prev[tab] + `> ${line}\n` }));
    const res = await api.termInput(line);
    if (!res.success) setStatus(res.error || 'Komut gönderilemedi.');
  };

  const handleStop = async () => {
    await api?.termStop();
    activeShell.current = null;
    setRunning(false);
    setStatus('Shell durduruldu.');
  };

  const shellView = tab !== 'log';
  const currentOutput = shellView ? output[tab] : '';

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
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {shellView && running && (
            <button onClick={handleStop} title="Shell'i durdur" className="p-1 rounded text-zinc-500 hover:text-zinc-200">
              <Square size={12} />
            </button>
          )}
          <button onClick={tab === 'log' ? onClear : () => setOutput((p) => ({ ...p, [tab]: '' }))} title="Temizle" className="p-1 rounded text-zinc-500 hover:text-zinc-200">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2">
        {tab === 'log' ? (
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
            {currentOutput || (status ? '' : 'Komut yazın ve Enter’a basın.')}
          </pre>
        )}
        {shellView && status && <div className="text-amber-300/90 mt-1">{status}</div>}
      </div>

      {shellView && (
        <form onSubmit={handleSubmit} className="flex items-center px-3 h-9 border-t border-zinc-800/80 bg-[#10131c]">
          <span className="text-zinc-500 mr-2 select-none">{tab === 'cmd' ? '>' : 'PS>'}</span>
          <input
            type="text"
            value={input}
            disabled={!running}
            onChange={(e) => setInput(e.target.value)}
            placeholder={running ? 'Komut yazın...' : 'Shell hazır değil'}
            className="flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-50"
          />
        </form>
      )}
    </div>
  );
};
