---
action: search-palette
purpose: Komut paleti (Ctrl+P / >), proje araması, satıra git
reads: [CLAUDE, PROJECT, STATE, i18n, settings]
writes: [CHANGELOG, STATE]
triggers: ["palet", "komut paleti", "ara", "arama", "ctrl+p", "satıra git", "hızlı aç"]
---
# Aksiyon: Arama ve komut paleti

## Kısayollar
| Tuş | İş |
|---|---|
| `Ctrl+P` / üst çubuktaki arama kutusu | Dosyaya git (bulanık eşleşme) |
| `Ctrl+Shift+P` / `F1` | Komut paleti (`>`) |
| `Ctrl+G` | Satıra git (`:`) |
| `Ctrl+Shift+F` | Projede ara (kenar çubuğu) |

Paletin içinde önek yazarak mod değişir (`>`, `:`); önek yoksa dosya modudur.

## Parçalar
| Parça | Dosya |
|---|---|
| Palet | `src/components/CommandPalette.tsx` (komut listesi `App.tsx` → `paletteCommands`) |
| Proje araması | `src/components/SearchPanel.tsx` + `electron-search.cjs` (`search:files`, `search:text`) |
| Düzenleyici köprüsü | `src/services/editorBridge.ts` (satıra git, seçim, Monaco eylemi) |

## Kurallar
- Arama yalnız açık çalışma klasöründe; `node_modules`, `.git`, `dist` vb. atlanır; ikili, >1 MB ve gizli dosyalar (`.env`, `*.pem`…) taranmaz; en çok 300 sonuç.
- Yeni komut = `paletteCommands` içine satır + [[i18n]] anahtarı (8 dil). Yeni kısayol `SettingsPage.tsx` → `SHORTCUTS` listesine de yazılır.
- `Ctrl+L` terminalde "temizle"dir; yapay zekâ paneli bu yüzden `Ctrl+Shift+L`.
