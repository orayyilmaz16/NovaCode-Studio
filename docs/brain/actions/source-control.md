---
action: source-control
purpose: Kaynak denetimi: fark sekmesi, dal/etiket seçici, birleştirme, stash, geçmiş; Sorunlar (hata/uyarı) sayacı ve renkleri
reads: [CLAUDE, PROJECT, security-kvkk, i18n, git-github]
writes: [CHANGELOG, DECISIONS, testing]
triggers: ["fark", "diff", "dal seçici", "branch", "merge", "birleştir", "stash", "etiket", "tag", "sorunlar", "hata sayacı", "problems"]
---
# Aksiyon: Kaynak denetimi ve Sorunlar

Hesap/PR/eşzamanlama temeli için [[git-github]]. Bu dosya Git panelinin VS Code tarzı genişlemesini ve Sorunlar sistemini anlatır.

## Git arka ucu (`electron-git.cjs`)
Tüm komutlar `execFile` + argüman dizisi; `guard()` GitHub bağlantısını ve depo yolunu denetler. Yeni kanallar:
| Kanal | Ne yapar | Güvenlik |
|---|---|---|
| `git:diffFile` | İki sürüm döner: staged = HEAD↔index, unstaged = index↔çalışma ağacı, `ref` = commit ↔ üstü | Yol `safeRelPaths`; çalışma ağacı dosyası realpath ile depo içinde mi denetlenir; ikili/2 MB üstü içerik taşınmaz |
| `git:commitFiles` | Commit'in değiştirdiği dosyalar (`diff-tree -z`) | Yalnız hex SHA |
| `git:refs` | Yerel dal, uzak dal, etiket | — |
| `git:checkoutRef` | Dal → `switch`; uzak dal → izleyici dal; etiket/SHA → `--detach` | Ad `REF_RE` + var olan ref |
| `git:createBranchFrom`, `git:deleteBranch` | Dal oluştur/sil (`-d`; birleşmemişse `not-merged`, `-D` yalnız açık onayla) | `branchOk` |
| `git:merge`, `git:mergeAbort`, `git:mergeContinue`, `git:resolve` | `merge --no-edit`; çakışma `merge-conflict`; `resolve` = `checkout --ours/--theirs` + `add` | Ref doğrulanır; `--abort` gibi değerler reddedilir |
| `git:amend`, `git:undoCommit` | Son commit'i düzelt / soft reset (değişiklikler sahnede kalır) | Mesaj ≤ 2000 |
| `git:createTag`, `git:deleteTag`, `git:pushTag` | Etiket | `check-ref-format refs/tags/…` |
| `git:stashList/Push/Apply/Pop/Drop` | Stash (izlenmeyen dahil) | İndeks tam sayı 0–999 |

`git:status` artık `merging` döner; `git:log` commit başına `refs` (dal/etiket rozetleri) döner.

## Arayüz
- `GitPanel.tsx`: dal düğmesi, ⋯ menüsü (pull/push/fetch/sync, dal, birleştir, etiket, stash, geri al, hepsini at), Commit ▾ (commit&push, amend, geri al), bölümler (Birleştirme değişiklikleri / Sahnelenenler / Değişiklikler / Raf), geçmişte commit → dosyalar → fark. Satırlar `FileTypeIcon` ile uzantı simgesi taşır. Çakışan dosyada "bizimkini/gelenı al". `prompt()` Electron'da yok: etiket/stash adı satır içi formla sorulur.
- `BranchPicker.tsx`: "Dal veya etiket seç" hızlı seçici (filtre, ↑↓ Enter Esc). Kipler: `checkout`, `merge`, `delete`, `deleteTag`, `from`. Durum çubuğundaki dal düğmesi ve panel aynı seçiciyi `App.tsx` üzerinden açar; sonuç `pushGitNotice` ile günlük + durum çubuğu + panele iletilir.
- Fark sekmesi: `FileItem.diff` (salt okunur Monaco `DiffEditor`, `SafeDiff` sarmalayıcı — @monaco-editor/react 4.7 kapanırken modeli editörden önce yok edip hata veriyordu). Git durumu değişince açık fark sekmeleri tazelenir; commit farkları sabittir. Kaydetme bu sekmelerde yok sayılır.
- Durum çubuğu: dal, eşzamanla (↓↑), ±değişiklik, **hata/uyarı sayacı** (tıkla → Sorunlar), kısa süreli git bildirimi.

## Sorunlar
- `src/services/problems.ts`: Monaco işaretçilerinin (TS/JSON/CSS hizmetleri + LSP) deposu; sayaç, `ProblemsPanel`, sekme/ağaç renkleri, editörde hatalı satır çizgisi (`.nova-err-*`, `.nova-warn-*`) buradan beslenir.
- Açık dosyaların Monaco modelleri sekme değişince yaşar (`path` + `keepCurrentModel`); sekme kapanınca `EditorArea` modeli yok eder. Bu yüzden sayaç **açık dosyaları** kapsar, kapalı dosyaları değil.
- TS çalışanı node_modules türlerini bilmez; yanlış pozitif sayacı şişirmesin diye `diagnosticCodesToIgnore` (2307, 2792, 7016, 2688, 2580, 2591, 2875, 7026, 2503, 2318) ve JSX/ESNext derleyici ayarı kuruldu. JS dosyalarında anlamsal denetim kapalıdır (yalnız sözdizimi).
- Alt panelde SORUNLAR | TERMİNAL | GÜNLÜK sekmeleri; `sendTerminal({action:'tab', tab:'problems'})`, kısayol Ctrl+Shift+M.

## Test
`scripts/tests/git.test.cjs` (63 kontrol: diff, merge/çakışma/çözüm/iptal, stash, etiket, amend/undo, tehlikeli ref reddi). Arayüz: [[testing]] gizli profil + CDP; GitHub oturumu yalnız test için `-r` ile taklit edilir (ürün koduna arka kapı konmaz).
Metinler [[i18n]]: `src/i18n/uiTextScm.ts` (8 dil).
