#!/usr/bin/env bash
# Anonimlik denetimi (kurulumdan sonra çalıştır): IP/istek izi bırakan bir şey var mı? Hiçbir şeyi değiştirmez, ekrana IP veya token yazmaz.
set -uo pipefail
cd "$(dirname "$0")"
fail=0
ok()  { echo "ok   $1"; }
bad() { echo "FAIL $1"; fail=1; }

grep -q 'output discard' Caddyfile && ! grep -Eq 'output (stdout|stderr|file)' Caddyfile && ok "Caddy erişim günlüğü kapalı" || bad "Caddy erişim günlüğü açık görünüyor"

# Rastgele bir geçersiz istek at; sonra konteyner günlüklerinde istek izi (yol, IP kalıbı) aranır
host="$(grep '^ANALYTICS_HOST=' .env 2>/dev/null | cut -d= -f2-)"
if [ -n "$host" ]; then
  curl -fsS -o /dev/null "https://${host}/healthz" || bad "healthz yanıt vermiyor"
  sleep 2
  logs="$(docker compose logs --no-color --tail 500 2>&1 || true)"
  if printf '%s' "$logs" | grep -Eq '"?(remote_ip|client_ip|request)"?|GET /healthz|POST /v1/ingest'; then bad "günlükte istek izi bulundu"; else ok "konteyner günlüklerinde istek izi yok"; fi
  if printf '%s' "$logs" | grep -Eq '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' && ! printf '%s' "$logs" | grep -Eq 'caddy.*(version|acme)'; then echo "not günlükte IP biçimli metin var (sürüm numarası olabilir): elle bak"; fi
fi

# Diskteki veri: yalnız tarih adlı toplam dosyaları
files="$(docker compose exec -T analytics sh -c 'ls /data 2>/dev/null' 2>/dev/null || true)"
if [ -z "$files" ] || ! printf '%s\n' "$files" | grep -Evq '^[0-9]{4}-[0-9]{2}-[0-9]{2}\.json$'; then ok "veri dizininde yalnız günlük toplam dosyaları var"; else bad "veri dizininde beklenmeyen dosya var"; fi

# Konteyner güvenliği
docker compose exec -T analytics sh -c 'touch /app/x 2>&1' 2>&1 | grep -qi 'read-only' && ok "uygulama dosya sistemi salt okunur" || bad "dosya sistemi yazılabilir"
[ "$(docker compose exec -T analytics id -u 2>/dev/null | tr -d '\r')" != "0" ] && ok "root olmayan kullanıcı" || bad "root olarak çalışıyor"
perm="$(stat -c '%a' .env 2>/dev/null || echo '?')"; [ "$perm" = "600" ] && ok ".env izni 600" || bad ".env izni $perm (600 olmalı)"

[ "$fail" = 0 ] && echo "Sonuç: anonimlik denetimi geçti." || { echo "Sonuç: düzeltilmesi gereken madde var."; exit 1; }
