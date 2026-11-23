// Uzak çalışma alanı (SSH) arayüz metinleri (8 dil). Ana pakette değil, bu bölümle birlikte gecikmeli yüklenir.
// Modül yüklenince kendini t() kaydına ekler; kullanan bileşenler bu dosyayı içe aktarmalıdır.
import { registerTexts, type UiLang } from './uiText';

type Dict = Record<UiLang, string>;

export const REMOTE_TEXT = {
  rmTitle: {
    tr: "Uzak sunucu (SSH)", en: "Remote server (SSH)", de: "Remote-Server (SSH)", ru: "Удалённый сервер (SSH)", ar: "خادم بعيد (SSH)", es: "Servidor remoto (SSH)", fr: "Serveur distant (SSH)", az: "Uzaq server (SSH)",
  },
  rmConnect: {
    tr: "Uzak sunucuya bağlan…", en: "Connect to remote server…", de: "Mit Remote-Server verbinden …", ru: "Подключиться к удалённому серверу…", ar: "الاتصال بخادم بعيد…", es: "Conectar a servidor remoto…", fr: "Se connecter à un serveur distant…", az: "Uzaq serverə qoşul…",
  },
  rmStatusIdle: {
    tr: "Uzak bağlantı aç", en: "Open a remote connection", de: "Remote-Verbindung öffnen", ru: "Открыть удалённое подключение", ar: "فتح اتصال بعيد", es: "Abrir una conexión remota", fr: "Ouvrir une connexion distante", az: "Uzaq bağlantı aç",
  },
  rmStatusOn: {
    tr: "SSH: {h} (bağlantıyı yönet)", en: "SSH: {h} (manage connection)", de: "SSH: {h} (Verbindung verwalten)", ru: "SSH: {h} (управление подключением)", ar: "SSH: {h} (إدارة الاتصال)", es: "SSH: {h} (administrar conexión)", fr: "SSH : {h} (gérer la connexion)", az: "SSH: {h} (bağlantını idarə et)",
  },
  rmDisconnect: {
    tr: "Uzak bağlantıyı kapat", en: "Close remote connection", de: "Remote-Verbindung trennen", ru: "Закрыть удалённое подключение", ar: "إغلاق الاتصال البعيد", es: "Cerrar conexión remota", fr: "Fermer la connexion distante", az: "Uzaq bağlantını bağla",
  },
  rmHosts: {
    tr: "Kayıtlı sunucular", en: "Saved servers", de: "Gespeicherte Server", ru: "Сохранённые серверы", ar: "الخوادم المحفوظة", es: "Servidores guardados", fr: "Serveurs enregistrés", az: "Yadda saxlanmış serverlər",
  },
  rmNone: {
    tr: "Henüz kayıtlı sunucu yok.", en: "No saved servers yet.", de: "Noch keine gespeicherten Server.", ru: "Пока нет сохранённых серверов.", ar: "لا توجد خوادم محفوظة بعد.", es: "Aún no hay servidores guardados.", fr: "Aucun serveur enregistré pour l'instant.", az: "Hələ yadda saxlanmış server yoxdur.",
  },
  rmAdd: {
    tr: "Yeni sunucu ekle", en: "Add new server", de: "Neuen Server hinzufügen", ru: "Добавить сервер", ar: "إضافة خادم جديد", es: "Añadir servidor nuevo", fr: "Ajouter un serveur", az: "Yeni server əlavə et",
  },
  rmEdit: {
    tr: "Düzenle", en: "Edit", de: "Bearbeiten", ru: "Изменить", ar: "تعديل", es: "Editar", fr: "Modifier", az: "Redaktə et",
  },
  rmDelete: {
    tr: "Kaydı sil", en: "Delete entry", de: "Eintrag löschen", ru: "Удалить запись", ar: "حذف الإدخال", es: "Eliminar entrada", fr: "Supprimer l'entrée", az: "Qeydi sil",
  },
  rmName: {
    tr: "Görünen ad", en: "Display name", de: "Anzeigename", ru: "Отображаемое имя", ar: "الاسم المعروض", es: "Nombre visible", fr: "Nom affiché", az: "Görünən ad",
  },
  rmHost: {
    tr: "Sunucu adresi", en: "Server address", de: "Serveradresse", ru: "Адрес сервера", ar: "عنوان الخادم", es: "Dirección del servidor", fr: "Adresse du serveur", az: "Server ünvanı",
  },
  rmPort: {
    tr: "Port", en: "Port", de: "Port", ru: "Порт", ar: "المنفذ", es: "Puerto", fr: "Port", az: "Port",
  },
  rmUser: {
    tr: "Kullanıcı adı", en: "Username", de: "Benutzername", ru: "Имя пользователя", ar: "اسم المستخدم", es: "Usuario", fr: "Nom d'utilisateur", az: "İstifadəçi adı",
  },
  rmAuth: {
    tr: "Kimlik doğrulama", en: "Authentication", de: "Authentifizierung", ru: "Аутентификация", ar: "المصادقة", es: "Autenticación", fr: "Authentification", az: "Kimlik doğrulaması",
  },
  rmAuthAgent: {
    tr: "SSH ajanı (önerilen)", en: "SSH agent (recommended)", de: "SSH-Agent (empfohlen)", ru: "SSH-агент (рекомендуется)", ar: "وكيل SSH (موصى به)", es: "Agente SSH (recomendado)", fr: "Agent SSH (recommandé)", az: "SSH agenti (tövsiyə olunur)",
  },
  rmAuthKey: {
    tr: "Özel anahtar dosyası", en: "Private key file", de: "Private-Key-Datei", ru: "Файл закрытого ключа", ar: "ملف المفتاح الخاص", es: "Archivo de clave privada", fr: "Fichier de clé privée", az: "Şəxsi açar faylı",
  },
  rmAuthPassword: {
    tr: "Parola", en: "Password", de: "Passwort", ru: "Пароль", ar: "كلمة المرور", es: "Contraseña", fr: "Mot de passe", az: "Parol",
  },
  rmPickKey: {
    tr: "Anahtar seç…", en: "Choose key…", de: "Schlüssel wählen …", ru: "Выбрать ключ…", ar: "اختيار المفتاح…", es: "Elegir clave…", fr: "Choisir une clé…", az: "Açar seç…",
  },
  rmKeyNone: {
    tr: "Anahtar seçilmedi", en: "No key selected", de: "Kein Schlüssel gewählt", ru: "Ключ не выбран", ar: "لم يتم اختيار مفتاح", es: "Ninguna clave seleccionada", fr: "Aucune clé sélectionnée", az: "Açar seçilməyib",
  },
  rmStartDir: {
    tr: "Başlangıç klasörü (isteğe bağlı)", en: "Start folder (optional)", de: "Startordner (optional)", ru: "Начальная папка (необязательно)", ar: "المجلد الابتدائي (اختياري)", es: "Carpeta inicial (opcional)", fr: "Dossier de départ (facultatif)", az: "Başlanğıc qovluğu (ixtiyari)",
  },
  rmSave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Yadda saxla",
  },
  rmCancel: {
    tr: "Vazgeç", en: "Cancel", de: "Abbrechen", ru: "Отмена", ar: "إلغاء", es: "Cancelar", fr: "Annuler", az: "Ləğv et",
  },
  rmBack: {
    tr: "Geri", en: "Back", de: "Zurück", ru: "Назад", ar: "رجوع", es: "Atrás", fr: "Retour", az: "Geri",
  },
  rmConnectBtn: {
    tr: "Bağlan", en: "Connect", de: "Verbinden", ru: "Подключиться", ar: "اتصال", es: "Conectar", fr: "Se connecter", az: "Qoşul",
  },
  rmConnecting: {
    tr: "{h} sunucusuna bağlanılıyor…", en: "Connecting to {h}…", de: "Verbindung zu {h} wird hergestellt …", ru: "Подключение к {h}…", ar: "جارٍ الاتصال بـ {h}…", es: "Conectando con {h}…", fr: "Connexion à {h}…", az: "{h} serverinə qoşulur…",
  },
  rmPassword: {
    tr: "Parola", en: "Password", de: "Passwort", ru: "Пароль", ar: "كلمة المرور", es: "Contraseña", fr: "Mot de passe", az: "Parol",
  },
  rmPassphrase: {
    tr: "Anahtar parolası (varsa)", en: "Key passphrase (if any)", de: "Schlüssel-Passphrase (falls vorhanden)", ru: "Пароль ключа (если есть)", ar: "عبارة مرور المفتاح (إن وجدت)", es: "Frase de la clave (si la hay)", fr: "Phrase secrète de la clé (le cas échéant)", az: "Açar parolu (varsa)",
  },
  rmSecretNote: {
    tr: "Parola kaydedilmez; yalnız bu bağlantı için bellekte kullanılır.", en: "The password is never saved; it is only used in memory for this connection.", de: "Das Passwort wird nicht gespeichert; es wird nur für diese Verbindung im Arbeitsspeicher verwendet.", ru: "Пароль не сохраняется; он используется только в памяти для этого подключения.", ar: "لا يتم حفظ كلمة المرور؛ تُستخدم في الذاكرة فقط لهذا الاتصال.", es: "La contraseña no se guarda; solo se usa en memoria para esta conexión.", fr: "Le mot de passe n'est jamais enregistré ; il n'est utilisé qu'en mémoire pour cette connexion.", az: "Parol yadda saxlanmır; yalnız bu bağlantı üçün yaddaşda istifadə olunur.",
  },
  rmHkTitle: {
    tr: "Bu sunucuya ilk kez bağlanıyorsun", en: "First connection to this server", de: "Erste Verbindung zu diesem Server", ru: "Первое подключение к этому серверу", ar: "أول اتصال بهذا الخادم", es: "Primera conexión a este servidor", fr: "Première connexion à ce serveur", az: "Bu serverə ilk dəfə qoşulursan",
  },
  rmHkBody: {
    tr: "{h} sunucusunun parmak izi aşağıda. Sunucu yöneticisinden aldığın değerle aynıysa devam et; emin değilsen vazgeç.", en: "The fingerprint of {h} is shown below. Continue only if it matches the value from the server administrator; if you are unsure, cancel.", de: "Der Fingerabdruck von {h} steht unten. Fahre nur fort, wenn er mit dem Wert des Serveradministrators übereinstimmt; im Zweifel abbrechen.", ru: "Ниже показан отпечаток сервера {h}. Продолжайте, только если он совпадает со значением от администратора сервера; если не уверены, отмените.", ar: "بصمة الخادم {h} معروضة أدناه. تابع فقط إذا كانت مطابقة للقيمة التي حصلت عليها من مسؤول الخادم؛ وإن لم تكن متأكدًا فألغِ.", es: "La huella de {h} se muestra abajo. Continúa solo si coincide con el valor del administrador del servidor; si dudas, cancela.", fr: "L'empreinte de {h} est affichée ci-dessous. Continue uniquement si elle correspond à la valeur de l'administrateur du serveur ; en cas de doute, annule.", az: "{h} serverinin barmaq izi aşağıdadır. Yalnız server administratorundan aldığın dəyərlə eynidirsə davam et; əmin deyilsənsə ləğv et.",
  },
  rmHkFp: {
    tr: "Parmak izi (SHA256)", en: "Fingerprint (SHA256)", de: "Fingerabdruck (SHA256)", ru: "Отпечаток (SHA256)", ar: "البصمة (SHA256)", es: "Huella (SHA256)", fr: "Empreinte (SHA256)", az: "Barmaq izi (SHA256)",
  },
  rmHkTrust: {
    tr: "Güven ve devam et", en: "Trust and continue", de: "Vertrauen und fortfahren", ru: "Доверять и продолжить", ar: "الوثوق والمتابعة", es: "Confiar y continuar", fr: "Faire confiance et continuer", az: "Etibar et və davam et",
  },
  rmHkChangedTitle: {
    tr: "Sunucu parmak izi değişti!", en: "Server fingerprint changed!", de: "Server-Fingerabdruck hat sich geändert!", ru: "Отпечаток сервера изменился!", ar: "تغيّرت بصمة الخادم!", es: "¡La huella del servidor ha cambiado!", fr: "L'empreinte du serveur a changé !", az: "Serverin barmaq izi dəyişdi!",
  },
  rmHkChangedBody: {
    tr: "{h} sunucusunun kimliği daha önce kaydedilenden farklı. Bu bir ortadaki adam saldırısı olabilir; bağlantı kesildi. Sunucuyu bilerek yeniden kurduysan kayıtlı parmak izini unutup tekrar dene.", en: "The identity of {h} differs from the one saved earlier. This could be a man-in-the-middle attack, so the connection was cut. If you reinstalled the server on purpose, forget the saved fingerprint and try again.", de: "Die Identität von {h} weicht von der gespeicherten ab. Das könnte ein Man-in-the-Middle-Angriff sein, daher wurde die Verbindung getrennt. Wenn du den Server absichtlich neu installiert hast, vergiss den gespeicherten Fingerabdruck und versuche es erneut.", ru: "Идентификатор сервера {h} отличается от сохранённого ранее. Это может быть атака «человек посередине», поэтому соединение разорвано. Если вы намеренно переустановили сервер, забудьте сохранённый отпечаток и повторите попытку.", ar: "هوية الخادم {h} تختلف عن المحفوظة سابقًا. قد يكون هذا هجوم الرجل في المنتصف، لذلك تم قطع الاتصال. إذا أعدت تثبيت الخادم عمدًا فانسَ البصمة المحفوظة وحاول مجددًا.", es: "La identidad de {h} difiere de la guardada antes. Podría ser un ataque de intermediario, por eso se cortó la conexión. Si reinstalaste el servidor a propósito, olvida la huella guardada e inténtalo de nuevo.", fr: "L'identité de {h} diffère de celle enregistrée auparavant. Il pourrait s'agir d'une attaque de l'homme du milieu ; la connexion a été coupée. Si tu as réinstallé le serveur volontairement, oublie l'empreinte enregistrée et réessaie.", az: "{h} serverinin kimliyi əvvəl yadda saxlanandan fərqlidir. Bu, ortadakı adam hücumu ola bilər; bağlantı kəsildi. Serveri bilərəkdən yenidən quraşdırmısansa, yadda saxlanmış barmaq izini unudub yenidən yoxla.",
  },
  rmForget: {
    tr: "Kayıtlı parmak izini unut", en: "Forget saved fingerprint", de: "Gespeicherten Fingerabdruck vergessen", ru: "Забыть сохранённый отпечаток", ar: "نسيان البصمة المحفوظة", es: "Olvidar huella guardada", fr: "Oublier l'empreinte enregistrée", az: "Yadda saxlanmış barmaq izini unut",
  },
  rmFolderTitle: {
    tr: "Uzak klasör seç", en: "Choose remote folder", de: "Remote-Ordner wählen", ru: "Выберите удалённую папку", ar: "اختيار المجلد البعيد", es: "Elegir carpeta remota", fr: "Choisir le dossier distant", az: "Uzaq qovluğu seç",
  },
  rmOpenHere: {
    tr: "Bu klasörü aç", en: "Open this folder", de: "Diesen Ordner öffnen", ru: "Открыть эту папку", ar: "فتح هذا المجلد", es: "Abrir esta carpeta", fr: "Ouvrir ce dossier", az: "Bu qovluğu aç",
  },
  rmUp: {
    tr: "Üst klasör", en: "Parent folder", de: "Übergeordneter Ordner", ru: "Родительская папка", ar: "المجلد الأعلى", es: "Carpeta superior", fr: "Dossier parent", az: "Üst qovluq",
  },
  rmNoSub: {
    tr: "Alt klasör yok", en: "No subfolders", de: "Keine Unterordner", ru: "Нет вложенных папок", ar: "لا توجد مجلدات فرعية", es: "Sin subcarpetas", fr: "Aucun sous-dossier", az: "Alt qovluq yoxdur",
  },
  rmLimits: {
    tr: "Uzak klasörde Git paneli, arama ve yapay zekâ araçları henüz kapalı; sunucudaki Git'i terminalden kullanabilirsin.", en: "In a remote folder the Git panel, search and AI tools are not available yet; you can use the server's Git from the terminal.", de: "In einem Remote-Ordner sind Git-Bereich, Suche und KI-Werkzeuge noch nicht verfügbar; du kannst das Git des Servers im Terminal nutzen.", ru: "В удалённой папке панель Git, поиск и ИИ-инструменты пока недоступны; Git на сервере можно использовать в терминале.", ar: "في المجلد البعيد لا تتوفر لوحة Git والبحث وأدوات الذكاء الاصطناعي بعد؛ يمكنك استخدام Git الخاص بالخادم من الطرفية.", es: "En una carpeta remota el panel de Git, la búsqueda y las herramientas de IA aún no están disponibles; puedes usar el Git del servidor desde el terminal.", fr: "Dans un dossier distant, le panneau Git, la recherche et les outils d'IA ne sont pas encore disponibles ; tu peux utiliser le Git du serveur dans le terminal.", az: "Uzaq qovluqda Git paneli, axtarış və süni intellekt alətləri hələ əlçatan deyil; serverdəki Git-i terminaldan istifadə edə bilərsən.",
  },
  rmPrivacy: {
    tr: "Parola ve özel anahtar kaydedilmez. Dosyaların yalnız seçtiğin sunucu ile bilgisayarın arasında gider; başka yere gönderilmez.", en: "Passwords and private keys are never saved. Your files travel only between the server you choose and your computer, nowhere else.", de: "Passwörter und private Schlüssel werden nie gespeichert. Deine Dateien gehen nur zwischen dem gewählten Server und deinem Computer hin und her, sonst nirgendwohin.", ru: "Пароли и закрытые ключи не сохраняются. Ваши файлы передаются только между выбранным сервером и вашим компьютером и больше никуда.", ar: "لا يتم حفظ كلمات المرور والمفاتيح الخاصة. تنتقل ملفاتك فقط بين الخادم الذي تختاره وحاسوبك ولا تُرسل إلى أي مكان آخر.", es: "Las contraseñas y claves privadas nunca se guardan. Tus archivos viajan solo entre el servidor que eliges y tu equipo, a ningún otro sitio.", fr: "Les mots de passe et les clés privées ne sont jamais enregistrés. Tes fichiers circulent uniquement entre le serveur choisi et ton ordinateur, nulle part ailleurs.", az: "Parollar və şəxsi açarlar yadda saxlanmır. Fayllarını yalnız seçdiyin server ilə kompüterin arasında ötürülür, başqa yerə göndərilmir.",
  },
  rmLost: {
    tr: "Uzak bağlantı koptu: {h}", en: "Remote connection lost: {h}", de: "Remote-Verbindung getrennt: {h}", ru: "Удалённое подключение потеряно: {h}", ar: "انقطع الاتصال البعيد: {h}", es: "Se perdió la conexión remota: {h}", fr: "Connexion distante perdue : {h}", az: "Uzaq bağlantı kəsildi: {h}",
  },
  rmErrAuth: {
    tr: "Kimlik doğrulama başarısız: kullanıcı adı, parola veya anahtar yanlış.", en: "Authentication failed: wrong username, password or key.", de: "Authentifizierung fehlgeschlagen: Benutzername, Passwort oder Schlüssel falsch.", ru: "Не удалось пройти аутентификацию: неверное имя пользователя, пароль или ключ.", ar: "فشلت المصادقة: اسم المستخدم أو كلمة المرور أو المفتاح غير صحيح.", es: "Falló la autenticación: usuario, contraseña o clave incorrectos.", fr: "Échec de l'authentification : nom d'utilisateur, mot de passe ou clé incorrect.", az: "Kimlik doğrulaması uğursuz oldu: istifadəçi adı, parol və ya açar yanlışdır.",
  },
  rmErrNotFound: {
    tr: "Sunucu bulunamadı. Adresi kontrol et.", en: "Server not found. Check the address.", de: "Server nicht gefunden. Prüfe die Adresse.", ru: "Сервер не найден. Проверьте адрес.", ar: "لم يتم العثور على الخادم. تحقق من العنوان.", es: "Servidor no encontrado. Revisa la dirección.", fr: "Serveur introuvable. Vérifie l'adresse.", az: "Server tapılmadı. Ünvanı yoxla.",
  },
  rmErrRefused: {
    tr: "Bağlantı reddedildi. Port kapalı olabilir.", en: "Connection refused. The port may be closed.", de: "Verbindung abgelehnt. Der Port ist möglicherweise geschlossen.", ru: "Соединение отклонено. Возможно, порт закрыт.", ar: "تم رفض الاتصال. ربما المنفذ مغلق.", es: "Conexión rechazada. Puede que el puerto esté cerrado.", fr: "Connexion refusée. Le port est peut-être fermé.", az: "Bağlantı rədd edildi. Port bağlı ola bilər.",
  },
  rmErrTimeout: {
    tr: "Bağlantı zaman aşımına uğradı.", en: "The connection timed out.", de: "Zeitüberschreitung bei der Verbindung.", ru: "Время подключения истекло.", ar: "انتهت مهلة الاتصال.", es: "Se agotó el tiempo de conexión.", fr: "Délai de connexion dépassé.", az: "Bağlantı vaxtı bitdi.",
  },
  rmErrUnreachable: {
    tr: "Sunucuya ulaşılamıyor. Ağ bağlantını kontrol et.", en: "The server is unreachable. Check your network connection.", de: "Der Server ist nicht erreichbar. Prüfe deine Netzwerkverbindung.", ru: "Сервер недоступен. Проверьте сетевое подключение.", ar: "لا يمكن الوصول إلى الخادم. تحقق من اتصال الشبكة.", es: "No se puede alcanzar el servidor. Revisa tu conexión de red.", fr: "Le serveur est injoignable. Vérifie ta connexion réseau.", az: "Serverə çatmaq olmur. Şəbəkə bağlantını yoxla.",
  },
  rmErrAgent: {
    tr: "SSH ajanı bulunamadı. Ajanı başlat ya da başka bir yöntem seç.", en: "No SSH agent found. Start the agent or choose another method.", de: "Kein SSH-Agent gefunden. Starte den Agent oder wähle eine andere Methode.", ru: "SSH-агент не найден. Запустите агент или выберите другой способ.", ar: "لم يتم العثور على وكيل SSH. شغّل الوكيل أو اختر طريقة أخرى.", es: "No se encontró un agente SSH. Inícialo o elige otro método.", fr: "Aucun agent SSH trouvé. Démarre l'agent ou choisis une autre méthode.", az: "SSH agenti tapılmadı. Agenti işə sal və ya başqa üsul seç.",
  },
  rmErrKey: {
    tr: "Anahtar dosyası okunamadı veya geçersiz.", en: "The key file could not be read or is invalid.", de: "Die Schlüsseldatei konnte nicht gelesen werden oder ist ungültig.", ru: "Файл ключа не удалось прочитать, либо он недействителен.", ar: "تعذّرت قراءة ملف المفتاح أو أنه غير صالح.", es: "No se pudo leer el archivo de clave o no es válido.", fr: "Le fichier de clé est illisible ou invalide.", az: "Açar faylı oxuna bilmədi və ya etibarsızdır.",
  },
  rmErrPass: {
    tr: "Bu anahtar parola istiyor veya parola yanlış.", en: "This key needs a passphrase, or the passphrase is wrong.", de: "Dieser Schlüssel benötigt eine Passphrase, oder sie ist falsch.", ru: "Для этого ключа нужен пароль, либо он неверный.", ar: "هذا المفتاح يحتاج إلى عبارة مرور أو أن العبارة غير صحيحة.", es: "Esta clave necesita una frase de paso o la frase es incorrecta.", fr: "Cette clé nécessite une phrase secrète, ou elle est incorrecte.", az: "Bu açar parol tələb edir və ya parol yanlışdır.",
  },
  rmErrReject: {
    tr: "Sunucu parmak izi onaylanmadı; bağlantı kurulmadı.", en: "The server fingerprint was not approved; no connection was made.", de: "Der Server-Fingerabdruck wurde nicht bestätigt; es wurde keine Verbindung hergestellt.", ru: "Отпечаток сервера не подтверждён; соединение не установлено.", ar: "لم تتم الموافقة على بصمة الخادم؛ لم يتم إنشاء اتصال.", es: "No se aprobó la huella del servidor; no se estableció la conexión.", fr: "L'empreinte du serveur n'a pas été approuvée ; aucune connexion n'a été établie.", az: "Serverin barmaq izi təsdiqlənmədi; bağlantı qurulmadı.",
  },
  rmErrNoLib: {
    tr: "SSH bileşeni yüklü değil. Proje klasöründe `npm install` çalıştırıp uygulamayı yeniden başlat.", en: "The SSH component is not installed. Run `npm install` in the project folder and restart the app.", de: "Die SSH-Komponente ist nicht installiert. Führe `npm install` im Projektordner aus und starte die App neu.", ru: "Компонент SSH не установлен. Выполните `npm install` в папке проекта и перезапустите приложение.", ar: "مكوّن SSH غير مثبّت. شغّل `npm install` في مجلد المشروع ثم أعد تشغيل التطبيق.", es: "El componente SSH no está instalado. Ejecuta `npm install` en la carpeta del proyecto y reinicia la aplicación.", fr: "Le composant SSH n'est pas installé. Exécute `npm install` dans le dossier du projet puis redémarre l'application.", az: "SSH komponenti quraşdırılmayıb. Layihə qovluğunda `npm install` işlət və tətbiqi yenidən başlat.",
  },
  rmErrFolder: {
    tr: "Klasör açılamadı. Yolu ve izinlerini kontrol et.", en: "The folder could not be opened. Check the path and permissions.", de: "Der Ordner konnte nicht geöffnet werden. Prüfe Pfad und Berechtigungen.", ru: "Не удалось открыть папку. Проверьте путь и права доступа.", ar: "تعذّر فتح المجلد. تحقق من المسار والأذونات.", es: "No se pudo abrir la carpeta. Revisa la ruta y los permisos.", fr: "Impossible d'ouvrir le dossier. Vérifie le chemin et les permissions.", az: "Qovluq açıla bilmədi. Yolu və icazələri yoxla.",
  },
  rmErrGeneric: {
    tr: "Bağlanılamadı. Bilgileri kontrol edip tekrar dene.", en: "Could not connect. Check the details and try again.", de: "Verbindung nicht möglich. Prüfe die Angaben und versuche es erneut.", ru: "Не удалось подключиться. Проверьте данные и повторите попытку.", ar: "تعذّر الاتصال. تحقق من البيانات وحاول مجددًا.", es: "No se pudo conectar. Revisa los datos e inténtalo de nuevo.", fr: "Connexion impossible. Vérifie les informations et réessaie.", az: "Qoşulmaq mümkün olmadı. Məlumatları yoxlayıb yenidən cəhd et.",
  },
  rmErrInvalid: {
    tr: "Bilgiler geçersiz: adres, kullanıcı adı, port ve klasör yolunu kontrol et.", en: "Invalid details: check the address, username, port and folder path.", de: "Ungültige Angaben: Prüfe Adresse, Benutzername, Port und Ordnerpfad.", ru: "Неверные данные: проверьте адрес, имя пользователя, порт и путь к папке.", ar: "بيانات غير صالحة: تحقق من العنوان واسم المستخدم والمنفذ ومسار المجلد.", es: "Datos no válidos: revisa la dirección, el usuario, el puerto y la ruta de la carpeta.", fr: "Informations invalides : vérifie l'adresse, l'utilisateur, le port et le chemin du dossier.", az: "Məlumatlar yanlışdır: ünvanı, istifadəçi adını, portu və qovluq yolunu yoxla.",
  },
} satisfies Record<string, Dict>;

export type RemoteTextKey = keyof typeof REMOTE_TEXT;

registerTexts(REMOTE_TEXT);
