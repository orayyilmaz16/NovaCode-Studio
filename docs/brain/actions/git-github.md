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
3. **Oturum (28.11.2026):** Erişim token'ı ve varsa yenileme token'ı tek şifreli JSON (`github-token.bin`, `safeStorage`) olarak saklanır. Erişim token'ı dolmadan (1 dk pay) ve API 401 dönerse `refreshSession` ile yenilenir; yenileme token'ı GitHub'ca döndürülürse yenisi saklanır. Yalnız `bad_refresh_token` veya token'ın yenileme olmadan 401 dönmesinde oturum silinir; ağ hatasında oturum korunur. Eski düz token dosyaları okunmaya devam eder.
4. **Token:** yalnız ana süreçte; git'e `GIT_CONFIG_*` ortam değişkeniyle verilir (argüman değil). Renderer'a, loga, commit'e yazılmaz.
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

## Durum çubuğu commit geçmişi (21.11.2026)
`CommitHistoryMenu.tsx` (lazy): durum çubuğunda satır/sütunun solundaki commit simgesinden açılır; yalnız `gitStatus.isRepo` iken görünür. Veri: mevcut `gitLog` IPC'si (son 30 commit, `refs` rozetli) + `gitStatus` (dal, ileri/geri, `hasRemote`) + `github.repoInfo` (uzak depo adı/URL; yalnız `hasRemote` ve GitHub bağlıyken). Uzak yoksa "yalnız yerel depo" satırı. Satır/alt düğme `pickSidebar('git')` ile Git panelini açar. Yeni IPC yok; metinler `uiTextScm.ts` (`hist*`, 8 dil). Kişisel veri: yalnız yerel git günlüğü (yazar adı) arayüzde gösterilir, dışarı gönderilmez.

### Commit geçmişi: istatistik ve son commit özeti (21.11.2026)
`git:log` artık `limit` (1–100, varsayılan 30) alır ve `--shortstat` ile her commit için `files/added/deleted` ile `ts` (ms) döndürür; kayıt ayracı U+001E, alan ayracı U+001F (e-posta alınmaz). Zamanlar `src/services/timeAgo.ts` ile arayüz dilinde (`Intl.RelativeTimeFormat`), `ts` yoksa git'in `when` metni. Durum çubuğu öğesi `gitLog(repo, 1)` ile son commit'in yazarı/zamanını gösterir (`@2xl` ve üstü; dar çubukta yalnız simge); depo/dal/ileri sayısı/değişiklik sayısı değişince tazelenir, dakikada bir zaman yenilenir. Menünün alt düğmesi `pickSidebar('git')` ile aç/kapat yapar (`gitPanelOpen`).

### Açılır commit satırları (21.11.2026)
`CommitHistoryMenu`'de her commit satırı bir akordeon: tıklayınca (`aria-expanded`) `gitCommitFiles` ile dosyalar bir kez yüklenip önbelleğe alınır, `.cm-collapse` ile yumuşak açılır (ok `--dur-base` ile döner). `git:commitFiles` artık `diff-tree --numstat -z` ile her dosya için `added/deleted` (ikili dosyada `binary`) ekler; yeniden adlandırmada boş yol + eski/yeni ad ayrıştırılır. Dosya ikonu duruma göre (A yeşil, D kırmızı, R mavi, M sarı). Not: `electron-git.cjs` CRLF'tir; çok satırlı betikle düzenlerken ters eğik çizgi/NUL kaçışlarını kontrol et.

### Satır sayısı rozeti (21.11.2026)
Eklenen/silinen satır artık her commit'in başlık satırında sağda `+N −M` rozeti (mono, yeşil/kırmızı). Eski ana süreç (yeniden başlatılmamış) `added` alanı döndürmez; menü bunu algılayıp "uygulamayı yeniden başlat" uyarısını (`histNeedRestart`) gösterir. Ana süreç dosyaları (`electron-*.cjs`) değişince `electron:dev` yeniden başlatılmalı: sıcak yeniden yükleme yok.
