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

## Doğrulama (27.11.2026)
Docker (Compose, 29.9) ile uçtan uca denendi (`SYNC_HOST=localhost`, Caddy yerel CA): `sync` konteyneri `healthy`; `https://localhost/` → `NovaCode sync server`; **wss** doğru token bağlandı, yanlış token 401; sunucu portu 1234 host'a açık değil; konteyner günlüklerinde token yok. Test ortamı (konteyner, volume, imaj, `.env`) silindi. **Sınanmayan:** gerçek genel IP + sslip.io ile Let's Encrypt sertifikası (80/443'ün internete açık olmasını ister); ilk gerçek kurulumda `README.md` "Kontrol" adımıyla doğrulanır.

## Bağlantılar
Sağlık izleme: [[monitoring]]. Güvenlik denetimi: [[audit]].
