---
action: extensions
purpose: Eklenti mağazası (Open VSX): arama, yükleme, güncelleme, kaldırma; tema katkısı
reads: [CLAUDE, PROJECT, STATE, security-kvkk, i18n, settings]
writes: [CHANGELOG, DECISIONS, STATE]
triggers: ["eklenti", "extension", "marketplace", "mağaza", "vsix", "open vsx", "tema yükle"]
---
# Aksiyon: Eklenti mağazası

Kenar çubuğunda **Eklentiler** (`Ctrl+Shift+X`, yapboz simgesi). İki sekme: **Yüklü** (güncelleme denetimi, "Tümünü güncelle", kaldır, tema uygula) ve **Mağaza** (arama, sayfalama).

## Kaynak ve kapsam (dürüst sınır)
- **Kaynak: Open VSX** (open-vsx.org, Eclipse Foundation). Microsoft VS Code Marketplace yalnız Microsoft ürünlerine lisanslıdır; NovaCode'da kullanılmaz.
- **Desteklenen:** yalnız renk temaları (`contributes.themes`). Kod parçacıkları (snippet) uygulamadan kaldırıldığı için desteklenmez.
- **Desteklenmeyen:** kod çalıştıran eklentiler (VS Code eklenti sunucusu yok). Teması olmayan eklenti yüklenmez (`runs-code` / `nothing-supported`); hem kod hem tema içerenin yalnız tema kısmı çalışır (`partial`).

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Ana süreç | `electron-ext.cjs` | Open VSX arama/ayrıntı, `.vsix` indirme, bellekte ZIP okuma (`zlib`, yeni bağımlılık yok), JSONC ayrıştırma, `userData/extensions/<ns.ad>.json` kaydı, güncelleme denetimi |
| Köprü | `electron-preload.cjs`, `src/types.ts` | `ext.search/list/install/uninstall/checkUpdates` |
| İstemci | `src/services/extensionsService.ts` | Depo (useSyncExternalStore), VS Code teması → Monaco teması dönüştürücü (`SCOPE_MAP`) |
| Arayüz | `src/components/ExtensionsPanel.tsx` | Mağaza/yüklü listeleri |
| Tema bağı | ayar `extTheme` (gizli), `EditorArea.tsx` | Etkin eklenti teması; yerleşik tema seçilince (`editorTheme`) temizlenir |

## Ağ ve hata ayıklama
- İstekler `net.request` ile yapılır (Chromium ağ yığını): **sistem proxy'si, VPN ve kurumsal sertifikalara uyar** (Node düz `fetch`'i proxy'yi görmez; bazı ağlarda "internet hatası"nın nedeni buydu). Her yönlendirme tek tek denetlenir (`httpGet`); `net.fetch` yönlendirme sonrası adresi bildirmediği için kullanılmaz.
- Ağ hatasında bir kez yeniden denenir. Hata türleri arayüzde ayrılır: `offline` (internet/proxy/güvenlik duvarı), `timeout`, `http-<kod>`, `failed`; mağazada **Tekrar dene** düğmesi vardır. Günlükte (`Open VSX arama hatası:`) gerçek ileti görünür.
- **Ayrıntı sayfası:** bir eklentiye tıklayınca VS Code'daki gibi açıklama (README), değişiklikler (changelog), yayıncı, sürüm, indirme, puan, lisans, kategori, depo bağlantısı, yükle/güncelle/kaldır ve tema uygula (`ext:details`; `Markdown.tsx` güvenli çizer).
- **VS Code Marketplace (marketplace.visualstudio.com) kullanılmaz:** hizmet şartları yalnız Microsoft ürünlerine izin verir. Open VSX aynı eklentilerin çoğunu açık ve izinli sunar.

## Güvenlik ve KVKK
- Yalnız `https://open-vsx.org` (API) ve indirme yönlendirmesi için `openvsx.eclipsecontent.org`; her yönlendirme adımında konak denetlenir. İstekte kişisel veri yok (arama sözcüğü ve IP hariç; Eclipse Foundation, AB/ABD altyapısı).
- `.vsix` diske **açılmaz**; yalnız gereken girdiler bellekte okunur (zip-slip yok). Sınırlar: 30 MB paket, 5 MB girdi, 5000 girdi, 12 tema.
- Kimlik doğrulaması (`/^[A-Za-z0-9_.-]{1,80}$/`, `..` yok), kayıt yolu yalnız `userData/extensions`.
- Renk değerleri `#RGB/#RRGGBB(AA)` regex'iyle süzülür.
- Mağaza simgeleri open-vsx.org'dan `<img referrerpolicy="no-referrer">` ile yüklenir (3. parti istek; panel altındaki not bunu belirtir).

## Doğrulama
`electron` taklit edilerek (`app.getPath`, `ipcMain`) gerçek Open VSX'e karşı: arama, tema (Dracula) yükleme, eski sürümde güncelleme denetimi, kaldırma, geçersiz kimlik reddi. Yeni bir katkı türü (ör. simge teması) eklenirse `parseVsix` + dönüştürücü + panel + bu dosya güncellenir.

## Ayarlar ve tema seçici entegrasyonu
`autoUpdateExtensions` (12 sn sonra + 6 saatte bir, ayar `extAutoUpdate`); `BUILTIN_THEMES` + `listExtThemes` tek kaynak; paletin `theme` modu (Ctrl+Shift+P → "Renk temasını seç…") ok tuşlarıyla canlı önizler, Esc geri alır.
