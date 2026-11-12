// Yapay zekâ asistanı istemci yardımcıları: oturum deposu (yalnız bu cihazda, localStorage) ve sağlayıcı varsayılanları.
// KVKK: sohbet içerikleri cihazdan çıkmaz (yalnız seçilen sağlayıcıya istek anında gider); görseller diske yazılmaz.
import type { AiProvider } from '../types';

export const DEFAULT_MODEL: Record<AiProvider, string> = {
  builtin: 'qwen2.5-coder-1.5b',
  anthropic: 'claude-sonnet-5-5',
  openai: 'gpt-4o',
  ollama: 'llama3.1'
};

export const PROVIDER_LABEL: Record<AiProvider, string> = {
  builtin: 'Nova (yerleşik)',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  ollama: 'Ollama'
};

export interface ToolCard {
  id: string;
  name: string;
  input: Record<string, unknown>;
  status: 'running' | 'ok' | 'error';
  result?: string;
}

export interface Approval {
  id: string;
  tool: string;
  summary: string;
  preview: string;
  decided?: 'allow' | 'deny';
}

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageCount?: number;
  tools?: ToolCard[];
  approvals?: Approval[];
  error?: string;
  usage?: { in: number; out: number };
  streaming?: boolean;
}

export interface AiSession {
  id: string;
  title: string;
  mode: 'ask' | 'agent';
  createdAt: number;
  updatedAt: number;
  messages: ChatMsg[];
}

const KEY = 'nova.ai.sessions.v1';
const MAX_SESSIONS = 30;
const MAX_MSGS = 100;

export const uid = () => {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(8)); // Math.random yerine güvenli kaynak
  return `${Date.now()}-${Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')}`;
};

export function newSession(mode: 'ask' | 'agent'): AiSession {
  const now = Date.now();
  return { id: uid(), title: '', mode, createdAt: now, updatedAt: now, messages: [] };
}

export function loadSessions(): AiSession[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((s) => s && typeof s.id === 'string' && Array.isArray(s.messages))
      .map((s) => ({
        id: String(s.id),
        title: String(s.title || '').slice(0, 80),
        mode: (s.mode === 'agent' ? 'agent' : 'ask') as 'ask' | 'agent',
        createdAt: Number(s.createdAt) || Date.now(),
        updatedAt: Number(s.updatedAt) || Date.now(),
        messages: (s.messages as ChatMsg[]).slice(-MAX_MSGS).map((m) => ({ ...m, streaming: false }))
      }))
      .slice(0, MAX_SESSIONS);
  } catch {
    return [];
  }
}

export function saveSessions(list: AiSession[]) {
  try {
    const trimmed = [...list].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_SESSIONS);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* depolama kapalı veya dolu */
  }
}

export function clearSessions() {
  try { window.localStorage.removeItem(KEY); } catch { /* kapalı */ }
}

export function titleFrom(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > 40 ? t.slice(0, 40) + '…' : t;
}

/** Yanıt metnini düz metin ve kod bloklarına ayırır (``` çitleri). */
export type Part = { kind: 'text'; text: string } | { kind: 'code'; lang: string; code: string };
export function splitParts(src: string): Part[] {
  const parts: Part[] = [];
  const re = /```([\w+#.-]*)\n([\s\S]*?)(```|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) parts.push({ kind: 'text', text: src.slice(last, m.index) });
    parts.push({ kind: 'code', lang: m[1], code: m[2].replace(/\n$/, '') });
    last = m.index + m[0].length;
    if (m[3] === '') break;
  }
  if (last < src.length) parts.push({ kind: 'text', text: src.slice(last) });
  return parts;
}

export function fileToImage(file: File): Promise<{ mediaType: string; data: string } | null> {
  return new Promise((resolve) => {
    if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) return resolve(null);
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || '');
      const i = s.indexOf(',');
      resolve(i > 0 ? { mediaType: file.type, data: s.slice(i + 1) } : null);
    };
    r.onerror = () => resolve(null);
    r.readAsDataURL(file);
  });
}
