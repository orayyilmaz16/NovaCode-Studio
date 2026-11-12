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
const approvedFiles = new Set(); // diyalogla açılan dosyalar (çalışma klasörü dışında olabilir); yalnız bunlara yazılabilir
const approvalKey = (p) => path.resolve(p).toLowerCase();
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
    // Özel başlık çubuğu: Windows/Linux'ta küçült/büyüt/kapat düğmelerini arayüz kendisi çizer (tasarıma uyumlu);
    // macOS'ta sistemin trafik ışıkları kalır.
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' } : { frame: false }),
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

  const sendMax = () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('win:maximized', mainWindow.isMaximized());
  };
  mainWindow.on('maximize', sendMax);
  mainWindow.on('unmaximize', sendMax);

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

// Özel pencere düğmeleri: yalnız ana pencerenin kendi sayfasından gelen çağrılar kabul edilir.
const fromMain = (e) => mainWindow && !mainWindow.isDestroyed() && e.sender === mainWindow.webContents;
ipcMain.handle('win:minimize', (e) => { if (fromMain(e)) mainWindow.minimize(); });
ipcMain.handle('win:toggle-maximize', (e) => {
  if (!fromMain(e)) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
  return mainWindow.isMaximized();
});
ipcMain.handle('win:close', (e) => { if (fromMain(e)) mainWindow.close(); });
ipcMain.handle('win:is-maximized', (e) => (fromMain(e) ? mainWindow.isMaximized() : false));

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
      title: 'Çalışma Alanı Klasörü Seçin',
      buttonLabel: 'Klasörü Seç'
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
      approvedFiles.add(approvalKey(filePath));
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

// Yeniden adlandırma ve sürükle-bırak taşıma: iki yol da açık çalışma klasörünün İÇİNDE olmalı; hedef varsa üzerine yazılmaz.
const withinWorkspace = (p) => {
  if (!workspaceRoot || !isValidPath(p)) return false;
  const rel = path.relative(path.resolve(workspaceRoot), path.resolve(p));
  return !rel.startsWith('..') && !path.isAbsolute(rel);
};
const insideWorkspace = (p) => {
  if (!workspaceRoot || !isValidPath(p)) return false;
  const rel = path.relative(path.resolve(workspaceRoot), path.resolve(p));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
};
// Önizleme için yerel varlık (görsel/yazı tipi) → data URL. Yalnız çalışma klasörü (veya diyalogla açılmış dosya), izinli uzantılar, en çok 4 MB.
const DATA_MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon', bmp: 'image/bmp', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf' };
ipcMain.handle('fs:readDataUrl', async (_event, filePath) => {
  try {
    if (!isValidPath(filePath) || !(insideWorkspace(filePath) || approvedFiles.has(approvalKey(filePath)))) return { success: false, error: 'outside' };
    const mime = DATA_MIME[path.extname(filePath).slice(1).toLowerCase()];
    if (!mime) return { success: false, error: 'type' };
    const st = fs.statSync(filePath);
    if (!st.isFile() || st.size > 4 * 1024 * 1024) return { success: false, error: 'size' };
    return { success: true, dataUrl: `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}` };
  } catch {
    return { success: false, error: 'read' };
  }
});

ipcMain.handle('fs:readDir', async (_event, dirPath) => {
  if (!withinWorkspace(dirPath) || !fs.existsSync(dirPath)) return [];
  return scanDirectory(dirPath);
});

// Okuma: çalışma klasörü içi veya kullanıcının "Dosya Aç" diyaloğuyla seçtiği dosyalar (rastgele yol okunamaz)
ipcMain.handle('fs:readFile', async (_event, filePath) => {
  try {
    if (!(withinWorkspace(filePath) || (isValidPath(filePath) && approvedFiles.has(approvalKey(filePath))))) throw new Error('Yol çalışma klasörü dışında.');
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error('Dosya okunamadı: ' + err.message);
  }
});

// Yazma/silme/oluşturma: yol açık çalışma klasörünün içinde olmalı (yazma için ayrıca diyalogla açılmış dosyalar da olabilir).
const OUTSIDE = { success: false, error: 'Yol çalışma klasörü dışında.' };
const writable = (p) => insideWorkspace(p) || (isValidPath(p) && approvedFiles.has(approvalKey(p)));
ipcMain.handle('fs:writeFile', async (_event, filePath, content) => {
  try {
    if (!writable(filePath) || typeof content !== 'string') return OUTSIDE;
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:createFile', async (_event, filePath) => {
  try {
    if (!insideWorkspace(filePath)) return OUTSIDE;
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
    if (!insideWorkspace(folderPath)) return OUTSIDE;
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
    if (!insideWorkspace(targetPath)) return OUTSIDE; // kök klasörün kendisi de silinemez
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
    if (!insideWorkspace(oldPath) || !insideWorkspace(newPath)) return { success: false, error: 'Yol çalışma klasörü dışında.' };
    if (path.resolve(newPath).toLowerCase().startsWith(path.resolve(oldPath).toLowerCase() + path.sep)) return { success: false, error: 'Klasör kendi içine taşınamaz.' };
    const samePathDifferentCase = path.resolve(oldPath).toLowerCase() === path.resolve(newPath).toLowerCase();
    if (!samePathDifferentCase && fs.existsSync(newPath)) return { success: false, error: 'Aynı adlı bir öğe zaten var.' };
    fs.renameSync(oldPath, newPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Dosya gezgininde göster (Windows Gezgini / Finder): yalnız çalışma klasörü içindeki var olan yollar
ipcMain.handle('app:reveal', async (_event, target) => {
  try {
    if (!isValidPath(target) || !fs.existsSync(target)) return { success: false };
    const root = workspaceRoot ? path.resolve(workspaceRoot) : '';
    const t = path.resolve(target);
    if (root && t !== root && !insideWorkspace(t)) return { success: false };
    shell.showItemInFolder(t);
    return { success: true };
  } catch {
    return { success: false };
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

// Başlık çubuğunu arayüz kendisi çizer (WindowControls); burada yalnız pencere zemin rengi temaya uydurulur.
// Yalnız önceden tanımlı iki tema kabul edilir. (setTitleBarOverlay özel çubukta olmadığı için çağrılmaz.)
ipcMain.handle('ui:setTheme', async (_event, mode) => {
  if (mode !== 'dark' && mode !== 'light') return { success: false };
  try {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setBackgroundColor(mode === 'dark' ? '#1f1f1f' : '#ffffff');
  } catch (e) {
    console.warn('Pencere zemin rengi ayarlanamadı:', e);
  }
  return { success: true };
});

// Depo yolu = açık çalışma klasörü (veya içi); rastgele klasörde git/GitHub işlemi yapılamaz
github.register({ getWindow: () => mainWindow, runGit: runGitCommand, isValidPath: withinWorkspace });
gitModule.register({ runGit: runGitCommand, github, isValidPath: withinWorkspace });

// ----------------------------------------------------
// Entegre terminal: çoklu kabuk oturumları (electron-term.cjs)
// ----------------------------------------------------
require('./electron-term.cjs').register({ getWindow: () => mainWindow, isValidPath });

// Arama (Ctrl+P / Ctrl+Shift+F) ve yapay zekâ asistanı (electron-ai.cjs)
require('./electron-search.cjs').register({ getRoot: () => workspaceRoot });
require('./electron-ext.cjs').register();
require('./electron-update.cjs').register({ getWindow: () => mainWindow });
require('./electron-llm.cjs').register({ getWindow: () => mainWindow });
const aiModule = require('./electron-ai.cjs');
aiModule.register({ getWindow: () => mainWindow, getRoot: () => workspaceRoot });
// Uygulamanın başlattığı yerel dikte sunucusu (whisper.cpp) uygulama kapanınca durdurulur
app.on('will-quit', () => aiModule.stopWhisper());

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
