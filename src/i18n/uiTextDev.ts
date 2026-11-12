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
} satisfies Record<string, Dict>;

export type DevTextKey = keyof typeof DEV_TEXT;

registerTexts(DEV_TEXT);
