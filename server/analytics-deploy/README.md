# NovaCode anonim analitik sunucusu: kurulum

Uygulamadan gelen **kimliksiz, günlük toplu sayaçları** toplar. IP, kullanıcı, cihaz veya içerik kaydı tutmaz. Açıklama ve KVKK: `docs/brain/actions/analytics.md`.

## Gerekenler
- Ubuntu/Debian sunucu (1 vCPU / 512 MB yeter), genel IPv4, **80 ve 443 açık** (bulut güvenlik grubunda da).
- Root ya da sudo. **Önerilen:** kendi alan adın (DNS A kaydı sunucuya). Alan adı yoksa `sslip.io` çalışır ama IP'ni açık eder.
- Senkron sunucusuyla aynı makineye kurma: ikisi de 80/443 kullanır. Ayrı makine ya da ayrı alan adı + tek Caddy gerekir.

## Kurulum
1. `git clone https://github.com/orayyilmaz16/NovaCode-Studio && cd NovaCode-Studio/server/analytics-deploy`
2. `sudo ANALYTICS_HOST=stats.alanadin.com bash install.sh` (token üretir, `.env` 600, başlatır, günlük kapalılığını denetler).
3. `bash verify-anonymity.sh` → tüm satırlar `ok` olmalı.
4. `curl -fsS https://<adres>/healthz` → `{"ok":true}`.

## Uygulamaya bağlama (sunucu hazır olunca)
`electron-analytics.cjs` içindeki `ENDPOINT` sabitine `https://<adres>/v1/ingest` yaz, PR aç, yeni sürüm çıksın. O zamana kadar uygulama hiçbir şey saymaz ve rıza sormaz. Gizli değer yok: `ENDPOINT` herkese açık bir adrestir; token **uygulamada bulunmaz** (yalnız ingest açık, okuma jetonlu).

## Rakamları görme
`ANALYTICS_URL=https://<adres> ANALYTICS_TOKEN=<TOKEN> node scripts/analytics-report.mjs --days 30` (token sunucudaki `.env` içinde: `sudo grep ^ANALYTICS_TOKEN= .env`). Token'ı sohbete, commit'e, e-postaya yazma; sızdıysa `.env`'de değiştirip `docker compose up -d` yap.

## Anonimlik nasıl sağlanır (denetlenebilir)
| Katman | Ne yapar | Nerede |
|---|---|---|
| İstemci | Kimlik üretmez; yük 5 alanla sınırlı; rızasız saymaz | `electron-analytics.cjs` |
| Sunucu | Fazladan alanı reddeder; yalnız günlük toplam yazar; sürüm/OS/dil/olay ayrı ayrı sayılır (kombinasyon yok) | `server/analytics-server.mjs` |
| Hız sınırı | IP yalnız bellekte, saatlik dönen rastgele anahtarlı özet olarak; diske çıkmaz | `createServer` |
| Vekil | Erişim günlüğü `output discard`; yalnız 3 yol açık | `Caddyfile` |
| Konteyner | Salt-okunur dosya sistemi, root değil, `cap_drop: ALL`, günlük 1 MB | `docker-compose.yml` |
| Doğrulama | `verify-anonymity.sh` kurulumdan sonra; CI testi Caddyfile'ın günlüksüz kaldığını denetler | `analytics.test.cjs` |

## Bakım
- Güncelleme: `git pull && sudo docker compose up -d --build`.
- Yedek: günlük toplam dosyaları `analytics_data` biriminde (kişisel veri yok; kaybedilirse yalnız geçmiş istatistik gider).
- Saklama: 400 günden eski günlük dosyalar otomatik silinir. Hepsini silmek: `docker compose down -v` (sertifikalar da gider).
- Hata ayıklama için erişim günlüğünü **açma**; gerekirse geçici olarak yerelde dene, canlıda açma.

## Portlar
| Port | Ne için |
|---|---|
| 443/tcp | uygulama gönderimi ve rapor okuma |
| 80/tcp | Let's Encrypt doğrulaması ve HTTPS yönlendirme |
| 22/tcp | SSH (mümkünse yalnız kendi IP'n) |
