import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Plus, ChevronDown, Trash2, Maximize2, Minimize2, X, SquareTerminal, FolderOpen, CircleX, ScrollText, Bug, FlaskConical, GitBranch } from 'lucide-react';
import type { ConsoleLog } from '../types';
import { t } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { commandToAnsi, parseAnsi, shortenPath, tokenizeCommand, TOKEN_COLOR } from '../services/terminalText';
import { PopupMenu } from './Menu';
import '../i18n/uiTextDev'; // gerçek terminal metinleri (gecikmeli yüklenen ek sözlük)
import '../i18n/uiTextScm'; // Sorunlar sekmesi metinleri
import { ProblemsPanel } from './ProblemsPanel';
import { useProblems } from '../services/problems';
import { dropPty, getPtyBuffer, pushPtyData } from '../services/ptyBus';
import { clearDebugConsole, useDebug } from '../services/debugStore';
import { OutputPanel } from './OutputPanel';
import { DebugConsolePanel } from './DebugConsolePanel';
import { TestPanel } from './TestPanel';
import type { PtyHandle } from './PtyView';
import '../i18n/uiTextTheme'; // taşınan metinler (gecikmeli sözlük)

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

type ShellId = 'powershell' | 'cmd' | 'gitbash';
type PanelTab = 'terminal' | 'log' | 'problems' | 'debug' | 'tests';

interface Session {
  id: string;
  shell: ShellId;
  /** pipe: klasik (satır içi istem, boru); pty: gerçek terminal (xterm.js + PTY). */
  kind: 'pipe' | 'pty';
  running: boolean;
  status: string;
  /** Oturum hiç başlatılamadı (PTY'de çıktı olmadığı için hata ayrıca gösterilir). */
  failed?: boolean;
  output: string;
  cwd: string;
}

/** Kabuğa uygun, güvenli `cd`. PowerShell: tek tırnak (içteki ' ve akıllı tırnaklar ikilenir); CMD: çift tırnak. Tehlikeli yol için null. */
export function cdCommand(shell: ShellId, dir: string): string | null {
  // eslint-disable-next-line no-control-regex
  if (!dir || dir.length > 4096 || /[\u0000-\u001f\u007f\u2028\u2029]/.test(dir)) return null;
  if (shell === 'cmd') return /["%]/.test(dir) ? null : `cd /d "${dir}"`;
  // Git Bash: tek tırnak içinde, ters eğik çizgiler düzleştirilir (C:/Users/..); içteki tek tırnak '\'' ile kaçırılır
  if (shell === 'gitbash') return `cd '${dir.replace(/\\/g, '/').replace(/'/g, `'\\''`)}'`;
  return `Set-Location -LiteralPath '${dir.replace(/['\u2018\u2019\u201a\u201b]/g, (c) => c + c)}'`;
}

const SHELL_LABEL: Record<ShellId, string> = { powershell: 'PowerShell', cmd: 'CMD', gitbash: 'Git Bash' };
/** Sekme sırası: geçiş yönü (yeni içerik hangi yönden girer) buradan hesaplanır. */
const TAB_ORDER: PanelTab[] = ['problems', 'log', 'debug', 'terminal', 'tests'];
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
  const wantShell = values.defaultShell === 'cmd' ? 'cmd' : values.defaultShell === 'gitbash' ? 'gitbash' : 'powershell';
  const colorInput = values.terminalColorInput !== false;
  const fontSize = Number(values.terminalFontSize) || 12;
  const lineHeight = Number(values.terminalLineHeight) || 1.4;
  const scrollback = Number(values.terminalScrollback) || 200_000;
  const cursor = String(values.terminalCursor);

  const [tab, setTab] = useState<PanelTab>('terminal');
  // Fluent geçişi: etkin sekmeyi gösteren tek "hap" sekmeler arasında kayar; içerik yön bilgisiyle belirir
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [pillReady, setPillReady] = useState(false);
  const prevTab = useRef<PanelTab>(tab);
  const paneDir = useRef(1);
  if (prevTab.current !== tab) {
    paneDir.current = TAB_ORDER.indexOf(tab) >= TAB_ORDER.indexOf(prevTab.current) ? 1 : -1;
    prevTab.current = tab;
  }
  const measurePill = useCallback(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!el) return;
    const next = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    setPill((p) => (p && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h ? p : next));
  }, []);
  useLayoutEffect(() => { measurePill(); }, [tab, measurePill]);
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measurePill); // dar panelde etiket gizlenince ya da rozet gelince hap ölçüsü güncellenir
    ro.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [measurePill]);
  useEffect(() => {
    if (!pill || pillReady) return;
    const r = requestAnimationFrame(() => setPillReady(true)); // ilk yerleşim kaymasız; sonrakiler animasyonlu
    return () => cancelAnimationFrame(r);
  }, [pill, pillReady]);
  const [testClear, setTestClear] = useState(0);
  const debug = useDebug();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [ptyOk, setPtyOk] = useState<boolean | null>(null); // null: henüz denetlenmedi
  const [gitBashOk, setGitBashOk] = useState(false); // Git for Windows'un bash.exe'si bulundu mu
  const ptyHandles = useRef(new Map<string, PtyHandle>());

  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const hasShell = !!api?.termStart;
  // Varsayılan tür: gerçek terminal (PTY) kullanılabilirse ve ayar 'klasik' değilse o
  const defaultKind: 'pipe' | 'pty' = values.terminalMode === 'classic' || !ptyOk ? 'pipe' : 'pty';
  // Git Bash yalnız gerçek terminalde (PTY) çalışır; kullanılamıyorsa varsayılan PowerShell'e düşer
  const defaultShell: ShellId = wantShell === 'gitbash' && !(gitBashOk && defaultKind === 'pty') ? 'powershell' : wantShell;
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
    void api.pty.available().then((r) => { setPtyOk(!!r.available); setGitBashOk(!!r.available && !!r.gitBash); }).catch(() => setPtyOk(false));
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
      if (shell === 'gitbash') kind = 'pty'; // bash boru ile değil, yalnız PTY ile açılır
      counter.current += 1;
      if (kind === 'pty' && api?.pty) {
        // Gerçek terminal: oturumu burada başlatırız; xterm görünümü (PtyView) yalnız çizer ve çıktıyı tampondan oynatır
        const id = `p-${counter.current}-${Math.random().toString(36).slice(2, 6)}`;
        setSessions((prev) => [...prev, { id, shell, kind: 'pty', running: true, status: '', output: '', cwd }]);
        setActiveId(id);
        setTab('terminal');
        const res = await api.pty.start({ id, shell, cwd, cols: 100, rows: 28 });
        if (!res.success) patch(id, (s) => ({ ...s, running: false, failed: true, status: res.error === 'too-many' ? t('termTooMany') : res.error === 'no-pty' ? t('termPtyUnavailable') : res.error === 'no-gitbash' ? t('termNoGitBash') : t('termStartFailed') }));
        return;
      }
      if (!api?.termStart || shell === 'gitbash') return;
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
  // Terminal hazır olmadan gelen komutlar sırayla çalışır (cd, ardından run): tek yuva olsaydı sonraki öncekini ezerdi
  const pendingRun = useRef<string[]>([]);
  const flushing = useRef(false);
  const flushPending = async (send: (line: string) => Promise<void>) => {
    if (flushing.current) return;
    flushing.current = true;
    try {
      while (pendingRun.current.length) {
        const c = pendingRun.current.shift() as string;
        await send(c);
      }
    } finally { flushing.current = false; }
  };
  const readyIds = useRef<Set<string>>(new Set());
  const activeRef = useRef(active);
  activeRef.current = active;
  const runLineRef = useRef<(line: string) => Promise<void>>(async () => {});
  useEffect(() => {
    const onBridge = (e: Event) => {
      const d = (e as CustomEvent<{ action: 'run' | 'cd' | 'new' | 'clear' | 'tab'; command?: string; dir?: string; tab?: PanelTab; stay?: boolean }>).detail;
      if (!d) return;
      if (d.action === 'tab') { if (d.tab === 'problems' || d.tab === 'terminal' || d.tab === 'log' || d.tab === 'debug' || d.tab === 'tests') setTab(d.tab); return; }
      // cd: etkin kabuğa uygun komut (CMD'de sürücü değiştirmek için /d gerekir). Özel karakterler (& $ ^ vb.) kabuğa uygun alıntılanır;
      // yalnız denetim karakteri/yeni satır (ve CMD'de alıntı içinde bile genişleyen %) içeren yollar reddedilir
      const cdCmd = d.action === 'cd' && d.dir ? cdCommand(active?.shell ?? 'powershell', d.dir) : null;
      if (d.action === 'cd' && d.dir && cdCmd) {
        const cmd = cdCmd;
        if (!d.stay) setTab('terminal');
        if (active?.running && !pendingRun.current.length) void runLine(cmd);
        else {
          pendingRun.current.push(cmd);
          if (visible && sessions.length === 0 && cwd) { autoOpened.current = true; void createSession(defaultShell); }
        }
        return;
      }
      if (d.action === 'new') void createSession(defaultShell);
      else if (d.action === 'clear') clearActive();
      else if (d.action === 'run' && d.command) {
        if (!d.stay) setTab('terminal');
        if (active?.running && !pendingRun.current.length) void runLine(d.command);
        else {
          pendingRun.current.push(d.command);
          if (visible && sessions.length === 0 && cwd) { autoOpened.current = true; void createSession(defaultShell); }
        }
      }
    };
    window.addEventListener('nova:term', onBridge);
    return () => window.removeEventListener('nova:term', onBridge);
  });
  // Ana süreçteki `term:ready` (kabuk ilk işareti): bekleyen komut sabit gecikme olmadan burada gönderilir (B-12)
  useEffect(() => {
    const off = api?.onTermReady?.(({ id }) => {
      readyIds.current.add(id);
      window.dispatchEvent(new CustomEvent('nova:term-ready', { detail: { id } }));
      const cur = activeRef.current;
      if (pendingRun.current.length && cur && cur.id === id && cur.running) void flushPending((c) => runLineRef.current(c));
    });
    return () => off?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // pipe oturumlarında `term:ready` beklenir (kabuk henüz komut almayabilir); olay desteği yoksa ya da pty ise doğrudan gönderilir
    if (pendingRun.current.length && active?.running && (active.kind !== 'pipe' || !api?.onTermReady || readyIds.current.has(active.id))) {
      void flushPending((c) => runLine(c));
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

  runLineRef.current = runLine;

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

  const clearActive = () => (tab === 'log' ? onClear() : tab === 'debug' ? clearDebugConsole() : tab === 'tests' ? setTestClear((n) => n + 1) : active?.kind === 'pty' ? ptyHandles.current.get(active.id)?.clear() : active && patch(active.id, (s) => ({ ...s, output: '' })));

  // ---- Üst çubuk ----
  const problemCount = useProblems();
  const errorLogs = useMemo(() => logs.filter((l) => l.type === 'error').length, [logs]);
  const badge = (n: number, tone: string) => (n > 0 ? <span className={`px-1.5 min-w-4 rounded-full text-[10px] leading-4 text-center ${tone}`}>{n > 99 ? '99+' : n}</span> : null);
  const tabs: { id: PanelTab; label: string; icon: React.ReactNode; extra?: React.ReactNode }[] = [
    {
      id: 'problems', label: t('prbTab'), icon: <CircleX size={13} />,
      extra: badge(problemCount.errors + problemCount.warnings, problemCount.errors ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-400/20 text-amber-200')
    },
    { id: 'log', label: t('pnlOutput'), icon: <ScrollText size={13} />, extra: badge(errorLogs, 'bg-rose-500/20 text-rose-300') },
    {
      id: 'debug', label: t('pnlDebug'), icon: <Bug size={13} />,
      extra: debug.status !== 'idle' ? <span className={`size-1.5 rounded-full ${debug.status === 'paused' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} /> : null
    },
    { id: 'terminal', label: t('termTab'), icon: <SquareTerminal size={13} />, extra: sessions.length > 1 ? badge(sessions.length, 'bg-white/10 text-zinc-300') : null },
    { id: 'tests', label: t('pnlTests'), icon: <FlaskConical size={13} /> },
  ];
  // Fluent tarzı sekme: etkin zemin ve alt vurgu çubuğu tek "hap"tır (listRef içinde), sekmeler arasında kayar.
  // Düğmenin kendi zemini yalnız hover'da görünür; kaplama değişkenleri açık/koyu temada uyar.
  const tabBtn = (it: (typeof tabs)[number]) => (
    <button
      key={it.id}
      role="tab"
      aria-selected={tab === it.id}
      onClick={() => setTab(it.id)}
      title={it.label}
      className={`relative z-10 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-[background-color,color,transform] duration-(--dur-fast) ease-(--ease-out-soft) active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-indigo-400 ${tab === it.id ? 'text-zinc-50' : 'text-zinc-400 hover:bg-[color-mix(in_srgb,var(--hover-overlay)_60%,transparent)] hover:text-zinc-100'}`}
    >
      <span className={`transition-colors duration-(--dur-fast) ${tab === it.id ? 'text-indigo-300' : ''}`}>{it.icon}</span>
      <span className="hidden @md:inline">{it.label}</span>
      {it.extra}
    </button>
  );

  const readActiveOutput = useCallback(() => (active ? (active.kind === 'pty' ? getPtyBuffer(active.id) : active.output) : ''), [active]);

  const cursorShape = cursor === 'bar' ? 'bar' : cursor === 'underline' ? 'underline' : 'block';
  const inputStyle = { caretShape: cursorShape, caretColor: 'var(--color-zinc-100)' } as React.CSSProperties;

  return (
    <div className="@container flex flex-col h-full bg-nv-side text-zinc-300 font-mono" style={{ fontSize }}>
      <div className="flex items-center justify-between h-10 px-2 gap-2 border-b border-nv-border shrink-0 font-sans">
        <div ref={listRef} className="relative flex items-center gap-0.5 h-full min-w-0 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label={t('termTab')}>
          {pill && (
            <span
              aria-hidden
              className={`absolute rounded-md pointer-events-none bg-(--active-overlay) ${pillReady ? 'transition-[transform,width] duration-(--dur-slow) ease-(--ease-out-soft)' : ''}`}
              style={{ left: 0, top: pill.y, height: pill.h, width: pill.w, transform: `translateX(${pill.x}px)` }}
            >
              <span className="absolute left-1/2 -translate-x-1/2 bottom-px w-3.5 h-[2px] rounded-full bg-indigo-400" />
            </span>
          )}
          {tabs.map(tabBtn)}
        </div>
        <div className="flex items-center gap-0.5">
          {tab === 'terminal' && hasShell && (
            <div className="flex items-center rounded-md bg-(--hover-overlay) me-1 animate-fade-in">
              <button onClick={() => void createSession(defaultShell)} disabled={!cwd} title={t('termNew')} aria-label={t('termNew')} className="icon-btn w-6! disabled:opacity-40">
                <Plus size={15} />
              </button>
              {gitBashOk && (
                <button onClick={() => void createSession('gitbash', 'pty')} disabled={!cwd} title="Git Bash" aria-label="Git Bash" className="icon-btn w-6! disabled:opacity-40">
                  <GitBranch size={14} />
                </button>
              )}
              <span aria-hidden className="w-px h-3.5 bg-zinc-500/30" />
              <button
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setMenu({ x: r.left - 140, y: r.bottom + 4 });
                }}
                disabled={!cwd}
                title={t('termPickShell')}
                aria-label={t('termPickShell')}
                className="icon-btn w-5! disabled:opacity-40"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          )}
          {(tab === 'log' || tab === 'debug' || tab === 'tests' || (tab === 'terminal' && active)) && (
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
        <div className="flex-1 min-w-0 flex flex-col">
        {tab === 'terminal' && active && (
          <div key={active.id} className="flex items-center gap-2 h-8 px-3 shrink-0 font-sans text-[11.5px] text-zinc-400 min-w-0 animate-fade-in" dir="ltr">
            <span className={`size-1.5 rounded-full shrink-0 ${active.running ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            <span className="text-zinc-200 font-medium shrink-0">{SHELL_LABEL[active.shell]}</span>
            {ptyOk && (
              <span className="shrink-0 px-2 h-[18px] inline-flex items-center rounded-full bg-white/[0.07] text-[10px] text-zinc-300">
                {active.kind === 'pty' ? t('termFull') : t('termClassic')}
              </span>
            )}
            <span className="truncate min-w-0 text-zinc-500" title={active.cwd}>{shortenPath(active.cwd, 64)}</span>
            {branch && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 h-[18px] rounded-full bg-violet-400/10 text-violet-300">
                <GitBranch size={11} />{branch}
              </span>
            )}
          </div>
        )}
        <div className="flex-1 min-h-0 relative">
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
          {/* Gerçek terminal başlatılamadıysa (ör. Git Bash yok) nedeni göster: PTY'de başka çıktı olmaz */}
          {tab === 'terminal' && active?.kind === 'pty' && active.failed && (
            <div role="alert" className="absolute inset-x-3 top-3 z-10 flex items-start gap-2 rounded-lg px-3 py-2 bg-rose-500/10 text-rose-300 font-sans text-[12px] animate-fade-in">
              <CircleX size={14} className="mt-px shrink-0" />
              <span className="min-w-0">{active.status}</span>
            </div>
          )}
          {/* Sekme/oturum değişince içerik yön bilgisiyle yumuşakça belirir (gerçek terminal PtyView içinde kendi belirmesini yapar) */}
          {!(tab === 'terminal' && active?.kind === 'pty') && (
          <div
            key={tab === 'terminal' ? `terminal-${activeId}` : tab}
            className="absolute inset-0 animate-pane-in"
            style={{ '--pane-dir': paneDir.current } as React.CSSProperties}
          >
          {tab === 'problems' ? (
            <ProblemsPanel rootPath={cwd ?? undefined} />
          ) : tab === 'log' ? (
            <OutputPanel logs={logs} lineHeight={lineHeight} />
          ) : tab === 'debug' ? (
            <DebugConsolePanel lineHeight={lineHeight} />
          ) : tab === 'tests' ? (
            <TestPanel
              root={cwd ?? null}
              sessionId={active?.id ?? null}
              readOutput={readActiveOutput}
              pipeTick={active?.output.length ?? 0}
              clearKey={testClear}
              onShowTerminal={() => setTab('terminal')}
              onOpenFolder={onOpenFolder}
            />
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
          ) : (
            <div ref={scrollRef} dir="ltr" onScroll={onScroll} onClick={focusInput} className="absolute inset-0 overflow-y-auto px-3 py-1.5" style={{ lineHeight }} data-terminal-scroll="">
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
              {!active && cwd && <div className="text-zinc-500 font-sans">{t('termStarting')}</div>}
            </div>
          )}
          </div>
          )}
        </div>
        </div>

        {/* Oturum listesi: birden fazla terminal varken (VS Code gibi) sağda; Fluent kart satırları */}
        {tab === 'terminal' && sessions.length > 1 && (
          <div className="w-44 shrink-0 border-s border-nv-border overflow-y-auto font-sans p-1.5 flex flex-col gap-0.5 animate-fade-in" role="tablist" aria-label={t('termTab')}>
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
                  className={`group relative flex items-center gap-2 h-8 ps-3 pe-1 rounded-md cursor-pointer text-[12px] animate-tab-in transition-[background-color,color,transform] duration-(--dur-fast) ease-(--ease-out-soft) active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-indigo-400 ${on ? 'bg-(--active-overlay) text-zinc-50' : 'text-zinc-400 hover:bg-(--hover-overlay) hover:text-zinc-100'}`}
                >
                  <span className={`absolute start-[3px] top-2 bottom-2 w-[3px] rounded-full bg-indigo-400 origin-center transition-[transform,opacity] duration-(--dur-base) ease-(--ease-out-soft) ${on ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`} />
                  {s.shell === 'gitbash' ? <GitBranch size={13} className={s.running ? 'text-emerald-400 shrink-0' : 'text-zinc-500 shrink-0'} /> : <SquareTerminal size={13} className={s.running ? 'text-emerald-400 shrink-0' : 'text-zinc-500 shrink-0'} />}
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
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1 rounded-sm hover:bg-(--active-overlay) transition-[opacity,background-color] duration-(--dur-fast)"
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
                  // Git Bash her zaman listelenir; Git for Windows yoksa soluk görünür ve ipucu nedenini söyler
                  { label: `Git Bash · ${t('termFull')}`, icon: <GitBranch size={13} />, disabled: !gitBashOk, hint: t('termNoGitBash'), onClick: () => void createSession('gitbash', 'pty') },
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
