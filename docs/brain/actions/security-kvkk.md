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
6. Dış ağ: yalnız `github.com`, `api.github.com` (allowlist) ve kullanıcının girdiği `wss://` adresi.

## KVKK sorusu listesi (her yeni veri akışı için yanıtla)
Veri nedir? Amaç? Hukuki sebep? Saklama süresi? Yurt dışına aktarım var mı? Kullanıcı nasıl geri alır/siler?

| Akış | Veri | Amaç / sebep | Saklama | Yurt dışı |
|---|---|---|---|---|
| GitHub girişi | Kullanıcı adı, ad, avatar, erişim token'ı | Kimlik doğrulama, canlı depo durumu / kullanıcının açık işlemi | Cihazda, token şifreli; çıkışta silinir | GitHub (ABD) |
| PR / depo yayınlama | PR başlığı-gövdesi, depo adı, commit'ler | Kullanıcının istediği işlem | GitHub'da | GitHub (ABD) |
| Ortak düzenleme | Dosya içeriği | Kullanıcının ayarladığı sunucuya senkron | Kullanıcının sunucusunda | Kullanıcının seçimi |
| Son klasörler | Klasör yolları | Kolay erişim | Yerelde (`userData`) | Yok |

Analitik/çerez/3. parti servis eklenecekse önce kullanıcıya sor, rıza olmadan yükleme.

## Çıktı
Raporda ayrıca belirt; karar alındıysa [[DECISIONS]]. Güvenlik açığı bildirimi süreci: [[SECURITY]].
