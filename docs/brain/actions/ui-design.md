---
action: ui-design
purpose: Arayüz, tema, logo ve animasyon değişiklikleri
reads: [CLAUDE, PROJECT, i18n]
writes: [CHANGELOG, DECISIONS]
triggers: ["tasarım", "tema", "logo", "renk", "animasyon", "arayüz"]
---
# Aksiyon: Arayüz ve tasarım

## Tasarım dili
- VS Code "Dark Modern" çizgisi: **düz yüzeyler, cam/bulanıklık/gölge yığını yok.** Gradient yalnız logoda.
- Jetonlar `src/style.css` içindeki `@theme`: nötrler `zinc-*` (50→950), vurgu `indigo-*` (logodaki indigo-menekşe), yüzeyler `nv-editor` `#1f1f1f`, `nv-side` `#181818`, `nv-input`, `nv-hover`, `nv-active`, `nv-border`.
- Yeni bileşende sabit hex kullanma; jeton sınıfı kullan (`bg-nv-side`, `border-nv-border`, `text-zinc-400`, `bg-indigo-600`).
- Yazı tipleri: sistem `Segoe UI Variable`, kod `Cascadia Code`. Dış font yüklenmez (gizlilik).

## Düzen
Başlık çubuğu (36 px, özel; pencere düğmeleri sistemden) → etkinlik çubuğu (48 px) → kenar çubuğu → editör (sekmeler + yol göstergesi) → alt panel → durum çubuğu (22 px). Kısayol: Ctrl+B kenar çubuğu.

## Hareket
Tanımlı sınıflar: `animate-fade-in`, `animate-sidebar-in`, `animate-panel-up`, `animate-tab-in`, `ab-item`, `icon-btn`, `status-item`, logo çizim animasyonu. Süre 120–250 ms, `ease-out-soft`. `prefers-reduced-motion` ile hepsi kapanır; bunu bozma.

## Logo ve simgeler
- Kaynak: `public/logo.svg` (arka plansız; kod ayracı + yapay zekâ kıvılcımı, indigo→turkuaz). `public/favicon.svg` aynıdır. React: `src/components/Logo.tsx`.
- Uygulama simgesi `public/icon.png` (512, şeffaf): `npx electron scripts/make-icons.cjs`. Paketleme: `build.win.icon`.
- Logo değişirse `Logo.tsx`, `favicon.svg`, `icon.png` birlikte güncellenir.

## Erişilebilirlik
Simge düğmelerine `aria-label`/`title`; odak halkası `:focus-visible`; kontrast ≥ 4.5:1. Metinler [[i18n]] ile 8 dilde.

## Doğrulama
[[testing]] + uygulamayı çalıştırıp görsel kontrol (yalnız uygulamanın kendi penceresi; ekran yakalama başka pencereleri içermemeli).
