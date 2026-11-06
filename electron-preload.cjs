const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
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
    ipcRenderer.on('fs:watch-change', (_event, data) => callback(data));
  },
  termStart: (shell, cwd) => ipcRenderer.invoke('term:start', shell, cwd),
  termInput: (line) => ipcRenderer.invoke('term:input', line),
  termStop: () => ipcRenderer.invoke('term:stop'),
  onTermOutput: (callback) => {
    ipcRenderer.on('term:output', (_event, text) => callback(text));
  },
  onTermExit: (callback) => {
    ipcRenderer.on('term:exit', (_event, code) => callback(code));
  }
});
