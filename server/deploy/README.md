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
