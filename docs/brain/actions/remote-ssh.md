---
action: remote-ssh
purpose: Uzak çalışma alanı (VS Code Remote-SSH benzeri): SSH ile sunucuya bağlan, uzak klasörü Gezgin'de aç/düzenle/kaydet (SFTP), uzak terminal
reads: [CLAUDE, PROJECT, security-kvkk, i18n, terminal, explorer]
writes: [CHANGELOG, DECISIONS, security-kvkk, testing, AGENT]
triggers: ["ssh", "uzak", "remote", "sftp", "sunucuya bağlan", "uzak klasör"]
---
# Aksiyon: Uzak çalışma alanı (SSH)

## Ne yapar (v1)
- **Bağlan:** Dosya menüsü / komut paleti / karşılama / durum çubuğundaki sol alt `Server` düğmesi → **RemoteDialog**: kayıtlı sunucular, yeni sunucu, bağlan, uzak klasör seç.
- **Düzenle:** Uzak klasör Gezgin'de normal klasör gibi görünür; aç, düzenle, kaydet, yeni dosya/klasör, yeniden adlandır, taşı, sil çalışır (SFTP).
- **Terminal:** Uzak çalışma alanında varsayılan kabuk uzak sunucudaki kabuktur (`SSH: <ad>`, gerçek PTY/xterm); `+` ▾ menüsünde de görünür.
- **Kapsam dışı (v1, bilerek):** uzak klasörde Git paneli, proje araması, yapay zekâ ajan araçları, LSP, hata ayıklayıcı, dosya izleyici (canlı yenileme), çöp kutusu. Yerel çalışma klasörü boş olduğu için bunlar **kapalı kalır** (güvenli varsayılan); sunucudaki Git terminalden kullanılır. Sonraki adımlar: uzak arama (`grep` over exec), uzak git (`git` over exec), yeniden bağlanma.

## Mimari
| Parça | Dosya | Görev |
|---|---|---|
| Çekirdek (saf, test edilir) | `electron-ssh-core.cjs` | Sanal yol `ssh://<anaId>/<posix yol>` ayrıştırma, sözcüksel kapsama, profil doğrulama, parmak izi, `known_hosts` ve profil deposu |
| Ana süreç | `electron-ssh.cjs` | `ssh2` bağlantısı, parmak izi onayı, SFTP işlemleri, uzak kabuk, IPC (`ssh:*`) |
| Yönlendirme | `electron-main.cjs` | `fs:readDir/readFile/writeFile/createFile/createFolder/deleteItem/renameItem` uzak yolda `ssh.fs.*`'e gider; yerel klasör açılınca uzak oturum kapanır; uzak açılınca `workspaceRoot=''` ve izleyici durur |
| PTY köprüsü | `electron-pty.cjs` | `shell: 'ssh:<anaId>'` → `ssh.openShell`; çıktı aynı `pty:data/pty:exit` olaylarıyla, `pty:profiles` bağlı sunucuları ekler |
| Preload / tipler | `electron-preload.cjs`, `src/types.ts` | `electronAPI.ssh.*` (`status, hostSave, hostRemove, pickKey, connect, hostKeyAnswer, forgetHostKey, disconnect, browse, open, close, onEvent`) |
| Arayüz | `src/components/RemoteDialog.tsx`, `src/App.tsx` (durum `remoteHost`, olay kancası), `Terminal.tsx` (`cdCommand` `ssh:`), `LandingPage.tsx` | Modal, durum çubuğu düğmesi, bağlantı kopunca klasörsüz duruma dönüş |
| Metin | `src/i18n/uiTextRemote.ts` (`rm*`, 8 dil) | |
| Test | `scripts/tests/ssh.test.cjs` (çekirdek), `ssh-sftp.test.cjs` (sahte `ssh2` sunucusu + bellek içi SFTP ile uçtan uca; `ssh2` yoksa atlanır) | |

## Güvenlik kuralları (gevşetilmez)
1. **Parola ve anahtar parolası hiçbir yere yazılmaz.** Her bağlantıda sorulur, yalnız `connect()` süresince bellekte durur, renderer durumundan bağlanınca silinir. Profil deposu (`userData/ssh-hosts.json`, 0600) yalnız ad/adres/port/kullanıcı/yöntem/anahtar **yolu**/başlangıç klasörü tutar; test diskte parola olmadığını doğrular.
2. **Sunucu parmak izi (MITM):** ilk bağlantıda SHA256 parmak izi gösterilir, kullanıcı onaylarsa `userData/ssh-known-hosts.json`'a yazılır. Kayıtlı parmak izi **değişirse bağlantı kesin reddedilir** (`host-key-changed`, onay sorulmaz); kullanıcı "kayıtlı parmak izini unut" ile bilerek sıfırlar. Onay 90 sn içinde gelmezse reddedilir.
3. **Özel anahtar yolu yalnız ana sürecin açtığı diyalogtan** (`ssh:pickKey`) gelir; seçilmemiş yol profile yazılamaz (`key-not-picked`). Anahtar dosyası ≤64 KB, içeriği renderer'a geçmez. SSH ajanı (Windows `openssh-ssh-agent` borusu / `SSH_AUTH_SOCK`) varsayılan ve önerilen yöntemdir; ajan yönlendirme kapalı.
4. **Yol yetkisi:** renderer yalnız `ssh://<ana>/<yol>` görür. Her işlem etkin uzak klasörün içinde olmalı: sözcüksel (`..` bileşeni yok, ön ek benzeri kardeş klasör dışarıda) **ve** `realpath` ile (symlink kaçışı). Silme/yeniden adlandırmada son bileşen symlink ise bağın kendisi işlenir (`followLast=false`). Kök silinemez; karışık yerel/uzak taşıma reddedilir. Başka ana bilgisayara yönlendirme reddedilir.
5. **Girdi doğrulama:** ana bilgisayar `-` ile başlayamaz (seçenek enjeksiyonu), kullanıcı/port/yol kalıpları sıkı; IPC yalnız ana pencereden (`fromMain`); en çok 4 bağlantı, 8 uzak kabuk, 50 profil, 64 MB yazma, 5 MB okuma (üst 64 MB), silmede 20000 öğe sınırı.
6. **Hata metni sızmaz:** ana süreç yalnız hata **kodu** döndürür (`auth-failed`, `refused`…); arayüz bunu 8 dilli metne çevirir.
7. Kabuk komutuna gömülen yol `shellQuote` ile alıntılanır (`cd -- '...'`). Uzak kabukta komutları yalnız kullanıcı yazar; uygulama komut üretmez.
8. Çok adımlı (2FA) klavye-etkileşimli doğrulama desteklenmez (yalnız tek istemli parola).

## KVKK
| Veri | Amaç / hukuki sebep | Saklama | Yurt dışı |
|---|---|---|---|
| Sunucu adı, adres, port, kullanıcı adı, anahtar dosya yolu | Kullanıcının istediği bağlantı (sözleşmenin ifası/açık talep) | Yerelde `userData/ssh-hosts.json`; kullanıcı silebilir | Yok |
| Sunucu parmak izi | Kimlik doğrulama (MITM koruması) | Yerelde `userData/ssh-known-hosts.json`; "unut" ile silinir | Yok |
| Parola / anahtar parolası | Yalnız o bağlantının kimliği | **Saklanmaz**, yalnız bellekte | Yalnız kullanıcının seçtiği sunucu |
| Uzak dosya içeriği ve terminal akışı | Kullanıcının düzenlemesi | Yalnız bellekte/ekranda; yerel diske yazılmaz (yerel geçmiş uzak yolda çalışmaz) | Sunucunun bulunduğu yer = kullanıcının seçimi |

Dosya içeriği NovaCode'un hiçbir 3. parti servisine gitmez; yalnız seçilen sunucu ile bilgisayar arasında şifreli SSH kanalından akar. Yapay zekâ, analitik, güncelleme akışları uzak içeriği görmez (uzak klasörde AI araçları kapalı).

## Doğrulama
`node scripts/tests/ssh.test.cjs` ve `node scripts/tests/ssh-sftp.test.cjs` (`npm test` içinde). Gerçek sunucuyla elle deneme (parola/anahtar/ajan, büyük klasör gecikmesi) henüz yapılmadı; Windows `openssh-ssh-agent` borusu gerçek ajanla sınanmadı.

## Bilinen sınırlar / açık işler
- Ağaç uzak gecikme nedeniyle derinlik 3 ve 1500 öğeyle sınırlı, `node_modules`/`.git` vb. atlanır; derin klasörler eksik görünebilir (tembel yükleme yok). Gezgin'i yenilemek tüm ağacı yeniden okur.
- Dosya izleyici yok: sunucuda dışarıdan değişen dosyalar kendiliğinden yenilenmez.
- Bağlantı kopunca otomatik yeniden bağlanma yok; klasörsüz duruma dönülür, kaydedilmemiş sekmeler kalır.
- Uzak oturum `session` kaydına yazılmaz (bağlantısız açılışta `ssh://` yolları geri yüklenemez).
- Atomik kayıt `posix-rename` eklentisini kullanır; sunucu desteklemezse doğrudan yazar.
