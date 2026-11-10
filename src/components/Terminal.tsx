import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Square } from 'lucide-react';
import type { ConsoleLog } from '../types';
import { t } from '../i18n/uiText';
import { commandToAnsi, parseAnsi, shortenPath, tokenizeCommand, TOKEN_COLOR } from '../services/terminalText';

interface TerminalProps {
  logs: ConsoleLog[];
  onClear: () => void;
  cwd?: string | null;
  branch?: string | null;
}

type ShellId = 'powershell' | 'cmd';
type TabId = ShellId | 'log';

const TABS: { id: TabId; label: string }[] = [
  { id: 'powershell', label: 'PowerShell' },
  { id: 'cmd', label: 'CMD' },
  { id: 'log', label: t('termLog') }
];

const MAX_OUTPUT = 200_000;
const MAX_HISTORY = 100;
const ESC = '\u001b';

// İstem renkleri: PS (mavi) + yol (turkuaz) + dal (mor) + ok (beyaz)
const promptAnsi = (shell: ShellId, cwd: string, branch?: string | null) =>
  `${shell === 'powershell' ? `${ESC}[1;38;2;122;162;247mPS${ESC}[0m ` : ''}${ESC}[38;2;125;207;255m${cwd}${ESC}[0m` +
  `${branch ? ` ${ESC}[38;2;187;154;247m(${branch})${ESC}[0m` : ''}${ESC}[0m> `;

const Output: React.FC<{ text: string }> = React.memo(({ text }) => {
  const spans = useMemo(() => parseAnsi(text), [text]);
  return (
    <pre className="whitespace-pre-wrap break-all leading-relaxed text-zinc-300 m-0">
      {spans.map((s, i) => (
        <span
          key={i}
          style={{
            color: s.color,
            backgroundColor: s.bg,
            fontWeight: s.bold ? 700 : undefined,
            opacity: s.dim ? 0.6 : undefined,
            fontStyle: s.italic ? 'italic' : undefined,
            textDecoration: s.underline ? 'underline' : undefined
          }}
        >
          {s.text}
        </span>
      ))}
    </pre>
  );
});

export const Terminal: React.FC<TerminalProps> = ({ logs, onClear, cwd, branch }) => {
  const [tab, setTab] = useState<TabId>('powershell');
  const [output, setOutput] = useState<Record<ShellId, string>>({ powershell: '', cmd: '' });
  const [running, setRunning] = useState<Record<ShellId, boolean>>({ powershell: false, cmd: false });
  const [status, setStatus] = useState<Record<ShellId, string>>({ powershell: '', cmd: '' });
  const [liveCwd, setLiveCwd] = useState<Record<ShellId, string>>({ powershell: '', cmd: '' });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const history = useRef<Record<ShellId, string[]>>({ powershell: [], cmd: [] });
  const historyPos = useRef(-1);

  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const hasShell = !!api?.termStart;

  // Çıktı, çalışma klasörü ve çıkış olaylarını bağla; bileşen kapanınca dinleyicileri kaldır.
  useEffect(() => {
    if (!api?.onTermOutput || !api?.onTermExit) return;
    const offOut = api.onTermOutput(({ shell, text, stream }) => {
      // stderr kırmızı: PowerShell hataları ve komut hataları öne çıksın
      const colored = stream === 'stderr' ? `${ESC}[38;2;247;118;142m${text}${ESC}[0m` : text;
      setOutput((prev) => ({ ...prev, [shell]: (prev[shell] + colored).slice(-MAX_OUTPUT) }));
    });
    const offCwd = api.onTermCwd?.(({ shell, cwd: next }) => {
      if (next) setLiveCwd((prev) => (prev[shell] === next ? prev : { ...prev, [shell]: next }));
    });
    const offExit = api.onTermExit(({ shell, code }) => {
      setRunning((prev) => ({ ...prev, [shell]: false }));
      setStatus((prev) => ({ ...prev, [shell]: t('termClosed').replace('{code}', String(code ?? '?')) }));
    });
    return () => {
      offOut?.();
      offCwd?.();
      offExit?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sekme açılınca veya klasör değişince shell'i başlat. Zaten çalışıyorsa main süreç yeniden kullanır.
  useEffect(() => {
    if (tab === 'log' || !hasShell) return;
    const shell = tab;
    if (!cwd) {
      setStatus((prev) => ({ ...prev, [shell]: t('termNeedFolder') }));
      return;
    }
    let cancelled = false;
    setStatus((prev) => ({ ...prev, [shell]: t('termStarting') }));
    api!.termStart(shell, cwd).then((res) => {
      if (cancelled) return;
      setRunning((prev) => ({ ...prev, [shell]: res.success }));
      setStatus((prev) => ({ ...prev, [shell]: res.success ? '' : res.error || t('termStartFailed') }));
      if (res.success) setLiveCwd((prev) => ({ ...prev, [shell]: prev[shell] || cwd }));
      inputRef.current?.focus();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, cwd]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [output, logs, tab]);

  const shellId: ShellId | null = tab === 'log' ? null : tab;
  const shownCwd = shellId ? liveCwd[shellId] || cwd || '' : '';
  const tokens = useMemo(() => (shellId ? tokenizeCommand(input, shellId) : []), [input, shellId]);

  // Uzun komutta kaydırma konumunu üstteki renkli katmanla eşle
  useEffect(() => {
    if (overlayRef.current && inputRef.current) overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
  });

  const runLine = async (line: string) => {
    if (!shellId || !running[shellId] || !api?.termInput) return;
    const echo = `${promptAnsi(shellId, shownCwd, branch)}${commandToAnsi(line, shellId)}\n`;
    setOutput((prev) => ({ ...prev, [shellId]: (prev[shellId] + echo).slice(-MAX_OUTPUT) }));
    const res = await api.termInput(shellId, line);
    if (!res.success) setStatus((prev) => ({ ...prev, [shellId]: res.error || t('termSendFailed') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const line = input;
    setInput('');
    historyPos.current = -1;
    if (shellId && line.trim()) {
      const h = history.current[shellId];
      if (h[h.length - 1] !== line) h.push(line);
      if (h.length > MAX_HISTORY) h.shift();
    }
    void runLine(line);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!shellId) return;
    const h = history.current[shellId];
    if (e.key === 'ArrowUp' && h.length) {
      e.preventDefault();
      historyPos.current = historyPos.current < 0 ? h.length - 1 : Math.max(0, historyPos.current - 1);
      setInput(h[historyPos.current]);
    } else if (e.key === 'ArrowDown' && historyPos.current >= 0) {
      e.preventDefault();
      historyPos.current += 1;
      if (historyPos.current >= h.length) {
        historyPos.current = -1;
        setInput('');
      } else {
        setInput(h[historyPos.current]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setOutput((p) => ({ ...p, [shellId]: '' }));
    }
  };

  const handleStop = async () => {
    if (!shellId) return;
    await api?.termStop(shellId);
    setRunning((prev) => ({ ...prev, [shellId]: false }));
    setStatus((prev) => ({ ...prev, [shellId]: t('termStopped') }));
  };

  const currentStatus = shellId ? status[shellId] : '';

  return (
    <div className="flex flex-col h-full bg-[#0c0f16] text-zinc-300 font-mono text-xs" onClick={() => shellId && inputRef.current?.focus()}>
      <div className="flex items-center justify-between px-2 h-8 border-b border-zinc-800/80 bg-[#10131c]">
        <div className="flex items-center gap-1">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={(e) => {
                e.stopPropagation();
                setTab(tb.id);
              }}
              className={`px-2.5 h-6 rounded text-[11px] transition-colors ${
                tab === tb.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tb.label}
              {tb.id !== 'log' && running[tb.id] && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {shellId && running[shellId] && (
            <button onClick={handleStop} title={t('termStopTitle')} aria-label={t('termStopTitle')} className="p-1 rounded text-zinc-500 hover:text-zinc-200">
              <Square size={12} />
            </button>
          )}
          <button
            onClick={() => (shellId ? setOutput((p) => ({ ...p, [shellId]: '' })) : onClear())}
            title={`${t('termClear')} (Ctrl+L)`}
            aria-label={t('termClear')}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2">
        {shellId === null ? (
          logs.length === 0 ? (
            <div className="text-zinc-600">{t('termLogEmpty')}</div>
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
        ) : output[shellId] ? (
          <Output text={output[shellId]} />
        ) : (
          !currentStatus && <div className="text-zinc-600">{t('termHint')}</div>
        )}
        {shellId && currentStatus && <div className="text-amber-300/90 mt-1">{currentStatus}</div>}
      </div>

      {shellId && (
        <form onSubmit={handleSubmit} className="flex items-center px-3 h-9 border-t border-zinc-800/80 bg-[#10131c] gap-0">
          <span className="shrink-0 max-w-[55%] truncate select-none" title={shownCwd}>
            {shellId === 'powershell' && <span className="font-bold" style={{ color: '#7aa2f7' }}>PS </span>}
            <span style={{ color: '#7dcfff' }}>{shortenPath(shownCwd)}</span>
            {branch && <span style={{ color: '#bb9af7' }}> ({branch})</span>}
            <span className="text-zinc-300">&gt;&nbsp;</span>
          </span>
          <div className="relative flex-1 h-full min-w-0">
            <div ref={overlayRef} aria-hidden className="absolute inset-0 flex items-center whitespace-pre overflow-hidden pointer-events-none">
              {tokens.map((tk, i) => (
                <span key={i} style={{ color: TOKEN_COLOR[tk.kind] ?? '#e4e4e7' }}>
                  {tk.text}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              disabled={!running[shellId]}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label={t('termPlaceholder')}
              placeholder={running[shellId] ? t('termPlaceholder') : t('termNotReady')}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-50"
            />
          </div>
        </form>
      )}
    </div>
  );
};
