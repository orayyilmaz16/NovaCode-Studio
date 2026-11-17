// Oturum kalıcılığı (B-14 / F-01): açık sekmeler ve kaydedilmemiş taslaklar yalnız bu bilgisayarda (localStorage) tutulur.
// Hiçbir veri ağa/3. tarafa gitmez. Amaç: çökme/elektrik kesintisinde kaydedilmemiş çalışmayı kurtarmak (hukuki sebep: kullanıcının
// kendi çalışmasını koruma; saklama: sonraki açılışta geri yükle/yoksay seçilene veya yeni oturum yazılana kadar, yerelde).
import { splitToSaved, type SplitSaved, type SplitState } from './splitLayout';

const KEY = 'nova.session.v1';
const MAX_DRAFT = 500_000; // tek dosya taslağı için karakter üst sınırı
const MAX_TOTAL = 2_000_000; // tüm taslaklar için karakter üst sınırı

export interface SessionTab {
  path?: string;
  name: string;
  language?: string;
  /** Kaydedilmemiş içerik (yalnız değişmiş sekmeler ve adsız dosyalar). */
  draft?: string;
}
export interface Session {
  v: 1;
  root: string | null;
  rootName: string;
  active: number;
  tabs: SessionTab[];
  savedAt: number;
  /** Bölünmüş editör (F-03): gruplar `tabs` dizinleriyle tutulur. Yoksa tek grup. */
  split?: SplitSaved;
}

export function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (s?.v !== 1 || !Array.isArray(s.tabs)) return null;
    if (s.split && (typeof s.split !== 'object' || !Array.isArray(s.split.a) || !Array.isArray(s.split.b))) delete s.split;
    s.tabs = s.tabs.filter((x) => x && typeof x.name === 'string' && (x.path === undefined || typeof x.path === 'string'));
    return s;
  } catch {
    return null;
  }
}

export function clearSession() {
  try { window.localStorage.removeItem(KEY); } catch { /* depolama kapalı */ }
}

export interface SessionInput {
  root: string | null;
  rootName: string;
  activeId: string | null;
  files: { id: string; name: string; path?: string; language?: string; isModified?: boolean; diff?: unknown }[];
  getContent: (id: string) => string | undefined;
  /** false: taslaklar yazılmaz (kullanıcı bilerek "kaydetme" ile çıktı). */
  withDrafts?: boolean;
  split?: SplitState | null;
}

export function saveSession(inp: SessionInput) {
  try {
    const tabs: SessionTab[] = [];
    let total = 0;
    let active = 0;
    const tabIndex = new Map<string, number>();
    for (const f of inp.files) {
      if (f.diff) continue;
      const tab: SessionTab = { name: f.name, language: f.language };
      if (f.path) tab.path = f.path;
      if (inp.withDrafts !== false && (f.isModified || !f.path)) {
        const c = inp.getContent(f.id) ?? '';
        if (c && c.length <= MAX_DRAFT && total + c.length <= MAX_TOTAL) {
          tab.draft = c;
          total += c.length;
        } else if (!f.path) continue; // adsız ve saklanamayacak kadar büyük: atla
      } else if (!f.path) continue; // taslaksız adsız dosyanın saklanacak bir şeyi yok
      if (f.id === inp.activeId) active = tabs.length;
      tabIndex.set(f.id, tabs.length);
      tabs.push(tab);
    }
    if (tabs.length === 0 && !inp.root) {
      clearSession();
      return;
    }
    const s: Session = { v: 1, root: inp.root, rootName: inp.rootName, active, tabs, savedAt: Date.now() };
    const sp = inp.split ? splitToSaved(inp.split, (id) => tabIndex.get(id) ?? -1) : undefined;
    if (sp) s.split = sp;
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* kota dolu veya depolama kapalı */
  }
}

/** Geri yüklemeye değer bir oturum mu? (en az bir sekme) */
export const isRestorable = (s: Session | null): s is Session => !!s && s.tabs.length > 0;

// Kapatılan sekmeler (Ctrl+Shift+T): yalnız diskteki dosyalar, en yeni sonda, en çok 20.
const closed: { path: string; name: string; language?: string }[] = [];
export const rememberClosed = (f: { path?: string; name: string; language?: string; diff?: unknown }) => {
  if (!f.path || f.diff) return;
  const i = closed.findIndex((x) => x.path === f.path);
  if (i >= 0) closed.splice(i, 1);
  closed.push({ path: f.path, name: f.name, language: f.language });
  if (closed.length > 20) closed.shift();
};
export const popClosed = () => closed.pop();
