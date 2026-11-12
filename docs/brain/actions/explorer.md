---
action: explorer
purpose: Gezgin (dosya ağacı): görünüm seçenekleri, filtre, sürükle-bırak taşıma, bağlam menüsü, simge stilleri, güvenlik kuralları
reads: [CLAUDE, PROJECT, STATE, security-kvkk, i18n, settings, ui-design]
writes: [CHANGELOG, DECISIONS, STATE, settings]
triggers: ["gezgin", "explorer", "dosya ağacı", "filtre", "sürükle", "taşı", "sırala", "gizli dosya", "klasör sıkıştır", "simge stili"]
---
# Aksiyon: Gezgin

`src/components/FileTree.tsx` (kenar çubuğu → Gezgin). Veriyi App'ten alır (`files`, `openFiles`, Git işaretleri); düzenleme işlemleri App'e geri döner (`onCreate`, `onRename`, `onMove`, `onDelete`, `onCloseAll`, `onOpenInTerminal`, `onOpenRecent`).

## Özellikler
- **Araç çubuğu (başlıkta, hep görünür):** Yeni dosya, Yeni klasör, Yenile, Filtrele, Görünüm seçenekleri (…). Klasör yokken soluk (`aria-disabled`) ve ipucu "Önce bir klasör aç" ([[ui-design]] kapalı düğme kuralı).
- **Filtre (Ctrl+F, ağaç odaktayken):** ada göre alt dize eşleşmesi, eşleşme vurgulanır, üst klasörler otomatik açılır, sonuç sayısı gösterilir; `Esc` temizler/kapatır. Eşleşen klasörün çocukları süzülmeden görünür.
- **Görünüm seçenekleri menüsü (✓ işaretli):** sıralama (klasörler önce / dosyalar önce / karışık / türe göre), gizli dosyaları göster, klasörleri sıkıştır (`a / b / c` tek satır), etkin dosyayı göster, girinti çizgileri, açık düzenleyiciler, Git durumu, simge stili (renkli rozet / sade tek renk), satır yüksekliği (sıkı 22 / rahat 28 / geniş 34 px). Her seçenek bir **ayardır** (`settingsSchema.json` → kategori `files`); menüden değiştirmek ayarlar sayfasındakiyle aynıdır, anında uygulanır ve saklanır.
- **Etkin dosyayı göster (`treeAutoReveal`):** sekme değişince/dosya açılınca üst klasörler açılır ve satıra kaydırılır (yalnız etkin dosya değişince; kullanıcının elle daralttığını sürekli geri açmaz).
- **Sürükle-bırak taşıma:** satır sürüklenip klasör satırına (ya da boş alana = kök) bırakılır; kapalı klasör üstünde 700 ms beklerse açılır; hedef vurgulanır. Geçersiz hedefler (zaten orada, klasörü kendi içine) vurgulanmaz/yapılmaz. Açık sekmeler yeni yola taşınır (`App.tsx` → `handleMove`).
- **Bağlam menüsü:** yeni dosya/klasör, yeniden adlandır (F2), sil (Del), yolu/göreli yolu kopyala, **Dosya gezgininde göster**, **Terminalde aç** (etkin kabuğa uygun `cd` — `terminalBridge` `cd` eylemi).
- **Açık düzenleyiciler:** hover'da "Tümünü kapat" (kaydedilmemiş varsa onay), kaydedilmemiş nokta, etkin satırda vurgu çubuğu.
- **Boş durumlar:** klasör yoksa ikonlu kart + Klasör/Dosya Aç düğmeleri + **Son açılanlar** (5); klasör boşsa "Yeni dosya/klasör"; filtre sonuçsuzsa mesaj.
- Çalışma alanı başlığı **yapışkan** (uzun ağaçta kayarken görünür).

## Güvenlik (bozulmaz)
Ana süreçteki dosya IPC'leri yolu doğrular (`electron-main.cjs`): `fs:renameItem` (taşıma dahil), `fs:createFile`, `fs:createFolder`, `fs:deleteItem` yalnız **açık çalışma klasörünün içinde** çalışır; kök klasörün kendisi silinemez/taşınamaz; hedef varsa **üzerine yazılmaz**; klasör kendi içine taşınamaz. `fs:writeFile` çalışma klasörü içinde ya da kullanıcının "Dosya Aç" diyaloğuyla seçtiği dosyalara yazar. `app:reveal` yalnız çalışma klasörü içindeki var olan yolları gösterir. `cd` komutu tırnak/kabuk metakarakteri içeren yolu reddeder.

## Ayarlar (kategori: Dosyalar ve kayıt)
`treeSort`, `treeShowHidden`, `treeCompactFolders`, `treeIconStyle`, `treeAutoReveal`, `treeDensity` (3 değer), `treeIndentGuides`, `showOpenEditors`, `showGitDecorations`. Yeni seçenek = şemaya satır + [[i18n]] `set_<id>` (8 dil) + `FileTree.tsx` içinde okuma + görünüm menüsüne öğe.

## Doğrulama
Geçici bir çalışma alanında (depo dışı) gerçek Electron + CDP: dosya→klasör, klasör→klasör taşıma diskte doğrulandı, klasörü kendi içine bırakma engellendi; IPC güvenliği (dışarı/dışarıdan taşıma, üzerine yazma) test edildi. **Not:** Vite'ın dosya izleyicisi silinen klasörü kısa süre "silinmeyi bekliyor" tutabilir (Windows); testleri depo içinde değil geçici klasörde yap.
