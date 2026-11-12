// Kullanıcı arayüzü metinleri: her metin 8 dilde tanımlanır (tr, en, de, ru, ar, es, fr, az).
// Dil, tarayıcı/sistem diline göre seçilir; desteklenmeyen dillerde Türkçe kullanılır.

export const UI_LANGS = ['tr', 'en', 'de', 'ru', 'ar', 'es', 'fr', 'az'] as const;
export type UiLang = (typeof UI_LANGS)[number];

type Dict = Record<UiLang, string>;

export const UI_TEXT = {
  openFolder: {
    tr: 'Klasör Aç', en: 'Open folder', de: 'Ordner öffnen', ru: 'Открыть папку',
    ar: 'فتح مجلد', es: 'Abrir carpeta', fr: 'Ouvrir un dossier', az: 'Qovluq aç',
  },
  openFiles: {
    tr: 'Dosya Aç', en: 'Open files', de: 'Dateien öffnen', ru: 'Открыть файлы',
    ar: 'فتح ملفات', es: 'Abrir archivos', fr: 'Ouvrir des fichiers', az: 'Fayl aç',
  },
  newFile: {
    tr: 'Yeni Dosya', en: 'New file', de: 'Neue Datei', ru: 'Новый файл',
    ar: 'ملف جديد', es: 'Nuevo archivo', fr: 'Nouveau fichier', az: 'Yeni fayl',
  },
  newTab: {
    tr: 'Yeni sekme', en: 'New tab', de: 'Neuer Tab', ru: 'Новая вкладка',
    ar: 'علامة تبويب جديدة', es: 'Nueva pestaña', fr: 'Nouvel onglet', az: 'Yeni vərəq',
  },
  emptyHint: {
    tr: 'Başlamak için bir klasör açın, dosya seçin veya yeni dosya oluşturun.',
    en: 'To get started, open a folder, pick files, or create a new file.',
    de: 'Öffnen Sie zum Starten einen Ordner, wählen Sie Dateien aus oder erstellen Sie eine neue Datei.',
    ru: 'Чтобы начать, откройте папку, выберите файлы или создайте новый файл.',
    ar: 'للبدء، افتح مجلدًا أو اختر ملفات أو أنشئ ملفًا جديدًا.',
    es: 'Para empezar, abre una carpeta, elige archivos o crea un archivo nuevo.',
    fr: 'Pour commencer, ouvrez un dossier, choisissez des fichiers ou créez un nouveau fichier.',
    az: 'Başlamaq üçün qovluq açın, fayl seçin və ya yeni fayl yaradın.',
  },
  quit: {
    tr: 'Çık', en: 'Quit', de: 'Beenden', ru: 'Выход',
    ar: 'خروج', es: 'Salir', fr: 'Quitter', az: 'Çıxış',
  },
  startDesc: {
    tr: 'Boş editörü açın ve bir klasör ya da dosyayla çalışmaya başlayın.',
    en: 'Open the empty editor and start with a folder or file.',
    de: 'Öffnen Sie den leeren Editor und beginnen Sie mit einem Ordner oder einer Datei.',
    ru: 'Откройте пустой редактор и начните с папки или файла.',
    ar: 'افتح المحرر الفارغ وابدأ بمجلد أو ملف.',
    es: 'Abre el editor vacío y empieza con una carpeta o un archivo.',
    fr: "Ouvrez l'éditeur vide et commencez avec un dossier ou un fichier.",
    az: 'Boş redaktoru açın və qovluq və ya faylla başlayın.',
  },
  termLog: {
    tr: "Günlük", en: "Log", de: "Protokoll", ru: "Журнал", ar: "السجل", es: "Registro", fr: "Journal", az: "Jurnal",
  },
  termClosed: {
    tr: "Shell kapandı (kod {code}). Sekmeye tekrar tıklayarak yeniden başlatın.", en: "Shell closed (code {code}). Click the tab again to restart.", de: "Shell beendet (Code {code}). Klicken Sie erneut auf den Tab, um neu zu starten.", ru: "Оболочка закрыта (код {code}). Нажмите на вкладку, чтобы перезапустить.", ar: "أُغلق الـ shell (الرمز {code}). انقر على علامة التبويب مجددًا لإعادة التشغيل.", es: "Shell cerrado (código {code}). Haz clic de nuevo en la pestaña para reiniciar.", fr: "Shell fermé (code {code}). Cliquez à nouveau sur l’onglet pour redémarrer.", az: "Shell bağlandı (kod {code}). Yenidən başlatmaq üçün vərəqə yenidən klikləyin.",
  },
  termNeedFolder: {
    tr: "Shell için önce bir klasör açın.", en: "Open a folder first to use the shell.", de: "Öffnen Sie zuerst einen Ordner, um die Shell zu nutzen.", ru: "Сначала откройте папку, чтобы использовать оболочку.", ar: "افتح مجلدًا أولًا لاستخدام الـ shell.", es: "Abre primero una carpeta para usar el shell.", fr: "Ouvrez d’abord un dossier pour utiliser le shell.", az: "Shell üçün əvvəlcə qovluq açın.",
  },
  termStarting: {
    tr: "Shell başlatılıyor...", en: "Starting shell...", de: "Shell wird gestartet...", ru: "Запуск оболочки...", ar: "جارٍ تشغيل الـ shell...", es: "Iniciando shell...", fr: "Démarrage du shell...", az: "Shell başladılır...",
  },
  termStartFailed: {
    tr: "Shell başlatılamadı.", en: "Could not start the shell.", de: "Shell konnte nicht gestartet werden.", ru: "Не удалось запустить оболочку.", ar: "تعذّر تشغيل الـ shell.", es: "No se pudo iniciar el shell.", fr: "Impossible de démarrer le shell.", az: "Shell başladıla bilmədi.",
  },
  termSendFailed: {
    tr: "Komut gönderilemedi.", en: "Could not send the command.", de: "Befehl konnte nicht gesendet werden.", ru: "Не удалось отправить команду.", ar: "تعذّر إرسال الأمر.", es: "No se pudo enviar el comando.", fr: "Impossible d’envoyer la commande.", az: "Komanda göndərilə bilmədi.",
  },
  termStopped: {
    tr: "Shell durduruldu.", en: "Shell stopped.", de: "Shell angehalten.", ru: "Оболочка остановлена.", ar: "أُوقف الـ shell.", es: "Shell detenido.", fr: "Shell arrêté.", az: "Shell dayandırıldı.",
  },
  termStopTitle: {
    tr: "Shell'i durdur", en: "Stop shell", de: "Shell anhalten", ru: "Остановить оболочку", ar: "إيقاف الـ shell", es: "Detener shell", fr: "Arrêter le shell", az: "Shell-i dayandır",
  },
  termClear: {
    tr: "Temizle", en: "Clear", de: "Leeren", ru: "Очистить", ar: "مسح", es: "Limpiar", fr: "Effacer", az: "Təmizlə",
  },
  termLogEmpty: {
    tr: "Henüz kayıt yok.", en: "No entries yet.", de: "Noch keine Einträge.", ru: "Записей пока нет.", ar: "لا توجد سجلات بعد.", es: "Aún no hay registros.", fr: "Aucune entrée pour le moment.", az: "Hələ qeyd yoxdur.",
  },
  termHint: {
    tr: "Komut yazın ve Enter’a basın. ↑/↓ geçmiş, Ctrl+L temizler.", en: "Type a command and press Enter. ↑/↓ history, Ctrl+L clears.", de: "Befehl eingeben und Enter drücken. ↑/↓ Verlauf, Strg+L leert.", ru: "Введите команду и нажмите Enter. ↑/↓ — история, Ctrl+L — очистка.", ar: "اكتب أمرًا واضغط Enter. ↑/↓ للسجل، Ctrl+L للمسح.", es: "Escribe un comando y pulsa Enter. ↑/↓ historial, Ctrl+L limpia.", fr: "Saisissez une commande et appuyez sur Entrée. ↑/↓ historique, Ctrl+L efface.", az: "Komanda yazın və Enter basın. ↑/↓ tarixçə, Ctrl+L təmizləyir.",
  },
  termPlaceholder: {
    tr: "Komut yazın...", en: "Type a command...", de: "Befehl eingeben...", ru: "Введите команду...", ar: "اكتب أمرًا...", es: "Escribe un comando...", fr: "Saisissez une commande...", az: "Komanda yazın...",
  },
  termNotReady: {
    tr: "Shell hazır değil", en: "Shell not ready", de: "Shell nicht bereit", ru: "Оболочка не готова", ar: "الـ shell غير جاهز", es: "Shell no disponible", fr: "Shell non prêt", az: "Shell hazır deyil",
  },
  ghTitle: {
    tr: "GitHub Hesabı", en: "GitHub account", de: "GitHub-Konto", ru: "Аккаунт GitHub", ar: "حساب GitHub", es: "Cuenta de GitHub", fr: "Compte GitHub", az: "GitHub hesabı",
  },
  ghConnect: {
    tr: "GitHub ile giriş yap", en: "Sign in with GitHub", de: "Mit GitHub anmelden", ru: "Войти через GitHub", ar: "تسجيل الدخول عبر GitHub", es: "Iniciar sesión con GitHub", fr: "Se connecter avec GitHub", az: "GitHub ilə daxil ol",
  },
  ghCreateAccount: {
    tr: "Hesap oluştur", en: "Create an account", de: "Konto erstellen", ru: "Создать аккаунт", ar: "إنشاء حساب", es: "Crear una cuenta", fr: "Créer un compte", az: "Hesab yarat",
  },
  ghDisconnect: {
    tr: "Çıkış yap", en: "Sign out", de: "Abmelden", ru: "Выйти", ar: "تسجيل الخروج", es: "Cerrar sesión", fr: "Se déconnecter", az: "Çıxış",
  },
  ghCodeHint: {
    tr: "Tarayıcıda açılan GitHub sayfasına bu kodu girin:", en: "Enter this code on the GitHub page that opened in your browser:", de: "Geben Sie diesen Code auf der im Browser geöffneten GitHub-Seite ein:", ru: "Введите этот код на странице GitHub, открывшейся в браузере:", ar: "أدخل هذا الرمز في صفحة GitHub التي فُتحت في المتصفح:", es: "Introduce este código en la página de GitHub que se abrió en tu navegador:", fr: "Saisissez ce code sur la page GitHub ouverte dans votre navigateur :", az: "Brauzerdə açılan GitHub səhifəsində bu kodu daxil edin:",
  },
  ghWaiting: {
    tr: "Onayınız bekleniyor...", en: "Waiting for your approval...", de: "Warten auf Ihre Bestätigung...", ru: "Ожидание подтверждения...", ar: "في انتظار موافقتك...", es: "Esperando tu aprobación...", fr: "En attente de votre validation...", az: "Təsdiqiniz gözlənilir...",
  },
  ghCancel: {
    tr: "Vazgeç", en: "Cancel", de: "Abbrechen", ru: "Отмена", ar: "إلغاء", es: "Cancelar", fr: "Annuler", az: "Ləğv et",
  },
  ghCopyCode: {
    tr: "Kodu kopyala", en: "Copy code", de: "Code kopieren", ru: "Копировать код", ar: "نسخ الرمز", es: "Copiar código", fr: "Copier le code", az: "Kodu kopyala",
  },
  ghCopied: {
    tr: "Kopyalandı", en: "Copied", de: "Kopiert", ru: "Скопировано", ar: "تم النسخ", es: "Copiado", fr: "Copié", az: "Kopyalandı",
  },
  ghClientIdHelp: {
    tr: "GitHub’da bir OAuth App oluşturun, \"Device Flow\"u etkinleştirin ve Client ID’yi buraya yapıştırın. Client ID gizli değildir.", en: "Create an OAuth App on GitHub, enable \"Device Flow\" and paste its Client ID here. A Client ID is not a secret.", de: "Erstellen Sie auf GitHub eine OAuth-App, aktivieren Sie „Device Flow“ und fügen Sie die Client-ID hier ein. Die Client-ID ist kein Geheimnis.", ru: "Создайте OAuth App на GitHub, включите «Device Flow» и вставьте сюда Client ID. Client ID не является секретом.", ar: "أنشئ OAuth App على GitHub وفعّل \"Device Flow\" والصق Client ID هنا. معرّف العميل ليس سرًّا.", es: "Crea una OAuth App en GitHub, activa \"Device Flow\" y pega aquí el Client ID. El Client ID no es secreto.", fr: "Créez une OAuth App sur GitHub, activez « Device Flow » et collez ici le Client ID. Le Client ID n’est pas secret.", az: "GitHub-da OAuth App yaradın, \"Device Flow\"u aktiv edin və Client ID-ni bura yapışdırın. Client ID gizli deyil.",
  },
  ghClientIdPlaceholder: {
    tr: "Client ID", en: "Client ID", de: "Client-ID", ru: "Client ID", ar: "Client ID", es: "Client ID", fr: "Client ID", az: "Client ID",
  },
  ghSave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Yadda saxla",
  },
  ghInvalidClientId: {
    tr: "Geçersiz Client ID.", en: "Invalid Client ID.", de: "Ungültige Client-ID.", ru: "Неверный Client ID.", ar: "Client ID غير صالح.", es: "Client ID no válido.", fr: "Client ID invalide.", az: "Yanlış Client ID.",
  },
  ghDenied: {
    tr: "GitHub erişimi reddedildi.", en: "GitHub access was denied.", de: "GitHub-Zugriff wurde abgelehnt.", ru: "Доступ GitHub отклонён.", ar: "تم رفض الوصول إلى GitHub.", es: "Se denegó el acceso a GitHub.", fr: "L’accès GitHub a été refusé.", az: "GitHub girişi rədd edildi.",
  },
  ghExpired: {
    tr: "Kodun süresi doldu. Tekrar deneyin.", en: "The code expired. Try again.", de: "Der Code ist abgelaufen. Versuchen Sie es erneut.", ru: "Срок действия кода истёк. Повторите попытку.", ar: "انتهت صلاحية الرمز. حاول مجددًا.", es: "El código caducó. Inténtalo de nuevo.", fr: "Le code a expiré. Réessayez.", az: "Kodun müddəti bitdi. Yenidən cəhd edin.",
  },
  ghLoginFailed: {
    tr: "GitHub girişi başlatılamadı.", en: "Could not start GitHub sign-in.", de: "GitHub-Anmeldung konnte nicht gestartet werden.", ru: "Не удалось начать вход через GitHub.", ar: "تعذّر بدء تسجيل الدخول إلى GitHub.", es: "No se pudo iniciar el acceso con GitHub.", fr: "Impossible de démarrer la connexion GitHub.", az: "GitHub girişi başladıla bilmədi.",
  },
  ghNoSecureStore: {
    tr: "Bu cihazda güvenli depolama yok; oturum yalnız bu çalıştırma boyunca açık kalır.", en: "Secure storage is unavailable on this device; the session lasts only until you close the app.", de: "Auf diesem Gerät ist kein sicherer Speicher verfügbar; die Sitzung gilt nur bis zum Schließen der App.", ru: "На этом устройстве нет защищённого хранилища; сеанс действует только до закрытия приложения.", ar: "التخزين الآمن غير متاح على هذا الجهاز؛ تبقى الجلسة حتى إغلاق التطبيق فقط.", es: "El almacenamiento seguro no está disponible; la sesión dura solo hasta cerrar la app.", fr: "Le stockage sécurisé est indisponible ; la session ne dure que jusqu’à la fermeture de l’app.", az: "Bu cihazda təhlükəsiz saxlama yoxdur; sessiya yalnız tətbiq bağlanana qədər davam edir.",
  },
  ghPrivacy: {
    tr: "Erişim anahtarınız bu cihazda şifreli saklanır ve yalnız GitHub’a gönderilir.", en: "Your access token is stored encrypted on this device and sent only to GitHub.", de: "Ihr Zugriffstoken wird verschlüsselt auf diesem Gerät gespeichert und nur an GitHub gesendet.", ru: "Ваш токен хранится на устройстве в зашифрованном виде и отправляется только в GitHub.", ar: "يُخزَّن رمز الوصول مشفّرًا على هذا الجهاز ويُرسَل إلى GitHub فقط.", es: "Tu token se guarda cifrado en este dispositivo y solo se envía a GitHub.", fr: "Votre jeton est stocké chiffré sur cet appareil et envoyé uniquement à GitHub.", az: "Giriş tokeniniz bu cihazda şifrələnmiş saxlanılır və yalnız GitHub-a göndərilir.",
  },
  ghLive: {
    tr: "GitHub’da canlı", en: "Live on GitHub", de: "Live auf GitHub", ru: "Онлайн на GitHub", ar: "مباشر على GitHub", es: "En vivo en GitHub", fr: "En direct sur GitHub", az: "GitHub-da canlı",
  },
  ghOpenPulls: {
    tr: "Açık PR", en: "Open PRs", de: "Offene PRs", ru: "Открытые PR", ar: "طلبات الدمج المفتوحة", es: "PR abiertos", fr: "PR ouvertes", az: "Açıq PR-lər",
  },
  ghActions: {
    tr: "Son Actions koşuları", en: "Recent Actions runs", de: "Letzte Actions-Läufe", ru: "Последние запуски Actions", ar: "آخر تشغيلات Actions", es: "Ejecuciones recientes de Actions", fr: "Exécutions Actions récentes", az: "Son Actions işləri",
  },
  ghNoRuns: {
    tr: "Henüz koşu yok.", en: "No runs yet.", de: "Noch keine Läufe.", ru: "Запусков пока нет.", ar: "لا توجد تشغيلات بعد.", es: "Aún no hay ejecuciones.", fr: "Aucune exécution pour l’instant.", az: "Hələ iş yoxdur.",
  },
  ghSignInForLive: {
    tr: "Canlı PR ve Actions durumu ve kimlik doğrulamalı push/pull için GitHub hesabınızı bağlayın.", en: "Connect your GitHub account for live PR and Actions status and authenticated push/pull.", de: "Verbinden Sie Ihr GitHub-Konto für Live-PR-/Actions-Status und authentifiziertes Push/Pull.", ru: "Подключите аккаунт GitHub для статуса PR и Actions в реальном времени и push/pull с аутентификацией.", ar: "اربط حساب GitHub لعرض حالة PR وActions مباشرةً ولدفع/سحب موثّق.", es: "Conecta tu cuenta de GitHub para ver PR y Actions en vivo y hacer push/pull autenticado.", fr: "Connectez votre compte GitHub pour le suivi en direct des PR et Actions et un push/pull authentifié.", az: "Canlı PR və Actions statusu və autentifikasiyalı push/pull üçün GitHub hesabınızı bağlayın.",
  },
  gitNoRemote: {
    tr: "Uzak depo (origin) tanımlı değil. Push için önce GitHub’da bir depo bağlayın.", en: "No remote (origin) is set. Add a GitHub repository before pushing.", de: "Kein Remote (origin) festgelegt. Verbinden Sie vor dem Push ein GitHub-Repository.", ru: "Удалённый репозиторий (origin) не задан. Подключите репозиторий GitHub перед push.", ar: "لا يوجد مستودع بعيد (origin). اربط مستودع GitHub قبل الدفع.", es: "No hay remoto (origin). Conecta un repositorio de GitHub antes de hacer push.", fr: "Aucun dépôt distant (origin). Ajoutez un dépôt GitHub avant le push.", az: "Uzaq depo (origin) təyin edilməyib. Push etməzdən əvvəl GitHub deposu bağlayın.",
  },
  gitAheadBehind: {
    tr: "gönderilecek / çekilecek commit", en: "commits to push / pull", de: "Commits zu pushen / pullen", ru: "коммитов для push / pull", ar: "التزامات للدفع / للسحب", es: "commits por enviar / recibir", fr: "commits à pousser / tirer", az: "göndəriləcək / çəkiləcək commit",
  },
  gitLive: {
    tr: "Canlı", en: "Live", de: "Live", ru: "Онлайн", ar: "مباشر", es: "En vivo", fr: "En direct", az: "Canlı",
  },
  ghScopes: {
    tr: "Bağlanınca NovaCode şunlara erişir: depolarınız ve profil bilgileriniz (ad, kullanıcı adı, avatar). İstediğiniz an GitHub ayarlarından erişimi kaldırabilirsiniz.", en: "Once connected, NovaCode can access your repositories and profile info (name, username, avatar). You can revoke access anytime in GitHub settings.", de: "Nach der Verbindung kann NovaCode auf Ihre Repositories und Profildaten (Name, Benutzername, Avatar) zugreifen. Den Zugriff können Sie jederzeit in den GitHub-Einstellungen widerrufen.", ru: "После подключения NovaCode получит доступ к вашим репозиториям и данным профиля (имя, логин, аватар). Доступ можно отозвать в настройках GitHub в любой момент.", ar: "بعد الربط، سيتمكن NovaCode من الوصول إلى مستودعاتك وبيانات ملفك (الاسم، اسم المستخدم، الصورة). يمكنك إلغاء الوصول في أي وقت من إعدادات GitHub.", es: "Al conectar, NovaCode podrá acceder a tus repositorios y datos de perfil (nombre, usuario, avatar). Puedes revocar el acceso en cualquier momento en los ajustes de GitHub.", fr: "Une fois connecté, NovaCode accède à vos dépôts et aux infos de profil (nom, identifiant, avatar). Vous pouvez révoquer l’accès à tout moment dans les paramètres GitHub.", az: "Bağlandıqdan sonra NovaCode depolarınıza və profil məlumatlarınıza (ad, istifadəçi adı, avatar) çata biləcək. Girişi istənilən vaxt GitHub parametrlərindən ləğv edə bilərsiniz.",
  },
  gitLocked: {
    tr: "Git değişikliklerini, commit ve push işlemlerini görmek için önce GitHub hesabınızı bağlayın.", en: "Connect your GitHub account to see Git changes and to commit or push.", de: "Verbinden Sie Ihr GitHub-Konto, um Git-Änderungen zu sehen sowie zu committen und zu pushen.", ru: "Подключите аккаунт GitHub, чтобы видеть изменения Git, делать коммиты и push.", ar: "اربط حساب GitHub لعرض تغييرات Git وإجراء commit وpush.", es: "Conecta tu cuenta de GitHub para ver los cambios de Git y hacer commit o push.", fr: "Connectez votre compte GitHub pour voir les changements Git, faire des commits et des push.", az: "Git dəyişikliklərini görmək, commit və push etmək üçün əvvəlcə GitHub hesabınızı bağlayın.",
  },
  ghNotConfigured: {
    tr: "GitHub bağlantısı bu sürümde henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.", en: "GitHub sign-in is not configured in this version yet. Please try again later.", de: "Die GitHub-Anmeldung ist in dieser Version noch nicht konfiguriert. Bitte versuchen Sie es später erneut.", ru: "Вход через GitHub в этой версии ещё не настроен. Повторите попытку позже.", ar: "لم يتم إعداد تسجيل الدخول إلى GitHub في هذا الإصدار بعد. يرجى المحاولة لاحقًا.", es: "El acceso con GitHub aún no está configurado en esta versión. Inténtalo más tarde.", fr: "La connexion GitHub n’est pas encore configurée dans cette version. Réessayez plus tard.", az: "GitHub girişi bu versiyada hələ konfiqurasiya edilməyib. Zəhmət olmasa sonra yenidən cəhd edin.",
  },
  gitBranch: {
    tr: "Dal", en: "Branch", de: "Branch", ru: "Ветка", ar: "الفرع", es: "Rama", fr: "Branche", az: "Budaq",
  },
  gitNewBranch: {
    tr: "Yeni dal", en: "New branch", de: "Neuer Branch", ru: "Новая ветка", ar: "فرع جديد", es: "Nueva rama", fr: "Nouvelle branche", az: "Yeni budaq",
  },
  gitBranchPlaceholder: {
    tr: "dal-adı (örn: feature/arama)", en: "branch-name (e.g. feature/search)", de: "branch-name (z. B. feature/suche)", ru: "имя-ветки (напр. feature/search)", ar: "اسم-الفرع (مثل feature/search)", es: "nombre-rama (p. ej. feature/buscar)", fr: "nom-branche (ex. feature/recherche)", az: "budaq-adı (məs. feature/axtar)",
  },
  gitCreate: {
    tr: "Oluştur", en: "Create", de: "Erstellen", ru: "Создать", ar: "إنشاء", es: "Crear", fr: "Créer", az: "Yarat",
  },
  gitSync: {
    tr: "Eşzamanla (fetch + pull + push)", en: "Sync (fetch + pull + push)", de: "Synchronisieren (fetch + pull + push)", ru: "Синхронизировать (fetch + pull + push)", ar: "مزامنة (fetch + pull + push)", es: "Sincronizar (fetch + pull + push)", fr: "Synchroniser (fetch + pull + push)", az: "Sinxronlaşdır (fetch + pull + push)",
  },
  gitSyncDone: {
    tr: "Eşzamanlandı.", en: "Synced.", de: "Synchronisiert.", ru: "Синхронизировано.", ar: "تمت المزامنة.", es: "Sincronizado.", fr: "Synchronisé.", az: "Sinxronlaşdırıldı.",
  },
  gitDiverged: {
    tr: "Yerel ve uzak dal ayrıştı. Güvenlik için otomatik birleştirme yapılmadı; terminalde merge veya rebase ile çözün.", en: "Local and remote branches have diverged. Nothing was merged automatically; resolve it in the terminal with merge or rebase.", de: "Lokaler und Remote-Branch sind auseinandergelaufen. Es wurde nichts automatisch zusammengeführt; lösen Sie das im Terminal per merge oder rebase.", ru: "Локальная и удалённая ветки разошлись. Автоматического слияния не было; решите это в терминале через merge или rebase.", ar: "تباعد الفرعان المحلي والبعيد. لم يتم الدمج تلقائيًا؛ عالج ذلك في الطرفية عبر merge أو rebase.", es: "Las ramas local y remota han divergido. No se fusionó nada automáticamente; resuélvelo en la terminal con merge o rebase.", fr: "Les branches locale et distante ont divergé. Rien n’a été fusionné automatiquement ; résolvez dans le terminal avec merge ou rebase.", az: "Lokal və uzaq budaq ayrılıb. Avtomatik birləşdirmə edilmədi; terminalda merge və ya rebase ilə həll edin.",
  },
  gitStaged: {
    tr: "Sahnelenen değişiklikler", en: "Staged changes", de: "Gestagte Änderungen", ru: "Подготовленные изменения", ar: "التغييرات المجهّزة", es: "Cambios preparados", fr: "Modifications indexées", az: "Hazırlanmış dəyişikliklər",
  },
  gitChanges: {
    tr: "Değişiklikler", en: "Changes", de: "Änderungen", ru: "Изменения", ar: "التغييرات", es: "Cambios", fr: "Modifications", az: "Dəyişikliklər",
  },
  gitStageAll: {
    tr: "Tümünü sahnele", en: "Stage all", de: "Alle stagen", ru: "Подготовить все", ar: "تجهيز الكل", es: "Preparar todo", fr: "Tout indexer", az: "Hamısını hazırla",
  },
  gitUnstageAll: {
    tr: "Tümünü geri al", en: "Unstage all", de: "Alle entstagen", ru: "Убрать все", ar: "إلغاء تجهيز الكل", es: "Quitar todo", fr: "Tout désindexer", az: "Hamısını geri al",
  },
  gitStage: {
    tr: "Sahnele", en: "Stage", de: "Stagen", ru: "Подготовить", ar: "تجهيز", es: "Preparar", fr: "Indexer", az: "Hazırla",
  },
  gitUnstage: {
    tr: "Sahneden çıkar", en: "Unstage", de: "Entstagen", ru: "Убрать из индекса", ar: "إلغاء التجهيز", es: "Quitar", fr: "Désindexer", az: "Hazırlıqdan çıxar",
  },
  gitDiscard: {
    tr: "Değişikliği at", en: "Discard changes", de: "Änderungen verwerfen", ru: "Отменить изменения", ar: "تجاهل التغييرات", es: "Descartar cambios", fr: "Annuler les modifications", az: "Dəyişikliyi at",
  },
  gitDiscardConfirm: {
    tr: "Bu değişiklik kalıcı olarak silinecek ve geri alınamaz. Devam edilsin mi?", en: "This change will be permanently discarded and cannot be undone. Continue?", de: "Diese Änderung wird endgültig verworfen und kann nicht rückgängig gemacht werden. Fortfahren?", ru: "Это изменение будет безвозвратно отменено. Продолжить?", ar: "سيتم تجاهل هذا التغيير نهائيًا ولا يمكن التراجع عنه. هل تريد المتابعة؟", es: "Este cambio se descartará de forma permanente y no se puede deshacer. ¿Continuar?", fr: "Cette modification sera définitivement annulée et ne pourra pas être restaurée. Continuer ?", az: "Bu dəyişiklik həmişəlik silinəcək və geri qaytarıla bilməz. Davam edilsin?",
  },
  gitCommitPlaceholder: {
    tr: "Commit mesajı (örn: feat: arama ekle)", en: "Commit message (e.g. feat: add search)", de: "Commit-Nachricht (z. B. feat: Suche hinzufügen)", ru: "Сообщение коммита (напр. feat: add search)", ar: "رسالة commit (مثل feat: add search)", es: "Mensaje de commit (p. ej. feat: añadir búsqueda)", fr: "Message de commit (ex. feat: ajouter la recherche)", az: "Commit mesajı (məs. feat: axtarış əlavə et)",
  },
  gitCommit: {
    tr: "Commit", en: "Commit", de: "Commit", ru: "Коммит", ar: "Commit", es: "Commit", fr: "Commit", az: "Commit",
  },
  gitCommitDone: {
    tr: "Commit oluşturuldu.", en: "Commit created.", de: "Commit erstellt.", ru: "Коммит создан.", ar: "تم إنشاء commit.", es: "Commit creado.", fr: "Commit créé.", az: "Commit yaradıldı.",
  },
  gitNothingStaged: {
    tr: "Commit için önce dosyaları sahneleyin.", en: "Stage files first to commit.", de: "Stagen Sie zuerst Dateien für den Commit.", ru: "Сначала подготовьте файлы для коммита.", ar: "جهّز الملفات أولًا لإجراء commit.", es: "Prepara primero los archivos para hacer commit.", fr: "Indexez d’abord des fichiers pour commiter.", az: "Commit üçün əvvəlcə faylları hazırlayın.",
  },
  gitClean: {
    tr: "Çalışma ağacı temiz.", en: "Working tree is clean.", de: "Arbeitsverzeichnis ist sauber.", ru: "Рабочее дерево чистое.", ar: "شجرة العمل نظيفة.", es: "El árbol de trabajo está limpio.", fr: "L’arbre de travail est propre.", az: "İş ağacı təmizdir.",
  },
  gitHistory: {
    tr: "Geçmiş", en: "History", de: "Verlauf", ru: "История", ar: "السجل", es: "Historial", fr: "Historique", az: "Tarixçə",
  },
  gitNoCommits: {
    tr: "Henüz commit yok.", en: "No commits yet.", de: "Noch keine Commits.", ru: "Коммитов пока нет.", ar: "لا توجد commits بعد.", es: "Aún no hay commits.", fr: "Aucun commit pour l’instant.", az: "Hələ commit yoxdur.",
  },
  gitInit: {
    tr: "Git deposu oluştur", en: "Initialize Git repository", de: "Git-Repository initialisieren", ru: "Создать Git-репозиторий", ar: "تهيئة مستودع Git", es: "Inicializar repositorio Git", fr: "Initialiser un dépôt Git", az: "Git deposu yarat",
  },
  gitNotRepo: {
    tr: "Bu klasör bir Git deposu değil.", en: "This folder is not a Git repository.", de: "Dieser Ordner ist kein Git-Repository.", ru: "Эта папка не является Git-репозиторием.", ar: "هذا المجلد ليس مستودع Git.", es: "Esta carpeta no es un repositorio Git.", fr: "Ce dossier n’est pas un dépôt Git.", az: "Bu qovluq Git deposu deyil.",
  },
  gitOpenFolder: {
    tr: "Git kontrollerini görmek için bir klasör açın.", en: "Open a folder to see Git controls.", de: "Öffnen Sie einen Ordner, um die Git-Steuerung zu sehen.", ru: "Откройте папку, чтобы увидеть управление Git.", ar: "افتح مجلدًا لعرض عناصر تحكم Git.", es: "Abre una carpeta para ver los controles de Git.", fr: "Ouvrez un dossier pour voir les commandes Git.", az: "Git idarəetməsini görmək üçün qovluq açın.",
  },
  gitPull: {
    tr: "Çek (pull)", en: "Pull", de: "Pull", ru: "Получить (pull)", ar: "سحب (pull)", es: "Traer (pull)", fr: "Tirer (pull)", az: "Çək (pull)",
  },
  gitPush: {
    tr: "Gönder (push)", en: "Push", de: "Push", ru: "Отправить (push)", ar: "دفع (push)", es: "Enviar (push)", fr: "Pousser (push)", az: "Göndər (push)",
  },
  gitDone: {
    tr: "İşlem tamamlandı.", en: "Done.", de: "Fertig.", ru: "Готово.", ar: "تم.", es: "Hecho.", fr: "Terminé.", az: "Tamamlandı.",
  },
  gitFailed: {
    tr: "İşlem başarısız oldu.", en: "The operation failed.", de: "Der Vorgang ist fehlgeschlagen.", ru: "Операция не удалась.", ar: "فشلت العملية.", es: "La operación falló.", fr: "L’opération a échoué.", az: "Əməliyyat uğursuz oldu.",
  },
  gitConflict: {
    tr: "Çakışma", en: "Conflict", de: "Konflikt", ru: "Конфликт", ar: "تعارض", es: "Conflicto", fr: "Conflit", az: "Konflikt",
  },
  prOpen: {
    tr: "Pull Request aç", en: "Open a pull request", de: "Pull Request erstellen", ru: "Создать pull request", ar: "فتح طلب دمج", es: "Abrir pull request", fr: "Ouvrir une pull request", az: "Pull request aç",
  },
  prTitle: {
    tr: "PR başlığı", en: "PR title", de: "PR-Titel", ru: "Заголовок PR", ar: "عنوان PR", es: "Título del PR", fr: "Titre de la PR", az: "PR başlığı",
  },
  prBody: {
    tr: "Açıklama (isteğe bağlı)", en: "Description (optional)", de: "Beschreibung (optional)", ru: "Описание (необязательно)", ar: "الوصف (اختياري)", es: "Descripción (opcional)", fr: "Description (facultatif)", az: "Təsvir (könüllü)",
  },
  prDraft: {
    tr: "Taslak olarak aç", en: "Open as draft", de: "Als Entwurf öffnen", ru: "Открыть как черновик", ar: "فتح كمسودة", es: "Abrir como borrador", fr: "Ouvrir en brouillon", az: "Qaralama kimi aç",
  },
  prSubmit: {
    tr: "PR oluştur", en: "Create PR", de: "PR erstellen", ru: "Создать PR", ar: "إنشاء PR", es: "Crear PR", fr: "Créer la PR", az: "PR yarat",
  },
  prCreated: {
    tr: "Pull request oluşturuldu.", en: "Pull request created.", de: "Pull Request erstellt.", ru: "Pull request создан.", ar: "تم إنشاء طلب الدمج.", es: "Pull request creado.", fr: "Pull request créée.", az: "Pull request yaradıldı.",
  },
  prOnDefault: {
    tr: "Varsayılan daldasınız. PR için önce yeni bir dal oluşturup commit yapın.", en: "You are on the default branch. Create a new branch and commit before opening a PR.", de: "Sie befinden sich im Standard-Branch. Erstellen Sie vor dem PR einen neuen Branch und committen Sie.", ru: "Вы в основной ветке. Для PR создайте новую ветку и сделайте коммит.", ar: "أنت على الفرع الافتراضي. أنشئ فرعًا جديدًا وأجرِ commit قبل فتح PR.", es: "Estás en la rama predeterminada. Crea una rama nueva y haz commit antes del PR.", fr: "Vous êtes sur la branche par défaut. Créez une branche et commitez avant la PR.", az: "Siz əsas budaqdasınız. PR üçün əvvəlcə yeni budaq yaradıb commit edin.",
  },
  prExists: {
    tr: "Bu dal için zaten açık bir PR var.", en: "An open PR already exists for this branch.", de: "Für diesen Branch existiert bereits ein offener PR.", ru: "Для этой ветки уже есть открытый PR.", ar: "يوجد طلب دمج مفتوح لهذا الفرع بالفعل.", es: "Ya existe un PR abierto para esta rama.", fr: "Une PR est déjà ouverte pour cette branche.", az: "Bu budaq üçün artıq açıq PR var.",
  },
  pubTitle: {
    tr: "GitHub’da yayınla", en: "Publish to GitHub", de: "Auf GitHub veröffentlichen", ru: "Опубликовать на GitHub", ar: "نشر على GitHub", es: "Publicar en GitHub", fr: "Publier sur GitHub", az: "GitHub-da yayımla",
  },
  pubName: {
    tr: "Depo adı", en: "Repository name", de: "Repository-Name", ru: "Имя репозитория", ar: "اسم المستودع", es: "Nombre del repositorio", fr: "Nom du dépôt", az: "Depo adı",
  },
  pubPrivate: {
    tr: "Özel depo", en: "Private repository", de: "Privates Repository", ru: "Приватный репозиторий", ar: "مستودع خاص", es: "Repositorio privado", fr: "Dépôt privé", az: "Gizli depo",
  },
  pubSubmit: {
    tr: "Yayınla", en: "Publish", de: "Veröffentlichen", ru: "Опубликовать", ar: "نشر", es: "Publicar", fr: "Publier", az: "Yayımla",
  },
  pubDone: {
    tr: "Depo GitHub’da yayınlandı.", en: "Repository published on GitHub.", de: "Repository auf GitHub veröffentlicht.", ru: "Репозиторий опубликован на GitHub.", ar: "تم نشر المستودع على GitHub.", es: "Repositorio publicado en GitHub.", fr: "Dépôt publié sur GitHub.", az: "Depo GitHub-da yayımlandı.",
  },
  pubNoCommits: {
    tr: "Yayınlamadan önce en az bir commit oluşturun.", en: "Create at least one commit before publishing.", de: "Erstellen Sie vor dem Veröffentlichen mindestens einen Commit.", ru: "Перед публикацией создайте хотя бы один коммит.", ar: "أنشئ commit واحدًا على الأقل قبل النشر.", es: "Crea al menos un commit antes de publicar.", fr: "Créez au moins un commit avant de publier.", az: "Yayımlamazdan əvvəl ən azı bir commit yaradın.",
  },
  pubExists: {
    tr: "Bu adla bir depo zaten var.", en: "A repository with this name already exists.", de: "Ein Repository mit diesem Namen existiert bereits.", ru: "Репозиторий с таким именем уже существует.", ar: "يوجد مستودع بهذا الاسم بالفعل.", es: "Ya existe un repositorio con este nombre.", fr: "Un dépôt portant ce nom existe déjà.", az: "Bu adda depo artıq mövcuddur.",
  },
  gitSyncing: {
    tr: "Eşzamanlanıyor...", en: "Syncing...", de: "Synchronisiere...", ru: "Синхронизация...", ar: "جارٍ المزامنة...", es: "Sincronizando...", fr: "Synchronisation...", az: "Sinxronlaşdırılır...",
  },
  closeTab: {
    tr: "Sekmeyi kapat", en: "Close tab", de: "Tab schließen", ru: "Закрыть вкладку", ar: "إغلاق علامة التبويب", es: "Cerrar pestaña", fr: "Fermer l’onglet", az: "Vərəqi bağla",
  },
  splashLoading: {
    tr: "NovaCode Studio yükleniyor", en: "Loading NovaCode Studio", de: "NovaCode Studio wird geladen", ru: "Загрузка NovaCode Studio", ar: "جارٍ تحميل NovaCode Studio", es: "Cargando NovaCode Studio", fr: "Chargement de NovaCode Studio", az: "NovaCode Studio yüklənir",
  },
  splashTagline: {
    tr: "Yapay zekâ destekli modern kod editörü", en: "The AI-powered modern code editor", de: "Der KI-gestützte moderne Code-Editor", ru: "Современный редактор кода с ИИ", ar: "محرر الأكواد الحديث المدعوم بالذكاء الاصطناعي", es: "El editor de código moderno con IA", fr: "L’éditeur de code moderne propulsé par l’IA", az: "Süni intellektli müasir kod redaktoru",
  },
  actExplorer: {
    tr: "Gezgin", en: "Explorer", de: "Explorer", ru: "Проводник", ar: "المستكشف", es: "Explorador", fr: "Explorateur", az: "Kəşfiyyatçı",
  },
  actGit: {
    tr: "Kaynak Denetimi", en: "Source Control", de: "Quellcodeverwaltung", ru: "Система управления версиями", ar: "التحكم بالمصدر", es: "Control de código fuente", fr: "Gestion de versions", az: "Mənbə nəzarəti",
  },
  actSnippets: {
    tr: "Kod Parçacıkları", en: "Snippets", de: "Snippets", ru: "Сниппеты", ar: "المقتطفات", es: "Fragmentos", fr: "Extraits", az: "Kod parçaları",
  },
  actAI: {
    tr: "Yapay Zekâ Asistanı", en: "AI Assistant", de: "KI-Assistent", ru: "ИИ-ассистент", ar: "مساعد الذكاء الاصطناعي", es: "Asistente de IA", fr: "Assistant IA", az: "Süni intellekt köməkçisi",
  },
  actSettings: {
    tr: "Ayarlar", en: "Settings", de: "Einstellungen", ru: "Настройки", ar: "الإعدادات", es: "Ajustes", fr: "Paramètres", az: "Parametrlər",
  },
  actHome: {
    tr: "Hoş Geldiniz", en: "Welcome", de: "Willkommen", ru: "Добро пожаловать", ar: "مرحبًا", es: "Bienvenido", fr: "Bienvenue", az: "Xoş gəlmisiniz",
  },
  actAccountOff: {
    tr: "GitHub’a giriş yap", en: "Sign in to GitHub", de: "Bei GitHub anmelden", ru: "Войти в GitHub", ar: "تسجيل الدخول إلى GitHub", es: "Iniciar sesión en GitHub", fr: "Se connecter à GitHub", az: "GitHub-a daxil ol",
  },
  tbSidebar: {
    tr: "Kenar çubuğunu aç/kapat (Ctrl+B)", en: "Toggle sidebar (Ctrl+B)", de: "Seitenleiste ein-/ausblenden (Strg+B)", ru: "Показать/скрыть боковую панель (Ctrl+B)", ar: "إظهار/إخفاء الشريط الجانبي (Ctrl+B)", es: "Mostrar/ocultar barra lateral (Ctrl+B)", fr: "Afficher/masquer la barre latérale (Ctrl+B)", az: "Yan paneli göstər/gizlət (Ctrl+B)",
  },
  tbTerminal: {
    tr: "Terminali aç/kapat (Ctrl+`)", en: "Toggle terminal (Ctrl+`)", de: "Terminal ein-/ausblenden (Strg+`)", ru: "Показать/скрыть терминал (Ctrl+`)", ar: "إظهار/إخفاء الطرفية (Ctrl+`)", es: "Mostrar/ocultar terminal (Ctrl+`)", fr: "Afficher/masquer le terminal (Ctrl+`)", az: "Terminalı göstər/gizlət (Ctrl+`)",
  },
  tbPreview: {
    tr: "HTML önizleme", en: "HTML preview", de: "HTML-Vorschau", ru: "Предпросмотр HTML", ar: "معاينة HTML", es: "Vista previa HTML", fr: "Aperçu HTML", az: "HTML önizləmə",
  },
  stReady: {
    tr: "Hazır", en: "Ready", de: "Bereit", ru: "Готово", ar: "جاهز", es: "Listo", fr: "Prêt", az: "Hazır",
  },
  stSaved: {
    tr: "Kaydedildi", en: "Saved", de: "Gespeichert", ru: "Сохранено", ar: "تم الحفظ", es: "Guardado", fr: "Enregistré", az: "Yadda saxlanıldı",
  },
  stUnsaved: {
    tr: "Kaydedilmedi", en: "Unsaved", de: "Nicht gespeichert", ru: "Не сохранено", ar: "غير محفوظ", es: "Sin guardar", fr: "Non enregistré", az: "Yadda saxlanılmayıb",
  },
  stSpaces: {
    tr: "Boşluklar: 2", en: "Spaces: 2", de: "Leerzeichen: 2", ru: "Пробелы: 2", ar: "المسافات: 2", es: "Espacios: 2", fr: "Espaces : 2", az: "Boşluqlar: 2",
  },
  stPlain: {
    tr: "Düz metin", en: "Plain text", de: "Nur Text", ru: "Простой текст", ar: "نص عادي", es: "Texto sin formato", fr: "Texte brut", az: "Sadə mətn",
  },
  welStart: {
    tr: "Başlangıç", en: "Start", de: "Start", ru: "Начало", ar: "البدء", es: "Inicio", fr: "Démarrer", az: "Başlanğıc",
  },
  welConnected: {
    tr: "GitHub bağlı: @{login}", en: "GitHub connected: @{login}", de: "GitHub verbunden: @{login}", ru: "GitHub подключён: @{login}", ar: "GitHub متصل: @{login}", es: "GitHub conectado: @{login}", fr: "GitHub connecté : @{login}", az: "GitHub bağlıdır: @{login}",
  },
  welRecent: {
    tr: "Son açılanlar", en: "Recent", de: "Zuletzt geöffnet", ru: "Недавние", ar: "الأخيرة", es: "Recientes", fr: "Récents", az: "Son açılanlar",
  },
  welNoRecent: {
    tr: "Henüz son açılan klasör yok.", en: "No recent folders yet.", de: "Noch keine zuletzt geöffneten Ordner.", ru: "Недавних папок пока нет.", ar: "لا توجد مجلدات حديثة بعد.", es: "Aún no hay carpetas recientes.", fr: "Aucun dossier récent pour l’instant.", az: "Hələ son açılan qovluq yoxdur.",
  },
  welWalkthroughs: {
    tr: "Keşfet", en: "Explore", de: "Entdecken", ru: "Обзор", ar: "استكشاف", es: "Explorar", fr: "Découvrir", az: "Kəşf et",
  },
  welGitTitle: {
    tr: "Git ve GitHub ile çalış", en: "Work with Git and GitHub", de: "Mit Git und GitHub arbeiten", ru: "Работа с Git и GitHub", ar: "العمل مع Git وGitHub", es: "Trabaja con Git y GitHub", fr: "Travaillez avec Git et GitHub", az: "Git və GitHub ilə işlə",
  },
  welGitDesc: {
    tr: "Hesabını bağla; değişiklikleri sahnele, commit et, eşzamanla, PR aç.", en: "Connect your account; stage, commit, sync and open pull requests.", de: "Konto verbinden; stagen, committen, synchronisieren und Pull Requests öffnen.", ru: "Подключите аккаунт; индексируйте, коммитьте, синхронизируйте и открывайте PR.", ar: "اربط حسابك؛ جهّز وأنشئ commit وزامن وافتح طلبات الدمج.", es: "Conecta tu cuenta; prepara, haz commit, sincroniza y abre pull requests.", fr: "Connectez votre compte ; indexez, commitez, synchronisez et ouvrez des PR.", az: "Hesabınızı bağlayın; hazırlayın, commit edin, sinxronlaşdırın, PR açın.",
  },
  welAiTitle: {
    tr: "Yapay zekâ asistanı", en: "AI assistant", de: "KI-Assistent", ru: "ИИ-ассистент", ar: "مساعد الذكاء الاصطناعي", es: "Asistente de IA", fr: "Assistant IA", az: "Süni intellekt köməkçisi",
  },
  welAiDesc: {
    tr: "Kodunu açıkla, hata bul, optimize et.", en: "Explain code, find bugs, optimize.", de: "Code erklären, Fehler finden, optimieren.", ru: "Объясняйте код, ищите ошибки, оптимизируйте.", ar: "اشرح الكود واعثر على الأخطاء وحسّنه.", es: "Explica código, encuentra errores y optimiza.", fr: "Expliquez le code, trouvez les bugs, optimisez.", az: "Kodu izah et, xəta tap, optimallaşdır.",
  },
  welTermTitle: {
    tr: "Entegre terminal", en: "Integrated terminal", de: "Integriertes Terminal", ru: "Встроенный терминал", ar: "الطرفية المدمجة", es: "Terminal integrada", fr: "Terminal intégré", az: "Daxili terminal",
  },
  welTermDesc: {
    tr: "PowerShell ve CMD, renkli çıktı ve canlı klasör istemi.", en: "PowerShell and CMD with color output and a live directory prompt.", de: "PowerShell und CMD mit Farbausgabe und aktuellem Verzeichnis-Prompt.", ru: "PowerShell и CMD с цветным выводом и актуальным приглашением каталога.", ar: "PowerShell وCMD بمخرجات ملونة ومؤشر مجلد مباشر.", es: "PowerShell y CMD con salida en color y prompt de directorio en vivo.", fr: "PowerShell et CMD avec sortie colorée et invite de dossier en direct.", az: "PowerShell və CMD, rəngli çıxış və canlı qovluq sətri.",
  },
  welShowOnStartup: {
    tr: "Açılışta karşılama sayfasını göster", en: "Show welcome page on startup", de: "Willkommensseite beim Start anzeigen", ru: "Показывать приветствие при запуске", ar: "إظهار صفحة الترحيب عند البدء", es: "Mostrar la página de bienvenida al iniciar", fr: "Afficher la page d’accueil au démarrage", az: "Açılışda xoş gəlmisiniz səhifəsini göstər",
  },
  setCatAppearance: {
    tr: "Görünüm", en: "Appearance", de: "Darstellung", ru: "Внешний вид", ar: "المظهر", es: "Apariencia", fr: "Apparence", az: "Görünüş",
  },
  setCatEditor: {
    tr: "Editör", en: "Editor", de: "Editor", ru: "Редактор", ar: "المحرر", es: "Editor", fr: "Éditeur", az: "Redaktor",
  },
  setCatSnippets: {
    tr: "Snippet ve tamamlama", en: "Snippets & completion", de: "Snippets & Vervollständigung", ru: "Сниппеты и автодополнение", ar: "المقتطفات والإكمال", es: "Snippets y autocompletado", fr: "Snippets et complétion", az: "Snippet və tamamlama",
  },
  setCatFiles: {
    tr: "Dosyalar ve kayıt", en: "Files & saving", de: "Dateien & Speichern", ru: "Файлы и сохранение", ar: "الملفات والحفظ", es: "Archivos y guardado", fr: "Fichiers et enregistrement", az: "Fayllar və yadda saxlama",
  },
  setCatTerminal: {
    tr: "Terminal", en: "Terminal", de: "Terminal", ru: "Терминал", ar: "الطرفية", es: "Terminal", fr: "Terminal", az: "Terminal",
  },
  setCatGit: {
    tr: "Git ve GitHub", en: "Git & GitHub", de: "Git & GitHub", ru: "Git и GitHub", ar: "Git وGitHub", es: "Git y GitHub", fr: "Git et GitHub", az: "Git və GitHub",
  },
  setCatCollab: {
    tr: "Ortak düzenleme", en: "Collaboration", de: "Zusammenarbeit", ru: "Совместная работа", ar: "التحرير المشترك", es: "Colaboración", fr: "Collaboration", az: "Birgə redaktə",
  },
  setCatShortcuts: {
    tr: "Klavye kısayolları", en: "Keyboard shortcuts", de: "Tastenkürzel", ru: "Горячие клавиши", ar: "اختصارات لوحة المفاتيح", es: "Atajos de teclado", fr: "Raccourcis clavier", az: "Klaviatura qısayolları",
  },
  setCatAbout: {
    tr: "Hakkında ve yedek", en: "About & backup", de: "Info & Sicherung", ru: "О программе и резервная копия", ar: "حول والنسخ الاحتياطي", es: "Acerca de y copia", fr: "À propos et sauvegarde", az: "Haqqında və ehtiyat",
  },
  setTitle: {
    tr: "Ayarlar", en: "Settings", de: "Einstellungen", ru: "Настройки", ar: "الإعدادات", es: "Ajustes", fr: "Paramètres", az: "Parametrlər",
  },
  setSearch: {
    tr: "Ayarlarda ara...", en: "Search settings...", de: "Einstellungen durchsuchen...", ru: "Поиск в настройках...", ar: "ابحث في الإعدادات...", es: "Buscar en ajustes...", fr: "Rechercher dans les paramètres...", az: "Parametrlərdə axtar...",
  },
  setNoResults: {
    tr: "Eşleşen ayar yok.", en: "No matching settings.", de: "Keine passenden Einstellungen.", ru: "Подходящих настроек нет.", ar: "لا توجد إعدادات مطابقة.", es: "No hay ajustes que coincidan.", fr: "Aucun paramètre correspondant.", az: "Uyğun parametr yoxdur.",
  },
  setModified: {
    tr: "Varsayılandan farklı", en: "Modified from default", de: "Vom Standard abweichend", ru: "Отличается от значения по умолчанию", ar: "تم تغييره عن الافتراضي", es: "Modificado respecto al valor por defecto", fr: "Modifié par rapport au défaut", az: "Standartdan fərqlidir",
  },
  setResetOne: {
    tr: "Varsayılana döndür", en: "Reset to default", de: "Auf Standard zurücksetzen", ru: "Сбросить по умолчанию", ar: "إعادة إلى الافتراضي", es: "Restablecer valor", fr: "Rétablir la valeur par défaut", az: "Standarta qaytar",
  },
  setResetAll: {
    tr: "Tüm ayarları sıfırla", en: "Reset all settings", de: "Alle Einstellungen zurücksetzen", ru: "Сбросить все настройки", ar: "إعادة تعيين كل الإعدادات", es: "Restablecer todos los ajustes", fr: "Réinitialiser tous les paramètres", az: "Bütün parametrləri sıfırla",
  },
  setResetAllConfirm: {
    tr: "Tüm ayarlar varsayılana dönecek (özel snippet'ler korunur). Devam edilsin mi?", en: "All settings will return to defaults (your custom snippets are kept). Continue?", de: "Alle Einstellungen werden auf Standard zurückgesetzt (eigene Snippets bleiben). Fortfahren?", ru: "Все настройки вернутся к значениям по умолчанию (ваши сниппеты сохранятся). Продолжить?", ar: "ستعود كل الإعدادات إلى الافتراضي (تبقى مقتطفاتك المخصصة). هل تريد المتابعة؟", es: "Todos los ajustes volverán a sus valores por defecto (se conservan tus snippets). ¿Continuar?", fr: "Tous les paramètres reviendront aux valeurs par défaut (vos snippets sont conservés). Continuer ?", az: "Bütün parametrlər standarta qayıdacaq (xüsusi snippetlər qalır). Davam edilsin?",
  },
  setExport: {
    tr: "Ayarları dışa aktar", en: "Export settings", de: "Einstellungen exportieren", ru: "Экспорт настроек", ar: "تصدير الإعدادات", es: "Exportar ajustes", fr: "Exporter les paramètres", az: "Parametrləri ixrac et",
  },
  setImport: {
    tr: "Ayarları içe aktar", en: "Import settings", de: "Einstellungen importieren", ru: "Импорт настроек", ar: "استيراد الإعدادات", es: "Importar ajustes", fr: "Importer les paramètres", az: "Parametrləri idxal et",
  },
  setImportDone: {
    tr: "Ayarlar içe aktarıldı.", en: "Settings imported.", de: "Einstellungen importiert.", ru: "Настройки импортированы.", ar: "تم استيراد الإعدادات.", es: "Ajustes importados.", fr: "Paramètres importés.", az: "Parametrlər idxal edildi.",
  },
  setImportFailed: {
    tr: "Dosya geçerli bir ayar dosyası değil.", en: "The file is not a valid settings file.", de: "Die Datei ist keine gültige Einstellungsdatei.", ru: "Файл не является допустимым файлом настроек.", ar: "الملف ليس ملف إعدادات صالحًا.", es: "El archivo no es un archivo de ajustes válido.", fr: "Le fichier n’est pas un fichier de paramètres valide.", az: "Fayl etibarlı parametr faylı deyil.",
  },
  setAutoSaved: {
    tr: "Değişiklikler anında uygulanır ve bu cihazda otomatik kaydedilir.", en: "Changes apply instantly and are saved automatically on this device.", de: "Änderungen werden sofort angewendet und automatisch auf diesem Gerät gespeichert.", ru: "Изменения применяются сразу и автоматически сохраняются на этом устройстве.", ar: "تُطبَّق التغييرات فورًا وتُحفظ تلقائيًا على هذا الجهاز.", es: "Los cambios se aplican al instante y se guardan automáticamente en este dispositivo.", fr: "Les changements s’appliquent instantanément et sont enregistrés automatiquement sur cet appareil.", az: "Dəyişikliklər dərhal tətbiq olunur və bu cihazda avtomatik saxlanılır.",
  },
  setClose: {
    tr: "Ayarları kapat", en: "Close settings", de: "Einstellungen schließen", ru: "Закрыть настройки", ar: "إغلاق الإعدادات", es: "Cerrar ajustes", fr: "Fermer les paramètres", az: "Parametrləri bağla",
  },
  setPreview: {
    tr: "Önizleme", en: "Preview", de: "Vorschau", ru: "Предпросмотр", ar: "معاينة", es: "Vista previa", fr: "Aperçu", az: "Önizləmə",
  },
  setCollabUrlInvalid: {
    tr: "Adres wss:// ile başlamalı (yerel test için ws://localhost).", en: "The address must start with wss:// (ws://localhost for local testing).", de: "Die Adresse muss mit wss:// beginnen (ws://localhost für lokale Tests).", ru: "Адрес должен начинаться с wss:// (ws://localhost для локальных тестов).", ar: "يجب أن يبدأ العنوان بـ wss:// (ws://localhost للاختبار المحلي).", es: "La dirección debe empezar por wss:// (ws://localhost para pruebas locales).", fr: "L’adresse doit commencer par wss:// (ws://localhost pour les tests locaux).", az: "Ünvan wss:// ilə başlamalıdır (yerli test üçün ws://localhost).",
  },
  optDark: {
    tr: "Koyu", en: "Dark", de: "Dunkel", ru: "Тёмная", ar: "داكن", es: "Oscuro", fr: "Sombre", az: "Tünd",
  },
  optLight: {
    tr: "Açık", en: "Light", de: "Hell", ru: "Светлая", ar: "فاتح", es: "Claro", fr: "Clair", az: "Açıq",
  },
  optSystem: {
    tr: "Sistem", en: "System", de: "System", ru: "Системная", ar: "النظام", es: "Sistema", fr: "Système", az: "Sistem",
  },
  optAuto: {
    tr: "Otomatik", en: "Automatic", de: "Automatisch", ru: "Автоматически", ar: "تلقائي", es: "Automático", fr: "Automatique", az: "Avtomatik",
  },
  optOff: {
    tr: "Kapalı", en: "Off", de: "Aus", ru: "Выкл.", ar: "متوقف", es: "Desactivado", fr: "Désactivé", az: "Söndürülü",
  },
  optOn: {
    tr: "Açık", en: "On", de: "An", ru: "Вкл.", ar: "مفعّل", es: "Activado", fr: "Activé", az: "Aktiv",
  },
  optAfterDelay: {
    tr: "Gecikmeden sonra", en: "After delay", de: "Nach Verzögerung", ru: "После задержки", ar: "بعد تأخير", es: "Tras un retraso", fr: "Après un délai", az: "Gecikmədən sonra",
  },
  optOnFocusChange: {
    tr: "Odak değişince", en: "On focus change", de: "Bei Fokuswechsel", ru: "При потере фокуса", ar: "عند تغيير التركيز", es: "Al cambiar el foco", fr: "Au changement de focus", az: "Fokus dəyişəndə",
  },
  optCustom: {
    tr: "Özel...", en: "Custom...", de: "Benutzerdefiniert...", ru: "Свой...", ar: "مخصص...", es: "Personalizado...", fr: "Personnalisé...", az: "Xüsusi...",
  },
  optNone: {
    tr: "Hiçbiri", en: "None", de: "Keine", ru: "Нет", ar: "بدون", es: "Ninguno", fr: "Aucun", az: "Heç biri",
  },
  optTop: {
    tr: "Üstte", en: "Top", de: "Oben", ru: "Сверху", ar: "في الأعلى", es: "Arriba", fr: "En haut", az: "Yuxarıda",
  },
  optBottom: {
    tr: "Altta", en: "Bottom", de: "Unten", ru: "Снизу", ar: "في الأسفل", es: "Abajo", fr: "En bas", az: "Aşağıda",
  },
  optInline: {
    tr: "Satır içi", en: "Inline", de: "Inline", ru: "В строке", ar: "ضمن السطر", es: "En línea", fr: "En ligne", az: "Sətir daxili",
  },
  optNormal: {
    tr: "Normal", en: "Normal", de: "Normal", ru: "Обычный", ar: "عادي", es: "Normal", fr: "Normal", az: "Normal",
  },
  optBold: {
    tr: "Kalın", en: "Bold", de: "Fett", ru: "Жирный", ar: "عريض", es: "Negrita", fr: "Gras", az: "Qalın",
  },
  optMono: {
    tr: "Sabit aralıklı", en: "Monospace", de: "Monospace", ru: "Моноширинный", ar: "أحادي المسافة", es: "Monoespaciado", fr: "Monospace", az: "Monoşirinli",
  },
  accIndigo: {
    tr: "İndigo", en: "Indigo", de: "Indigo", ru: "Индиго", ar: "نيلي", es: "Índigo", fr: "Indigo", az: "İndiqo",
  },
  accBlue: {
    tr: "Mavi", en: "Blue", de: "Blau", ru: "Синий", ar: "أزرق", es: "Azul", fr: "Bleu", az: "Mavi",
  },
  accTeal: {
    tr: "Turkuaz", en: "Teal", de: "Türkis", ru: "Бирюзовый", ar: "فيروزي", es: "Turquesa", fr: "Turquoise", az: "Firuzəyi",
  },
  accGreen: {
    tr: "Yeşil", en: "Green", de: "Grün", ru: "Зелёный", ar: "أخضر", es: "Verde", fr: "Vert", az: "Yaşıl",
  },
  accOrange: {
    tr: "Turuncu", en: "Orange", de: "Orange", ru: "Оранжевый", ar: "برتقالي", es: "Naranja", fr: "Orange", az: "Narıncı",
  },
  accPink: {
    tr: "Pembe", en: "Pink", de: "Pink", ru: "Розовый", ar: "وردي", es: "Rosa", fr: "Rose", az: "Çəhrayı",
  },
  set_themeMode: {
    tr: "Tema modu", en: "Color mode", de: "Farbmodus", ru: "Режим темы", ar: "وضع السمة", es: "Modo de color", fr: "Mode de couleur", az: "Tema rejimi",
  },
  set_accent: {
    tr: "Vurgu rengi", en: "Accent color", de: "Akzentfarbe", ru: "Акцентный цвет", ar: "لون التمييز", es: "Color de acento", fr: "Couleur d’accent", az: "Vurğu rəngi",
  },
  set_uiFont: {
    tr: "Arayüz yazı tipi", en: "Interface font", de: "Oberflächenschrift", ru: "Шрифт интерфейса", ar: "خط الواجهة", es: "Fuente de la interfaz", fr: "Police de l’interface", az: "İnterfeys şrifti",
  },
  set_uiZoom: {
    tr: "Arayüz yakınlaştırma", en: "Interface zoom", de: "Oberflächen-Zoom", ru: "Масштаб интерфейса", ar: "تكبير الواجهة", es: "Zoom de la interfaz", fr: "Zoom de l’interface", az: "İnterfeys miqyası",
  },
  set_animations: {
    tr: "Animasyonlar", en: "Animations", de: "Animationen", ru: "Анимации", ar: "الرسوم المتحركة", es: "Animaciones", fr: "Animations", az: "Animasiyalar",
  },
  set_language: {
    tr: "Dil", en: "Language", de: "Sprache", ru: "Язык", ar: "اللغة", es: "Idioma", fr: "Langue", az: "Dil",
  },
  set_editorTheme: {
    tr: "Editör teması", en: "Editor theme", de: "Editor-Design", ru: "Тема редактора", ar: "سمة المحرر", es: "Tema del editor", fr: "Thème de l’éditeur", az: "Redaktor temasi",
  },
  set_fontFamily: {
    tr: "Kod yazı tipi", en: "Code font", de: "Code-Schrift", ru: "Шрифт кода", ar: "خط الكود", es: "Fuente del código", fr: "Police du code", az: "Kod şrifti",
  },
  set_fontFamilyCustom: {
    tr: "Özel yazı tipi", en: "Custom font", de: "Eigene Schrift", ru: "Свой шрифт", ar: "خط مخصص", es: "Fuente personalizada", fr: "Police personnalisée", az: "Xüsusi şrift",
  },
  set_fontSize: {
    tr: "Yazı boyutu", en: "Font size", de: "Schriftgröße", ru: "Размер шрифта", ar: "حجم الخط", es: "Tamaño de fuente", fr: "Taille de police", az: "Şrift ölçüsü",
  },
  set_lineHeight: {
    tr: "Satır yüksekliği", en: "Line height", de: "Zeilenhöhe", ru: "Высота строки", ar: "ارتفاع السطر", es: "Altura de línea", fr: "Hauteur de ligne", az: "Sətir hündürlüyü",
  },
  set_fontWeight: {
    tr: "Yazı kalınlığı", en: "Font weight", de: "Schriftstärke", ru: "Насыщенность шрифта", ar: "سماكة الخط", es: "Grosor de fuente", fr: "Graisse de police", az: "Şrift qalınlığı",
  },
  set_letterSpacing: {
    tr: "Harf aralığı", en: "Letter spacing", de: "Zeichenabstand", ru: "Межбуквенный интервал", ar: "تباعد الأحرف", es: "Espaciado de letras", fr: "Espacement des lettres", az: "Hərf aralığı",
  },
  set_fontLigatures: {
    tr: "Yazı tipi ligatürleri", en: "Font ligatures", de: "Schriftligaturen", ru: "Лигатуры шрифта", ar: "ربطات الخط", es: "Ligaduras de fuente", fr: "Ligatures de police", az: "Şrift liqaturaları",
  },
  set_tabSize: {
    tr: "Sekme boşluğu", en: "Tab size", de: "Tab-Breite", ru: "Размер табуляции", ar: "حجم علامة التبويب", es: "Tamaño de tabulación", fr: "Taille de tabulation", az: "Tab ölçüsü",
  },
  set_insertSpaces: {
    tr: "Sekme yerine boşluk kullan", en: "Insert spaces instead of tabs", de: "Leerzeichen statt Tabs", ru: "Пробелы вместо табуляции", ar: "استخدام مسافات بدل التبويب", es: "Usar espacios en lugar de tabulaciones", fr: "Espaces au lieu de tabulations", az: "Tab əvəzinə boşluq",
  },
  set_wordWrap: {
    tr: "Satır kaydırma", en: "Word wrap", de: "Zeilenumbruch", ru: "Перенос строк", ar: "التفاف الأسطر", es: "Ajuste de línea", fr: "Retour à la ligne", az: "Sətir keçidi",
  },
  set_lineNumbers: {
    tr: "Satır numaraları", en: "Line numbers", de: "Zeilennummern", ru: "Номера строк", ar: "أرقام الأسطر", es: "Números de línea", fr: "Numéros de ligne", az: "Sətir nömrələri",
  },
  set_minimap: {
    tr: "Mini harita", en: "Minimap", de: "Minimap", ru: "Мини-карта", ar: "الخريطة المصغرة", es: "Minimapa", fr: "Minimap", az: "Mini xəritə",
  },
  set_renderWhitespace: {
    tr: "Boşlukları göster", en: "Render whitespace", de: "Leerzeichen anzeigen", ru: "Показывать пробелы", ar: "إظهار المسافات", es: "Mostrar espacios", fr: "Afficher les espaces", az: "Boşluqları göstər",
  },
  set_cursorStyle: {
    tr: "İmleç stili", en: "Cursor style", de: "Cursor-Stil", ru: "Стиль курсора", ar: "نمط المؤشر", es: "Estilo del cursor", fr: "Style du curseur", az: "Kursor üslubu",
  },
  set_cursorBlinking: {
    tr: "İmleç yanıp sönmesi", en: "Cursor blinking", de: "Cursor-Blinken", ru: "Мигание курсора", ar: "وميض المؤشر", es: "Parpadeo del cursor", fr: "Clignotement du curseur", az: "Kursor yanıb-sönməsi",
  },
  set_smoothCaret: {
    tr: "Yumuşak imleç animasyonu", en: "Smooth caret animation", de: "Sanfte Cursor-Animation", ru: "Плавная анимация курсора", ar: "حركة مؤشر سلسة", es: "Animación suave del cursor", fr: "Animation fluide du curseur", az: "Yumşaq kursor animasiyası",
  },
  set_smoothScrolling: {
    tr: "Yumuşak kaydırma", en: "Smooth scrolling", de: "Sanftes Scrollen", ru: "Плавная прокрутка", ar: "تمرير سلس", es: "Desplazamiento suave", fr: "Défilement fluide", az: "Yumşaq sürüşdürmə",
  },
  set_bracketColorization: {
    tr: "Parantez çiftlerini renklendir", en: "Colorize bracket pairs", de: "Klammerpaare einfärben", ru: "Раскрашивать парные скобки", ar: "تلوين أزواج الأقواس", es: "Colorear pares de corchetes", fr: "Colorer les paires de parenthèses", az: "Mötərizə cütlərini rəngləndir",
  },
  set_indentGuides: {
    tr: "Girinti kılavuzları", en: "Indent guides", de: "Einzugslinien", ru: "Направляющие отступов", ar: "أدلة المسافات البادئة", es: "Guías de sangría", fr: "Repères d’indentation", az: "Girinti bələdçiləri",
  },
  set_renderLineHighlight: {
    tr: "Etkin satırı vurgula", en: "Highlight active line", de: "Aktive Zeile hervorheben", ru: "Подсветка текущей строки", ar: "تمييز السطر النشط", es: "Resaltar línea activa", fr: "Surligner la ligne active", az: "Aktiv sətri vurğula",
  },
  set_folding: {
    tr: "Kod katlama", en: "Code folding", de: "Code-Faltung", ru: "Сворачивание кода", ar: "طي الكود", es: "Plegado de código", fr: "Repli du code", az: "Kod qatlanması",
  },
  set_stickyScroll: {
    tr: "Yapışkan kaydırma (üstte bağlam)", en: "Sticky scroll (context on top)", de: "Sticky Scroll (Kontext oben)", ru: "Закреплённый контекст сверху", ar: "تمرير ملتصق (السياق في الأعلى)", es: "Desplazamiento fijo (contexto arriba)", fr: "Défilement collant (contexte en haut)", az: "Yapışqan sürüşdürmə (yuxarıda kontekst)",
  },
  set_scrollBeyondLastLine: {
    tr: "Son satırın ötesine kaydır", en: "Scroll beyond last line", de: "Über letzte Zeile hinaus scrollen", ru: "Прокрутка за последнюю строку", ar: "التمرير بعد السطر الأخير", es: "Desplazar más allá de la última línea", fr: "Défiler au-delà de la dernière ligne", az: "Son sətirdən kənara sürüşdür",
  },
  set_formatOnPaste: {
    tr: "Yapıştırırken biçimlendir", en: "Format on paste", de: "Beim Einfügen formatieren", ru: "Форматировать при вставке", ar: "تنسيق عند اللصق", es: "Formatear al pegar", fr: "Formater au collage", az: "Yapışdırarkən formatla",
  },
  set_formatOnType: {
    tr: "Yazarken biçimlendir", en: "Format on type", de: "Beim Tippen formatieren", ru: "Форматировать при вводе", ar: "تنسيق عند الكتابة", es: "Formatear al escribir", fr: "Formater à la saisie", az: "Yazarkən formatla",
  },
  set_autoClosingBrackets: {
    tr: "Parantezleri otomatik kapat", en: "Auto-close brackets", de: "Klammern automatisch schließen", ru: "Автозакрытие скобок", ar: "إغلاق الأقواس تلقائيًا", es: "Cerrar corchetes automáticamente", fr: "Fermer les parenthèses automatiquement", az: "Mötərizələri avtomatik bağla",
  },
  set_quickSuggestions: {
    tr: "Yazarken öneri göster", en: "Quick suggestions while typing", de: "Schnellvorschläge beim Tippen", ru: "Подсказки при вводе", ar: "اقتراحات سريعة أثناء الكتابة", es: "Sugerencias rápidas al escribir", fr: "Suggestions rapides à la saisie", az: "Yazarkən təkliflər",
  },
  set_suggestOnTriggerCharacters: {
    tr: "Tetikleyici karakterlerde öner", en: "Suggest on trigger characters", de: "Bei Auslösezeichen vorschlagen", ru: "Подсказки по символам-триггерам", ar: "اقتراح عند أحرف التفعيل", es: "Sugerir con caracteres desencadenantes", fr: "Suggérer sur caractères déclencheurs", az: "Tətik simvollarında təklif et",
  },
  set_parameterHints: {
    tr: "Parametre ipuçları", en: "Parameter hints", de: "Parameterhinweise", ru: "Подсказки параметров", ar: "تلميحات المعاملات", es: "Sugerencias de parámetros", fr: "Aide sur les paramètres", az: "Parametr göstərişləri",
  },
  set_hover: {
    tr: "Üzerine gelince bilgi", en: "Hover information", de: "Hover-Informationen", ru: "Информация при наведении", ar: "معلومات عند التمرير", es: "Información al pasar el cursor", fr: "Infobulles au survol", az: "Üzərinə gələndə məlumat",
  },
  set_rulers: {
    tr: "Cetvel sütunları", en: "Ruler columns", de: "Lineal-Spalten", ru: "Колонки линейки", ar: "أعمدة المسطرة", es: "Columnas de regla", fr: "Colonnes de règle", az: "Xətkeş sütunları",
  },
  set_defaultSnippetsInEditor: {
    tr: "Hazır snippet'leri otomatik tamamlamada göster", en: "Show built-in snippets in completion", de: "Integrierte Snippets in Vervollständigung zeigen", ru: "Показывать встроенные сниппеты в автодополнении", ar: "إظهار المقتطفات المدمجة في الإكمال", es: "Mostrar snippets integrados en el autocompletado", fr: "Afficher les snippets intégrés dans la complétion", az: "Hazır snippetləri tamamlamada göstər",
  },
  set_snippetSuggestions: {
    tr: "Snippet önerilerinin konumu", en: "Snippet suggestion position", de: "Position der Snippet-Vorschläge", ru: "Положение подсказок сниппетов", ar: "موضع اقتراحات المقتطفات", es: "Posición de sugerencias de snippets", fr: "Position des suggestions de snippets", az: "Snippet təkliflərinin yeri",
  },
  set_autoSave: {
    tr: "Otomatik kaydet", en: "Auto save", de: "Automatisch speichern", ru: "Автосохранение", ar: "الحفظ التلقائي", es: "Guardado automático", fr: "Enregistrement automatique", az: "Avtomatik yadda saxla",
  },
  set_autoSaveDelay: {
    tr: "Otomatik kayıt gecikmesi", en: "Auto save delay", de: "Verzögerung beim automatischen Speichern", ru: "Задержка автосохранения", ar: "تأخير الحفظ التلقائي", es: "Retraso del guardado automático", fr: "Délai d’enregistrement automatique", az: "Avtomatik saxlama gecikməsi",
  },
  set_trimTrailingWhitespace: {
    tr: "Kayıtta satır sonu boşluklarını sil", en: "Trim trailing whitespace on save", de: "Nachgestellte Leerzeichen beim Speichern entfernen", ru: "Удалять пробелы в конце строк при сохранении", ar: "حذف المسافات الزائدة عند الحفظ", es: "Recortar espacios finales al guardar", fr: "Supprimer les espaces de fin à l’enregistrement", az: "Saxlayarkən sətir sonu boşluqlarını sil",
  },
  set_insertFinalNewline: {
    tr: "Kayıtta sona boş satır ekle", en: "Insert final newline on save", de: "Beim Speichern abschließenden Zeilenumbruch einfügen", ru: "Добавлять пустую строку в конце при сохранении", ar: "إضافة سطر فارغ أخير عند الحفظ", es: "Insertar salto de línea final al guardar", fr: "Insérer un saut de ligne final à l’enregistrement", az: "Saxlayarkən sona boş sətir əlavə et",
  },
  set_welcomeOnStartup: {
    tr: "Açılışta karşılama sayfasını göster", en: "Show welcome page on startup", de: "Willkommensseite beim Start anzeigen", ru: "Показывать приветствие при запуске", ar: "إظهار صفحة الترحيب عند البدء", es: "Mostrar la página de bienvenida al iniciar", fr: "Afficher la page d’accueil au démarrage", az: "Açılışda xoş gəlmisiniz səhifəsini göstər",
  },
  set_showGitDecorations: {
    tr: "Dosya ağacında Git durumunu göster", en: "Show Git status in file tree", de: "Git-Status im Dateibaum anzeigen", ru: "Показывать статус Git в дереве файлов", ar: "إظهار حالة Git في شجرة الملفات", es: "Mostrar estado de Git en el árbol de archivos", fr: "Afficher l’état Git dans l’arborescence", az: "Fayl ağacında Git statusunu göstər",
  },
  set_terminalFontSize: {
    tr: "Terminal yazı boyutu", en: "Terminal font size", de: "Terminal-Schriftgröße", ru: "Размер шрифта терминала", ar: "حجم خط الطرفية", es: "Tamaño de fuente del terminal", fr: "Taille de police du terminal", az: "Terminal şrift ölçüsü",
  },
  set_defaultShell: {
    tr: "Varsayılan kabuk", en: "Default shell", de: "Standard-Shell", ru: "Оболочка по умолчанию", ar: "الـ shell الافتراضي", es: "Shell predeterminado", fr: "Shell par défaut", az: "Susmaya görə shell",
  },
  set_terminalColorInput: {
    tr: "Komutları renklendir", en: "Colorize commands", de: "Befehle einfärben", ru: "Подсвечивать команды", ar: "تلوين الأوامر", es: "Colorear comandos", fr: "Colorer les commandes", az: "Komandaları rəngləndir",
  },
  set_terminalShowBranch: {
    tr: "İstemde Git dalını göster", en: "Show Git branch in prompt", de: "Git-Branch im Prompt anzeigen", ru: "Показывать ветку Git в приглашении", ar: "إظهار فرع Git في المؤشر", es: "Mostrar rama de Git en el prompt", fr: "Afficher la branche Git dans l’invite", az: "Sətirdə Git budağını göstər",
  },
  set_gitAutoFetch: {
    tr: "Uzak değişiklikleri otomatik getir (fetch)", en: "Automatically fetch remote changes", de: "Remote-Änderungen automatisch abrufen (fetch)", ru: "Автоматически получать изменения (fetch)", ar: "جلب التغييرات البعيدة تلقائيًا (fetch)", es: "Obtener cambios remotos automáticamente (fetch)", fr: "Récupérer automatiquement les changements distants (fetch)", az: "Uzaq dəyişiklikləri avtomatik gətir (fetch)",
  },
  set_gitStatusInterval: {
    tr: "Git durumu yenileme aralığı", en: "Git status refresh interval", de: "Git-Status-Aktualisierungsintervall", ru: "Интервал обновления статуса Git", ar: "فاصل تحديث حالة Git", es: "Intervalo de actualización del estado de Git", fr: "Intervalle d’actualisation de l’état Git", az: "Git statusu yenilənmə intervalı",
  },
  set_gitFetchInterval: {
    tr: "Otomatik fetch aralığı", en: "Auto fetch interval", de: "Intervall für automatisches Fetch", ru: "Интервал автоматического fetch", ar: "فاصل الجلب التلقائي", es: "Intervalo de fetch automático", fr: "Intervalle de fetch automatique", az: "Avtomatik fetch intervalı",
  },
  set_collabEnabled: {
    tr: "Ortak düzenlemeyi aç", en: "Enable collaboration", de: "Zusammenarbeit aktivieren", ru: "Включить совместную работу", ar: "تفعيل التحرير المشترك", es: "Activar colaboración", fr: "Activer la collaboration", az: "Birgə redaktəni aktiv et",
  },
  set_collabUrl: {
    tr: "Sunucu adresi", en: "Server address", de: "Server-Adresse", ru: "Адрес сервера", ar: "عنوان الخادم", es: "Dirección del servidor", fr: "Adresse du serveur", az: "Server ünvanı",
  },
  set_collabToken: {
    tr: "Sunucu token'ı", en: "Server token", de: "Server-Token", ru: "Токен сервера", ar: "رمز الخادم", es: "Token del servidor", fr: "Jeton du serveur", az: "Server tokeni",
  },
  setDesc_themeMode: {
    tr: "Koyu, açık ya da sistem temasını izle. Anında uygulanır.", en: "Dark, light, or follow the system theme. Applies instantly.", de: "Dunkel, hell oder Systemdesign folgen. Wird sofort angewendet.", ru: "Тёмная, светлая или системная тема. Применяется сразу.", ar: "داكن أو فاتح أو اتباع سمة النظام. يُطبَّق فورًا.", es: "Oscuro, claro o seguir el tema del sistema. Se aplica al instante.", fr: "Sombre, clair ou thème du système. S’applique instantanément.", az: "Tünd, açıq və ya sistem temasını izlə. Dərhal tətbiq olunur.",
  },
  setDesc_uiZoom: {
    tr: "Tüm arayüzü eşit ölçekler (%80–150).", en: "Scales the whole interface evenly (80–150%).", de: "Skaliert die gesamte Oberfläche gleichmäßig (80–150 %).", ru: "Равномерно масштабирует весь интерфейс (80–150 %).", ar: "يكبّر الواجهة كلها بشكل متساوٍ (80–150٪).", es: "Escala toda la interfaz por igual (80–150 %).", fr: "Met à l’échelle toute l’interface (80–150 %).", az: "Bütün interfeysi bərabər miqyaslayır (80–150%).",
  },
  setDesc_language: {
    tr: "Otomatik: sistem dilini izler. Değişiklik anında uygulanır.", en: "Automatic follows your system language. Applies instantly.", de: "Automatisch folgt der Systemsprache. Wird sofort angewendet.", ru: "Автоматически — язык системы. Применяется сразу.", ar: "تلقائي يتبع لغة النظام. يُطبَّق فورًا.", es: "Automático sigue el idioma del sistema. Se aplica al instante.", fr: "Automatique suit la langue du système. S’applique instantanément.", az: "Avtomatik sistem dilini izləyir. Dərhal tətbiq olunur.",
  },
  setDesc_editorTheme: {
    tr: "Otomatik: tema moduna göre Nova Dark veya Nova Light.", en: "Automatic: Nova Dark or Nova Light following the color mode.", de: "Automatisch: Nova Dark oder Nova Light je nach Farbmodus.", ru: "Автоматически: Nova Dark или Nova Light по режиму темы.", ar: "تلقائي: Nova Dark أو Nova Light حسب وضع السمة.", es: "Automático: Nova Dark o Nova Light según el modo de color.", fr: "Automatique : Nova Dark ou Nova Light selon le mode.", az: "Avtomatik: tema rejiminə görə Nova Dark və ya Nova Light.",
  },
  setDesc_fontFamilyCustom: {
    tr: "Yüklü bir yazı tipi adı yaz; virgülle yedek ekleyebilirsin.", en: "Enter an installed font name; add fallbacks separated by commas.", de: "Name einer installierten Schrift eingeben; Ersatzschriften mit Komma trennen.", ru: "Введите имя установленного шрифта; запасные — через запятую.", ar: "اكتب اسم خط مثبّت؛ يمكنك إضافة بدائل مفصولة بفواصل.", es: "Escribe el nombre de una fuente instalada; añade alternativas separadas por comas.", fr: "Saisissez le nom d’une police installée ; ajoutez des alternatives séparées par des virgules.", az: "Quraşdırılmış şrift adı yazın; ehtiyatları vergüllə ayırın.",
  },
  setDesc_lineHeight: {
    tr: "0 = yazı boyutundan otomatik. 8'den küçük değerler yazı boyutuyla çarpılır.", en: "0 = automatic from font size. Values below 8 multiply the font size.", de: "0 = automatisch aus der Schriftgröße. Werte unter 8 werden mit der Schriftgröße multipliziert.", ru: "0 = автоматически от размера шрифта. Значения меньше 8 умножаются на размер шрифта.", ar: "0 = تلقائي من حجم الخط. القيم الأقل من 8 تُضرب بحجم الخط.", es: "0 = automático según el tamaño de fuente. Valores menores de 8 multiplican el tamaño.", fr: "0 = automatique selon la taille de police. Les valeurs < 8 multiplient la taille.", az: "0 = şrift ölçüsündən avtomatik. 8-dən kiçik dəyərlər şrift ölçüsünə vurulur.",
  },
  setDesc_rulers: {
    tr: "Dikey cetvel çizgisi sütunları, virgülle (örn: 80, 120).", en: "Vertical ruler columns, comma-separated (e.g. 80, 120).", de: "Spalten für vertikale Lineale, kommagetrennt (z. B. 80, 120).", ru: "Колонки вертикальных линеек через запятую (напр. 80, 120).", ar: "أعمدة خطوط المسطرة العمودية مفصولة بفواصل (مثل 80, 120).", es: "Columnas de reglas verticales separadas por comas (p. ej. 80, 120).", fr: "Colonnes des règles verticales, séparées par des virgules (ex. 80, 120).", az: "Şaquli xətkeş sütunları, vergüllə (məs. 80, 120).",
  },
  setDesc_defaultSnippetsInEditor: {
    tr: "Kapatırsan yalnız kendi snippet'lerin tamamlamada çıkar.", en: "If off, only your own snippets appear in completion.", de: "Wenn aus, erscheinen nur Ihre eigenen Snippets.", ru: "Если выключено, в автодополнении только ваши сниппеты.", ar: "عند الإيقاف تظهر مقتطفاتك الخاصة فقط في الإكمال.", es: "Si se desactiva, solo aparecen tus snippets en el autocompletado.", fr: "Si désactivé, seuls vos snippets apparaissent.", az: "Söndürülərsə yalnız öz snippetləriniz görünür.",
  },
  setDesc_snippetSuggestions: {
    tr: "Snippet önerilerinin diğer önerilere göre sırası.", en: "Where snippet suggestions appear relative to other suggestions.", de: "Position der Snippet-Vorschläge relativ zu anderen Vorschlägen.", ru: "Где показывать сниппеты относительно других подсказок.", ar: "موضع اقتراحات المقتطفات بالنسبة لباقي الاقتراحات.", es: "Dónde aparecen los snippets respecto a otras sugerencias.", fr: "Où apparaissent les snippets par rapport aux autres suggestions.", az: "Snippet təkliflərinin digər təkliflərə nisbətən yeri.",
  },
  setDesc_autoSave: {
    tr: "Gecikmeden sonra: yazmayı bırakınca; odak değişince: başka pencereye geçince.", en: "After delay: when you stop typing; on focus change: when you leave the window.", de: "Nach Verzögerung: wenn Sie aufhören zu tippen; bei Fokuswechsel: beim Verlassen des Fensters.", ru: "После задержки — когда перестали печатать; при потере фокуса — при уходе из окна.", ar: "بعد تأخير: عند التوقف عن الكتابة؛ عند تغيير التركيز: عند مغادرة النافذة.", es: "Tras un retraso: al dejar de escribir; al cambiar el foco: al salir de la ventana.", fr: "Après un délai : quand vous arrêtez de taper ; au changement de focus : en quittant la fenêtre.", az: "Gecikmədən sonra: yazmağı dayandırdıqda; fokus dəyişəndə: pəncərədən çıxdıqda.",
  },
  setDesc_autoSaveDelay: {
    tr: "Yazmayı bıraktıktan kaç ms sonra kaydedilsin.", en: "Milliseconds after you stop typing before saving.", de: "Millisekunden nach dem letzten Tastendruck bis zum Speichern.", ru: "Через сколько мс после остановки ввода сохранять.", ar: "عدد الميلي ثانية بعد التوقف عن الكتابة قبل الحفظ.", es: "Milisegundos tras dejar de escribir antes de guardar.", fr: "Millisecondes après l’arrêt de la saisie avant l’enregistrement.", az: "Yazmağı dayandırdıqdan neçə ms sonra saxlanılsın.",
  },
  setDesc_trimTrailingWhitespace: {
    tr: "Yalnız kaydederken uygulanır; dosya içeriğini değiştirir.", en: "Applied only when saving; it changes the file content.", de: "Wird nur beim Speichern angewendet; ändert den Dateiinhalt.", ru: "Применяется только при сохранении; изменяет содержимое файла.", ar: "يُطبَّق عند الحفظ فقط؛ ويغيّر محتوى الملف.", es: "Se aplica solo al guardar; modifica el contenido del archivo.", fr: "Appliqué uniquement à l’enregistrement ; modifie le contenu du fichier.", az: "Yalnız saxlayarkən tətbiq olunur; fayl məzmununu dəyişir.",
  },
  setDesc_terminalColorInput: {
    tr: "Komut, bayrak, metin ve değişkenleri farklı renklerle gösterir.", en: "Shows commands, flags, strings and variables in different colors.", de: "Zeigt Befehle, Flags, Zeichenketten und Variablen farbig.", ru: "Показывает команды, флаги, строки и переменные разными цветами.", ar: "يعرض الأوامر والخيارات والنصوص والمتغيرات بألوان مختلفة.", es: "Muestra comandos, flags, cadenas y variables en distintos colores.", fr: "Affiche commandes, options, chaînes et variables en couleurs.", az: "Komanda, bayraq, mətn və dəyişənləri müxtəlif rənglərdə göstərir.",
  },
  setDesc_gitStatusInterval: {
    tr: "Terminalde yapılan değişiklikler dışında .git izleyicisi zaten anlıktır.", en: "The .git watcher is already instant; this is a fallback poll.", de: "Der .git-Watcher ist bereits sofort; dies ist eine Ersatzabfrage.", ru: "Наблюдатель .git и так мгновенный; это резервный опрос.", ar: "مراقب .git فوري أصلًا؛ هذا استعلام احتياطي.", es: "El observador de .git ya es instantáneo; esto es un sondeo de respaldo.", fr: "L’observateur .git est déjà instantané ; ceci est un sondage de secours.", az: ".git izləyicisi onsuz da ani işləyir; bu ehtiyat sorğusudur.",
  },
  setDesc_gitFetchInterval: {
    tr: "Uzak depodaki yeni commit'lerin (↑↓) ne sıklıkla kontrol edileceği.", en: "How often to check the remote for new commits (↑↓).", de: "Wie oft das Remote auf neue Commits (↑↓) geprüft wird.", ru: "Как часто проверять удалённый репозиторий на новые коммиты (↑↓).", ar: "عدد مرات التحقق من المستودع البعيد بحثًا عن commits جديدة (↑↓).", es: "Con qué frecuencia comprobar el remoto en busca de commits nuevos (↑↓).", fr: "Fréquence de vérification du dépôt distant (↑↓).", az: "Uzaq depoda yeni commitlərin (↑↓) nə qədər tez yoxlanılacağı.",
  },
  setDesc_collabUrl: {
    tr: "Yalnız kendi sunucun. Dosya içeriği yalnız bu adrese gönderilir.", en: "Your own server only. File contents are sent only to this address.", de: "Nur Ihr eigener Server. Dateiinhalte gehen nur an diese Adresse.", ru: "Только ваш сервер. Содержимое файлов отправляется только на этот адрес.", ar: "خادمك الخاص فقط. يُرسل محتوى الملفات إلى هذا العنوان فقط.", es: "Solo tu propio servidor. El contenido de los archivos se envía solo a esta dirección.", fr: "Uniquement votre serveur. Le contenu des fichiers n’est envoyé qu’à cette adresse.", az: "Yalnız öz serveriniz. Fayl məzmunu yalnız bu ünvana göndərilir.",
  },
  setDesc_collabToken: {
    tr: "Cihazda şifreli saklanır (kayıt: ana süreç, düz metin yok).", en: "Stored encrypted on this device (main process, never plain text).", de: "Verschlüsselt auf diesem Gerät gespeichert (Hauptprozess, nie im Klartext).", ru: "Хранится на устройстве в зашифрованном виде (основной процесс, не в открытом виде).", ar: "يُخزَّن مشفرًا على هذا الجهاز (العملية الرئيسية، لا نص عادي).", es: "Se guarda cifrado en este dispositivo (proceso principal, nunca en texto plano).", fr: "Stocké chiffré sur cet appareil (processus principal, jamais en clair).", az: "Bu cihazda şifrələnmiş saxlanılır (əsas proses, açıq mətn yoxdur).",
  },
  snipUser: {
    tr: "Özel snippet'lerim", en: "My snippets", de: "Meine Snippets", ru: "Мои сниппеты", ar: "مقتطفاتي", es: "Mis snippets", fr: "Mes snippets", az: "Xüsusi snippetlərim",
  },
  snipAdd: {
    tr: "Snippet ekle", en: "Add snippet", de: "Snippet hinzufügen", ru: "Добавить сниппет", ar: "إضافة مقتطف", es: "Añadir snippet", fr: "Ajouter un snippet", az: "Snippet əlavə et",
  },
  snipEdit: {
    tr: "Düzenle", en: "Edit", de: "Bearbeiten", ru: "Изменить", ar: "تعديل", es: "Editar", fr: "Modifier", az: "Redaktə et",
  },
  snipPrefix: {
    tr: "Tetikleyici (boşluksuz)", en: "Trigger (no spaces)", de: "Auslöser (ohne Leerzeichen)", ru: "Триггер (без пробелов)", ar: "المُشغّل (بدون مسافات)", es: "Disparador (sin espacios)", fr: "Déclencheur (sans espaces)", az: "Tətik (boşluqsuz)",
  },
  snipDescription: {
    tr: "Açıklama", en: "Description", de: "Beschreibung", ru: "Описание", ar: "الوصف", es: "Descripción", fr: "Description", az: "Təsvir",
  },
  snipLanguage: {
    tr: "Dil", en: "Language", de: "Sprache", ru: "Язык", ar: "اللغة", es: "Idioma", fr: "Langage", az: "Dil",
  },
  snipLanguageAll: {
    tr: "Tüm diller", en: "All languages", de: "Alle Sprachen", ru: "Все языки", ar: "كل اللغات", es: "Todos los idiomas", fr: "Tous les langages", az: "Bütün dillər",
  },
  snipBody: {
    tr: "İçerik", en: "Body", de: "Inhalt", ru: "Содержимое", ar: "المحتوى", es: "Contenido", fr: "Contenu", az: "Məzmun",
  },
  snipSave: {
    tr: "Snippet'i kaydet", en: "Save snippet", de: "Snippet speichern", ru: "Сохранить сниппет", ar: "حفظ المقتطف", es: "Guardar snippet", fr: "Enregistrer le snippet", az: "Snippeti saxla",
  },
  snipDelete: {
    tr: "Sil", en: "Delete", de: "Löschen", ru: "Удалить", ar: "حذف", es: "Eliminar", fr: "Supprimer", az: "Sil",
  },
  snipEmpty: {
    tr: "Henüz özel snippet yok.", en: "No custom snippets yet.", de: "Noch keine eigenen Snippets.", ru: "Своих сниппетов пока нет.", ar: "لا توجد مقتطفات مخصصة بعد.", es: "Aún no hay snippets personalizados.", fr: "Aucun snippet personnalisé pour l’instant.", az: "Hələ xüsusi snippet yoxdur.",
  },
  snipHelp: {
    tr: "Sekme duraklarını $1, $2 veya ${1:varsayılan} ile yaz; $0 son imleç konumudur. Yazarken tetikleyiciyi yazıp Tab/Enter'a bas.", en: "Use tab stops like $1, $2 or ${1:default}; $0 is the final cursor position. Type the trigger and press Tab/Enter.", de: "Tabstopps wie $1, $2 oder ${1:Standard}; $0 ist die Endposition. Auslöser tippen und Tab/Enter drücken.", ru: "Используйте позиции $1, $2 или ${1:по умолчанию}; $0 — конечная позиция. Введите триггер и нажмите Tab/Enter.", ar: "استخدم نقاط التوقف مثل $1 و$2 أو ${1:افتراضي}؛ $0 موضع المؤشر النهائي. اكتب المُشغّل واضغط Tab/Enter.", es: "Usa paradas como $1, $2 o ${1:valor}; $0 es la posición final. Escribe el disparador y pulsa Tab/Enter.", fr: "Utilisez des arrêts $1, $2 ou ${1:défaut} ; $0 est la position finale. Tapez le déclencheur puis Tab/Entrée.", az: "Tab dayanacaqlarını $1, $2 və ya ${1:ilkin} kimi yazın; $0 son kursor yeridir. Tətiki yazıb Tab/Enter basın.",
  },
  snipBuiltinCount: {
    tr: "{n} hazır snippet de kullanılabilir.", en: "{n} built-in snippets are also available.", de: "{n} integrierte Snippets sind ebenfalls verfügbar.", ru: "Также доступно {n} встроенных сниппетов.", ar: "تتوفر أيضًا {n} مقتطفات مدمجة.", es: "También hay {n} snippets integrados.", fr: "{n} snippets intégrés sont aussi disponibles.", az: "{n} hazır snippet də mövcuddur.",
  },
  snipInvalid: {
    tr: "Tetikleyici ve içerik zorunlu; tetikleyicide boşluk olmamalı.", en: "Trigger and body are required; the trigger cannot contain spaces.", de: "Auslöser und Inhalt sind Pflicht; der Auslöser darf keine Leerzeichen enthalten.", ru: "Триггер и содержимое обязательны; в триггере не должно быть пробелов.", ar: "المُشغّل والمحتوى مطلوبان؛ ولا يجوز أن يحتوي المُشغّل على مسافات.", es: "Disparador y contenido son obligatorios; el disparador no puede tener espacios.", fr: "Le déclencheur et le contenu sont obligatoires ; pas d’espaces dans le déclencheur.", az: "Tətik və məzmun məcburidir; tətikdə boşluq olmamalıdır.",
  },
  scSave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Yadda saxla",
  },
  scNextTab: {
    tr: "Sonraki / önceki sekme", en: "Next / previous tab", de: "Nächster / vorheriger Tab", ru: "Следующая / предыдущая вкладка", ar: "علامة التبويب التالية / السابقة", es: "Pestaña siguiente / anterior", fr: "Onglet suivant / précédent", az: "Növbəti / əvvəlki vərəq",
  },
  scToggleSidebar: {
    tr: "Kenar çubuğunu aç/kapat", en: "Toggle sidebar", de: "Seitenleiste ein-/ausblenden", ru: "Показать/скрыть боковую панель", ar: "إظهار/إخفاء الشريط الجانبي", es: "Mostrar/ocultar barra lateral", fr: "Afficher/masquer la barre latérale", az: "Yan paneli göstər/gizlət",
  },
  scToggleTerminal: {
    tr: "Terminali aç/kapat", en: "Toggle terminal", de: "Terminal ein-/ausblenden", ru: "Показать/скрыть терминал", ar: "إظهار/إخفاء الطرفية", es: "Mostrar/ocultar terminal", fr: "Afficher/masquer le terminal", az: "Terminalı göstər/gizlət",
  },
  scClearTerminal: {
    tr: "Terminali temizle", en: "Clear terminal", de: "Terminal leeren", ru: "Очистить терминал", ar: "مسح الطرفية", es: "Limpiar terminal", fr: "Effacer le terminal", az: "Terminalı təmizlə",
  },
  aboutVersion: {
    tr: "Sürüm", en: "Version", de: "Version", ru: "Версия", ar: "الإصدار", es: "Versión", fr: "Version", az: "Versiya",
  },
  aboutRuntime: {
    tr: "Çalışma ortamı", en: "Runtime", de: "Laufzeit", ru: "Среда выполнения", ar: "بيئة التشغيل", es: "Entorno de ejecución", fr: "Environnement d’exécution", az: "İcra mühiti",
  },
  aboutStorage: {
    tr: "Ayarlar yalnız bu cihazda saklanır ve hiçbir yere gönderilmez. Ortak düzenleme token'ı şifreli tutulur; dışa aktarılan dosyaya girmez.", en: "Settings stay on this device and are never sent anywhere. The collaboration token is stored encrypted and is not included in exports.", de: "Einstellungen bleiben auf diesem Gerät und werden nirgends hingesendet. Das Kollaborations-Token ist verschlüsselt und nicht im Export enthalten.", ru: "Настройки хранятся только на этом устройстве и никуда не отправляются. Токен совместной работы зашифрован и не попадает в экспорт.", ar: "تبقى الإعدادات على هذا الجهاز ولا تُرسل إلى أي مكان. رمز التحرير المشترك مشفّر ولا يدخل في التصدير.", es: "Los ajustes permanecen en este dispositivo y no se envían a ningún sitio. El token de colaboración se guarda cifrado y no se incluye en la exportación.", fr: "Les paramètres restent sur cet appareil et ne sont envoyés nulle part. Le jeton de collaboration est chiffré et exclu de l’export.", az: "Parametrlər yalnız bu cihazda qalır və heç yerə göndərilmir. Birgə redaktə tokeni şifrələnir və ixraca daxil edilmir.",
  },
  aboutDocs: {
    tr: "Dökümantasyon", en: "Documentation", de: "Dokumentation", ru: "Документация", ar: "التوثيق", es: "Documentación", fr: "Documentation", az: "Sənədləşdirmə",
  },
  setTokenSaved: {
    tr: "Token şifreli kaydedildi.", en: "Token saved (encrypted).", de: "Token verschlüsselt gespeichert.", ru: "Токен сохранён (зашифрован).", ar: "تم حفظ الرمز (مشفّر).", es: "Token guardado (cifrado).", fr: "Jeton enregistré (chiffré).", az: "Token şifrələnmiş saxlanıldı.",
  },
  setTokenNoEnc: {
    tr: "Bu cihazda şifreli depolama yok; token saklanamadı (yalnız bu oturumda geçerli).", en: "Encrypted storage is unavailable; the token could not be saved (valid for this session only).", de: "Verschlüsselter Speicher nicht verfügbar; Token nicht gespeichert (nur für diese Sitzung gültig).", ru: "Зашифрованное хранилище недоступно; токен не сохранён (действует только в этом сеансе).", ar: "التخزين المشفّر غير متاح؛ لم يُحفظ الرمز (صالح لهذه الجلسة فقط).", es: "El almacenamiento cifrado no está disponible; el token no se guardó (válido solo en esta sesión).", fr: "Le stockage chiffré est indisponible ; jeton non enregistré (valable pour cette session seulement).", az: "Şifrəli saxlama yoxdur; token saxlanılmadı (yalnız bu sessiya üçün).",
  },
  set_sidebarPosition: {
    tr: "Kenar çubuğu konumu", en: "Sidebar position", de: "Position der Seitenleiste", ru: "Положение боковой панели", ar: "موضع الشريط الجانبي", es: "Posición de la barra lateral", fr: "Position de la barre latérale", az: "Yan panelin yeri",
  },
  set_activityBarVisible: {
    tr: "Etkinlik çubuğunu göster", en: "Show activity bar", de: "Aktivitätsleiste anzeigen", ru: "Показывать панель действий", ar: "إظهار شريط الأنشطة", es: "Mostrar barra de actividad", fr: "Afficher la barre d’activité", az: "Fəaliyyət panelini göstər",
  },
  set_statusBarVisible: {
    tr: "Durum çubuğunu göster", en: "Show status bar", de: "Statusleiste anzeigen", ru: "Показывать строку состояния", ar: "إظهار شريط الحالة", es: "Mostrar barra de estado", fr: "Afficher la barre d’état", az: "Status panelini göstər",
  },
  set_showBreadcrumbs: {
    tr: "Dosya yolu göstergesi (breadcrumb)", en: "File path breadcrumbs", de: "Dateipfad-Breadcrumbs", ru: "Хлебные крошки пути файла", ar: "مسار الملف (breadcrumbs)", es: "Ruta de navegación del archivo", fr: "Fil d’Ariane du chemin", az: "Fayl yolu göstəricisi",
  },
  set_showOpenEditors: {
    tr: "Gezginde \"Açık düzenleyiciler\"", en: "\"Open editors\" in Explorer", de: "„Geöffnete Editoren“ im Explorer", ru: "«Открытые редакторы» в проводнике", ar: "\"المحررات المفتوحة\" في المستكشف", es: "«Editores abiertos» en el explorador", fr: "« Éditeurs ouverts » dans l’explorateur", az: "Kəşfiyyatçıda \"Açıq redaktorlar\"",
  },
  set_treeDensity: {
    tr: "Ağaç satır yüksekliği", en: "Tree row density", de: "Zeilendichte im Baum", ru: "Плотность строк дерева", ar: "كثافة صفوف الشجرة", es: "Densidad de filas del árbol", fr: "Densité des lignes de l’arbre", az: "Ağac sətir sıxlığı",
  },
  set_treeIndentGuides: {
    tr: "Girinti kılavuz çizgileri (ağaç)", en: "Indent guides (tree)", de: "Einzugslinien (Baum)", ru: "Направляющие отступов (дерево)", ar: "خطوط المسافات البادئة (الشجرة)", es: "Guías de sangría (árbol)", fr: "Repères d’indentation (arbre)", az: "Girinti xətləri (ağac)",
  },
  set_terminalLineHeight: {
    tr: "Terminal satır yüksekliği", en: "Terminal line height", de: "Terminal-Zeilenhöhe", ru: "Высота строки терминала", ar: "ارتفاع سطر الطرفية", es: "Altura de línea del terminal", fr: "Hauteur de ligne du terminal", az: "Terminal sətir hündürlüyü",
  },
  set_terminalScrollback: {
    tr: "Terminal geçmiş sınırı (karakter)", en: "Terminal scrollback (characters)", de: "Terminal-Verlauf (Zeichen)", ru: "История терминала (символы)", ar: "سجل الطرفية (أحرف)", es: "Historial del terminal (caracteres)", fr: "Historique du terminal (caractères)", az: "Terminal tarixçəsi (simvol)",
  },
  set_terminalCursor: {
    tr: "Terminal imleç şekli", en: "Terminal cursor shape", de: "Terminal-Cursorform", ru: "Форма курсора терминала", ar: "شكل مؤشر الطرفية", es: "Forma del cursor del terminal", fr: "Forme du curseur du terminal", az: "Terminal kursor forması",
  },
  optLeft: {
    tr: "Sol", en: "Left", de: "Links", ru: "Слева", ar: "يسار", es: "Izquierda", fr: "Gauche", az: "Sol",
  },
  optRight: {
    tr: "Sağ", en: "Right", de: "Rechts", ru: "Справа", ar: "يمين", es: "Derecha", fr: "Droite", az: "Sağ",
  },
  optCompact: {
    tr: "Sıkı", en: "Compact", de: "Kompakt", ru: "Компактно", ar: "مضغوط", es: "Compacta", fr: "Compacte", az: "Sıx",
  },
  optComfortable: {
    tr: "Rahat", en: "Comfortable", de: "Komfortabel", ru: "Свободно", ar: "مريح", es: "Cómoda", fr: "Confortable", az: "Rahat",
  },
  termTab: {
    tr: "Terminal", en: "Terminal", de: "Terminal", ru: "Терминал", ar: "الطرفية", es: "Terminal", fr: "Terminal", az: "Terminal",
  },
  termNew: {
    tr: "Yeni terminal", en: "New terminal", de: "Neues Terminal", ru: "Новый терминал", ar: "طرفية جديدة", es: "Nuevo terminal", fr: "Nouveau terminal", az: "Yeni terminal",
  },
  termKill: {
    tr: "Terminali sonlandır", en: "Kill terminal", de: "Terminal beenden", ru: "Завершить терминал", ar: "إنهاء الطرفية", es: "Terminar terminal", fr: "Arrêter le terminal", az: "Terminalı sonlandır",
  },
  termMaximize: {
    tr: "Paneli büyüt", en: "Maximize panel", de: "Panel maximieren", ru: "Развернуть панель", ar: "تكبير اللوحة", es: "Maximizar panel", fr: "Agrandir le panneau", az: "Paneli böyüt",
  },
  termRestore: {
    tr: "Paneli küçült", en: "Restore panel size", de: "Panelgröße wiederherstellen", ru: "Восстановить размер панели", ar: "استعادة حجم اللوحة", es: "Restaurar tamaño del panel", fr: "Restaurer la taille du panneau", az: "Panelin ölçüsünü bərpa et",
  },
  termClosePanel: {
    tr: "Paneli kapat", en: "Close panel", de: "Panel schließen", ru: "Закрыть панель", ar: "إغلاق اللوحة", es: "Cerrar panel", fr: "Fermer le panneau", az: "Paneli bağla",
  },
  termPickShell: {
    tr: "Kabuk seç", en: "Select shell", de: "Shell auswählen", ru: "Выбрать оболочку", ar: "اختيار الـ shell", es: "Seleccionar shell", fr: "Choisir le shell", az: "Shell seç",
  },
  termEnded: {
    tr: "Süreç sonlandı (kod {code}). Yeni bir terminal açabilirsin.", en: "Process ended (code {code}). You can open a new terminal.", de: "Prozess beendet (Code {code}). Sie können ein neues Terminal öffnen.", ru: "Процесс завершён (код {code}). Можно открыть новый терминал.", ar: "انتهت العملية (الرمز {code}). يمكنك فتح طرفية جديدة.", es: "Proceso finalizado (código {code}). Puedes abrir un terminal nuevo.", fr: "Processus terminé (code {code}). Vous pouvez ouvrir un nouveau terminal.", az: "Proses bitdi (kod {code}). Yeni terminal aça bilərsiniz.",
  },
  termTooMany: {
    tr: "En fazla 12 terminal açılabilir.", en: "You can open up to 12 terminals.", de: "Es können bis zu 12 Terminals geöffnet werden.", ru: "Можно открыть не более 12 терминалов.", ar: "يمكن فتح 12 طرفية كحد أقصى.", es: "Se pueden abrir hasta 12 terminales.", fr: "Vous pouvez ouvrir jusqu’à 12 terminaux.", az: "Ən çoxu 12 terminal açıla bilər.",
  },
  expOpenEditors: {
    tr: "Açık düzenleyiciler", en: "Open editors", de: "Geöffnete Editoren", ru: "Открытые редакторы", ar: "المحررات المفتوحة", es: "Editores abiertos", fr: "Éditeurs ouverts", az: "Açıq redaktorlar",
  },
  expNewFolder: {
    tr: "Yeni klasör", en: "New folder", de: "Neuer Ordner", ru: "Новая папка", ar: "مجلد جديد", es: "Nueva carpeta", fr: "Nouveau dossier", az: "Yeni qovluq",
  },
  expRefresh: {
    tr: "Yenile", en: "Refresh", de: "Aktualisieren", ru: "Обновить", ar: "تحديث", es: "Actualizar", fr: "Actualiser", az: "Yenilə",
  },
  expCollapseAll: {
    tr: "Hepsini daralt", en: "Collapse all", de: "Alle zuklappen", ru: "Свернуть все", ar: "طي الكل", es: "Contraer todo", fr: "Tout réduire", az: "Hamısını yığ",
  },
  expMore: {
    tr: "Diğer eylemler", en: "More actions", de: "Weitere Aktionen", ru: "Другие действия", ar: "إجراءات أخرى", es: "Más acciones", fr: "Plus d’actions", az: "Digər əməliyyatlar",
  },
  expRename: {
    tr: "Yeniden adlandır", en: "Rename", de: "Umbenennen", ru: "Переименовать", ar: "إعادة تسمية", es: "Cambiar nombre", fr: "Renommer", az: "Adını dəyiş",
  },
  expDelete: {
    tr: "Sil", en: "Delete", de: "Löschen", ru: "Удалить", ar: "حذف", es: "Eliminar", fr: "Supprimer", az: "Sil",
  },
  expCopyPath: {
    tr: "Yolu kopyala", en: "Copy path", de: "Pfad kopieren", ru: "Копировать путь", ar: "نسخ المسار", es: "Copiar ruta", fr: "Copier le chemin", az: "Yolu kopyala",
  },
  expCopyRelPath: {
    tr: "Göreli yolu kopyala", en: "Copy relative path", de: "Relativen Pfad kopieren", ru: "Копировать относительный путь", ar: "نسخ المسار النسبي", es: "Copiar ruta relativa", fr: "Copier le chemin relatif", az: "Nisbi yolu kopyala",
  },
  expNoFolder: {
    tr: "Henüz bir klasör açmadınız.", en: "You have not opened a folder yet.", de: "Sie haben noch keinen Ordner geöffnet.", ru: "Вы ещё не открыли папку.", ar: "لم تفتح مجلدًا بعد.", es: "Aún no has abierto una carpeta.", fr: "Vous n’avez pas encore ouvert de dossier.", az: "Hələ qovluq açmamısınız.",
  },
  expLoading: {
    tr: "Yükleniyor...", en: "Loading...", de: "Wird geladen...", ru: "Загрузка...", ar: "جارٍ التحميل...", es: "Cargando...", fr: "Chargement...", az: "Yüklənir...",
  },
  expDeleteConfirm: {
    tr: "\"{name}\" kalıcı olarak silinsin mi?", en: "Permanently delete \"{name}\"?", de: "„{name}“ endgültig löschen?", ru: "Удалить «{name}» навсегда?", ar: "هل تريد حذف \"{name}\" نهائيًا؟", es: "¿Eliminar «{name}» de forma permanente?", fr: "Supprimer définitivement « {name} » ?", az: "\"{name}\" həmişəlik silinsin?",
  },
  expFilePlaceholder: {
    tr: "Dosya adı, Enter ile oluştur", en: "File name, press Enter to create", de: "Dateiname, mit Enter erstellen", ru: "Имя файла, Enter для создания", ar: "اسم الملف، اضغط Enter للإنشاء", es: "Nombre de archivo, Enter para crear", fr: "Nom du fichier, Entrée pour créer", az: "Fayl adı, yaratmaq üçün Enter",
  },
  expFolderPlaceholder: {
    tr: "Klasör adı, Enter ile oluştur", en: "Folder name, press Enter to create", de: "Ordnername, mit Enter erstellen", ru: "Имя папки, Enter для создания", ar: "اسم المجلد، اضغط Enter للإنشاء", es: "Nombre de carpeta, Enter para crear", fr: "Nom du dossier, Entrée pour créer", az: "Qovluq adı, yaratmaq üçün Enter",
  },
  expInvalidName: {
    tr: "Geçersiz ad: / \\ ve boş ad kullanılamaz.", en: "Invalid name: \"/\", \"\\\" and empty names are not allowed.", de: "Ungültiger Name: „/“, „\\“ und leere Namen sind nicht erlaubt.", ru: "Недопустимое имя: «/», «\\» и пустые имена запрещены.", ar: "اسم غير صالح: لا يُسمح بـ \"/\" و\"\\\" والأسماء الفارغة.", es: "Nombre no válido: no se permiten «/», «\\» ni nombres vacíos.", fr: "Nom invalide : « / », « \\ » et les noms vides sont interdits.", az: "Yanlış ad: \"/\", \"\\\" və boş ad olmaz.",
  },
  expCloseEditor: {
    tr: "Düzenleyiciyi kapat", en: "Close editor", de: "Editor schließen", ru: "Закрыть редактор", ar: "إغلاق المحرر", es: "Cerrar editor", fr: "Fermer l’éditeur", az: "Redaktoru bağla",
  },
  actSearch: {
    tr: "Ara", en: "Search", de: "Suchen", ru: "Поиск", ar: "بحث", es: "Buscar", fr: "Rechercher", az: "Axtar",
  },
  setCatAI: {
    tr: "Yapay Zekâ", en: "AI Assistant", de: "KI-Assistent", ru: "ИИ-ассистент", ar: "المساعد الذكي", es: "Asistente IA", fr: "Assistant IA", az: "Süni intellekt",
  },
  optAiAsk: {
    tr: "Sor", en: "Ask", de: "Fragen", ru: "Вопрос", ar: "اسأل", es: "Preguntar", fr: "Demander", az: "Soruş",
  },
  optAiAgent: {
    tr: "Ajan", en: "Agent", de: "Agent", ru: "Агент", ar: "وكيل", es: "Agente", fr: "Agent", az: "Agent",
  },
  set_aiProvider: {
    tr: "Sağlayıcı", en: "Provider", de: "Anbieter", ru: "Провайдер", ar: "المزوّد", es: "Proveedor", fr: "Fournisseur", az: "Provayder",
  },
  setDesc_aiProvider: {
    tr: "Kodun ve sohbetin bu sağlayıcıya gönderilir (yurt dışı aktarım olabilir). Ollama yerel çalışır, veri cihazdan çıkmaz.", en: "Your code and chat are sent to this provider (may be a cross-border transfer). Ollama runs locally and nothing leaves your device.", de: "Code und Chat werden an diesen Anbieter gesendet (ggf. Drittlandübermittlung). Ollama läuft lokal, nichts verlässt dein Gerät.", ru: "Код и чат отправляются этому провайдеру (возможна трансграничная передача). Ollama работает локально, данные не покидают устройство.", ar: "يُرسل الكود والمحادثة إلى هذا المزوّد (قد يكون نقلاً عبر الحدود). يعمل Ollama محلياً ولا تغادر البيانات جهازك.", es: "Tu código y el chat se envían a este proveedor (puede haber transferencia internacional). Ollama funciona en local y nada sale de tu dispositivo.", fr: "Ton code et le chat sont envoyés à ce fournisseur (transfert hors UE possible). Ollama fonctionne en local, rien ne quitte ton appareil.", az: "Kodun və söhbətin bu provayderə göndərilir (xaricə ötürmə ola bilər). Ollama lokal işləyir, məlumat cihazdan çıxmır.",
  },
  set_aiModel: {
    tr: "Model", en: "Model", de: "Modell", ru: "Модель", ar: "النموذج", es: "Modelo", fr: "Modèle", az: "Model",
  },
  setDesc_aiModel: {
    tr: "Boş bırakırsan sağlayıcının varsayılan modeli kullanılır.", en: "Leave empty to use the provider default model.", de: "Leer lassen, um das Standardmodell des Anbieters zu nutzen.", ru: "Оставь пустым, чтобы использовать модель по умолчанию.", ar: "اتركه فارغاً لاستخدام النموذج الافتراضي للمزوّد.", es: "Déjalo vacío para usar el modelo predeterminado del proveedor.", fr: "Laisse vide pour utiliser le modèle par défaut du fournisseur.", az: "Boş buraxsan provayderin standart modeli işlədilir.",
  },
  set_aiBaseUrl: {
    tr: "Özel adres", en: "Custom endpoint", de: "Eigener Endpunkt", ru: "Свой адрес", ar: "عنوان مخصص", es: "Endpoint personalizado", fr: "Point d’accès personnalisé", az: "Xüsusi ünvan",
  },
  setDesc_aiBaseUrl: {
    tr: "İsteğe bağlı. Yalnız https:// (yerelde http://localhost) kabul edilir. API anahtarın bu adrese gönderilir; güvendiğin bir adres gir.", en: "Optional. Only https:// (or http://localhost) is accepted. Your API key is sent to this address; use one you trust.", de: "Optional. Nur https:// (oder http://localhost). Dein API-Schlüssel wird an diese Adresse gesendet; nutze nur vertrauenswürdige.", ru: "Необязательно. Только https:// (или http://localhost). Ключ API отправляется на этот адрес — используй доверенный.", ar: "اختياري. يُقبل https:// فقط (أو http://localhost). يُرسل مفتاح API إلى هذا العنوان، فاستخدم عنواناً موثوقاً.", es: "Opcional. Solo https:// (o http://localhost). Tu clave API se envía a esta dirección; usa una de confianza.", fr: "Facultatif. Seulement https:// (ou http://localhost). Ta clé API est envoyée à cette adresse ; choisis-en une de confiance.", az: "İstəyə bağlı. Yalnız https:// (və ya http://localhost). API açarın bu ünvana göndərilir; etibar etdiyin ünvan yaz.",
  },
  set_aiDefaultMode: {
    tr: "Varsayılan mod", en: "Default mode", de: "Standardmodus", ru: "Режим по умолчанию", ar: "الوضع الافتراضي", es: "Modo predeterminado", fr: "Mode par défaut", az: "Standart rejim",
  },
  set_aiIncludeContext: {
    tr: "Açık dosyayı bağlam olarak gönder", en: "Send the open file as context", de: "Geöffnete Datei als Kontext senden", ru: "Отправлять открытый файл как контекст", ar: "إرسال الملف المفتوح كسياق", es: "Enviar el archivo abierto como contexto", fr: "Envoyer le fichier ouvert comme contexte", az: "Açıq faylı kontekst kimi göndər",
  },
  setDesc_aiIncludeContext: {
    tr: "Seçili kod (yoksa dosyanın başı) her mesajla sağlayıcıya gider. Kapatırsan yalnız yazdığın metin gider.", en: "The selected code (or the start of the file) goes to the provider with each message. If off, only what you type is sent.", de: "Der markierte Code (sonst der Dateianfang) wird mit jeder Nachricht gesendet. Aus: nur dein Text.", ru: "Выделенный код (или начало файла) уходит с каждым сообщением. Если выключено — только твой текст.", ar: "يُرسل الكود المحدد (أو بداية الملف) مع كل رسالة. عند الإيقاف يُرسل نصك فقط.", es: "El código seleccionado (o el inicio del archivo) se envía con cada mensaje. Si lo desactivas, solo lo que escribes.", fr: "Le code sélectionné (ou le début du fichier) part avec chaque message. Désactivé : seulement ton texte.", az: "Seçilmiş kod (yoxsa faylın başı) hər mesajla göndərilir. Söndürsən yalnız yazdığın mətn gedər.",
  },
  set_aiAutoApproveEdits: {
    tr: "Dosya düzenlemelerini otomatik onayla", en: "Auto-approve file edits", de: "Dateiänderungen automatisch genehmigen", ru: "Автоматически одобрять правки файлов", ar: "الموافقة تلقائياً على تعديلات الملفات", es: "Aprobar ediciones de archivos automáticamente", fr: "Approuver automatiquement les modifications", az: "Fayl dəyişikliklərini avtomatik təsdiqlə",
  },
  setDesc_aiAutoApproveEdits: {
    tr: "Ajan modunda dosya yazma ve düzenleme sorulmadan yapılır. Komut çalıştırma her zaman onay ister. Önerilmez.", en: "In Agent mode, file writes and edits happen without asking. Running commands always asks. Not recommended.", de: "Im Agent-Modus werden Dateien ohne Rückfrage geschrieben. Befehle fragen immer nach. Nicht empfohlen.", ru: "В режиме агента файлы меняются без вопросов. Команды всегда требуют подтверждения. Не рекомендуется.", ar: "في وضع الوكيل تُكتب الملفات وتُعدَّل دون سؤال. تشغيل الأوامر يطلب الموافقة دائماً. غير موصى به.", es: "En modo Agente, los archivos se escriben sin preguntar. Los comandos siempre piden confirmación. No recomendado.", fr: "En mode Agent, les fichiers sont modifiés sans demander. Les commandes demandent toujours. Déconseillé.", az: "Agent rejimində fayllar soruşulmadan dəyişir. Komandalar həmişə təsdiq istəyir. Tövsiyə olunmur.",
  },
  set_aiAllowCommands: {
    tr: "Ajan komut çalıştırabilsin", en: "Let the agent run commands", de: "Agent darf Befehle ausführen", ru: "Разрешить агенту запускать команды", ar: "السماح للوكيل بتشغيل الأوامر", es: "Permitir que el agente ejecute comandos", fr: "Autoriser l’agent à exécuter des commandes", az: "Agent komanda işlədə bilsin",
  },
  setDesc_aiAllowCommands: {
    tr: "Her komut çalışmadan önce onayına sunulur.", en: "Every command is shown for your approval before it runs.", de: "Jeder Befehl wird vor der Ausführung zur Genehmigung angezeigt.", ru: "Каждая команда показывается на подтверждение перед запуском.", ar: "يُعرض كل أمر للموافقة قبل تشغيله.", es: "Cada comando se muestra para tu aprobación antes de ejecutarse.", fr: "Chaque commande t’est soumise avant son exécution.", az: "Hər komanda işləməzdən əvvəl təsdiqinə təqdim olunur.",
  },
  set_aiMaxTokens: {
    tr: "En çok yanıt uzunluğu (token)", en: "Max response length (tokens)", de: "Max. Antwortlänge (Token)", ru: "Макс. длина ответа (токены)", ar: "أقصى طول للرد (رموز)", es: "Longitud máxima de respuesta (tokens)", fr: "Longueur max. de réponse (tokens)", az: "Maks. cavab uzunluğu (token)",
  },
  set_aiVoiceEnabled: {
    tr: "Sesli dikteyi aç", en: "Enable voice dictation", de: "Sprachdiktat aktivieren", ru: "Включить голосовой ввод", ar: "تفعيل الإملاء الصوتي", es: "Activar dictado por voz", fr: "Activer la dictée vocale", az: "Səsli diktəni aç",
  },
  setDesc_aiVoiceEnabled: {
    tr: "Mikrofon kaydın metne çevrilmek üzere OpenAI uyumlu bir hizmete gönderilir (3. parti, yurt dışı olabilir). Kayıt diske yazılmaz. Rıza vermek için aç; istediğin an kapatırsın.", en: "Your microphone recording is sent to an OpenAI-compatible service for transcription (third party, possibly abroad). Audio is never saved to disk. Turn on to consent; turn off any time.", de: "Deine Aufnahme wird zur Transkription an einen OpenAI-kompatiblen Dienst gesendet (Drittanbieter, ggf. Ausland). Audio wird nie gespeichert. Einschalten = Einwilligung; jederzeit ausschaltbar.", ru: "Запись с микрофона отправляется в OpenAI-совместимый сервис для расшифровки (третья сторона, возможно за рубежом). Аудио не сохраняется на диск. Включение = согласие; можно выключить в любой момент.", ar: "يُرسل تسجيل الميكروفون إلى خدمة متوافقة مع OpenAI للتفريغ النصي (طرف ثالث، وربما خارج البلاد). لا يُحفظ الصوت على القرص. التفعيل يعني الموافقة ويمكنك الإيقاف في أي وقت.", es: "La grabación del micrófono se envía a un servicio compatible con OpenAI para transcribirla (tercero, posiblemente en el extranjero). El audio nunca se guarda en disco. Activar = consentimiento; puedes desactivarlo cuando quieras.", fr: "L’enregistrement du micro est envoyé à un service compatible OpenAI pour transcription (tiers, éventuellement à l’étranger). L’audio n’est jamais enregistré sur disque. Activer = consentement ; désactivable à tout moment.", az: "Mikrofon yazısı mətnə çevrilmək üçün OpenAI uyğun xidmətə göndərilir (3-cü tərəf, xaricdə ola bilər). Səs diskə yazılmır. Aç = razılıq; istədiyin vaxt söndürərsən.",
  },
  set_aiVoiceLang: {
    tr: "Dikte dili", en: "Dictation language", de: "Diktiersprache", ru: "Язык диктовки", ar: "لغة الإملاء", es: "Idioma de dictado", fr: "Langue de dictée", az: "Dikta dili",
  },
  set_aiTranscribeModel: {
    tr: "Dikte modeli", en: "Dictation model", de: "Diktiermodell", ru: "Модель диктовки", ar: "نموذج الإملاء", es: "Modelo de dictado", fr: "Modèle de dictée", az: "Dikta modeli",
  },
  aiKeyTitle: {
    tr: "API anahtarları", en: "API keys", de: "API-Schlüssel", ru: "Ключи API", ar: "مفاتيح API", es: "Claves API", fr: "Clés API", az: "API açarları",
  },
  aiKeyDesc: {
    tr: "Anahtarlar yalnız ana süreçte şifreli saklanır; arayüze geri okunmaz, dışa aktarılan ayarlara girmez.", en: "Keys are stored encrypted in the main process only; they are never read back into the UI and not included in exports.", de: "Schlüssel werden nur im Hauptprozess verschlüsselt gespeichert; sie werden nie in die UI zurückgelesen und nicht exportiert.", ru: "Ключи хранятся в зашифрованном виде только в главном процессе, не возвращаются в интерфейс и не попадают в экспорт.", ar: "تُخزَّن المفاتيح مشفّرة في العملية الرئيسية فقط، ولا تُقرأ ثانية في الواجهة ولا تدخل في التصدير.", es: "Las claves se guardan cifradas solo en el proceso principal; no se leen de vuelta en la interfaz ni se exportan.", fr: "Les clés sont stockées chiffrées uniquement dans le processus principal ; elles ne sont jamais relues dans l’interface ni exportées.", az: "Açarlar yalnız əsas prosesdə şifrəli saxlanır; interfeysə geri oxunmur və ixraca daxil edilmir.",
  },
  aiKeyAnthropic: {
    tr: "Anthropic API anahtarı", en: "Anthropic API key", de: "Anthropic-API-Schlüssel", ru: "Ключ API Anthropic", ar: "مفتاح API لـ Anthropic", es: "Clave API de Anthropic", fr: "Clé API Anthropic", az: "Anthropic API açarı",
  },
  aiKeyOpenai: {
    tr: "OpenAI API anahtarı (sohbet + dikte)", en: "OpenAI API key (chat + dictation)", de: "OpenAI-API-Schlüssel (Chat + Diktat)", ru: "Ключ API OpenAI (чат + диктовка)", ar: "مفتاح API لـ OpenAI (محادثة + إملاء)", es: "Clave API de OpenAI (chat + dictado)", fr: "Clé API OpenAI (chat + dictée)", az: "OpenAI API açarı (söhbət + dikta)",
  },
  aiKeySet: {
    tr: "Kayıtlı", en: "Saved", de: "Gespeichert", ru: "Сохранён", ar: "محفوظ", es: "Guardada", fr: "Enregistrée", az: "Saxlanıb",
  },
  aiKeyNotSet: {
    tr: "Kayıtlı değil", en: "Not set", de: "Nicht gesetzt", ru: "Не задан", ar: "غير محفوظ", es: "No guardada", fr: "Non définie", az: "Saxlanmayıb",
  },
  aiKeySave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Saxla",
  },
  aiKeyClear: {
    tr: "Sil", en: "Remove", de: "Entfernen", ru: "Удалить", ar: "حذف", es: "Eliminar", fr: "Supprimer", az: "Sil",
  },
  aiKeyNoEncrypt: {
    tr: "Bu cihazda şifreli depo yok; anahtar kaydedilemedi.", en: "Encrypted storage is unavailable on this device; the key was not saved.", de: "Verschlüsselter Speicher ist auf diesem Gerät nicht verfügbar; Schlüssel nicht gespeichert.", ru: "Зашифрованное хранилище недоступно; ключ не сохранён.", ar: "التخزين المشفّر غير متاح على هذا الجهاز؛ لم يُحفظ المفتاح.", es: "No hay almacenamiento cifrado en este dispositivo; la clave no se guardó.", fr: "Le stockage chiffré est indisponible ; la clé n’a pas été enregistrée.", az: "Bu cihazda şifrəli saxlama yoxdur; açar saxlanmadı.",
  },
  aiTitle: {
    tr: "Nova AI", en: "Nova AI", de: "Nova KI", ru: "Nova ИИ", ar: "Nova AI", es: "Nova IA", fr: "Nova IA", az: "Nova AI",
  },
  aiSessions: {
    tr: "Oturumlar", en: "Sessions", de: "Sitzungen", ru: "Сессии", ar: "الجلسات", es: "Sesiones", fr: "Sessions", az: "Sessiyalar",
  },
  aiNewSession: {
    tr: "Yeni oturum", en: "New session", de: "Neue Sitzung", ru: "Новая сессия", ar: "جلسة جديدة", es: "Nueva sesión", fr: "Nouvelle session", az: "Yeni sessiya",
  },
  aiDeleteSession: {
    tr: "Oturumu sil", en: "Delete session", de: "Sitzung löschen", ru: "Удалить сессию", ar: "حذف الجلسة", es: "Eliminar sesión", fr: "Supprimer la session", az: "Sessiyanı sil",
  },
  aiOpenSettings: {
    tr: "Yapay zekâ ayarları", en: "AI settings", de: "KI-Einstellungen", ru: "Настройки ИИ", ar: "إعدادات الذكاء الاصطناعي", es: "Ajustes de IA", fr: "Paramètres IA", az: "Süni intellekt ayarları",
  },
  aiModeAsk: {
    tr: "Sor", en: "Ask", de: "Fragen", ru: "Вопрос", ar: "اسأل", es: "Preguntar", fr: "Demander", az: "Soruş",
  },
  aiModeAgent: {
    tr: "Ajan", en: "Agent", de: "Agent", ru: "Агент", ar: "وكيل", es: "Agente", fr: "Agent", az: "Agent",
  },
  aiWelcome: {
    tr: "Merhaba! Kodunu açıklayabilir, hata bulabilir, refactor edebilir; Ajan modunda projeni okuyup dosyaları düzenleyebilirim. Görsel ekleyebilir, mikrofonla konuşabilirsin. Ctrl+Shift+L ile beni aç.", en: "Hi! I can explain code, find bugs and refactor; in Agent mode I can read your project and edit files. You can attach images and talk with the mic. Open me with Ctrl+Shift+L.", de: "Hallo! Ich kann Code erklären, Fehler finden und refaktorieren; im Agent-Modus lese ich dein Projekt und bearbeite Dateien. Du kannst Bilder anhängen und per Mikrofon sprechen. Öffne mich mit Strg+Umschalt+L.", ru: "Привет! Я объясню код, найду ошибки и сделаю рефакторинг; в режиме агента читаю проект и правлю файлы. Можно прикреплять изображения и говорить в микрофон. Открой меня через Ctrl+Shift+L.", ar: "مرحباً! يمكنني شرح الكود وإيجاد الأخطاء وإعادة الهيكلة؛ وفي وضع الوكيل أقرأ مشروعك وأعدّل الملفات. يمكنك إرفاق صور والتحدث بالميكروفون. افتحني بـ Ctrl+Shift+L.", es: "¡Hola! Puedo explicar código, encontrar errores y refactorizar; en modo Agente leo tu proyecto y edito archivos. Puedes adjuntar imágenes y hablar con el micrófono. Ábreme con Ctrl+Shift+L.", fr: "Salut ! Je peux expliquer du code, trouver des bugs et refactoriser ; en mode Agent, je lis ton projet et modifie des fichiers. Tu peux joindre des images et parler au micro. Ouvre-moi avec Ctrl+Shift+L.", az: "Salam! Kodu izah edə, xəta tapa, refaktor edə bilərəm; Agent rejimində layihəni oxuyub faylları redaktə edirəm. Şəkil əlavə edə, mikrofonla danışa bilərsən. Ctrl+Shift+L ilə aç.",
  },
  aiQuickExplain: {
    tr: "Açıkla", en: "Explain", de: "Erklären", ru: "Объяснить", ar: "اشرح", es: "Explicar", fr: "Expliquer", az: "İzah et",
  },
  aiQuickBugs: {
    tr: "Hata bul", en: "Find bugs", de: "Fehler finden", ru: "Найти ошибки", ar: "ابحث عن أخطاء", es: "Buscar errores", fr: "Trouver des bugs", az: "Xəta tap",
  },
  aiQuickRefactor: {
    tr: "Refactor", en: "Refactor", de: "Refaktorieren", ru: "Рефакторинг", ar: "إعادة هيكلة", es: "Refactorizar", fr: "Refactoriser", az: "Refaktor",
  },
  aiQuickTests: {
    tr: "Test yaz", en: "Write tests", de: "Tests schreiben", ru: "Написать тесты", ar: "اكتب اختبارات", es: "Escribir pruebas", fr: "Écrire des tests", az: "Test yaz",
  },
  aiPlaceholderAsk: {
    tr: "Bir şey sor… (/ komutlar, Enter gönderir)", en: "Ask something… (/ commands, Enter sends)", de: "Frag etwas… (/ Befehle, Enter sendet)", ru: "Спроси что-нибудь… (/ команды, Enter — отправить)", ar: "اسأل شيئاً… (/ أوامر، Enter للإرسال)", es: "Pregunta algo… (/ comandos, Enter envía)", fr: "Pose une question… (/ commandes, Entrée envoie)", az: "Nəsə soruş… (/ komandalar, Enter göndərir)",
  },
  aiPlaceholderAgent: {
    tr: "Ajana bir görev ver… (projeyi okur, onayınla düzenler)", en: "Give the agent a task… (reads your project, edits with your approval)", de: "Gib dem Agent eine Aufgabe… (liest dein Projekt, ändert mit deiner Genehmigung)", ru: "Дай агенту задачу… (читает проект, правит с твоего одобрения)", ar: "أعطِ الوكيل مهمة… (يقرأ مشروعك ويعدّل بموافقتك)", es: "Dale una tarea al agente… (lee tu proyecto y edita con tu aprobación)", fr: "Donne une tâche à l’agent… (lit ton projet, modifie avec ton accord)", az: "Agentə tapşırıq ver… (layihəni oxuyur, təsdiqinlə redaktə edir)",
  },
  aiSend: {
    tr: "Gönder", en: "Send", de: "Senden", ru: "Отправить", ar: "إرسال", es: "Enviar", fr: "Envoyer", az: "Göndər",
  },
  aiStop: {
    tr: "Durdur", en: "Stop", de: "Stopp", ru: "Остановить", ar: "إيقاف", es: "Detener", fr: "Arrêter", az: "Dayandır",
  },
  aiAttach: {
    tr: "Görsel ekle (veya yapıştır)", en: "Attach image (or paste)", de: "Bild anhängen (oder einfügen)", ru: "Прикрепить изображение (или вставить)", ar: "إرفاق صورة (أو لصقها)", es: "Adjuntar imagen (o pegar)", fr: "Joindre une image (ou coller)", az: "Şəkil əlavə et (və ya yapışdır)",
  },
  aiRemove: {
    tr: "Kaldır", en: "Remove", de: "Entfernen", ru: "Убрать", ar: "إزالة", es: "Quitar", fr: "Retirer", az: "Çıxar",
  },
  aiMicStart: {
    tr: "Sesli dikte", en: "Voice dictation", de: "Sprachdiktat", ru: "Голосовой ввод", ar: "إملاء صوتي", es: "Dictado por voz", fr: "Dictée vocale", az: "Səsli dikta",
  },
  aiMicStop: {
    tr: "Kaydı bitir", en: "Stop recording", de: "Aufnahme beenden", ru: "Остановить запись", ar: "إنهاء التسجيل", es: "Detener grabación", fr: "Arrêter l’enregistrement", az: "Yazını bitir",
  },
  aiMicDenied: {
    tr: "Mikrofona erişilemedi. Sistem izinlerini kontrol et.", en: "Could not access the microphone. Check system permissions.", de: "Kein Zugriff auf das Mikrofon. Prüfe die Systemberechtigungen.", ru: "Нет доступа к микрофону. Проверь разрешения системы.", ar: "تعذّر الوصول إلى الميكروفون. تحقق من أذونات النظام.", es: "No se pudo acceder al micrófono. Revisa los permisos del sistema.", fr: "Impossible d’accéder au micro. Vérifie les autorisations système.", az: "Mikrofona çatmaq mümkün olmadı. Sistem icazələrini yoxla.",
  },
  aiVoiceConsent: {
    tr: "Mikrofon düğmesine basmak sesli dikteyi açar: kaydın metne çevrilmek üzere OpenAI uyumlu bir hizmete gönderilir (3. parti). Ayarlardan kapatabilirsin.", en: "Pressing the mic enables voice dictation: your recording is sent to an OpenAI-compatible service to be transcribed (third party). You can turn it off in settings.", de: "Ein Klick aufs Mikrofon aktiviert das Diktat: Deine Aufnahme wird zur Transkription an einen OpenAI-kompatiblen Dienst gesendet (Drittanbieter). In den Einstellungen abschaltbar.", ru: "Нажатие на микрофон включает диктовку: запись отправляется в OpenAI-совместимый сервис для расшифровки (третья сторона). Можно отключить в настройках.", ar: "الضغط على الميكروفون يفعّل الإملاء: يُرسل تسجيلك إلى خدمة متوافقة مع OpenAI لتحويله إلى نص (طرف ثالث). يمكنك إيقافه من الإعدادات.", es: "Pulsar el micrófono activa el dictado: tu grabación se envía a un servicio compatible con OpenAI para transcribirla (tercero). Puedes desactivarlo en ajustes.", fr: "Appuyer sur le micro active la dictée : ton enregistrement est envoyé à un service compatible OpenAI pour transcription (tiers). Désactivable dans les paramètres.", az: "Mikrofona basmaq diktanı açır: yazın mətnə çevrilmək üçün OpenAI uyğun xidmətə göndərilir (3-cü tərəf). Ayarlardan söndürə bilərsən.",
  },
  aiNoKey: {
    tr: "Bu sağlayıcı için API anahtarı yok.", en: "No API key for this provider.", de: "Kein API-Schlüssel für diesen Anbieter.", ru: "Нет ключа API для этого провайдера.", ar: "لا يوجد مفتاح API لهذا المزوّد.", es: "No hay clave API para este proveedor.", fr: "Aucune clé API pour ce fournisseur.", az: "Bu provayder üçün API açarı yoxdur.",
  },
  aiDesktopOnly: {
    tr: "Yapay zekâ asistanı yalnız masaüstü uygulamasında çalışır (API anahtarı güvenli saklanabilsin diye).", en: "The AI assistant works only in the desktop app (so API keys can be stored safely).", de: "Der KI-Assistent läuft nur in der Desktop-App (damit API-Schlüssel sicher gespeichert werden).", ru: "ИИ-ассистент работает только в настольном приложении (для безопасного хранения ключей).", ar: "يعمل المساعد الذكي في تطبيق سطح المكتب فقط (لحفظ مفاتيح API بأمان).", es: "El asistente de IA solo funciona en la app de escritorio (para guardar las claves de forma segura).", fr: "L’assistant IA ne fonctionne que dans l’app de bureau (pour stocker les clés en sécurité).", az: "Süni intellekt köməkçisi yalnız masaüstü tətbiqdə işləyir (API açarı təhlükəsiz saxlanılsın deyə).",
  },
  aiAgentNeedsFolder: {
    tr: "Ajan modu için önce bir klasör aç.", en: "Open a folder first to use Agent mode.", de: "Öffne zuerst einen Ordner für den Agent-Modus.", ru: "Для режима агента сначала открой папку.", ar: "افتح مجلداً أولاً لاستخدام وضع الوكيل.", es: "Abre primero una carpeta para usar el modo Agente.", fr: "Ouvre d’abord un dossier pour le mode Agent.", az: "Agent rejimi üçün əvvəlcə qovluq aç.",
  },
  aiThinking: {
    tr: "Düşünüyor…", en: "Thinking…", de: "Denkt nach…", ru: "Думаю…", ar: "يفكّر…", es: "Pensando…", fr: "Réflexion…", az: "Düşünür…",
  },
  aiCopy: {
    tr: "Kopyala", en: "Copy", de: "Kopieren", ru: "Копировать", ar: "نسخ", es: "Copiar", fr: "Copier", az: "Kopyala",
  },
  aiCopied: {
    tr: "Kopyalandı", en: "Copied", de: "Kopiert", ru: "Скопировано", ar: "تم النسخ", es: "Copiado", fr: "Copié", az: "Kopyalandı",
  },
  aiInsert: {
    tr: "Editöre ekle", en: "Insert in editor", de: "In Editor einfügen", ru: "Вставить в редактор", ar: "إدراج في المحرر", es: "Insertar en el editor", fr: "Insérer dans l’éditeur", az: "Redaktora əlavə et",
  },
  aiApprovalTitle: {
    tr: "Onay gerekli", en: "Approval needed", de: "Genehmigung erforderlich", ru: "Нужно подтверждение", ar: "مطلوب موافقة", es: "Se requiere aprobación", fr: "Approbation requise", az: "Təsdiq lazımdır",
  },
  aiApprove: {
    tr: "İzin ver", en: "Allow", de: "Erlauben", ru: "Разрешить", ar: "سماح", es: "Permitir", fr: "Autoriser", az: "İcazə ver",
  },
  aiDeny: {
    tr: "Reddet", en: "Deny", de: "Ablehnen", ru: "Отклонить", ar: "رفض", es: "Denegar", fr: "Refuser", az: "Rədd et",
  },
  aiApproved: {
    tr: "İzin verildi", en: "Allowed", de: "Erlaubt", ru: "Разрешено", ar: "تم السماح", es: "Permitido", fr: "Autorisé", az: "İcazə verildi",
  },
  aiDenied: {
    tr: "Reddedildi", en: "Denied", de: "Abgelehnt", ru: "Отклонено", ar: "تم الرفض", es: "Denegado", fr: "Refusé", az: "Rədd edildi",
  },
  aiErrAuth: {
    tr: "API anahtarı reddedildi. Ayarlardan anahtarı kontrol et.", en: "The API key was rejected. Check the key in settings.", de: "Der API-Schlüssel wurde abgelehnt. Prüfe ihn in den Einstellungen.", ru: "Ключ API отклонён. Проверь ключ в настройках.", ar: "تم رفض مفتاح API. تحقق منه في الإعدادات.", es: "Se rechazó la clave API. Revísala en ajustes.", fr: "La clé API a été refusée. Vérifie-la dans les paramètres.", az: "API açarı rədd edildi. Ayarlarda yoxla.",
  },
  aiErrRate: {
    tr: "İstek sınırına ulaşıldı. Biraz bekleyip tekrar dene.", en: "Rate limit reached. Wait a moment and try again.", de: "Anfragelimit erreicht. Warte kurz und versuche es erneut.", ru: "Достигнут лимит запросов. Подожди и повтори.", ar: "تم بلوغ حد الطلبات. انتظر قليلاً وحاول مجدداً.", es: "Límite de solicitudes alcanzado. Espera un momento e inténtalo de nuevo.", fr: "Limite de requêtes atteinte. Patiente un instant puis réessaie.", az: "Sorğu limitinə çatıldı. Bir az gözləyib yenidən cəhd et.",
  },
  aiErrGeneric: {
    tr: "İstek tamamlanamadı", en: "The request could not be completed", de: "Anfrage fehlgeschlagen", ru: "Не удалось выполнить запрос", ar: "تعذّر إكمال الطلب", es: "No se pudo completar la solicitud", fr: "La requête a échoué", az: "Sorğu tamamlana bilmədi",
  },
  aiUsage: {
    tr: "{in} giriş / {out} çıkış token", en: "{in} in / {out} out tokens", de: "{in} Eingabe- / {out} Ausgabe-Token", ru: "{in} вх. / {out} исх. токенов", ar: "{in} رمز إدخال / {out} رمز إخراج", es: "{in} tokens de entrada / {out} de salida", fr: "{in} jetons en entrée / {out} en sortie", az: "{in} giriş / {out} çıxış token",
  },
  aiPrivacy: {
    tr: "Mesajların ve (açıksa) seçili kodun {provider} sağlayıcısına gönderilir.", en: "Your messages and (if enabled) the selected code are sent to {provider}.", de: "Deine Nachrichten und (falls aktiv) der markierte Code werden an {provider} gesendet.", ru: "Твои сообщения и (если включено) выделенный код отправляются в {provider}.", ar: "تُرسل رسائلك والكود المحدد (إن كان مفعلاً) إلى {provider}.", es: "Tus mensajes y (si está activado) el código seleccionado se envían a {provider}.", fr: "Tes messages et (si activé) le code sélectionné sont envoyés à {provider}.", az: "Mesajların və (açıqsa) seçilmiş kod {provider} provayderinə göndərilir.",
  },
  aiSlashNew: {
    tr: "Yeni oturum aç", en: "Start a new session", de: "Neue Sitzung starten", ru: "Начать новую сессию", ar: "بدء جلسة جديدة", es: "Iniciar una nueva sesión", fr: "Démarrer une nouvelle session", az: "Yeni sessiya başlat",
  },
  aiSlashAsk: {
    tr: "Sor moduna geç", en: "Switch to Ask mode", de: "Zum Fragen-Modus wechseln", ru: "Перейти в режим «Вопрос»", ar: "التبديل إلى وضع السؤال", es: "Cambiar al modo Preguntar", fr: "Passer en mode Demander", az: "Soruş rejiminə keç",
  },
  aiSlashAgent: {
    tr: "Ajan moduna geç", en: "Switch to Agent mode", de: "Zum Agent-Modus wechseln", ru: "Перейти в режим агента", ar: "التبديل إلى وضع الوكيل", es: "Cambiar al modo Agente", fr: "Passer en mode Agent", az: "Agent rejiminə keç",
  },
  cpTitle: {
    tr: "Komut paleti / dosya ara", en: "Command palette / search files", de: "Befehlspalette / Dateisuche", ru: "Палитра команд / поиск файлов", ar: "لوحة الأوامر / بحث الملفات", es: "Paleta de comandos / buscar archivos", fr: "Palette de commandes / recherche de fichiers", az: "Komanda paneli / fayl axtar",
  },
  cpPlaceholder: {
    tr: "Dosya adı yaz… ( > komut, : satır, $ snippet )", en: "Type a file name… ( > commands, : line, $ snippet )", de: "Dateiname eingeben… ( > Befehle, : Zeile, $ Snippet )", ru: "Введи имя файла… ( > команды, : строка, $ сниппет )", ar: "اكتب اسم ملف… ( > أوامر، : سطر، $ مقتطف )", es: "Escribe un archivo… ( > comandos, : línea, $ fragmento )", fr: "Tape un nom de fichier… ( > commandes, : ligne, $ snippet )", az: "Fayl adı yaz… ( > komanda, : sətir, $ snippet )",
  },
  cpNoResults: {
    tr: "Sonuç yok", en: "No results", de: "Keine Ergebnisse", ru: "Нет результатов", ar: "لا توجد نتائج", es: "Sin resultados", fr: "Aucun résultat", az: "Nəticə yoxdur",
  },
  cpGoLineN: {
    tr: "{n}. satıra git", en: "Go to line {n}", de: "Gehe zu Zeile {n}", ru: "Перейти к строке {n}", ar: "الانتقال إلى السطر {n}", es: "Ir a la línea {n}", fr: "Aller à la ligne {n}", az: "{n}-ci sətrə keç",
  },
  cpGoLineHint: {
    tr: "Bir satır numarası yaz", en: "Type a line number", de: "Zeilennummer eingeben", ru: "Введи номер строки", ar: "اكتب رقم السطر", es: "Escribe un número de línea", fr: "Tape un numéro de ligne", az: "Sətir nömrəsi yaz",
  },
  cpHintFiles: {
    tr: "Dosya", en: "Files", de: "Dateien", ru: "Файлы", ar: "ملفات", es: "Archivos", fr: "Fichiers", az: "Fayllar",
  },
  cpHintCommands: {
    tr: "komutlar", en: "commands", de: "Befehle", ru: "команды", ar: "أوامر", es: "comandos", fr: "commandes", az: "komandalar",
  },
  cpHintLine: {
    tr: "satıra git", en: "go to line", de: "Zeile", ru: "строка", ar: "سطر", es: "línea", fr: "ligne", az: "sətir",
  },
  cpHintSnippets: {
    tr: "snippet ekle", en: "insert snippet", de: "Snippet", ru: "сниппет", ar: "مقتطف", es: "fragmento", fr: "snippet", az: "snippet əlavə et",
  },
  cmdQuickOpen: {
    tr: "Dosyaya git…", en: "Go to file…", de: "Gehe zu Datei…", ru: "Перейти к файлу…", ar: "الانتقال إلى ملف…", es: "Ir al archivo…", fr: "Aller au fichier…", az: "Fayla keç…",
  },
  cmdGoToLine: {
    tr: "Satıra git…", en: "Go to line…", de: "Gehe zu Zeile…", ru: "Перейти к строке…", ar: "الانتقال إلى سطر…", es: "Ir a la línea…", fr: "Aller à la ligne…", az: "Sətrə keç…",
  },
  cmdGoToSymbol: {
    tr: "Sembole git (dosya içinde)", en: "Go to symbol in file", de: "Gehe zu Symbol in Datei", ru: "Перейти к символу в файле", ar: "الانتقال إلى رمز في الملف", es: "Ir al símbolo del archivo", fr: "Aller au symbole du fichier", az: "Fayldakı simvola keç",
  },
  cmdFindInFiles: {
    tr: "Projede ara", en: "Search in project", de: "Im Projekt suchen", ru: "Поиск по проекту", ar: "بحث في المشروع", es: "Buscar en el proyecto", fr: "Rechercher dans le projet", az: "Layihədə axtar",
  },
  cmdFind: {
    tr: "Dosyada bul", en: "Find in file", de: "In Datei suchen", ru: "Найти в файле", ar: "بحث في الملف", es: "Buscar en el archivo", fr: "Rechercher dans le fichier", az: "Faylda tap",
  },
  cmdReplace: {
    tr: "Dosyada değiştir", en: "Replace in file", de: "In Datei ersetzen", ru: "Заменить в файле", ar: "استبدال في الملف", es: "Reemplazar en el archivo", fr: "Remplacer dans le fichier", az: "Faylda əvəz et",
  },
  cmdFormat: {
    tr: "Belgeyi biçimlendir", en: "Format document", de: "Dokument formatieren", ru: "Форматировать документ", ar: "تنسيق المستند", es: "Dar formato al documento", fr: "Formater le document", az: "Sənədi formatla",
  },
  cmdInsertSnippet: {
    tr: "Snippet ekle…", en: "Insert snippet…", de: "Snippet einfügen…", ru: "Вставить сниппет…", ar: "إدراج مقتطف…", es: "Insertar fragmento…", fr: "Insérer un snippet…", az: "Snippet əlavə et…",
  },
  cmdSave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Saxla",
  },
  cmdCloseTab: {
    tr: "Sekmeyi kapat", en: "Close tab", de: "Tab schließen", ru: "Закрыть вкладку", ar: "إغلاق التبويب", es: "Cerrar pestaña", fr: "Fermer l’onglet", az: "Vərəqi bağla",
  },
  cmdOpenAI: {
    tr: "Yapay zekâ asistanını aç", en: "Open AI assistant", de: "KI-Assistent öffnen", ru: "Открыть ИИ-ассистента", ar: "فتح المساعد الذكي", es: "Abrir asistente de IA", fr: "Ouvrir l’assistant IA", az: "Süni intellekt köməkçisini aç",
  },
  cmdToggleTheme: {
    tr: "Açık/koyu temayı değiştir", en: "Toggle light/dark theme", de: "Hell/Dunkel umschalten", ru: "Переключить светлую/тёмную тему", ar: "تبديل السمة الفاتحة/الداكنة", es: "Alternar tema claro/oscuro", fr: "Basculer thème clair/sombre", az: "Açıq/tünd temanı dəyiş",
  },
  searchPlaceholder: {
    tr: "Projede ara (en az 2 harf)", en: "Search project (min. 2 chars)", de: "Im Projekt suchen (min. 2 Zeichen)", ru: "Поиск по проекту (мин. 2 символа)", ar: "بحث في المشروع (حرفان على الأقل)", es: "Buscar en el proyecto (mín. 2 caracteres)", fr: "Rechercher (min. 2 caractères)", az: "Layihədə axtar (min. 2 simvol)",
  },
  searchCase: {
    tr: "Büyük/küçük harf duyarlı", en: "Match case", de: "Groß-/Kleinschreibung", ru: "Учитывать регистр", ar: "مطابقة حالة الأحرف", es: "Coincidir mayúsculas", fr: "Respecter la casse", az: "Böyük/kiçik hərf həssas",
  },
  searchRegex: {
    tr: "Düzenli ifade", en: "Regular expression", de: "Regulärer Ausdruck", ru: "Регулярное выражение", ar: "تعبير نمطي", es: "Expresión regular", fr: "Expression régulière", az: "Requlyar ifadə",
  },
  searchBadRegex: {
    tr: "Geçersiz düzenli ifade", en: "Invalid regular expression", de: "Ungültiger regulärer Ausdruck", ru: "Неверное регулярное выражение", ar: "تعبير نمطي غير صالح", es: "Expresión regular no válida", fr: "Expression régulière invalide", az: "Yanlış requlyar ifadə",
  },
  searchNoFolder: {
    tr: "Aramak için önce bir klasör aç.", en: "Open a folder to search.", de: "Öffne zum Suchen einen Ordner.", ru: "Чтобы искать, открой папку.", ar: "افتح مجلداً للبحث.", es: "Abre una carpeta para buscar.", fr: "Ouvre un dossier pour rechercher.", az: "Axtarmaq üçün qovluq aç.",
  },
  searchCount: {
    tr: "{f} dosyada {n} sonuç", en: "{n} results in {f} files", de: "{n} Treffer in {f} Dateien", ru: "{n} результатов в {f} файлах", ar: "{n} نتيجة في {f} ملفات", es: "{n} resultados en {f} archivos", fr: "{n} résultats dans {f} fichiers", az: "{f} faylda {n} nəticə",
  },
  searchTruncated: {
    tr: "liste kısaltıldı", en: "list truncated", de: "Liste gekürzt", ru: "список сокращён", ar: "تم اختصار القائمة", es: "lista recortada", fr: "liste tronquée", az: "siyahı qısaldıldı",
  },
  aiOllamaDown: {
    tr: "Ollama çalışmıyor. ollama.com adresinden kur ve başlat; her şey bu bilgisayarda, ücretsiz çalışır.", en: "Ollama is not running. Install and start it from ollama.com; everything runs on this computer, free of charge.", de: "Ollama läuft nicht. Installiere und starte es von ollama.com; alles läuft lokal und kostenlos auf diesem Computer.", ru: "Ollama не запущена. Установи и запусти её с ollama.com; всё работает на этом компьютере бесплатно.", ar: "Ollama لا يعمل. ثبّته وشغّله من ollama.com؛ كل شيء يعمل على هذا الحاسوب مجاناً.", es: "Ollama no está en ejecución. Instálalo e inícialo desde ollama.com; todo funciona en este equipo, gratis.", fr: "Ollama n’est pas lancé. Installe-le et démarre-le depuis ollama.com ; tout tourne sur cet ordinateur, gratuitement.", az: "Ollama işləmir. ollama.com saytından quraşdır və başlat; hər şey bu kompüterdə pulsuz işləyir.",
  },
  aiOllamaNoModels: {
    tr: "Yüklü model yok. Terminalde şunu çalıştır: ollama pull qwen2.5-coder:7b", en: "No models installed. Run this in a terminal: ollama pull qwen2.5-coder:7b", de: "Keine Modelle installiert. Führe im Terminal aus: ollama pull qwen2.5-coder:7b", ru: "Нет установленных моделей. Выполни в терминале: ollama pull qwen2.5-coder:7b", ar: "لا توجد نماذج مثبّتة. شغّل في الطرفية: ollama pull qwen2.5-coder:7b", es: "No hay modelos instalados. Ejecuta en una terminal: ollama pull qwen2.5-coder:7b", fr: "Aucun modèle installé. Exécute dans un terminal : ollama pull qwen2.5-coder:7b", az: "Quraşdırılmış model yoxdur. Terminalda işlət: ollama pull qwen2.5-coder:7b",
  },
  aiRecheck: {
    tr: "Yeniden dene", en: "Check again", de: "Erneut prüfen", ru: "Проверить снова", ar: "أعد المحاولة", es: "Volver a comprobar", fr: "Revérifier", az: "Yenidən yoxla",
  },
  aiPrivacyLocal: {
    tr: "Yerel model: mesajların ve kodun bu bilgisayardan çıkmaz.", en: "Local model: your messages and code never leave this computer.", de: "Lokales Modell: Nachrichten und Code verlassen diesen Computer nicht.", ru: "Локальная модель: сообщения и код не покидают этот компьютер.", ar: "نموذج محلي: لا تغادر رسائلك وكودك هذا الحاسوب.", es: "Modelo local: tus mensajes y código no salen de este equipo.", fr: "Modèle local : tes messages et ton code ne quittent pas cet ordinateur.", az: "Lokal model: mesajların və kodun bu kompüterdən çıxmır.",
  },
  set_aiTranscribeUrl: {
    tr: "Yerel dikte sunucusu", en: "Local dictation server", de: "Lokaler Diktier-Server", ru: "Локальный сервер диктовки", ar: "خادم الإملاء المحلي", es: "Servidor de dictado local", fr: "Serveur de dictée local", az: "Yerli dikta serveri",
  },
  setDesc_aiTranscribeUrl: {
    tr: "OpenAI uyumlu bir yerel Whisper sunucusunun adresi (ör. whisper.cpp veya faster-whisper-server). Yerel adreste API anahtarı gerekmez ve ses bilgisayarından çıkmaz. Boşsa OpenAI kullanılır.", en: "Address of a local OpenAI-compatible Whisper server (e.g. whisper.cpp or faster-whisper-server). No API key is needed for a local address and audio never leaves your computer. If empty, OpenAI is used.", de: "Adresse eines lokalen OpenAI-kompatiblen Whisper-Servers (z. B. whisper.cpp oder faster-whisper-server). Für lokale Adressen ist kein API-Schlüssel nötig, Audio verlässt den Computer nicht. Leer = OpenAI.", ru: "Адрес локального OpenAI-совместимого сервера Whisper (например, whisper.cpp или faster-whisper-server). Для локального адреса ключ API не нужен, звук не покидает компьютер. Пусто — используется OpenAI.", ar: "عنوان خادم Whisper محلي متوافق مع OpenAI (مثل whisper.cpp أو faster-whisper-server). لا حاجة لمفتاح API للعنوان المحلي ولا يغادر الصوت حاسوبك. إذا تُرك فارغاً يُستخدم OpenAI.", es: "Dirección de un servidor Whisper local compatible con OpenAI (p. ej. whisper.cpp o faster-whisper-server). Con una dirección local no hace falta clave API y el audio no sale del equipo. Vacío = OpenAI.", fr: "Adresse d’un serveur Whisper local compatible OpenAI (ex. whisper.cpp ou faster-whisper-server). Aucune clé API pour une adresse locale et l’audio ne quitte pas l’ordinateur. Vide = OpenAI.", az: "OpenAI uyğun yerli Whisper serverinin ünvanı (məs. whisper.cpp və ya faster-whisper-server). Yerli ünvan üçün API açarı lazım deyil, səs kompüterdən çıxmır. Boşdursa OpenAI istifadə olunur.",
  },
  aiVoiceNeedsKey: {
    tr: "Dikte için ayarlardan yerel dikte sunucusu adresi gir (ücretsiz) veya bir OpenAI API anahtarı ekle.", en: "For dictation, enter a local dictation server address in settings (free) or add an OpenAI API key.", de: "Für das Diktat gib in den Einstellungen einen lokalen Diktier-Server an (kostenlos) oder füge einen OpenAI-API-Schlüssel hinzu.", ru: "Для диктовки укажи в настройках адрес локального сервера (бесплатно) или добавь ключ API OpenAI.", ar: "للإملاء أدخل عنوان خادم إملاء محلي في الإعدادات (مجاناً) أو أضف مفتاح OpenAI API.", es: "Para dictar, indica en ajustes la dirección de un servidor local (gratis) o añade una clave API de OpenAI.", fr: "Pour la dictée, saisis l’adresse d’un serveur local dans les paramètres (gratuit) ou ajoute une clé API OpenAI.", az: "Dikta üçün ayarlarda yerli server ünvanı daxil et (pulsuz) və ya OpenAI API açarı əlavə et.",
  },
  setDesc_aiTranscribeModel: {
    tr: "Dikte modeli adı (OpenAI için whisper-1; yerel sunucuda sunucunun model adı).", en: "Dictation model name (whisper-1 for OpenAI; the server’s model name for a local server).", de: "Name des Diktiermodells (whisper-1 für OpenAI; bei lokalem Server dessen Modellname).", ru: "Имя модели диктовки (whisper-1 для OpenAI; для локального сервера — имя модели сервера).", ar: "اسم نموذج الإملاء (whisper-1 لـ OpenAI، أو اسم النموذج على الخادم المحلي).", es: "Nombre del modelo de dictado (whisper-1 para OpenAI; el del servidor si es local).", fr: "Nom du modèle de dictée (whisper-1 pour OpenAI ; celui du serveur en local).", az: "Dikta modelinin adı (OpenAI üçün whisper-1; yerli serverdə serverin model adı).",
  },
} satisfies Record<string, Dict>;

export type UiTextKey = keyof typeof UI_TEXT;

function detectLang(): UiLang {
  try {
    const code = (navigator.language || 'tr').slice(0, 2).toLowerCase() as UiLang;
    return (UI_LANGS as readonly string[]).includes(code) ? code : 'tr';
  } catch {
    return 'tr';
  }
}

let currentLang: UiLang = detectLang();

/** Dil ayarı: 'auto' sistem dilini izler; desteklenmeyen değer sistem diline düşer. */
export function setUiLang(lang: string) {
  currentLang = (UI_LANGS as readonly string[]).includes(lang) ? (lang as UiLang) : detectLang();
}

export function getUiLang(): UiLang {
  return currentLang;
}

export function t(key: UiTextKey): string {
  return UI_TEXT[key][currentLang];
}
