# Changelog

## Unreleased

### tr

- [feat] **Panelden model seçimi:** Yapay zekâ panelinde giriş kutusunun altındaki model menüsünden Sohbet ve Ajan için ayrı model seçilir (yerel Ollama'da kurulu modeller, Hızlı/Güçlü ipucuyla). Aynı menüde dikte (Whisper) modeli de seçilir; dikte modeli değişince sunucu yeni modelle başlar. Ayarlar'da model seçimi yoktur.
- [feat] **Dikte ayarları:** Ayarlar → Yapay Zekâ → Ses'te dikte dili (arayüz dili / otomatik) ve "Dikteden sonra otomatik gönder" eklendi. Dikte tamamen yerelde çalıştığı için rıza anahtarı kalktı; mikrofona basmak yeterli.
- [improve] **Tamamlama modeli varsayılanı küçüldü:** Kurulu küçük modele (`qwen2.5-coder:0.5b`) geçildi; satır içi öneriler çok daha hızlı. Eski varsayılanda kalmış kayıtlar otomatik taşınır, özel seçim korunur; sohbet ve ajan modeli 7b kalır.
- [improve] **Eski AI sağlayıcı kodu temizlendi:** Arayüzden erişilemeyen yerleşik model, Anthropic ve OpenAI desteği ile API anahtarı alanları kaldırıldı (uygulama paketi ~110 MB küçülür). Yapay zekâ yalnız yerel Ollama ile çalışır.

### en

- [feat] **Model picker in the panel:** The model menu under the AI input box picks a separate model for Chat and Agent (models installed in local Ollama, with a Fast/Strong hint). The same menu picks the dictation (Whisper) model; the server restarts with the new model. Settings no longer has a model selector.
- [feat] **Dictation settings:** Settings > AI > Voice gains dictation language (interface language / automatic) and "Send automatically after dictation". Because dictation runs fully on this computer, the consent switch is gone; just press the microphone.
- [improve] **Smaller default completion model:** Inline suggestions now default to the installed small model (`qwen2.5-coder:0.5b`) and are much faster. Records still on the old default migrate automatically, custom choices are kept; chat and agent stay on 7b.
- [improve] **Legacy AI provider code removed:** The unreachable built-in model, Anthropic and OpenAI support and API key fields were removed (the app package shrinks by ~110 MB). AI works only with local Ollama.
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
