# Denetim yapılacaklar listesi (doğrulanmış bulgular)

Kaynak: derin tarama, 17.11.2026 (güvenlik, performans, hata/arayüz/özellik). Otomatik sezgisel rapor: [[AUDIT]]. Süreç ve kurallar: [[audit]]. Bulgular kodda doğrulandı, uygulama çalıştırılmadı; satır numaraları yaklaşık. Durum: `açık` · `sürüyor` · `giderildi (tarih, sürüm)` · `kabul (neden → [[DECISIONS]])`.

Kritik düzeyde bulgu yok. **Birinci ve ikinci dalga düzeltmeleri 17.11.2026'da uygulandı;** aşağıdaki Durum sütunu güncel. Kalanlar: S-04 (sertifika), S-18 (ürün kararı), I-05 (ürün kararı), F-08, T-01 kısmı, küçük kısmen maddeler. İlk sıralama (tarihsel):  S-02/S-03 (sync sunucusu kimlik doğrulamasız çökertilebilir), S-06/S-07 (güvenilmeyen klasörde `.git/config` ile kod çalışması), S-01 (CSP + sandbox), B-01/B-02 (kaydedilmemiş veri kaybı).

## Güvenlik ([[security-kvkk]])
| Kimlik | Önem | Konum | Sorun | Çözüm | Durum |
|---|---|---|---|---|---|
| S-01 | yüksek | `electron-main.cjs:31-37`, `index.html` | CSP yok, `sandbox:false`; preload yüzeyi geniş (term/pty/debug/run_command/secrets): bir renderer XSS'i doğrudan RCE olur (şu an doğrulanmış XSS yok, savunma derinliği eksiği) | `sandbox:true` + `session.webRequest.onHeadersReceived` ile sıkı CSP | giderildi (17.11.2026) |
| S-02 | yüksek | `server/sync-server.mjs:114` | `decodeURIComponent` token kontrolünden önce, try/catch'siz: `/%` isteği süreci kimlik doğrulamasız çökertir | `upgrade` gövdesini try/catch'e al, önce token, hatada 400 | giderildi (17.11.2026) |
| S-03 | yüksek | `server/sync-server.mjs:98-124` | `handleMessage` try/catch'siz: bozuk Yjs/awareness mesajı süreci düşürür | try/catch + `conn.close(1003)`, `uncaughtException` günlüğü | giderildi (17.11.2026) |
| S-04 | yüksek | `package.json` build.win, `ci-cd.yml:125-128` | Windows kod imzalama yok; güncelleyici yalnız `latest.yml` SHA-512'ye güveniyor, release ele geçirilirse imzasız güncelleme kurulur | EV/OV sertifika veya Azure Trusted Signing, `publisherName` | kısmen: CSC_LINK/CSC_KEY_PASSWORD secret hazır, gerçek sertifika gerekir; sertifika alınınca `publisherName` eklenir |
| S-05 | yüksek | `electron-ai.cjs:81-89,195-196` | Otonom modda `npm run build/test`, `cargo`, `pytest`, `dotnet` onaysız çalışır; güvenilmeyen projedeki betik kod çalıştırır | Çalışma klasörü güveni (workspace trust) iste | giderildi (17.11.2026) |
| S-06 | yüksek | `electron-ai.cjs:46-66,95-102` | Ajan `autoApproveEdits` ile `.git/hooks/*` veya `.git/config` yazabilir (`resolveInRoot` `.git`'i engellemiyor) | AI araçlarında `.git/` altına yazmayı reddet, `isRiskyPath`'e ekle | giderildi (17.11.2026) |
| S-07 | yüksek | `electron-main.cjs:436-451`, `electron-git.cjs:34-47` | Güvenilmeyen depodaki `.git/config` (`core.fsmonitor`, `core.sshCommand`, `core.pager`) git her çalışınca kod çalıştırabilir (klasör açınca `git:status` dahil) | `-c core.fsmonitor=false -c core.sshCommand= -c core.pager=cat`; güvenilmeyen klasörde git'i onaya bağla | giderildi (17.11.2026) |
| S-08 | orta | `electron-ai.cjs:34-43,706` | `req.baseUrl` renderer'dan geliyor; API anahtarı keyfi https adresine gidebilir | Özel taban adresi kalıcı, onaylı izin listesi | giderildi (17.11.2026) |
| S-09 | orta | `electron-secrets.cjs:35-44`, `AIAssistant.tsx:264` | `secrets:get` AI anahtarını düz metin renderer'a veriyor; kural "renderer'a geçmez" diyor | `secrets:has` (boolean); `get` yalnız `collabToken` | giderildi (17.11.2026) |
| S-10 | orta | `electron-main.cjs:316-416` | `fs:*` işleyicileri `realpath` kullanmıyor: çalışma klasöründeki symlink/junction dışarıyı okutur/yazdırır/siler (debug/lsp/ai kullanıyor) | `insideWorkspace`'te `fs.realpathSync` (olmayan hedefte en yakın üst dizin) | giderildi (17.11.2026) |
| S-11 | orta | `electron-main.cjs:70-75` | `setWindowOpenHandler` düz `http:` dahil açıyor; `will-navigate` engeli yok | `will-navigate` `preventDefault`, `openExternal` için `new URL` + yalnız https | giderildi (17.11.2026) |
| S-12 | orta | `Preview.tsx:202-204` | Sandbox'lı önizleme `postMessage nav` ile kullanıcı tıklaması olmadan sürekli tarayıcı sekmesi açtırabilir | Yalnız tıklama kaynaklı, hız sınırlı, onaylı | giderildi (17.11.2026); onay penceresi yerine gerçek tıklama + hız sınırı |
| S-13 | orta | `electron-debug.cjs:115-125`, `electron-lsp.cjs:122-146` | Hata ayıklayıcı klasördeki `.js`'i, LSP proje yapılandırmasını çalıştırır; tüm `process.env` çocuğa geçer; workspace trust yok | İlk çalıştırmada güven sor, `env` izin listesi | giderildi (17.11.2026) |
| S-14 | orta | `EditorArea.tsx:215`, `App.tsx:1442` | Ortak düzenleme oda adı yerel mutlak yol (Windows kullanıcı adı içerebilir) sunucuya gidiyor: **KVKK** (kişisel veri, gereksiz aktarım) | Rastgele/kullanıcı belirli oda kimliği; veri akışı tablosunu güncelle | giderildi (17.11.2026) |
| S-15 | orta | `EditorArea.tsx:216-217`, `sync-server.mjs:115` | Token URL query'de (günlüklerde görünür), tek paylaşımlı token; deneme/bağlantı sınırı ve Origin denetimi yok | Token ilk mesajla/`Sec-WebSocket-Protocol`, IP başına oran sınırı | giderildi (17.11.2026) |
| S-16 | orta | `sync-server.mjs:29,60-90` | `docs` Map'i hiç temizlenmiyor, oda sayısı sınırsız (bellek tüketimi) | Son bağlantı kapanınca `destroy()`+`delete`, üst sınır | giderildi (17.11.2026) |
| S-17 | orta | `electron-llm.cjs:104-105` | GGUF modeli yalnız boyutla doğrulanıyor (SHA-256 yok) | Kataloğa sabit SHA-256 | giderildi (17.11.2026) |
| S-18 | orta | `electron-github.cjs:10` | OAuth kapsamı `repo` tüm özel depolara tam yetki | Daha dar kapsam / GitHub App | kabul: `repo` kapsamı özel depo ve push için gerekli; daraltma ince ayarlı GitHub App ürün kararı ([[DECISIONS]]) |
| S-19 | düşük | `.github/workflows/*` | Action'lar etiketle çağrılıyor (SHA pin yok); `softprops/action-gh-release` `contents: write` işinde | Tam SHA'ya pin (dependabot güncel tutar) | giderildi (17.11.2026) |
| S-20 | düşük | `ci-cd.yml:124` | Release işinde (`contents: write`) `npm ci` yaşam döngüsü betikleriyle | `--ignore-scripts` veya iş ayrımı | kısmen: `--ignore-scripts` eklendi, CI'da ilk release'te native modüller (node-llama-cpp, node-pty) izlenecek |
| S-21 | düşük | `dependabot-automerge.yml:27-28` | Çalışma zamanı bağımlılıklarında (electron-updater, ws, node-pty) patch/minor otomatik birleşiyor | Yalnız dev bağımlılıklarda auto-merge | giderildi (17.11.2026) |
| S-22 | düşük | `electron-update.cjs:12,40-43` | `NOVA_UPDATE_FEED` paketli uygulamada da güncelleme kaynağını değiştirir | Yalnız `!app.isPackaged` | giderildi (17.11.2026) |
| S-23 | düşük | `electron-term.cjs:88,101`, `electron-main.cjs:476` | Klasik terminal `cwd` için çalışma klasörü kısıtı yok; PowerShell `-ExecutionPolicy Bypass` | `withinWorkspace`, `Bypass` yerine Process kapsamı | giderildi (17.11.2026) |
| S-24 | düşük | `electron-github.cjs:181-185` | `verification_uri` host doğrulamasız `openExternal`'a gidiyor | `https:` + `github.com` kontrolü | giderildi (17.11.2026) |
| S-25 | düşük | `electron-ai.cjs:20` | `SECRET_FILE` `.git/config`, `.pypirc`, `.docker/config.json`, `.aws/*` kapsamıyor; `read_file` bunları buluta taşıyabilir (**KVKK**) | Desene ekle | giderildi (17.11.2026) |
| S-26 | düşük | `electron-ai.cjs:713-725` | Sağlayıcıya giden mesaj bağlamı (200 KB, görsel) ana süreçte gizli dosya/anahtar filtresinden geçmiyor; ilk gönderimde açık rıza akışı doğrulanmadı (**KVKK**) | Ana süreçte tarama + ilk kullanımda rıza | giderildi (17.11.2026) |
| S-27 | düşük | `electron-ai.cjs:419-446` | Dikte sabit `127.0.0.1:8080`'e güveniyor; whisper ikilisi kullanıcı yazılabilir dizinde | Rastgele port + ikili hash | kısmen: rastgele port + whisper ikili hash'i ilk kullanımda sabitlenir (ilk kullanımda güven); elle güncellemede dikte reddedilir |
| S-28 | düşük | `App.tsx:161-173` | `CONSOLE_LOG` `message` dinleyicisi `event.source` denetlemiyor | Beklenen iframe ile eşle | giderildi (17.11.2026) |
| S-29 | düşük | `package.json` build | Electron Fuses yok (`OnlyLoadAppFromAsar`, asar bütünlüğü); debug `ELECTRON_RUN_AS_NODE` kullandığı için `RunAsNode` kapatılamıyor | `@electron/fuses` ile en az iki fuse | giderildi (17.11.2026); `RunAsNode`/inspect debug için açık kalır |
| S-30 | düşük | `package.json` | `dompurify` bağımlılıkta duruyor ama `src`'de kullanılmıyor (HTML basılmıyor) | Kaldır ya da gerektiğinde kullan | giderildi (17.11.2026) |

**İyi durumda (doğrulandı):** `contextIsolation`/`nodeIntegration:false`/`webSecurity`; git `execFile` + argüman dizisi + ref doğrulama; token `safeStorage` ile; VSIX bellekte okunur (zip-slip yok); XSS sink yok; güncelleyici SHA-512 + `allowDowngrade:false`; CI `permissions` kısıtlı, `pull_request_target` yok, CodeQL + gitleaks + dependency review.

## Hata (bug)
| Kimlik | Önem | Konum | Sorun | Çözüm | Durum |
|---|---|---|---|---|---|
| B-01 | yüksek | `App.tsx:556,739` | `handleCloseTab` kaydedilmemiş sekmeyi sormadan kapatıyor (X, orta tık, Ctrl+W) | Kaydet/Kaydetme/İptal onayı (8 dil) | giderildi (17.11.2026) |
| B-02 | yüksek | `electron-main.cjs:77,493` | Pencere kapanırken kaydedilmemiş değişiklik denetimi yok; otomatik kayıt varsayılanı kapalı | `close` olayında renderer'a dirty sor | giderildi (17.11.2026) |
| B-03 | yüksek | `App.tsx:751-758` | `deleteItem` sonucu kontrol edilmiyor: silme başarısızsa bile sekme kapanır, "Silindi" yazılır | `res.success` denetle | giderildi (17.11.2026) |
| B-04 | yüksek | `App.tsx:751-757`, `electron-main.cjs:393` | Klasör silinince içindeki açık dosyaların sekmeleri kalır; silme kalıcı (`rmSync`) | Alt sekmeleri kapat, `shell.trashItem` | giderildi (17.11.2026) |
| B-05 | yüksek | `App.tsx:181-203`, `electron-main.cjs:150-165` | Harici silme/yeniden adlandırma açık sekmeye yansımıyor; dirty sekmede harici değişiklik uyarısı yok, sonraki kayıt diski ezer | "Diskte yok" rozeti, dirty+değişmiş için karşılaştırma/üzerine yaz | giderildi (17.11.2026) |
| B-06 | yüksek | `App.tsx:582-600` | `handleSaveFile` biçimlendirme/yazma beklerken kullanıcı yazarsa yeni yazılanı eski içerikle ezer | Kayıt sonrası içerik eşitse `isModified` kapat, değilse dokunma | giderildi (17.11.2026) |
| B-07 | yüksek | `src/main.tsx`, `App.tsx` | `ErrorBoundary` yok; bileşen hatası beyaz ekran, lazy chunk hatasında panel boş | Kök ve lazy panellere ErrorBoundary + "Yeniden yükle" | giderildi (17.11.2026) |
| B-08 | yüksek | `electron-main.cjs:359-367` | `writeFileSync` eşzamanlı ve atomik değil: büyük dosya ana süreci bloklar, çökmede dosya kesilebilir | Geçici dosyaya yaz + `rename` (async) | giderildi (17.11.2026) |
| B-09 | orta | `electron-main.cjs:347-352` | `readFile` her zaman utf8, boyut sınırı/BOM/ikili tespiti yok | Eşik uyarısı, ikili tespit, BOM koru | giderildi (17.11.2026) |
| B-10 | orta | `App.tsx:697-735` | Yol ayırıcı `includes('\\')` ile tahmin ediliyor; karışık yolda `remap` eşleşmeyebilir | Tek biçime (`normPath`) çevir | giderildi (17.11.2026) |
| B-11 | orta | `App.tsx:180-209` | Watcher her olayda tüm ağacı yeniden okuyor; eski sonuç yenisini ezebilir | İstek sayacı/iptal, yalnız son sonuç | giderildi (17.11.2026) |
| B-12 | orta | `App.tsx:745-746`, `electron-main.cjs:296-310` | Terminal `cd` `setTimeout(80)` zamanlamasına bağlı; boş `catch` | Terminal hazır olayı bekle | giderildi (17.11.2026) |
| B-13 | orta | `Preview.tsx:283,50` | URL kipinde `allow-scripts allow-same-origin` sandbox'ı fiilen etkisizleştirir; `postMessage(m,'*')` | Yalnız localhost, `allow-same-origin` kaldır, hedef origin | giderildi (17.11.2026) |
| B-14 | orta | `App.tsx:403-405,963` | Sekme/oturum kalıcılığı ve kaydedilmemiş taslak (hot exit) yok | Oturum dosyası, açılışta geri yükle | giderildi (17.11.2026) |
| B-15 | orta | `App.tsx:1152-1159` | Ayarlar modalı `role="dialog"` ama odak tuzağı, ilk odak, odak iadesi yok | Odak tuzağı ekle | giderildi (17.11.2026) |
| B-16 | düşük | `src/components` | 6 yerde `key={i}` | Kararlı id | giderildi (17.11.2026); Terminal ANSI ve FileTree indent statik listeleri kabul |

## i18n
| Kimlik | Önem | Konum | Sorun | Çözüm | Durum |
|---|---|---|---|---|---|
| I-01 | orta | `SettingsContext.tsx:94`, `index.html:2` | Dil değişince `html lang` ve `dir` ayarlanmıyor; Arapça arayüz LTR kalıyor; ~91 fiziksel `ml-/mr-/pl-/pr-` yön sınıfı | `applyAppearance`'ta `lang`+`dir`, mantıksal sınıflar, editör/terminal `dir="ltr"` | giderildi (17.11.2026); kalan: `origin-left` ve ChipSlider okları fiziksel |
| I-02 | orta | `App.tsx` (çok satır) | `addLog` mesajları sabit Türkçe ("Kaydedildi", "Silindi", "Taşındı"…) | `t()` anahtarları, 8 dil | giderildi (17.11.2026) |
| I-03 | orta | `App.tsx:1275,1397,1450`, `EditorArea.tsx:417`, `GitPanel.tsx:596`, `MenuBar.tsx:55`, `Preview.tsx:283` | Sabit `title`/`aria-label` metinleri | `t()` | giderildi (17.11.2026) |
| I-04 | düşük | `Preview.tsx:52-53` | Önizleme köprüsü hata metinleri sabit Türkçe | `t()` ile enjekte | giderildi (17.11.2026) |
| I-05 | düşük | `uiText.ts:1607-1611` | Desteklenmeyen sistem dilinde sessizce Türkçe; İngilizce yedek daha doğal olabilir | Ürün kararı: yedek dil `en` mi? (kurucuya sor) | açık: ürün kararı (kurucuya sorulacak) |

## Arayüz ve erişilebilirlik ([[ui-design]], [[motion]])
| Kimlik | Önem | Konum | Sorun | Çözüm | Durum |
|---|---|---|---|---|---|
| U-01 | orta | `FileTree.tsx:783,831`, `Terminal.tsx:458` | Bölüm başlıkları `div onClick`: klavyeyle açılmaz, `aria-expanded` yok | `button` veya role+tabIndex+Enter/Space | giderildi (17.11.2026); `Terminal.tsx:458` başlık değil, çıktı alanı |
| U-02 | orta | `style.css:395-637` | Sabit ms animasyonlar (180/260/600/1100ms…); `--dur-*` jetonları var ama kullanılmıyor (kural 9) | Jetonlara çevir | giderildi (17.11.2026) |
| U-03 | orta | `FileTree.tsx`, `SplashScreen.tsx`, `AIAssistant.tsx`, `UpdateDialog.tsx`, `Terminal.tsx`, `WindowControls.tsx` | Tailwind `duration-*` ve satır içi ms | `motion-*` sınıfları | giderildi (17.11.2026) |
| U-04 | orta | `App.tsx:1157`, `style.css:523-604` | Modal gölgesi ve `box-shadow` yığını (kural 9) | Düz kenarlık + tek odak halkası | giderildi (17.11.2026) |
| U-05 | orta | `AIAssistant.tsx:549,665,685`, `ChipSlider.tsx:52` | AI avatarlarında indigo→mor→fuşya degrade (kural 9: degrade yok, tek vurgu) | Düz `bg-indigo-500` | giderildi (28.11.2026, #170): AI bileşenlerinde degrade ve violet yok; slider dolgusu fonksiyonel |
| U-06 | düşük | `LandingPage.tsx:128` vb. (18 yer) | Koyu zeminde `text-zinc-600/700` WCAG AA kontrastı geçmez | En az `zinc-400/500` | giderildi (17.11.2026) |
| U-07 | düşük | `ExtensionsPanel`, `GitPanel`, `PtyView`, `AIAssistant` | `button` sayısı `aria-label`'dan fazla (örnek sayım, tek tek doğrulanmadı) | Metinsiz düğmeleri tara | giderildi (17.11.2026) |
| U-08 | düşük | `App.tsx:1152` | Ayarlar modalı dar pencerede kırılma testi yok | Dar genişlikte kategori listesi üst sekme | giderildi (17.11.2026) |

## Eksik özellik (VS Code karşılaştırması)
| Kimlik | Öncelik | Özellik | Not | Durum |
|---|---|---|---|---|
| F-01 | yüksek | Oturum/sekme geri yükleme, kapatılan sekmeyi yeniden aç (Ctrl+Shift+T) | B-14 ile birlikte çözülür | giderildi (17.11.2026) |
| F-02 | yüksek | Çalışma alanında bul-değiştir | `SearchPanel` yalnız arıyor; önizlemeli, onaylı toplu değiştirme | giderildi (17.11.2026) |
| F-03 | orta | Bölünmüş editör | İki dosyayı yan yana düzenleme | giderildi (17.11.2026) |
| F-04 | orta | Kısayol özelleştirme | `keybindings` ayarı + çakışma denetimi | giderildi (17.11.2026) |
| F-05 | orta | Görev çalıştırıcı (`tasks.json`) | build/test tek tuş | giderildi (17.11.2026) |
| F-06 | orta | Kullanıcı snippet'leri | Tekrarlayan kod | giderildi (17.11.2026) |
| F-07 | orta | Yerel geçmiş / zaman çizelgesi | Silme kalıcı olduğu için güvenlik ağı (B-04) | giderildi (17.11.2026) |
| F-08 | düşük | Çoklu kök çalışma alanı, uzaktan geliştirme (SSH/devcontainer) | Büyük kapsam | yapılmadı: uzaktan geliştirme ve çoklu kök ayrı ürün projesi |
| F-09 | düşük | Test paneli/keşfi; çoklu imleç keşfi | Sorun paneli, minimap, hata ayıklayıcı, ayar araması mevcut | kısmen: çoklu imleç komutları paletten erişilir; test paneli yapılmadı |

## Test boşlukları ([[testing]])
| Kimlik | Önem | Sorun | Çözüm | Durum |
|---|---|---|---|---|
| T-01 | orta | `electron-main.cjs` (dosya işlemleri, path traversal), `electron-search`, `electron-ext`, `electron-secrets`, `electron-update`, `electron-github`, `electron-llm`, `electron-preload` testsiz | Önce `insideWorkspace`/`withinWorkspace` ve arama sınır testleri (güvenlik öncelikli) | kısmen: search/ext/llm saf kısımları test edildi; secrets/update/github için ayıklama gerekir |
| T-02 | orta | `problems.ts`, `previewKind.ts`, `terminalText.ts`, `lang.ts`, `lspStore.ts`, `debugStore.ts`, `cursorStore.ts`, `extensionsService.ts` testsiz; bileşen test altyapısı yok | Saf servislere hızlı node testleri | giderildi (17.11.2026) |
| T-03 | düşük | i18n eksiksizlik testi yok (boş/aynı metin, kullanılmayan anahtar) | Anahtar kullanım betiği | giderildi (17.11.2026) |

## Performans
Ölçüm ipucu (kod okuması, çalıştırılıp ölçülmedi): `dist/` 31 MB (Monaco `dist/vs` 25 MB); ana chunk `index-*.js` 445 KB; `uiText` 175 KB + `uiTextAi` 86 KB ana pakete statik giriyor. **En yüksek kazanç/çaba sırası:** P-01, P-02, P-06, P-07 (yazma gecikmesi), sonra P-03 (yetim süreç), P-04, P-11.

| Kimlik | Alan | Etki | Konum | Sorun | Çözüm | Durum |
|---|---|---|---|---|---|---|
| P-01 | editör | yüksek | `App.tsx:564-582`, `FileTree.tsx:216-276,567` | Her tuşta `setFiles(updateRecursive)` (5000 düğüme kadar ağaç) + App render + FileTree `sort` ve memo'suz satırlar | İçeriği ağaca yazma, yalnız `openFiles`; `isModified` değişmediyse state'e dokunma; ağaç/EditorArea `React.memo` | giderildi (17.11.2026) |
| P-02 | editör | yüksek | `App.tsx:90-92,275,1000` | `useCursor/useProblems/useCompletionState/useDebug/useLsp` App seviyesinde: her ok tuşu 1600 satırlık App'i render eder | Her birini kendi alt bileşenine indir (`StatusCursor` vb.) | giderildi (17.11.2026) |
| P-03 | kapanış | yüksek | `electron-main.cjs:493`, `electron-lsp.cjs:208-214` | `will-quit`'te `stopAll()` await edilmiyor; dil sunucuları (.cmd sarmalayıcı) yetim kalabilir | `before-quit`'te kısa bekle veya senkron `taskkill /T /F` | giderildi (17.11.2026) |
| P-04 | etkileşim | yüksek | `App.tsx:584-620,180-190`, `electron-main.cjs:148-170`, `electron-git.cjs:34-47` | Her kayıtta tam ağaç taraması + 7 git süreci; kendi yazımımız watcher'ı tetikler; GitPanel 8 sn yoklama | Kendi yazımını bastır, yalnız değişen klasörü oku, tek `git status -b --porcelain=v2`, throttle | giderildi (17.11.2026) |
| P-05 | editör | yüksek | `aiCompletion.ts:139-141`, `electron-ai.cjs:803` | Tamamlama her istekte dosya başı/sonunu tam kopyalar (1 MB dosyada MB'larca IPC) | `model.getOffsetAt` ile yalnız son `prefixChars`/ilk `suffixChars` | giderildi (17.11.2026) |
| P-06 | editör | orta | `EditorArea.tsx:461-463` | `<Editor key={activeFile.id}>`: her sekme geçişinde editör ve bağlamalar yeniden kurulur | `key`'i kaldır, `path` ile model değiştir | giderildi (17.11.2026) |
| P-07 | editör | orta | `EditorArea.tsx:477,496` | Kontrollü `value` her tuşta O(n) karşılaştırma | Model tabanlı kullan; içeriği kayıtta `getValue()` ile oku, onChange debounce | giderildi (17.11.2026) |
| P-08 | editör | orta | `lspClient.ts:75`, `electron-lsp.cjs:~236` | Her duraklamada tam belge + `JSON.parse(JSON.stringify())` kopyası | Artımlı senkron, kopyayı kaldır | giderildi (17.11.2026) |
| P-09 | dosya | orta | `electron-main.cjs:350-410` | `fs:*` senkron ve boyut sınırsız: büyük dosya tüm uygulamayı dondurur | `fs.promises`, `stat` üst sınırı (>5 MB uyarı), `largeFileOptimizations` | giderildi (17.11.2026) |
| P-10 | kapanış | orta | `electron-term.cjs:80,150`, `electron-ai.cjs:199` | `proc.kill()` yalnız kabuğu keser, torunlar yetim; ajan komutları kapanışta iptal edilmiyor | `taskkill /pid X /T /F`, `runs` içindekileri öldür | giderildi (17.11.2026) |
| P-11 | açılış | orta | `SplashScreen.tsx:13-16`, `App.tsx:1146` | Yapay ~1,5 sn splash (1250+1520 ms sabit) | Hazır olunca kapat, süreyi 400-600 ms'e indir | giderildi (17.11.2026) |
| P-12 | bellek | orta | `App.tsx:147,163,385-395` | `logs` sınırsız büyür, her kayıt App'i render eder; iframe döngüsel `console.log` şişirir | `.slice(-500)`, rAF ile toplu işle | giderildi (17.11.2026) |
| P-13 | ayar | orta | `SettingsContext.tsx:148-160`, `EditorArea.tsx:117-128` | Tek bağlam: kaydırıcı sürüklerken App ve EditorArea tam render, `updateOptions` tüm anahtarlarla | `useSettingValue(id)` seçicisi, yalnız ilgili anahtarlar | kısmen: seçicili `useSettingValue` hazır, EditorArea henüz kullanmıyor |
| P-14 | açılış | orta | `main.tsx:9-13` | `loader.init()` çağrılmıyor: Monaco (25 MB) ilk dosyada indirilip ayrıştırılır | Boşta `loader.init()` ile ön yükle | giderildi (17.11.2026) |
| P-15 | arama | orta | `electron-search.cjs:12-56`, `SearchPanel.tsx:31-37` | Seri `await stat/readFile`, iptal yok, Ctrl+P her açılışta yeniden tarar | İstek kimliği/iptal, 8-16 paralel okuma, watcher'la geçersiz kılınan önbellek | giderildi (17.11.2026) |
| P-16 | dosya | orta | `electron-main.cjs:148-170` | Watcher: yalnız trailing debounce, azami bekleme yok; `out/build/target/.cache` izleniyor; özyinelemeli `fs.watch` node_modules'u izler | `maxWait ~1 sn`, ignore listesi/.gitignore, yalnız değişen dizin | giderildi (17.11.2026) |
| P-17 | etkileşim | orta | `App.tsx:518-524,344` | `refreshGitStatus` içerik aynı olsa da yeni nesne: `gitDecor` ve FileTree boşuna çalışır | Değişmediyse state'i bırak | giderildi (17.11.2026) |
| P-18 | etkileşim | orta | `App.tsx:110-115` | `resize` her olayda `setVw` | Eşik geçince güncelle veya rAF | giderildi (17.11.2026) |
| P-19 | etkileşim | orta | `App.tsx:~1010-1200` | Menü/komut dizileri her render'da yeniden kurulur | `useMemo`, MenuBar `React.memo` | giderildi (17.11.2026) |
| P-20 | açılış | orta | `electron-main.cjs:1-6,454-499` | Tüm ana süreç modülleri `whenReady` öncesi senkron `require`; tek-örnek kilidi bunlardan sonra (ikinci örnek de hepsini yükler) | Kilidi en başa al; `ws`/`electron-ai`'yi ilk kullanımda yükle | giderildi (17.11.2026) |
| P-21 | açılış | orta | `App.tsx:143`, `FileTree.tsx:208-212`, `electron-main.cjs:272-276` | `loadRecent` iki yerde, senkron `existsSync` | Tek çağrı, paylaş | giderildi (17.11.2026) |
| P-22 | açılış | orta | `App.tsx:46,55,63` | 8 dilin tamamı (~260 KB) ana pakette | Dil başına dinamik import | giderildi (17.11.2026); sözlüklerin 323 anahtarı lazy `uiTextTheme` dosyasına taşındı, ana paket 722 → 597 KB (bütçe 600 KB; payı dar, `uiTextComp` 46 KB ve `uiTextScm` 26 KB sonraki aday) |
| P-23 | editör | düşük | `EditorArea.tsx:~214` | Sekmeler her render'da `problems.byPath[normPath]` hesaplar | Memo'lu `Tab` bileşeni | giderildi (17.11.2026) |
| P-24 | editör | düşük | `problems.ts:31-69,129` | Marker deposu her olayda tüm modelleri tarar, `onDidChangeMarkers` debounce'suz | `apply`'i debounce et | giderildi (17.11.2026) |
| P-25 | editör | düşük | `settingsSchema.json:53-61`, `settings.ts:304` | Minimap/smoothCaret/smoothScrolling/`automaticLayout` varsayılan açık | >2 MB veya >20k satırda minimap/folding/bracket renklendirmeyi otomatik kapat | giderildi (17.11.2026) |
| P-26 | etkileşim | düşük | `GitPanel.tsx:232-250` | Birbirinden bağımsız git zamanlayıcıları (durum, fetch, repoInfo 30 sn) | Odak/görünürlükte birleştir | giderildi (17.11.2026) |
| P-27 | etkileşim | düşük | `AIAssistant.tsx:97-98` | `AgentStatus` her saniye tüm şeridi yeniden çizer | Yalnız süre metnini ayrı bileşende güncelle | giderildi (17.11.2026) |
| P-28 | kapanış | düşük | `electron-llm.cjs:253` | `disposeModel()` await edilmiyor (GPU belleği geç boşalabilir) | Sorun görülürse `before-quit`'te kısa bekle | giderildi (17.11.2026) |

**Temiz çıkanlar:** preload IPC abonelikleri `removeListener` döndürüyor; PTY çıktısı 8 ms toplu ve tampon sınırlı; ayar yazımı 200 ms debounce; ağır paketler (xterm, AI, Git, Ayarlar, yjs) lazy; `show:false` + `ready-to-show` ile beyaz parlama yok; `will-quit` pty/debug/whisper'ı durduruyor.
