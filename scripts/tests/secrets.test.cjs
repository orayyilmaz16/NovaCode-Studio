// Gizli değer deposu testleri (electron-secrets.cjs: secrets:has / secrets:get / secrets:set).
// Kurallar (S-09): renderer'a düz metin yalnız collabToken verilir; AI anahtarı renderer'a geçmez; secrets:has boolean döner.
// `electron` ve safeStorage taklit edilir; şifreleme sahte (XOR) yapılır, diskte düz metin kalmadığı ayrıca denetlenir.
// Geçici klasör kullanır, ağ gerektirmez. Çalıştırma: node scripts/tests/secrets.test.cjs
const Module = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

const handlers = {};
const state = { encryptionAvailable: true, decryptFails: false };
const XOR = 0x5a;
const encrypt = (s) => Buffer.from(Buffer.from(s, 'utf8').map((b) => b ^ XOR));
const decrypt = (buf) => Buffer.from(buf).map((b) => b ^ XOR).toString('utf8');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-secrets-'));
const electron = {
  app: { getPath: (name) => { if (name !== 'userData') throw new Error('beklenmeyen yol: ' + name); return userData; } },
  ipcMain: { handle: (ch, fn) => { handlers[ch] = fn; }, on: () => {} },
  safeStorage: {
    isAsyncEncryptionAvailable: async () => state.encryptionAvailable,
    encryptStringAsync: async (s) => encrypt(s),
    decryptStringAsync: async (buf) => {
      if (state.decryptFails) throw new Error('bozuk veri');
      return { result: decrypt(buf) };
    }
  }
};

const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === 'electron') return electron;
  return origLoad.call(this, req, ...rest);
};
const secrets = require(path.join(__dirname, '..', '..', 'electron-secrets.cjs'));
Module._load = origLoad;
secrets.register();

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const call = (ch, ...args) => handlers[ch]({}, ...args);
const fileFor = (key) => path.join(userData, `secret-${key}.bin`);
const PLAIN = 'tok-GIZLI-9f3a7c21';
const AI_KEY_NAMES = ['openai', 'anthropic', 'apiKey', 'gemini'];

(async () => {
  // --- kanal sözleşmesi: yalnız üç kanal kayıtlı ---
  const channels = Object.keys(handlers).filter((c) => c.startsWith('secrets:')).sort();
  ok(JSON.stringify(channels) === JSON.stringify(['secrets:get', 'secrets:has', 'secrets:set']), 'yalnız secrets:get/has/set kayıtlı: ' + channels.join(', '));

  // --- AI anahtarları renderer'a geçmez ---
  for (const k of AI_KEY_NAMES) {
    const g = await call('secrets:get', k);
    const h = await call('secrets:has', k);
    ok(g.error === 'invalid-key' && !('value' in g), `secrets:get '${k}' AI anahtarı düz metin dönmez (invalid-key)`);
    ok(h.error === 'invalid-key' && !('has' in h), `secrets:has '${k}' izin dışı anahtar (invalid-key)`);
  }
  // Diskte AI anahtarı dosyası olsa bile renderer okuyamaz
  fs.writeFileSync(fileFor('openai'), encrypt('sk-test-0000000000000000'));
  ok((await call('secrets:get', 'openai')).error === 'invalid-key', 'diskteki AI anahtar dosyası renderer\'a okutulmaz');
  ok((await call('secrets:set', 'openai', 'sk-test-yeni')).success === false, 'AI anahtarı secrets:set ile yazılamaz');
  ok(fs.readFileSync(fileFor('openai')).equals(encrypt('sk-test-0000000000000000')), 'reddedilen set diskteki AI dosyasını değiştirmez');
  fs.rmSync(fileFor('openai'), { force: true });

  // --- yol kaçışı / geçersiz anahtar türleri ---
  for (const bad of ['../collabToken', 'collabToken/../../x', '', undefined, null, 42, { k: 'collabToken' }]) {
    const g = await call('secrets:get', bad);
    const h = await call('secrets:has', bad);
    const s = await call('secrets:set', bad, 'x');
    ok(g.error === 'invalid-key' && h.error === 'invalid-key' && s.success === false, `geçersiz anahtar reddedilir: ${JSON.stringify(bad)}`);
  }
  ok(!fs.readdirSync(userData).some((f) => f.includes('..') || f.includes('x')), 'geçersiz anahtarlar dosya üretmez');

  // --- başlangıç durumu ---
  const h0 = await call('secrets:has', 'collabToken');
  const g0 = await call('secrets:get', 'collabToken');
  ok(h0.has === false && typeof h0.has === 'boolean', 'kayıt yokken has: false (boolean)');
  ok(g0.value === '', 'kayıt yokken get: boş değer');

  // --- round-trip ve şifreli saklama ---
  const set1 = await call('secrets:set', 'collabToken', PLAIN);
  ok(set1.success === true, 'collabToken kaydedildi');
  const raw = fs.readFileSync(fileFor('collabToken'));
  ok(!raw.includes(PLAIN), 'diskteki dosyada düz metin token yok');
  ok(path.basename(fileFor('collabToken')) === 'secret-collabToken.bin' && fs.existsSync(fileFor('collabToken')), 'dosya userData altında secret-collabToken.bin olarak yazıldı');
  if (process.platform !== 'win32') {
    ok((fs.statSync(fileFor('collabToken')).mode & 0o777) === 0o600, 'dosya izni 0600');
  } else {
    console.log('skip izin kontrolü (Windows)');
  }
  const h1 = await call('secrets:has', 'collabToken');
  ok(h1.has === true && typeof h1.has === 'boolean', 'kayıt varken has: true (boolean)');
  const g1 = await call('secrets:get', 'collabToken');
  ok(g1.value === PLAIN, 'get yalnız collabToken değerini döndürür');
  ok(Object.keys(g1).join() === 'value' && Object.keys(h1).join() === 'has', 'yanıt şekli sabit: {value} / {has}');

  // --- girdi doğrulama ---
  for (const bad of [123, null, undefined, {}, ['a'], true]) {
    const r = await call('secrets:set', 'collabToken', bad);
    ok(r.success === false && r.error === 'invalid-input', `tip hatası reddedilir: ${JSON.stringify(bad)}`);
  }
  const tooLong = 'a'.repeat(2049);
  ok((await call('secrets:set', 'collabToken', tooLong)).error === 'invalid-input', '2049 karakter reddedilir');
  ok(fs.readFileSync(fileFor('collabToken')).includes(encrypt(PLAIN)) && decrypt(fs.readFileSync(fileFor('collabToken'))) === PLAIN, 'reddedilen girdi önceki değeri bozmaz');
  const atLimit = 'b'.repeat(2048);
  ok((await call('secrets:set', 'collabToken', atLimit)).success === true, '2048 karakter sınırda kabul edilir');
  ok((await call('secrets:get', 'collabToken')).value === atLimit, 'sınır değeri geri okunur');

  // --- ana süreç içi okuma: yalnız izinli anahtar ---
  ok(await secrets.readSecret('collabToken') === atLimit, 'readSecret collabToken\'ı ana süreçte okur');
  fs.writeFileSync(fileFor('openai'), encrypt('sk-test-0000000000000000'));
  ok(await secrets.readSecret('openai') === '', 'readSecret izin dışı anahtar için boş döner');
  fs.rmSync(fileFor('openai'), { force: true });

  // --- silme: boş değer dosyayı kaldırır ---
  ok((await call('secrets:set', 'collabToken', '')).success === true, 'boş değer kayıt olarak kabul edilir (silme)');
  ok(!fs.existsSync(fileFor('collabToken')), 'boş değer dosyayı siler');
  ok((await call('secrets:has', 'collabToken')).has === false, 'silinen anahtar has: false');
  ok((await call('secrets:set', 'collabToken', '')).success === true, 'olmayan dosyayı silmek hata vermez');

  // --- şifreleme kullanılamıyor: düz metin yedeği yok ---
  state.encryptionAvailable = false;
  const noEnc = await call('secrets:set', 'collabToken', PLAIN);
  ok(noEnc.success === false && noEnc.error === 'no-encryption', 'şifreleme yokken kaydetme reddedilir');
  ok(!fs.existsSync(fileFor('collabToken')), 'şifreleme yokken dosya yazılmaz (düz metin yedeği yok)');
  await call('secrets:set', 'collabToken', PLAIN);
  state.encryptionAvailable = true;
  ok((await call('secrets:set', 'collabToken', PLAIN)).success === true, 'şifreleme geri gelince kayıt çalışır');
  state.encryptionAvailable = false;
  ok((await call('secrets:has', 'collabToken')).has === false, 'şifreleme yokken has: false (okunamaz)');
  ok((await call('secrets:get', 'collabToken')).value === '', 'şifreleme yokken get: boş değer, dosya içeriği sızmaz');
  ok(await secrets.readSecret('collabToken') === '', 'şifreleme yokken readSecret boş döner');
  state.encryptionAvailable = true;

  // --- bozuk şifreli veri: hata sızmaz, boş döner ---
  state.decryptFails = true;
  const badGet = await call('secrets:get', 'collabToken');
  ok(badGet.value === '' && !badGet.error, 'çözme hatasında get boş değer döner, hata mesajı sızmaz');
  ok((await call('secrets:has', 'collabToken')).has === false, 'çözme hatasında has: false');
  state.decryptFails = false;

  // --- temizlik ---
  await call('secrets:set', 'collabToken', '');
  fs.rmSync(userData, { recursive: true, force: true });
  console.log(fails ? `\n${fails} test başarısız` : '\nTüm gizli değer testleri geçti');
})().catch((e) => { console.error('FAIL beklenmeyen hata:', e); process.exitCode = 1; });
