# NovaCode senkron sunucusu: kurulum (TLS + wss, alan adı gerekmez)

Gerçek zamanlı ortak düzenleme için kendi sunucunda çalışır. Uygulama `wss://` ister; bu paket Caddy ile otomatik HTTPS/WSS kurar.
Alan adın yoksa `<ip-tireli>.sslip.io` kullanılır (ücretsiz, gerçek Let's Encrypt sertifikası).

## Gerekenler
- Ubuntu/Debian sunucu (1 vCPU / 1 GB yeter), genel IPv4, **80 ve 443 portları açık** (bulut güvenlik grubunda da).
- Root ya da sudo yetkisi.

## Kurulum (3 adım)
1. Depoyu sunucuya al: `git clone https://github.com/orayyilmaz16/NovaCode-Studio && cd NovaCode-Studio/server/deploy`
2. `sudo ./install.sh` (Docker yoksa kurar, güçlü token üretir, `.env` yazar (izin 600), başlatır, adresi söyler).
   Kendi alan adınla: önce DNS A kaydını sunucu IP'sine yönlendir, sonra `sudo SYNC_HOST=sync.alanadin.com ./install.sh`.
3. Kontrol: `curl -fsS https://<adres>/` → `NovaCode sync server`.

## Uygulamada kullanım
- NovaCode → İşbirliği ayarları: **Adres** `wss://<adres>`, **Token** `.env` içindeki `NOVA_SYNC_TOKEN` (sunucuda `sudo grep NOVA_SYNC_TOKEN .env`).
- Token'ı yalnız ekibine güvenli kanaldan ver; sohbete, e-postaya, commit'e yazma. Sızdıysa: `.env`'deki değeri `openssl rand -hex 32` ile değiştir, `docker compose up -d`; herkes yeni token'ı girer.

## İzleme (sağlık servisi)
Depoda GitHub secret olarak sağlık adresini tanımla (komut istemine `https://<adres>/` yapıştır):
`gh secret set NOVA_SYNC_HEALTH_URL` → `health-monitor.yml` her 6 saatte sunucuyu ölçer, düşerse tek issue açar ([[monitoring]]).
Sunucuda: `docker compose ps` (sağlık durumu), `docker compose logs -f --tail 100`.

## Güvenlik
- Sunucu portu dışarı açık değildir, yalnız Caddy (80/443) erişir. Konteynerler root değil, salt-okunur, `cap_drop: ALL`.
- Token zorunlu, zaman-sabit karşılaştırma, hız sınırı ve IP başına bağlantı sınırı sunucuda hazır (`server/sync-server.mjs`).
- Veri yalnız bellektedir: son kullanıcı ayrılınca oda silinir, diske yazılmaz, yedek gerekmez.
- **sslip.io notu:** adres IP'ni içerir ve sertifika şeffaflık kayıtlarında herkese açık görünür. Kalıcı kullanım için kendi alan adın önerilir.
- Güncelleme: `git pull && sudo docker compose up -d --build`.

## KVKK
Sunucu kullanıcıların düzenlediği kod içeriğini bellekte aktarır; veri sorumlusu sunucuyu işleten sensin. Amaç: ortak düzenleme (açık ayar/davranış), saklama: oturum süresi (kalıcı kayıt yok), yurt dışı aktarım: sunucu konumuna bağlı (yurt dışındaysa aydınlatma metnine yaz). Erişim günlüğünde IP geçer (Caddy, 10 MB × 3 döner); token günlüğe yazılmaz.

## Portlar (açman gerekenler)
| Port | Yön | Ne için | Nerede aç |
|---|---|---|---|
| **443/tcp** | dışarıdan içeri | wss + https (uygulama ve sağlık adresi) | bulut güvenlik grubu **ve** sunucu güvenlik duvarı |
| **80/tcp** | dışarıdan içeri | Let's Encrypt sertifika doğrulaması ve yenileme (HTTPS'e yönlendirir) | aynısı |
| 22/tcp | dışarıdan içeri | SSH (zaten açık; mümkünse yalnız kendi IP'ne) | — |
| 1234 | — | sunucu iç ağda; **açma** | açık görünürse `status.sh` uyarır |

Sunucuda (ufw kullanıyorsan): `sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable`
(`install.sh`, ufw zaten **aktifse** 80/443'ü kendisi ekler; kapalıysa SSH'ı kilitlememek için açmaz.)
Bulut sağlayıcıda (Hetzner/AWS/DigitalOcean/Azure…): firewall / security group kuralına **TCP 80 ve 443, kaynak 0.0.0.0/0** ekle. Bu adım sunucunun dışında olduğu için betik yapamaz.

## Metrik ve hata izleme
- **Anlık özet:** sunucuda `./status.sh` → konteyner sağlığı, port durumu, TLS sertifikası, bağlantı/oda/bellek, reddedilen bağlantı nedenleri, son 24 saatin hata satırları; sorun varsa çıkış kodu 1 ve `✗` satırları.
- **Ham metrikler:** `GET https://<adres>/metrics` (Prometheus metni), yalnız `Authorization: Bearer <token>` ile; token'sız 401. Örnek: `curl -fsS -H "Authorization: Bearer $(grep ^NOVA_SYNC_TOKEN .env | cut -d= -f2)" https://<adres>/metrics`.
  Ölçüler: `nova_sync_connections`, `_rooms`, `_connections_total`, `_messages_total`, `_received_bytes_total`, `_errors_total`, `_rejected_total{reason=auth|origin|blocked|limit|badRequest}`, `_blocked_ips`, `_uptime_seconds`, `_memory_rss_bytes`. IP, oda adı, token, içerik **yoktur**.
- **Dışarıdan sürekli kontrol:** `NOVA_SYNC_HEALTH_URL` secret'ı (bkz. İzleme) → GitHub Actions her 6 saatte sunucunun ayakta olduğunu ölçer, düşerse issue açar.
- **Sürekli grafik istersen (isteğe bağlı):** Prometheus/Grafana'da `/metrics`'i `bearer_token_file` ile çek; ayrı kurulum gerekir, pakete dahil değil.
- **Alarm eşikleri (`status.sh`):** bağlantı/oda kapasitenin %80'i, bellek 400 MB (limit 512), sunucu hatası > 0, başarısız kimlik denemesi ≥ 50 (saldırı işareti), sertifika < 14 gün.
