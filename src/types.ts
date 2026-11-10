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
  ahead?: number;
  behind?: number;
  hasUpstream?: boolean;
  locked?: boolean;
  hasRemote?: boolean;
  changes: GitChange[];
}

export interface GithubProfile {
  login: string;
  name: string;
  avatarUrl: string;
}

export interface GithubAuthStatus {
  connected: boolean;
  profile: GithubProfile | null;
  hasClientId: boolean;
  canStoreToken: boolean;
}

export type GithubAuthEvent =
  | { state: 'connected'; profile: GithubProfile; stored?: boolean }
  | { state: 'disconnected' }
  | { state: 'error'; error: string };

export interface GithubRepoInfo {
  available: boolean;
  error?: string;
  fullName?: string;
  url?: string;
  stars?: number;
  openIssues?: number;
  runs?: { id: number; name: string; status: string; conclusion: string | null; url: string; branch: string }[];
  pulls?: { number: number; title: string; url: string; author?: string }[];
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
  quitApp: () => Promise<void>;
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
  onFileChanged: (callback: (data: { filename: string; rootPath: string; changed?: string[] }) => void) => () => void;
  termStart: (shell: 'powershell' | 'cmd', cwd: string) => Promise<{ success: boolean; error?: string; shell?: string }>;
  termInput: (shell: 'powershell' | 'cmd', line: string) => Promise<{ success: boolean; error?: string }>;
  termStop: (shell: 'powershell' | 'cmd') => Promise<{ success: boolean }>;
  onTermOutput: (callback: (data: { shell: 'powershell' | 'cmd'; text: string; stream?: 'stdout' | 'stderr' }) => void) => () => void;
  onTermExit: (callback: (data: { shell: 'powershell' | 'cmd'; code: number | null }) => void) => () => void;
  onTermCwd: (callback: (data: { shell: 'powershell' | 'cmd'; cwd: string }) => void) => () => void;
  gitFetch: (repoPath: string) => Promise<{ success: boolean; stdout?: string; stderr?: string }>;
  github: {
    status: () => Promise<GithubAuthStatus>;
    login: () => Promise<{ success: boolean; error?: string; userCode?: string; verificationUri?: string; expiresIn?: number }>;
    cancel: () => Promise<{ success: boolean }>;
    logout: () => Promise<{ success: boolean }>;
    repoInfo: (repoPath: string) => Promise<GithubRepoInfo>;
    openExternal: (url: string) => Promise<{ success: boolean }>;
    onAuth: (callback: (event: GithubAuthEvent) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronBridge;
  }
  // vite.config.ts içinde package.json'dan enjekte edilir
  const __APP_VERSION__: string;
}
