---
action: git-github
purpose: Git paneli, GitHub hesabı bağlama, PR, eşzamanlama ve canlı takip
reads: [CLAUDE, PROJECT, STATE, security-kvkk, i18n]
writes: [CHANGELOG, DECISIONS, testing]
triggers: ["git", "github", "commit", "pull", "push", "pr", "sync", "fetch"]
---
# Aksiyon: Git ve GitHub

## Dosyalar
- `electron-git.cjs` — durum, sahneleme, commit, dallar, geçmiş, eşzamanlama, `init`.
- `electron-github.cjs` — Device Flow girişi, token saklama, repo bilgisi, PR, depo yayınlama.
- `electron-main.cjs` — `runGitCommand` (tek giriş noktası), izleyiciler (`fs:watch-change`, `git:changed`).
- Arayüz: `src/components/GitPanel.tsx`, `GithubAccount.tsx`, `src/services/useGithubAuth.ts`.

## Değişmez kurallar
1. **Kilit:** GitHub bağlı değilken hiçbir `git:*` kanalı veri vermez (`github-required`). Yeni kanal eklerken `guard()` kullan.
2. **Kabuk yok:** `execFile` + argüman dizisi. Kullanıcıdan gelen yol/dal adı doğrulanır (`safeRelPaths`, `BRANCH_RE` + `git check-ref-format`); yol `--` sonrasına konur.
3. **Token:** yalnız ana süreçte; git'e `GIT_CONFIG_*` ortam değişkeniyle verilir (argüman değil). Renderer'a, loga, commit'e yazılmaz.
4. **Yıkıcı işlem onaylı:** `discard` arayüzde onay ister. Eşzamanla ayrışmış dalı **birleştirmez/yeniden yazmaz**.
5. **Durum ayrıştırma:** `status --porcelain=v1 -z` (boşluklu/Türkçe adlar, yeniden adlandırma).
6. **Gerçek zamanlı:** `.git` izleyicisi (`git:changed`) anında, panel 8 sn'de bir, `fetch` dakikada bir, GitHub canlı veri 30 sn'de bir.

## Yeni özellik eklerken
1. Kanalı `electron-git.cjs`/`electron-github.cjs` içinde ekle → `electron-preload.cjs` → `src/types.ts`.
2. Metinleri [[i18n]] kuralıyla 8 dilde ekle.
3. Test ekle: `scripts/tests/` ([[testing]]). 
4. KVKK etkisini [[security-kvkk]] ile değerlendir (GitHub'a giden veri: PR başlığı/gövdesi, depo adı).

## Bilinen sınırlar
Terminaldeki `git` komutları kullanıcının kendi kabuğudur; kilit yalnız uygulama arayüzü ve IPC içindir.

## Denetim düzeltmeleri (17.11.2026)
Git durumu 3 süreçle okunur (`status --porcelain=v2 --branch -z`, `remote get-url`, MERGE_HEAD); aynı depo için eşzamanlı çağrılar birleşir. Yapılandırma sertleştirmesi: [[security-kvkk]]. GitHub OAuth kapsamı `repo` kalır (özel depo/push için gerekli; daraltma ince ayarlı GitHub App kararı). Cihaz akışında `verification_uri` yalnız `https://github.com`.

## Giriş kodu kopyalama (21.11.2026)
Cihaz akışındaki kopyala düğmesi renderer'daki `navigator.clipboard` ile başarısız olabiliyordu (Electron odak/izin). Artık `github:copyCode` IPC'si ana süreçte `clipboard.writeText` yapar; yalnız ana süreçte tutulan bekleyen `user_code` kopyalanır (renderer rastgele metin yazdıramaz). Renderer önce IPC'yi dener, olmazsa `navigator.clipboard`'a düşer. Dosyalar: `electron-github.cjs`, `electron-preload.cjs`, `src/types.ts`, `GithubAccount.tsx`.
