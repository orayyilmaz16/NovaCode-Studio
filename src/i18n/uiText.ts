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

const currentLang: UiLang = detectLang();

export function t(key: UiTextKey): string {
  return UI_TEXT[key][currentLang];
}
