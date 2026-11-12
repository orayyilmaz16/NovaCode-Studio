// Uygulama güncelleme (ana süreç): GitHub Releases üzerinden denetle → indir (yüzde ilerleme) → yeniden başlat ve kur.
// - Motor: electron-updater (latest.yml + .exe, SHA-512 doğrulaması). Paketli uygulamada çalışır; geliştirmede devre dışıdır
//   (test için NOVA_UPDATE_FEED=<url> ile yerel/generic besleme verilebilir).
// - Gizlilik/KVKK: denetim github.com'a gider (IP, uygulama sürümü, platform; kişisel veri yok). Yalnız kullanıcı isteğiyle
//   veya "açılışta denetle" ayarı açıksa yapılır. İndirme kullanıcı onayıyla başlar (otomatik indirme ayarı varsayılan kapalı).
// - Sürüm notları GitHub API'den MARKDOWN olarak alınır (HTML basılmaz); arayüz güvenli biçimde çizer.
const { app, ipcMain, net, shell } = require('electron');

const OWNER = 'orayyilmaz16';
const REPO = 'NovaCode-Studio';
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const FEED = process.env.NOVA_UPDATE_FEED || '';

let updater = null;
let state = { status: 'idle', current: app.getVersion(), latest: '', notes: '', percent: 0, transferred: 0, total: 0, speed: 0, error: '', checkedAt: 0, supported: false };

const supported = () => app.isPackaged || !!FEED;

function setState(patch, send) {
  state = { ...state, ...patch };
  send('update:state', state);
}

function getUpdater() {
  if (updater) return updater;
  const { autoUpdater } = require('electron-updater');
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.allowDowngrade = false;
  if (FEED) {
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.setFeedURL({ provider: 'generic', url: FEED });
  }
  updater = autoUpdater;
  return updater;
}

async function fetchJson(url) {
  const res = await net.fetch(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'NovaCode-Studio' } });
  if (!res.ok) throw new Error('http-' + res.status);
  return res.json();
}

// GitHub sürüm gövdesi (markdown); yoksa boş
async function notesFor(version) {
  try {
    const r = await fetchJson(`${API}/releases/tags/v${encodeURIComponent(version)}`);
    return String(r.body || '').slice(0, 20000);
  } catch { return ''; }
}

const errCode = (e) => {
  const m = String((e && e.message) || e);
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ENETUNREACH|ERR_INTERNET|ERR_NAME|ERR_CONNECTION|net::/i.test(m)) return 'network';
  if (/404|latest\.yml|Cannot find/i.test(m)) return 'no-release';
  if (/sha512|checksum/i.test(m)) return 'checksum';
  return 'failed';
};

function register({ getWindow }) {
  const send = (channel, payload) => {
    const w = getWindow();
    if (w && !w.isDestroyed()) w.webContents.send(channel, payload);
  };
  state.supported = supported();

  const bind = () => {
    const u = getUpdater();
    if (u.__novaBound) return u;
    u.__novaBound = true;
    u.on('checking-for-update', () => setState({ status: 'checking', error: '' }, send));
    u.on('update-available', async (info) => {
      if (state.status === 'ready' || state.status === 'downloading') return;
      setState({ status: 'available', latest: info.version, notes: '', percent: 0, checkedAt: Date.now() }, send);
      const notes = await notesFor(info.version);
      if (state.latest === info.version) setState({ notes }, send);
      if (global.__novaAutoDownload) void u.downloadUpdate().catch(() => undefined);
    });
    u.on('update-not-available', (info) => setState({ status: 'none', latest: info.version, checkedAt: Date.now() }, send));
    u.on('download-progress', (p) => setState({ status: 'downloading', percent: Math.round(p.percent || 0), transferred: p.transferred || 0, total: p.total || 0, speed: p.bytesPerSecond || 0 }, send));
    u.on('update-downloaded', () => setState({ status: 'ready', percent: 100 }, send));
    u.on('error', (e) => { console.warn('Güncelleme hatası:', e && e.message); setState({ status: 'error', error: errCode(e) }, send); });
    return u;
  };

  ipcMain.handle('update:state', () => state);

  ipcMain.handle('update:check', async (_e, opts) => {
    if (!supported()) { setState({ status: 'unsupported' }, send); return state; }
    global.__novaAutoDownload = !!(opts && opts.autoDownload);
    // İndirilmiş (hazır) veya indirilen güncelleme varken yeniden denetleme: durumu bozmaz
    if (['checking', 'downloading', 'ready'].includes(state.status)) return state;
    try { await bind().checkForUpdates(); } catch (e) { setState({ status: 'error', error: errCode(e) }, send); }
    return state;
  });

  ipcMain.handle('update:download', async () => {
    if (!supported() || state.status !== 'available') return state;
    try { setState({ status: 'downloading', percent: 0 }, send); await bind().downloadUpdate(); } catch (e) { console.warn('İndirme hatası:', e && e.message); setState({ status: 'error', error: errCode(e) }, send); }
    return state;
  });

  ipcMain.handle('update:install', () => {
    if (state.status !== 'ready') return { success: false };
    // Güvenlik: kurulum yalnız indirilmiş ve doğrulanmış paket için çağrılır
    setImmediate(() => bind().quitAndInstall(false, true));
    return { success: true };
  });

  // Son sürümler ve notları (Yardım → Sürüm notları)
  ipcMain.handle('update:releases', async () => {
    try {
      const list = await fetchJson(`${API}/releases?per_page=8`);
      return {
        success: true,
        releases: (Array.isArray(list) ? list : []).filter((r) => !r.draft).slice(0, 8).map((r) => ({
          version: String(r.tag_name || '').replace(/^v/, ''),
          name: String(r.name || r.tag_name || ''),
          date: String(r.published_at || ''),
          notes: String(r.body || '').slice(0, 20000),
          url: String(r.html_url || '')
        }))
      };
    } catch (e) {
      return { success: false, error: errCode(e), releases: [] };
    }
  });

  // Kullanıcı tıklamasıyla dış bağlantı (yalnız https; kimlik bilgisi içeren adres reddedilir)
  ipcMain.handle('app:openLink', async (_e, url) => {
    try {
      const u = new URL(String(url));
      if (u.protocol !== 'https:' || u.username || u.password) return { success: false };
      await shell.openExternal(u.toString());
      return { success: true };
    } catch { return { success: false }; }
  });
}

module.exports = { register };
