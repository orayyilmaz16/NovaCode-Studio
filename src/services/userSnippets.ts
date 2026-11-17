// Kullanıcı snippet'leri (F-06): ana süreçten doğrulanmış liste alınır, Monaco'ya tek bir tamamlama sağlayıcısı olarak kaydedilir.
// Monaco örneği @monaco-editor/react yükleyicisinden alınır (EditorArea'ya dokunmadan); liste değişince reloadSnippets() çağrılır.
import { loader } from '@monaco-editor/react';
import type * as MonacoNS from 'monaco-editor';
import type { UserSnippet } from '../types';

let list: UserSnippet[] = [];
let registered = false;

const ALIAS: Record<string, string> = { js: 'javascript', ts: 'typescript', py: 'python', md: 'markdown', sh: 'shell', yml: 'yaml', rs: 'rust', cs: 'csharp', rb: 'ruby' };
export const normalizeSnippetLang = (l: string) => ALIAS[l.toLowerCase()] ?? l.toLowerCase();

/** Dile uyan snippet'ler (dil belirtilmemişse her dilde). */
export function snippetsFor(lang: string, all: UserSnippet[] = list): UserSnippet[] {
  return all.filter((s) => !s.language || normalizeSnippetLang(s.language) === lang);
}

async function register() {
  if (registered) return;
  registered = true;
  const m = (await loader.init()) as typeof MonacoNS;
  m.languages.registerCompletionItemProvider('*', {
    provideCompletionItems(model, position) {
      const hits = snippetsFor(model.getLanguageId());
      if (!hits.length) return { suggestions: [] };
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      return {
        suggestions: hits.flatMap((s) =>
          s.prefix.map((p) => ({
            label: { label: p, description: s.name },
            kind: m.languages.CompletionItemKind.Snippet,
            insertText: s.body,
            insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: s.description || s.name,
            documentation: { value: '```\n' + s.body.slice(0, 600) + '\n```' },
            range,
            sortText: '0_' + p
          }))
        )
      };
    }
  });
}

/** Snippet dosyalarını yeniden okur (klasör değişince / kaydedilince). Hata sessizdir: snippet'ler isteğe bağlıdır. */
export async function reloadSnippets(): Promise<void> {
  const api = window.electronAPI?.snippets;
  if (!api) return;
  try {
    const res = await api.load();
    list = Array.isArray(res?.snippets) ? res.snippets : [];
    if (list.length) await register();
  } catch {
    list = [];
  }
}
