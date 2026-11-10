---
action: terminal
purpose: Entegre terminal (PowerShell/CMD) davranışı, istem ve renklendirme
reads: [CLAUDE, PROJECT, security-kvkk, i18n]
writes: [CHANGELOG, DECISIONS, testing]
triggers: ["terminal", "powershell", "cmd", "istem", "ansi"]
---
# Aksiyon: Terminal

## Mimari
- Ana süreç (`electron-main.cjs`): `term:start/input/stop`; kabuk başına kalıcı `spawn`. PowerShell 7 varsa `pwsh`, yoksa `powershell.exe`; CMD `/Q`.
- Her komuttan sonra çalışma klasörü işareti (`@@NOVA_CWD@@<yol>`) yazdırılır; `makeCwdFilter` bu satırları ayıklayıp `term:cwd` olayı gönderir. CMD için `prompt $E[0m` ile kendi istemi görünmez yapılır; ilk işarete kadar açılış başlığı atılır.
- stdout/stderr ayrı etiketlenir; stderr kırmızı çizilir.
- Renderer: `src/components/Terminal.tsx`, `src/services/terminalText.ts` (ANSI ayrıştırma, komut renklendirme). Çıktı React span'idir; HTML basılmaz.

## Kurallar
- PTY değil, boru: tam ekran programlar (vim, htop) ve Ctrl+C kesme desteklenmez; bu bilinen sınırdır.
- İstem: `PS <yol> (dal)>`; komutlar yeşil, bayraklar sarı, metinler turuncu, değişkenler turkuaz, işleçler mor.
- Komut satırı `\0` içeremez; uzunluk sınırı 10000.
- Yeni metin [[i18n]] ile 8 dilde.

## Test
`scripts/tests/` içinde işaret süzgeci ve gerçek kabuk testleri için [[testing]]. Windows PowerShell 5.1'de `$PSStyle` yoktur; renk yalnız hata/komut renklendirmesidir.
