#!/usr/bin/env bash
# NovaCode senkron sunucusu durum raporu: portlar, konteynerler, sertifika, metrikler, hatalar.
#   ./status.sh            → özet + uyarılar (çıkış kodu: 0 sağlıklı, 1 uyarı/sorun var)
# Token ve IP'ler ekrana basılmaz (host adı hariç; host'u zaten kendin biliyorsun).
set -uo pipefail
cd "$(dirname "$0")"

[ -f .env ] || { echo "HATA: .env yok; önce ./install.sh çalıştır."; exit 1; }
HOST="$(grep '^SYNC_HOST=' .env | cut -d= -f2-)"
TOKEN="$(grep '^NOVA_SYNC_TOKEN=' .env | cut -d= -f2-)"
PROBLEMS=0
CURL="curl -fsS -m 8${STATUS_INSECURE:+ -k}"   # STATUS_INSECURE=1: yalnız yerel test (self-signed)
ok()   { echo "  ✓ $*"; }
warn() { echo "  ✗ $*"; PROBLEMS=$((PROBLEMS + 1)); }

echo "== Konteynerler =="
for svc in sync caddy; do
  st="$(docker compose ps --format '{{.Service}} {{.Status}}' 2>/dev/null | awk -v s="$svc" '$1==s {$1=""; print substr($0,2)}')"
  case "$st" in
    *healthy*|Up*) ok "$svc: $st" ;;
    "")            warn "$svc: çalışmıyor (docker compose up -d)" ;;
    *)             warn "$svc: $st" ;;
  esac
done

echo "== Portlar =="
listening() { ss -ltnH 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]$1\$"; }
if ! command -v ss >/dev/null 2>&1; then echo "  - ss yok, port dinleme kontrolü atlandı"; else
for p in 80 443; do listening "$p" && ok "$p/tcp dinleniyor" || warn "$p/tcp dinlenmiyor (Caddy çalışmıyor olabilir)"; done
listening 1234 && warn "1234/tcp sunucuda dışa açık görünüyor (olmamalı; yalnız Caddy erişmeli)" || ok "1234/tcp dışa kapalı (doğru)"
fi
if command -v ufw >/dev/null 2>&1; then
  if ufw status 2>/dev/null | grep -q "Status: active"; then
    for p in 80 443; do ufw status | grep -Eq "^$p/tcp.*ALLOW" && ok "ufw: $p/tcp açık" || warn "ufw: $p/tcp kapalı → sudo ufw allow $p/tcp"; done
  else
    echo "  - ufw kurulu ama kapalı; bulut güvenlik grubunda 80 ve 443 (TCP) açık olmalı"
  fi
else
  echo "  - ufw yok; bulut güvenlik grubunda 80 ve 443 (TCP) açık olmalı"
fi

echo "== TLS ve erişim ($HOST) =="
body="$($CURL "https://$HOST/" 2>/dev/null || true)"
[ "$body" = "NovaCode sync server" ] && ok "https://$HOST/ yanıt veriyor (sağlık adresi)" || warn "https://$HOST/ yanıt vermiyor (DNS, 80/443 erişimi veya sertifika)"
end="$(echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
if [ -n "$end" ]; then
  days=$(( ( $(date -d "$end" +%s) - $(date +%s) ) / 86400 ))
  [ "$days" -ge 14 ] && ok "sertifika $days gün geçerli (Caddy otomatik yeniler)" || warn "sertifika $days gün içinde bitiyor (docker compose logs caddy)"
else
  warn "sertifika okunamadı"
fi

echo "== Metrikler =="
metrics="$($CURL -H "Authorization: Bearer $TOKEN" "https://$HOST/metrics" 2>/dev/null || true)"
if [ -z "$metrics" ]; then
  warn "/metrics okunamadı (sunucu eski sürüm olabilir: git pull && docker compose up -d --build)"
else
  m() { echo "$metrics" | awk -v k="$1" '$1==k {print $2}' | head -n1; }
  r() { echo "$metrics" | awk -v k="nova_sync_rejected_total{reason=\"$1\"}" '$1==k {print $2}'; }
  conns="$(m nova_sync_connections)"; cmax="$(m nova_sync_connections_max)"
  rooms="$(m nova_sync_rooms)"; rmax="$(m nova_sync_rooms_max)"
  up="$(m nova_sync_uptime_seconds)"; rss="$(( $(m nova_sync_memory_rss_bytes) / 1048576 ))"
  errs="$(m nova_sync_errors_total)"
  echo "  çalışma süresi : $(( up / 3600 )) sa $(( up % 3600 / 60 )) dk"
  echo "  bağlantı       : $conns / $cmax  (toplam $(m nova_sync_connections_total))"
  echo "  oda            : $rooms / $rmax"
  echo "  mesaj          : $(m nova_sync_messages_total)  ·  alınan $(( $(m nova_sync_received_bytes_total) / 1024 )) KB"
  echo "  bellek (RSS)   : $rss MB / 512 MB"
  echo "  reddedilen     : kimlik $(r auth) · origin $(r origin) · engelli $(r blocked) · limit $(r limit) · bozuk $(r badRequest)"
  echo "  engelli IP     : $(m nova_sync_blocked_ips)"
  [ "$conns" -lt $(( cmax * 8 / 10 )) ] && ok "bağlantı kapasitesi rahat" || warn "bağlantılar kapasitenin %80'ini geçti (NOVA_SYNC_MAX_CONNS)"
  [ "$rooms" -lt $(( rmax * 8 / 10 )) ] && ok "oda kapasitesi rahat" || warn "odalar kapasitenin %80'ini geçti (NOVA_SYNC_MAX_ROOMS)"
  [ "$rss" -lt 400 ] && ok "bellek rahat" || warn "bellek 400 MB üstünde (limit 512 MB; mem_limit artır ya da oda sayısını düşür)"
  [ "${errs:-0}" -eq 0 ] && ok "sunucu hatası yok" || warn "sunucu hata sayacı $errs (docker compose logs sync)"
  [ "$(r auth)" -lt 50 ] || warn "çok sayıda başarısız kimlik denemesi ($(r auth)); saldırı olabilir, token'ı yenilemeyi düşün"
fi

echo "== Son 24 saat günlük hataları =="
for svc in sync caddy; do
  n="$(docker compose logs --since 24h "$svc" 2>/dev/null | grep -Eci 'error|uncaught|unhandled|panic' || true)"
  [ "${n:-0}" -eq 0 ] && ok "$svc: hata satırı yok" || warn "$svc: $n hata satırı (docker compose logs --since 24h $svc | grep -Ei 'error|uncaught')"
done

echo
if [ "$PROBLEMS" -eq 0 ]; then echo "SONUÇ: sağlıklı"; else echo "SONUÇ: $PROBLEMS sorun/uyarı"; fi
[ "$PROBLEMS" -eq 0 ]
