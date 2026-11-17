// Renk temaları (uygulama yüzeyleri + Monaco): her tema koyu ya da açık bir moda bağlıdır.
// Yüzey değişkenleri (zinc-*, nv-*) bu tablodan türetilir ve <html> üzerine satır içi yazılır (SettingsContext.applyAppearance);
// "auto" seçiliyse hiçbir şey yazılmaz, style.css'teki Nova Dark/Light geçerli olur. Vurgu rengi ayrıdır (ACCENTS) ve tema üzerine biner.
// Yeni tema = PALETTES'e kayıt + şemada seçenek + i18n (pal_<id>). Ayrıntı: docs/brain/actions/settings.md → Renk temaları.

export type PaletteMode = 'dark' | 'light';

export interface PaletteSeed {
  mode: PaletteMode;
  /** Editör zemini (ana yüzey) */
  editor: string;
  /** Kenar çubuğu / panel zemini */
  side: string;
  /** Gövde metni (zinc-300 karşılığı) */
  fg: string;
  /** Temanın kendi vurgusu (Monaco odak/imleç; arayüz vurgusu kullanıcı ayarından gelir) */
  accent: string;
  tokens: { comment: string; keyword: string; string: string; number: string; type: string; fn: string; variable: string };
}

export const PALETTES: Record<string, PaletteSeed> = {
  midnight: {
    mode: 'dark', editor: '#0f1626', side: '#0b111e', fg: '#c9d4ea', accent: '#5aa2ff',
    tokens: { comment: '5c7599', keyword: 'c792ea', string: 'ecc48d', number: 'f78c6c', type: '7fdbca', fn: '82aaff', variable: 'd6deeb' }
  },
  forest: {
    mode: 'dark', editor: '#16201b', side: '#111915', fg: '#cfe0d4', accent: '#4fbf8a',
    tokens: { comment: '6b8a73', keyword: 'e08fb2', string: 'e5c07b', number: 'd19a66', type: '56c2b0', fn: 'a6d189', variable: 'bfe3cf' }
  },
  orchid: {
    mode: 'dark', editor: '#1c1a2b', side: '#151422', fg: '#d6d2ee', accent: '#a78bfa',
    tokens: { comment: '6e6a96', keyword: 'f283c0', string: 'f2cf8b', number: 'bd93f9', type: '7dd3fc', fn: '86efac', variable: 'e4e0ff' }
  },
  ember: {
    mode: 'dark', editor: '#211a17', side: '#1a1412', fg: '#e4d6cc', accent: '#f59e42',
    tokens: { comment: '8a7466', keyword: 'e5855d', string: 'c9b86b', number: 'd9a066', type: '7cb7a5', fn: 'e6c07b', variable: 'efd9c5' }
  },
  atlas: {
    mode: 'dark', editor: '#21252b', side: '#1b1e23', fg: '#b9c0cc', accent: '#61afef',
    tokens: { comment: '7f8a9c', keyword: 'c678dd', string: '98c379', number: 'd19a66', type: 'e5c07b', fn: '61afef', variable: 'e06c75' }
  },
  ink: {
    mode: 'dark', editor: '#000000', side: '#080808', fg: '#d0d0d0', accent: '#7c8cff',
    tokens: { comment: '6a7280', keyword: 'c586c0', string: 'ce9178', number: 'b5cea8', type: '4ec9b0', fn: 'dcdcaa', variable: '9cdcfe' }
  },
  paper: {
    mode: 'light', editor: '#fbf7ee', side: '#f3eee2', fg: '#433d33', accent: '#b5651d',
    tokens: { comment: '8f8672', keyword: 'a33b7a', string: '9c5a1c', number: '6f7d1a', type: '1f7a68', fn: '8a6a10', variable: '2f5f8f' }
  },
  mist: {
    mode: 'light', editor: '#f6f8fc', side: '#edf1f8', fg: '#2f3a4d', accent: '#2f6fe0',
    tokens: { comment: '7d8aa3', keyword: '7a42c9', string: 'b35a2a', number: '1d7a55', type: '0e7490', fn: '9a6a05', variable: '1f5fa8' }
  },
  mint: {
    mode: 'light', editor: '#f4faf6', side: '#e9f3ed', fg: '#2c3f35', accent: '#1f9d63',
    tokens: { comment: '7a9285', keyword: '8a3fa0', string: 'b0562a', number: '2f7d32', type: '11776b', fn: '8a6d10', variable: '2a6592' }
  },
  rose: {
    mode: 'light', editor: '#fdf5f7', side: '#f7eaee', fg: '#46303a', accent: '#d6336c',
    tokens: { comment: '9a7f8a', keyword: 'b0245f', string: 'a1581d', number: '5b7f1f', type: '1c7a7a', fn: '8a5f10', variable: '5a46b0' }
  }
};

export const PALETTE_IDS = Object.keys(PALETTES);
export const getPalette = (id: unknown): PaletteSeed | null => (typeof id === 'string' && PALETTES[id]) || null;
/** Monaco tema kimliği */
export const paletteEditorTheme = (id: string) => `nova-${id}`;

// ---------- Renk yardımcıları (sRGB karışımı) ----------
const toRgb = (h: string): [number, number, number] => {
  const x = h.replace('#', '');
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
};
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
/** a'dan b'ye t oranında (0–1) karıştırır */
export const mix = (a: string, b: string, t: number) => {
  const A = toRgb(a), B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};

// Nova Dark / Light ölçeğinden çıkarılan oranlar: zemin→gövde metni arası 800…400, metinden beyaza/siyaha 200…50
const DARK_T = { 800: 0.07, 700: 0.17, 600: 0.34, 500: 0.59, 400: 0.73 };
const LIGHT_T = { 800: 0.13, 700: 0.24, 600: 0.48, 500: 0.74, 400: 0.85 };
const DARK_X = { 200: 0.15, 100: 0.53, 50: 0.86 }; // fg → beyaz
const LIGHT_X = { 200: 0.27, 100: 0.47, 50: 0.71 }; // fg → siyah

/** <html> üzerine yazılacak CSS değişkenleri (anahtar: tam değişken adı). */
export function paletteVars(p: PaletteSeed): Record<string, string> {
  const dark = p.mode === 'dark';
  const T = dark ? DARK_T : LIGHT_T;
  const X = dark ? DARK_X : LIGHT_X;
  const end = dark ? '#ffffff' : '#000000';
  const v: Record<string, string> = {
    '--color-zinc-950': p.side,
    '--color-zinc-900': dark ? p.editor : mix(p.side, p.fg, 0.03),
    '--color-zinc-800': mix(p.editor, p.fg, T[800]),
    '--color-zinc-700': mix(p.editor, p.fg, T[700]),
    '--color-zinc-600': mix(p.editor, p.fg, T[600]),
    '--color-zinc-500': mix(p.editor, p.fg, T[500]),
    '--color-zinc-400': mix(p.editor, p.fg, T[400]),
    '--color-zinc-300': p.fg,
    '--color-zinc-200': mix(p.fg, end, X[200]),
    '--color-zinc-100': mix(p.fg, end, X[100]),
    '--color-zinc-50': mix(p.fg, end, X[50]),
    '--color-nv-editor': p.editor,
    '--color-nv-side': p.side,
    '--color-nv-input': mix(p.editor, p.fg, dark ? 0.1 : 0.07),
    '--color-nv-hover': mix(p.editor, p.fg, dark ? 0.1 : 0.07),
    '--color-nv-border': mix(p.editor, p.fg, dark ? 0.09 : 0.12),
    // Seçim kullanıcının vurgusunu izler (vurgu değişince seçim rengi de değişir)
    '--selection': `color-mix(in srgb, var(--color-indigo-500) ${dark ? 36 : 26}%, ${p.editor})`
  };
  return v;
}
export const PALETTE_VAR_KEYS = Object.keys(paletteVars(PALETTES.midnight));

// ---------- Monaco ----------
type MonacoLike = { editor: { defineTheme: (name: string, data: unknown) => void } };

export function definePaletteThemes(monaco: MonacoLike) {
  for (const [id, p] of Object.entries(PALETTES)) {
    const dark = p.mode === 'dark';
    const vars = paletteVars(p);
    const tk = p.tokens;
    const sel = mix(p.editor, p.accent, dark ? 0.32 : 0.2);
    monaco.editor.defineTheme(paletteEditorTheme(id), {
      base: dark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: tk.comment, fontStyle: 'italic' },
        { token: 'keyword', foreground: tk.keyword },
        { token: 'string', foreground: tk.string },
        { token: 'number', foreground: tk.number },
        { token: 'type', foreground: tk.type },
        { token: 'function', foreground: tk.fn },
        { token: 'variable', foreground: tk.variable }
      ],
      colors: {
        'editor.background': p.editor,
        'editor.foreground': p.fg,
        'editorLineNumber.foreground': vars['--color-zinc-500'],
        'editorLineNumber.activeForeground': p.fg,
        'editor.lineHighlightBackground': mix(p.editor, p.fg, dark ? 0.05 : 0.04),
        'editor.lineHighlightBorder': '#00000000',
        'editor.selectionBackground': sel,
        'editor.inactiveSelectionBackground': mix(p.editor, p.accent, dark ? 0.16 : 0.1),
        'editorCursor.foreground': dark ? mix(p.fg, '#ffffff', 0.2) : p.fg,
        'editorIndentGuide.background1': mix(p.editor, p.fg, dark ? 0.12 : 0.1),
        'editorIndentGuide.activeBackground1': mix(p.editor, p.fg, dark ? 0.4 : 0.35),
        'editorWhitespace.foreground': mix(p.editor, p.fg, dark ? 0.12 : 0.1),
        'editorGutter.background': p.editor,
        'editorWidget.background': p.side,
        'editorWidget.border': vars['--color-nv-border'],
        'editorSuggestWidget.background': p.side,
        'editorSuggestWidget.border': vars['--color-nv-border'],
        'editorSuggestWidget.selectedBackground': mix(p.side, p.accent, dark ? 0.28 : 0.18),
        'editorHoverWidget.background': p.side,
        'editorHoverWidget.border': vars['--color-nv-border'],
        'minimap.background': p.editor,
        'scrollbarSlider.background': dark ? '#79797966' : '#64646466',
        'scrollbarSlider.hoverBackground': '#646464b3',
        'scrollbarSlider.activeBackground': dark ? '#bfbfbf66' : '#00000066',
        'input.background': vars['--color-nv-input'],
        focusBorder: p.accent
      }
    });
  }
}
