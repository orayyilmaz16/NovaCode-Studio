---
action: ai-assistant
purpose: Yapay zekâ asistanı: çoklu sağlayıcı, Ask/Agent modları, araçlar, oturumlar, görsel girdi, sesli dikte, özel komutlar
reads: [CLAUDE, PROJECT, STATE, security-kvkk, i18n, settings]
writes: [CHANGELOG, DECISIONS, STATE]
triggers: ["yapay zeka", "ai", "asistan", "agent", "ajan", "dikte", "ses", "claude", "ollama", "openai", "oturum"]
---
# Aksiyon: Yapay zekâ asistanı

Sağ panel (`Ctrl+Shift+L`, etkinlik çubuğundaki kıvılcım). Yalnız masaüstü uygulamasında çalışır: API anahtarı şifreli saklanabilsin diye web sürümünde panel bilgi mesajı gösterir.

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Motor (ana süreç) | `electron-ai.cjs` | Sağlayıcı bağdaştırıcıları, SSE akışı, agent döngüsü, araçlar, onay, dikte, özel komutlar |
| Arama | `electron-search.cjs` | Dosya listesi + metin arama (paletle ve `search_text` aracıyla ortak) |
| Gizli değer | `electron-secrets.cjs` | `aiKey_anthropic`, `aiKey_openai` şifreli saklanır; `readSecret` yalnız ana süreçte |
| Preload / tipler | `electron-preload.cjs`, `src/types.ts` | `ai.run/cancel/approve/transcribe/commands/onEvent`, `search.*`; `AiRunRequest`, `AiEvent` |
| Arayüz | `src/components/AIAssistant.tsx` | Oturumlar, mod, akış, araç kartları, onay, görsel, mikrofon, eğik çizgi komutları |
| İstemci | `src/services/aiClient.ts`, `useDictation.ts`, `editorBridge.ts` | Oturum deposu (localStorage), kayıt kancası, Monaco köprüsü (seçim/ekleme) |
| Ayarlar | `settingsSchema.json` → kategori `ai`; anahtar alanları `SettingsPage.tsx` (`AiKeys`) | Sağlayıcı, model, özel adres, mod, bağlam, onaylar, dikte |

## Sağlayıcılar
`anthropic` (Messages API, `x-api-key`), `openai` (Chat Completions, OpenAI uyumlu), `ollama` (yerel, anahtarsız, `http://localhost:11434/v1`). Kanonik ileti biçimi Anthropic blokları; OpenAI için `toOpenAIMessages` çevirir. Özel taban adres yalnız `https://` veya yerel `http://` (`safeBase`). Varsayılan modeller `aiClient.ts` → `DEFAULT_MODEL`.

## Modlar
- **Sor (ask):** araç yok; açık dosya/seçim bağlam olarak gider (`aiIncludeContext`).
- **Ajan (agent):** klasör açık olmalı. Araçlar: `list_dir`, `read_file`, `search_text`, `write_file`, `replace_in_file`, `run_command`. En çok 20 adım. Proje yönergesi: `<kök>/.nova/instructions.md` veya `AGENTS.md` (8 KB'a kadar) sistem istemine eklenir.

## Güvenlik (bozulmaz)
- Anahtar renderer'a hiç geçmez; hata iletilerinde `sk-…` maskelenir.
- Araçlar yalnız çalışma klasöründe: `resolveInRoot` (göreli yol + `realpath` ile sembolik bağ kaçışı). `.env`, `*.pem`, `id_rsa` vb. okunmaz/yazılmaz/aranmaz.
- `write_file`, `replace_in_file`: onay ister (`aiAutoApproveEdits` isteğe bağlı, varsayılan kapalı). `run_command`: **her zaman** onay; `aiAllowCommands` ile tümden kapatılır.
- Mikrofon izni yalnız `audio` ve yalnız ana pencereye (`setPermissionRequestHandler`).

## Dikte
`useDictation` MediaRecorder → `ai:transcribe` → `{base}/audio/transcriptions` (OpenAI anahtarı). Ses diske yazılmaz; en çok 120 sn / 25 MB. İlk mikrofon tıklaması `aiVoiceEnabled` ayarını açar (açık rıza metni arayüzde görünür); kapatılabilir.

## Özel komutlar (oturum eklentisi)
`<kök>/.nova/commands/<ad>.md` → `/ad argümanlar`. `{{args}}` yer tutucudur; yoksa argümanlar şablonun sonuna eklenir. Yerleşik: `/new`, `/ask`, `/agent`.

## KVKK
Kullanıcı kodu ve mesajlar seçilen sağlayıcıya gider (yurt dışı aktarım olabilir; Ollama hariç). Amaç: kullanıcının istediği yardım; hukuki sebep: kullanıcının açık talebi/rızası (kendi anahtarıyla bilinçli kullanım). Sohbet geçmişi yalnız cihazda (`nova.ai.sessions.v1`, en çok 30 oturum × 100 ileti, görseller kaydedilmez). Ayarlardaki açıklamalar ve panel altındaki gizlilik notu bu aktarımı açıkça belirtir. Yeni bir veri akışı eklenirse bu bölüm ve [[security-kvkk]] güncellenir.

## Doğrulama
`npx tsc --noEmit`, `npm run brain:check`. Motoru Electron dışında sınamak için `electron` modülünü taklit edip sahte OpenAI uyumlu sunucuya karşı `ai:run` çağır (araç turu, yol kaçışı, gizli dosya, onay, https dışı adres). Gerçek sağlayıcıyla deneme için ayarlardan anahtar gir.
