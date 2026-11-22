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

## Denetim düzeltmeleri (17.11.2026)
Klasik terminal `cwd` çalışma klasörüyle sınırlı; PowerShell `RemoteSigned` (Bypass kalktı). Kabuk hazır olunca `term:ready` olayı (renderer'da `setTimeout` yerine). Kapanışta süreç ağaçları `taskkill /T /F`; PTY'de ağaç öldürüldükten sonra `p.kill()` çağrılmaz (ConPTY).

`cd` komutu `cdCommand(shell, dir)` ile kabuğa uygun alıntılanır (PowerShell tek tırnak, cmd çift tırnak); denetim karakteri/yeni satır/4096+ karakter reddedilir, cmd'de `%` ve `"` içeren yolda `cd` yapılmaz. Bekleyen komutlar FIFO kuyruğu (`cd` ve `run` birbirini ezmez).

## Alt panel sekmeleri ve Test sekmesi (21.11.2026)
`Terminal.tsx` alt panelin kabuğudur; sekmeler: Sorunlar (`ProblemsPanel`), Çıktı (`OutputPanel`: uygulama/git/görev günlüğü, düzey süzgeci, arama, kopyala, otomatik kaydır), Hata ayıklama konsolu (`DebugConsolePanel`: `debugStore.lines` + `evalExpr`, ↑/↓ geçmiş, `clearDebugConsole`), Terminal (üstte kabuk/klasör/dal şeridi) ve Test (`TestPanel`). Sekme etiketleri dar panelde (`@md` altı) gizlenir, yalnız simge kalır. Köprü: `sendTerminal({ action: 'tab', tab })` artık `debug` ve `tests` da kabul eder; `run`/`cd` eylemleri `stay: true` ile sekme değiştirmez.

**Test sekmesi:** `loadTasks` çıktısından `isTestTask` ile süzülen görevler (package.json `test*`/`vitest`/`jest`/`e2e`/`coverage` betikleri, `.nova/tasks.json`) `runTask(task, root, { stay: true })` ile terminalde çalışır (güvenilmeyen klasörde onay istemi aynıdır). Sonuç yeni süreç açılmadan, etkin oturumun çıktısından `services/testParse.ts` ile okunur: Jest, Vitest, Node test runner (`ℹ tests/pass/fail`) ve pytest özet satırları + başarısız test adları. PTY çıktısı `ptyBus.getPtyBuffer`/`tapPty` ile, klasik oturum `session.output` ile okunur. Çıktı ve kod dışarı gönderilmez (KVKK etkisi yok). Metinler `uiTextDev.ts` (`pnl*`, 8 dil).

### Fluent görünümü (21.11.2026)
Alt panelde yumuşak, katmanlı yüzeyler: sekmeler `h-7` dolgulu hap (`bg-white/[0.07]` etkin, hover `/[0.05]`) ve altta 14 px vurgu çubuğu; süzgeç rozetleri `rounded-full` (etkin `indigo-500/20`); arama ve ifade alanları `bg-white/[0.05]` + odakta alt çizgi (`inset 0 -2px`, indigo); satırlar/kartlar `rounded-md/lg/xl` ve `white/[0.04–0.06]` katmanları. Sert kenarlık çizgileri yerine katman farkı kullanılır; gölge eklenmedi ([[ui-design]] kural 9).

### Fluent geçişleri (22.11.2026)
- **Kayan hap:** Etkin sekmenin zemini ve alttaki 14 px vurgu çubuğu tek `<span>`'dır (`listRef` içinde, `absolute`); `offsetLeft/Top/Width/Height` ölçülür, `ResizeObserver` etiket gizlenmesi/rozet değişimini izler. Geçiş `transform + width`, `--dur-slow` + `--ease-out-soft`; ilk yerleşim kaymasızdır (`pillReady`). Düğmelerin kendi zemini yalnız hover'dadır. Renkler `--hover-overlay` / `--active-overlay` (açık temada da görünür; eski `white/[…]` açıkta görünmüyordu).
- **İçerik geçişi:** Terminal dışı paneller ve klasik terminal `animate-pane-in` sarmalayıcısındadır; anahtar sekme (terminalde oturum kimliği de) olduğundan değişimde yeniden belirir. Yön `TAB_ORDER` ile hesaplanır (`--pane-dir` ±1, RTL'de `--pane-flip`). Gerçek terminal (`PtyView`) kendi `animate-editor-in` solmasını yapar (yalnız opaklık; xterm yeniden boyutu etkilenmesin).
- **Araç çubuğu:** + ve ▾ tek bölünmüş düğme (yuvarlak, `--hover-overlay` zemin, ince ayraç). Kabuk şeridi oturum değişince yeniden belirir.
- **Oturum listesi:** `p-1.5` kenar boşluğu, `h-8` yuvarlak kart satırları, etkinde `--active-overlay` + yumuşak açılan sol çizgi; kapat düğmesi `focus-visible`'da da görünür.

### Git Bash (22.11.2026)
- Üçüncü kabuk: `gitbash`, **yalnız gerçek terminalde (PTY)**; boru (klasik) terminali bash için uygun değildir (istem/cwd işareti yok), bu yüzden `createSession` `gitbash` için türü PTY'ye zorlar ve menüde yalnız "· tam" girişi vardır.
- `electron-pty.cjs` `findGitBash()`: `Program Files\Git\bin\bash.exe` (ProgramFiles / ProgramW6432 / x86 / `%LOCALAPPDATA%\Programs`) ve PATH'teki `git.exe`'ye göre bulunur. Yol rendererdan gelmez; System32'deki WSL `bash.exe` aranmaz. Argümanlar `--login -i`, ortam `CHERE_INVOKING=1` (oturum çalışma klasöründe kalır).
- `pty:available` → `{ available, gitBash }`; açılır listede "Git Bash · tam" her zaman vardır (`gitBash` yoksa `disabled` + `termNoGitBash` ipucu), `+` yanındaki Git simgeli hızlı düğme yalnız `gitBash` doğruysa görünür. Ana süreç değişikliği için uygulamayı yeniden başlatmak gerekir (eski ana süreç `gitBash` alanını döndürmez). Bulunamazsa `pty:start` `no-gitbash` döner (`termNoGitBash`, 8 dil).
- Ayar `defaultShell`: `gitbash` seçeneği eklendi; Git Bash/PTY yoksa sessizce PowerShell'e düşer.
- `cdCommand('gitbash', dir)`: `cd 'C:/yol'` (ters eğik çizgi düzleşir, tek tırnak `'\''` ile kaçırılır).
- Test: `scripts/tests/pty.test.cjs` (Git Bash kuruluysa gerçek oturum, çalışma klasörü; yoksa `no-gitbash` hatası).
- KVKK: yerel süreç; veri dışarı gönderilmez.

**Başlatma hatası (22.11.2026):** PTY oturumunda `pty:start` başarısızsa `Session.failed` işaretlenir ve panelin üstünde `role="alert"` kırmızı uyarı çıkar (PTY'de kabuk çıktısı olmadığından hata önceden hiç görünmüyordu). Ana süreç dosyaları (`electron-*.cjs`) değişince çalışan uygulama eski kodla kalır: Git Bash gibi ana süreç özellikleri için `electron:dev` yeniden başlatılmalıdır.

### Kurulu kabuk profilleri (22.11.2026)
- `electron-pty.cjs` `detectProfiles()` bilgisayardaki kabukları bulur ve 15 sn önbelleğe alır (zorla yenileme en sık 2 sn'de bir): `powershell` (PowerShell 7 varsa o, yoksa Windows PowerShell), `winps` (7 varken Windows PowerShell 5.1), `cmd`, `gitbash`, `wsl:<dağıtım>` (`wsl -l -q`, UTF-16LE çıktı; docker-desktop ve boşluklu/hata satırları elenir; `wsl.exe -d <ad> --cd <klasör>`), `cygwin`, `msys2` (`MSYSTEM=UCRT64|MINGW64`), `nu`. Windows dışında: `powershell` kimliği = kullanıcının `$SHELL`'i, ek olarak `/etc/shells` girişleri (`sh:<yol>`).
- **Güvenlik:** `pty:profiles` arayüze yalnız `{id, label}` verir (dosya yolu/argüman yok). `pty:start` `shell` alanı bu listede olmak zorundadır; liste dışı kimlik `invalid-shell` (Git Bash için `no-gitbash`) döner. Çalıştırılacak dosya yalnız bilinen konumlardan/PATH'ten çözülür, argüman olarak yalnız doğrulanmış dağıtım adı ve açık çalışma klasörü geçer (kabuk dizesi birleştirilmez).
- Arayüz: `+` yanındaki ok listesi profilleri sıralar (açılırken `pty.profiles(true)` ile yeniden taranır); PowerShell/CMD dışındakiler yalnız PTY ile açılır. Klasik (boru) girişleri ayraçtan sonra "· klasik" ile kalır. `cdCommand` profile göre: PowerShell `Set-Location`, CMD `cd /d`, Git Bash/Cygwin/MSYS2 `cygpath -u`, WSL `wslpath -u`, Nushell `cd "…"`, `sh:` düz `cd`.
- Ayarlar → Varsayılan kabuk yalnız PowerShell/CMD/Git Bash sunar; seçilen profil kurulu değilse PowerShell'e düşer.
- KVKK: yerel tarama, veri dışarı gönderilmez.
