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
2. `npm test` — `ssh.test.cjs` (uzak yol/profil/parmak izi çekirdeği) ve `ssh-sftp.test.cjs` (sahte SSH/SFTP sunucusuyla uçtan uca; `ssh2` yoksa atlanır), `git.test.cjs` (durum, sahneleme, commit, dallar, kilit, yol güvenliği, diff, merge/çakışma, stash, etiket, amend/undo), `release.test.cjs` (sürüm düzeyi patch/minor/major, hazırlama çıktıları, bekleyen sürüm, etiket kararı, ata olmayan etiket; geçici git depolarında), `palettes.test.cjs` (renk temaları: hex geçerliliği, WCAG kontrast kapısı, şema↔tablo birebirliği, vurgu/yazı tipi yığınları), `sync.test.cjs` (yerel bare depoyla fetch/pull/push, ayrışma), `term.test.cjs` (terminal süzgeci, kimlik reddi, gerçek PowerShell/CMD turu), `textbuffer.test.cjs`, `debug.test.cjs` (gerçek Node süreci), `pty.test.cjs` (gerçek ConPTY), `lsp.test.cjs` (güvenlik + PATH'te pyright varsa gerçek sunucu; `NOVA_TEST_PATH`), `ai-tools.test.cjs` (ajan araçları), `ai-complete.test.cjs` (AI kod tamamlama, sahte Ollama).
3. `npm run brain:check` — md bağlantıları, aksiyon başlıkları, IPC eşleşmesi, i18n 8 dil.
4. `npm run build` + `node scripts/check-bundle.mjs` — bütçe: JS 700 KB (gzip 230), CSS 150 KB.
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

## Denetim düzeltmeleri (17.11.2026)
Yeni testler: `paths.test.cjs` (yol doğrulama, symlink), `fs-handlers.test.cjs` (fs:* IPC işleyicileri: çalışma klasörü sınırı, bağ kaçışı, geçersiz yol, onaylı dış dosyalar; electron taklit edilir, #168 kısmi), `secrets.test.cjs` (secrets:has/get/set: yalnız collabToken renderer'a, AI anahtarı reddedilir, diskte düz metin yok, şifreleme yokken yazılmaz; safeStorage taklit edilir), `ipc-contract.test.cjs` (preload ↔ ana süreç kanal sözleşmesi, statik tarama: invoke/send/on ↔ handle/on/send, kayıt tekrarı, dinamik kanal, ham ipcRenderer; uyarılar kullanılmayan kanalları listeler), `ai-security.test.cjs`, `syncserver.test.cjs` (sync sunucusu sertleştirme).

- Test dosyalarında sahte anahtar/özel anahtar değerleri kaynakta bütün yazılmaz, çalışma zamanında birleştirilir (`check-hygiene.mjs` sır taraması kaynakta eşleşme görmesin; bkz. `ai-security.test.cjs`).

## Denetim düzeltmeleri, ikinci dalga (17.11.2026)
Yeni testler: `services.test.cjs` (saf servisler, Vite SSR ile `.ts` yükleme), `i18n.test.cjs` (909+ anahtar 8 dil, yer tutucu, `MSG` tablosu; kullanılmayan anahtar yalnız uyarı), `electron-misc.test.cjs` (ext/llm/search saf kısımları), `replace.test.cjs`, `trust.test.cjs`, `preview-csp.test.cjs`, `history.test.cjs`, `snippets.test.cjs`, `keybindings.test.cjs`. Windows'ta sembolik bağ oluşturulamadığı için ilgili senaryolar atlanır. (28.11.2026: bu boşluklar kapandı; bkz. «#168 kapanışı» bölümü.)

## Uygulama içi Test sekmesi (21.11.2026)
Alt paneldeki Test sekmesi kullanıcı projesinin testlerini çalıştırıp özetler (bkz. [[terminal]]); ayrıştırıcı `src/services/testParse.ts`. Yeni runner eklenirse özet satırı deseni oraya eklenir ve örnek çıktıyla denenir.

## #168 kapanışı: ana süreç modülleri (28.11.2026)
Üretim kodu değiştirilmedi. Modüller `electron`, `electron-updater`, global `fetch` ve `package.json` taklidiyle (`Module._load`) yüklenir; issue'nun öngördüğü ayıklama (refactor) gerekmedi ([[DECISIONS]]).
- `update.test.cjs` (electron-update, 34 kontrol): geliştirme kanalında güncelleyici ve ağ yok; kurulum yalnız hazır paket için ve tek kez (`quitAndInstall(false, true)`); indirme sürerken gelen denetim olayı durumu geri almaz; hatalar `checksum` / `no-release` / `network` / `failed` koduna çevrilir; Hakkında'daki Electron sürümü sayısal karşılaştırmayla seçilir ve 6 saat önbelleğe alınır; `app:openLink` yalnız https ve kimlik bilgisiz adresleri açar.
- `github.test.cjs` (electron-github, 73 kontrol): cihaz akışı (bekleme, yavaşlatma, onay, red, süre dolumu, iptal, geçici ağ hatası); güvenilmeyen doğrulama adresi (host, şema) reddedilir; token yalnız şifreli yazılır, şifreleme yoksa diske yazılmaz; açılışta geri yükleme, yenileme ve geçersiz yenileme token'ının temizlenmesi; PR / yeni depo / commit yazarı / depo durumu girdi ve hata yolları; 401'de oturum temizlenir; token yalnız `api.github.com`a gider ve hiçbir renderer bildirimine girmez.
- `preload.test.cjs` (electron-preload, dinamik yükleme): tek köprü `electronAPI`; ham `ipcRenderer` açılmaz; her yöntemin kanalları `ad:eylem`; yakınlaştırma 0.8–1.5 ile sınırlı ve aynı değer tekrar uygulanmaz; dinleyici aboneliği kaldırılır.
- `electron-llm.cjs` yok: yerleşik model 18.11.2026'da kaldırıldı; #168'in llm maddesi kapsam dışı.
- Doğrulama: beş bilinçli bozulma (doğrulama adresi host kontrolü, şifreleme koruması, kurulum koşulu, sürüm karşılaştırması, yakınlaştırma sınırı) geçici bir kopyada denendi; her biri ilgili testte başarısız oldu. Repo dosyaları bu sırada değiştirilmedi.
- Test kaynağında sır görünümlü sahte değer bırakılmaz: jetonlar çalışma zamanında birleştirilir (`fake(...)`), çünkü hijyen adımı (`check-hygiene.mjs`) `token = '…'` biçimini "olası sır" sayar. Host denetimi URL ayrıştırmayla (`new URL(u).hostname`) yapılır; alt dize eşleşmesi CodeQL'in "Incomplete URL substring sanitization" uyarısına yol açar. Bu iki kural PR #198'de CI'yi durdurmuştu.

## Render sayımı: ayar sürüklemesi (#169, 28.11.2026)
- Üretim derlemesi `minify` kapalı alınır (bileşen adları korunur), statik sunucuyla açılır; Edge headless `--remote-debugging-port` ile CDP'ye bağlanılır. Ayrı derleme dizini kullanılır; çalışan `electron:dev` oturumunun Vite önbelleğine dokunulmaz.
- Sayfa açılmadan önce React DevTools global kancası enjekte edilir (`Page.addScriptToEvaluateOnNewDocument`). `onCommitFiberRoot` her commit'te fiber ağacını gezer; `PerformedWork` (bayrak 1) taşıyan fonksiyon, forwardRef ve memo bileşenleri sayılır.
- Kaydırıcı sürüklemesi native `value` setter ve `input` olayıyla adım adım simüle edilir. `uiZoom` gibi `deferred` kaydırıcılar yalnız bırakınca yazar; bu yüzden ölçüme uygun değildir. Ayar modalı önce ilgili kategoriye gidilerek açılır (`nav` düğmeleri).
- Uyarı: bayrağı eski kalan fiber'lar yanlış sayılabilir. Bir önceki commit'e bakan filtre bazı gerçek çizimleri de düşürdü (Terminal örneği); bu yüzden ham sayım raporlanır.
- Kapsam: yalnız web sürümü ölçülür (`electron` yok). Geçici dosyalar repoya girmez.
