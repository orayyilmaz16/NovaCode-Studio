---
action: extensions
purpose: Eklenti mağazası (Open VSX): arama, yükleme, güncelleme, kaldırma; tema ve snippet katkıları
reads: [CLAUDE, PROJECT, STATE, security-kvkk, i18n, settings]
writes: [CHANGELOG, DECISIONS, STATE]
triggers: ["eklenti", "extension", "marketplace", "mağaza", "vsix", "open vsx", "tema yükle"]
---
# Aksiyon: Eklenti mağazası

Kenar çubuğunda **Eklentiler** (`Ctrl+Shift+X`, yapboz simgesi). İki sekme: **Yüklü** (güncelleme denetimi, "Tümünü güncelle", kaldır, tema uygula) ve **Mağaza** (arama, Temalar / Snippet'ler filtresi, sayfalama).

## Kaynak ve kapsam (dürüst sınır)
- **Kaynak: Open VSX** (open-vsx.org, Eclipse Foundation). Microsoft VS Code Marketplace yalnız Microsoft ürünlerine lisanslıdır; NovaCode'da kullanılmaz.
- **Desteklenen:** renk temaları (`contributes.themes`) ve snippet'ler (`contributes.snippets`).
- **Desteklenmeyen:** kod çalıştıran eklentiler (VS Code eklenti sunucusu yok). Yalnız kod içeren (tema/snippet'i olmayan) eklenti yüklenmez (`runs-code`); hem kod hem tema/snippet içerenin yalnız tema/snippet kısmı çalışır (`partial`).

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Ana süreç | `electron-ext.cjs` | Open VSX arama/ayrıntı, `.vsix` indirme, bellekte ZIP okuma (`zlib`, yeni bağımlılık yok), JSONC ayrıştırma, `userData/extensions/<ns.ad>.json` kaydı, güncelleme denetimi |
| Köprü | `electron-preload.cjs`, `src/types.ts` | `ext.search/list/install/uninstall/checkUpdates` |
| İstemci | `src/services/extensionsService.ts` | Depo (useSyncExternalStore), VS Code teması → Monaco teması dönüştürücü (`SCOPE_MAP`), snippet katkısı (`setExtensionSnippets`) |
| Arayüz | `src/components/ExtensionsPanel.tsx` | Mağaza/yüklü listeleri |
| Tema bağı | ayar `extTheme` (gizli), `EditorArea.tsx` | Etkin eklenti teması; yerleşik tema seçilince (`editorTheme`) temizlenir |

## Güvenlik ve KVKK
- Yalnız `https://open-vsx.org` (API) ve indirme yönlendirmesi için `openvsx.eclipsecontent.org`; yönlendirme sonrası konak denetlenir. İstekte kişisel veri yok (arama sözcüğü ve IP hariç; Eclipse Foundation, AB/ABD altyapısı).
- `.vsix` diske **açılmaz**; yalnız gereken girdiler bellekte okunur (zip-slip yok). Sınırlar: 30 MB paket, 5 MB girdi, 5000 girdi, 12 tema, 40 snippet dosyası.
- Kimlik doğrulaması (`/^[A-Za-z0-9_.-]{1,80}$/`, `..` yok), kayıt yolu yalnız `userData/extensions`.
- Renk değerleri `#RGB/#RRGGBB(AA)` regex'iyle süzülür.
- Mağaza simgeleri open-vsx.org'dan `<img referrerpolicy="no-referrer">` ile yüklenir (3. parti istek; panel altındaki not bunu belirtir).

## Doğrulama
`electron` taklit edilerek (`app.getPath`, `ipcMain`) gerçek Open VSX'e karşı: arama, tema (Dracula) ve snippet (Python) yükleme, eski sürümde güncelleme denetimi, kaldırma, geçersiz kimlik reddi. Yeni bir katkı türü (ör. simge teması) eklenirse `parseVsix` + dönüştürücü + panel + bu dosya güncellenir.
