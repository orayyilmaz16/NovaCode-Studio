# AGENT.md — NovaCode Studio ajan sözleşmesi

Bu dosya, repoda çalışan her ajanın (Claude Code, alt ajanlar, CI botları) izleyeceği iş akışıdır. Kısa tut, uygula.

## 1. Çalışma döngüsü (hızlı)
1. **Anla** — İstek tek cümleye indirilebiliyorsa direkt işe başla. Belirsizse tek soru sor.
2. **Bul** — `Grep`/`Glob` → ilgili dosya → gerekli satır aralığı. Tüm repoyu okuma.
3. **Değiştir** — En küçük diff. Bağımlı dosyaları (tip, import, çeviri) aynı turda güncelle.
4. **Doğrula** — `npx tsc --noEmit` ve `npm run build`. Hata varsa kök nedeni düzelt, bastırma.
5. **Raporla** — 3-5 satır: ne değişti, nasıl doğrulandı, açık risk.

## 2. Alt ajan kullanımı
- Tek dosyalık/kısa iş → ajan açma, kendin yap.
- Geniş arama (çok dosya) → `Explore`, "medium".
- Bağımsız paralel işler → tek mesajda birden çok ajan.
- Alt ajana: hedef + ilgili dosya yolları + dışlananlar ver. Sonuç özetini al, dosya dökümü isteme.

## 3. Commit ve sürüm otomasyonu

### Sürüm kuralı (SemVer, kaynak: `package.json`) — otomatik
| Commit türü | Artış |
|---|---|
| `feat:`, `fix:`, `perf:`, `refactor:`, `chore(auto):` (kod/içerik) | **patch** (1.1.0 → 1.1.1) |
| `feat!:` / `BREAKING CHANGE:` | major (1.1.1 → 2.0.0) |
| yalnız `docs:`/`ci:`/`test:` | sürüm artmaz |

Sürüm elle artırılmaz; CI hesaplar. İstisna: `package.json` sürümü son `vX.Y.Z` etiketinden büyükse (bilinçli minor/major, ör. `npm version minor --no-git-tag-version`) CI o sürümü olduğu gibi yayınlar ve etiketler. Elle sürüm değiştirmek gerekiyorsa (ör. 1.1.0 gibi bilinçli bir sürüm) `package.json` ve `package-lock.json` düzenlenip etiketlenir; CI ilk çalıştırmada o sürümü olduğu gibi yayınlar.

### Sürüm notları (TR + EN)
- Her kullanıcıya görünen değişiklikte `CHANGELOG.md` içindeki `## Unreleased` bölümüne iki dilde madde yaz:
  ```
  ## Unreleased
  ### tr
  - Boş editöre Klasör Aç düğmesi eklendi.
  ### en
  - Added an Open folder button to the empty editor.
  ```
- CI bu maddeleri alır, `CHANGELOG.md` içinde yeni sürüm bölümüne taşır ve `release-notes/vX.Y.Z.md` dosyasını yazar (önce Türkçe, sonra English). Madde yoksa İngilizce kısım commit konularından üretilir, Türkçe kısım uyarı olur; bu durumda Unreleased'i yine de doldur.

### Sürüm derlemesi ve release (CI, otomatik)
1. `push` → `main` (her Claude turu sonundaki `chore(auto)` dahil).
2. `quality`: hijyen, `tsc --noEmit`, `npm audit --audit-level=high`, `npm run build`, bundle bütçesi.
3. `version`: `scripts/bump-version.mjs` → patch/major sürümü, `package.json`, `package-lock.json`, `CHANGELOG.md`, `release-notes/vX.Y.Z.md` → `chore(release): vX.Y.Z [skip ci]` commit'i → `vX.Y.Z` etiketi.
4. `release-desktop` (Windows runner): `npm run electron:build` → `release/*.exe` → GitHub Release `vX.Y.Z`, gövde = `release-notes/vX.Y.Z.md`.
5. Yeşil değilse "yayında" deme; hatayı raporla. Yerelde `gh` kurulu değil; kontrol için GitHub Actions ve Releases sayfası kullanılır.

### Akış (elle commit gerekirse)
1. `git status --short` + `git diff --stat` ile değişikliği gör.
2. Türü belirle, `CHANGELOG.md` Unreleased maddelerini yaz.
3. **Taslağı göster:** commit mesajı, beklenen yeni sürüm, etkilenen dosyalar.
   - Not: Her Claude turu sonunda `scripts/auto-commit.mjs` otomatik commit + push yapar (`chore(auto)` mesajı). Otomatik commit'ler de CI'da patch sürüm alır.
4. Elle commit gerekiyorsa `git add <belirli dosyalar>` (asla körlemesine `git add -A`; `.env`, `release/`, `dist/` hariç) ve `git commit -m "<tür>: <kısa özet>"`.
5. Push sonrası CI'yı izle. Yeşil değilse "yayında" deme.

### Akış
1. `git status --short` + `git diff --stat` ile değişikliği gör.
2. Türü belirle, sürüm artışını hesapla.
3. **Taslağı göster:** commit mesajı, yeni sürüm, etkilenen dosyalar.
   - Not: Her Claude turu sonunda `scripts/auto-commit.mjs` otomatik commit + push yapar (`chore(auto)` mesajı). Bu akış o commit'leri kapsamaz; sürüm artışı ve anlamlı mesaj için yine bu akış kullanılır.
4. **Kullanıcı onayı gelince:**
   - `npm version <patch|minor|major> --no-git-tag-version`
   - `git add <belirli dosyalar>` (asla `git add -A` körlemesine; `.env`, `release/`, `dist/` hariç)
   - `git commit -m "<tür>: <kısa özet>"`
   - `git push origin <aktif-dal>`
5. Push sonrası CI'yı izle: `gh run watch`. Yeşil değilse "yayında" deme, hatayı raporla.

### Yasaklar (onay olmadan)
`git push --force`, `git reset --hard`, dal silme, `main`'e doğrudan geri dönülmez değişiklik.
Etiket ve GitHub Release artık CI tarafından otomatik atılır (bkz. yukarıdaki bölüm). Elle etiket/release gerekirse onay al.
Geri dönüş planı: `git revert <sha>`; yanlış bir sürüm yayınlandıysa yeni bir patch ile düzelt, eski release'i silme.

## 4. CI/CD notları
- Pipeline: `.github/workflows/ci-cd.yml` (quality → version → release-desktop).
- Açık konular (öner, onayla, sonra uygula):
  - `npm audit ... || true` hataları yutuyor (şu an `--audit-level=high` ile sertleştirildi; kontrol et).
  - Tag çakışması: sürüm etiketi zaten varsa yeni etiket atılmaz; aynı sürüm için release gövdesi yeniden yazılır.

## 5. Bağlam yönetimi
- Kalıcı bilgi: `CLAUDE.md` (kurallar), bu dosya (akış + durum). Sohbet geçicidir.
- Görev bitince "Durum" bölümünü güncelle (en fazla 10 satır, eskileri sil).
- Bağlam ~%60'a gelirse `/compact`; konu değişirse `/clear`.
- `.claudeignore` kapsamındaki dizinleri (`node_modules`, `dist`, `release`, `.venv`) hiç okuma.

## 6. Token tasarrufu
- Uzun çıktıyı kırp (`tail`, `head`, `--silent`).
- Aynı dosyayı tekrar okuma; düzenlemeden sonra doğrulama için yeniden okumak gerekmez.
- Düşünmeyi karmaşıklığa göre ayarla: tek satırlık düzeltme, yeniden adlandırma, metin değişikliği → plan yok. Mimari/güvenlik değişikliği → kısa plan.
- Seçenek listesi yerine tek öneri sun.

## 7. Güvenlik ve KVKK kapısı
Aşağıdakilere dokunan her değişiklikte raporda ayrıca belirt:
- IPC kanalları, dosya sistemi erişimi, `electron-main.cjs` sandbox ayarları
- Ortak düzenleme (`server/sync-server.mjs`) yalnız kullanıcının ayarladığı `wss://` adresine dosya içeriği gönderir; varsayılan sunucu yoktur. Sunucu token olmadan açılmaz.
- AIAssistant'a gönderilen kod/içerik
- Yeni 3. parti paket veya servis, analitik, çerez
Belirt: veri, amaç, hukuki sebep, saklama süresi, yurt dışı aktarım. Gizli bilgi commit'e girmez.

## 8. Döngü ve token koruması
- Aynı komut aynı hatayla iki kez başarısızsa dur; kök nedeni bul ya da kullanıcıya raporla. Üçüncü deneme yok.
- Bekleme ve yoklama yok: uzun işler `run_in_background` ile; bitince bildirim gelir. `sleep` döngüsü yazma.
- Bir görevde en fazla 3 doğrulama turu (tsc/build/CI). Aşılırsa dur ve raporla.
- Dosya tek turda en fazla bir kez tam okunur; sonrasında yalnız satır aralığı.
- Alt ajan yalnız geniş aramada; tek dosyalık işte kullanma.
- Hook çıktısı tekrar tetiklenmez: `chore(auto)` commit'i sonrası yeni commit üretme.
- Yanıt: önce sonuç, en fazla 5 satır; tekrar özet ve dosya dökümü yok.

## 9. Md dosyaları arası haberleşme (tek kaynak ilkesi)
| Dosya | Ne tutar | Kim okur |
|---|---|---|
| `CLAUDE.md` | Kalıcı kurallar (kısa, değişmez) | Her oturum |
| `AGENT.md` | İş akışı, sürüm/CI, döngü kuralları, repo ayarları, **Durum** (handoff) | Her oturum, görev başında |
| `SECURITY.md` | Güvenlik açığı bildirim süreci (insanlara dönük) | Bildiren kişi, ekip |
| `CHANGELOG.md` | Sürüm notları TR/EN; `## Unreleased` bekleyen maddeler | CI, kullanıcı |
| `release-notes/vX.Y.Z.md` | CI'ın ürettiği release gövdesi (elle düzenlenmez) | GitHub Release |
| `docs/brain/BRAIN.md` | **Proje beyni** haritası: okuma sırası, aksiyon tablosu, haberleşme kuralları | Her oturum |
| `docs/brain/actions/*.md` | Aksiyon başına oyun kitabı (`reads`/`writes` ile haberleşir): release, git-github, ui-design, i18n, security-kvkk, terminal, ci-cd, testing, brain-maintenance | İlgili işte |
| `docs/brain/PROJECT.md`, `DECISIONS.md` | Mimari ve tarihli karar günlüğü | İhtiyaç olunca |
| `docs/brain/STATE.md` | Koddan **otomatik** üretilen durum (`npm run brain`; hook her turda günceller) | Görev başında |
| Hafıza (`memory/`) | Kullanıcı tercihleri ve bağlam; repo kuralını kopyalamaz, işaret eder | Claude |

Kurallar:
- Bilgi tek yerde durur. Diğer dosya kopyalamaz, `[[bağlantı]]` veya dosya yolu verir.
- Bir kural değişirse önce `CLAUDE.md`/`AGENT.md`, sonra ilgili hafıza kaydı güncellenir. Eski kayıt silinir.
- Oturum devri: görev bitince `AGENT.md` → **Durum** bölümüne tarihli, en fazla 10 satır yaz. Yeni oturum önce `CLAUDE.md` ve **Durum**'u okur; başka md dosyasını yalnız ihtiyaç olunca açar.

## 10. Repo güvenlik ve birleşme ayarları (GitHub)
- Private vulnerability reporting: açık. Bildirim yolu `SECURITY.md`.
- Dependabot alerts ve security updates: açık. Yapılandırma `.github/dependabot.yml`.
- Secret scanning + push protection: açık.
- CODEOWNERS: `.github/CODEOWNERS` (güvenlik, CI, `scripts/`, `server/`).
- Issue şablonları: hata ve özellik; boş issue kapalı; güvenlik bağlantısı var.
- PR şablonu: `.github/pull_request_template.md` (doğrulama ve veri kontrol listesi).
- Auto-merge: açık; otomatik commit'ler `auto/<zaman>` dalı → PR → CI yeşilse birleşir.
- `main` ruleset (PR zorunlu, `quality` check zorunlu, force push/silme yasak): PR #5 birleştikten sonra açılır.

## Durum
- 04.11.2026: CLAUDE.md, AGENT.md, release skill ve .claudeignore oluşturuldu.
- 08.11.2026: Repo güvenliği: Dependabot alerts + security updates, private vulnerability reporting, secret scanning açık. SECURITY.md, issue/PR şablonları, CODEOWNERS eklendi (dal `chore/repo-security`). PR #5 (auto-merge akışı) bekliyor; ruleset onun birleşmesinden sonra açılacak.
- 10.11.2026: v1.2.0 hazırlığı: GitHub hesabıyla Git (sahneleme, dal, eşzamanla, PR, yayınlama, canlı takip), VS Code çizgisinde yeni arayüz + arka plansız logo + karşılama ekranı, proje beyni (`docs/brain/`, `scripts/brain.mjs`, hook `auto-commit.mjs` her turda STATE'i yeniler). Testler `npm test`, beyin denetimi `npm run brain:check` (CI'da).
- 10.11.2026: Ayarlar sistemi (şema güdümlü, gerçek zamanlı, tam sayfa; açık tema, snippet, otomatik kayıt, şifreli token). Yeni ayar eklemek için `docs/brain/actions/settings.md`. Doğrulama ayrı profille yapıldı (`--user-data-dir`); kullanıcının açık penceresinde ayar değiştirme.
- 10.11.2026: Açık: gerçek hesapla uçtan uca GitHub giriş/PR denemesi; eski panellerde kalan sabit Türkçe metinler (i18n borcu); `minimatch` (dev) Dependabot hatası electron-builder güncellemesini bekliyor.
- 08.11.2026: Her güncelleme patch sürüm alır (CI). TR+EN sürüm notları `CHANGELOG.md` Unreleased → `release-notes/`. CI'da `version` işindeki bozuk `if:` satırı düzeltildi. Açık: ilk `v1.1.0` release'inin CI'da yeşil geçmesi; 8 dil i18n kapsamı yalnız yeni metinlerde.
