---
action: analytics
purpose: Anonim, rızaya bağlı kullanım sayacı: ne sayılır, ne gönderilir, nerede toplanır, KVKK ve geri alma
reads: [CLAUDE, security-kvkk, settings, i18n, monitoring]
writes: [DECISIONS, CHANGELOG, security-kvkk]
triggers: ["analitik", "analytics", "kullanım istatistiği", "telemetri", "metrik", "sayaç"]
---
# Aksiyon: Anonim kullanım analitiği

Amaç: hangi bölümlerin kullanıldığını **kimseyi tanımadan** görmek (ürün kararı). Varsayılan **kapalı**, açık rıza ile açılır.

## Ne sayılır (izin listesi — tek kaynak `electron-analytics.cjs` `EVENTS`, sunucuda aynısı)
`app_start`, `panel_files`, `panel_search`, `panel_git`, `panel_extensions`, `panel_debug`, `panel_terminal`, `panel_ai`, `panel_settings`, `file_save`, `code_run`. Yeni olay = üç yerde (istemci, sunucu, `src/services/analytics.ts` tipi) + bu tablo + test. İzinli olmayan ad sessizce atılır. Dosya adı, yol, içerik, arama sözcüğü, komut metni **asla** olay olamaz.

## Ne gider
Günde en çok **bir** toplu istek: `{"v":1,"app":"1.9.3","os":"win","lang":"tr","counts":{"panel_git":3}}`. Başka alan yok; sunucu fazladan alanı reddeder. Cihaz/kurulum/oturum kimliği, çerez, tarih, IP kaydı **yok** → kimlik olmadığı için tek tek kullanıcı yeniden tanınamaz; "günlük aktif kullanıcı" yerine "günlük toplu gönderim sayısı" bakılır (yaklaşık, kimliksiz).

## Akış
1. Renderer yalnız olay adını IPC ile yollar (`analytics.track`); **ağ isteği ana süreçten** çıkar (`electron-analytics.cjs`, `net.fetch`, çerezsiz, https, 10 sn).
2. Rıza kapalıyken `track` hiçbir şey saymaz/yazmaz. Sayaçlar `userData/analytics.json` içinde (yalnız rıza açıkken).
3. İlk açılışta (rıza yok, adres yapılandırılmış) 4 sn sonra tek seferlik **rıza penceresi**: varsayılan odak "Paylaşma", Esc = paylaşma; gönderilecek yükün örneği gösterilir. Soru bir kez sorulur (`asked`).
4. Rıza yalnız kullanıcı eyleminden gelir: pencere/ayar anahtarı (`analyticsEnabled`, Ayarlar → Hakkında). **Ayar içe aktarma rıza veremez** (`parseImport` her zaman kapatır); yönetici/başkası adına rıza yok, yalnız geri alma.
5. **Geri alma:** anahtarı kapat → ana süreç kapanır, gönderilmemiş sayaçlar ve rıza zamanı silinir. Sunucuda kişiye bağlı veri olmadığından silinecek kayıt yok.
6. Adres (`ENDPOINT`) boşsa uygulama **hiçbir şey saymaz/göndermez** ve rıza sorulmaz. Web sürümünde (Electron yok) analitik yok.

## Sunucu (`server/analytics-server.mjs`, `npm run analytics:server`)
- `POST /v1/ingest` (katı doğrulama, 2 KB sınır, bellekte hız sınırı), `GET /v1/stats?days=30` (yalnız `Authorization: Bearer $ANALYTICS_TOKEN`, ≥24 karakter), `GET /healthz`.
- Diskte yalnız **günlük toplam** dosyası (`ANALYTICS_DATA/YYYY-MM-DD.json`): sürüm, işletim sistemi, dil ve olay için **ayrı ayrı** marjinal sayılar; kombinasyonları yok. Saklama 400 gün (`RETENTION_DAYS`), sonra silinir.
- IP/başlık/user-agent yazılmaz. **Ters vekilde erişim günlüğü kapalı olmalı** (Caddy: `log` yok / nginx: `access_log off`). TLS vekilde sonlanır; sunucu `127.0.0.1`'e dinler.
- **Kurulum paketi: `server/analytics-deploy/`** (Docker + Caddy, otomatik TLS): `sudo ANALYTICS_HOST=stats.alanadin.com bash install.sh` → token üretir (`.env` 600), Caddy günlüğünün kapalı olduğunu doğrular, başlatır; `bash verify-anonymity.sh` günlük/izin/dosya sistemi denetimini yapar. Ayrıntı: `server/analytics-deploy/README.md`.
- **Anonimlik korumaları (testle kilitli, `analytics.test.cjs`):** Caddy `log { output discard }` ve yalnız `/v1/ingest`, `/v1/stats`, `/healthz` açık; konteyner salt-okunur, root değil, `cap_drop: ALL`, portu dışarı kapalı; hız sınırı IP'yi ham tutmaz (saatlik dönen rastgele anahtarlı özet, yalnız bellek, `ANALYTICS_TRUST_PROXY=1` ile vekilin eklediği son `X-Forwarded-For` girdisi); sunucu istek/IP/başlık yazdırmaz ve diske yazmaz. Yerel Docker testinde (27.11.2026) ingest 204, fazla alan 400, jetonsuz stats 401, diskte yalnız günlük toplam, IP ne diskte ne günlükte, sağlık `healthy`.
- **Uygulamaya bağlama:** sunucu çalışınca `electron-analytics.cjs` `ENDPOINT` sabitine `https://<alan-adı>/v1/ingest` yazılır (gizli değil; token uygulamada yoktur), yeni sürüm çıkar.
- **Rakamlar:** `ANALYTICS_URL=https://<alan-adı> ANALYTICS_TOKEN=<TOKEN> npm run analytics:report -- --days 30` (token yalnız ortam değişkeninden okunur). Sunucu Almanya'daysa yurt dışı aktarım notu [[security-kvkk]]'da.
- Geliştirmede: `NOVA_ANALYTICS_URL=http://127.0.0.1:8788/v1/ingest` (yalnız paketlenmemiş uygulamada geçerli).

## KVKK
| Soru | Yanıt |
|---|---|
| Veri | Sürüm, işletim sistemi (win/mac/linux), arayüz dili, izinli olay sayaçları. Kişisel veri değil (kimlik/IP/içerik yok). |
| Amaç | Ürün geliştirme ve önceliklendirme istatistiği. |
| Hukuki sebep | Veriler anonim olduğundan 6698 sayılı KVKK m.3/1-(ç) ve m.28/1-(a) kapsamında kişisel veri işleme sayılmaz; yine de ihtiyat olarak **açık rıza** (m.5/1, m.3/1-(a)) ile, varsayılan kapalı ve geri alınabilir. |
| Saklama | İstemcide gönderilene kadar (en çok bir gün); sunucuda günlük toplamlar 400 gün. |
| Yurt dışı aktarım | Yalnız sunucunun bulunduğu ülke (Almanya planı); kimliksiz toplu sayı. |
| Geri alma / silme | Ayarlar → Hakkında → anahtarı kapat; birikmiş sayaç silinir. Sunucuda kişiye bağlı kayıt yok. |

### Aydınlatma metni (uygulama içi pencere + bu belge)
Veri sorumlusu: NovaCode Studio. **İşlenen veri:** uygulama sürümü, işletim sistemi, arayüz dili ve hangi bölümlerin kaç kez açıldığına dair toplu sayaçlar; kimlik, IP adresi, dosya adı, klasör yolu veya kod toplanmaz. **Amaç:** ürünü geliştirmek ve önceliklendirmek. **Hukuki sebep:** açık rızan; veriler kimliksiz olduğundan kişisel veri niteliği taşımaz. **Aktarım:** günde en çok bir kez, uygulamanın toplama sunucusuna; üçüncü taraf analitik servisi kullanılmaz. **Saklama:** günlük toplamlar 400 gün. **Haklarını** (KVKK m.11) kullanmak için rızanı Ayarlar → Hakkında bölümünden istediğin an geri alabilirsin; kimliksiz veri olduğundan sunucuda sana ait ayrı bir kayıt bulunmaz.

## Test ve doğrulama
`scripts/tests/analytics.test.cjs`: rıza yokken sayılmaz, izin listesi, yük yalnız 5 alan, günde bir, ağ hatasında korunur, geri almada silinir, adres yokken tamamen kapalı; sunucuda fazla alan/kimlik reddi, hız sınırı, jetonsuz `stats` 401, diskte IP yok. Ayarlar: `analyticsEnabled` (Hakkında). Sözlük: `uiTextComp` (`analytics*`), `uiTextTheme` (`set_/setDesc_analyticsEnabled`).
