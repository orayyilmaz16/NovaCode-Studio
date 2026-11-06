export interface FileItem {
  id: string;
  name: string;
  path?: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileItem[];
  isOpen?: boolean;
  isModified?: boolean;
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  text: string;
  time: string;
}

export interface GitChange {
  code: string;
  file: string;
}

export interface GitStatus {
  isRepo: boolean;
  branch?: string;
  changes: GitChange[];
}

export interface Snippet {
  id: string;
  label: string;
  prefix: string;
  description: string;
  language: string;
  body: string;
}

export interface ElectronBridge {
  isElectron: boolean;
  openFolderDialog: () => Promise<{ rootPath: string; rootName: string; tree: FileItem[] } | { error: string } | null>;
  openFileDialog: () => Promise<FileItem[]>;
  readDirectory: (dirPath: string) => Promise<FileItem[]>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  createFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  createFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
  renameItem: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
  getGitStatus: (repoPath: string) => Promise<GitStatus>;
  gitCommit: (repoPath: string, message: string) => Promise<{ success: boolean; stdout?: string; stderr?: string }>;
  gitPush: (repoPath: string) => Promise<{ success: boolean; stdout?: string; stderr?: string }>;
  gitPull: (repoPath: string) => Promise<{ success: boolean; stdout?: string; stderr?: string }>;
  onFileChanged: (callback: (data: { filename: string; rootPath: string }) => void) => void;
  termStart: (shell: 'powershell' | 'cmd', cwd: string) => Promise<{ success: boolean; error?: string; shell?: string }>;
  termInput: (line: string) => Promise<{ success: boolean; error?: string }>;
  termStop: () => Promise<{ success: boolean }>;
  onTermOutput: (callback: (text: string) => void) => void;
  onTermExit: (callback: (code: number | null) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronBridge;
  }
}
