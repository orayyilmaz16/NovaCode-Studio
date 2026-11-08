# Güvenlik Politikası / Security Policy

## Türkçe

### Desteklenen sürümler
Yalnız en son yayınlanan sürüm (`main` dalı ve en güncel `vX.Y.Z` release'i) güvenlik düzeltmesi alır.

| Sürüm | Destek |
|---|---|
| En son release | Evet |
| Eski release'ler | Hayır, güncelleyin |

### Açık bildirme
Bir güvenlik açığı bulduysanız **herkese açık issue açmayın**. Bunun yerine:

1. Repodaki **Security → Report a vulnerability** (Özel zafiyet bildirimi) sayfasını kullanın, ya da doğrudan şu bağlantıyı açın:
   `https://github.com/orayyilmaz16/NovaCode-Studio/security/advisories/new`
2. Bildirimde şunları ekleyin: etkilenen sürüm, adımlar, beklenen ve gerçek davranış, mümkünse kanıt kodu.
3. Hassas bilgileri (şifre, token, kişisel veri) bildirime eklemeyin; yerine yer tutucu kullanın.

### Yanıt süreci
- **48 saat içinde:** bildiriminizi aldığımızı onaylarız.
- **7 gün içinde:** ön değerlendirme ve ciddiyet bilgisi.
- Düzeltme hazır olunca gizli bir güvenlik danışmanlığı (private advisory) üzerinden çalışırız; onay sonrası sürüm ve danışmanlık yayımlanır. Bildiren kişi isterse adı anılır.

### Kapsam
Kapsamda: NovaCode Studio masaüstü uygulaması (Electron), IPC ve dosya sistemi köprüsü, `server/sync-server.mjs` senkron sunucusu, CI/CD iş akışları.
Kapsam dışında: üçüncü taraf bağımlılıklarındaki bilinen ve henüz düzeltilmemiş açıklar (önce ilgili upstream'e bildirin; bizi de bilgilendirin), kullanıcının kendi yanlış yapılandırması.

### Otomatik korumalar
- Dependabot uyarıları ve güvenlik güncellemeleri açık (`.github/dependabot.yml`).
- Secret scanning ve push protection açık; gizli anahtar içeren commit reddedilir.
- CI'da `npm audit --audit-level=high` ile yüksek şiddetli açıklar build'i durdurur; CodeQL ve gitleaks her PR'da çalışır.
- `main` dalına doğrudan yazılamaz; değişiklikler PR ile girer (ruleset kurulduktan sonra).

---

## English

### Supported versions
Only the latest released version (the `main` branch and the most recent `vX.Y.Z` release) receives security fixes.

| Version | Supported |
|---|---|
| Latest release | Yes |
| Older releases | No, please update |

### Reporting a vulnerability
If you find a security issue, **please do not open a public issue**. Instead:

1. Use **Security → Report a vulnerability** in this repository, or open directly:
   `https://github.com/orayyilmaz16/NovaCode-Studio/security/advisories/new`
2. Include: affected version, steps to reproduce, expected and actual behavior, and proof-of-concept code if possible.
3. Do not include sensitive data (passwords, tokens, personal data); use placeholders instead.

### Response process
- **Within 48 hours:** we acknowledge receipt.
- **Within 7 days:** initial triage and severity assessment.
- Fixes are developed in a private security advisory. After the fix is ready, we publish a release and the advisory. Reporters are credited if they wish.

### Scope
In scope: the NovaCode Studio desktop app (Electron), the IPC and file system bridge, the `server/sync-server.mjs` sync server, and CI/CD workflows.
Out of scope: known, unfixed issues in third-party dependencies (please report upstream and let us know), and misconfiguration on the user's side.

### Automated protections
- Dependabot alerts and security updates are enabled (`.github/dependabot.yml`).
- Secret scanning and push protection are enabled; commits containing secrets are blocked.
- CI fails the build on high-severity advisories (`npm audit --audit-level=high`); CodeQL and gitleaks run on every PR.
- Direct pushes to `main` are not allowed; changes enter through pull requests (once the ruleset is active).
