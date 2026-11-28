// Güncelleme modülü testleri (electron-update.cjs): kanal ve durum makinesi (denetle → indir → hazır → kur),
// kurulum yalnız hazır paket için, otomatik indirme ayarı, hata kodlarının sınıflandırılması, sürüm notları ve sürüm
// listesi, Hakkında (Electron son sürümü: sayısal karşılaştırma ve 6 saat önbellek), dış bağlantı izin listesi.
// `electron`, `electron-updater` (sahte EventEmitter) ve net.fetch taklit edilir; ağ yok.
// Çalıştırma: node scripts/tests/update.test.cjs
const Module = require('module');
const { EventEmitter } = require('events');
const path = require('path');

const MOD = path.join(__dirname, '..', '..', 'electron-update.cjs');
const API = 'https://api.github.com/repos/orayyilmaz16/NovaCode-Studio';
const FEED = 'http://localhost:9/feed';
const RUNTIME = 'https://electronjs.org/headers/index.json';

const handlers = {};
const sent = [];
const opened = [];
const netCalls = [];
let netRoute = () => { throw new TypeError('fetch failed: ağ kapalı (test)'); };
const res = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const electron = {
  app: { isPackaged: false, getVersion: () => '1.10.1' },
  ipcMain: { handle: (ch, fn) => { handlers[ch] = fn; } },
  net: { fetch: async (url) => { netCalls.push(String(url)); return netRoute(String(url)); } },
  shell: { openExternal: async (u) => { opened.push(String(u)); } }
};

// Sahte güncelleyici: her örnek yeni bir EventEmitter; olaylar testte elle yayınlanır.
const up = { last: null, check: 0, download: 0, quit: [], feeds: [], checkFails: '', downloadFails: false };
function makeUpdater() {
  const u = new EventEmitter();
  u.checkForUpdates = async () => {
    up.check++;
    u.emit('checking-for-update');
    if (up.checkFails) throw new Error(up.checkFails);
  };
  u.downloadUpdate = async () => {
    up.download++;
    if (up.downloadFails) throw new Error('net::ERR_INTERNET_DISCONNECTED');
  };
  u.quitAndInstall = (a, b) => { up.quit.push([a, b]); };
  u.setFeedURL = (cfg) => { up.feeds.push(cfg); };
  return u;
}

const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return electron;
  if (req === 'electron-updater') { up.last = makeUpdater(); return { autoUpdater: up.last }; }
  return origLoad.call(this, req, ...rest);
};

const win = { isDestroyed: () => false, webContents: { send: (ch, payload) => sent.push({ ch, payload }) } };

// Her senaryo yeni bir modül örneği açar (durum ve önbellek sıfırlanır).
function load(feed) {
  if (feed === undefined) delete process.env.NOVA_UPDATE_FEED; else process.env.NOVA_UPDATE_FEED = feed;
  delete require.cache[MOD];
  for (const k of Object.keys(handlers)) delete handlers[k];
  Object.assign(up, { last: null, check: 0, download: 0, quit: [], feeds: [], checkFails: '', downloadFails: false });
  sent.length = 0;
  global.__novaAutoDownload = undefined;
  const mod = require(MOD);
  mod.register({ getWindow: () => win });
  return mod;
}
const lastState = () => sent.filter((e) => e.ch === 'update:state').pop().payload;
const flush = () => new Promise((r) => setImmediate(r));
async function waitFor(fn, ms = 2000) {
  const t0 = Date.now();
  while (!(await fn())) {
    if (Date.now() - t0 > ms) return false;
    await flush();
  }
  return true;
}

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const section = (t) => console.log(`\n# ${t}`);

(async () => {
  // ---------------------------------------------------------------- geliştirme kanalı
  section('geliştirme kanalı (besleme yok, paketli değil)');
  load(undefined);
  const st0 = await handlers['update:state']({});
  ok(st0.supported === false && st0.channel === 'dev' && st0.status === 'unsupported', 'besleme ve paketleme yoksa kanal dev, durum unsupported');
  const net0 = netCalls.length;
  const c1 = await handlers['update:check']({}, { autoDownload: true });
  const d1 = await handlers['update:download']({});
  const i1 = await handlers['update:install']({});
  ok(c1.status === 'unsupported' && d1.status === 'unsupported' && i1.success === false, 'geliştirme kanalında denetle, indir ve kur yanıtı değişmez');
  ok(up.last === null && up.check === 0 && up.download === 0 && up.quit.length === 0 && netCalls.length === net0,
    'geliştirme kanalında güncelleyici oluşturulmaz ve ağ isteği gitmez');

  // ---------------------------------------------------------------- sürüm listesi ve notlar
  section('sürüm listesi');
  const releases = [
    { tag_name: 'v1.11.0', name: 'taslak', published_at: '', body: 'gizli taslak', html_url: '', draft: true },
    ...Array.from({ length: 10 }, (_, i) => ({
      tag_name: `v1.${i}.0`, name: `NovaCode 1.${i}.0`, published_at: '2026-11-28T10:00:00Z',
      body: i === 0 ? 'x'.repeat(25000) : 'not', html_url: `https://github.com/orayyilmaz16/NovaCode-Studio/releases/tag/v1.${i}.0`, draft: false
    }))
  ];
  netRoute = (u) => (u === `${API}/releases?per_page=8` ? res(200, releases) : (() => { throw new Error('beklenmeyen istek: ' + u); })());
  const rel = await handlers['update:releases']({});
  ok(rel.success === true && rel.releases.length === 8, 'sürüm listesi en fazla 8 kayıt döner');
  ok(rel.releases.every((x) => !x.version.startsWith('v') && x.version !== '1.11.0'), 'taslak sürümler listelenmez; sürüm adından "v" öneki atılır');
  ok(rel.releases[0].notes.length === 20000 && rel.releases[0].url.endsWith('/releases/tag/v1.0.0'), 'sürüm notu 20000 karakterle sınırlanır');
  netRoute = () => res(404, {});
  const rel404 = await handlers['update:releases']({});
  ok(rel404.success === false && rel404.error === 'no-release' && rel404.releases.length === 0, 'GitHub 404 yanıtı no-release olarak bildirilir');
  netRoute = () => { throw new Error('net::ERR_INTERNET_DISCONNECTED'); };
  const relNet = await handlers['update:releases']({});
  ok(relNet.success === false && relNet.error === 'network', 'ağ hatası network olarak bildirilir');

  // ---------------------------------------------------------------- dış bağlantı izin listesi
  section('dış bağlantı (app:openLink)');
  load(undefined);
  const okLinks = ['https://github.com/orayyilmaz16/NovaCode-Studio', 'https://example.com/a?b=1'];
  const badLinks = ['http://example.com', 'https://user:pass@example.com/', 'javascript:alert(1)', 'file:///C:/Windows/win.ini', 'no url', undefined];
  const okRes = [];
  for (const u of okLinks) okRes.push((await handlers['app:openLink']({}, u)).success);
  const badRes = [];
  for (const u of badLinks) badRes.push((await handlers['app:openLink']({}, u)).success);
  ok(okRes.every(Boolean) && opened.length === okLinks.length, 'yalnız https ve kimlik bilgisi içermeyen adresler dış tarayıcıda açılır');
  ok(badRes.every((v) => v === false), 'http, kimlik bilgili, javascript:, file: ve geçersiz adresler reddedilir');

  // ---------------------------------------------------------------- Hakkında: Electron son sürümü
  section('Hakkında: Electron son sürümü');
  const runtimeList = [
    { version: '31.0.0-beta.2', chrome: '140.0.1', node: '22.0.0' },
    { version: '29.4.6', chrome: '130.0.6723.191', node: '20.18.1' },
    { version: '29.10.0', chrome: '132.0.6834.83', node: '20.19.0' },
    { version: '28.3.3', chrome: '128.0.6613.162', node: '20.9.0' }
  ];
  let rtCalls = 0;
  load(undefined);
  netRoute = (u) => { if (u === RUNTIME) { rtCalls++; return res(200, runtimeList); } throw new Error('beklenmeyen: ' + u); };
  const rt1 = await handlers['update:runtime-latest']({});
  ok(rt1.success === true && rt1.electron === '29.10.0' && rt1.chrome === '132.0.6834.83' && rt1.node === '20.19.0',
    'en yüksek kararlı sürüm sayısal karşılaştırmayla seçilir (29.10.0 > 29.4.6; beta hariç)');
  const rt2 = await handlers['update:runtime-latest']({});
  ok(rt2.electron === '29.10.0' && rtCalls === 1, 'Hakkında sonucu önbelleğe alınır: ikinci çağrı ağa gitmez');
  load(undefined);
  netRoute = () => res(500, {});
  const rtErr = await handlers['update:runtime-latest']({});
  ok(rtErr.success === false && rtErr.supported === true && rtErr.error === 'failed', 'sunucu hatasında success: false ve kısa hata kodu döner');

  // ---------------------------------------------------------------- kararlı kanal: denetle → indir → kur
  section('kararlı kanal: denetle → indir → kur');
  load(FEED);
  const st1 = await handlers['update:state']({});
  ok(st1.supported === true && st1.channel === 'stable' && st1.status === 'idle', 'besleme tanımlıysa kanal stable, durum idle');
  netRoute = (u) => { if (u === `${API}/releases/tags/v1.11.0`) return res(200, { body: '## Yenilikler\n- Test' }); throw new Error('beklenmeyen: ' + u); };
  await handlers['update:check']({}, { autoDownload: false });
  ok(up.check === 1 && up.feeds.length === 1 && up.feeds[0].provider === 'generic' && up.feeds[0].url === FEED,
    'denetim: besleme URL\'si genel sağlayıcıya verilir ve denetleme başlar');
  ok(up.last.autoDownload === false && up.last.allowDowngrade === false && up.last.allowPrerelease === false && up.last.autoInstallOnAppQuit === true,
    'güncelleyici: otomatik indirme kapalı, sürüm düşürme ve ön sürüm kapalı, çıkışta kurulum açık');
  ok(lastState().status === 'checking', 'denetim sırasında durum checking');
  await handlers['update:check']({}, {});
  ok(up.check === 1, 'denetim sürerken yeniden denetleme başlatılmaz');
  up.last.emit('update-available', { version: '1.11.0' });
  ok(await waitFor(async () => (await handlers['update:state']({})).notes !== ''), 'güncelleme bulununca sürüm notu GitHub\'dan markdown olarak alınır');
  let s = await handlers['update:state']({});
  ok(s.status === 'available' && s.latest === '1.11.0' && s.notes.includes('## Yenilikler') && up.download === 0,
    'bulunan güncelleme "available" olur; otomatik indirme kapalıyken kendiliğinden inmez');
  const early = await handlers['update:install']({});
  await flush();
  ok(early.success === false && up.quit.length === 0, 'indirilmemiş güncelleme kurulmaz (kurulum yalnız hazır paket için)');
  const dl = await handlers['update:download']({});
  ok(dl.status === 'downloading' && up.download === 1, 'kullanıcı isteğiyle indirme başlar (durum downloading)');
  up.last.emit('download-progress', { percent: 42.7, transferred: 100, total: 200, bytesPerSecond: 5 });
  s = lastState();
  ok(s.status === 'downloading' && s.percent === 43, 'ilerleme yüzdesi yuvarlanarak bildirilir');
  up.last.emit('update-available', { version: '9.9.9' });
  await flush();
  s = await handlers['update:state']({});
  ok(s.status === 'downloading' && s.latest === '1.11.0', 'indirme sürerken gelen yeni denetim olayı durumu geri almaz');
  await handlers['update:download']({});
  ok(up.download === 1, 'indirme sürerken yeniden indirme başlatılmaz');
  up.last.emit('update-downloaded', {});
  s = await handlers['update:state']({});
  ok(s.status === 'ready' && s.percent === 100, 'indirme bitince durum ready');
  await handlers['update:check']({}, {});
  ok(up.check === 1 && (await handlers['update:state']({})).status === 'ready', 'hazır paket varken yeniden denetleme durumu bozmaz');
  const inst = await handlers['update:install']({});
  ok(inst.success === true, 'hazır paket için kurulum istendi');
  await flush();
  ok(JSON.stringify(up.quit) === JSON.stringify([[false, true]]), 'kurulum quitAndInstall(false, true) ile yapılır (tek kez)');

  // ---------------------------------------------------------------- hata sınıflandırması
  section('hata sınıflandırması');
  load(FEED);
  netRoute = () => res(200, { body: '' });
  up.checkFails = 'net::ERR_INTERNET_DISCONNECTED';
  const cf = await handlers['update:check']({}, {});
  ok(cf.status === 'error' && cf.error === 'network', 'denetim ağ hatasıyla biterse durum error, kod network');
  up.checkFails = '';
  load(FEED);
  netRoute = () => res(200, { body: '' });
  await handlers['update:check']({}, {});
  const warn = console.warn;
  console.warn = () => {};
  const errs = [
    [new Error('sha512 checksum mismatch, computed ...'), 'checksum'],
    [new Error('Cannot find channel "latest.yml"'), 'no-release'],
    [new Error('net::ERR_CONNECTION_RESET'), 'network'],
    [new Error('beklenmeyen bir şey'), 'failed']
  ];
  const got = [];
  for (const [e] of errs) {
    up.last.emit('error', e);
    got.push((await handlers['update:state']({})).error);
  }
  console.warn = warn;
  ok(JSON.stringify(got) === JSON.stringify(errs.map(([, code]) => code)),
    'güncelleyici hataları kısa koda çevrilir: checksum, no-release, network, failed (ham metin renderer\'a gitmez)');
  load(FEED);
  netRoute = (u) => (u.endsWith('/releases/tags/v1.11.0') ? res(200, { body: '' }) : (() => { throw new Error('beklenmeyen: ' + u); })());
  await handlers['update:check']({}, {});
  up.last.emit('update-available', { version: '1.11.0' });
  up.downloadFails = true;
  const dErr = await handlers['update:download']({});
  ok(dErr.status === 'error' && dErr.error === 'network', 'indirme ağ hatasıyla biterse durum error, kod network');
  const beforeInstall = up.quit.length;
  await handlers['update:install']({});
  await flush();
  ok(up.quit.length === beforeInstall, 'hata durumunda kurulum başlamaz');

  // ---------------------------------------------------------------- otomatik indirme ayarı
  section('otomatik indirme ayarı');
  load(FEED);
  netRoute = (u) => (u.endsWith('/releases/tags/v2.0.0') ? res(200, { body: '' }) : (() => { throw new Error('beklenmeyen: ' + u); })());
  await handlers['update:check']({}, { autoDownload: true });
  up.last.emit('update-available', { version: '2.0.0' });
  ok(await waitFor(() => up.download === 1), 'autoDownload açıkken bulunan güncelleme kendiliğinden indirilir');

  // Bütün denetimler bittikten sonra modül kancasını bırak.
  Module._load = origLoad;
  delete process.env.NOVA_UPDATE_FEED;
  console.log(fails ? `\n${fails} test başarısız` : '\nTüm güncelleme testleri geçti');
})().catch((e) => { console.error('FAIL beklenmeyen hata:', e); process.exitCode = 1; });
