import { getDebugState, samePath, subscribeDebug, toggleBreakpoint } from './debugStore';

// Monaco düzenleyicisini hata ayıklama durumuna bağlar: gutter'a tıklayınca kesme noktası, F9, durulan satır vurgusu.
// Düzenleyici içeriğine veya temasına dokunmaz; yalnız kenar boşluğu (glyph margin) ve dekorasyon ekler.
const F9 = 67; // monaco.KeyCode.F9
const GUTTER_GLYPH_MARGIN = 2; // monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN

type Ed = {
  updateOptions: (o: Record<string, unknown>) => void;
  createDecorationsCollection: () => { set: (d: unknown[]) => void; clear: () => void };
  onMouseDown: (cb: (e: { target?: { type?: number; position?: { lineNumber: number } | null } }) => void) => { dispose: () => void };
  addAction: (a: unknown) => { dispose: () => void };
  revealLineInCenterIfOutsideViewport: (line: number) => void;
};

export function bindDebugEditor(editor: unknown, filePath: string): () => void {
  const ed = editor as Ed;
  ed.updateOptions({ glyphMargin: true });
  const deco = ed.createDecorationsCollection();
  let lastLoc = '';

  const render = () => {
    const s = getDebugState();
    const list: unknown[] = [];
    const bpFile = Object.keys(s.breakpoints).find((f) => samePath(f, filePath));
    const ver = new Set(Object.entries(s.verified).find(([f]) => samePath(f, filePath))?.[1] ?? []);
    for (const line of bpFile ? s.breakpoints[bpFile] : []) {
      list.push({
        range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
        options: { glyphMarginClassName: s.status !== 'idle' && !ver.has(line) ? 'dbg-bp dbg-bp-unverified' : 'dbg-bp' }
      });
    }
    if (s.status === 'paused' && s.location && samePath(s.location.file, filePath)) {
      const l = s.location.line;
      list.push({
        range: { startLineNumber: l, startColumn: 1, endLineNumber: l, endColumn: 1 },
        options: { isWholeLine: true, className: 'dbg-line', glyphMarginClassName: 'dbg-arrow' }
      });
      const key = `${s.location.file}:${l}`;
      if (key !== lastLoc) { lastLoc = key; ed.revealLineInCenterIfOutsideViewport(l); }
    } else lastLoc = '';
    deco.set(list);
  };

  const off = subscribeDebug(render);
  render();
  const mouse = ed.onMouseDown((e) => {
    if (e.target?.type === GUTTER_GLYPH_MARGIN && e.target.position) toggleBreakpoint(filePath, e.target.position.lineNumber);
  });
  const action = ed.addAction({
    id: 'nova.toggleBreakpoint',
    label: 'Toggle Breakpoint',
    keybindings: [F9],
    run: (e: { getPosition: () => { lineNumber: number } | null }) => { const p = e.getPosition(); if (p) toggleBreakpoint(filePath, p.lineNumber); }
  });
  return () => { off(); mouse.dispose(); action.dispose(); deco.clear(); };
}
