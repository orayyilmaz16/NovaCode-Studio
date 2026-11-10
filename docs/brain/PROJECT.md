# Proje: NovaCode Studio

Yapay zekâ destekli, VS Code çizgisinde masaüstü/web kod editörü. Dil: Türkçe arayüz (8 dil metin altyapısı). Kod ve commit mesajları İngilizce olabilir.

## Teknoloji
Electron + React 19 + Vite + Monaco + Tailwind 4 + TypeScript (strict). Ortak düzenleme için açık kaynak Yjs sunucusu (`server/sync-server.mjs`, kendi sunucunda). Güncel sürümler: [[STATE]].

## Süreç modeli
| Katman | Dosyalar | Sorumluluk |
|---|---|---|
| Ana süreç | `electron-main.cjs`, `electron-git.cjs`, `electron-github.cjs`, `electron-secrets.cjs` | Dosya sistemi, izleyiciler, git, GitHub, terminal kabukları, IPC |
| Preload | `electron-preload.cjs` | `contextBridge` ile dar, tipli API (`window.electronAPI`) |
| Renderer | `src/` | Arayüz; Node erişimi yok, `contextIsolation` açık |

IPC kanallarının güncel listesi [[STATE]] içindedir. Her kanal `electron-preload.cjs` ve `src/types.ts` ile eşleşmelidir (`npm run brain:check` denetler).

## Ana veri akışları
- **Klasör açma:** `dialog:openFolder` → `openWorkspace()` → izleyici başlar, son klasörlere yazılır → ağaç döner. Dosya/`.git` değişimi `fs:watch-change` / `git:changed` olaylarıyla anında arayüze gelir.
- **Git:** Arayüz yalnız GitHub hesabı bağlıyken Git verisi görür; kilit ana süreçte de zorlanır. Ayrıntı: [[git-github]].
- **GitHub girişi:** OAuth Device Flow. Token yalnız ana süreçte, `safeStorage` ile şifreli saklanır; renderer'a profil gider, token gitmez.
- **Terminal:** `child_process` ile kalıcı kabuk oturumları; her komuttan sonra çalışma klasörü işareti okunur, arayüz istemi çizer. Ayrıntı: [[terminal]].
- **Ortak düzenleme:** Yalnız kullanıcının girdiği `wss://` adresine dosya içeriği gider; varsayılan sunucu yok.

## Ayarlar
Gerçek zamanlı, şema güdümlü ayar sistemi: `src/services/settingsSchema.json` (tek kaynak) → doğrulama, arayüz (`SettingsPage`) ve belge üretimi. Tema (koyu/açık/sistem), vurgu rengi, yazı tipleri, yakınlaştırma, dil, editör, snippet, kayıt, terminal, Git aralıkları, ortak düzenleme. Yerelde saklanır; token şifreli (`electron-secrets.cjs`). Ayrıntı: [[settings]].

## Arayüz
VS Code "Dark Modern" çizgisi: düz yüzeyler, cam/bulanıklık yok. Tasarım jetonları `src/style.css` (`@theme`). Marka: arka plansız gradient logo (`public/logo.svg`). Ayrıntı: [[ui-design]].

## Güvenlik ve KVKK özeti
Yol doğrulama (path traversal), `execFile` ile argüman dizisi (kabuk enjeksiyonu yok), token ortam değişkeniyle (argümanla değil), `webSecurity` açık. Ayrıntı: [[security-kvkk]].

## Sürüm ve yayın
SemVer, tek kaynak `package.json`; CI sürüm hesaplar, etiketler, Windows kurulumunu derler. Ayrıntı: [[release]], [[ci-cd]].
