# Karar günlüğü

Yeni karar en üste, tarihli (GG.AA.YYYY). Her kayıt: karar, neden, sonuç. Kararı geri almak = yeni kayıt (eskisini silme).

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
