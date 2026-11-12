import { useSyncExternalStore } from 'react';
import type * as MonacoNS from 'monaco-editor';

// Sorunlar (hata/uyarı) deposu: Monaco'nun tüm işaretçilerini (TS/JSON/CSS dil hizmetleri + dil sunucuları) toplar.
// Durum çubuğu sayacı, Sorunlar sekmesi, sekme/dosya ağacı renkleri ve editördeki kırmızı satır çizgisi buradan beslenir.
// Monaco çalışma zamanı içe aktarılmaz (yalnız tip): örnek EditorArea'dan verilir.
type Monaco = typeof MonacoNS;

export type Sev = 'error' | 'warning' | 'info' | 'hint';
export interface Problem {
  path: string;
  name: string;
  severity: Sev;
  message: string;
  line: number;
  col: number;
  source?: string;
  code?: string;
}
export interface ProblemSummary {
  errors: number;
  warnings: number;
  infos: number;
  items: Problem[];
  /** Normalleştirilmiş yol (küçük harf, /) → dosya ve üst klasörlerdeki hata/uyarı sayısı */
  byPath: Record<string, { e: number; w: number }>;
}

const EMPTY: ProblemSummary = { errors: 0, warnings: 0, infos: 0, items: [], byPath: {} };
let snapshot: ProblemSummary = EMPTY;
const listeners = new Set<() => void>();
let monaco: Monaco | null = null;
let timer: number | undefined;

export const normPath = (p: string) => p.split('\\').join('/').toLowerCase();
const sevOf = (s: number): Sev => (s >= 8 ? 'error' : s >= 4 ? 'warning' : s >= 2 ? 'info' : 'hint');
const baseName = (p: string) => p.slice(Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\')) + 1);

function compute() {
  if (!monaco) return;
  const items: Problem[] = [];
  const byPath: Record<string, { e: number; w: number }> = {};
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const m of monaco.editor.getModelMarkers({})) {
    if (m.resource.scheme !== 'file') continue; // fark/adsız modeller sayılmaz
    const severity = sevOf(m.severity);
    if (severity === 'hint') continue;
    const path = m.resource.fsPath;
    items.push({
      path, name: baseName(path), severity, message: m.message, line: m.startLineNumber, col: m.startColumn,
      source: m.source, code: m.code ? String(typeof m.code === 'object' ? (m.code as { value: string }).value : m.code) : undefined
    });
    if (severity === 'error') errors++;
    else if (severity === 'warning') warnings++;
    else infos++;
    if (severity === 'info') continue;
    // Dosya + tüm üst klasörler (ağaçta klasör de renklenir)
    const parts = normPath(path).split('/');
    for (let i = 1; i <= parts.length; i++) {
      const key = parts.slice(0, i).join('/');
      const cur = (byPath[key] ??= { e: 0, w: 0 });
      if (severity === 'error') cur.e++;
      else cur.w++;
    }
  }
  items.sort((a, b) => (a.severity === b.severity ? a.path.localeCompare(b.path) || a.line - b.line : a.severity === 'error' ? -1 : b.severity === 'error' ? 1 : a.severity === 'warning' ? -1 : 1));
  const same = snapshot.errors === errors && snapshot.warnings === warnings && snapshot.infos === infos &&
    snapshot.items.length === items.length && snapshot.items.every((x, i) => x.path === items[i].path && x.line === items[i].line && x.col === items[i].col && x.message === items[i].message && x.severity === items[i].severity);
  if (same) return;
  snapshot = { errors, warnings, infos, items, byPath };
  listeners.forEach((l) => l());
}

const schedule = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(compute, 150);
};

export const getProblems = () => snapshot;
export const subscribeProblems = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useProblems = () => useSyncExternalStore(subscribeProblems, getProblems, getProblems);

let setupDone = false;
/** Monaco hazır olunca bir kez çağrılır: işaretçi dinleyicisini kurar ve TS/JS için gürültülü (yanlış pozitif) tanıları kısar. */
export function setProblemsMonaco(m: unknown) {
  monaco = m as Monaco;
  if (setupDone) return;
  setupDone = true;
  monaco.editor.onDidChangeMarkers(schedule);
  // Monaco'nun TS çalışanı node_modules türlerini bilmez: "modül bulunamadı" gibi tanılar gerçek hata değildir, sayaçta gürültü yaratır.
  const anyM = monaco as unknown as { typescript?: Record<string, unknown>; languages?: { typescript?: Record<string, unknown> } };
  const ts = (anyM.typescript?.typescriptDefaults ? anyM.typescript : anyM.languages?.typescript) as
    | { typescriptDefaults: TsDefaults; javascriptDefaults: TsDefaults; JsxEmit?: { ReactJSX: number }; ScriptTarget?: { ESNext: number }; ModuleResolutionKind?: { NodeJs: number }; ModuleKind?: { ESNext: number } }
    | undefined;
  if (!ts?.typescriptDefaults) return;
  const ignore = [2307, 2792, 7016, 2688, 2580, 2591, 2875, 7026, 2503, 2318];
  ts.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false, noSyntaxValidation: false, diagnosticCodesToIgnore: ignore });
  const opts = {
    target: ts.ScriptTarget?.ESNext, module: ts.ModuleKind?.ESNext, moduleResolution: ts.ModuleResolutionKind?.NodeJs,
    jsx: ts.JsxEmit?.ReactJSX, allowNonTsExtensions: true, allowJs: true, esModuleInterop: true, skipLibCheck: true, noEmit: true
  };
  ts.typescriptDefaults.setCompilerOptions(opts);
  ts.javascriptDefaults.setCompilerOptions(opts);
  schedule();
}
interface TsDefaults {
  setDiagnosticsOptions: (o: { noSemanticValidation?: boolean; noSyntaxValidation?: boolean; diagnosticCodesToIgnore?: number[] }) => void;
  setCompilerOptions: (o: Record<string, unknown>) => void;
}

/**
 * Etkin editörde hatalı satırları kırmızı (uyarılı satırları sarı) çizgi + hafif zeminle işaretler.
 * Dalgalı alt çizgi ve taşma çubuğu Monaco'nun kendisindendir; bu yalnız satır düzeyi ek görünümdür.
 */
export function bindProblemDecorations(editor: unknown): () => void {
  const ed = editor as MonacoNS.editor.IStandaloneCodeEditor;
  const m = monaco;
  if (!ed || !m) return () => {};
  const col = ed.createDecorationsCollection();
  const apply = () => {
    const model = ed.getModel();
    if (!model) return;
    const lines = new Map<number, 'error' | 'warning'>();
    for (const mk of m.editor.getModelMarkers({ resource: model.uri })) {
      const s = sevOf(mk.severity);
      if (s !== 'error' && s !== 'warning') continue;
      for (let l = mk.startLineNumber; l <= Math.min(mk.endLineNumber, mk.startLineNumber + 20); l++) {
        if (lines.get(l) !== 'error') lines.set(l, s);
      }
    }
    col.set([...lines].map(([l, s]) => ({
      range: new m.Range(l, 1, l, 1),
      options: { isWholeLine: true, className: s === 'error' ? 'nova-err-line' : 'nova-warn-line', linesDecorationsClassName: s === 'error' ? 'nova-err-bar' : 'nova-warn-bar' }
    })));
  };
  const sub = m.editor.onDidChangeMarkers(() => apply());
  apply();
  return () => { sub.dispose(); col.clear(); };
}
