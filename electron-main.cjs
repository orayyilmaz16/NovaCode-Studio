const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile, spawn } = require('child_process');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let activeWatcher = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 660,
    backgroundColor: '#0d1017',
    title: 'NovaCode Studio',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith('http:') || targetUrl.startsWith('https:')) {
      shell.openExternal(targetUrl);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    if (activeWatcher) {
      try { activeWatcher.close(); } catch(e) {}
      activeWatcher = null;
    }
    mainWindow = null;
  });
}

// ----------------------------------------------------
// File System Helpers
// ----------------------------------------------------
const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'release', '.vscode', '.idea']);

function scanDirectorySync(dirPath, maxDepth = 4, currentDepth = 0) {
  if (currentDepth > maxDepth) return [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const items = [];

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dirPath, entry.name);
      const isDirectory = entry.isDirectory();

      const ext = path.extname(entry.name).toLowerCase().replace('.', '');
      let language = 'plaintext';
      if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) language = 'javascript';
      else if (['ts', 'tsx'].includes(ext)) language = 'typescript';
      else if (['html', 'htm'].includes(ext)) language = 'html';
      else if (['css', 'scss', 'sass', 'less'].includes(ext)) language = 'css';
      else if (['json'].includes(ext)) language = 'json';
      else if (['md', 'markdown'].includes(ext)) language = 'markdown';
      else if (['py'].includes(ext)) language = 'python';
      else if (['rs'].includes(ext)) language = 'rust';
      else if (['go'].includes(ext)) language = 'go';
      else if (['c', 'cpp', 'h', 'hpp'].includes(ext)) language = 'cpp';
      else if (['java'].includes(ext)) language = 'java';
      else if (['sql'].includes(ext)) language = 'sql';
      else if (['sh', 'bash', 'zsh', 'ps1'].includes(ext)) language = 'shell';
      else if (['yaml', 'yml'].includes(ext)) language = 'yaml';

      if (isDirectory) {
        items.push({
          id: fullPath,
          name: entry.name,
          path: fullPath,
          type: 'folder',
          isOpen: currentDepth < 1,
          children: scanDirectorySync(fullPath, maxDepth, currentDepth + 1)
        });
      } else {
        items.push({
          id: fullPath,
          name: entry.name,
          path: fullPath,
          type: 'file',
          language
        });
      }
    }

    return items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
  } catch (err) {
    return [];
  }
}

function stopFileWatcher() {
  if (activeWatcher) {
    try { activeWatcher.close(); } catch (e) {}
    activeWatcher = null;
  }
}

function startFileWatcher(rootPath) {
  stopFileWatcher();
  try {
    let debounceTimer;
    const watcher = fs.watch(rootPath, { recursive: true }, (_eventType, filename) => {
      // node_modules gibi büyük klasörler olay selini tetiklemesin
      const name = filename ? String(filename) : '';
      if (name && name.split(/[\\/]/).some((part) => IGNORED_DIRS.has(part))) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('fs:watch-change', { filename, rootPath });
        }
      }, 300);
    });
    // Olay dinleyicisi olmayan 'error' olayı süreci çökertir (ör. izlenen klasör silinirse).
    watcher.on('error', (err) => {
      console.warn('File watcher error:', err);
      if (activeWatcher === watcher) {
        stopFileWatcher();
      }
    });
    activeWatcher = watcher;
  } catch (e) {
    console.warn('File watcher could not be attached:', e);
  }
}

function isValidPath(p) {
  return typeof p === 'string' && p.length > 0 && p.length < 4096 && !p.includes('\0');
}

// ----------------------------------------------------
// IPC Handlers: Dialogs & Real FS
// ----------------------------------------------------
ipcMain.handle('dialog:openFolder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      properties: ['openDirectory'],
      title: 'Çalışma Alanı Klasörü Seçin'
    });
    if (result.canceled || !result.filePaths.length) return null;

    const folderPath = result.filePaths[0];
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
      throw new Error('Seçilen klasör bulunamadı veya erişilemiyor.');
    }
    startFileWatcher(folderPath);

    return {
      rootPath: folderPath,
      rootName: path.basename(folderPath),
      tree: scanDirectorySync(folderPath)
    };
  } catch (err) {
    console.error('Klasör açılamadı:', err);
    return { error: err.message || 'Klasör açılamadı.' };
  }
});

ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Açmak İçin Dosya Seçin'
  });
  if (result.canceled || !result.filePaths.length) return [];

  const files = [];
  for (const filePath of result.filePaths) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const name = path.basename(filePath);
      const ext = path.extname(name).toLowerCase().replace('.', '');
      files.push({
        id: filePath,
        name,
        path: filePath,
        type: 'file',
        content,
        language: ext === 'ts' ? 'typescript' : ext === 'js' ? 'javascript' : ext
      });
    } catch(e) {}
  }
  return files;
});

ipcMain.handle('fs:readDir', async (_event, dirPath) => {
  if (!isValidPath(dirPath) || !fs.existsSync(dirPath)) return [];
  return scanDirectorySync(dirPath);
});

ipcMain.handle('fs:readFile', async (_event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error('Dosya okunamadı: ' + err.message);
  }
});

ipcMain.handle('fs:writeFile', async (_event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:createFile', async (_event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:createFolder', async (_event, folderPath) => {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:deleteItem', async (_event, targetPath) => {
  try {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:renameItem', async (_event, oldPath, newPath) => {
  try {
    fs.renameSync(oldPath, newPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ----------------------------------------------------
// IPC Handlers: Real Git Integration
// ----------------------------------------------------
// Kabuk kullanılmaz (execFile): argümanlar doğrudan git'e gider, enjeksiyon olmaz.
function runGitCommand(args, cwd) {
  return new Promise((resolve) => {
    if (!isValidPath(cwd) || !fs.existsSync(cwd)) {
      resolve({ success: false, stdout: '', stderr: 'Geçersiz depo yolu.' });
      return;
    }
    execFile('git', args, { cwd, windowsHide: true, maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout ? stdout.trim() : '',
        stderr: stderr ? stderr.trim() : (error ? error.message : '')
      });
    });
  });
}

ipcMain.handle('git:status', async (_event, repoPath) => {
  if (!isValidPath(repoPath)) return { isRepo: false };
  const check = await runGitCommand(['rev-parse', '--is-inside-work-tree'], repoPath);
  if (!check.success || check.stdout !== 'true') {
    return { isRepo: false };
  }

  const [branchRes, statusRes] = await Promise.all([
    runGitCommand(['branch', '--show-current'], repoPath),
    runGitCommand(['status', '--short'], repoPath)
  ]);

  const changes = statusRes.stdout
    ? statusRes.stdout.split('\n').filter(Boolean).map(line => {
        const code = line.substring(0, 2).trim();
        const file = line.substring(3).trim();
        return { code, file };
      })
    : [];

  return {
    isRepo: true,
    branch: branchRes.stdout || 'main',
    changes
  };
});

ipcMain.handle('git:commit', async (_event, repoPath, message) => {
  if (typeof message !== 'string' || !message.trim() || message.length > 500) {
    return { success: false, stdout: '', stderr: 'Geçersiz commit mesajı.' };
  }
  await runGitCommand(['add', '.'], repoPath);
  return runGitCommand(['commit', '-m', message], repoPath);
});

ipcMain.handle('git:push', async (_event, repoPath) => {
  return runGitCommand(['push'], repoPath);
});

ipcMain.handle('git:pull', async (_event, repoPath) => {
  return runGitCommand(['pull'], repoPath);
});

// ----------------------------------------------------
// IPC Handlers: Gerçek shell (PowerShell / CMD), kalıcı oturum
// ----------------------------------------------------
// PTY değil, stdin/stdout borusu: çoğu komut çalışır, renkli/tam ekran programlar çalışmaz.
let shellProc = null;

function stopShell() {
  if (shellProc) {
    try { shellProc.kill(); } catch (e) {}
    shellProc = null;
  }
}

function sendTerm(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

ipcMain.handle('term:start', async (_event, shellName, cwd) => {
  stopShell();
  if (!isValidPath(cwd) || !fs.existsSync(cwd)) {
    return { success: false, error: 'Çalışma klasörü yok. Önce bir klasör açın.' };
  }
  const isCmd = shellName === 'cmd';
  const command = isCmd ? 'cmd.exe' : (process.platform === 'win32' ? 'powershell.exe' : 'bash');
  const args = isCmd
    ? ['/Q']
    : process.platform === 'win32'
      ? ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '-']
      : [];
  try {
    shellProc = spawn(command, args, { cwd, windowsHide: true, env: process.env });
  } catch (err) {
    return { success: false, error: err.message };
  }
  // Türkçe karakterler için çıktı kodlamasını UTF-8'e al (Windows varsayılanı OEM kod sayfası).
  if (isCmd) {
    shellProc.stdin.write('chcp 65001 >nul\r\n');
  } else if (process.platform === 'win32') {
    shellProc.stdin.write('[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8\n');
  }
  shellProc.stdout.on('data', (chunk) => sendTerm('term:output', chunk.toString('utf8')));
  shellProc.stderr.on('data', (chunk) => sendTerm('term:output', chunk.toString('utf8')));
  shellProc.on('error', (err) => sendTerm('term:output', `\n[shell hatası] ${err.message}\n`));
  shellProc.on('exit', (code) => {
    shellProc = null;
    sendTerm('term:exit', code);
  });
  return { success: true, shell: command };
});

ipcMain.handle('term:input', async (_event, line) => {
  if (!shellProc || typeof line !== 'string' || line.length > 10000) {
    return { success: false, error: 'Shell çalışmıyor.' };
  }
  shellProc.stdin.write(line + '\n');
  return { success: true };
});

ipcMain.handle('term:stop', async () => {
  stopShell();
  return { success: true };
});

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
