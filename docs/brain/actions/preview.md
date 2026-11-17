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

## Denetim düzeltmeleri (17.11.2026)
Bağlantı açma yalnız gerçek tıklamadan (`isTrusted`), 1,5 sn hız sınırlı, yalnız https (loopback'te http), kimlik bilgisiz. URL kipinde `allow-same-origin` kaldırıldı, `referrerPolicy=no-referrer`; köprü mesajları yalnız `srcDoc` çerçevesinden kabul edilir. Köprü hata metinleri 8 dilde (`pvBridge*`).

## Denetim düzeltmeleri, ikinci dalga (17.11.2026)
Önizleme içeriği `preview:put` ile ana süreçte kısa ömürlü (128 bit rastgele kimlik, en çok 16 kayıt, 1 saat, 8 MB) bellek deposuna konur ve `nova-preview://<kimlik>/` ile sunulur; `preview:drop` siler. Yanıt başlıkları: gevşek önizleme CSP'si, `no-store`, `nosniff`, `no-referrer`. Yalnız `localhost` ve `127.0.0.1` URL kipi (`[::1]` CSP'de geçersiz olduğu için kalktı). Electron dışında eski `srcDoc` yoluna düşer (yalnız salt tarayıcı dev). Test: `preview-csp.test.cjs`.
