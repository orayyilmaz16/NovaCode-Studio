# Karar günlüğü

Yeni karar en üste, tarihli (GG.AA.YYYY). Her kayıt: karar, neden, sonuç. Kararı geri almak = yeni kayıt (eskisini silme).

## 28.11.2026 (Otomatik düzeltme: LLM yerine deterministik düzeltici; API anahtarı yok)
Bu kayıt, aşağıdaki otopilot kararındaki "Claude Code ile düzeltme" kısmını geri alır. Sebep: kullanıcı ücretli API istemiyor ve anahtar gerektirmesini istemiyor. Çözüm: `scripts/auto-fix-brain.mjs` çözülmeyen belge bağlantılarını kuralla onarır (en yakın dosya adı ≤ 3 düzenleme uzaklığı, eşleşmezse düz metin); LLM, ücret ve secret yok. Kapsam aynı: yalnız `brain` kapısı; kod hataları insan işi. Doğrulama: birim testi (12 kontrol, `npm test`) ve yerel kopyada kırık bağlantı → düzeltme → brain:check. Geri dönüş: `auto-fix.yml` eski haline ve `claude-code-action`a döner. Free LLM (ör. Gemini/Groq ücretsiz katman) ileride eklenebilir; ancak veri gizliliği (KVKK, yurt dışı aktarım) ve kota kararı ayrıca alınmalı.

## 28.11.2026 (Otopilot: zamanlanmış tarama, sprint devri, proje senkronu, mekanik düzeltme)
Sürekli süreç otomasyonu [[autopilot]] aksiyonunda: `qa-sweep` (her gün; tsc, tam npm test, brain:check), `sprint-cadence` (her Pazartesi), `project-sync` (issue ve PR olayları), `auto-fix` (yalnız mekanik kapı, Claude Code ile PR). Sebep: hataları elle aramadan yakalamak, sprint geçişini ve proje durumunu kendiliğinden tutmak. Karar: bot `main`e yazmaz; düzeltme PR açar, birleştirmeyi insan yapar (org politikası: commit/push/deploy onaysız değil). Otomatik düzeltme yalnız belge ve i18n kapısıyla sınırlı; kod testleri insan işi. Public repo için çıktı temizlenir. Secret'lar (`PROJECT_TOKEN`, `ANTHROPIC_API_KEY`) repoya yazılmaz; yoksa adımlar atlanır. Doğrulanmamış: GitHub tarafı koşuları ve Claude ile uçtan uca düzeltme (secret gerekir). Geri dönüş: `gh workflow disable`, secret silme.

## 28.11.2026 (GitHub Project kuruldu)
Proje #2 "NovaCode Studio: Geliştirme ve QA" oluşturuldu, repoya bağlandı. Status altı sütuna çevrildi; Öncelik, Büyüklük ve Test durumu alanları eklendi; sprint için Milestone kullanılır (ayrı iterasyon alanı eklenmedi, CLI oluşturamıyor). #163–#170 projeye eklendi; öncelik ve büyüklükler öneri olarak girildi (kurucu teyidi bekleniyor). Sebep: kart durumunu, önceliği ve test durumunu tek yerden izlemek. Sonuç: arayüz otomasyonları (öğe eklenince Backlog, kapanınca Tamam) elle yapılacak. Geri dönüş: proje kapatılır veya silinir; repo ve issue'lar etkilenmez.

## 28.11.2026 (Milestone yapısı: sprint ve karar)
GitHub milestone'ları: `Sprint 1` (11.12.2026), `Sprint 2` (25.12.2026), `Ürün kararı bekliyor` (tarihsiz). Sebep: sprint takvimini ve kurucu kararı bekleyen işleri ayırmak; kararı bekleyen iş sprint kapasitesini tüketmesin. Sonuç: #163, #168, #169 Sprint 1'de; #164–#167 karar milestone'unda. Geri dönüş: milestone silinir, issue'lar milestone'suz kalır. Bu yapı Projects alanlarından bağımsız çalışır.

## 28.11.2026 (Sprint 1 onayı ve backlog issue'ları)
Sprint 1 (30.11.2026 – 11.12.2026) onaylandı. Açık [[BACKLOG]] kalemleri (S-04, S-18, I-05, F-08, F-09, T-01, P-13, U-05) issue'ya dönüştü: #163–#170, alan ve önem etiketli. Sebep: çalışma kalemlerini tek yerde izlemek; BACKLOG kimliği başlıkta korunur. Sonuç: önem etiketleri QA önerisidir (yüksek→major, orta→minor, düşük→trivial). F-09 için not: test sekmesi 21.11.2026'da eklendi, kalan kapsam kararı açık. Geri dönüş: issue'lar kapatılır; BACKLOG değişmez. GitHub Project henüz kurulmadı (token kapsamı).

## 28.11.2026 (QA ve çevik süreç: GitHub Project + md altyapısı)
Süreç tek kaynakta, aksiyon [[qa-agile]]: issue akışı (triage, Hazır, Geliştiriliyor, PR/CI, QA'da, Tamam), DoR/DoD, test seviyeleri, 2 haftalık sprint. Md altyapısı `docs/brain/qa/` altında ([[QA]], [[SMOKE]], [[CHARTERS]], [[SPRINTS]]). Önem (`sev:*`, QA) ile öncelik (P0–P3, kurucu) ayrıdır. 39 etiket, `user_story` ve `test_session` şablonları, `bug_report`a önem alanı eklendi. Sebep: test ve çevik akışı görünür kılmak; ajan ve insan aynı kuralları okusun. Sonuç: GitHub Project alanları henüz kurulmadı (token'da `project` kapsamı yok); arayüz otomasyonları ve Sprint alanı elle eklenecek. Açık: özellik işlerinin PR'dan geçmesi (Stop hook otomatik commit ile çakışıyor), Sprint 1 onayı. Geri dönüş: şablon ve etiket silinir, `docs/brain/qa/` ve aksiyon kaldırılır.

## 28.11.2026 (Commit yazarı: GitHub profili, e-posta yok)
Yazar profili (login, avatar, ad) yalnız bağlı GitHub hesabı ve GitHub origin'iyle, `commits/{hash}` API'sinden alınır. Commit e-postası ne çekilir ne gösterilir (KVKK: üçüncü taraf avatar servisi, Gravatar gibi, kullanılmadı). Sebep: kullanıcı profil fotoğrafı ve hesap bilgisi istedi. Sonuç: bağlı değilken yalnız git kaydındaki ad ve baş harfler. Geri dönüş: `github:commitAuthor` IPC'si ve `fetchAuthor` prop'u kaldırılır. Görsel doğrulama yapılmadı.

## 28.11.2026 (Commit geçmişi: tek graf bileşeni)
Durum çubuğu commit listesi ile git paneli aynı `GitHistory` bileşenini kullanır; iki ayrı liste tasarımı tutulmaz. Sebep: tutarlılık ve tek yerden bakım. Açılan ayrıntılar yalnız açıkken hesaplanır (hızlı yükleme). Görsel ve etkileşim testi uygulamada yapılmadı; otomatik testler (npm test, 1103 kontrol) ve derleme geçti.

## 28.11.2026 (GitHub hesabı: kapalıyken sıkı başlık)
GitHub hesabı bloğu açılır başlıkla çalışır; kapalıyken yalnız başlık satırı kalsın diye dolgu açılır içeriğe taşındı. Sebep: kapalıyken altta boşluk kalıyordu. Kaynak: kullanıcı bildirimi. Görsel doğrulama yapılmadı.

## 28.11.2026 (Git paneli: her bölüm açılır liste)
Commit, GitHub canlı durum, PR ve Yayınla blokları da `Section` ile açılır liste oldu; geçmiş dipte sabitlenmiyor. Sebep: kullanıcı isteği; kapalı bölümler yer açsın, geçmiş yukarı çıksın. Durum yerel tercih olarak saklanır. Geri dönüş: bölümler eski blokları yerine koyup `mt-auto` eklemek. Görsel doğrulama yapılmadı.

## 28.11.2026 (Git geçmişi: commit ayrıntı kartı)
Commit üzerine gelince yerel `title` ipucu yerine zengin bir kart açılır (portal, sabit konum, gecikme 350 ms). Sebep: kullanıcı ayrıntılı ve güzel bir görünüm istedi. Gövde metni eklenmedi (log biçimi değişmesin diye); sonraki adım olarak düşünülebilir. Kaynak: kullanıcı isteği. Görsel doğrulama yapılmadı.

## 28.11.2026 (Git grafı: açılan commit hizası)
Açılan commit'in dal şeritleri commit düğmesiyle aynı yatay ofsette (`mx-1`) çizilir. Sebep: 4 px kayma, açılınca çizginin kopması. Kaynak: kullanıcı bildirimi (NovaCode geçmişi). Görsel doğrulama yapılmadı; tsc temiz.

## 28.11.2026 (GitHub oturumu: yenileme token'ı)
Süreli OAuth token'ları (yenileme token'lı) desteklendi; 401 gelince oturumu hemen silmek yerine önce yenileme denenir. Sebep: kısa süreli oturum düşmeleri. Kaynak: kullanıcı bildirimi. Gerçek GitHub hesabıyla doğrulanmadı.

## 28.11.2026 (sağ üst bölge AI düğmesi)
Üst çubuğun sağ kartına, terminal düğmesinin yanına AI asistanı aç/kapa düğmesi eklendi; sol üstteki mevcut AI düğmesi kaldırılmadı (iki giriş noktası). Kaynak: kullanıcı isteği.

## 27.11.2026 (Docker boru hattı)
- **Sunucu imajları için otonom hat: derle → duman testi → GHCR → isteğe bağlı SSH dağıtımı → otomatik belge PR'ı.** Neden: imajlar hiç yayınlanmamıştı; elle komut istenmedi. Sonuç: dağıtım yalnız kullanıcının kendi tanımladığı `DEPLOY_*` / `ANALYTICS_DEPLOY_*` sırlarıyla çalışır, sır yoksa atlanır (ajan sunucuya bağlanmaz, önceki "sunucuya doğrudan bağlanılmadı" kararı geçerli). SSH için `known_hosts` sabit, GHCR girişi koşuya özel `GITHUB_TOKEN` ile geçici. Main korumalı olduğundan belge düzeltmesi PR ile gelir. Geri dönüş: `docker.yml` silinir veya sırlar kaldırılır.

## 27.11.2026 (izleme kapsamı: ayrıntılı değil, kimliksiz)
- **"Her şeyi ayrıntılı logla" isteği kimliksiz toplu metriğe çevrildi.** Neden: yazılan kod (içerik), GitHub hesabı ve kullanıcı bazlı akış kişisel veri/gizli bilgi taşır; KVKK, açık rıza ve az önce verilen "anonim, kişisel bilgi yansıtma" kararıyla çelişir. Sonuç: dil dağılımı (`lang_*`), giriş/çıkış sayısı, güncelleme denetimi/kurulumu, hata sayısı izin listesine eklendi (kimlik/içerik yok); indirme sayıları GitHub Release herkese açık sayaçlarından sağlık izlemeye eklendi. Kod içeriği, hesap adı ve olay akışı bilerek kapsam dışı; istenirse ayrı ürün kararı + KVKK değerlendirmesi + aydınlatma + rıza gerekir. Bkz. [[analytics]].

## 27.11.2026 (auto-commit onarımı)
- **Stop hook akışı stash'siz; yer tutucu `.env.example` şablonları gizli sayılmaz.** Neden: `git add -N` kalıntısı stash'i çökertip tüm turun commit'ini engelledi; `.env.example` (yalnız `<TOKEN>` yer tutucusu) gizli dosya korumasına takılıp commit'i durdurdu. Sonuç: dal geçişi `git switch` ile değişiklikleri taşır, stash yalnız yedek; gizli dosya koruması gerçek `.env*`/anahtar dosyalarını yine engeller (testli). Geri dönüş: git geçmişi.

## 27.11.2026 (anonim analitik)
- **Toplama sunucusu için ayrı, sertleştirilmiş dağıtım paketi (`server/analytics-deploy/`); sunucuya doğrudan bağlanılmadı.** Neden: canlı sunucuya yapay zekâ ajanıyla bağlanmak ve gizli bilgi (IP/SSH) paylaşmak kural dışı; kurulum kullanıcının tek komutuyla yapılsın. Anonimlik yapılandırmayla zorlanır ve CI testiyle kilitlenir (günlük kapalı, ham IP yok, salt-okunur konteyner). Senkron sunucusundan ayrı tutuldu (farklı gizlilik profili, 80/443 çakışması).
- **Kimliksiz, rızaya bağlı, kendi sunucumuzda toplanan sayaç; 3. parti analitik yok.** Neden: kurucu ürün metriği istedi; KVKK ve ETK gereği rızasız analitik yüklenemez, kişisel veri istenmedi. Sonuç: cihaz/kurulum kimliği hiç üretilmez (kullanıcı yeniden tanınamaz → anonim), yük 5 alanla sınırlı, olaylar izin listesinde, günde bir toplu gönderim, varsayılan kapalı, rıza yalnız kullanıcı eyleminden (ayar içe aktarma açamaz). Bedel bilinçli: gerçek tekil kullanıcı/saklama (retention) ölçülemez, yalnız toplu kullanım. `ENDPOINT` boş olduğu sürece uygulama hiçbir şey saymaz/göndermez; sunucu kurulunca açılır. Geri dönüş: `electron-analytics.cjs` kaydını ve `ENDPOINT`i kaldırmak yeter. Bkz. [[analytics]].

## 27.11.2026 (bağımlılık otopilotu)
- **Haftalık otonom bağımlılık güncellemesi; major elle.** Neden: Dependabot yalnız tek tek PR açıyor; toplu doğrulama, durum raporu, bildirim ve eskiyen PR temizliği yoktu. Sonuç: `dep-autopilot.yml` patch/minor güncellemeleri tek PR'da (tsc + test + build ile doğrulanmış) açar ve auto-merge eder; major'lar issue'da raporlanır, istenirse paket adıyla tek PR başlatılır (kırıcı değişiklik kendiliğinden birleşmez). Electron yığını mevcut izleyicide kaldı (çift PR yok). `dep-review.yml` `pull_request_target` kullanır ama PR kodunu çıkış yapmaz/çalıştırmaz. Geri dönüş: iki iş akışını silmek yeterli. Bkz. [[updates]].

## 23.11.2026 (uzak çalışma alanı)
- **SSH/SFTP ile uzak çalışma alanı; yeni bağımlılık `ssh2` (MIT, saf JS).** Neden: kurucu VS Code'daki Remote-SSH benzeri uzak geliştirme istedi (kapsam sorusunda "SSH uzak sunucu" seçildi). Mevcut çözüm yoktu (git'in ssh'ı dosya düzenleme sunmaz); Node'da SSH istemcisi yazmak güvenlik riski olurdu, `ssh2` yaygın ve bakımlı. Sonuç: bağlantı yalnız ana süreçte; renderer `ssh://<ana>/<yol>` sanal yolunu görür, bu yüzden Gezgin/editör/kaydet akışı neredeyse değişmedi (fs IPC'leri uzak yolda yönlenir). Uzak terminal mevcut PTY/xterm hattına `ssh:<ana>` profili olarak köprülendi. Bkz. [[remote-ssh]].
- **Parola hiç saklanmaz; parmak izi değişirse kesin ret.** Neden: KVKK/veri güvenliği ve MITM koruması; "beni hatırla" rahatlığı bilinçli feda edildi (varsayılan yöntem SSH ajanı). Değişen parmak izinde onay sorulmaz, kullanıcı kaydı açıkça unutur. Özel anahtar yolu yalnız ana sürecin diyalogundan gelir.
- **v1'de uzak klasörde Git paneli, arama, AI ajan araçları, LSP ve izleyici kapalı.** Neden: bunların hepsi yerel dosya sistemine bağlı; uzak yolu yerel korumalara karıştırmak yetki sınırını bozardı. Yerel çalışma klasörü uzak açıkken boş tutulur (hepsi güvenli biçimde kapanır). Geri dönüş/sonraki adım: uzak arama ve git `exec` üzerinden.
- **Kurulum notu:** `ssh2` `package.json`/lock'a eklendi; çalışan Electron süreci `node_modules/electron`'u kilitlediği için `npm install` EBUSY verdi, kurulum Electron kapatıldıktan sonra `npm install` ile tamamlanır.

## 18.11.2026 (yüzen arayüz)
- **Kartlara tek katman yumuşak gölge ve daha büyük yarıçap (kurucu talimatı).** Neden: VS Code'un yüzen kart görünümü isteniyor; CLAUDE.md kural 9 "gölge yığını yok" diyordu. Sonuç: kart başına yalnız `--float-shadow` (tek katman), yığın ve menü gölgesi yok; kural özü (düz yüzey, tek vurgu, degrade yok) korunur. Etkinlik çubuğu simgeleri 22 px kalır (18 px denendi, fazla küçük bulundu), kazanç yan boşlukları azaltmaktan gelir. Bkz. [[ui-design]].

## 18.11.2026 (AI: tek sağlayıcı, panelden model seçimi, dikte modeli)
- **Yerleşik model, Anthropic ve OpenAI kodu silindi; yalnız yerel Ollama.** Neden: arayüzden erişilemeyen ölü kod bakım ve güvenlik yüzeyiydi (`node-llama-cpp` ~110 MB paket, anahtar saklama, uzak rıza akışı). Sonuç: `electron-llm.cjs`, `llm:*` IPC, `aiKey_*` gizli değerleri ve ilgili metinler kalktı; motor taban adresi sabit. Uzak adres rıza/`scrubSecrets` koruması savunma olarak ve testlerde durur. Geri dönüş: git geçmişi (`electron-llm.cjs`).
- **Model seçimi ayarda değil panelde.** Neden: kullanıcı kurulu modeller arasından, sohbetin içinde değiştirmek istiyor; ayarlarda ölü seçenek yok. Sohbet ve Ajan için ayrı model (`aiAskModel`/`aiAgentModel`), dikte modeli de aynı menüde (`aiDictationModel`, kurulu `ggml-*.bin`, istemci yalnız ad yollar).
- **Tamamlama modeli varsayılanı 7b → 0.5b** (kurulu küçük model; ~10 kat hız). Sohbet/ajan 7b kalır. `settings.ts` v4 geçişi yalnız eski varsayılandaki kaydı taşır.
- **Dikte rıza ayarı (`aiVoiceEnabled`) kaldırıldı.** Neden: ses cihazdan çıkmıyor (yerel Whisper), 3. parti yok; rıza gerektiren veri aktarımı yok. Yerine dikte dili ve otomatik gönder ayarları.

## 17.11.2026 (Güven modeli ve önizleme izolasyonu)
- **Çalışma klasörü güveni** tek modülde (`electron-trust.cjs`): güvenilmeyen klasör kısıtlı modda açılır; LSP ve hata ayıklayıcı kapalı, git yalnız okuma. Güvenilen klasör, AI rızası ve izinli adresler yalnız **geri alınabilir**, yönetici adına verilemez (KVKK ilkesi). Entegre terminal kullanıcının kendi kabuğu olduğu için kısıtlanmadı.
- **Önizleme ayrı köken** (`nova-preview://`): uygulama CSP'sinden `unsafe-eval`/satır içi betik kaldırıldı; gevşek CSP yalnız önizleme yanıtında. `style-src unsafe-inline` ve `img-src https:` bilinçli kabul (React/Monaco, eklenti simgeleri).
- **Oturum geri yükleme** onaylıdır ve yalnız `localStorage`; yerel geçmiş yalnız `userData`, varsayılan açık, kapatınca silinir.
- **OAuth kapsamı `repo` kalır** (özel depo/push için gerekli); GitHub App'e geçiş ayrı ürün kararı. Kimlik imzalama sertifika alınınca açılır (`publisherName` o zaman eklenir).
- Ana paket bütçesi (JS 600 KB, gzip 200 KB) yükseltilmez; aşılırsa lazy import ile düşürülür.

## 17.11.2026 (Denetim bulgularının düzeltilmesi)
Kurucu talimatıyla [[BACKLOG]] bulguları ajanlarla dosya sahipliğine göre bölünerek çözülüyor (aynı dosyaya iki ajan dokunmaz; i18n anahtarları ajan başına ayrı dosyaya). Kapsam dışı bırakılanlar: uzaktan geliştirme ve çoklu kök (ayrı ürün projesi), test paneli, I-05 yedek dil (ürün kararı), S-04 imza (sertifika gerekir), S-18 OAuth kapsamı (`repo` özel depo için gerekli; ince ayarlı GitHub App ayrı karar). Bilinçli kabuller: ana CSP önizleme ayrıştırılana kadar geniş kalmıştı (G ajanı ayrıştırıyor); model SHA-256 değerleri yalnız doğrulanabilenler için yazılır.

## 17.11.2026 (Sürekli denetim)
Güvenlik, performans, hata/arayüz/özellik taramasını sürekli ve belgeli yapmak için üç katman kuruldu ([[audit]]): (1) `scripts/audit-scan.mjs` sezgisel tarama her Claude turunda (`auto-commit.mjs`) ve CI'da çalışır, [[AUDIT]] + `audit-baseline.json` üretir; (2) `npm run audit:check` temel çizgiye göre **yeni** yüksek/kritik bulgu varsa CI'ı durdurur (mevcut borç CI'ı kırmaz); (3) doğrulanmış derin bulgular [[BACKLOG]]'da durumlu tutulur. `security.yml` haftalık/her push'ta raporu iş özetine ve artifact'a yazar. Ağsız, yapay zekâsız, değer/sır yazdırmaz (KVKK). İlk derin tarama (17.11.2026): kritik yok, 30 güvenlik, 28 performans, 16 hata, 5 i18n, 8 arayüz, 9 özellik, 3 test maddesi.

## 17.11.2026 (Dil adı yazımı)
Durum çubuğunda dil adı resmi yazımla gösterilir (`languageLabel`, `src/services/lang.ts`); dil adları özel ad olduğu için i18n dışıdır.

## 17.11.2026 (Sürümleme otomasyonu ve main koruması)
- **Sürüm hazırlığı CI'dan yerel Stop hook'una (PR içine) taşındı; CI yalnız etiket atar; düzey CHANGELOG madde etiketlerinden gelir.** Neden (kök neden, kanıtlı): main korumalı (PR + zorunlu kontrol) olduğundan CI botunun `chore(release)` push'u reddediliyordu ("Changes must be made through a pull request"); iş yine de "başarılı" bitip etiketi yerel commit'e atıyordu. Sonuç: v1.2.0/v1.3.0 etiketleri main geçmişinde değildi, `git describe` v1.1.1'i buluyor, bump hep "1.3.0, bumped=false" dönüyor, CHANGELOG'da 1.2/1.3 bölümleri yoktu ve 35 commit sürümsüz kaldı. Çözüm: (1) `scripts/release.mjs` (plan/prepare/tag/history) tek giriş; `bump-version.mjs` kaldırıldı. (2) Düzey: `[breaking]` MAJOR, `[feat]` MINOR, diğerleri PATCH, `[docs]` yok; commit `feat!:`/`feat:` ek sinyal; `--level` yalnız yükseltir. Neden commit türü değil: otomatik commit'ler hep `chore(auto)`. (3) Taban etiket en yüksek SemVer etiketi (ata olması gerekmez). (4) Hazır ama etiketsiz sürüm varken yenisi bindirilmez (bekleyen sürüm). (5) CI: `git tag -a -F release-notes/vX.Y.Z.md` + push; commit yok, döngü yok. (6) Çıktılar: `package.json`+lock, kategorili `CHANGELOG.md` bölümü, `release-notes/vX.Y.Z.md`, [[VERSIONS]], `CLAUDE.md`/`AGENT.md` sürüm blokları. (7) İlk otomatik sürüm: birikmiş maddelerde `[feat]` olduğundan 1.3.0 → **1.4.0 (minor)**. Ayrıntı: [[versioning]].

## 17.11.2026 (Renk temaları)
- **`colorTheme` (10 hazır tema) eklendi; temalar tohum renklerden türetilir, mod temadan gelir, vurgu üstüne biner.** Neden: tek koyu/açık çift sıkıcıydı; her temayı 20+ değişkenle elle yazmak tutarsızlık ve bakım yükü yaratırdı. Sonuç: bir tema = 4 tohum renk + 7 sözdizimi rengi (`palettes.ts`); yüzey ölçeği Nova'dan çıkarılan oranlarla üretilir, böylece tüm temalar aynı kontrast ailesindedir ve testle (WCAG) denetlenir. Seçimler: (1) `themeMode` ile çakışmayı önlemek için tema seçiliyse mod temadan gelir, `themeMode` gizlenir. (2) Stil dosyasına 10 tema bloğu yazılmadı; satır içi değişken (vurgu sistemiyle aynı yol), `auto`da kaldırılır, Nova stil dosyasında kalır, CSS boyutu artmaz. (3) **Yazı tipi paketlenmedi** (yeni bağımlılık ve boyut yok); seçenekler cihazda kuruluysa çalışır, yoksa yedeğe düşer ve ayarda bu açıkça yazılır. Ayrıntı: [[settings]].

## 17.11.2026 (Belge otomasyonu)
- **`scripts/doc-sync.mjs` + `UserPromptSubmit`/`Stop` hook'ları: her değişiklik beyne işlenir.** Neden: belgeleme kuralı yalnız metin olarak durunca unutuluyordu; elle hatırlamaya güvenilmez. Sonuç: istemde hatırlatma, tur sonunda "kod var, belge yok" denetimi (tek sefer engel, `stop_hook_active` ile döngüsüz), otomatik [[LOG]] (son 40 tur), ardından auto-commit. Seçimler: (1) **istem metni kaydedilmez** (repo'ya gider, gizli bilgi/kişisel veri riski, KVKK); yalnız dosya yolu, alan, belge durumu. (2) Hook'lar paralel çalıştığı için auto-commit ayrı hook değil, doc-sync'in içinden çağrılır; böylece günlük aynı commit'e girer. (3) İçerik (neden, çeviri) üretilmez, yalnız unutma yakalanır. Ayrıntı: [[doc-sync]].

## 17.11.2026 (Yumuşak geçişler ve VS Code tarzı sekmeler)
- **Tek hareket dili korunarak: tema renk geçişi, `nova-tab` sekmeleri, editör belirme, pencere girişi ve köşe ölçeği (`--r-sm/md/lg`) eklendi.** Neden: tema değişimi ve sekme geçişleri sertti; yarı sabit `ms` değerleri jetonlardan kopuktu. Sonuç: eski sabit süreler (`ab-item`, `icon-btn`, `status-item`, kabuklar, `animate-*`) jetonlara bağlandı; renk paleti ve düzen değişmedi, gölge/degrade eklenmedi. Tema geçişi `<html data-theme-fading>` ile yalnız renk özelliklerini geçirir (kural 2'ye bilinçli istisna, kısa ömürlü); alternatif olan View Transitions API Monaco temasının ayrı güncellenmesi yüzünden seçilmedi. Ayrıntı: [[motion]].

## 17.11.2026 (AI tamamlama: dil ayarı kalktı)
- **`aiCompletionOffLangs` ve menüdeki "Bu dilde etkin" kaldırıldı; dil otomatik algılanır.** Neden: kullanıcı talebi, ayar yüzeyi sadeleşsin. Sonuç: sağlayıcı yalnız `plaintext` modelini atlar. Eski kayıtlardaki değer şema süzgecinde atılır. Geri alma: yeni kayıt + şema satırı.

## 17.11.2026 (AI tamamlama süresi)
- **Öneri süresi tek ayar: `aiCompletionDelay` ("Tamamlama süresi", 0–3000 ms); modelden bağımsız.** Neden: hız profilleri + soğuma + gecikme birlikte olunca süre modele ve profile göre değişiyor, kullanıcı ne bekleyeceğini kestiremiyordu. Sonuç: `aiCompletion.ts` isteği kısa sabit bekleme (`REQUEST_DEBOUNCE` = 50 ms) sonrası hemen yollar, yanıt süreden önce gelirse son tuştan itibaren `delay` dolana kadar tutar (`waitOrCancel`); model yavaşsa hazır olunca gösterir. Alt+\ ile elle tetikte bekleme yok. `aiCompletionEffort` ve `aiCompletionCooldown` şemada `hidden` (eski kayıt/test uyumu için durur), arayüzde yok; soğuma 0 geçirilir, hata geri çekilmesi (`planRequest`) sürer. Kapalıyken ✦ simgesi üstü çizgili (`CompletionIcon`, `off`). Ayrıntı: [[ai-assistant]].

## 17.11.2026 (Kayıtta biçimlendirme)
- **`formatOnSave` ayarı eklendi (varsayılan kapalı); biçimlendirme Monaco'nun kendi biçimlendiricisiyle, yalnız elle kayıtta ve yalnız etkin sekmede çalışır.** Neden: (1) dosya içeriğini değiştirdiği için kullanıcı bilerek açmalı; (2) otomatik kayıt yazarken imleci/metni oynatırdı, bu yüzden `autoSave` ve Çalıştır öncesi kayıt `handleSaveFile(f, false)` ile atlar; (3) Monaco yalnız etkin sekmenin modelini tutar, arka plandaki dosya biçimlendirilemez; (4) yeni bağımlılık (Prettier) eklenmedi. Biçimlendirici yoksa, hata olursa veya 3 sn aşılırsa dosya olduğu gibi kaydedilir (kayıt asla engellenmez); 1 MB üstü dosyada atlanır. Sıra: biçimlendir → satır sonu boşluklarını sil → sona boş satır ekle. Ayrıntı: [[settings]] → *Kayıt ve otomasyon davranışları*.

## 13.11.2026 (✦ menüsü tasarımı)
- **✦ tamamlama menüsü editör temasına ve tek hizalama ızgarasına bağlandı.** Tüm kontroller (anahtar, segment, kaydırıcı) aynı sağ sütunda (`CTRL_W` = 176 px) biter; satır yüksekliği 32 px, yan boşluk 14 px. Neden: eski sürümde segmentler içeriğe göre genişliyor, kenarlar zıplıyordu; sabit hex/`zinc-700/70` kenarlıklar temayla uyumsuzdu. Sonuç: yalnız jeton sınıfları (`nv-side`, `nv-border`, `nv-input`, `nv-hover`, `nv-active`, `rounded-[var(--frame-r)]`); açık/koyu modda aynı kod. Ayrıntı: [[ui-design]].
- **Menü katmanı `z-[70]`** (açılır menü katmanı; önceki `z-[200]` komut paletinin katmanıydı). Yeni metin eklenmedi (8 dil değişmedi).

## 12.11.2026 (AI kod tamamlama)
- **Copilot tarzı ✦ menüsü ve çaba ön ayarları.** "Düşünme seviyesi" burada ön ayardır (gecikme, uzunluk, bağlam, sıcaklık birlikte), ardından tek tek ayarlanır. Neden: tek model var, Copilot'taki gibi seviye modeli değiştirmez, çaba/bağlamı değiştirir. Ayarlar hem menüde hem Ayarlar sayfasında (tek kaynak: settingsSchema).
- **Ana süreç eski kalırsa (yeniden başlatılmadı) sessiz kalma:** menü nedeni söyler.
- **Satır içi tamamlama yalnız yerel Ollama ile, ham FIM.** Neden: kod bu bilgisayardan çıkmasın (KVKK), ek bağımlılık yok. Öneri tek blokla sınırlı (model fazladan fonksiyon uyduruyordu). Bkz. [[ai-assistant]].

## 12.11.2026 (kaynak denetimi ve Sorunlar)
- **Fark salt okunur sekmede (Monaco DiffEditor), commit/sahne/çalışma ağacı üçü de aynı mekanizma.** Neden: VS Code deneyimi, ek bağımlılık yok. Bkz. [[source-control]].
- **Açık dosyaların Monaco modelleri sekme değişince yaşar.** Neden: Sorunlar sayacı yalnız var olan modelleri görür; bedeli: sayaç açık dosyaları kapsar, kapalıları kapsamaz.
- **TS çalışanında "modül bulunamadı" vb. tanılar susturuldu.** Neden: node_modules türleri yok, yanlış pozitifler sayacı anlamsız kılıyordu.
- **Birleştirme `--no-edit` ile commit'e dönüşür, çakışma arayüzde çözülür veya iptal edilir;** `push --force`/yeniden yazma yok (`amend` açık onayla).

## 12.11.2026 (metin tamponu, hata ayıklama, PTY, LSP)
- **Piece table Monaco'nun tamponunu değiştirmez;** yalnız ajan `edit_lines` aracı kullanır. Neden: Monaco'nun tamponu zaten iyi, değiştirmek risk ve fayda yok. Bkz. [[text-buffer]].
- **Hata ayıklayıcı yalnız Node/JS, V8 Inspector (CDP).** Neden: ek bağımlılıksız (`ws` vardı), çalışma klasörü + 127.0.0.1 ile güvenli. Bkz. [[debugging]].
- **Gerçek terminal `@lydell/node-pty` + `xterm`; klasik terminal korunur.** Neden: tam ekran programlar ve gerçek Ctrl+C; derleme aracı gerektirmeyen hazır ikili. Yeni bağımlılıklar: `@lydell/node-pty`, `@xterm/xterm`, `@xterm/addon-fit`. Bkz. [[terminal]].
- **Dil sunucuları yalnız kullanıcının PATH'inden çalışır, proje içinden asla.** Neden: açılan kötü niyetli proje kod çalıştıramasın. Uygulama sunucu kurmaz, ipucu gösterir. Bkz. [[lsp]].

## 12.11.2026 (Ayarlar penceresi, Gezgin)
- **Ayarlar ana alanı değiştirmek yerine uygulamanın üstünde ayrı bir pencere (modal) olarak açılır.** Neden: kullanıcı "arka plan siyah, ayarlar ayrı açılsın, ekrandan çıkmasın" istedi; ana görünüm kaybolmuyor, boyut ekranla sınırlı. Tek z-index ölçeği dokümante edildi ([[ui-design]]).
- **Açılır menüler portal ile `document.body`'ye çizilir.** Neden: Gezgin'in görünüm menüsü kenar çubuğunun `overflow-hidden`'ı tarafından kırpılıyordu.
- **Gezgin görünüm seçenekleri ayar olarak saklanır ve ayarlar sayfasıyla ortaktır** (menü ↔ ayar tek kaynak). Neden: özelleştirme kalıcı olsun, iki yerde tutarsızlık olmasın.
- **Dosya IPC'leri çalışma klasörüne kısıtlandı (silme/oluşturma/taşıma/yazma) ve taşımada üzerine yazma engellendi.** Neden: `fs:deleteItem` renderer'dan gelen herhangi bir yolu özyinelemeli siliyordu (CLAUDE.md kural 4); sürükle-bırak taşıma eklenirken aynı yüzey sıkılaştırıldı. Etki: çalışma klasörü dışındaki dosyalar yalnız "Dosya Aç" diyaloğuyla seçilmişse yazılabilir.
- **Sürükle-bırak taşıma Gezgin içinde (HTML5 DnD), ek bağımlılık yok.**

## 12.11.2026 (başlık çubuğu, kapalı düğmeler, snippet kaldırıldı)
- **Kod parçacığı (snippet) özelliği tamamen kaldırıldı:** kenar çubuğu paneli, ayar kategorisi ve yönetici, hazır snippet'ler, palet `$` modu, Monaco sağlayıcısı, eklenti snippet katkısı, tipler ve metinler. Neden: gereksiz bulundu, ürünü sadeleştirir; Monaco'nun kendi tamamlaması sürer. Sonuç: eklenti mağazası yalnız **tema** destekler; eski `userSnippets` verisi bir sonraki kayıtta `localStorage`'dan silinir (şema artık yazmaz). Geri almak = yeni karar.
- **Başlık çubuğu üç bölgeli ızgara; arama kutusu pencereye göre ortalı; menü < 1280 px'te "Menü" düğmesine toplanır.** Neden: esnek (`flex`) düzende arama kutusu menü genişliğine göre kayıyor ve dar pencerede düğmelerle çakışıyordu.
- **Projesiz/dosyasız işe yaramayan düğmeler `aria-disabled` ile soluk ama hoverlanabilir.** Neden: `disabled` fare olaylarını yutuyordu (ipucu/menü kaydırma çalışmıyordu); kullanıcı "kapalı ama üzerine gelebileyim" istedi.

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
- **Logo yalnız gölge alır, plaka/ızgara yok (16.11.2026).** Neden: kullanıcı arka planın aynı kalmasını, logoya yalnız tema uyumlu (koyu: siyah) gölge istedi; sade yüzey korunur. Gölge `--logo-shadow` jetonuyla. Karşılama arka planı `bg-nv-editor` kalır. Bkz. [[ui-design]].
- **Tek hareket dili: jeton + yardımcı sınıf (16.11.2026).** Neden: hover/geçiş/gecikme dağınık ms ve eğrilerle yazılıyordu; tutarlılık ve azaltılmış hareket desteği için `--dur-*`, `--ease-*` jetonları ve `motion-*` sınıfları. Bkz. [[motion]].
- **AI tamamlama modeli önceden ısıtılır (16.11.2026).** Neden: model 10 dk boşta kalınca bellekten düşüyor, ilk öneri ~9 sn sürüyor; kullanıcı yazmaya devam edince Monaco isteği iptal ediyor ve araç "çalışmıyor" görünüyordu. Çözüm: açılışta boş istekle yükleme, `keep_alive` 30 dk, zaman aşımı 60 sn ve zaman aşımının 60 sn duraklamayı tetiklememesi. Bkz. [[ai-assistant]].
- **AI tamamlama zamanlaması: gecikme + soğuma + uyum (16.11.2026).** Neden: sabit gecikmeyle 7B model ~2-4 sn'de yanıt verirken kullanıcı yazmaya devam edince Monaco her isteği iptal ediyordu; hiç öneri çıkmıyordu, hatada ise düz 60 sn susuyordu. Çözüm: saf zamanlayıcı (`completionSchedule.ts`): debounce gecikmesi, istek sonrası soğuma, boşa giden isteklerde kademeli uzayan gecikme, hatada 3/10/30/60 sn geri çekilme. Elle tetikleme hepsini aşar. Bkz. [[ai-assistant]].
- **Model yükleme iptalden bağımsız ve paylaşımlı (16.11.2026).** Neden: Ollama günlüğünde 184 kez "aborting load" ve neredeyse tüm `/api/generate` istekleri 499 idi; model bellekte değilken her tuşta iptal edilen istek yüklemeyi baştan başlattığı için (RTX 3050 6 GB) model hiç yüklenmiyor, öneri çıkmıyordu. Ayrıca ısıtma `num_ctx` içermediğinden Ollama modeli yeniden yüklüyordu. Çözüm: `ensureCompletionModel` (tek ortak, iptale kapalı yükleme, aynı `num_ctx`), iptal yalnız beklemeyi keser. Gerçek Ollama ile doğrulandı: 12 sn sürekli yazma sırasında model yüklendi, yazma durunca öneri 0,8 sn'de geldi. Bkz. [[ai-assistant]].
- **AI tamamlama: dile duyarlı ve daha hızlı (16.11.2026).** Neden: öneri geç geliyordu (gecikme 450 ms + 2-4 sn üretim) ve dil kurallarına (girinti, kapsam sonu, tekrar eden kapanış) uymuyordu. Çözüm: model istemine dosya adı başlığı, öneri şekillendirme modülü (`completionShape.ts`), satır ortasında/blokta erken durdurma, varsayılanlar 250/300 ms ve 64 token, tek seferlik ayar geçişi. Ölçüm: öneri 0,7-1,3 sn. Bkz. [[ai-assistant]].
- **AI tamamlama hız profilleri, model seçimi ve akışla erken durdurma (16.11.2026).** Neden: ölçümde (7B, RTX 3050) öneri süresi profile değil model boyutuna bağlıydı (taban 0,6-1,2 sn); bekleme/gecikme ayarı toplamı yalnız 100-250 ms düşürüyordu. Çözüm: 4 profil (Anında/Hızlı/Dengeli/Derin) + `aiCompletionModel` (yalnız qwen2.5-coder ailesi, kat kat hızlı küçük model seçilebilsin) + tek satır modunda akışla ilk satırda durma + ölçülen sürenin menüde gösterilmesi (kontrol). Varsayılan Hızlı profil; v3 ayar geçişi yalnız hiç değiştirilmemiş varsayılanları taşır. Bkz. [[ai-assistant]].

- **Alt panel sekmeleri tek kayan hap (22.11.2026).** Neden: kullanıcı terminal ve sekme geçişlerinin VS Code gibi Fluent akışkanlığında olmasını istedi; her sekmede ayrı zemin/çubuk açıp kapamak yerine tek öğe kayar. Hap `transform + width` geçirir (hareket kuralı 2'ye bilinçli istisna, bkz. [[motion]]); renkler tema kaplama değişkenleriyle (`white/[..]` açık temada görünmüyordu).

- **Git Bash yalnız PTY ile (22.11.2026).** Neden: kullanıcı terminal eklerken Git terminali istedi; boru terminali bash'te istem ve çalışma klasörü işaretini veremez, PTY ise bunu doğal çözer. Yol yalnız ana süreçte bilinen Git kurulum konumlarından bulunur (renderer yol veremez, WSL `bash.exe` dışarıda).
- **Terminal profilleri ana süreçte algılanır, arayüz yalnız kimlik seçer (22.11.2026).** Neden: kullanıcı bilgisayarda kurulu diğer terminallerin de listede çıkmasını istedi (VS Code profilleri gibi). Arayüzden gelen yol/komut çalıştırılmaz; yalnız algılanan listedeki `id` kabul edilir, böylece "renderer rastgele program çalıştıramaz" kuralı korunur.

## 23.11.2026 — Sekme çubuğunda + düğmesi yok
Karar (kurucu): editör sekme çubuğunda yeni sekme (+) düğmesi gösterilmez; yeni dosya yolları Ctrl+N, menü, komut paleti ve boş editör ekranıdır. Neden: sekme çubuğu sade kalsın.

## 25.11.2026 — Paket bütçesi yükseltildi
Karar (kurucu): ana paket bütçesi JS 600→700 KB (gzip 200→230), CSS 100→120 KB. Neden: 49 commitlik birikim (menü akordeonu, klasör kapatma, SSH vb.) bütçeyi aştı; PR #73 birleşsin. Önceki kural (bütçe yükseltilmez, lazy import) bu tarihten sonra geçersiz; yeni aşımda önce lazy import denenir, sonra bütçe konuşulur.

## 25.11.2026 — Masaüstü derlemede yeniden derleme kapalı
Karar: \`build.npmRebuild:false\`. Neden: isteğe bağlı yerel bağımlılıklar (cpu-features) CI'da gyp ile düşüyordu; kullanılan yerel modüller (@lydell/node-pty) önceden derlenmiş geliyor, ssh2 saf JS yoluna düşer.

## 25.11.2026 — Electron yığını otomatik ve hep son sürümde
Karar (kurucu): Electron (Chromium + Node.js), electron-builder ve @electron/* ana sürüm dahil otomatik yükseltilir ve CI yeşilse birleşir. Neden: Chromium/Node güvenlik ve performans düzeltmeleri gecikmesin. Risk CI kapılarıyla (tip, test, build, bütçe, Windows paketleme) sınırlı; kırılırsa PR açık kalır. Önceki kural (ana sürüm elle) yalnız diğer bağımlılıklar için geçerli.

## 25.11.2026 — Bağımlılık yükselince sürüm bulutta otomatik hazırlanır
Karar (kurucu): Electron yığını veya çalışma zamanı bağımlılığı yükselince sürüm (patch) otomatik hazırlanır, CI yeşilse birleşir, etiket + Release ci-cd.yml ile çıkar. Neden: güvenlik/performans düzeltmeleri kullanıcıya bekletmeden ulaşsın. Ön koşul: Actions PR oluşturma izni (repo ayarı, kurucu açar).

## 25.11.2026 — Sürüm hazırlığı yalnız bulutta
Karar (kurucu): elle/yerel sürüm hazırlığı bırakıldı; Actions PR oluşturma izni açıldı. auto-release.yml sürümü hazırlar ve PR açar. Neden: yerel ve bulut hazırlığı yarışıp yinelenen dal/PR üretiyordu.

## 25.11.2026 — Dependabot auto-merge kapsamı genişledi
Karar (kurucu): çalışma zamanı bağımlılıklarının patch/minor, GitHub Actions ve Electron yığınının her sürümü CI yeşilse otomatik birleşir; diğer npm major'ları elle. Önceki S-21 kuralı (çalışma zamanı bağımlılıkları otomatik birleşmez) bu tarihten sonra geçersiz; koruma CI kapıları ve zorunlu kontroldür. Otomasyon hataları issue açar.

## 26.11.2026 — macOS ve Linux kurulum paketleri
Karar (kurucu): sürüm artık Windows yanında macOS (.dmg+.zip, x64+arm64) ve Linux (.AppImage+.deb, x64) paketleri de üretir; `ci-cd.yml` `build-desktop` matrisi + tek `release-desktop` yayın işi. İmza/noterlik secret'ları tanımsızsa paketler imzasız çıkar (macOS'ta otomatik güncelleme imzasız çalışmaz). Neden: üç masaüstü platformuna destek. Geri dönüş: `build.mac`/`build.linux` ve matris satırlarını kaldır.

## 26.11.2026 — Eski sürümlere macOS/Linux ve source code arşivi
Karar (kurucu): önceki tüm release'lere (v1.0.0+) macOS ve Linux paketleri etiketin kendi kodundan derlenip eklenir (`.github/workflows/backfill-desktop.yml`, `scripts/backfill-overlay.mjs`: güncel mac/linux yapılandırmasını eski package.json'a ekler). GitHub'ın otomatik "Source code (zip/tar.gz)" varlıkları API ile kaldırılamaz; bu yüzden kaldırılamadı. Geri dönüş: workflow dosyasını sil, eklenen varlıkları `gh release delete-asset` ile kaldır.

## 27.11.2026 — Sürüm düzeyi: küçük = patch, büyük toplu = minor
Karar (kurucu): otomatik sürümde küçük değişiklikler patch, çok büyük/toplu güncellemeler minor olur; major otomatik çıkmaz (yalnız `--level major`). Eşik: `[breaking]` var, `[feat]` ≥ 2 ya da docs hariç ≥ 6 madde → minor. Önceki kural (`[feat]` her zaman minor, `[breaking]` major) geçersiz. Geri dönüş: `levelFromBullets`/`levelFromCommits` eski haline.

## 27.11.2026 — Sürekli sağlık, güvenlik ve performans izleme
Karar (kurucu talimatı): `health-monitor.yml` her 6 saatte bir bağımlılık açıklarını, statik denetimi, paket boyutu/derleme süresi eğilimini ve dış servis sağlığını ölçer, raporu artifact'a loglar, bulguyu tek issue ile bildirir. Repo public olduğu için zaafiyet ayrıntısı (dosya:satır) issue/günlüğe yazılmaz; tek seferlik servis kesintisi alarm sayılmaz (art arda ikinci ölçüm alarm). Neden: açık ve performans gerilemesini kullanıcıdan önce görmek, gürültüsüz ve sızıntısız. Geri dönüş: workflow ve `scripts/health-monitor.mjs` silinir.

## 27.11.2026 — Etiket tamamlayıcı (`release-finalize.yml`); bot PR onayı otomatikleştirilmedi
Karar: bot birleşmeleri `push` olayı üretmediği için etiketsiz kalan sürümü `release-finalize.yml` etiketleyip Release'i tetikler (v1.9.1 elle kurtarıldı). Bot PR'ı koşu onayının workflow içinden otomatik verilmesi güvenlik katmanınca reddedildi; onay insanda kalır. Geri dönüş: workflow dosyasını sil.

## 27.11.2026 — Senkron sunucusu dağıtım paketi (Docker + Caddy, sslip.io)
Karar (kurucu talimatı): alan adı yokken `wss://` için `<ip-tireli>.sslip.io` + Caddy otomatik TLS; `server/deploy/install.sh` token üretir ve yalnız sunucuda `.env`'de tutar. Neden: uygulama `wss://` zorunlu kılar, kurucunun alan adı yok. Risk: IP sertifika şeffaflık kayıtlarında görünür; kalıcı için alan adı. Geri dönüş: `docker compose down`, `server/deploy/` silinir.

## 27.11.2026 — Senkron sunucusu metrik ve hata izleme (`/metrics`, `status.sh`)
Karar (kurucu talimatı): sunucuya token korumalı Prometheus `/metrics` ve sunucuda çalışan `status.sh` eklendi; metrikler yalnız sayaçtır (IP, oda adı, token, içerik yok; KVKK veri minimizasyonu). GitHub izleyicisine `/metrics` bağlanmadı (ek secret gerektirirdi). Geri dönüş: `/metrics` yolu ve `status.sh` silinir.

## 27.11.2026 — Bütçe, paket bölme, auto-release idempotansı, senkron metriği izleyiciye bağlandı
Karar (kurucu tam yetkiyle): (1) CSS bütçesi 150 KB, JS giriş parçası `manualChunks` ile bölündü (654 → 434 KB). (2) `auto-release.yml` aynı sürüm dalı için açık PR varsa yeni PR açmaz, çakışıyorsa yeniden üretir (yarış hatası #126). (3) `/metrics` izleyiciye bağlandı; ek secret `NOVA_SYNC_METRICS_TOKEN` (= sunucu token'ı, yalnız Actions'ta). Risk: sunucu token'ı bir secret olarak GitHub'da da durur; sunucu tek token tanıdığı için ayrı salt-okunur token yok. Geri dönüş: secret'ı sil (izleme yalnız sağlık adresine döner).

## 28.11.2026 — Git gösterimi tek mavi işaret ve sıkı commit görünümü
Karar (kurucu): editör kenarı ve kaydırma çubuğundaki git değişiklikleri yalnız mavi gösterilir (yeşil/kırmızı yok). Yan yana fark ekranı VS Code renklerini korur. Commit ağacı ve dosya listesi kompakt tutulur; geçmiş panelin dibinde durur.
