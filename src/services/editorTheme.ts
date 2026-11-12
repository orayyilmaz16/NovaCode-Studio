// Monaco teması: VS Code "Dark Modern" ile uyumlu, düz ve sakin renkler.
// Monaco türü kasıtlı olarak gevşek tutuldu (@monaco-editor/react'in beforeMount parametresi).
type MonacoLike = {
  editor: {
    defineTheme: (name: string, data: unknown) => void;
  };
};

export const NOVA_DARK = 'nova-dark';
export const NOVA_LIGHT = 'nova-light';

export function defineNovaThemes(monaco: MonacoLike) {
  monaco.editor.defineTheme(NOVA_DARK, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' }
    ],
    colors: {
      'editor.background': '#1f1f1f',
      'editor.foreground': '#cccccc',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#cccccc',
      'editor.lineHighlightBackground': '#282828',
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': '#3b4080',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorCursor.foreground': '#aeafad',
      'editorIndentGuide.background1': '#404040',
      'editorIndentGuide.activeBackground1': '#707070',
      'editorWhitespace.foreground': '#3b3b3b',
      'editorGutter.background': '#1f1f1f',
      'editorWidget.background': '#202020',
      'editorWidget.border': '#2b2b2b',
      'editorSuggestWidget.background': '#202020',
      'editorSuggestWidget.border': '#2b2b2b',
      'editorSuggestWidget.selectedBackground': '#2c2f6b',
      'editorHoverWidget.background': '#202020',
      'editorHoverWidget.border': '#2b2b2b',
      'minimap.background': '#1f1f1f',
      'scrollbarSlider.background': '#79797966',
      'scrollbarSlider.hoverBackground': '#646464b3',
      'scrollbarSlider.activeBackground': '#bfbfbf66',
      'input.background': '#313131',
      'focusBorder': '#6d75f5'
    }
  });

  monaco.editor.defineTheme(NOVA_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A8F55', fontStyle: 'italic' },
      { token: 'keyword', foreground: '9b3fb0' },
      { token: 'string', foreground: 'b4552d' },
      { token: 'number', foreground: '3f7d3a' },
      { token: 'type', foreground: '1f7a6a' },
      { token: 'function', foreground: '7a5f12' },
      { token: 'variable', foreground: '1f5fa8' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#3b3b3b',
      'editorLineNumber.foreground': '#9a9a9a',
      'editorLineNumber.activeForeground': '#3b3b3b',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': '#cfd4ff',
      'editor.inactiveSelectionBackground': '#e4e6ff',
      'editorCursor.foreground': '#3b3b3b',
      'editorIndentGuide.background1': '#e3e3e3',
      'editorIndentGuide.activeBackground1': '#b5b5b5',
      'editorWhitespace.foreground': '#d4d4d4',
      'editorGutter.background': '#ffffff',
      'editorWidget.background': '#f8f8f8',
      'editorWidget.border': '#e2e2e2',
      'editorSuggestWidget.background': '#f8f8f8',
      'editorSuggestWidget.border': '#e2e2e2',
      'editorSuggestWidget.selectedBackground': '#dfe1ff',
      'editorHoverWidget.background': '#f8f8f8',
      'editorHoverWidget.border': '#e2e2e2',
      'minimap.background': '#ffffff',
      'scrollbarSlider.background': '#64646466',
      'scrollbarSlider.hoverBackground': '#646464b3',
      'scrollbarSlider.activeBackground': '#00000066',
      'input.background': '#ececec',
      'focusBorder': '#5359e0'
    }
  });
}
