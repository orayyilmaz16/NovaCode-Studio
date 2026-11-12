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

export interface GitFile {
  path: string;
  orig?: string;
  index: string; // sahnelenmiş durum harfi ('' = yok)
  worktree: string; // çalışma ağacı durum harfi ('' = yok, 'U' = izlenmiyor)
  untracked: boolean;
  conflict: boolean;
}

export interface GitCommitInfo {
  hash: string;
  author: string;
  when: string;
  subject: string;
}

export interface GitResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  step?: string;
  pulled?: number;
  pushed?: number;
}

export interface GitStatus {
  isRepo: boolean;
  branch?: string;
  ahead?: number;
  behind?: number;
  hasUpstream?: boolean;
  locked?: boolean;
  detached?: boolean;
  files?: GitFile[];
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
  defaultBranch?: string;
  url?: string;
  stars?: number;
  openIssues?: number;
  runs?: { id: number; name: string; status: string; conclusion: string | null; url: string; branch: string }[];
  pulls?: { number: number; title: string; url: string; author?: string }[];
}

export interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'none' | 'downloading' | 'ready' | 'error' | 'unsupported';
  current: string;
  latest: string;
  notes: string;
  percent: number;
  transferred: number;
  total: number;
  speed: number;
  error: '' | 'network' | 'no-release' | 'checksum' | 'failed';
  checkedAt: number;
  supported: boolean;
  /** 'stable' = kurulu uygulama (gerçek güncelleme); 'dev' = kaynaktan çalışan sürüm (yalnız yayınla karşılaştırır). */
  channel: 'stable' | 'dev';
  releaseUrl: string;
}

export interface ReleaseInfo {
  version: string;
  name: string;
  date: string;
  notes: string;
  url: string;
}

export type SecretKey = 'collabToken' | 'aiKey_anthropic' | 'aiKey_openai';

export interface SearchHit {
  path: string;
  rel: string;
  line: number;
  text: string;
}

export type AiProvider = 'builtin' | 'anthropic' | 'openai' | 'ollama';

export interface LlmModelInfo {
  id: string;
  label: string;
  tier: 'fast' | 'strong';
  size: number;
  ramGb: number;
  installed: boolean;
  downloading: boolean;
  received: number;
}
export interface LlmProgress {
  id: string;
  received: number;
  total: number;
  done?: boolean;
  error?: 'cancelled' | 'failed';
}

export interface AiRunRequest {
  runId: string;
  provider: AiProvider;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
  mode: 'ask' | 'agent';
  lang: string;
  autoApproveEdits?: boolean;
  allowCommands?: boolean;
  useProject?: boolean;
  messages: { role: 'user' | 'assistant'; text: string; images?: { mediaType: string; data: string }[] }[];
}

export type AiEvent = { runId: string } & (
  | { type: 'text'; text: string }
  | { type: 'tool'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; id: string; ok: boolean; text: string }
  | { type: 'approval'; id: string; tool: string; summary: string; preview: string }
  | { type: 'done'; usage?: { in: number; out: number }; changed?: string[]; cancelled?: boolean }
  | { type: 'error'; error: string }
);

export interface ElectronBridge {
  isElectron: boolean;
  versions: { electron: string; chrome: string; node: string };
  ui: { setZoom: (factor: number) => void; setTheme: (mode: 'dark' | 'light') => Promise<{ success: boolean }> };
  secrets: {
    get: (key: SecretKey) => Promise<{ value: string } | { error: string }>;
    set: (key: SecretKey, value: string) => Promise<{ success: boolean; error?: string }>;
  };
  search: {
    files: () => Promise<{ root: string; files: string[] }>;
    text: (opts: { query: string; regex?: boolean; caseSensitive?: boolean }) => Promise<{ results: SearchHit[]; truncated: boolean; error?: string }>;
  };
  update: {
    state: () => Promise<UpdateState>;
    check: (opts?: { autoDownload?: boolean }) => Promise<UpdateState>;
    download: () => Promise<UpdateState>;
    install: () => Promise<{ success: boolean }>;
    releases: () => Promise<{ success: boolean; error?: string; releases: ReleaseInfo[] }>;
    onState: (callback: (s: UpdateState) => void) => () => void;
  };
  openLink: (url: string) => Promise<{ success: boolean }>;
  revealInFolder: (target: string) => Promise<{ success: boolean }>;
  llm: {
    status: () => Promise<{ defaultId: string; models: LlmModelInfo[] }>;
    download: (id: string) => Promise<{ success: boolean; error?: string }>;
    cancel: (id: string) => Promise<{ success: boolean }>;
    remove: (id: string) => Promise<{ success: boolean }>;
    onProgress: (callback: (p: LlmProgress) => void) => () => void;
  };
  ext: {
    search: (opts: { query: string; category?: 'Themes' | ''; offset?: number }) => Promise<{ success: boolean; total: number; items: import('./services/extensionsService').StoreItem[]; error?: string }>;
    list: () => Promise<import('./services/extensionsService').InstalledExt[]>;
    details: (namespace: string, name: string) => Promise<{ success: boolean; error?: string; details?: import('./services/extensionsService').ExtDetails }>;
    install: (namespace: string, name: string) => Promise<{ success: boolean; error?: string; partial?: boolean }>;
    uninstall: (id: string) => Promise<{ success: boolean }>;
    checkUpdates: () => Promise<{ id: string; latest: string }[]>;
  };
  ai: {
    run: (req: AiRunRequest) => Promise<{ success: boolean; error?: string }>;
    cancel: (runId: string) => Promise<{ success: boolean }>;
    approve: (runId: string, id: string, allow: boolean) => Promise<{ success: boolean }>;
    transcribe: (req: { audio: ArrayBuffer; mime: string; lang?: string; model?: string; baseUrl?: string }) => Promise<{ success: boolean; text?: string; error?: string }>;
    commands: () => Promise<{ name: string; template: string }[]>;
    ollamaModels: (baseUrl?: string) => Promise<{ running: boolean; models: string[] }>;
    onEvent: (callback: (ev: AiEvent) => void) => () => void;
  };
  quitApp: () => Promise<void>;
  platform?: string;
  windowControls?: {
    minimize: () => Promise<void>;
    toggleMaximize: () => Promise<boolean>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximized: (cb: (maximized: boolean) => void) => () => void;
  };
  openFolderDialog: () => Promise<{ rootPath: string; rootName: string; tree: FileItem[] } | { error: string } | null>;
  recentFolders: () => Promise<{ path: string; name: string }[]>;
  openRecentFolder: (folderPath: string) => Promise<{ rootPath: string; rootName: string; tree: FileItem[] } | { error: string }>;
  openFileDialog: () => Promise<FileItem[]>;
  readDirectory: (dirPath: string) => Promise<FileItem[]>;
  readFile: (filePath: string) => Promise<string>;
  readDataUrl: (filePath: string) => Promise<{ success: boolean; dataUrl?: string; error?: string }>;
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
  termStart: (shell: 'powershell' | 'cmd', cwd: string, id: string) => Promise<{ success: boolean; error?: string; shell?: string; reused?: boolean }>;
  termInput: (id: string, line: string) => Promise<{ success: boolean; error?: string }>;
  termStop: (id: string) => Promise<{ success: boolean }>;
  onTermOutput: (callback: (data: { id: string; shell: 'powershell' | 'cmd'; text: string; stream?: 'stdout' | 'stderr' }) => void) => () => void;
  onTermExit: (callback: (data: { id: string; shell: 'powershell' | 'cmd'; code: number | null }) => void) => () => void;
  onTermCwd: (callback: (data: { id: string; shell: 'powershell' | 'cmd'; cwd: string }) => void) => () => void;
  gitFetch: (repoPath: string) => Promise<GitResult>;
  gitStage: (repoPath: string, paths: string[]) => Promise<GitResult>;
  gitStageAll: (repoPath: string) => Promise<GitResult>;
  gitUnstage: (repoPath: string, paths: string[]) => Promise<GitResult>;
  gitDiscard: (repoPath: string, files: { path: string; untracked: boolean }[]) => Promise<GitResult>;
  gitSync: (repoPath: string) => Promise<GitResult>;
  gitBranches: (repoPath: string) => Promise<{ success: boolean; branches: string[]; current: string }>;
  gitCheckout: (repoPath: string, name: string) => Promise<GitResult>;
  gitCreateBranch: (repoPath: string, name: string) => Promise<GitResult>;
  gitLog: (repoPath: string) => Promise<{ success: boolean; commits: GitCommitInfo[] }>;
  gitInit: (repoPath: string) => Promise<GitResult>;
  onGitChanged: (callback: (data: { rootPath: string }) => void) => () => void;
  github: {
    status: () => Promise<GithubAuthStatus>;
    login: () => Promise<{ success: boolean; error?: string; userCode?: string; verificationUri?: string; expiresIn?: number }>;
    cancel: () => Promise<{ success: boolean }>;
    logout: () => Promise<{ success: boolean }>;
    repoInfo: (repoPath: string) => Promise<GithubRepoInfo>;
    createPr: (repoPath: string, input: { title: string; body?: string; draft?: boolean }) => Promise<{ success: boolean; url?: string; number?: number; error?: string; detail?: string }>;
    publishRepo: (repoPath: string, input: { name: string; isPrivate: boolean }) => Promise<{ success: boolean; url?: string; error?: string; detail?: string }>;
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
