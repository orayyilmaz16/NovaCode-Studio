---
action: security-kvkk
purpose: IPC, dosya sistemi, token ve kişisel veriye dokunan her değişikliğin güvenlik ve KVKK kapısı
reads: [CLAUDE, AGENT, PROJECT, SECURITY]
writes: [DECISIONS, CHANGELOG]
triggers: ["ipc", "güvenlik", "kvkk", "token", "kişisel veri", "3. parti"]
---
# Aksiyon: Güvenlik ve KVKK kapısı

## Teknik kurallar (gevşetilmez)
1. `contextIsolation` açık, `nodeIntegration` kapalı, `webSecurity` açık. Renderer'a Node erişimi verilmez.
2. IPC'de gelen her yol/argüman doğrulanır: `isValidPath`, depo içi yol çözümleme (`path.relative`), dal adı `BRANCH_RE`.
3. Kabuk çalıştırma yok: `execFile`/`spawn` + argüman dizisi. Terminal kabuğu kullanıcının kendi komutlarıdır; uygulama komutu kendisi üretmez.
4. Gizli bilgi (token, anahtar, sunucu IP'si) koda, commit'e, loga, çıktıya yazılmaz; yer tutucu `<API_KEY>`. Token yalnız ana süreçte, şifreli.
5. HTML basılan yerde `dompurify`; terminal çıktısı React span'i (HTML yok).
6. Gizli değerler `localStorage`'a yazılmaz; `electron-secrets.cjs` izin listeli anahtarlarla şifreli saklar. Ayar içe aktarma/dışa aktarma gizli değer içermez.
7. Dış ağ: yalnız `github.com`, `api.github.com` (allowlist) ve kullanıcının girdiği `wss://` adresi.

## KVKK sorusu listesi (her yeni veri akışı için yanıtla)
Veri nedir? Amaç? Hukuki sebep? Saklama süresi? Yurt dışına aktarım var mı? Kullanıcı nasıl geri alır/siler?

| Akış | Veri | Amaç / sebep | Saklama | Yurt dışı |
|---|---|---|---|---|
| GitHub girişi | Kullanıcı adı, ad, avatar, erişim token'ı | Kimlik doğrulama, canlı depo durumu / kullanıcının açık işlemi | Cihazda, token şifreli; çıkışta silinir | GitHub (ABD) |
| PR / depo yayınlama | PR başlığı-gövdesi, depo adı, commit'ler | Kullanıcının istediği işlem | GitHub'da | GitHub (ABD) |
| Ortak düzenleme | Dosya içeriği | Kullanıcının ayarladığı sunucuya senkron | Kullanıcının sunucusunda | Kullanıcının seçimi |
| Son klasörler | Klasör yolları | Kolay erişim | Yerelde (`userData`) | Yok |
| Ayarlar | Tercihler | Kişiselleştirme | Yerelde (`localStorage`); dışa aktarım kullanıcının dosyası | Yok |
| Ortak düzenleme token'ı | Sunucu token'ı | Kullanıcının sunucusuna kimlik | Yerelde, şifreli (`safeStorage`); düz metin yok | Yok (yalnız kullanıcının sunucusuna gider) |

Analitik/çerez/3. parti servis eklenecekse önce kullanıcıya sor, rıza olmadan yükleme.

## Dosya sistemi IPC kuralları (güncel)
Ana süreçte yazan/silen/taşıyan her işleyici yolu doğrular: `fs:createFile`, `fs:createFolder`, `fs:deleteItem`, `fs:renameItem` yalnız açık çalışma klasörünün **içinde**; `fs:writeFile` çalışma klasörü içinde veya kullanıcının "Dosya Aç" diyaloğuyla seçtiği dosyalarda; taşıma/yeniden adlandırma hedefin üzerine yazmaz. Yeni dosya IPC'si eklerken `insideWorkspace()` / `writable()` kullan. Ayrıntı: [[explorer]].

## Git IPC kuralları (genişletme)
Yeni Git kanalları ref/etiket/SHA/stash indeksini ana süreçte doğrular (`REF_RE`, var olan ref, `-` ile başlayanlar reddedilir); fark okuma çalışma ağacı dosyasını realpath ile depo içinde denetler. Ayrıntı: [[source-control]].

## Dış istek envanteri (güncel)
| Servis | Ne zaman | Ne gider | Not |
|---|---|---|---|
| Hugging Face | Yerleşik model indirme (tek sefer) | Yalnız dosya isteği (IP) | Kullanıcı verisi yok; konak denetimli |
| Open VSX / Eclipse CDN | Eklenti arama/indirme | Arama sözcüğü, IP | Kullanıcı verisi yok; konak denetimli |
| Seçilen AI sağlayıcı (Anthropic/OpenAI/Ollama uzak) | Kullanıcı sohbet gönderince | Mesaj, bağlam kodu | Varsayılan yerleşik: hiçbiri |
| Dikte (OpenAI uyumlu) | Mikrofon kullanılınca ve açık rıza varsa | Ses | Yerel adreste yerelde kalır |
| GitHub (güncelleme) | Güncelleme denetimi / sürüm notları | IP, uygulama sürümü, platform | Kullanıcı isteğiyle veya "açılışta denetle" ayarıyla; kişisel veri yok |
| GitHub | Git/GitHub paneli | Kimlik doğrulama, repo işlemleri | Kullanıcı eylemiyle |
| AI kod tamamlama | Yazarken (ayar açıkken) | İmleç çevresindeki kod → yerel Ollama | 127.0.0.1; `.env`/anahtar dosyaları gönderilmez; saklanmaz |
| Dil sunucusu (LSP) | Python/Rust/Go... dosyası açılınca | Dosya içeriği yerel sunucu sürecine | Yerelde kalır; ağ yok; sunucu yalnız kullanıcının PATH'inden |
| Hata ayıklayıcı / PTY | Kullanıcı başlatınca | Yerel süreç | Yalnız çalışma klasöründe; 127.0.0.1; veri çıkmaz |

## Çıktı
Raporda ayrıca belirt; karar alındıysa [[DECISIONS]]. Güvenlik açığı bildirimi süreci: [[SECURITY]].

## IPC yol kuralları (2026-11)
`fs:readFile` / `fs:readDir` / `fs:readDataUrl` ve git/GitHub depo yolları `withinWorkspace` ile yalnız açık çalışma klasöründe (veya "Dosya Aç" ile onaylanan dosyada) çalışır; yıkıcı işlemler `insideWorkspace` (kök hariç). Önizleme sandbox'ında `allow-same-origin` açılmaz.

## Denetim düzeltmeleri (17.11.2026)
Kaynak: [[BACKLOG]] S-xx. Pencere `sandbox:true`; `will-navigate`/`will-attach-webview` engelli, dış bağlantı yalnız https ve kimlik bilgisiz. fs işleyicileri gerçek yol (symlink/junction) çözer (`electron-paths.cjs`, test `paths.test.cjs`), Windows alternatif veri akışı reddedilir. `secrets:get` yalnız `collabToken` verir, AI anahtarı için `secrets:has` (boolean). Git her çağrıda `core.fsmonitor=false`, `core.pager=cat`, `protocol.ext.allow=never`, ssh için `GIT_SSH_COMMAND`. Debug/LSP alt süreçleri ortam izin listesiyle (`safeEnv`) başlar. Ajan: `.git/` yazma reddi, güvenilir klasör kaydı (`userData/ai-trust.json`), uzak sağlayıcıya ilk gönderimde açık rıza ve ana süreçte anahtar kalıbı temizleme, özel taban adresi onaylı izin listesi. KVKK: `ai-trust.json` (klasör yolları, rıza, adresler) yerel, yurt dışı aktarım yok; rıza/güveni geri alan arayüz henüz yok (açık iş). Ortak düzenleme: oda adı rastgele kimlik + göreli yol özeti, mutlak yol/dosya adı sunucuya gitmez; token `Sec-WebSocket-Protocol` ile. Kalan: CSP geniş (`unsafe-eval`, `https:`; önizleme iframe'i üst CSP'yi miras alır), klasör güven penceresi git hook'ları/LSP için yok, model SHA-256 değerleri boş, whisper ilk kullanımda sabitlenir.

## Denetim düzeltmeleri, ikinci dalga (17.11.2026)
**Çalışma klasörü güveni** (`electron-trust.cjs`, `ai-trust.json` deposu): güvenilmeyen klasör kısıtlı modda açılır: LSP ve hata ayıklayıcı başlamaz (`trust-required`), git yalnız okuma komutları (status/log/diff/show…), hook tetikleyen komutlar güven ister, `core.hooksPath` boş dizine, `filter.*` ve `credential.helper` boşaltılır. Pencere: "Güven" / "Kısıtlı modda aç"; durum çubuğunda "Kısıtlı mod" rozeti. Ayarlar > Güven ve rıza: güvenilen klasörler, AI sağlayıcı rızaları, izinli adresler için yalnız **geri alma** (yönetici adına rıza verilmez). IPC: `trust:status|grant|list|revoke`, olay `trust:changed`; `trust:grant` yalnız açık çalışma klasörüne. Entegre terminal kullanıcının kendi kabuğu olduğundan kısıtlanmaz. **Önizleme ayrı köken** (`nova-preview://`, `electron-preview.cjs`): uygulamanın CSP'si `script-src 'self'` (eval ve satır içi betik yok), `connect-src` yalnız `ws:/wss:` (kullanıcının sync sunucusu) ve `self/data/blob`, `frame-src nova-preview: localhost`; önizlenen sayfa kendi gevşek CSP'siyle çalışır, uygulamaya erişemez. Kalan: `style-src 'unsafe-inline'` (React/Monaco), `img-src https:` (eklenti simgeleri). Yerel model indirmeleri SHA-256 ile doğrulanır. **KVKK — yerel geçmiş** (`userData/local-history`): kullanıcının dosya içerikleri, amaç kurtarma, hukuki sebep açık ayar (varsayılan açık, kapatınca silinir), dosya başına 30 sürüm ve klasör başına 150 MB, yurt dışı aktarım yok; gizli içerikli dosyalar da düz metin saklanır, kullanıcı silebilir. Oturum dosyası (sekme yolları, taslaklar) yalnız `localStorage`, ağa gitmez.
