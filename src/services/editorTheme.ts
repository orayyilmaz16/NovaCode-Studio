// Monaco teması: VS Code "Dark Modern" ile uyumlu, düz ve sakin renkler.
// Monaco türü kasıtlı olarak gevşek tutuldu (@monaco-editor/react'in beforeMount parametresi).
type MonacoLike = {
  editor: {
    defineTheme: (name: string, data: unknown) => void;
  };
};

export const NOVA_DARK = 'nova-dark';

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
      'editor.selectionBackground': '#264f78',
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
      'editorSuggestWidget.selectedBackground': '#04395e',
      'editorHoverWidget.background': '#202020',
      'editorHoverWidget.border': '#2b2b2b',
      'minimap.background': '#1f1f1f',
      'scrollbarSlider.background': '#79797966',
      'scrollbarSlider.hoverBackground': '#646464b3',
      'scrollbarSlider.activeBackground': '#bfbfbf66',
      'input.background': '#313131',
      'focusBorder': '#0078d4'
    }
  });
}
