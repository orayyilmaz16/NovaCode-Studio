---
action: terminal
purpose: Entegre terminal: gerçek PTY (xterm.js) ve klasik boru terminali, çoklu oturum, panel davranışı
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

## Gerçek terminal (PTY) — varsayılan
- `electron-pty.cjs` (`@lydell/node-pty`, ConPTY) + `src/components/PtyView.tsx` (`@xterm/xterm`, `@xterm/addon-fit`) + `src/services/ptyBus.ts` (tekrar oynatma tamponu). Tam ekran programlar (vim, htop), gerçek Ctrl+C, yeniden boyutlandırma çalışır.
- Ayar `terminalMode`: `pty` (varsayılan) / `classic`. PTY yüklenemezse klasik kullanılır. Menüde "· tam/klasik" girişleri.
- Güvenlik: kabuk izin listesi (powershell/cmd), `id` `[a-z0-9-]{1,40}`, `cwd` çalışma klasörü içinde (`withinWorkspace`), en çok 8 oturum, tek yazma 1 MB sınırı, `stopAll` çıkışta.
- Ctrl+Tık: `yol:satır` dosyayı açar, URL tarayıcıda açılır (`nova:open-file`).
- Paketleme: `asarUnpack` içinde `node_modules/@lydell/**/*`; `electron-pty.cjs` `build.files` içinde. Yalnız Windows'ta denendi.
- Test: `scripts/tests/pty.test.cjs` (gerçek PowerShell/CMD, yeniden boyutlandırma, Ctrl+C).

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
- **Klasik** terminal PTY değil, borudur: tam ekran programlar ve gerçek Ctrl+C yoktur; bunlar için PTY kullanılır.
- `id` yalnız `[a-z0-9-]{1,40}`; `\0` içeren veya 10000+ karakterlik girdi reddedilir.
- Renkler `var(--ansi-N)` değişkenleridir (koyu/açık tema); sabit hex yok.
- Yeni metin [[i18n]] ile 8 dilde; ayarlar [[settings]] şemasında (`terminal*`, `defaultShell`).

## Test
`npm test` → `scripts/tests/term.test.cjs`: süzgeç davranışı, kimlik/sınır reddi ve (Windows'ta) gerçek PowerShell + CMD turu. Arayüz için [[testing]] (gizli profil + DevTools).
