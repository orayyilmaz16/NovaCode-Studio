#!/usr/bin/env bash
# NovaCode senkron sunucusu kurulumu (Ubuntu/Debian, root veya sudo yetkili kullanıcı).
#   ./install.sh                 → token üretir, <ip>.sslip.io ile TLS alır, başlatır
#   SYNC_HOST=sync.alanadin.com ./install.sh   → kendi alan adınla (DNS A kaydı önce bu sunucuya yönlenmeli)
# Token yalnızca bu sunucuda .env (izin 600) içinde durur; ekrana basılmaz.
set -euo pipefail
cd "$(dirname "$0")"

command -v docker >/dev/null || { echo "Docker kuruluyor…"; curl -fsSL https://get.docker.com | sh; }
docker compose version >/dev/null 2>&1 || { echo "HATA: 'docker compose' eklentisi yok (docker-compose-plugin kur)."; exit 1; }

if [ ! -f .env ]; then
  umask 077
  token="$(openssl rand -hex 32)"
  host="${SYNC_HOST:-}"
  if [ -z "$host" ]; then
    ip="$(curl -4fsS https://api.ipify.org || true)"
    [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "HATA: Genel IP bulunamadı; SYNC_HOST=<alan adı> ile yeniden dene."; exit 1; }
    host="${ip//./-}.sslip.io"
  fi
  printf 'NOVA_SYNC_TOKEN=%s\nSYNC_HOST=%s\n' "$token" "$host" > .env
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
host="$(grep '^SYNC_HOST=' .env | cut -d= -f2-)"
echo
echo "Kurulum tamam. İlk sertifika 10-60 sn içinde alınır."
echo "NovaCode > İşbirliği ayarları:"
echo "  Adres : wss://${host}"
echo "  Token : $(pwd)/.env dosyasındaki NOVA_SYNC_TOKEN değeri (cat .env)"
echo "Sağlık adresi (GitHub secret NOVA_SYNC_HEALTH_URL): https://${host}/"
echo "Kontrol: curl -fsS https://${host}/   → 'NovaCode sync server'"
