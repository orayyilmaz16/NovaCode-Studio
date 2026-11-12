import { useSyncExternalStore } from 'react';
import type { DebugEvent, DebugFrame } from '../types';

// Hata ayıklama durumu: basit bir dış depo (React dışından da okunur/yazılır). Kesme noktaları çalışma klasörüne göre yerelde saklanır.
// Ana süreçle konuşan tek yer burasıdır; panel ve editör bağlantısı yalnız bu depoyu kullanır.
export interface ConsoleLine { id: number; kind: 'stdout' | 'stderr' | 'info' | 'eval' | 'error'; text: string }
export interface DebugState {
  status: 'idle' | 'starting' | 'running' | 'paused';
  file: string | null;
  frames: DebugFrame[];
  frameId: string | null;
  reason: string;
  /** Durulan yer (editörde vurgulanır). */
  location: { file: string; line: number } | null;
  lines: ConsoleLine[];
  /** Dosya (mutlak yol) -> satırlar. */
  breakpoints: Record<string, number[]>;
  verified: Record<string, number[]>;
}

const EMPTY: DebugState = { status: 'idle', file: null, frames: [], frameId: null, reason: '', location: null, lines: [], breakpoints: {}, verified: {} };
let state: DebugState = EMPTY;
const listeners = new Set<() => void>();
let root: string | null = null;
let lineId = 0;
let subscribed = false;
let locationHandler: ((file: string, line: number) => void) | null = null;

const api = () => window.electronAPI?.debug;
const set = (patch: Partial<DebugState>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
export const getDebugState = () => state;
export const subscribeDebug = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useDebug = () => useSyncExternalStore(subscribeDebug, getDebugState, getDebugState);

/** Windows yolları büyük/küçük harf ve ayraçtan bağımsız karşılaştırılır. */
export const pathKey = (p: string) => p.replace(/\\/g, '/').toLowerCase();
export const samePath = (a: string | null | undefined, b: string | null | undefined) => !!a && !!b && pathKey(a) === pathKey(b);
export const isDebuggable = (name?: string | null) => !!name && /\.(c|m)?js$/i.test(name);

const STORE_KEY = 'nova.debug.bps.v1';
const loadBps = (r: string): Record<string, number[]> => {
  try { return (JSON.parse(localStorage.getItem(STORE_KEY) || '{}') as Record<string, Record<string, number[]>>)[r] ?? {}; } catch { return {}; }
};
const saveBps = () => {
  if (!root) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') as Record<string, Record<string, number[]>>;
    all[root] = state.breakpoints;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch { /* depolama kapalı */ }
};

const log = (kind: ConsoleLine['kind'], text: string) => {
  const next = [...state.lines, { id: ++lineId, kind, text }];
  set({ lines: next.length > 1000 ? next.slice(-1000) : next });
};

function onEvent(ev: DebugEvent) {
  if (ev.type === 'started') set({ status: 'running', file: ev.file });
  else if (ev.type === 'paused') {
    const top = ev.frames.find((f) => f.file) ?? null;
    set({ status: 'paused', frames: ev.frames, frameId: ev.frames[0]?.id ?? null, reason: ev.reason, location: top ? { file: top.file as string, line: top.line } : null });
    if (top) locationHandler?.(top.file as string, top.line);
  } else if (ev.type === 'resumed') set({ status: 'running', frames: [], frameId: null, location: null });
  else if (ev.type === 'bpVerified') {
    const cur = state.verified[ev.file] ?? [];
    if (!cur.includes(ev.line)) set({ verified: { ...state.verified, [ev.file]: [...cur, ev.line] } });
  }
  else if (ev.type === 'output') log(ev.stream, ev.text.replace(/\n$/, ''));
  else if (ev.type === 'exited') { log('info', `exit:${ev.code}`); set({ status: 'idle', file: null, frames: [], frameId: null, location: null, verified: {} }); }
  else if (ev.type === 'error') log('error', ev.message);
}

/** Çalışma klasörü değişince çağrılır: kesme noktaları o klasörün kayıtlarından yüklenir ve ana sürece bildirilir. */
export function initDebug(rootPath: string | null) {
  const d = api();
  if (!subscribed && d) { d.onEvent(onEvent); subscribed = true; }
  if (rootPath === root) return;
  if (root && state.status !== 'idle') void d?.stop();
  root = rootPath;
  const bps = rootPath ? loadBps(rootPath) : {};
  set({ ...EMPTY, lines: [], breakpoints: bps });
  for (const [file, lines] of Object.entries(bps)) void d?.setBreakpoints(file, lines);
}

export function setLocationHandler(h: ((file: string, line: number) => void) | null) { locationHandler = h; }

async function syncBps(file: string) {
  const d = api();
  const lines = state.breakpoints[file] ?? [];
  const r = await d?.setBreakpoints(file, lines);
  if (r?.success && r.breakpoints) set({ verified: { ...state.verified, [file]: r.breakpoints.filter((b) => b.verified).map((b) => b.line) } });
}

export function toggleBreakpoint(file: string, line: number) {
  const key = Object.keys(state.breakpoints).find((f) => samePath(f, file)) ?? file;
  const cur = state.breakpoints[key] ?? [];
  const next = cur.includes(line) ? cur.filter((l) => l !== line) : [...cur, line].sort((a, b) => a - b);
  const bps = { ...state.breakpoints };
  if (next.length) bps[key] = next; else delete bps[key];
  set({ breakpoints: bps });
  saveBps();
  void syncBps(key);
}

export function clearBreakpoints() {
  const files = Object.keys(state.breakpoints);
  set({ breakpoints: {}, verified: {} });
  saveBps();
  for (const f of files) void api()?.setBreakpoints(f, []);
}

export async function startDebug(file: string) {
  const d = api();
  if (!d || state.status !== 'idle') return;
  set({ status: 'starting', lines: [], frames: [], location: null });
  const r = await d.start({ file });
  if (!r.success) { log('error', r.error === 'invalid-file' ? 'invalid-file' : String(r.error ?? 'error')); set({ status: 'idle' }); return; }
  for (const f of Object.keys(state.breakpoints)) void syncBps(f);
}

export const stopDebug = () => api()?.stop();
export const resumeDebug = () => api()?.resume();
export const stepOver = () => api()?.stepOver();
export const stepInto = () => api()?.stepInto();
export const stepOut = () => api()?.stepOut();
export const pauseDebug = () => api()?.pause();

export function selectFrame(id: string) {
  const f = state.frames.find((x) => x.id === id);
  set({ frameId: id, location: f?.file ? { file: f.file, line: f.line } : state.location });
  if (f?.file) locationHandler?.(f.file, f.line);
}

export async function evalExpr(expr: string) {
  const d = api();
  if (!d || !expr.trim()) return;
  log('eval', `> ${expr}`);
  const r = await d.evaluate(expr, state.status === 'paused' ? state.frameId : null);
  if (!r.success) log('error', String(r.error ?? 'error'));
  else if (r.error) log('error', r.error);
  else log('eval', String(r.value));
}
