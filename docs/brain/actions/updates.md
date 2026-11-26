---
action: updates
purpose: Uygulama güncelleme sistemi: denetle, indir (yüzde), yeniden başlat ve kur; sürüm notları; yayın hattı
reads: [CLAUDE, PROJECT, STATE, security-kvkk, ci-cd, release, i18n, settings]
writes: [CHANGELOG, DECISIONS, STATE, ci-cd]
triggers: ["güncelleme", "update", "electron-updater", "latest.yml", "sürüm notları", "yeniden başlat", "release"]
---
# Aksiyon: Güncelleme sistemi

Kullanıcı yüzü: **Yardım → Güncellemeleri denetle…** ve **Sürüm notları**, durum çubuğunda (sağ alt) güncelleme göstergesi, ayarlar → *Hakkında ve yedek* içinde iki ayar.

## Akış
`idle → checking → available → downloading (yüzde, MB, hız) → ready → "Yeniden başlat ve güncelle"` (`quitAndInstall`). Hata: `error` + kod (`network`, `no-release`, `checksum`, `failed`); `none` = güncel. Geliştirme sürümünde `unsupported` (kurulu uygulamada çalışır).
- **Gösterge:** `UpdateIndicator` yalnız anlamlı durumlarda görünür; indirirken mini ilerleme çubuğu + `%xx`; üzerine gelince `%xx (indirilen / toplam)`; tıklayınca `UpdateDialog`.
- **Pencere:** iki sekme (Güncelleme / Sürüm notları). Notlar GitHub API'den **markdown** olarak alınır ve `Markdown.tsx` ile güvenli çizilir (HTML basılmaz, görsel yok, yalnız https bağlantı).
- **Ayarlar:** `updateAutoCheck` (varsayılan açık: açılıştan 8 sn sonra ve 6 saatte bir sessiz denetim), `updateAutoDownload` (varsayılan **kapalı**). Kurulum her zaman kullanıcının "Yeniden başlat ve güncelle" onayıyla.

## Mimari
| Parça | Dosya |
|---|---|
| Motor | `electron-update.cjs` (`electron-updater`, GitHub Releases, SHA-512 doğrulama; durum makinesi; IPC `update:*`) |
| Köprü/tipler | `electron-preload.cjs` (`update.*`, `openLink`), `src/types.ts` (`UpdateState`, `ReleaseInfo`) |
| İstemci | `src/services/updateService.ts` (`useUpdate`, `checkForUpdates`…), `src/components/UpdateDialog.tsx`, `src/components/Markdown.tsx` |
| App bağı | `App.tsx` → Yardım menüsü, açılış denetimi, `UpdateIndicator` |

## Yayın hattı (zorunlu — yoksa güncelleyici çalışmaz)
- `package.json` → `build.publish` (GitHub, `orayyilmaz16/NovaCode-Studio`) olmalı: `electron-builder` kuruluma `app-update.yml` gömer ve `latest.yml` üretir. `electron:build` betiği `--publish never` ile çalışır (yayını CI yapar).
- `ci-cd.yml` → `release-desktop` release'e **`release/*.exe`, `release/*.blockmap`, `release/latest.yml`** yükler. `latest.yml` eksikse "no-release" hatası alınır. Etiket (`vX.Y.Z`) ile `package.json` sürümü uyumlu olmalı ([[release]]).
- İmzasız kurulum çalışır (Windows SmartScreen uyarısı verir); kod imzası eklenirse `publisherName` ayarlanır.

## Test (gerçek yayın olmadan)
`NOVA_UPDATE_FEED=http://127.0.0.1:<port>` ile geliştirmede sahte `generic` besleme: `latest.yml` (sürüm 9.9.9, `sha512`, `size`) + yavaş akan dosya sunan küçük bir Node sunucusu. Gerekli: depo kökünde `dev-app-update.yml` (`provider: generic`, `url: …`; `.gitignore`'da). Doğrulanan: denetim, otomatik açılış denetimi, indirme yüzdeleri (0→100), `ready`, hazırken yeniden denetimin durumu bozmaması. `quitAndInstall` yalnız kurulu uygulamada denenir.

## KVKK
Denetim ve notlar `github.com` / `api.github.com`'a gider: IP, uygulama sürümü, platform (kişisel veri yok). Yalnız kullanıcı isteğiyle veya "açılışta denetle" açıkken. Ayar açıklamaları ve pencere altındaki not bunu belirtir. Envanter: [[security-kvkk]].

## Kanallar ve otomatik davranış
- `channel`: paketli uygulama = `stable` (electron-updater, gerçek güncelleme); geliştirme = `dev` (GitHub `/releases/latest` ile `semverGt` karşılaştırması, `releaseUrl` ile yayın sayfası açılır). `none` → "Son sürümdesiniz (v{v})".
- `updateAutoDownload` varsayılanı artık **açık**; kurulum yine kullanıcı onayıyla. Menüden denetim aşamaları (denetleniyor → bulundu → indiriyor) pencerede görünür.

## Denetim düzeltmeleri (17.11.2026)
`NOVA_UPDATE_FEED` yalnız paketlenmemiş uygulamada geçerli.

**Geliştirme kanalında denetim yok (25.11.2026):** `electron-update.cjs` `update:check`: kanal `dev` (paketli değil ve NOVA_UPDATE_FEED yok) ise ağ isteği yapmaz, durum `unsupported` olur; eski "son yayınla karşılaştır" ve "yayın sayfasını aç" kaldırıldı. Kurulu (`stable`) uygulama: denetle → bulursa indir (varsayılan otomatik, kurulum kullanıcı onayıyla) → yoksa "güncelsin". `updDevNote` 8 dilde yenilendi. `update:releases` (Sürüm notları sekmesi) kullanıcı tıklamasıyla çalışmaya devam eder.

**Hakkında: son Electron/Chromium/Node.js (25.11.2026):** `update:runtime-latest` (`electron-update.cjs`) kurulu uygulamada `https://electronjs.org/headers/index.json` dizininden en yüksek kararlı Electron sürümünü ve onun `chrome`/`node` değerlerini döndürür (6 saat önbellek; 26.11.2026 itibarıyla geliştirme modunda da çalışır, yalnız sürüm bilgisi okunur). `SettingsPage.tsx` Hakkında satırında çalışan sürümün yanına `son: X` ekler (`aboutLatest`, 8 dil). KVKK: yalnız IP gider, kişisel veri yok; Hakkında açılınca tek istek.

