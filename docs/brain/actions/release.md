---
action: release
purpose: Değişiklikleri commitle, sürümü belirle, push et, CI'yı izle
reads: [CLAUDE, AGENT, CHANGELOG, ci-cd]
writes: [CHANGELOG, AGENT, DECISIONS]
triggers: ["sürüm yükselt", "commitle", "push et", "release hazırla"]
---
# Aksiyon: Sürüm ve yayın

## Ön koşul
- [[testing]] doğrulaması yeşil (tsc, build, testler).
- `CHANGELOG.md` → `## Unreleased` altında `### tr` ve `### en` maddeleri yazıldı.

## Kurallar
- **Otomatik:** her Claude turu sonunda hook `chore(auto)` commit'ini `auto/<zaman>` dalına gönderir, PR açar; CI yeşilse birleşir. CI patch sürüm hesaplar. Ayrıntı: [[AGENT]] §3.
- **Bilinçli sürüm (minor/major):** `npm version <minor|major> --no-git-tag-version` → `package.json` sürümü son `vX.Y.Z` etiketinden büyük olur; CI onu olduğu gibi yayınlar ve etiketler. Nedenini [[DECISIONS]] içine yaz.
- Elle commit gerekirse: belirli dosyalar (`git add <dosya>`), asla körlemesine `-A`; `.env`, `dist/`, `release/` girmez. Mesaj: Conventional Commits, ≤72 karakter, emir kipi.
- `--force`, `reset --hard` yasak. Geri dönüş: `git revert <sha>`.

## Adımlar
1. `git status --short` ve `git diff --stat` ile değişikliği gör.
2. Türü belirle: `fix/perf/refactor` patch, `feat` minor (bilinçli), `feat!` major, yalnız `docs/ci/test` sürüm çıkarmaz.
3. Taslağı göster (sürüm, commit mesajı, dosyalar); elle akışta onay bekle.
4. Commit + push; CI'yı izle. Yeşil olmadan "yayında" deme.

## Çıktı
`CHANGELOG.md` Unreleased, [[AGENT]] **Durum** (tarihli, ≤10 satır), gerekirse [[DECISIONS]].
