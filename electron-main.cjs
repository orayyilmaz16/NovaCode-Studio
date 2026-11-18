const { app, BrowserWindow, ipcMain, dialog, shell, protocol } = require('electron');

// Tek örnek kilidi EN BAŞTA: ikinci örnek ağır modülleri yüklemeden hemen çıkar (P-20).
if (!app.requestSingleInstanceLock()) {
  app.quit();
  return;
}

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { execFile } = require('child_process');
const github = require('./electron-github.cjs');
const secrets = require('./electron-secrets.cjs');
const { createGuards, isValidPath } = require('./electron-paths.cjs');
const { createIgnoreMatcher } = require('./electron-gitignore.cjs');
const localHistory = require('./electron-history.cjs').create({
  userDataDir: app.getPath('userData'),
  getRoot: () => workspaceRoot,
  isInside: (p) => withinWorkspace(p)
});
const preview = require('./electron-preview.cjs');

// Önizleme ayrı köken (S-01): `nova-preview://` şeması 'ready' öncesi kaydedilmeli; içerik app.whenReady içinde sunulur.
protocol.registerSchemesAsPrivileged([preview.PREVIEW_SCHEME_REGISTRATION]);
const previewStore = preview.createPreviewStore();

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEV_ORIGIN = 'http://localhost:5173';

let mainWindow;
let activeWatcher = null;
let activeGitWatcher = null;
const approvedFiles = new Set(); // diyalogla açılan dosyalar (çalışma klasörü dışında olabilir); yalnız bunlara yazılabilir
const approvalKey = (p) => path.resolve(p).toLowerCase();
let workspaceRoot = ''; // açık çalışma klasörü (arama ve yapay zekâ araçları yalnız bunun içinde çalışır)

// Yol doğrulama (gerçek yol/symlink çözümlü): electron-paths.cjs, testi scripts/tests/paths.test.cjs
const guards = createGuards(() => workspaceRoot);
const { withinWorkspace } = guards;
const insideWorkspace = (p) => guards.insideWorkspace(p, true);
const insideWorkspaceLink = (p) => guards.insideWorkspace(p, false); // silme/yeniden adlandırma: son bileşen symlink ise kendisi işlenir

// ----------------------------------------------------
// Pencere, gezinme güvenliği, kapanış
// ----------------------------------------------------
const CLOSE_TIMEOUT_MS = 5000; // renderer yanıt vermezse (donmuş/yüklenmemiş) pencere kapatılır
let quitting = false;      // app.quit() / güncelleme yeniden başlatması: kapanış denetimi devre dışı
let forceClose = false;    // renderer onayladı ya da zaman aşımı: pencere gerçekten kapanır
let closePending = false;
let closeTimer = null;
let quitAfterClose = false;

const appIndexPath = () => pathToFileURL(path.join(__dirname, 'dist', 'index.html')).pathname;
function isAppUrl(raw) {
  try {
    const u = new URL(raw);
    if (isDev) return u.origin === DEV_ORIGIN;
    return u.protocol === 'file:' && u.pathname === appIndexPath();
  } catch {
    return false;
  }
}

// Dış bağlantı: yalnız https, kimlik bilgisi içermeyen adres
function openExternalSafe(raw) {
  try {
    const u = new URL(String(raw));
    if (u.protocol !== 'https:' || u.username || u.password) return false;
    void shell.openExternal(u.toString());
    return true;
  } catch {
    return false;
  }
}

function settleClose(allow) {
  if (!closePending) return;
  closePending = false;
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  if (!allow) { quitAfterClose = false; return; }
  forceClose = true;
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
}

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
      // Preload yalnız `electron` (contextBridge, ipcRenderer, webFrame) kullanır: sandbox ile uyumludur.
      sandbox: true,
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
    mainWindow.loadURL(DEV_ORIGIN);
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

  // Dış bağlantı yalnız https; pencere içi gezinme yalnız uygulamanın kendi sayfası (S-11)
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    openExternalSafe(targetUrl);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (isAppUrl(targetUrl)) return;
    event.preventDefault();
    openExternalSafe(targetUrl);
  });
  mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault());

  // Kapanış: kaydedilmemiş değişiklik denetimi renderer'dadır (app:close-request → app:close-response).
  mainWindow.on('close', (event) => {
    if (quitting || forceClose) return;
    const wc = mainWindow.webContents;
    // Yüklenmemiş/çökmüş sayfa soruyu yanıtlayamaz: doğrudan kapat
    if (wc.isDestroyed() || wc.isCrashed() || wc.isLoading()) return;
    event.preventDefault();
    if (closePending) return;
    closePending = true;
    closeTimer = setTimeout(() => settleClose(true), CLOSE_TIMEOUT_MS);
    wc.send('app:close-request');
  });
  // Renderer onay penceresini açtıysa kullanıcıyı beklemek için zamanlayıcı durur; donma/çökme olursa yeniden başlar
  mainWindow.webContents.on('render-process-gone', () => settleClose(true));
  mainWindow.webContents.on('unresponsive', () => {
    if (!closePending) return;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => settleClose(true), CLOSE_TIMEOUT_MS);
  });

  mainWindow.on('closed', () => {
    stopFileWatcher();
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    closePending = false;
    forceClose = false;
    mainWindow = null;
    if (quitAfterClose) { quitAfterClose = false; app.quit(); }
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
// İzleyici (watcher) için ek derleme/önbellek klasörleri: ağaçta görünür ama değişimleri olay seli yaratmaz
const WATCH_IGNORED = new Set([...IGNORED_DIRS, 'out', 'build', 'target', '.cache', '.turbo']);
const TMP_PREFIX = '.nova-tmp-'; // atomik yazma geçici dosyaları
const MAX_TREE_NODES = 5000; // büyük klasörlerde arayüzün ve sürecin takılmasını önler

// Kendi yazdığımız dosyalar: izleyici bunları kısa süre bildirmez (renderer zaten biliyor; gereksiz ağaç/git yenilemesi olmasın)
const SELF_WRITE_MS = 800;
const selfWrites = new Map(); // anahtar -> bitiş zamanı
function markSelfWrite(p) {
  const now = Date.now();
  if (selfWrites.size > 200) for (const [k, until] of selfWrites) if (until <= now) selfWrites.delete(k);
  selfWrites.set(approvalKey(p), now + SELF_WRITE_MS);
}
const isSelfWrite = (p) => {
  const until = selfWrites.get(approvalKey(p));
  return !!until && until > Date.now();
};

// Asenkron tarama: ana süreç bloklanmaz, toplam düğüm sayısı sınırlıdır.
// Kök .gitignore (P-16): eşleşen klasörler ağaçta görünür ama yalnız ilk düzeyi taranır (out/, build/ gibi büyük çıktılar bütçeyi yemez).
async function loadIgnoreCtx(dirPath) {
  const root = workspaceRoot && path.resolve(dirPath).toLowerCase().startsWith(path.resolve(workspaceRoot).toLowerCase()) ? path.resolve(workspaceRoot) : path.resolve(dirPath);
  try {
    const st = await fs.promises.stat(path.join(root, '.gitignore'));
    if (!st.isFile() || st.size > 64 * 1024) return { root, isIgnored: () => false };
    return { root, isIgnored: createIgnoreMatcher(await fs.promises.readFile(path.join(root, '.gitignore'), 'utf8')) };
  } catch {
    return { root, isIgnored: () => false };
  }
}

async function scanDirectory(dirPath, budget = { left: MAX_TREE_NODES }, maxDepth = 4, currentDepth = 0, ctx = null) {
  if (currentDepth > maxDepth || budget.left <= 0) return [];
  let entries;
  try {
    entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch (err) {
    return [];
  }
  if (!ctx) ctx = await loadIgnoreCtx(dirPath);
  const items = [];
  for (const entry of entries) {
    if (budget.left <= 0) break;
    if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(TMP_PREFIX)) continue;
    budget.left--;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const ignoredDir = ctx.isIgnored(path.relative(ctx.root, fullPath), true);
      items.push({
        id: fullPath,
        name: entry.name,
        path: fullPath,
        type: 'folder',
        isOpen: currentDepth < 1 && !ignoredDir,
        children: await scanDirectory(fullPath, budget, ignoredDir ? currentDepth + 1 : maxDepth, currentDepth + 1, ctx)
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
    cs: 'csharp', php: 'php', rb: 'ruby', lua: 'lua',
    md: 'markdown', markdown: 'markdown', py: 'python', rs: 'rust', go: 'go',
    c: 'cpp', cpp: 'cpp', h: 'cpp', hpp: 'cpp', java: 'java', sql: 'sql',
    sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'shell', yaml: 'yaml', yml: 'yaml'
  };
  return map[ext] || 'plaintext';
}

const WATCH_DEBOUNCE_MS = 150;
const WATCH_MAX_WAIT_MS = 1000; // sürekli değişiklik olsa bile en geç bu sürede bir bildirim gider

function startFileWatcher(rootPath) {
  stopFileWatcher();
  try {
    let debounceTimer;
    let firstPendingAt = 0;
    const pending = new Set();
    let lastName = '';
    const flush = () => {
      debounceTimer = undefined;
      firstPendingAt = 0;
      const changed = Array.from(pending).slice(0, 200);
      pending.clear();
      if (changed.length && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('fs:watch-change', { filename: lastName, rootPath, changed });
      }
    };
    const watcher = fs.watch(rootPath, { recursive: true }, (_eventType, filename) => {
      // node_modules gibi büyük klasörler olay selini tetiklemesin; atomik yazma geçici dosyaları ve kendi yazımlarımız da atlanır
      const name = filename ? String(filename) : '';
      if (name) {
        const parts = name.split(/[\\/]/);
        if (parts.some((part) => WATCH_IGNORED.has(part) || part.startsWith(TMP_PREFIX))) return;
        const full = path.join(rootPath, name);
        if (isSelfWrite(full)) return;
        pending.add(full);
        lastName = name;
      } else {
        lastName = '';
      }
      if (!firstPendingAt) firstPendingAt = Date.now();
      clearTimeout(debounceTimer);
      // Sondan debounce + azami bekleme: aralıksız olay selinde de en geç ~1 sn'de bildirim
      const wait = Math.max(0, Math.min(WATCH_DEBOUNCE_MS, WATCH_MAX_WAIT_MS - (Date.now() - firstPendingAt)));
      debounceTimer = setTimeout(flush, wait);
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
    let hasGitDir = false;
    try { hasGitDir = fs.statSync(gitDir).isDirectory(); } catch { /* .git yok */ }
    if (hasGitDir) {
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

const pathExists = (p) => fs.promises.access(p).then(() => true, () => false);

// ----------------------------------------------------
// IPC Handlers: Dialogs & Real FS
// ----------------------------------------------------
// Özel pencere düğmeleri: yalnız ana pencerenin kendi sayfasından gelen çağrılar kabul edilir.
const fromMain = (e) => mainWindow && !mainWindow.isDestroyed() && e.sender === mainWindow.webContents;

// Çıkış menüsü/düğmesi de kaydedilmemiş değişiklik denetiminden geçer (pencere kapatma yolu); pencere yoksa doğrudan çıkılır.
ipcMain.handle('app:quit', (e) => {
  if (!fromMain(e)) return;
  quitAfterClose = true;
  mainWindow.close();
});
// Renderer "yaşıyorum, kullanıcıya soruyorum" der: kapanış zamanlayıcısı karar gelene kadar durur
ipcMain.on('app:close-pending', (e) => {
  if (!fromMain(e) || !closePending) return;
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
});
// Renderer yanıtı: true = kapat, false = vazgeç
ipcMain.on('app:close-response', (e, allow) => {
  if (fromMain(e) && typeof allow === 'boolean') settleClose(allow);
});

ipcMain.handle('win:minimize', (e) => { if (fromMain(e)) mainWindow.minimize(); });
ipcMain.handle('win:toggle-maximize', (e) => {
  if (!fromMain(e)) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
  return mainWindow.isMaximized();
});
ipcMain.handle('win:close', (e) => { if (fromMain(e)) mainWindow.close(); });
ipcMain.handle('win:is-maximized', (e) => (fromMain(e) ? mainWindow.isMaximized() : false));

// Son açılan klasörler: yalnız kullanıcının seçtiği klasör yolları, yerelde (userData) saklanır; hiçbir yere gönderilmez.
// Okuma tek seferde yapılır ve kısa süre paylaşılır (iki bileşenin aynı anda istemesi tek disk turu olur).
const RECENT_MAX = 8;
const RECENT_TTL_MS = 1000;
const recentFile = () => path.join(app.getPath('userData'), 'recent-folders.json');
let recentRaw = null; // { at, list }
let recentRawInflight = null;
let recentView = null; // { at, list } (var olanlar)
let recentViewInflight = null;

function readRecent() {
  if (recentRaw && Date.now() - recentRaw.at < RECENT_TTL_MS) return Promise.resolve(recentRaw.list);
  if (!recentRawInflight) {
    recentRawInflight = (async () => {
      let list = [];
      try {
        const parsed = JSON.parse(await fs.promises.readFile(recentFile(), 'utf8'));
        list = Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : [];
      } catch { /* dosya yok/bozuk: boş liste */ }
      recentRaw = { at: Date.now(), list };
      return list;
    })().finally(() => { recentRawInflight = null; });
  }
  return recentRawInflight;
}

async function pushRecent(folderPath) {
  const list = [folderPath, ...(await readRecent()).filter((p) => p !== folderPath)].slice(0, RECENT_MAX);
  recentRaw = { at: Date.now(), list };
  recentView = null;
  try {
    await fs.promises.writeFile(recentFile(), JSON.stringify(list), { mode: 0o600 });
  } catch (e) {
    console.warn('Son klasörler kaydedilemedi:', e);
  }
}

async function openWorkspace(folderPath) {
  let isDir = false;
  if (isValidPath(folderPath)) {
    try { isDir = (await fs.promises.stat(folderPath)).isDirectory(); } catch { /* yok */ }
  }
  if (!isDir) throw new Error('Seçilen klasör bulunamadı veya erişilemiyor.');
  startFileWatcher(folderPath);
  workspaceRoot = folderPath;
  await pushRecent(folderPath);
  return {
    rootPath: folderPath,
    rootName: path.basename(folderPath),
    trusted: trustModule.isTrusted(folderPath),
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

ipcMain.handle('workspace:recent', () => {
  if (recentView && Date.now() - recentView.at < RECENT_TTL_MS) return recentView.list;
  if (!recentViewInflight) {
    recentViewInflight = (async () => {
      const list = await readRecent();
      const exists = await Promise.all(list.map(pathExists));
      const view = list.filter((_p, i) => exists[i]).map((p) => ({ path: p, name: path.basename(p) }));
      recentView = { at: Date.now(), list: view };
      return view;
    })().finally(() => { recentViewInflight = null; });
  }
  return recentViewInflight;
});

// Yalnız daha önce diyalogla seçilmiş (son klasörler listesindeki) yollar açılır: rastgele yol açılamaz.
ipcMain.handle('workspace:open', async (_event, folderPath) => {
  if (!isValidPath(folderPath) || !(await readRecent()).includes(folderPath)) return { error: 'not-recent' };
  try {
    return await openWorkspace(folderPath);
  } catch (err) {
    return { error: err.message || 'Klasör açılamadı.' };
  }
});

// ---- Metin dosyası okuma: boyut sınırı, ikili tespiti, UTF-8 BOM ----
const MAX_OPEN_BYTES = 5 * 1024 * 1024;       // varsayılan eşik: üstü 'file-too-large'
const MAX_OPEN_BYTES_HARD = 64 * 1024 * 1024; // renderer eşiği artırsa bile üst sınır
const bomFiles = new Set(); // UTF-8 BOM'lu okunan dosyalar: yazarken BOM geri eklenir
const bomRemember = (p, has) => {
  const k = approvalKey(p);
  if (has) { if (bomFiles.size > 2000) bomFiles.clear(); bomFiles.add(k); } else bomFiles.delete(k);
};
const looksBinary = (buf) => {
  const n = Math.min(buf.length, 8000);
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true;
  return false;
};

// -> { content } | { error: 'file-too-large' | 'binary-file', size }
async function readTextFile(filePath, maxBytes = MAX_OPEN_BYTES) {
  const st = await fs.promises.stat(filePath);
  if (!st.isFile()) throw new Error('Bu bir dosya değil.');
  if (st.size > maxBytes) return { error: 'file-too-large', size: st.size };
  const buf = await fs.promises.readFile(filePath);
  if (looksBinary(buf)) return { error: 'binary-file', size: buf.length };
  const hasBom = buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  bomRemember(filePath, hasBom);
  return { content: buf.toString('utf8', hasBom ? 3 : 0) };
}

ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Açmak İçin Dosya Seçin'
  });
  if (result.canceled || !result.filePaths.length) return [];

  const files = [];
  for (const filePath of result.filePaths) {
    try {
      const r = await readTextFile(filePath);
      if (r.error) { console.warn('Dosya açılmadı (' + r.error + '):', path.basename(filePath)); continue; }
      approvedFiles.add(approvalKey(filePath));
      const name = path.basename(filePath);
      const ext = path.extname(name).toLowerCase().replace('.', '');
      files.push({
        id: filePath,
        name,
        path: filePath,
        type: 'file',
        content: r.content,
        language: ext === 'ts' ? 'typescript' : ext === 'js' ? 'javascript' : ext
      });
    } catch (e) {
      console.warn('Dosya okunamadı:', path.basename(filePath), e && e.message);
    }
  }
  return files;
});

// Önizleme içeriği (HTML) kısa ömürlü kimlikle bellekte tutulur; iframe `nova-preview://<kimlik>/` adresinden yükler. Yalnız ana pencerenin ana çerçevesi yazabilir.
ipcMain.handle('preview:put', (event, html) => {
  if (!mainWindow || mainWindow.isDestroyed() || event.sender !== mainWindow.webContents || !event.senderFrame || event.senderFrame.parent) return null;
  return previewStore.put(html);
});
ipcMain.handle('preview:drop', (event, id) => {
  if (!mainWindow || mainWindow.isDestroyed() || event.sender !== mainWindow.webContents) return false;
  previewStore.drop(id);
  return true;
});

// Önizleme için yerel varlık (görsel/yazı tipi) → data URL. Yalnız çalışma klasörü (veya diyalogla açılmış dosya), izinli uzantılar, en çok 4 MB.
const DATA_MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon', bmp: 'image/bmp', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf' };
ipcMain.handle('fs:readDataUrl', async (_event, filePath) => {
  try {
    if (!isValidPath(filePath) || !(insideWorkspace(filePath) || approvedFiles.has(approvalKey(filePath)))) return { success: false, error: 'outside' };
    const mime = DATA_MIME[path.extname(filePath).slice(1).toLowerCase()];
    if (!mime) return { success: false, error: 'type' };
    const st = await fs.promises.stat(filePath);
    if (!st.isFile() || st.size > 4 * 1024 * 1024) return { success: false, error: 'size' };
    return { success: true, dataUrl: `data:${mime};base64,${(await fs.promises.readFile(filePath)).toString('base64')}` };
  } catch {
    return { success: false, error: 'read' };
  }
});

ipcMain.handle('fs:readDir', async (_event, dirPath) => {
  if (!withinWorkspace(dirPath)) return [];
  return scanDirectory(dirPath); // yoksa/okunamazsa boş liste döner
});

// Okuma: çalışma klasörü içi veya kullanıcının "Dosya Aç" diyaloğuyla seçtiği dosyalar (rastgele yol okunamaz).
// Başarı: dize (içerik). Başarısız: { success:false, error:'file-too-large', size } | { success:false, error:'binary-file' }.
// İkinci bağımsız değişken { maxBytes }: eşiği artırır ("yine de aç"); en çok 64 MB.
ipcMain.handle('fs:readFile', async (_event, filePath, opts) => {
  try {
    if (!(withinWorkspace(filePath) || (isValidPath(filePath) && approvedFiles.has(approvalKey(filePath))))) throw new Error('Yol çalışma klasörü dışında.');
    const req = opts && Number.isFinite(opts.maxBytes) ? opts.maxBytes : MAX_OPEN_BYTES;
    const r = await readTextFile(filePath, Math.min(MAX_OPEN_BYTES_HARD, Math.max(1024, req)));
    if (r.error) return { success: false, error: r.error, size: r.size };
    return r.content;
  } catch (err) {
    throw new Error('Dosya okunamadı: ' + err.message);
  }
});

// Atomik yazma: aynı klasörde geçici dosyaya yaz, sonra rename (çökmede dosya kesilmez, ana süreç bloklanmaz).
// Hedef symlink ise gerçek hedefe yazılır. Windows'ta rename kilit yüzünden başarısız olursa doğrudan yazmaya düşer.
async function atomicWrite(filePath, data) {
  const target = guards.resolveReal(filePath) || path.resolve(filePath);
  const tmp = path.join(path.dirname(target), `${TMP_PREFIX}${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  let mode;
  try { mode = (await fs.promises.stat(target)).mode & 0o777; } catch { /* yeni dosya */ }
  try {
    await fs.promises.writeFile(tmp, data, mode === undefined ? { encoding: 'utf8' } : { encoding: 'utf8', mode });
    await fs.promises.rename(tmp, target);
  } catch (err) {
    await fs.promises.rm(tmp, { force: true }).catch(() => {});
    if (err && ['EPERM', 'EBUSY', 'EACCES', 'EXDEV'].includes(err.code)) {
      await fs.promises.writeFile(target, data, 'utf8');
      return;
    }
    throw err;
  }
}

// Yazma/silme/oluşturma: yol açık çalışma klasörünün içinde olmalı (yazma için ayrıca diyalogla açılmış dosyalar da olabilir).
const OUTSIDE = { success: false, error: 'Yol çalışma klasörü dışında.' };
const writable = (p) => insideWorkspace(p) || (isValidPath(p) && approvedFiles.has(approvalKey(p)));
ipcMain.handle('fs:writeFile', async (_event, filePath, content) => {
  try {
    if (!writable(filePath) || typeof content !== 'string') return OUTSIDE;
    // Okurken BOM atıldıysa geri eklenir (dosyanın özgün kodlaması korunur)
    const data = bomFiles.has(approvalKey(filePath)) && content.charCodeAt(0) !== 0xFEFF ? '\uFEFF' + content : content;
    markSelfWrite(filePath);
    await localHistory.snapshot(filePath, data); // F-07: eski içerik yerel geçmişe (hata fırlatmaz, kaydı engellemez)
    await atomicWrite(filePath, data);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:createFile', async (_event, filePath) => {
  try {
    if (!insideWorkspace(filePath)) return OUTSIDE;
    try {
      await fs.promises.writeFile(filePath, '', { encoding: 'utf8', flag: 'wx' }); // varsa dokunma
    } catch (e) {
      if (!e || e.code !== 'EEXIST') throw e;
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:createFolder', async (_event, folderPath) => {
  try {
    if (!insideWorkspace(folderPath)) return OUTSIDE;
    await fs.promises.mkdir(folderPath, { recursive: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Silme (B-04): varsayılan olarak çöp kutusuna taşınır (geri alınabilir). Çöp kutusu başarısızsa { trashFailed: true } döner;
// arayüz kullanıcıdan onay alırsa `{ permanent: true }` ile kalıcı silme istenir. Tek dosya silinirse yerel geçmişe de anlık görüntü alınır (F-07).
ipcMain.handle('fs:deleteItem', async (_event, targetPath, opts) => {
  try {
    if (!insideWorkspaceLink(targetPath)) return OUTSIDE; // kök klasörün kendisi de silinemez; symlink ise bağın kendisi silinir
    try { if ((await fs.promises.lstat(targetPath)).isFile()) await localHistory.snapshot(targetPath); } catch { /* yok/okunamaz */ }
    if (opts && opts.permanent === true) {
      await fs.promises.rm(targetPath, { recursive: true, force: true });
      return { success: true, trashed: false };
    }
    try {
      await shell.trashItem(path.resolve(targetPath));
      return { success: true, trashed: true };
    } catch (e) {
      return { success: false, trashFailed: true, error: e && e.message ? e.message : 'trash-failed' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:renameItem', async (_event, oldPath, newPath) => {
  try {
    if (!insideWorkspaceLink(oldPath) || !insideWorkspaceLink(newPath)) return { success: false, error: 'Yol çalışma klasörü dışında.' };
    if (path.resolve(newPath).toLowerCase().startsWith(path.resolve(oldPath).toLowerCase() + path.sep)) return { success: false, error: 'Klasör kendi içine taşınamaz.' };
    const samePathDifferentCase = path.resolve(oldPath).toLowerCase() === path.resolve(newPath).toLowerCase();
    if (!samePathDifferentCase && await pathExists(newPath)) return { success: false, error: 'Aynı adlı bir öğe zaten var.' };
    await fs.promises.rename(oldPath, newPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Dosya gezgininde göster (Windows Gezgini / Finder): yalnız çalışma klasörü içindeki var olan yollar
ipcMain.handle('app:reveal', async (_event, target) => {
  try {
    if (!isValidPath(target) || !(await pathExists(target))) return { success: false };
    if (!withinWorkspace(target)) return { success: false };
    shell.showItemInFolder(path.resolve(target));
    return { success: true };
  } catch {
    return { success: false };
  }
});

// ----------------------------------------------------
// IPC Handlers: Real Git Integration
// ----------------------------------------------------
// Kabuk kullanılmaz (execFile): argümanlar doğrudan git'e gider, enjeksiyon olmaz.
// Güvenilmeyen depodaki .git/config kod çalıştırmasın diye (S-07): fsmonitor kapalı, sayfalayıcı `cat`, ext:: aktarımı yasak,
// ssh komutu ortamdan ya da düz `ssh` (depodaki core.sshCommand yok sayılır; GIT_SSH_COMMAND yapılandırmadan önceliklidir).
const trustModule = require('./electron-trust.cjs');
const GIT_SAFE_ARGS = ['-c', 'core.fsmonitor=false', '-c', 'core.pager=cat', '-c', 'protocol.ext.allow=never'];
async function runGitCommand(args, cwd, { auth = false, raw = false, timeout = 120000 } = {}) {
  if (!isValidPath(cwd) || !(await pathExists(cwd))) {
    return { success: false, stdout: '', stderr: 'Geçersiz depo yolu.' };
  }
  // Güvenilmeyen klasörde (kısıtlı mod) yalnız okuma komutları çalışır; hook/filtre/harici fark kapalıdır (electron-trust.cjs).
  const gate = trustModule.gateGit(args, workspaceRoot || cwd, trustModule.isTrusted(workspaceRoot));
  if (!gate.allow) return { success: false, stdout: '', stderr: gate.error };
  args = gate.args;
  // GIT_TERMINAL_PROMPT=0: kimlik sorusunda sonsuza dek beklemek yerine hata ver.
  const env = {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    LC_ALL: 'C',
    GIT_SSH_COMMAND: process.env.GIT_SSH_COMMAND || 'ssh',
    ...(auth ? github.gitAuthEnv() : {})
  };
  return new Promise((resolve) => {
    execFile('git', [...GIT_SAFE_ARGS, ...args], { cwd, env, timeout, windowsHide: true, maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
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
trustModule.register({ getWindow: () => mainWindow, getRoot: () => workspaceRoot });

// ----------------------------------------------------
// Entegre terminal: çoklu kabuk oturumları (electron-term.cjs)
// ----------------------------------------------------
// Klasik terminal de gerçek terminal gibi çalışma klasörü dışında oturum açamaz (S-23).
const termModule = require('./electron-term.cjs');
termModule.register({ getWindow: () => mainWindow, isValidPath: withinWorkspace });
// Gerçek terminal (PTY, xterm.js ile): çalışma klasörü dışında oturum açılamaz (electron-pty.cjs)
const ptyModule = require('./electron-pty.cjs');
ptyModule.register({ getWindow: () => mainWindow, isValidPath: withinWorkspace });

// Arama (Ctrl+P / Ctrl+Shift+F)
require('./electron-search.cjs').register({ getRoot: () => workspaceRoot });

// Kullanıcı snippet'leri (F-06): çalışma klasörü .nova/snippets.json + genel dosya (userData)
require('./electron-snippets.cjs').register({ getRoot: () => workspaceRoot, userDataDir: app.getPath('userData'), isInside: insideWorkspace, fromMain });
// Yerel geçmiş IPC (F-07); anlık görüntü kancası fs:writeFile / fs:deleteItem içinde
localHistory.register({ ipcMain, fromMain });

// Ağır modüller (eklenti mağazası, güncelleme, yerel model, hata ayıklayıcı+ws, dil sunucusu, yapay zekâ) pencere
// oluşturulduktan SONRA yüklenir: renderer süreci paralel başlar. IPC işleyicileri aynı turda kaydedilir; renderer
// kodu henüz çalışmadığı için kanal eksik kalmaz (P-20).
let debugModule = null;
let lspModule = null;
let aiModule = null;
let deferredLoaded = false;
function registerDeferredModules() {
  if (deferredLoaded) return;
  deferredLoaded = true;
  require('./electron-ext.cjs').register();
  require('./electron-update.cjs').register({ getWindow: () => mainWindow });
  debugModule = require('./electron-debug.cjs');
  debugModule.register({ getWindow: () => mainWindow, getRoot: () => workspaceRoot });
  lspModule = require('./electron-lsp.cjs');
  lspModule.register({ getWindow: () => mainWindow, getRoot: () => workspaceRoot });
  aiModule = require('./electron-ai.cjs');
  aiModule.register({ getWindow: () => mainWindow, getRoot: () => workspaceRoot });
}

// ----------------------------------------------------
// Kapanış: yetim süreç bırakma (P-03, P-10, P-28)
// ----------------------------------------------------
// Güncelleme-yeniden-başlat dahil her çıkış yolu `before-quit` tetikler: kapanış denetimi kilitlenmez.
app.on('before-quit', () => { quitting = true; });

// Çağrı yoksa/işlev değilse atlanır (diğer modüllerin kapatma kancaları sonradan eklenebilir)
const callIfFn = (mod, name, ...args) => {
  try { if (mod && typeof mod[name] === 'function') return mod[name](...args); } catch (e) { console.warn('Kapanış kancası başarısız:', name, e && e.message); }
  return undefined;
};

let shutdownDone = false;
app.on('will-quit', () => {
  if (shutdownDone) return;
  shutdownDone = true;
  // Hepsi eşzamanlı ve sınırlı: kabuk/PTY/dil sunucusu/hata ayıklayıcı süreç ağaçları `taskkill /T /F` ile kapanır, shutdown RPC beklenmez.
  callIfFn(aiModule, 'stopWhisper');
  callIfFn(aiModule, 'killAll');   // ajan komutları (B kancası; yoksa atlanır)
  callIfFn(aiModule, 'stopAll');
  callIfFn(debugModule, 'killSync');
  callIfFn(ptyModule, 'stopAll');
  callIfFn(termModule, 'killAllSync');
  callIfFn(lspModule, 'stopAll', { fast: true });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  protocol.handle(preview.PREVIEW_SCHEME, (request) => {
    const r = preview.previewResponse(previewStore, request.url, request.method);
    return new Response(r.body || null, { status: r.status, headers: r.headers });
  });
  createWindow();
  registerDeferredModules();
});

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
