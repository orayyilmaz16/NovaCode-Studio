# Docker (otomatik üretilir)

> Bu dosya `scripts/docker-docs.mjs` ile Dockerfile ve compose dosyalarından üretilir; elle düzenleme. `npm run brain` yeniler, `.github/workflows/docker.yml` main'de eskirse düzeltme PR'ı açar.

## İmajlar

| Servis | İmaj (GHCR) | Taban | Port | Kullanıcı | Sağlık | Bellek | PID |
|---|---|---|---|---|---|---|---|
| Senkron sunucusu (Yjs) | `ghcr.io/orayyilmaz16/novacode-sync` | `node:24-alpine` | 1234 | `node` | `http://127.0.0.1:1234/` | 512m | 256 |
| Anonim analitik toplayıcı | `ghcr.io/orayyilmaz16/novacode-analytics` | `node:24-alpine` | 8788 | `node` | `http://127.0.0.1:8788/healthz` | 256m | 128 |

## Sertleştirme ve ortam

- **Senkron sunucusu (Yjs):** salt-okunur kök: evet · `cap_drop: ALL`: evet · ortam değişkenleri: `NOVA_SYNC_TOKEN`, `PORT`, `NOVA_SYNC_TRUST_PROXY`
- **Anonim analitik toplayıcı:** salt-okunur kök: evet · `cap_drop: ALL`: evet · ortam değişkenleri: `ANALYTICS_TOKEN`, `PORT`, `HOST`, `ANALYTICS_DATA`, `RETENTION_DAYS`, `ANALYTICS_TRUST_PROXY`

## Boru hattı (`.github/workflows/docker.yml`)

1. `server/**` değişince (PR ve main) imajlar derlenir.
2. **Duman testi:** imaj salt-okunur, `cap_drop ALL` ile ayağa kaldırılır, Docker sağlık kontrolü `healthy` olmadan hat ilerlemez.
3. **Yayın (yalnız main):** `latest`, `package.json` sürümü ve kısa SHA etiketleriyle GHCR'a gönderilir.
4. **Dağıtım (yalnız main, isteğe bağlı):** sunucu sırları tanımlıysa SSH ile `docker compose pull && up -d` çalışır, sağlık doğrulanır; sır yoksa atlanır.
5. **Belge:** bu dosya eskiyse otomatik PR açılır.

## Dağıtım sırları (Settings → Secrets and variables → Actions)

| Servis | Sır öneki | Gerekli sırlar |
|---|---|---|
| Senkron sunucusu (Yjs) | `DEPLOY_*` | `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_PATH` (sunucudaki depo kökü), isteğe bağlı `DEPLOY_HEALTH_URL` |
| Anonim analitik toplayıcı | `ANALYTICS_DEPLOY_*` | `ANALYTICS_DEPLOY_HOST`, `ANALYTICS_DEPLOY_USER`, `ANALYTICS_DEPLOY_SSH_KEY`, `ANALYTICS_DEPLOY_KNOWN_HOSTS`, `ANALYTICS_DEPLOY_PATH` (sunucudaki depo kökü), isteğe bağlı `ANALYTICS_DEPLOY_HEALTH_URL` |

İkisi de 80/443'ü kullandığı için aynı sunucuya kurulmaz. Sırlar depoya, sohbete veya belgeye yazılmaz; sızarsa yenilenir.

## Yerelde çalıştırma

```
docker build -f server/deploy/Dockerfile -t novacode-sync:local .
docker build -f server/analytics-deploy/Dockerfile -t novacode-analytics:local .
```

Derleme bağlamı depo köküdür; `.dockerignore` allowlist olduğundan yeni dosya gerekirse oraya `!` satırı eklenir.
