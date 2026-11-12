import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, Bot, Check, ChevronDown, ChevronRight, ClipboardCheck, FlaskConical, Hammer, Lock, ScanSearch, Copy, CornerDownLeft, Download, FileCode, ImagePlus, Loader2, MessageSquare, Mic, Pencil, Plus,
  Settings as Cog, ShieldCheck, Sparkles, Square, Terminal as TermIcon, Trash2, Wrench, X, ArrowUp, Zap
} from 'lucide-react';
import { t, getUiLang } from '../i18n/uiText';
import '../i18n/uiTextAi'; // AI metinleri (gecikmeli yüklenen ek sözlük)
import { useSettings } from '../services/SettingsContext';
import { getSelectedText, replaceSelection } from '../services/editorBridge';
import { useDictation } from '../services/useDictation';
import {
  DEFAULT_MODEL, PROVIDER_LABEL, fileToImage, loadSessions, newSession, refineTitle, saveSessions, sessionToMarkdown, smartCategory, smartTitle, splitParts, titleFrom, uid,
  type AiSession, type CategoryId, type ChatMsg, type ToolCard
} from '../services/aiClient';
import { ChatSessions } from './ChatSessions';
import { ThinkingMenu, type Autonomy, type ThinkingLevel } from './ThinkingMenu';
import type { AiEvent, AiProvider, LlmModelInfo, LlmProgress } from '../types';

interface AIAssistantProps {
  activeFile?: { name: string; path?: string; language?: string; content?: string } | null;
  hasWorkspace: boolean;
  /** Açık çalışma klasörü: ajanın değiştirdiği dosyalar bu köke göre açılır. */
  rootPath?: string | null;
  onOpenFile?: (path: string) => void;
  onOpenSettings: () => void;
}

type Image = { mediaType: string; data: string; url: string };
const SLASH_BUILTIN = ['new', 'ask', 'agent'] as const;
const gb = (n: number) => (n / 1024 ** 3).toFixed(1);

// ---------- Küçük parçalar ----------
const CodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 rounded-md border border-zinc-700/60 bg-zinc-900/70 overflow-hidden max-w-full">
      <div className="flex items-center justify-between gap-2 px-2 h-6 bg-zinc-800/60 text-[10px] text-zinc-400">
        <span className="truncate">{lang || 'code'}</span>
        <span className="flex items-center gap-0.5 shrink-0">
          <button className="flex items-center gap-1 px-1.5 h-5 rounded hover:bg-zinc-700 hover:text-zinc-200" onClick={() => { void navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
            {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? t('aiCopied') : t('aiCopy')}
          </button>
          <button className="flex items-center gap-1 px-1.5 h-5 rounded hover:bg-zinc-700 hover:text-zinc-200" onClick={() => replaceSelection(code)}>
            <CornerDownLeft size={11} />{t('aiInsert')}
          </button>
        </span>
      </div>
      <pre className="p-2.5 overflow-x-auto text-[11.5px] leading-[1.45] text-zinc-200 font-mono"><code>{code}</code></pre>
    </div>
  );
};

const MessageText: React.FC<{ text: string }> = ({ text }) => (
  <div className="min-w-0 break-words [overflow-wrap:anywhere]">
    {splitParts(text).map((p, i) =>
      p.kind === 'code' ? <CodeBlock key={i} lang={p.lang} code={p.code} /> : p.text.trim() ? <div key={i} className="whitespace-pre-wrap">{p.text.replace(/^\n+|\n+$/g, '')}</div> : null
    )}
  </div>
);

const CopyMsg: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { void navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); }}
      title={t('aiCopyMsg')}
      aria-label={t('aiCopyMsg')}
      className={`w-5 h-4 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/10 opacity-0 group-hover/msg:opacity-100 focus:opacity-100 transition-opacity ${className}`}
    >
      {done ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
};

const toolTarget = (input: Record<string, unknown>) => String(input.path ?? input.query ?? input.command ?? '');

const ToolRow: React.FC<{ c: ToolCard }> = ({ c }) => {
  const [open, setOpen] = useState(false);
  const Ico = c.name === 'run_command' ? TermIcon : c.name.includes('file') ? FileCode : Wrench;
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 min-w-0">
      <button className="w-full flex items-center gap-1.5 px-2 h-6 text-left text-[11px] text-zinc-400 min-w-0" onClick={() => c.result && setOpen((v) => !v)}>
        {c.status === 'running' ? <Loader2 size={12} className="animate-spin shrink-0" /> : c.status === 'ok' ? <Check size={12} className="text-emerald-400 shrink-0" /> : <X size={12} className="text-rose-400 shrink-0" />}
        <Ico size={12} className="shrink-0" />
        <span className="font-mono truncate min-w-0 flex-1">{c.name}{toolTarget(c.input) ? ` · ${toolTarget(c.input)}` : ''}</span>
        {c.result && (open ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />)}
      </button>
      {open && c.result && <pre className="px-2 pb-1.5 max-h-32 overflow-auto text-[10px] text-zinc-400 font-mono whitespace-pre-wrap break-all">{c.result}</pre>}
    </div>
  );
};

// Ajan çalışırken durum şeridi: adım, çalışan araç, geçen süre, durdur; onay beklerken uyarır
const AgentStatus: React.FC<{ msg?: ChatMsg; startedAt: number; onStop: () => void }> = ({ msg, startedAt, onStop }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
  const running = msg?.tools?.find((c) => c.status === 'running');
  const waiting = !!msg?.approvals?.some((a) => !a.decided);
  return (
    <div className="mx-3 mb-1 flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 h-8 text-[11.5px] text-violet-100 shrink-0 animate-fade-in" role="status">
      <span className={`w-2 h-2 rounded-full shrink-0 ${waiting ? 'bg-amber-400' : 'bg-violet-400 animate-pulse'}`} />
      <span className="font-medium shrink-0">{waiting ? t('aiAgentWaitingApproval') : t('aiAgentWorking')}</span>
      <span className="text-violet-300/80 shrink-0">· {t('aiAgentStepN').replace('{n}', String(msg?.tools?.length ?? 0))}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-violet-200/70">{running ? `${running.name}${toolTarget(running.input) ? ' · ' + toolTarget(running.input) : ''}` : ''}</span>
      <span className="font-mono text-[10.5px] text-violet-300/80 shrink-0">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
      <button type="button" onClick={onStop} title={t('aiStop')} aria-label={t('aiStop')} className="w-6 h-6 rounded-md bg-rose-600/80 hover:bg-rose-500 text-white flex items-center justify-center shrink-0"><Square size={10} /></button>
    </div>
  );
};

// Ajan yanıtının altında özet: değişen dosyalar (tıklayınca editörde açılır), çalıştırılan komut sayısı ve son komutun (derleme/test) sonucu
const FILE_TOOLS = new Set(['write_file', 'replace_in_file']);
const AgentSummary: React.FC<{ tools: ToolCard[]; rootPath?: string | null; onOpenFile?: (p: string) => void }> = ({ tools, rootPath, onOpenFile }) => {
  const files = [...new Set(tools.filter((c) => FILE_TOOLS.has(c.name) && c.status === 'ok' && typeof c.input.path === 'string').map((c) => String(c.input.path).replace(/^\.[\\/]/, '')))];
  const cmds = tools.filter((c) => c.name === 'run_command');
  const last = cmds[cmds.length - 1];
  if (!files.length && !cmds.length) return null;
  const sep = rootPath?.includes('\\') ? '\\' : '/';
  const abs = (rel: string) => (rootPath ? `${rootPath.replace(/[\\/]+$/, '')}${sep}${rel.replace(/^[\\/]+/, '').split(/[\\/]/).join(sep)}` : rel);
  return (
    <div className="mt-2 rounded-lg border border-violet-500/25 bg-violet-500/5 p-2 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
        {files.length > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-1.5 h-4 text-violet-200"><FileCode size={10} />{t('aiAgentChangedFiles').replace('{n}', String(files.length))}</span>}
        {cmds.length > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/50 px-1.5 h-4 text-zinc-300"><TermIcon size={10} />{cmds.length}</span>}
        {last && last.status !== 'running' && (
          <span className={`inline-flex items-center gap-1 rounded-full px-1.5 h-4 min-w-0 max-w-full ${last.status === 'ok' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
            {last.status === 'ok' ? <Check size={10} /> : <X size={10} />}<span className="truncate font-mono">{toolTarget(last.input)}</span>
          </span>
        )}
      </div>
      {files.map((f) => (
        <button key={f} type="button" disabled={!onOpenFile} onClick={() => onOpenFile?.(abs(f))} title={`${t('aiAgentOpenFile')}: ${f}`} className="w-full flex items-center gap-1.5 rounded px-1.5 h-6 text-left text-[11px] font-mono text-zinc-300 hover:bg-white/5 hover:text-zinc-50 disabled:hover:bg-transparent transition-colors">
          <FileCode size={11} className="shrink-0 text-violet-300" /><span className="truncate">{f}</span>
        </button>
      ))}
    </div>
  );
};

// Ajan görev şablonları: derle / test / denetim / gözden geçir (etiket + ayrıntılı istem, arayüz dilinde)
const TASKS = [
  ['aiTaskBuild', 'aiTaskBuildP', Hammer],
  ['aiTaskTest', 'aiTaskTestP', FlaskConical],
  ['aiTaskCheck', 'aiTaskCheckP', ScanSearch],
  ['aiTaskReview', 'aiTaskReviewP', ClipboardCheck]
] as const;

// ---------- Ana bileşen ----------
export const AIAssistant: React.FC<AIAssistantProps> = ({ activeFile, hasWorkspace, rootPath, onOpenFile, onOpenSettings }) => {
  const { values, set: setSetting } = useSettings();
  const api = window.electronAPI?.ai;
  const llmApi = window.electronAPI?.llm;
  // Sağlayıcı yalnız Ollama (yerel): anahtar yok, kod ve sohbet cihazdan çıkmaz. Diğer sağlayıcı kodu motorda duruyor ama arayüzden seçilemez.
  const provider = 'ollama' as AiProvider;

  const [ollama, setOllama] = useState<{ running: boolean; models: string[] } | null>(null);
  const [ollamaTick, setOllamaTick] = useState(0);
  const [llm, setLlm] = useState<LlmModelInfo[]>([]);
  const [progress, setProgress] = useState<Record<string, LlmProgress>>({});

  // Sohbet (ask) ve Ajan (agent) modlarının sohbetleri ayrıdır: her sohbet tek bir moda aittir, liste moda göre süzülür.
  // Klasör açık değilse ajan modu kapalıdır: açılışta da Sohbet ile başlanır
  const defMode: 'ask' | 'agent' = values.aiDefaultMode === 'agent' && hasWorkspace ? 'agent' : 'ask';
  const [sessions, setSessions] = useState<AiSession[]>(() => {
    const loaded = loadSessions();
    return loaded.some((s) => s.mode === defMode) ? loaded : [newSession(defMode), ...loaded];
  });
  const [activeId, setActiveId] = useState<string>(() => [...sessions].filter((s) => s.mode === defMode).sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? sessions[0]?.id);
  const session = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const mode = session?.mode ?? 'ask';
  const isAgent = mode === 'agent';
  // Listede yalnız bu modun DOLU sohbetleri görünür; hiçbir şey yazılmamış sohbet listeye ve hafızaya girmez
  const modeSessions = useMemo(() => sessions.filter((s) => s.mode === mode && s.messages.length > 0), [sessions, mode]);
  const modeCount = (m: 'ask' | 'agent') => sessions.filter((s) => s.mode === m && s.messages.length > 0).length;

  // Tek model: Ollama'daki qwen2.5-coder:7b (model/sunucu seçimi yok). Moda özel ayarlar: düşünme seviyesi, yanıt uzunluğu, bağlam, yönerge.
  const builtinId = DEFAULT_MODEL.builtin;
  const model = DEFAULT_MODEL.ollama;
  const modelLabel = provider === 'builtin' ? llm.find((m) => m.id === builtinId)?.label ?? builtinId : model;
  const thinkingRaw = String(isAgent ? values.aiAgentThinking : values.aiAskThinking);
  const thinkingLevel: ThinkingLevel = (['fast', 'balanced', 'deep'] as const).find((x) => x === thinkingRaw) ?? 'balanced';
  const maxTokensNow = Number(isAgent ? values.aiAgentMaxTokens : values.aiMaxTokens) || (isAgent ? 8192 : 4096);
  const autonomyRaw = String(values.aiAgentAutonomy);
  const autonomy: Autonomy = (['ask', 'edits', 'auto'] as const).find((x) => x === autonomyRaw) ?? 'ask';
  const maxStepsNow = Math.min(40, Math.max(6, Number(values.aiAgentMaxSteps) || 20));
  const [runStart, setRunStart] = useState(0);
  const [renameId, setRenameId] = useState<string | null>(null);
  const fileHintRef = useRef<string | undefined>(undefined);
  fileHintRef.current = activeFile?.name;
  const [input, setInput] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [busy, setBusy] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const [custom, setCustom] = useState<{ name: string; template: string }[]>([]);
  const runRef = useRef<{ runId: string; sessionId: string; msgId: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Kalıcılık (yalnız bu cihaz; boş sohbetler yazılmaz)
  // Yanıt akarken her parçada tüm sohbetleri yazmak arayüzü kasıyordu: 600 ms gecikmeli yaz, kapanırken/yok olurken boşalt
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSessions(sessions), 600);
    return () => clearTimeout(saveTimer.current);
  }, [sessions]);
  useEffect(() => {
    const flush = () => saveSessions(sessionsRef.current);
    window.addEventListener('beforeunload', flush);
    return () => { window.removeEventListener('beforeunload', flush); flush(); };
  }, []);

  // En alta in düğmesi: kullanıcı yukarı kaydırdıysa görünür
  const [atBottom, setAtBottom] = useState(true);
  const [delArm, setDelArm] = useState(false); // başlıktaki çöp kutusu: ilk tık uyarır, ikinci tık siler

  // Başka sohbete geçilince, içine hiçbir şey yazılmamış eski sohbet bellekten de silinir
  useEffect(() => {
    setSessions((all) => {
      const keep = all.filter((s) => s.messages.length > 0 || s.id === activeId);
      return keep.length === all.length ? all : keep;
    });
  }, [activeId]);

  // Kullanıcı en alttaysa yeni çıktıyı izle; yukarı kaydırdıysa yerinde bırak
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAtBottom((was) => (was === stick.current ? was : stick.current));
  };
  const toBottom = () => {
    const el = scrollRef.current;
    if (el) { el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); stick.current = true; setAtBottom(true); }
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [session?.messages]);

  // Giriş kutusu: içeriğe göre büyür (en çok ~8 satır), sonra kayar
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 168)}px`;
  }, [input]);

  // API anahtarı var mı (yerleşik ve Ollama anahtarsız)
  useEffect(() => {
    let alive = true;
    if (provider === 'ollama' || provider === 'builtin') { setHasKey(true); return; }
    void window.electronAPI?.secrets.get(provider === 'anthropic' ? 'aiKey_anthropic' : 'aiKey_openai').then((r) => {
      if (alive) setHasKey('value' in r && !!r.value);
    });
    return () => { alive = false; };
  }, [provider, busy]);

  // Yerleşik model durumu + indirme ilerlemesi
  const refreshLlm = useCallback(() => { void llmApi?.status().then((s) => setLlm(s.models)).catch(() => undefined); }, [llmApi]);
  useEffect(() => {
    if (!llmApi) return;
    refreshLlm();
    return llmApi.onProgress((p) => {
      setProgress((prev) => ({ ...prev, [p.id]: p }));
      if (p.done || p.error) refreshLlm();
    });
  }, [llmApi, refreshLlm]);

  // Ollama: çalışıyor mu, hangi modeller yüklü
  useEffect(() => {
    if (provider !== 'ollama' || !api) { setOllama(null); return; }
    let alive = true;
    void api.ollamaModels().then((r) => { if (alive) setOllama(r); }).catch(() => { if (alive) setOllama({ running: false, models: [] }); });
    return () => { alive = false; };
  }, [api, provider, ollamaTick]);

  useEffect(() => { void api?.commands().then(setCustom).catch(() => setCustom([])); }, [api, hasWorkspace]);

  const patchMsg = useCallback((sessionId: string, msgId: string, fn: (m: ChatMsg) => ChatMsg) => {
    setSessions((all) => all.map((s) => (s.id !== sessionId ? s : { ...s, updatedAt: Date.now(), messages: s.messages.map((m) => (m.id === msgId ? fn(m) : m)) })));
  }, []);

  // Ana süreçten gelen akış olayları
  useEffect(() => {
    if (!api) return;
    return api.onEvent((ev: AiEvent) => {
      const run = runRef.current;
      if (!run || ev.runId !== run.runId) return;
      const { sessionId, msgId } = run;
      if (ev.type === 'text') patchMsg(sessionId, msgId, (m) => ({ ...m, text: m.text + ev.text }));
      else if (ev.type === 'tool') patchMsg(sessionId, msgId, (m) => ({ ...m, tools: [...(m.tools ?? []), { id: ev.id, name: ev.name, input: ev.input, status: 'running' }] }));
      else if (ev.type === 'tool_result') patchMsg(sessionId, msgId, (m) => ({ ...m, tools: (m.tools ?? []).map((c) => (c.id === ev.id ? { ...c, status: ev.ok ? 'ok' : 'error', result: ev.text } : c)) }));
      else if (ev.type === 'approval') patchMsg(sessionId, msgId, (m) => ({ ...m, approvals: [...(m.approvals ?? []), { id: ev.id, tool: ev.tool, summary: ev.summary, preview: ev.preview }] }));
      else if (ev.type === 'error') {
        const code = ev.error.startsWith('auth') ? 'aiErrAuth' : ev.error.startsWith('rate') ? 'aiErrRate' : ev.error.includes('model-yok') ? 'aiErrNoModel' : ev.error.includes('agent-stuck') ? 'aiErrStuck' : 'aiErrGeneric';
        patchMsg(sessionId, msgId, (m) => ({ ...m, streaming: false, error: code === 'aiErrGeneric' ? `${t('aiErrGeneric')} (${ev.error.slice(0, 160)})` : t(code) }));
        if (code === 'aiErrAuth') setHasKey(false);
        if (code === 'aiErrNoModel') refreshLlm();
        runRef.current = null;
        setBusy(false);
      } else if (ev.type === 'done') {
        patchMsg(sessionId, msgId, (m) => ({ ...m, streaming: false, usage: ev.usage && (ev.usage.in || ev.usage.out) ? ev.usage : undefined }));
        // Otomatik ad: ilk yanıttan sonra konu/dosya/dil bilgisiyle bir kez incelt (kullanıcı adı elle verdiyse dokunma; yerelde, veri gitmez)
        setSessions((all) => all.map((s) => {
          if (s.id !== sessionId) return s;
          let next = s;
          if (!s.titleLocked && (s.autoLevel ?? 0) < 2) next = { ...next, title: refineTitle(s, fileHintRef.current) || s.title, autoLevel: 2 };
          // Kategori ilk iletiden "genel" çıktıysa, yanıtın içeriğiyle yeniden dene (elle seçilmediyse)
          if (!s.categoryLocked && (!s.category || s.category === 'general')) {
            const u = s.messages.find((m) => m.role === 'user')?.text ?? '';
            const b = s.messages.find((m) => m.role === 'assistant' && m.text)?.text ?? '';
            next = { ...next, category: smartCategory(`${u}\n${b.slice(0, 600)}`) };
          }
          return next;
        }));
        runRef.current = null;
        setBusy(false);
      }
    });
  }, [api, patchMsg, refreshLlm]);

  const dictation = useDictation({
    // Dil arayüz dilidir (kısa konuşmalarda otomatik algılama şaşabildiği için sabit); model ve adres sabit, ayar yok
    lang: getUiLang(),
    onText: (text) => setInput((v) => (v ? v + ' ' : '') + text),
    onError: (code) => {
      setSessions((all) => all.map((s) => (s.id !== session.id ? s : { ...s, messages: [...s.messages, { id: uid(), role: 'assistant', text: '', error: code === 'mic' ? t('aiMicDenied') : code === 'no-whisper' ? t('aiVoiceNeedsKey') : t('aiErrGeneric') }] })));
    }
  });

  // Mod değiştirme = o modun son sohbetine geçmek (yoksa yeni açılır). Boş sohbetteyken yeni liste kurulmaz, sohbet o moda çevrilir.
  const drafts = useRef<{ ask: string; agent: string }>({ ask: '', agent: '' });
  const switchMode = (m: 'ask' | 'agent') => {
    if (m === mode || busy || !session) return;
    drafts.current[mode] = input;
    setImages([]);
    setRenameId(null);
    if (!session.messages.length) {
      setSessions((all) => all.map((s) => (s.id === session.id ? { ...s, mode: m } : s)));
    } else {
      const last = sessions.filter((s) => s.mode === m).sort((a, b) => b.updatedAt - a.updatedAt)[0];
      if (last) setActiveId(last.id);
      else { const s = newSession(m); setSessions((all) => [s, ...all]); setActiveId(s.id); }
    }
    setInput(drafts.current[m]);
  };

  // Klasör kapandıysa (veya hiç açılmadıysa) ajan sohbetindeyken Sohbet'e dön; ajan sohbetleri silinmez
  useEffect(() => {
    if (!hasWorkspace && mode === 'agent' && !busy) switchMode('ask');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWorkspace, mode, busy]);

  const startNew = () => {
    // Etkin sohbet zaten boşsa yenisini açma: boş sohbet birikmez
    if (!session.messages.length) { setInput(''); setImages([]); taRef.current?.focus(); return; }
    const s = newSession(mode);
    setSessions((all) => [s, ...all]);
    setActiveId(s.id);
    setInput('');
    setImages([]);
  };

  const deleteById = (id: string) => {
    if (runRef.current?.sessionId === id) return; // yanıtı akan sohbet silinmez
    const m = sessions.find((s) => s.id === id)?.mode ?? mode;
    const rest = sessions.filter((s) => s.id !== id);
    const sameMode = rest.filter((s) => s.mode === m).sort((a, b) => b.updatedAt - a.updatedAt);
    if (!sameMode.length) { const s = newSession(m); setSessions([s, ...rest]); if (id === session.id) setActiveId(s.id); return; }
    setSessions(rest);
    if (id === session.id) setActiveId(sameMode[0].id);
  };
  const deleteSession = () => { if (!busy) deleteById(session.id); };

  // Ad: boş bırakılırsa otomatik adlandırma geri döner; dolu ise kilitlenir (otomatik ad bir daha dokunmaz)
  const renameSession = (id: string, title: string) => {
    setRenameId(null);
    setSessions((all) => all.map((s) => {
      if (s.id !== id) return s;
      if (title && title === s.title) return s; // ada dokunulmadıysa otomatik adlandırma kilitlenmez
      if (title) return { ...s, title, titleLocked: true };
      const first = s.messages.find((m) => m.role === 'user')?.text ?? '';
      return { ...s, title: first ? smartTitle(first, fileHintRef.current) || titleFrom(first) : '', titleLocked: false, autoLevel: first ? 1 : 0 };
    }));
  };
  // Kategori: elle seçilince kilitlenir; null = otomatik (konudan yeniden hesaplanır)
  const setCategory = (id: string, cat: CategoryId | null) => {
    setSessions((all) => all.map((s) => {
      if (s.id !== id) return s;
      if (cat) return { ...s, category: cat, categoryLocked: true };
      const u = s.messages.find((m) => m.role === 'user')?.text ?? '';
      const b = s.messages.find((m) => m.role === 'assistant' && m.text)?.text ?? '';
      return { ...s, categoryLocked: false, category: smartCategory(`${u}\n${b.slice(0, 600)}`) };
    }));
  };
  const pinSession = (id: string) => setSessions((all) => all.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
  const clearUnpinned = () => {
    if (busy) return;
    setSessions((all) => all.filter((s) => s.mode !== mode || s.pinned || s.id === session.id)); // yalnız bu modun sohbetleri
  };
  const exportSession = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    const md = sessionToMarkdown(s, t('aiYou'), 'Nova');
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a');
    const slug = (s.title || 'chat').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'chat';
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const buildContext = (): string => {
    if (!(isAgent ? values.aiAgentIncludeContext : values.aiIncludeContext) || !activeFile) return '';
    const sel = getSelectedText();
    const body = sel || (activeFile.content ?? '').slice(0, provider === 'builtin' ? 6000 : 20000);
    if (!body) return '';
    return `<context file="${activeFile.name}" language="${activeFile.language ?? ''}"${sel ? ' selection="true"' : ''}>\n${body}\n</context>\n\n`;
  };

  const builtinReady = provider !== 'builtin' || llm.find((m) => m.id === builtinId)?.installed === true;

  const send = async (raw: string) => {
    let text = raw.trim();
    if ((!text && !images.length) || busy || !api) return;

    const slash = /^\/([\w-]+)\s*(.*)$/s.exec(text);
    if (slash) {
      const [, name, rest] = slash;
      if (name === 'new') { startNew(); return; }
      if (name === 'agent' && !hasWorkspace) return; // ajan klasör açılmadan etkinleşmez
      if (name === 'ask' || name === 'agent') { switchMode(name); setInput(rest); return; }
      const c = custom.find((x) => x.name === name);
      if (c) text = c.template.includes('{{args}}') ? c.template.replace('{{args}}', rest) : `${c.template}\n\n${rest}`;
    }
    const fail = (msg: string) => setSessions((all) => all.map((s) => (s.id !== session.id ? s : { ...s, messages: [...s.messages, { id: uid(), role: 'assistant', text: '', error: msg }] })));
    if (mode === 'agent' && !hasWorkspace) return fail(t('aiAgentNeedsFolder'));
    if (!builtinReady) return fail(t('aiErrNoModel'));

    const userMsg: ChatMsg = { id: uid(), role: 'user', text: raw.trim() || '🖼', imageCount: images.length || undefined };
    const botMsg: ChatMsg = { id: uid(), role: 'assistant', text: '', streaming: true };
    const history = [...session.messages, userMsg];
    const runId = uid();
    runRef.current = { runId, sessionId: session.id, msgId: botMsg.id };
    stick.current = true;
    setSessions((all) => all.map((s) => (s.id !== session.id ? s : { ...s, ...(s.title || s.titleLocked ? {} : { title: smartTitle(userMsg.text, fileHintRef.current) || titleFrom(userMsg.text), autoLevel: 1 as const }), ...(!s.categoryLocked && !s.category ? { category: smartCategory(userMsg.text) } : {}), updatedAt: Date.now(), messages: [...history, botMsg] })));
    const sent = provider === 'builtin' ? [] : images; // yerleşik model görsel okuyamaz
    setInput('');
    setImages([]);
    setBusy(true);
    setRunStart(Date.now());

    const messages = history.filter((m) => m.text).map((m, i, arr) => {
      const last = i === arr.length - 1;
      return {
        role: m.role,
        text: last ? buildContext() + text : m.text,
        ...(last && sent.length ? { images: sent.map(({ mediaType, data }) => ({ mediaType, data })) } : {})
      };
    });

    const res = await api.run({
      runId, provider, model,
      thinking: thinkingLevel,
      maxTokens: maxTokensNow,
      instructions: String((isAgent ? values.aiAgentInstructions : values.aiAskInstructions) || '').slice(0, 600) || undefined,
      mode, lang: getUiLang(),
      autoApproveEdits: isAgent && autonomy !== 'ask',
      autoSafeCommands: isAgent && autonomy === 'auto',
      autonomy: isAgent ? autonomy : undefined,
      maxSteps: isAgent ? maxStepsNow : undefined,
      allowCommands: values.aiAllowCommands !== false,
      useProject: true,
      messages
    }).catch(() => ({ success: false }));
    if (!res.success && runRef.current?.runId === runId) {
      window.setTimeout(() => { if (runRef.current?.runId === runId) { runRef.current = null; setBusy(false); patchMsg(session.id, botMsg.id, (m) => ({ ...m, streaming: false })); } }, 300);
    }
  };

  const stop = () => { if (runRef.current) void api?.cancel(runRef.current.runId); };

  const decide = (msgId: string, approvalId: string, allow: boolean) => {
    if (!runRef.current) return;
    void api?.approve(runRef.current.runId, approvalId, allow);
    patchMsg(session.id, msgId, (m) => ({ ...m, approvals: (m.approvals ?? []).map((a) => (a.id === approvalId ? { ...a, decided: allow ? 'allow' : 'deny' } : a)) }));
  };

  const addFiles = async (files: FileList | File[]) => {
    const out: Image[] = [];
    for (const f of Array.from(files).slice(0, 4 - images.length)) {
      const img = await fileToImage(f);
      if (img) out.push({ ...img, url: `data:${img.mediaType};base64,${img.data}` });
    }
    if (out.length) setImages((prev) => [...prev, ...out].slice(0, 4));
  };

  const quick = (prompt: string) => void send(prompt);
  const slashList = useMemo(() => {
    if (!input.startsWith('/') || input.includes(' ')) return [];
    const q = input.slice(1).toLowerCase();
    return [
      ...SLASH_BUILTIN.map((n) => ({ name: n as string, hint: t(n === 'new' ? 'aiSlashNew' : n === 'ask' ? 'aiSlashAsk' : 'aiSlashAgent') })),
      ...custom.map((c) => ({ name: c.name, hint: '.nova/commands' }))
    ].filter((c) => c.name.startsWith(q));
  }, [input, custom]);

  const startDownload = (id: string) => {
    setSetting('aiBuiltinModel', id);
    setProgress((p) => ({ ...p, [id]: { id, received: 0, total: llm.find((m) => m.id === id)?.size ?? 1 } }));
    void llmApi?.download(id);
  };

  if (!api) {
    return (
      <div className="flex flex-col h-full bg-nv-side border-l border-nv-border p-4 text-[12px] text-zinc-400">
        <div className="flex items-center gap-2 mb-2 text-zinc-200"><Sparkles size={15} className="text-purple-400" />{t('aiTitle')}</div>
        {t('aiDesktopOnly')}
      </div>
    );
  }

  const voiceOn = values.aiVoiceEnabled === true;
  const isLocal = true; // yalnız Ollama (yerel)
  const canSend = (!!input.trim() || images.length > 0) && !busy;
  const icoBtn = 'w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover transition-colors disabled:opacity-40';
  const banner = 'mx-3 mt-2 p-2.5 rounded-lg border text-[11.5px] leading-snug';

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 overflow-hidden bg-nv-side border-l border-nv-border text-zinc-300">
      {/* Başlık: sohbet seçici + eylemler */}
      <div className={`relative flex items-center gap-1 px-2 h-10 border-b shrink-0 transition-colors ${isAgent ? 'border-violet-500/30' : 'border-nv-border'}`}>
        <div className={`w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0 transition-colors ${isAgent ? 'from-violet-500 to-fuchsia-500' : 'from-indigo-500 to-purple-500'}`}>{isAgent ? <Zap size={13} className="text-white" /> : <Sparkles size={13} className="text-white" />}</div>
        <ChatSessions
          sessions={modeSessions}
          current={session}
          activeId={session?.id}
          busy={busy}
          busyId={busy ? runRef.current?.sessionId : null}
          renameId={renameId}
          setRenameId={setRenameId}
          onSelect={(id) => !busy && setActiveId(id)}
          onRename={renameSession}
          onPin={pinSession}
          onDelete={deleteById}
          onExport={exportSession}
          onSetCategory={setCategory}
          onClearUnpinned={clearUnpinned}
        />
        <button className={icoBtn} onClick={startNew} title={t('aiNewSession')} aria-label={t('aiNewSession')}><Plus size={15} /></button>
        <button className={icoBtn} onClick={() => setRenameId(session.id)} title={t('aiRename')} aria-label={t('aiRename')}><Pencil size={14} /></button>
        <button
          className={`${icoBtn} ${delArm ? '!text-rose-300 !bg-rose-500/15' : ''}`}
          onClick={() => {
            if (!delArm) { setDelArm(true); window.setTimeout(() => setDelArm(false), 3000); return; }
            setDelArm(false);
            deleteSession();
          }}
          disabled={busy || !session?.messages.length}
          title={delArm ? t('aiClickAgainDelete') : t('aiDeleteSession')}
          aria-label={t('aiDeleteSession')}
        >{delArm ? <Check size={14} /> : <Trash2 size={14} />}</button>
        <button className={icoBtn} onClick={onOpenSettings} title={t('aiOpenSettings')} aria-label={t('aiOpenSettings')}><Cog size={15} /></button>
      </div>

      {/* Mod seçici */}
      <div className="px-3 py-2 shrink-0">
        <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg bg-nv-input/60" role="tablist">
          {(['ask', 'agent'] as const).map((m) => (
            <button
              key={m} role="tab" aria-selected={mode === m} aria-disabled={m === 'agent' && !hasWorkspace} onClick={() => switchMode(m)}
              disabled={(busy && mode !== m) || (m === 'agent' && !hasWorkspace)}
              title={m === 'agent' && !hasWorkspace ? t('aiAgentNeedsFolder') : undefined}
              className={`h-6 rounded-md text-[12px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mode === m ? (m === 'agent' ? 'bg-violet-500/25 text-violet-50 shadow-sm' : 'bg-nv-active text-zinc-50 shadow-sm') : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {m === 'ask' ? <MessageSquare size={12} /> : m === 'agent' && !hasWorkspace ? <Lock size={11} /> : <Zap size={12} />}{m === 'ask' ? t('aiModeAsk') : t('aiModeAgent')}
              {modeCount(m) > 0 && <span className="text-[10px] px-1 rounded-full bg-white/10 text-zinc-400">{modeCount(m)}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Uyarılar */}
      {provider === 'ollama' && ollama && (!ollama.running || ollama.models.length === 0) && (
        <div className={`${banner} border-amber-500/40 bg-amber-500/10 text-amber-100 flex items-center justify-between gap-2 shrink-0`}>
          <span className="min-w-0">{!ollama.running ? t('aiOllamaDown') : t('aiOllamaNoModels')}</span>
          <button className="h-6 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 shrink-0" onClick={() => setOllamaTick((n) => n + 1)}>{t('aiRecheck')}</button>
        </div>
      )}
      {provider === 'ollama' && ollama?.running && ollama.models.length > 0 && !ollama.models.some((m) => m === model || (!model.includes(':') && m.split(':')[0] === model)) && (
        <div className={`${banner} border-amber-500/40 bg-amber-500/10 text-amber-100 shrink-0`}>{t('aiOllamaModelMissing').split('{m}').join(model)}</div>
      )}
      {!hasKey && (
        <div className={`${banner} border-amber-500/40 bg-amber-500/10 text-amber-100 flex items-center justify-between gap-2 shrink-0`}>
          <span className="min-w-0">{t('aiNoKey')}</span>
          <button className="h-6 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 shrink-0" onClick={onOpenSettings}>{t('aiOpenSettings')}</button>
        </div>
      )}
      {isAgent && !hasWorkspace && (
        <p className="mx-3 mt-2 text-[11px] text-amber-300/90 leading-snug shrink-0">{t('aiAgentNeedsFolder')}</p>
      )}
      {provider === 'builtin' && mode === 'agent' && builtinId === 'qwen2.5-coder-1.5b' && builtinReady && (
        <p className="mx-3 mt-2 text-[10.5px] text-amber-300/90 leading-snug shrink-0">{t('aiBuiltinAgentWarn')}</p>
      )}

      {/* İletiler */}
      <div className="relative flex-1 min-h-0">
      <div ref={scrollRef} onScroll={onScroll} className="absolute inset-0 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-4 text-[12.5px]">
        {provider === 'builtin' && !builtinReady && (
          <div className={`${banner} !mx-0 !mt-0 border-indigo-500/40 bg-indigo-500/10 text-indigo-100`}>
            <div className="font-semibold text-[12px] mb-1">{t('aiBuiltinTitle')}</div>
            <p className="text-indigo-200/90">{t('aiBuiltinDesc')}</p>
            <div className="mt-2 space-y-1.5">
              {llm.map((m) => {
                const p = progress[m.id];
                const active = m.downloading || (!!p && !p.done && !p.error && p.received > 0);
                const pct = p ? Math.min(100, Math.round((p.received / Math.max(1, p.total)) * 100)) : 0;
                return (
                  <div key={m.id} className="rounded-md bg-black/20 p-2">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <div className="text-zinc-100 truncate">{m.tier === 'fast' ? t('aiTierFast') : t('aiTierStrong')} · {m.label}</div>
                        <div className="text-[10.5px] text-indigo-200/70">{gb(m.size)} GB · {t('aiRam').replace('{n}', String(m.ramGb))}</div>
                      </div>
                      {m.installed ? (
                        <span className="text-emerald-400 flex items-center gap-1 shrink-0"><Check size={12} />{t('aiReady')}</span>
                      ) : active ? (
                        <button className="h-6 px-2 rounded bg-zinc-700 hover:bg-zinc-600 shrink-0" onClick={() => void llmApi?.cancel(m.id)}>{t('aiBuiltinCancel')}</button>
                      ) : (
                        <button className="h-6 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shrink-0" onClick={() => startDownload(m.id)}><Download size={12} />{t('aiBuiltinDownload')}</button>
                      )}
                    </div>
                    {active && (
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden"><div className="h-full bg-indigo-400 transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
                        <div className="mt-0.5 text-[10.5px] text-indigo-200/80">{t('aiBuiltinProgress').replace('{p}', String(pct))}</div>
                      </div>
                    )}
                    {p?.error === 'failed' && !active && <div className="mt-1 text-[10.5px] text-rose-300">{t('aiBuiltinFailed')}</div>}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[10.5px] text-indigo-200/70">{t('aiBuiltinNote')}</p>
          </div>
        )}
        {!session?.messages.length && (
          <div className="pt-4 text-zinc-400 leading-relaxed">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center mb-3"><Bot size={20} className="text-purple-300" /></div>
            <p>{t('aiWelcome')}</p>
            <div className="grid grid-cols-2 gap-1.5 mt-4">
              {(isAgent ? (['aiQuickAgent1', 'aiQuickAgent2', 'aiQuickAgent3', 'aiQuickAgent4'] as const) : (['aiQuickExplain', 'aiQuickBugs', 'aiQuickRefactor', 'aiQuickTests'] as const)).map((k) => (
                <button key={k} className="min-h-8 px-2 py-1 rounded-lg border border-zinc-700/70 hover:bg-nv-hover text-zinc-300 text-[12px] text-left leading-snug" onClick={() => quick(t(k))}>{t(k)}</button>
              ))}
            </div>
          </div>
        )}
        {session?.messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="group/msg flex justify-end items-start gap-1 min-w-0">
              <CopyMsg text={m.text} className="mt-1" />
              <div className="max-w-[88%] rounded-2xl rounded-br-md bg-nv-active text-zinc-50 px-3 py-2 leading-relaxed min-w-0">
                {m.imageCount ? <div className="flex items-center gap-1 text-[10px] opacity-80 mb-1"><ImagePlus size={11} />×{m.imageCount}</div> : null}
                <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.text}</div>
              </div>
            </div>
          ) : (
            <div key={m.id} className="group/msg flex gap-2 min-w-0">
              <div className="w-5 h-5 mt-0.5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0"><Sparkles size={11} className="text-white" /></div>
              <div className="min-w-0 flex-1 text-zinc-200 leading-relaxed">
                {m.text ? <MessageText text={m.text} /> : m.streaming && !m.approvals?.some((a) => !a.decided) ? (
                  <span className="flex items-center gap-1.5 text-zinc-500"><Loader2 size={12} className="animate-spin" />{t('aiThinking')}</span>
                ) : null}
                {m.tools && m.tools.length > 0 && <div className="mt-2 mb-1 space-y-1">{m.tools.map((c) => <ToolRow key={c.id} c={c} />)}</div>}
                {m.tools && m.tools.length > 0 && <AgentSummary tools={m.tools} rootPath={rootPath} onOpenFile={onOpenFile} />}
                {m.approvals?.map((a) => (
                  <div key={a.id} className="my-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5">
                    <div className="flex items-center gap-1.5 text-[11.5px] text-amber-200 font-semibold min-w-0"><ShieldCheck size={13} className="shrink-0" /><span className="truncate">{t('aiApprovalTitle')}: {a.summary}</span></div>
                    <pre className="mt-1.5 max-h-32 overflow-auto rounded bg-black/25 p-1.5 text-[10.5px] text-zinc-300 font-mono whitespace-pre-wrap break-all">{a.preview}</pre>
                    {a.decided ? (
                      <div className="mt-1.5 text-[10.5px] text-zinc-400">{a.decided === 'allow' ? t('aiApproved') : t('aiDenied')}</div>
                    ) : (
                      <div className="mt-2 flex gap-1.5">
                        <button className="h-6 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => decide(m.id, a.id, true)}>{t('aiApprove')}</button>
                        <button className="h-6 px-3 rounded bg-zinc-700 hover:bg-zinc-600" onClick={() => decide(m.id, a.id, false)}>{t('aiDeny')}</button>
                      </div>
                    )}
                  </div>
                ))}
                {m.error && <div className="mt-1 text-rose-300 break-words">{m.error}</div>}
                {(m.usage || (m.text && !m.streaming)) && (
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-zinc-500">
                    {m.text && !m.streaming && <CopyMsg text={m.text} />}
                    {m.usage && <span>{t('aiUsage').replace('{in}', String(m.usage.in)).replace('{out}', String(m.usage.out))}</span>}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
      {!atBottom && (session?.messages.length ?? 0) > 0 && (
        <button
          type="button"
          onClick={toBottom}
          title={t('aiScrollDown')}
          aria-label={t('aiScrollDown')}
          className="absolute bottom-2 right-4 w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 shadow-lg flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 animate-fade-in"
        ><ArrowDown size={14} /></button>
      )}
      </div>

      {/* Ajan çalışma durumu */}
      {busy && isAgent && <AgentStatus msg={session?.messages[session.messages.length - 1]} startedAt={runStart} onStop={stop} />}

      {/* Eğik çizgi önerileri */}
      {slashList.length > 0 && (
        <div className="mx-3 mb-1 rounded-lg border border-zinc-700 bg-zinc-900 text-[11.5px] overflow-hidden shrink-0">
          {slashList.slice(0, 6).map((c) => (
            <button key={c.name} className="w-full flex justify-between gap-2 px-2.5 h-6 hover:bg-zinc-800 min-w-0" onClick={() => setInput(`/${c.name} `)}>
              <span className="text-zinc-200 shrink-0">/{c.name}</span><span className="text-zinc-500 truncate">{c.hint}</span>
            </button>
          ))}
        </div>
      )}

      {/* Giriş alanı */}
      <div
        className="px-3 pb-2 pt-1 shrink-0"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); void addFiles(e.dataTransfer.files); } }}
      >
        {isAgent && hasWorkspace && !busy && (
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1.5" aria-label={t('aiModeAgent')}>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 h-6 text-[11px] text-zinc-400" title={`${t('aiAutonomyLabel')}: ${autonomy === 'ask' ? t('optAutoAsk') : autonomy === 'edits' ? t('optAutoEdits') : t('optAutoFull')}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${autonomy === 'auto' ? 'bg-rose-400' : autonomy === 'edits' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {autonomy === 'ask' ? t('optAutoAsk') : autonomy === 'edits' ? t('optAutoEdits') : t('optAutoFull')}
            </span>
            {TASKS.map(([label, prompt, Ico]) => (
              <button key={label} type="button" onClick={() => quick(t(prompt))} title={t(prompt)} className="shrink-0 inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 h-6 text-[11px] text-violet-100 hover:bg-violet-500/20 transition-colors">
                <Ico size={11} />{t(label)}
              </button>
            ))}
          </div>
        )}
        <div className={`rounded-xl border border-zinc-700/80 bg-nv-input/50 transition-colors ${isAgent ? 'focus-within:border-violet-500' : 'focus-within:border-indigo-500'}`}>
          {images.length > 0 && (
            <div className="flex gap-1.5 px-2 pt-2 flex-wrap">
              {images.map((im, i) => (
                <div key={i} className="relative">
                  <img src={im.url} alt="" className="h-10 w-10 object-cover rounded-md border border-zinc-700" />
                  <button className="absolute -top-1 -right-1 bg-zinc-900 rounded-full" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} aria-label={t('aiRemove')}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={taRef}
            value={input}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }}
            onPaste={(e) => { const f = Array.from(e.clipboardData.files); if (f.length && provider !== 'builtin') { e.preventDefault(); void addFiles(f); } }}
            placeholder={mode === 'agent' ? t('aiPlaceholderAgent') : t('aiPlaceholderAsk')}
            className="w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-[12.5px] text-zinc-100 outline-none placeholder:text-zinc-500 min-h-[36px] max-h-[168px]"
          />
          <div className="flex items-center gap-0.5 px-1.5 pb-1.5">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ''; }} />
            <button className={icoBtn} disabled={provider === 'builtin'} onClick={() => fileRef.current?.click()} title={provider === 'builtin' ? t('aiNoImages') : t('aiAttach')} aria-label={t('aiAttach')}><ImagePlus size={15} /></button>
            <button
              className={`${icoBtn} ${dictation.state === 'recording' ? '!text-rose-400 animate-pulse' : ''}`}
              disabled={dictation.state === 'transcribing'}
              onClick={() => (dictation.state === 'recording' ? dictation.stop() : voiceOn ? void dictation.start() : setSetting('aiVoiceEnabled', true))}
              title={dictation.state === 'recording' ? t('aiMicStop') : voiceOn ? t('aiMicStart') : t('aiVoiceConsent')}
              aria-label={t('aiMicStart')}
            >
              {dictation.state === 'transcribing' ? <Loader2 size={15} className="animate-spin" /> : <Mic size={15} />}
            </button>
            <ThinkingMenu
              level={thinkingLevel}
              onLevel={(l) => setSetting(isAgent ? 'aiAgentThinking' : 'aiAskThinking', l)}
              maxTokens={maxTokensNow}
              onMaxTokens={(n) => setSetting(isAgent ? 'aiAgentMaxTokens' : 'aiMaxTokens', n)}
              agent={isAgent ? { autonomy, onAutonomy: (a) => setSetting('aiAgentAutonomy', a), maxSteps: maxStepsNow, onMaxSteps: (n) => setSetting('aiAgentMaxSteps', n) } : undefined}
              disabled={busy}
            />
            <button className="min-w-0 flex-1 text-left px-1.5 text-[10.5px] text-zinc-500 hover:text-zinc-300 truncate" onClick={onOpenSettings} title={t('aiOpenSettings')}>
              {PROVIDER_LABEL[provider]} · {modelLabel}
            </button>
            {busy ? (
              <button className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center" onClick={stop} title={t('aiStop')} aria-label={t('aiStop')}><Square size={12} /></button>
            ) : (
              <button className={`w-7 h-7 rounded-lg text-white flex items-center justify-center disabled:opacity-40 transition-colors ${isAgent ? 'bg-violet-600 hover:bg-violet-500 disabled:hover:bg-violet-600' : 'bg-indigo-600 hover:bg-indigo-500 disabled:hover:bg-indigo-600'}`} disabled={!canSend} onClick={() => void send(input)} title={t('aiSend')} aria-label={t('aiSend')}><ArrowUp size={15} /></button>
            )}
          </div>
        </div>
        {!voiceOn && provider !== 'builtin' && <p className="mt-1 text-[10px] leading-snug text-zinc-500">{t('aiVoiceConsent')}</p>}
        <p className="mt-1 text-[10px] leading-snug text-zinc-600">
          {isLocal ? t('aiPrivacyLocal') : t('aiPrivacy').replace('{provider}', PROVIDER_LABEL[provider])}
        </p>
      </div>
    </div>
  );
};
