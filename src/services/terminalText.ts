// Terminal metin yardımcıları: ANSI renk ayrıştırma ve komut satırı renklendirme.
// Çıktı HTML'e çevrilmez; React span'lerine dönüşür, bu yüzden XSS yüzeyi yoktur.

export interface Span {
  text: string;
  color?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

// 16 renk CSS değişkenlerindedir (style.css: --ansi-N); koyu ve açık temada farklı değer alır.
const BASE16 = Array.from({ length: 16 }, (_, i) => `var(--ansi-${i})`);

function color256(n: number): string | undefined {
  if (n < 0 || n > 255) return undefined;
  if (n < 16) return BASE16[n];
  if (n >= 232) {
    const v = 8 + (n - 232) * 10;
    return `rgb(${v},${v},${v})`;
  }
  const i = n - 16;
  const lv = (x: number) => (x === 0 ? 0 : 55 + x * 40);
  return `rgb(${lv(Math.floor(i / 36))},${lv(Math.floor((i % 36) / 6))},${lv(i % 6)})`;
}

const ESC = '\u001b';
// CSI (renk dahil) ve OSC dizileri
const TOKEN = new RegExp(`${ESC}\\[([0-9;:?]*)([ -/]*)([@-~])|${ESC}\\][^\\u0007${ESC}]*(?:\\u0007|${ESC}\\\\)?|${ESC}[()][A-Z0-9]|${ESC}[=>]`, 'g');

export function parseAnsi(input: string): Span[] {
  const text = input.replace(/\r\n/g, '\n').replace(/\r/g, '');
  const spans: Span[] = [];
  let style: Omit<Span, 'text'> = {};
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;

  const push = (chunk: string) => {
    if (chunk) spans.push({ text: chunk, ...style });
  };

  while ((m = TOKEN.exec(text))) {
    push(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[3] !== 'm') continue; // renk dışı kaçış dizisi: yok say
    const codes = (m[1] || '0').split(/[;:]/).map((x) => (x === '' ? 0 : Number(x)));
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) style = {};
      else if (c === 1) style = { ...style, bold: true };
      else if (c === 2) style = { ...style, dim: true };
      else if (c === 3) style = { ...style, italic: true };
      else if (c === 4) style = { ...style, underline: true };
      else if (c === 22) style = { ...style, bold: false, dim: false };
      else if (c === 23) style = { ...style, italic: false };
      else if (c === 24) style = { ...style, underline: false };
      else if (c >= 30 && c <= 37) style = { ...style, color: BASE16[c - 30] };
      else if (c >= 90 && c <= 97) style = { ...style, color: BASE16[c - 90 + 8] };
      else if (c === 39) style = { ...style, color: undefined };
      else if (c >= 40 && c <= 47) style = { ...style, bg: BASE16[c - 40] };
      else if (c >= 100 && c <= 107) style = { ...style, bg: BASE16[c - 100 + 8] };
      else if (c === 49) style = { ...style, bg: undefined };
      else if (c === 38 || c === 48) {
        const key = c === 38 ? 'color' : 'bg';
        if (codes[i + 1] === 5) {
          style = { ...style, [key]: color256(codes[i + 2]) };
          i += 2;
        } else if (codes[i + 1] === 2) {
          const [r, g, b] = [codes[i + 2], codes[i + 3], codes[i + 4]].map((v) => Math.min(255, Math.max(0, v || 0)));
          style = { ...style, [key]: `rgb(${r},${g},${b})` };
          i += 4;
        }
      }
    }
  }
  push(text.slice(last));
  // Kalan yalnız ESC karakterlerini temizle
  return spans.map((s) => ({ ...s, text: s.text.split(ESC).join('') }));
}

// ---- Komut satırı renklendirme (giriş alanı ve geçmiş) ----
export type TokenKind = 'command' | 'flag' | 'string' | 'variable' | 'operator' | 'number' | 'text' | 'space';

export const TOKEN_COLOR: Record<TokenKind, string | undefined> = {
  command: 'var(--ansi-2)',
  flag: 'var(--ansi-3)',
  string: 'var(--ansi-11)',
  variable: 'var(--ansi-6)',
  operator: 'var(--ansi-5)',
  number: 'var(--ansi-11)',
  text: undefined,
  space: undefined
};

// Geçmişe yazılan komut yankısı için aynı renklerin ANSI 16-renk karşılığı
const TOKEN_ANSI: Partial<Record<TokenKind, number>> = {
  command: 2,
  flag: 3,
  string: 11,
  variable: 6,
  operator: 5,
  number: 11
};

export interface CmdToken {
  text: string;
  kind: TokenKind;
}

export function tokenizeCommand(line: string, shell: 'powershell' | 'cmd'): CmdToken[] {
  const tokens: CmdToken[] = [];
  const re = /(\s+)|("(?:[^"\\]|\\.)*"?|'[^']*'?)|(\$[\w:{}.]+|%[^%\s]+%)|([|;&<>]+)|(--?[A-Za-z][\w-]*|\/[A-Za-z?](?=\s|$|:))|(\d+(?:\.\d+)?)|([^\s|;&<>"']+)/g;
  let expectCommand = true;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) tokens.push({ text: m[1], kind: 'space' });
    else if (m[2]) { tokens.push({ text: m[2], kind: 'string' }); expectCommand = false; }
    else if (m[3]) { tokens.push({ text: m[3], kind: 'variable' }); expectCommand = false; }
    else if (m[4]) { tokens.push({ text: m[4], kind: 'operator' }); expectCommand = /[|;&]/.test(m[4]); }
    else if (m[5] && !(shell === 'cmd' && expectCommand)) { tokens.push({ text: m[5], kind: 'flag' }); expectCommand = false; }
    else if (m[6] && !expectCommand) tokens.push({ text: m[6], kind: 'number' });
    else {
      tokens.push({ text: m[5] || m[6] || m[7], kind: expectCommand ? 'command' : 'text' });
      expectCommand = false;
    }
  }
  return tokens;
}

// Geçmişe yazılacak komut yankısı için aynı renkleri ANSI olarak üretir.
export function commandToAnsi(line: string, shell: 'powershell' | 'cmd'): string {
  return tokenizeCommand(line, shell)
    .map((t) => {
      const n = TOKEN_ANSI[t.kind];
      return n === undefined ? t.text : `${ESC}[38;5;${n}m${t.text}${ESC}[0m`;
    })
    .join('');
}

// Windows yolunu ve kullanıcı klasörünü kısaltmadan, ama taşmayı önlemek için ortadan kırpar.
export function shortenPath(p: string, max = 48): string {
  if (p.length <= max) return p;
  const head = p.slice(0, 12);
  return `${head}…${p.slice(-(max - 13))}`;
}
