import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot, Check, ChevronDown, ChevronRight, Copy, CornerDownLeft, Download, FileCode, ImagePlus, Loader2, MessageSquare, Mic, Plus,
  Settings as Cog, ShieldCheck, Sparkles, Square, Terminal as TermIcon, Trash2, Wrench, X, ArrowUp, Zap
} from 'lucide-react';
import { t, getUiLang } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { getSelectedText, replaceSelection } from '../services/editorBridge';
import { useDictation } from '../services/useDictation';
import {
  DEFAULT_MODEL, PROVIDER_LABEL, fileToImage, loadSessions, newSession, saveSessions, splitParts, titleFrom, uid,
  type AiSession, type ChatMsg, type ToolCard
} from '../services/aiClient';
import type { AiEvent, AiProvider, LlmModelInfo, LlmProgress } from '../types';

interface AIAssistantProps {
  activeFile?: { name: string; path?: string; language?: string; content?: string } | null;
  hasWorkspace: boolean;
  onOpenSettings: () => void;
}

type Image = { mediaType: string; data: string; url: string };
const SLASH_BUILTIN = ['new', 'ask', 'agent'] as const;
const gb = (n: number) => (n / 1024 ** 3).toFixed(1);
// Yüklü modeller arasında kod odaklı olanı tercih et; yoksa ilkini al.
const pickOllamaModel = (models: string[]): string => models.find((m) => /coder|code/i.test(m)) ?? models[0] ?? '';

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

// ---------- Ana bileşen ----------
export const AIAssistant: React.FC<AIAssistantProps> = ({ activeFile, hasWorkspace, onOpenSettings }) => {
  const { values, set: setSetting } = useSettings();
  const api = window.electronAPI?.ai;
  const llmApi = window.electronAPI?.llm;
  const provider = (['builtin', 'anthropic', 'openai', 'ollama'].includes(String(values.aiProvider)) ? values.aiProvider : 'builtin') as AiProvider;

  const [ollama, setOllama] = useState<{ running: boolean; models: string[] } | null>(null);
  const [ollamaTick, setOllamaTick] = useState(0);
  const [llm, setLlm] = useState<LlmModelInfo[]>([]);
  const [progress, setProgress] = useState<Record<string, LlmProgress>>({});
  const ollamaBase = provider === 'ollama' ? String(values.aiBaseUrl || '').trim() || undefined : undefined;
  const builtinId = String(values.aiBuiltinModel || DEFAULT_MODEL.builtin);
  const model = provider === 'builtin'
    ? builtinId
    : String(values.aiModel || '').trim() || (provider === 'ollama' ? pickOllamaModel(ollama?.models ?? []) : '') || DEFAULT_MODEL[provider];
  const modelLabel = provider === 'builtin' ? llm.find((m) => m.id === builtinId)?.label ?? builtinId : model;

  const [sessions, setSessions] = useState<AiSession[]>(() => {
    const loaded = loadSessions();
    return loaded.length ? loaded : [newSession(values.aiDefaultMode === 'agent' ? 'agent' : 'ask')];
  });
  const [activeId, setActiveId] = useState<string>(() => sessions[0]?.id);
  const session = sessions.find((s) => s.id === activeId) ?? sessions[0];
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

  // Kalıcılık (yalnız bu cihaz)
  useEffect(() => { saveSessions(sessions); }, [sessions]);

  // Kullanıcı en alttaysa yeni çıktıyı izle; yukarı kaydırdıysa yerinde bırak
  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
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
    void api.ollamaModels(ollamaBase).then((r) => { if (alive) setOllama(r); }).catch(() => { if (alive) setOllama({ running: false, models: [] }); });
    return () => { alive = false; };
  }, [api, provider, ollamaBase, ollamaTick]);

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
        runRef.current = null;
        setBusy(false);
      }
    });
  }, [api, patchMsg, refreshLlm]);

  const dictation = useDictation({
    lang: String(values.aiVoiceLang || 'auto'),
    model: String(values.aiTranscribeModel || 'whisper-1'),
    baseUrl: String(values.aiTranscribeUrl || '').trim() || (provider === 'openai' ? String(values.aiBaseUrl || '') : ''),
    onText: (text) => setInput((v) => (v ? v + ' ' : '') + text),
    onError: (code) => {
      setSessions((all) => all.map((s) => (s.id !== session.id ? s : { ...s, messages: [...s.messages, { id: uid(), role: 'assistant', text: '', error: code === 'mic' ? t('aiMicDenied') : code === 'nokey' ? t('aiVoiceNeedsKey') : t('aiErrGeneric') }] })));
    }
  });

  const mode = session?.mode ?? 'ask';
  const setMode = (m: 'ask' | 'agent') => setSessions((all) => all.map((s) => (s.id === session.id ? { ...s, mode: m } : s)));

  const startNew = () => {
    const s = newSession(values.aiDefaultMode === 'agent' ? 'agent' : 'ask');
    setSessions((all) => [s, ...all]);
    setActiveId(s.id);
    setInput('');
    setImages([]);
  };

  const deleteSession = () => {
    if (busy) return;
    const rest = sessions.filter((s) => s.id !== session.id);
    if (!rest.length) { const s = newSession('ask'); setSessions([s]); setActiveId(s.id); return; }
    setSessions(rest);
    setActiveId(rest[0].id);
  };

  const buildContext = (): string => {
    if (!values.aiIncludeContext || !activeFile) return '';
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
      if (name === 'ask' || name === 'agent') { setMode(name); setInput(rest); return; }
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
    setSessions((all) => all.map((s) => (s.id !== session.id ? s : { ...s, title: s.title || titleFrom(userMsg.text), updatedAt: Date.now(), messages: [...history, botMsg] })));
    const sent = provider === 'builtin' ? [] : images; // yerleşik model görsel okuyamaz
    setInput('');
    setImages([]);
    setBusy(true);

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
      baseUrl: String(values.aiBaseUrl || '').trim() || undefined,
      maxTokens: Number(values.aiMaxTokens) || 4096,
      mode, lang: getUiLang(),
      autoApproveEdits: !!values.aiAutoApproveEdits,
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
  const isLocal = provider === 'builtin' || (provider === 'ollama' && (!ollamaBase || /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(ollamaBase)));
  const canSend = (!!input.trim() || images.length > 0) && !busy;
  const icoBtn = 'w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover transition-colors disabled:opacity-40';
  const banner = 'mx-3 mt-2 p-2.5 rounded-lg border text-[11.5px] leading-snug';

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 overflow-hidden bg-nv-side border-l border-nv-border text-zinc-300">
      {/* Başlık: oturum + eylemler */}
      <div className="flex items-center gap-1 px-2 h-10 border-b border-nv-border shrink-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0"><Sparkles size={13} className="text-white" /></div>
        <div className="relative min-w-0 flex-1">
          <select
            value={session?.id}
            onChange={(e) => !busy && setActiveId(e.target.value)}
            aria-label={t('aiSessions')}
            className="w-full appearance-none bg-transparent text-[12.5px] font-medium text-zinc-100 outline-none truncate pl-1 pr-5 h-7 cursor-pointer"
          >
            {sessions.map((s) => <option key={s.id} value={s.id} className="bg-zinc-800">{s.title || t('aiNewSession')}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
        <button className={icoBtn} onClick={startNew} title={t('aiNewSession')} aria-label={t('aiNewSession')}><Plus size={15} /></button>
        <button className={icoBtn} onClick={deleteSession} disabled={busy} title={t('aiDeleteSession')} aria-label={t('aiDeleteSession')}><Trash2 size={14} /></button>
        <button className={icoBtn} onClick={onOpenSettings} title={t('aiOpenSettings')} aria-label={t('aiOpenSettings')}><Cog size={15} /></button>
      </div>

      {/* Mod seçici */}
      <div className="px-3 py-2 shrink-0">
        <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg bg-nv-input/60" role="tablist">
          {(['ask', 'agent'] as const).map((m) => (
            <button
              key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
              className={`h-6 rounded-md text-[12px] flex items-center justify-center gap-1.5 transition-colors ${mode === m ? 'bg-nv-active text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {m === 'ask' ? <MessageSquare size={12} /> : <Zap size={12} />}{m === 'ask' ? t('aiModeAsk') : t('aiModeAgent')}
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
      {!hasKey && (
        <div className={`${banner} border-amber-500/40 bg-amber-500/10 text-amber-100 flex items-center justify-between gap-2 shrink-0`}>
          <span className="min-w-0">{t('aiNoKey')}</span>
          <button className="h-6 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 shrink-0" onClick={onOpenSettings}>{t('aiOpenSettings')}</button>
        </div>
      )}
      {provider === 'builtin' && mode === 'agent' && builtinId === 'qwen2.5-coder-1.5b' && builtinReady && (
        <p className="mx-3 mt-2 text-[10.5px] text-amber-300/90 leading-snug shrink-0">{t('aiBuiltinAgentWarn')}</p>
      )}

      {/* İletiler */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-4 text-[12.5px]">
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
              {([['aiQuickExplain', 'Explain this code step by step.'], ['aiQuickBugs', 'Find possible bugs and edge cases in this code.'], ['aiQuickRefactor', 'Refactor this code to be cleaner and more efficient. Keep behavior the same.'], ['aiQuickTests', 'Write unit tests for this code.']] as const).map(([k, p]) => (
                <button key={k} className="h-8 px-2 rounded-lg border border-zinc-700/70 hover:bg-nv-hover text-zinc-300 text-[12px] truncate" onClick={() => quick(p)}>{t(k)}</button>
              ))}
            </div>
          </div>
        )}
        {session?.messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end min-w-0">
              <div className="max-w-[88%] rounded-2xl rounded-br-md bg-nv-active text-zinc-50 px-3 py-2 leading-relaxed min-w-0">
                {m.imageCount ? <div className="flex items-center gap-1 text-[10px] opacity-80 mb-1"><ImagePlus size={11} />×{m.imageCount}</div> : null}
                <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.text}</div>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-2 min-w-0">
              <div className="w-5 h-5 mt-0.5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0"><Sparkles size={11} className="text-white" /></div>
              <div className="min-w-0 flex-1 text-zinc-200 leading-relaxed">
                {m.text ? <MessageText text={m.text} /> : m.streaming && !m.approvals?.some((a) => !a.decided) ? (
                  <span className="flex items-center gap-1.5 text-zinc-500"><Loader2 size={12} className="animate-spin" />{t('aiThinking')}</span>
                ) : null}
                {m.tools && m.tools.length > 0 && <div className="mt-2 mb-1 space-y-1">{m.tools.map((c) => <ToolRow key={c.id} c={c} />)}</div>}
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
                {m.usage && <div className="mt-1 text-[10px] text-zinc-500">{t('aiUsage').replace('{in}', String(m.usage.in)).replace('{out}', String(m.usage.out))}</div>}
              </div>
            </div>
          )
        )}
      </div>

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
        <div className="rounded-xl border border-zinc-700/80 bg-nv-input/50 focus-within:border-indigo-500 transition-colors">
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
            <button className="min-w-0 flex-1 text-left px-1.5 text-[10.5px] text-zinc-500 hover:text-zinc-300 truncate" onClick={onOpenSettings} title={t('aiOpenSettings')}>
              {PROVIDER_LABEL[provider]} · {modelLabel}
            </button>
            {busy ? (
              <button className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center" onClick={stop} title={t('aiStop')} aria-label={t('aiStop')}><Square size={12} /></button>
            ) : (
              <button className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-40 disabled:hover:bg-indigo-600" disabled={!canSend} onClick={() => void send(input)} title={t('aiSend')} aria-label={t('aiSend')}><ArrowUp size={15} /></button>
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
