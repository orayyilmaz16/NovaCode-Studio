# NovaCode Studio

Electron + React 19 + Vite 8 + Monaco tabanlı masaüstü/web kod editörü. Dil: Türkçe (kısa, sade). Kod ve commit mesajları İngilizce olabilir.

## Komutlar
- `npm run dev` — Vite (web)
- `npm run build` — web build (tip kontrolü dahil değil; `npx tsc --noEmit` ayrıca çalıştır)
- `npm run electron:dev` — masaüstü geliştirme
- `npm run electron:build` — Windows NSIS kurulum (`release/`)

## Harita (önce buraya bak, tüm repoyu tarama)
- **Proje beyni:** `docs/brain/BRAIN.md` — okuma sırası, aksiyon oyun kitapları (`docs/brain/actions/`), karar günlüğü; `docs/brain/STATE.md` koddan otomatik üretilir (`npm run brain`, doğrulama `npm run brain:check`). İşe başlarken uygun aksiyon dosyasını oku, bitince `writes` listesini güncelle.
- `electron-main.cjs`, `electron-preload.cjs`, `electron-git.cjs`, `electron-github.cjs` — ana süreç, dosya sistemi, watcher, IPC, git/GitHub, terminal, sandbox
- `electron-ai.cjs` (AI motoru + ajan araçları), `electron-llm.cjs` (yerleşik yerel model, `node-llama-cpp`), `electron-ext.cjs` (eklenti mağazası, Open VSX), `electron-search.cjs` (dosya/metin arama) — ayrıntı: `docs/brain/actions/ai-assistant.md`, `extensions.md`, `search-palette.md`
- `src/App.tsx` — kabuk, durum yönetimi
- `src/components/` — EditorArea, FileTree, GitPanel, Terminal, AIAssistant, Preview, SnippetsPanel, LandingPage, SplashScreen
- `server/sync-server.mjs` — açık kaynak Yjs senkron sunucusu (kendi sunucunda, `NOVA_SYNC_TOKEN` zorunlu, `npm run sync:server`)
- `src/services/monacoShim.ts` — y-monaco için global Monaco köprüsü (vite alias)
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
- **Commit/push otomatiktir (kullanıcı onayıyla kuruldu):** her Claude turu bitince `scripts/auto-commit.mjs` (Stop hook, `.claude/settings.json`) değişiklikleri `chore(auto): ...` mesajıyla `origin main`'e push eder. Gizli dosya, `dist/`, `release/` atlanır; gizli dosya varsa o tur commit edilmez. Kullanıcı bu otomatik commit/push için kalıcı izin verdi (2026-11-06).
- **Sürüm, etiket ve GitHub Release otomatiktir (kullanıcı talimatıyla, 2026-11-08):** her güncelleme CI'da (`version` işi, `scripts/bump-version.mjs`) PATCH sürüm alır, `vX.Y.Z` etiketi atılır ve Türkçe + İngilizce notlarla GitHub Release çıkarılır. Kırıcı değişiklik (`feat!:` / `BREAKING CHANGE:`) MAJOR artırır; yalnız `docs:`/`ci:`/`test:` değişiklikleri sürüm çıkarmaz.
- **Sürüm notu yazma kuralı:** Her kullanıcıya görünen değişiklikte `CHANGELOG.md` içindeki `## Unreleased` bölümüne `### tr` ve `### en` altında madde ekle. Tam akış ve derleme adımları: `AGENT.md` §3–4.
- **Güvenlik/kalite taraması otomatik:** `ci-cd.yml` (tip, hijyen, npm audit high, build, bundle bütçesi) ve `security.yml` (CodeQL, gitleaks, dependency review, haftalık npm audit) her push/PR'da çalışır. `chore(auto)` commit'leri sürüm artırmaz.
- Yeni bir zaafiyet veya kırık CI görülürse önce düzeltmeyi öner; CI yeşil olmadan "yayında" deme.
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
- Döngü koruması ve md haritası: `AGENT.md` §8–9. Aynı hata iki kez tekrarlanırsa dur, raporla; yoklama/sleep döngüsü yok.
- Güvenlik açığı bildirimi: `SECURITY.md`. Repo güvenlik ayarları: `AGENT.md` §10.
