---
name: nova-release
description: NovaCode Studio sürümleme ve yayın becerisi. Değişikliğin patch/minor/major düzeyini hesaplar, sürüm notlarını (CHANGELOG TR+EN, release-notes, VERSIONS) hazırlar, etiket ve GitHub Release akışını izler. "sürüm", "versiyon", "major/minor/patch", "bugfix", "changelog", "release", "etiket", "tag", "commitle", "push et" denince kullan.
---

# nova-release

Amaç: değişiklikten **otomatik, tutarlı** sürüm üretmek. Sürüm düzeyini insan tahmini değil, CHANGELOG madde etiketleri belirler. Tam kural: `docs/brain/actions/versioning.md`.

## Neyi otomatik yapar (sen yazmazsın)
Stop hook, belge tamamsa `node scripts/release.mjs prepare` çalıştırır → `package.json`+lock, `CHANGELOG.md` (kategorili yeni bölüm), `release-notes/vX.Y.Z.md` (TR+EN), `docs/brain/VERSIONS.md`, `CLAUDE.md`/`AGENT.md` sürüm blokları. PR birleşince CI açıklamalı `vX.Y.Z` etiketini atar ve GitHub Release çıkarır. **Sen yalnız doğru maddeyi doğru etiketle yazarsın.**

## Adımlar
1. **Değişikliği sınıfla** (her madde bir etiket alır):
   | Etiket | Ne zaman | Sürüm |
   |---|---|---|
   | `[breaking]` | Geriye uyumsuz: ayar/veri bozulur, özellik kalkar | MAJOR |
   | `[feat]` | Yeni özellik | MINOR |
   | `[fix]` | Hata düzeltmesi (bugfix) | PATCH |
   | `[perf]` `[improve]` `[security]` | Hız, iyileştirme, güvenlik | PATCH |
   | `[docs]` | Yalnız belge | sürüm yok |
2. **Madde yaz** (`CHANGELOG.md` → `## Unreleased`, TR ve EN, aynı sıra, aynı etiket):
   ```
   ### tr
   - [feat] **Başlık:** kullanıcıya etkisi, sade.
   ### en
   - [feat] **Title:** user-facing effect, plain.
   ```
3. **Önizle:** `node scripts/release.mjs plan` → `current → next`, düzey, uyarılar (etiketsiz madde, TR/EN sayı farkı).
4. **Doğrula:** `npx tsc --noEmit`, `npm run build --silent`, `npm test --silent`, `node scripts/check-version.mjs`.
5. **Bitir:** turu normal bitir; Stop hook sürümü hazırlar, commit + PR açar. `release.mjs prepare` çıktısı `docs/brain/LOG.md` durum satırında görünür.
6. **İzle:** PR yeşil → birleşir → CI `version` etiketi atar → `release-desktop` Release çıkarır. `gh run list` ile bak. **Yeşil olmadan "yayında" deme.**

## Özel durumlar
- **Düzeyi zorlamak:** `node scripts/release.mjs prepare --level minor|major` (yalnız yükseltir). MAJOR için kullanıcı onayı al ve `DECISIONS.md`'ye gerekçe yaz.
- **Bekleyen sürüm:** `plan` "pending" derse (hazır ama etiketsiz) yeni maddeler Unreleased'te bekler; PR birleşip etiket atılınca sonraki sürüme girer. Ek işlem yok.
- **`check-version` "release-notes yok":** `node scripts/release.mjs prepare`.
- **Etiket/Release düzeltme:** etiket silinmez, `--force` yok; düzeltme = yeni PATCH sürümü. Release atlanmışsa Actions'ta `release-desktop` yeniden çalıştırılır.
- **Elle commit gerekirse:** `git add <belirli dosyalar>` (asla körlemesine `-A`; `.env`, `dist/`, `release/` hariç), Conventional Commits (`fix:`, `feat:`, `feat!:`), ≤72 karakter, emir kipi, İngilizce. Push/force-push, tag silme onaysız yapılmaz.

## Kurallar
- main korumalıdır: CI **commit atmaz**, yalnız etiket atar. Sürüm dosyalarını elle düzenleme; `release.mjs` yazar.
- `VERSIONS.md`, `LOG.md`, `STATE.md` ve `CLAUDE.md`/`AGENT.md` içindeki `<!-- version/release:start -->` blokları otomatiktir; elle yazma.
- Belgeler Türkçe, commit mesajları İngilizce; sürüm notu TR + EN birlikte.
