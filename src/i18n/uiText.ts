// Kullanıcı arayüzü metinleri: her metin 8 dilde tanımlanır (tr, en, de, ru, ar, es, fr, az).
// Dil, tarayıcı/sistem diline göre seçilir; desteklenmeyen dillerde Türkçe kullanılır.

export const UI_LANGS = ['tr', 'en', 'de', 'ru', 'ar', 'es', 'fr', 'az'] as const;
export type UiLang = (typeof UI_LANGS)[number];

import type { AiTextKey } from './uiTextAi';
import type { DevTextKey } from './uiTextDev';
import type { RemoteTextKey } from './uiTextRemote';
import type { ScmTextKey } from './uiTextScm';
import type { CompTextKey } from './uiTextComp';
import type { ThemeTextKey } from './uiTextTheme';

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
  termClosed: {
    tr: "Shell kapandı (kod {code}). Sekmeye tekrar tıklayarak yeniden başlatın.", en: "Shell closed (code {code}). Click the tab again to restart.", de: "Shell beendet (Code {code}). Klicken Sie erneut auf den Tab, um neu zu starten.", ru: "Оболочка закрыта (код {code}). Нажмите на вкладку, чтобы перезапустить.", ar: "أُغلق الـ shell (الرمز {code}). انقر على علامة التبويب مجددًا لإعادة التشغيل.", es: "Shell cerrado (código {code}). Haz clic de nuevo en la pestaña para reiniciar.", fr: "Shell fermé (code {code}). Cliquez à nouveau sur l’onglet pour redémarrer.", az: "Shell bağlandı (kod {code}). Yenidən başlatmaq üçün vərəqə yenidən klikləyin.",
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
  termHint: {
    tr: "Komut yazın ve Enter’a basın. ↑/↓ geçmiş, Ctrl+L temizler.", en: "Type a command and press Enter. ↑/↓ history, Ctrl+L clears.", de: "Befehl eingeben und Enter drücken. ↑/↓ Verlauf, Strg+L leert.", ru: "Введите команду и нажмите Enter. ↑/↓ — история, Ctrl+L — очистка.", ar: "اكتب أمرًا واضغط Enter. ↑/↓ للسجل، Ctrl+L للمسح.", es: "Escribe un comando y pulsa Enter. ↑/↓ historial, Ctrl+L limpia.", fr: "Saisissez une commande et appuyez sur Entrée. ↑/↓ historique, Ctrl+L efface.", az: "Komanda yazın və Enter basın. ↑/↓ tarixçə, Ctrl+L təmizləyir.",
  },
  termNotReady: {
    tr: "Shell hazır değil", en: "Shell not ready", de: "Shell nicht bereit", ru: "Оболочка не готова", ar: "الـ shell غير جاهز", es: "Shell no disponible", fr: "Shell non prêt", az: "Shell hazır deyil",
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
  ghInvalidClientId: {
    tr: "Geçersiz Client ID.", en: "Invalid Client ID.", de: "Ungültige Client-ID.", ru: "Неверный Client ID.", ar: "Client ID غير صالح.", es: "Client ID no válido.", fr: "Client ID invalide.", az: "Yanlış Client ID.",
  },
  gitLocked: {
    tr: "Git değişikliklerini, commit ve push işlemlerini görmek için önce GitHub hesabınızı bağlayın.", en: "Connect your GitHub account to see Git changes and to commit or push.", de: "Verbinden Sie Ihr GitHub-Konto, um Git-Änderungen zu sehen sowie zu committen und zu pushen.", ru: "Подключите аккаунт GitHub, чтобы видеть изменения Git, делать коммиты и push.", ar: "اربط حساب GitHub لعرض تغييرات Git وإجراء commit وpush.", es: "Conecta tu cuenta de GitHub para ver los cambios de Git y hacer commit o push.", fr: "Connectez votre compte GitHub pour voir les changements Git, faire des commits et des push.", az: "Git dəyişikliklərini görmək, commit və push etmək üçün əvvəlcə GitHub hesabınızı bağlayın.",
  },
  gitBranch: {
    tr: "Dal", en: "Branch", de: "Branch", ru: "Ветка", ar: "الفرع", es: "Rama", fr: "Branche", az: "Budaq",
  },
  gitBranchPlaceholder: {
    tr: "dal-adı (örn: feature/arama)", en: "branch-name (e.g. feature/search)", de: "branch-name (z. B. feature/suche)", ru: "имя-ветки (напр. feature/search)", ar: "اسم-الفرع (مثل feature/search)", es: "nombre-rama (p. ej. feature/buscar)", fr: "nom-branche (ex. feature/recherche)", az: "budaq-adı (məs. feature/axtar)",
  },
  gitSyncDone: {
    tr: "Eşzamanlandı.", en: "Synced.", de: "Synchronisiert.", ru: "Синхронизировано.", ar: "تمت المزامنة.", es: "Sincronizado.", fr: "Synchronisé.", az: "Sinxronlaşdırıldı.",
  },
  gitDiverged: {
    tr: "Yerel ve uzak dal ayrıştı. Güvenlik için otomatik birleştirme yapılmadı; terminalde merge veya rebase ile çözün.", en: "Local and remote branches have diverged. Nothing was merged automatically; resolve it in the terminal with merge or rebase.", de: "Lokaler und Remote-Branch sind auseinandergelaufen. Es wurde nichts automatisch zusammengeführt; lösen Sie das im Terminal per merge oder rebase.", ru: "Локальная и удалённая ветки разошлись. Автоматического слияния не было; решите это в терминале через merge или rebase.", ar: "تباعد الفرعان المحلي والبعيد. لم يتم الدمج تلقائيًا؛ عالج ذلك في الطرفية عبر merge أو rebase.", es: "Las ramas local y remota han divergido. No se fusionó nada automáticamente; resuélvelo en la terminal con merge o rebase.", fr: "Les branches locale et distante ont divergé. Rien n’a été fusionné automatiquement ; résolvez dans le terminal avec merge ou rebase.", az: "Lokal və uzaq budaq ayrılıb. Avtomatik birləşdirmə edilmədi; terminalda merge və ya rebase ilə həll edin.",
  },
  gitFailed: {
    tr: "İşlem başarısız oldu.", en: "The operation failed.", de: "Der Vorgang ist fehlgeschlagen.", ru: "Операция не удалась.", ar: "فشلت العملية.", es: "La operación falló.", fr: "L’opération a échoué.", az: "Əməliyyat uğursuz oldu.",
  },
  gitConflict: {
    tr: "Çakışma", en: "Conflict", de: "Konflikt", ru: "Конфликт", ar: "تعارض", es: "Conflicto", fr: "Conflit", az: "Konflikt",
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
  setTitle: {
    tr: "Ayarlar", en: "Settings", de: "Einstellungen", ru: "Настройки", ar: "الإعدادات", es: "Ajustes", fr: "Paramètres", az: "Parametrlər",
  },
  set_showGitDecorations: {
    tr: "Dosya ağacında Git durumunu göster", en: "Show Git status in file tree", de: "Git-Status im Dateibaum anzeigen", ru: "Показывать статус Git в дереве файлов", ar: "إظهار حالة Git في شجرة الملفات", es: "Mostrar estado de Git en el árbol de archivos", fr: "Afficher l’état Git dans l’arborescence", az: "Fayl ağacında Git statusunu göstər",
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
  optCompact: {
    tr: "Sıkı", en: "Compact", de: "Kompakt", ru: "Компактно", ar: "مضغوط", es: "Compacta", fr: "Compacte", az: "Sıx",
  },
  optComfortable: {
    tr: "Rahat", en: "Comfortable", de: "Komfortabel", ru: "Свободно", ar: "مريح", es: "Cómoda", fr: "Confortable", az: "Rahat",
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
  aiTitle: {
    tr: "Nova AI", en: "Nova AI", de: "Nova KI", ru: "Nova ИИ", ar: "Nova AI", es: "Nova IA", fr: "Nova IA", az: "Nova AI",
  },
  aiRemove: {
    tr: "Kaldır", en: "Remove", de: "Entfernen", ru: "Убрать", ar: "إزالة", es: "Quitar", fr: "Retirer", az: "Çıxar",
  },
  cpTitle: {
    tr: "Komut paleti / dosya ara", en: "Command palette / search files", de: "Befehlspalette / Dateisuche", ru: "Палитра команд / поиск файлов", ar: "لوحة الأوامر / بحث الملفات", es: "Paleta de comandos / buscar archivos", fr: "Palette de commandes / recherche de fichiers", az: "Komanda paneli / fayl axtar",
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
  extTitle: {
    tr: "Eklentiler", en: "Extensions", de: "Erweiterungen", ru: "Расширения", ar: "الإضافات", es: "Extensiones", fr: "Extensions", az: "Əlavələr",
  },
  extThemes: {
    tr: "Temalar", en: "Themes", de: "Themes", ru: "Темы", ar: "السمات", es: "Temas", fr: "Thèmes", az: "Temalar",
  },
  extNetworkErr: {
    tr: "Mağazaya ulaşılamadı. İnternet bağlantını kontrol et.", en: "Could not reach the store. Check your internet connection.", de: "Store nicht erreichbar. Prüfe deine Internetverbindung.", ru: "Не удалось подключиться к магазину. Проверь интернет.", ar: "تعذّر الوصول إلى المتجر. تحقق من اتصالك بالإنترنت.", es: "No se pudo conectar con la tienda. Revisa tu conexión a internet.", fr: "Boutique inaccessible. Vérifie ta connexion internet.", az: "Mağazaya çatmaq olmadı. İnternet bağlantını yoxla.",
  },
  mnFile: {
    tr: "Dosya", en: "File", de: "Datei", ru: "Файл", ar: "ملف", es: "Archivo", fr: "Fichier", az: "Fayl",
  },
  mnEdit: {
    tr: "Düzenle", en: "Edit", de: "Bearbeiten", ru: "Правка", ar: "تحرير", es: "Editar", fr: "Édition", az: "Redaktə",
  },
  mnSelection: {
    tr: "Seçim", en: "Selection", de: "Auswahl", ru: "Выделение", ar: "تحديد", es: "Selección", fr: "Sélection", az: "Seçim",
  },
  mnView: {
    tr: "Görünüm", en: "View", de: "Ansicht", ru: "Вид", ar: "عرض", es: "Ver", fr: "Affichage", az: "Görünüş",
  },
  mnGo: {
    tr: "Gezin", en: "Go", de: "Gehe zu", ru: "Переход", ar: "انتقال", es: "Ir", fr: "Atteindre", az: "Keç",
  },
  mnRun: {
    tr: "Çalıştır", en: "Run", de: "Ausführen", ru: "Запуск", ar: "تشغيل", es: "Ejecutar", fr: "Exécuter", az: "İşlət",
  },
  mnTerminal: {
    tr: "Terminal", en: "Terminal", de: "Terminal", ru: "Терминал", ar: "الطرفية", es: "Terminal", fr: "Terminal", az: "Terminal",
  },
  mnHelp: {
    tr: "Yardım", en: "Help", de: "Hilfe", ru: "Справка", ar: "مساعدة", es: "Ayuda", fr: "Aide", az: "Kömək",
  },
  mnUndo: {
    tr: "Geri al", en: "Undo", de: "Rückgängig", ru: "Отменить", ar: "تراجع", es: "Deshacer", fr: "Annuler", az: "Geri al",
  },
  mnRedo: {
    tr: "Yinele", en: "Redo", de: "Wiederholen", ru: "Повторить", ar: "إعادة", es: "Rehacer", fr: "Rétablir", az: "Təkrarla",
  },
  mnCut: {
    tr: "Kes", en: "Cut", de: "Ausschneiden", ru: "Вырезать", ar: "قص", es: "Cortar", fr: "Couper", az: "Kəs",
  },
  mnCopy: {
    tr: "Kopyala", en: "Copy", de: "Kopieren", ru: "Копировать", ar: "نسخ", es: "Copiar", fr: "Copier", az: "Kopyala",
  },
  mnPaste: {
    tr: "Yapıştır", en: "Paste", de: "Einfügen", ru: "Вставить", ar: "لصق", es: "Pegar", fr: "Coller", az: "Yapışdır",
  },
  mnComment: {
    tr: "Satırı yorum yap / kaldır", en: "Toggle line comment", de: "Zeilenkommentar umschalten", ru: "Закомментировать/раскомментировать", ar: "تبديل تعليق السطر", es: "Alternar comentario de línea", fr: "Commenter/décommenter la ligne", az: "Sətri şərhə al / çıxar",
  },
  mnSelectAll: {
    tr: "Tümünü seç", en: "Select all", de: "Alles auswählen", ru: "Выделить всё", ar: "تحديد الكل", es: "Seleccionar todo", fr: "Tout sélectionner", az: "Hamısını seç",
  },
  mnExpandLine: {
    tr: "Satırı seç", en: "Expand line selection", de: "Zeile auswählen", ru: "Выделить строку", ar: "تحديد السطر", es: "Seleccionar línea", fr: "Sélectionner la ligne", az: "Sətri seç",
  },
  mnNextMatch: {
    tr: "Sonraki eşleşmeyi ekle", en: "Add next occurrence", de: "Nächstes Vorkommen hinzufügen", ru: "Добавить следующее вхождение", ar: "إضافة التطابق التالي", es: "Añadir siguiente coincidencia", fr: "Ajouter l’occurrence suivante", az: "Növbəti uyğunluğu əlavə et",
  },
  mnCopyLineDown: {
    tr: "Satırı aşağı kopyala", en: "Copy line down", de: "Zeile nach unten kopieren", ru: "Копировать строку вниз", ar: "نسخ السطر لأسفل", es: "Copiar línea abajo", fr: "Copier la ligne vers le bas", az: "Sətri aşağı kopyala",
  },
  mnMoveLineUp: {
    tr: "Satırı yukarı taşı", en: "Move line up", de: "Zeile nach oben", ru: "Переместить строку вверх", ar: "نقل السطر لأعلى", es: "Mover línea arriba", fr: "Déplacer la ligne vers le haut", az: "Sətri yuxarı daşı",
  },
  mnMoveLineDown: {
    tr: "Satırı aşağı taşı", en: "Move line down", de: "Zeile nach unten", ru: "Переместить строку вниз", ar: "نقل السطر لأسفل", es: "Mover línea abajo", fr: "Déplacer la ligne vers le bas", az: "Sətri aşağı daşı",
  },
  mnCursorAbove: {
    tr: "Üste imleç ekle", en: "Add cursor above", de: "Cursor oberhalb hinzufügen", ru: "Добавить курсор выше", ar: "إضافة مؤشر أعلى", es: "Añadir cursor arriba", fr: "Ajouter un curseur au-dessus", az: "Yuxarıya kursor əlavə et",
  },
  mnCursorBelow: {
    tr: "Alta imleç ekle", en: "Add cursor below", de: "Cursor unterhalb hinzufügen", ru: "Добавить курсор ниже", ar: "إضافة مؤشر أسفل", es: "Añadir cursor abajo", fr: "Ajouter un curseur en dessous", az: "Aşağıya kursor əlavə et",
  },
  mnZoomIn: {
    tr: "Yakınlaştır", en: "Zoom in", de: "Vergrößern", ru: "Увеличить", ar: "تكبير", es: "Acercar", fr: "Zoom avant", az: "Yaxınlaşdır",
  },
  mnZoomOut: {
    tr: "Uzaklaştır", en: "Zoom out", de: "Verkleinern", ru: "Уменьшить", ar: "تصغير", es: "Alejar", fr: "Zoom arrière", az: "Uzaqlaşdır",
  },
  mnZoomReset: {
    tr: "Yakınlaştırmayı sıfırla", en: "Reset zoom", de: "Zoom zurücksetzen", ru: "Сбросить масштаб", ar: "إعادة تعيين التكبير", es: "Restablecer zoom", fr: "Réinitialiser le zoom", az: "Yaxınlaşdırmanı sıfırla",
  },
  mnNextTab: {
    tr: "Sonraki sekme", en: "Next tab", de: "Nächster Tab", ru: "Следующая вкладка", ar: "التبويب التالي", es: "Pestaña siguiente", fr: "Onglet suivant", az: "Növbəti vərəq",
  },
  mnPrevTab: {
    tr: "Önceki sekme", en: "Previous tab", de: "Vorheriger Tab", ru: "Предыдущая вкладка", ar: "التبويب السابق", es: "Pestaña anterior", fr: "Onglet précédent", az: "Əvvəlki vərəq",
  },
  mnRunFile: {
    tr: "Açık dosyayı çalıştır", en: "Run active file", de: "Aktive Datei ausführen", ru: "Запустить открытый файл", ar: "تشغيل الملف المفتوح", es: "Ejecutar archivo activo", fr: "Exécuter le fichier actif", az: "Açıq faylı işlət",
  },
  mnRunNoFile: {
    tr: "Çalıştırmak için diskte kayıtlı bir dosya aç.", en: "Open a file saved on disk to run it.", de: "Öffne zum Ausführen eine auf der Festplatte gespeicherte Datei.", ru: "Чтобы запустить, открой файл, сохранённый на диске.", ar: "افتح ملفاً محفوظاً على القرص لتشغيله.", es: "Abre un archivo guardado en disco para ejecutarlo.", fr: "Ouvre un fichier enregistré sur le disque pour l’exécuter.", az: "İşlətmək üçün diskdə saxlanmış fayl aç.",
  },
  mnRunNoRunner: {
    tr: "Bu dosya türü için çalıştırma komutu tanımlı değil. Terminalden elle çalıştırabilirsin.", en: "No run command is defined for this file type. You can run it manually in the terminal.", de: "Für diesen Dateityp ist kein Startbefehl definiert. Du kannst ihn manuell im Terminal ausführen.", ru: "Для этого типа файла команда запуска не задана. Запусти вручную в терминале.", ar: "لا يوجد أمر تشغيل لهذا النوع من الملفات. يمكنك تشغيله يدوياً من الطرفية.", es: "No hay comando de ejecución para este tipo de archivo. Puedes ejecutarlo a mano en la terminal.", fr: "Aucune commande d’exécution pour ce type de fichier. Tu peux le lancer à la main dans le terminal.", az: "Bu fayl növü üçün işlətmə komandası yoxdur. Terminalda əl ilə işlədə bilərsən.",
  },
  mnNewTerminal: {
    tr: "Yeni terminal", en: "New terminal", de: "Neues Terminal", ru: "Новый терминал", ar: "طرفية جديدة", es: "Nueva terminal", fr: "Nouveau terminal", az: "Yeni terminal",
  },
  mnWelcome: {
    tr: "Karşılama sayfası", en: "Welcome page", de: "Willkommensseite", ru: "Страница приветствия", ar: "صفحة الترحيب", es: "Página de bienvenida", fr: "Page d’accueil", az: "Qarşılama səhifəsi",
  },
  mnShortcuts: {
    tr: "Klavye kısayolları", en: "Keyboard shortcuts", de: "Tastenkürzel", ru: "Горячие клавиши", ar: "اختصارات لوحة المفاتيح", es: "Atajos de teclado", fr: "Raccourcis clavier", az: "Klaviatura qısayolları",
  },
  mnDocs: {
    tr: "Dokümantasyon", en: "Documentation", de: "Dokumentation", ru: "Документация", ar: "التوثيق", es: "Documentación", fr: "Documentation", az: "Sənədlər",
  },
  mnReleaseNotes: {
    tr: "Sürüm notları", en: "Release notes", de: "Versionshinweise", ru: "Примечания к выпуску", ar: "ملاحظات الإصدار", es: "Notas de la versión", fr: "Notes de version", az: "Buraxılış qeydləri",
  },
  mnReportIssue: {
    tr: "Sorun bildir", en: "Report an issue", de: "Problem melden", ru: "Сообщить о проблеме", ar: "الإبلاغ عن مشكلة", es: "Informar de un problema", fr: "Signaler un problème", az: "Problem bildir",
  },
  mnAbout: {
    tr: "Hakkında", en: "About", de: "Über", ru: "О программе", ar: "حول", es: "Acerca de", fr: "À propos", az: "Haqqında",
  },
  mnHintNoFile: {
    tr: "Önce bir dosya aç", en: "Open a file first", de: "Öffne zuerst eine Datei", ru: "Сначала открой файл", ar: "افتح ملفاً أولاً", es: "Abre un archivo primero", fr: "Ouvre d’abord un fichier", az: "Əvvəlcə fayl aç",
  },
  mnHintNoFolder: {
    tr: "Önce bir klasör aç", en: "Open a folder first", de: "Öffne zuerst einen Ordner", ru: "Сначала открой папку", ar: "افتح مجلداً أولاً", es: "Abre una carpeta primero", fr: "Ouvre d’abord un dossier", az: "Əvvəlcə qovluq aç",
  },
  mnHintTwoTabs: {
    tr: "En az iki açık sekme gerekir", en: "Needs at least two open tabs", de: "Mindestens zwei geöffnete Tabs nötig", ru: "Нужно минимум две открытые вкладки", ar: "يتطلب تبويبين مفتوحين على الأقل", es: "Se necesitan al menos dos pestañas abiertas", fr: "Au moins deux onglets ouverts requis", az: "Ən azı iki açıq vərəq lazımdır",
  },
  mnRunProject: {
    tr: "Proje komutları (önce klasör aç)", en: "Project commands (open a folder first)", de: "Projektbefehle (zuerst Ordner öffnen)", ru: "Команды проекта (сначала открой папку)", ar: "أوامر المشروع (افتح مجلداً أولاً)", es: "Comandos del proyecto (abre una carpeta)", fr: "Commandes du projet (ouvre un dossier)", az: "Layihə komandaları (əvvəlcə qovluq aç)",
  },
  mnRunNoProject: {
    tr: "Bu klasörde tanınan bir proje yok", en: "No recognized project in this folder", de: "Kein erkanntes Projekt in diesem Ordner", ru: "В этой папке нет распознанного проекта", ar: "لا يوجد مشروع معروف في هذا المجلد", es: "No hay un proyecto reconocido en esta carpeta", fr: "Aucun projet reconnu dans ce dossier", az: "Bu qovluqda tanınan layihə yoxdur",
  },
  mnCheckUpdates: {
    tr: "Güncellemeleri denetle…", en: "Check for updates…", de: "Nach Updates suchen…", ru: "Проверить обновления…", ar: "التحقق من التحديثات…", es: "Buscar actualizaciones…", fr: "Rechercher des mises à jour…", az: "Yenilikləri yoxla…",
  },
  updTitle: {
    tr: "Güncelleme", en: "Update", de: "Update", ru: "Обновление", ar: "التحديث", es: "Actualización", fr: "Mise à jour", az: "Yeniləmə",
  },
  updTabUpdate: {
    tr: "Güncelleme", en: "Update", de: "Update", ru: "Обновление", ar: "التحديث", es: "Actualización", fr: "Mise à jour", az: "Yeniləmə",
  },
  updTabNotes: {
    tr: "Sürüm notları", en: "Release notes", de: "Versionshinweise", ru: "Примечания к выпуску", ar: "ملاحظات الإصدار", es: "Notas de la versión", fr: "Notes de version", az: "Buraxılış qeydləri",
  },
  updChecking: {
    tr: "Güncellemeler denetleniyor…", en: "Checking for updates…", de: "Suche nach Updates…", ru: "Проверка обновлений…", ar: "جارٍ التحقق من التحديثات…", es: "Buscando actualizaciones…", fr: "Recherche de mises à jour…", az: "Yeniliklər yoxlanılır…",
  },
  updAvailable: {
    tr: "Yeni sürüm var: v{v}", en: "A new version is available: v{v}", de: "Neue Version verfügbar: v{v}", ru: "Доступна новая версия: v{v}", ar: "إصدار جديد متاح: v{v}", es: "Hay una nueva versión: v{v}", fr: "Nouvelle version disponible : v{v}", az: "Yeni versiya var: v{v}",
  },
  updCurrent: {
    tr: "Şu anki sürüm: v{v}", en: "Current version: v{v}", de: "Aktuelle Version: v{v}", ru: "Текущая версия: v{v}", ar: "الإصدار الحالي: v{v}", es: "Versión actual: v{v}", fr: "Version actuelle : v{v}", az: "Cari versiya: v{v}",
  },
  updDownload: {
    tr: "İndir ve güncelle", en: "Download and update", de: "Herunterladen und aktualisieren", ru: "Скачать и обновить", ar: "تنزيل وتحديث", es: "Descargar y actualizar", fr: "Télécharger et mettre à jour", az: "Yüklə və yenilə",
  },
  updDownloading: {
    tr: "Güncelleme indiriliyor… %{p}", en: "Downloading update… {p}%", de: "Update wird geladen… {p} %", ru: "Загрузка обновления… {p}%", ar: "جارٍ تنزيل التحديث… {p}%", es: "Descargando actualización… {p}%", fr: "Téléchargement de la mise à jour… {p} %", az: "Yenilik yüklənir… {p}%",
  },
  updReady: {
    tr: "Güncelleme hazır. Yeniden başlatınca kurulur.", en: "The update is ready. It installs when you restart.", de: "Das Update ist bereit. Es wird beim Neustart installiert.", ru: "Обновление готово. Установится при перезапуске.", ar: "التحديث جاهز. سيُثبَّت عند إعادة التشغيل.", es: "La actualización está lista. Se instala al reiniciar.", fr: "La mise à jour est prête. Elle s’installe au redémarrage.", az: "Yenilik hazırdır. Yenidən başladanda quraşdırılır.",
  },
  updRestart: {
    tr: "Yeniden başlat ve güncelle", en: "Restart and update", de: "Neu starten und aktualisieren", ru: "Перезапустить и обновить", ar: "إعادة التشغيل والتحديث", es: "Reiniciar y actualizar", fr: "Redémarrer et mettre à jour", az: "Yenidən başlat və yenilə",
  },
  updLater: {
    tr: "Daha sonra", en: "Later", de: "Später", ru: "Позже", ar: "لاحقاً", es: "Más tarde", fr: "Plus tard", az: "Sonra",
  },
  updClose: {
    tr: "Kapat", en: "Close", de: "Schließen", ru: "Закрыть", ar: "إغلاق", es: "Cerrar", fr: "Fermer", az: "Bağla",
  },
  wcMinimize: {
    tr: "Küçült", en: "Minimize", de: "Minimieren", ru: "Свернуть", ar: "تصغير", es: "Minimizar", fr: "Réduire", az: "Kiçilt",
  },
  wcMaximize: {
    tr: "Büyüt", en: "Maximize", de: "Maximieren", ru: "Развернуть", ar: "تكبير", es: "Maximizar", fr: "Agrandir", az: "Böyüt",
  },
  wcRestore: {
    tr: "Aşağı al", en: "Restore Down", de: "Verkleinern", ru: "Восстановить", ar: "استعادة", es: "Restaurar", fr: "Restaurer", az: "Aşağı al",
  },
  wcClose: {
    tr: "Kapat", en: "Close", de: "Schließen", ru: "Закрыть", ar: "إغلاق", es: "Cerrar", fr: "Fermer", az: "Bağla",
  },
  updCheckNow: {
    tr: "Güncellemeleri denetle", en: "Check for updates", de: "Nach Updates suchen", ru: "Проверить обновления", ar: "التحقق من التحديثات", es: "Buscar actualizaciones", fr: "Rechercher des mises à jour", az: "Yenilikləri yoxla",
  },
  updRetry: {
    tr: "Tekrar dene", en: "Try again", de: "Erneut versuchen", ru: "Повторить", ar: "أعد المحاولة", es: "Reintentar", fr: "Réessayer", az: "Yenidən cəhd et",
  },
  updErrNetwork: {
    tr: "Güncelleme sunucusuna ulaşılamadı. İnternet bağlantını kontrol et.", en: "Could not reach the update server. Check your internet connection.", de: "Update-Server nicht erreichbar. Prüfe deine Internetverbindung.", ru: "Не удалось связаться с сервером обновлений. Проверь интернет.", ar: "تعذّر الوصول إلى خادم التحديث. تحقق من اتصالك بالإنترنت.", es: "No se pudo contactar con el servidor de actualizaciones. Revisa tu conexión.", fr: "Serveur de mise à jour inaccessible. Vérifie ta connexion internet.", az: "Yeniləmə serverinə çatmaq olmadı. İnternet bağlantını yoxla.",
  },
  updErrNoRelease: {
    tr: "Yayınlanmış bir güncelleme dosyası bulunamadı.", en: "No published update file was found.", de: "Es wurde keine veröffentlichte Update-Datei gefunden.", ru: "Опубликованный файл обновления не найден.", ar: "لم يُعثر على ملف تحديث منشور.", es: "No se encontró ningún archivo de actualización publicado.", fr: "Aucun fichier de mise à jour publié n’a été trouvé.", az: "Dərc olunmuş yeniləmə faylı tapılmadı.",
  },
  updErrChecksum: {
    tr: "İndirilen dosya doğrulanamadı (sağlama toplamı). Güncelleme kurulmadı; tekrar dene.", en: "The downloaded file failed verification (checksum). The update was not installed; try again.", de: "Die heruntergeladene Datei konnte nicht verifiziert werden (Prüfsumme). Das Update wurde nicht installiert; versuche es erneut.", ru: "Загруженный файл не прошёл проверку (контрольная сумма). Обновление не установлено; повтори.", ar: "فشل التحقق من الملف المنزَّل (المجموع الاختباري). لم يُثبَّت التحديث؛ حاول مجدداً.", es: "El archivo descargado no pasó la verificación (suma de comprobación). No se instaló; inténtalo de nuevo.", fr: "Le fichier téléchargé n’a pas passé la vérification (somme de contrôle). Mise à jour non installée ; réessaie.", az: "Yüklənən fayl yoxlanılmadı (nəzarət cəmi). Yenilik quraşdırılmadı; yenidən cəhd et.",
  },
  updErrFailed: {
    tr: "Güncelleme tamamlanamadı. Daha sonra tekrar dene.", en: "The update could not be completed. Try again later.", de: "Das Update konnte nicht abgeschlossen werden. Versuche es später erneut.", ru: "Не удалось завершить обновление. Повтори позже.", ar: "تعذّر إكمال التحديث. حاول لاحقاً.", es: "No se pudo completar la actualización. Inténtalo más tarde.", fr: "La mise à jour n’a pas pu aboutir. Réessaie plus tard.", az: "Yeniləmə tamamlana bilmədi. Sonra yenidən cəhd et.",
  },
  updUnsupported: {
    tr: "Geliştirme sürümünde otomatik güncelleme kapalıdır. Kurulu uygulamada çalışır.", en: "Automatic updates are off in development builds. They work in the installed app.", de: "Automatische Updates sind in Entwicklungsbuilds aus. In der installierten App funktionieren sie.", ru: "В сборке для разработки автообновление выключено. В установленном приложении оно работает.", ar: "التحديث التلقائي متوقف في نسخة التطوير. يعمل في التطبيق المثبّت.", es: "Las actualizaciones automáticas están desactivadas en compilaciones de desarrollo. Funcionan en la app instalada.", fr: "Les mises à jour automatiques sont désactivées en développement. Elles fonctionnent dans l’app installée.", az: "Hazırlıq versiyasında avtomatik yeniləmə söndürülüb. Quraşdırılmış tətbiqdə işləyir.",
  },
  updNoNotes: {
    tr: "Bu sürüm için not yok.", en: "No notes for this release.", de: "Keine Hinweise für diese Version.", ru: "Для этого выпуска нет примечаний.", ar: "لا توجد ملاحظات لهذا الإصدار.", es: "No hay notas para esta versión.", fr: "Aucune note pour cette version.", az: "Bu buraxılış üçün qeyd yoxdur.",
  },
  updReleasesFailed: {
    tr: "Sürüm notları alınamadı. İnternet bağlantını kontrol et.", en: "Could not load release notes. Check your internet connection.", de: "Versionshinweise konnten nicht geladen werden. Prüfe deine Internetverbindung.", ru: "Не удалось загрузить примечания. Проверь интернет.", ar: "تعذّر تحميل ملاحظات الإصدار. تحقق من الاتصال.", es: "No se pudieron cargar las notas. Revisa tu conexión.", fr: "Impossible de charger les notes de version. Vérifie ta connexion.", az: "Buraxılış qeydləri yüklənmədi. Bağlantını yoxla.",
  },
  updOpenGithub: {
    tr: "GitHub'da aç", en: "Open on GitHub", de: "Auf GitHub öffnen", ru: "Открыть на GitHub", ar: "فتح على GitHub", es: "Abrir en GitHub", fr: "Ouvrir sur GitHub", az: "GitHub-da aç",
  },
  updInstalledTag: {
    tr: "Kurulu", en: "Installed", de: "Installiert", ru: "Установлена", ar: "مثبّت", es: "Instalada", fr: "Installée", az: "Quraşdırılıb",
  },
  updLastChecked: {
    tr: "Son denetim: {t}", en: "Last checked: {t}", de: "Zuletzt geprüft: {t}", ru: "Проверено: {t}", ar: "آخر تحقق: {t}", es: "Última comprobación: {t}", fr: "Dernière vérification : {t}", az: "Son yoxlama: {t}",
  },
  updPrivacy: {
    tr: "Denetim github.com'a gider (IP adresi ve sürüm bilgisi; kişisel veri gönderilmez). Yalnız sen istediğinde veya \"açılışta denetle\" ayarı açıkken yapılır.", en: "The check contacts github.com (IP address and version info; no personal data is sent). It runs only when you ask or when \"check at startup\" is on.", de: "Die Prüfung kontaktiert github.com (IP-Adresse und Versionsinfo; keine persönlichen Daten). Sie läuft nur auf Wunsch oder bei aktivierter Startprüfung.", ru: "Проверка обращается к github.com (IP-адрес и версия; личные данные не передаются). Выполняется только по запросу или при включённой проверке при запуске.", ar: "يتصل التحقق بـ github.com (عنوان IP ومعلومات الإصدار؛ لا تُرسل بيانات شخصية). يتم فقط عند طلبك أو عند تفعيل التحقق عند البدء.", es: "La comprobación contacta con github.com (IP e información de versión; sin datos personales). Solo se hace si lo pides o si la comprobación al inicio está activa.", fr: "La vérification contacte github.com (IP et version ; aucune donnée personnelle). Elle n’a lieu que sur demande ou si la vérification au démarrage est activée.", az: "Yoxlama github.com ilə əlaqə qurur (IP ünvanı və versiya; şəxsi məlumat göndərilmir). Yalnız istəyəndə və ya \"açılışda yoxla\" açıq olanda edilir.",
  },
  updStatusAvail: {
    tr: "Güncelleme var: v{v}", en: "Update available: v{v}", de: "Update verfügbar: v{v}", ru: "Доступно обновление: v{v}", ar: "تحديث متاح: v{v}", es: "Actualización disponible: v{v}", fr: "Mise à jour disponible : v{v}", az: "Yeniləmə var: v{v}",
  },
  updStatusProgress: {
    tr: "Güncelleme indiriliyor: %{p}", en: "Downloading update: {p}%", de: "Update wird geladen: {p} %", ru: "Загрузка обновления: {p}%", ar: "جارٍ تنزيل التحديث: {p}%", es: "Descargando actualización: {p}%", fr: "Téléchargement de la mise à jour : {p} %", az: "Yenilik yüklənir: {p}%",
  },
  updStatusReady: {
    tr: "Yeniden başlat ve güncelle", en: "Restart to update", de: "Neu starten zum Aktualisieren", ru: "Перезапустить для обновления", ar: "أعد التشغيل للتحديث", es: "Reiniciar para actualizar", fr: "Redémarrer pour mettre à jour", az: "Yeniləmək üçün yenidən başlat",
  },
  edMore: {
    tr: "Diğer eylemler", en: "More actions", de: "Weitere Aktionen", ru: "Другие действия", ar: "المزيد من الإجراءات", es: "Más acciones", fr: "Autres actions", az: "Digər əməliyyatlar",
  },
  edDownload: {
    tr: "Dosyayı indir", en: "Download file", de: "Datei herunterladen", ru: "Скачать файл", ar: "تنزيل الملف", es: "Descargar archivo", fr: "Télécharger le fichier", az: "Faylı yüklə",
  },
  edRunPreview: {
    tr: "Kodu çalıştır / önizle", en: "Run code / preview", de: "Code ausführen / Vorschau", ru: "Запустить код / предпросмотр", ar: "تشغيل الشيفرة / معاينة", es: "Ejecutar código / vista previa", fr: "Exécuter le code / aperçu", az: "Kodu işlət / önizlə",
  },
  edCollabTitle: {
    tr: "Ortak düzenleme durumu", en: "Collaboration status", de: "Status der Zusammenarbeit", ru: "Состояние совместной работы", ar: "حالة التحرير المشترك", es: "Estado de colaboración", fr: "État de la collaboration", az: "Birgə redaktə vəziyyəti",
  },
  edCollabOn: {
    tr: "Bağlı", en: "Connected", de: "Verbunden", ru: "Подключено", ar: "متصل", es: "Conectado", fr: "Connecté", az: "Qoşulub",
  },
  edCollabErr: {
    tr: "Bağlantı hatası", en: "Connection error", de: "Verbindungsfehler", ru: "Ошибка соединения", ar: "خطأ في الاتصال", es: "Error de conexión", fr: "Erreur de connexion", az: "Bağlantı xətası",
  },
  edCollabConnecting: {
    tr: "Bağlanıyor", en: "Connecting", de: "Verbinde", ru: "Подключение", ar: "جارٍ الاتصال", es: "Conectando", fr: "Connexion", az: "Qoşulur",
  },
  edCollabOff: {
    tr: "Kapalı", en: "Off", de: "Aus", ru: "Выкл.", ar: "متوقف", es: "Apagado", fr: "Désactivé", az: "Söndürülüb",
  },
  mnMenu: {
    tr: "Menü", en: "Menu", de: "Menü", ru: "Меню", ar: "القائمة", es: "Menú", fr: "Menu", az: "Menyu",
  },
  expFilter: {
    tr: "Filtrele", en: "Filter", de: "Filtern", ru: "Фильтр", ar: "تصفية", es: "Filtrar", fr: "Filtrer", az: "Süz",
  },
  expFilterPlaceholder: {
    tr: "Dosya ve klasör ara…", en: "Filter files and folders…", de: "Dateien und Ordner filtern…", ru: "Фильтр файлов и папок…", ar: "تصفية الملفات والمجلدات…", es: "Filtrar archivos y carpetas…", fr: "Filtrer fichiers et dossiers…", az: "Fayl və qovluqları süz…",
  },
  expFilterClear: {
    tr: "Filtreyi temizle", en: "Clear filter", de: "Filter löschen", ru: "Очистить фильтр", ar: "مسح التصفية", es: "Borrar filtro", fr: "Effacer le filtre", az: "Süzgəci təmizlə",
  },
  expNoMatches: {
    tr: "Eşleşen öğe yok.", en: "No matching items.", de: "Keine passenden Einträge.", ru: "Совпадений нет.", ar: "لا توجد عناصر مطابقة.", es: "No hay elementos coincidentes.", fr: "Aucun élément correspondant.", az: "Uyğun element yoxdur.",
  },
  expReveal: {
    tr: "Dosya gezgininde göster", en: "Reveal in File Explorer", de: "Im Datei-Explorer anzeigen", ru: "Показать в проводнике", ar: "إظهار في مستكشف الملفات", es: "Mostrar en el Explorador", fr: "Afficher dans l’Explorateur", az: "Fayl idarəçisində göstər",
  },
  expOpenInTerminal: {
    tr: "Terminalde aç", en: "Open in terminal", de: "Im Terminal öffnen", ru: "Открыть в терминале", ar: "فتح في الطرفية", es: "Abrir en la terminal", fr: "Ouvrir dans le terminal", az: "Terminalda aç",
  },
  expSortBy: {
    tr: "Sırala", en: "Sort by", de: "Sortieren nach", ru: "Сортировка", ar: "الفرز حسب", es: "Ordenar por", fr: "Trier par", az: "Sırala",
  },
  expViewOptions: {
    tr: "Görünüm seçenekleri", en: "View options", de: "Anzeigeoptionen", ru: "Параметры вида", ar: "خيارات العرض", es: "Opciones de vista", fr: "Options d’affichage", az: "Görünüş seçimləri",
  },
  expRecent: {
    tr: "Son açılanlar", en: "Recent", de: "Zuletzt geöffnet", ru: "Недавние", ar: "الأخيرة", es: "Recientes", fr: "Récents", az: "Son açılanlar",
  },
  expEmptyFolder: {
    tr: "Bu klasör boş.", en: "This folder is empty.", de: "Dieser Ordner ist leer.", ru: "Эта папка пуста.", ar: "هذا المجلد فارغ.", es: "Esta carpeta está vacía.", fr: "Ce dossier est vide.", az: "Bu qovluq boşdur.",
  },
  expCloseFolder: {
    tr: "Klasörü kapat ve ana sayfaya dön", en: "Close folder and go home", de: "Ordner schließen und zur Startseite", ru: "Закрыть папку и вернуться на главную", ar: "إغلاق المجلد والعودة إلى الرئيسية", es: "Cerrar carpeta e ir al inicio", fr: "Fermer le dossier et revenir à l’accueil", az: "Qovluğu bağla və ana səhifəyə qayıt",
  },
  expCloseAll: {
    tr: "Tümünü kapat", en: "Close all", de: "Alle schließen", ru: "Закрыть все", ar: "إغلاق الكل", es: "Cerrar todo", fr: "Tout fermer", az: "Hamısını bağla",
  },
  expCloseAllConfirm: {
    tr: "Kaydedilmemiş değişiklikler var. Yine de tüm sekmeler kapatılsın mı?", en: "There are unsaved changes. Close all tabs anyway?", de: "Es gibt ungespeicherte Änderungen. Trotzdem alle Tabs schließen?", ru: "Есть несохранённые изменения. Всё равно закрыть все вкладки?", ar: "توجد تغييرات غير محفوظة. هل تريد إغلاق كل التبويبات؟", es: "Hay cambios sin guardar. ¿Cerrar todas las pestañas igualmente?", fr: "Des modifications ne sont pas enregistrées. Fermer tous les onglets quand même ?", az: "Yadda saxlanmamış dəyişikliklər var. Yenə də bütün vərəqlər bağlansın?",
  },
  optSpacious: {
    tr: "Geniş", en: "Spacious", de: "Großzügig", ru: "Просторный", ar: "واسع", es: "Amplio", fr: "Aéré", az: "Geniş",
  },
  optSortFoldersFirst: {
    tr: "Klasörler önce", en: "Folders first", de: "Ordner zuerst", ru: "Сначала папки", ar: "المجلدات أولاً", es: "Carpetas primero", fr: "Dossiers d’abord", az: "Əvvəlcə qovluqlar",
  },
  optSortFilesFirst: {
    tr: "Dosyalar önce", en: "Files first", de: "Dateien zuerst", ru: "Сначала файлы", ar: "الملفات أولاً", es: "Archivos primero", fr: "Fichiers d’abord", az: "Əvvəlcə fayllar",
  },
  optSortMixed: {
    tr: "Karışık (ada göre)", en: "Mixed (by name)", de: "Gemischt (nach Name)", ru: "Вперемешку (по имени)", ar: "مختلط (حسب الاسم)", es: "Mezclado (por nombre)", fr: "Mélangé (par nom)", az: "Qarışıq (ada görə)",
  },
  optSortType: {
    tr: "Türe göre", en: "By type", de: "Nach Typ", ru: "По типу", ar: "حسب النوع", es: "Por tipo", fr: "Par type", az: "Növə görə",
  },
  optIconColor: {
    tr: "Renkli (dosya türü)", en: "Colored (file type)", de: "Farbig (Dateityp)", ru: "Цветные (тип файла)", ar: "ملوّنة (نوع الملف)", es: "Color (tipo de archivo)", fr: "Colorées (type de fichier)", az: "Rəngli (fayl növü)",
  },
  optIconMinimal: {
    tr: "Sade (tek renk)", en: "Minimal (single color)", de: "Schlicht (einfarbig)", ru: "Минимальные (один цвет)", ar: "بسيطة (لون واحد)", es: "Minimalistas (un color)", fr: "Sobres (une couleur)", az: "Sadə (tək rəng)",
  },
  set_treeSort: {
    tr: "Gezgin sıralaması", en: "Explorer sort order", de: "Sortierung im Explorer", ru: "Сортировка в проводнике", ar: "ترتيب المستكشف", es: "Orden del explorador", fr: "Tri de l’explorateur", az: "Gəzgin sıralaması",
  },
  set_treeShowHidden: {
    tr: "Gizli dosyaları göster", en: "Show hidden files", de: "Versteckte Dateien anzeigen", ru: "Показывать скрытые файлы", ar: "إظهار الملفات المخفية", es: "Mostrar archivos ocultos", fr: "Afficher les fichiers cachés", az: "Gizli faylları göstər",
  },
  setDesc_treeShowHidden: {
    tr: "Adı noktayla başlayan dosya ve klasörler (.env, .gitignore…) ağaçta görünür. Kapatırsan gizlenir; diskten silinmez.", en: "Files and folders starting with a dot (.env, .gitignore…) appear in the tree. Turning it off only hides them; nothing is deleted.", de: "Dateien und Ordner mit Punkt am Anfang (.env, .gitignore…) erscheinen im Baum. Ausschalten blendet sie nur aus.", ru: "Файлы и папки, начинающиеся с точки (.env, .gitignore…), видны в дереве. Выключение лишь скрывает их.", ar: "تظهر الملفات والمجلدات التي تبدأ بنقطة (.env، .gitignore…) في الشجرة. الإيقاف يخفيها فقط.", es: "Los archivos y carpetas que empiezan por punto (.env, .gitignore…) aparecen en el árbol. Desactivar solo los oculta.", fr: "Les fichiers et dossiers commençant par un point (.env, .gitignore…) apparaissent dans l’arbre. Désactiver ne fait que les masquer.", az: "Nöqtə ilə başlayan fayl və qovluqlar (.env, .gitignore…) ağacda görünür. Söndürmək yalnız gizlədir.",
  },
  set_treeCompactFolders: {
    tr: "Klasörleri sıkıştır", en: "Compact folders", de: "Ordner komprimieren", ru: "Сжимать папки", ar: "ضغط المجلدات", es: "Compactar carpetas", fr: "Compacter les dossiers", az: "Qovluqları sıxlaşdır",
  },
  setDesc_treeCompactFolders: {
    tr: "İçinde tek klasör olan klasör zinciri tek satırda gösterilir (ör. src / components / ui).", en: "A chain of folders that each hold a single folder is shown on one line (e.g. src / components / ui).", de: "Eine Kette von Ordnern mit je einem Unterordner wird in einer Zeile gezeigt (z. B. src / components / ui).", ru: "Цепочка папок с единственной вложенной папкой показывается в одной строке (например, src / components / ui).", ar: "تُعرض سلسلة المجلدات التي يحتوي كل منها على مجلد واحد في سطر واحد (مثل src / components / ui).", es: "Una cadena de carpetas con una sola subcarpeta se muestra en una línea (p. ej., src / components / ui).", fr: "Une chaîne de dossiers ne contenant chacun qu’un dossier s’affiche sur une ligne (ex. src / components / ui).", az: "Hər birində yalnız bir qovluq olan qovluq zənciri tək sətirdə göstərilir (məs. src / components / ui).",
  },
  set_treeIconStyle: {
    tr: "Dosya simgesi stili", en: "File icon style", de: "Stil der Dateisymbole", ru: "Стиль значков файлов", ar: "نمط أيقونات الملفات", es: "Estilo de iconos de archivo", fr: "Style des icônes de fichier", az: "Fayl nişanı üslubu",
  },
  set_treeAutoReveal: {
    tr: "Etkin dosyayı Gezgin'de göster", en: "Reveal the active file in Explorer", de: "Aktive Datei im Explorer anzeigen", ru: "Показывать активный файл в проводнике", ar: "إظهار الملف النشط في المستكشف", es: "Mostrar el archivo activo en el Explorador", fr: "Afficher le fichier actif dans l’Explorateur", az: "Aktiv faylı Gəzgində göstər",
  },
  setDesc_treeAutoReveal: {
    tr: "Bir sekmeye geçince ya da dosya açınca Gezgin ilgili klasörleri açar ve dosyaya kaydırır.", en: "When you switch tabs or open a file, Explorer expands its folders and scrolls to it.", de: "Beim Wechseln des Tabs oder Öffnen einer Datei klappt der Explorer die Ordner auf und scrollt dorthin.", ru: "При переключении вкладки или открытии файла проводник раскрывает папки и прокручивает к файлу.", ar: "عند تبديل التبويب أو فتح ملف يفتح المستكشف المجلدات ويمرّر إليه.", es: "Al cambiar de pestaña o abrir un archivo, el Explorador abre sus carpetas y se desplaza hasta él.", fr: "En changeant d’onglet ou en ouvrant un fichier, l’Explorateur déplie ses dossiers et y défile.", az: "Vərəq dəyişəndə və ya fayl açılanda Gəzgin qovluqları açıb fayla sürüşdürür.",
  },
  updUpToDate: {
    tr: "Son sürümdesiniz (v{v})", en: "You are on the latest version (v{v})", de: "Du hast die neueste Version (v{v})", ru: "У вас последняя версия (v{v})", ar: "أنت على أحدث إصدار (v{v})", es: "Tienes la última versión (v{v})", fr: "Vous avez la dernière version (v{v})", az: "Ən son versiyadasınız (v{v})",
  },
  updDevNote: {
    tr: "Kaynak koddan çalışıyorsun (geliştirme): burada güncelleme denetimi yapılmaz, internete hiçbir istek gitmez. Güncellemeyi git ile alırsın. Denetim ve indirme yalnız setup (.exe) ile kurulan uygulamada çalışır.", en: "You are running from source (development): update checks are off and no network request is made. Pull updates with git. Checking and downloading only work in the app installed with the setup (.exe).", de: "Du führst den Quellcode aus (Entwicklung): Update-Prüfung ist aus, es wird keine Netzwerkanfrage gesendet. Updates holst du mit git. Prüfen und Herunterladen funktionieren nur in der per Setup (.exe) installierten App.", ru: "Вы запускаете из исходников (разработка): проверка обновлений отключена, сетевые запросы не отправляются. Обновляйтесь через git. Проверка и загрузка работают только в приложении, установленном через setup (.exe).", ar: "أنت تشغّل من الشيفرة المصدرية (تطوير): فحص التحديثات متوقف ولا يُرسل أي طلب شبكة. حدّث عبر git. الفحص والتنزيل يعملان فقط في التطبيق المثبّت عبر ملف الإعداد (.exe).", es: "Estás ejecutando desde el código (desarrollo): la búsqueda de actualizaciones está desactivada y no se hace ninguna petición de red. Actualiza con git. Buscar y descargar solo funcionan en la app instalada con el setup (.exe).", fr: "Tu exécutes depuis le code source (développement) : la recherche de mises à jour est désactivée et aucune requête réseau n’est envoyée. Mets à jour avec git. La recherche et le téléchargement ne fonctionnent que dans l’app installée via le setup (.exe).", az: "Mənbə koddan işlədirsən (hazırlıq): yeniləmə yoxlaması söndürülüb, şəbəkə sorğusu göndərilmir. Yeniləməni git ilə al. Yoxlama və yükləmə yalnız setup (.exe) ilə quraşdırılmış tətbiqdə işləyir.",
  },
  updOpenRelease: {
    tr: "Yayın sayfasını aç", en: "Open release page", de: "Release-Seite öffnen", ru: "Открыть страницу выпуска", ar: "فتح صفحة الإصدار", es: "Abrir página de la versión", fr: "Ouvrir la page de la version", az: "Buraxılış səhifəsini aç",
  },
  mnHintHtml: {
    tr: "Önizlenebilir bir dosya aç (HTML, SVG, Markdown; CSS/JS için aynı klasörde index.html)", en: "Open a previewable file (HTML, SVG, Markdown; for CSS/JS an index.html in the same folder)", de: "Öffne eine Datei mit Vorschau (HTML, SVG, Markdown; bei CSS/JS eine index.html im selben Ordner)", ru: "Откройте файл с предпросмотром (HTML, SVG, Markdown; для CSS/JS — index.html в той же папке)", ar: "افتح ملفاً قابلاً للمعاينة (HTML وSVG وMarkdown؛ لـ CSS/JS ملف index.html في المجلد نفسه)", es: "Abre un archivo con vista previa (HTML, SVG, Markdown; para CSS/JS un index.html en la misma carpeta)", fr: "Ouvre un fichier prévisualisable (HTML, SVG, Markdown ; pour CSS/JS un index.html dans le même dossier)", az: "Önizlənə bilən fayl aç (HTML, SVG, Markdown; CSS/JS üçün eyni qovluqda index.html)",
  },
  mnThemePicker: {
    tr: "Renk temasını seç…", en: "Select color theme…", de: "Farbdesign auswählen…", ru: "Выбрать цветовую тему…", ar: "اختيار سمة الألوان…", es: "Seleccionar tema de color…", fr: "Choisir le thème de couleur…", az: "Rəng temasını seç…",
  },
  mnRunSettings: {
    tr: "Çalıştırma ve önizleme ayarları…", en: "Run and preview settings…", de: "Einstellungen für Ausführen und Vorschau…", ru: "Настройки запуска и предпросмотра…", ar: "إعدادات التشغيل والمعاينة…", es: "Ajustes de ejecución y vista previa…", fr: "Paramètres d’exécution et d’aperçu…", az: "İşlətmə və önizləmə ayarları…",
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

// Gecikmeli yüklenen bölümlerin (AI paneli, Ayarlar) metinleri: uiTextAi.ts kendini buraya kaydeder; ana paket küçük kalır.
const EXTRA: Record<string, Dict> = {};
export function registerTexts(extra: Record<string, Dict>): void {
  Object.assign(EXTRA, extra);
}
export type TextKey = UiTextKey | AiTextKey | DevTextKey | ScmTextKey | CompTextKey | ThemeTextKey | RemoteTextKey;

export function t(key: TextKey): string {
  const e = (UI_TEXT as Record<string, Dict>)[key] ?? EXTRA[key];
  return e ? e[currentLang] : key;
}
