// GitHub kimlik doğrulama (OAuth Device Flow) ve canlı GitHub verisi.
// - Client secret gerekmez; masaüstü uygulamaları için GitHub'ın önerdiği akıştır.
// - Erişim token'ı yalnız ana süreçte tutulur, Electron safeStorage ile şifrelenip diske yazılır.
//   Renderer'a token ASLA gönderilmez; yalnız profil (login, ad, avatar) gider.
// - Ağ istekleri yalnız github.com ve api.github.com adreslerine yapılır.
const { app, ipcMain, safeStorage, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const GITHUB_SCOPES = 'repo read:user';
const ALLOWED_OPEN = ['https://github.com/', 'https://docs.github.com/'];

let session = { token: null, profile: null };
let pollAbort = null;

const tokenFile = () => path.join(app.getPath('userData'), 'github-token.bin');
const configFile = () => path.join(app.getPath('userData'), 'github-config.json');

// ---- Client ID: ortam değişkeni veya kullanıcının kaydettiği değer (koda gömülmez) ----
function getClientId() {
  if (process.env.NOVA_GITHUB_CLIENT_ID) return process.env.NOVA_GITHUB_CLIENT_ID.trim();
  try {
    const cfg = JSON.parse(fs.readFileSync(configFile(), 'utf8'));
    return typeof cfg.clientId === 'string' ? cfg.clientId.trim() : '';
  } catch {
    return '';
  }
}

function saveClientId(id) {
  fs.writeFileSync(configFile(), JSON.stringify({ clientId: id }), { mode: 0o600 });
}

// ---- Token saklama (şifreli) ----
function persistToken(token) {
  if (!safeStorage.isEncryptionAvailable()) return false; // şifreleyemiyorsak diske yazmayız
  fs.writeFileSync(tokenFile(), safeStorage.encryptString(token), { mode: 0o600 });
  return true;
}

function loadToken() {
  try {
    if (!safeStorage.isEncryptionAvailable() || !fs.existsSync(tokenFile())) return null;
    return safeStorage.decryptString(fs.readFileSync(tokenFile()));
  } catch {
    return null;
  }
}

function clearToken() {
  session = { token: null, profile: null };
  try { fs.rmSync(tokenFile(), { force: true }); } catch { /* yok */ }
}

// ---- HTTP yardımcıları ----
async function ghFetch(url, init = {}) {
  const u = new URL(url);
  if (u.protocol !== 'https:' || !['github.com', 'api.github.com'].includes(u.hostname)) {
    throw new Error('İzin verilmeyen adres.');
  }
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', 'User-Agent': 'NovaCode-Studio', ...(init.headers || {}) },
    signal: init.signal || AbortSignal.timeout(15000)
  });
  return res;
}

async function api(pathname) {
  if (!session.token) throw new Error('GitHub hesabı bağlı değil.');
  const res = await ghFetch(`https://api.github.com${pathname}`, {
    headers: { Authorization: `Bearer ${session.token}`, 'X-GitHub-Api-Version': '2022-11-28' }
  });
  if (res.status === 401) {
    clearToken();
    throw new Error('GitHub oturumu geçersiz. Tekrar bağlanın.');
  }
  if (!res.ok) throw new Error(`GitHub API hatası (${res.status}).`);
  return res.json();
}

async function loadProfile() {
  const u = await api('/user');
  session.profile = { login: u.login, name: u.name || '', avatarUrl: u.avatar_url || '' };
  return session.profile;
}

// Git komutlarına geçici kimlik bilgisi: argüman değil ortam değişkeni (süreç listesinde görünmez),
// yalnız github.com adresleri için, diske yazılmaz.
function gitAuthEnv() {
  if (!session.token) return {};
  const basic = Buffer.from(`x-access-token:${session.token}`).toString('base64');
  return {
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
    GIT_CONFIG_VALUE_0: `Authorization: Basic ${basic}`
  };
}

function parseRemote(url) {
  const m = /github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(url || '');
  return m ? { owner: m[1], repo: m[2] } : null;
}

function register({ getWindow, runGit, isValidPath }) {
  const notify = (payload) => {
    const w = getWindow();
    if (w && !w.isDestroyed()) w.webContents.send('github:auth', payload);
  };

  // Uygulama açılışında kayıtlı oturumu sessizce geri yükle.
  const restore = async () => {
    const token = loadToken();
    if (!token) return;
    session.token = token;
    try {
      notify({ state: 'connected', profile: await loadProfile() });
    } catch {
      /* ağ yoksa token saklı kalır; sonraki durum sorgusunda tekrar denenir */
    }
  };
  app.whenReady().then(() => setTimeout(restore, 800));

  ipcMain.handle('github:status', async () => {
    if (session.token && !session.profile) {
      try { await loadProfile(); } catch { /* çevrimdışı */ }
    }
    return {
      connected: !!session.token && !!session.profile,
      profile: session.profile,
      hasClientId: !!getClientId(),
      canStoreToken: safeStorage.isEncryptionAvailable()
    };
  });

  ipcMain.handle('github:setClientId', async (_e, id) => {
    if (typeof id !== 'string' || !/^[A-Za-z0-9._-]{10,64}$/.test(id.trim())) {
      return { success: false, error: 'Geçersiz Client ID.' };
    }
    saveClientId(id.trim());
    return { success: true };
  });

  // Cihaz akışı: kod al, tarayıcıyı aç, kullanıcı onaylayana kadar arka planda sorgula.
  ipcMain.handle('github:login', async () => {
    const clientId = getClientId();
    if (!clientId) return { success: false, error: 'client-id-missing' };
    if (pollAbort) pollAbort.abort();
    const abort = (pollAbort = new AbortController());
    try {
      const res = await ghFetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, scope: GITHUB_SCOPES })
      });
      const d = await res.json();
      if (!res.ok || !d.device_code) return { success: false, error: d.error_description || 'Kod alınamadı.' };

      shell.openExternal(d.verification_uri).catch(() => {});

      (async () => {
        let interval = Math.max(5, d.interval || 5);
        const deadline = Date.now() + (d.expires_in || 900) * 1000;
        while (!abort.signal.aborted && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, interval * 1000));
          if (abort.signal.aborted) return;
          try {
            const tr = await ghFetch('https://github.com/login/oauth/access_token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_id: clientId,
                device_code: d.device_code,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
              })
            });
            const t = await tr.json();
            if (t.access_token) {
              session.token = t.access_token;
              const stored = persistToken(t.access_token);
              notify({ state: 'connected', profile: await loadProfile(), stored });
              return;
            }
            if (t.error === 'slow_down') interval += 5;
            else if (t.error === 'access_denied') return notify({ state: 'error', error: 'denied' });
            else if (t.error === 'expired_token') break;
            else if (t.error && t.error !== 'authorization_pending') return notify({ state: 'error', error: t.error });
          } catch {
            /* geçici ağ hatası: sorgulamaya devam */
          }
        }
        if (!abort.signal.aborted) notify({ state: 'error', error: 'expired' });
      })();

      return { success: true, userCode: d.user_code, verificationUri: d.verification_uri, expiresIn: d.expires_in };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('github:cancel', async () => {
    if (pollAbort) pollAbort.abort();
    return { success: true };
  });

  ipcMain.handle('github:logout', async () => {
    if (pollAbort) pollAbort.abort();
    clearToken();
    notify({ state: 'disconnected' });
    return { success: true };
  });

  ipcMain.handle('github:openExternal', async (_e, url) => {
    if (typeof url === 'string' && ALLOWED_OPEN.some((p) => url.startsWith(p))) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false };
  });

  // Açık deponun GitHub'daki canlı durumu: açık PR sayısı, son Actions koşuları.
  ipcMain.handle('github:repoInfo', async (_e, repoPath) => {
    if (!session.token || !isValidPath(repoPath)) return { available: false };
    const remote = await runGit(['remote', 'get-url', 'origin'], repoPath);
    const parsed = remote.success ? parseRemote(remote.stdout) : null;
    if (!parsed) return { available: false };
    try {
      const base = `/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
      const [repo, runs, pulls] = await Promise.all([
        api(base),
        api(`${base}/actions/runs?per_page=3`).catch(() => ({ workflow_runs: [] })),
        api(`${base}/pulls?state=open&per_page=5`).catch(() => [])
      ]);
      return {
        available: true,
        fullName: repo.full_name,
        url: repo.html_url,
        stars: repo.stargazers_count,
        openIssues: repo.open_issues_count,
        runs: (runs.workflow_runs || []).map((r) => ({
          id: r.id, name: r.name, status: r.status, conclusion: r.conclusion, url: r.html_url, branch: r.head_branch
        })),
        pulls: pulls.map((p) => ({ number: p.number, title: p.title, url: p.html_url, author: p.user?.login }))
      };
    } catch (err) {
      return { available: false, error: err.message };
    }
  });
}

module.exports = { register, gitAuthEnv };
