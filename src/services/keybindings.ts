// Kısayol özelleştirme (F-04): komut kimliği -> tuş birleşimi kataloğu, kullanıcı geçersiz kılmaları, çakışma denetimi.
// Saf mantık (React/DOM yok; testler Vite SSR ile yükler). Geçersiz kılmalar yalnız bu cihazda (localStorage) tutulur;
// kişisel veri içermez, ağa gitmez. Birleşim biçimi: "Ctrl+Shift+P" (Ctrl macOS'ta Cmd'yi de kapsar), sıra Ctrl, Alt, Shift, Tuş.
import type { TextKey } from '../i18n/uiText';

export type KbScope = 'app' | 'editor';

export interface KbCommand {
  id: string;
  labelKey: TextKey;
  /** Varsayılan birleşim; null = varsayılan kısayolu yok. */
  def: string | null;
  /** app: uygulama kısayolu (window). editor: Monaco eylemi (monaco alanı); özel atamada dar yol: yakalama aşamasında eylemi çalıştırır. */
  scope: KbScope;
  monaco?: string;
}

// Sabit (özelleştirilemez): F1, F5/F10/F11 hata ayıklama durumları, Esc, Ctrl+C/V/X/Z/Y/A (metin düzenleme).
export const COMMANDS: KbCommand[] = [
  { id: 'commandPalette', labelKey: 'cpTitle', def: 'Ctrl+Shift+P', scope: 'app' },
  { id: 'quickOpen', labelKey: 'cmdQuickOpen', def: 'Ctrl+P', scope: 'app' },
  { id: 'goLine', labelKey: 'cmdGoToLine', def: 'Ctrl+G', scope: 'app' },
  { id: 'findInFiles', labelKey: 'cmdFindInFiles', def: 'Ctrl+Shift+F', scope: 'app' },
  { id: 'extensions', labelKey: 'extTitle', def: 'Ctrl+Shift+X', scope: 'app' },
  { id: 'ai', labelKey: 'cmdOpenAI', def: 'Ctrl+Shift+L', scope: 'app' },
  { id: 'problems', labelKey: 'prbTab', def: 'Ctrl+Shift+M', scope: 'app' },
  { id: 'sidebar', labelKey: 'tbSidebar', def: 'Ctrl+B', scope: 'app' },
  { id: 'terminal', labelKey: 'tbTerminal', def: 'Ctrl+`', scope: 'app' },
  { id: 'settings', labelKey: 'actSettings', def: 'Ctrl+,', scope: 'app' },
  { id: 'quit', labelKey: 'cmdQuitApp', def: 'Ctrl+Q', scope: 'app' },
  { id: 'save', labelKey: 'cmdSave', def: 'Ctrl+S', scope: 'app' },
  { id: 'newFile', labelKey: 'newFile', def: 'Ctrl+N', scope: 'app' },
  { id: 'openFolder', labelKey: 'openFolder', def: 'Ctrl+O', scope: 'app' },
  { id: 'openFiles', labelKey: 'openFiles', def: 'Ctrl+Shift+O', scope: 'app' },
  { id: 'closeTab', labelKey: 'cmdCloseTab', def: 'Ctrl+W', scope: 'app' },
  { id: 'reopenTab', labelKey: 'appReopenTab', def: 'Ctrl+Shift+T', scope: 'app' },
  { id: 'nextTab', labelKey: 'mnNextTab', def: 'Ctrl+Tab', scope: 'app' },
  { id: 'prevTab', labelKey: 'mnPrevTab', def: 'Ctrl+Shift+Tab', scope: 'app' },
  { id: 'run', labelKey: 'mnRun', def: null, scope: 'app' }, // F5 sabit; buraya ek kısayol atanabilir
  { id: 'splitRight', labelKey: 'cmdSplitRight', def: 'Ctrl+\\', scope: 'app' },
  { id: 'splitDown', labelKey: 'cmdSplitDown', def: 'Ctrl+Alt+\\', scope: 'app' },
  { id: 'focusOtherGroup', labelKey: 'cmdFocusOtherGroup', def: null, scope: 'app' },
  { id: 'closeSplit', labelKey: 'cmdCloseSplit', def: null, scope: 'app' },
  { id: 'keybindings', labelKey: 'kbOpen', def: null, scope: 'app' },
  { id: 'find', labelKey: 'cmdFind', def: 'Ctrl+F', scope: 'editor', monaco: 'actions.find' },
  { id: 'replace', labelKey: 'cmdReplace', def: 'Ctrl+H', scope: 'editor', monaco: 'editor.action.startFindReplace' },
  { id: 'format', labelKey: 'cmdFormat', def: 'Alt+Shift+F', scope: 'editor', monaco: 'editor.action.formatDocument' },
  { id: 'comment', labelKey: 'mnComment', def: 'Ctrl+/', scope: 'editor', monaco: 'editor.action.commentLine' },
  { id: 'nextMatch', labelKey: 'mnNextMatch', def: 'Ctrl+D', scope: 'editor', monaco: 'editor.action.addSelectionToNextFindMatch' },
  { id: 'moveLineUp', labelKey: 'mnMoveLineUp', def: 'Alt+Up', scope: 'editor', monaco: 'editor.action.moveLinesUpAction' },
  { id: 'moveLineDown', labelKey: 'mnMoveLineDown', def: 'Alt+Down', scope: 'editor', monaco: 'editor.action.moveLinesDownAction' },
  { id: 'copyLineDown', labelKey: 'mnCopyLineDown', def: 'Alt+Shift+Down', scope: 'editor', monaco: 'editor.action.copyLinesDownAction' },
];

export const COMMAND_IDS = COMMANDS.map((c) => c.id);
const BY_ID = new Map(COMMANDS.map((c) => [c.id, c]));
export const getCommand = (id: string) => BY_ID.get(id);

/** Sabit tuşlar: hiçbir komuta atanamaz (metin düzenleme, hata ayıklama, yardım). */
export const RESERVED = ['Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z', 'Ctrl+Y', 'Ctrl+A', 'Ctrl+Shift+Z', 'F1', 'F5', 'Shift+F5', 'F10', 'F11', 'Shift+F11', 'Escape'];

// ---------- Birleşim biçimi ----------
const NAMED: Record<string, string> = {
  arrowup: 'Up', up: 'Up', arrowdown: 'Down', down: 'Down', arrowleft: 'Left', left: 'Left', arrowright: 'Right', right: 'Right',
  ' ': 'Space', space: 'Space', spacebar: 'Space', esc: 'Escape', escape: 'Escape', tab: 'Tab', enter: 'Enter', return: 'Enter',
  backspace: 'Backspace', delete: 'Delete', del: 'Delete', home: 'Home', end: 'End', pageup: 'PageUp', pagedown: 'PageDown', insert: 'Insert'
};
const CODE_CHAR: Record<string, string> = {
  Backquote: '`', Backslash: '\\', Comma: ',', Period: '.', Slash: '/', Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '='
};
const MOD_ORDER = ['Ctrl', 'Alt', 'Shift'];

/** Tek tuş adını standart biçime getirir ("a" -> "A", "arrowup" -> "Up"); tanınmazsa null. */
function normKey(k: string): string | null {
  if (!k) return null;
  const low = k.toLowerCase();
  if (NAMED[low]) return NAMED[low];
  if (/^f([1-9]|1[0-9]|2[0-4])$/.test(low)) return low.toUpperCase();
  if (k.length === 1) return k.toUpperCase();
  return null;
}

/** "ctrl + shift + p" gibi metni "Ctrl+Shift+P" yapar; geçersizse null. */
export function normalizeCombo(input: string): string | null {
  if (!input) return null;
  const parts = input.split('+').map((p) => p.trim());
  // "Ctrl++" gibi artı tuşu: son iki parça boşsa tuş '+'dır
  let keyRaw = parts.pop() ?? '';
  if (keyRaw === '' && parts[parts.length - 1] === '') { parts.pop(); keyRaw = '+'; }
  const mods = new Set<string>();
  for (const p of parts) {
    const l = p.toLowerCase();
    if (l === 'ctrl' || l === 'control' || l === 'cmd' || l === 'meta' || l === 'mod' || l === 'command') mods.add('Ctrl');
    else if (l === 'alt' || l === 'option') mods.add('Alt');
    else if (l === 'shift') mods.add('Shift');
    else return null;
  }
  const key = normKey(keyRaw);
  if (!key) return null;
  return [...MOD_ORDER.filter((m) => mods.has(m)), key].join('+');
}

export interface KeyEventLike {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

/** Klavye olayından birleşim üretir. Yalnız değiştirici tuşa basıldıysa null. Harf/rakam/noktalama fiziksel tuşa (code) göre okunur. */
export function comboFromEvent(e: KeyEventLike): string | null {
  const code = e.code ?? '';
  let key: string | null = null;
  if (/^Key[A-Z]$/.test(code)) key = code.slice(3);
  else if (/^Digit[0-9]$/.test(code)) key = code.slice(5);
  else if (CODE_CHAR[code]) key = CODE_CHAR[code];
  else if (/^Numpad[0-9]$/.test(code)) key = code.slice(6);
  if (!key) {
    if (['Control', 'Shift', 'Alt', 'Meta', 'AltGraph', 'OS', 'Dead'].includes(e.key)) return null;
    key = normKey(e.key);
  }
  if (!key) return null;
  const mods = [(e.ctrlKey || e.metaKey) && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift'].filter(Boolean) as string[];
  return [...mods, key].join('+');
}

/** Ekranda gösterim: oklar sembolle ("Alt+Up" -> "Alt+↑"). */
export function formatCombo(c: string | null): string {
  if (!c) return '';
  return c.replace(/\bUp$/, '↑').replace(/\bDown$/, '↓').replace(/\bLeft$/, '←').replace(/\bRight$/, '→');
}

export type AssignCheck = { ok: true } | { ok: false; reason: 'invalid' | 'needMod' | 'reserved' };

/** Atanabilir mi: Ctrl/Alt içermeli ya da F tuşu olmalı (düz harf yazmayı bozar), sabit tuşlar olmaz. */
export function checkAssignable(combo: string | null): AssignCheck {
  const c = combo ? normalizeCombo(combo) : null;
  if (!c) return { ok: false, reason: 'invalid' };
  const parts = c.split('+');
  const key = parts[parts.length - 1];
  if (!/^F\d+$/.test(key) && !parts.includes('Ctrl') && !parts.includes('Alt')) return { ok: false, reason: 'needMod' };
  if (RESERVED.includes(c)) return { ok: false, reason: 'reserved' };
  return { ok: true };
}

// ---------- Çözümleme ----------
/** Kullanıcı geçersiz kılmaları: kimlik -> birleşim; null = bilerek kısayolsuz. Bilinmeyen kimlik ve geçersiz değer yok sayılır. */
export type Overrides = Record<string, string | null>;
export type Bindings = Record<string, string | null>;

export function sanitizeOverrides(raw: unknown): Overrides {
  const out: Overrides = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!BY_ID.has(id)) continue;
    if (v === null) { out[id] = null; continue; }
    if (typeof v !== 'string') continue;
    const c = normalizeCombo(v);
    if (c && checkAssignable(c).ok) out[id] = c;
  }
  return out;
}

/** Etkin eşleme: varsayılanlar + geçersiz kılmalar. */
export function resolveBindings(overrides: Overrides): Bindings {
  const out: Bindings = {};
  for (const c of COMMANDS) out[c.id] = c.id in overrides ? overrides[c.id] : c.def;
  return out;
}

/** Aynı birleşime atanmış komutlar (yalnız 2+ olanlar). */
export function findConflicts(bindings: Bindings): Record<string, string[]> {
  const by: Record<string, string[]> = {};
  for (const [id, combo] of Object.entries(bindings)) {
    if (!combo) continue;
    (by[combo] ??= []).push(id);
  }
  return Object.fromEntries(Object.entries(by).filter(([, ids]) => ids.length > 1));
}

/** `combo`, `exceptId` dışında hangi komutlarda kullanılıyor? */
export function conflictsFor(combo: string, exceptId: string, bindings: Bindings): string[] {
  return Object.entries(bindings).filter(([id, c]) => id !== exceptId && c === combo).map(([id]) => id);
}

/**
 * Atama: birleşimi `id`'ye verir. `steal` true ise çakışan komutların kısayolu kaldırılır (null yapılır);
 * false iken çakışma varsa değişiklik yapılmaz ve çakışanlar döner.
 */
export function assign(overrides: Overrides, id: string, combo: string | null, steal = false): { overrides: Overrides; conflicts: string[]; ok: boolean } {
  if (!BY_ID.has(id)) return { overrides, conflicts: [], ok: false };
  const next: Overrides = { ...overrides };
  if (combo === null) { next[id] = null; return { overrides: tidy(next), conflicts: [], ok: true }; }
  const c = normalizeCombo(combo);
  if (!c || !checkAssignable(c).ok) return { overrides, conflicts: [], ok: false };
  const bindings = resolveBindings(overrides);
  const clash = conflictsFor(c, id, bindings);
  if (clash.length && !steal) return { overrides, conflicts: clash, ok: false };
  for (const other of clash) next[other] = null;
  next[id] = c;
  return { overrides: tidy(next), conflicts: clash, ok: true };
}

/** Varsayılanla aynı olan geçersiz kılmaları temizler (kayıt küçük kalır). */
function tidy(o: Overrides): Overrides {
  const out: Overrides = {};
  for (const [id, v] of Object.entries(o)) if (v !== (BY_ID.get(id)?.def ?? null)) out[id] = v;
  return out;
}

export function resetOne(overrides: Overrides, id: string): Overrides {
  const { [id]: _drop, ...rest } = overrides;
  void _drop;
  return rest;
}

/** Olaya karşılık gelen komut kimliği (yalnız istenen kapsamda); yoksa null. */
export function commandForEvent(e: KeyEventLike, bindings: Bindings, scope?: KbScope): string | null {
  const c = comboFromEvent(e);
  if (!c) return null;
  for (const cmd of COMMANDS) {
    if (scope && cmd.scope !== scope) continue;
    if (bindings[cmd.id] === c) return cmd.id;
  }
  return null;
}

/**
 * Monaco'nun varsayılan tuşunu kullanan ve kullanıcı tarafından değiştirilmiş/kaldırılmış editör komutlarının
 * eski birleşimleri: bunlar yakalama aşamasında yutulur (o tuşu başka bir uygulama komutu tutuyorsa App onu çalıştırır),
 * böylece "kaldırdım ama hâlâ çalışıyor" olmaz.
 */
export function shadowedEditorDefaults(bindings: Bindings): Set<string> {
  const out = new Set<string>();
  for (const c of COMMANDS) {
    if (c.scope !== 'editor' || !c.def) continue;
    if (bindings[c.id] !== c.def) out.add(c.def);
  }
  return out;
}

/** Menü/palet etiketlerindeki sabit kısayol metnini güncel atamaya çevirir ("Ctrl+N" -> kullanıcının atadığı). */
export function remapShortcutLabel(label: string, bindings: Bindings): string {
  const norm = normalizeCombo(label.replace('↑', 'Up').replace('↓', 'Down').replace('←', 'Left').replace('→', 'Right'));
  const cmd = norm ? COMMANDS.find((c) => c.def === norm) : undefined;
  if (!cmd) return label;
  const cur = bindings[cmd.id];
  return cur === cmd.def ? label : formatCombo(cur);
}

// ---------- Kalıcılık (yalnız bu cihaz) ----------
export const KB_STORAGE_KEY = 'nova.keybindings.v1';

export function loadOverrides(storage?: { getItem: (k: string) => string | null }): Overrides {
  try {
    const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    const raw = s?.getItem(KB_STORAGE_KEY);
    return raw ? sanitizeOverrides(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

// Küçük abonelik deposu (useSyncExternalStore için): ayarlar sayfası, palet ve klavye işleyicisi aynı kaynağı okur.
let current: Overrides | null = null;
let currentBindings: Bindings | null = null;
const listeners = new Set<() => void>();

export function getOverrides(): Overrides {
  if (!current) current = loadOverrides();
  return current;
}
export function getBindings(): Bindings {
  if (!currentBindings) currentBindings = resolveBindings(getOverrides());
  return currentBindings;
}
export function setOverrides(next: Overrides) {
  current = sanitizeOverrides(next);
  currentBindings = null;
  try { window.localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(current)); } catch { /* depolama kapalı */ }
  listeners.forEach((l) => l());
}
export function subscribeBindings(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
