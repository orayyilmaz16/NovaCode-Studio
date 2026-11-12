// Etkin Monaco düzenleyicisine köprü: komut paleti, yapay zekâ ve snippet ekleme düzenleyiciye buradan ulaşır.
// Düzenleyici EditorArea içinde kaydedilir; yoksa işlevler sessizce boş döner.
type Ed = {
  getModel: () => { getValueInRange: (r: unknown) => string; getLanguageId: () => string } | null;
  getSelection: () => (unknown & { isEmpty: () => boolean }) | null;
  getPosition: () => { lineNumber: number; column: number } | null;
  executeEdits: (src: string, edits: unknown[]) => boolean;
  revealLineInCenter: (line: number) => void;
  setPosition: (p: { lineNumber: number; column: number }) => void;
  focus: () => void;
  trigger: (src: string, id: string, payload?: unknown) => void;
  getContribution: (id: string) => { insert?: (tpl: string) => void } | null;
  getAction?: (id: string) => { run: () => Promise<void> } | null;
};

let editor: Ed | null = null;

export function setActiveEditor(ed: unknown) {
  editor = (ed as Ed) || null;
}

export function getSelectedText(): string {
  try {
    const sel = editor?.getSelection();
    if (!editor || !sel || sel.isEmpty()) return '';
    return (editor.getModel()?.getValueInRange(sel) ?? '').slice(0, 20000);
  } catch {
    return '';
  }
}

/** Seçimi (yoksa imleç konumunu) verilen metinle değiştirir. */
export function replaceSelection(text: string): boolean {
  if (!editor) return false;
  try {
    const sel = editor.getSelection();
    if (!sel) return false;
    editor.executeEdits('nova-ai', [{ range: sel, text, forceMoveMarkers: true }]);
    editor.focus();
    return true;
  } catch {
    return false;
  }
}

/** Monaco snippet sözdizimiyle imlece ekler ($1, ${1:ad}). */
export function insertSnippetAtCursor(template: string): boolean {
  if (!editor) return false;
  try {
    editor.focus();
    const ctl = editor.getContribution('snippetController2');
    if (ctl?.insert) { ctl.insert(template); return true; }
  } catch { /* düz eklemeye düş */ }
  return replaceSelection(template.replace(/\$\{\d+:([^}]*)\}|\$\d+/g, (_m, d) => d ?? ''));
}

export function goToLine(line: number) {
  if (!editor || !Number.isFinite(line)) return;
  const p = { lineNumber: Math.max(1, Math.floor(line)), column: 1 };
  editor.setPosition(p);
  editor.revealLineInCenter(p.lineNumber);
  editor.focus();
}

/** Monaco eylemi çalıştırır (ör. 'editor.action.quickOutline', 'editor.action.formatDocument'). */
export function runEditorAction(id: string) {
  if (!editor) return;
  try {
    editor.focus();
    void editor.getAction?.(id)?.run();
  } catch { /* eylem yok */ }
}

export const hasEditor = () => !!editor;
