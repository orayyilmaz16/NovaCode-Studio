---
action: sync-deploy
purpose: Senkron sunucusunu (Yjs) TLS/wss ile kendi sunucuna kurma paketi: Docker + Caddy, alan adsız sslip.io, token, sağlık izleme
reads: [BRAIN, security-kvkk, monitoring]
writes: [DECISIONS, AGENT]
triggers: ["senkron sunucusu", "sync server", "wss", "tls", "alan adı", "domain", "ortak düzenleme", "işbirliği sunucusu"]
---
# Aksiyon: Senkron sunucusu dağıtımı

Kod: `server/sync-server.mjs` (token zorunlu, hız sınırı, bellek içi odalar). Dağıtım paketi: `server/deploy/` (`install.sh`, `docker-compose.yml`, `Dockerfile`, `Caddyfile`, `.env.example`, `README.md` kullanıcı kılavuzu).

## Şema
```
İstemci (NovaCode)  --wss://<host>-->  Caddy :443 (otomatik Let's Encrypt)  -->  sync :1234 (yalnız iç ağ)
                                        host = alan adı  ya da  <ip-tireli>.sslip.io
GitHub Actions health-monitor  --https://<host>/-->  "NovaCode sync server"  (NOVA_SYNC_HEALTH_URL secret)
```

## Kararlar
- **Alan adsız TLS:** `<ip>.sslip.io` gerçek sertifika alır; uygulama `wss://` zorunlu kıldığı için kendi imzalı sertifika kullanılmaz. Bedel: IP, sertifika şeffaflık kayıtlarında görünür → kalıcı kullanımda alan adı önerilir. Kendi alan adı: `SYNC_HOST=... ./install.sh`.
- **Token:** `openssl rand -hex 32`, yalnız sunucuda `.env` (600). Depoda/sohbette/belgede yer almaz (`server/deploy/.env` gitignore'da). Sızıntıda değiştirilir.
- **Sertleştirme:** sunucu portu yayınlanmaz, konteynerler root dışı + salt-okunur + `cap_drop: ALL`, `NOVA_SYNC_TRUST_PROXY=1` (gerçek IP ile hız sınırı).
- **Veri:** yalnız bellek, diske yazılmaz. KVKK: veri sorumlusu sunucu sahibi; saklama = oturum; yurt dışı aktarım sunucu konumuna bağlı ([[security-kvkk]]).

## Portlar, metrik ve hata izleme (27.11.2026)
- **Portlar:** 443 (wss/https) ve 80 (Let's Encrypt) dışarıdan açık, 1234 kapalı. Bulut güvenlik grubu betikle açılamaz (kullanıcı yapar); `install.sh` ufw'yi yalnız zaten aktifse ayarlar (SSH kilitlenmesin). Tablo: `server/deploy/README.md`.
- **Metrik:** `sync-server.mjs` `GET /metrics` (Prometheus metni, `Authorization: Bearer <token>`, token'sız 401, `no-store`). Yalnız sayaç/ölçü: bağlantı, oda, mesaj, bayt, hata, ret nedenleri (auth/origin/blocked/limit/badRequest), engelli IP sayısı, çalışma süresi, bellek. IP/oda adı/token/içerik yok (testle doğrulanır: `scripts/tests/syncserver.test.cjs`).
- **Hata izleme:** `server/deploy/status.sh` (konteyner, port, TLS süresi, metrik özeti, 24 sa günlük hataları, eşik uyarıları; sorunda çıkış 1). Dışarıdan: `health-monitor.yml` + `NOVA_SYNC_HEALTH_URL` ([[monitoring]]). `/metrics`'in GitHub izleyicisine bağlanması için ayrı bir token secret'ı gerekir; **27.11.2026'da bağlandı:** `health-monitor.yml`, `NOVA_SYNC_HEALTH_URL` ve `NOVA_SYNC_METRICS_TOKEN` secret'ları ikisi de tanımlıysa `/metrics`'i okur (uyarılar: yeniden başlama, yeni hata, başarısız kimlik+engelli ≥ 50, kapasite %80, bellek > 400 MB). `NOVA_SYNC_METRICS_TOKEN`, sunucudaki `NOVA_SYNC_TOKEN` ile **aynı değerdir** (sunucu tek token tanır); secret yalnız Actions'ta tutulur, çıktıya yazılmaz (testle doğrulandı). Tanımsızsa yalnız sağlık adresi ölçülür.

## Doğrulama (27.11.2026)
Docker (Compose, 29.9) ile uçtan uca denendi (`SYNC_HOST=localhost`, Caddy yerel CA): `sync` konteyneri `healthy`; `https://localhost/` → `NovaCode sync server`; **wss** doğru token bağlandı, yanlış token 401; sunucu portu 1234 host'a açık değil; konteyner günlüklerinde token yok. Test ortamı (konteyner, volume, imaj, `.env`) silindi. `/metrics` ve `status.sh` aynı düzende Docker'da denendi (metrikler okundu, ret sayaçları arttı). **Sınanmayan:** gerçek genel IP + sslip.io ile Let's Encrypt sertifikası (80/443'ün internete açık olmasını ister); ilk gerçek kurulumda `README.md` "Kontrol" adımıyla doğrulanır.

## Bağlantılar
Sağlık izleme: [[monitoring]]. Güvenlik denetimi: [[audit]].
