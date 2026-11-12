import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, ChevronDown, Trash2, Maximize2, Minimize2, X, SquareTerminal, FolderOpen } from 'lucide-react';
import type { ConsoleLog } from '../types';
import { t } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { commandToAnsi, parseAnsi, shortenPath, tokenizeCommand, TOKEN_COLOR } from '../services/terminalText';
import { PopupMenu } from './Menu';
import '../i18n/uiTextDev'; // gerçek terminal metinleri (gecikmeli yüklenen ek sözlük)
import { dropPty, pushPtyData } from '../services/ptyBus';
import type { PtyHandle } from './PtyView';

const PtyView = React.lazy(() => import('./PtyView')); // xterm.js yalnız ilk gerçek terminal açılınca yüklenir

interface TerminalProps {
  logs: ConsoleLog[];
  onClear: () => void;
  cwd?: string | null;
  branch?: string | null;
  /** Panel görünür mü (ilk terminal ilk görünüşte açılır; panel gizliyken oturumlar canlı kalır). */
  visible: boolean;
  maximized: boolean;
  onToggleMaximize: () => void;
  onClose: () => void;
  onOpenFolder?: () => void;
}

type ShellId = 'powershell' | 'cmd';
type PanelTab = 'terminal' | 'log';

interface Session {
  id: string;
  shell: ShellId;
  /** pipe: klasik (satır içi istem, boru); pty: gerçek terminal (xterm.js + PTY). */
  kind: 'pipe' | 'pty';
  running: boolean;
  status: string;
  output: string;
  cwd: string;
}

const SHELL_LABEL: Record<ShellId, string> = { powershell: 'PowerShell', cmd: 'CMD' };
const ESC = '\u001b';
const MAX_HISTORY = 100;

// İstem: PS (mavi) + yol (turkuaz) + dal (mor) + ok
const promptAnsi = (shell: ShellId, cwd: string, branch?: string | null) =>
  `${shell === 'powershell' ? `${ESC}[1;38;5;4mPS${ESC}[0m ` : ''}${ESC}[38;5;6m${shortenPath(cwd)}${ESC}[0m` +
  `${branch ? ` ${ESC}[38;5;5m(${branch})${ESC}[0m` : ''}${ESC}[0m> `;

const baseName = (p: string) => p.split(/[\\/]/).filter(Boolean).pop() ?? p;

const Output: React.FC<{ text: string }> = React.memo(({ text }) => {
  const spans = useMemo(() => parseAnsi(text), [text]);
  return (
    <pre className="whitespace-pre-wrap break-all m-0 text-zinc-300 select-text">
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

export const Terminal: React.FC<TerminalProps> = ({ logs, onClear, cwd, branch, visible, maximized, onToggleMaximize, onClose, onOpenFolder }) => {
  const { values } = useSettings();
  const defaultShell: ShellId = values.defaultShell === 'cmd' ? 'cmd' : 'powershell';
  const colorInput = values.terminalColorInput !== false;
  const fontSize = Number(values.terminalFontSize) || 12;
  const lineHeight = Number(values.terminalLineHeight) || 1.4;
  const scrollback = Number(values.terminalScrollback) || 200_000;
  const cursor = String(values.terminalCursor);

  const [tab, setTab] = useState<PanelTab>('terminal');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [ptyOk, setPtyOk] = useState<boolean | null>(null); // null: henüz denetlenmedi
  const ptyHandles = useRef(new Map<string, PtyHandle>());

  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const hasShell = !!api?.termStart;
  // Varsayılan tür: gerçek terminal (PTY) kullanılabilirse ve ayar 'klasik' değilse o
  const defaultKind: 'pipe' | 'pty' = values.terminalMode === 'classic' || !ptyOk ? 'pipe' : 'pty';
  const counter = useRef(0);
  const history = useRef<Map<string, string[]>>(new Map());
  const historyPos = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const autoOpened = useRef(false);
  const scrollbackRef = useRef(scrollback);
  scrollbackRef.current = scrollback;
  const sessionsRef = useRef<Session[]>([]);
  sessionsRef.current = sessions;
  useEffect(() => {
    if (!api?.pty) { setPtyOk(false); return; }
    void api.pty.available().then((r) => setPtyOk(!!r.available)).catch(() => setPtyOk(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const patch = useCallback((id: string, fn: (s: Session) => Session) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? fn(s) : s)));
  }, []);

  // ---- Ana süreçten gelen olaylar (kimlikle eşleşir) ----
  useEffect(() => {
    if (!api?.onTermOutput || !api?.onTermExit) return;
    const offOut = api.onTermOutput(({ id, text, stream }) => {
      const colored = stream === 'stderr' ? `${ESC}[38;5;1m${text}${ESC}[0m` : text;
      // Geliştirme sunucusu adresi (ör. Vite: Local: http://localhost:5173/) → önizleme panelinde tek tıkla açılır
      const plain = text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
      const m = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):\d{2,5}[^\s'")>]*/i.exec(plain);
      if (m) window.dispatchEvent(new CustomEvent('nova:localhost', { detail: m[0] }));
      patch(id, (s) => ({ ...s, output: (s.output + colored).slice(-scrollbackRef.current) }));
    });
    const offCwd = api.onTermCwd?.(({ id, cwd: next }) => {
      if (next) patch(id, (s) => (s.cwd === next ? s : { ...s, cwd: next }));
    });
    const offExit = api.onTermExit(({ id, code }) => {
      patch(id, (s) => ({ ...s, running: false, status: t('termEnded').replace('{code}', String(code ?? '?')) }));
    });
    const offPtyData = api.pty?.onData(({ id, data }) => {
      pushPtyData(id, data);
      // Geliştirme sunucusu adresi → önizleme (klasik terminaldeki davranışla aynı)
      const plain = data.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
      const m = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):\d{2,5}[^\s'")>]*/i.exec(plain);
      if (m) window.dispatchEvent(new CustomEvent('nova:localhost', { detail: m[0] }));
    });
    const offPtyExit = api.pty?.onExit(({ id, code }) => {
      const msg = t('termEnded').replace('{code}', String(code ?? '?'));
      pushPtyData(id, `\r\n\x1b[2m${msg}\x1b[0m\r\n`);
      patch(id, (s) => ({ ...s, running: false, status: msg }));
    });
    return () => {
      offOut?.();
      offCwd?.();
      offExit?.();
      offPtyData?.();
      offPtyExit?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSession = useCallback(
    async (shell: ShellId, kind: 'pipe' | 'pty' = defaultKind) => {
      if (!cwd || sessions.length >= 12) return;
      counter.current += 1;
      if (kind === 'pty' && api?.pty) {
        // Gerçek terminal: oturumu burada başlatırız; xterm görünümü (PtyView) yalnız çizer ve çıktıyı tampondan oynatır
        const id = `p-${counter.current}-${Math.random().toString(36).slice(2, 6)}`;
        setSessions((prev) => [...prev, { id, shell, kind: 'pty', running: true, status: '', output: '', cwd }]);
        setActiveId(id);
        setTab('terminal');
        const res = await api.pty.start({ id, shell, cwd, cols: 100, rows: 28 });
        if (!res.success) patch(id, (s) => ({ ...s, running: false, status: res.error === 'too-many' ? t('termTooMany') : res.error === 'no-pty' ? t('termPtyUnavailable') : t('termStartFailed') }));
        return;
      }
      if (!api?.termStart) return;
      const id = `t-${counter.current}-${Math.random().toString(36).slice(2, 6)}`;
      setSessions((prev) => [...prev, { id, shell, kind: 'pipe', running: false, status: t('termStarting'), output: '', cwd }]);
      setActiveId(id);
      setTab('terminal');
      const res = await api.termStart(shell, cwd, id);
      patch(id, (s) => ({ ...s, running: res.success, status: res.success ? '' : res.error === 'too-many' ? t('termTooMany') : t('termStartFailed') }));
      inputRef.current?.focus();
    },
    [api, cwd, sessions.length, patch, defaultKind]
  );

  // Menü / komut paleti köprüsü: yeni terminal, temizle, komut çalıştır (ör. dosyayı çalıştır)
  const pendingRun = useRef<string | null>(null);
  useEffect(() => {
    const onBridge = (e: Event) => {
      const d = (e as CustomEvent<{ action: 'run' | 'cd' | 'new' | 'clear'; command?: string; dir?: string }>).detail;
      if (!d) return;
      // cd: etkin kabuğa uygun komut (CMD'de sürücü değiştirmek için /d gerekir); tırnak içeren yol reddedilir
      if (d.action === 'cd' && d.dir && !/["`$&|<>^%\r\n]/.test(d.dir)) {
        const cmd = active?.shell === 'cmd' ? `cd /d "${d.dir}"` : `Set-Location -LiteralPath "${d.dir}"`;
        setTab('terminal');
        if (active?.running) void runLine(cmd);
        else {
          pendingRun.current = cmd;
          if (visible && sessions.length === 0 && cwd) { autoOpened.current = true; void createSession(defaultShell); }
        }
        return;
      }
      if (d.action === 'new') void createSession(defaultShell);
      else if (d.action === 'clear') clearActive();
      else if (d.action === 'run' && d.command) {
        setTab('terminal');
        if (active?.running) void runLine(d.command);
        else {
          pendingRun.current = d.command;
          if (visible && sessions.length === 0 && cwd) { autoOpened.current = true; void createSession(defaultShell); }
        }
      }
    };
    window.addEventListener('nova:term', onBridge);
    return () => window.removeEventListener('nova:term', onBridge);
  });
  useEffect(() => {
    if (pendingRun.current && active?.running) {
      const c = pendingRun.current;
      pendingRun.current = null;
      void runLine(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.running, active?.id]);

  // Panel ilk kez görününce ve klasör varsa ilk terminali aç
  useEffect(() => {
    if (!visible) {
      autoOpened.current = false;
      return;
    }
    if (hasShell && cwd && ptyOk !== null && sessions.length === 0 && !autoOpened.current) {
      autoOpened.current = true;
      void createSession(defaultShell);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, cwd, hasShell, ptyOk]);

  const closeSession = useCallback(
    async (id: string) => {
      const kind = sessionsRef.current.find((x) => x.id === id)?.kind;
      if (kind === 'pty') { await api?.pty?.stop(id); dropPty(id); ptyHandles.current.delete(id); } else await api?.termStop(id);
      history.current.delete(id);
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        setActiveId((cur) => (cur === id ? next[next.length - 1]?.id ?? null : cur));
        // Son terminal kapanınca panel de kapanır (VS Code gibi); yeniden açınca yenisi başlar
        if (next.length === 0) {
          autoOpened.current = false;
          setTimeout(onClose, 0);
        }
        return next;
      });
    },
    [api, onClose]
  );

  // ---- Kaydırma: kullanıcı en alttaysa yeni çıktıyı izle ----
  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [active?.output, active?.status, logs, tab, activeId, input]);

  // Uzun komutta kaydırma konumunu üstteki renkli katmanla eşle
  useEffect(() => {
    if (overlayRef.current && inputRef.current) overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
  });

  // Etkin oturum değişince girdi ve geçmiş konumunu sıfırla
  useEffect(() => {
    setInput('');
    historyPos.current = -1;
    stick.current = true;
    inputRef.current?.focus();
  }, [activeId]);

  const activeShell = active?.shell;
  const tokens = useMemo(() => (activeShell ? tokenizeCommand(input, activeShell) : []), [input, activeShell]);

  // ---- Komut gönderme ----
  const runLine = async (line: string) => {
    // Gerçek terminal: satır doğrudan PTY'ye yazılır (kabuk kendi istemini ve geçmişini yönetir)
    if (active?.kind === 'pty') { if (active.running) await api?.pty?.write(active.id, line + '\r'); return; }
    if (!active || !active.running || !api?.termInput) return;
    const echo = `${promptAnsi(active.shell, active.cwd, branch)}${colorInput ? commandToAnsi(line, active.shell) : line}\n`;
    patch(active.id, (s) => ({ ...s, output: (s.output + echo).slice(-scrollbackRef.current) }));
    stick.current = true;
    const res = await api.termInput(active.id, line);
    if (!res.success) patch(active.id, (s) => ({ ...s, status: t('termSendFailed') }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const line = input;
    setInput('');
    historyPos.current = -1;
    if (active && line.trim()) {
      const h = history.current.get(active.id) ?? [];
      if (h[h.length - 1] !== line) h.push(line);
      if (h.length > MAX_HISTORY) h.shift();
      history.current.set(active.id, h);
    }
    void runLine(line);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!active) return;
    const h = history.current.get(active.id) ?? [];
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
      patch(active.id, (s) => ({ ...s, output: '' }));
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
      // Seçim yoksa: satırı iptal et (^C), kabuk gibi
      e.preventDefault();
      const echo = `${promptAnsi(active.shell, active.cwd, branch)}${input}^C\n`;
      patch(active.id, (s) => ({ ...s, output: (s.output + echo).slice(-scrollbackRef.current) }));
      setInput('');
      historyPos.current = -1;
    }
  };

  const focusInput = () => {
    if (!window.getSelection()?.toString()) inputRef.current?.focus();
  };

  const clearActive = () => (tab === 'log' ? onClear() : active?.kind === 'pty' ? ptyHandles.current.get(active.id)?.clear() : active && patch(active.id, (s) => ({ ...s, output: '' })));

  // ---- Üst çubuk ----
  const tabBtn = (id: PanelTab, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`relative px-3 text-[11px] uppercase tracking-wide transition-colors ${tab === id ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      {label}
      <span className={`absolute left-2 right-2 bottom-0 h-px bg-indigo-500 origin-left transition-transform duration-200 ${tab === id ? 'scale-x-100' : 'scale-x-0'}`} />
    </button>
  );

  const cursorShape = cursor === 'bar' ? 'bar' : cursor === 'underline' ? 'underline' : 'block';
  const inputStyle = { caretShape: cursorShape, caretColor: 'var(--color-zinc-100)' } as React.CSSProperties;

  return (
    <div className="flex flex-col h-full bg-nv-side text-zinc-300 font-mono" style={{ fontSize }}>
      <div className="flex items-stretch justify-between h-9 pl-1 pr-2 border-b border-nv-border shrink-0 font-sans">
        <div className="flex items-stretch">
          {tabBtn('terminal', t('termTab'))}
          {tabBtn('log', t('termLog'))}
        </div>
        <div className="flex items-center gap-0.5">
          {tab === 'terminal' && hasShell && (
            <div className="flex items-center">
              <button onClick={() => void createSession(defaultShell)} disabled={!cwd} title={t('termNew')} aria-label={t('termNew')} className="icon-btn !w-6 disabled:opacity-40">
                <Plus size={15} />
              </button>
              <button
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setMenu({ x: r.left - 140, y: r.bottom + 4 });
                }}
                disabled={!cwd}
                title={t('termPickShell')}
                aria-label={t('termPickShell')}
                className="icon-btn !w-5 disabled:opacity-40"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          )}
          {(tab === 'log' || active) && (
            <button onClick={clearActive} title={`${t('termClear')} (Ctrl+L)`} aria-label={t('termClear')} className="icon-btn">
              <Trash2 size={14} />
            </button>
          )}
          {tab === 'terminal' && active && (
            <button onClick={() => void closeSession(active.id)} title={t('termKill')} aria-label={t('termKill')} className="icon-btn">
              <X size={15} />
            </button>
          )}
          <button onClick={onToggleMaximize} title={maximized ? t('termRestore') : t('termMaximize')} aria-label={maximized ? t('termRestore') : t('termMaximize')} className="icon-btn">
            {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={onClose} title={t('termClosePanel')} aria-label={t('termClosePanel')} className="icon-btn">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Ana alan */}
        <div className="flex-1 min-w-0 relative">
          {sessions.filter((x) => x.kind === 'pty').map((x) => (
            <Suspense key={x.id} fallback={null}>
              <PtyView
                id={x.id}
                cwd={x.cwd}
                active={tab === 'terminal' && x.id === activeId}
                fontSize={fontSize}
                lineHeight={lineHeight}
                cursor={cursor === 'bar' ? 'bar' : cursor === 'underline' ? 'underline' : 'block'}
                scrollback={scrollback}
                onReady={(pid, h) => { if (h) ptyHandles.current.set(pid, h); else ptyHandles.current.delete(pid); }}
              />
            </Suspense>
          ))}
          {tab === 'log' ? (
            <div className="absolute inset-0 overflow-y-auto px-3 py-1.5 select-text" style={{ lineHeight }}>
              {logs.length === 0 ? (
                <div className="text-zinc-600">{t('termLogEmpty')}</div>
              ) : (
                logs.map((log) => {
                  const color = log.type === 'error' ? 'text-rose-400' : log.type === 'warn' ? 'text-amber-300' : log.type === 'info' ? 'text-sky-300' : 'text-zinc-300';
                  return (
                    <div key={log.id} className="flex gap-2">
                      <span className="text-zinc-600 text-[10px] shrink-0 pt-px">{log.time}</span>
                      <span className={`break-all whitespace-pre-wrap ${color}`}>{log.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          ) : !cwd && sessions.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 font-sans text-[13px]">
              <SquareTerminal size={20} className="opacity-60" />
              <span>{t('termNeedFolder')}</span>
              {onOpenFolder && (
                <button onClick={onOpenFolder} className="flex items-center gap-1.5 h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] transition-colors">
                  <FolderOpen size={13} />
                  {t('openFolder')}
                </button>
              )}
            </div>
          ) : active?.kind === 'pty' ? null : (
            <div ref={scrollRef} onScroll={onScroll} onClick={focusInput} className="absolute inset-0 overflow-y-auto px-3 py-1.5" style={{ lineHeight }} data-terminal-scroll="">
              {active && (
                <>
                  <Output text={active.output} />
                  {active.status && <div className="text-amber-300/90 animate-fade-in">{active.status}</div>}
                  {active.running && (
                    <form onSubmit={submit} className="flex items-center" style={{ minHeight: `${lineHeight}em` }}>
                      <span className="shrink-0 max-w-[60%] truncate whitespace-pre select-none" title={active.cwd}>
                        {active.shell === 'powershell' && <span className="font-bold" style={{ color: 'var(--ansi-4)' }}>PS </span>}
                        <span style={{ color: 'var(--ansi-6)' }}>{shortenPath(active.cwd)}</span>
                        {branch && <span style={{ color: 'var(--ansi-5)' }}> ({branch})</span>}
                        <span className="text-zinc-300">&gt; </span>
                      </span>
                      <div className="relative flex-1 min-w-0 self-stretch">
                        <div ref={overlayRef} aria-hidden className="absolute inset-0 flex items-center whitespace-pre overflow-hidden pointer-events-none">
                          {tokens.map((tk, i) => (
                            <span key={i} style={{ color: colorInput ? TOKEN_COLOR[tk.kind] ?? 'var(--color-zinc-200)' : 'var(--color-zinc-200)' }}>
                              {tk.text}
                            </span>
                          ))}
                        </div>
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={onKeyDown}
                          spellCheck={false}
                          autoComplete="off"
                          autoFocus
                          aria-label={t('termPlaceholder')}
                          className="absolute inset-0 w-full h-full bg-transparent text-transparent outline-none"
                          style={inputStyle}
                        />
                      </div>
                    </form>
                  )}
                </>
              )}
              {!active && cwd && <div className="text-zinc-600 font-sans">{t('termStarting')}</div>}
            </div>
          )}
        </div>

        {/* Oturum listesi: birden fazla terminal varken (VS Code gibi) sağda */}
        {tab === 'terminal' && sessions.length > 1 && (
          <div className="w-44 shrink-0 border-l border-nv-border overflow-y-auto font-sans animate-fade-in" role="tablist" aria-label={t('termTab')}>
            {sessions.map((s) => {
              const on = s.id === activeId;
              return (
                <div
                  key={s.id}
                  role="tab"
                  aria-selected={on}
                  tabIndex={0}
                  onClick={() => setActiveId(s.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveId(s.id)}
                  className={`group relative flex items-center gap-2 h-7 pl-3 pr-1 cursor-pointer text-[12px] transition-colors ${on ? 'bg-nv-active text-zinc-50' : 'text-zinc-400 hover:bg-nv-hover hover:text-zinc-200'}`}
                >
                  <span className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-indigo-400 transition-transform ${on ? 'scale-y-100' : 'scale-y-0'}`} />
                  <SquareTerminal size={13} className={s.running ? 'text-emerald-400 shrink-0' : 'text-zinc-500 shrink-0'} />
                  <span className="truncate flex-1">
                    {SHELL_LABEL[s.shell]}{ptyOk && s.kind === 'pipe' ? <span className="text-zinc-500"> · {t('termClassic')}</span> : null} <span className="text-zinc-500">{baseName(s.cwd)}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void closeSession(s.id);
                    }}
                    aria-label={t('termKill')}
                    title={t('termKill')}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-white/10 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {menu && (
        <PopupMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            ...(ptyOk
              ? [
                  { label: `PowerShell · ${t('termFull')}`, icon: <SquareTerminal size={13} />, onClick: () => void createSession('powershell', 'pty') },
                  { label: `CMD · ${t('termFull')}`, icon: <SquareTerminal size={13} />, onClick: () => void createSession('cmd', 'pty') },
                  { separator: true as const }
                ]
              : []),
            { label: ptyOk ? `PowerShell · ${t('termClassic')}` : 'PowerShell', icon: <SquareTerminal size={13} />, onClick: () => void createSession('powershell', 'pipe') },
            { label: ptyOk ? `CMD · ${t('termClassic')}` : 'CMD', icon: <SquareTerminal size={13} />, onClick: () => void createSession('cmd', 'pipe') }
          ]}
        />
      )}
    </div>
  );
};
