// Uygulama simgesini public/logo.svg'den üretir: public/icon.png (512x512, şeffaf köşeli).
// Kullanım: npx electron scripts/make-icons.cjs   (yeni bağımlılık gerekmez, Electron'un kendi oluşturucusu kullanılır)
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const SIZE = 512;

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '..', 'public', 'logo.svg'), 'utf8');
  const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent;overflow:hidden}svg{display:block;width:${SIZE}px;height:${SIZE}px}</style>${svg}`;
  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    frame: false,
    transparent: true,
    useContentSize: true,
    webPreferences: { offscreen: true, backgroundThrottling: false }
  });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise((r) => setTimeout(r, 400));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: SIZE, height: SIZE });
  const out = path.join(__dirname, '..', 'public', 'icon.png');
  fs.writeFileSync(out, image.resize({ width: SIZE, height: SIZE, quality: 'best' }).toPNG());
  console.log('yazıldı:', out, image.getSize());
  app.quit();
});
