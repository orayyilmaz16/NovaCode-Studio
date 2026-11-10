# Karar günlüğü

Yeni karar en üste, tarihli (GG.AA.YYYY). Her kayıt: karar, neden, sonuç. Kararı geri almak = yeni kayıt (eskisini silme).

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
