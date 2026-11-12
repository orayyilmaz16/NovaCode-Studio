---
action: terminal
purpose: Entegre terminal: çoklu oturum, panel davranışı, istem, renklendirme
reads: [CLAUDE, PROJECT, security-kvkk, i18n, settings]
writes: [CHANGELOG, DECISIONS, testing]
triggers: ["terminal", "powershell", "cmd", "istem", "ansi", "panel"]
---
# Aksiyon: Terminal

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Ana süreç | `electron-term.cjs` | Kimlikli (`id`) kalıcı kabuk oturumları; PowerShell 7 varsa `pwsh`, yoksa `powershell.exe`; CMD `/Q`. En çok 12 oturum. |
| Preload / tipler | `electron-preload.cjs`, `src/types.ts` | `termStart(shell, cwd, id)`, `termInput(id, line)`, `termStop(id)`; olaylar `term:output|cwd|exit` (hepsi `id` taşır) |
| Arayüz | `src/components/Terminal.tsx` | VS Code tarzı panel: sekmeler, çoklu terminal, satır içi istem |
| Metin | `src/services/terminalText.ts` | ANSI ayrıştırma, komut renklendirme (React span'i, HTML yok) |
| Menü | `src/components/Menu.tsx` | Ortak açılır menü (kabuk seçici, Gezgin menüleri) |

## Panel davranışı (VS Code gibi)
- Panel **varsayılan kapalı**; `Ctrl+\``, başlık çubuğu düğmesi veya karşılama kartıyla açılır. İlk açılışta (klasör varsa) varsayılan kabukla bir terminal başlar.
- Üst çubuk: **TERMINAL | GÜNLÜK** sekmeleri; sağda **+ ▾** (yeni terminal / kabuk seç), temizle, sonlandır, **büyüt/küçült** (panelin %70'i), kapat.
- Birden fazla terminal varsa sağda **oturum listesi** (etkin olanın solunda çizgi, üzerine gelince kapatma). Son terminal kapanınca panel kapanır.
- Panel gizliyken oturumlar **canlı kalır** (bileşen her zaman bağlıdır; yükseklik animasyonla 0'a iner).
- İstem satırı çıktının sonunda **satır içidir** (ayrı çubuk yok): blok/çubuk/alt çizgi imleç (`terminalCursor`), komut renklendirme, ↑/↓ geçmiş, `Ctrl+L` temizle, `Ctrl+C` seçim yoksa satırı iptal eder (`^C`).
- Çıktı üst sınırı `terminalScrollback`; kullanıcı en alttaysa yeni çıktı izlenir, yukarı kaydırdıysa yerinde kalır.

## Çalışma klasörü işareti
Her komuttan sonra kabuğa `@@NOVA_CWD@@<yol>` yazdırılır; `makeCwdFilter` bu satırları ayıklayıp `term:cwd` gönderir (istemdeki yol buradan). CMD için `prompt $E[0m` ile kendi istemi görünmez yapılır ve ilk işarete kadar açılış başlığı atılır.

## Kurallar
- PTY değil, boru: tam ekran programlar (vim, htop) ve gerçek Ctrl+C kesme desteklenmez; bilinen sınırdır.
- `id` yalnız `[a-z0-9-]{1,40}`; `\0` içeren veya 10000+ karakterlik girdi reddedilir.
- Renkler `var(--ansi-N)` değişkenleridir (koyu/açık tema); sabit hex yok.
- Yeni metin [[i18n]] ile 8 dilde; ayarlar [[settings]] şemasında (`terminal*`, `defaultShell`).

## Test
`npm test` → `scripts/tests/term.test.cjs`: süzgeç davranışı, kimlik/sınır reddi ve (Windows'ta) gerçek PowerShell + CMD turu. Arayüz için [[testing]] (gizli profil + DevTools).
