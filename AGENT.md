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
- 10.11.2026: v1.2.0 hazırlığı: GitHub hesabıyla Git (sahneleme, dal, eşzamanla, PR, yayınlama, canlı takip), VS Code çizgisinde yeni arayüz + arka plansız logo + karşılama ekranı, proje beyni (`docs/brain/`, `scripts/brain.mjs`, hook `auto-commit.mjs` her turda STATE'i yeniler). Testler `npm test`, beyin denetimi `npm run brain:check` (CI'da).
- 12.11.2026 (7): Metin tamponu (piece table) + ajan `edit_lines`, Node hata ayıklayıcı (CDP), gerçek PTY terminal (xterm), LSP köprüsü (yalnız PATH'teki sunucular). Testler `npm test` hepsi geçti; arayüz izole Electron örneğinde sınandı. Açık: LSP yalnız pyright ile denendi; PTY yalnız Windows; hata ayıklayıcı yalnız JS (TS kaynak haritası yok); Monaco'nun kendi tamponu duruyor. Ana süreç değişti: uygulama yeniden başlatılmalı.
- 12.11.2026 (6): Önizleme yeniden yazıldı (HTML/SVG/MD, sandbox, canlı yenileme, localhost yakalama), Çalıştır menüsü sadeleşti (npm yok) + `run`/`extensions` ayar kategorileri, tema seçici, eklenti otomatik güncelleme, güncelleme kanalları (dev/stable), otomatik CI/CD (hook→`auto/*` PR→auto-merge, `check-version`, `ci-failure` issue, Dependabot aynı-major), IPC okuma kısıtları. CDP ile uçtan uca sınandı. Açık: `quitAndInstall` ve gerçek GitHub güncelleme akışı sınanmadı (v1.1.2 yayınında `latest.yml` yok; ilk gerçek yayın doğrular); uygulama içi (çevrimdışı) Whisper yok; 7B ajan kalitesi; NSIS boyutu yeniden ölçülmedi; Gezgin klavye kes/yapıştır ve sanal liste yok; Dependabot major PR #1–#4 elle.
- 12.11.2026 (5): Ayarlar artık üst katmanda ayrı pencere (modal, ekran içi, Esc); Gezgin yenilendi (filtre, sıralama, gizli dosya, klasör sıkıştırma, simge stili, otomatik göster, sürükle-bırak taşıma, bağlam menüsü: gezginde göster/terminalde aç, görünüm menüsü, son açılanlar); menüler portal; dosya IPC'leri çalışma klasörüne kısıtlandı. Açık: Gezgin klavye ile taşıma (kes/yapıştır) yok; Gezgin çok büyük ağaçlarda sanal liste kullanmıyor.
- 12.11.2026 (4): Snippet özelliği kaldırıldı (eklentiler yalnız tema); başlık çubuğu üç bölgeli ızgara + ortalı arama + kompakt "Menü"; projesiz/dosyasız kapalı düğmeler (`dis()`); UpdateDialog bilgi simgesi. Açık: Karşılama/Gezgin boş durum düğmeleri dar kenar çubuğunda ayrıntılı gözden geçirilmedi.
- 12.11.2026 (3): Güncelleme sistemi (`electron-updater`, `electron-update.cjs`, `UpdateDialog`; sahte beslemeyle denetim→indirme %0-100→hazır sınandı; `quitAndInstall` ve gerçek GitHub yayını SINANMADI), eklenti ağı `net.request` + ayrıntı sayfası (gerçek Open VSX), menü kapalı öğe/ipucu/kaydırma, Çalıştır menüsü algılama, duyarlı tasarım (CDP ile 3 boyutta tarandı), `@layer components` düzeltmesi. CI release'e `latest.yml` yükler (ilk gerçek yayında doğrulanmalı). Açık: NSIS paketi/`asarUnpack` doğrulaması, 7B ajan, uygulama içi Whisper.
- 12.11.2026 (2): Varsayılan AI artık yerleşik yerel model (`node-llama-cpp`, anahtarsız/ücretsiz; 1,5B gerçek modelle Ask+iptal sınandı, ajan 1,5B'de salt-okunur ve zayıf; 7B ajan kalitesi SINANMADI). Üst menü çubuğu, eklenti mağazası (Open VSX, gerçek API'ye karşı sınandı), dosya simgeleri, ajan paneli yeniden tasarımı (CDP ile ekran görüntüsünde taşma ölçüldü). Paket bütçesi: yjs dinamik import + lazy paneller ile 564 KB. Açık: 7B ile ajan denemesi, kurulum paketinde yerleşik model yükleme (asarUnpack) doğrulaması, uygulama içi Whisper dikte, `electron-builder` ile NSIS çıktısı boyutu.
- 12.11.2026: Yapay zekâ asistanı (çoklu sağlayıcı, Ask/Agent, araçlar, oturumlar, görsel, dikte), komut paleti (Ctrl+P / > / : / $), proje araması, hızlı snippet'ler eklendi. Varsayılan sağlayıcı Ollama (yerel, anahtarsız). Açık: gerçek Ollama modeliyle canlı deneme (bu makinede Ollama kurulu değil; motor sahte sunucuyla sınandı), yerel Whisper sunucusuyla dikte canlı denenmedi, Anthropic yolu canlı denenmedi, arayüz elle gözden geçirilmedi, yerel Whisper seçeneği.
- 10.11.2026: Terminal (çoklu oturum, `electron-term.cjs`, panel varsayılan kapalı) ve Gezgin (bölümler, satır içi oluştur/yeniden adlandır, bağlam menüsü) VS Code'a uyarlandı; 10 yeni yerleşim/terminal ayarı. UI testleri `NOVA_HEADLESS=1` ile ekran dışı pencerede.
- 10.11.2026: Açık: gerçek hesapla uçtan uca GitHub giriş/PR denemesi; eski panellerde kalan sabit Türkçe metinler (i18n borcu); `minimatch` (dev) Dependabot hatası electron-builder güncellemesini bekliyor.
- 08.11.2026: Her güncelleme patch sürüm alır (CI). TR+EN sürüm notları `CHANGELOG.md` Unreleased → `release-notes/`. CI'da `version` işindeki bozuk `if:` satırı düzeltildi. Açık: ilk `v1.1.0` release'inin CI'da yeşil geçmesi; 8 dil i18n kapsamı yalnız yeni metinlerde.
