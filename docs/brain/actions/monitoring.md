---
action: monitoring
purpose: Sürekli sağlık, güvenlik ve performans izleme: açık, eğilim ve servis sağlığı otomatik ölçülür, loglanır, tek issue ile bildirilir
reads: [BRAIN, AUDIT, audit, ci-cd, security-kvkk]
writes: [DECISIONS, AGENT]
triggers: ["izleme", "monitor", "sağlık", "health", "servis çalışıyor mu", "performans metrik", "zaafiyet takibi"]
---
# Aksiyon: Sağlık ve güvenlik izleme

`scripts/health-monitor.mjs` (`npm run health`, CI'da `--build`) + `.github/workflows/health-monitor.yml` (her 6 saatte bir ve elle). [[audit]] kod içi sezgisel taramayı, [[ci-cd]] her push'taki kapıları yapar; bu aksiyon **zamana yayılan** izlemedir.

## Ne ölçer
| Alan | Ölçüm | Alarm / uyarı |
|---|---|---|
| Güvenlik | `npm audit` (tümü + yalnız çalışma zamanı), statik denetim (`audit-scan --check`) | yüksek/kritik açık veya yeni yüksek statik bulgu = **alarm**; orta = uyarı |
| Performans | Paket boyutu (JS, gzip, CSS), toplam JS büyümesi, `npm run build` süresi | bütçe aşımı veya build hatası = alarm; bütçenin %85'i, önceki ölçüme göre +%10 JS, build > 180 sn = uyarı |
| Servis | GitHub API, Open VSX (eklenti mağazası), electronjs.org dizini, isteğe bağlı senkron sunucusu (`NOVA_SYNC_HEALTH_URL`), son release'te `latest.yml` + Win/mac/Linux paketi | ilk başarısızlık uyarı, **art arda ikincisi alarm** (geçici kesinti gürültü yapmasın); eksik release varlığı = alarm; yanıt > 4 sn = uyarı |
| Bakım | Bir major geride çalışma zamanı paketi (> 5), 60 günü aşan son sürüm | yalnız bilgi |

## Çıktı ve kayıt
- `health-out/report.json` (tam) ve `report.md` (özet): Actions özeti + `health-report` artifact'ı (30 gün). Eğilim için son 60 ölçüm `actions/cache` içinde `history.json` olarak tutulur.
- Bulgu varsa **tek** issue (`health-monitor` etiketi, "Sağlık izleme: açık bulgular"). Bulgu kümesi (parmak izi) değişmedikçe yorum eklenmez; değişince güncellenir; hepsi düzelince kendiliğinden kapanır. Kırık CI için ayrı mekanizma: `ci-failure-issue.yml`.
- Dış bildirim (e-posta/Slack) yok: GitHub issue bildirimi yeterli; ek kanal eklenirse KVKK etkisi [[security-kvkk]]'ya yazılır.

## Açık vermeme kuralları (repo public)
- Issue ve günlükte zaafiyet ayrıntısı yok: statik bulguda dosya:satır yazılmaz, yalnız "yeni yüksek bulgu" denir; ayrıntı yerelde `npm run audit` ile.
- `NOVA_SYNC_HEALTH_URL` adresi hiçbir çıktıya yazılmaz. Sır, token, kullanıcı verisi toplanmaz; yalnız yanıt süresi ve durum.
- Workflow izinleri en az: `contents: read`, `issues: write`; üçüncü parti action'lar SHA ile sabit.
- Gerçek bir açık görülürse issue'da tartışılmaz; `SECURITY.md` kanalı kullanılır.

## KVKK
Kişisel veri işlenmez. Giden istekler yalnız public uç noktalara gider (GitHub, Open VSX, electronjs.org; sunucu GitHub Actions'ta, ABD). İsteğe bağlı senkron sunucusu kendi sunucundadır. Saklama: artifact 30 gün, cache geçmişi en çok 60 ölçüm.

## Ayarlar ve eşikler
Bütçe: `MAX_JS_KB`, `MAX_CSS_KB`, `MAX_GZIP_JS_KB` ([[ci-cd]] ile aynı). Diğer eşikler `scripts/health-monitor.mjs` başındaki sabitler. Kapatmak: workflow'u devre dışı bırak. Elle çalıştır: Actions → "Sağlık ve güvenlik izleme" → Run workflow, ya da `npm run health -- --build`.

## Sürekli iyileştirme döngüsü
1. Alarm/uyarı issue'su gelir → ilgili alan: güvenlik ise önce düzelt; performans ise [[audit]] derin tarama + paket bölme/tembel yükleme.
2. Düzeltme PR'ı birleşince sonraki ölçümde issue kapanır.
3. Bilinçli kabul edilen eşik aşımı için neden [[DECISIONS]]'a yazılır, sonra eşik güncellenir.
