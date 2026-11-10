const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  quitApp: () => ipcRenderer.invoke('app:quit'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFiles'),
  readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
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
  github: {
    status: () => ipcRenderer.invoke('github:status'),
    setClientId: (id) => ipcRenderer.invoke('github:setClientId', id),
    login: () => ipcRenderer.invoke('github:login'),
    cancel: () => ipcRenderer.invoke('github:cancel'),
    logout: () => ipcRenderer.invoke('github:logout'),
    repoInfo: (repoPath) => ipcRenderer.invoke('github:repoInfo', repoPath),
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
  termStart: (shell, cwd) => ipcRenderer.invoke('term:start', shell, cwd),
  termInput: (shell, line) => ipcRenderer.invoke('term:input', shell, line),
  termStop: (shell) => ipcRenderer.invoke('term:stop', shell),
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
