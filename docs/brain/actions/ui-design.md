---
action: ui-design
purpose: Arayüz, tema, logo ve animasyon değişiklikleri
reads: [CLAUDE, PROJECT, i18n, settings]
writes: [CHANGELOG, DECISIONS]
triggers: ["tasarım", "tema", "logo", "renk", "animasyon", "arayüz"]
---
# Aksiyon: Arayüz ve tasarım

## Tasarım dili
- VS Code "Dark Modern" çizgisi: **düz yüzeyler, cam/bulanıklık/gölge yığını yok.** Gradient yalnız logoda.
- Jetonlar `src/style.css` içindeki `@theme`: nötrler `zinc-*` (50→950), vurgu `indigo-*` (logodaki indigo-menekşe), yüzeyler `nv-editor` `#1f1f1f`, `nv-side` `#181818`, `nv-input`, `nv-hover`, `nv-active`, `nv-border`.
- Yeni bileşende sabit hex kullanma; jeton sınıfı kullan (`bg-nv-side`, `border-nv-border`, `text-zinc-400`, `bg-indigo-600`).
- Yazı tipleri: sistem `Segoe UI Variable`, kod `Cascadia Code`. Dış font yüklenmez (gizlilik).

## Koyu / açık mod
- `<html data-theme="dark|light">`; açık mod `src/style.css` içindeki `:root[data-theme="light"]` bloğuyla **yalnız değişkenleri** değiştirir (zinc ölçeği ters çevrilir, `nv-*` yüzeyleri, `--hover-overlay`, `--selection`, `--ansi-*`). Bileşen kodu moda göre dallanmaz.
- Bu yüzden: renkleri **hex yazma**; `zinc-*`, `indigo-*`, `nv-*` ve `var(--ansi-N)` kullan. Beyaz/siyah gerekiyorsa `--color-zinc-50` (moda göre ters döner).
- Vurgu rengi kullanıcı ayarıdır (6 hazır renk); `indigo-*` jetonları çalışma zamanında yeniden yazılır (`applyAppearance`). Vurguya bağlı yüzeyler `color-mix()` ile türetilir (`--color-nv-active`).
- Terminal ve komut renklendirme `--ansi-0…15` değişkenlerini kullanır; paletler iki modda ayrı tanımlıdır. Monaco: `nova-dark`, `nova-light` (`editorTheme.ts`).
- Yeni bir yüzey/bileşen sonrası **iki modda da** kontrol et (kontrast ≥ 4.5:1).

## Düzen
Başlık çubuğu (36 px, özel; pencere düğmeleri sistemden) → etkinlik çubuğu (48 px) → kenar çubuğu → editör (sekmeler + yol göstergesi) → alt panel → durum çubuğu (22 px). Kısayol: Ctrl+B kenar çubuğu.

## Kenar çubuğu ve Gezgin (VS Code son sürüm uyumlu)
- Başlık: `GEZGİN` + `…` menüsü. Bölümler: **Açık düzenleyiciler** (sayaç rozeti, kapatma, kirli nokta) ve **çalışma alanı** (proje adı büyük harf; üzerine gelince Yeni dosya / Yeni klasör / Yenile / Hepsini daralt).
- Ağaç: 22 px (sıkı) veya 28 px (rahat) satır, dönen chevron, renkli dosya simgeleri, girinti kılavuzları, Git harfleri/noktaları. Açılıp kapanma `grid-template-rows` animasyonuyla.
- **Satır içi** oluşturma (Enter/Esc) ve yeniden adlandırma (F2); sağ tık menüsü (yeni, yeniden adlandır, sil, yolu kopyala); klavye: ↑ ↓ ← → Home End Enter F2 Del.
- Kenar çubuğu konumu (sol/sağ), etkinlik çubuğu, durum çubuğu, breadcrumb ve açık düzenleyiciler **ayarlarla** gizlenip gösterilebilir.
- Kenar çubuğu ve terminal paneli açılıp kapanırken **boyut animasyonlu**; sürüklerken geçiş kapanır (`<html data-resizing>`).

## Açılır menü ve geçişler
`PopupMenu` (`Menu.tsx`): `animate-menu` (120 ms), ↑/↓/Enter/Esc, dışarı tıklayınca kapanır, ekrandan taşmaz. Yeni listeler/menüler bunu kullanır.

## Boşluk disiplini
Gereksiz yer kaplayan öğeler yok: sürüm etiketi başlık çubuğunda değil (Hakkında/Karşılama'da), durum çubuğunda yalnız anlamlı bilgi (dal, hesap, kaydedilmedi, boşluk/kodlama/dil), terminal paneli varsayılan kapalı, tek satırlık boş durumlar.

## Hareket
Tanımlı sınıflar: `animate-fade-in`, `animate-sidebar-in`, `animate-panel-up`, `animate-tab-in`, `ab-item`, `icon-btn`, `status-item`, logo çizim animasyonu. Süre 120–250 ms, `ease-out-soft`. `prefers-reduced-motion` ile hepsi kapanır; bunu bozma.

## Logo ve simgeler
- Kaynak: `public/logo.svg` (arka plansız; kod ayracı + yapay zekâ kıvılcımı, indigo→turkuaz). `public/favicon.svg` aynıdır. React: `src/components/Logo.tsx`.
- Uygulama simgesi `public/icon.png` (512, şeffaf): `npx electron scripts/make-icons.cjs`. Paketleme: `build.win.icon`.
- Logo değişirse `Logo.tsx`, `favicon.svg`, `icon.png` birlikte güncellenir.

## Menü çubuğu
Başlık çubuğunda Dosya / Düzenle / Seçim / Görünüm / Git / Çalıştır / Terminal / Yardım (`MenuBar.tsx`; tanımlar `App.tsx` → `menus`). Açılır menü `PopupMenu`'dür (animasyonlu, kısayol gösterir, ↑↓ Enter Esc); biri açıkken fare başka başlığa geçince menü de geçer. Başlık arama kutusu esnek genişliktedir (üst üste binmez). Editör eylemleri `editorBridge.runEditorAction` ile Monaco'ya gider. **Çalıştır** menüsü: `terminalBridge.runCommandFor` uzantıya göre komut üretir (`node`, `python`, `go run`, `php`, `npx tsx`, `java`, `ruby`, `bash`…) ve `nova:term` olayıyla entegre terminalde çalıştırır; ayrıca `npm run dev/build/test`, `go run .`, `cargo run`, `dotnet run`. Yeni menü öğesi = `menus` + [[i18n]] (8 dil).

## Dosya türü simgeleri
`FileTypeIcon.tsx`: uzantıya (ve `package.json`, `Dockerfile`, `.gitignore`… özel adlara) göre renkli rozet (TS, JS, PHP, PY, GO, RS… ~60 tür). Gezgin, sekmeler, palet ve arama sonuçlarında kullanılır. Yeni tür = `EXT`/`NAMES` tablosuna satır.

## Duyarlı (responsive) kurallar
- **Pencere:** Electron en az 980×660; web daha küçük olabilir. Tasarım 720×600'e kadar bozulmamalı.
- **Paneller:** pencere < 1100 px iken sağ paneller (AI, önizleme) editörün **üstüne biner** (`absolute right-0`, gölge); kenar çubuğu en çok pencerenin %34'ü; AI paneli en çok %40 (üst sınır 720). Genişlikler yine sürüklenir.
- **Konteyner sorguları:** panelin kendi genişliğine göre uyum için Tailwind `@container` + `@md:` `@lg:` `@2xl:` kullan (pencereye göre değil). Ayarlar sayfası: dar kapta kategori listesi üstte yatay sekme şeridi olur, kontrol etiketin altına iner; editör sekme çubuğu: kopyala/indir ve "Çalıştır" etiketi gizlenir.
- **Taşma kuralları:** esnek çocuklarda `min-w-0`; kayan kaplarda `min-h-0` + `overflow-y-auto overflow-x-hidden`; etiket/düğme metni `whitespace-nowrap` + `truncate`; uzun içerik `break-words [overflow-wrap:anywhere]`; kod blokları kendi içinde yatay kayar.
- **CSS katmanı:** `.icon-btn`, `.status-item` `@layer components` içindedir. Katmansız CSS Tailwind yardımcılarını (`hidden`, `w-*`) **ezer**; yeni özel sınıfları katmana koy.
- **Menü:** kapalı öğe `aria-disabled` + soluk + `title` ipucu (neden kapalı); fare üzerinde gezinebilir. Uzun menü `max-h` ile kayar; menü çubuğu dar pencerede yatay kayar (tekerlek yatay çevrilir).

## Erişilebilirlik
Simge düğmelerine `aria-label`/`title`; odak halkası `:focus-visible`; kontrast ≥ 4.5:1. Metinler [[i18n]] ile 8 dilde.

## Doğrulama
[[testing]] + uygulamayı çalıştırıp görsel kontrol (yalnız uygulamanın kendi penceresi; ekran yakalama başka pencereleri içermemeli).
