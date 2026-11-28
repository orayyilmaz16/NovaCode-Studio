# Changelog

## Unreleased

### tr

- [fix] **Commit açılınca grafik kopması:** Açılan commit'in dosya listesinin altından geçen dal çizgisi artık sonraki commit'e kesintisiz bağlanır.
- [feat] **Commit ayrıntı kartı:** Geçmişte bir commit'in üzerine gelince konu, tam karma (kopyala düğmesiyle), yazar, tarih, üst commit'ler (birleştirmeyse ayrıca belirtilir), +/− satır ve dosya sayısı, dallar ve etiketler bir kartta açılır.
- [improve] **Commit kartı etkileşimli:** Kart, fare satırdan karta geçerken açık kalır; kopyala ve "Profili aç" düğmeleri tıklanır. Liste kayınca kart kapanır. Profil fotoğrafı küçük boyutta indirilir, daha hızlı yüklenir.
- [feat] **Commit yazarı kartta:** Ayrıntı kartında yazarın adı, GitHub kullanıcı adı ve profil fotoğrafı (GitHub hesabı bağlıysa) ile tarih ve "şu kadar önce" bilgisi görünür. Bağlı değilse baş harflerle yerel bir avatar gösterilir.
- [fix] **Açılan commit'te çizgi kayması:** Açılan commit'in dal çizgileri 4 piksel sola kayıp kopmuyordu; artık commit satırıyla aynı hizada.
- [fix] **Commit dosya listesi düzeltildi:** Açılan commit'in dosyaları dar panelde sıkışmıyor; yalnız ad ve sayılar görünür, tam yol üzerine gelince çıkar. Dal etiketleri en fazla ikisi gösterilir.
- [improve] **Commit satırları daha kısa:** Geçmişteki commit satırlarının yüksekliği azaltıldı; dal çizgisi yine satırlar arasında kesintisiz.
- [improve] **Commit üzerine gelme alanı daraltıldı:** Commit satırının üzerine gelince çıkan şeffaf zemin artık panelin kenarına kadar uzanmaz, içeriğe göre daralır.
- [improve] **Commit dosya listesi sıkılaştırıldı:** Açılan commit'in dosya listesinin çevresindeki boşluklar azaltıldı; dosya satırları daha kompakt.
- [improve] **Commit açılış animasyonu ve liste tasarımı:** Bir commit'in dosya listesi artık yumuşakça açılıp kapanır (diğer bölümlerle aynı süre ve eğri). Dosya satırları daha net: durum harfi küçük bir etiket, ad ve klasör ayrı, eklenen/silinen sayıları sağda.
- [improve] **Editör git işaretleri tek renk:** Editör kenarı ve kaydırma çubuğunda git değişiklikleri (eklenen, değişen, silinen) yalnızca mavi ile gösterilir; yeşil ve kırmızı kullanılmaz.
- [improve] **Fark görünümü VS Code renkleri:** Yan yana fark ekranında eklenen satırlar yeşil, silinenler kırmızı zeminle ve metnin değişen kısmı daha koyu vurguyla gösterilir; kenar ve kaydırma çubuğu işaretleri de aynı renklerdedir (koyu ve açık tema).
- [fix] **Editör git işaretleri netleştirildi:** Eklenen satırlar yeşil dolu çubuk, değişen satırlar mavi çubuk, silinen yerler kırmızı üçgen olarak kenarda ayrı ayrı çizilir (önceki hali birbirine karışıyordu).
- [fix] **Git geçmişi kopukluğu ve çift kaydırma çubuğu:** Dal çizgisi satırlar arasında kopmuyor (satırlar sabit yükseklikte); geçmiş açıkken iki kaydırma çubuğu yerine yalnızca geçmişin kendi çubuğu görünür.
- [improve] **Git geçmişi görünümü:** Geçmiş bölümü kapalıyken panelin en altında durur, açılınca görünüme kaydırılır. Graf çizgileri daha net, dal etiketleri (yerel dal renkli, uzak dal çerçeveli) ve +/− sayıları daha okunur.
- [feat] **Editörde Git satır işaretleri:** Açık bir dosyada HEAD'e göre eklenen satırlar yeşil, değişenler mavi, silinen yerler kırmızı üçgen olarak kenarda görünür; kaydırma çubuğunda da işaretlenir. Git paneli: "±2 Değişiklikler" yerine sayı rozeti + "Değişiklikler"; geçmiş açılıp kapanırken yumuşak bir geçişle açılır ve kapalıyken listeyi yukarı alıp boşluk bırakmaz.
- [fix] **Git paneli bölme düzeni:** Bölümlerin yüksekliği artık içeriğini aşmaz, aralarında boş alan kalmaz. Alt kenar tutamacı VS Code gibi bağlı çalışır: bir bölüm büyürken altındaki açık bölüm küçülür, toplam sabit kalır; içeriğin sonuna ya da alt sınıra gelince sürükleme durur, boşluğa sürüklenmez. Geçmiş grafında satırlar arası şerit kesintisiz çizilir; üst commit bilgisi yoksa (eski süreç) liste doğrusal çizilir ve yeniden başlatma uyarısı çıkar.
- [feat] **Git dal grafı ve yeniden boyutlanan bölümler:** Git paneli geçmişi artık dal topolojisini çizer: renkli şeritler, dalın ayrıldığı ve birleştiği noktalar, geçerli dal hedef simgesiyle işaretli; dal rozetleri (yerel dal dolgulu, uzak dal bulut simgeli) satır sonunda. "Tüm dallar / Geçerli dal" seçeneği var. Geçmiş, Hazırlanan, Değişiklikler, Birleştirme ve Stash bölümleri hem açılır/kapanır hem de alt kenardan sürüklenerek (ya da ↑/↓ tuşlarıyla) boyutlandırılır; yükseklik hatırlanır, çift tıklama otomatiğe döndürür. 8 dilde.
- [improve] **Git paneli geçmişi ve durum özeti:** Geçmiş listesindeki taşma giderildi (konu ve yazar satırı kırpılır, dal/etiket rozetleri kendi satırında sarılır). Her commit'te zaman arayüz dilinde, eklenen/silinen satır sayısı ve dal/etiket rozetleri görünür; açılınca dosya başına +/− sayıları listelenir. Dal satırının altına durum özeti eklendi: birleştirme sürüyor, çakışma sayısı, ayrık HEAD, hazırlanan ve değişen dosya sayıları (ya da "temiz"). 8 dilde.
- [improve] **Yapay zekâ düğmesi:** Üst çubukta terminal aç/kapa düğmesinin yanına yapay zekâ asistanını aç/kapa düğmesi eklendi.
- [fix] **GitHub oturumu:** Süreli GitHub token'ları artık yenileme token'ıyla otomatik yenilenir; süresi dolan erişim token'ı sessizce yenilenir, böylece oturum her seferinde erken düşmez.

### en

- [fix] **Graph break when a commit is expanded:** The branch line below an expanded commit's file list now connects continuously to the next commit.
- [feat] **Commit details card:** Hovering a commit in the history opens a card with its subject, full hash (with copy button), author, date, parent commits (marked as merge when there are several), +/− line and file counts, and branches and tags.
- [improve] **Interactive commit card:** The card stays open while the pointer moves from the row onto it; the copy and "Open profile" buttons are clickable. The card closes when the list scrolls. The profile photo is loaded at a smaller size for faster display.
- [feat] **Commit author on the card:** The details card shows the author's name, GitHub username and profile photo (when a GitHub account is connected), plus the date and a relative time. Without a connection, initials are shown as the avatar.
- [fix] **Lane offset on expanded commit:** Branch lines under an expanded commit were shifted 4px left and broke the line; they now align with the commit row.
- [fix] **Commit file list fixed:** Files of an expanded commit no longer crowd the narrow panel; only name and counts show, the full path appears on hover. At most two branch labels are shown.
- [improve] **Shorter commit rows:** Commit rows in the history are shorter; the branch line still connects continuously between rows.
- [improve] **Narrower commit hover area:** The translucent hover background on a commit row no longer spans to the panel edge; it fits the content.
- [improve] **Tighter commit file list:** Reduced the spacing around a expanded commit's file list; file rows are more compact.
- [improve] **Commit expand animation and list design:** A commit's file list now opens and closes smoothly, with the same timing as the other sections. File rows are clearer: the status letter is a small tag, name and folder are separated, and added/deleted counts sit on the right.
- [improve] **Single-color editor git markers:** Git changes in the editor gutter and scrollbar (added, changed, deleted) are shown only in blue; green and red are no longer used.
- [improve] **VS Code diff colors:** In the side-by-side diff, added lines are green and removed lines red, with the changed text highlighted more strongly; the gutter and overview ruler use the same colors (dark and light themes).
- [fix] **Clearer editor git markers:** Added lines show a solid green bar, changed lines a blue bar, and deleted spots a red triangle, each drawn distinctly in the gutter (they previously blended together).
- [fix] **Git history gaps and double scrollbar:** The branch line no longer breaks between rows (rows have a fixed height); with history open only the history's own scrollbar shows, not two.
- [improve] **Git history view:** The history section sits at the bottom of the panel when collapsed and scrolls into view when opened. Graph lines are crisper, branch labels (local branches colored, remote ones outlined) and +/− counts are easier to read.
- [feat] **Git line markers in the editor:** For an open file, lines added versus HEAD show green, changed lines blue, and deleted spots a red triangle in the gutter, also marked on the scrollbar. Git panel: "±2 Changes" became a count badge plus "Changes"; the history opens and closes with a smooth transition and leaves no gap when collapsed.
- [fix] **Git panel pane layout:** Section heights no longer exceed their content, so no blank space is left between them. The bottom-edge handle now works coupled like VS Code: when one section grows, the open section below it shrinks and the total stays constant; dragging stops at the end of the content or at the minimum height, never into empty space. Lanes in the history graph connect continuously between rows; when parent info is missing (old process) the list is drawn linearly and a restart hint appears.
- [feat] **Git branch graph and resizable sections:** The Git panel history now draws branch topology: colored lanes, fork and merge points, the current branch marked with a target icon; branch badges (local filled, remote with a cloud icon) at the end of each row. There is an "All branches / Current branch" switch. The History, Staged, Changes, Merge and Stash sections are collapsible and can be resized by dragging the bottom edge (or with the up/down keys); the height is remembered and double-click resets it to auto. In 8 languages.
- [improve] **Git panel history and status summary:** Fixed the overflow in the history list (subject and author lines are truncated, branch/tag badges wrap on their own line). Each commit shows time in the UI language, lines added/deleted and branch/tag badges; expanding it lists per-file +/- counts. A status summary was added under the branch row: merge in progress, conflict count, detached HEAD, staged and changed file counts (or "clean"). In 8 languages.
- [improve] **AI button:** Added a toggle for the AI assistant next to the terminal toggle in the top bar.
- [fix] **GitHub session:** Expiring GitHub tokens are now renewed automatically with the refresh token, so an expired access token is renewed silently and the session no longer drops early.

## 1.9.4 - 27.11.2026
<!-- level: patch -->
### Türkçe
#### Yeni özellikler
- **Anonim kullanım istatistiği (isteğe bağlı):** İstersen hangi bölümlerin kaç kez kullanıldığına dair toplu sayılar paylaşabilirsin. Varsayılan kapalıdır; kimlik, IP, dosya adı, yol veya kod asla gönderilmez, istediğin an Ayarlar → Hakkında bölümünden kapatabilirsin.

#### İyileştirmeler
- **Sunucu imajları otomatik yayınlanıyor:** Senkron ve analitik sunucu imajları artık her değişiklikte kendiliğinden derlenir, ayağa kaldırılıp sağlık testinden geçirilir ve GHCR'a yayınlanır; Docker belgesi koddan otomatik güncellenir.
- **Daha güçlü anonimlik:** Anonim istatistik sunucusu için günlüksüz, sertleştirilmiş kurulum paketi eklendi; hız sınırı artık IP adresini bellekte bile ham tutmuyor. İstatistikleri okumak için rapor aracı geldi.
- **Daha kapsamlı anonim istatistik ve indirme takibi:** İstersen artık hangi programlama dillerinin açıldığı, GitHub giriş/çıkış, güncelleme ve hata sayıları da (yalnız sayı olarak) paylaşılabilir; kod, dosya adı veya hesap adı asla gönderilmez. Uygulama indirme sayıları sürüm başına izlenir.

### English
#### New features
- **Anonymous usage statistics (optional):** You can choose to share aggregate counts of which areas are used. Off by default; identity, IP, file names, paths or code are never sent, and you can turn it off any time in Settings → About.

#### Improvements
- **Server images publish automatically:** The sync and analytics server images are now built, started and health-checked on every change, then published to GHCR; the Docker documentation is regenerated from the code automatically.
- **Stronger anonymity:** Added a log-free, hardened setup package for the anonymous statistics server; rate limiting no longer keeps the IP address raw even in memory. A report tool was added to read the statistics.
- **Broader anonymous statistics and download tracking:** If you opt in, counts of opened programming languages, GitHub sign-in/sign-out, updates and errors can now be shared (as numbers only); code, file names or account names are never sent. App download counts are tracked per release.

## 1.9.3 - 27.11.2026
<!-- level: patch -->
### Türkçe
#### İyileştirmeler
- **Bağımlılıklar güncellendi:** lucide-react 1.78.0 → 1.79.0, monaco-editor 0.57.0 → 0.58.0.

### English
#### Improvements
- **Dependencies updated:** lucide-react 1.78.0 → 1.79.0, monaco-editor 0.57.0 → 0.58.0.

## 1.9.2 - 27.11.2026
<!-- level: patch -->
### Türkçe
#### Yeni özellikler
- **Kendi senkron sunucun:** Ortak düzenleme sunucusunu tek komutla (Docker + otomatik TLS/wss, alan adı gerekmez) kurabileceğin bir paket eklendi; sunucu sağlığı otomatik izlenir.

#### Düzeltmeler
- **Sürüm hazırlığı çakışması:** İki otomatik koşu aynı sürüm dalını açmaya çalışınca sürüm hazırlığı hata veriyordu; artık çakışma kendiliğinden çözülüyor.
- **Otomatik sürüm yayını:** Otomatik hazırlanan sürüm PR'ı birleşince etiket ve GitHub Release üretilmiyordu; eksik etiket artık otomatik tamamlanıyor.

#### İyileştirmeler
- **Daha küçük ana paket:** Uygulamanın ana JavaScript parçası bölündü (654 → 434 KB); açılış ve önbellek daha verimli.
- **Senkron sunucusu izleme:** Sunucu artık token korumalı metrikler sunuyor (bağlantı, oda, hata, reddedilen istek) ve tek komutla durum raporu (`status.sh`) veriyor; açılacak portlar kılavuzda.

### English
#### New features
- **Your own sync server:** Added a package to set up the collaborative editing server with one command (Docker + automatic TLS/wss, no domain needed); server health is monitored automatically.

#### Fixes
- **Release preparation clash:** Release preparation failed when two automatic runs tried to open the same version branch; the clash is now resolved automatically.
- **Automatic release publishing:** After the auto-prepared release PR merged, the tag and GitHub Release were not produced; a missing tag is now completed automatically.

#### Improvements
- **Smaller main bundle:** The app's main JavaScript chunk was split (654 → 434 KB); startup and caching are more efficient.
- **Sync server monitoring:** The server now serves token-protected metrics (connections, rooms, errors, rejected requests) and a one-command status report (`status.sh`); ports to open are listed in the guide.

## 1.9.1 - 27.11.2026
<!-- level: patch -->
### Türkçe
#### İyileştirmeler
- **Sürekli izleme:** Güvenlik açıkları, paket boyutu, derleme süresi ve dış servisler (güncelleme, eklenti mağazası, senkron) her 6 saatte otomatik ölçülür; sorun olursa tek bir issue açılır, düzelince kapanır.
- **Sürüm düzeyi:** Otomatik sürümde küçük değişiklikler patch, büyük toplu güncellemeler minor olarak yükselir.
- **Eski sürümlere macOS ve Linux:** Önceki tüm sürümlere (v1.0.0 ve sonrası) macOS ve Linux paketleri geriye dönük eklenir (backfill-desktop.yml); README'ye üç işletim sistemi için indirme tablosu eklendi.

### English
#### Improvements
- **Continuous monitoring:** Security vulnerabilities, bundle size, build time and external services (updates, extension store, sync) are measured automatically every 6 hours; one issue is opened when something is wrong and closed once fixed.
- **Version level:** Automatic releases now bump patch for small changes and minor for large batch updates.
- **macOS and Linux for older releases:** macOS and Linux packages are added retroactively to all earlier releases (v1.0.0 onward) (backfill-desktop.yml); the README now has a download table for all three operating systems.

## 1.9.0 - 26.11.2026
<!-- level: minor -->
### Türkçe
#### Yeni özellikler
- **macOS ve Linux kurulum paketleri:** Sürüm artık Windows (.exe) yanında macOS (.dmg, .zip; Intel ve Apple Silicon) ve Linux (.AppImage, .deb) paketlerini de üretir ve GitHub Release'e ekler.

#### Düzeltmeler
- **Hakkında son sürümler her yerde:** Hakkında sayfasındaki son Electron, Chromium ve Node.js bilgisi artık kaynak koddan çalışırken de gösteriliyor (önceden yalnız kurulu uygulamada çalışıyordu).

#### İyileştirmeler
- **Otomatik Electron izleyici:** Günde iki kez çalışan iş akışı son kararlı Electron sürümünü (Chromium ve Node.js ile birlikte) kontrol eder, yükseltir, PR açar, CI ve güvenlik taramasını çalıştırır; yeşil olunca otomatik birleştirir.

### English
#### New features
- **macOS and Linux installers:** Each release now also builds macOS (.dmg, .zip; Intel and Apple Silicon) and Linux (.AppImage, .deb) packages alongside Windows (.exe) and attaches them to the GitHub Release.

#### Fixes
- **Latest versions in About everywhere:** The latest Electron, Chromium and Node.js info in About now also shows when running from source (it previously worked only in the installed app).

#### Improvements
- **Automatic Electron watcher:** A twice-daily workflow checks the latest stable Electron (with its Chromium and Node.js), upgrades it, opens a PR, runs CI and the security scan, and auto-merges when green.

## 1.8.0 - 25.11.2026
<!-- level: minor -->
### Türkçe
#### İyileştirmeler
- **Hakkında'da son Electron, Chromium ve Node.js:** Kurulu uygulamada Hakkında sayfası çalışan Electron, Chromium ve Node.js sürümlerinin yanına daha yeni sürüm varsa "son: …" bilgisini resmî Electron sürüm dizininden dinamik gösterir (6 saat önbellek). Kaynak koddan çalışırken ağ isteği yapılmaz.

### English
#### Improvements
- **Latest Electron, Chromium and Node.js in About:** In the installed app, About shows "latest: …" next to the running Electron, Chromium and Node.js versions when a newer one exists, fetched dynamically from the official Electron release index (cached 6 h). No network request when running from source.

## 1.7.2 - 25.11.2026
<!-- level: patch -->
### Türkçe
#### İyileştirmeler
- **Bağımlılıklar güncellendi:** lucide-react 1.74.0 → 1.77.0.

### English
#### Improvements
- **Dependencies updated:** lucide-react 1.74.0 → 1.77.0.

## 1.7.1 - 25.11.2026
<!-- level: patch -->
### Türkçe
#### Güvenlik
- **Electron 45.5.0:** Uygulamanın Chromium ve Node.js sürümü güncellendi; bundan sonra Electron çıktıkça otomatik yükseltilecek (güvenlik ve performans).

### English
#### Security
- **Electron 45.5.0:** The app's Chromium and Node.js versions are updated; from now on Electron is upgraded automatically as it is released (security and performance).

## 1.7.0 - 25.11.2026
<!-- level: minor -->
### Türkçe
#### İyileştirmeler
- **Güncelleme denetimi yalnız kurulu uygulamada:** Kaynak koddan çalışırken (geliştirme) güncelleme denetimi ve internet isteği artık yok; güncellemeyi git ile alırsın. Setup (.exe) ile kurulan uygulama yeni sürüm varsa denetler ve indirir, yoksa "güncelsin" der.

### English
#### Improvements
- **Update checks only in the installed app:** Running from source (development) no longer checks for updates or makes any network request; pull updates with git. The app installed with the setup (.exe) checks and downloads a newer version, or says you are up to date.

## 1.6.1 - 25.11.2026
<!-- level: patch -->
### Türkçe
#### Düzeltmeler
- **Menü klavye ve boyut düzeltmeleri:** Açık menüde ok/Enter/Boşluk tuşları artık arkadaki editöre geçmiyor; pencere boyutu değişip menü modu geçince açık menü kapanıyor; tamamı kapalı menüde ok tuşları takılmıyor.

### English
#### Fixes
- **Menu keyboard and resize fixes:** Arrow/Enter/Space keys in an open menu no longer leak to the editor behind it; the open menu closes when a window resize switches menu mode; arrow keys no longer break in a fully disabled menu.

## 1.6.0 - 25.11.2026
<!-- level: minor -->
### Türkçe
#### Yeni özellikler
- **Klasörü kapat ve ana sayfaya dön:** Gezgin başlığına ev düğmesi, Dosya menüsüne ve komut paletine "Klasörü kapat ve ana sayfaya dön" eklendi. Kaydedilmemiş dosya varsa önce sorar; sonra sekmeleri ve ağacı temizleyip karşılama sayfasını açar (uzak bağlantı varsa keser).
- **Uzak pencere seçici:** Durum çubuğunun sol alt düğmesi (veya komut paleti → "Uzak pencere aç") VS Code'daki gibi bir seçici açar: github.dev'de devam et, Tünel (yakında), SSH (Uzak Sunucu penceresini açar), Dev Container (yakında), WSL (Windows'ta terminalde), GitHub Codespace ve Uzak Depo (GitHub'da açar). Çalışmayan seçenekler pasif görünür. 8 dilde.
- **Uzak sunucu (SSH):** VS Code Remote-SSH gibi uzak sunucuya bağlanıp klasörünü Gezgin'de açabilir, dosyaları düzenleyip kaydedebilir ve uzak terminal kullanabilirsin (Dosya menüsü, komut paleti, karşılama ekranı ve durum çubuğunun solundaki düğme). Parola kaydedilmez; sunucunun parmak izi ilk bağlantıda onay ister, değişirse bağlantı kesilir. SSH ajanı, özel anahtar ve parola desteklenir. İlk sürümde uzak klasörde Git paneli, arama ve yapay zekâ araçları yoktur.
- **Yenilenen alt panel:** Sekmeler simgeli ve sayaçlı: Sorunlar, Çıktı, Hata ayıklama konsolu, Terminal ve Test. Çıktı sekmesinde düzey süzgeci (hata/uyarı/bilgi), arama, kopyalama ve otomatik kaydırma var. Hata ayıklama konsolu oturum çıktısını gösterir ve ifade çalıştırır (↑/↓ geçmiş). Test sekmesi projedeki test betiklerini bulur, terminalde çalıştırır ve Jest, Vitest, Node test runner ve pytest çıktısından başarılı/başarısız/atlanan sayısını, süreyi ve başarısız test adlarını özetler. Terminalin üstünde kabuk, klasör ve dal bilgisi şeridi eklendi. Görünüm Fluent diliyle yumuşatıldı: dolgulu hap sekmeler, yuvarlak süzgeç rozetleri, alt çizgili arama ve ifade alanları, yuvarlatılmış satır/kart yüzeyleri. 8 dilde.
- **Durum çubuğunda commit geçmişi:** Depo açıksa satır/sütunun yanında commit simgesi ve son commit'in hesabı/zamanı (ör. "Oray · 2 dk önce") görünür; tıklayınca son commit'ler (mesaj, yazar, zaman, kısa karma, dal/etiket rozetleri, her commit'in başlık satırında eklenen/silinen satır sayısı rozeti: +247 −9), geçerli dal, ileri/geri sayısı ve uzak depo listelenir. Her commit satırı açılıp kapanır: açınca değişen dosyalar ve dosya başına eklenen/silinen satır sayısı listelenir. Alt düğme Git panelini açar, açıkken "Git panelini kapat" olur. Zamanlar arayüz dilinde. 8 dilde.
- **Panelden model seçimi:** Yapay zekâ panelinde giriş kutusunun altındaki model menüsünden Sohbet ve Ajan için ayrı model seçilir (yerel Ollama'da kurulu modeller, Hızlı/Güçlü ipucuyla). Aynı menüde dikte (Whisper) modeli de seçilir; dikte modeli değişince sunucu yeni modelle başlar. Ayarlar'da model seçimi yoktur.
- **Dikte ayarları:** Ayarlar → Yapay Zekâ → Ses'te dikte dili (arayüz dili / otomatik) ve "Dikteden sonra otomatik gönder" eklendi. Dikte tamamen yerelde çalıştığı için rıza anahtarı kalktı; mikrofona basmak yeterli.
- **Git Bash terminali:** Terminal çubuğundaki + yanında Git simgeli hızlı düğme ve açılır listede "Git Bash · tam" var (düğme Git for Windows kuruluysa görünür; kurulu değilse listede soluk durur ve nedenini ipucuyla söyler); gerçek terminal olarak çalışma klasöründe açılır. Ayarlar → Terminal → Varsayılan kabuk'ta da seçilebilir; Git Bash yoksa PowerShell kullanılır.
- **Kurulu terminaller listede:** Terminal ekleme listesi (+ yanındaki ok) artık bilgisayarda kurulu kabukları kendisi bulup gösterir: PowerShell 7, Windows PowerShell, CMD, Git Bash, WSL dağıtımları (Ubuntu vb.), Cygwin, MSYS2 ve Nushell. Hepsi gerçek terminal olarak çalışma klasöründe açılır; liste her açılışta yeniden taranır, yeni kurulan hemen görünür.

#### Düzeltmeler
- **Windows kurulum derlemesi:** SSH eklendikten sonra CI'daki masaüstü derlemesi isteğe bağlı yerel bir pakette (cpu-features) düşüyordu; yeniden derleme kapatıldı, kurulum yeniden üretilebiliyor. PR'larda paketleme denetimi ve elle yeniden deneme eklendi.
- **Editör sağındaki beyaz alan:** Minimap kaydırıcısı ve kaydırma çubuğu gölgesi koyu/açık temaya uygun, yumuşak renklere çekildi.
- **Üst çubuk taşması:** Pencere tam ekran değilken üst çubuktaki arama kutusu çok yer kaplayıp sağdaki düğmeleri ve pencere denetimlerini taşırıyordu; arama kutusu daraldı ve gerekirse küçülüyor, sağ bölge her zaman tam görünüyor.
- **Duyarlı üst çubuk:** Dar pencerede (telefon/tablet) sağdaki düğmeler kırpılıp kayboluyordu. Başlık çubuğu artık genişliğine göre uyum sağlar: önce klasör/önizleme/ayarlar grubu, sonra arama yazısı ve yapay zekâ bölmesi gizlenir (arama yalnız simge olur); kenar çubuğu ve alt panel düğmeleri her genişlikte görünür. 360, 520, 640, 900 ve 1500 px'te doğrulandı.
- **GitHub giriş kodu kopyalama:** Kod yanındaki kopyala düğmesi bazı durumlarda çalışmıyordu; artık kopyalama ana süreçten yapılıyor (yalnız bekleyen giriş kodu kopyalanır).
- **Dar pencerede sekme çubuğu kırpılması:** Editör sütununda sekme çubuğu ve yol çubuğu yükseklik baskısıyla ezilip kırpılıyordu; artık sabit yükseklikte kalıyor (telefon/tablet genişliklerinde doğrulandı).
- **Etkinlik çubuğu taşması:** Seçili etkinlik düğmesi ve sol göstergesi çubuk kartının kenarına taşıyordu; düğme 40 px'e indi ve sol gösterge çizgisi tamamen düğmenin içine, yuvarlak köşeli olarak alındı. Asıl neden: çubuk kartı 39 px'e daralıyordu, artık sabit 48 px.
- **Dar editörde sekmeler görünür:** Yapay zekâ, önizleme veya kenar çubuğu açıkken editör daraldığında sekmeler eylem düğmelerinin altında kayboluyordu. Sekme listesi artık en az bir sekme gösterir; dar editörde bölme, kaydet, kopyala, indir ve önizleme düğmeleri "⋯" menüsünde toplanır. Koyu temalarda pasif sekmeler zeminden daha net ayrışır.
- **Telefon ve tablet düzeni:** 760 px altında kenar çubuğu editörü ezmeden üstüne biner (dışına dokunmak veya dosya seçmek kapatır, telefonda kapalı başlar); eskiden ~160 px'e sıkışan editör ve üst üste binen sekme düğmeleri düzeldi. Mobil tarayıcı adres çubuğunda yükseklik doğru hesaplanır, sayfa sıçraması engellendi. Etkinlik çubuğundaki aktif gösterge çizgisi kart dışına taşmıyor.
- **Yapay zekâ paneli taşmaları ve hatalar:** Model ve düşünme menüleri artık giriş kartına göre açılır (dar panelde yana taşıp kesilmez); durum şeridi ve kaydırıcı düğmeleri dar genişlikte taşmaz, kaydırıcı okları RTL'de doğru kenarda; ajan durum şeridindeki etiket kısalır. Panel açılışında dikte modelleri listesi yüklenmiyordu, düzeltildi.
- **Gerçek terminal başlatma hatası görünür:** Gerçek terminal (PTY) oturumu başlatılamazsa (ör. Git Bash bulunamadı) panel boş kalıyordu; artık nedeni panelin üstünde kırmızı bir uyarıyla gösteriliyor.

#### Güvenlik
- **Terminal oturum kimlikleri:** Kimlik sonekleri artık kripto rastgelelikten üretiliyor (CodeQL "insecure randomness" uyarısı giderildi).

#### İyileştirmeler
- **Ana sayfada Gezgin açık kalır:** Ana sayfaya geçince (ev düğmesi ya da klasörü kapatma) kenar çubuğu artık kapanmıyor; yalnız sen kapatınca kapanır.
- **Tamamı kapalı menü kategorileri etkileşimsiz:** İçindeki tüm öğeler kullanılamayan kategoriler (ör. klasör açık değilken Düzenle, Seçim, Terminal) artık tıklanmaz, açılmaz, klavyeyle gezilmez ve üzerine gelince menü geçişi yapmaz; hem kompakt "Menü" açılırında hem üst menü çubuğunda. Kapalı tekil öğeler de basılmaz kalır, nedenini söyleyen ipucu durur.
- **Kullanılmayan menü öğeleri koyu:** Menülerde kapalı (kullanılamayan) öğeler, kısayolları ve tamamı kapalı kategori başlıkları soluk griye değil koyu (neredeyse siyah) tona çekildi; kompakt "Menü" açılırında ve üst menü çubuğunda aynıdır.
- **Üst menü başlıkları net ve yumuşak:** Tam ekranda Dosya, Düzenle, Terminal… başlıkları kullanılabilirse beyaz, dosya/klasör açık değilken hiçbir öğesi kullanılamayanlar koyu görünür (Menü açılırında da aynı). Açık başlık vurgulu ve altında animasyonlu çizgiyle belli oluyor; geçişler ortak hareket jetonlarıyla yumuşak.
- **Menü açılırı akordeon oldu:** Pencereli görünümdeki "Menü" düğmesi artık grupları (Dosya, Düzenle…) aynı listede açılır-kapanır başlıklar olarak gösteriyor; ok simgesi döner, açık grup vurgulanır, alt öğeler girintili çizgiyle ayrılır. Klavye: ↑ ↓ gezinir, → açar, ← kapatır, Enter çalıştırır.
- **Pencereli görünümde küçük üst çubuk:** Pencere tam ekran/büyütülmüş değilken menü ("Menü" tek düğmede toplanır), hızlı düğmeler ve pencere denetimleri daha küçük ve sıkı; üst çubuk daha az yer kaplıyor.
- **Arama çubuğu tam ortada:** Üst çubuk üç sütunlu ızgaraya geçti; arama kartı pencere genişliği ne olursa olsun tam ortada kalıyor, sol ve sağ kartlar kendi kenarlarına hizalı ve içeriği kadar.
- **Üst çubuk kartları içeriği kadar:** Sol (menü) ve sağ (düğmeler) kartlar artık boşluğa uzamıyor, içindekiler kadar yer kaplıyor; aradaki boşluk pencereyi sürüklemeye yarıyor.
- **Üst çubukta ayrı kartlar:** Logo+menü, arama ve sağdaki düğmeler/pencere denetimleri artık her biri kendi kenarlığı olan ayrı kart.
- **Fluent başlık çubuğu:** Üst çubuk bölümlere ayrıldı: logo ve menü başlıkları ince bir ayırıcıyla ayrılır, menü öğeleri yumuşak köşeli ve dolgulu hover alır; arama/komut alanı dolgulu hap oldu; sağdaki düğmeler iki gruba (klasör/önizleme/ayarlar ve kenar çubuğu/alt panel) bölündü ve etkin düğmeler vurgulu görünür; pencere denetimleri ayrı bir ayırıcının ardında, kapat düğmesi çerçevenin köşesine uyar.
- **Sekme çubuğunda + düğmesi kalktı:** Sekmelerin yanındaki yeni sekme (+) düğmesi kaldırıldı; yeni dosya Ctrl+N, menü veya karşılama ekranından açılır.
- **Kenar çubuğu boşlukları dengelendi:** Kenar çubuğu kapalıyken etkinlik çubuğu ile editör arasındaki boşluk artırıldı (2 → 10 px); açıkken kenar çubuğu ile editör arası 12 px'ten 8 px'e düşürüldü.
- **Kenar çubuğu ile editör arası boşluk biraz daha açıldı** (8 → 12 px); sürükleme çizgisi boşluğun ortasında.
- **Etkinlik çubuğu ölçeği geri geldi:** Soldaki çubuğun simgeleri eski boyutuna (24 px) döndü ve düğmeler büyüdü; yalnız simge ile kenarlık arasındaki boşluk azaldı (şerit 50 → 48 px).
- **Sekme editöre akarak bağlanır:** Seçili sekmenin alt köşelerinde, sekme ile editör birleştiği yerde hissedilmeyecek kadar ince içe dönük yuvarlama var.
- **Daha sade, yumuşak sekmeler:** Seçili sekmenin üstündeki vurgu çizgisi kaldırıldı; seçili sekme kenarlıksız olarak editör zeminiyle yumuşakça birleşiyor. Sekmelerin solundaki gereksiz boşluk kalktı, ilk sekme karta bitişik başlıyor.
- **Editöre bitişik sekmeler:** Etkin sekme editör zeminiyle birleşir (alt çizgi onun altında kesilir), üstte vurgu çizgisi ortadan açılır; geçişler yumuşaktır.
- **Kenar çubuğu geçişi ve boşluğu:** Kenar çubuğu ile editör arasındaki boşluk biraz arttı; kenar çubuğu açılıp kapanırken genişlik, boşluk ve kart birlikte akıcı biçimde kayıp solar (eski zıplama giderildi). Yeniden boyutlandırma çizgisi hover'da gecikmeyle yumuşakça belirir.
- **Sekme ipucu editör temasında:** Sekmenin üzerine gelince çıkan dosya yolu kutusu artık sistem kutusu yerine temaya uyumlu, kısa gecikmeyle yumuşakça beliren bir ipucu (dosya adı + klasör yolu).
- **Yüzen, VS Code havalı arayüz:** Başlık, etkinlik şeridi, kenar çubuğu, editör, önizleme, AI paneli ve durum çubuğu daha yuvarlak (10 px) ve aralarında daha geniş boşlukla yüzen kartlar oldu; her kartta tek, yumuşak bir gölge var. Sekmelerin üst köşeleri daha yuvarlak, aralarında küçük boşluk var. Etkinlik çubuğu simgeleri normal boyuta (22 px) döndü; yalnız yan boşluklar azaldı (şerit 50 → 44 px). Hover, geçiş ve gecikmeli ipucu efektleri korundu.
- **Daha canlı etkinlik çubuğu:** Hover'da yumuşak zemin kapsülü ve hafif yukarı kalkan simge, etkin öğede ortadan açılan gösterge çizgisi; öğe adı ve kısayolu kısa bir gecikmeden sonra yana kayarak beliren ipucuyla gösterilir.
- **AI düğmesi arama çubuğunun içinde:** Yapay zekâ paneli düğmesi, VS Code'daki gibi üst çubuktaki arama alanının içine, en sağa ayrı bir bölme olarak yerleşti; panel açıkken vurgulu görünür.
- **Tip denetimi sıkılaştı:** TypeScript `strict` ve kullanılmayan değişken denetimi açıldı; kalan tip hataları, kullanılmayan içe aktarmalar ve ölü kod temizlendi. Tailwind 4 önerilerine uyum: `size-*`, sonek `!` ve `wrap-*` sınıfları.
- **Tamamlama modeli varsayılanı küçüldü:** Kurulu küçük modele (`qwen2.5-coder:0.5b`) geçildi; satır içi öneriler çok daha hızlı. Eski varsayılanda kalmış kayıtlar otomatik taşınır, özel seçim korunur; sohbet ve ajan modeli 7b kalır.
- **Eski AI sağlayıcı kodu temizlendi:** Arayüzden erişilemeyen yerleşik model, Anthropic ve OpenAI desteği ile API anahtarı alanları kaldırıldı (uygulama paketi ~110 MB küçülür). Yapay zekâ yalnız yerel Ollama ile çalışır.
- **Terminal paneli Fluent geçişleri:** Alt paneldeki sekmeler artık tek bir yumuşak "hap" ile birbirine kayarak geçiyor (alttaki kısa vurgu çubuğu hapla birlikte hareket eder); sekme içeriği sekme sırasına göre yandan hafifçe kayarak belirir, terminal ve oturum değişiminde yumuşak solma var. Yeni terminal düğmesi bölünmüş düğme oldu, sağdaki oturum listesi yuvarlak kart satırlarına döndü. Koyu/açık temada doğru görünür; "Animasyonlar" kapalıyken ve azaltılmış harekette hareket durur.

### English
#### New features
- **Close folder and go home:** Added a home button in the Explorer header plus "Close folder and go home" in the File menu and command palette. It asks about unsaved files first, then clears tabs and the tree and opens the welcome page (and disconnects a remote session if any).
- **Remote window picker:** The bottom-left status bar button (or Command Palette → "Open a remote window") opens a VS Code-style picker: continue on github.dev, Tunnel (soon), SSH (opens the Remote Server dialog), Dev Container (soon), WSL (in the terminal on Windows), GitHub Codespace and Remote Repository (opens on GitHub). Unavailable options appear disabled. In 8 languages.
- **Remote server (SSH):** Like VS Code Remote-SSH, you can connect to a remote server, open its folder in the Explorer, edit and save files, and use a remote terminal (File menu, command palette, welcome screen and the button at the left of the status bar). Passwords are never saved; the server fingerprint asks for confirmation on first connect and the connection is refused if it changes. SSH agent, private key and password are supported. In this first version the Git panel, search and AI tools are not available in a remote folder.
- **Redesigned bottom panel:** Tabs now have icons and counters: Problems, Output, Debug console, Terminal and Tests. Output has a level filter (error/warning/info), search, copy and auto-scroll. The debug console shows session output and evaluates expressions (↑/↓ history). The Tests tab finds the project's test scripts, runs them in the terminal and summarizes passed/failed/skipped counts, duration and failed test names from Jest, Vitest, Node test runner and pytest output. A shell/folder/branch strip was added above the terminal. The look follows Fluent: filled pill tabs, rounded filter badges, underline-focus search and expression fields, rounded row/card surfaces. In 8 languages.
- **Commit history in the status bar:** When a repository is open, a commit icon with the last commit's account and time (e.g. "Oray · 2 min ago") appears next to line/column; clicking it lists the latest commits (message, author, time, short hash, branch/tag badges, a lines added/deleted badge on each commit's title line: +247 −9), the current branch, ahead/behind counts and the remote. Each commit row expands and collapses to list the changed files with lines added/deleted per file. The bottom button opens the Git panel and becomes "Close Git panel" while it is open. Times follow the UI language. In 8 languages.
- **Model picker in the panel:** The model menu under the AI input box picks a separate model for Chat and Agent (models installed in local Ollama, with a Fast/Strong hint). The same menu picks the dictation (Whisper) model; the server restarts with the new model. Settings no longer has a model selector.
- **Dictation settings:** Settings > AI > Voice gains dictation language (interface language / automatic) and "Send automatically after dictation". Because dictation runs fully on this computer, the consent switch is gone; just press the microphone.
- **Git Bash terminal:** The terminal bar gets a Git-icon quick button next to + and a "Git Bash · full" entry in the dropdown (the button shows when Git for Windows is installed; otherwise the entry is dimmed and a tooltip explains why); it opens as a real terminal in the workspace folder. It can also be picked in Settings > Terminal > Default shell; PowerShell is used when Git Bash is missing.
- **Installed terminals in the list:** The add-terminal list (the arrow next to +) now detects the shells installed on the computer: PowerShell 7, Windows PowerShell, CMD, Git Bash, WSL distributions (Ubuntu etc.), Cygwin, MSYS2 and Nushell. All open as real terminals in the workspace folder; the list is rescanned each time it opens, so newly installed shells appear right away.

#### Fixes
- **Windows installer build:** After SSH landed, the desktop build in CI failed on an optional native package (cpu-features); native rebuild is now off so the installer builds again. PRs get a packaging check and releases can be re-run by hand.
- **White area at the editor's right edge:** The minimap slider and scrollbar shadow now use soft colors matching the dark/light theme.
- **Top bar overflow:** When the window was not maximized, the search box in the top bar took too much space and pushed the right-side buttons and window controls out; the search box is narrower and shrinks when needed, and the right zone always stays fully visible.
- **Responsive title bar:** In narrow windows (phone/tablet) the buttons on the right were clipped and disappeared. The title bar now adapts to its width: the folder/preview/settings group hides first, then the search label and the AI split (search becomes icon-only); the sidebar and bottom-panel buttons stay visible at every width. Verified at 360, 520, 640, 900 and 1500 px.
- **GitHub sign-in code copy:** The copy button next to the code sometimes did nothing; copying now goes through the main process (only the pending sign-in code can be copied).
- **Tab bar clipping in narrow windows:** The tab bar and breadcrumb row in the editor column were squashed and clipped under height pressure; they now keep their fixed height (verified at phone and tablet widths).
- **Activity bar overflow:** The selected activity button and its left indicator spilled to the bar card's edge; the button is now 40 px and the left indicator line now sits fully inside the button with rounded ends. Root cause: the bar card shrank to 39 px; it is now a fixed 48 px.
- **Tabs stay visible in a narrow editor:** When the AI, preview or sidebar panel narrowed the editor, tabs vanished under the action buttons. The tab list now always shows at least one tab; in a narrow editor the split, save, copy, download and preview buttons collapse into a "⋯" menu. Inactive tabs stand out more from the background in dark themes.
- **Phone and tablet layout:** Below 760 px the sidebar now overlays the editor instead of squeezing it (tap outside or pick a file to close; it starts closed on phones); the editor that used to be squeezed to ~160 px and the overlapping tab buttons are fixed. Height is computed correctly with mobile browser address bars and page bounce is prevented. The active indicator in the activity bar no longer sticks out of its card.
- **AI panel overflows and bugs:** The model and thinking menus now open relative to the input card (no more clipping sideways in a narrow panel); the status bar and slider buttons no longer overflow at narrow widths, slider arrows sit on the correct edge in RTL, and the agent status label truncates. The dictation model list was not loaded when the panel opened; fixed.
- **Real terminal start errors are visible:** When a real terminal (PTY) session failed to start (e.g. Git Bash not found) the panel stayed blank; the reason now appears as a red notice at the top of the panel.

#### Security
- **Terminal session IDs:** ID suffixes now come from cryptographic randomness (fixes the CodeQL "insecure randomness" alert).

#### Improvements
- **Explorer stays open on the home page:** Going home (home button or closing a folder) no longer hides the sidebar; it closes only when you close it.
- **Fully disabled menu categories are inert:** Categories whose items are all unavailable (e.g. Edit, Selection, Terminal when no folder is open) can no longer be clicked, opened, reached with the keyboard, or switched to by hovering, in both the compact "Menu" dropdown and the top menu bar. Individual disabled items stay unclickable and keep their explanatory hint.
- **Unavailable menu items are darker:** Disabled menu items, their shortcuts and category titles whose items are all disabled now use a dark (near-black) tone instead of faded gray, in both the compact "Menu" dropdown and the top menu bar.
- **Clearer, smoother top menu titles:** In full screen, File, Edit, Terminal… titles are white when usable and dark when none of their items are available (no file/folder open); the Menu dropdown does the same. The open title gets a highlight and an animated underline, with transitions on the shared motion tokens.
- **Menu dropdown is now an accordion:** In windowed mode the "Menu" button shows groups (File, Edit…) as expandable headings in the same list; the chevron rotates, the open group is highlighted and its items are indented with a guide line. Keyboard: ↑ ↓ move, → opens, ← closes, Enter runs.
- **Smaller top bar when windowed:** Whenever the window is not maximized/full screen, the menu (collapsed into one button), quick buttons and window controls are smaller and tighter, so the top bar takes less room.
- **Search bar exactly centered:** The top bar now uses a three-column grid; the search card stays exactly centered at any window width, while the left and right cards align to their edges and fit their content.
- **Top bar cards fit their content:** The left (menu) and right (buttons) cards no longer stretch into the free space; they take only as much room as their content, and the gap between them drags the window.
- **Separate cards in the top bar:** Logo+menu, search and the right-side buttons/window controls are now each their own bordered card.
- **Fluent title bar:** The top bar is split into sections: the logo and menu titles are separated by a thin divider and menu items get soft rounded hover fills; the search/command field is a filled pill; the buttons on the right are split into two groups (folder/preview/settings and sidebar/bottom panel) with highlighted active buttons; window controls sit behind their own divider and the close button follows the frame corner.
- **Removed the + button from the tab bar:** The new-tab (+) button next to the tabs is gone; open a new file with Ctrl+N, the menu or the welcome screen.
- **Sidebar spacing balanced:** With the sidebar closed, the gap between the activity bar and the editor increased (2 → 10 px); with it open, the gap between the sidebar and the editor was reduced from 12 px to 8 px.
- **Slightly wider gap between the sidebar and the editor** (8 → 12 px); the resize line sits in the middle of the gap.
- **Activity bar scale restored:** Icons on the left bar are back to the original 24 px and buttons are larger; only the spacing between icon and border shrank (strip 50 → 48 px).
- **Tab flows into the editor:** The selected tab has a subtle inward curve at its bottom corners where it joins the editor surface.
- **Simpler, softer tabs:** The accent line on top of the selected tab is gone; the selected tab blends softly into the editor surface without a border. The needless gap before the first tab is removed so tabs start flush with the card.
- **Tabs joined to the editor:** The active tab merges with the editor surface (the bottom line is cut beneath it) and an accent line opens from the center on top; transitions are smooth.
- **Sidebar transition and spacing:** The gap between the sidebar and the editor grew slightly; when the sidebar opens or closes, its width, the gap and the card now slide and fade together smoothly (the old jump is gone). The resize line fades in softly after a short hover delay.
- **Tab tooltip matches the editor theme:** The file-path box shown when hovering a tab is now a theme-matched tooltip (file name + folder path) that fades in after a short delay instead of the system box.
- **Floating, VS Code-style UI:** The title bar, activity bar, sidebar, editor, preview, AI panel and status bar are now rounder (10 px) floating cards with wider gaps and a single soft shadow each. Tab top corners are rounder with a small gap between tabs. Activity bar icons are back to normal size (22 px); only the side spacing shrank (strip 50 → 44 px). Hover, transition and delayed tooltip effects stay.
- **Livelier activity bar:** Hover shows a soft background capsule and a slightly lifted icon, the active item has an indicator that opens from the center, and item name plus shortcut appear in a tooltip that slides in after a short delay.
- **AI button inside the search bar:** The AI panel button now sits inside the top search field as a separate segment at the far right, like in VS Code, and is highlighted while the panel is open.
- **Stricter type checking:** TypeScript `strict` and unused-variable checks are on; remaining type errors, unused imports and dead code were cleaned up. Aligned with Tailwind 4 suggestions: `size-*`, suffix `!` and `wrap-*` classes.
- **Smaller default completion model:** Inline suggestions now default to the installed small model (`qwen2.5-coder:0.5b`) and are much faster. Records still on the old default migrate automatically, custom choices are kept; chat and agent stay on 7b.
- **Legacy AI provider code removed:** The unreachable built-in model, Anthropic and OpenAI support and API key fields were removed (the app package shrinks by ~110 MB). AI works only with local Ollama.
- **Fluent transitions for the terminal panel:** Tabs in the bottom panel now slide between each other with a single soft pill (the short accent bar moves with it); tab content eases in from the side according to tab order, and switching terminals or sessions fades smoothly. The new-terminal button became a split button and the session list on the right turned into rounded card rows. Looks right in dark and light themes; motion stops when "Animations" is off or reduced motion is set.

## 1.5.1 - 18.11.2026
<!-- level: patch -->
### Türkçe
#### İyileştirmeler
- **Ajan ekranı sadeleşti ve netleşti:** Ajan modunda ikinci vurgu rengi (violet) kalktı, panel tek vurguyla (indigo) çalışıyor; gölgeler kaldırıldı. Durum şeridi adımı üst sınırla gösterir (ör. "Adım 3 / 20"). Düzenleme onaylarında eklenen satırlar yeşil, silinenler kırmızı görünür; klasör güveni ve dış sağlayıcı rıza kartları kalkan simgesi taşır; `edit_lines` aracı dosya simgesiyle gösterilir.

### English
#### Improvements
- **Agent screen simplified and clearer:** Agent mode no longer uses a second accent color (violet); the panel uses a single accent (indigo) and shadows are gone. The status bar shows the step against its limit (e.g. "Step 3 / 20"). In edit approvals, added lines are green and removed lines red; folder-trust and external-provider consent cards carry a shield icon; the `edit_lines` tool shows a file icon.

## 1.5.0 - 17.11.2026
<!-- level: minor -->
### Türkçe
#### Yeni özellikler
- **Bölünmüş editör:** Editörü sağa veya alta böl (Ctrl+\ / Ctrl+Alt+\), sekmeyi sürükleyerek gruplar arası taşı. Aynı dosya iki grupta açılabilir, içerik ortaktır, bölme oturumla geri yüklenir.
- **Kısayol özelleştirme:** Komut paletinden "Klavye kısayollarını aç" ile kısayolları değiştir, kaldır, sıfırla. Çakışmalar uyarılır, atamalar yalnız bu bilgisayarda saklanır.
- **Çalışma alanında bul-değiştir:** Arama panelinde değiştirme alanı ve tam kelime seçeneği; değişiklikler önce dosya ve satır bazında önizlenir, istediğin satırı hariç tutup onaylayarak uygularsın.
- **Görev çalıştırıcı:** `.nova/tasks.json` ve `package.json` scriptleri komut paletinden ve Çalıştır menüsünden terminalde çalışır. "Tüm eşleşmeleri seç" ve çoklu imleç komutları palete eklendi.
- **Yerel geçmiş ve zaman çizelgesi:** Her kayıtta eski sürüm yalnız bu bilgisayarda saklanır (dosya başına 30 sürüm, ayardan kapatılabilir); sürümleri karşılaştırıp geri yükleyebilir, silinen dosyaları kurtarabilirsin.
- **Kullanıcı snippet'leri:** `.nova/snippets.json` ve genel dosyadan editörde tamamlama olarak gelir; paletten düzenlenir.
- **Oturum geri yükleme:** Açık sekmeler ve kaydedilmemiş taslaklar açılışta (onayınla) geri yüklenir; Ctrl+Shift+T kapatılan sekmeyi geri açar. Veriler yalnız bu bilgisayarda tutulur.

#### Düzeltmeler
- **Veri kaybı önlemleri:** Kaydedilmemiş sekme kapatılırken veya pencere kapanırken Kaydet/Kaydetme/İptal sorulur; silme başarısızsa sekme kapanmaz, klasör silinince içindeki sekmeler de kapanır; diskte silinen ya da değişen dosya sekmede uyarı olarak görünür ve otomatik kayıt onu ezmez; yazarken kayıt tamamlanırsa yeni yazılanlar kaybolmaz.
- **Beyaz ekran yerine hata ekranı:** Bir bileşen hatasında "Yeniden yükle" gösterilir. Silinen dosyalar önce çöp kutusuna gider.
- **Kapanış ve terminal:** Kaydet penceresinde karar verirken uygulama artık 5 sn sonra kapanmıyor; terminalde `cd` ve komut sırası bozulmuyor, özel karakterli klasör yollarına `cd` çalışıyor; ön sürümlü eklenti güncellemesi doğru karşılaştırılıyor.

#### Güvenlik
- **Çalışma klasörü güveni:** Güvenilmeyen klasör kısıtlı modda açılır (dil sunucuları ve hata ayıklayıcı kapalı, git yalnız okuma). Ayarlar > Güven ve rıza'dan güvenilen klasörleri ve yapay zekâ rızalarını geri alır, ortak düzenleme oda kimliğini ayarlarsın.
- **Önizleme ayrı köken ve sıkı CSP:** Kod önizlemesi ayrı bir şemadan (nova-preview) kendi ilkesiyle çalışır; uygulamanın içerik güvenlik ilkesinde eval ve satır içi betik yok, ağ erişimi daraltıldı. Yerel model indirmeleri SHA-256 ile doğrulanır. Harici sağlayıcıya giden ajan araç sonuçları da anahtar kalıplarından temizlenir.
- **Arama ve görev güveni:** Regex aramasında iç içe nicelikli desenler ve çok uzun satırlar sınırlandı, aramaya 8 sn süre bütçesi getirildi; görev çalıştırma klasör güvenine bağlandı.

#### İyileştirmeler
- **Daha az gecikme:** Yazarken içerik dosya ağacına kopyalanmıyor, sekme geçişinde editör yeniden kurulmuyor, imleç hareketi tüm uygulamayı çizmiyor; ağaç yenilemesi yalnız değişen klasörleri okur ve `.gitignore` klasörlerinin derinine inmez.
- **Kısayollar ve paket boyutu:** Ayarlar > Kısayollar artık düzenlenebilir; ana paket küçüldü, ayar ve Git metinleri paneller açılınca yükleniyor.

### English
#### New features
- **Split editor:** Split the editor right or down (Ctrl+\ / Ctrl+Alt+\) and drag tabs between groups. The same file can be open in both groups with shared content, and the split is restored with the session.
- **Customizable shortcuts:** Use "Open keyboard shortcuts" in the command palette to change, remove or reset shortcuts. Conflicts are flagged and assignments are stored only on this computer.
- **Workspace find and replace:** The search panel has a replace field and a whole-word option; changes are previewed per file and line, and you can exclude lines and apply after confirming.
- **Task runner:** Tasks from `.nova/tasks.json` and `package.json` scripts run in the terminal from the command palette and the Run menu. "Select all occurrences" and multi-cursor commands were added to the palette.
- **Local history and timeline:** On every save the previous version is kept only on this computer (30 versions per file, can be turned off); compare versions, restore them and recover deleted files.
- **User snippets:** Snippets from `.nova/snippets.json` and a global file appear as editor completions and are edited from the palette.
- **Session restore:** Open tabs and unsaved drafts are restored on launch (with your confirmation); Ctrl+Shift+T reopens the last closed tab. Data stays on this computer.

#### Fixes
- **Data-loss protections:** Closing an unsaved tab or the window asks Save/Don't save/Cancel; a failed delete keeps the tab, deleting a folder closes its tabs; files deleted or changed on disk show a warning on the tab and auto-save will not overwrite them; typing while a save completes no longer loses new text.
- **Error screen instead of a white screen:** A component error shows "Reload". Deleted files go to the recycle bin first.
- **Quit and terminal:** The app no longer closes after 5 s while you decide in the Save dialog; terminal `cd` and the command keep their order and `cd` works for folder paths with special characters; pre-release extension updates compare correctly.

#### Security
- **Workspace trust:** Untrusted folders open in restricted mode (language servers and debugger off, git read-only). Settings > Trust and consent lets you revoke trusted folders and AI consents and set the collaboration room ID.
- **Isolated preview origin and strict CSP:** Code preview runs from a separate scheme (nova-preview) with its own policy; the app's content security policy has no eval or inline scripts and narrower network access. Local model downloads are verified with SHA-256. Agent tool results sent to external providers are also scrubbed of key patterns.
- **Search and task trust:** Regex search limits nested quantifiers and very long lines and has an 8 s time budget; running tasks now depends on folder trust.

#### Improvements
- **Less lag:** Typing no longer copies content into the file tree, switching tabs no longer rebuilds the editor, cursor moves no longer redraw the whole app; tree refresh reads only changed folders and does not descend into `.gitignore` folders.
- **Shortcuts and bundle size:** Settings > Shortcuts is now editable; the main bundle shrank and settings and Git texts load when their panels open.

## 1.4.2 - 17.11.2026
<!-- level: patch -->
### Türkçe
#### Düzeltmeler
- **Dosya yazma ve kapanış:** Dosya yazma atomik ve eşzamansız; 5 MB üstü ve ikili dosyalar uyarıyla ele alınır; UTF-8 BOM korunur; kapanışta dil sunucuları, terminal, hata ayıklayıcı ve ajan komutları süreç ağacıyla sonlandırılır (yetim süreç kalmaz).

#### Güvenlik
- **Pencere ve alt süreç sertleştirmesi:** Pencere sandbox'ı açıldı; gezinme ve dış bağlantılar kısıtlandı (yalnız https). Dosya erişimi symlink/junction kaçışına karşı korunuyor. Git güvenilmeyen depolara karşı sertleştirildi; hata ayıklayıcı ve dil sunucuları yalnız izin verilen ortam değişkenleriyle başlıyor (hata ayıklanan program kabuktaki özel ortam değişkenlerini artık görmez). PowerShell oturumu `Bypass` yerine `RemoteSigned` çalışıyor.
- **Yapay zekâ ajanı için güven ve rıza:** Ajan komutları güvenilmeyen klasörde onay ister; `.git` altına yazma ve ek gizli dosyaların okunması engellendi; dış sağlayıcıya ilk gönderimde açık rıza alınır ve anahtar kalıpları temizlenir; API anahtarları arayüze geçmez; özel API adresi ilk kullanımda onaylanır.
- **Ortak düzenleme sunucusu:** Token artık URL yerine WebSocket alt protokolüyle gider; oda adında yerel yol yok (rastgele oda kimliği); bozuk istek sunucuyu düşürmez; başarısız deneme sınırı, Origin denetimi, bağlantı/oda üst sınırı ve boş odaların temizlenmesi eklendi. Eski istemciler için sunucuda `NOVA_SYNC_ALLOW_QUERY_TOKEN=1` gerekir.
- **Önizleme sandbox'ı:** Yerel sunucu kipinde `allow-same-origin` kaldırıldı; bağlantı açma yalnız gerçek tıklamayla ve hız sınırlı.
- **Paket ve CI:** Electron fuse'ları (yalnız asar'dan yükleme, asar bütünlüğü) açıldı; CI action'ları commit SHA'ya sabitlendi; Dependabot otomatik birleştirme yalnız geliştirme bağımlılıkları ve action'larla sınırlandı. Kod imzalama için `CSC_LINK` secret'ı tanımlanınca imzalı çıkar.

#### İyileştirmeler
- **Daha hızlı etkileşim:** Git durumu 7 yerine 3 süreçle okunur; kendi yazımımız dosya izleyiciyi tetiklemez; dil sunucusuna artımlı değişiklik gider; arama iptal edilebilir ve paralel; yapay zekâ tamamlaması yalnız gereken metin parçasını gönderir; ayar kaydırıcıları, Git paneli ve ajan durum şeridi daha az yeniden çizim yapar; büyük dosyada ağır editör özellikleri otomatik kapanır; açılış ekranı uygulama hazır olunca kapanır.
- **Arapça sağdan sola ve erişilebilirlik:** Arapça arayüz RTL akar, sayfa dili ayarlanır; bölüm başlıkları klavyeyle açılır; düşük kontrastlı metinler düzeltildi; gölge yığınları ve degradeler sadeleşti; animasyon süreleri hareket jetonlarına bağlandı.

### English
#### Fixes
- **File writes and shutdown:** File writes are atomic and asynchronous; files over 5 MB and binary files are handled with a warning; UTF-8 BOM is preserved; on quit, language servers, terminals, the debugger and agent commands are terminated as process trees (no orphan processes).

#### Security
- **Window and child-process hardening:** The window sandbox is on; navigation and external links are restricted (https only). File access is protected against symlink/junction escapes. Git is hardened against untrusted repositories; the debugger and language servers start with an allow-listed environment (a debugged program no longer sees custom shell environment variables). PowerShell sessions run `RemoteSigned` instead of `Bypass`.
- **Trust and consent for the AI agent:** Agent commands ask for confirmation in untrusted folders; writes into `.git` and reads of more secret files are blocked; the first send to an external provider needs explicit consent and key patterns are scrubbed; API keys no longer reach the UI; a custom API address is confirmed on first use.
- **Collaboration server:** The token now travels in a WebSocket subprotocol instead of the URL; room names no longer contain a local path (random room id); malformed requests cannot crash the server; failed-attempt limits, Origin checks, connection/room caps and cleanup of empty rooms were added. Old clients need `NOVA_SYNC_ALLOW_QUERY_TOKEN=1` on the server.
- **Preview sandbox:** `allow-same-origin` was removed in local-server mode; opening links needs a real click and is rate-limited.
- **Package and CI:** Electron fuses (load only from asar, asar integrity) are on; CI actions are pinned to commit SHAs; Dependabot auto-merge is limited to dev dependencies and actions. Releases are signed once the `CSC_LINK` secret is set.

#### Improvements
- **Faster interaction:** Git status uses 3 processes instead of 7; our own writes no longer trigger the file watcher; incremental changes go to the language server; search is cancellable and parallel; AI completion sends only the needed text slice; settings sliders, the Git panel and the agent status bar re-render less; heavy editor features turn off automatically for large files; the splash closes as soon as the app is ready.
- **Arabic right-to-left and accessibility:** The Arabic UI flows RTL and the page language is set; section headers open with the keyboard; low-contrast text was fixed; shadow stacks and gradients were simplified; animation durations use the motion tokens.

## 1.4.1 - 17.11.2026
<!-- level: patch -->
### Türkçe
#### İyileştirmeler
- **Dil adları doğru yazılıyor:** Durum çubuğundaki dil adı artık dilin resmi yazımıyla görünür (JavaScript, TypeScript, C#, Python, F#, HTML…).

### English
#### Improvements
- **Proper language names:** The language shown in the status bar now uses the official spelling (JavaScript, TypeScript, C#, Python, F#, HTML…).

## 1.4.0 - 17.11.2026
<!-- level: minor -->
### Türkçe
#### Yeni özellikler
- **Yeni renk temaları, vurgu renkleri ve yazı tipleri:** Ayarlar → Görünüm → "Renk teması": 10 hazır tema (koyu: Gece Yarısı, Orman, Orkide, Kor, Arduvaz, Mürekkep; açık: Kâğıt, Sis, Nane, Gül). Tema seçince arayüz, editör, terminal ve sözdizimi renkleri birlikte değişir; mod (koyu/açık) temadan gelir. Vurgu rengi her temanın üstünde çalışır ve 5 yeni renk eklendi (Mor, Camgöbeği, Kırmızı, Kehribar, Limon yeşili). Arayüz yazı tipi 14, kod yazı tipi 12 seçeneğe çıktı (Bahnschrift, Calibri, Inter, Source Code Pro, IBM Plex, Hack, Iosevka…). Yazı tipleri cihazda kuruluysa kullanılır; yoksa yedek devreye girer. Tema geçişi yumuşak.
- **Kayıtta kodu otomatik biçimlendir:** Ayarlar → Dosyalar → "Kayıtta kodu biçimlendir" açıkken Ctrl+S (menü, kaydet düğmesi ve komut paleti dahil) etkin dosyayı dilinin biçimlendiricisiyle düzenleyip kaydeder (JS/TS, JSON, CSS, HTML…). Biçimlendirici yoksa dosya olduğu gibi kaydedilir. Varsayılan kapalı; otomatik kayıtta ve Çalıştır öncesi kayıtta çalışmaz.
- **Yeni karşılama ekranı, logo gölgesi ve hareket sistemi:** Karşılama sayfası yenilendi: üstte hızlı eylemler, kartlarda kademeli giriş ve hover efektleri, kısayol ipuçları. Arka plan eskisi gibi sade kaldı. NovaCode logosu temaya uyumlu gölge alıyor (koyu temada siyah, açık temada yumuşak gri). Geçiş, hover, alt çizgi ve gecikme efektleri tek bir jeton ve sınıf setine bağlandı; azaltılmış hareket ayarlarına uyuyor.
- **AI tamamlama menüsü (Copilot gibi):** Alt çubuktaki ✦ düğmesi menü açar: aç/kapat, bu dilde kapat, tetikleme (otomatik / manuel Alt+\), düşünme seviyesi (Hızlı/Dengeli/Derin ön ayarı), öneri biçimi (satır/blok/uzun), gecikme, uzunluk, önceki/sonraki bağlam, yaratıcılık ve alternatif sayısı kaydırıcıları, "şimdi öner". Aynı ayarlar Ayarlar → Yapay zekâ'da.
- **Öneri önizlemesi ve kısmi kabul:** Öneri görünürken araç çubuğu çıkar (kabul, kelime, önceki/sonraki öneri). Tab tümünü, Ctrl+→ kelimeyi, Ctrl+Alt+→ satırı kabul eder; Esc reddeder.
- **AI kod tamamlama:** Yazarken yapay zekâ, kodu gri "hayalet metin" olarak tamamlar (Tab ile kabul, Esc ile reddet). Yerel Ollama (qwen2.5-coder:7b) kullanır; kod bu bilgisayardan çıkmaz, .env ve anahtar dosyaları gönderilmez. Durum çubuğunda ✦ simgesi; Ayarlar → Yapay zekâ'dan açılıp kapatılır, gecikme ayarlanır.
- **İmleç konumu:** Alt çubukta "Sat 12, Süt 5" (seçili karakter sayısıyla); tıklayınca satıra git.
- **Kaynak denetimi genişledi:** Değişen dosyaya tıklayınca VS Code gibi fark (diff) sekmesi açılır (eklenen/silinen/değişen satırlar; yan yana veya satır içi). Dosyalar uzantısına göre simgeyle listelenir; sahnelenenler, değişiklikler, birleştirme çakışmaları ve raf (stash) ayrı bölümlerdir. Geçmişte bir commit'e tıklayınca değişen dosyaları ve farkı görürsün.
- **Dal/etiket seçici:** Alt çubuktaki dal adına basınca "Dal veya etiket seç" menüsü açılır (dal geç, yeni dal, şuradan yeni dal, uzak dal, etiket). Git panelindeki ⋯ menüsünde dal birleştir (çakışma çözümü ve iptal dahil), dal/etiket sil, etiket oluştur, stash, son commit'i düzelt/geri al, tümünü at, getir/çek/gönder var.
- **Sorunlar:** Alt çubukta hata ve uyarı sayacı (simgeli), alt panelde SORUNLAR sekmesi (Ctrl+Shift+M). Hatalı satırlar editörde kırmızı çizgi/zeminle, hatalı dosyalar sekmede ve dosya ağacında (klasörler dahil) kırmızı görünür. Sayaç açık dosyaları kapsar; TypeScript'te "modül bulunamadı" gibi yanlış pozitifler susturuldu.
- **Gerçek terminal (PTY):** Terminal artık xterm.js ile gerçek bir terminal (vim, htop, gerçek Ctrl+C, yeniden boyutlandırma, Ctrl+Tık ile dosya:satır bağlantısı). Eski terminal "klasik" olarak durur; ayar: Terminal modu.
- **Hata ayıklayıcı (Node/JavaScript):** Kesme noktaları (oluğa tık / F9), F5/F10/F11/Shift+F11/Shift+F5, değişkenler, çağrı yığını, ifade değerlendirme. Yalnız açık klasördeki .js/.mjs/.cjs dosyaları.
- **Dil sunucuları (LSP):** Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua, YAML için tamamlama, üzerine gelme, tanıma git ve hata işaretleri; bilgisayarındaki sunucuyla (yalnız PATH'ten). Durum çubuğunda sunucu durumu; ayar: Dil sunucuları.
- **Metin tamponu ve `edit_lines`:** Piece table tabanlı tampon; ajan artık satır aralığını atomik değiştirebilir (onay önizlemesi ile).
- **Ajan modu otonom ve build yapabilir:** Klasör seçilmeden Ajan sekmesi kilitli kalır. Ajan arayüzü ayrışır (violet vurgu, çalışma durum şeridi, görev şablonları: derle/test/denetim/gözden geçir, değişen dosyalar özet kartı). Otonomi seviyeleri: onaylı / düzenlemeler otomatik / otonom: otonomda ajan derle → hatayı oku → düzelt → tekrar derle döngüsünü kendi yürütür (güvenli derleme/test komutları sıkı bir izin listesiyle onaysız çalışır; derlemeyi etkileyen dosya değişirse yine sorar). Başarısız komutlar kırmızı görünür, adım sınırı ayarlanabilir. `qwen2.5-coder` gibi modellerin düz metin olarak yazdığı araç çağrıları artık çalışır. AI ve ayar metinleri ayrı parçaya alındı (ana paket 602 KB → 529 KB).
- **AI paneli: sohbet yönetimi ve kontroller:** Sohbetler konuya göre otomatik kategorilenir (Hata, Özellik, Açıklama, Refaktör, Test, Belge, Genel; elle değiştirilebilir) ve listede kategoriye veya tarihe göre gruplanır, süzülür, sıralanır. Düşünme seviyesi ve yanıt uzunluğu artık panelden de ayarlanır. Sohbet ve Ajan için ayrı hızlı komutlar, mesaj kopyalama, "en alta in" düğmesi, onaylı sohbet silme; akış sırasında kasmaya yol açan sık kayıt giderildi.
- **Özel pencere düğmeleri:** Küçült / büyüt-aşağı al / kapat düğmeleri artık başlık çubuğunun tasarımına uyumlu, kendi çizdiğimiz simgelerle geliyor (Windows/Linux; macOS sistem düğmelerini korur). Kapat düğmesi üzerine gelince kırmızı olur.
- **Otomatik CI/CD:** oturum sonunda değişiklikler `auto/*` dalına gönderilir, PR açılır ve CI yeşilse otomatik birleştirilir; CI'da sürüm denetimi (`npm run version:check`), CI hatasında otomatik `ci-failure` issue'su, Dependabot'un aynı-major güncellemelerinde otomatik birleştirme.
- Yapay zekâ asistanı baştan yazıldı: Anthropic, OpenAI uyumlu ve Ollama (yerel) desteği, gerçek zamanlı akış, **Sor** ve **Ajan** modları (ajan projeyi okur/arar, dosya yazma ve komut çalıştırma için onay ister), görsel ekleme/yapıştırma, çoklu oturum geçmişi (yalnız cihazda), `/` komutları ve proje yönergeleri (`.nova/instructions.md`, `.nova/commands/*.md`). API anahtarı şifreli saklanır, arayüze geri okunmaz.
- Sesli dikte: mikrofonla konuş, metin sohbet kutusuna yazılsın (OpenAI uyumlu transkripsiyon; açık rıza ayarı, varsayılan kapalı).
- Komut paleti: `Ctrl+P` dosyaya git, `Ctrl+Shift+P` / `F1` komutlar, `Ctrl+G` satıra git; üst çubuktaki arama kutusu paleti açar.
- Projede ara (`Ctrl+Shift+F`): büyük/küçük harf ve düzenli ifade desteği, sonuca tıklayınca satıra gider.

#### Düzeltmeler
- **AI kod tamamlama artık ilk yazışta da çalışıyor:** Model uygulama açılırken arka planda yüklenir ve 30 dakika bellekte kalır; ilk öneri uzun beklemez. Model yüklenirken oluşan zaman aşımı, tamamlamayı 60 sn duraklatmaz.
- **Ölçek düzeltmesi:** Arayüz ölçeği kaydırıcısı sürüklerken yüzde değerinin kendi kendine gidip gelmesi ve takılma giderildi (değer bırakınca uygulanır, ok tuşları anında). Her ölçek değişiminde çıkan başlık çubuğu hatası kaldırıldı.
- **Klasör açma düzeltmeleri:** Yeniden başlatınca başlık "Gezgin" iken eski projenin dosyalarının görünmesi giderildi (eski klasör izleyicisi artık ağacı doldurmaz). Başka klasör açılınca eski projenin kaydedilmiş sekmeleri kapanır. Klasör diyaloğunun düğmesi "Klasörü Seç" oldu.

#### Güvenlik
- **Güvenlik:** dosya okuma/listeleme ve git/GitHub işlemleri yalnız açık çalışma klasöründe yapılır; önizleme için disk okuma yalnız izinli uzantılarla ve ≤4 MB.

#### İyileştirmeler
- **Sürüm notları düzenlendi:** Sürüm notları artık kategorili (Yeni özellikler, Düzeltmeler, İyileştirmeler, Güvenlik) ve Türkçe + İngilizce birlikte yayınlanır. Sürüm türü (düzeltme / yeni özellik / kırıcı değişiklik) notlardan otomatik belirlenir ve her sürüm GitHub'da etiketlenir.
- **Daha yumuşak ve tutarlı arayüz geçişleri:** Koyu/açık tema değişirken renkler artık anında zıplamıyor, yumuşakça dönüyor. Sekmeler VS Code tarzında: etkin sekmenin üst vurgu çizgisi ortadan açılıyor, sekme girişi, hover ve kapat düğmesi yumuşak; etkin sekme çubuğun dışındaysa kendiliğinden görünür alana kayıyor. Sekme değişince editör içeriği hafifçe belirir. Komut paleti ve Ayarlar penceresi yumuşak girişle açılır. Köşeler tek ölçeğe bağlandı (4/6/8 px), editörde seçim köşeleri yuvarlak. Renkler ve düzen aynı kaldı.
- **AI tamamlamada dil ayarı kalktı:** "Bu dilde etkin" anahtarı ve "Kapalı diller" ayarı kaldırıldı. Tamamlama tüm kod dillerinde otomatik çalışır (düz metin hariç); yalnız genel aç/kapa anahtarı kalır.
- **AI tamamlama süresi modelden bağımsız:** Ayarlarda ve ✦ menüsünde tek bir "Tamamlama süresi" kaydırıcısı var (0–3000 ms): yazmayı bıraktıktan sonra önerinin (önizleme) görünme süresi. Model hızlıysa öneri bu süre dolana kadar bekletilir, yavaşsa hazır olunca görünür; Alt+\ ile elle tetiklemede beklenmez. Hız profilleri (Anında/Hızlı/Dengeli/Derin) ve soğuma kaydırıcısı arayüzden kaldırıldı. AI tamamlama kapalıyken alt çubuktaki ve menüdeki ✦ simgesinin üstüne çapraz çizgi çekilir.
- **AI tamamlama için hız profilleri ve model seçimi:** ✦ menüsünde Anında / Hızlı / Dengeli / Derin profilleri (bekleme, soğuma, uzunluk ve bağlamı birlikte ayarlar) ve tamamlama modeli seçici eklendi. Daha küçük bir Qwen2.5-Coder modeli (ör. `qwen2.5-coder:1.5b`) önerileri kat kat hızlandırır. Varsayılan artık Hızlı: bekleme 100 ms. Anında profilinde ilk satır gelir gelmez öneri gösterilir. Menüde son önerinin süresi (ms) görünür. Token sınırında kesilen önerinin yarım son satırı atılır. Değiştirmediysen ayarların otomatik Hızlı profile geçer.
- **AI kod tamamlama dile uygun ve daha hızlı:** Öneriler artık yazdığın dilin söz dizimine ve kurallarına uyuyor: editörün girinti ayarına (sekme/boşluk) çevrilir, kapsam bitince (`}` ya da Python'da girinti düşünce) durur, sonraki kodda zaten var olan kapanışları tekrar etmez. Gecikme 450 ms'den 250 ms'ye, öneri uzunluğu ve bağlam kısaltıldı; satır ortasında üretim ilk satırda duruyor. Öneri yaklaşık 1 sn içinde geliyor. Eski varsayılan değerleri kullanıyorsan yeni hızlı değerlere otomatik geçilir; kendi ayarların korunur.
- **AI kod tamamlama modeli yazarken de yükleniyor:** Model yüklenirken yazmaya devam etmek yüklemeyi sürekli yarıda kesiyor ve öneri hiç çıkmıyordu. Yükleme artık yazma/iptalden bağımsız tamamlanıyor, yüklenirken gelen istekler aynı yüklemeyi bekliyor ve ısıtma ile öneri isteği aynı bağlam boyutunu kullanıyor (Ollama modeli boşuna yeniden yüklemiyor).
- **AI kod tamamlama zamanlaması yenilendi:** Öneri artık yazmayı bıraktığın anda (gecikme) ve önceki istekten sonra bir soğuma süresi geçince istenir. Yazarken iptal olan istekler gecikmeyi otomatik uzatır, öneri gelince eski haline döner; Ollama yanıt vermezse bekleme 3, 10, 30, 60 sn diye kademeli artar. ✦ menüsüne "Tamamlama soğuma süresi" kaydırıcısı eklendi; hızlı/dengeli/derin ön ayarları ikisini birlikte ayarlar.
- **AI tamamlama menüsü yeniden tasarlandı:** ✦ menüsü artık editör temasına (açık ve koyu) ve tek hizalama ızgarasına uyuyor: anahtarlar, segment düğmeleri ve kaydırıcılar aynı sağ kenarda bitiyor, satır aralıkları eşit, alt düğmeler eşit yarılar. Klavye odak halkaları eklendi.
- **GitHub giriş kodu otomatik kopyalanır:** 8 haneli cihaz kodu giriş başlayınca panoya otomatik kopyalanır; tarayıcıda yapıştırmanız yeterli.
- **İnce, sade çerçeve:** Üst çubuk, etkinlik şeridi, yan panel, editör, sağ paneller (AI/önizleme) ve alt çubuk ince kenarlıklı, hafif yuvarlak kartlar oldu (VS Code gibi). Renkler, tema ve editör görünümü değişmedi. Çerçeve boşluğu ve köşe yuvarlaklığı dar pencerede küçülür; alt çubuk dar genişlikte ikincil bilgileri gizler.
- **AI paneli üst çubukta:** Yapay zekâ düğmesi sol etkinlik çubuğundan kalktı; arama çubuğunun yanında küçük bir simgeyle (veya Ctrl+Shift+L) panel açılıp kapanıyor.
- **Sohbet ve Ajan iki ayrı dal:** Mod değiştirmek bir sohbeti öbür moda çevirmez; her modun kendi sohbeti, taslağı ve son bakılan sohbeti vardır. Ajan görev şablonları sağ/sol düğmeli (ayrıca tekerlek ve dokunmatik) bir kaydırıcıya çevrildi ve 8 şablona çıktı (hata kaynağı, güvenlik denetimi, sadeleştir, belgele eklendi).
- **Ayarlar sadeleşti:** Model ve sunucu seçimi kalktı: Ollama + `qwen2.5-coder:7b` sabit, dikte (Whisper) adresi ve modeli sabit ve otomatik; uygulama dikte sunucusunu kendisi başlatıp kapanınca durdurur. Yerine Sohbet ve Ajan için **düşünme seviyesi** (hızlı / dengeli / derin), yanıt uzunluğu (token), bağlam ve özel yönerge ayarları geldi. Dikte artık tamamen yerel (ses cihazdan çıkmaz).
- **Yalnız Ollama, Türkçe odaklı:** Sağlayıcı yalnız Ollama (yerel); varsayılan model `qwen2.5-coder:7b`, model yüklü değilse uyarı çıkar. Dikte adresi varsayılan `http://localhost:8080/v1`; Türkçe için dil sabitlenir, sıcaklık 0 ve teknik sözcük ipucu gönderilir. Sohbet istemi Türkçe dilbilgisi ve dikteyle gelen hatalı yazımı anlama kurallarıyla güçlendirildi. Hiçbir şey yazılmamış sohbet listeye ve hafızaya kaydedilmez.
- **Sohbet ve Ajan ayrıldı:** İki modun sohbet listeleri artık ayrı (sekmeye basınca o modun son sohbeti açılır, sekmede sohbet sayısı görünür, taslak mod başına saklanır). Ayarlar → Yapay Zekâ Genel / Sohbet / Ajan / Ses alt başlıklarına ayrıldı; her moda ayrı model, yerleşik model, bağlam, yanıt uzunluğu ve özel yönerge verilebilir.
- **Sohbet listesi yenilendi:** Açılır sohbet seçici; arama (başlık ve ileti metni), tarih grupları, sabitleme, yeniden adlandırma (çift tık / F2), Markdown dışa aktarma, onaylı silme ve "sabitlenmemişleri sil". Sohbetler ilk iletiden ve ilk yanıttan sonra konuya göre otomatik adlandırılır (tamamen yerelde, veri dışarı gitmez); adı elle verince kilitlenir.
- **Gerçek VS Code simgeleri:** Dosya simgeleri artık Material Icon Theme (MIT) ile geliyor; uzantıya ve dosya adına göre ~1.250 simge, gerektikçe yüklenir.
- **Dosya simgeleri VS Code tarzı:** JS/TS yazılı kare, Python yılanı, PHP oval rozeti, SQL veritabanı, React atomu, HTML/CSS/JSON simgeleri; diğer türler rozet olarak kaldı.
- **Sekme çubuğu ve önizleme:** Açık sekme yokken sekme çubuğu hiç görünmez; sekme açılınca yumuşak animasyonla gelir, sekmeler VS Code tarzı yuvarlak köşeli ve kenarlıklıdır. HTML/web dosyasında Kaydet/Çalıştır yanında önizlemeyi açıp kapatan düğme var. Dosya menüsünden "Çık" kaldırıldı (Ctrl+Q çalışır).
- **Önizleme yenilendi:** `.html`, `.svg` ve `.md` dosyası açılınca localhost gerekmeden önizleme kendiliğinden açılır (ayar: Çalıştır ve önizleme). Yerel CSS/JS/görsel/yazı tipleri diskten gömülür, yazdıkça (kaydetmeden) ve diskte değişince canlı yenilenir; sandbox içinde çalışır, konsol çıktısı ve hata rozeti görünür. Terminalde çalışan yerel sunucu (`localhost`) algılanır ve tek tıkla önizlenir.
- **Çalıştır menüsü sadeleşti:** npm/cargo/dotnet komutları kaldırıldı; "Açık dosyayı çalıştır (F5)", "Önizleme" ve yeni **Çalıştır ve önizleme** ayarları (kaydet-önce, terminali temizle, dil başına özel komut şablonu `{file}`/`{dir}`) var.
- **Eklentiler ayarlara entegre:** Ayarlar → Eklentiler'de yerleşik + eklenti temaları tek listede, seçim anında uygulanır; `Ctrl+Shift+P` → "Renk temasını seç…" ile ok tuşlarıyla canlı önizleme (Esc geri alır). Yüklü eklentiler açılışta ve 6 saatte bir otomatik güncellenir (ayar: kapatılabilir).
- **Güncelleme:** "Güncellemeleri denetle" otomatik denetler; yeniyse "Son sürümdesiniz", varsa aşamalarıyla gösterir, ayar açıksa kendiliğinden indirir. Geliştirme ortamı GitHub'daki son yayınla karşılaştırır ve yayın sayfasını açar; kurulu uygulama gerçek güncellemeyi uygular.
- Ayarlar: yeni "Yapay Zekâ" kategorisi; kısayol listesi güncellendi.
- **Ayarlar ayrı pencerede:** Ayarlar artık uygulamanın üstünde, arka planı karartarak ayrı bir pencere olarak açılır (ekrandan taşmaz, `Esc` ile kapanır); altındaki görünüm kaybolmaz.
- **Gezgin yenilendi:** her zaman görünen araç çubuğu, filtre (`Ctrl+F`), sıralama, gizli dosyaları gizle, klasörleri sıkıştır, sade/renkli simge stili, satır yüksekliği (3 seçenek), etkin dosyayı otomatik göster, sürükle-bırak ile dosya/klasör taşıma, "Dosya gezgininde göster" ve "Terminalde aç", "Tümünü kapat", son açılan klasörler ve daha şık boş durumlar. Görünüm seçenekleri (…) menüsünden ve Ayarlar'dan değiştirilir.
- **Güvenlik:** silme, oluşturma, taşıma ve yazma işlemleri yalnız açık çalışma klasörünün içinde yapılır; taşıma hedefin üzerine yazmaz.
- **Başlık çubuğu:** arama kutusu pencereye göre tam ortada; dar pencerede (<1280 px) menü başlıkları tek "Menü" düğmesinde toplanır ve düğmeler çakışmaz.
- **Kapalı düğmeler:** proje/dosya yokken işe yaramayan düğmeler (HTML önizleme, Terminal, Ara) soluk görünür, üzerine gelince nedenini söyler; klasör/dosya açılınca etkinleşir.
- **Kaldırıldı:** kod parçacıkları (snippet) özelliği (panel, ayarlar, palet modu); eklenti mağazası yalnız tema destekler.
- **Güncelleme sistemi:** Yardım → Güncellemeleri denetle…; yeni sürüm bulunursa notlarıyla gösterilir, indirme yüzdesi durum çubuğunda ve pencerede görünür, bitince "Yeniden başlat ve güncelle". Sürüm notları (Yardım → Sürüm notları), açılışta otomatik denetim ve otomatik indirme ayarları.
- **Eklentiler:** VS Code gibi ayrıntı sayfası (açıklama, değişiklikler, yayıncı, lisans, puan); ağ hatası giderildi (sistem proxy/VPN desteği, yeniden deneme, hatanın türü ve "Tekrar dene").
- **Menüler:** projesi/dosyası açık olmadığında kapalı öğeler soluk görünür, üzerine gelince nedenini söyler; uzun menüler ve dar pencerede menü çubuğu kayar.
- **Duyarlı tasarım:** dar pencerede paneller editörü ezmez (AI/önizleme paneli üstüne biner), ayarlar sayfası ve editör çubuğu dar genişliğe uyum sağlar, düğme/menü yazılarında taşma ve alta kayma giderildi; `Ctrl+Shift+L` paneli aç/kapatır.
- Yerleşik yapay zekâ (anahtarsız, ücretsiz) artık sunucu adresi ya da API anahtarı gerekmez. Panelden bir kez yerel model indirirsin (Hızlı ~1 GB / Güçlü ~4,4 GB), sonra sohbet ve ajan bu bilgisayarda, internetsiz çalışır; kodun ve mesajların dışarı çıkmaz. Ollama ve bulut sağlayıcılar isteğe bağlıdır.
- Ajan paneli yeniden tasarlandı: dengeli ve taşmasız yerleşim, sürükleyerek genişlik, otomatik büyüyen giriş kutusu, kaydırılabilir araç kartları, koyu/açık tema uyumu.
- Üst menü çubuğu: Dosya, Düzenle, Seçim, Görünüm, Git, Çalıştır, Terminal, Yardım; animasyonlu açılır menüler. Çalıştır menüsü açık dosyayı türüne göre terminalde çalıştırır (`node`, `python`, `go run`, `php`…).
- Eklenti mağazası (Open VSX): tema eklentilerini ara, yükle, güncelle, kaldır (`Ctrl+Shift+X`). Kod çalıştıran eklentiler desteklenmez.
- Dosya türü simgeleri: Gezgin, sekmeler, palet ve aramada TS, JS, PHP, PY, GO ve ~60 türe renkli rozet.
- Yerel öncelikli: Ollama desteği (API anahtarı ve maliyet yok, veri bilgisayardan çıkmaz). Panel Ollama'yı ve yüklü modelleri algılar, model panelden seçilir; eksikse kurulum ipucu gösterir. Dikte için yerel Whisper sunucusu adresi girilebilir (anahtarsız).
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
- Dosya ve terminal ayarları: otomatik kayıt (gecikme / odak değişimi), kayıtta boşluk temizleme ve son satır, terminal yazı boyutu/varsayılan kabuk/komut renklendirme, Git yenileme aralıkları. Ayarlar JSON olarak dışa/içe aktarılabilir.
- Açık tema eklendi (Nova Light Monaco teması, terminal paleti dahil). Ortak düzenleme token'ı artık şifreli saklanır (eski düz metin token taşınıp silinir).
- Düzeltme: dosya açık değilken sekme çubuğundaki gereksiz `+` düğmesi gizlendi.
- Dökümantasyon: README yenilendi; `docs/brain/` içine `settings` aksiyonu, ayar tablosu (şemadan otomatik) ve karar günlüğü eklendi; `brain:check` ayar şemasını ve çevirileri de denetler.
- Terminal VS Code gibi yenilendi: birden çok terminal (+ ▾ ile PowerShell/CMD seçimi), sağda oturum listesi, paneli büyüt/küçült/kapat, istem satırı çıktının sonunda satır içi, blok/çubuk/alt çizgi imleç, `Ctrl+C` ile satır iptali. Panel varsayılan kapalı; gizliyken oturumlar canlı kalır. Terminal kodu `electron-term.cjs` modülüne taşındı ve gerçek kabuklarla test edilir (`npm test`).
- Gezgin VS Code son sürüme uyarlandı: "Açık düzenleyiciler" ve çalışma alanı bölümleri, satır içi oluşturma, F2 ile yeniden adlandırma, sağ tık menüsü, klavye gezinmesi, girinti kılavuzları, animasyonlu klasör açma. Alt klasörde dosya/klasör oluşturma ve klasör silme düzeltildi.
- Yer kaplayan öğeler kaldırıldı (başlıktaki sürüm etiketi, anlamsız durum çubuğu öğeleri); durum çubuğu yalnız anlamlı bilgi gösterir. Yeni geçişler: açılır menüler, kenar çubuğu ve terminal paneli boyut animasyonu.
- 10 yeni ayar: kenar çubuğu konumu, etkinlik/durum çubuğu, breadcrumb, açık düzenleyiciler, ağaç yoğunluğu ve kılavuzları, terminal satır yüksekliği/geçmiş/imleç.

### English
#### New features
- **New color themes, accent colors and fonts:** Settings → Appearance → "Color theme": 10 ready themes (dark: Midnight, Forest, Orchid, Ember, Slate, Ink; light: Paper, Mist, Mint, Rose). Picking one changes the interface, editor, terminal and syntax colors together; the mode (dark/light) comes from the theme. The accent color works on top of every theme and 5 new colors were added (Violet, Cyan, Red, Amber, Lime). The interface font now has 14 options and the code font 12 (Bahnschrift, Calibri, Inter, Source Code Pro, IBM Plex, Hack, Iosevka…). Fonts are used if installed on the device; otherwise the fallback applies. Theme changes blend smoothly.
- **Format code on save:** With Settings → Files → "Format code on save" on, Ctrl+S (also from the menu, the save button and the command palette) formats the active file with its language formatter and saves it (JS/TS, JSON, CSS, HTML…). If there is no formatter the file is saved as is. Off by default; it does not run on auto save or the save before Run.
- **New welcome screen, logo shadow and motion system:** The welcome page is redesigned: quick actions on top, staggered card entrances with hover effects, and shortcut tips. The background stays plain as before. The NovaCode logo gets a theme-aware shadow (black in dark theme, soft gray in light theme). Transitions, hover, underline and delay effects now share one set of tokens and classes and respect reduced-motion settings.
- **AI completion menu (like Copilot):** The ✦ button in the status bar opens a menu: on/off, disable for this language, trigger (automatic / manual Alt+\), thinking level (Fast/Balanced/Deep preset), suggestion style (line/block/long), sliders for delay, length, context before/after, creativity and number of alternatives, and "suggest now". The same settings are in Settings → AI.
- **Suggestion preview and partial accept:** While a suggestion is shown, a toolbar appears (accept, word, previous/next suggestion). Tab accepts all, Ctrl+→ a word, Ctrl+Alt+→ a line; Esc dismisses.
- **AI code completion:** While you type, the AI completes code as grey "ghost text" (Tab to accept, Esc to dismiss). Uses local Ollama (qwen2.5-coder:7b); code never leaves this computer and .env/key files are not sent. A ✦ icon in the status bar; toggle and delay in Settings → AI.
- **Cursor position:** "Ln 12, Col 5" in the status bar (with selected character count); click to go to a line.
- **Source control expanded:** Clicking a changed file opens a VS Code-style diff tab (added/removed/changed lines; side by side or inline). Files are listed with extension icons; staged, changes, merge conflicts and stashes are separate sections. In History, click a commit to see its files and diffs.
- **Branch/tag picker:** Clicking the branch name in the status bar opens "Select a branch or tag" (switch branch, new branch, new branch from…, remote branch, tag). The ⋯ menu in the Git panel adds merge (with conflict resolution and abort), delete branch/tag, create tag, stash, amend/undo last commit, discard all, fetch/pull/push.
- **Problems:** An error and warning counter with icons in the status bar and a PROBLEMS tab in the bottom panel (Ctrl+Shift+M). Error lines get a red bar/background in the editor; files with errors turn red in tabs and the file tree (folders included). The counter covers open files; false positives such as "cannot find module" in TypeScript are silenced.
- **Real terminal (PTY):** The terminal is now a real xterm.js terminal (vim, htop, real Ctrl+C, resizing, Ctrl+Click file:line links). The old terminal remains as "classic"; setting: Terminal mode.
- **Debugger (Node/JavaScript):** Breakpoints (gutter click / F9), F5/F10/F11/Shift+F11/Shift+F5, variables, call stack, expression evaluation. Only .js/.mjs/.cjs files in the opened folder.
- **Language servers (LSP):** Completion, hover, go to definition and error marks for Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua, YAML using a server on your computer (PATH only). Server status in the status bar; setting: Language servers.
- **Text buffer and `edit_lines`:** A piece-table based buffer; the agent can now replace line ranges atomically (with an approval preview).
- **Agent mode is autonomous and can build:** The Agent tab stays locked until a folder is open. The agent UI is distinct (violet accent, a live status strip, task templates: build/test/check/review, a changed-files summary card). Autonomy levels: ask first / auto-approve edits / autonomous: in autonomous mode the agent runs the build → read error → fix → rebuild loop itself (safe build/test commands run unasked from a strict allowlist; if a build-affecting file changes, it asks again). Failed commands show red, the step limit is adjustable. Tool calls that models like `qwen2.5-coder` write as plain text now work. AI and settings texts moved to a lazily loaded chunk (main bundle 602 KB → 529 KB).
- **AI panel: chat management and controls:** Chats are auto-categorized by topic (Bug, Feature, Explanation, Refactor, Test, Docs, General; editable) and can be grouped, filtered and sorted by category or date. Thinking level and response length can now be changed from the panel too. Separate quick prompts for Chat and Agent, message copy, a jump-to-latest button and confirmed chat deletion; fixed the frequent saving that caused lag while streaming.
- **Custom window controls:** Minimize / maximize-restore / close now match the title bar design with our own icons (Windows/Linux; macOS keeps system buttons). Close turns red on hover.
- **Autonomous CI/CD:** at the end of a session changes go to an `auto/*` branch, a PR is opened and auto-merged when CI is green; CI version check (`npm run version:check`), automatic `ci-failure` issue on CI failure, auto-merge for same-major Dependabot bumps.
- AI assistant rewritten: Anthropic, OpenAI-compatible and Ollama (local) support, real-time streaming, **Ask** and **Agent** modes (the agent reads/searches your project and asks for approval before writing files or running commands), image attach/paste, multiple sessions (stored on this device only), `/` commands and project instructions (`.nova/instructions.md`, `.nova/commands/*.md`). API keys are stored encrypted and never read back into the UI.
- Voice dictation: speak into the mic and the text lands in the chat box (OpenAI-compatible transcription; explicit-consent setting, off by default).
- Command palette: `Ctrl+P` go to file, `Ctrl+Shift+P` / `F1` commands, `Ctrl+G` go to line; the search box in the title bar opens it.
- Search in project (`Ctrl+Shift+F`): match case and regex support, click a result to jump to the line.

#### Fixes
- **AI code completion now works on the first keystroke too:** The model is loaded in the background at startup and stays in memory for 30 minutes, so the first suggestion no longer waits. A timeout while the model loads no longer pauses completion for 60 seconds.
- **Zoom fix:** The interface scale slider no longer jumps back and forth or lags while dragging (applied on release, arrow keys apply instantly). Removed the title bar error that fired on every scale change.
- **Folder opening fixes:** Fixed the old project's files showing under an "Explorer" header after a restart (a stale folder watcher no longer fills the tree). Opening another folder closes the previous project's saved tabs. The folder dialog button now reads "Select Folder".

#### Security
- **Security:** file read/list and git/GitHub operations are limited to the open workspace; disk reads for preview use an extension allowlist and ≤4 MB.

#### Improvements
- **Release notes reorganized:** Release notes are now grouped by category (New features, Fixes, Improvements, Security) and published in Turkish and English together. The release type (fix / new feature / breaking change) is detected from the notes automatically and every release is tagged on GitHub.
- **Smoother, more consistent UI transitions:** When switching between dark and light theme, colors now blend smoothly instead of jumping. Tabs follow VS Code style: the active tab's top accent line opens from the center, and tab entry, hover and the close button are softer; if the active tab is outside the bar it scrolls into view on its own. Editor content fades in slightly when you switch tabs. The command palette and the Settings window open with a gentle entrance. Corners follow one scale (4/6/8 px) and editor selections have rounded corners. Colors and layout are unchanged.
- **No per-language setting for AI completion:** The "Enabled for this language" switch and the "Disabled languages" setting were removed. Completion works automatically in every code language (except plain text); only the global on/off switch remains.
- **AI completion time is model-independent:** Settings and the ✦ menu now have a single "Completion time" slider (0–3000 ms): how long after you stop typing the suggestion (preview) appears. If the model is faster the suggestion is held until the time passes, if slower it appears when ready; no wait when triggered manually with Alt+\. The speed profiles (Instant/Fast/Balanced/Deep) and the cooldown slider were removed from the UI. When AI completion is off, the ✦ icon in the status bar and menu gets a diagonal strike line.
- **Speed profiles and model choice for AI completion:** The ✦ menu now has Instant / Fast / Balanced / Deep profiles (they set delay, cooldown, length and context together) and a completion model picker. A smaller Qwen2.5-Coder model (e.g. `qwen2.5-coder:1.5b`) makes suggestions many times faster. The default is now Fast: 100 ms delay. The Instant profile shows a suggestion as soon as the first line arrives. The menu shows the last suggestion's time (ms). A half-finished last line of a token-truncated suggestion is dropped. If you never changed them, your settings move to the Fast profile automatically.
- **AI code completion is language-aware and faster:** Suggestions now follow the syntax and conventions of the language you are typing: indentation is converted to the editor's setting (tabs/spaces), generation stops when the scope ends (`}` or a Python dedent), and closers already present in the following code are not repeated. The delay dropped from 450 ms to 250 ms, suggestion length and context were trimmed, and generation stops at the first line mid-line. Suggestions arrive in about 1 second. If you used the old defaults you are moved to the new faster ones automatically; your own settings are kept.
- **AI code completion model now loads while you type:** Typing while the model was loading kept aborting the load, so no suggestion ever appeared. Loading now completes independently of typing/cancellation, requests during a load wait for the same load, and warm-up and suggestions share one context size (Ollama no longer reloads the model needlessly).
- **AI code completion timing reworked:** Suggestions are now requested once you stop typing (delay) and after a cooldown since the previous request. Requests cancelled while typing automatically lengthen the delay and reset when a suggestion arrives; if Ollama is unresponsive, the wait backs off 3, 10, 30, 60 s. A "Completion cooldown" slider was added to the ✦ menu; the fast/balanced/deep presets set both values together.
- **Redesigned AI completion menu:** The ✦ menu now follows the editor theme (light and dark) with one alignment grid: all switches, segmented buttons and sliders end on the same right edge, rows are evenly spaced, and the bottom buttons are equal halves. Keyboard focus rings added.
- **GitHub login code auto-copied:** The 8-character device code is now copied to the clipboard automatically when sign-in starts, so you can just paste it in the browser.
- **Thin, simple frame:** The title bar, activity rail, side panel, editor, right panels (AI/preview) and status bar are now thin-bordered, slightly rounded cards (VS Code style). Colors, theme and editor look are unchanged. The frame gap and corner radius shrink in narrow windows; the status bar hides secondary info when narrow.
- **AI panel in the top bar:** The AI button moved out of the left activity bar; a small icon next to the search bar (or Ctrl+Shift+L) now opens and closes the panel.
- **Chat and Agent are two separate branches:** Switching modes never turns a chat into the other mode; each mode keeps its own chat, draft and last-viewed chat. The agent task templates are now a slider with left/right buttons (plus wheel and touch) and grew to 8 templates (root cause, security check, simplify and document added).
- **Simpler settings:** Model and server selection are gone: Ollama + `qwen2.5-coder:7b` are fixed, and the dictation (Whisper) address and model are fixed and automatic; the app starts the dictation server itself and stops it on quit. Chat and Agent now have a **thinking level** (fast / balanced / deep), response length (tokens), context and custom instructions. Dictation is fully local (audio never leaves the device).
- **Ollama only, Turkish-focused:** The provider is Ollama only (local); default model `qwen2.5-coder:7b`, with a warning if it is not installed. The dictation URL defaults to `http://localhost:8080/v1`; Turkish is pinned, temperature 0 with a technical-term hint. The chat prompt gained Turkish grammar and dictation-error rules. Chats with nothing typed are neither listed nor stored.
- **Chat and Agent split:** The two modes now have separate chat lists (the tab opens that mode's last chat, shows a chat count, drafts are kept per mode). Settings → AI is grouped into General / Chat / Agent / Voice; each mode gets its own model, built-in model, context, response length and custom instructions.
- **Chat list revamp:** Dropdown chat picker with search (titles and message text), date groups, pinning, rename (double-click / F2), Markdown export, confirmed delete and "delete unpinned". Chats are auto-named from the first message and refined after the first reply (fully local, no data leaves the device); a manual name locks it.
- **Real VS Code icons:** File icons now come from Material Icon Theme (MIT): ~1,250 icons matched by extension and file name, loaded on demand.
- **VS Code-style file icons:** JS/TS lettered squares, Python snake, PHP oval, SQL database, React atom, HTML/CSS/JSON glyphs; other types keep the badge.
- **Tab bar and preview:** The tab bar is hidden when no tab is open and slides in smoothly when one opens; tabs are VS Code-style with rounded corners and borders. HTML/web files get a preview toggle next to Save/Run. "Quit" removed from the File menu (Ctrl+Q still works).
- **Preview overhaul:** opening an `.html`, `.svg` or `.md` file opens a preview automatically, no localhost needed (setting: Run & preview). Local CSS/JS/images/fonts are inlined from disk, refreshed live as you type (unsaved) and when files change on disk; sandboxed, with console output and an error badge. A local dev server (`localhost`) started in the terminal is detected and previewed in one click.
- **Simpler Run menu:** npm/cargo/dotnet commands removed; "Run active file (F5)", "Preview" and new **Run & preview** settings (save first, clear terminal, per-language command template `{file}`/`{dir}`).
- **Extensions built into settings:** Settings → Extensions lists built-in + extension themes in one list, applied instantly; `Ctrl+Shift+P` → "Select color theme…" gives live preview with arrow keys (Esc reverts). Installed extensions auto-update at startup and every 6 hours (can be turned off).
- **Updates:** "Check for updates" checks automatically; shows "You're up to date" or the stages of an available update, and downloads automatically if enabled. The dev environment compares with the latest GitHub release and opens the release page; installed apps apply the real update.
- Settings: new "AI Assistant" category; shortcut list updated.
- **Settings in its own window:** Settings now opens on top of the app as a separate window with a darkened backdrop (never overflows the screen, closes with `Esc`); the view underneath is preserved.
- **Explorer revamp:** an always-visible toolbar, filter (`Ctrl+F`), sorting, hide hidden files, compact folders, minimal/colored icon style, row height (3 options), auto-reveal the active file, drag-and-drop file/folder moving, "Reveal in File Explorer" and "Open in terminal", "Close all", recent folders and nicer empty states. View options live in the (…) menu and in Settings.
- **Security:** delete, create, move and write operations only happen inside the open workspace folder; moving never overwrites the destination.
- **Title bar:** the search box is exactly centered in the window; in narrow windows (<1280 px) the menu titles collapse into a single "Menu" button and buttons no longer collide.
- **Disabled buttons:** buttons that do nothing without a project/file (HTML preview, Terminal, Search) look dimmed and explain why on hover; they activate once a folder/file is open.
- **Removed:** the code snippets feature (panel, settings, palette mode); the extension store supports themes only.
- **Update system:** Help → Check for updates…; a new version is shown with its notes, download percentage appears in the status bar and the dialog, then "Restart and update". Release notes (Help → Release notes), startup auto-check and auto-download settings.
- **Extensions:** VS Code-style details page (description, changelog, publisher, license, rating); network error fixed (system proxy/VPN support, retry, error type and "Try again").
- **Menus:** when no file/folder is open, unavailable items are dimmed and explain why on hover; long menus and the menu bar scroll in narrow windows. The Run menu detects the open folder's `package.json` scripts and project type (Go, Rust, .NET, PHP…).
- **Responsive design:** in narrow windows panels no longer crush the editor (AI/preview panel overlays), the settings page and editor bar adapt, button/menu text overflow and wrapping fixed; `Ctrl+Shift+L` toggles the panel.
- **Built-in AI (no key, free):** no server address or API key needed anymore. Download a local model once from the panel (Fast ~1 GB / Strong ~4.4 GB); then chat and agent run on this computer, offline; your code and messages never leave it. Ollama and cloud providers remain optional.
- Agent panel redesigned: balanced layout with no overflow, drag-to-resize width, auto-growing input, collapsible tool cards, dark/light theme fit.
- Top menu bar: File, Edit, Selection, View, Git, Run, Terminal, Help, with animated dropdowns. The Run menu runs the active file in the terminal by type (`node`, `python`, `go run`, `php`…) and offers project commands like `npm run dev/build`, `go run .`, `cargo run`.
- Extension store (Open VSX): search, install, update and remove theme extensions (`Ctrl+Shift+X`). Extensions that run code are not supported.
- File type icons: colored badges for TS, JS, PHP, PY, GO and ~60 types in the explorer, tabs, palette and search.
- Local-first: Ollama support (no API key, no cost, data never leaves your computer). The panel detects Ollama and installed models and lets you pick a model; it shows setup hints when something is missing. For dictation you can set a local Whisper server address (no key needed).
- The terminal was rebuilt VS Code-style: multiple terminals (+ ▾ to pick PowerShell/CMD), a session list on the right, maximize/restore/close, an inline prompt at the end of the output, block/bar/underline cursor, `Ctrl+C` cancels the line. The panel is closed by default and sessions stay alive while hidden. Terminal code moved to `electron-term.cjs` and is tested with real shells (`npm test`).
- The Explorer follows the latest VS Code: "Open editors" and workspace sections, inline create, F2 rename, context menu, keyboard navigation, indent guides, animated folder expansion. Creating files/folders in subfolders and deleting folders were fixed.
- Space-wasting elements were removed (version chip in the title bar, meaningless status bar items); the status bar shows only meaningful info. New transitions: popup menus, sidebar and terminal panel resize animation.
- 10 new settings: sidebar position, activity/status bar, breadcrumbs, open editors, tree density and guides, terminal line height/scrollback/cursor.
- Settings were rebuilt: real-time, VS Code-style full page (`Ctrl+,`) with search and categories. Dark / light / system theme, 6 accent colors, UI font, zoom, animations and language (instant); editor font (preset list or custom), size, line height, weight, ligatures, tabs, wrapping, cursor, minimap, folding, suggestions, rulers and more, 30+ settings; live Monaco preview.
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
