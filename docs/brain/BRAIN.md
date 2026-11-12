# NovaCode Studio — Proje Beyni

Bu klasör, projeyi çalıştıran her ajanın (Claude Code, alt ajanlar, CI botları) ve insanın **aynı bağlamdan** başlaması için vardır. Bilgi tek yerde durur; dosyalar birbirine çift köşeli parantezli bağlantılarla işaret eder, kopyalamaz.

## Okuma sırası (oturum başı)
1. [[CLAUDE]] — kalıcı kurallar (kısa).
2. [[AGENT]] — iş akışı ve **Durum** (devir notu).
3. [[STATE]] — koddan otomatik üretilen gerçek durum (dosya haritası, IPC kanalları, i18n, iş akışları).
4. Yapılacak işe uyan **aksiyon dosyası** (aşağıda). Başka dosyayı yalnız ihtiyaç olunca aç.

## Bilgi haritası
| Dosya | Ne tutar | Kim yazar |
|---|---|---|
| [[PROJECT]] | Ürün, mimari, süreçler, veri akışları | Elle (mimari değişince) |
| [[DECISIONS]] | Neden böyle yaptık (tarihli karar günlüğü) | Elle (karar alınınca) |
| [[STATE]] | Sürüm, dosya haritası, IPC, i18n, CI | `scripts/brain.mjs` (otomatik) |
| [[AGENT]] | Akış, döngü kuralları, **Durum** | Elle (görev bitince) |
| [[CHANGELOG]] | Kullanıcıya dönük sürüm notları (TR + EN) | Elle (`Unreleased`), CI (sürüm bölümü) |
| [[SECURITY]] | Güvenlik açığı bildirimi (insanlara dönük) | Elle |

## Aksiyonlar (her iş için bir oyun kitabı)
Her aksiyon dosyası baştaki `reads` (önce oku) ve `writes` (bitince güncelle) alanlarıyla haberleşir.

| Aksiyon | Ne zaman kullanılır |
|---|---|
| [[release]] | Commit, sürüm, push, release |
| [[git-github]] | Git paneli, GitHub hesabı, PR, eşzamanlama |
| [[ui-design]] | Arayüz, tema (koyu/açık), logo, animasyon |
| [[settings]] | Ayarlar sistemi: yeni ayar, tema/font/editör |
| [[i18n]] | Arayüze metin eklemek (8 dil) |
| [[security-kvkk]] | IPC, dosya sistemi, token, kişisel veri |
| [[terminal]] | Entegre terminal (gerçek PTY + klasik, PowerShell/CMD) |
| [[debugging]] | Hata ayıklayıcı (Node/JS): kesme noktası, adım, değişkenler |
| [[lsp]] | Dil sunucuları (Python, Rust, Go, C/C++ ...): tamamlama, hover, tanım, tanılama |
| [[text-buffer]] | Piece table metin tamponu ve ajan `edit_lines` aracı |
| [[ai-assistant]] | Yapay zekâ paneli: sağlayıcılar, Ask/Agent, araçlar, oturumlar, görsel, dikte, özel komutlar |
| [[explorer]] | Gezgin: filtre, sıralama, sürükle-bırak taşıma, görünüm seçenekleri, güvenlik |
| [[updates]] | Güncelleme sistemi: denetle, indir (yüzde), yeniden başlat ve kur; yayın hattı |
| [[preview]] | Önizleme (HTML/SVG/MD, localhost), Çalıştır (F5), çalıştırma ayarları |
| [[extensions]] | Eklenti mağazası (Open VSX): tema yükleme, güncelleme |
| [[search-palette]] | Komut paleti (Ctrl+P, `>`, `:`), proje araması |
| [[ci-cd]] | GitHub Actions, audit, bundle bütçesi |
| [[testing]] | Doğrulama: tsc, build, birim ve entegrasyon testleri |
| [[brain-maintenance]] | Bu beyni güncel tutmak |

## Haberleşme kuralları
- Bir aksiyon bitince `writes` listesindeki dosyaları günceller; **Durum** devir notu [[AGENT]] içine yazılır.
- Bir kural değişirse önce [[CLAUDE]]/[[AGENT]], sonra ilgili aksiyon, sonra [[DECISIONS]] güncellenir.
- Yeni aksiyon = `docs/brain/actions/<ad>.md` + bu tabloya satır. Tutarlılığı `npm run brain:check` denetler.
- [[STATE]] elle düzenlenmez; `npm run brain` (veya her Claude turu sonundaki hook) yeniden üretir.
