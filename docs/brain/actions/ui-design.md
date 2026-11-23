---
action: ui-design
purpose: Arayüz, tema, logo ve animasyon değişiklikleri
reads: [CLAUDE, PROJECT, i18n, settings, motion]
writes: [CHANGELOG, DECISIONS]
triggers: ["tasarım", "tema", "logo", "renk", "animasyon", "arayüz"]
---
# Aksiyon: Arayüz ve tasarım

> **17.11.2026:** Sekmeler `nova-tab`, köşe ölçeği `--r-sm/md/lg`, tema renk geçişi ve pencere girişi için bkz. [[motion]].

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
Tüm geçiş, animasyon, hover ve gecikme kuralları ile jetonlar ([[motion]]) tek yerdedir; burada tekrar edilmez. Yeni etkileşimde önce oradaki yardımcı sınıfları kullan.

## Logo ve simgeler
- Kaynak: `public/logo.svg` (arka plansız; kod ayracı + yapay zekâ kıvılcımı, indigo→turkuaz). `public/favicon.svg` aynıdır. React: `src/components/Logo.tsx`.
- Uygulama simgesi `public/icon.png` (512, şeffaf): `npx electron scripts/make-icons.cjs`. Paketleme: `build.win.icon`.
- Logo değişirse `Logo.tsx`, `favicon.svg`, `icon.png` birlikte güncellenir.

## Menü çubuğu
Başlık çubuğunda Dosya / Düzenle / Seçim / Görünüm / Git / Çalıştır / Terminal / Yardım (`MenuBar.tsx`; tanımlar `App.tsx` → `menus`). Açılır menü `PopupMenu`'dür (animasyonlu, kısayol gösterir, ↑↓ Enter Esc); biri açıkken fare başka başlığa geçince menü de geçer. Başlık arama kutusu esnek genişliktedir (üst üste binmez). Editör eylemleri `editorBridge.runEditorAction` ile Monaco'ya gider. **Çalıştır** menüsü: `terminalBridge.runCommandFor` uzantıya göre komut üretir (`node`, `python`, `go run`, `php`, `npx tsx`, `java`, `ruby`, `bash`…) ve `nova:term` olayıyla entegre terminalde çalıştırır; ayrıca `npm run dev/build/test`, `go run .`, `cargo run`, `dotnet run`. Yeni menü öğesi = `menus` + [[i18n]] (8 dil).

## Dosya türü simgeleri
`FileTypeIcon.tsx`: uzantıya (ve `package.json`, `Dockerfile`, `.gitignore`… özel adlara) göre renkli rozet (TS, JS, PHP, PY, GO, RS… ~60 tür). Gezgin, sekmeler, palet ve arama sonuçlarında kullanılır. Yeni tür = `EXT`/`NAMES` tablosuna satır.

## Başlık çubuğu ve düğme durumları
- **Üç bölgeli ızgara:** sol (logo + menü) · orta (arama/proje kutusu) · sağ (düğmeler). Orta sütun `minmax(130px, min(360|460px, 100% − yan ihtiyaç))`; yan bölgeler `1fr` olduğu için arama kutusu **pencereye göre tam ortada** kalır (ölçüm: sapma 0, 720–1360 px). Sağ bölge pencere denetimlerinden önce biter (`paddingRight` 146 px, Electron).
- **Kompakt menü:** pencere < 1280 px iken menü başlıkları tek **Menü** düğmesinde toplanır (düğme → grup listesi → grubun menüsü); aksi halde 8 başlık yan yana. Dar kapta başlıklar yatay kayar.
- **Kapalı düğme kuralı:** projesiz/dosyasız işe yaramayan düğme **soluk** (`aria-disabled`, opaklık .35) görünür, **tıklayınca bir şey yapmaz**, ama fare üzerinde gezinebilir ve `title` ipucu nedenini söyler ("Önce bir klasör aç", "Yalnız HTML dosyalarında kullanılır"). Gerçek `disabled` kullanılmaz (fare olaylarını yutar). Şu an: *Önizleme* (HTML dosyası yoksa), *Terminal* ve *Ara* (klasör yoksa); menülerde aynı kural (`F`/`D` yardımcıları). Klasör/dosya açılınca otomatik etkinleşir. Kısayollar (`Ctrl+\`` , `Ctrl+Shift+F`) de aynı koşula uyar.
- Yeni düğme eklerken: işe yaraması bir duruma bağlıysa `dis(koşul, ipucu)` (App.tsx) kullan; CSS `.icon-btn[aria-disabled]` / `.ab-item[aria-disabled]` (`style.css`).

## Katman sırası (z-index) ve Ayarlar penceresi
- **Ayarlar ayrı bir pencere olarak açılır** (modal): arkaplan %65 siyah, pencere `min(1120px,100%) × min(780px,100%)` — ekranın dışına taşmaz (1360 px'te 1120×780, 720 px'te 681×561 ölçüldü), uygulamanın üstünde durur; altındaki görünüm (editör/karşılama) korunur. `Esc`, dışa tıklama veya ✕ kapatır; `Ctrl+,` aç/kapa. Kategoriler, kontroller ve tema aynı ayar sistemidir ([[settings]]); içerik `@container` ile pencere genişliğine uyar.
- **Tek z-index ölçeği** (yeni katman eklerken buraya uy, keyfi sayı yazma): `1` yapışkan başlıklar · `10` yerel üst katmanlar (panel içi) · `30` sağ paneller (dar pencerede editör üstü) · `50` açılış ekranı · `70` açılır menüler (portal ile `document.body`) · `150` Ayarlar penceresi · `200` komut paleti · `210` güncelleme penceresi.
- **Açılır menüler `document.body`'ye çizilir (portal):** kenar çubuğu gibi `overflow-hidden` ata öğeler menüyü kırpamaz.
- Modal arkaplanına `app-no-drag` verilir (başlık çubuğunun sürükleme alanı tıklamayı yutmasın).

## Duyarlı (responsive) kurallar
- **Pencere:** Electron en az 980×660; web daha küçük olabilir. Tasarım 720×600'e kadar bozulmamalı.
- **Paneller:** pencere < 1100 px iken sağ paneller (AI, önizleme) editörün **üstüne biner** (`absolute right-0`, gölge); kenar çubuğu en çok pencerenin %34'ü; AI paneli en çok %40 (üst sınır 720). Genişlikler yine sürüklenir.
- **Konteyner sorguları:** panelin kendi genişliğine göre uyum için Tailwind `@container` + `@md:` `@lg:` `@2xl:` kullan (pencereye göre değil). Ayarlar sayfası: dar kapta kategori listesi üstte yatay sekme şeridi olur, kontrol etiketin altına iner; editör sekme çubuğu: kopyala/indir ve "Çalıştır" etiketi gizlenir.
- **Taşma kuralları:** esnek çocuklarda `min-w-0`; kayan kaplarda `min-h-0` + `overflow-y-auto overflow-x-hidden`; etiket/düğme metni `whitespace-nowrap` + `truncate`; uzun içerik `break-words [overflow-wrap:anywhere]`; kod blokları kendi içinde yatay kayar.
- **CSS katmanı:** `.icon-btn`, `.status-item` `@layer components` içindedir. Katmansız CSS Tailwind yardımcılarını (`hidden`, `w-*`) **ezer**; yeni özel sınıfları katmana koy.
- **Menü:** kapalı öğe `aria-disabled` + soluk + `title` ipucu (neden kapalı); fare üzerinde gezinebilir. Uzun menü `max-h` ile kayar; menü çubuğu dar pencerede yatay kayar (tekerlek yatay çevrilir).

## Çerçeve (üst çubuk, etkinlik şeridi, yan panel, editör, sağ paneller, alt çubuk)
- **Karar:** paneller ince 1 px kenarlıklı, hafif yuvarlak **kartlardır** (VS Code tarzı, sade). **Renkler, tema ve editör görünümü değişmez**: yüzey renkleri `nv-side`/`nv-editor`, kenarlık düz `nv-border` kalır. Degrade, yarı saydam kenarlık, hap zemin, renkli vurgu gibi stil değişikliği ekleme.
- **Ölçüler (esnek):** `--frame` (kart boşluğu, 6 px) ve `--frame-r` (köşe, 8 px); pencere < 760 px iken 2 px / 6 px. Kartlarda `mx/mt/m-[var(--frame)]`, `rounded-[var(--frame-r)]`, `border border-nv-border` kullan; sabit px yazma.
- **Düzen:** kök `bg-nv-side` (boşlukların rengi). Üst çubuk (`h-9`) ve alt çubuk (`h-6`) kartları; çalışma alanı `px/pt-[var(--frame)]`; etkinlik şeridi `w-11` kart (22 px simge, 38 px düğme); yan panel, editör sütunu (terminal dahil) ve sağ paneller (AI, önizleme) kart. Panel iç bileşenleri kendi dış kenarlığını taşımaz (ör. `AIAssistant` kökünde `border-l` yok): çerçeveyi `App.tsx` verir.
- **Sürükleme:** üst çubuk kartının üstündeki dar boşlukta `app-drag` şeridi vardır (pencere taşınabilsin). Sağ paneller dar ekranda (`compactRight`) editörün üstüne biner (`right/top-[var(--frame)]`).
- **Alt çubuk:** `@container`; ikincil bilgiler (girinti, UTF-8) `hidden @lg:inline-flex` ile dar genişlikte gizlenir.

## Logo gölgesi ve karşılama ekranı
- **Logo gölgesi (`<Logo shadow />`):** zemin/plaka yok; yalnız `filter: var(--logo-shadow)` (`.logo-shadow`). Koyu temada siyah, açık temada yumuşak gri gölge; jeton `style.css` içinde. Başlık çubuğundaki 18 px logo gölgesizdir. Kullanım: açılış (88), karşılama (60), boş editör (72). Logo **çizimi** ve ikon dosyaları değişmedi.
- **Arka plan eski haliyle kalır:** karşılama `bg-nv-editor`, açılış `bg-nv-side`. Izgara, parıltı, degrade zemin **yok**; ekleme.
- **Karşılama (`LandingPage.tsx`):** üstte logo + hızlı eylemler (`btn-primary` Klasör Aç, `btn-ghost` Yeni Dosya); solda Başlangıç ve Son açılanlar; sağda Keşfet kartları (`motion-card`) ve İpuçları. Hepsi kademeli `motion-rise` ile girer.
- **Sade kural:** düz yüzey, tek vurgu rengi, gölge yığını yok. Hareket kuralları ve yardımcı sınıflar: [[motion]]. Yeni metinler `welTips`, `welTip*` (8 dil, [[i18n]]); RTL için `text-start`, `ms-auto`.

## ✦ tamamlama menüsü (`CompletionMenu.tsx`)
- **Yüzey:** `bg-nv-side`, `border-nv-border`, `rounded-[var(--frame-r)]`, tek `shadow-xl`; katman `z-[70]` (açılır menü). Sabit hex ve `zinc-700/70` gibi yarı saydam kenarlık yok; açık/koyu modda kod aynı.
- **Hizalama ızgarası:** her satır `h-8`, yan boşluk `px-3.5`, etiket solda (`flex-1 truncate`), kontrol sağda **sabit sütunda** (`CTRL_W` = `w-[176px]`). Anahtar, segment ve kaydırıcı aynı sağ kenarda biter; kaydırıcı değeri `w-[44px]` `tabular-nums`. Yeni satır eklerken `Row` / `Range` kullan, kendi genişliğini verme.
- **Kontroller:** `Switch` 32×18; `Segmented` eşit genişlikli düğmeler (`auto-cols-fr`), seçili `bg-indigo-600 text-white`, boşta `text-zinc-400 hover:bg-nv-hover`, zemin `bg-nv-input`; üst başlıkta 32 px `bg-nv-active` simge karosu; gruplar `Divider` (1 px `nv-border`) ile ayrılır.
- **Alt düğmeler:** "Şimdi öner" ve "Tüm ayarlar" `h-9`, iki eşit yarı, ortalı simge+metin, aralarında 1 px ayraç; kapalıyken (`disabled`) `opacity-40`, hover yok. Altında kısayol satırı (`break-words`, dar kapta sarar).
- **Erişilebilirlik:** tüm düğmelerde `focus-visible` indigo halka, `role=switch|radio|dialog`, Esc kapatır.
- **Sınır:** panel `w-[400px] max-w-[calc(100vw-16px)]`, uzunsa içeride kayar; konum düğmenin üstü, ekrandan taşmaz. Yeni metin eklenmez (mevcut `cm*`/`set_*` anahtarları, 8 dil [[i18n]]).

## Dil adı (durum çubuğu)
Durum çubuğundaki dil, Monaco kimliği yerine resmi yazımıyla görünür (JavaScript, TypeScript, C#, F#, HTML…): `languageLabel()` (`src/services/lang.ts`). Tabloda olmayan kimlik için ilk harf büyütülür; yeni dil eklenince `LABELS` tablosuna da yazılır. Dil adları çevrilmez, i18n gerekmez.

## Erişilebilirlik
Simge düğmelerine `aria-label`/`title`; odak halkası `:focus-visible`; kontrast ≥ 4.5:1. Metinler [[i18n]] ile 8 dilde.

## Doğrulama
[[testing]] + uygulamayı çalıştırıp görsel kontrol (yalnız uygulamanın kendi penceresi; ekran yakalama başka pencereleri içermemeli).

## Denetim düzeltmeleri (17.11.2026)
Gölge yığınları sadeleştirildi (tek odak halkası); AI avatarları düz `indigo`; `text-zinc-600` metinler `zinc-500`; FileTree bölüm başlıkları `role=button` + `aria-expanded` + Enter/Space. Ajan modu violet kullanımları 18.11.2026'da indigo'ya çekildi. Kalan: `origin-left` fiziksel.

## Denetim düzeltmeleri, ikinci dalga (17.11.2026)
**Bölünmüş editör:** en çok 2 grup (sağa `Ctrl+\`, alta `Ctrl+Alt+\`), her grubun kendi sekmeleri; aynı dosya iki grupta aynı Monaco modelini paylaşır; sekme sürükleyerek gruba taşıma; ayırıcı oranı `nova.split.ratio`; 860 px altında gruplar yığılır; oturumda `Session.split`; ortak düzenleme yalnız ilk grupta. Mantık `src/services/splitLayout.ts` (saf). **Veri kaybı önlemleri:** kaydedilmemiş sekme ve pencere kapanışında Kaydet/Kaydetme/İptal (`app:close-request`/`app:close-response`), "Diskte yok" ve "Diskte değişti" çubukları, oturum geri yükleme (`session.ts`, yalnız yerel, onaylı), `Ctrl+Shift+T`, kök ve panel `ErrorBoundary`. **Performans:** içerik editör modelinde, 250 ms toplu bildirim; `key`'siz tek editör; imleç/tanı/tamamlama/LSP durumları `StatusCursor` altında; `EditorArea` memo; günlük en çok 500 satır.

Kapanış: renderer onay penceresi açılınca `closePending()` (`app:close-pending`) ile ana sürecin 5 sn zamanlayıcısını durdurur; yanıtsız/çökmüş renderer için eski zaman aşımı korunur. Ayarlar > Kısayollar `KeybindingsEditor`. Bundle bütçesi (JS 600 KB, gzip 200 KB) dar: yeni eager metin/statik import eklerken [[ci-cd]] bütçesine bak.

## Tip ve sınıf denetimi, AI panel menüleri (18.11.2026)
`tsconfig.json` artık `strict` + `noUnusedLocals/Parameters` (CLAUDE.md kuralı 8 ile uyumlu); CI `tsc` bunu zorlar. Tailwind 4 kanonik sınıflar: eş `w-N h-N` → `size-N`, `!x` → `x!`, `break-words` → `wrap-break-word`, `[overflow-wrap:anywhere]` → `wrap-anywhere`. **Panel içi açılır menüler** (`ModelMenu`, `ThinkingMenu`) düğmeye değil giriş kartına (`relative`) göre konumlanır (`absolute bottom-full inset-x-0` / `start-0 w-[min(268px,100%)]`); panel kökü `overflow-hidden` olduğundan düğmeye göre konumlanan geniş menü dar panelde kesiliyordu. Fiziksel `left-/right-` yerine `start-/end-` kullan.

## Etkinlik çubuğu: normal simge, dar kenar boşluğu (18.11.2026)
Şerit 50 → 44 px, düğme 48 → 38 px, simge 22 px (`strokeWidth` 1,5; ilk denemedeki 18 px fazla küçük bulundu); yalnız yan boşluklar azaldı, rozet/nokta/avatar (22 px) orantılı. Etkinlik çubuğunda yerel `title` yerine `data-tip` kullanılır (çift ipucu olmasın); `dis()` yalnız şerit dışındaki düğmelerde. Hareket: [[motion]] "Etkinlik çubuğu".

## Yüzen arayüz (18.11.2026, kurucu talimatı)
VS Code'un yüzen kart havası: `--frame` 8 px, `--frame-r` 10 px (dar pencerede 3/7), tüm kartlara (başlık, etkinlik şeridi, kenar çubuğu, editör sütunu, önizleme, AI paneli, durum çubuğu) `.float-card`: **tek** yumuşak gölge `--float-shadow` (`0 2px 12px`, koyu .28 / açık .09). Bu, "gölge yığını yok" kuralının bilinçli ve sınırlı istisnasıdır: kart başına tek katman, menü/pencerede ek gölge yok. Sekmeler: üst köşeler `--r-lg` (8 px), aralık `gap-0.5`, sekme çubuğu 38 px ve yan boşluklu. Renkler ve tema değişmedi.

## Kenar çubuğu boşluğu ve sekme ipucu (18.11.2026)
Kenar çubuğu ile editör arası boşluk 4 → 8 px (tutamaç 6 px + `.sidebar-gap`); tüm `ResizeHandle`'lar (önizleme, AI, bölünmüş editör, terminal) aynı 6 px ve ince ortalı çizgi. Sekme ipucu tema uyumlu `HoverTip` (yukarıdaki "Kenar çubuğu geçişi" bölümü, [[motion]]).

## Duyarlı düzen: telefon / tablet / masaüstü (18.11.2026)
Gerçek tarayıcıda (CDP ile 360, 390, 768, 1024, 1440 px) ekran görüntüsüyle doğrulandı; hiçbir genişlikte yatay taşma yok (`scrollWidth == clientWidth`). Eşikler (`App.tsx`): `vw < 760` **`compactLeft`**: kenar çubuğu editörü ezmez, etkinlik şeridinin yanında üstüne biner (`absolute z-30`, genişlik `min(sidebarWidth, 320, vw-96)`), arkasına tıklamak veya dosya seçmek kapatır (`bg-black/30` perde), tutamaç/boşluk yok, telefonda kapalı başlar; `vw < 1100` `compactRight`: AI/önizleme paneli üstüne biner; `vw < 1280` menü tek "Menü" düğmesi. Kök yükseklik `h-dvh` (mobil adres çubuğu), `viewport-fit=cover`, `overscroll-behavior: none`. Sekme çubuğu eylem düğmeleri `@container` ile (`@md`) kademeli gizlenir. Yeni düzende bu eşiklere ve ekran görüntüsü kontrolüne uy.

## Editör içi duyarlılık: sekme çubuğu (18.11.2026)
Sorun: dar editörde (AI/önizleme paneli veya kenar çubuğu açıkken) `shrink-0` eylem düğmeleri (bölme, kaydet, kopyala, indir, önizleme, Çalıştır) tüm genişliği yiyip sekme listesini 0 px'e düşürüyordu; koyu temada pasif sekmeler zeminle aynı renk olduğundan da ayırt edilmiyordu. Çözüm (`EditorArea.tsx`): sekme listesi `min-w-[96px]` (en az bir sekme hep görünür); editör kabı `@container` olduğundan `@md` (448 px) altında bölme/kaydet/kopyala/indir/önizleme/ortak çalışma etiketi gizlenir ve tek bir **"⋯" menüsüne** (`PopupMenu`, `edMore`) toplanır, Çalıştır yalnız simge kalır. Pasif sekmeler `bg-zinc-50/5` ile zeminden ayrışır (tüm koyu paletlerde doğrulandı: midnight, forest, orchid, ember, atlas, ink).

**Sekme görünümü (18.11.2026):** üst çizgi yok, sol boşluk yok; etkin sekme `bg-nv-editor` kenarlıksız, pasif sekme `bg-zinc-50/4`, üst köşeler `--r-lg`.

**Sekme–editör bağlantısı (18.11.2026):** seçili sekmenin alt sol/sağ köşelerinde içbükey 6 px yuvarlama (`.nova-tab[aria-selected]::before/::after`, `radial-gradient`, `--color-nv-editor`); sekme editör yüzeyine akarak bağlanır, RTL'de aynalanır.
Etkin sekme çubukta görünür alana `scrollTo` ile 12 px paylı kaydırılır (`scrollIntoView` giriş animasyonunun ölçeğinden etkilenip sağ yuvarlamayı kırpıyordu); listenin sonunda 8 px boşluk (`w-2`) kalır.

**Etkinlik çubuğu ölçeği (18.11.2026, son):** simge 24 px (eski boyut), düğme 42 px, şerit 48 px (eski 50 → yalnız simge–kenarlık boşluğu azaldı: iç genişlik 46, düğme 42). Dar ekranda kenar çubuğu bindirme ofseti 50 px.

**Kenar çubuğu–editör boşluğu (18.11.2026):** 8 → 12 px (`.sidebar-gap`, tutamaç ortada); diğer tutamaçlar 6 px kalır.

**Boşluk düzeltmesi (18.11.2026):** kenar çubuğu kapalıyken etkinlik çubuğu ile editör arası boşluk artık 10 px (2 px + sabit 8 px `.sidebar-gap`; önceden 2 px'ti), açıkken kenar çubuğu–editör boşluğu 12 → 8 px. `.sidebar-gap` genişliği sabit (dar ekranda 4 px), tutamaç yalnız açıkken çizilir.

## Sekme çubuğu: yeni sekme (+) düğmesi yok (23.11.2026)
Sekme çubuğunda yeni sekme (+) düğmesi bulunmaz (kurucu isteği). Yeni dosya Ctrl+N, Dosya menüsü, komut paleti veya karşılama/boş editör ekranındaki "Yeni dosya" ile açılır; sekme çubuğuna yeni düğme eklenmez.

## Başlık çubuğu: Fluent gruplama (23.11.2026)
Üst çubuk üç bölge: sol (logo · `hdr-sep` · menü başlıkları `h-7 rounded-md`), orta (dolgulu arama hapı `bg-white/[0.05]`, solda yapay zekâ bölmesi), sağ (iki `hdr-group` kapsülü: klasör/önizleme/ayarlar ve kenar çubuğu/alt panel; `hdr-sep`; pencere denetimleri). `hdr-btn` 30×24, etkinde `indigo-500/24` zemin; `hdr-sep` 1×16 px, `zinc-50` %14. Menü başlıkları genişlediği için tek `Menü` düğmesine geçiş eşiği 1280 → 1340 px. Kapat düğmesi çerçeve köşesine uyar (`rounded-e`). Gölge/degrade eklenmedi (kural 9).

### Başlık çubuğu: duyarlılık (23.11.2026)
Başlık çubuğu `@container` olup `grid` yerine `flex` kullanır: sol ve sağ bölge `flex-1 basis-0`, orta bölge ortalı. Kap sorguları başlık genişliğine bakar (kök yazı 13 px olduğundan `@xl` ≈ 468 px, `@3xl` ≈ 624 px): `< @xl` arama yalnız simge (`w-9`) ve yapay zekâ bölmesi gizli; `< @3xl` klasör/önizleme/ayarlar grubu gizli (eylemler menü ve kısayollarda durur); `<= 380 px` ayırıcı ve düğme boşlukları daralır. Kenar çubuğu ve alt panel düğmeleri her zaman görünür. **Tuzak:** katmansız `.hdr-group { display }` Tailwind `hidden`'ı ezdiği için `display` sınıftan gelir. Menü başlıkları `vw < 1340` altında tek `Menü` düğmesine toplanır. 360/520/640/900/1500 px'te web önizlemede doğrulandı.

## Üst çubuk bölgeleri (23.11.2026)
Sol (logo + menü) `flex-1 basis-0 min-w-0` ilk küçülür; orta arama hapı `shrink`, genişlik `clamp(180px,24cqw,340px)` (`@xl` altında yalnız simge); sağ bölge `min-w-fit` ve içi `shrink-0`: düğmeler ve pencere denetimleri hiçbir genişlikte taşmaz/kırpılmaz.

**Üst çubuk üç ayrı kart (23.11.2026, kurucu isteği):** `header` düz kapsayıcı (`gap-[var(--frame)]`); sol (logo+menü), orta (arama+AI) ve sağ (düğmeler+pencere denetimleri) her biri `float-card border border-nv-border bg-nv-side rounded-[var(--frame-r)]`. Editör temasında `minimapSlider.*`, `scrollbar.shadow` ve `editorOverviewRuler.*` renkleri açıkça tanımlı (varsayılan beyazımsı kaydırıcı kalktı).

**İçeriği kadar kart (23.11.2026):** sol ve sağ kart `flex-1` değil; aralarındaki `flex-1` boşluklar kartsızdır (sürükleme alanı). Orta kart iki boşluğun arasında kalır.

**Tam ortalı arama (23.11.2026):** `header` `grid-cols-[minmax(0,1fr)_auto_minmax(max-content,1fr)]`: sol kart `justify-self-start`, sağ kart `justify-self-end`, orta arama kartı `auto` sütunda geometrik merkezde. Önceki `flex-1` boşluk elemanları kalktı.
