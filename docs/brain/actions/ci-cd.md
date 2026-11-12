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

## Güncelleyici için yayın dosyaları
`release-desktop` işi release'e `release/*.exe`, `release/*.blockmap` ve **`release/latest.yml`** yükler; `package.json` → `build.publish` (GitHub) ve `electron:build --publish never` gerekir. `latest.yml` eksikse kurulu uygulamalar güncelleme bulamaz. Ayrıntı: [[updates]].

## Sorun giderme
1. `gh run list` / `gh run view <id> --log-failed | tail -n 30`.
2. Kökü bul, tek düzeltme yap, doğrula. Üç doğrulama turunu aşma.
3. Karar ve kalıcı ders → [[DECISIONS]].

## Otomasyon (2026-11)
- `scripts/auto-commit.mjs` (Stop hook): `auto/*` dalında kalır, `origin/main`'i birleştirir (çakışmada durur), açık PR yoksa açar ve `gh pr merge --auto --squash --delete-branch` ile CI yeşilse birleştirir; kapıları (`check-version`, tsc, `brain --check`) PR gövdesine yazar. `NOVA_AUTO_DRY=1` = kuru çalıştırma. `npm run sync` aynı betik.
- `scripts/check-version.mjs` (`npm run version:check`): semver, lock eşleşmesi, son etiketle karşılaştırma, CHANGELOG Unreleased tr/en, `__APP_VERSION__`, `build.publish`. CI'da "Sürüm denetimi" adımı.
- `ci-failure-issue.yml`: main/auto/* CI hatasında `ci-failure` issue'su açar/günceller, yeşilde kapatır. `dependabot-automerge.yml`: yalnız aynı-major güncellemeleri otomatik birleştirir; major'lar elle.
