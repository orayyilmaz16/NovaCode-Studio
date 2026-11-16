// AI tamamlama önerisinin dile ve imlece göre şekillendirilmesi (saf mantık, Monaco/React bağımsız;
// test: scripts/tests/completion-shape.test.cjs). Model ham metin döndürür; burada editörün kurallarına uydurulur:
// girinti (sekme/boşluk), kapsam sonu (süslü parantez / Python girintisi), sonraki kodla çakışan kapanışlar.

export type SuggestLength = 'line' | 'block' | 'long';

export interface ShapeOpts {
  languageId?: string;
  tabSize?: number;
  insertSpaces?: boolean;
  /** İmleç satırının girinti genişliği (sütun); girinti tabanlı dillerde kapsam sonunu bulmak için */
  baseIndent?: number;
  /** İmleçten sonraki ilk boş olmayan satır (aynı satırdaki kalan kısım hariç) */
  nextLine?: string;
}

/** Süslü parantezle kapsam belirleyen diller: öneri, açık kapsam kapanınca biter. */
export const BRACE_LANGS = new Set([
  'javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php',
  'swift', 'kotlin', 'scala', 'dart', 'css', 'scss', 'less', 'json', 'jsonc', 'groovy', 'objective-c', 'shaderlab', 'glsl', 'hlsl'
]);
/** Girintiyle kapsam belirleyen diller: öneri, imleç satırının girintisinin altına inince biter. */
export const INDENT_LANGS = new Set(['python', 'yaml', 'pug', 'coffeescript', 'sass', 'nim', 'haml', 'slim']);

const width = (ws: string, tabSize: number) => [...ws].reduce((n, c) => n + (c === '\t' ? tabSize : 1), 0);

/** İlk satır hariç her satırın başındaki girintiyi editörün ayarına çevirir (modelin sekme/boşluk tercihi ne olursa olsun). */
export function normalizeIndent(text: string, tabSize: number, insertSpaces: boolean): string {
  const ts = Math.max(1, Math.min(16, tabSize || 4));
  return text
    .split('\n')
    .map((ln, i) => {
      if (i === 0) return ln;
      const m = /^[ \t]+/.exec(ln);
      if (!m) return ln;
      const w = width(m[0], ts);
      const indent = insertSpaces ? ' '.repeat(w) : '\t'.repeat(Math.floor(w / ts)) + ' '.repeat(w % ts);
      return indent + ln.slice(m[0].length);
    })
    .join('\n');
}

/** Tek tırnağın DİZE açtığı diller (öbürlerinde ' yalnız karakter sabiti: 'x', '\n'; Rust ömrü 'a dize değildir). */
const SQ_STRING_LANGS = new Set(['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'php', 'css', 'scss', 'less', 'dart', 'ruby', 'python', 'shell', 'sql']);
/** Ters tırnağın (çok satırlı) dize açtığı diller. */
const BACKTICK_LANGS = new Set(['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'go']);

function findClose(text: string, i: number, q: string, multiline: boolean): number {
  let j = i + 1;
  while (j < text.length && text[j] !== q && (multiline || text[j] !== '\n')) j += text[j] === '\\' ? 2 : 1;
  return j < text.length && text[j] === q ? j : -1;
}

/** i konumunda dize/karakter sabiti başlıyorsa kapanış konumunu, değilse -1 döndürür. */
function skipString(text: string, i: number, lang: string): number {
  const c = text[i];
  if ((c === '"' || c === "'") && text.startsWith(c.repeat(3), i) && lang === 'python') {
    const k = text.indexOf(c.repeat(3), i + 3);
    return k < 0 ? -1 : k + 2;
  }
  if (c === '"') return findClose(text, i, '"', false);
  if (c === "'") {
    if (SQ_STRING_LANGS.has(lang)) return findClose(text, i, "'", false);
    const m = /^'(?:\\.|[^\\'\n])'/.exec(text.slice(i, i + 8));
    return m ? i + m[0].length - 1 : -1;
  }
  if (c === '`' && BACKTICK_LANGS.has(lang)) return findClose(text, i, '`', true);
  return -1;
}

/** Metindeki eşsiz (öneri içinde açılmamış) kapanış sayısı ve ilk eşsiz kapanışın konumu. Dize içindekiler sayılmaz. */
function scanBrackets(text: string, lang: string): { unmatched: number; firstAt: number } {
  let depth = 0;
  let unmatched = 0;
  let firstAt = -1;
  for (let i = 0; i < text.length; i++) {
    const end = skipString(text, i, lang);
    if (end >= 0) { i = end; continue; }
    const c = text[i];
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') {
      if (depth > 0) depth--;
      else { unmatched++; if (firstAt < 0) firstAt = i; }
    }
  }
  return { unmatched, firstAt };
}

/**
 * Süslü parantez dilleri: açık kapsamı kapatan ilk kapanıştan sonra (o satırın sonunda) keser; modelin sonraki
 * fonksiyonlara taşmasını önler. Metin içindeki parantezler (dize) sayılmaz.
 */
export function cutAtScopeEnd(text: string, lang = ''): string {
  const { firstAt } = scanBrackets(text, lang);
  if (firstAt < 0) return text;
  const eol = text.indexOf('\n', firstAt);
  return eol < 0 ? text : text.slice(0, eol);
}

/** Girinti dilleri: ilk satırdan sonra, tabandan daha az girintili ilk boş olmayan satırda keser. */
export function cutAtDedent(text: string, baseIndent: number, tabSize: number): string {
  const lines = text.split('\n');
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const ws = /^[ \t]*/.exec(lines[i])![0];
    if (width(ws, tabSize) < baseIndent) return lines.slice(0, i).join('\n');
  }
  return text;
}

const CLOSERS_ONLY = /^[)\]}>"'`;,:\s]+$/;
const CLOSER_LINE = /^[)\]}]+[;,)]*$/;

/**
 * Önerinin sonu zaten var olan kodu tekrar ediyorsa kırpar: satır ortasında (imleçten sonra kapanış var) son karakterler,
 * satır sonunda ise sonraki satırın kapanışını (ör. `}`) tekrar eden son satır. Öneride kendi eşi bulunan kapanışlara
 * (ör. `reduce(x)` içindeki `)`) dokunulmaz; yalnız eşsiz kapanışlar ve dengesiz tırnaklar kırpılır.
 */
export function trimSuffixOverlap(text: string, lineRest: string, nextLine = '', lang = ''): string {
  if (lineRest.trim()) {
    const spare = scanBrackets(text, lang).unmatched;
    for (let k = Math.min(lineRest.length, text.length); k >= 1; k--) {
      const tail = lineRest.slice(0, k);
      if (!CLOSERS_ONLY.test(tail) || !tail.trim() || !text.endsWith(tail)) continue;
      if ([...tail].filter((c) => ')]}'.includes(c)).length > spare) continue;
      // Tırnak: yalnız metinde tek (kapanmamış) ise tekrar sayılır
      const quotesOk = ['"', "'", '`'].every((q) => {
        const inTail = [...tail].filter((c) => c === q).length;
        return inTail === 0 || [...text].filter((c) => c === q).length % 2 === 1;
      });
      if (quotesOk) return text.slice(0, text.length - k);
    }
    return text;
  }
  const lines = text.split('\n');
  const last = lines[lines.length - 1].trim();
  if (lines.length > 1 && CLOSER_LINE.test(last) && last === nextLine.trim()) return lines.slice(0, -1).join('\n');
  if (lines.length === 1 && CLOSER_LINE.test(last) && last === nextLine.trim()) return '';
  return text;
}

/** Öneriyi seçilen biçime, imlece ve dile göre şekillendirir. */
export function shapeSuggestion(raw: string, length: SuggestLength, lineRest: string, opts: ShapeOpts = {}): string {
  let text = raw.replace(/\r/g, '').replace(/^```[a-z]*\n?|\n?```$/g, '');
  const lang = (opts.languageId || '').toLowerCase();
  const tabSize = opts.tabSize || 4;
  if (opts.insertSpaces !== undefined) text = normalizeIndent(text, tabSize, opts.insertSpaces);

  // Dile göre kapsam sonu: model bir sonraki fonksiyona/bloğa taşmasın
  if (BRACE_LANGS.has(lang)) text = cutAtScopeEnd(text, lang);
  else if (INDENT_LANGS.has(lang) && opts.baseIndent !== undefined) text = cutAtDedent(text, opts.baseIndent, tabSize);

  if (lineRest.trim()) {
    // İmleçten sonra aynı satırda kod varsa yalnız satır sonuna kadar öner (kodun ortasına blok eklemeyelim)
    text = text.split('\n')[0];
  } else if (length === 'line') {
    // Tek satır: model yeni satırda başlıyorsa (ör. `{` sonrası) o satırı al, fazlasını at
    const m = /^(\s*\n)?([^\n]*)/.exec(text)!;
    text = (m[1] || '') + m[2];
  } else {
    const maxLines = length === 'long' ? 24 : 8;
    const cut: string[] = [];
    for (const ln of text.split('\n')) {
      if (length === 'block' && cut.some((x) => x.trim()) && !ln.trim()) break;
      cut.push(ln);
      if (cut.length >= maxLines) break;
    }
    text = cut.join('\n');
  }
  text = text.replace(/\s+$/, '');
  return trimSuffixOverlap(text, lineRest, opts.nextLine, lang).replace(/\s+$/, '');
}

/** İmleç satırının girinti genişliği (sütun). */
export function indentWidth(line: string, tabSize: number): number {
  return width(/^[ \t]*/.exec(line)![0], Math.max(1, tabSize || 4));
}
