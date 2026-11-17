<!-- Bu dosya scripts/audit-scan.mjs tarafından otomatik üretilir; elle düzenleme. -->
# Denetim raporu (otomatik)

Son tarama: 17.11.2026 · Kaynak: `npm run audit` (her Claude turunda ve CI'da haftalık/her push'ta) · Derin/elle bulgular: [[BACKLOG]] · Kural: [[audit]]

## Özet
| Alan | Bulgu |
|---|---|
| Güvenlik | kritik 0 · yüksek 0 · orta 5 · düşük 18 |
| Performans | kritik 0 · yüksek 0 · orta 3 · düşük 57 |
| Kalite | kritik 0 · yüksek 0 · orta 1 · düşük 8 |

Bu sezgisel taramadır (regex); yanlış pozitif olabilir. Gerçek açıklar ve ayrıntılı bulgular [[BACKLOG]] içinde doğrulanmış olarak tutulur. Bağımlılık açıkları `npm audit` ve CodeQL/gitleaks ile ayrıca taranır ([[ci-cd]]).

## Önceki taramaya göre
- Yeni/artan: yok
- Giderilen: yok

## Güvenlik
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
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
| düşük | SEC-IPC-NOEVT | `electron-pty.cjs:116` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-search.cjs:91` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-update.cjs:98,122,128…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |

## Performans
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | PERF-BIGFILE | `src/App.tsx:1` | 1989 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-BIGFILE | `src/i18n/uiText.ts:1` | 1636 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-LISTENER-LEAK | `src/components/Preview.tsx:1` | addEventListener (4) > removeEventListener (1): temizlenmeyen dinleyici olabilir |
| düşük | PERF-LS-WRITE | `src/App.tsx:1287` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ChatSessions.tsx:46` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ResizeHandle.tsx:60` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/aiClient.ts:144` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/collabRoom.ts:32,45` | localStorage yazımı: sık tetikleniyorsa debounce et (2×) |
| düşük | PERF-LS-WRITE | `src/services/debugStore.ts:49` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/session.ts:75` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/settings.ts:117` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-SYNC-FS | `electron-ai.cjs:60,66,148…(+19)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (22×) |
| düşük | PERF-SYNC-FS | `electron-debug.cjs:121` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-ext.cjs:233,234,249` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-git.cjs:273,276,421` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-github.cjs:25,38,52…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-llm.cjs:33,94,114` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-lsp.cjs:48` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-main.cjs:296` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-paths.cjs:127` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-pty.cjs:33,66` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (2×) |
| düşük | PERF-SYNC-FS | `electron-secrets.cjs:26,27,46…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-term.cjs:94` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |

## Kalite ve arayüz
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | Q-I18N-HARD | `src/App.tsx:103` | JSX içinde sabit metin olabilir (8 dil kuralı) |
| düşük | Q-ANY | `src/App.tsx:559` | `any` kullanımı (strict tip güvenliği) |
| düşük | Q-ANY | `src/components/EditorArea.tsx:109,516` | `any` kullanımı (strict tip güvenliği) (2×) |
| düşük | Q-CONSOLE | `src/mockFiles.ts:89,91,112` | Kalan console.log (3×) |
| düşük | Q-EMPTY-CATCH | `src/components/Preview.tsx:57` | Boş catch: hata yutuluyor |
| düşük | Q-TODO | `src/i18n/uiTextAi.ts:348` | Açık TODO/FIXME |

## Ölçümler
- En büyük kaynak dosyalar: `src/App.tsx` 1989, `src/i18n/uiText.ts` 1636, `electron-ai.cjs` 1046, `src/components/FileTree.tsx` 932, `src/components/GitPanel.tsx` 883, `src/components/AIAssistant.tsx` 825
- Üretim paketi (dist varsa): toplam JS 2798 KB; en büyük: index--_MOkoi6.js 489 KB, PtyView-le7fvRnY.js 327 KB, fileIconLoaders-DWYbKhF0.js 184 KB, uiText-azHSDOE1.js 171 KB
