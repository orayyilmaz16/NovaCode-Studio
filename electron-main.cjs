const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile, execFileSync, spawn } = require('child_process');
const github = require('./electron-github.cjs');
const secrets = require('./electron-secrets.cjs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let activeWatcher = null;
let activeGitWatcher = null;

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
// IPC Handlers: Gerçek shell (PowerShell / CMD), kalıcı oturumlar
// ----------------------------------------------------
// PTY değil, stdin/stdout borusu: çoğu komut çalışır, renkli/tam ekran programlar çalışmaz.
// Her shell bir kez başlar ve sekme değişince kapanmaz; böylece tekrar açmak anında olur.
const shells = new Map(); // name -> { proc, cwd }
let cachedPwsh = null;

function hasPwsh() {
  if (cachedPwsh !== null) return cachedPwsh;
  if (process.platform !== 'win32') return (cachedPwsh = false);
  try { execFileSync('where.exe', ['pwsh'], { windowsHide: true, stdio: 'ignore' }); cachedPwsh = true; }
  catch { cachedPwsh = false; }
  return cachedPwsh;
}

function stopShell(name) {
  const entry = shells.get(name);
  if (entry) {
    try { entry.proc.kill(); } catch (e) {}
    shells.delete(name);
  }
}

// Her komuttan sonra shell'e çalışma klasörünü yazdırtırız; bu satırları yakalayıp arayüzde istemde gösteririz.
const CWD_MARK = '@@NOVA_CWD@@';

function cwdProbe(name) {
  return name === 'cmd' ? `echo ${CWD_MARK}%CD%\r\n` : `Write-Host "${CWD_MARK}$((Get-Location).Path)"\n`;
}

// Akıştaki işaret satırlarını ayıklar. Tamamlanmamış satır işaretin başlangıcıysa bir sonraki parçaya kadar bekletilir.
function makeCwdFilter(name) {
  let buf = '';
  // CMD, kodlama değişmeden önce (bozuk karakterli) açılış başlığını basar; ilk işarete kadar çıktıyı at.
  let waitFirstMark = name === 'cmd';
  return (text) => {
    buf += text;
    const parts = buf.split('\n');
    const tail = parts.pop();
    let out = '';
    for (const line of parts) {
      const clean = line.replace(/\r$/, '');
      const idx = clean.indexOf(CWD_MARK);
      if (idx >= 0) {
        waitFirstMark = false;
        sendTerm('term:cwd', { shell: name, cwd: clean.slice(idx + CWD_MARK.length).trim() });
        // İşaretten önce gerçek çıktı varsa (satır sonu olmayan program çıktısı) onu koru.
        const before = clean.slice(0, idx).replace(/\x1b\[[0-9;]*m/g, '');
        if (before.trim()) out += clean.slice(0, idx) + '\n';
      } else if (!waitFirstMark) {
        out += clean + '\n';
      }
    }
    if (waitFirstMark) {
      buf = tail.length < 4096 ? tail : '';
      return out;
    }
    const bare = tail.replace(/\x1b\[[0-9;]*m/g, '');
    if (bare && (CWD_MARK.startsWith(bare) || bare.startsWith(CWD_MARK))) {
      buf = tail;
    } else {
      buf = '';
      out += tail;
    }
    return out;
  };
}

function sendTerm(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

ipcMain.handle('term:start', async (_event, shellName, cwd) => {
  const name = shellName === 'cmd' ? 'cmd' : 'powershell';
  if (!isValidPath(cwd) || !fs.existsSync(cwd)) {
    return { success: false, error: 'Çalışma klasörü yok. Önce bir klasör açın.' };
  }
  const existing = shells.get(name);
  if (existing && existing.cwd === cwd && existing.proc.exitCode === null) {
    existing.proc.stdin.write(cwdProbe(name)); // arayüz istemi güncel çalışma klasörünü öğrensin
    return { success: true, shell: name, reused: true };
  }
  stopShell(name);

  const isCmd = name === 'cmd';
  const command = isCmd ? 'cmd.exe' : (process.platform === 'win32' ? (hasPwsh() ? 'pwsh.exe' : 'powershell.exe') : 'bash');
  const args = isCmd
    ? ['/Q']
    : process.platform === 'win32'
      ? ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '-']
      : [];
  let proc;
  try {
    proc = spawn(command, args, {
      cwd,
      windowsHide: true,
      env: { ...process.env, FORCE_COLOR: '1', CLICOLOR_FORCE: '1', TERM: 'xterm-256color' }
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
  shells.set(name, { proc, cwd });

  // Türkçe karakterler için çıktı kodlamasını UTF-8'e al (Windows varsayılanı OEM kod sayfası).
  if (isCmd) {
    // chcp: UTF-8; prompt: CMD boru girdisinde bile istem basar, onu görünmez yapıp istemi arayüz çizer.
    proc.stdin.write('chcp 65001 >nul\r\nprompt $E[0m\r\n');
  } else if (process.platform === 'win32') {
    // PowerShell 7.2+ renkli (ANSI) çıktı verir; 5.1'de $PSStyle yoktur, koşul bunu korur.
    proc.stdin.write('[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8; if ($PSStyle) { $PSStyle.OutputRendering = "Ansi" }\n');
  }
  proc.stdin.write(cwdProbe(name));
  const outFilter = makeCwdFilter(name);
  proc.stdout.on('data', (chunk) => {
    const text = outFilter(chunk.toString('utf8'));
    if (text) sendTerm('term:output', { shell: name, text, stream: 'stdout' });
  });
  proc.stderr.on('data', (chunk) => sendTerm('term:output', { shell: name, text: chunk.toString('utf8'), stream: 'stderr' }));
  proc.on('error', (err) => sendTerm('term:output', { shell: name, text: `\n[shell hatası] ${err.message}\n` }));
  proc.on('exit', (code) => {
    if (shells.get(name)?.proc === proc) shells.delete(name);
    sendTerm('term:exit', { shell: name, code });
  });
  return { success: true, shell: command };
});

ipcMain.handle('term:input', async (_event, shellName, line) => {
  const entry = shells.get(shellName === 'cmd' ? 'cmd' : 'powershell');
  if (!entry || typeof line !== 'string' || line.length > 10000) {
    return { success: false, error: 'Shell çalışmıyor.' };
  }
  if (line.includes('\0')) return { success: false, error: 'Geçersiz komut.' };
  entry.proc.stdin.write(line + '\n' + cwdProbe(shellName === 'cmd' ? 'cmd' : 'powershell'));
  return { success: true };
});

ipcMain.handle('term:stop', async (_event, shellName) => {
  stopShell(shellName === 'cmd' ? 'cmd' : 'powershell');
  return { success: true };
});

app.on('before-quit', () => {
  for (const name of [...shells.keys()]) stopShell(name);
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
