// Preload testleri (electron-preload.cjs): dinamik yükleme ile köprü yüzeyini denetler (ipc-contract.test.cjs kanal
// eşleşmesini statik tarar; bu test çalışma zamanı davranışını ölçer).
// Denetlenenler: tek köprü adı (electronAPI); ham ipcRenderer / webFrame / contextBridge dışa açılmaz; her yöntemin
// kullandığı kanallar ad:eylem biçiminde; yakınlaştırma 0.8–1.5 aralığında sınırlanır ve aynı değer tekrar uygulanmaz;
// dinleyici aboneliği döndürülen fonksiyonla kaldırılır; yöntem argümanları kanal yüküne doğru sarılır.
// `electron` taklit edilir; ağ ve pencere yok. Çalıştırma: node scripts/tests/preload.test.cjs
const Module = require('module');
const path = require('path');

const PRELOAD = path.join(__dirname, '..', '..', 'electron-preload.cjs');

const exposeCalls = [];
const invokes = [];
const sends = [];
const onRegs = [];
const removed = [];
const listeners = new Map();
let zoom = 1;
const zoomSets = [];

const ipcRenderer = {
  invoke: (ch, ...args) => { invokes.push({ ch, args }); return Promise.resolve(null); },
  send: (ch, ...args) => { sends.push({ ch, args }); },
  on: (ch, fn) => {
    onRegs.push(ch);
    if (!listeners.has(ch)) listeners.set(ch, new Set());
    listeners.get(ch).add(fn);
  },
  removeListener: (ch, fn) => {
    removed.push(ch);
    if (listeners.has(ch)) listeners.get(ch).delete(fn);
  }
};
const webFrame = {
  getZoomFactor: () => zoom,
  setZoomFactor: (f) => { zoomSets.push(f); zoom = f; }
};
const contextBridge = {
  exposeInMainWorld: (name, api) => { exposeCalls.push({ name, api }); }
};
const electron = { contextBridge, ipcRenderer, webFrame };

const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return electron;
  return origLoad.call(this, req, ...rest);
};
require(PRELOAD);
Module._load = origLoad;

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const section = (t) => console.log(`\n# ${t}`);

// Ağaçtaki tüm fonksiyonları (yol, fonksiyon) olarak topla.
function collectFunctions(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'function') out.push({ path: prefix + k, fn: v });
    else if (v && typeof v === 'object') collectFunctions(v, prefix + k + '.', out);
  }
  return out;
}

section('köprü yüzeyi');
ok(exposeCalls.length === 1 && exposeCalls[0].name === 'electronAPI', 'tek köprü adı kullanılır: electronAPI');
const api = exposeCalls[0].api;
ok(api.isElectron === true && api.platform === process.platform, 'isElectron ve platform bilgisi açılır');
const allValues = [];
(function gather(o) {
  for (const v of Object.values(o)) {
    allValues.push(v);
    if (v && typeof v === 'object') gather(v);
  }
})(api);
ok(!allValues.some((v) => v === ipcRenderer || v === webFrame || v === contextBridge || v === ipcRenderer.invoke || v === ipcRenderer.send || v === ipcRenderer.on || v === ipcRenderer.removeListener),
  'ham ipcRenderer, webFrame, contextBridge veya kanal yöntemleri köprüye doğrudan konmaz');

section('her yöntemin kanalları');
const fns = collectFunctions(api);
for (const { fn } of fns) {
  try { fn(undefined, undefined, undefined, undefined); } catch { /* yanlış argümanla hata verebilir; önemli olan kanal kullanımı */ }
}
const usedChannels = [
  ...invokes.map((i) => i.ch),
  ...sends.map((s) => s.ch),
  ...onRegs
];
const badNames = [...new Set(usedChannels)].filter((c) => !/^[a-z]+:[A-Za-z][A-Za-z0-9-]*$/.test(c));
ok(fns.length >= 40, `köprüde ${fns.length} yöntem var (yüzey boş değil)`);
ok(badNames.length === 0, badNames.length ? `kanal adı ad:eylem biçiminde değil: ${badNames.join(', ')}` : `${new Set(usedChannels).size} farklı kanal ad:eylem biçiminde`);

section('yakınlaştırma sınırı');
zoom = 1;
zoomSets.length = 0;
api.ui.setZoom(5);
ok(zoom === 1.5, 'üst sınır 1.5\'e çekilir');
api.ui.setZoom(0.1);
ok(zoom === 0.8, 'alt sınır 0.8\'e çekilir');
api.ui.setZoom('abc');
ok(zoom === 1, 'sayı olmayan değer 1\'e düşer');
const before = zoomSets.length;
api.ui.setZoom(1);
ok(zoomSets.length === before, 'zaten aynı olan değer yeniden uygulanmaz (gereksiz yeniden yerleşim yok)');
api.ui.setZoom(1.2);
ok(zoom === 1.2 && zoomSets.at(-1) === 1.2, 'ara değer olduğu gibi uygulanır (1.2)');

section('dinleyici aboneliği');
// Kanal taraması yöntemleri boş argümanla çağırdı; onun bıraktığı kayıtlar bu testi etkilemesin.
listeners.clear();
removed.length = 0;
const seen = [];
const off = api.lsp.onEvent((ev) => seen.push(ev));
const regs = listeners.get('lsp:event');
ok(regs && regs.size === 1, 'olay aboneliği tek bir dinleyici kaydeder');
for (const h of regs) h({}, { type: 'diagnostics' });
ok(seen.length === 1 && seen[0].type === 'diagnostics', 'olay geldiğinde geri çağrı event yüküyle çalışır');
off();
ok(removed.includes('lsp:event') && listeners.get('lsp:event').size === 0, 'dönen fonksiyon dinleyiciyi kaldırır (sızıntı yok)');
const offTerm = api.onTermOutput(() => {});
offTerm();
ok(removed.includes('term:output') && listeners.get('term:output').size === 0, 'terminal çıktı aboneliği de kaldırılabilir');

section('argüman sarmalama');
invokes.length = 0;
api.lsp.status('python');
ok(invokes.at(-1).ch === 'lsp:status' && JSON.stringify(invokes.at(-1).args) === JSON.stringify([{ lang: 'python' }]),
  'lsp.status(lang) → lsp:status { lang } olarak gider');
api.ui.setTheme('dark');
ok(invokes.at(-1).ch === 'ui:setTheme' && invokes.at(-1).args[0] === 'dark', 'ui.setTheme(mode) → ui:setTheme olarak gider');

console.log(fails ? `\n${fails} test başarısız` : '\nTüm preload testleri geçti');
