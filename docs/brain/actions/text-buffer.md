---
action: text-buffer
purpose: Özel metin tamponu (piece table) ve ajanın edit_lines aracı
reads: [CLAUDE, PROJECT, security-kvkk]
writes: [CHANGELOG, DECISIONS, testing]
triggers: ["text buffer", "piece table", "edit_lines", "satır düzenleme"]
---
# Aksiyon: Metin tamponu

## Ne ve ne değil
`electron-textbuffer.cjs`: bağımsız **piece table** (artımlı satır dizini, atomik çoklu düzenleme, geri al/yinele, EOL algılama/normalleştirme). **Monaco'nun kendi tamponunun yerine geçmez**; editör hâlâ Monaco'dur. Şu an ajanın `edit_lines` aracı kullanır (`electron-ai.cjs`).

## API
`applyOffsetEdits`, `applyEdits`, `applyLineEdits`, undo/redo. Ekleme semantiği: `startLine === n+1` sonuna ekler (EOL öne eklenir). Ters kayıt tersten uygulanır.

## edit_lines (ajan aracı)
Satır aralığı değiştirme; onay önizlemesi (diff) gösterir; `riskyTouched`/`FILE_EDIT_TOOLS` listelerinde; yol çalışma klasörü içinde olmalı. Arayüz: `AIAssistant.tsx` `FILE_TOOLS`. Bkz. [[ai-assistant]].

## Test
`scripts/tests/textbuffer.test.cjs` (rastgele 60×120 düzenleme, saf modele karşı), `scripts/tests/ai-tools.test.cjs` (edit_lines, yol geçişi, güvenli komut izin listesi). `electron-textbuffer.cjs` `package.json` → `build.files` içinde. Bkz. [[testing]].
