# NovaCode Studio

Yapay zekâ destekli, VS Code çizgisinde modern kod editörü. **Masaüstü (Electron)** ve **web** olarak çalışır. Arayüz 8 dilde (tr, en, de, ru, ar, es, fr, az), koyu/açık/sistem temalı ve gerçek zamanlı ayarlıdır.

---

## Özellikler

| Alan | Neler var |
|---|---|
| **Gezgin** | VS Code son sürüm uyumlu: Açık düzenleyiciler + çalışma alanı bölümleri, satır içi dosya/klasör oluşturma, F2 ile yeniden adlandırma, sağ tık menüsü, klavye gezinmesi, girinti kılavuzları, Git durumu, animasyonlu açılma. |
| **Editör** | Monaco (VS Code motoru): sözdizimi renklendirme, IntelliSense, parantez eşleme, mini harita, katlama, sekmeler, yol göstergesi. Dosya türüne göre renkli sekme simgeleri. |
| **Gerçek zamanlı dosya takibi** | Açılan klasör izlenir: dışarıdan değişen dosyalar ağaçta ve (kaydedilmemişse) açık sekmelerde anında yenilenir. Son açılan klasörler karşılama ekranında. |
| **Git + GitHub** | GitHub hesabını uygulama içinden bağla (cihaz kodu akışı). Parça parça sahnele/geri al, commit, dal oluştur/geç, eşzamanla (fetch + fast-forward pull + push), Pull Request aç, depoyu GitHub'da yayınla, commit geçmişi, açık PR ve Actions durumu. Hesap bağlı değilken Git verisi kilitli. |
| **Terminal** | VS Code gibi panel: birden çok terminal (PowerShell/CMD), oturum listesi, büyüt/küçült, satır içi istem (çalışma klasörü + Git dalı), renkli komutlar ve ANSI çıktı, ↑/↓ geçmiş, blok/çubuk imleç. Panel gizliyken oturumlar canlı kalır. |
| **Yapay zekâ** | Anahtarsız, ücretsiz yerleşik yerel model (ilk kullanımda tek seferlik indirme) + Ollama + Anthropic/OpenAI; Sor ve Ajan modları (onaylı dosya/komut araçları), görsel, dikte. Ayrıntı: `docs/brain/actions/ai-assistant.md`. |
| **Menü çubuğu ve palet** | Dosya/Düzenle/Seçim/Görünüm/Gezin/Çalıştır/Terminal/Yardım menüleri (kapalı öğeler ipucu verir); `Ctrl+P`, `Ctrl+Shift+P`, `Ctrl+G`, `Ctrl+Shift+F`. Çalıştır menüsü projeyi algılar. |
| **Eklentiler** | Open VSX mağazası: tema eklentileri; ayrıntı sayfası, yükle/güncelle/kaldır (`Ctrl+Shift+X`). |
| **Güncelleme** | Yardım → Güncellemeleri denetle: GitHub Releases'ten indirme yüzdesiyle güncelleme, sürüm notları, yeniden başlat ve güncelle. Ayrıntı: `docs/brain/actions/updates.md`. |
| **Ayarlar** | VS Code tarzı tam sayfa ayarlar: arama, kategoriler, canlı editör önizlemesi. Aşağıya bak. |
| **Ortak düzenleme** | Kendi sunucunda açık kaynak Yjs senkron sunucusu (`server/sync-server.mjs`); token şifreli saklanır. |

### Ayarlar (gerçek zamanlı, `Ctrl+,`)
- **Görünüm:** koyu / açık / sistem, 6 vurgu rengi, arayüz yazı tipi, yakınlaştırma %80–150, animasyonlar, dil.
- **Editör:** tema (Nova Dark/Light, VS Dark/Light, High Contrast), kod yazı tipi (hazır liste veya özel), boyut, satır yüksekliği, kalınlık, harf aralığı, ligatürler, sekme boşluğu, satır kaydırma, satır numaraları, mini harita, boşluk gösterimi, imleç stili/yanıp sönmesi, yumuşak kaydırma, parantez renklendirme, girinti kılavuzları, katlama, sticky scroll, biçimlendirme, otomatik kapatma, öneriler, ipuçları, cetvel sütunları.
- **Dosyalar:** otomatik kayıt (gecikme / odak değişimi), kayıtta satır sonu boşluklarını sil, sona boş satır, karşılama sayfası, dosya ağacında Git durumu.
- **Yerleşim:** kenar çubuğu sol/sağ, etkinlik çubuğu ve durum çubuğu göster/gizle, breadcrumb, açık düzenleyiciler, ağaç yoğunluğu ve girinti kılavuzları.
- **Terminal:** yazı boyutu, satır yüksekliği, geçmiş sınırı, imleç şekli, varsayılan kabuk, komut renklendirme, istemde Git dalı. **Git:** otomatik fetch ve yenileme aralıkları.
- **Yedek:** ayarları JSON olarak dışa/içe aktar, tümünü sıfırla. Ayarlar yalnız bu cihazda tutulur.
- Tam liste (şemadan otomatik üretilir): [`docs/brain/STATE.md`](docs/brain/STATE.md) → *Ayarlar*.

---

## Kurulum ve çalıştırma

```bash
npm install
npm run dev              # web (Vite): http://localhost:5173
npm run electron:dev     # masaüstü geliştirme
npm run build            # web derlemesi
npm run electron:build   # Windows NSIS kurulumu (release/)
```

### GitHub hesabı bağlama (uygulama sahibi için tek seferlik)
1. GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App; **Enable Device Flow** kutusunu işaretle.
2. Client ID'yi `package.json` içindeki `novaGithubClientId` alanına yaz. (Gizli değil; **client secret'ı hiçbir yere yazma**.)
3. Uygulamada Git sekmesi → **GitHub ile giriş yap**. Kod önceden doldurulmuş GitHub sayfası açılır, onaylayınca bağlanır. Token yalnız ana süreçte, şifreli saklanır.

---

## Geliştirme

| Komut | Ne yapar |
|---|---|
| `npx tsc --noEmit` | Tip denetimi (`build` tipleri denetlemez) |
| `npm test` | Git modülü testleri (gerçek git + geçici depolar) |
| `npm run brain` / `npm run brain:check` | Proje beynini üret / tutarlılığı denetle (md bağlantıları, IPC, i18n, ayar şeması) |
| `npx electron scripts/make-icons.cjs` | Uygulama simgesini `public/logo.svg`'den üret |

Kod haritası, mimari ve kurallar için **proje beynine** bak.

## Dökümantasyon haritası

| Dosya | İçerik |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Kalıcı proje kuralları (kısa) |
| [`AGENT.md`](AGENT.md) | İş akışı, sürüm/CI, döngü kuralları, **Durum** (devir notu) |
| [`docs/brain/BRAIN.md`](docs/brain/BRAIN.md) | **Proje beyni**: okuma sırası, aksiyon tablosu, haberleşme kuralları |
| [`docs/brain/PROJECT.md`](docs/brain/PROJECT.md) | Ürün, mimari, süreçler, veri akışları |
| [`docs/brain/DECISIONS.md`](docs/brain/DECISIONS.md) | Tarihli karar günlüğü (neden böyle yaptık) |
| [`docs/brain/STATE.md`](docs/brain/STATE.md) | Koddan otomatik üretilen durum (dosya haritası, IPC, i18n, ayarlar, iş akışları) |
| [`docs/brain/actions/`](docs/brain/actions) | Aksiyon başına oyun kitabı: release, git-github, ui-design, settings, i18n, security-kvkk, terminal, ci-cd, testing, brain-maintenance |
| [`CHANGELOG.md`](CHANGELOG.md) | Sürüm notları (TR + EN) |
| [`SECURITY.md`](SECURITY.md) | Güvenlik açığı bildirimi |

## Sürüm ve yayın
SemVer; tek kaynak `package.json`. CI (GitHub Actions) kalite, güvenlik, sürüm ve Windows kurulumunu otomatik yapar. Ayrıntı: [`docs/brain/actions/release.md`](docs/brain/actions/release.md), [`docs/brain/actions/ci-cd.md`](docs/brain/actions/ci-cd.md).

## Gizlilik ve güvenlik
- Ayarlar, son klasörler ve GitHub token'ı yalnız bu cihazda tutulur; token şifrelidir (Electron `safeStorage`).
- Ağ: yalnız `github.com` / `api.github.com` ve senin girdiğin `wss://` senkron adresi.
- `contextIsolation` açık, renderer'a Node erişimi yok, IPC girdileri doğrulanır. Ayrıntı: [`docs/brain/actions/security-kvkk.md`](docs/brain/actions/security-kvkk.md).
