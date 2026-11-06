# NovaCode Studio

Electron + React 19 + Vite 8 + Monaco tabanlı masaüstü/web kod editörü. Dil: Türkçe (kısa, sade). Kod ve commit mesajları İngilizce olabilir.

## Komutlar
- `npm run dev` — Vite (web)
- `npm run build` — web build (tip kontrolü dahil değil; `npx tsc --noEmit` ayrıca çalıştır)
- `npm run electron:dev` — masaüstü geliştirme
- `npm run electron:build` — Windows NSIS kurulum (`release/`)

## Harita (önce buraya bak, tüm repoyu tarama)
- `electron-main.cjs`, `electron-preload.cjs` — ana süreç, dosya sistemi, watcher, IPC, sandbox
- `src/App.tsx` — kabuk, durum yönetimi
- `src/components/` — EditorArea, FileTree, GitPanel, Terminal, AIAssistant, Preview, SnippetsPanel, LandingPage, SplashScreen
- `src/services/realtime.ts` — socket.io senkron
- `src/snippets/defaultSnippets.ts` — hazır snippet'ler
- `.github/workflows/ci-cd.yml` — audit + build + Windows release

## Kurallar
1. Değişiklikten önce ilgili dosyayı oku; tüm dizini listeleme/okuma.
2. Önce `Grep`/`Glob` ile bul, sonra yalnız gereken satır aralığını oku.
3. Küçük değişiklik = `Edit`; dosyayı baştan yazma.
4. IPC/dosya sistemi kodunda yol doğrulama (path traversal), `contextIsolation` açık, renderer'a `node` erişimi yok. Güvenlik gevşetilmez.
5. HTML basılan yerde `dompurify` kullan.
6. Yeni bağımlılık eklemeden önce var olan çözüme bak; ekleniyorsa nedenini yaz.
7. Kullanıcı arayüzüne eklenen her metin 8 dilde olmalı: tr, en, de, ru, ar, es, fr, az.
8. Mevcut stile uy (Tailwind 4, fonksiyonel React bileşenleri, TypeScript strict).

## Git ve sürüm (ayrıntı: `AGENT.md`, `.claude/skills/nova-release/SKILL.md`)
- Conventional Commits. Sürüm SemVer, tek kaynak `package.json`.
- **Commit, push, tag ve release onaysız yapılmaz.** Agent commit mesajını, sürüm önerisini ve diff özetini hazırlar; kullanıcı "onay" dedikten sonra çalıştırır.
- Deploy/CI kaydı yeşil bitmeden "yayında" deme.

## KVKK ve gizlilik
- Kullanıcı kodu/içeriği 3. partiye (AI, realtime sunucu, analitik) gönderilecekse veri, amaç, hukuki sebep, saklama ve yurt dışı aktarım etkisini belirt.
- `.env`, anahtar, token, sunucu IP'si koda/commit'e/çıktıya yazılmaz; `<API_KEY>` gibi yer tutucu kullan.

## Token ve bağlam disiplini
- Cevap: önce sonuç, sonra gerekçe. Tekrar özetleme, dosya içeriğini sohbete geri yapıştırma yok.
- Tek adımlık işte plan yazma. Belirsizlik varsa tek, net soru sor.
- Çıktısı uzun komutlarda `| tail -n 30` veya `--silent` kullan.
- Bağlam şişince `/compact` öner; görev değişince `/clear`.
- Kararlar ve açık işler `AGENT.md` içindeki "Durum" bölümüne kısa not olarak yazılır, sohbette taşınmaz.
