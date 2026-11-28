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
`terminalMode` (terminal: pty/classic), `lspEnabled` (editor: dil sunucuları, varsayılan açık), `aiCompletion*` (ai kategorisi, grup `grpAiCompletion`: 12 ayar, bkz. [[ai-assistant]]).

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

## Renk temaları (17.11.2026)
`colorTheme` (`palette` türü, varsayılan `auto`): 10 hazır tema, tek kaynak `src/services/palettes.ts` (`PALETTES`). Koyu: `midnight`, `forest`, `orchid`, `ember`, `atlas` (Arduvaz), `ink` (saf siyah); açık: `paper`, `mist`, `mint`, `rose`.
- Her tema yalnız tohum renklerle tanımlanır: `editor`, `side`, `fg`, `accent`, `mode` ve 7 sözdizimi rengi. `paletteVars()` bundan `--color-zinc-50…950`, `--color-nv-*` ve `--selection` türetir (oranlar Nova Dark/Light ölçeğinden çıkarılmıştır); `applyAppearance` bunları `<html>` üzerine satır içi yazar, `auto`da kaldırır (style.css'teki Nova geçerli).
- **Mod temadan gelir:** tema seçiliyse `mode` temanın kendisidir ve `themeMode` satırı gizlenir (`showWhen: colorTheme = auto`); `auto`da `themeMode` (koyu/açık/sistem) geçerlidir. `SettingsContext` bunu `getPalette(...)?.mode ?? resolveMode(...)` ile çözer.
- **Vurgu temanın üstüne biner:** `accent` ayarı (11 renk: indigo, blue, teal, green, orange, pink, violet, cyan, red, amber, lime) her temada çalışır; `--selection` `color-mix` ile vurguyu izler.
- **Monaco:** `definePaletteThemes` her temaya `nova-<id>` editör teması tanımlar (`defineNovaThemes` içinden çağrılır, tüm editörlerde hazırdır). `resolveEditorTheme(editorTheme, mode, colorTheme)`: `editorTheme = auto` ve tema seçiliyse `nova-<id>`; açıkça seçilmiş editör teması (VS Dark vb.) renk temasını ezer.
- **Geçiş:** mod ya da renk teması değişince `data-theme-fading` ile renkler yumuşakça döner ([[motion]]). Terminal `style` değişimini izleyip renklerini yeniler.
- **Ayar arayüzü:** `SettingsPage` → `palette` denetimi: tema başına gerçek renklerle mini önizleme kartı (kenar çubuğu + editör + 3 sözdizimi çizgisi), seçili kartta işaret. Test: `scripts/tests/palettes.test.cjs` (hex geçerliliği, WCAG kontrastı: gövde ≥ 7, ikincil ≥ 3.5, sözdizimi ≥ 4 / yorum ≥ 2.8, düğme ≥ 3; şema↔tablo birebirliği).
- **Yeni tema ekleme:** `PALETTES`'e kayıt (7 token + 4 tohum) → `settingsSchema.json` `colorTheme` seçeneği → `pal_<id>` (8 dil, `uiTextTheme.ts`) → `npm test` (kontrast kapısı).

## Yazı tipleri
Arayüz (`uiFont`, 14 seçenek) ve kod (`fontFamily`, 12 seçenek + özel) tabloları `UI_FONTS`/`CODE_FONTS`. **Yazı tipi paketlenmez** (bağımlılık/boyut yok): cihazda kuruluysa kullanılır, değilse yığındaki yedeğe düşer (açıklama `setDesc_uiFont`/`setDesc_fontFamily`). Her yığın genel yedekle (`sans-serif`/`serif`/`monospace`) biter; test denetler.

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
`autoSave` (`afterDelay` / `onFocusChange`), `formatOnSave`, `trimTrailingWhitespace`, `insertFinalNewline`: `App.tsx` içinde `handleSaveFile` ve otomatik kayıt efektleri.
**Kayıtta biçimlendirme (`formatOnSave`, varsayılan kapalı):** `handleSaveFile(file, manual = true)` içinde, `manual` ve etkin sekme ise `editorBridge.formatActiveDocument()` Monaco `editor.action.formatDocument` eylemini çalıştırıp son metni döndürür; `null` dönerse (biçimlendirici yok / hata / 3 sn zaman aşımı) dosya olduğu gibi kaydedilir. Dönüşüm sırası: biçimlendir → `trimTrailingWhitespace` → `insertFinalNewline`. Otomatik kayıt (`afterDelay`, `onFocusChange`) ve Çalıştır öncesi kayıt `manual=false` geçer, biçimlendirmez. 1 MB üstü dosyada atlanır. Biçimlendirici kapsamı Monaco'ya bağlıdır (JS/TS, JSON, CSS/SCSS/LESS, HTML); diğer diller için LSP biçimlendirmesi varsa o devreye girer ([[lsp]]). Etiket ve açıklama: `set_formatOnSave`, `setDesc_formatOnSave` (8 dil). Git aralıkları: `GitPanel.tsx` (`gitStatusInterval`, `gitAutoFetch`, `gitFetchInterval`).

## Gizlilik / KVKK
Ayarlar yalnız `localStorage` (`nova.settings.v1`) içinde, cihazda. Token `localStorage`'a **yazılmaz**; eski sürümden kalan düz metin token ilk açılışta şifreli depoya taşınıp silinir. Dışa aktarılan JSON token içermez. Bkz. [[security-kvkk]].

## Doğrulama
[[testing]]: `tsc`, `npm run brain:check`, uygulamayı **ayrı profille** (`--user-data-dir`) çalıştırıp ayarı değiştirip etkisini ölç (ör. Monaco `getRawOptions()`, `data-theme`, CSS değişkeni).

## Yeni kategoriler
`run` (Çalıştır ve önizleme: previewAutoOpen, runSaveBefore, runClearTerminal, runCommand*) ve `extensions` (extAutoUpdate + tema seçici/yüklü eklenti listesi, `ExtensionsSettings`). Tema seçimi anında uygulanır (`useActiveEditorTheme`).

## Denetim düzeltmeleri (17.11.2026)
Ayar bağlamı seçicili: `useSettingValue(id)` ve `useSettingsActions()` (`useSettings()` korunur). Büyük dosyada (>2 MB veya >20k satır) `toMonacoOptionsForFile` minimap/folding/parantez renklendirmeyi kapatır. `applyAppearance` `html.lang` ve `html.dir` (ar → rtl) yazar.

## Seçici erişim ve Monaco grupları (#169, kısmi)
- `toMonacoOptions` anahtar gruplarına bölündü (`MONACO_KEYS`: font, editing, view, cursor, scroll, suggest, inlineSuggest). Her grup saf fonksiyon; birleşik çıktı eski uygulamayla birebir aynı (`scripts/tests/settings-selectors.test.cjs`, 602 kombinasyon).
- `EDITOR_OPTION_KEYS` ve `AI_COMPLETION_KEYS` düzenleyici/AI yan etkisinin dinlediği anahtarları tanımlar. Yeni düzenleyici ayarı eklenince bu listelere de eklenmeli (test, listede olmayan ayarın çıktıyı değiştirmediğini doğrular).
- `SettingsContext.tsx`: `useSettingsSlice(keys, select)` (render için, yalnız grup değişince yeni nesne) ve `useSettingsEffect(keys, effect)` (yan etki için, çizim tetiklemez).
- `EditorArea` artık `useSettings()` kullanmaz; `useSettingsSlice` + `useSettingValue` (showBreadcrumbs, lspEnabled) ve AI tamamlama için `useSettingsEffect`.
- Açık kalan: `App.tsx` hâlâ `useSettings()` ile her ayar değişiminde tam çizilir ve `EditorArea` memo'lu olsa da App'in props'u değişince yeniden çizilir. Tarayıcı React Profiler ölçümü yapılmadı (issue #169 kabul kriteri).

## Denetim düzeltmeleri, ikinci dalga (17.11.2026)
Yeni ayarlar: `localHistory` (varsayılan açık), `localHistoryMax` (5-30). Kullanıcı snippet'leri: `.nova/snippets.json` (çalışma klasörü) ve `userData/snippets.json` (genel); doğrulama, 256 KB / 500 snippet sınırı; palet "Snippet ekle/düzenle". Kısayol özelleştirme: `src/services/keybindings.ts` katalog ve çözümleme, geçersiz kılmalar `nova.keybindings.v1` (yalnız cihazda), çakışma denetimi, sabit kısayollar (Ctrl+C/V/X/Z/Y/A, F1, F5, F10, F11, Esc); `KeybindingsEditor` palet ve Ayarlar'da. Monaco içi varsayılan bağlama kaldırılmaz, eski tuş yakalama aşamasında yutulur. Ayarlar > Güven ve rıza ve oda kimliği alanı: [[security-kvkk]].
