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

- Sürüm 1.2.0 — GitHub hesabıyla Git: sahnele/sahneden çıkar/geri al (parça parça), yalnız sahnelenenleri commit, dal listesi/oluşturma/geçiş, eşzamanla (fetch + fast-forward pull + push; ayrışmış dalda otomatik birleştirme yapmaz), Pull Request açma, GitHub'da depo yayınlama, commit geçmişi, `git init`.
- Gerçek zamanlı takip: `.git` içindeki HEAD/index/refs değişimi (terminal dahil) anında panele yansır; dosya ağacında değişen (M), yeni (U), silinen (D) dosyalar renkli ve klasörlerde değişiklik işareti görünür.
- Düzeltme: Git durum ayrıştırması (baştaki boşluklu/Türkçe karakterli dosya adları, yeniden adlandırma) sağlamlaştırıldı; yol doğrulama ile depo dışına çıkma engellendi.
- CI: `package.json` sürümü son etiketten büyükse (bilinçli minor/major) sürüm işi onu olduğu gibi yayınlar.

- Tasarım: arayüz baştan VS Code "Dark Modern" çizgisinde yenilendi (düz yüzeyler, cam/bulanıklık yok): özel başlık çubuğu, simge tabanlı etkinlik çubuğu (etkin göstergesi, Git sayı rozeti, GitHub avatarı), dosya türü renkli sekmeler ve yol göstergesi, VS Code tarzı alt panel sekmeleri, durum çubuğu (dal, ↑↓, GitHub hesabı), Ctrl+B ile kenar çubuğu aç/kapat, Nova Dark Monaco teması.
- Marka: yeni NovaCode logosu (kod ayracı + yapay zekâ kıvılcımı), favicon ve uygulama simgesi (`public/logo.svg`, `public/icon.png`; yeniden üretmek için `npx electron scripts/make-icons.cjs`).
- Hareket: logo çizim animasyonu, sade açılış ekranı, kenar çubuğu/panel/sekme geçişleri, simge etkileşimleri; `prefers-reduced-motion` ile kapatılır.

- Logo arka plansız ve sadeleştirildi (gradient kod ayracı + yapay zekâ kıvılcımı); arayüz vurgu rengi logoya uyumlu indigo-menekşe oldu.
- Karşılama ekranı VS Code "Welcome" düzeninde yenilendi: Başlangıç bağlantıları, Son açılan klasörler, Keşfet kartları, "Açılışta göster" seçeneği. Son klasörler yalnız yerelde tutulur.
- Proje beyni: `docs/brain/` altında harita, proje bilgisi, karar günlüğü ve her aksiyon için bir oyun kitabı; `STATE.md` koddan otomatik üretilir (`npm run brain`), tutarlılık `npm run brain:check` ile denetlenir. Git modülü testleri `npm test` ile CI'da çalışır.

- Ayarlar baştan yazıldı: gerçek zamanlı, VS Code tarzı tam sayfa (`Ctrl+,`), arama ve kategorilerle. Koyu / açık / sistem tema, 6 vurgu rengi, arayüz yazı tipi, yakınlaştırma, animasyon ve dil (anında); editör yazı tipi (hazır liste veya özel), boyut, satır yüksekliği, kalınlık, ligatür, sekme, kaydırma, imleç, mini harita, katlama, öneriler, cetvel vb. 30+ ayar; canlı Monaco önizlemesi.
- Özel snippet'ler (tetikleyici, dil, Monaco sözdizimi) otomatik tamamlamada çıkar; hazır snippet'ler açılıp kapatılabilir.
- Dosya ve terminal ayarları: otomatik kayıt (gecikme / odak değişimi), kayıtta boşluk temizleme ve son satır, terminal yazı boyutu/varsayılan kabuk/komut renklendirme, Git yenileme aralıkları. Ayarlar JSON olarak dışa/içe aktarılabilir.
- Açık tema eklendi (Nova Light Monaco teması, terminal paleti dahil). Ortak düzenleme token'ı artık şifreli saklanır (eski düz metin token taşınıp silinir).
- Düzeltme: dosya açık değilken sekme çubuğundaki gereksiz `+` düğmesi gizlendi.
- Dökümantasyon: README yenilendi; `docs/brain/` içine `settings` aksiyonu, ayar tablosu (şemadan otomatik) ve karar günlüğü eklendi; `brain:check` ayar şemasını ve çevirileri de denetler.

### en
- Settings were rebuilt: real-time, VS Code-style full page (`Ctrl+,`) with search and categories. Dark / light / system theme, 6 accent colors, UI font, zoom, animations and language (instant); editor font (preset list or custom), size, line height, weight, ligatures, tabs, wrapping, cursor, minimap, folding, suggestions, rulers and more, 30+ settings; live Monaco preview.
- Custom snippets (trigger, language, Monaco syntax) appear in autocomplete; built-in snippets can be toggled.
- File and terminal settings: auto save (delay / focus change), trim whitespace and final newline on save, terminal font size / default shell / command coloring, Git refresh intervals. Settings can be exported/imported as JSON.
- Light theme added (Nova Light Monaco theme, terminal palette included). The collaboration token is now stored encrypted (an old plain-text token is migrated and deleted).
- Fix: the unnecessary `+` button in the tab bar is hidden when no file is open.
- Documentation: README refreshed; `docs/brain/` gained the `settings` action, an auto-generated settings table and a decision log; `brain:check` also validates the settings schema and translations.
- The logo now has no background and is simpler (gradient code bracket + AI spark); the UI accent color follows the logo's indigo-violet.
- The welcome screen was rebuilt in the VS Code "Welcome" layout: Start links, Recent folders, Explore cards, a "show on startup" option. Recent folders are kept locally only.
- Project brain: `docs/brain/` holds a map, project info, a decision log and one playbook per action; `STATE.md` is generated from code (`npm run brain`) and consistency is checked with `npm run brain:check`. Git module tests run in CI via `npm test`.
- Design: the UI was rebuilt in the VS Code "Dark Modern" style (flat surfaces, no glass/blur): custom title bar, icon activity bar (active indicator, Git count badge, GitHub avatar), file-type colored tabs with breadcrumbs, VS Code-style bottom panel tabs, status bar (branch, ↑↓, GitHub account), Ctrl+B sidebar toggle, Nova Dark Monaco theme.
- Brand: new NovaCode logo (code bracket + AI spark), favicon and app icon (`public/logo.svg`, `public/icon.png`; regenerate with `npx electron scripts/make-icons.cjs`).
- Motion: logo draw-in animation, minimal splash screen, sidebar/panel/tab transitions, icon interactions; disabled under `prefers-reduced-motion`.
- Version 1.2.0 — Git with your GitHub account: per-file stage/unstage/discard, commit staged changes only, branch list/create/switch, sync (fetch + fast-forward pull + push; never auto-merges diverged branches), open Pull Requests, publish a repo to GitHub, commit history, `git init`.
- Real-time tracking: HEAD/index/refs changes inside `.git` (including from the terminal) appear instantly; the file tree shows modified (M), new (U) and deleted (D) files in color, with a change marker on folders.
- Fix: hardened Git status parsing (names with leading spaces/non-ASCII characters, renames); path validation prevents escaping the repository.
- CI: when the `package.json` version is ahead of the latest tag (a deliberate minor/major), the version job releases it as-is.
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
