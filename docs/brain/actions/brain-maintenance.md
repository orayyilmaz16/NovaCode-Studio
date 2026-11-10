---
action: brain-maintenance
purpose: Proje beynini (docs/brain) güncel ve tutarlı tutmak
reads: [BRAIN, AGENT, STATE]
writes: [BRAIN, STATE, DECISIONS, AGENT]
triggers: ["beyin", "md güncelle", "bağlam", "dokümantasyon"]
---
# Aksiyon: Beyin bakımı

## Otomatik
- Her Claude turu sonunda hook (`scripts/auto-commit.mjs`) önce `node scripts/brain.mjs` çalıştırır → [[STATE]] yeniden üretilir ve aynı commit'e girer.
- CI `npm run brain:check` ile yapıyı denetler (bağlantılar, aksiyon başlıkları, IPC, i18n).

## Elle
| Ne değişti | Ne güncellenir |
|---|---|
| Mimari / süreç / veri akışı | [[PROJECT]] |
| Bir karar alındı veya geri alındı | [[DECISIONS]] (yeni kayıt, tarihli) |
| Yeni iş türü | `docs/brain/actions/<ad>.md` + [[BRAIN]] tablosu |
| Kalıcı kural | [[CLAUDE]] / [[AGENT]], sonra ilgili aksiyon |
| Görev bitti | [[AGENT]] **Durum** (tarihli, ≤10 satır, eskileri sil) |

## Aksiyon dosyası şablonu
Baştaki alanlar: `action`, `purpose`, `reads`, `writes`, `triggers`. Gövde: ön koşul, kurallar, adımlar, çıktı. Başka dosyaya çift köşeli parantezli bağlantıyla işaret et; bilgiyi kopyalama.

## Kontrol
`npm run brain:check` — hata varsa düzelt; `npm run brain` — [[STATE]]'i yeniden üret.
