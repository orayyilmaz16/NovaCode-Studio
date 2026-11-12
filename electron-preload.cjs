const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  versions: { electron: process.versions.electron, chrome: process.versions.chrome, node: process.versions.node },
  ui: {
    // Arayüz yakınlaştırma (0.8–1.5): tüm uygulamayı eşit ölçekler
    setZoom: (factor) => webFrame.setZoomFactor(Math.min(1.5, Math.max(0.8, Number(factor) || 1))),
    setTheme: (mode) => ipcRenderer.invoke('ui:setTheme', mode)
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
