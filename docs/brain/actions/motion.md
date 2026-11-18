---
action: motion
purpose: Geçiş, animasyon, hover, after ve gecikme efektleri; tek hareket dili
reads: [CLAUDE, ui-design]
writes: [CHANGELOG, DECISIONS]
triggers: ["animasyon", "geçiş", "hover", "gecikme", "efekt", "hareket", "transition"]
---
# Aksiyon: Hareket ve etkileşim

**İlke:** sade, hızlı, anlamlı. Hareket durumu bildirir (hover, basma, giriş); süs için kullanılmaz. Düz yüzey, tek vurgu rengi, gölge yığını yok ([[ui-design]]). Arka plan, ızgara ve parıltı eklenmez.

## Jetonlar (`src/style.css`, `:root`)
| Jeton | Değer | Nerede |
|---|---|---|
| `--dur-fast` | 120 ms | basma, renk, kenarlık |
| `--dur-base` | 180 ms | hover kalkışı, ok kayması, alt çizgi |
| `--dur-slow` | 260 ms | panel, boyut, kaybolma |
| `--dur-enter` | 380 ms | sayfa/kart girişi |
| `--stagger` | 60 ms | kademeli girişte öğe başına gecikme |
| `--hover-delay` | 140 ms | ikincil bilgi hover sonrası gecikmesi |
| `--ease-out-soft` | cubic-bezier(.16,1,.3,1) | varsayılan eğri |
| `--ease-spring` | cubic-bezier(.34,1.4,.64,1) | yalnız küçük "geri tepme" |
| `--ease-inout` | cubic-bezier(.65,0,.35,1) | iki yönlü boyut, tema renk geçişi |
| `--r-sm` / `--r-md` / `--r-lg` | 4 / 6 / 8 px | köşe ölçeği: küçük öğe / düğme-sekme-girdi / menü-pencere |

Yeni geçişte sabit `ms` veya `cubic-bezier` yazma; jeton kullan. Süre 400 ms'yi geçmez.

## Yardımcı sınıflar (`@layer components`)
- `motion-press`: renk/kenarlık geçişi, basınca `scale(.97)`. Tüm tıklanabilir satır ve düğmeler.
- `motion-card`: kenarlık vurguya döner, zemin `nv-side`, 1 px kalkar, basınca geri iner. Kartlar için.
- `motion-rise` + `style={{ '--i': n }}`: kademeli giriş (`--i × --stagger + 80 ms`).
- `motion-arrow`: üst `.group` hover/odakta ok yana kayar; RTL'de aynalanır.
- `motion-hint`: kısayol/yol gibi ikincil bilgi; `.group` hover'ında `--hover-delay` sonra tam görünür.
- `motion-underline`: `::after` çizgisi hover'da soldan (RTL'de sağdan) çizilir.
- `btn-primary`, `btn-ghost`: sade düğmeler (32 px, düz zemin, basma geri bildirimi).
- `logo-shadow`: logoya temaya uyan gölge (koyu: siyah, açık: yumuşak gri).
- `nova-tab` (+ `nova-tab-close`): VS Code tarzı sekme. Üst vurgu çizgisi (`::before`) etkin sekmede ortadan açılır (`scaleX`), zemin/renk `--dur-base` ile döner, üst köşeler `--r-md`. Etkin sekme `aria-selected` ile belirlenir.
- `animate-editor-in`: yalnız opaklık, `--dur-base`; sekme değişince editör içeriği (ve ayarlar arka perdesi) yumuşakça belirir. Düzen kaymaz.
- `animate-dialog`: pencere/palet girişi (`translateY(-6px) scale(.985)` → yok). Komut paleti ve Ayarlar penceresi kullanır.
- Eski sınıflar durur: `animate-fade-in`, `animate-sidebar-in`, `animate-panel-up`, `animate-tab-in`, `animate-menu`, `icon-btn`, `ab-item`, `status-item`.

## Tema geçişi (koyu ↔ açık)
`SettingsContext.applyAppearance` tema **gerçekten değişince** (ilk yükleme hariç) `<html data-theme-fading>` koyar, 320 ms sonra kaldırır. `style.css` bu özniteliğle yalnız renk özelliklerini (`background-color`, `color`, `border-color`, `fill`, `stroke`) `--dur-slow` + `--ease-inout` ile geçirir; konum/boyut animasyonlarına dokunmaz. `data-motion="off"` ve `prefers-reduced-motion` iken çalışmaz. Monaco temasını kendisi değiştirir, bu geçişe dahil değildir. Bu, kural 2'nin (yalnız transform/opacity) bilinçli istisnasıdır: kısa ömürlü ve yalnız renk.

## Sekmeler ve editör
Sekme çubuğu `scroll-smooth`; etkin sekme çubuk dışında kalırsa `scrollIntoView({inline:'nearest'})` ile görünür alana gelir (`EditorArea.tsx`). Yeni sekme soldan hafif kayarak (`tabIn`) girer. Monaco: `roundedSelection`, `cursorSmoothCaretAnimation`, `smoothScrolling` ve `cursorBlinking: smooth` açık (ayarlardan kapatılabilir).

## Kurallar
1. **Önce yardımcıyı kullan**, yoksa jetonla yeni yardımcı ekle ve bu dosyayı güncelle.
2. Yalnız `transform` ve `opacity` animasyonla (istisna: tema renk geçişi, yukarıda); `width/height/top/left` animasyonu yalnız mevcut panel boyutlandırmasında.
3. Hover'a bağlı öğe klavye odağında da aynı görünür (`:focus-visible`).
4. Sürüklerken geçiş kapanır (`<html data-resizing>`).
5. `prefers-reduced-motion` ve `data-motion="off"` tüm süreleri sıfırlar (`style.css`); bunu bozma. Anlam yalnız harekette taşınmaz.
6. Tek yönlü, RTL uyumlu: `translateX` yönü `:dir(rtl)` ile aynalanır; `ms-/me-/text-start` kullan.
7. Gecikme yalnız ikincil bilgi içindir; ana eylem tepkisi gecikmeden başlar.

## Doğrulama
`npx tsc --noEmit`, uygulamada koyu/açık mod, Ayarlar → Animasyonlar kapalı, `prefers-reduced-motion` ve Arapça ile bak. Bkz. [[testing]].

## Denetim düzeltmeleri (17.11.2026)
`style.css` ve bileşenlerdeki sabit ms değerleri jetonlara çevrildi (`duration-(--dur-*)`); jetonda karşılığı olmayan süreler en yakın jetona veya `--dur-enter × n` ya da `--stagger` katına gitti. Açılış ekranı hazır olunca ~560 ms'de kapanır.

## Etkinlik çubuğu (18.11.2026)
`.ab-item` (30 px yuvarlak düğme): hover'da zemin `color-mix` ile %8 (`--dur-base`), etkinde %12; simge `--ease-spring` ile 1 px yukarı + 1,08 ölçek, basınca 0,9; etkin göstergesi (`::before`) ortadan `scaleY` (`--dur-slow`). **Gecikmeli ipucu** `::after` + `data-tip`: hover/`:focus-visible`'dan `--hover-delay` (140 ms) sonra 4 px yana kayarak belirir, basınca anında kapanır; RTL'de aynalanır. Yalnız transform/opacity/renk animasyonlanır; `data-motion="off"` ve reduced-motion süreleri sıfırlar.
