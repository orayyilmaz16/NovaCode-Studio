---
action: ci-cd
purpose: GitHub Actions, audit, bundle bütçesi ve yayın hattı
reads: [CLAUDE, AGENT, STATE, release]
writes: [AGENT, DECISIONS, CHANGELOG]
triggers: ["ci", "actions", "workflow", "audit", "pipeline", "deploy"]
---
# Aksiyon: CI/CD

## Hat
`.github/workflows/ci-cd.yml`: `quality` (hijyen, tsc, git testleri, beyin kontrolü, audit, build, bundle bütçesi) → `version` (sürüm, etiket, push; `concurrency: release-version`, push yarışında rebase + yeniden deneme) → `release-desktop` (Windows `.exe` + GitHub Release).
`.github/workflows/security.yml`: CodeQL, gitleaks, dependency review, haftalık `npm audit`. Güncel iş listesi: [[STATE]].

## Kurallar
- Çalışma zamanı bağımlılıkları `npm audit --omit=dev --audit-level=moderate`, tümü `--audit-level=high`. Yalnız dev araç zincirini etkileyen `moderate` bulgu kabul edilir ([[DECISIONS]]).
- Tüm işlerde `timeout-minutes` var; PR koşuları `cancel-in-progress`.
- `chore(auto)` commit'leri patch sürüm alır; `docs/ci/test` sürüm çıkarmaz. Elle yükseltilmiş sürüm: [[release]].
- Döngü koruması: aynı hata iki kez tekrarlanırsa dur ve raporla ([[AGENT]] §8).
- CI yeşil olmadan "yayında" denmez.

## Sorun giderme
1. `gh run list` / `gh run view <id> --log-failed | tail -n 30`.
2. Kökü bul, tek düzeltme yap, doğrula. Üç doğrulama turunu aşma.
3. Karar ve kalıcı ders → [[DECISIONS]].
