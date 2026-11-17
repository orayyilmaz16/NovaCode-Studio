// Bölünmüş editör (F-03): en çok iki grup. Saf mantık (React yok); App durumu burada hesaplanır, EditorArea yalnız çizer.
// Dosya havuzu (App.openFiles) tektir; her grup havuzdaki dosya kimliklerinden kendi sekme listesini tutar.
// Aynı dosya iki grupta açık olabilir: Monaco modeli ortaktır (içerik, geri al geçmişi, kirli durum tek yerde).
// Veri yalnız bellekte ve oturum kaydında (localStorage) durur; ağa gitmez.

export type GroupId = 'a' | 'b';
export type SplitDir = 'row' | 'col';

export interface SplitState {
  dir: SplitDir;
  a: string[];
  b: string[];
  aActive: string | null;
  bActive: string | null;
  focus: GroupId;
}

export const otherGroup = (g: GroupId): GroupId => (g === 'a' ? 'b' : 'a');
const list = (s: SplitState, g: GroupId) => (g === 'a' ? s.a : s.b);
const withList = (s: SplitState, g: GroupId, ids: string[]): SplitState => (g === 'a' ? { ...s, a: ids } : { ...s, b: ids });
const withActive = (s: SplitState, g: GroupId, id: string | null): SplitState => (g === 'a' ? { ...s, aActive: id } : { ...s, bActive: id });
export const activeOf = (s: SplitState, g: GroupId) => (g === 'a' ? s.aActive : s.bActive);

const sameArr = (x: string[], y: string[]) => x.length === y.length && x.every((v, i) => v === y[i]);
const same = (x: SplitState, y: SplitState) => x.dir === y.dir && x.focus === y.focus && x.aActive === y.aActive && x.bActive === y.bActive && sameArr(x.a, y.a) && sameArr(x.b, y.b);

/**
 * Bölmeyi açar ya da (açıksa) etkin dosyayı diğer gruba da koyup odağı ona verir.
 * Etkin dosya yoksa bölünemez (null döner, durum değişmez).
 */
export function splitInto(state: SplitState | null, pool: string[], activeId: string | null, dir: SplitDir): SplitState | null {
  if (!activeId || !pool.includes(activeId)) return state;
  if (!state) return { dir, a: [...pool], b: [activeId], aActive: activeId, bActive: activeId, focus: 'b' };
  const to = otherGroup(state.focus);
  const ids = list(state, to);
  const next = withActive(withList({ ...state, dir, focus: to }, to, ids.includes(activeId) ? ids : [...ids, activeId]), to, activeId);
  return next;
}

/** Sekmeyi bir gruptan ötekine taşır (copy: kaynakta da kalır). Boş kalan grup normalize ile kapanır. */
export function moveToGroup(state: SplitState, id: string, from: GroupId, to: GroupId, copy = false): SplitState {
  if (from === to) return withActive({ ...state, focus: to }, to, id);
  let s = state;
  if (!copy) {
    const rest = list(s, from).filter((x) => x !== id);
    s = withList(s, from, rest);
    if (activeOf(s, from) === id) s = withActive(s, from, rest[rest.length - 1] ?? null);
  }
  const dst = list(s, to);
  s = withList(s, to, dst.includes(id) ? dst : [...dst, id]);
  return withActive({ ...s, focus: to }, to, id);
}

/** Dosya yalnız bu gruptan çıkar (öteki grupta açık kalır). */
export function removeFromGroup(state: SplitState, id: string, g: GroupId): SplitState {
  const rest = list(state, g).filter((x) => x !== id);
  let s = withList(state, g, rest);
  if (activeOf(s, g) === id) s = withActive(s, g, rest[rest.length - 1] ?? null);
  return s;
}

/** Odağı bir gruba verir; etkin dosyayı döndürmek çağıranın işidir (activeOf). */
export function focusGroup(state: SplitState, g: GroupId): SplitState {
  return state.focus === g ? state : { ...state, focus: g };
}

/** Sekme seçimi: grubu odaklar ve o grubun etkin dosyasını ayarlar. */
export function selectInGroup(state: SplitState, g: GroupId, id: string): SplitState {
  return withActive({ ...state, focus: g }, g, id);
}

/**
 * Havuz ve etkin dosya değiştikçe durumu tutarlı kılar:
 * - havuzdan kalkan dosyalar listelerden düşer, yeni dosyalar odaktaki gruba eklenir
 * - etkin dosya odaktaki grupta yoksa ama öteki grupta varsa odak oraya geçer
 * - bir grup boşalırsa bölme kapanır (null: tüm havuz tek grupta görünür)
 * Değişiklik yoksa AYNI nesneyi döndürür (gereksiz çizim/döngü olmaz).
 */
export function normalizeSplit(state: SplitState | null, pool: string[], activeId: string | null): SplitState | null {
  if (!state) return null;
  const inPool = new Set(pool);
  const a = state.a.filter((x) => inPool.has(x));
  const b = state.b.filter((x) => inPool.has(x));
  const known = new Set([...a, ...b]);
  const fresh = pool.filter((x) => !known.has(x));
  let s: SplitState = { ...state, a, b };
  if (fresh.length) s = withList(s, s.focus, [...list(s, s.focus), ...fresh]);
  if (s.a.length === 0 || s.b.length === 0) return null;
  if (activeId) {
    if (list(s, s.focus).includes(activeId)) s = withActive(s, s.focus, activeId);
    else if (list(s, otherGroup(s.focus)).includes(activeId)) s = withActive({ ...s, focus: otherGroup(s.focus) }, otherGroup(s.focus), activeId);
  }
  for (const g of ['a', 'b'] as GroupId[]) {
    const act = activeOf(s, g);
    if (!act || !list(s, g).includes(act)) s = withActive(s, g, list(s, g)[list(s, g).length - 1] ?? null);
  }
  return same(s, state) ? state : s;
}

/** Sekme sırası için komşu: kapatılan dosyadan sonra gelecek etkin dosya (önce sonraki, yoksa önceki). */
export function neighborIn(ids: string[], id: string): string | null {
  const i = ids.indexOf(id);
  if (i < 0) return null;
  return ids[i + 1] ?? ids[i - 1] ?? null;
}

// ---- Oturum (session.ts) için dizin tabanlı kayıt biçimi ----
export interface SplitSaved {
  dir: SplitDir;
  a: number[];
  b: number[];
  aActive: number;
  bActive: number;
  focus: GroupId;
}

/** id listesini kaydedilen sekme dizinlerine çevirir (kaydedilmeyen sekmeler atlanır). */
export function splitToSaved(s: SplitState, indexOf: (id: string) => number): SplitSaved | undefined {
  const map = (ids: string[]) => ids.map(indexOf).filter((i) => i >= 0);
  const a = map(s.a);
  const b = map(s.b);
  if (a.length === 0 || b.length === 0) return undefined;
  return { dir: s.dir, a, b, aActive: s.aActive ? indexOf(s.aActive) : -1, bActive: s.bActive ? indexOf(s.bActive) : -1, focus: s.focus };
}

/** Kayıtlı dizinleri geri yüklenen sekme kimliklerine çevirir; geçersiz/eksik ise null. */
export function savedToSplit(sv: SplitSaved | undefined, idAt: (i: number) => string | undefined): SplitState | null {
  if (!sv || (sv.dir !== 'row' && sv.dir !== 'col') || !Array.isArray(sv.a) || !Array.isArray(sv.b)) return null;
  const map = (xs: number[]) => xs.map((i) => (Number.isInteger(i) ? idAt(i) : undefined)).filter((x): x is string => !!x);
  const a = map(sv.a);
  const b = map(sv.b);
  if (a.length === 0 || b.length === 0) return null;
  const pick = (i: number, ids: string[]) => { const id = Number.isInteger(i) ? idAt(i) : undefined; return id && ids.includes(id) ? id : ids[ids.length - 1] ?? null; };
  return { dir: sv.dir, a, b, aActive: pick(sv.aActive, a), bActive: pick(sv.bActive, b), focus: sv.focus === 'b' ? 'b' : 'a' };
}
