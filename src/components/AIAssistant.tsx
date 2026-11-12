import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Check, Copy, CornerDownLeft, FileCode, ImagePlus, Loader2, Mic, Plus, Send, Settings as Cog, ShieldCheck, Sparkles, Square, Terminal as TermIcon, Trash2, Wrench, X } from 'lucide-react';
import { t } from '../i18n/uiText';
import { getUiLang } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { getSelectedText, replaceSelection } from '../services/editorBridge';
import { useDictation } from '../services/useDictation';
import {
  DEFAULT_MODEL, PROVIDER_LABEL, fileToImage, loadSessions, newSession, saveSessions, splitParts, titleFrom, uid,
  type AiSession, type ChatMsg
} from '../services/aiClient';
import type { AiEvent, AiProvider } from '../types';

interface AIAssistantProps {
  activeFile?: { name: string; path?: string; language?: string; content?: string } | null;
  hasWorkspace: boolean;
  onOpenSettings: () => void;
}

type Image = { mediaType: string; data: string; url: string };
// Yüklü modeller arasında kod odaklı olanı tercih et; yoksa ilkini al.
const pickOllamaModel = (models: string[]): string => models.find((m) => /coder|code/i.test(m)) ?? models[0] ?? '';
const SLASH_BUILTIN = ['new', 'ask', 'agent'] as const;

const CodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-1.5 rounded border border-zinc-700/60 bg-zinc-900/80 overflow-hidden">
      <div className="flex items-center justify-between px-2 h-6 bg-zinc-800/70 text-[10px] text-zinc-400">
        <span>{lang || 'code'}</span>
        <span className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 px-1.5 rounded hover:bg-zinc-700 hover:text-zinc-200"
            onClick={() => { void navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? t('aiCopied') : t('aiCopy')}
          </button>
          <button className="flex items-center gap-1 px-1.5 rounded hover:bg-zinc-700 hover:text-zinc-200" onClick={() => replaceSelection(code)}>
            <CornerDownLeft size={11} />
            {t('aiInsert')}
          </button>
        </span>
      </div>
      <pre className="p-2 overflow-x-auto text-[11px] leading-snug text-zinc-200 font-mono"><code>{code}</code></pre>
    </div>
  );
};

const MessageText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {splitParts(text).map((p, i) =>
      p.kind === 'code' ? <CodeBlock key={i} lang={p.lang} code={p.code} /> : <div key={i} className="whitespace-pre-wrap break-words">{p.text}</div>
    )}
  </>
);

const toolLabel = (name: string, input: Record<string, unknown>) => {
  const target = String(input.path ?? input.query ?? input.command ?? '');
  return `${name}${target ? ` · ${target.length > 60 ? target.slice(0, 60) + '…' : target}` : ''}`;
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ activeFile, hasWorkspace, onOpenSettings }) => {
  const { values, set: setSetting } = useSettings();
  const api = window.electronAPI?.ai;
  const provider = (['anthropic', 'openai', 'ollama'].includes(String(values.aiProvider)) ? values.aiProvider : 'anthropic') as AiProvider;
  const [ollama, setOllama] = useState<{ running: boolean; models: string[] } | null>(null);
  const [ollamaTick, setOllamaTick] = useState(0);
  const ollamaBase = provider === 'ollama' ? String(values.aiBaseUrl || '').trim() || undefined : undefined;
  const model = String(values.aiModel || '').trim() || (provider === 'ollama' ? pickOllamaModel(ollama?.models ?? []) : '') || DEFAULT_MODEL[provider];

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
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Kalıcılık (yalnız bu cihaz)
  useEffect(() => { saveSessions(sessions); }, [sessions]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [session?.messages]);

  // API anahtarı var mı (Ollama anahtarsız)
  useEffect(() => {
    let alive = true;
    if (provider === 'ollama') { setHasKey(true); return; }
    void window.electronAPI?.secrets.get(provider === 'anthropic' ? 'aiKey_anthropic' : 'aiKey_openai').then((r) => {
      if (alive) setHasKey('value' in r && !!r.value);
    });
    return () => { alive = false; };
  }, [provider, busy]);

  // Ollama: çalışıyor mu, hangi modeller yüklü (yerel istek, anahtar yok)
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
        const code = ev.error.startsWith('auth') ? 'aiErrAuth' : ev.error.startsWith('rate') ? 'aiErrRate' : 'aiErrGeneric';
        patchMsg(sessionId, msgId, (m) => ({ ...m, streaming: false, error: code === 'aiErrGeneric' ? `${t('aiErrGeneric')} (${ev.error.slice(0, 160)})` : t(code) }));
        if (code === 'aiErrAuth') setHasKey(false);
        runRef.current = null;
        setBusy(false);
      } else if (ev.type === 'done') {
        patchMsg(sessionId, msgId, (m) => ({ ...m, streaming: false, usage: ev.usage && (ev.usage.in || ev.usage.out) ? ev.usage : undefined }));
        runRef.current = null;
        setBusy(false);
      }
    });
  }, [api, patchMsg]);

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
    const body = sel || (activeFile.content ?? '').slice(0, 20000);
    if (!body) return '';
    return `<context file="${activeFile.name}" language="${activeFile.language ?? ''}"${sel ? ' selection="true"' : ''}>\n${body}\n</context>\n\n`;
  };

  const send = async (raw: string) => {
    let text = raw.trim();
    if ((!text && !images.length) || busy || !api) return;

    // Eğik çizgi komutları
    const slash = /^\/([\w-]+)\s*(.*)$/s.exec(text);
    if (slash) {
      const [, name, rest] = slash;
      if (name === 'new') { startNew(); return; }
      if (name === 'ask' || name === 'agent') { setMode(name); setInput(rest); return; }
      const c = custom.find((x) => x.name === name);
      if (c) text = c.template.includes('{{args}}') ? c.template.replace('{{args}}', rest) : `${c.template}\n\n${rest}`;
    }
    if (mode === 'agent' && !hasWorkspace) {
      setSessions((all) => all.map((s) => (s.id !== session.id ? s : { ...s, messages: [...s.messages, { id: uid(), role: 'assistant', text: '', error: t('aiAgentNeedsFolder') }] })));
      return;
    }

    const userMsg: ChatMsg = { id: uid(), role: 'user', text: raw.trim() || '🖼', imageCount: images.length || undefined };
    const botMsg: ChatMsg = { id: uid(), role: 'assistant', text: '', streaming: true };
    const history = [...session.messages, userMsg];
    const runId = uid();
    runRef.current = { runId, sessionId: session.id, msgId: botMsg.id };
    setSessions((all) => all.map((s) => (s.id !== session.id ? s : { ...s, title: s.title || titleFrom(userMsg.text), updatedAt: Date.now(), messages: [...history, botMsg] })));
    const sent = images;
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
      // Olay gelmeden düştüyse (ör. geçersiz istek) kilidi aç
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
      ...SLASH_BUILTIN.map((n) => ({ name: n, hint: t(n === 'new' ? 'aiSlashNew' : n === 'ask' ? 'aiSlashAsk' : 'aiSlashAgent') })),
      ...custom.map((c) => ({ name: c.name, hint: '.nova/commands' }))
    ].filter((c) => c.name.startsWith(q));
  }, [input, custom]);

  if (!api) {
    return (
      <div className="flex flex-col h-full bg-nv-side border-l border-nv-border p-4 text-[12px] text-zinc-400">
        <div className="flex items-center gap-2 mb-2 text-zinc-200"><Sparkles size={15} className="text-purple-400" />{t('aiTitle')}</div>
        {t('aiDesktopOnly')}
      </div>
    );
  }

  const voiceOn = values.aiVoiceEnabled === true;

  return (
    <div className="flex flex-col h-full bg-nv-side border-l border-nv-border text-zinc-300 min-w-0">
      {/* Üst: oturum seçici + mod */}
      <div className="flex items-center gap-1.5 px-2 h-9 border-b border-nv-border shrink-0">
        <Sparkles size={14} className="text-purple-400 shrink-0" />
        <select
          value={session?.id}
          onChange={(e) => !busy && setActiveId(e.target.value)}
          aria-label={t('aiSessions')}
          className="flex-1 min-w-0 bg-transparent text-[12px] text-zinc-200 outline-none truncate"
        >
          {sessions.map((s) => <option key={s.id} value={s.id} className="bg-zinc-800">{s.title || t('aiNewSession')}</option>)}
        </select>
        <button className="icon-btn" onClick={startNew} title={t('aiNewSession')} aria-label={t('aiNewSession')}><Plus size={14} /></button>
        <button className="icon-btn" onClick={deleteSession} title={t('aiDeleteSession')} aria-label={t('aiDeleteSession')}><Trash2 size={13} /></button>
        <button className="icon-btn" onClick={onOpenSettings} title={t('aiOpenSettings')} aria-label={t('aiOpenSettings')}><Cog size={14} /></button>
      </div>
      <div className="flex items-center gap-2 px-2 h-8 border-b border-nv-border/60 shrink-0 text-[11px]">
        <div className="flex rounded overflow-hidden border border-zinc-700" role="tablist">
          {(['ask', 'agent'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`px-2.5 h-5 ${mode === m ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
            >
              {m === 'ask' ? t('aiModeAsk') : t('aiModeAgent')}
            </button>
          ))}
        </div>
        {provider === 'ollama' && ollama && ollama.models.length > 0 ? (
          <select
            value={ollama.models.includes(model) ? model : ''}
            onChange={(e) => setSetting('aiModel', e.target.value)}
            aria-label={t('set_aiModel')}
            className="min-w-0 flex-1 bg-transparent text-zinc-300 outline-none truncate"
          >
            {!ollama.models.includes(model) && <option value="" className="bg-zinc-800">{model}</option>}
            {ollama.models.map((m) => <option key={m} value={m} className="bg-zinc-800">{m}</option>)}
          </select>
        ) : (
          <span className="truncate text-zinc-500" title={model}>{PROVIDER_LABEL[provider]} · {model}</span>
        )}
      </div>

      {provider === 'ollama' && ollama && (!ollama.running || ollama.models.length === 0) && (
        <div className="m-2 p-2 rounded border border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-200 flex items-center justify-between gap-2">
          <span>{!ollama.running ? t('aiOllamaDown') : t('aiOllamaNoModels')}</span>
          <button className="px-2 h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 shrink-0" onClick={() => setOllamaTick((n) => n + 1)}>{t('aiRecheck')}</button>
        </div>
      )}

      {!hasKey && (
        <div className="m-2 p-2 rounded border border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-200 flex items-center justify-between gap-2">
          <span>{t('aiNoKey')}</span>
          <button className="px-2 h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 shrink-0" onClick={onOpenSettings}>{t('aiOpenSettings')}</button>
        </div>
      )}

      {/* İletiler */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[12px]">
        {!session?.messages.length && (
          <div className="text-zinc-400 leading-relaxed">
            <div className="flex items-center gap-1.5 mb-2 text-zinc-200"><Bot size={14} className="text-purple-400" />Nova AI</div>
            <p>{t('aiWelcome')}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <button className="px-2 h-6 rounded bg-zinc-800 hover:bg-zinc-700" onClick={() => quick('Explain this code step by step.')}>{t('aiQuickExplain')}</button>
              <button className="px-2 h-6 rounded bg-zinc-800 hover:bg-zinc-700" onClick={() => quick('Find possible bugs and edge cases in this code.')}>{t('aiQuickBugs')}</button>
              <button className="px-2 h-6 rounded bg-zinc-800 hover:bg-zinc-700" onClick={() => quick('Refactor this code to be cleaner and more efficient. Keep behavior the same.')}>{t('aiQuickRefactor')}</button>
              <button className="px-2 h-6 rounded bg-zinc-800 hover:bg-zinc-700" onClick={() => quick('Write unit tests for this code.')}>{t('aiQuickTests')}</button>
            </div>
          </div>
        )}
        {session?.messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[92%] rounded-lg p-2.5 leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-800/70 text-zinc-200 border border-zinc-700/50'}`}>
              {m.role === 'user' && m.imageCount ? <div className="flex items-center gap-1 text-[10px] opacity-80 mb-1"><ImagePlus size={11} />×{m.imageCount}</div> : null}
              {m.role === 'assistant' && m.tools?.map((c) => (
                <div key={c.id} className="mb-1.5 flex items-start gap-1.5 text-[11px] text-zinc-400">
                  {c.status === 'running' ? <Loader2 size={12} className="animate-spin mt-0.5 shrink-0" /> : c.status === 'ok' ? <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" /> : <X size={12} className="text-rose-400 mt-0.5 shrink-0" />}
                  {c.name === 'run_command' ? <TermIcon size={12} className="mt-0.5 shrink-0" /> : c.name.includes('file') ? <FileCode size={12} className="mt-0.5 shrink-0" /> : <Wrench size={12} className="mt-0.5 shrink-0" />}
                  <span className="break-all font-mono">{toolLabel(c.name, c.input)}</span>
                </div>
              ))}
              {m.approvals?.map((a) => (
                <div key={a.id} className="my-1.5 rounded border border-amber-500/40 bg-amber-500/10 p-2">
                  <div className="flex items-center gap-1 text-[11px] text-amber-200 font-semibold"><ShieldCheck size={12} />{t('aiApprovalTitle')}: {a.summary}</div>
                  <pre className="mt-1 max-h-32 overflow-auto text-[10px] text-zinc-300 font-mono whitespace-pre-wrap break-all">{a.preview}</pre>
                  {a.decided ? (
                    <div className="mt-1 text-[10px] text-zinc-400">{a.decided === 'allow' ? t('aiApproved') : t('aiDenied')}</div>
                  ) : (
                    <div className="mt-1.5 flex gap-1.5">
                      <button className="px-2 h-6 rounded bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => decide(m.id, a.id, true)}>{t('aiApprove')}</button>
                      <button className="px-2 h-6 rounded bg-zinc-700 hover:bg-zinc-600" onClick={() => decide(m.id, a.id, false)}>{t('aiDeny')}</button>
                    </div>
                  )}
                </div>
              ))}
              {m.text ? <MessageText text={m.text} /> : m.streaming && !m.approvals?.some((a) => !a.decided) ? (
                <span className="flex items-center gap-1 text-zinc-500 italic"><Loader2 size={12} className="animate-spin" />{t('aiThinking')}</span>
              ) : null}
              {m.error && <div className="text-rose-300">{m.error}</div>}
              {m.usage && <div className="mt-1 text-[10px] text-zinc-500">{t('aiUsage').replace('{in}', String(m.usage.in)).replace('{out}', String(m.usage.out))}</div>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Eğik çizgi önerileri */}
      {slashList.length > 0 && (
        <div className="mx-2 mb-1 rounded border border-zinc-700 bg-zinc-900 text-[11px] overflow-hidden">
          {slashList.slice(0, 6).map((c) => (
            <button key={c.name} className="w-full flex justify-between px-2 h-6 hover:bg-zinc-800" onClick={() => setInput(`/${c.name} `)}>
              <span className="text-zinc-200">/{c.name}</span><span className="text-zinc-500 truncate ml-2">{c.hint}</span>
            </button>
          ))}
        </div>
      )}

      {/* Giriş alanı */}
      <div
        className="p-2 border-t border-nv-border shrink-0"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); void addFiles(e.dataTransfer.files); } }}
      >
        {images.length > 0 && (
          <div className="flex gap-1.5 mb-1.5">
            {images.map((im, i) => (
              <div key={i} className="relative">
                <img src={im.url} alt="" className="h-10 w-10 object-cover rounded border border-zinc-700" />
                <button className="absolute -top-1 -right-1 bg-zinc-900 rounded-full" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} aria-label={t('aiRemove')}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-1.5">
          <textarea
            value={input}
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }}
            onPaste={(e) => { const f = Array.from(e.clipboardData.files); if (f.length) { e.preventDefault(); void addFiles(f); } }}
            placeholder={mode === 'agent' ? t('aiPlaceholderAgent') : t('aiPlaceholderAsk')}
            className="flex-1 resize-none bg-nv-input border border-zinc-700/70 rounded px-2 py-1.5 text-[12px] text-zinc-200 outline-none focus:border-indigo-500 max-h-40"
          />
          <div className="flex flex-col gap-1">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ''; }} />
            <button className="icon-btn" onClick={() => fileRef.current?.click()} title={t('aiAttach')} aria-label={t('aiAttach')}><ImagePlus size={15} /></button>
            <button
              className={`icon-btn ${dictation.state === 'recording' ? 'text-rose-400 animate-pulse' : ''}`}
              disabled={dictation.state === 'transcribing'}
              onClick={() => (dictation.state === 'recording' ? dictation.stop() : voiceOn ? void dictation.start() : setSetting('aiVoiceEnabled', true))}
              title={dictation.state === 'recording' ? t('aiMicStop') : voiceOn ? t('aiMicStart') : t('aiVoiceConsent')}
              aria-label={t('aiMicStart')}
            >
              {dictation.state === 'transcribing' ? <Loader2 size={15} className="animate-spin" /> : <Mic size={15} />}
            </button>
            {busy ? (
              <button className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white" onClick={stop} title={t('aiStop')} aria-label={t('aiStop')}><Square size={13} /></button>
            ) : (
              <button className="p-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40" disabled={!input.trim() && !images.length} onClick={() => void send(input)} title={t('aiSend')} aria-label={t('aiSend')}><Send size={13} /></button>
            )}
          </div>
        </div>
        {!voiceOn && <p className="mt-1 text-[10px] text-zinc-500">{t('aiVoiceConsent')}</p>}
        <p className="mt-1 text-[10px] text-zinc-600">
          {provider === 'ollama' && (!ollamaBase || /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(ollamaBase)) ? t('aiPrivacyLocal') : t('aiPrivacy').replace('{provider}', PROVIDER_LABEL[provider])}
        </p>
      </div>
    </div>
  );
};
