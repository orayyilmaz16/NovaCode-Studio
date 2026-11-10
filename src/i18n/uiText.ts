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
