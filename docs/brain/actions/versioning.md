---
action: versioning
purpose: SemVer sürümleme otomasyonu: patch/minor/major kararı, sürüm notları, sürüm geçmişi, etiket ve GitHub Release
reads: [CLAUDE, AGENT, CHANGELOG, release, ci-cd]
writes: [CHANGELOG, VERSIONS, DECISIONS, AGENT]
triggers: ["sürüm", "versiyon", "major", "minor", "patch", "bugfix", "etiket", "tag", "release", "changelog"]
---
# Aksiyon: Sürümleme

**İlke:** sürüm kararı insana bırakılmaz, **belgelenmiş değişiklikten** türer. Her sürüm; `package.json`, [[CHANGELOG]], `release-notes/vX.Y.Z.md`, [[VERSIONS]], `CLAUDE.md`/`AGENT.md` blokları ve GitHub etiketi/Release olarak tek akışta, tutarlı çıkar.

## Düzey kuralı (SemVer)
| Tür | Ne zaman | Etiket | Örnek |
|---|---|---|---|
| **MAJOR** | Geriye uyumsuz değişiklik: ayar/veri biçimi bozulur, özellik kalkar, kullanıcıdan işlem gerekir | `[breaking]` | 1.4.2 → **2.0.0** |
| **MINOR** | Yeni, geriye uyumlu özellik | `[feat]` | 1.4.2 → **1.5.0** |
| **PATCH** | Hata düzeltmesi (bugfix), hız, iyileştirme, güvenlik | `[fix]` `[perf]` `[improve]` `[security]` | 1.4.2 → **1.4.3** |
| yok | Yalnız belge | `[docs]` | sürüm çıkmaz |

- Düzey = **en yüksek** madde türü. Etiketsiz madde `[improve]` (patch) sayılır ve uyarı verir.
- Commit sinyali ek güvenlik ağıdır: `feat!:` / `BREAKING CHANGE:` → MAJOR, `feat:` → MINOR. Otomatik commit'ler `chore(auto)` olduğu için asıl kaynak CHANGELOG etiketleridir.
- `--level minor|major` yalnız **yükseltir**, düşüremez (yanlışlıkla major'u patch'e çevirmesin).
- Madde yoksa sürüm çıkmaz. 0.x kullanılmaz; MAJOR kararını yalnız kullanıcı onaylı kırıcı değişiklik verir ([[DECISIONS]]'a yaz).

## Madde yazma (CLAUDE.md kuralının ayrıntısı)
```
## Unreleased
### tr
- [fix] **Kaydet düğmesi:** Boş dosyada kayıt hata veriyordu, düzeltildi.
### en
- [fix] **Save button:** Saving an empty file failed; fixed.
```
TR ve EN **aynı sırada, aynı etiketle**; sayı farklıysa uyarı. Metin kullanıcı diliyle, sade, abartısız. İç yapıyı (dosya adı, fonksiyon) değil kullanıcıya etkisini yaz. 8 dil arayüz metni kuralı ayrıdır ([[i18n]]).

## Otomasyon zinciri
| Adım | Nerede | Ne yapar |
|---|---|---|
| 1. Hatırlatma | `UserPromptSubmit` hook | Belgeleme ve madde yazma kuralını bağlama ekler ([[doc-sync]]) |
| 2. Denetim | `Stop` → `doc-sync.mjs stop` | Kod var, belge yok → tur bir kez engellenir |
| 3. **Sürüm hazırlığı** | `Stop` → `release.mjs prepare` | Düzeyi hesaplar; `package.json`+lock, `CHANGELOG.md` (kategorili yeni bölüm + boş Unreleased), `release-notes/vX.Y.Z.md` (TR+EN), [[VERSIONS]] satırı, `CLAUDE.md` sürüm bloğu, `AGENT.md` "Son sürüm" bloğu |
| 4. Commit + PR | `Stop` → `auto-commit.mjs` | `auto/*` dalı, PR, auto-merge |
| 5. Doğrulama | CI `quality` | `check-version.mjs` (sürüm ↔ lock ↔ notlar ↔ etiket), tsc, build, bütçe |
| 6. **Etiket** | CI `version` (main push) | `release.mjs tag`: etiket yoksa ve notlar varsa **açıklamalı etiket** `vX.Y.Z` |
| 7. **GitHub Release** | CI `release-desktop` | `.exe` + `latest.yml`, gövde = `release-notes/vX.Y.Z.md` |

**Neden sürüm yerelde (PR'da) hazırlanır?** `main` korumalı (PR + zorunlu kontrol). Eski akışta CI botu `chore(release)` commit'ini main'e atamıyor ("Changes must be made through a pull request"), etiketi ise yerel commit'e atıyordu; sonuç: v1.2.0/v1.3.0 etiketleri main geçmişinde değildir, `git describe` yanlış taban buluyor, sürümler takılıyordu (1.3.0'dan beri). Yeni akışta CI **commit atmaz**; yalnız etiket atar (etiket push'u kurala takılmaz). Taban etiket `git describe` ile değil, **en yüksek SemVer etiketi**yle bulunur (ata olması gerekmez).

## Bekleyen sürüm
`package.json` sürümü son etiketten büyükse sürüm **hazır ama etiketsiz** demektir (PR birleşmedi). Bu durumda yeni maddeler Unreleased'te bekler, ikinci bir sürüm bindirilmez; etiket atılınca bir sonraki sürüme girer (test: `release.test.cjs`).

## Komutlar
```
node scripts/release.mjs plan                 # ne olurdu? (değiştirmez)
node scripts/release.mjs prepare [--level L]  # sürümü hazırla (Stop hook yapar)
node scripts/release.mjs tag                  # CI: etiket kararı
node scripts/release.mjs history              # VERSIONS.md'de eksik etiket satırlarını tamamla
node scripts/check-version.mjs                # tutarlılık denetimi
```
Kapatmak: `NOVA_RELEASE=off` (yalnız sürüm hazırlığı), `NOVA_DOCSYNC=off` (tüm zincir).

## Geri alma ve hatalar
- Yanlış sürüm hazırlandı, PR henüz birleşmedi: `release-notes/vX.Y.Z.md`'yi sil, `package.json`/lock/`CHANGELOG`'u önceki commit'ten geri al (`git revert`/`git checkout <sha> -- <dosya>`), sonra `prepare --level ...` ile yeniden.
- Etiket atıldı ama Release yok: Actions → `release-desktop` yeniden çalıştır. Etiketi **silme/yeniden yazma** yok (`--force` yasak); düzeltme yeni patch sürümüdür.
- `check-version` hatası "release-notes yok": `node scripts/release.mjs prepare` çalıştır.

## Doğrulama
`node scripts/tests/release.test.cjs` (düzey kuralları, çıktılar, bekleyen sürüm, etiket kararı, ata olmayan etiket), `node scripts/check-version.mjs`, `npm run brain:check`.

## Bulutta otomatik sürüm hazırlığı (25.11.2026)
- `.github/workflows/auto-release.yml`: main'e `package.json`/lock/CHANGELOG değişikliği girince ve günde bir (05:17 UTC) çalışır. Önce `scripts/dep-changelog.mjs`: son etiketten beri Electron yığını (`electron`, `electron-builder`, `@electron/*`) veya çalışma zamanı `dependencies` yükseldiyse ve Unreleased boşsa tr+en maddesi ekler (`[security]` Electron, `[improve]` diğerleri; yalnız geliştirme araçları sürüm çıkarmaz). Sonra `release.mjs plan` → `prepare` → `auto/release-vX.Y.Z` dalı + PR (`chore(auto): release vX.Y.Z`) + ci-cd.yml elle tetiklenir (GITHUB_TOKEN PR'ında CI kendiliğinden başlamaz) + auto-merge.
- PR başlığı `chore(release)` ile BAŞLAMAMALI: ci-cd.yml `version` işi o önekli commit'te etiket atmaz.
- **Bir kez gerekli ayar:** Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests". Kapalıyken iş "PR oluşturulamadı" uyarısıyla düşer; yerelde Stop hook (`release.mjs prepare`) çalışmaya devam eder.
