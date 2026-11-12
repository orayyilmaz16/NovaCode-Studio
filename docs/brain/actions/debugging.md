---
action: debugging
purpose: Hata ayıklayıcı (Node/JavaScript): kesme noktası, adım adım, değişkenler, çağrı yığını
reads: [CLAUDE, PROJECT, security-kvkk, i18n, settings]
writes: [CHANGELOG, DECISIONS, testing]
triggers: ["debug", "hata ayıklama", "kesme noktası", "breakpoint", "F5", "inspector"]
---
# Aksiyon: Hata ayıklama

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Ana süreç | `electron-debug.cjs` | V8 Inspector'a CDP ile (`ws`) bağlanır. Programı `process.execPath` + `ELECTRON_RUN_AS_NODE=1` + `--inspect-brk=0` ile başlatır (rastgele kapı, yalnız 127.0.0.1) |
| IPC | `dbg:start|stop|setBreakpoints|resume|stepOver|stepInto|stepOut|pause|scopes|properties|evaluate` | Hepsi açık (explicit) işleyici; olay: `dbg:event` (paused, resumed, output, exit, bpVerified) |
| Durum | `src/services/debugStore.ts` | Renderer deposu; `initDebug(root)` |
| Editör | `src/services/debugEditor.ts` | Oluk (glyph) kesme noktası, F9, duraklanan satır vurgusu |
| Panel | `src/components/DebugPanel.tsx` | Değişkenler, çağrı yığını (iç çerçeveler gizli), çıktı, ifade değerlendirme |
| Kısayollar | `src/App.tsx` | F5 (başlat/devam), F10, F11, Shift+F11, Shift+F5, Çalıştır menüsü |

## Güvenlik kuralları
- Yalnız `.js/.mjs/.cjs` ve **çalışma klasörünün içindeki** dosya (realpath denetimi) başlatılır.
- Kullanıcının kendi dosyasını çalıştırır; ağdan erişilebilir kapı açılmaz (127.0.0.1 + rastgele kapı).
- Uygulama kapanırken `stopAll` çocuk süreçleri öldürür.
- Veri dışarı çıkmaz; yurt dışı aktarım yok.

## Sınırlar (bilinen)
Yalnız Node/JavaScript. TypeScript için kaynak haritası yok (derlenmiş `.js` ayıklanır). Koşullu kesme noktası ve izleme (watch) listesi yok.

## Test
`scripts/tests/debug.test.cjs` (gerçek Node süreci: duraklama, adım, değişken, ifade, çıkış, yol reddi). Arayüz: [[testing]] gizli profil + CDP.
Yeni metin [[i18n]] ile `src/i18n/uiTextDev.ts` içine (8 dil).
