---
action: testing
purpose: Değişikliği doğrulamak: tip, derleme, birim ve entegrasyon testleri, uygulamayı çalıştırma
reads: [CLAUDE, AGENT, STATE]
writes: [AGENT]
triggers: ["test", "doğrula", "build", "tsc"]
---
# Aksiyon: Doğrulama

## Sıra (en fazla 3 tur)
1. `npx tsc --noEmit` — tip kontrolü (build tipleri denetlemez).
2. `npm test` — `git.test.cjs` (durum, sahneleme, commit, dallar, kilit, yol güvenliği, diff, merge/çakışma, stash, etiket, amend/undo), `sync.test.cjs` (yerel bare depoyla fetch/pull/push, ayrışma), `term.test.cjs` (terminal süzgeci, kimlik reddi, gerçek PowerShell/CMD turu), `textbuffer.test.cjs`, `debug.test.cjs` (gerçek Node süreci), `pty.test.cjs` (gerçek ConPTY), `lsp.test.cjs` (güvenlik + PATH'te pyright varsa gerçek sunucu; `NOVA_TEST_PATH`), `ai-tools.test.cjs` (ajan araçları).
3. `npm run brain:check` — md bağlantıları, aksiyon başlıkları, IPC eşleşmesi, i18n 8 dil.
4. `npm run build` + `node scripts/check-bundle.mjs` — bütçe: JS 600 KB (gzip 200), CSS 100 KB.
5. `npm audit --omit=dev --audit-level=moderate`.
6. Uygulamayı çalıştır: Vite (`npx vite --port 5173 --strictPort`) + `electron .` (`NODE_ENV=development`). Sayfa durumu için `--remote-debugging-port` yalnız geçici kullanılır, iş bitince kapatılır.

## Test yazarken
- Electron'u taklit eden yardımcı: testler `electron`'u `Module._load` ile taklit eder; gerçek `git` ve geçici dizinler kullanılır.
- Her yeni IPC kanalı için en az bir test ve bir "yetkisiz/bozuk girdi reddedilir" testi.
- **Gizli pencere:** test örneğini `NOVA_HEADLESS=1` ile başlat (pencere ekran dışında ve odaksız açılır; render sürer, kullanıcı görmez ve karışmaz). `electron . --user-data-dir=<dizin> --remote-debugging-port=<port>` ile birlikte kullan; `recent-folders.json`'u profile önceden yazarak gerçek bir proje klasörünü diyalog olmadan açabilirsin.
- **Ayrı profil:** çalışan uygulamayı bozmamak ve kullanıcının ayarlarına dokunmamak için testi `electron . --user-data-dir=<geçici dizin> --remote-debugging-port=<port>` ile ayrı örnekte çalıştır; işin bitince yalnız kendi süreçlerini kapat. Kullanıcının açık penceresinde ayar değiştirme.
- **Canlı ayar testi:** DevTools protokolüyle ayarı değiştir (React uyumlu: `HTMLSelectElement.prototype.value` setter + `change` olayı), sonra etkisini ölç: `document.documentElement.dataset.theme`, CSS değişkeni, `monaco.editor.getEditors()[n].getRawOptions()`.
- Görsel doğrulamada yalnız uygulamanın kendi içeriğini yakala (DevTools `Page.captureScreenshot`); ekran yakalama başka pencereleri içerebilir.

## GitHub oturumu gerektiren arayüz (Git paneli)
Git verisi GitHub bağlı değilken kilitlidir. İzole testte oturumu ürün koduna dokunmadan taklit et: `NODE_OPTIONS=--require=<test>/ghpatch.cjs` ile `electron-github.cjs`.`isConnected` ve `github:status` yanıtını geçersiz kıl (yalnız test betiğinde dursun).

## Arayüz doğrulama (ekran görüntüsü + ölçüm)
Ayrı profille Electron: `NOVA_HEADLESS=1 npx electron . --remote-debugging-port=<p> --user-data-dir=<tmp> --disable-features=CalculateNativeWinOcclusion --disable-backgrounding-occluded-windows --disable-renderer-backgrounding` (ekran dışı pencere bu bayraklar olmadan çizilmez). `ws` paketiyle CDP'ye bağlan: `Emulation.setDeviceMetricsOverride` (1360×860, 980×660, 720×600), `Page.captureScreenshot`, `Runtime.evaluate`. Taşma ölçümü: kök kaptan `scrollWidth/clientWidth` ve `scrollHeight/clientHeight`. Yalnız uygulamanın kendi sayfası görüntülenir. Klasör açmak için profilin `recent-folders.json` dosyasına yol yaz ve karşılama sayfasındaki öğeye tıkla. Güncelleme akışı için sahte besleme: [[updates]].

## Çıktı
Sonucu [[AGENT]] **Durum**'a tek satır yaz (ne doğrulandı, ne doğrulanamadı).
