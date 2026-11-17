<!-- Bu dosya scripts/audit-scan.mjs tarafından otomatik üretilir; elle düzenleme. -->
# Denetim raporu (otomatik)

Son tarama: 17.11.2026 · Kaynak: `npm run audit` (her Claude turunda ve CI'da haftalık/her push'ta) · Derin/elle bulgular: [[BACKLOG]] · Kural: [[audit]]

## Özet
| Alan | Bulgu |
|---|---|
| Güvenlik | kritik 0 · yüksek 0 · orta 5 · düşük 21 |
| Performans | kritik 0 · yüksek 0 · orta 3 · düşük 61 |
| Kalite | kritik 0 · yüksek 0 · orta 2 · düşük 10 |

Bu sezgisel taramadır (regex); yanlış pozitif olabilir. Gerçek açıklar ve ayrıntılı bulgular [[BACKLOG]] içinde doğrulanmış olarak tutulur. Bağımlılık açıkları `npm audit` ve CodeQL/gitleaks ile ayrıca taranır ([[ci-cd]]).

## Önceki taramaya göre
- Yeni/artan: yok
- Giderilen: yok

## Güvenlik
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | SEC-HTML | `src/components/Preview.tsx:180` | Ham HTML basımı; DOMPurify ile temizlendiğini doğrula |
| orta | SEC-OPENEXT | `electron-github.cjs:189,245` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et (2×) |
| orta | SEC-OPENEXT | `electron-main.cjs:70` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| orta | SEC-OPENEXT | `electron-update.cjs:159` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| düşük | SEC-HTTP | `electron-ai.cjs:119` | Şifresiz http:// adresi |
| düşük | SEC-IPC-NOEVT | `electron-ai.cjs:1015` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-ext.cjs:300,311` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (2×) |
| düşük | SEC-IPC-NOEVT | `electron-github.cjs:155,168,231…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |
| düşük | SEC-IPC-NOEVT | `electron-llm.cjs:243` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-main.cjs:424,439,489` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (3×) |
| düşük | SEC-IPC-NOEVT | `electron-pty.cjs:116` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-search.cjs:216` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-trust.cjs:152,157,162` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (3×) |
| düşük | SEC-IPC-NOEVT | `electron-update.cjs:98,122,128…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |

## Performans
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | PERF-BIGFILE | `src/App.tsx:1` | 2329 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-BIGFILE | `src/i18n/uiText.ts:1` | 1636 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-LISTENER-LEAK | `src/components/Preview.tsx:1` | addEventListener (4) > removeEventListener (1): temizlenmeyen dinleyici olabilir |
| düşük | PERF-LS-WRITE | `src/App.tsx:1495` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ChatSessions.tsx:46` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ResizeHandle.tsx:60` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/aiClient.ts:144` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/collabRoom.ts:32,45,58` | localStorage yazımı: sık tetikleniyorsa debounce et (3×) |
| düşük | PERF-LS-WRITE | `src/services/debugStore.ts:49` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/keybindings.ts:282` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/session.ts:85` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/settings.ts:117` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-SYNC-FS | `electron-ai.cjs:131,137,193…(+17)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (20×) |
| düşük | PERF-SYNC-FS | `electron-debug.cjs:122` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-ext.cjs:233,234,249` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-git.cjs:273,276,421` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-github.cjs:25,38,52…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-llm.cjs:35,96,116` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-lsp.cjs:49` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-main.cjs:321` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-paths.cjs:127` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-pty.cjs:33,66` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (2×) |
| düşük | PERF-SYNC-FS | `electron-secrets.cjs:26,27,46…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-term.cjs:94` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-trust.cjs:36,41,119…(+1)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (4×) |

## Kalite ve arayüz
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | Q-I18N-HARD | `src/App.tsx:115` | JSX içinde sabit metin olabilir (8 dil kuralı) |
| orta | Q-I18N-HARD | `src/components/TimelinePanel.tsx:19` | JSX içinde sabit metin olabilir (8 dil kuralı) |
| düşük | Q-ANY | `src/App.tsx:742` | `any` kullanımı (strict tip güvenliği) |
| düşük | Q-ANY | `src/components/EditorArea.tsx:75,146,630` | `any` kullanımı (strict tip güvenliği) (3×) |
| düşük | Q-CONSOLE | `src/components/SnippetsEditor.tsx:11` | Kalan console.log |
| düşük | Q-CONSOLE | `src/mockFiles.ts:89,91,112` | Kalan console.log (3×) |
| düşük | Q-EMPTY-CATCH | `src/components/Preview.tsx:58` | Boş catch: hata yutuluyor |
| düşük | Q-TODO | `src/i18n/uiTextAi.ts:348` | Açık TODO/FIXME |

## Ölçümler
- En büyük kaynak dosyalar: `src/App.tsx` 2329, `src/i18n/uiText.ts` 1636, `electron-ai.cjs` 1029, `src/components/FileTree.tsx` 933, `src/components/GitPanel.tsx` 883, `src/components/AIAssistant.tsx` 835
- Üretim paketi (dist varsa): toplam JS 2809 KB; en büyük: index-CPtWP5yk.js 489 KB, PtyView-gL6gM7vC.js 327 KB, fileIconLoaders-W59Nxzuc.js 184 KB, uiText-azHSDOE1.js 171 KB
