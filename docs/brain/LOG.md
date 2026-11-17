# Değişiklik günlüğü (otomatik)

`scripts/doc-sync.mjs` her Claude turu sonunda yazar; **elle düzenleme**. Yeniden üretilen [[STATE]] gibi koddan türer, ama yalnız son 40 tur tutulur.
İstem metni kaydedilmez (KVKK/gizli bilgi); yalnız dosya yolları, alanlar ve belge durumu. Kural: [[doc-sync]]. Neden/karar için [[DECISIONS]], kullanıcı notu için [[CHANGELOG]].

## 17.11.2026 16:07 · auto/20261117-125013
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3MvY2ktY2QueW1sLC5n -->
- Alan: [[ci-cd]], [[brain-maintenance]], [[audit]]
- Kod (5): `.github/workflows/ci-cd.yml`, `.github/workflows/security.yml`, `scripts/auto-commit.mjs`, `scripts/doc-sync.mjs`, `scripts/audit-scan.mjs`
- Belge (2): `docs/brain/BRAIN.md`, `docs/brain/actions/audit.md`
- Durum: ✓ belgelendi · sürüm: CHANGELOG Unreleased boş: sürüm çıkmaz

## 17.11.2026 15:50 · auto/20261117-085910
<!-- sig:c3JjL0FwcC50c3gsc3JjL3NlcnZpY2VzL2xhbmcu -->
- Alan: [[ui-design]]
- Kod (2): `src/App.tsx`, `src/services/lang.ts`
- Belge (3): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm hazırlandı: v1.4.0 → v1.4.1 (patch)

## 17.11.2026 11:59 · auto/20261117-084338
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3MvY2ktY2QueW1sLHNj -->
- Alan: [[ci-cd]], [[ui-design]], [[versioning]], [[brain-maintenance]]
- Kod (6): `.github/workflows/ci-cd.yml`, `scripts/bump-version.mjs`, `scripts/check-version.mjs`, `scripts/doc-sync.mjs`, `scripts/release.mjs`, `scripts/tests/release.test.cjs`
- Belge (11): `AGENT.md`, `CHANGELOG.md`, `CLAUDE.md`, `docs/brain/BRAIN.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/ci-cd.md`, `docs/brain/actions/doc-sync.md`, `docs/brain/actions/release.md` … (+3)
- Durum: ✓ belgelendi · sürüm hazırlandı: v1.3.0 → v1.4.0 (minor) · uyarı: 90 etiketsiz madde (iyileştirme/patch sayıldı; [feat] [fix] [improve] [perf] [security] [breaking] [docs] kullan)

## 17.11.2026 11:43 · auto/20261117-083449
<!-- sig:c2NyaXB0cy9icmFpbi5tanMsc3JjL2NvbXBvbmVu -->
- Alan: [[brain-maintenance]], [[settings]], [[i18n]], [[ui-design]], [[testing]]
- Kod (11): `scripts/brain.mjs`, `src/components/SettingsPage.tsx`, `src/i18n/uiText.ts`, `src/services/SettingsContext.tsx`, `src/services/editorTheme.ts`, `src/services/extensionsService.ts`, `src/services/settings.ts`, `src/services/settingsSchema.json`, `scripts/tests/palettes.test.cjs`, `src/i18n/uiTextTheme.ts`, `src/services/palettes.ts`
- Belge (4): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/settings.md`, `docs/brain/actions/testing.md`
- Durum: ✓ belgelendi

## 17.11.2026 11:34 · auto/20261117-082805
<!-- sig:c2NyaXB0cy9kb2Mtc3luYy5tanMsfCxBR0VOVC5t -->
- Alan: [[brain-maintenance]]
- Kod (1): `scripts/doc-sync.mjs`
- Belge (6): `AGENT.md`, `CLAUDE.md`, `docs/brain/BRAIN.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/brain-maintenance.md`, `docs/brain/actions/doc-sync.md`
- Durum: ✓ belgelendi
