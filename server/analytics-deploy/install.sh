#!/usr/bin/env bash
# NovaCode anonim analitik sunucusu kurulumu (Ubuntu/Debian, root veya sudo yetkili kullanıcı).
#   ./install.sh                                  → <ip>.sslip.io ile TLS (alan adı yoksa)
#   ANALYTICS_HOST=stats.alanadin.com ./install.sh → kendi alan adınla (DNS A kaydı önce bu sunucuya yönlenmeli; önerilen)
# Token yalnızca bu sunucuda .env (izin 600) içinde durur; ekrana basılmaz. Erişim günlüğü kurulumda kapalıdır ve doğrulanır.
set -euo pipefail
cd "$(dirname "$0")"

command -v docker >/dev/null || { echo "Docker kuruluyor…"; curl -fsSL https://get.docker.com | sh; }
docker compose version >/dev/null 2>&1 || { echo "HATA: 'docker compose' eklentisi yok (docker-compose-plugin kur)."; exit 1; }

# Anonimlik koruması: Caddy günlüğü kapalı kalmalı
if ! grep -q 'output discard' Caddyfile || grep -Eq 'output (stdout|stderr|file)' Caddyfile; then
  echo "HATA: Caddyfile erişim günlüğünü kapatmıyor ('output discard' olmalı). Anonimlik için kurulum durduruldu."; exit 1
fi

if [ ! -f .env ]; then
  umask 077
  token="$(openssl rand -hex 32)"
  host="${ANALYTICS_HOST:-}"
  if [ -z "$host" ]; then
    ip="$(curl -4fsS https://api.ipify.org || true)"
    [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "HATA: Genel IP bulunamadı; ANALYTICS_HOST=<alan adı> ile yeniden dene."; exit 1; }
    host="${ip//./-}.sslip.io"
    echo "UYARI: sslip.io adresi IP'ni içerir ve sertifika kayıtlarında herkese açıktır; kalıcı kullanım için kendi alan adını kullan."
  fi
  printf 'ANALYTICS_TOKEN=%s\nANALYTICS_HOST=%s\n' "$token" "$host" > .env
  chmod 600 .env
  echo ".env oluşturuldu (izin 600)."
else
  echo ".env zaten var, değiştirilmedi."
fi

# Güvenlik duvarı: yalnız 22, 80, 443 (ufw varsa)
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null
fi

docker compose up -d --build
host="$(grep '^ANALYTICS_HOST=' .env | cut -d= -f2-)"
echo
echo "Kurulum tamam. İlk sertifika 10-60 sn içinde alınır."
echo "1) Kontrol           : curl -fsS https://${host}/healthz   → {\"ok\":true}"
echo "2) Uygulama adresi   : https://${host}/v1/ingest   (electron-analytics.cjs ENDPOINT sabitine yaz)"
echo "3) Rakamları görmek  : ANALYTICS_URL=https://${host} ANALYTICS_TOKEN=\$(grep ^ANALYTICS_TOKEN= $(pwd)/.env | cut -d= -f2-) node scripts/analytics-report.mjs"
echo "Anonimlik denetimi    : ./verify-anonymity.sh"
