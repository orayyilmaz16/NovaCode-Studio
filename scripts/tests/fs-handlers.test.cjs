// Dosya sistemi IPC işleyicileri testleri (electron-main.cjs: fs:*, app:reveal, dialog:openFiles, dialog:openFolder).
// `electron` modülü taklit edilir; ana süreç yüklenir, işleyiciler ipcMain.handle ile yakalanır.
// whenReady çözülmez: pencere açılmaz. Testler geçici klasörde çalışır, ağ gerektirmez.
// Symlink oluşturulamazsa (Windows'ta dosya bağı için yetki gerekir) ilgili testler açıkça atlanır.
// Çalıştırma: node scripts/tests/fs-handlers.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

const handlers = {};
const dialogState = { files: [], folder: null };
const trashed = [];
const shown = [];
const lenient = new Proxy(function () {}, { get: () => lenient, apply: () => lenient });

const base = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-fs-'));
const userData = path.join(base, 'userdata');
const root = path.join(base, 'ws');
const outside = path.join(base, 'outside');
fs.mkdirSync(userData);
fs.mkdirSync(root);
fs.mkdirSync(outside);
fs.writeFileSync(path.join(outside, 'secret.txt'), 'gizli');

const electron = new Proxy({
  app: { getPath: () => userData, isPackaged: true, on: () => {}, requestSingleInstanceLock: () => true, whenReady: () => ({ then: () => {} }) },
  ipcMain: { handle: (ch, fn) => { handlers[ch] = fn; }, on: () => {} },
  dialog: {
    showOpenDialog: async (_win, opts) => (opts.properties.includes('openDirectory')
      ? { canceled: !dialogState.folder, filePaths: dialogState.folder ? [dialogState.folder] : [] }
      : { canceled: false, filePaths: dialogState.files })
  },
  shell: {
    trashItem: async (p) => { trashed.push(p); },
    showItemInFolder: (p) => { shown.push(p); }
  }
}, { get: (t, k) => (k in t ? t[k] : lenient) });

const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return electron;
  return origLoad.call(this, req, ...rest);
};
require(path.join(__dirname, '..', '..', 'electron-main.cjs'));

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const h = (ch, ...args) => handlers[ch]({}, ...args);
const settle = async (fn) => { try { return { value: await fn() }; } catch (error) { return { error }; } };
// Reddedildi: işleyici hata fırlattı, { success:false } döndü ya da boş liste (dış klasör) döndü
const refused = (r) => {
  if (r.error) return true;
  const v = r.value;
  if (Array.isArray(v)) return v.length === 0;
  return !!v && typeof v === 'object' && v.success === false;
};
const read = (p) => fs.readFileSync(p, 'utf8');
const sep = path.sep;
const secret = path.join(outside, 'secret.txt');

const links = []; // oluşturulan bağlar (temizlik için)
const DIR_LINK = process.platform === 'win32' ? 'junction' : 'dir'; // Windows'ta junction için yetki gerekmez
function makeLink(target, linkPath, type) {
  try {
    fs.symlinkSync(target, linkPath, type);
    links.push({ linkPath, type });
    return true;
  } catch (e) {
    console.log('atlandı (bağ oluşturulamadı: ' + e.code + '):', path.basename(linkPath));
    return false;
  }
}

(async () => {
  // ---- Kayıt: beklenen kanallar ana süreçte yakalanmış mı ----
  const channels = ['fs:readDataUrl', 'fs:readDir', 'fs:readFile', 'fs:writeFile', 'fs:createFile', 'fs:createFolder', 'fs:deleteItem', 'fs:renameItem', 'app:reveal', 'dialog:openFiles', 'dialog:openFolder'];
  ok(channels.every((c) => typeof handlers[c] === 'function'), 'fs:* ve app:reveal işleyicileri kayıtlı');

  // ---- Çalışma klasörü açılmadan hiçbir yol geçerli değildir ----
  ok(refused(await settle(() => h('fs:createFile', path.join(root, 'erken.txt')))) && !fs.existsSync(path.join(root, 'erken.txt')), 'çalışma klasörü açılmadan dosya oluşturulamaz');

  // ---- Çalışma klasörünü aç (gerçek dialog akışı) ----
  dialogState.folder = root;
  const opened = await h('dialog:openFolder');
  ok(opened && opened.rootPath === root, 'çalışma klasörü açıldı');

  // ---- İçeride başarılı işlemler ----
  const a = path.join(root, 'src', 'a.txt');
  fs.mkdirSync(path.join(root, 'src'));
  ok((await h('fs:createFile', a)).success === true && fs.existsSync(a), 'içeride dosya oluşturulur');
  fs.writeFileSync(a, 'ilk');
  ok((await h('fs:createFile', a)).success === true && read(a) === 'ilk', 'var olan dosya oluşturma ile silinmez');
  ok((await h('fs:writeFile', a, 'merhaba')).success === true && read(a) === 'merhaba', 'içeride yazma başarılı');
  ok((await h('fs:readFile', a)) === 'merhaba', 'içeride okuma başarılı');
  ok((await h('fs:createFolder', path.join(root, 'yeni', 'derin'))).success === true && fs.statSync(path.join(root, 'yeni', 'derin')).isDirectory(), 'iç içe klasör oluşturulur');
  const listing = await h('fs:readDir', root);
  ok(Array.isArray(listing) && listing.some((e) => e.name === 'src' && e.type === 'folder'), 'çalışma klasörü listelenir');
  ok((await h('fs:renameItem', a, path.join(root, 'src', 'b.txt'))).success === true && fs.existsSync(path.join(root, 'src', 'b.txt')) && !fs.existsSync(a), 'içeride yeniden adlandırma başarılı');
  const b = path.join(root, 'src', 'b.txt');
  ok(refused(await settle(() => h('fs:renameItem', b, path.join(root, 'yeni', 'derin')))) && fs.existsSync(b), 'hedef zaten varsa yeniden adlandırma reddedilir');
  const proj = path.join(root, 'klasor');
  fs.mkdirSync(proj);
  ok(refused(await settle(() => h('fs:renameItem', proj, path.join(proj, 'ic')))) && fs.existsSync(proj), 'klasör kendi içine taşınamaz');

  // ---- Kök klasörün kendisi değiştirilemez ----
  ok(refused(await settle(() => h('fs:deleteItem', root, { permanent: true }))) && fs.existsSync(b), 'kök klasör kalıcı silinemez');
  ok(refused(await settle(() => h('fs:deleteItem', root + sep))) && fs.existsSync(b) && !trashed.includes(root), 'kök klasör çöp kutusuna da taşınamaz (sondaki ayraçla da)');
  ok(refused(await settle(() => h('fs:renameItem', root, root + '-yeni'))) && fs.existsSync(root), 'kök klasör yeniden adlandırılamaz');
  ok(refused(await settle(() => h('fs:createFile', root))) && refused(await settle(() => h('fs:createFolder', root))), 'kök klasör üzerinde oluşturma işlemi reddedilir');

  // ---- Çalışma klasörü dışına erişim reddi (yol kaçışı ve kardeş klasör dahil) ----
  const escape = root + sep + '..' + sep + 'outside' + sep + 'secret.txt';
  ok(refused(await settle(() => h('fs:writeFile', escape, 'ele-gecirildi'))) && read(secret) === 'gizli', '"../" ile dış dosyaya yazma reddedilir');
  ok(refused(await settle(() => h('fs:readFile', escape))), '"../" ile dış dosya okunamaz');
  ok(refused(await settle(() => h('fs:writeFile', secret, 'x'))) && read(secret) === 'gizli', 'mutlak dış yol ile yazma reddedilir');
  const outNew = path.join(outside, 'yeni.txt');
  ok(refused(await settle(() => h('fs:createFile', outNew))) && !fs.existsSync(outNew), 'dışarıda dosya oluşturulamaz');
  ok(refused(await settle(() => h('fs:createFolder', path.join(outside, 'klasor')))) && !fs.existsSync(path.join(outside, 'klasor')), 'dışarıda klasör oluşturulamaz');
  const sibling = root + '-kardes';
  fs.mkdirSync(sibling);
  ok(refused(await settle(() => h('fs:writeFile', path.join(sibling, 'x.txt'), 'x'))) && !fs.existsSync(path.join(sibling, 'x.txt')), 'önek benzeri kardeş klasör (ws-kardes) reddedilir');
  ok(refused(await settle(() => h('fs:readFile', secret))), 'dış dosya okunamaz (onaysız)');
  ok(refused(await settle(() => h('fs:readDir', outside))), 'dış klasör listelenmez');
  ok(refused(await settle(() => h('fs:readDataUrl', secret))), 'dış dosya data URL olarak okunamaz');
  ok(refused(await settle(() => h('fs:deleteItem', secret, { permanent: true }))) && read(secret) === 'gizli', 'dış dosya kalıcı silinemez');
  ok(refused(await settle(() => h('fs:deleteItem', secret))) && !trashed.includes(secret), 'dış dosya çöp kutusuna da gönderilmez');
  ok(refused(await settle(() => h('fs:renameItem', secret, path.join(root, 'calinti.txt')))) && fs.existsSync(secret) && !fs.existsSync(path.join(root, 'calinti.txt')), 'dış dosya içeri taşınamaz');
  ok(refused(await settle(() => h('fs:renameItem', b, outNew))) && fs.existsSync(b) && !fs.existsSync(outNew), 'içerideki dosya dışarı taşınamaz');
  ok((await h('app:reveal', secret)).success === false && shown.length === 0, 'dış dosya Gezgin\'de gösterilmez');
  ok((await h('app:reveal', b)).success === true && shown.includes(path.resolve(b)), 'içerideki dosya Gezgin\'de gösterilir');

  // ---- Geçersiz yollar: boş, NUL, sayı/tanımsız, aşırı uzun ----
  const badPaths = ['', 'a\0b', null, undefined, 42, 'x'.repeat(5000)];
  let allRefused = true;
  for (const bad of badPaths) {
    for (const ch of ['fs:readDataUrl', 'fs:readDir', 'fs:readFile', 'fs:writeFile', 'fs:createFile', 'fs:createFolder', 'fs:deleteItem']) {
      const r = await settle(() => h(ch, bad, ch === 'fs:writeFile' ? 'x' : { permanent: true }));
      if (!refused(r)) { allRefused = false; console.log('  kabul edildi:', ch, JSON.stringify(String(bad).slice(0, 20))); }
    }
    const rn = await settle(() => h('fs:renameItem', bad, path.join(root, 'ok.txt')));
    if (!refused(rn)) allRefused = false;
  }
  ok(allRefused, 'boş, NUL içeren, tanımsız, sayı ve aşırı uzun yollar tüm dosya işleyicilerinde reddedilir');
  ok(refused(await settle(() => h('fs:writeFile', path.join(root, 'nul\0.txt'), 'x'))), 'NUL içeren dosya adı yazılmaz');
  if (process.platform === 'win32') {
    const ads = path.join(root, 'a.txt:gizli');
    ok(refused(await settle(() => h('fs:writeFile', ads, 'x'))) && refused(await settle(() => h('fs:createFile', ads))), 'Windows alternatif veri akışı (dosya:akış) reddedilir');
  }

  // ---- Symlink / junction ile dışarı kaçış ----
  const dirLink = path.join(root, 'disari');
  if (makeLink(outside, dirLink, DIR_LINK)) {
    ok(refused(await settle(() => h('fs:writeFile', path.join(dirLink, 'secret.txt'), 'ele-gecirildi'))) && read(secret) === 'gizli', 'klasör bağı üzerinden yazma reddedilir');
    ok(refused(await settle(() => h('fs:readFile', path.join(dirLink, 'secret.txt')))), 'klasör bağı üzerinden okuma reddedilir');
    ok(refused(await settle(() => h('fs:createFile', path.join(dirLink, 'yeni.txt')))) && !fs.existsSync(outNew), 'klasör bağı üzerinden dosya oluşturulamaz');
    ok(refused(await settle(() => h('fs:readDir', dirLink))), 'klasör bağı dış içeriği listelemez');
    ok(refused(await settle(() => h('fs:deleteItem', path.join(dirLink, 'secret.txt'), { permanent: true }))) && read(secret) === 'gizli', 'klasör bağı üzerinden silme reddedilir');
    const r = await h('fs:deleteItem', dirLink, { permanent: true });
    ok(r.success === true && !fs.existsSync(dirLink) && read(secret) === 'gizli', 'bağın kendisi silinir, hedefin içeriği korunur');
    links.splice(links.findIndex((l) => l.linkPath === dirLink), 1);
  }

  const danglingLink = path.join(root, 'kopuk.txt');
  if (makeLink(path.join(outside, 'yok.txt'), danglingLink, 'file')) {
    ok(refused(await settle(() => h('fs:createFile', danglingLink))) && !fs.existsSync(path.join(outside, 'yok.txt')), 'boşta kalan dosya bağı üzerinden dışarıda dosya oluşturulamaz');
    ok(refused(await settle(() => h('fs:writeFile', danglingLink, 'x'))) && !fs.existsSync(path.join(outside, 'yok.txt')), 'boşta kalan dosya bağına yazma reddedilir');
  }

  const fileLink = path.join(root, 'bag.txt');
  if (makeLink(secret, fileLink, 'file')) {
    ok(refused(await settle(() => h('fs:readFile', fileLink))), 'dosya bağı üzerinden dış dosya okunamaz');
    ok(refused(await settle(() => h('fs:writeFile', fileLink, 'x'))) && read(secret) === 'gizli', 'dosya bağı üzerinden dış dosyaya yazılamaz');
    const r = await h('fs:deleteItem', fileLink, { permanent: true });
    ok(r.success === true && !fs.existsSync(fileLink) && read(secret) === 'gizli', 'dosya bağı silinir, dış hedef korunur');
    links.splice(links.findIndex((l) => l.linkPath === fileLink), 1);
  }

  // İçinde dış klasöre bağ olan bir klasör silinirse dış içerik korunur (silme bağı izlemez)
  const proj2 = path.join(root, 'proje');
  fs.mkdirSync(proj2);
  if (makeLink(outside, path.join(proj2, 'cik'), DIR_LINK)) {
    const r = await h('fs:deleteItem', proj2, { permanent: true });
    ok(r.success === true && !fs.existsSync(proj2) && read(secret) === 'gizli', 'içinde dış bağ olan klasör silinir, dış içerik korunur');
    links.splice(links.findIndex((l) => l.linkPath === path.join(proj2, 'cik')), 1);
  }

  // ---- Okuma sınırları ve ikili dosya ----
  const big = path.join(root, 'buyuk.txt');
  fs.writeFileSync(big, Buffer.alloc(6 * 1024 * 1024, 0x61));
  const tooBig = await h('fs:readFile', big);
  ok(tooBig && tooBig.success === false && tooBig.error === 'file-too-large', '5 MB üstü dosya varsayılan okumada reddedilir');
  const raised = await h('fs:readFile', big, { maxBytes: 7 * 1024 * 1024 });
  ok(typeof raised === 'string' && raised.length === 6 * 1024 * 1024, 'okuma eşiği artırılınca büyük dosya açılır');
  const bin = path.join(root, 'ikili.bin');
  fs.writeFileSync(bin, Buffer.from([0x50, 0x00, 0x41]));
  const binRes = await h('fs:readFile', bin);
  ok(binRes && binRes.success === false && binRes.error === 'binary-file', 'ikili dosya metin olarak açılmaz');

  // ---- Çöp kutusu yolu: içeride çalışır ----
  trashed.length = 0;
  const trashRes = await h('fs:deleteItem', b);
  ok(trashRes.success === true && trashRes.trashed === true && trashed.length === 1 && trashed[0] === path.resolve(b), 'içerideki dosya çöp kutusuna gönderilir');

  // ---- Diyalogla onaylanan dış dosyalar: yalnız okuma/yazma ----
  const other = path.join(outside, 'diger.txt');
  fs.writeFileSync(other, 'diger');
  dialogState.files = [secret];
  const picked = await h('dialog:openFiles');
  ok(Array.isArray(picked) && picked.length === 1 && picked[0].content === 'gizli', 'diyalogla seçilen dış dosya açılır');
  ok((await h('fs:readFile', secret)) === 'gizli', 'onaylı dış dosya okunur');
  ok((await h('fs:writeFile', secret, 'onayli-yazim')).success === true && read(secret) === 'onayli-yazim', 'onaylı dış dosyaya yazılır');
  ok(refused(await settle(() => h('fs:readFile', other))), 'onaylanmamış dış dosya okunamaz');
  ok(refused(await settle(() => h('fs:writeFile', other, 'x'))) && read(other) === 'diger', 'onaylanmamış dış dosyaya yazılamaz');
  ok(refused(await settle(() => h('fs:deleteItem', secret, { permanent: true }))) && fs.existsSync(secret), 'onay silme yetkisi vermez');
  ok(refused(await settle(() => h('fs:renameItem', secret, path.join(root, 'tasindi.txt')))) && fs.existsSync(secret), 'onay yeniden adlandırma yetkisi vermez');

  // ---- Temizlik (en iyi çaba: Windows'ta izleyici klasör tutabilir) ----
  for (const { linkPath, type } of links) {
    try { if (type === 'file') fs.unlinkSync(linkPath); else fs.rmdirSync(linkPath); } catch { /* yok */ }
  }
  try { fs.rmSync(base, { recursive: true, force: true }); } catch { /* izleyici kilidi */ }

  console.log(fails ? `\n${fails} test başarısız` : '\nTüm fs işleyici testleri geçti');
  // Açık dosya izleyicisi süreci canlı tutabilir: çıktı tamamlandıktan sonra çık
  process.stdout.write('', () => process.exit(process.exitCode || 0));
})().catch((err) => {
  console.error('FAIL beklenmeyen hata:', err);
  process.stdout.write('', () => process.exit(1));
});
