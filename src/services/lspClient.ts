import type * as MonacoNS from 'monaco-editor';
import { samePath } from './debugStore';
import { setLspEntry, setLspStateByName } from './lspStore';

// Dil sunucusu (LSP) istemcisi: Monaco'nun yerleşik hizmeti olmayan diller için tanılama, tamamlama, üzerine gelme ve tanıma git.
// Ana süreç (electron-lsp.cjs) sunucuyu yönetir; burası belge senkronu yapar ve Monaco sağlayıcılarını kaydeder.
// Monaco çalışma zamanı burada içe aktarılmaz (yalnız tip): örnek EditorArea'dan verilir.
type Monaco = typeof MonacoNS;
type Pos = { line: number; character: number };
interface Entry { model: MonacoNS.editor.ITextModel; lang: string; path: string; version: number; timer: number | undefined }

/** Monaco dil kimlikleri: ana süreçteki izinli sunucu tablosuyla aynı kümeler. */
export const LSP_LANGS = new Set(['python', 'rust', 'go', 'c', 'cpp', 'csharp', 'php', 'ruby', 'lua', 'yaml']);

let monaco: Monaco | null = null;
const registered = new Set<string>();
const open = new Map<string, Entry>(); // model kimliği -> belge
let wired = false;
let openerSet = false;

export const setLspMonaco = (m: unknown) => { monaco = m as Monaco; };
const api = () => window.electronAPI?.lsp;
const SEV: Record<number, number> = { 1: 8, 2: 4, 3: 2, 4: 1 }; // LSP -> monaco.MarkerSeverity (Error, Warning, Info, Hint)

const KIND: Record<number, string> = {
  1: 'Text', 2: 'Method', 3: 'Function', 4: 'Constructor', 5: 'Field', 6: 'Variable', 7: 'Class', 8: 'Interface', 9: 'Module', 10: 'Property',
  11: 'Unit', 12: 'Value', 13: 'Enum', 14: 'Keyword', 15: 'Snippet', 16: 'Color', 17: 'File', 18: 'Reference', 19: 'Folder', 20: 'EnumMember',
  21: 'Constant', 22: 'Struct', 23: 'Event', 24: 'Operator', 25: 'TypeParameter'
};

const md = (c: unknown): string => {
  if (!c) return '';
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map(md).filter(Boolean).join('\n\n');
  const o = c as { value?: string; language?: string };
  return o.language ? '```' + o.language + '\n' + (o.value ?? '') + '\n```' : o.value ?? '';
};

function wire() {
  if (wired) return;
  wired = true;
  api()?.onEvent((ev) => {
    if (ev.type === 'state') { setLspStateByName(ev.name, ev.state === 'ready' ? 'ready' : ev.state === 'starting' ? 'starting' : 'error'); return; }
    if (ev.type !== 'diagnostics' || !monaco) return;
    for (const e of open.values()) {
      if (!samePath(e.path, ev.path)) continue;
      monaco.editor.setModelMarkers(e.model, 'nova-lsp', ev.diagnostics.map((d) => ({
        severity: SEV[d.severity ?? 1] ?? 8,
        message: d.message,
        startLineNumber: d.range.start.line + 1, startColumn: d.range.start.character + 1,
        endLineNumber: d.range.end.line + 1, endColumn: d.range.end.character + 1,
        source: d.source,
        code: d.code !== undefined ? String(typeof d.code === 'object' ? (d.code as { value?: string }).value : d.code) : undefined
      })));
    }
  });
  // Başka dosyadaki tanıma gidilince (Monaco'nun o dosya için modeli yoktur) dosyayı uygulamanın kendi açıcısıyla aç
  if (monaco && !openerSet) {
    openerSet = true;
    monaco.editor.registerEditorOpener({
      openCodeEditor(_src, resource, sel) {
        const line = sel && 'startLineNumber' in sel ? sel.startLineNumber : sel && 'lineNumber' in sel ? sel.lineNumber : undefined;
        window.dispatchEvent(new CustomEvent('nova:open-file', { detail: { path: resource.fsPath, line } }));
        return true;
      }
    });
  }
}

const find = (model: MonacoNS.editor.ITextModel) => open.get(model.id);

/** Bekleyen değişiklikleri hemen gönderir (tamamlama/üzerine gelme güncel metinle sorulmalı). */
function send(e: Entry) {
  e.version += 1;
  void api()?.notify(e.lang, 'textDocument/didChange', e.path, { textDocument: { version: e.version }, contentChanges: [{ text: e.model.getValue() }] });
}
function flush(e: Entry) {
  if (e.timer === undefined) return;
  window.clearTimeout(e.timer);
  e.timer = undefined;
  send(e);
}

function registerProviders(lang: string, triggers: string[]) {
  if (!monaco || registered.has(lang)) return;
  registered.add(lang);
  const m = monaco;
  const ask = async (model: MonacoNS.editor.ITextModel, method: string, params: unknown) => {
    const e = find(model);
    if (!e) return null;
    flush(e);
    const r = await api()?.request(e.lang, method, e.path, params);
    return r && r.success ? r.result : null;
  };

  m.languages.registerCompletionItemProvider(lang, {
    triggerCharacters: triggers,
    async provideCompletionItems(model, position, ctx) {
      const res = (await ask(model, 'textDocument/completion', {
        position: { line: position.lineNumber - 1, character: position.column - 1 },
        context: { triggerKind: ctx.triggerKind + 1, triggerCharacter: ctx.triggerCharacter }
      })) as { items?: Record<string, unknown>[] } | Record<string, unknown>[] | null;
      const items = Array.isArray(res) ? res : res?.items ?? [];
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      return {
        suggestions: items.slice(0, 300).map((it) => {
          const label = String(it.label ?? '');
          const te = it.textEdit as { newText?: string } | undefined;
          return {
            label,
            kind: (m.languages.CompletionItemKind as unknown as Record<string, number>)[KIND[Number(it.kind)] ?? 'Text'] ?? m.languages.CompletionItemKind.Text,
            insertText: te?.newText ?? String(it.insertText ?? label),
            insertTextRules: it.insertTextFormat === 2 ? m.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            detail: it.detail ? String(it.detail) : undefined,
            documentation: it.documentation ? { value: md(it.documentation) } : undefined,
            sortText: it.sortText ? String(it.sortText) : undefined,
            filterText: it.filterText ? String(it.filterText) : undefined,
            range
          };
        })
      };
    }
  });

  m.languages.registerHoverProvider(lang, {
    async provideHover(model, position) {
      const res = (await ask(model, 'textDocument/hover', { position: { line: position.lineNumber - 1, character: position.column - 1 } })) as { contents?: unknown } | null;
      const text = md(res?.contents);
      return text ? { contents: [{ value: text }] } : null;
    }
  });

  m.languages.registerDefinitionProvider(lang, {
    async provideDefinition(model, position) {
      const res = (await ask(model, 'textDocument/definition', { position: { line: position.lineNumber - 1, character: position.column - 1 } })) as { path: string; range: { start: Pos; end: Pos } }[] | null;
      return (res ?? []).map((l) => ({
        uri: m.Uri.file(l.path),
        range: { startLineNumber: l.range.start.line + 1, startColumn: l.range.start.character + 1, endLineNumber: l.range.end.line + 1, endColumn: l.range.end.character + 1 }
      }));
    }
  });
}

/** Etkin belgeyi dil sunucusuna bağlar; dönen işlev bağlantıyı keser (didClose, tanıları temizler). */
export function bindLsp(editor: unknown, filePath: string, enabled: boolean): () => void {
  const a = api();
  const ed = editor as MonacoNS.editor.IStandaloneCodeEditor;
  const model = ed?.getModel?.();
  if (!a || !monaco || !model || !enabled) return () => {};
  const lang = model.getLanguageId();
  if (!LSP_LANGS.has(lang)) return () => {};
  wire();

  let disposed = false;
  let entry: Entry | null = null;
  let sub: MonacoNS.IDisposable | null = null;

  void (async () => {
    const st = await a.status(lang);
    if (disposed || !st.supported || !st.name) return;
    if (!st.available) { setLspEntry(lang, { name: st.name, state: 'missing', hint: st.hint }); return; }
    setLspEntry(lang, { name: st.name, state: st.state === 'ready' ? 'ready' : 'starting', hint: st.hint });
    const r = await a.start(lang);
    if (disposed) return;
    if (!r.success) { setLspEntry(lang, { name: st.name, state: r.error === 'missing' ? 'missing' : 'error', hint: st.hint }); return; }
    setLspEntry(lang, { name: st.name, state: 'ready', hint: st.hint });
    registerProviders(lang, r.triggers ?? []);
    const e: Entry = { model, lang, path: filePath, version: 1, timer: undefined };
    entry = e;
    open.set(model.id, e);
    await a.notify(lang, 'textDocument/didOpen', filePath, { textDocument: { languageId: lang, version: 1, text: model.getValue() } });
    sub = model.onDidChangeContent(() => {
      if (e.timer !== undefined) window.clearTimeout(e.timer);
      e.timer = window.setTimeout(() => { e.timer = undefined; send(e); }, 250);
    });
  })();

  return () => {
    disposed = true;
    sub?.dispose();
    if (entry) {
      const e = entry;
      if (e.timer !== undefined) window.clearTimeout(e.timer);
      open.delete(model.id);
      void a.notify(e.lang, 'textDocument/didClose', e.path, { textDocument: {} });
      monaco?.editor.setModelMarkers(model, 'nova-lsp', []);
    }
  };
}
