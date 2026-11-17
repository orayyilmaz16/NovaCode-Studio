---
action: release
purpose: Değişiklikleri commitle, sürümü belirle, push et, CI'yı izle
reads: [CLAUDE, AGENT, CHANGELOG, ci-cd, versioning]
writes: [CHANGELOG, AGENT, DECISIONS]
triggers: ["sürüm yükselt", "commitle", "push et", "release hazırla"]
---
# Aksiyon: Sürüm ve yayın

## Ön koşul
- [[testing]] doğrulaması yeşil (tsc, build, testler).
- `CHANGELOG.md` → `## Unreleased` altında `### tr` ve `### en` maddeleri yazıldı.

## Kurallar
- **Otomatik:** her Claude turu sonunda hook `chore(auto)` commit'ini `auto/<zaman>` dalına gönderir, PR açar; CI yeşilse birleşir. CI patch sürüm hesaplar. Ayrıntı: [[AGENT]] §3.
- **Sürüm düzeyi (patch/minor/major)** CHANGELOG maddelerinin etiketinden gelir (`[fix]`, `[feat]`, `[breaking]`…); hazırlığı `scripts/release.mjs prepare` yapar, etiketi PR birleşince CI atar. Ayrıntı: [[versioning]]. Zorlamak: `prepare --level minor|major`. MAJOR kararını [[DECISIONS]] içine yaz.
- Elle commit gerekirse: belirli dosyalar (`git add <dosya>`), asla körlemesine `-A`; `.env`, `dist/`, `release/` girmez. Mesaj: Conventional Commits, ≤72 karakter, emir kipi.
- `--force`, `reset --hard` yasak. Geri dönüş: `git revert <sha>`.

## Adımlar
1. `git status --short` ve `git diff --stat` ile değişikliği gör.
2. Türü belirle: `[fix]/[perf]/[improve]/[security]` patch, `[feat]` minor, `[breaking]` major, yalnız `[docs]` sürüm çıkarmaz. Görmek için `node scripts/release.mjs plan`.
3. Taslağı göster (sürüm, commit mesajı, dosyalar); elle akışta onay bekle.
4. Commit + push; CI'yı izle. Yeşil olmadan "yayında" deme.

## Çıktı
`CHANGELOG.md` Unreleased, [[AGENT]] **Durum** (tarihli, ≤10 satır), gerekirse [[DECISIONS]].
