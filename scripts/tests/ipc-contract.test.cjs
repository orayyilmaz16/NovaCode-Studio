// IPC kanal sözleşmesi testi (statik metin taraması, modül çalıştırılmaz).
// Preload (electron-preload.cjs) ↔ ana süreç (electron-*.cjs, preload hariç) kanal eşleşmesini denetler.
// Çıkarılanlar: preload ipcRenderer.invoke / send / on / once / removeListener; ana süreç ipcMain.handle / ipcMain.on,
// webContents.send ve yardımcı send('kanal', ...) çağrıları.
// Hata (çıkış kodu 1):
//   (a) preload'un invoke ettiği her kanalın ana süreçte ipcMain.handle işleyicisi var;
//   (b) preload'un send ettiği her kanalın ana süreçte ipcMain.on dinleyicisi var;
//   (c) preload'un dinlediği (on/once) her olayı ana süreç gönderiyor;
//   (d) aynı kanal birden çok ipcMain.handle ile kaydedilmez (Electron ikinci kaydı reddeder);
//   (e) kanal adları ad:eylem biçiminde; dinamik (değişken) kanal adı yok;
//   (f) preload ipcRenderer'ı ham olarak dışarı açmaz (yalnız tanımlı yöntemler).
// Uyarı (çıkış kodunu bozmaz): ana süreçte olup preload'da kullanılmayan handle/on kanalı; gönderilip dinlenmeyen olay.
// Not: scripts/brain.mjs (satır ~87-97) aynı handle/invoke ve olay eşleşmesini yapar; bu test onu tekrarlamaz, ipcMain.on,
// dinamik kanal, preload send/removeListener ve kayıt tekrarını ek olarak denetler. brain.mjs değiştirilmedi.
// Çalıştırma: node scripts/tests/ipc-contract.test.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const PRELOAD = 'electron-preload.cjs';
const mainFiles = fs.readdirSync(ROOT).filter((f) => /^electron-.*\.cjs$/.test(f) && f !== PRELOAD).sort();

// Kanal çağrısı: name( 'kanal' ... ) — tek/çift tırnak ya da backtick, çok satırlı çağrılar dahil
const LITERAL_CALL = (name) => new RegExp(`${name}\\(\\s*(['"\`])([^'"\`\\n]+)\\1`, 'g');
const collect = (text, re) => [...text.matchAll(re)].map((m) => m[2]);
const dynamicCount = (text, name) => [...text.matchAll(new RegExp(`${name}\\(\\s*(?![\\s'"\`])`, 'g'))].length;

let fails = 0;
let warns = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const warn = (m) => { warns++; console.log('UYARI', m); };
const add = (map, key, file) => { if (!map.has(key)) map.set(key, []); map.get(key).push(file); };

// ---------- ana süreç ----------
const handles = new Map(); // kanal -> [dosya] (her kayıt bir giriş)
const ons = new Map();
const sent = new Map();
const dynamicMain = [];
for (const f of mainFiles) {
  const text = read(f);
  for (const c of collect(text, LITERAL_CALL('ipcMain\\.handle'))) add(handles, c, f);
  for (const c of collect(text, LITERAL_CALL('ipcMain\\.(?:on|once)'))) add(ons, c, f);
  for (const c of collect(text, LITERAL_CALL('\\bsend'))) add(sent, c, f);
  for (const c of collect(text, LITERAL_CALL('sendTerm'))) add(sent, c, f);
  const dyn = dynamicCount(text, 'ipcMain\\.(?:handle|on|once)') + [...text.matchAll(/webContents\.send\(\s*(?!['"`]|channel\b)/g)].length;
  if (dyn) dynamicMain.push(`${f} (${dyn})`);
}

// ---------- preload ----------
const pre = read(PRELOAD);
const pInvoke = collect(pre, LITERAL_CALL('ipcRenderer\\.invoke'));
const pSend = collect(pre, LITERAL_CALL('ipcRenderer\\.send'));
const pOn = collect(pre, LITERAL_CALL('ipcRenderer\\.(?:on|once)'));
const pRemove = collect(pre, LITERAL_CALL('ipcRenderer\\.removeListener'));
const dynamicPre = dynamicCount(pre, 'ipcRenderer\\.(?:invoke|send|on|once|removeListener)');

const uniq = (arr) => [...new Set(arr)].sort();
const handleSet = new Set(handles.keys());
const onSet = new Set(ons.keys());
const sentSet = new Set(sent.keys());

(() => {
  // Çıkarım boşsa tüm denetimler boş geçer; önce çıkarımın çalıştığını doğrula.
  ok(handleSet.size > 50 && pInvoke.length > 50 && sentSet.size > 10 && pOn.length > 5,
    `çıkarım dolu: ${handleSet.size} handle, ${pInvoke.length} invoke, ${sentSet.size} gönderilen olay, ${pOn.length} dinleyici`);

  // (a) invoke → handle
  const a = uniq(pInvoke.filter((c) => !handleSet.has(c)));
  ok(a.length === 0, a.length ? `(a) preload invoke, ana süreçte handle yok: ${a.join(', ')}` : `(a) her invoke kanalının handle'ı var (${uniq(pInvoke).length} kanal)`);

  // (b) send → ipcMain.on
  const b = uniq(pSend.filter((c) => !onSet.has(c)));
  ok(b.length === 0, b.length ? `(b) preload send, ana süreçte ipcMain.on yok: ${b.join(', ')}` : `(b) her send kanalının ipcMain.on dinleyicisi var (${uniq(pSend).length} kanal)`);

  // (c) on → gönderim
  const c = uniq(pOn.filter((x) => !sentSet.has(x)));
  ok(c.length === 0, c.length ? `(c) preload olayı dinliyor, ana süreç göndermiyor: ${c.join(', ')}` : `(c) dinlenen her olay ana süreçte gönderiliyor (${uniq(pOn).length} olay)`);

  // (d) tekrar eden handle kaydı
  const dup = [...handles.entries()].filter(([, files]) => files.length > 1).map(([k, files]) => `${k} (${files.join(', ')})`);
  ok(dup.length === 0, dup.length ? `(d) aynı kanal birden çok handle ile kayıtlı: ${dup.join('; ')}` : '(d) her handle kanalı tek kez kayıtlı');

  // (e) ad biçimi ve dinamik kanal
  const allNames = uniq([...handleSet, ...onSet, ...sentSet, ...pInvoke, ...pSend, ...pOn, ...pRemove]);
  const badName = allNames.filter((n) => !/^[a-z]+:[A-Za-z][A-Za-z0-9-]*$/.test(n));
  ok(badName.length === 0, badName.length ? `(e) kanal adı ad:eylem biçiminde değil: ${badName.join(', ')}` : `(e) ${allNames.length} kanal adı ad:eylem biçiminde`);
  ok(dynamicMain.length === 0 && dynamicPre === 0,
    dynamicMain.length || dynamicPre ? `(e) dinamik kanal adı: ana süreç [${dynamicMain.join(', ')}], preload ${dynamicPre}` : '(e) kanal adları sabit metin (dinamik kanal yok)');

  // removeListener yalnız daha önce dinlenen olayı kaldırır
  const rm = uniq(pRemove.filter((x) => !pOn.includes(x)));
  ok(rm.length === 0, rm.length ? `(e) removeListener dinlenmeyen olayı kaldırıyor: ${rm.join(', ')}` : `(e) removeListener her olay için on ile eşleşiyor (${uniq(pRemove).length} olay)`);

  // (f) ham ipcRenderer dışarı açılmaz
  const stripped = pre.replace(/const \{[^}]*\} = require\('electron'\);/, '');
  const raw = [...stripped.matchAll(/ipcRenderer(?!\.(?:invoke|send|on|once|removeListener)\()/g)].length;
  ok(raw === 0, raw ? `(f) preload ham ipcRenderer kullanıyor (${raw} yer): dışa açılan API'de kanal denetimi aşılabilir` : '(f) ipcRenderer yalnız tanımlı yöntemlerle kullanılır (ham nesne dışarı açılmaz)');
  ok((pre.match(/exposeInMainWorld\(/g) || []).length === 1, '(f) tek contextBridge.exposeInMainWorld çağrısı');
  ok(!/sendSync/.test(pre), '(f) senkron IPC (sendSync) kullanılmıyor');

  // ---------- uyarılar ----------
  const unusedHandle = uniq([...handleSet].filter((c) => !pInvoke.includes(c)));
  for (const c of unusedHandle) warn(`IPC: '${c}' ana süreçte handle ile kayıtlı ama preload'da invoke edilmiyor (${handles.get(c).join(', ')})`);
  const unusedOn = uniq([...onSet].filter((c) => !pSend.includes(c)));
  for (const c of unusedOn) warn(`IPC: '${c}' ana süreçte ipcMain.on ile dinleniyor ama preload'da send edilmiyor`);
  const unlistened = uniq([...sentSet].filter((c) => !pOn.includes(c)));
  for (const c of unlistened) warn(`IPC: '${c}' ana süreçte gönderiliyor ama preload'da dinlenmiyor (${sent.get(c).join(', ')})`);

  console.log(`\nSözleşme özeti: ${uniq(pInvoke).length} invoke, ${uniq(pSend).length} send, ${uniq(pOn).length} olay dinleyici, ${handleSet.size} handle, ${onSet.size} on, ${sentSet.size} gönderilen olay; uyarı: ${warns}`);
  console.log(fails ? `${fails} kontrol başarısız` : 'IPC kanal sözleşmesi tamam');
})();
