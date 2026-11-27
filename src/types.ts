/** Git farkı (salt okunur sekme): sol/sağ metin Monaco DiffEditor'da gösterilir. */
export interface DiffInfo {
  original: string;
  modified: string;
  /** Gerçek dosya yolu ("dosyayı aç" için); silinmişse bile adı korunur. */
  filePath: string;
  note?: 'binary' | 'tooLarge';
  /** Sekmeyi git durumu değişince yenilemek için kaynak istek (commit farkları sabittir, yenilenmez). */
  source?: { repo: string; path: string; orig?: string; staged?: boolean };
}

/** Kullanıcı snippet'i (ana süreçte doğrulanmış). */
export interface UserSnippet {
  name: string;
  prefix: string[];
  body: string;
  description: string;
  language?: string;
  scope?: 'workspace' | 'user';
}

/** Kayıtlı uzak sunucu (parola/parola cümlesi hiçbir yerde saklanmaz). */
export interface SshHost {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  auth: 'agent' | 'key' | 'password';
  keyName: string;
  root: string;
  connected: boolean;
}
export type SshHostInput = Partial<Pick<SshHost, 'id' | 'port' | 'root'>> & Pick<SshHost, 'name' | 'host' | 'user' | 'auth'> & { keyPath?: string };
export type SshEvent =
  | { type: 'hostkey'; reqId: string; host: string; port: number; fingerprint: string }
  | { type: 'hostkey-changed'; host: string; port: number; fingerprint: string; expected: string }
  | { type: 'disconnected'; id: string; reason: string };

export interface ReadFileFailure {
  success: false;
  error: 'file-too-large' | 'binary-file' | string;
  size?: number;
}

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
  /** Dosya diskten silindi/taşındı (açık sekme korunur; kaydedilirse yeniden oluşturulur). */
  missing?: boolean;
  /** Kaydedilmemiş düzenleme varken dosya diskte de değişti. */
  externalChange?: boolean;
  diff?: DiffInfo;
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
  refs?: string[];
  /** Commit zamanı (ms, UTC) */
  ts?: number;
  files?: number;
  added?: number;
  deleted?: number;
}

export interface GitCommitFile {
  status: string;
  path: string;
  orig?: string;
  /** Eklenen/silinen satır (ikili dosyada yok) */
  added?: number;
  deleted?: number;
  binary?: boolean;
}

export interface GitRefs {
  success: boolean;
  local: { name: string; hash: string; current: boolean; upstream?: string; subject?: string }[];
  remote: { name: string; hash: string; subject?: string }[];
  tags: { name: string; hash: string; subject?: string }[];
}

export interface GitDiffResult {
  success: boolean;
  stderr?: string;
  original?: string;
  modified?: string;
  binary?: boolean;
  tooLarge?: boolean;
}

export interface GitDiffRequest {
  path: string;
  orig?: string;
  staged?: boolean;
  ref?: string;
}

export interface GitStash {
  index: number;
  message: string;
  when: string;
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
  merging?: boolean;
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

export type SecretKey = 'collabToken';

/** Bul-değiştir isteği: 'preview' diske dokunmaz; 'apply' yalnız `selection` satırlarını değiştirir. */
export interface ReplaceOpts {
  mode: 'preview' | 'apply';
  query: string;
  replacement: string;
  regex?: boolean;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  id?: string;
  selection?: { path: string; lines: number[] }[];
}
export interface ReplaceHit { path: string; rel: string; line: number; before: string; after: string }
export interface ReplaceResult {
  results?: ReplaceHit[];
  truncated?: boolean;
  cancelled?: boolean;
  error?: string;
  success?: boolean;
  files?: number;
  lines?: number;
  skipped?: number;
  failed?: string[];
}

export interface SearchHit {
  path: string;
  rel: string;
  line: number;
  text: string;
}

export type AiProvider = 'ollama';


export interface LspDiagnostic {
  message: string;
  severity?: number;
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  source?: string;
  code?: string | number | { value: string };
}
export type LspEvent =
  | { type: 'diagnostics'; name: string; path: string; diagnostics: LspDiagnostic[] }
  | { type: 'state'; name: string; state: 'starting' | 'ready' | 'error' | 'stopped'; detail?: string };

export interface DebugVar { name: string; value: string; type: string; ref: string | null }
export interface DebugFrame { id: string; name: string; file: string | null; url: string; line: number; column: number }
export type DebugEvent =
  | { type: 'started'; file: string }
  | { type: 'paused'; reason: string; frames: DebugFrame[]; hit: number }
  | { type: 'resumed' }
  | { type: 'bpVerified'; file: string; line: number }
  | { type: 'output'; stream: 'stdout' | 'stderr'; text: string }
  | { type: 'exited'; code: number }
  | { type: 'error'; message: string };

export interface AiRunRequest {
  runId: string;
  provider: AiProvider;
  model: string;
  maxTokens?: number;
  mode: 'ask' | 'agent';
  lang: string;
  autoApproveEdits?: boolean;
  /** Otonom mod: güvenli derleme/test/lint komutları onaysız çalışır (motorda sıkı izin listesi). */
  autoSafeCommands?: boolean;
  autonomy?: 'ask' | 'edits' | 'auto';
  /** Ajanın bir görevde yapabileceği en çok araç turu (5–40). */
  maxSteps?: number;
  allowCommands?: boolean;
  useProject?: boolean;
  /** Düşünme seviyesi (hızlı / dengeli / derin): sıcaklık ve çalışma biçimini ayarlar. */
  thinking?: 'fast' | 'balanced' | 'deep';
  /** Moda özel kullanıcı yönergesi (en çok ~1500 karakter, sistem istemine eklenir). */
  instructions?: string;
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
    has: (key: SecretKey) => Promise<{ has: boolean } | { error: string }>;
    set: (key: SecretKey, value: string) => Promise<{ success: boolean; error?: string }>;
  };
  search: {
    files: () => Promise<{ root: string; files: string[] }>;
    text: (opts: { query: string; regex?: boolean; caseSensitive?: boolean; wholeWord?: boolean; id?: string }) => Promise<{ results: SearchHit[]; truncated: boolean; error?: string; cancelled?: boolean }>;
    cancel: (id: string) => Promise<{ success: boolean }>;
    replace: (opts: ReplaceOpts) => Promise<ReplaceResult>;
  };
  analytics: {
    status: () => Promise<{ configured: boolean; enabled: boolean; asked: boolean }>;
    setConsent: (on: boolean) => Promise<{ configured: boolean; enabled: boolean; asked: boolean }>;
    markAsked: () => Promise<{ configured: boolean; enabled: boolean; asked: boolean }>;
    payload: () => Promise<{ v: number; app: string; os: string; lang: string; counts: Record<string, number> } | null>;
    setLang: (lang: string) => void;
    track: (name: string) => void;
  };
  update: {
    state: () => Promise<UpdateState>;
    check: (opts?: { autoDownload?: boolean }) => Promise<UpdateState>;
    download: () => Promise<UpdateState>;
    install: () => Promise<{ success: boolean }>;
    releases: () => Promise<{ success: boolean; error?: string; releases: ReleaseInfo[] }>;
    runtimeLatest: () => Promise<{ success: boolean; supported: boolean; error?: string; electron?: string; chrome?: string; node?: string }>;
    onState: (callback: (s: UpdateState) => void) => () => void;
  };
  openLink: (url: string) => Promise<{ success: boolean }>;
  revealInFolder: (target: string) => Promise<{ success: boolean }>;
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
    whisperModels: () => Promise<{ default: string; models: { id: string; size: number }[] }>;
    transcribe: (req: { audio: ArrayBuffer; mime: string; lang?: string; model?: string }) => Promise<{ success: boolean; text?: string; error?: string }>;
    commands: () => Promise<{ name: string; template: string }[]>;
    complete: (req: { id: string; prefix: string; suffix: string; fileName?: string; languageId?: string; singleLine?: boolean; stopAtBlank?: boolean; lineMode?: boolean; model?: string; maxTokens?: number; temperature?: number; prefixChars?: number; suffixChars?: number; count?: number }) => Promise<{ success: boolean; text?: string; alternatives?: string[]; truncated?: boolean; error?: string; skipped?: string }>;
    completeCancel: (id: string) => Promise<{ success: boolean }>;
    completeWarm?: (model?: string) => Promise<{ success: boolean; error?: string }>;
    ollamaModels: (baseUrl?: string) => Promise<{ running: boolean; models: string[] }>;
    onEvent: (callback: (ev: AiEvent) => void) => () => void;
  };
  lsp?: {
    status: (lang: string) => Promise<{ supported: boolean; name?: string; available?: boolean; hint?: string; state?: string }>;
    start: (lang: string) => Promise<{ success: boolean; error?: string; name?: string; hint?: string; triggers?: string[]; signatureTriggers?: string[] }>;
    notify: (lang: string, method: string, path: string, params: unknown) => Promise<{ success: boolean; error?: string }>;
    request: (lang: string, method: string, path: string, params: unknown) => Promise<{ success: boolean; result?: unknown; error?: string }>;
    onEvent: (cb: (ev: LspEvent) => void) => () => void;
  };
  pty?: {
    available: () => Promise<{ available: boolean; gitBash?: boolean }>;
    /** Kurulu kabuk profilleri (PowerShell, CMD, Git Bash, WSL dağıtımları, Cygwin, MSYS2, Nushell…). */
    profiles: (force?: boolean) => Promise<{ id: string; label: string }[]>;
    start: (req: { id: string; shell: string; cwd: string; cols: number; rows: number }) => Promise<{ success: boolean; error?: string }>;
    write: (id: string, data: string) => Promise<{ success: boolean }>;
    resize: (id: string, cols: number, rows: number) => Promise<{ success: boolean }>;
    stop: (id: string) => Promise<{ success: boolean }>;
    onData: (cb: (m: { id: string; data: string }) => void) => () => void;
    onExit: (cb: (m: { id: string; code: number | null }) => void) => () => void;
  };
  debug?: {
    start: (req: { file: string; args?: string[]; stopOnEntry?: boolean }) => Promise<{ success: boolean; error?: string }>;
    stop: () => Promise<{ success: boolean }>;
    setBreakpoints: (file: string, lines: number[]) => Promise<{ success: boolean; error?: string; breakpoints?: { line: number; verified: boolean }[] }>;
    resume: () => Promise<{ success: boolean }>;
    stepOver: () => Promise<{ success: boolean }>;
    stepInto: () => Promise<{ success: boolean }>;
    stepOut: () => Promise<{ success: boolean }>;
    pause: () => Promise<{ success: boolean }>;
    scopes: (frameId: string) => Promise<{ success: boolean; scopes?: { name: string; ref: string; expanded: boolean }[] }>;
    properties: (ref: string) => Promise<{ success: boolean; props?: DebugVar[] }>;
    evaluate: (expr: string, frameId?: string | null) => Promise<{ success: boolean; value?: string; type?: string; ref?: string | null; error?: string }>;
    onEvent: (cb: (ev: DebugEvent) => void) => () => void;
  };
  /** Çalışma klasörü güveni ve kalıcı rızalar. Ekleme yok: yalnız açık klasöre güven verme ve kaldırma. */
  /** Uzak çalışma alanı (SSH/SFTP). Yollar `ssh://<ana>/<yol>` biçimindedir. */
  ssh?: {
    status: () => Promise<{ available: boolean; hosts: SshHost[]; active: { hostId: string; root: string } | null }>;
    hostSave: (host: SshHostInput) => Promise<{ success: boolean; host?: SshHost; error?: string }>;
    hostRemove: (id: string) => Promise<{ success: boolean }>;
    pickKey: () => Promise<{ success: boolean; path?: string; name?: string; error?: string }>;
    connect: (id: string, secret?: string) => Promise<{ success: boolean; home?: string; error?: string }>;
    hostKeyAnswer: (reqId: string, allow: boolean) => Promise<{ success: boolean }>;
    forgetHostKey: (id: string) => Promise<{ success: boolean }>;
    disconnect: (id: string) => Promise<{ success: boolean }>;
    browse: (id: string, dir?: string) => Promise<{ success: boolean; path?: string; parent?: string | null; dirs?: string[]; error?: string }>;
    open: (id: string, dir?: string) => Promise<{ rootPath: string; rootName: string; trusted?: boolean; remote?: { hostId: string; name: string }; tree: FileItem[] } | { error: string }>;
    close: () => Promise<{ success: boolean }>;
    onEvent: (cb: (ev: SshEvent) => void) => () => void;
  };
  trust?: {
    status: () => Promise<{ root: string; trusted: boolean }>;
    grant: () => Promise<{ success: boolean; trusted: boolean }>;
    list: () => Promise<{ folders: { key: string; label: string }[]; consent: string[]; bases: string[] }>;
    revoke: (kind: 'folders' | 'consent' | 'bases', value: string) => Promise<{ success: boolean }>;
    onChange: (callback: (s: { root: string; trusted: boolean }) => void) => () => void;
  };
  quitApp: () => Promise<void>;
  /** Pencere kapatılmak istenince ana süreç sorar; yanıt `respondClose(true|false)` ile verilir. Abonelik kaldırıcı döner. */
  onCloseRequest?: (callback: () => void) => () => void;
  respondClose?: (allow: boolean) => void;
  /** Onay penceresi açılınca çağrılır: ana süreç kapanış zaman aşımını karar gelene kadar durdurur. */
  closePending?: () => void;
  platform?: string;
  windowControls?: {
    minimize: () => Promise<void>;
    toggleMaximize: () => Promise<boolean>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximized: (cb: (maximized: boolean) => void) => () => void;
  };
  openFolderDialog: () => Promise<{ rootPath: string; rootName: string; trusted?: boolean; tree: FileItem[] } | { error: string } | null>;
  recentFolders: () => Promise<{ path: string; name: string }[]>;
  openRecentFolder: (folderPath: string) => Promise<{ rootPath: string; rootName: string; trusted?: boolean; tree: FileItem[] } | { error: string }>;
  openFileDialog: () => Promise<FileItem[]>;
  readDirectory: (dirPath: string) => Promise<FileItem[]>;
  /** Başarıda metin; çok büyük/ikili dosyada `{ success:false, error:'file-too-large' | 'binary-file' }`. */
  readFile: (filePath: string) => Promise<string | ReadFileFailure>;
  readDataUrl: (filePath: string) => Promise<{ success: boolean; dataUrl?: string; error?: string }>;
  /** Önizleme HTML'ini ayrı kökene (nova-preview://) yükler; kimlik döner (null: reddedildi/çok büyük). */
  previewPut?: (html: string) => Promise<string | null>;
  previewDrop?: (id: string) => Promise<boolean>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  createFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  createFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (targetPath: string, opts?: { permanent?: boolean }) => Promise<{ success: boolean; error?: string; trashed?: boolean; trashFailed?: boolean }>;
  history?: {
    list: (filePath: string) => Promise<{ id: string; time: number; size: number }[]>;
    read: (filePath: string, id: string) => Promise<{ success: boolean; content?: string }>;
    deleted: () => Promise<{ path: string; versions: number; last: number }[]>;
    clear: (scope: 'file' | 'workspace' | 'all', filePath?: string) => Promise<{ success: boolean }>;
    config: (cfg: { enabled?: boolean; maxVersions?: number }) => Promise<{ success: boolean }>;
  };
  snippets?: {
    load: () => Promise<{ snippets: UserSnippet[]; errors: string[] }>;
    read: (scope: 'workspace' | 'user') => Promise<{ success: boolean; text?: string; error?: string }>;
    save: (scope: 'workspace' | 'user', text: string) => Promise<{ success: boolean; error?: string; errors?: string[]; count?: number }>;
  };
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
  onTermReady?: (callback: (data: { id: string; shell: 'powershell' | 'cmd'; cwd: string; reused?: boolean }) => void) => () => void;
  gitFetch: (repoPath: string) => Promise<GitResult>;
  gitStage: (repoPath: string, paths: string[]) => Promise<GitResult>;
  gitStageAll: (repoPath: string) => Promise<GitResult>;
  gitUnstage: (repoPath: string, paths: string[]) => Promise<GitResult>;
  gitDiscard: (repoPath: string, files: { path: string; untracked: boolean }[]) => Promise<GitResult>;
  gitSync: (repoPath: string) => Promise<GitResult>;
  gitBranches: (repoPath: string) => Promise<{ success: boolean; branches: string[]; current: string }>;
  gitCheckout: (repoPath: string, name: string) => Promise<GitResult>;
  gitCreateBranch: (repoPath: string, name: string) => Promise<GitResult>;
  gitLog: (repoPath: string, limit?: number) => Promise<{ success: boolean; commits: GitCommitInfo[] }>;
  gitInit: (repoPath: string) => Promise<GitResult>;
  gitDiffFile: (repoPath: string, opts: GitDiffRequest) => Promise<GitDiffResult>;
  gitCommitFiles: (repoPath: string, hash: string) => Promise<{ success: boolean; files: GitCommitFile[] }>;
  gitRefs: (repoPath: string) => Promise<GitRefs>;
  gitCheckoutRef: (repoPath: string, ref: string) => Promise<GitResult>;
  gitCreateBranchFrom: (repoPath: string, name: string, from: string) => Promise<GitResult>;
  gitDeleteBranch: (repoPath: string, name: string, force?: boolean) => Promise<GitResult>;
  gitMerge: (repoPath: string, ref: string) => Promise<GitResult>;
  gitMergeAbort: (repoPath: string) => Promise<GitResult>;
  gitMergeContinue: (repoPath: string) => Promise<GitResult>;
  gitResolve: (repoPath: string, file: string, side: 'ours' | 'theirs') => Promise<GitResult>;
  gitAmend: (repoPath: string, message?: string) => Promise<GitResult>;
  gitUndoCommit: (repoPath: string) => Promise<GitResult>;
  gitCreateTag: (repoPath: string, name: string, message?: string, ref?: string) => Promise<GitResult>;
  gitDeleteTag: (repoPath: string, name: string) => Promise<GitResult>;
  gitPushTag: (repoPath: string, name: string) => Promise<GitResult>;
  gitStashList: (repoPath: string) => Promise<{ success: boolean; stashes: GitStash[] }>;
  gitStashPush: (repoPath: string, message?: string, includeUntracked?: boolean) => Promise<GitResult>;
  gitStashApply: (repoPath: string, index: number) => Promise<GitResult>;
  gitStashPop: (repoPath: string, index: number) => Promise<GitResult>;
  gitStashDrop: (repoPath: string, index: number) => Promise<GitResult>;
  onGitChanged: (callback: (data: { rootPath: string }) => void) => () => void;
  github: {
    status: () => Promise<GithubAuthStatus>;
    login: () => Promise<{ success: boolean; error?: string; userCode?: string; verificationUri?: string; expiresIn?: number }>;
    copyCode: () => Promise<{ success: boolean }>;
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
