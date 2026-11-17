# Değişiklik günlüğü (otomatik)

`scripts/doc-sync.mjs` her Claude turu sonunda yazar; **elle düzenleme**. Yeniden üretilen [[STATE]] gibi koddan türer, ama yalnız son 40 tur tutulur.
İstem metni kaydedilmez (KVKK/gizli bilgi); yalnız dosya yolları, alanlar ve belge durumu. Kural: [[doc-sync]]. Neden/karar için [[DECISIONS]], kullanıcı notu için [[CHANGELOG]].

## 17.11.2026 16:38 · auto/20261117-130721
<!-- sig:c3JjL0FwcC50c3gsc3JjL2kxOG4vdWlUZXh0VGhl -->
- Alan: [[ui-design]], [[i18n]]
- Kod (2): `src/App.tsx`, `src/i18n/uiTextTheme.ts`
- Belge (0): —
- Durum: ⚠ eksik belge: ilgili aksiyon dosyasını güncelle; CHANGELOG.md

## 17.11.2026 16:37 · auto/20261117-130721
<!-- sig:ZWxlY3Ryb24tYWkuY2pzLGVsZWN0cm9uLWRlYnVn -->
- Alan: [[ai-assistant]], [[debugging]], [[lsp]], [[security-kvkk]], [[search-palette]], [[explorer]], [[preview]], [[ui-design]], [[terminal]], [[i18n]], [[settings]], [[git-github]], [[testing]]
- Kod (29): `electron-ai.cjs`, `electron-debug.cjs`, `electron-llm.cjs`, `electron-lsp.cjs`, `electron-main.cjs`, `electron-preload.cjs`, `electron-search.cjs`, `src/components/FileTree.tsx`, `src/components/Preview.tsx`, `src/components/SearchPanel.tsx`, `src/components/Terminal.tsx`, `src/i18n/uiTextAi.ts` … (+17)
- Belge (0): —
- Durum: ⚠ eksik belge: ilgili aksiyon dosyasını güncelle; CHANGELOG.md

## 17.11.2026 16:32 · auto/20261117-130721
<!-- sig:c2NyaXB0cy90ZXN0cy9haS1zZWN1cml0eS50ZXN0 -->
- Alan: [[testing]]
- Kod (1): `scripts/tests/ai-security.test.cjs`
- Belge (2): `docs/brain/DECISIONS.md`, `docs/brain/actions/testing.md`
- Durum: ✓ belgelendi · sürüm: CHANGELOG Unreleased boş: sürüm çıkmaz

## 17.11.2026 16:28 · auto/20261117-130721
<!-- sig:c3JjL0FwcC50c3gsc3JjL2NvbXBvbmVudHMvUHJl -->
- Alan: [[ui-design]], [[preview]]
- Kod (2): `src/App.tsx`, `src/components/Preview.tsx`
- Belge (17): `CHANGELOG.md`, `docs/brain/actions/ai-assistant.md`, `docs/brain/actions/ci-cd.md`, `docs/brain/actions/debugging.md`, `docs/brain/actions/explorer.md`, `docs/brain/actions/git-github.md`, `docs/brain/actions/i18n.md`, `docs/brain/actions/lsp.md` … (+9)
- Durum: ✓ belgelendi · sürüm hazırlandı: v1.4.1 → v1.4.2 (patch)

## 17.11.2026 16:24 · auto/20261117-130721
<!-- sig:ZWxlY3Ryb24tZ2l0LmNqcyxzcmMvY29tcG9uZW50 -->
- Alan: [[git-github]], [[ui-design]], [[lsp]], [[testing]]
- Kod (6): `electron-git.cjs`, `src/components/EditorArea.tsx`, `src/main.tsx`, `src/services/editorBridge.ts`, `src/services/lspClient.ts`, `scripts/tests/paths.test.cjs`
- Belge (0): —
- Durum: ⚠ eksik belge: ilgili aksiyon dosyasını güncelle; CHANGELOG.md

## 17.11.2026 16:20 · auto/20261117-130721
<!-- sig:ZWxlY3Ryb24tZGVidWcuY2pzLGVsZWN0cm9uLWxz -->
- Alan: [[debugging]], [[lsp]], [[terminal]], [[ui-design]]
- Kod (7): `electron-debug.cjs`, `electron-lsp.cjs`, `electron-pty.cjs`, `src/services/problems.ts`, `src/components/AppDialogs.tsx`, `src/components/ErrorBoundary.tsx`, `src/components/StatusCursor.tsx`
- Belge (0): —
- Durum: ⚠ eksik belge: ilgili aksiyon dosyasını güncelle; CHANGELOG.md

## 17.11.2026 16:20 · auto/20261117-130721
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3MvY2ktY2QueW1sLC5n -->
- Alan: [[ci-cd]], [[ai-assistant]], [[git-github]], [[security-kvkk]], [[search-palette]], [[updates]], [[ui-design]], [[debugging]], [[extensions]], [[explorer]], [[preview]], [[source-control]], [[settings]], [[terminal]], [[i18n]], [[motion]], [[testing]]
- Kod (50): `.github/workflows/ci-cd.yml`, `.github/workflows/ci-failure-issue.yml`, `.github/workflows/dependabot-automerge.yml`, `.github/workflows/security.yml`, `electron-ai.cjs`, `electron-github.cjs`, `electron-llm.cjs`, `electron-main.cjs`, `electron-preload.cjs`, `electron-search.cjs`, `electron-secrets.cjs`, `electron-update.cjs` … (+38)
- Belge (0): —
- Durum: ⚠ eksik belge: ilgili aksiyon dosyasını güncelle; CHANGELOG.md

## 17.11.2026 16:10 · auto/20261117-130721
<!-- sig:fCxkb2NzL2JyYWluL0RFQ0lTSU9OUy5tZCxkb2Nz -->
- Alan: —
- Kod (0): —
- Belge (2): `docs/brain/DECISIONS.md`, `docs/brain/BACKLOG.md`
- Durum: ✓ yalnız belge değişti · sürüm: CHANGELOG Unreleased boş: sürüm çıkmaz

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
