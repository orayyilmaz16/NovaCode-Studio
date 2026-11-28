# Duman ve regresyon listesi

Her sürüm adayında bu liste koşulur. Maddeler geçmişteki gerçek hatalardan çıkar ([[BACKLOG]] kimlikleri parantezde). Bir madde kalırsa sürüm çıkmaz; issue açılır ve etiketlenir ([[qa-agile]] Bölüm 3).

**Ortam:** Windows 11, sürüm adayı kurulum paketi veya `npm run electron:dev`. Ayrı profil için `--user-data-dir` ([[testing]]). Örnek proje klasörü kullanılır.

## Liste

| Kimlik | Adım | Beklenen | Kaynak |
|---|---|---|---|
| SM-01 | Uygulamayı aç | Açılış takılmadan tamamlanır, karşılama ekranı görünür | P-11, P-14 |
| SM-02 | Boşluk ve Türkçe karakterli bir klasör aç | Ağaç eksiksiz yüklenir, yollar doğru | B-10 |
| SM-03 | Dosyayı düzenle, Ctrl+S ile kaydet | Kayıt diske yazılır; kayıt sırasında yazılan karakter kaybolmaz | B-06, B-08 |
| SM-04 | Kaydedilmemiş sekmeyi kapat (X, Ctrl+W, orta tık) | Kaydet / Kaydetme / İptal sorulur | B-01 |
| SM-05 | Kaydedilmemiş değişiklikle pencereyi kapat | Uygulama sorar, sessiz kapanmaz | B-02 |
| SM-06 | Bir dosyayı sil | Dosya çöp kutusuna gider; hata varsa sekme açık kalır ve hata gösterilir | B-03, B-04 |
| SM-07 | Açık bir dosyayı dışarıda değiştir | Uygulama değişikliği fark eder veya rozet gösterir; kayıt diski sessizce ezmez | B-05 |
| SM-08 | Sekmeleri açık bırakıp uygulamayı yeniden başlat | Sekmeler ve oturum geri gelir | B-14, F-01 |
| SM-09 | Git paneli: değişiklik sahneleme ve commit (GitHub bağlı) | Commit oluşur, geçmiş güncellenir | git-github |
| SM-10 | Git paneli: GitHub bağlı değilken | Kilitli durum açıklayıcı; hata yok | git-github |
| SM-11 | Terminal: PowerShell aç, komut çalıştır, `cd` ile klasör değiştir | Çıktı akar, klasör değişir | B-12 |
| SM-12 | Ayarlardan 8 dilin her birine geç | Metinler değişir, taşma veya kırık düzen yok; Arapça düzen sağa yaslanır | I-01, I-02 |
| SM-13 | Ayarlar penceresini aç, Esc ile kapat | Kapanır, odak tetikleyen düğmeye döner | B-15 |
| SM-14 | Güncelleme denetle | Hata vermeden sonuç döner (sahte besleme dışında gerçek akış ilk yayında doğrulanır) | updates |
| SM-15 | AI panelini aç, sağlayıcı yokken dene | Anlaşılır mesaj; API anahtarı ekranda düz metin görünmez | S-09 |
| SM-16 | HTML önizlemesi aç, sayfadaki dış bağlantıya tıkla | Dış bağlantı tarayıcıda açılır, uygulama içinde gezinmez | S-11, S-12, B-13 |
| SM-17 | Ajan aracıyla `.git/` altına yazmayı dene (test ortamında) | Reddedilir | S-06 |
| SM-18 | Ortak düzenleme oda adı üret | Oda adında yerel yol yok | S-14 |
| SM-19 | Tab ile ayarlar ve gezgin bölüm başlıklarına git | Klavye ile açılır, `aria-expanded` doğru | U-01 |
| SM-20 | `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run brain:check` | Hepsi yeşil | [[testing]] |
| SM-21 | `CHANGELOG.md` Unreleased | Kullanıcıya görünen her madde tr ve en içerir | versioning |

## Koşu kayıtları

| Tarih | Sürüm | Yapan | Geçen | Kalan (issue) | Not |
|---|---|---|---|---|---|
| — | — | — | — | — | Henüz koşu yok. İlk koşu Sprint 1'de planlanır ([[SPRINTS]]). |
