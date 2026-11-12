---
action: ai-assistant
purpose: Yapay zekâ asistanı: çoklu sağlayıcı, Ask/Agent modları, araçlar, oturumlar, görsel girdi, sesli dikte, özel komutlar
reads: [CLAUDE, PROJECT, STATE, security-kvkk, i18n, settings]
writes: [CHANGELOG, DECISIONS, STATE]
triggers: ["yapay zeka", "ai", "asistan", "agent", "ajan", "dikte", "ses", "claude", "ollama", "openai", "oturum"]
---
# Aksiyon: Yapay zekâ asistanı

Sağ panel (`Ctrl+Shift+L`, etkinlik çubuğundaki kıvılcım). Yalnız masaüstü uygulamasında çalışır: API anahtarı şifreli saklanabilsin diye web sürümünde panel bilgi mesajı gösterir.

## Panel düzeni
Üstte sohbet seçici (`ChatSessions.tsx`: açılır liste, arama, tarih grupları, sabitleme, yeniden adlandırma, Markdown dışa aktarma, silme) + eylemler, altında Sor/Ajan geçişi, uyarı kartları (kurulum, Ollama, anahtar), kaydırılan ileti alanı (`min-h-0`, yatay taşma yok; kod blokları kendi içinde kayar), altta otomatik büyüyen giriş kutusu (en çok ~8 satır) ve araç çubuğu (görsel, mikrofon, model etiketi, gönder/durdur). Genişlik sürüklenerek 300–720 px ayarlanır (`nova.aiWidth`). Kullanıcı en alttaysa akış izlenir, yukarı kaydırdıysa yerinde kalır.

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Motor (ana süreç) | `electron-ai.cjs` | Sağlayıcı bağdaştırıcıları, SSE akışı, agent döngüsü, araçlar, onay, dikte, özel komutlar |
| Arama | `electron-search.cjs` | Dosya listesi + metin arama (paletle ve `search_text` aracıyla ortak) |
| Gizli değer | `electron-secrets.cjs` | `aiKey_anthropic`, `aiKey_openai` şifreli saklanır; `readSecret` yalnız ana süreçte |
| Preload / tipler | `electron-preload.cjs`, `src/types.ts` | `ai.run/cancel/approve/transcribe/commands/onEvent`, `search.*`; `AiRunRequest`, `AiEvent` |
| Arayüz | `src/components/AIAssistant.tsx`, `ChatSessions.tsx` | Sohbetler/oturumlar, mod, akış, araç kartları, onay, görsel, mikrofon, eğik çizgi komutları |
| İstemci | `src/services/aiClient.ts`, `useDictation.ts`, `editorBridge.ts` | Oturum deposu (localStorage), kayıt kancası, Monaco köprüsü (seçim/ekleme) |
| Ayarlar | `settingsSchema.json` → kategori `ai`; anahtar alanları `SettingsPage.tsx` (`AiKeys`) | Sağlayıcı, model, özel adres, mod, bağlam, onaylar, dikte |

## Karar (2026-11-12): sağlayıcı yalnız Ollama
Arayüzde tek sağlayıcı **Ollama** (yerel, anahtarsız). `aiProvider` şemada gizli ve tek seçenekli; `AIAssistant.tsx` sağlayıcıyı `ollama`'ya sabitler. Varsayılan model `qwen2.5-coder:7b` (`DEFAULT_MODEL.ollama`, `aiModel` varsayılanı); model yüklü değilse panelde `ollama pull` uyarısı çıkar. Aşağıdaki yerleşik/Anthropic/OpenAI bölümleri **motorda durur ama arayüzden erişilemez** (gizli `aiBuiltinModel` vb. ayarları, API anahtarı bölümü kaldırıldı); tamamen silmek ayrı bir temizlik işidir.
- **Dikte:** `aiTranscribeUrl` varsayılanı `http://localhost:8080/v1` (yerel whisper.cpp; boşsa da bu kullanılır). `aiVoiceLang` "Otomatik" = arayüz dili (Türkçe arayüzde `tr` sabit). Motor istekle `temperature=0`, `response_format=json` ve dile göre bir `prompt` ipucu (yazılım terimleri, noktalama) gönderir. Sunucu `--convert` ile çalışmalı (uygulama `webm` yollar) ve ffmpeg gerekir.
- **Türkçe duyarlılığı:** arayüz dili `tr` ise sistem istemine Türkçe kuralları (ek/noktalama/harfler, sen–siz uyumu, teknik terim dengesi) ve "mesaj dikteyle yazılmış olabilir, hatalı yazımı bağlamdan anla" notu eklenir; sıcaklık Sohbet 0,4, Ajan 0,2.
- **Boş sohbet:** hiçbir şey yazılmamış sohbet ne listede görünür ne `localStorage`'a yazılır (`loadSessions`/`saveSessions` boşları atar; başka sohbete geçince bellekten silinir; "yeni" etkin sohbet zaten boşsa yenisini açmaz). Sohbet ve Ajan listeleri ayrıdır (aşağıya bak).

## Sağlayıcılar
`anthropic` (Messages API, `x-api-key`), `openai` (Chat Completions, OpenAI uyumlu), `ollama` (yerel, anahtarsız, `http://localhost:11434/v1`). Kanonik ileti biçimi Anthropic blokları; OpenAI için `toOpenAIMessages` çevirir. Özel taban adres yalnız `https://` veya yerel `http://` (`safeBase`). Varsayılan modeller `aiClient.ts` → `DEFAULT_MODEL`.

## Yerleşik model (varsayılan): anahtar yok, adres yok, ücret yok
Sağlayıcı **Nova yerleşik** (`builtin`): motor `node-llama-cpp` (llama.cpp), ana süreçte (`electron-llm.cjs`). Ayrı kurulum gerekmez.
- **Model:** ilk kullanımda panelde kurulum kartı çıkar; Hızlı (Qwen2.5-Coder 1,5B, ~1 GB) veya Güçlü (7B, ~4,4 GB). İkisi de Apache-2.0. GGUF dosyası `userData/models/` altına **tek sefer** Hugging Face'ten indirilir (`Range` ile kaldığı yerden devam, boyut doğrulaması, yalnız `huggingface.co`/`hf.co` konakları). Sonrasında internet gerekmez.
- **Çalışma:** `getLlama({ build: 'never' })` (derleme yok, hazır ikililer; GPU varsa Vulkan/CUDA, yoksa CPU). Model 10 dk boşta kalınca bellekten atılır. Bağlam 8K'ya kadar.
- **Ajan:** araç çağırma **istem tabanlı protokolle** yapılır (modelden bağımsız): model ```json {"name","arguments"}``` yazar, `parseToolCall` ayrıştırır, araç çalışır, sonuç sonraki iletiyle döner (`node-llama-cpp` yerel fonksiyon çağırması 1,5B'de tutmadı). Araçlar `electron-ai.cjs` ile **aynı** güvenlik katmanından (çalışma klasörü, gizli dosya, onay) geçer. Döngü koruması: aynı çağrıyı tekrarlarsa veya adım bütçesi (hızlı 6, güçlü 20) dolarsa "düz metinle yanıtla" talimatı verilir, yine araç isterse son sonuç gösterilir / `agent-stuck` hatası döner. **Hızlı (1,5B) model ajanda yalnız okuma/arama araçlarını alır** (yazma ve komut yok); düzenleme için 7B veya Ollama/bulut. Küçük modeller yolun başına klasör adı ekleyebilir; `resolveInRoot` bunu soyar (kök dışına çıkış yine engelli).
- **Sınırlar:** görsel okumaz (ataç düğmesi kapalı), dikte yerleşik değildir: mikrofon için yerel Whisper sunucusu adresi (`aiTranscribeUrl`) veya OpenAI anahtarı gerekir. Uygulama içi Whisper (transformers.js) açık iş.
- **Paketleme:** `package.json` → `build.files` yalnız Windows x64 CPU/Vulkan ikililerini alır (CUDA ve arm64 hariç, ~110 MB); `asarUnpack` ile node-llama-cpp açık dizinde kalır.
- **KVKK:** sohbet ve kod hiçbir yere gitmez; tek dış istek model dosyasıdır (veri gönderilmez).

## Yerel ve ücretsiz kullanım (Ollama, isteğe bağlı)
**Ollama** da anahtarsızdır; çalışan modeli ve görüntü destekli modelleri kullanmak istersen seçilir.
1. [ollama.com](https://ollama.com)'dan Ollama'yı kur ve başlat.
2. Terminalde bir model indir. Kod için öneri: `ollama pull qwen2.5-coder:7b` (zayıf bilgisayarda `qwen2.5-coder:3b`). Görsel için görüntü destekli model (ör. `llama3.2-vision`, `qwen2.5vl`).
3. Panel `ai:ollamaModels` ile çalışıp çalışmadığını ve yüklü modelleri algılar; model üst çubuktan seçilir (boşsa "coder" içeren ilk model otomatik seçilir). Çalışmıyorsa/model yoksa panelde kurulum ipucu çıkar.
4. **Bağlam uzunluğu:** Ollama varsayılanı kısadır (~4K); Ajan modu için `OLLAMA_CONTEXT_LENGTH=16384` ortam değişkeniyle başlat. OpenAI uyumlu uç nokta istek başına bağlam ayarı kabul etmez.
5. Araç çağırma (Ajan modu) modele bağlıdır; araç desteklemeyen modelde Sor modunu kullan.
6. **Yerel dikte:** whisper.cpp server veya faster-whisper-server gibi OpenAI uyumlu bir sunucu çalıştır, adresini Ayarlar → Yapay Zekâ → *Yerel dikte sunucusu*'na yaz (ör. `http://localhost:8080/v1`). Yerel adreste anahtar istenmez, ses bilgisayardan çıkmaz. Adres boşsa OpenAI anahtarı gerekir.

## Modlar
- **Sor (ask):** araç yok; açık dosya/seçim bağlam olarak gider (`aiIncludeContext`).
- **Ajan (agent):** klasör açık olmalı. Araçlar: `list_dir`, `read_file`, `search_text`, `write_file`, `replace_in_file`, `run_command`. En çok 20 adım. Proje yönergesi: `<kök>/.nova/instructions.md` veya `AGENTS.md` (8 KB'a kadar) sistem istemine eklenir.

## Sohbet listesi ve otomatik adlandırma
- Liste: sabitlenenler üstte, sonra Bugün / Dün / Bu hafta / Daha eski. Arama başlık **ve ileti metninde** çalışır. Klavye: ↑↓ gezin, Enter aç, F2 yeniden adlandır, Esc kapat. Başlıkta çift tık = yeniden adlandır. Yanıtı akan sohbet silinemez; sohbet değiştirme akış sürerken kapalıdır.
- Ad: elle verilince `titleLocked` olur, otomatik adlandırma dokunmaz; boş bırakılırsa otomatik ad geri gelir.
- **Otomatik ad tamamen yerelde, kural tabanlı** (`smartTitle`/`refineTitle` in `aiClient.ts`): ilk iletiden dolgu sözcükleri (lütfen, can you…) ve kod blokları atılır, ilk cümle kısaltılır; ilk yanıttan sonra bir kez incelir (belirsizse dosya adı, kod dili veya yanıtın ilk cümlesi eklenir). Başlık üretmek için modele ek istek **atılmaz**: sohbet içeriği başka bir sağlayıcıya gitmez (KVKK). Model tabanlı başlık eklenecekse bu bölüm ve [[security-kvkk]] güncellenir.
- Alanlar: `AiSession.pinned`, `titleLocked`, `autoLevel` (0/1/2). Depo en çok 50 sohbet tutar, sabitlenenler hiç düşmez.

## Sohbet ve Ajan: ayrı sohbetler, ayrı ayarlar
- **Ayrı sohbetler:** her sohbet tek bir moda aittir (`AiSession.mode`, sonradan değişmez). Liste, arama ve "sabitlenmemişleri sil" yalnız etkin modun sohbetlerini gösterir/etkiler. Mod sekmesine basmak o modun **son sohbetine** geçer (yoksa yeni açılır); boş bir sohbetteyken sekme değiştirmek yeni liste kurmaz, boş sohbeti o moda çevirir. Taslak metin mod başına hatırlanır. Sekmede dolu sohbet sayısı görünür. Akış sürerken mod değiştirilemez. `/ask` ve `/agent` aynı geçişi yapar. Sekme adı "Sohbet" (kimlik `ask`), "Ajan" (`agent`).
- **Ayrı ayarlar** (Ayarlar → Yapay Zekâ, alt başlıklar: Genel / Sohbet / Ajan / Ses; şemada `group`): sağlayıcı, adres ve anahtarlar ortak (Genel). Moda özel: yerleşik model (`aiAskBuiltinModel`/`aiAgentBuiltinModel`, boş = Genel), model adı (`aiAskModel`/`aiAgentModel`, boş = Genel), açık dosya bağlamı (`aiIncludeContext`/`aiAgentIncludeContext`), yanıt uzunluğu (`aiMaxTokens`/`aiAgentMaxTokens`, varsayılan 4096/8192), özel yönerge (`aiAskInstructions`/`aiAgentInstructions`, ≤600 karakter). Yalnız Ajan: `aiAutoApproveEdits`, `aiAllowCommands`.
- **Özel yönerge:** istekle `AiRunRequest.instructions` olarak gider, `electron-ai.cjs` → `cleanInstructions` (kontrol karakterleri atılır, ≤1500) ile sistem istemine "Kullanıcı yönergeleri" olarak eklenir; proje yönergesine ek çalışır. **KVKK:** yönerge metni de seçili sağlayıcıya gider (yerleşik/Ollama'da cihazdan çıkmaz).

## Güvenlik (bozulmaz)
- Anahtar renderer'a hiç geçmez; hata iletilerinde `sk-…` maskelenir.
- Araçlar yalnız çalışma klasöründe: `resolveInRoot` (göreli yol + `realpath` ile sembolik bağ kaçışı). `.env`, `*.pem`, `id_rsa` vb. okunmaz/yazılmaz/aranmaz.
- `write_file`, `replace_in_file`: onay ister (`aiAutoApproveEdits` isteğe bağlı, varsayılan kapalı). `run_command`: **her zaman** onay; `aiAllowCommands` ile tümden kapatılır.
- Mikrofon izni yalnız `audio` ve yalnız ana pencereye (`setPermissionRequestHandler`).

## Dikte
`useDictation` MediaRecorder → `ai:transcribe` → `{base}/audio/transcriptions` (`aiTranscribeUrl` yerelse anahtarsız; değilse OpenAI anahtarı). Ses diske yazılmaz; en çok 120 sn / 25 MB. İlk mikrofon tıklaması `aiVoiceEnabled` ayarını açar (açık rıza metni arayüzde görünür); kapatılabilir.

## Özel komutlar (oturum eklentisi)
`<kök>/.nova/commands/<ad>.md` → `/ad argümanlar`. `{{args}}` yer tutucudur; yoksa argümanlar şablonun sonuna eklenir. Yerleşik: `/new`, `/ask`, `/agent`.

## KVKK
Varsayılan Ollama ile hiçbir veri bilgisayardan çıkmaz (3. parti yok). Bulut sağlayıcı seçilirse kullanıcı kodu ve mesajlar o sağlayıcıya gider (yurt dışı aktarım olabilir). Amaç: kullanıcının istediği yardım; hukuki sebep: kullanıcının açık talebi/rızası (kendi anahtarıyla bilinçli kullanım). Sohbet geçmişi yalnız cihazda (`nova.ai.sessions.v1`, en çok 50 sohbet × 100 ileti, görseller kaydedilmez). Ayarlardaki açıklamalar ve panel altındaki gizlilik notu bu aktarımı açıkça belirtir. Yeni bir veri akışı eklenirse bu bölüm ve [[security-kvkk]] güncellenir.

## Doğrulama
`npx tsc --noEmit`, `npm run brain:check`. Motoru Electron dışında sınamak için `electron` modülünü taklit edip sahte OpenAI uyumlu sunucuya karşı `ai:run` çağır (araç turu, yol kaçışı, gizli dosya, onay, https dışı adres). Gerçek sağlayıcıyla deneme için ayarlardan anahtar gir.
