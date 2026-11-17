<!-- Bu dosya scripts/audit-scan.mjs tarafından otomatik üretilir; elle düzenleme. -->
# Denetim raporu (otomatik)

Son tarama: 17.11.2026 · Kaynak: `npm run audit` (her Claude turunda ve CI'da haftalık/her push'ta) · Derin/elle bulgular: [[BACKLOG]] · Kural: [[audit]]

## Özet
| Alan | Bulgu |
|---|---|
| Güvenlik | kritik 0 · yüksek 1 · orta 6 · düşük 21 |
| Performans | kritik 0 · yüksek 0 · orta 3 · düşük 65 |
| Kalite | kritik 0 · yüksek 0 · orta 0 · düşük 13 |

Bu sezgisel taramadır (regex); yanlış pozitif olabilir. Gerçek açıklar ve ayrıntılı bulgular [[BACKLOG]] içinde doğrulanmış olarak tutulur. Bağımlılık açıkları `npm audit` ve CodeQL/gitleaks ile ayrıca taranır ([[ci-cd]]).

## Önceki taramaya göre
- Yeni/artan: yok
- Giderilen: yok

## Güvenlik
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| yüksek | SEC-SANDBOX | `electron-main.cjs:35` | BrowserWindow sandbox kapalı (renderer ele geçirilirse etki büyür) |
| orta | SEC-CSP | `index.html:1` | Content-Security-Policy tanımı yok (index.html ve ana süreçte) |
| orta | SEC-HTML | `src/components/Preview.tsx:155` | Ham HTML basımı; DOMPurify ile temizlendiğini doğrula |
| orta | SEC-OPENEXT | `electron-github.cjs:185,241` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et (2×) |
| orta | SEC-OPENEXT | `electron-main.cjs:72` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| orta | SEC-OPENEXT | `electron-update.cjs:158` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| düşük | SEC-ACTION-PIN | `.github/workflows/ci-cd.yml:138` | 3. parti action sürüm etiketiyle çağrılıyor (SHA'ya sabitle): softprops/action-gh-release |
| düşük | SEC-ACTION-PIN | `.github/workflows/security.yml:34` | 3. parti action sürüm etiketiyle çağrılıyor (SHA'ya sabitle): gitleaks/gitleaks-action |
| düşük | SEC-HTTP | `electron-ai.cjs:41` | Şifresiz http:// adresi |
| düşük | SEC-IPC-NOEVT | `electron-ai.cjs:876` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-ext.cjs:300,311` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (2×) |
| düşük | SEC-IPC-NOEVT | `electron-github.cjs:153,166,227…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |
| düşük | SEC-IPC-NOEVT | `electron-llm.cjs:225` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-main.cjs:206,257,272…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |
| düşük | SEC-IPC-NOEVT | `electron-pty.cjs:111` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-search.cjs:63` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-update.cjs:97,121,127…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |

## Performans
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | PERF-BIGFILE | `src/App.tsx:1` | 1606 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-BIGFILE | `src/i18n/uiText.ts:1` | 1636 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-LISTENER-LEAK | `src/components/Preview.tsx:1` | addEventListener (4) > removeEventListener (1): temizlenmeyen dinleyici olabilir |
| düşük | PERF-LS-WRITE | `src/App.tsx:963` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ChatSessions.tsx:46` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ResizeHandle.tsx:60` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/aiClient.ts:144` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/debugStore.ts:49` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/settings.ts:117` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-SYNC-FS | `electron-ai.cjs:53,59,113…(+14)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (17×) |
| düşük | PERF-SYNC-FS | `electron-debug.cjs:120` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-ext.cjs:233,234,249` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-git.cjs:253,256,401` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-github.cjs:23,36,50…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-llm.cjs:30,84,104` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-lsp.cjs:47` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-main.cjs:179,227,237…(+15)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (18×) |
| düşük | PERF-SYNC-FS | `electron-pty.cjs:32,61` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (2×) |
| düşük | PERF-SYNC-FS | `electron-secrets.cjs:26,27,38…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-term.cjs:88` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |

## Kalite ve arayüz
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| düşük | Q-ANY | `src/App.tsx:463,540` | `any` kullanımı (strict tip güvenliği) (2×) |
| düşük | Q-ANY | `src/components/EditorArea.tsx:53,451` | `any` kullanımı (strict tip güvenliği) (2×) |
| düşük | Q-CONSOLE | `src/mockFiles.ts:89,91,112` | Kalan console.log (3×) |
| düşük | Q-EMPTY-CATCH | `electron-main.cjs:310` | Boş catch: hata yutuluyor |
| düşük | Q-EMPTY-CATCH | `src/components/Preview.tsx:50` | Boş catch: hata yutuluyor |
| düşük | Q-HARDMS | `src/components/FileTree.tsx:97` | Sabit ms (CLAUDE.md kural 9: motion jetonları kullan) |
| düşük | Q-HARDMS | `src/components/SplashScreen.tsx:29,32` | Sabit ms (CLAUDE.md kural 9: motion jetonları kullan) (2×) |
| düşük | Q-TODO | `src/i18n/uiTextAi.ts:348` | Açık TODO/FIXME |

## Ölçümler
- En büyük kaynak dosyalar: `src/i18n/uiText.ts` 1636, `src/App.tsx` 1606, `src/components/FileTree.tsx` 926, `src/components/GitPanel.tsx` 900, `electron-ai.cjs` 890, `src/components/AIAssistant.tsx` 821
- Üretim paketi (dist varsa): toplam JS 2757 KB; en büyük: index-CDaugKNq.js 435 KB, PtyView-D76Kv6u6.js 327 KB, fileIconLoaders-C_EZ8c5O.js 184 KB, uiText-CIaIeF4C.js 171 KB
