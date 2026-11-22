// Hata ayıklayıcı, dil sunucusu ve gelişmiş terminal arayüz metinleri (8 dil). Ana pakette değil, bu bölümlerle birlikte gecikmeli yüklenir.
// Modül yüklenince kendini t() kaydına ekler; kullanan bileşenler bu dosyayı içe aktarmalıdır.
import { registerTexts, type UiLang } from './uiText';

type Dict = Record<UiLang, string>;

export const DEV_TEXT = {
  dbgTitle: {
    tr: "Hata ayıkla", en: "Debug", de: "Debuggen", ru: "Отладка", ar: "التصحيح", es: "Depurar", fr: "Déboguer", az: "Debaq",
  },
  dbgStart: {
    tr: "Hata ayıklamayı başlat", en: "Start debugging", de: "Debugging starten", ru: "Начать отладку", ar: "بدء التصحيح", es: "Iniciar depuración", fr: "Démarrer le débogage", az: "Debaqı başlat",
  },
  dbgStop: {
    tr: "Hata ayıklamayı durdur (Shift+F5)", en: "Stop debugging (Shift+F5)", de: "Debugging beenden (Shift+F5)", ru: "Остановить отладку (Shift+F5)", ar: "إيقاف التصحيح (Shift+F5)", es: "Detener depuración (Shift+F5)", fr: "Arrêter le débogage (Shift+F5)", az: "Debaqı dayandır (Shift+F5)",
  },
  dbgContinue: {
    tr: "Devam", en: "Continue", de: "Fortsetzen", ru: "Продолжить", ar: "متابعة", es: "Continuar", fr: "Continuer", az: "Davam",
  },
  dbgStepOver: {
    tr: "Adım at (F10)", en: "Step over (F10)", de: "Überspringen (F10)", ru: "Шаг с обходом (F10)", ar: "تخطّي (F10)", es: "Paso por encima (F10)", fr: "Pas à pas principal (F10)", az: "Üstündən keç (F10)",
  },
  dbgStepInto: {
    tr: "İçine gir (F11)", en: "Step into (F11)", de: "Einzelschritt (F11)", ru: "Шаг с заходом (F11)", ar: "الدخول (F11)", es: "Paso al interior (F11)", fr: "Pas à pas détaillé (F11)", az: "İçinə gir (F11)",
  },
  dbgStepOut: {
    tr: "Dışına çık (Shift+F11)", en: "Step out (Shift+F11)", de: "Ausführen bis Rücksprung (Shift+F11)", ru: "Шаг с выходом (Shift+F11)", ar: "الخروج (Shift+F11)", es: "Paso para salir (Shift+F11)", fr: "Pas à pas sortant (Shift+F11)", az: "Çıx (Shift+F11)",
  },
  dbgPause: {
    tr: "Duraklat", en: "Pause", de: "Anhalten", ru: "Пауза", ar: "إيقاف مؤقت", es: "Pausar", fr: "Pause", az: "Fasilə",
  },
  dbgVariables: {
    tr: "Değişkenler", en: "Variables", de: "Variablen", ru: "Переменные", ar: "المتغيّرات", es: "Variables", fr: "Variables", az: "Dəyişənlər",
  },
  dbgCallStack: {
    tr: "Çağrı yığını", en: "Call stack", de: "Aufrufliste", ru: "Стек вызовов", ar: "مكدس الاستدعاءات", es: "Pila de llamadas", fr: "Pile d’appels", az: "Çağırış yığını",
  },
  dbgBreakpoints: {
    tr: "Kesme noktaları", en: "Breakpoints", de: "Haltepunkte", ru: "Точки останова", ar: "نقاط التوقف", es: "Puntos de interrupción", fr: "Points d’arrêt", az: "Dayanma nöqtələri",
  },
  dbgConsole: {
    tr: "Hata ayıklama konsolu", en: "Debug console", de: "Debugkonsole", ru: "Консоль отладки", ar: "وحدة تحكم التصحيح", es: "Consola de depuración", fr: "Console de débogage", az: "Debaq konsolu",
  },
  dbgNoSession: {
    tr: "Etkin oturum yok. Bir JavaScript dosyası açıp başlat.", en: "No active session. Open a JavaScript file and start.", de: "Keine aktive Sitzung. Öffne eine JavaScript-Datei und starte.", ru: "Нет активной сессии. Откройте файл JavaScript и запустите.", ar: "لا توجد جلسة نشطة. افتح ملف JavaScript وابدأ.", es: "No hay sesión activa. Abre un archivo JavaScript e inicia.", fr: "Aucune session active. Ouvre un fichier JavaScript et démarre.", az: "Aktiv sessiya yoxdur. JavaScript faylı açıb başlat.",
  },
  dbgOnlyJs: {
    tr: "Hata ayıklama şimdilik JavaScript (.js, .mjs, .cjs) dosyalarında çalışır.", en: "Debugging currently works for JavaScript files (.js, .mjs, .cjs).", de: "Debugging funktioniert derzeit für JavaScript-Dateien (.js, .mjs, .cjs).", ru: "Отладка пока работает для файлов JavaScript (.js, .mjs, .cjs).", ar: "يعمل التصحيح حالياً مع ملفات JavaScript (.js و.mjs و.cjs).", es: "La depuración funciona por ahora con archivos JavaScript (.js, .mjs, .cjs).", fr: "Le débogage fonctionne pour l’instant avec les fichiers JavaScript (.js, .mjs, .cjs).", az: "Debaq hələlik JavaScript fayllarında (.js, .mjs, .cjs) işləyir.",
  },
  dbgNeedFolder: {
    tr: "Hata ayıklamak için önce bir klasör aç.", en: "Open a folder first to debug.", de: "Öffne zum Debuggen zuerst einen Ordner.", ru: "Сначала откройте папку для отладки.", ar: "افتح مجلداً أولاً للتصحيح.", es: "Abre primero una carpeta para depurar.", fr: "Ouvre d’abord un dossier pour déboguer.", az: "Debaq üçün əvvəlcə qovluq aç.",
  },
  dbgRunning: {
    tr: "Çalışıyor…", en: "Running…", de: "Läuft…", ru: "Выполняется…", ar: "قيد التشغيل…", es: "Ejecutando…", fr: "En cours…", az: "İşləyir…",
  },
  dbgStarting: {
    tr: "Başlatılıyor…", en: "Starting…", de: "Wird gestartet…", ru: "Запуск…", ar: "جارٍ البدء…", es: "Iniciando…", fr: "Démarrage…", az: "Başladılır…",
  },
  dbgPausedAt: {
    tr: "Durdu", en: "Paused", de: "Angehalten", ru: "Приостановлено", ar: "متوقف", es: "En pausa", fr: "En pause", az: "Dayandı",
  },
  dbgExited: {
    tr: "Süreç bitti (kod {c})", en: "Process exited (code {c})", de: "Prozess beendet (Code {c})", ru: "Процесс завершён (код {c})", ar: "انتهت العملية (الرمز {c})", es: "Proceso terminado (código {c})", fr: "Processus terminé (code {c})", az: "Proses bitdi (kod {c})",
  },
  dbgEvalPlaceholder: {
    tr: "İfade değerlendir…", en: "Evaluate expression…", de: "Ausdruck auswerten…", ru: "Вычислить выражение…", ar: "تقييم تعبير…", es: "Evaluar expresión…", fr: "Évaluer une expression…", az: "İfadəni qiymətləndir…",
  },
  dbgToggleBp: {
    tr: "Kesme noktası ekle/kaldır (F9)", en: "Toggle breakpoint (F9)", de: "Haltepunkt umschalten (F9)", ru: "Переключить точку останова (F9)", ar: "تبديل نقطة التوقف (F9)", es: "Alternar punto de interrupción (F9)", fr: "Basculer le point d’arrêt (F9)", az: "Dayanma nöqtəsini dəyiş (F9)",
  },
  dbgNoBreakpoints: {
    tr: "Kesme noktası yok. Satır numarasının soluna tıkla.", en: "No breakpoints. Click left of a line number.", de: "Keine Haltepunkte. Links neben der Zeilennummer klicken.", ru: "Нет точек останова. Щёлкните слева от номера строки.", ar: "لا توجد نقاط توقف. انقر يسار رقم السطر.", es: "Sin puntos de interrupción. Haz clic a la izquierda del número de línea.", fr: "Aucun point d’arrêt. Clique à gauche du numéro de ligne.", az: "Dayanma nöqtəsi yoxdur. Sətir nömrəsinin solunda klik et.",
  },
  dbgRemoveAll: {
    tr: "Tümünü kaldır", en: "Remove all", de: "Alle entfernen", ru: "Удалить все", ar: "إزالة الكل", es: "Quitar todos", fr: "Tout supprimer", az: "Hamısını sil",
  },
  dbgDesktopOnly: {
    tr: "Hata ayıklayıcı yalnızca masaüstü uygulamasında çalışır.", en: "The debugger works only in the desktop app.", de: "Der Debugger funktioniert nur in der Desktop-App.", ru: "Отладчик работает только в настольном приложении.", ar: "يعمل المصحّح في تطبيق سطح المكتب فقط.", es: "El depurador solo funciona en la aplicación de escritorio.", fr: "Le débogueur ne fonctionne que dans l’application de bureau.", az: "Debaqer yalnız masaüstü tətbiqində işləyir.",
  },
  dbgEmpty: {
    tr: "Değişken yok", en: "No variables", de: "Keine Variablen", ru: "Нет переменных", ar: "لا متغيّرات", es: "Sin variables", fr: "Aucune variable", az: "Dəyişən yoxdur",
  },
  termFull: {
    tr: "tam", en: "full", de: "voll", ru: "полный", ar: "كامل", es: "completo", fr: "complet", az: "tam",
  },
  termClassic: {
    tr: "klasik", en: "classic", de: "klassisch", ru: "классический", ar: "كلاسيكي", es: "clásico", fr: "classique", az: "klassik",
  },
  termNoGitBash: {
    tr: "Git Bash bulunamadı. Git for Windows'u kur (git-scm.com) ve yeniden dene.", en: "Git Bash was not found. Install Git for Windows (git-scm.com) and try again.", de: "Git Bash wurde nicht gefunden. Installiere Git for Windows (git-scm.com) und versuche es erneut.", ru: "Git Bash не найден. Установи Git for Windows (git-scm.com) и повтори попытку.", ar: "لم يتم العثور على Git Bash. ثبّت Git for Windows (git-scm.com) وأعد المحاولة.", es: "No se encontró Git Bash. Instala Git for Windows (git-scm.com) e inténtalo de nuevo.", fr: "Git Bash est introuvable. Installe Git for Windows (git-scm.com) puis réessaie.", az: "Git Bash tapılmadı. Git for Windows-u (git-scm.com) quraşdır və yenidən cəhd et.",
  },
  termPtyUnavailable: {
    tr: "Gerçek terminal bileşeni yüklenemedi. Klasik terminali kullan.", en: "The real terminal component could not be loaded. Use the classic terminal.", de: "Die echte Terminal-Komponente konnte nicht geladen werden. Nutze das klassische Terminal.", ru: "Не удалось загрузить компонент полноценного терминала. Используйте классический терминал.", ar: "تعذّر تحميل مكوّن الطرفية الحقيقية. استخدم الطرفية الكلاسيكية.", es: "No se pudo cargar el componente del terminal real. Usa el terminal clásico.", fr: "Le composant du vrai terminal n’a pas pu être chargé. Utilise le terminal classique.", az: "Real terminal komponenti yüklənmədi. Klassik terminaldan istifadə et.",
  },
  set_terminalMode: {
    tr: "Terminal türü", en: "Terminal type", de: "Terminal-Typ", ru: "Тип терминала", ar: "نوع الطرفية", es: "Tipo de terminal", fr: "Type de terminal", az: "Terminal növü",
  },
  setDesc_terminalMode: {
    tr: "Tam terminal gerçek bir kabuktur (vim, htop, Ctrl+C çalışır; xterm.js). Klasik terminal satır içi istemli hafif görünümdür.", en: "The full terminal is a real shell (vim, htop and Ctrl+C work; xterm.js). The classic terminal is the lightweight view with an inline prompt.", de: "Das volle Terminal ist eine echte Shell (vim, htop und Strg+C funktionieren; xterm.js). Das klassische Terminal ist die leichte Ansicht mit Inline-Prompt.", ru: "Полный терминал — настоящая оболочка (работают vim, htop и Ctrl+C; xterm.js). Классический — лёгкий вид со встроенной строкой ввода.", ar: "الطرفية الكاملة هي صدفة حقيقية (تعمل vim وhtop وCtrl+C؛ xterm.js). الكلاسيكية هي العرض الخفيف بمحث مضمّن.", es: "El terminal completo es un shell real (funcionan vim, htop y Ctrl+C; xterm.js). El clásico es la vista ligera con prompt en línea.", fr: "Le terminal complet est un vrai shell (vim, htop et Ctrl+C fonctionnent ; xterm.js). Le classique est la vue légère avec invite intégrée.", az: "Tam terminal real qabıqdır (vim, htop və Ctrl+C işləyir; xterm.js). Klassik terminal sətiriçi dəvətli yüngül görünüşdür.",
  },
  optTermFull: {
    tr: "Tam terminal (PTY)", en: "Full terminal (PTY)", de: "Volles Terminal (PTY)", ru: "Полный терминал (PTY)", ar: "طرفية كاملة (PTY)", es: "Terminal completo (PTY)", fr: "Terminal complet (PTY)", az: "Tam terminal (PTY)",
  },
  optTermClassic: {
    tr: "Klasik (satır içi istem)", en: "Classic (inline prompt)", de: "Klassisch (Inline-Prompt)", ru: "Классический (строка ввода)", ar: "كلاسيكي (محث مضمّن)", es: "Clásico (prompt en línea)", fr: "Classique (invite intégrée)", az: "Klassik (sətiriçi dəvət)",
  },
  lspReady: {
    tr: "Dil sunucusu çalışıyor: {n}", en: "Language server running: {n}", de: "Sprachserver läuft: {n}", ru: "Языковой сервер работает: {n}", ar: "خادم اللغة يعمل: {n}", es: "Servidor de lenguaje activo: {n}", fr: "Serveur de langage actif : {n}", az: "Dil serveri işləyir: {n}",
  },
  lspStarting: {
    tr: "Dil sunucusu başlıyor: {n}…", en: "Language server starting: {n}…", de: "Sprachserver startet: {n}…", ru: "Языковой сервер запускается: {n}…", ar: "جارٍ تشغيل خادم اللغة: {n}…", es: "Iniciando servidor de lenguaje: {n}…", fr: "Démarrage du serveur de langage : {n}…", az: "Dil serveri başlayır: {n}…",
  },
  lspMissing: {
    tr: "{n} kurulu değil. Kurulum: {h}", en: "{n} is not installed. Install: {h}", de: "{n} ist nicht installiert. Installation: {h}", ru: "{n} не установлен. Установка: {h}", ar: "{n} غير مثبّت. التثبيت: {h}", es: "{n} no está instalado. Instalación: {h}", fr: "{n} n’est pas installé. Installation : {h}", az: "{n} quraşdırılmayıb. Quraşdırma: {h}",
  },
  lspError: {
    tr: "Dil sunucusu hata verdi: {n}", en: "Language server failed: {n}", de: "Sprachserver-Fehler: {n}", ru: "Ошибка языкового сервера: {n}", ar: "فشل خادم اللغة: {n}", es: "Falló el servidor de lenguaje: {n}", fr: "Échec du serveur de langage : {n}", az: "Dil serveri xəta verdi: {n}",
  },
  set_lspEnabled: {
    tr: "Dil sunucuları (LSP)", en: "Language servers (LSP)", de: "Sprachserver (LSP)", ru: "Языковые серверы (LSP)", ar: "خوادم اللغة (LSP)", es: "Servidores de lenguaje (LSP)", fr: "Serveurs de langage (LSP)", az: "Dil serverləri (LSP)",
  },
  setDesc_lspEnabled: {
    tr: "Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua ve YAML için bilgisayarında kurulu dil sunucusuyla tamamlama, üzerine gelme, tanıma git ve hata işaretleri. Sunucu yalnız PATH'inden başlatılır; açtığın projenin içindeki programlar çalıştırılmaz. Kod bu bilgisayardan çıkmaz.", en: "Completion, hover, go to definition and error marks for Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua and YAML using a language server installed on your computer. The server is started only from your PATH; programs inside the project you open are never run. Code does not leave this computer.", de: "Vervollständigung, Hover, Gehe zu Definition und Fehlermarkierungen für Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua und YAML mit einem auf deinem Computer installierten Sprachserver. Der Server wird nur über deinen PATH gestartet; Programme im geöffneten Projekt werden nie ausgeführt. Code verlässt diesen Computer nicht.", ru: "Автодополнение, подсказки, переход к определению и отметки ошибок для Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua и YAML через языковой сервер, установленный на вашем компьютере. Сервер запускается только из PATH; программы внутри открытого проекта никогда не запускаются. Код не покидает этот компьютер.", ar: "إكمال تلقائي وتلميحات والانتقال إلى التعريف وعلامات الأخطاء للغات Python وRust وGo وC/C++ وC# وPHP وRuby وLua وYAML عبر خادم لغة مثبّت على حاسوبك. يُشغَّل الخادم من PATH فقط؛ لا تُشغَّل أبداً البرامج الموجودة داخل المشروع المفتوح. لا تغادر الشيفرة هذا الحاسوب.", es: "Autocompletado, información al pasar el cursor, ir a la definición y marcas de error para Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua y YAML con un servidor de lenguaje instalado en tu equipo. El servidor se inicia solo desde tu PATH; nunca se ejecutan programas del proyecto abierto. El código no sale de este equipo.", fr: "Complétion, survol, aller à la définition et marques d’erreur pour Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua et YAML avec un serveur de langage installé sur ton ordinateur. Le serveur n’est lancé que depuis ton PATH ; les programmes du projet ouvert ne sont jamais exécutés. Le code ne quitte pas cet ordinateur.", az: "Kompüterində quraşdırılmış dil serveri ilə Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua və YAML üçün tamamlama, üzərinə gəlmə, tərifə keç və xəta işarələri. Server yalnız PATH-dən başladılır; açdığın layihənin içindəki proqramlar heç vaxt işlədilmir. Kod bu kompüterdən çıxmır.",
  },
  // ---- Yerel geçmiş (F-07), snippet'ler (F-06), çöp kutusu (B-04) ----
  set_localHistory: {
    tr: "Yerel geçmiş", en: "Local history", de: "Lokaler Verlauf", ru: "Локальная история", ar: "السجل المحلي", es: "Historial local", fr: "Historique local", az: "Yerli tarixçə",
  },
  setDesc_localHistory: {
    tr: "Her kayıtta dosyanın eski sürümü bu bilgisayarda saklanır (zaman çizelgesi). Hiçbir yere gönderilmez. Kapatınca tüm yerel geçmiş silinir.", en: "On every save the previous version of the file is kept on this computer (timeline). Nothing is sent anywhere. Turning this off deletes all local history.", de: "Bei jedem Speichern wird die vorherige Version der Datei auf diesem Computer aufbewahrt (Zeitleiste). Es wird nichts versendet. Beim Ausschalten wird der gesamte lokale Verlauf gelöscht.", ru: "При каждом сохранении предыдущая версия файла остаётся на этом компьютере (временная шкала). Ничего не отправляется. При отключении вся локальная история удаляется.", ar: "عند كل حفظ تُحفظ النسخة السابقة من الملف على هذا الحاسوب (الخط الزمني). لا يُرسل أي شيء إلى أي مكان. إيقاف الميزة يحذف كل السجل المحلي.", es: "En cada guardado se conserva la versión anterior del archivo en este equipo (línea de tiempo). No se envía nada. Al desactivarlo se borra todo el historial local.", fr: "À chaque enregistrement, la version précédente du fichier est conservée sur cet ordinateur (chronologie). Rien n'est envoyé. La désactivation supprime tout l'historique local.", az: "Hər yadda saxlamada faylın əvvəlki versiyası bu kompüterdə saxlanır (zaman xətti). Heç bir yerə göndərilmir. Söndürəndə bütün yerli tarixçə silinir.",
  },
  set_localHistoryMax: {
    tr: "Dosya başına sürüm sayısı", en: "Versions per file", de: "Versionen pro Datei", ru: "Версий на файл", ar: "عدد النسخ لكل ملف", es: "Versiones por archivo", fr: "Versions par fichier", az: "Fayl başına versiya sayı",
  },
  setDesc_localHistoryMax: {
    tr: "Eski sürümler bu sınırı aşınca en eskiden başlayarak silinir. 1 MB'tan büyük ve ikili dosyalar kaydedilmez.", en: "Older versions are deleted, oldest first, once this limit is exceeded. Files over 1 MB and binary files are not kept.", de: "Ältere Versionen werden bei Überschreitung dieses Limits gelöscht, die älteste zuerst. Dateien über 1 MB und Binärdateien werden nicht gespeichert.", ru: "Старые версии удаляются, начиная с самых старых, при превышении лимита. Файлы больше 1 МБ и двоичные файлы не сохраняются.", ar: "تُحذف النسخ الأقدم أولًا عند تجاوز هذا الحد. لا تُحفظ الملفات الأكبر من 1 ميغابايت ولا الملفات الثنائية.", es: "Las versiones antiguas se eliminan, empezando por la más antigua, al superar este límite. No se guardan archivos de más de 1 MB ni binarios.", fr: "Les anciennes versions sont supprimées, les plus anciennes d'abord, au-delà de cette limite. Les fichiers de plus de 1 Mo et les fichiers binaires ne sont pas conservés.", az: "Limit aşıldıqda köhnə versiyalar ən köhnədən başlayaraq silinir. 1 MB-dan böyük və ikili fayllar saxlanmır.",
  },
  cmdTimeline: {
    tr: "Zaman çizelgesi (yerel geçmiş)", en: "Timeline (local history)", de: "Zeitleiste (lokaler Verlauf)", ru: "Временная шкала (локальная история)", ar: "الخط الزمني (السجل المحلي)", es: "Línea de tiempo (historial local)", fr: "Chronologie (historique local)", az: "Zaman xətti (yerli tarixçə)",
  },
  cmdSnippets: {
    tr: "Snippet ekle/düzenle", en: "Add/edit snippets", de: "Snippets hinzufügen/bearbeiten", ru: "Добавить/изменить сниппеты", ar: "إضافة/تعديل المقتطفات", es: "Añadir/editar fragmentos", fr: "Ajouter/modifier des snippets", az: "Snippet əlavə et/redaktə et",
  },
  tlTitle: {
    tr: "Zaman çizelgesi", en: "Timeline", de: "Zeitleiste", ru: "Временная шкала", ar: "الخط الزمني", es: "Línea de tiempo", fr: "Chronologie", az: "Zaman xətti",
  },
  tlLocalNote: {
    tr: "Sürümler yalnız bu bilgisayarda saklanır.", en: "Versions are stored only on this computer.", de: "Versionen werden nur auf diesem Computer gespeichert.", ru: "Версии хранятся только на этом компьютере.", ar: "تُحفظ النسخ على هذا الحاسوب فقط.", es: "Las versiones se guardan solo en este equipo.", fr: "Les versions sont stockées uniquement sur cet ordinateur.", az: "Versiyalar yalnız bu kompüterdə saxlanır.",
  },
  tlTabFile: {
    tr: "Bu dosya", en: "This file", de: "Diese Datei", ru: "Этот файл", ar: "هذا الملف", es: "Este archivo", fr: "Ce fichier", az: "Bu fayl",
  },
  tlTabDeleted: {
    tr: "Silinenler", en: "Deleted", de: "Gelöscht", ru: "Удалённые", ar: "المحذوفة", es: "Eliminados", fr: "Supprimés", az: "Silinənlər",
  },
  tlNoFile: {
    tr: "Etkin bir dosya yok. Bir dosya açıp tekrar dene.", en: "No active file. Open a file and try again.", de: "Keine aktive Datei. Öffne eine Datei und versuche es erneut.", ru: "Нет активного файла. Откройте файл и повторите.", ar: "لا يوجد ملف نشط. افتح ملفًا وحاول مجددًا.", es: "No hay archivo activo. Abre uno e inténtalo de nuevo.", fr: "Aucun fichier actif. Ouvre un fichier et réessaie.", az: "Aktiv fayl yoxdur. Fayl açıb yenidən yoxla.",
  },
  tlOff: {
    tr: "Yerel geçmiş kapalı. Ayarlar > Dosyalar bölümünden açabilirsin.", en: "Local history is off. You can turn it on in Settings > Files.", de: "Der lokale Verlauf ist aus. Du kannst ihn unter Einstellungen > Dateien aktivieren.", ru: "Локальная история отключена. Включите её в Настройки > Файлы.", ar: "السجل المحلي متوقف. يمكنك تشغيله من الإعدادات > الملفات.", es: "El historial local está desactivado. Puedes activarlo en Ajustes > Archivos.", fr: "L'historique local est désactivé. Tu peux l'activer dans Paramètres > Fichiers.", az: "Yerli tarixçə söndürülüb. Parametrlər > Fayllar bölməsindən aça bilərsən.",
  },
  tlEmpty: {
    tr: "Bu dosyanın kayıtlı sürümü yok. Dosyayı kaydettikçe sürümler burada görünür.", en: "No saved versions for this file yet. Versions appear here as you save.", de: "Noch keine gespeicherten Versionen. Beim Speichern erscheinen sie hier.", ru: "Сохранённых версий пока нет. Они появятся здесь при сохранении.", ar: "لا توجد نسخ محفوظة لهذا الملف بعد. ستظهر هنا عند الحفظ.", es: "Aún no hay versiones guardadas. Aparecerán aquí al guardar.", fr: "Aucune version enregistrée pour l'instant. Elles apparaîtront ici à chaque enregistrement.", az: "Hələ saxlanmış versiya yoxdur. Yadda saxladıqca burada görünəcək.",
  },
  tlDeletedNone: {
    tr: "Kurtarılabilecek silinmiş dosya yok.", en: "No deleted files to recover.", de: "Keine gelöschten Dateien zum Wiederherstellen.", ru: "Нет удалённых файлов для восстановления.", ar: "لا توجد ملفات محذوفة يمكن استرجاعها.", es: "No hay archivos eliminados para recuperar.", fr: "Aucun fichier supprimé à récupérer.", az: "Bərpa ediləcək silinmiş fayl yoxdur.",
  },
  tlCompare: {
    tr: "Güncel olanla karşılaştır", en: "Compare with current", de: "Mit aktuell vergleichen", ru: "Сравнить с текущим", ar: "مقارنة بالحالي", es: "Comparar con el actual", fr: "Comparer avec l'actuel", az: "Cari ilə müqayisə et",
  },
  tlRestore: {
    tr: "Geri yükle", en: "Restore", de: "Wiederherstellen", ru: "Восстановить", ar: "استرجاع", es: "Restaurar", fr: "Restaurer", az: "Bərpa et",
  },
  tlRestoreConfirm: {
    tr: "Bu sürüm dosyaya yazılacak. Mevcut içerik de yerel geçmişe eklenir. Devam edilsin mi?", en: "This version will be written to the file. The current content is also added to local history. Continue?", de: "Diese Version wird in die Datei geschrieben. Der aktuelle Inhalt wird ebenfalls im lokalen Verlauf gesichert. Fortfahren?", ru: "Эта версия будет записана в файл. Текущее содержимое тоже попадёт в локальную историю. Продолжить?", ar: "ستُكتب هذه النسخة في الملف، ويُضاف المحتوى الحالي إلى السجل المحلي. هل تريد المتابعة؟", es: "Esta versión se escribirá en el archivo. El contenido actual también se añade al historial local. ¿Continuar?", fr: "Cette version sera écrite dans le fichier. Le contenu actuel est aussi ajouté à l'historique local. Continuer ?", az: "Bu versiya fayla yazılacaq. Cari məzmun da yerli tarixçəyə əlavə olunur. Davam edilsin?",
  },
  tlRestored: {
    tr: "Geri yüklendi: {n}", en: "Restored: {n}", de: "Wiederhergestellt: {n}", ru: "Восстановлено: {n}", ar: "تم الاسترجاع: {n}", es: "Restaurado: {n}", fr: "Restauré : {n}", az: "Bərpa edildi: {n}",
  },
  tlRestoreFail: {
    tr: "Geri yüklenemedi: {e}", en: "Could not restore: {e}", de: "Wiederherstellung fehlgeschlagen: {e}", ru: "Не удалось восстановить: {e}", ar: "تعذّر الاسترجاع: {e}", es: "No se pudo restaurar: {e}", fr: "Restauration impossible : {e}", az: "Bərpa alınmadı: {e}",
  },
  tlDiffTitle: {
    tr: "{n} (geçmiş ↔ güncel)", en: "{n} (history ↔ current)", de: "{n} (Verlauf ↔ aktuell)", ru: "{n} (история ↔ текущий)", ar: "{n} (السجل ↔ الحالي)", es: "{n} (historial ↔ actual)", fr: "{n} (historique ↔ actuel)", az: "{n} (tarixçə ↔ cari)",
  },
  tlVersionsCount: {
    tr: "{n} sürüm", en: "{n} versions", de: "{n} Versionen", ru: "Версий: {n}", ar: "{n} نسخة", es: "{n} versiones", fr: "{n} versions", az: "{n} versiya",
  },
  tlClearFile: {
    tr: "Bu dosyanın geçmişini sil", en: "Delete this file's history", de: "Verlauf dieser Datei löschen", ru: "Удалить историю файла", ar: "حذف سجل هذا الملف", es: "Borrar el historial de este archivo", fr: "Supprimer l'historique de ce fichier", az: "Bu faylın tarixçəsini sil",
  },
  tlClearAll: {
    tr: "Tüm yerel geçmişi sil", en: "Delete all local history", de: "Gesamten lokalen Verlauf löschen", ru: "Удалить всю локальную историю", ar: "حذف كل السجل المحلي", es: "Borrar todo el historial local", fr: "Supprimer tout l'historique local", az: "Bütün yerli tarixçəni sil",
  },
  tlClearConfirm: {
    tr: "Yerel geçmiş kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?", en: "Local history will be permanently deleted. This cannot be undone. Continue?", de: "Der lokale Verlauf wird endgültig gelöscht. Das lässt sich nicht rückgängig machen. Fortfahren?", ru: "Локальная история будет удалена безвозвратно. Продолжить?", ar: "سيُحذف السجل المحلي نهائيًا ولا يمكن التراجع. هل تريد المتابعة؟", es: "El historial local se borrará de forma permanente. No se puede deshacer. ¿Continuar?", fr: "L'historique local sera supprimé définitivement. Action irréversible. Continuer ?", az: "Yerli tarixçə həmişəlik silinəcək. Geri qaytarmaq olmaz. Davam edilsin?",
  },
  tlRecover: {
    tr: "Kurtar", en: "Recover", de: "Wiederherstellen", ru: "Вернуть", ar: "استرجاع", es: "Recuperar", fr: "Récupérer", az: "Bərpa et",
  },
  appDeletePermanentConfirm: {
    tr: "Çöp kutusuna taşınamadı. Kalıcı olarak silinsin mi? Bu işlem geri alınamaz.", en: "Could not move to the trash. Delete permanently? This cannot be undone.", de: "Verschieben in den Papierkorb fehlgeschlagen. Endgültig löschen? Das lässt sich nicht rückgängig machen.", ru: "Не удалось переместить в корзину. Удалить безвозвратно? Это нельзя отменить.", ar: "تعذّر النقل إلى سلة المحذوفات. هل تريد الحذف نهائيًا؟ لا يمكن التراجع.", es: "No se pudo mover a la papelera. ¿Eliminar de forma permanente? No se puede deshacer.", fr: "Impossible de déplacer vers la corbeille. Supprimer définitivement ? Action irréversible.", az: "Zibil qutusuna köçürülmədi. Həmişəlik silinsin? Geri qaytarmaq olmaz.",
  },
  snTitle: {
    tr: "Snippet'ler", en: "Snippets", de: "Snippets", ru: "Сниппеты", ar: "المقتطفات", es: "Fragmentos", fr: "Snippets", az: "Snippet-lər",
  },
  snScopeUser: {
    tr: "Genel (tüm klasörler)", en: "Global (all folders)", de: "Global (alle Ordner)", ru: "Глобальные (все папки)", ar: "عام (كل المجلدات)", es: "Globales (todas las carpetas)", fr: "Globaux (tous les dossiers)", az: "Ümumi (bütün qovluqlar)",
  },
  snScopeWorkspace: {
    tr: "Bu klasör (.nova/snippets.json)", en: "This folder (.nova/snippets.json)", de: "Dieser Ordner (.nova/snippets.json)", ru: "Эта папка (.nova/snippets.json)", ar: "هذا المجلد (.nova/snippets.json)", es: "Esta carpeta (.nova/snippets.json)", fr: "Ce dossier (.nova/snippets.json)", az: "Bu qovluq (.nova/snippets.json)",
  },
  snHint: {
    tr: "JSON biçimi: ad → { prefix, body (satır dizisi), description, language }. Gövdede $1, ${2:varsayılan} ve $0 kullanılabilir. Yalnız bu bilgisayarda saklanır.", en: "JSON format: name → { prefix, body (array of lines), description, language }. You can use $1, ${2:default} and $0 in the body. Stored only on this computer.", de: "JSON-Format: Name → { prefix, body (Zeilen-Array), description, language }. Im Body sind $1, ${2:Standard} und $0 nutzbar. Nur auf diesem Computer gespeichert.", ru: "Формат JSON: имя → { prefix, body (массив строк), description, language }. В теле доступны $1, ${2:по умолчанию} и $0. Хранится только на этом компьютере.", ar: "صيغة JSON: الاسم ← { prefix, body (مصفوفة أسطر), description, language }. يمكن استخدام $1 و ${2:افتراضي} و $0 في النص. يُحفظ على هذا الحاسوب فقط.", es: "Formato JSON: nombre → { prefix, body (lista de líneas), description, language }. En el cuerpo puedes usar $1, ${2:valor} y $0. Se guarda solo en este equipo.", fr: "Format JSON : nom → { prefix, body (tableau de lignes), description, language }. Dans le corps, utilise $1, ${2:défaut} et $0. Stocké uniquement sur cet ordinateur.", az: "JSON formatı: ad → { prefix, body (sətir massivi), description, language }. Gövdədə $1, ${2:susmaya görə} və $0 işlədə bilərsən. Yalnız bu kompüterdə saxlanır.",
  },
  snSave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Yadda saxla",
  },
  snClose: {
    tr: "Kapat", en: "Close", de: "Schließen", ru: "Закрыть", ar: "إغلاق", es: "Cerrar", fr: "Fermer", az: "Bağla",
  },
  snSaved: {
    tr: "Kaydedildi: {n} snippet", en: "Saved: {n} snippets", de: "Gespeichert: {n} Snippets", ru: "Сохранено сниппетов: {n}", ar: "تم الحفظ: {n} مقتطف", es: "Guardado: {n} fragmentos", fr: "Enregistré : {n} snippets", az: "Yadda saxlandı: {n} snippet",
  },
  snInvalid: {
    tr: "Geçersiz içerik: {e}", en: "Invalid content: {e}", de: "Ungültiger Inhalt: {e}", ru: "Недопустимое содержимое: {e}", ar: "محتوى غير صالح: {e}", es: "Contenido no válido: {e}", fr: "Contenu invalide : {e}", az: "Yanlış məzmun: {e}",
  },
  snNoFolder: {
    tr: "Bu kapsam için önce bir klasör aç.", en: "Open a folder first to use this scope.", de: "Öffne zuerst einen Ordner für diesen Bereich.", ru: "Сначала откройте папку для этой области.", ar: "افتح مجلدًا أولًا لاستخدام هذا النطاق.", es: "Abre primero una carpeta para este ámbito.", fr: "Ouvre d'abord un dossier pour cette portée.", az: "Bu əhatə üçün əvvəlcə qovluq aç.",
  },
  snFailed: {
    tr: "Kaydedilemedi.", en: "Could not save.", de: "Speichern fehlgeschlagen.", ru: "Не удалось сохранить.", ar: "تعذّر الحفظ.", es: "No se pudo guardar.", fr: "Échec de l'enregistrement.", az: "Yadda saxlamaq olmadı.",
  },
  pnlOutput: {
    tr: "Çıktı", en: "Output", de: "Ausgabe", ru: "Вывод", ar: "المخرجات", es: "Salida", fr: "Sortie", az: "Çıxış",
  },
  pnlDebug: {
    tr: "Hata ayıklama konsolu", en: "Debug console", de: "Debugkonsole", ru: "Консоль отладки", ar: "وحدة تحكم التصحيح", es: "Consola de depuración", fr: "Console de débogage", az: "Debaq konsolu",
  },
  pnlTests: {
    tr: "Test", en: "Tests", de: "Tests", ru: "Тесты", ar: "الاختبارات", es: "Pruebas", fr: "Tests", az: "Testlər",
  },
  pnlFilterAll: {
    tr: "Tümü", en: "All", de: "Alle", ru: "Все", ar: "الكل", es: "Todo", fr: "Tout", az: "Hamısı",
  },
  pnlFilterErrors: {
    tr: "Hatalar", en: "Errors", de: "Fehler", ru: "Ошибки", ar: "الأخطاء", es: "Errores", fr: "Erreurs", az: "Xətalar",
  },
  pnlFilterWarn: {
    tr: "Uyarılar", en: "Warnings", de: "Warnungen", ru: "Предупреждения", ar: "التحذيرات", es: "Advertencias", fr: "Avertissements", az: "Xəbərdarlıqlar",
  },
  pnlFilterInfo: {
    tr: "Bilgi", en: "Info", de: "Info", ru: "Инфо", ar: "معلومات", es: "Info", fr: "Infos", az: "Məlumat",
  },
  pnlSearch: {
    tr: "Çıktıda ara…", en: "Search output…", de: "Ausgabe durchsuchen…", ru: "Поиск в выводе…", ar: "ابحث في المخرجات…", es: "Buscar en la salida…", fr: "Rechercher dans la sortie…", az: "Çıxışda axtar…",
  },
  pnlCopyAll: {
    tr: "Tümünü kopyala", en: "Copy all", de: "Alles kopieren", ru: "Копировать всё", ar: "نسخ الكل", es: "Copiar todo", fr: "Tout copier", az: "Hamısını kopyala",
  },
  pnlCopied: {
    tr: "Kopyalandı", en: "Copied", de: "Kopiert", ru: "Скопировано", ar: "تم النسخ", es: "Copiado", fr: "Copié", az: "Kopyalandı",
  },
  pnlAutoScroll: {
    tr: "Otomatik kaydır", en: "Auto-scroll", de: "Automatisch scrollen", ru: "Автопрокрутка", ar: "تمرير تلقائي", es: "Desplazamiento automático", fr: "Défilement auto", az: "Avtomatik sürüşdür",
  },
  pnlNoMatch: {
    tr: "Eşleşen satır yok.", en: "No matching lines.", de: "Keine passenden Zeilen.", ru: "Нет подходящих строк.", ar: "لا توجد أسطر مطابقة.", es: "No hay líneas coincidentes.", fr: "Aucune ligne correspondante.", az: "Uyğun sətir yoxdur.",
  },
  pnlOutputEmpty: {
    tr: "Henüz çıktı yok. Git, görev ve uygulama olayları burada görünür.", en: "No output yet. Git, task and app events appear here.", de: "Noch keine Ausgabe. Git-, Aufgaben- und App-Ereignisse erscheinen hier.", ru: "Вывода пока нет. Здесь появляются события Git, задач и приложения.", ar: "لا توجد مخرجات بعد. تظهر هنا أحداث Git والمهام والتطبيق.", es: "Aún no hay salida. Aquí aparecen eventos de Git, tareas y la aplicación.", fr: "Aucune sortie pour le moment. Les événements Git, tâches et application apparaissent ici.", az: "Hələ çıxış yoxdur. Git, tapşırıq və tətbiq hadisələri burada görünür.",
  },
  pnlDbgIdle: {
    tr: "Hata ayıklama oturumu yok", en: "No debug session", de: "Keine Debug-Sitzung", ru: "Нет сеанса отладки", ar: "لا توجد جلسة تصحيح", es: "Sin sesión de depuración", fr: "Aucune session de débogage", az: "Debaq sessiyası yoxdur",
  },
  pnlDbgIdleHint: {
    tr: "Kenar çubuğundaki Hata Ayıkla bölümünden bir JavaScript dosyasını başlat; çıktı ve ifade sonuçları burada görünür.", en: "Start a JavaScript file from the Debug view in the sidebar; output and expression results appear here.", de: "Starte eine JavaScript-Datei in der Debug-Ansicht der Seitenleiste; Ausgabe und Ausdrucksergebnisse erscheinen hier.", ru: "Запустите JavaScript-файл в разделе отладки боковой панели; здесь появятся вывод и результаты выражений.", ar: "ابدأ ملف JavaScript من قسم التصحيح في الشريط الجانبي؛ تظهر المخرجات ونتائج التعبيرات هنا.", es: "Inicia un archivo JavaScript desde la vista Depurar de la barra lateral; aquí aparecen la salida y los resultados.", fr: "Lancez un fichier JavaScript depuis la vue Débogage de la barre latérale ; la sortie et les résultats apparaissent ici.", az: "Yan paneldəki Debaq bölməsindən JavaScript faylını başladın; çıxış və ifadə nəticələri burada görünür.",
  },
  pnlDbgEvalHint: {
    tr: "İfade yaz, Enter ile çalıştır (ör. bir değişken adı)", en: "Type an expression, press Enter to evaluate (e.g. a variable name)", de: "Ausdruck eingeben, mit Enter auswerten (z. B. Variablenname)", ru: "Введите выражение и нажмите Enter (например, имя переменной)", ar: "اكتب تعبيرًا واضغط Enter للتقييم (مثل اسم متغير)", es: "Escribe una expresión y pulsa Enter (p. ej. un nombre de variable)", fr: "Saisissez une expression, Entrée pour évaluer (ex. un nom de variable)", az: "İfadə yazın, Enter ilə icra edin (məs. dəyişən adı)",
  },
  pnlStatusIdle: {
    tr: "Boşta", en: "Idle", de: "Inaktiv", ru: "Ожидание", ar: "خامل", es: "Inactivo", fr: "Inactif", az: "Boşda",
  },
  pnlStatusRunning: {
    tr: "Çalışıyor", en: "Running", de: "Läuft", ru: "Выполняется", ar: "قيد التشغيل", es: "En ejecución", fr: "En cours", az: "İşləyir",
  },
  pnlStatusPaused: {
    tr: "Duraklatıldı", en: "Paused", de: "Pausiert", ru: "Приостановлено", ar: "متوقف مؤقتًا", es: "En pausa", fr: "En pause", az: "Dayandırıldı",
  },
  pnlTestRun: {
    tr: "Çalıştır", en: "Run", de: "Ausführen", ru: "Запустить", ar: "تشغيل", es: "Ejecutar", fr: "Exécuter", az: "İşə sal",
  },
  pnlTestScripts: {
    tr: "Test betikleri", en: "Test scripts", de: "Test-Skripte", ru: "Тестовые скрипты", ar: "نصوص الاختبار", es: "Scripts de prueba", fr: "Scripts de test", az: "Test skriptləri",
  },
  pnlTestNoScripts: {
    tr: "Bu projede test betiği bulunamadı. package.json içine bir \"test\" betiği ekle ya da .nova/tasks.json içinde görev tanımla.", en: "No test script found in this project. Add a \"test\" script to package.json or define a task in .nova/tasks.json.", de: "Kein Test-Skript gefunden. Füge package.json ein \"test\"-Skript hinzu oder definiere eine Aufgabe in .nova/tasks.json.", ru: "Тестовый скрипт не найден. Добавьте скрипт \"test\" в package.json или задачу в .nova/tasks.json.", ar: "لم يتم العثور على نص اختبار. أضف نص \"test\" إلى package.json أو عرّف مهمة في .nova/tasks.json.", es: "No se encontró ningún script de prueba. Añade un script \"test\" a package.json o define una tarea en .nova/tasks.json.", fr: "Aucun script de test trouvé. Ajoutez un script \"test\" à package.json ou définissez une tâche dans .nova/tasks.json.", az: "Bu layihədə test skripti tapılmadı. package.json-a \"test\" skripti əlavə edin və ya .nova/tasks.json-da tapşırıq təyin edin.",
  },
  pnlTestNeedFolder: {
    tr: "Test çalıştırmak için bir klasör aç.", en: "Open a folder to run tests.", de: "Öffne einen Ordner, um Tests auszuführen.", ru: "Откройте папку, чтобы запускать тесты.", ar: "افتح مجلدًا لتشغيل الاختبارات.", es: "Abre una carpeta para ejecutar pruebas.", fr: "Ouvrez un dossier pour exécuter des tests.", az: "Testləri işə salmaq üçün qovluq açın.",
  },
  pnlTestWaiting: {
    tr: "Henüz sonuç yok. Bir test betiği çalıştır; özet burada görünür.", en: "No results yet. Run a test script; the summary appears here.", de: "Noch keine Ergebnisse. Führe ein Test-Skript aus; die Zusammenfassung erscheint hier.", ru: "Результатов пока нет. Запустите тестовый скрипт; сводка появится здесь.", ar: "لا توجد نتائج بعد. شغّل نص اختبار؛ يظهر الملخص هنا.", es: "Aún no hay resultados. Ejecuta un script de prueba; el resumen aparece aquí.", fr: "Pas encore de résultats. Lancez un script de test ; le résumé apparaît ici.", az: "Hələ nəticə yoxdur. Test skripti işə salın; xülasə burada görünür.",
  },
  pnlTestRunning: {
    tr: "Test çalışıyor…", en: "Running tests…", de: "Tests laufen…", ru: "Тесты выполняются…", ar: "الاختبارات قيد التشغيل…", es: "Ejecutando pruebas…", fr: "Tests en cours…", az: "Testlər işləyir…",
  },
  pnlTestAllPassed: {
    tr: "Tüm testler geçti", en: "All tests passed", de: "Alle Tests bestanden", ru: "Все тесты пройдены", ar: "نجحت جميع الاختبارات", es: "Todas las pruebas pasaron", fr: "Tous les tests ont réussi", az: "Bütün testlər keçdi",
  },
  pnlTestSomeFailed: {
    tr: "Bazı testler başarısız", en: "Some tests failed", de: "Einige Tests fehlgeschlagen", ru: "Некоторые тесты не пройдены", ar: "فشلت بعض الاختبارات", es: "Algunas pruebas fallaron", fr: "Certains tests ont échoué", az: "Bəzi testlər uğursuz oldu",
  },
  pnlTestPassed: {
    tr: "başarılı", en: "passed", de: "bestanden", ru: "пройдено", ar: "ناجح", es: "correctas", fr: "réussis", az: "uğurlu",
  },
  pnlTestFailed: {
    tr: "başarısız", en: "failed", de: "fehlgeschlagen", ru: "не пройдено", ar: "فاشل", es: "fallidas", fr: "échoués", az: "uğursuz",
  },
  pnlTestSkipped: {
    tr: "atlanan", en: "skipped", de: "übersprungen", ru: "пропущено", ar: "متخطى", es: "omitidas", fr: "ignorés", az: "keçilən",
  },
  pnlTestTotal: {
    tr: "toplam", en: "total", de: "gesamt", ru: "всего", ar: "الإجمالي", es: "total", fr: "total", az: "cəmi",
  },
  pnlTestDuration: {
    tr: "Süre", en: "Duration", de: "Dauer", ru: "Время", ar: "المدة", es: "Duración", fr: "Durée", az: "Müddət",
  },
  pnlTestFailures: {
    tr: "Başarısız testler", en: "Failed tests", de: "Fehlgeschlagene Tests", ru: "Непройденные тесты", ar: "الاختبارات الفاشلة", es: "Pruebas fallidas", fr: "Tests échoués", az: "Uğursuz testlər",
  },
  pnlTestRunner: {
    tr: "Tespit edilen: {r}", en: "Detected: {r}", de: "Erkannt: {r}", ru: "Обнаружено: {r}", ar: "تم الكشف: {r}", es: "Detectado: {r}", fr: "Détecté : {r}", az: "Aşkarlandı: {r}",
  },
  pnlTestClear: {
    tr: "Sonucu temizle", en: "Clear result", de: "Ergebnis löschen", ru: "Очистить результат", ar: "مسح النتيجة", es: "Borrar resultado", fr: "Effacer le résultat", az: "Nəticəni təmizlə",
  },
} satisfies Record<string, Dict>;

export type DevTextKey = keyof typeof DEV_TEXT;

registerTexts(DEV_TEXT);
