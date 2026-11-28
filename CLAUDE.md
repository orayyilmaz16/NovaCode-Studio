# NovaCode Studio

Electron + React 19 + Vite 8 + Monaco tabanlı masaüstü/web kod editörü. Dil: Türkçe (kısa, sade). Kod ve commit mesajları İngilizce olabilir.

## Sürüm (otomatik)
<!-- version:start -->
Güncel sürüm: **v1.10.1** (patch, 28.11.2026) · notlar: `release-notes/v1.10.1.md` · geçmiş: `docs/brain/VERSIONS.md` · kural: `docs/brain/actions/versioning.md`. Bu blok `scripts/release.mjs` ile otomatik güncellenir, elle yazma.
<!-- version:end -->

## Komutlar
- `npm run dev` — Vite (web)
- `npm run build` — web build (tip kontrolü dahil değil; `npx tsc --noEmit` ayrıca çalıştır)
- `npm run electron:dev` — masaüstü geliştirme
- `npm run electron:build` — Windows NSIS kurulum (`release/`)

## Harita (önce buraya bak, tüm repoyu tarama)
- **Proje beyni:** `docs/brain/BRAIN.md` — okuma sırası, aksiyon oyun kitapları (`docs/brain/actions/`), karar günlüğü; `docs/brain/STATE.md` koddan otomatik üretilir (`npm run brain`, doğrulama `npm run brain:check`). İşe başlarken uygun aksiyon dosyasını oku, bitince `writes` listesini güncelle.
- `electron-main.cjs`, `electron-preload.cjs`, `electron-git.cjs`, `electron-github.cjs` — ana süreç, dosya sistemi, watcher, IPC, git/GitHub, terminal, sandbox
- `electron-ai.cjs` (AI motoru + ajan araçları), `electron-ext.cjs` (eklenti mağazası, Open VSX), `electron-search.cjs` (dosya/metin arama) — ayrıntı: `docs/brain/actions/ai-assistant.md`, `extensions.md`, `search-palette.md`
- `src/App.tsx` — kabuk, durum yönetimi
- `src/components/` — EditorArea, FileTree, GitPanel, Terminal, AIAssistant, Preview, LandingPage, SplashScreen
- `server/sync-server.mjs` — açık kaynak Yjs senkron sunucusu (kendi sunucunda, `NOVA_SYNC_TOKEN` zorunlu, `npm run sync:server`)
- `src/services/monacoShim.ts` — y-monaco için global Monaco köprüsü (vite alias)
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
9. Arayüz sade kalır: düz yüzey, tek vurgu, ızgara/degrade zemin yok; gölge yalnız kartlarda tek katman `--float-shadow` (yığın yok, 18.11.2026 kurucu kararı). Geçiş, hover ve animasyonda `docs/brain/actions/motion.md` jetonları ve `motion-*` sınıfları kullanılır (sabit ms yazılmaz).

## Git ve sürüm (ayrıntı: `AGENT.md`, `.claude/skills/nova-release/SKILL.md`)
- Conventional Commits. Sürüm SemVer, tek kaynak `package.json`.
- **Commit/push otomatiktir (kullanıcı onayıyla kuruldu):** her Claude turu bitince `scripts/auto-commit.mjs` (`scripts/doc-sync.mjs stop` üzerinden, Stop hook, `.claude/settings.json`) değişiklikleri `chore(auto): ...` mesajıyla `origin main`'e push eder. Gizli dosya, `dist/`, `release/` atlanır; gizli dosya varsa o tur commit edilmez. Kullanıcı bu otomatik commit/push için kalıcı izin verdi (2026-11-06). `auto/*` dalındaysa dalda kalır, PR açar ve CI yeşilse auto-merge eder (`--force` yok, çakışmada durur).
- **Sürüm, etiket ve GitHub Release otomatiktir (kullanıcı talimatıyla, 2026-11-08; 2026-11-17'de main korumasına uyarlandı):** sürüm düzeyini `CHANGELOG.md` Unreleased maddeleri belirler: varsayılan PATCH, büyük toplu güncelleme (`[breaking]` var, `[feat]` ≥ 2 ya da ≥ 6 madde) MINOR, MAJOR otomatik çıkmaz (yalnız `--level major`), `[docs]` sürüm çıkarmaz. Stop hook belge tamamsa `scripts/release.mjs prepare` ile sürümü PR içinde hazırlar (`package.json`, `CHANGELOG.md`, `release-notes/vX.Y.Z.md`, `docs/brain/VERSIONS.md`, bu dosyadaki sürüm bloğu, `AGENT.md`); PR birleşince CI açıklamalı `vX.Y.Z` etiketini atar ve GitHub Release'i Türkçe + İngilizce notlarla çıkarır. **CI main'e commit atmaz** (korumalı). Kural: `docs/brain/actions/versioning.md`.
- **Sürüm notu yazma kuralı:** Her kullanıcıya görünen değişiklikte `CHANGELOG.md` `## Unreleased` altında `### tr` ve `### en` bölümlerine, **aynı sırada ve aynı etiketle** (`- [feat] **Başlık:** metin`) madde ekle. Etiketsiz madde = `[improve]` (patch). Tam akış: `AGENT.md` §3–4.
- **Güvenlik/kalite taraması otomatik:** `ci-cd.yml` (tip, hijyen, npm audit high, build, bundle bütçesi) ve `security.yml` (CodeQL, gitleaks, dependency review, haftalık npm audit) her push/PR'da çalışır. 
- Yeni bir zaafiyet veya kırık CI görülürse önce düzeltmeyi öner; CI yeşil olmadan "yayında" deme.
- Deploy/CI kaydı yeşil bitmeden "yayında" deme.

## Belge otomasyonu (her istem ve değişiklik)
- Kod/ayar/davranış değişen her turda bitirmeden önce beyni güncelle: ilgili `docs/brain/actions/<alan>.md`, karar varsa `DECISIONS.md` (tarihli), kullanıcıya görünen değişiklikte `CHANGELOG.md` `Unreleased` tr+en. `docs/brain/LOG.md` ve `STATE.md` otomatiktir, elle yazma.
- `UserPromptSubmit` hook'u her istemde bunu hatırlatır; `Stop` hook'u (`scripts/doc-sync.mjs`) eksik belgeyi tek sefer engeller, sonra günlüğe işler ve auto-commit'i çalıştırır. İstem metni hiçbir yere kaydedilmez. Ayrıntı: `docs/brain/actions/doc-sync.md`.

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
