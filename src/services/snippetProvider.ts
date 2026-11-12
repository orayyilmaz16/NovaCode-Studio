// Monaco otomatik tamamlamasına snippet'leri bağlar: kullanıcının özel snippet'leri + (isteğe bağlı) hazır snippet'ler.
// Kaynak ayarlardan canlı güncellenir; sağlayıcı tek sefer, tüm dillere kaydedilir.
import type { Monaco } from '@monaco-editor/react';
import { builtInSnippets } from '../snippets/defaultSnippets';
import type { Snippet } from '../types';

interface Source {
  user: Snippet[];
  includeBuiltIn: boolean;
}

let source: Source = { user: [], includeBuiltIn: true };
let registered = false;
let extSnippets: Snippet[] = []; // yüklü eklentilerden gelen snippet'ler (Monaco sözdizimi)

export function setExtensionSnippets(list: Snippet[]) {
  extSnippets = list;
}

export function setSnippetSource(next: Source) {
  source = next;
}

// Hazır snippet gövdeleri düz koddur: Monaco snippet sözdiziminde özel olan \ $ } karakterleri kaçırılır.
const escapeBody = (body: string) => body.replace(/[\\$}]/g, '\\$&');

export function registerSnippetProvider(monaco: Monaco) {
  if (registered) return;
  registered = true;
  const ids = new Set<string>(monaco.languages.getLanguages().map((l: { id: string }) => l.id));
  for (const id of ids) {
    monaco.languages.registerCompletionItemProvider(id, {
      provideCompletionItems(model, position) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const lang = model.getLanguageId();
        const all: { s: Snippet; raw: boolean }[] = [
          ...source.user.map((s) => ({ s, raw: false })), // özel snippet'ler Monaco sözdizimini (\$1, \${1:ad}) kullanır
          ...extSnippets.map((s) => ({ s, raw: false })),
          ...(source.includeBuiltIn ? builtInSnippets.map((s) => ({ s, raw: true })) : [])
        ];
        return {
          suggestions: all
            .filter(({ s }) => s.language === '*' || s.language === lang)
            .map(({ s, raw }) => ({
              label: s.prefix,
              kind: monaco.languages.CompletionItemKind.Snippet,
              detail: s.description || s.label,
              documentation: { value: '```\n' + s.body.slice(0, 600) + '\n```' },
              insertText: raw ? escapeBody(s.body) : s.body,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              sortText: raw ? `z_${s.prefix}` : `a_${s.prefix}` // özel snippet'ler öne
            }))
        };
      }
    });
  }
}
