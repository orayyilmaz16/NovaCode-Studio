# Karar günlüğü

Yeni karar en üste, tarihli (GG.AA.YYYY). Her kayıt: karar, neden, sonuç. Kararı geri almak = yeni kayıt (eskisini silme).

## 12.11.2026 (güncelleme sistemi, duyarlı tasarım, mağaza ağı)
- **Güncelleme: `electron-updater` + GitHub Releases.** Neden: indirme yüzdesi, SHA-512 doğrulama, fark indirme ve `quitAndInstall` hazır; kendi sürümümüzü yazmak hata ve güvenlik riski. Bedeli: yeni bağımlılık; CI'nın `latest.yml` ve `.blockmap` yüklemesi şart. İndirme varsayılan olarak kullanıcı onayıyla; "açılışta denetle" açık, "otomatik indir" kapalı (GitHub'a giden: IP, sürüm; kişisel veri yok).
- **Sürüm notları GitHub API'den markdown olarak alınır, HTML basılmaz.** Neden: electron-updater GitHub notlarını HTML verir; `Markdown.tsx` yalnız React öğeleri üretir (XSS yüzeyi yok).
- **Eklenti ağı `net.request` (manuel yönlendirme denetimi), `net.fetch`/Node `fetch` değil.** Neden: sistem proxy/VPN'e uyum ("internet hatası"), ve `net.fetch` yönlendirme sonrası adresi bildirmediği için konak izin listesi doğrulanamıyor.
- **VS Code Marketplace kullanılmıyor.** Neden: hizmet şartı yalnız Microsoft ürünlerine izin veriyor; Open VSX aynı eklentilerin çoğunu açık sunuyor.
- **Sağ paneller dar pencerede editörün üstüne biner; ayarlar/editör çubuğu konteyner sorgusuyla uyum sağlar.** Neden: 980×720'de editör 50 px'e düşüyordu. Özel `.icon-btn` / `.status-item` `@layer components`'e taşındı (katmansız CSS Tailwind'i eziyordu).
- **Kapalı menü öğeleri soluk + ipucu, fare üzerinde gezinilebilir; Çalıştır menüsü `package.json` betiklerini ve proje türünü algılar** (`workspace:detect`).

## 12.11.2026 (yerleşik model, menü, eklenti mağazası)
- **Varsayılan sağlayıcı "Nova yerleşik": `node-llama-cpp` ile uygulama içinde yerel model; anahtar, sunucu adresi ve ücret yok.** Neden: kullanıcı/Masqot'a API maliyeti çıkmasın, veri cihazdan çıkmasın, ek kurulum (Ollama) gerekmesin. Yeni bağımlılık gerekçesi: Node için tek hazır llama.cpp bağlayıcısı, hazır ikililer (derleme yok), fonksiyon çağırma desteği. Bedeli: kurulum paketine ~110 MB (yalnız Windows x64 CPU+Vulkan; CUDA/arm64 hariç tutuldu) ve ilk kullanımda 1–4,4 GB model indirme.
- **Yalnız Apache-2.0 modeller** (Qwen2.5-Coder 1,5B / 7B). Neden: 3B sürümü Qwen-research (ticari değil) lisanslı; Masqot ticari kuruluş. Hugging Face dosya adı/boyutu kodda sabit ve doğrulanır.
- **Model indirmeyi `node-llama-cpp` indiricisiyle değil kendi `fetch` koduyla yapıyoruz.** Neden: indirici son adımda takıldı (prototipte); kendi kodumuz `Range` ile devam eder, boyut ve konak doğrular.
- **Eklenti mağazası Open VSX; yalnız tema ve snippet.** Neden: Microsoft Marketplace lisansı yalnız Microsoft ürünlerine izin verir; VS Code eklenti sunucusu yapmak ayrı büyük bir proje ve ciddi güvenlik yüzeyi. Bkz. [[extensions]].
- **`.vsix` bellekte okunur, diske açılmaz; ZIP için bağımlılık eklenmedi** (`zlib` ile asgari okuyucu). Neden: zip-slip yok, bağımlılık yüzeyi küçük.
- **Üst menü çubuğu Türkçe ve 8 dilde; Çalıştır menüsü terminale komut gönderir** (`nova:term` olayı). Neden: VS Code alışkanlığı; kod çalıştırma sandbox'ı yok, kullanıcının kendi terminali.
- **Uygulama içi (çevrimdışı) dikte henüz yok:** transformers.js Whisper ayrı bağımlılık + ~75 MB model + Vite/WASM ayarı gerektirir; test edilmeden eklenmedi. Şimdilik yerel Whisper sunucusu veya OpenAI anahtarı.

## 12.11.2026 (yerel öncelikli yapay zekâ)
- **Varsayılan sağlayıcı Ollama (yerel, anahtarsız, ücretsiz).** Neden: Masqot/kullanıcıya API maliyeti çıkmasın, veri cihazdan çıkmasın (KVKK yükü yok). Bulut sağlayıcılar isteğe bağlı kalır. Panel Ollama'yı ve yüklü modelleri algılar, eksikse kurulum ipucu verir.
- **Dikte için yerel OpenAI uyumlu Whisper sunucusu (`aiTranscribeUrl`).** Neden: yerel adreste anahtar ve 3. parti yok. Sunucu kurulumu kullanıcıdadır; uygulama içi (transformers.js) Whisper ileride ayrı karar (yeni bağımlılık + ~75 MB model indirme).

## 12.11.2026 (yapay zekâ asistanı, palet, arama)
- **Çoklu sağlayıcı: Anthropic + OpenAI uyumlu + Ollama (yerel); kullanıcı kendi API anahtarını getirir.** Neden: tek sağlayıcıya bağımlılık yok, yerel model seçeneğiyle veri cihazdan çıkabilir; Masqot tarafında anahtar/maliyet yönetimi gerekmez. Sağlayıcı değişimi ayardadır.
- **AI motoru ana süreçte (`electron-ai.cjs`), anahtar renderer'a geçmez.** Neden: XSS/eklenti yüzeyinden anahtar sızmasın; `safeStorage` ile şifreli. Web sürümünde panel devre dışı.
- **Agent araçları çalışma klasörüne kilitli; yazma onaylı, komut her zaman onaylı.** Neden: LLM çıktısına güvenilmez; `realpath` ile sembolik bağ kaçışı, gizli dosya (`.env`, anahtar) reddi. `aiAutoApproveEdits` yalnız yazma için ve varsayılan kapalı.
- **Dikte: mikrofon kaydı + OpenAI uyumlu transkripsiyon.** Neden: Electron'da tarayıcı konuşma tanıma Google anahtarı olmadan çalışmaz. Ses 3. partiye gittiği için `aiVoiceEnabled` açık rıza ayarı (varsayılan kapalı), ses diske yazılmaz. Yerel Whisper ileride KVKK açısından daha temiz alternatif.
- **Sohbet oturumları yalnız cihazda (`localStorage`), görseller kaydedilmez.** Neden: veri minimizasyonu; sunucuya hiçbir şey eşitlenmez.
- **Yapay zekâ paneli kısayolu `Ctrl+Shift+L`.** Neden: `Ctrl+L` terminalde "temizle".
- **Oturum eklentisi = dosya tabanlı:** `.nova/instructions.md` / `AGENTS.md` (proje yönergesi) ve `.nova/commands/*.md` (eğik çizgi komutları). Neden: ek bağımlılık/eklenti API'si olmadan sürümlenebilir, ekiple paylaşılabilir. Tam eklenti sistemi ileride ayrı karar.
- **Komut paleti VS Code önekleriyle** (`>` komut, `:` satır, `$` snippet); proje araması ana süreçte (`electron-search.cjs`), yeni bağımlılık yok.

## 10.11.2026 (terminal ve gezgin)
- **Terminal çoklu ve kimlikli oturumlar** (`electron-term.cjs`, `id`, en çok 12). Neden: VS Code deneyimi (birden çok terminal, oturum listesi); eski tasarım kabuk adına bağlıydı. Terminal kodu ana süreçten ayrı modüle taşındı ve gerçek kabuklarla test edilir.
- **İstem satırı çıktının sonunda satır içi**, ayrı giriş çubuğu kaldırıldı. Neden: gerçek terminal hissi ve daha az yer.
- **Terminal paneli her zaman bağlı, varsayılan kapalı.** Neden: panel gizliyken oturumlar ve çıktı kaybolmasın; açılışta gereksiz yer kaplamasın. Son terminal kapanınca panel kapanır.
- **Gezgin yeniden yazıldı** (bölümler, satır içi oluşturma/yeniden adlandırma, bağlam menüsü, klavye gezinmesi, animasyonlu açılma). Genişlik/yükseklik geçişleri CSS ile; sürüklerken geçiş kapalı.
- **Yerleşim özelleştirilebilir:** kenar çubuğu sol/sağ, etkinlik ve durum çubuğu, breadcrumb, açık düzenleyiciler, ağaç yoğunluğu ve kılavuzlar ayarlardadır.
- **Test örneği için `NOVA_HEADLESS=1`** (ekran dışı pencere). Neden: otomatik testler kullanıcının açık penceresiyle karışmasın.

## 10.11.2026 (ayarlar)
- **Ayarlar şema güdümlü ve gerçek zamanlı** (`settingsSchema.json` tek kaynak). Neden: eski panel çalışmıyordu ve genişletilemezdi; şema arayüzü, doğrulamayı ve belgeyi birlikte üretir. Bkz. [[settings]].
- **Açık tema CSS değişken geçersiz kılmasıyla.** Neden: bileşenlerde moda göre dallanma olmasın; `zinc-*`/`nv-*`/`--ansi-*` değişkenleri yeter.
- **Ayarlar sayfası tam sayfa (VS Code "Settings" gibi), kenar çubuğu paneli değil.** Neden: yüzlerce ayar için arama, kategori ve canlı önizleme gerekir. Gezinme (dosya/klasör seçimi, Home) sayfayı kapatır.
- **Canlı Monaco önizlemesi ayarlar sayfasında.** Neden: editör ayarları (imleç, mini harita, yazı tipi, snippet) o sırada editör görünmediği için başka türlü izlenemez.
- **Ortak düzenleme token'ı `localStorage`'dan şifreli depoya taşındı** (`electron-secrets.cjs`, izin listeli anahtar). Eski düz metin token ilk açılışta taşınır ve silinir.
- **Dil ayarı:** `auto` sistem dilini izler; ayar render sırasında uygulanır (`setUiLang`), yeniden yükleme gerekmez.
- **Yakınlaştırma Electron `webFrame` ile** (tüm arayüz eşit ölçeklenir); webde CSS `zoom`.

## 10.11.2026
- **Proje beyni `docs/brain/`.** Neden: oturumlar arası bağlam kaybı ve md dosyalarının dağınıklığı. Sonuç: aksiyon başına oyun kitabı, `STATE.md` otomatik üretilir, `brain:check` tutarlılığı denetler. Bkz. [[BRAIN]].
- **Logo arka plansız, gradient işaret (kod ayracı + yapay zekâ kıvılcımı).** Neden: sade, her zemin rengine uyar. SVG elle çizildi (görsel üretim modeli kullanılmadı). Simge: `npx electron scripts/make-icons.cjs`. Bkz. [[ui-design]].
- **Karşılama ekranı VS Code "Welcome" düzeni; açılışta açık.** Son klasörler ana süreçte yerelde tutulur; yalnız listedeki yollar `workspace:open` ile açılabilir.
- **Vurgu rengi logodaki indigo-menekşe** (Tailwind `indigo-*` jetonları yeniden tanımlandı).

## 09.11.2026
- **Arayüz VS Code "Dark Modern" çizgisinde, cam efekti yok.** Tailwind paleti `@theme` ile yeniden tanımlandı; bileşenler `zinc-*`/`indigo-*` sınıflarını kullanır.
- **`package.json` sürümü son etiketten büyükse CI onu olduğu gibi yayınlar** (bilinçli minor/major). Neden: CI yalnız patch hesaplıyordu. Bkz. [[release]].

## 08.11.2026
- **GitHub girişi OAuth Device Flow.** Neden: masaüstü uygulamada client secret saklanamaz. Client ID gizli değil, `package.json` → `novaGithubClientId`.
- **Token yalnız ana süreçte, `safeStorage` ile şifreli.** Renderer'a token gitmez. Şifreleme yoksa diske yazılmaz.
- **GitHub bağlı değilken Git verisi kilitli**, arayüzde ve ana süreçte (`git:*` kanalları `github-required` döner).
- **Git komutları `execFile` + argüman dizisi; kimlik bilgisi ortam değişkeniyle** (`GIT_CONFIG_*`), süreç listesinde görünmez. `LC_ALL=C` ile hata iletileri ayrıştırılabilir.
- **Eşzamanla ayrışmış dalı otomatik birleştirmez/yeniden yazmaz;** kullanıcıya bildirir.
- **`pull` yalnız fast-forward.**
- **Git durumu `--porcelain=v1 -z`** ile ayrıştırılır (boşluklu/Türkçe karakterli adlar, yeniden adlandırma).
- **Terminalde çalışma klasörü işareti (`@@NOVA_CWD@@`)**; çıktı ANSI ayrıştırılır, HTML basılmaz (XSS yüzeyi yok).
- **`webSecurity` açık** (renderer yalnız yerel içerik ve `wss://` kullanır).
- **Yalnız dev bağımlılıkları etkileyen `minimatch` bulgusu kabul edildi;** çalışma zamanı bağımlılıkları `moderate`, tümü `high` düzeyinde denetlenir. Bkz. [[ci-cd]].
