const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  versions: { electron: process.versions.electron, chrome: process.versions.chrome, node: process.versions.node },
  ui: {
    // Arayüz yakınlaştırma (0.8–1.5): tüm uygulamayı eşit ölçekler
    setZoom: (factor) => {
      const z = Math.round(Math.min(1.5, Math.max(0.8, Number(factor) || 1)) * 100) / 100;
      if (Math.abs(webFrame.getZoomFactor() - z) > 0.001) webFrame.setZoomFactor(z); // aynı değeri tekrar uygulama: gereksiz yeniden yerleşim olmasın
    },
    setTheme: (mode) => ipcRenderer.invoke('ui:setTheme', mode)
  },
  // Dil sunucuları (LSP): Python, Rust, Go, C/C++ vb. (yalnız kullanıcının PATH'indeki sunucular)
  lsp: {
    status: (lang) => ipcRenderer.invoke('lsp:status', { lang }),
    start: (lang) => ipcRenderer.invoke('lsp:start', { lang }),
    notify: (lang, method, path, params) => ipcRenderer.invoke('lsp:notify', { lang, method, path, params }),
    request: (lang, method, path, params) => ipcRenderer.invoke('lsp:request', { lang, method, path, params }),
    onEvent: (cb) => {
      const h = (_e, ev) => cb(ev);
      ipcRenderer.on('lsp:event', h);
      return () => ipcRenderer.removeListener('lsp:event', h);
    }
  },
  // Gerçek terminal (PTY): xterm.js ile çalışır
  pty: {
    available: () => ipcRenderer.invoke('pty:available'),
    start: (req) => ipcRenderer.invoke('pty:start', req),
    write: (id, data) => ipcRenderer.invoke('pty:write', id, data),
    resize: (id, cols, rows) => ipcRenderer.invoke('pty:resize', id, cols, rows),
    stop: (id) => ipcRenderer.invoke('pty:stop', id),
    onData: (cb) => {
      const h = (_e, m) => cb(m);
      ipcRenderer.on('pty:data', h);
      return () => ipcRenderer.removeListener('pty:data', h);
    },
    onExit: (cb) => {
      const h = (_e, m) => cb(m);
      ipcRenderer.on('pty:exit', h);
      return () => ipcRenderer.removeListener('pty:exit', h);
    }
  },
  // Hata ayıklayıcı (Node.js / V8 Inspector): kesme noktaları, adım adım, değişkenler
  debug: {
    start: (req) => ipcRenderer.invoke('dbg:start', req),
    stop: () => ipcRenderer.invoke('dbg:stop'),
    setBreakpoints: (file, lines) => ipcRenderer.invoke('dbg:setBreakpoints', { file, lines }),
    resume: () => ipcRenderer.invoke('dbg:resume'),
    stepOver: () => ipcRenderer.invoke('dbg:stepOver'),
    stepInto: () => ipcRenderer.invoke('dbg:stepInto'),
    stepOut: () => ipcRenderer.invoke('dbg:stepOut'),
    pause: () => ipcRenderer.invoke('dbg:pause'),
    scopes: (frameId) => ipcRenderer.invoke('dbg:scopes', { frameId }),
    properties: (ref) => ipcRenderer.invoke('dbg:properties', { ref }),
    evaluate: (expr, frameId) => ipcRenderer.invoke('dbg:evaluate', { expr, frameId }),
    onEvent: (cb) => {
      const h = (_e, ev) => cb(ev);
      ipcRenderer.on('dbg:event', h);
      return () => ipcRenderer.removeListener('dbg:event', h);
    }
  },
  secrets: {
    get: (key) => ipcRenderer.invoke('secrets:get', key),
    set: (key, value) => ipcRenderer.invoke('secrets:set', key, value)
  },
  search: {
    files: () => ipcRenderer.invoke('search:files'),
    text: (opts) => ipcRenderer.invoke('search:text', opts)
  },
  update: {
    state: () => ipcRenderer.invoke('update:state'),
    check: (opts) => ipcRenderer.invoke('update:check', opts),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    releases: () => ipcRenderer.invoke('update:releases'),
    onState: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('update:state', listener);
      return () => ipcRenderer.removeListener('update:state', listener);
    }
  },
  openLink: (url) => ipcRenderer.invoke('app:openLink', url),
  revealInFolder: (target) => ipcRenderer.invoke('app:reveal', target),
  llm: {
    status: () => ipcRenderer.invoke('llm:status'),
    download: (id) => ipcRenderer.invoke('llm:download', id),
    cancel: (id) => ipcRenderer.invoke('llm:cancel', id),
    remove: (id) => ipcRenderer.invoke('llm:delete', id),
    onProgress: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('llm:progress', listener);
      return () => ipcRenderer.removeListener('llm:progress', listener);
    }
  },
  ext: {
    search: (opts) => ipcRenderer.invoke('ext:search', opts),
    list: () => ipcRenderer.invoke('ext:list'),
    details: (namespace, name) => ipcRenderer.invoke('ext:details', namespace, name),
    install: (namespace, name) => ipcRenderer.invoke('ext:install', namespace, name),
    uninstall: (id) => ipcRenderer.invoke('ext:uninstall', id),
    checkUpdates: () => ipcRenderer.invoke('ext:checkUpdates')
  },
  ai: {
    run: (req) => ipcRenderer.invoke('ai:run', req),
    cancel: (runId) => ipcRenderer.invoke('ai:cancel', runId),
    approve: (runId, id, allow) => ipcRenderer.invoke('ai:approve', runId, id, allow),
    transcribe: (req) => ipcRenderer.invoke('ai:transcribe', req),
    commands: () => ipcRenderer.invoke('ai:commands'),
    complete: (req) => ipcRenderer.invoke('ai:complete', req),
    completeCancel: (id) => ipcRenderer.invoke('ai:completeCancel', id),
    ollamaModels: (baseUrl) => ipcRenderer.invoke('ai:ollamaModels', baseUrl),
    onEvent: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('ai:event', listener);
      return () => ipcRenderer.removeListener('ai:event', listener);
    }
  },
  quitApp: () => ipcRenderer.invoke('app:quit'),
  // Özel pencere düğmeleri (macOS'ta sistemin trafik ışıkları kullanılır)
  platform: process.platform,
  windowControls: {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('win:toggle-maximize'),
    close: () => ipcRenderer.invoke('win:close'),
    isMaximized: () => ipcRenderer.invoke('win:is-maximized'),
    onMaximized: (cb) => {
      const h = (_e, v) => cb(!!v);
      ipcRenderer.on('win:maximized', h);
      return () => ipcRenderer.removeListener('win:maximized', h);
    }
  },
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  recentFolders: () => ipcRenderer.invoke('workspace:recent'),
  openRecentFolder: (folderPath) => ipcRenderer.invoke('workspace:open', folderPath),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFiles'),
  readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  readDataUrl: (filePath) => ipcRenderer.invoke('fs:readDataUrl', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  createFile: (filePath) => ipcRenderer.invoke('fs:createFile', filePath),
  createFolder: (folderPath) => ipcRenderer.invoke('fs:createFolder', folderPath),
  deleteItem: (targetPath) => ipcRenderer.invoke('fs:deleteItem', targetPath),
  renameItem: (oldPath, newPath) => ipcRenderer.invoke('fs:renameItem', oldPath, newPath),
  getGitStatus: (repoPath) => ipcRenderer.invoke('git:status', repoPath),
  gitCommit: (repoPath, message) => ipcRenderer.invoke('git:commit', repoPath, message),
  gitPush: (repoPath) => ipcRenderer.invoke('git:push', repoPath),
  gitPull: (repoPath) => ipcRenderer.invoke('git:pull', repoPath),
  onFileChanged: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('fs:watch-change', listener);
    return () => ipcRenderer.removeListener('fs:watch-change', listener);
  },
  gitFetch: (repoPath) => ipcRenderer.invoke('git:fetch', repoPath),
  gitStage: (repoPath, paths) => ipcRenderer.invoke('git:stage', repoPath, paths),
  gitStageAll: (repoPath) => ipcRenderer.invoke('git:stageAll', repoPath),
  gitUnstage: (repoPath, paths) => ipcRenderer.invoke('git:unstage', repoPath, paths),
  gitDiscard: (repoPath, files) => ipcRenderer.invoke('git:discard', repoPath, files),
  gitSync: (repoPath) => ipcRenderer.invoke('git:sync', repoPath),
  gitBranches: (repoPath) => ipcRenderer.invoke('git:branches', repoPath),
  gitCheckout: (repoPath, name) => ipcRenderer.invoke('git:checkout', repoPath, name),
  gitCreateBranch: (repoPath, name) => ipcRenderer.invoke('git:createBranch', repoPath, name),
  gitLog: (repoPath) => ipcRenderer.invoke('git:log', repoPath),
  gitInit: (repoPath) => ipcRenderer.invoke('git:init', repoPath),
  gitDiffFile: (repoPath, opts) => ipcRenderer.invoke('git:diffFile', repoPath, opts),
  gitCommitFiles: (repoPath, hash) => ipcRenderer.invoke('git:commitFiles', repoPath, hash),
  gitRefs: (repoPath) => ipcRenderer.invoke('git:refs', repoPath),
  gitCheckoutRef: (repoPath, ref) => ipcRenderer.invoke('git:checkoutRef', repoPath, ref),
  gitCreateBranchFrom: (repoPath, name, from) => ipcRenderer.invoke('git:createBranchFrom', repoPath, name, from),
  gitDeleteBranch: (repoPath, name, force) => ipcRenderer.invoke('git:deleteBranch', repoPath, name, force),
  gitMerge: (repoPath, ref) => ipcRenderer.invoke('git:merge', repoPath, ref),
  gitMergeAbort: (repoPath) => ipcRenderer.invoke('git:mergeAbort', repoPath),
  gitMergeContinue: (repoPath) => ipcRenderer.invoke('git:mergeContinue', repoPath),
  gitResolve: (repoPath, file, side) => ipcRenderer.invoke('git:resolve', repoPath, file, side),
  gitAmend: (repoPath, message) => ipcRenderer.invoke('git:amend', repoPath, message),
  gitUndoCommit: (repoPath) => ipcRenderer.invoke('git:undoCommit', repoPath),
  gitCreateTag: (repoPath, name, message, ref) => ipcRenderer.invoke('git:createTag', repoPath, name, message, ref),
  gitDeleteTag: (repoPath, name) => ipcRenderer.invoke('git:deleteTag', repoPath, name),
  gitPushTag: (repoPath, name) => ipcRenderer.invoke('git:pushTag', repoPath, name),
  gitStashList: (repoPath) => ipcRenderer.invoke('git:stashList', repoPath),
  gitStashPush: (repoPath, message, includeUntracked) => ipcRenderer.invoke('git:stashPush', repoPath, message, includeUntracked),
  gitStashApply: (repoPath, index) => ipcRenderer.invoke('git:stashApply', repoPath, index),
  gitStashPop: (repoPath, index) => ipcRenderer.invoke('git:stashPop', repoPath, index),
  gitStashDrop: (repoPath, index) => ipcRenderer.invoke('git:stashDrop', repoPath, index),
  onGitChanged: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('git:changed', listener);
    return () => ipcRenderer.removeListener('git:changed', listener);
  },
  github: {
    status: () => ipcRenderer.invoke('github:status'),
    login: () => ipcRenderer.invoke('github:login'),
    cancel: () => ipcRenderer.invoke('github:cancel'),
    logout: () => ipcRenderer.invoke('github:logout'),
    repoInfo: (repoPath) => ipcRenderer.invoke('github:repoInfo', repoPath),
    createPr: (repoPath, input) => ipcRenderer.invoke('github:createPr', repoPath, input),
    publishRepo: (repoPath, input) => ipcRenderer.invoke('github:publishRepo', repoPath, input),
    openExternal: (url) => ipcRenderer.invoke('github:openExternal', url),
    onAuth: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('github:auth', listener);
      return () => ipcRenderer.removeListener('github:auth', listener);
    }
  },
  onTermCwd: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('term:cwd', listener);
    return () => ipcRenderer.removeListener('term:cwd', listener);
  },
  termStart: (shell, cwd, id) => ipcRenderer.invoke('term:start', shell, cwd, id),
  termInput: (id, line) => ipcRenderer.invoke('term:input', id, line),
  termStop: (id) => ipcRenderer.invoke('term:stop', id),
  onTermOutput: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('term:output', listener);
    return () => ipcRenderer.removeListener('term:output', listener);
  },
  onTermExit: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('term:exit', listener);
    return () => ipcRenderer.removeListener('term:exit', listener);
  }
});
