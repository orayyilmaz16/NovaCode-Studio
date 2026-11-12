---
action: preview
purpose: HTML/SVG/Markdown önizleme, yerel sunucu önizleme, Çalıştır (F5) ve çalıştırma ayarları
reads: [CLAUDE, PROJECT, STATE, security-kvkk, settings, i18n]
writes: [CHANGELOG, DECISIONS, STATE, settings]
triggers: ["önizleme", "preview", "localhost", "F5", "çalıştır", "iframe", "sandbox"]
---
# Aksiyon: Önizleme ve Çalıştır

## Önizleme (`src/components/Preview.tsx`, `src/services/previewKind.ts`)
- Tür: `html` / `svg` / `md` / css-js (kardeş `index.html`'e bakar). `.html` açılınca panel kendiliğinden açılır (ayar `previewAutoOpen`; dosya başına bir kez, genişlik ≥1100, başka sağ panel yoksa).
- HTML: `DOMParser` ile yerel CSS/JS/görsel/yazı tipi diskten gömülür (editördeki kaydedilmemiş içerik önceliklidir); 350 ms debounce ile yeniden kurulur, dosya izleyici diskteki değişimde yeniler.
- **Güvenlik:** iframe `sandbox` içinde `allow-same-origin` YOK; köprü betiği yalnız konsol/hata/bağlantı tıklamasını iletir. Disk okuma `fs:readDataUrl` (yalnız çalışma klasörü/onaylı dosya, uzantı izin listesi, ≤4 MB).
- Yerel sunucu: Terminal çıktısındaki `localhost` adresi `nova:localhost` olayıyla yakalanır; yalnız loopback adresleri önizlenir ("Önizle" çipi).

## Çalıştır
- Menü: Açık dosyayı çalıştır (F5), Önizleme, Çalıştırma ve önizleme ayarları. npm/cargo/dotnet komutu YOKTUR (bilinçli sadeleştirme).
- Kaydedilmiş dosya terminalde çalışır (`terminalBridge.runCommandFor`, `{file}`/`{dir}` şablonu; ayarlar `runCommand*`); kaydedilmemiş JS sandbox iframe'de (`runSandboxed`), `new Function` kullanılmaz.
- Ayarlar kategorisi `run`: `previewAutoOpen`, `runSaveBefore`, `runClearTerminal`, `runCommandNode/Ts/Python/Go/Php`.

## Doğrulama
Gerçek Electron + CDP ile uçtan uca: otomatik açılma, gömme, sandbox, canlı yenileme, konsol rozeti, localhost yakalama, F5.
