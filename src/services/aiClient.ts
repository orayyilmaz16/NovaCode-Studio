// Yapay zekâ asistanı istemci yardımcıları: oturum deposu (yalnız bu cihazda, localStorage) ve sağlayıcı varsayılanları.
// KVKK: sohbet içerikleri cihazdan çıkmaz (yalnız seçilen sağlayıcıya istek anında gider); görseller diske yazılmaz.
import type { AiProvider } from '../types';

export const DEFAULT_MODEL: Record<AiProvider, string> = {
  builtin: 'qwen2.5-coder-1.5b',
  anthropic: 'claude-sonnet-5-5',
  openai: 'gpt-4o',
  ollama: 'qwen2.5-coder:7b'
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
  /** Üste sabitlenir ve otomatik temizlikte silinmez. */
  pinned?: boolean;
  /** Kullanıcı adı elle verdiyse otomatik adlandırma o sohbete dokunmaz. */
  titleLocked?: boolean;
  /** Otomatik ad aşaması: 0 yok, 1 ilk mesajdan, 2 ilk yanıttan sonra inceltildi. */
  autoLevel?: 0 | 1 | 2;
  /** Konu kategorisi: ilk iletiden yerelde otomatik atanır; elle seçilirse kilitlenir. */
  category?: CategoryId;
  categoryLocked?: boolean;
}

// ---------- Sohbet kategorileri (yerel, kural tabanlı; veri dışarı gitmez) ----------
export type CategoryId = 'bug' | 'feature' | 'explain' | 'refactor' | 'test' | 'docs' | 'general';
export const CATEGORY_IDS: CategoryId[] = ['bug', 'feature', 'explain', 'refactor', 'test', 'docs', 'general'];
export const CATEGORY_STYLE: Record<CategoryId, { dot: string; chip: string }> = {
  bug: { dot: 'bg-rose-400', chip: 'bg-rose-500/15 text-rose-300' },
  feature: { dot: 'bg-emerald-400', chip: 'bg-emerald-500/15 text-emerald-300' },
  explain: { dot: 'bg-sky-400', chip: 'bg-sky-500/15 text-sky-300' },
  refactor: { dot: 'bg-violet-400', chip: 'bg-violet-500/15 text-violet-300' },
  test: { dot: 'bg-amber-400', chip: 'bg-amber-500/15 text-amber-300' },
  docs: { dot: 'bg-teal-400', chip: 'bg-teal-500/15 text-teal-300' },
  general: { dot: 'bg-zinc-400', chip: 'bg-zinc-500/20 text-zinc-300' }
};
export const isCategory = (x: unknown): x is CategoryId => typeof x === 'string' && (CATEGORY_IDS as string[]).includes(x);

// Sözcük başı eşleşmesi (düzeltir → düzelt); 8 dilde yaygın kökler. Sıra önemli: ilk eşleşen kazanır.
const CAT_WORDS: [CategoryId, string[]][] = [
  ['test', ['test', 'spec', 'jest', 'vitest', 'pytest', 'unit', 'prüf', 'тест', 'prueba', 'teste']],
  ['bug', ['hata', 'bug', 'düzelt', 'çalışmıyor', 'çöz', 'sorun', 'fix', 'error', 'exception', 'crash', 'broken', 'fehler', 'ошибк', 'исправ', 'баг', 'corrige', 'erreur', 'corrig', 'xəta', 'problem']],
  ['refactor', ['refactor', 'yeniden düzenle', 'temizle', 'sadeleştir', 'optimi', 'iyileştir', 'performans', 'clean up', 'simplif', 'aufräum', 'рефактор', 'оптимиз', 'nettoy', 'təmizlə']],
  ['docs', ['readme', 'doküman', 'belge', 'document', 'yorum satır', 'comment', 'docs', 'dokumentation', 'документац', 'documenta', 'sənəd']],
  ['explain', ['açıkla', 'anlat', 'nedir', 'nasıl çalış', 'neden', 'explain', 'what is', 'what does', 'how does', 'why', 'erkläre', 'was ist', 'объясни', 'что такое', 'explica', 'qué es', 'explique', 'izah', 'nədir']],
  ['feature', ['ekle', 'oluştur', 'yaz', 'geliştir', 'implement', 'add', 'create', 'build', 'generate', 'make', 'feature', 'özellik', 'hinzufüg', 'erstelle', 'добав', 'создай', 'реализ', 'añade', 'crea', 'ajoute', 'crée', 'əlavə', 'yarat']]
];
const CAT_RE = CAT_WORDS.map(([id, words]) => [id, new RegExp(`(?<![\\p{L}\\p{N}])(${words.join('|')})`, 'iu')] as const);
export function smartCategory(text: string): CategoryId {
  const x = text.replace(/```[\s\S]*?(```|$)/g, ' ').slice(0, 1200);
  for (const [id, re] of CAT_RE) if (re.test(x)) return id;
  return 'general';
}

const KEY = 'nova.ai.sessions.v1';
const MAX_SESSIONS = 50;
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
      .filter((s) => s && typeof s.id === 'string' && Array.isArray(s.messages) && s.messages.length > 0) // boş sohbetler saklanmaz
      .map((s) => ({
        id: String(s.id),
        title: String(s.title || '').slice(0, 80),
        mode: (s.mode === 'agent' ? 'agent' : 'ask') as 'ask' | 'agent',
        createdAt: Number(s.createdAt) || Date.now(),
        updatedAt: Number(s.updatedAt) || Date.now(),
        pinned: s.pinned === true,
        titleLocked: s.titleLocked === true,
        autoLevel: (s.autoLevel === 1 || s.autoLevel === 2 ? s.autoLevel : 0) as 0 | 1 | 2,
        category: isCategory(s.category) ? s.category : undefined,
        categoryLocked: s.categoryLocked === true,
        messages: (s.messages as ChatMsg[]).slice(-MAX_MSGS).map((m) => ({ ...m, streaming: false }))
      }))
      .slice(0, MAX_SESSIONS * 2);
  } catch {
    return [];
  }
}

export function saveSessions(list: AiSession[]) {
  try {
    // Sabitlenenler hiç düşmez; kalan kontenjan en yeni sohbetlere gider.
    // Boş (hiçbir şey yazılmamış) sohbetler hafızaya yazılmaz
    const byNew = list.filter((x) => x.messages.length > 0).sort((a, b) => b.updatedAt - a.updatedAt);
    const pinned = byNew.filter((x) => x.pinned);
    const rest = byNew.filter((x) => !x.pinned).slice(0, Math.max(5, MAX_SESSIONS - pinned.length));
    window.localStorage.setItem(KEY, JSON.stringify([...pinned, ...rest]));
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

// ---------- Otomatik adlandırma (tamamen yerelde, kural tabanlı: sohbet içeriği hiçbir yere gönderilmez) ----------
const FILLER_START = /^(lütfen|merhaba|selam|selamlar|hey|hi|hello|hallo|hola|bonjour|salam|привет|здравствуйте|пожалуйста|please|bitte|por favor|s['’]il (vous|te) pla[iî]t|zəhmət olmasa|can you|could you|would you|will you|kannst du|könntest du|puedes|peux-tu|pouvez-vous|bana|şunu|bunu|bir)(?=[\s,!:;-]|$)[\s,!:;-]*/i;
const FILLER_END = /[\s,]*(yapar mısın|eder misin|eder misiniz|yazar mısın|yapabilir misin|mısın|misin|musun|müsün|please|lütfen|bitte|por favor|пожалуйста)[?.!\s]*$/i;
const GENERIC = /^(açıkla|acikla|explain|erkläre|объясни|explica|explique|izah et|düzelt|fix|hata|bug|test|refactor|yaz|write|help|yardım|merhaba|selam|hello|hi)$/i;
const upperFirst = (x: string) => (x ? x.charAt(0).toLocaleUpperCase() + x.slice(1) : x);

function clip(text: string, max = 44): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > max * 0.5 ? cut.slice(0, sp) : cut).replace(/[\s,.;:-]+$/, '')}…`;
}

/** İlk iletiden kısa, konuyu anlatan bir ad üretir. Boş dönerse çağıran yedek kullanır. */
export function smartTitle(text: string, fileHint?: string): string {
  const hadCode = /```|^( {4}|	)\S/m.test(text);
  let x = text
    .replace(/```[\s\S]*?(```|$)/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\/[\w-]+\s*/, '')
    .replace(/[#*_>~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  x = (x.split(/(?<=[.!?…])\s/)[0] ?? '').trim();
  for (let i = 0; i < 3; i++) x = x.replace(FILLER_START, '');
  x = x.replace(FILLER_END, '').replace(/[?.!,:;\s]+$/, '').trim();
  const words = x.split(' ').filter(Boolean);
  const short = words.length < 3 || GENERIC.test(x);
  if (x.length >= 3 && !(short && fileHint)) return upperFirst(clip(x));
  if (fileHint) return clip(x.length >= 2 ? `${upperFirst(x)} · ${fileHint}` : fileHint, 44);
  if (hadCode && x.length < 3) return '';
  return x.length >= 2 ? upperFirst(x) : '';
}

/** İlk yanıttan sonra adı inceltir: ilk ileti belirsizse dosya adı, kod dili veya yanıtın konusu eklenir. */
export function refineTitle(session: AiSession, fileHint?: string): string {
  const user = session.messages.find((m) => m.role === 'user')?.text ?? '';
  const bot = session.messages.find((m) => m.role === 'assistant' && m.text)?.text ?? '';
  const base = smartTitle(user, fileHint);
  const generic = base.split(' ').length < 3 || GENERIC.test(base);
  if (!generic) return base;
  const lang = /```([a-z][\w+#.-]*)/i.exec(bot)?.[1];
  const topic = fileHint || lang;
  if (base && topic && !base.toLowerCase().includes(topic.toLowerCase())) return clip(`${base} · ${topic}`, 44);
  if (base) return base;
  const first = bot.replace(/```[\s\S]*?(```|$)/g, ' ').replace(/[#*_>`~|]+/g, ' ').replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])\s/)[0] ?? '';
  return first.length >= 3 ? upperFirst(clip(first)) : topic ? clip(topic) : '';
}

export type DateGroup = 'today' | 'yesterday' | 'week' | 'older';
export function dateGroup(ts: number, now = Date.now()): DateGroup {
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  const day = 86400000;
  if (ts >= d0.getTime()) return 'today';
  if (ts >= d0.getTime() - day) return 'yesterday';
  if (ts >= d0.getTime() - 6 * day) return 'week';
  return 'older';
}

export function relativeTime(ts: number, lang: string, now = Date.now()): string {
  const diff = ts - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: 'short' });
  if (abs < 60_000) return rtf.format(0, 'second');
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute');
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour');
  if (abs < 30 * 86_400_000) return rtf.format(Math.round(diff / 86_400_000), 'day');
  return new Date(ts).toLocaleDateString(lang);
}

export function sessionToMarkdown(s: AiSession, you: string, bot: string): string {
  const lines = [`# ${s.title || 'NovaCode'}`, '', `_${new Date(s.createdAt).toLocaleString()}_`, ''];
  for (const m of s.messages) if (m.text) lines.push(`## ${m.role === 'user' ? you : bot}`, '', m.text, '');
  return lines.join('\n');
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
