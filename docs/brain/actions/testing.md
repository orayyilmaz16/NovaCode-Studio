---
action: testing
purpose: Değişikliği doğrulamak: tip, derleme, birim ve entegrasyon testleri, uygulamayı çalıştırma
reads: [CLAUDE, AGENT, STATE]
writes: [AGENT]
triggers: ["test", "doğrula", "build", "tsc"]
---
# Aksiyon: Doğrulama

## Sıra (en fazla 3 tur)
1. `npx tsc --noEmit` — tip kontrolü (build tipleri denetlemez).
2. `npm test` — `scripts/tests/git.test.cjs` (durum, sahneleme, commit, dallar, kilit, yol güvenliği) ve `sync.test.cjs` (yerel bare depoyla fetch/pull/push, ayrışma).
3. `npm run brain:check` — md bağlantıları, aksiyon başlıkları, IPC eşleşmesi, i18n 8 dil.
4. `npm run build` + `node scripts/check-bundle.mjs` — bütçe: JS 600 KB (gzip 200), CSS 100 KB.
5. `npm audit --omit=dev --audit-level=moderate`.
6. Uygulamayı çalıştır: Vite (`npx vite --port 5173 --strictPort`) + `electron .` (`NODE_ENV=development`). Sayfa durumu için `--remote-debugging-port` yalnız geçici kullanılır, iş bitince kapatılır.

## Test yazarken
- Electron'u taklit eden yardımcı: testler `electron`'u `Module._load` ile taklit eder; gerçek `git` ve geçici dizinler kullanılır.
- Her yeni IPC kanalı için en az bir test ve bir "yetkisiz/bozuk girdi reddedilir" testi.
- **Ayrı profil:** çalışan uygulamayı bozmamak ve kullanıcının ayarlarına dokunmamak için testi `electron . --user-data-dir=<geçici dizin> --remote-debugging-port=<port>` ile ayrı örnekte çalıştır; işin bitince yalnız kendi süreçlerini kapat. Kullanıcının açık penceresinde ayar değiştirme.
- **Canlı ayar testi:** DevTools protokolüyle ayarı değiştir (React uyumlu: `HTMLSelectElement.prototype.value` setter + `change` olayı), sonra etkisini ölç: `document.documentElement.dataset.theme`, CSS değişkeni, `monaco.editor.getEditors()[n].getRawOptions()`.
- Görsel doğrulamada yalnız uygulamanın kendi içeriğini yakala (DevTools `Page.captureScreenshot`); ekran yakalama başka pencereleri içerebilir.

## Çıktı
Sonucu [[AGENT]] **Durum**'a tek satır yaz (ne doğrulandı, ne doğrulanamadı).
