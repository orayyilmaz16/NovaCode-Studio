const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const github = require('./electron-github.cjs');
const secrets = require('./electron-secrets.cjs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let activeWatcher = null;
let activeGitWatcher = null;
let workspaceRoot = ''; // açık çalışma klasörü (arama ve yapay zekâ araçları yalnız bunun içinde çalışır)

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 660,
    backgroundColor: '#181818',
    title: 'NovaCode Studio',
    // Uygulama simgesi: geliştirmede public/, paketli uygulamada dist/ içinden
    icon: path.join(__dirname, isDev ? 'public' : 'dist', 'icon.png'),
    // Özel başlık çubuğu: pencere düğmeleri (küçült/büyüt/kapat) sistem tarafından arayüzün üstüne çizilir
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#181818', symbolColor: '#cccccc', height: 36 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true
    },
    autoHideMenuBar: true,
  });

  // Dikte için yalnız mikrofon izni (uygulamanın kendi sayfasına); diğer tüm izinler reddedilir.
  mainWindow.webContents.session.setPermissionRequestHandler((wc, permission, cb, details) => {
    const types = (details && details.mediaTypes) || [];
    cb(permission === 'media' && types.length > 0 && types.every((m) => m === 'audio') && wc === mainWindow.webContents);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    // NOVA_HEADLESS=1: otomatik testler için pencere ekran dışında, odaksız açılır (render sürer, kullanıcı görmez/etkilemez).
    if (process.env.NOVA_HEADLESS === '1') {
      mainWindow.setPosition(-3200, -3200);
      mainWindow.showInactive();
      return;
    }
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
    stopFileWatcher();
    mainWindow = null;
  });
}

function stopFileWatcher() {
  if (activeGitWatcher) {
    try { activeGitWatcher.close(); } catch (e) { /* zaten kapalı */ }
    activeGitWatcher = null;
  }
  if (activeWatcher) {
    try { activeWatcher.close(); } catch (e) { /* zaten kapalı */ }
    activeWatcher = null;
  }
}

// ----------------------------------------------------
// File System Helpers
// ----------------------------------------------------
const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'release', '.vscode', '.idea', '.venv', '__pycache__', '.next', 'coverage']);
const MAX_TREE_NODES = 5000; // büyük klasörlerde arayüzün ve sürecin takılmasını önler

// Asenkron tarama: ana süreç bloklanmaz, toplam düğüm sayısı sınırlıdır.
async function scanDirectory(dirPath, budget = { left: MAX_TREE_NODES }, maxDepth = 4, currentDepth = 0) {
  if (currentDepth > maxDepth || budget.left <= 0) return [];
  let entries;
  try {
    entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch (err) {
    return [];
  }
  const items = [];
  for (const entry of entries) {
    if (budget.left <= 0) break;
    if (IGNORED_DIRS.has(entry.name)) continue;
    budget.left--;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      items.push({
        id: fullPath,
        name: entry.name,
        path: fullPath,
        type: 'folder',
        isOpen: currentDepth < 1,
        children: await scanDirectory(fullPath, budget, maxDepth, currentDepth + 1)
      });
    } else {
      const ext = path.extname(entry.name).toLowerCase().replace('.', '');
      items.push({ id: fullPath, name: entry.name, path: fullPath, type: 'file', language: languageFromExt(ext) });
    }
  }
  return items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });
}

function languageFromExt(ext) {
  const map = {
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', html: 'html', htm: 'html',
    css: 'css', scss: 'css', sass: 'css', less: 'css', json: 'json',
    md: 'markdown', markdown: 'markdown', py: 'python', rs: 'rust', go: 'go',
    c: 'cpp', cpp: 'cpp', h: 'cpp', hpp: 'cpp', java: 'java', sql: 'sql',
    sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'shell', yaml: 'yaml', yml: 'yaml'
  };
  return map[ext] || 'plaintext';
}

function startFileWatcher(rootPath) {
  stopFileWatcher();
  try {
    let debounceTimer;
    const pending = new Set();
    const watcher = fs.watch(rootPath, { recursive: true }, (_eventType, filename) => {
      // node_modules gibi büyük klasörler olay selini tetiklemesin
      const name = filename ? String(filename) : '';
      if (name && name.split(/[\\/]/).some((part) => IGNORED_DIRS.has(part))) return;
      if (name) pending.add(path.join(rootPath, name));
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const changed = Array.from(pending).slice(0, 200);
        pending.clear();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('fs:watch-change', { filename, rootPath, changed });
        }
      }, 150);
    });
    // Olay dinleyicisi olmayan 'error' olayı süreci çökertir (ör. izlenen klasör silinirse).
    watcher.on('error', (err) => {
      console.warn('File watcher error:', err);
      if (activeWatcher === watcher) {
        stopFileWatcher();
      }
    });
    activeWatcher = watcher;

    // .git içindeki HEAD/index/refs değişimleri: terminalde veya başka araçta yapılan commit, checkout,
    // fetch anında arayüze yansır (nesne dosyaları yok sayılır).
    const gitDir = path.join(rootPath, '.git');
    if (fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory()) {
      let gitTimer;
      activeGitWatcher = fs.watch(gitDir, { recursive: true }, (_t, filename) => {
        const f = filename ? String(filename).split('\\').join('/') : '';
        if (!/^(HEAD|index|MERGE_HEAD|ORIG_HEAD|FETCH_HEAD|packed-refs|refs\/.*)$/.test(f) || f.endsWith('.lock')) return;
        clearTimeout(gitTimer);
        gitTimer = setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('git:changed', { rootPath });
        }, 150);
      });
      activeGitWatcher.on('error', () => {
        try { activeGitWatcher && activeGitWatcher.close(); } catch (e) { /* kapalı */ }
        activeGitWatcher = null;
      });
    }
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
ipcMain.handle('app:quit', () => {
  app.quit();
});

// Son açılan klasörler: yalnız kullanıcının seçtiği klasör yolları, yerelde (userData) saklanır; hiçbir yere gönderilmez.
const RECENT_MAX = 8;
const recentFile = () => path.join(app.getPath('userData'), 'recent-folders.json');

function readRecent() {
  try {
    const list = JSON.parse(fs.readFileSync(recentFile(), 'utf8'));
    return Array.isArray(list) ? list.filter((p) => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

function pushRecent(folderPath) {
  const list = [folderPath, ...readRecent().filter((p) => p !== folderPath)].slice(0, RECENT_MAX);
  try {
    fs.writeFileSync(recentFile(), JSON.stringify(list), { mode: 0o600 });
  } catch (e) {
    console.warn('Son klasörler kaydedilemedi:', e);
  }
}

async function openWorkspace(folderPath) {
  if (!isValidPath(folderPath) || !fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    throw new Error('Seçilen klasör bulunamadı veya erişilemiyor.');
  }
  startFileWatcher(folderPath);
  workspaceRoot = folderPath;
  pushRecent(folderPath);
  return {
    rootPath: folderPath,
    rootName: path.basename(folderPath),
    tree: await scanDirectory(folderPath)
  };
}

ipcMain.handle('dialog:openFolder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      properties: ['openDirectory'],
      title: 'Çalışma Alanı Klasörü Seçin'
    });
    if (result.canceled || !result.filePaths.length) return null;
    return await openWorkspace(result.filePaths[0]);
  } catch (err) {
    console.error('Klasör açılamadı:', err);
    return { error: err.message || 'Klasör açılamadı.' };
  }
});

ipcMain.handle('workspace:recent', async () =>
  readRecent()
    .filter((p) => fs.existsSync(p))
    .map((p) => ({ path: p, name: path.basename(p) }))
);

// Yalnız daha önce diyalogla seçilmiş (son klasörler listesindeki) yollar açılır: rastgele yol açılamaz.
ipcMain.handle('workspace:open', async (_event, folderPath) => {
  if (!isValidPath(folderPath) || !readRecent().includes(folderPath)) return { error: 'not-recent' };
  try {
    return await openWorkspace(folderPath);
  } catch (err) {
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
  return scanDirectory(dirPath);
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
function runGitCommand(args, cwd, { auth = false, raw = false, timeout = 120000 } = {}) {
  return new Promise((resolve) => {
    if (!isValidPath(cwd) || !fs.existsSync(cwd)) {
      resolve({ success: false, stdout: '', stderr: 'Geçersiz depo yolu.' });
      return;
    }
    // GIT_TERMINAL_PROMPT=0: kimlik sorusunda sonsuza dek beklemek yerine hata ver.
    const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C', ...(auth ? github.gitAuthEnv() : {}) };
    execFile('git', args, { cwd, env, timeout, windowsHide: true, maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout ? (raw ? stdout : stdout.trim()) : '',
        stderr: stderr ? stderr.trim() : (error ? error.message : '')
      });
    });
  });
}

const gitModule = require('./electron-git.cjs');
secrets.register();

// Pencere başlık çubuğu (özel) renkleri: yalnız önceden tanımlı iki tema kabul edilir.
const TITLEBAR = {
  dark: { color: '#181818', symbolColor: '#cccccc', height: 36 },
  light: { color: '#f8f8f8', symbolColor: '#3b3b3b', height: 36 }
};
ipcMain.handle('ui:setTheme', async (_event, mode) => {
  if (mode !== 'dark' && mode !== 'light') return { success: false };
  try {
    if (mainWindow && !mainWindow.isDestroyed() && typeof mainWindow.setTitleBarOverlay === 'function') {
      mainWindow.setTitleBarOverlay(TITLEBAR[mode]);
      mainWindow.setBackgroundColor(mode === 'dark' ? '#1f1f1f' : '#ffffff');
    }
  } catch (e) {
    console.warn('Başlık çubuğu rengi ayarlanamadı:', e);
  }
  return { success: true };
});

github.register({ getWindow: () => mainWindow, runGit: runGitCommand, isValidPath });
gitModule.register({ runGit: runGitCommand, github, isValidPath });

// ----------------------------------------------------
// Entegre terminal: çoklu kabuk oturumları (electron-term.cjs)
// ----------------------------------------------------
require('./electron-term.cjs').register({ getWindow: () => mainWindow, isValidPath });

// Arama (Ctrl+P / Ctrl+Shift+F) ve yapay zekâ asistanı (electron-ai.cjs)
require('./electron-search.cjs').register({ getRoot: () => workspaceRoot });
require('./electron-ai.cjs').register({ getWindow: () => mainWindow, getRoot: () => workspaceRoot });

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
