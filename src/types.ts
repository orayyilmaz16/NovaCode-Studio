export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileItem[];
  isOpen?: boolean;
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  text: string;
  time: string;
}

export interface ThemeConfig {
  name: string;
  id: string;
  monacoTheme: string;
}
