# Changelog

## Unreleased

### tr
- Terminal: istemde çalışma klasörü (`PS C:\Users\...>`) ve Git dalı gösterilir; komutlar, bayraklar, metinler ve değişkenler renklendirilir; ANSI renkli çıktı ve kırmızı hata çıktısı desteklenir; ↑/↓ komut geçmişi, Ctrl+L temizleme.
- GitHub: uygulama içinden hesap bağlama (cihaz kodu akışı), hesap oluşturma bağlantısı; token şifreli saklanır. Git push/pull/fetch bağlı hesapla kimlik doğrular.
- Git: ahead/behind göstergesi, 8 sn'de bir canlı durum, açık PR sayısı ve son Actions koşuları GitHub'dan canlı gelir.
- Güvenlik: Electron `webSecurity` yeniden açıldı; `git pull` yalnız fast-forward yapar; git komutları kimlik sorusunda takılmaz.
- Klasör açma hatası düzeltildi (`stopFileWatcher` tanımsızdı).
- CI: sürüm işindeki push yarışı (non-fast-forward) giderildi; rebase + yeniden deneme eklendi, işlere zaman aşımı konuldu.
- CI: çalışma zamanı bağımlılıkları için moderate, geliştirme araçları için high düzeyinde audit uygulanıyor.
- Açık klasördeki dosya değişiklikleri artık gerçek zamanlı: dosya ağacı ve kaydedilmemiş değişikliği olmayan açık sekmeler diskten anında yenileniyor.

- GitHub: "GitHub ile giriş yap" artık kodu önceden doldurulmuş GitHub yetkilendirme sayfasını doğrudan açar; izin kapsamı arayüzde açıkça gösterilir. Client ID, `package.json` içindeki `novaGithubClientId` alanından okunur (kullanıcıdan istenmez). Eski `safeStorage` API'si yerine asenkron sürüm kullanılır.

- GitHub: Client ID giriş alanı kaldırıldı. GitHub hesabı bağlı değilken Git değişiklikleri, commit, push, pull ve fetch uygulamada kilitli kalır (ana süreçte de uygulanır).

### en
- GitHub: removed the Client ID input. While no GitHub account is connected, Git changes, commit, push, pull and fetch stay locked in the app (enforced in the main process too).
- GitHub: "Sign in with GitHub" now opens GitHub's authorization page with the code prefilled and shows the permission scope in the UI. The Client ID is read from `novaGithubClientId` in `package.json` (no per-user prompt). Uses the async `safeStorage` API instead of the deprecated one.
- Terminal: prompt shows the working directory (`PS C:\Users\...>`) and Git branch; commands, flags, strings and variables are syntax-colored; ANSI color output and red error output are supported; Up/Down history, Ctrl+L clears.
- GitHub: connect your account inside the IDE (device-code flow) with a sign-up link; the token is stored encrypted. Git push/pull/fetch authenticate with the connected account.
- Git: ahead/behind indicator, live status every 8 s, open PR count and recent Actions runs streamed from GitHub.
- Security: Electron `webSecurity` re-enabled; `git pull` is fast-forward only; git commands no longer hang on credential prompts.
- Fixed the open-folder failure (`stopFileWatcher` was undefined).
- CI: fixed the non-fast-forward push race in the version job (rebase + retry) and added job timeouts.
- CI: audit now fails on moderate for runtime dependencies and on high for dev tooling.
- Open-folder changes are now real-time: the file tree and unmodified open tabs refresh from disk instantly.

## 1.1.1 - 08.11.2026
### Türkçe
- Otomatik güncelleme. Ayrıntılar için İngilizce notlara bakın.

### English
- add security policy, issue/PR templates and CODEOWNERS (#6)
- open PR and enable auto-merge for auto-commits (#5)

## 1.1.0 - 08.11.2026
### Türkçe
- Otomatik güncelleme. Ayrıntılar için İngilizce notlara bakın.

### English
- Automatic update.

## 1.1.0 - 08.11.2026
### Türkçe
- Uygulama açılışta hiçbir proje veya dosyayı otomatik açmaz; boş editör gösterilir.
- Boş editörde Klasör Aç, Dosya Aç ve Yeni Dosya düğmeleri eklendi; sekme çubuğuna + düğmesi eklendi.
- Klavye kısayolları eklendi: Ctrl+O, Ctrl+Shift+O, Ctrl+N, Ctrl+W, Ctrl+Tab, Ctrl+` ve Ctrl+Q.
- Başlıkta çıkış düğmesi eklendi.
- Sürüm otomasyonu: her güncelleme patch sürümü alır ve Türkçe/İngilizce notlarıyla GitHub Release oluşturulur.

### English
- The app no longer opens any project or file automatically on startup; an empty editor is shown.
- Added Open folder, Open files and New file buttons to the empty editor, and a + button in the tab bar.
- Added keyboard shortcuts: Ctrl+O, Ctrl+Shift+O, Ctrl+N, Ctrl+W, Ctrl+Tab, Ctrl+` and Ctrl+Q.
- Added an exit button in the title bar.
- Version automation: every update gets a patch version and a GitHub Release with Turkish and English notes.
