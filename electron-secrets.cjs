// Gizli değerler (ör. ortak düzenleme sunucu token'ı) için şifreli yerel depo.
// - Değer yalnız ana süreçte şifrelenir/çözülür (Electron safeStorage); düz metin diske yazılmaz.
// - Yalnız izin verilen anahtarlar kullanılabilir; renderer rastgele dosya adı üretemez.
// - Şifreleme kullanılamıyorsa kaydetme reddedilir (düz metin yedek yoktur).
const { app, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

const ALLOWED = new Set(['collabToken', 'aiKey_anthropic', 'aiKey_openai']);
const MAX_LEN = 2048;

const fileFor = (key) => path.join(app.getPath('userData'), `secret-${key}.bin`);

async function canEncrypt() {
  try {
    return await safeStorage.isAsyncEncryptionAvailable();
  } catch {
    return false;
  }
}

// Ana süreç içi okuma (renderer'a geçmez): AI sağlayıcı anahtarları için.
async function readSecret(key) {
  if (!ALLOWED.has(key)) return '';
  try {
    if (!(await canEncrypt()) || !fs.existsSync(fileFor(key))) return '';
    const { result } = await safeStorage.decryptStringAsync(fs.readFileSync(fileFor(key)));
    return result;
  } catch {
    return '';
  }
}

function register() {
  ipcMain.handle('secrets:get', async (_e, key) => {
    if (!ALLOWED.has(key)) return { error: 'invalid-key' };
    try {
      if (!(await canEncrypt()) || !fs.existsSync(fileFor(key))) return { value: '' };
      const { result } = await safeStorage.decryptStringAsync(fs.readFileSync(fileFor(key)));
      return { value: result };
    } catch {
      return { value: '' };
    }
  });

  ipcMain.handle('secrets:set', async (_e, key, value) => {
    if (!ALLOWED.has(key) || typeof value !== 'string' || value.length > MAX_LEN) return { success: false, error: 'invalid-input' };
    if (value === '') {
      try { fs.rmSync(fileFor(key), { force: true }); } catch { /* yok */ }
      return { success: true };
    }
    if (!(await canEncrypt())) return { success: false, error: 'no-encryption' };
    fs.writeFileSync(fileFor(key), await safeStorage.encryptStringAsync(value), { mode: 0o600 });
    return { success: true };
  });
}

module.exports = { register, readSecret };
