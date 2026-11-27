# Değişiklik günlüğü (otomatik)

`scripts/doc-sync.mjs` her Claude turu sonunda yazar; **elle düzenleme**. Yeniden üretilen [[STATE]] gibi koddan türer, ama yalnız son 40 tur tutulur.
İstem metni kaydedilmez (KVKK/gizli bilgi); yalnız dosya yolları, alanlar ve belge durumu. Kural: [[doc-sync]]. Neden/karar için [[DECISIONS]], kullanıcı notu için [[CHANGELOG]].

## 27.11.2026 18:13 · main
<!-- sig:ZWxlY3Ryb24tbWFpbi5janMsZWxlY3Ryb24tcHJl -->
- Alan: [[security-kvkk]], [[ui-design]], [[i18n]], [[settings]], [[testing]]
- Kod (13): `electron-main.cjs`, `electron-preload.cjs`, `src/App.tsx`, `src/components/AppDialogs.tsx`, `src/i18n/uiTextComp.ts`, `src/i18n/uiTextTheme.ts`, `src/services/settings.ts`, `src/services/settingsSchema.json`, `src/types.ts`, `electron-analytics.cjs`, `scripts/tests/analytics.test.cjs`, `server/analytics-server.mjs` … (+1)
- Belge (5): `CHANGELOG.md`, `docs/brain/BRAIN.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/security-kvkk.md`, `docs/brain/actions/analytics.md`
- Durum: ✓ belgelendi

## 27.11.2026 17:21 · main
<!-- sig:LmdpdGh1Yi9kZXAtYXV0b3BpbG90Lmpzb24sLmdp -->
- Alan: [[ci-cd]], [[ui-design]], [[testing]]
- Kod (6): `.github/dep-autopilot.json`, `.github/workflows/dep-autopilot.yml`, `.github/workflows/dep-review.yml`, `scripts/dep-review.mjs`, `scripts/dep-update.mjs`, `scripts/tests/deps.test.cjs`
- Belge (3): `docs/brain/DECISIONS.md`, `docs/brain/actions/ci-cd.md`, `docs/brain/actions/updates.md`
- Durum: ✓ belgelendi

## 27.11.2026 12:03 · auto/20261127-085853
<!-- sig:c2NyaXB0cy90ZXN0cy9zeW5jc2VydmVyLnRlc3Qu -->
- Alan: [[testing]], [[ui-design]]
- Kod (4): `scripts/tests/syncserver.test.cjs`, `server/deploy/README.md`, `server/sync-server.mjs`, `server/deploy/status.sh`
- Belge (3): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/sync-deploy.md`
- Durum: ✓ belgelendi

## 27.11.2026 11:58 · auto/20261127-085242
<!-- sig:fCxkb2NzL2JyYWluL2FjdGlvbnMvc3luYy1kZXBs -->
- Alan: —
- Kod (0): —
- Belge (1): `docs/brain/actions/sync-deploy.md`
- Durum: ✓ yalnız belge değişti

## 27.11.2026 11:52 · auto/20261127-084932
<!-- sig:c2VydmVyL2RlcGxveS9DYWRkeWZpbGUsc2VydmVy -->
- Alan: [[ui-design]]
- Kod (5): `server/deploy/Caddyfile`, `server/deploy/Dockerfile`, `server/deploy/README.md`, `server/deploy/docker-compose.yml`, `server/deploy/install.sh`
- Belge (4): `CHANGELOG.md`, `docs/brain/BRAIN.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/sync-deploy.md`
- Durum: ✓ belgelendi

## 27.11.2026 11:49 · main
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3MvcmVsZWFzZS1maW5h -->
- Alan: [[ci-cd]]
- Kod (1): `.github/workflows/release-finalize.yml`
- Belge (3): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/versioning.md`
- Durum: ✓ belgelendi

## 27.11.2026 11:41 · main
<!-- sig:fCxkb2NzL2JyYWluL2FjdGlvbnMvbW9uaXRvcmlu -->
- Alan: —
- Kod (0): —
- Belge (1): `docs/brain/actions/monitoring.md`
- Durum: ✓ yalnız belge değişti

## 27.11.2026 11:38 · main
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3MvaGVhbHRoLW1vbml0 -->
- Alan: [[ci-cd]], [[ui-design]]
- Kod (2): `.github/workflows/health-monitor.yml`, `scripts/health-monitor.mjs`
- Belge (5): `CHANGELOG.md`, `docs/brain/BRAIN.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/audit.md`, `docs/brain/actions/monitoring.md`
- Durum: ✓ belgelendi

## 27.11.2026 11:29 · main
<!-- sig:c2NyaXB0cy9yZWxlYXNlLm1qcyxzY3JpcHRzL3Rl -->
- Alan: [[versioning]]
- Kod (2): `scripts/release.mjs`, `scripts/tests/release.test.cjs`
- Belge (5): `AGENT.md`, `CHANGELOG.md`, `CLAUDE.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/versioning.md`
- Durum: ✓ belgelendi

## 26.11.2026 20:01 · main
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3MvYmFja2ZpbGwtZGVz -->
- Alan: [[ci-cd]], [[ui-design]]
- Kod (2): `.github/workflows/backfill-desktop.yml`, `scripts/backfill-overlay.mjs`
- Belge (3): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/release.md`
- Durum: ✓ belgelendi

## 26.11.2026 09:18 · auto/20261126-052515
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3MvY2ktY2QueW1sLHws -->
- Alan: [[ci-cd]]
- Kod (1): `.github/workflows/ci-cd.yml`
- Belge (4): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/ci-cd.md`, `docs/brain/actions/updates.md`
- Durum: ✓ belgelendi

## 26.11.2026 08:25 · main
<!-- sig:LmdpdGh1Yi93b3JrZmxvd3Mvc2VjdXJpdHkueW1s -->
- Alan: [[ci-cd]], [[ui-design]]
- Kod (3): `.github/workflows/security.yml`, `.github/workflows/runtime-watch.yml`, `scripts/runtime-watch.mjs`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/updates.md`
- Durum: ✓ belgelendi

## 26.11.2026 08:17 · main
<!-- sig:ZWxlY3Ryb24tdXBkYXRlLmNqcyx8LENIQU5HRUxP -->
- Alan: [[updates]]
- Kod (1): `electron-update.cjs`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/updates.md`
- Durum: ✓ belgelendi

## 25.11.2026 11:07 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsfCxDSEFOR0VMT0cubWQsZG9j -->
- Alan: [[ui-design]]
- Kod (1): `src/App.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/explorer.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 25.11.2026 11:05 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsc3JjL2NvbXBvbmVudHMvRmls -->
- Alan: [[ui-design]], [[explorer]], [[i18n]]
- Kod (3): `src/App.tsx`, `src/components/FileTree.tsx`, `src/i18n/uiText.ts`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/explorer.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 25.11.2026 10:59 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvQWNjb3JkaW9uTWVudS50 -->
- Alan: [[ui-design]]
- Kod (2): `src/components/AccordionMenu.tsx`, `src/components/MenuBar.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 25.11.2026 10:57 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvTWVudUJhci50c3gsfCxD -->
- Alan: [[ui-design]]
- Kod (1): `src/components/MenuBar.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 25.11.2026 10:56 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvTWVudUJhci50c3gsc3Jj -->
- Alan: [[ui-design]]
- Kod (2): `src/components/MenuBar.tsx`, `src/components/AccordionMenu.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 12:09 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsc3JjL2NvbXBvbmVudHMvTWVu -->
- Alan: [[ui-design]], [[motion]]
- Kod (3): `src/App.tsx`, `src/components/MenuBar.tsx`, `src/style.css`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 12:08 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvTWVudUJhci50c3gsc3Jj -->
- Alan: [[ui-design]], [[motion]]
- Kod (3): `src/components/MenuBar.tsx`, `src/components/WindowControls.tsx`, `src/style.css`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 12:06 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsfCxDSEFOR0VMT0cubWQsZG9j -->
- Alan: [[ui-design]]
- Kod (1): `src/App.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 12:04 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsc3JjL3NlcnZpY2VzL2VkaXRv -->
- Alan: [[ui-design]]
- Kod (2): `src/App.tsx`, `src/services/editorTheme.ts`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 12:02 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsfCxDSEFOR0VMT0cubWQsZG9j -->
- Alan: [[ui-design]]
- Kod (1): `src/App.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 11:59 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsc3JjL3N0eWxlLmNzcyx8LENI -->
- Alan: [[ui-design]], [[motion]]
- Kod (2): `src/App.tsx`, `src/style.css`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 11:56 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsc3JjL2NvbXBvbmVudHMvTWVu -->
- Alan: [[ui-design]], [[motion]]
- Kod (4): `src/App.tsx`, `src/components/MenuBar.tsx`, `src/components/WindowControls.tsx`, `src/style.css`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 11:53 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvRWRpdG9yQXJlYS50c3gs -->
- Alan: [[ui-design]]
- Kod (1): `src/components/EditorArea.tsx`
- Belge (3): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/ui-design.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 11:50 · auto/20261118-083349
<!-- sig:ZWxlY3Ryb24tZ2l0aHViLmNqcyxzcmMvQXBwLnRz -->
- Alan: [[git-github]], [[ui-design]], [[i18n]]
- Kod (4): `electron-github.cjs`, `src/App.tsx`, `src/i18n/uiTextDev.ts`, `src/components/RemoteMenu.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/remote-ssh.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 23.11.2026 10:51 · auto/20261118-083349
<!-- sig:ZWxlY3Ryb24tbWFpbi5janMsZWxlY3Ryb24tcHJl -->
- Alan: [[security-kvkk]], [[terminal]], [[i18n]], [[ui-design]], [[testing]]
- Kod (15): `electron-main.cjs`, `electron-preload.cjs`, `electron-pty.cjs`, `scripts/tests/i18n.test.cjs`, `src/App.tsx`, `src/components/LandingPage.tsx`, `src/components/Terminal.tsx`, `src/i18n/uiText.ts`, `src/types.ts`, `electron-ssh-core.cjs`, `electron-ssh.cjs`, `scripts/tests/ssh-sftp.test.cjs` … (+3)
- Belge (8): `AGENT.md`, `CHANGELOG.md`, `docs/brain/BRAIN.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/security-kvkk.md`, `docs/brain/actions/terminal.md`, `docs/brain/actions/testing.md`, `docs/brain/actions/remote-ssh.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 22.11.2026 15:36 · auto/20261118-083349
<!-- sig:ZWxlY3Ryb24tcHJlbG9hZC5janMsZWxlY3Ryb24t -->
- Alan: [[security-kvkk]], [[terminal]], [[testing]], [[ui-design]]
- Kod (6): `electron-preload.cjs`, `electron-pty.cjs`, `scripts/tests/pty.test.cjs`, `src/components/Terminal.tsx`, `src/services/terminalText.ts`, `src/types.ts`
- Belge (3): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/terminal.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 22.11.2026 15:25 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvVGVybWluYWwudHN4LHws -->
- Alan: [[terminal]]
- Kod (1): `src/components/Terminal.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/terminal.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 22.11.2026 15:23 · auto/20261118-083349
<!-- sig:ZWxlY3Ryb24tcHR5LmNqcyxzY3JpcHRzL3Rlc3Rz -->
- Alan: [[terminal]], [[testing]], [[i18n]], [[settings]], [[ui-design]]
- Kod (7): `electron-pty.cjs`, `scripts/tests/pty.test.cjs`, `src/components/Terminal.tsx`, `src/i18n/uiTextDev.ts`, `src/services/settingsSchema.json`, `src/services/terminalText.ts`, `src/types.ts`
- Belge (3): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/terminal.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 22.11.2026 15:16 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvUHR5Vmlldy50c3gsc3Jj -->
- Alan: [[ui-design]], [[terminal]], [[motion]]
- Kod (3): `src/components/PtyView.tsx`, `src/components/Terminal.tsx`, `src/style.css`
- Belge (4): `CHANGELOG.md`, `docs/brain/DECISIONS.md`, `docs/brain/actions/motion.md`, `docs/brain/actions/terminal.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:45 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvRGVidWdDb25zb2xlUGFu -->
- Alan: [[debugging]], [[ui-design]], [[terminal]]
- Kod (4): `src/components/DebugConsolePanel.tsx`, `src/components/OutputPanel.tsx`, `src/components/Terminal.tsx`, `src/components/TestPanel.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/terminal.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:39 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvVGVybWluYWwudHN4LHNy -->
- Alan: [[terminal]], [[i18n]], [[debugging]], [[ui-design]]
- Kod (10): `src/components/Terminal.tsx`, `src/i18n/uiTextDev.ts`, `src/services/debugStore.ts`, `src/services/ptyBus.ts`, `src/services/tasks.ts`, `src/services/terminalBridge.ts`, `src/components/DebugConsolePanel.tsx`, `src/components/OutputPanel.tsx`, `src/components/TestPanel.tsx`, `src/services/testParse.ts`
- Belge (3): `CHANGELOG.md`, `docs/brain/actions/terminal.md`, `docs/brain/actions/testing.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:31 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvQ29tbWl0SGlzdG9yeU1l -->
- Alan: [[ui-design]], [[i18n]]
- Kod (2): `src/components/CommitHistoryMenu.tsx`, `src/i18n/uiTextScm.ts`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/git-github.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:28 · auto/20261118-083349
<!-- sig:ZWxlY3Ryb24tZ2l0LmNqcyxzcmMvY29tcG9uZW50 -->
- Alan: [[git-github]], [[ui-design]]
- Kod (3): `electron-git.cjs`, `src/components/CommitHistoryMenu.tsx`, `src/types.ts`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/git-github.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:23 · auto/20261118-083349
<!-- sig:ZWxlY3Ryb24tZ2l0LmNqcyxlbGVjdHJvbi1wcmVs -->
- Alan: [[git-github]], [[security-kvkk]], [[ui-design]], [[i18n]]
- Kod (7): `electron-git.cjs`, `electron-preload.cjs`, `src/App.tsx`, `src/components/CommitHistoryMenu.tsx`, `src/i18n/uiTextScm.ts`, `src/types.ts`, `src/services/timeAgo.ts`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/git-github.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:20 · auto/20261118-083349
<!-- sig:c3JjL0FwcC50c3gsc3JjL2kxOG4vdWlUZXh0U2Nt -->
- Alan: [[ui-design]], [[i18n]]
- Kod (3): `src/App.tsx`, `src/i18n/uiTextScm.ts`, `src/components/CommitHistoryMenu.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/git-github.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:10 · auto/20261118-083349
<!-- sig:ZWxlY3Ryb24tZ2l0aHViLmNqcyxlbGVjdHJvbi1w -->
- Alan: [[git-github]], [[security-kvkk]], [[ui-design]]
- Kod (4): `electron-github.cjs`, `electron-preload.cjs`, `src/components/GithubAccount.tsx`, `src/types.ts`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/git-github.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır

## 21.11.2026 20:03 · auto/20261118-083349
<!-- sig:c3JjL2NvbXBvbmVudHMvRWRpdG9yQXJlYS50c3gs -->
- Alan: [[ui-design]]
- Kod (1): `src/components/EditorArea.tsx`
- Belge (2): `CHANGELOG.md`, `docs/brain/actions/motion.md`
- Durum: ✓ belgelendi · sürüm: v1.5.1 hazır, etiketlenmeyi bekliyor (PR birleşince CI etiketler); yeni maddeler bir sonraki sürüme kalır
