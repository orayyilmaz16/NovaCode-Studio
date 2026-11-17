<!-- Bu dosya scripts/audit-scan.mjs tarafından otomatik üretilir; elle düzenleme. -->
# Denetim raporu (otomatik)

Son tarama: 17.11.2026 · Kaynak: `npm run audit` (her Claude turunda ve CI'da haftalık/her push'ta) · Derin/elle bulgular: [[BACKLOG]] · Kural: [[audit]]

## Özet
| Alan | Bulgu |
|---|---|
| Güvenlik | kritik 0 · yüksek 0 · orta 6 · düşük 18 |
| Performans | kritik 0 · yüksek 0 · orta 3 · düşük 57 |
| Kalite | kritik 0 · yüksek 0 · orta 0 · düşük 9 |

Bu sezgisel taramadır (regex); yanlış pozitif olabilir. Gerçek açıklar ve ayrıntılı bulgular [[BACKLOG]] içinde doğrulanmış olarak tutulur. Bağımlılık açıkları `npm audit` ve CodeQL/gitleaks ile ayrıca taranır ([[ci-cd]]).

## Önceki taramaya göre
- Yeni/artan: `PERF-LS-WRITE` src/services/collabRoom.ts, `PERF-LS-WRITE` src/services/session.ts, `PERF-SYNC-FS` electron-ai.cjs, `PERF-SYNC-FS` electron-paths.cjs
- Giderilen: `SEC-SANDBOX electron-main.cjs`, `Q-EMPTY-CATCH electron-main.cjs`, `Q-HARDMS src/components/FileTree.tsx`, `Q-HARDMS src/components/SplashScreen.tsx`, `SEC-ACTION-PIN .github/workflows/ci-cd.yml`, `SEC-ACTION-PIN .github/workflows/security.yml`

## Güvenlik
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | SEC-CSP | `index.html:1` | Content-Security-Policy tanımı yok (index.html ve ana süreçte) |
| orta | SEC-HTML | `src/components/Preview.tsx:177` | Ham HTML basımı; DOMPurify ile temizlendiğini doğrula |
| orta | SEC-OPENEXT | `electron-github.cjs:189,245` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et (2×) |
| orta | SEC-OPENEXT | `electron-main.cjs:59` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| orta | SEC-OPENEXT | `electron-update.cjs:159` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| düşük | SEC-HTTP | `electron-ai.cjs:136` | Şifresiz http:// adresi |
| düşük | SEC-IPC-NOEVT | `electron-ai.cjs:1032` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-ext.cjs:300,311` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (2×) |
| düşük | SEC-IPC-NOEVT | `electron-github.cjs:155,168,231…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |
| düşük | SEC-IPC-NOEVT | `electron-llm.cjs:241` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-main.cjs:398,413,463` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (3×) |
| düşük | SEC-IPC-NOEVT | `electron-pty.cjs:111` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-search.cjs:91` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-update.cjs:98,122,128…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |

## Performans
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | PERF-BIGFILE | `src/App.tsx:1` | 1607 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-BIGFILE | `src/i18n/uiText.ts:1` | 1636 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-LISTENER-LEAK | `src/components/Preview.tsx:1` | addEventListener (4) > removeEventListener (1): temizlenmeyen dinleyici olabilir |
| düşük | PERF-LS-WRITE | `src/App.tsx:964` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ChatSessions.tsx:46` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ResizeHandle.tsx:60` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/aiClient.ts:144` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/collabRoom.ts:32,45` | localStorage yazımı: sık tetikleniyorsa debounce et (2×) |
| düşük | PERF-LS-WRITE | `src/services/debugStore.ts:49` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/session.ts:75` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/settings.ts:117` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-SYNC-FS | `electron-ai.cjs:60,66,148…(+19)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (22×) |
| düşük | PERF-SYNC-FS | `electron-debug.cjs:120` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-ext.cjs:233,234,249` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-git.cjs:253,256,401` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-github.cjs:25,38,52…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-llm.cjs:33,94,114` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-lsp.cjs:47` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-main.cjs:296` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-paths.cjs:127` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-pty.cjs:32,61` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (2×) |
| düşük | PERF-SYNC-FS | `electron-secrets.cjs:26,27,46…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-term.cjs:94` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |

## Kalite ve arayüz
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| düşük | Q-ANY | `src/App.tsx:464,541` | `any` kullanımı (strict tip güvenliği) (2×) |
| düşük | Q-ANY | `src/components/EditorArea.tsx:54,453` | `any` kullanımı (strict tip güvenliği) (2×) |
| düşük | Q-CONSOLE | `src/mockFiles.ts:89,91,112` | Kalan console.log (3×) |
| düşük | Q-EMPTY-CATCH | `src/components/Preview.tsx:57` | Boş catch: hata yutuluyor |
| düşük | Q-TODO | `src/i18n/uiTextAi.ts:348` | Açık TODO/FIXME |

## Ölçümler
- En büyük kaynak dosyalar: `src/i18n/uiText.ts` 1636, `src/App.tsx` 1607, `electron-ai.cjs` 1046, `src/components/FileTree.tsx` 932, `src/components/GitPanel.tsx` 883, `src/components/AIAssistant.tsx` 825
- Üretim paketi (dist varsa): toplam JS 2780 KB; en büyük: index-DTLVzuxU.js 438 KB, PtyView-CuFzAXiS.js 327 KB, fileIconLoaders-C_rfHEER.js 184 KB, uiText-azHSDOE1.js 171 KB
