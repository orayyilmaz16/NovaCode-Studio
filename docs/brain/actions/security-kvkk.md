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
| Dil sunucusu (LSP) | Python/Rust/Go... dosyası açılınca | Dosya içeriği yerel sunucu sürecine | Yerelde kalır; ağ yok; sunucu yalnız kullanıcının PATH'inden |
| Hata ayıklayıcı / PTY | Kullanıcı başlatınca | Yerel süreç | Yalnız çalışma klasöründe; 127.0.0.1; veri çıkmaz |

## Çıktı
Raporda ayrıca belirt; karar alındıysa [[DECISIONS]]. Güvenlik açığı bildirimi süreci: [[SECURITY]].

## IPC yol kuralları (2026-11)
`fs:readFile` / `fs:readDir` / `fs:readDataUrl` ve git/GitHub depo yolları `withinWorkspace` ile yalnız açık çalışma klasöründe (veya "Dosya Aç" ile onaylanan dosyada) çalışır; yıkıcı işlemler `insideWorkspace` (kök hariç). Önizleme sandbox'ında `allow-same-origin` açılmaz.
