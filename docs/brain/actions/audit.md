---
action: audit
purpose: Sürekli denetim: güvenlik açıkları, performans kayıpları, hatalar, arayüz ve özellik eksikleri
reads: [BRAIN, AUDIT, BACKLOG, security-kvkk]
writes: [BACKLOG, DECISIONS, AGENT]
triggers: ["denetim", "tara", "zaafiyet", "güvenlik açığı", "performans", "bugfix", "audit"]
---
# Aksiyon: Sürekli denetim

## Üç katman
| Katman | Ne yapar | Ne zaman | Çıktı |
|---|---|---|---|
| Otomatik sezgisel tarama | `scripts/audit-scan.mjs` (`npm run audit`): webPreferences, eval, ham HTML, `openExternal`, exec enjeksiyonu, TLS, sır benzeri değer, CSP, preload kanal sızıntısı, eager `require`, senkron fs, dinleyici/interval sızıntısı, büyük dosya, boş catch, TODO, `any`, sabit ms, sabit metin, etiketsiz düğme | Her Claude turu sonunda ([[brain-maintenance]] ile aynı yerde, `scripts/auto-commit.mjs`), CI'da her push/PR (`npm run audit:check`) ve `security.yml` içinde haftalık/her push | [[AUDIT]] + `docs/brain/audit-baseline.json` |
| Sürekli izleme | `health-monitor.yml`: açık, eğilim, servis sağlığı, tek issue | Her 6 saatte | [[monitoring]] |
| Bağımlılık ve kod taraması | `npm audit`, CodeQL, gitleaks, dependency review | CI ([[ci-cd]]) | Actions çıktısı |
| Derin (ajan/elle) tarama | Güvenlik, performans, hata/arayüz/özellik için ayrıntılı inceleme; yalnız kodda doğrulanan bulgular | Büyük özellikten sonra veya ayda bir; "denetim yap" denince | [[BACKLOG]] |

## Kurallar
- [[AUDIT]] otomatiktir, elle düzenlenmez. Sezgisel (regex) olduğu için yanlış pozitif olabilir; gerçek ve doğrulanmış bulgu [[BACKLOG]]'a yazılır.
- `audit:check`, **temel çizgiye göre yeni** yüksek/kritik bulgu çıkarsa CI'ı durdurur. Bilinçli kabul edilen bulgu için neden [[DECISIONS]]'a yazılır, sonra `npm run audit` ile temel çizgi güncellenir.
- Bir bulgu giderilince [[BACKLOG]] satırı `Durum: giderildi (tarih, sürüm)` olur; silinmez, ay sonunda arşive düşer.
- Yeni tarama kuralı = `scripts/audit-scan.mjs` içine `rule(...)` satırı; bu dosyadaki tabloyu güncelle.
- Rapor değer/sır içermez, yalnız `dosya:satır` verir. Gerçek üye verisi ile çalışma ([[security-kvkk]]).

## Derin tarama nasıl yapılır
1. Güvenlik: IPC yol doğrulama, komut enjeksiyonu, BrowserWindow ayarları, CSP, preload yüzeyi, token saklama, güncelleme bütünlüğü, VSIX zip-slip, Preview sandbox, sync sunucusu kimlik doğrulaması, AI'ya giden veri (KVKK).
2. Performans: açılış (ana süreç senkron işler, tembel yükleme, paket bölme), kapanış (alt süreç temizliği), editör etkileşimi (her tuşta iş, debounce, gereksiz render), ayarlar (tüm uygulamanın yeniden render olması), dosya ağacı/watcher/arama, bellek sızıntısı.
3. Hata, arayüz, özellik: yarış koşulları, veri kaybı, i18n boşlukları, erişilebilirlik, [[ui-design]] kural ihlalleri, VS Code'a göre eksik özellikler, test boşlukları.
4. Bulguları önem sırasıyla [[BACKLOG]]'a yaz (kimlik, önem, dosya:satır, sorun, çözüm, durum).
