<!-- Bu dosya scripts/audit-scan.mjs tarafından otomatik üretilir; elle düzenleme. -->
# Denetim raporu (otomatik)

Son tarama: 23.11.2026 · Kaynak: `npm run audit` (her Claude turunda ve CI'da haftalık/her push'ta) · Derin/elle bulgular: [[BACKLOG]] · Kural: [[audit]]

## Özet
| Alan | Bulgu |
|---|---|
| Güvenlik | kritik 0 · yüksek 0 · orta 5 · düşük 23 |
| Performans | kritik 0 · yüksek 0 · orta 2 · düşük 74 |
| Kalite | kritik 0 · yüksek 0 · orta 3 · düşük 10 |

Bu sezgisel taramadır (regex); yanlış pozitif olabilir. Gerçek açıklar ve ayrıntılı bulgular [[BACKLOG]] içinde doğrulanmış olarak tutulur. Bağımlılık açıkları `npm audit` ve CodeQL/gitleaks ile ayrıca taranır ([[ci-cd]]).

## Önceki taramaya göre
- Yeni/artan: yok
- Giderilen: yok

## Güvenlik
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | SEC-HTML | `src/components/Preview.tsx:184` | Ham HTML basımı; DOMPurify ile temizlendiğini doğrula |
| orta | SEC-OPENEXT | `electron-github.cjs:197,253` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et (2×) |
| orta | SEC-OPENEXT | `electron-main.cjs:70` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| orta | SEC-OPENEXT | `electron-update.cjs:159` | openExternal: URL şeması (yalnız https/http) doğrulanıyor mu kontrol et |
| düşük | SEC-HTTP | `electron-ai.cjs:118` | Şifresiz http:// adresi |
| düşük | SEC-IPC-NOEVT | `electron-ai.cjs:965,968,982` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (3×) |
| düşük | SEC-IPC-NOEVT | `electron-ext.cjs:318,329` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (2×) |
| düşük | SEC-IPC-NOEVT | `electron-github.cjs:156,169,175…(+2)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (5×) |
| düşük | SEC-IPC-NOEVT | `electron-main.cjs:449,464,514` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (3×) |
| düşük | SEC-IPC-NOEVT | `electron-pty.cjs:219` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-search.cjs:245` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor |
| düşük | SEC-IPC-NOEVT | `electron-trust.cjs:152,157,162` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (3×) |
| düşük | SEC-IPC-NOEVT | `electron-update.cjs:98,122,128…(+1)` | IPC işleyicisi gönderen (event.senderFrame) doğrulamıyor (4×) |

## Performans
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | PERF-BIGFILE | `src/App.tsx:1` | 2466 satır: bölünmeli / memo ile ayrıştırılmalı |
| orta | PERF-LISTENER-LEAK | `src/components/Preview.tsx:1` | addEventListener (4) > removeEventListener (1): temizlenmeyen dinleyici olabilir |
| düşük | PERF-DYN-RE | `src/components/Preview.tsx:58` | Döngüde dinamik RegExp üretimi olabilir |
| düşük | PERF-DYN-RE | `src/services/testParse.ts:53,62,70` | Döngüde dinamik RegExp üretimi olabilir (3×) |
| düşük | PERF-LS-WRITE | `src/App.tsx:1562` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ChatSessions.tsx:46` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/components/ResizeHandle.tsx:63` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/aiClient.ts:130` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/collabRoom.ts:32,45,58` | localStorage yazımı: sık tetikleniyorsa debounce et (3×) |
| düşük | PERF-LS-WRITE | `src/services/debugStore.ts:49` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/keybindings.ts:282` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/session.ts:85` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-LS-WRITE | `src/services/settings.ts:119` | localStorage yazımı: sık tetikleniyorsa debounce et |
| düşük | PERF-SYNC-FS | `electron-ai.cjs:130,136,192…(+19)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (22×) |
| düşük | PERF-SYNC-FS | `electron-debug.cjs:122` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-ext.cjs:251,252,267` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-git.cjs:284,287,445` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (3×) |
| düşük | PERF-SYNC-FS | `electron-github.cjs:26,39,53…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-lsp.cjs:49` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-main.cjs:328` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-paths.cjs:127` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-pty.cjs:34,52,84…(+3)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (6×) |
| düşük | PERF-SYNC-FS | `electron-secrets.cjs:26,27,46…(+2)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (5×) |
| düşük | PERF-SYNC-FS | `electron-ssh-core.cjs:94,99,116…(+1)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (4×) |
| düşük | PERF-SYNC-FS | `electron-ssh.cjs:100,102` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (2×) |
| düşük | PERF-SYNC-FS | `electron-term.cjs:94` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) |
| düşük | PERF-SYNC-FS | `electron-trust.cjs:36,41,119…(+1)` | Ana süreçte senkron fs/süreç çağrısı (IPC işleyicisinde olay döngüsünü bloklar) (4×) |

## Kalite ve arayüz
| Önem | Kural | Konum | Sorun |
|---|---|---|---|
| orta | Q-I18N-HARD | `src/App.tsx:121` | JSX içinde sabit metin olabilir (8 dil kuralı) |
| orta | Q-I18N-HARD | `src/components/AIAssistant.tsx:322` | JSX içinde sabit metin olabilir (8 dil kuralı) |
| orta | Q-I18N-HARD | `src/components/TimelinePanel.tsx:19` | JSX içinde sabit metin olabilir (8 dil kuralı) |
| düşük | Q-ANY | `src/App.tsx:802` | `any` kullanımı (strict tip güvenliği) |
| düşük | Q-ANY | `src/components/EditorArea.tsx:77,161,654` | `any` kullanımı (strict tip güvenliği) (3×) |
| düşük | Q-CONSOLE | `src/components/SnippetsEditor.tsx:11` | Kalan console.log |
| düşük | Q-CONSOLE | `src/mockFiles.ts:89,91,112` | Kalan console.log (3×) |
| düşük | Q-EMPTY-CATCH | `src/components/Preview.tsx:62` | Boş catch: hata yutuluyor |
| düşük | Q-TODO | `src/i18n/uiTextAi.ts:294` | Açık TODO/FIXME |

## Ölçümler
- En büyük kaynak dosyalar: `src/App.tsx` 2466, `src/i18n/uiTextTheme.ts` 1128, `electron-ai.cjs` 996, `src/components/FileTree.tsx` 933, `src/components/GitPanel.tsx` 884, `electron-main.cjs` 852
- Üretim paketi (dist varsa): toplam JS 2993 KB; en büyük: index-mlGtbcJ_.js 643 KB, PtyView-Bu4K99UB.js 327 KB, fileIconLoaders-DykbwpTF.js 184 KB, uiTextTheme-D2IREBCH.js 136 KB
