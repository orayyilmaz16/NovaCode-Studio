---
action: ci-cd
purpose: GitHub Actions, audit, bundle bütçesi ve yayın hattı
reads: [CLAUDE, AGENT, STATE, release]
writes: [AGENT, DECISIONS, CHANGELOG]
triggers: ["ci", "actions", "workflow", "audit", "pipeline", "deploy"]
---
# Aksiyon: CI/CD

## Hat
`.github/workflows/ci-cd.yml`: `quality` (hijyen, tsc, git testleri, beyin kontrolü, audit, build, bundle bütçesi) → `version` (yalnız **etiket**: `scripts/release.mjs tag` → açıklamalı `vX.Y.Z` etiketi; **commit atmaz**, çünkü main korumalı; `concurrency: release-version`) → `build-desktop` (matris: Windows `.exe`, macOS `.dmg`+`.zip` x64/arm64, Linux `.AppImage`+`.deb`; her biri artifact yükler) → `release-desktop` (artifact'ları indirir, tek GitHub Release'e yükler; yarış yok).
`.github/workflows/security.yml`: CodeQL, gitleaks, dependency review, haftalık `npm audit`. Güncel iş listesi: [[STATE]].

## Kurallar
- Çalışma zamanı bağımlılıkları `npm audit --omit=dev --audit-level=moderate`, tümü `--audit-level=high`. Yalnız dev araç zincirini etkileyen `moderate` bulgu kabul edilir ([[DECISIONS]]).
- Tüm işlerde `timeout-minutes` var; PR koşuları `cancel-in-progress`.
- `chore(auto)` commit'leri patch sürüm alır; `docs/ci/test` sürüm çıkarmaz. Elle yükseltilmiş sürüm: [[release]].
- Döngü koruması: aynı hata iki kez tekrarlanırsa dur ve raporla ([[AGENT]] §8).
- CI yeşil olmadan "yayında" denmez.

## Güncelleyici için yayın dosyaları
`release-desktop` işi release'e `release/*.exe`, `release/*.blockmap` ve **`release/latest.yml`** yükler; `package.json` → `build.publish` (GitHub) ve `electron:build --publish never` gerekir. `latest.yml` eksikse kurulu uygulamalar güncelleme bulamaz. Ayrıntı: [[updates]].

## Sorun giderme
1. `gh run list` / `gh run view <id> --log-failed | tail -n 30`.
2. Kökü bul, tek düzeltme yap, doğrula. Üç doğrulama turunu aşma.
3. Karar ve kalıcı ders → [[DECISIONS]].

## Otomasyon (2026-11)
- `scripts/auto-commit.mjs` (Stop hook): `auto/*` dalında kalır, `origin/main`'i birleştirir (çakışmada durur), açık PR yoksa açar ve `gh pr merge --auto --squash --delete-branch` ile CI yeşilse birleştirir; kapıları (`check-version`, tsc, `brain --check`) PR gövdesine yazar. `NOVA_AUTO_DRY=1` = kuru çalıştırma. `npm run sync` aynı betik.
- Sürüm hazırlığı CI'da değil **PR içinde** yapılır (`scripts/release.mjs prepare`, Stop hook); ayrıntı ve gerekçe: [[versioning]].
- `scripts/check-version.mjs` (`npm run version:check`): semver, lock eşleşmesi, son etiketle karşılaştırma, hazır sürümde `release-notes/vX.Y.Z.md` varlığı, etiketsiz madde uyarısı, CHANGELOG Unreleased tr/en, `__APP_VERSION__`, `build.publish`. CI'da "Sürüm denetimi" adımı.
- **auto-commit düzeltmesi (27.11.2026):** `git add -N` (intent-to-add) kalıntısı `git stash push -u`'u "not uptodate" ile çökertiyordu; harcanmış dalda Stop hook "Auto-commit hatası" verip commit etmiyordu. `leaveSpentBranch` artık stash'siz geçer (`fetch origin main:main` + `git switch` değişiklikleri taşır); yedek stash yolu önce indeksi sıfırlar. Gizli dosya koruması `.env.example/.sample/.template` şablonlarına izin verir (gerçek `.env*`, `.pem`, `.key` engelli). Yeni `.sh` dosyalarına `update-index --chmod=+x`. Test: `scripts/tests/autocommit.test.cjs`. Kural: elle `git add -N` kullanma.
- `ci-failure-issue.yml`: main/auto/* CI hatasında `ci-failure` issue'su açar/günceller, yeşilde kapatır. `dependabot-automerge.yml`: yalnız aynı-major güncellemeleri otomatik birleştirir; major'lar elle.

## Denetim düzeltmeleri (17.11.2026)
Tüm 3. parti action'lar tam commit SHA'ya sabit (yanında sürüm yorumu). Release işinde `npm ci --ignore-scripts` (native modüller için ilk release'te izle). `CSC_LINK`/`CSC_KEY_PASSWORD` secret'ları tanımlıysa Windows imzası; yoksa imzasız devam (`publisherName` sertifika alınınca eklenir). Dependabot auto-merge yalnız `github_actions` ve `direct:development`. Electron fuse'ları: `onlyLoadAppFromAsar`, asar bütünlüğü. `audit:check` CI adımı ve `security.yml` içinde `audit-scan` işi: [[audit]].

## PR #66 inceleme düzeltmeleri (17.11.2026)
- **gitleaks:** `.gitleaks.toml` varsayılan kuralları genişletir; yalnız `ai-security.test.cjs` ve `syncserver.test.cjs` içindeki bilinen sahte test değerleri (token fixture, standart örnek `Sec-WebSocket-Key`) için dar izin (yol + desen birlikte). Gerçek sır yoktu.
- **CodeQL:** `Preview.tsx` köprüsünde script içine gömülen JSON artık `<`, `>`, `&`, U+2028/2029 için `\u` kaçışı yapar; `audit-scan.mjs` `replace` yerine `split/join`; bilinçli katastrofik regex girdileri içeren `search-redos.test.cjs` yalnız o dosya için `codeql-config.yml` `paths-ignore`.
- gitleaks için `.gitleaksignore` (3 bilinen test parmak izi) ve eski/yeni sürümlerle uyumlu `[allowlist]` regex izni eklendi; gömülü gitleaks çoğul `allowlists` tablo biçimini uygulamadı.
- `dependabot-automerge.yml` içinde `if:` ve `env:` satırları yapışmıştı (geçersiz YAML, workflow hiç çalışmıyordu); düzeltildi. Workflow dosyalarını değiştirirken `node -e "require(\"js-yaml\").load(require(\"fs\").readFileSync(f,\"utf8\"))"` ile ayrıştırmayı doğrula.

## Masaüstü derleme güvenilirliği (25.11.2026)
- Kök neden: `ssh2` isteğe bağlı `cpu-features` (node-gyp) paketini getirdi; `electron-builder` `@electron/rebuild` ile onu derlemeye çalışıp Windows runner'da düştü (`npm ci --ignore-scripts` ile gyp ön dosyası üretilmediği için). Çözüm: `build.npmRebuild:false` + `cpu-features`/`nan` pakete alınmaz (ssh2 saf JS yoluna düşer; `@lydell/node-pty` önceden derlenmiş).
- `desktop-smoke` işi: PR'da paketlemeyi etkileyen dosya (package*.json, electron-*.cjs, public/, ci-cd.yml) değiştiyse 3 işletim sisteminde (matris) `electron-builder --dir` dener; aksi halde atlanır.
- Elle yeniden deneme: Actions → CI/CD → Run workflow → `release_tag` (ör. v1.5.1). Derlenen kod, workflow'un çalıştırıldığı dal/commit’tir (etiket eski kodda kalmış olabilir); etiket yalnız Release adı ve notu içindir. Kalite işi yeşilse kurulum ve Release üretilir.
- Hız: `NPM_CONFIG_{FUND,AUDIT}=false`, `PREFER_OFFLINE`, electron/electron-builder önbelleği (SHA sabitli `actions/cache`); eski PR koşuları iptal edilir, main koşuları iptal edilmez.

## Electron, Chromium ve Node.js hep güncel (25.11.2026)
- Electron kendi Chromium ve Node.js sürümünü getirir; Electron yükselince ikisi de yükselir (uygulamanın Node/Chromium sürümü başka yerden ayarlanmaz).
- `dependabot.yml`: npm **günlük**; `electron`, `electron-builder`, `@electron/*` tek `electron-stack` grubunda birlikte yükselir.
- `dependabot-automerge.yml`: yalnız bu yığının PR'ları **ana sürüm dahil** auto-merge alır; diğer bağımlılıklarda eski kural (aynı ana sürüm, yalnız devDependencies/Actions) sürer. Birleşme CI yeşil olunca olur (tip, test, build, bütçe, PR'da Windows paketleme denetimi).
- CI araç Node sürümü 22 → 24 (LTS). Uygulamanın çalışma zamanı Node'u Electron'dan gelir.
- Sürüm: bağımlılık PR'ı CHANGELOG maddesi taşımaz; Electron yükseltmesi kullanıcıya bir sonraki sürümle (herhangi bir madde sürümü çıkarınca) ulaşır.

- Sürüm otomasyonu: `auto-release.yml` (bkz. versioning.md). Electron/çalışma zamanı bağımlılık yükseltmesi artık kendi sürümünü hazırlatır; ayar açıksa insan müdahalesi gerekmez.

## Otonom akış özeti (25.11.2026)
| Olay | Ne olur | Kapı |
|---|---|---|
| Dependabot günlük PR | Electron yığını (major dahil), GitHub Actions (major dahil), diğer npm patch/minor → auto-merge | Zorunlu kontrol `Kalite, Güvenlik ve Performans` + PR'da Windows paketleme |
| Diğer npm major | PR açık kalır | İnsan inceler |
| main'e bağımlılık/CHANGELOG girer | `auto-release.yml` madde yazar (gerekirse), sürümü hazırlar, PR açar, CI'ı tetikler, auto-merge | CI yeşil |
| Sürüm PR'ı birleşir | `ci-cd.yml` etiket atar → Windows kurulum + GitHub Release | Kalite işi yeşil |
| Herhangi bir PR birleşir | Dal otomatik silinir (`delete_branch_on_merge`) | — |
| Otomasyon/CI düşer | `ci-failure-issue.yml` issue açar, yeşilde kapatır (`CI başarısız: dal` / `Otomasyon başarısız: iş akışı`) | — |
İnsan müdahalesi yalnız: diğer npm major'ları, kırılan CI, KVKK/ürün kararları.


**Çok platformlu paketleme (26.11.2026, kurucu isteği):** `package.json` `build.mac` (dmg+zip, x64+arm64, `NovaCode-Studio-{sürüm}-mac-{arch}`), `build.linux` (AppImage+deb, x64). İmza: `CSC_LINK`/`CSC_KEY_PASSWORD` (+ macOS noterliği için `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`) tanımsızsa imzasız üretilir; imzasız macOS'ta otomatik güncelleme ve Gatekeeper sorun çıkarır. `desktop-smoke` iş adı matrisle `Masaüstü paketleme denetimi (OS)` oldu; dal korumasında bu adı zorunlu kontrol olarak tanımlıysan güncelle. Güncelleyici: `latest.yml` (Win), `latest-mac.yml`, `latest-linux.yml`; Linux'ta yalnız AppImage kendini günceller, .deb elle.

## Bağımlılık otopilotu (27.11.2026)
`dep-autopilot.yml` (haftalık rapor + güvenli güncelleme PR'ı + temizlik, major elle) ve `dep-review.yml` (PR fark yorumu + etiket). Ayrıntı ve kurallar: [[updates]] → "Bağımlılık otopilotu".

## Bağımlılık otopilotu (27.11.2026)
`dep-autopilot.yml` (haftalık rapor + güvenli güncelleme PR'ı + temizlik, major elle) ve `dep-review.yml` (PR fark yorumu + etiket). Ayrıntı ve kurallar: [[updates]] → "Bağımlılık otopilotu".
