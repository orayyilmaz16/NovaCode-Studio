---
action: settings
purpose: Ayarlar sistemi: yeni ayar eklemek, tema/yazı tipi/editör davranışları, kalıcılık ve gizli değerler
reads: [CLAUDE, PROJECT, STATE, i18n, ui-design]
writes: [CHANGELOG, DECISIONS, STATE]
triggers: ["ayar", "tema", "light", "dark", "yazı tipi", "font", "ayarlar sayfası"]
---
# Aksiyon: Ayarlar

Ayarlar **gerçek zamanlıdır**: değiştiği an arayüze, editöre ve terminale yansır; bu cihazda otomatik kaydedilir. Sunucu yoktur; hiçbir ayar dışarı gönderilmez.

> **Not:** Ayarlar sayfası artık uygulamanın üstünde ayrı bir pencere (modal) olarak açılır; ayrıntı ve katman sırası: [[ui-design]] → *Katman sırası ve Ayarlar penceresi*. Gezgin seçenekleri (`tree*`) için bkz. [[explorer]].

## Yeni ayarlar (12.11.2026)
`terminalMode` (terminal: pty/classic), `lspEnabled` (editor: dil sunucuları, varsayılan açık).

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| **Şema (tek kaynak)** | `src/services/settingsSchema.json` | Kategoriler, her ayarın kimliği, türü, varsayılanı, aralığı/seçenekleri, görünürlük koşulu |
| Çekirdek | `src/services/settings.ts` | Doğrulama (`sanitizeValue`), yükleme/kaydetme, vurgu paletleri, yazı tipi tabloları, `toMonacoOptions` |
| Bağlam | `src/services/SettingsContext.tsx` | `useSettings()`; tema/vurgu/yazı tipi/yakınlaştırma/hareket/dil/pencere başlığı uygulama (`applyAppearance`) |
| Sayfa | `src/components/SettingsPage.tsx` | VS Code tarzı tam sayfa: kategori listesi, arama, kontroller, canlı Monaco önizleme, kısayollar, hakkında/yedek |
| Gizli değer | `src/services/useCollabToken.ts` + `electron-secrets.cjs` | Ortak düzenleme token'ı yalnız ana süreçte şifreli saklanır |
| Dil | `src/i18n/uiText.ts` (`setUiLang`) | Dil ayarı render sırasında uygulanır |

Ayar listesinin güncel hali: [[STATE]] → **Ayarlar** tablosu (şemadan üretilir).

## Yeni ayar eklemek (adım adım)
1. `settingsSchema.json` içine satır ekle: `id`, `category`, `type` (`toggle|select|slider|text|accent`), `default`; `slider` için `min/max/step/unit`, `select` için `options` (`labelKey` veya düz `label`). Koşullu görünüm: `showWhen: { id, equals }`.
2. i18n ([[i18n]]): `set_<id>` etiketi (8 dil); `desc: true` ise `setDesc_<id>`; seçenek `labelKey`'leri de 8 dilde.
3. **Uygula**: ayarı tüketen yerde `useSettings().values.<id>` oku. Editör davranışıysa `toMonacoOptions` içine ekle (Monaco canlı günceller). Görünümse `applyAppearance` içinde CSS değişkeni/özniteliği ayarla.
4. `npm run brain:check` (şema + i18n doğrular) ve `npm run brain` ([[STATE]] yenile).
5. [[CHANGELOG]] Unreleased (tr + en).

Doğrulama kuralları şemadan gelir: bilinmeyen anahtar atılır, seçenek dışı değer varsayılana döner, sayı aralığa kırpılır, metin uzunluğa kesilir. İçe aktarılan dosya da aynı süzgeçten geçer.

## Tema ve görünüm
- `<html data-theme="dark|light">`; `themeMode: system` iken `prefers-color-scheme` canlı izlenir. Koyu/açık fark `src/style.css` içindeki jeton değişkenleridir ([[ui-design]]).
- Vurgu rengi: `ACCENTS` tablosu (koyu/açık için ayrı tonlar); `--color-indigo-200…700` değişkenleri satır içi uygulanır.
- Yakınlaştırma: Electron'da `webFrame.setZoomFactor` (preload `ui.setZoom`, aynı değeri tekrar uygulamaz), webde CSS `zoom`. `applyZoom` ayrı efekttedir ve `requestAnimationFrame` ile tek sefer uygulanır. **Kaydırıcı `uiZoom` için sürüklerken değil bırakınca uygular** (`SliderControl`): aksi halde sayfa ölçeklenince kaydırıcı fare altında kayar, değer gidip gelir ve arayüz takılır. Pencere zemin rengi (`ui:setTheme`) yalnız mod değişince gider; başlık çubuğunu arayüz çizdiği için `setTitleBarOverlay` çağrılmaz.
- Pencere başlık çubuğu rengi: `ui:setTheme` (yalnız `dark|light` kabul edilir).
- Animasyonlar kapalıysa `data-motion="off"` tüm geçişleri durdurur.

## Editör
Tüm editör ayarları `toMonacoOptions(values)` ile Monaco `options`'ına gider; tema `resolveEditorTheme` ile (`auto` → `nova-dark`/`nova-light`). Özel yazı tipi alanı `safeFontFamily` ile süzülür (CSS enjeksiyonu yok).

## Yerleşim ayarları
`sidebarPosition`, `activityBarVisible`, `statusBarVisible`, `showBreadcrumbs`, `showOpenEditors`, `treeDensity`, `treeIndentGuides` `App.tsx` / `FileTree.tsx` / `EditorArea.tsx` içinde okunur. Terminal: `terminalFontSize`, `terminalLineHeight`, `terminalScrollback`, `terminalCursor`, `defaultShell` (`Terminal.tsx`).

## Kayıt ve otomasyon davranışları
`autoSave` (`afterDelay` / `onFocusChange`), `trimTrailingWhitespace`, `insertFinalNewline`: `App.tsx` içinde `handleSaveFile` ve otomatik kayıt efektleri. Git aralıkları: `GitPanel.tsx` (`gitStatusInterval`, `gitAutoFetch`, `gitFetchInterval`).

## Gizlilik / KVKK
Ayarlar yalnız `localStorage` (`nova.settings.v1`) içinde, cihazda. Token `localStorage`'a **yazılmaz**; eski sürümden kalan düz metin token ilk açılışta şifreli depoya taşınıp silinir. Dışa aktarılan JSON token içermez. Bkz. [[security-kvkk]].

## Doğrulama
[[testing]]: `tsc`, `npm run brain:check`, uygulamayı **ayrı profille** (`--user-data-dir`) çalıştırıp ayarı değiştirip etkisini ölç (ör. Monaco `getRawOptions()`, `data-theme`, CSS değişkeni).

## Yeni kategoriler
`run` (Çalıştır ve önizleme: previewAutoOpen, runSaveBefore, runClearTerminal, runCommand*) ve `extensions` (extAutoUpdate + tema seçici/yüklü eklenti listesi, `ExtensionsSettings`). Tema seçimi anında uygulanır (`useActiveEditorTheme`).
