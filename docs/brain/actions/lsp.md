---
action: lsp
purpose: Dil sunucuları (LSP): Monaco'nun yerleşik desteği olmayan diller için tamamlama, üzerine gelme, tanıma git, tanılama
reads: [CLAUDE, PROJECT, security-kvkk, i18n, settings]
writes: [CHANGELOG, DECISIONS, testing]
triggers: ["lsp", "dil sunucusu", "language server", "pyright", "rust-analyzer", "gopls", "clangd"]
---
# Aksiyon: Dil sunucuları (LSP)

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Ana süreç | `electron-lsp.cjs` | İzinli sunucu tablosu, stdio üzerinden Content-Length JSON-RPC, `initialize`, belge senkronu, yöntem izin listesi |
| IPC | `lsp:status|start|notify|request` + olay `lsp:event` (`state`, `diagnostics`) | Yollar çalışma klasörü içinde olmalı |
| İstemci | `src/services/lspClient.ts` | `bindLsp(editor, path, enabled)`; Monaco tamamlama/hover/tanım sağlayıcıları; `nova:open-file` ile başka dosyaya git |
| Durum | `src/services/lspStore.ts` | Durum çubuğu öğesi (`useLsp`) |
| Bağlantı | `EditorArea.tsx` (`setLspMonaco`, `bindLsp`), `App.tsx` (durum çubuğu, `nova:open-file`) | Ayar `lspEnabled` (editor, varsayılan açık) |

## Desteklenen diller
python (pyright / pylsp), rust (rust-analyzer), go (gopls), c/cpp (clangd), csharp (csharp-ls), php (intelephense), ruby (solargraph), lua (lua-language-server), yaml (yaml-language-server). JS/TS/JSON/CSS/HTML Monaco'nun kendi hizmetini kullanır.

## Güvenlik (gevşetilmez)
- Sunucu **yalnız kullanıcının PATH'inden** çözülür; proje içindeki `node_modules/.bin` vb. çalıştırılmaz (kötü niyetli proje kod çalıştıramasın). Test bunu doğrular.
- Windows'ta yalnız `.exe/.cmd/.bat`; `.cmd` `cmd.exe /d /s /c` ile.
- İzinsiz LSP yöntemi (ör. `workspace/executeCommand`) reddedilir; çalışma klasörü dışı yol reddedilir.
- Kod yalnız yerel sunucu sürecine gider; ağ/yurt dışı aktarım yok. Kurulu değilse durum çubuğunda kurulum ipucu gösterilir; uygulama kendisi kurmaz.
- Çıkışta süreç ağacı kapatılır (`taskkill /T /F`).

## Test
`scripts/tests/lsp.test.cjs`: doğrulama, güvenlik, ve PATH'te pyright varsa gerçek tanılama/hover/tamamlama. Yalnız pyright ile denendi; diğer sunucular aynı protokolü kullanır ama gerçek denemesi yapılmadı. `NOVA_TEST_PATH` ile ek PATH verilebilir. Bkz. [[testing]].
