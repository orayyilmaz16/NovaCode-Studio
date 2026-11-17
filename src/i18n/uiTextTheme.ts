// Renk teması, ek vurgu renkleri ve yazı tipi açıklamaları (8 dil). Ayarlar sayfasıyla birlikte gecikmeli yüklenir.
import { registerTexts, type UiLang } from './uiText';

type Dict = Record<UiLang, string>;

export const THEME_TEXT = {
  set_colorTheme: {
    tr: "Renk teması", en: "Color theme", de: "Farbthema", ru: "Цветовая тема", ar: "سمة الألوان", es: "Tema de color", fr: "Thème de couleur", az: "Rəng teması",
  },
  setDesc_colorTheme: {
    tr: "Arayüzün ve editörün renk takımını seçer. \"Nova\" seçiliyken koyu/açık modu Tema modu belirler; bir tema seçersen mod temanın kendisinden gelir. Vurgu rengi her temanın üstüne uygulanır.", en: "Picks the color set of the interface and the editor. With \"Nova\" the Color mode decides dark/light; if you pick a theme, the mode comes from the theme itself. The accent color is applied on top of every theme.", de: "Wählt den Farbsatz von Oberfläche und Editor. Bei \"Nova\" bestimmt der Farbmodus Dunkel/Hell; bei einem Thema kommt der Modus vom Thema selbst. Die Akzentfarbe wird auf jedes Thema angewendet.", ru: "Выбирает цветовой набор интерфейса и редактора. При «Nova» тёмный/светлый режим задаёт «Режим темы»; если выбрать тему, режим определяется самой темой. Акцентный цвет применяется поверх любой темы.", ar: "يختار مجموعة ألوان الواجهة والمحرر. مع \"Nova\" يحدد وضع السمة الداكن/الفاتح؛ وإن اخترت سمة فالوضع يأتي منها. يُطبَّق لون التمييز فوق كل سمة.", es: "Elige el conjunto de colores de la interfaz y el editor. Con \"Nova\" el Modo de color decide oscuro/claro; si eliges un tema, el modo viene del propio tema. El color de acento se aplica sobre cualquier tema.", fr: "Choisit le jeu de couleurs de l’interface et de l’éditeur. Avec \"Nova\", le Mode de couleur décide sombre/clair ; si tu choisis un thème, le mode vient du thème. La couleur d’accent s’applique sur tous les thèmes.", az: "İnterfeys və redaktorun rəng dəstini seçir. \"Nova\" seçiləndə tünd/açıq rejimi Tema rejimi müəyyən edir; tema seçsən rejim temadan gəlir. Vurğu rəngi hər temanın üstünə tətbiq olunur.",
  },
  pal_auto: {
    tr: "Nova (modu izler)", en: "Nova (follows mode)", de: "Nova (folgt dem Modus)", ru: "Nova (по режиму)", ar: "Nova (حسب الوضع)", es: "Nova (según el modo)", fr: "Nova (suit le mode)", az: "Nova (rejimi izləyir)",
  },
  pal_midnight: {
    tr: "Gece Yarısı (koyu)", en: "Midnight (dark)", de: "Mitternacht (dunkel)", ru: "Полночь (тёмная)", ar: "منتصف الليل (داكن)", es: "Medianoche (oscuro)", fr: "Minuit (sombre)", az: "Gecəyarısı (tünd)",
  },
  pal_forest: {
    tr: "Orman (koyu)", en: "Forest (dark)", de: "Wald (dunkel)", ru: "Лес (тёмная)", ar: "الغابة (داكن)", es: "Bosque (oscuro)", fr: "Forêt (sombre)", az: "Meşə (tünd)",
  },
  pal_orchid: {
    tr: "Orkide (koyu)", en: "Orchid (dark)", de: "Orchidee (dunkel)", ru: "Орхидея (тёмная)", ar: "الأوركيد (داكن)", es: "Orquídea (oscuro)", fr: "Orchidée (sombre)", az: "Orxideya (tünd)",
  },
  pal_ember: {
    tr: "Kor (koyu)", en: "Ember (dark)", de: "Glut (dunkel)", ru: "Угли (тёмная)", ar: "الجمر (داكن)", es: "Brasa (oscuro)", fr: "Braise (sombre)", az: "Közərti (tünd)",
  },
  pal_atlas: {
    tr: "Arduvaz (koyu)", en: "Slate (dark)", de: "Schiefer (dunkel)", ru: "Сланец (тёмная)", ar: "الأردواز (داكن)", es: "Pizarra (oscuro)", fr: "Ardoise (sombre)", az: "Şifer (tünd)",
  },
  pal_ink: {
    tr: "Mürekkep (saf siyah)", en: "Ink (pure black)", de: "Tinte (reines Schwarz)", ru: "Чернила (чёрная)", ar: "الحبر (أسود نقي)", es: "Tinta (negro puro)", fr: "Encre (noir pur)", az: "Mürəkkəb (saf qara)",
  },
  pal_paper: {
    tr: "Kâğıt (açık)", en: "Paper (light)", de: "Papier (hell)", ru: "Бумага (светлая)", ar: "الورق (فاتح)", es: "Papel (claro)", fr: "Papier (clair)", az: "Kağız (açıq)",
  },
  pal_mist: {
    tr: "Sis (açık)", en: "Mist (light)", de: "Nebel (hell)", ru: "Туман (светлая)", ar: "الضباب (فاتح)", es: "Niebla (claro)", fr: "Brume (clair)", az: "Duman (açıq)",
  },
  pal_mint: {
    tr: "Nane (açık)", en: "Mint (light)", de: "Minze (hell)", ru: "Мята (светлая)", ar: "النعناع (فاتح)", es: "Menta (claro)", fr: "Menthe (clair)", az: "Nanə (açıq)",
  },
  pal_rose: {
    tr: "Gül (açık)", en: "Rose (light)", de: "Rose (hell)", ru: "Роза (светлая)", ar: "الوردي (فاتح)", es: "Rosa (claro)", fr: "Rose (clair)", az: "Gül (açıq)",
  },
  accViolet: {
    tr: "Mor", en: "Violet", de: "Violett", ru: "Фиолетовый", ar: "بنفسجي", es: "Violeta", fr: "Violet", az: "Bənövşəyi",
  },
  accCyan: {
    tr: "Camgöbeği", en: "Cyan", de: "Cyan", ru: "Голубой", ar: "سماوي", es: "Cian", fr: "Cyan", az: "Firuzəyi",
  },
  accRed: {
    tr: "Kırmızı", en: "Red", de: "Rot", ru: "Красный", ar: "أحمر", es: "Rojo", fr: "Rouge", az: "Qırmızı",
  },
  accAmber: {
    tr: "Kehribar", en: "Amber", de: "Bernstein", ru: "Янтарный", ar: "كهرماني", es: "Ámbar", fr: "Ambre", az: "Kəhrəba",
  },
  accLime: {
    tr: "Limon yeşili", en: "Lime", de: "Limette", ru: "Лайм", ar: "ليموني", es: "Lima", fr: "Citron vert", az: "Layma",
  },
  setDesc_uiFont: {
    tr: "Cihazında kurulu yazı tipleri kullanılır; kurulu değilse sıradaki yedek (sistem yazı tipi) görünür.", en: "Fonts installed on your device are used; if one is not installed, the next fallback (system font) is shown.", de: "Es werden auf dem Gerät installierte Schriften verwendet; fehlt eine, erscheint die nächste Ersatzschrift (Systemschrift).", ru: "Используются шрифты, установленные на устройстве; если шрифта нет, показывается следующий запасной (системный).", ar: "تُستخدم الخطوط المثبّتة على جهازك؛ وإن لم يكن الخط مثبّتاً يظهر البديل التالي (خط النظام).", es: "Se usan las fuentes instaladas en tu equipo; si falta una, se muestra la siguiente alternativa (fuente del sistema).", fr: "Les polices installées sur ton appareil sont utilisées ; si l’une manque, la suivante (police système) s’affiche.", az: "Cihazında quraşdırılmış şriftlər istifadə olunur; yoxdursa növbəti ehtiyat (sistem şrifti) görünür.",
  },
  setDesc_fontFamily: {
    tr: "Kod yazı tipi cihazda kurulu olmalı; kurulu değilse yedek olarak Cascadia/Consolas kullanılır.", en: "The code font must be installed on the device; if it is not, Cascadia/Consolas is used as a fallback.", de: "Die Code-Schrift muss auf dem Gerät installiert sein; sonst wird Cascadia/Consolas als Ersatz verwendet.", ru: "Шрифт кода должен быть установлен на устройстве; иначе используется запасной Cascadia/Consolas.", ar: "يجب تثبيت خط الشيفرة على الجهاز؛ وإلا يُستخدم Cascadia/Consolas بديلاً.", es: "La fuente de código debe estar instalada en el equipo; si no, se usa Cascadia/Consolas como alternativa.", fr: "La police de code doit être installée sur l’appareil ; sinon Cascadia/Consolas sert de repli.", az: "Kod şrifti cihazda quraşdırılmış olmalıdır; yoxdursa ehtiyat olaraq Cascadia/Consolas istifadə olunur.",
  },
  pvBridgeError: {
    tr: "Hata", en: "Error", de: "Fehler", ru: "Ошибка", ar: "خطأ", es: "Error", fr: "Erreur", az: "Xəta",
  },
  pvBridgeLine: {
    tr: "satır", en: "line", de: "Zeile", ru: "строка", ar: "السطر", es: "línea", fr: "ligne", az: "sətir",
  },
  pvBridgeRejection: {
    tr: "Yakalanmamış söz reddi", en: "Unhandled promise rejection", de: "Nicht behandelte Promise-Ablehnung", ru: "Необработанное отклонение промиса", ar: "رفض وعد غير معالج", es: "Rechazo de promesa no controlado", fr: "Rejet de promesse non géré", az: "İdarə olunmamış vəd rədd edilməsi",
  },
  setCatTrust: {
    tr: "Güven ve rıza", en: "Trust and consent", de: "Vertrauen und Einwilligung", ru: "Доверие и согласие", ar: "الثقة والموافقة", es: "Confianza y consentimiento", fr: "Confiance et consentement", az: "Etibar və razılıq",
  },
  trTitle: {
    tr: "Bu klasöre güveniyor musun?", en: "Do you trust this folder?", de: "Vertraust du diesem Ordner?", ru: "Вы доверяете этой папке?", ar: "هل تثق بهذا المجلد؟", es: "¿Confías en esta carpeta?", fr: "Fais-tu confiance à ce dossier ?", az: "Bu qovluğa etibar edirsən?",
  },
  trBody: {
    tr: "Güvenmezsen klasör kısıtlı modda açılır: dil sunucuları ve hata ayıklayıcı başlamaz, git yalnız okuma komutlarını (durum, geçmiş, fark, dallar) çalıştırır. Projedeki betikler, git kancaları ve araç yapılandırmaları bilgisayarında kod çalıştırabilir; yalnız kaynağına güvendiğin klasörlere güven ver. Karar bu bilgisayarda saklanır, Ayarlar > Güven ve rıza bölümünden geri alınır.", en: "If you do not trust it, the folder opens in restricted mode: language servers and the debugger do not start, and git runs only read commands (status, log, diff, branches). Scripts, git hooks and tool settings in the project can run code on your computer; trust only folders whose source you know. The choice is stored on this computer and can be revoked in Settings > Trust and consent.", de: "Wenn du nicht vertraust, öffnet sich der Ordner im eingeschränkten Modus: Sprachserver und Debugger starten nicht, Git führt nur Lesebefehle aus (Status, Verlauf, Diff, Branches). Skripte, Git-Hooks und Werkzeugeinstellungen im Projekt können Code auf deinem Computer ausführen; vertraue nur Ordnern, deren Quelle du kennst. Die Entscheidung wird auf diesem Computer gespeichert und lässt sich unter Einstellungen > Vertrauen und Einwilligung widerrufen.", ru: "Если не доверять, папка откроется в ограниченном режиме: языковые серверы и отладчик не запускаются, git выполняет только команды чтения (статус, история, diff, ветки). Скрипты, хуки git и настройки инструментов проекта могут выполнять код на вашем компьютере; доверяйте только папкам, источник которых известен. Выбор хранится на этом компьютере и отзывается в Настройки > Доверие и согласие.", ar: "إذا لم تثق بالمجلد يُفتح في الوضع المقيّد: لا تبدأ خوادم اللغة ولا المصحّح، ويشغّل git أوامر القراءة فقط (الحالة، السجل، الفروق، الفروع). قد تشغّل سكربتات المشروع وخطافات git وإعدادات الأدوات شيفرة على جهازك؛ ثق فقط بالمجلدات المعروفة المصدر. يُحفظ القرار على هذا الجهاز ويمكن إلغاؤه من الإعدادات > الثقة والموافقة.", es: "Si no confías, la carpeta se abre en modo restringido: los servidores de lenguaje y el depurador no se inician, y git solo ejecuta comandos de lectura (estado, historial, diff, ramas). Los scripts, los hooks de git y la configuración de herramientas del proyecto pueden ejecutar código en tu equipo; confía solo en carpetas cuyo origen conozcas. La decisión se guarda en este equipo y se revoca en Ajustes > Confianza y consentimiento.", fr: "Si tu ne fais pas confiance, le dossier s’ouvre en mode restreint : les serveurs de langage et le débogueur ne démarrent pas, et git n’exécute que des commandes de lecture (statut, historique, diff, branches). Les scripts, hooks git et réglages d’outils du projet peuvent exécuter du code sur ton ordinateur ; ne fais confiance qu’aux dossiers dont tu connais la source. Le choix est conservé sur cet ordinateur et se révoque dans Paramètres > Confiance et consentement.", az: "Etibar etməsən qovluq məhdud rejimdə açılır: dil serverləri və sazlayıcı başlamır, git yalnız oxuma əmrlərini (status, tarixçə, fərq, budaqlar) icra edir. Layihədəki skriptlər, git qarmaqları və alət ayarları kompüterində kod işlədə bilər; yalnız mənbəyini tanıdığın qovluqlara etibar et. Seçim bu kompüterdə saxlanır, Ayarlar > Etibar və razılıq bölməsindən geri alınır.",
  },
  trTrust: {
    tr: "Güven", en: "Trust", de: "Vertrauen", ru: "Доверять", ar: "ثقة", es: "Confiar", fr: "Faire confiance", az: "Etibar et",
  },
  trRestrictedBtn: {
    tr: "Kısıtlı modda aç", en: "Open in restricted mode", de: "Im eingeschränkten Modus öffnen", ru: "Открыть в ограниченном режиме", ar: "فتح في الوضع المقيّد", es: "Abrir en modo restringido", fr: "Ouvrir en mode restreint", az: "Məhdud rejimdə aç",
  },
  trBadge: {
    tr: "Kısıtlı mod", en: "Restricted mode", de: "Eingeschränkter Modus", ru: "Ограниченный режим", ar: "الوضع المقيّد", es: "Modo restringido", fr: "Mode restreint", az: "Məhdud rejim",
  },
  trBadgeTip: {
    tr: "Bu klasöre güvenilmiyor: dil sunucuları, hata ayıklayıcı ve git yazma komutları kapalı. Güven vermek için tıkla.", en: "This folder is not trusted: language servers, the debugger and git write commands are off. Click to trust it.", de: "Diesem Ordner wird nicht vertraut: Sprachserver, Debugger und Git-Schreibbefehle sind aus. Klicke, um zu vertrauen.", ru: "Эта папка не доверенная: языковые серверы, отладчик и команды записи git отключены. Нажмите, чтобы доверять.", ar: "هذا المجلد غير موثوق: خوادم اللغة والمصحّح وأوامر الكتابة في git متوقفة. انقر لمنح الثقة.", es: "Esta carpeta no es de confianza: servidores de lenguaje, depurador y comandos de escritura de git desactivados. Haz clic para confiar.", fr: "Ce dossier n’est pas approuvé : serveurs de langage, débogueur et commandes d’écriture git désactivés. Clique pour lui faire confiance.", az: "Bu qovluğa etibar edilmir: dil serverləri, sazlayıcı və git yazma əmrləri söndürülüb. Etibar üçün klik et.",
  },
  trRestrictedShort: {
    tr: "Kısıtlı mod: bu klasöre güvenmeden çalıştırılamaz. Durum çubuğundaki \"Kısıtlı mod\" rozetinden Güven seç.", en: "Restricted mode: cannot run until you trust this folder. Choose Trust from the \"Restricted mode\" badge in the status bar.", de: "Eingeschränkter Modus: läuft erst, wenn du diesem Ordner vertraust. Wähle Vertrauen über das Abzeichen „Eingeschränkter Modus“ in der Statusleiste.", ru: "Ограниченный режим: не запустится, пока вы не доверите папку. Выберите «Доверять» на значке «Ограниченный режим» в строке состояния.", ar: "الوضع المقيّد: لا يعمل قبل منح الثقة للمجلد. اختر «ثقة» من شارة «الوضع المقيّد» في شريط الحالة.", es: "Modo restringido: no se ejecuta hasta que confíes en esta carpeta. Elige Confiar en la insignia «Modo restringido» de la barra de estado.", fr: "Mode restreint : ne s’exécute pas tant que tu ne fais pas confiance au dossier. Choisis Faire confiance sur le badge « Mode restreint » de la barre d’état.", az: "Məhdud rejim: bu qovluğa etibar etməyincə işləmir. Status çubuğundakı “Məhdud rejim” nişanından Etibar et seç.",
  },
  trSetFolders: {
    tr: "Güvenilen klasörler", en: "Trusted folders", de: "Vertrauenswürdige Ordner", ru: "Доверенные папки", ar: "المجلدات الموثوقة", es: "Carpetas de confianza", fr: "Dossiers approuvés", az: "Etibarlı qovluqlar",
  },
  trSetFoldersDesc: {
    tr: "Bu klasörlerde dil sunucuları, hata ayıklayıcı, git yazma komutları ve ajanın güvenli komutları kısıtsız çalışır. Kaldırdığın klasör bir sonraki açılışta yine sorulur.", en: "In these folders language servers, the debugger, git write commands and the agent’s safe commands run unrestricted. A removed folder is asked about again the next time it opens.", de: "In diesen Ordnern laufen Sprachserver, Debugger, Git-Schreibbefehle und sichere Agent-Befehle uneingeschränkt. Ein entfernter Ordner wird beim nächsten Öffnen erneut abgefragt.", ru: "В этих папках языковые серверы, отладчик, команды записи git и безопасные команды агента работают без ограничений. Удалённая папка снова запросит доверие при следующем открытии.", ar: "في هذه المجلدات تعمل خوادم اللغة والمصحّح وأوامر الكتابة في git وأوامر الوكيل الآمنة دون قيود. سيُسأل عن المجلد المحذوف مجددًا عند فتحه.", es: "En estas carpetas los servidores de lenguaje, el depurador, los comandos de escritura de git y los comandos seguros del agente funcionan sin restricciones. Una carpeta quitada se vuelve a preguntar al abrirla.", fr: "Dans ces dossiers, serveurs de langage, débogueur, commandes d’écriture git et commandes sûres de l’agent fonctionnent sans restriction. Un dossier retiré sera redemandé à la prochaine ouverture.", az: "Bu qovluqlarda dil serverləri, sazlayıcı, git yazma əmrləri və agentin təhlükəsiz əmrləri məhdudiyyətsiz işləyir. Silinən qovluq növbəti açılışda yenidən soruşulur.",
  },
  trSetNone: {
    tr: "Kayıt yok.", en: "Nothing saved.", de: "Nichts gespeichert.", ru: "Записей нет.", ar: "لا يوجد شيء محفوظ.", es: "No hay nada guardado.", fr: "Rien d’enregistré.", az: "Qeyd yoxdur.",
  },
  trRevoke: {
    tr: "Geri al", en: "Revoke", de: "Widerrufen", ru: "Отозвать", ar: "إلغاء", es: "Revocar", fr: "Révoquer", az: "Geri al",
  },
  trRevokeConfirm: {
    tr: "Bu kaydı kaldırmak istiyor musun?", en: "Remove this entry?", de: "Diesen Eintrag entfernen?", ru: "Удалить эту запись?", ar: "هل تريد إزالة هذا السجل؟", es: "¿Quitar esta entrada?", fr: "Retirer cette entrée ?", az: "Bu qeydi silmək istəyirsən?",
  },
  trOpenTag: {
    tr: "Açık klasör", en: "Open folder", de: "Geöffneter Ordner", ru: "Открытая папка", ar: "المجلد المفتوح", es: "Carpeta abierta", fr: "Dossier ouvert", az: "Açıq qovluq",
  },
  trSetConsent: {
    tr: "Harici yapay zekâ sağlayıcı rızaları", en: "External AI provider consents", de: "Einwilligungen für externe KI-Anbieter", ru: "Согласия на внешних ИИ-провайдеров", ar: "موافقات مزوّدي الذكاء الاصطناعي الخارجيين", es: "Consentimientos de proveedores de IA externos", fr: "Consentements des fournisseurs d’IA externes", az: "Xarici süni intellekt provayder razılıqları",
  },
  trSetConsentDesc: {
    tr: "Mesajların ve eklediğin kod bağlamı bu adreslere (yurt dışında olabilir) gönderilmek üzere onay verdin. Rızayı geri alırsan sonraki gönderimde yeniden sorulur; hiçbir şey sorulmadan gönderilmez. Rıza yalnız sen verebilirsin, burada yeni rıza eklenemez.", en: "You approved sending your messages and attached code context to these addresses (possibly abroad). If you revoke consent, you are asked again before the next send; nothing is sent without asking. Only you can give consent; none can be added here.", de: "Du hast zugestimmt, deine Nachrichten und den angehängten Code-Kontext an diese Adressen (ggf. im Ausland) zu senden. Nach dem Widerruf wird vor dem nächsten Senden erneut gefragt; ohne Rückfrage wird nichts gesendet. Nur du kannst zustimmen; hier lässt sich keine Einwilligung hinzufügen.", ru: "Вы разрешили отправку сообщений и контекста кода на эти адреса (возможно, за рубеж). После отзыва согласие запрашивается снова перед следующей отправкой; без запроса ничего не отправляется. Согласие даёте только вы, добавить его здесь нельзя.", ar: "وافقت على إرسال رسائلك وسياق الشيفرة المرفق إلى هذه العناوين (وقد تكون خارج البلد). عند إلغاء الموافقة تُسأل مجددًا قبل الإرسال التالي؛ لا يُرسل شيء دون سؤال. وحدك من يمنح الموافقة ولا يمكن إضافتها هنا.", es: "Aceptaste enviar tus mensajes y el contexto de código adjunto a estas direcciones (posiblemente en el extranjero). Si revocas el consentimiento, se te preguntará antes del siguiente envío; nada se envía sin preguntar. Solo tú puedes consentir; aquí no se puede añadir.", fr: "Tu as accepté l’envoi de tes messages et du contexte de code joint à ces adresses (possiblement à l’étranger). Si tu révoques, on te redemandera avant le prochain envoi ; rien n’est envoyé sans demander. Seul toi peux consentir ; on ne peut pas en ajouter ici.", az: "Mesajlarının və əlavə etdiyin kod kontekstinin bu ünvanlara (xaricdə ola bilər) göndərilməsinə razılıq verdin. Razılığı geri alsan növbəti göndərişdən əvvəl yenidən soruşulur; soruşmadan heç nə göndərilmir. Razılığı yalnız sən verə bilərsən, burada əlavə olunmur.",
  },
  trSetBases: {
    tr: "İzinli özel taban adresleri", en: "Allowed custom base addresses", de: "Erlaubte eigene Basisadressen", ru: "Разрешённые свои базовые адреса", ar: "عناوين القاعدة المخصصة المسموح بها", es: "Direcciones base personalizadas permitidas", fr: "Adresses de base personnalisées autorisées", az: "İcazə verilmiş xüsusi baza ünvanları",
  },
  trSetBasesDesc: {
    tr: "API anahtarının gönderilmesine izin verdiğin özel adresler. Geri alınan adrese anahtar, yeniden onay verilene dek gitmez.", en: "Custom addresses you allowed your API key to be sent to. A revoked address receives no key until you approve it again.", de: "Eigene Adressen, an die dein API-Schlüssel gesendet werden darf. Eine widerrufene Adresse erhält keinen Schlüssel, bis du erneut zustimmst.", ru: "Свои адреса, на которые разрешена отправка вашего API-ключа. На отозванный адрес ключ не отправляется до повторного подтверждения.", ar: "عناوين مخصصة سمحت بإرسال مفتاح API إليها. لا يُرسل المفتاح إلى عنوان ملغى حتى توافق مجددًا.", es: "Direcciones personalizadas a las que permitiste enviar tu clave de API. Una dirección revocada no recibe la clave hasta que la apruebes de nuevo.", fr: "Adresses personnalisées auxquelles tu as autorisé l’envoi de ta clé d’API. Une adresse révoquée ne reçoit pas la clé tant que tu n’approuves pas à nouveau.", az: "API açarının göndərilməsinə icazə verdiyin xüsusi ünvanlar. Geri alınan ünvana açar yenidən təsdiq verilənə qədər göndərilmir.",
  },
  trRoomTitle: {
    tr: "Ortak düzenleme oda kimliği", en: "Collaborative editing room ID", de: "Raum-ID für gemeinsames Bearbeiten", ru: "Идентификатор комнаты совместного редактирования", ar: "معرّف غرفة التحرير المشترك", es: "ID de sala de edición colaborativa", fr: "Identifiant de salle d’édition collaborative", az: "Birgə redaktə otaq identifikatoru",
  },
  trRoomDesc: {
    tr: "Açık klasör için oda kimliği (yerel yol sunucuya gitmez). Aynı projede çalışacak kişilerle aynı kimliği paylaş; yeniden oluşturursan eski odadan ayrılırsın.", en: "Room ID for the open folder (the local path never goes to the server). Share the same ID with people working on the same project; regenerating it leaves the old room.", de: "Raum-ID für den geöffneten Ordner (der lokale Pfad geht nie an den Server). Teile dieselbe ID mit Personen im selben Projekt; beim Neuerzeugen verlässt du den alten Raum.", ru: "Идентификатор комнаты для открытой папки (локальный путь на сервер не отправляется). Поделитесь им с участниками проекта; при пересоздании вы покинете старую комнату.", ar: "معرّف الغرفة للمجلد المفتوح (لا يُرسل المسار المحلي إلى الخادم). شارك المعرّف نفسه مع من يعمل على المشروع؛ إعادة إنشائه تُخرجك من الغرفة القديمة.", es: "ID de sala de la carpeta abierta (la ruta local nunca va al servidor). Comparte el mismo ID con quienes trabajen en el proyecto; al regenerarlo sales de la sala anterior.", fr: "Identifiant de salle du dossier ouvert (le chemin local ne part jamais vers le serveur). Partage le même identifiant avec les personnes du projet ; le régénérer te fait quitter l’ancienne salle.", az: "Açıq qovluq üçün otaq identifikatoru (yerli yol serverə getmir). Eyni layihədə işləyənlərlə eyni identifikatoru paylaş; yenidən yaratsan köhnə otaqdan çıxarsan.",
  },
  trRoomSave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Yadda saxla",
  },
  trRoomRegen: {
    tr: "Yeniden oluştur", en: "Regenerate", de: "Neu erzeugen", ru: "Создать заново", ar: "إعادة إنشاء", es: "Regenerar", fr: "Régénérer", az: "Yenidən yarat",
  },
  trRoomNone: {
    tr: "Önce bir klasör aç.", en: "Open a folder first.", de: "Öffne zuerst einen Ordner.", ru: "Сначала откройте папку.", ar: "افتح مجلدًا أولًا.", es: "Abre una carpeta primero.", fr: "Ouvre d’abord un dossier.", az: "Əvvəlcə qovluq aç.",
  },
  trRoomSaved: {
    tr: "Oda kimliği kaydedildi.", en: "Room ID saved.", de: "Raum-ID gespeichert.", ru: "Идентификатор сохранён.", ar: "تم حفظ معرّف الغرفة.", es: "ID de sala guardado.", fr: "Identifiant de salle enregistré.", az: "Otaq identifikatoru saxlanıldı.",
  },
  trWebOnly: {
    tr: "Bu bölüm yalnız masaüstü sürümünde çalışır.", en: "This section works only in the desktop app.", de: "Dieser Bereich funktioniert nur in der Desktop-App.", ru: "Этот раздел работает только в настольной версии.", ar: "يعمل هذا القسم في تطبيق سطح المكتب فقط.", es: "Esta sección solo funciona en la aplicación de escritorio.", fr: "Cette section ne fonctionne que dans l’application de bureau.", az: "Bu bölmə yalnız masaüstü tətbiqində işləyir.",
  },
  trLocalNote: {
    tr: "Bu kayıtlar yalnız bu bilgisayarda saklanır (KVKK: amaç güvenlik kararlarını hatırlamak, hukuki sebep açık rızan, sunucuya gönderilmez).", en: "These entries are stored only on this computer (purpose: remembering security decisions; legal basis: your explicit consent; never sent to a server).", de: "Diese Einträge werden nur auf diesem Computer gespeichert (Zweck: Sicherheitsentscheidungen merken; Rechtsgrundlage: deine ausdrückliche Einwilligung; nie an einen Server gesendet).", ru: "Эти записи хранятся только на этом компьютере (цель: запоминание решений безопасности; основание: ваше явное согласие; на сервер не отправляются).", ar: "تُحفظ هذه السجلات على هذا الجهاز فقط (الغرض: تذكّر قرارات الأمان؛ الأساس القانوني: موافقتك الصريحة؛ لا تُرسل إلى أي خادم).", es: "Estas entradas se guardan solo en este equipo (finalidad: recordar decisiones de seguridad; base legal: tu consentimiento expreso; nunca se envían a un servidor).", fr: "Ces entrées ne sont conservées que sur cet ordinateur (finalité : mémoriser les décisions de sécurité ; base légale : ton consentement explicite ; jamais envoyées à un serveur).", az: "Bu qeydlər yalnız bu kompüterdə saxlanır (məqsəd: təhlükəsizlik qərarlarını xatırlamaq; hüquqi əsas: açıq razılığın; serverə göndərilmir).",
  },
  termLog: {
    tr: "Günlük", en: "Log", de: "Protokoll", ru: "Журнал", ar: "السجل", es: "Registro", fr: "Journal", az: "Jurnal",
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
  termLogEmpty: {
    tr: "Henüz kayıt yok.", en: "No entries yet.", de: "Noch keine Einträge.", ru: "Записей пока нет.", ar: "لا توجد سجلات بعد.", es: "Aún no hay registros.", fr: "Aucune entrée pour le moment.", az: "Hələ qeyd yoxdur.",
  },
  termPlaceholder: {
    tr: "Komut yazın...", en: "Type a command...", de: "Befehl eingeben...", ru: "Введите команду...", ar: "اكتب أمرًا...", es: "Escribe un comando...", fr: "Saisissez une commande...", az: "Komanda yazın...",
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
  ghSave: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Yadda saxla",
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
  ghNotConfigured: {
    tr: "GitHub bağlantısı bu sürümde henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.", en: "GitHub sign-in is not configured in this version yet. Please try again later.", de: "Die GitHub-Anmeldung ist in dieser Version noch nicht konfiguriert. Bitte versuchen Sie es später erneut.", ru: "Вход через GitHub в этой версии ещё не настроен. Повторите попытку позже.", ar: "لم يتم إعداد تسجيل الدخول إلى GitHub في هذا الإصدار بعد. يرجى المحاولة لاحقًا.", es: "El acceso con GitHub aún no está configurado en esta versión. Inténtalo más tarde.", fr: "La connexion GitHub n’est pas encore configurée dans cette version. Réessayez plus tard.", az: "GitHub girişi bu versiyada hələ konfiqurasiya edilməyib. Zəhmət olmasa sonra yenidən cəhd edin.",
  },
  gitNewBranch: {
    tr: "Yeni dal", en: "New branch", de: "Neuer Branch", ru: "Новая ветка", ar: "فرع جديد", es: "Nueva rama", fr: "Nouvelle branche", az: "Yeni budaq",
  },
  gitCreate: {
    tr: "Oluştur", en: "Create", de: "Erstellen", ru: "Создать", ar: "إنشاء", es: "Crear", fr: "Créer", az: "Yarat",
  },
  gitSync: {
    tr: "Eşzamanla (fetch + pull + push)", en: "Sync (fetch + pull + push)", de: "Synchronisieren (fetch + pull + push)", ru: "Синхронизировать (fetch + pull + push)", ar: "مزامنة (fetch + pull + push)", es: "Sincronizar (fetch + pull + push)", fr: "Synchroniser (fetch + pull + push)", az: "Sinxronlaşdır (fetch + pull + push)",
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
  welTips: {
    tr: "İpuçları", en: "Tips", de: "Tipps", ru: "Советы", ar: "نصائح", es: "Consejos", fr: "Astuces", az: "Məsləhətlər",
  },
  welTipQuickOpen: {
    tr: "Dosyaya git", en: "Go to file", de: "Zu Datei gehen", ru: "Перейти к файлу", ar: "الانتقال إلى ملف", es: "Ir al archivo", fr: "Aller au fichier", az: "Fayla keç",
  },
  welTipPalette: {
    tr: "Komut paleti", en: "Command palette", de: "Befehlspalette", ru: "Палитра команд", ar: "لوحة الأوامر", es: "Paleta de comandos", fr: "Palette de commandes", az: "Əmr paleti",
  },
  welTipSearch: {
    tr: "Projede ara", en: "Search in project", de: "Im Projekt suchen", ru: "Поиск по проекту", ar: "البحث في المشروع", es: "Buscar en el proyecto", fr: "Rechercher dans le projet", az: "Layihədə axtar",
  },
  welTipAi: {
    tr: "Yapay zekâ asistanı", en: "AI assistant", de: "KI-Assistent", ru: "ИИ-ассистент", ar: "مساعد الذكاء الاصطناعي", es: "Asistente de IA", fr: "Assistant IA", az: "Süni intellekt köməkçisi",
  },
  welTipTerminal: {
    tr: "Terminali aç/kapat", en: "Toggle terminal", de: "Terminal umschalten", ru: "Показать/скрыть терминал", ar: "تبديل الطرفية", es: "Mostrar/ocultar terminal", fr: "Afficher/masquer le terminal", az: "Terminalı aç/bağla",
  },
  welTipSettings: {
    tr: "Ayarlar", en: "Settings", de: "Einstellungen", ru: "Настройки", ar: "الإعدادات", es: "Ajustes", fr: "Paramètres", az: "Ayarlar",
  },
  setCatAppearance: {
    tr: "Görünüm", en: "Appearance", de: "Darstellung", ru: "Внешний вид", ar: "المظهر", es: "Apariencia", fr: "Apparence", az: "Görünüş",
  },
  setCatEditor: {
    tr: "Editör", en: "Editor", de: "Editor", ru: "Редактор", ar: "المحرر", es: "Editor", fr: "Éditeur", az: "Redaktor",
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
  set_autoSave: {
    tr: "Otomatik kaydet", en: "Auto save", de: "Automatisch speichern", ru: "Автосохранение", ar: "الحفظ التلقائي", es: "Guardado automático", fr: "Enregistrement automatique", az: "Avtomatik yadda saxla",
  },
  set_autoSaveDelay: {
    tr: "Otomatik kayıt gecikmesi", en: "Auto save delay", de: "Verzögerung beim automatischen Speichern", ru: "Задержка автосохранения", ar: "تأخير الحفظ التلقائي", es: "Retraso del guardado automático", fr: "Délai d’enregistrement automatique", az: "Avtomatik saxlama gecikməsi",
  },
  set_formatOnSave: {
    tr: "Kayıtta kodu biçimlendir", en: "Format code on save", de: "Code beim Speichern formatieren", ru: "Форматировать код при сохранении", ar: "تنسيق الكود عند الحفظ", es: "Formatear el código al guardar", fr: "Formater le code à l’enregistrement", az: "Saxlayarkən kodu formatla",
  },
  setDesc_formatOnSave: {
    tr: "Ctrl+S ile kaydederken etkin dosya, dilinin biçimlendiricisiyle düzenlenir (JS/TS, JSON, CSS, HTML…). Biçimlendirici yoksa dosya olduğu gibi kaydedilir. Otomatik kayıtta çalışmaz.", en: "When saving with Ctrl+S, the active file is formatted with its language formatter (JS/TS, JSON, CSS, HTML…). If there is no formatter, the file is saved as is. Does not run on auto save.", de: "Beim Speichern mit Strg+S wird die aktive Datei mit dem Formatierer ihrer Sprache formatiert (JS/TS, JSON, CSS, HTML…). Ohne Formatierer wird unverändert gespeichert. Läuft nicht beim automatischen Speichern.", ru: "При сохранении по Ctrl+S активный файл форматируется форматтером его языка (JS/TS, JSON, CSS, HTML…). Если форматтера нет, файл сохраняется как есть. При автосохранении не работает.", ar: "عند الحفظ بـ Ctrl+S يُنسَّق الملف النشط بمنسّق لغته (JS/TS وJSON وCSS وHTML…). إن لم يوجد منسّق يُحفظ الملف كما هو. لا يعمل مع الحفظ التلقائي.", es: "Al guardar con Ctrl+S, el archivo activo se formatea con el formateador de su lenguaje (JS/TS, JSON, CSS, HTML…). Si no hay formateador, se guarda tal cual. No se ejecuta en el guardado automático.", fr: "À l’enregistrement avec Ctrl+S, le fichier actif est formaté avec le formateur de son langage (JS/TS, JSON, CSS, HTML…). Sans formateur, il est enregistré tel quel. Ne s’exécute pas à l’enregistrement automatique.", az: "Ctrl+S ilə saxlayarkən aktiv fayl dilinin formatlayıcısı ilə formatlanır (JS/TS, JSON, CSS, HTML…). Formatlayıcı yoxdursa fayl olduğu kimi saxlanılır. Avtomatik saxlamada işləmir.",
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
  setCatAI: {
    tr: "Yapay Zekâ", en: "AI Assistant", de: "KI-Assistent", ru: "ИИ-ассистент", ar: "المساعد الذكي", es: "Asistente IA", fr: "Assistant IA", az: "Süni intellekt",
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
  extInstalled: {
    tr: "Yüklü", en: "Installed", de: "Installiert", ru: "Установлено", ar: "مثبّتة", es: "Instaladas", fr: "Installées", az: "Quraşdırılıb",
  },
  extStore: {
    tr: "Mağaza", en: "Store", de: "Store", ru: "Магазин", ar: "المتجر", es: "Tienda", fr: "Boutique", az: "Mağaza",
  },
  extSearchPlaceholder: {
    tr: "Eklenti ara (Open VSX)", en: "Search extensions (Open VSX)", de: "Erweiterungen suchen (Open VSX)", ru: "Поиск расширений (Open VSX)", ar: "ابحث عن إضافات (Open VSX)", es: "Buscar extensiones (Open VSX)", fr: "Rechercher des extensions (Open VSX)", az: "Əlavə axtar (Open VSX)",
  },
  extInstall: {
    tr: "Yükle", en: "Install", de: "Installieren", ru: "Установить", ar: "تثبيت", es: "Instalar", fr: "Installer", az: "Quraşdır",
  },
  extUninstall: {
    tr: "Kaldır", en: "Uninstall", de: "Deinstallieren", ru: "Удалить", ar: "إزالة", es: "Desinstalar", fr: "Désinstaller", az: "Sil",
  },
  extUpdateTo: {
    tr: "Güncelle ({v})", en: "Update ({v})", de: "Aktualisieren ({v})", ru: "Обновить ({v})", ar: "تحديث ({v})", es: "Actualizar ({v})", fr: "Mettre à jour ({v})", az: "Yenilə ({v})",
  },
  extUpdateAll: {
    tr: "Tümünü güncelle", en: "Update all", de: "Alle aktualisieren", ru: "Обновить все", ar: "تحديث الكل", es: "Actualizar todo", fr: "Tout mettre à jour", az: "Hamısını yenilə",
  },
  extCheckUpdates: {
    tr: "Güncellemeleri denetle", en: "Check for updates", de: "Nach Updates suchen", ru: "Проверить обновления", ar: "التحقق من التحديثات", es: "Buscar actualizaciones", fr: "Rechercher des mises à jour", az: "Yenilikləri yoxla",
  },
  extApplyTheme: {
    tr: "Bu temayı uygula", en: "Apply this theme", de: "Dieses Theme anwenden", ru: "Применить тему", ar: "تطبيق هذه السمة", es: "Aplicar este tema", fr: "Appliquer ce thème", az: "Bu temanı tətbiq et",
  },
  extResetTheme: {
    tr: "Varsayılan temaya dön", en: "Back to default theme", de: "Zurück zum Standard-Theme", ru: "Вернуть тему по умолчанию", ar: "العودة إلى السمة الافتراضية", es: "Volver al tema predeterminado", fr: "Revenir au thème par défaut", az: "Standart temaya qayıt",
  },
  extErrTooBig: {
    tr: "Eklenti çok büyük (30 MB sınırı).", en: "The extension is too large (30 MB limit).", de: "Die Erweiterung ist zu groß (Limit 30 MB).", ru: "Расширение слишком большое (лимит 30 МБ).", ar: "الإضافة كبيرة جداً (الحد 30 ميغابايت).", es: "La extensión es demasiado grande (límite de 30 MB).", fr: "L’extension est trop volumineuse (limite de 30 Mo).", az: "Əlavə çox böyükdür (30 MB limiti).",
  },
  extErrFailed: {
    tr: "Eklenti yüklenemedi. Tekrar dene.", en: "The extension could not be installed. Try again.", de: "Die Erweiterung konnte nicht installiert werden. Versuche es erneut.", ru: "Не удалось установить расширение. Повтори попытку.", ar: "تعذّر تثبيت الإضافة. حاول مجدداً.", es: "No se pudo instalar la extensión. Inténtalo de nuevo.", fr: "L’extension n’a pas pu être installée. Réessaie.", az: "Əlavə quraşdırıla bilmədi. Yenidən cəhd et.",
  },
  extInstalledOk: {
    tr: "Eklenti yüklendi.", en: "Extension installed.", de: "Erweiterung installiert.", ru: "Расширение установлено.", ar: "تم تثبيت الإضافة.", es: "Extensión instalada.", fr: "Extension installée.", az: "Əlavə quraşdırıldı.",
  },
  extDownloads: {
    tr: "{n} indirme", en: "{n} downloads", de: "{n} Downloads", ru: "{n} загрузок", ar: "{n} تنزيل", es: "{n} descargas", fr: "{n} téléchargements", az: "{n} yükləmə",
  },
  extThemeCount: {
    tr: "{n} tema", en: "{n} themes", de: "{n} Themes", ru: "{n} тем", ar: "{n} سمات", es: "{n} temas", fr: "{n} thèmes", az: "{n} tema",
  },
  extLoadMore: {
    tr: "Daha fazla", en: "Load more", de: "Mehr laden", ru: "Показать ещё", ar: "عرض المزيد", es: "Cargar más", fr: "Charger plus", az: "Daha çox",
  },
  extDesktopOnly: {
    tr: "Eklenti mağazası yalnız masaüstü uygulamasında çalışır.", en: "The extension store works only in the desktop app.", de: "Der Erweiterungs-Store funktioniert nur in der Desktop-App.", ru: "Магазин расширений работает только в настольном приложении.", ar: "يعمل متجر الإضافات في تطبيق سطح المكتب فقط.", es: "La tienda de extensiones solo funciona en la app de escritorio.", fr: "La boutique d’extensions ne fonctionne que dans l’app de bureau.", az: "Əlavə mağazası yalnız masaüstü tətbiqdə işləyir.",
  },
  set_extTheme: {
    tr: "Eklenti teması", en: "Extension theme", de: "Erweiterungs-Theme", ru: "Тема расширения", ar: "سمة الإضافة", es: "Tema de extensión", fr: "Thème d’extension", az: "Əlavə teması",
  },
  set_updateAutoCheck: {
    tr: "Açılışta güncellemeleri denetle", en: "Check for updates at startup", de: "Beim Start nach Updates suchen", ru: "Проверять обновления при запуске", ar: "التحقق من التحديثات عند البدء", es: "Buscar actualizaciones al iniciar", fr: "Rechercher les mises à jour au démarrage", az: "Açılışda yenilikləri yoxla",
  },
  setDesc_updateAutoCheck: {
    tr: "Uygulama açılırken ve 6 saatte bir GitHub'dan yeni sürüm var mı diye bakılır (IP ve sürüm bilgisi gider, kişisel veri gitmez).", en: "On startup and every 6 hours GitHub is asked whether a newer version exists (IP and version info are sent, no personal data).", de: "Beim Start und alle 6 Stunden wird bei GitHub nach einer neueren Version gefragt (IP und Versionsinfo, keine persönlichen Daten).", ru: "При запуске и каждые 6 часов проверяется наличие новой версии на GitHub (передаются IP и версия, личные данные — нет).", ar: "عند البدء وكل 6 ساعات يُسأل GitHub عن إصدار أحدث (يُرسل IP والإصدار دون بيانات شخصية).", es: "Al iniciar y cada 6 horas se consulta a GitHub si hay una versión nueva (se envían IP y versión, sin datos personales).", fr: "Au démarrage et toutes les 6 heures, GitHub est interrogé sur une version plus récente (IP et version, aucune donnée personnelle).", az: "Açılışda və hər 6 saatdan bir GitHub-dan yeni versiya soruşulur (IP və versiya gedir, şəxsi məlumat getmir).",
  },
  set_updateAutoDownload: {
    tr: "Güncellemeyi otomatik indir", en: "Download updates automatically", de: "Updates automatisch laden", ru: "Скачивать обновления автоматически", ar: "تنزيل التحديثات تلقائياً", es: "Descargar actualizaciones automáticamente", fr: "Télécharger les mises à jour automatiquement", az: "Yenilikləri avtomatik yüklə",
  },
  setDesc_updateAutoDownload: {
    tr: "Açıksa yeni sürüm bulununca arka planda indirilir; kurulum yine senin \"Yeniden başlat ve güncelle\" onayınla olur.", en: "If on, a new version is downloaded in the background; installing still needs your \"Restart and update\" confirmation.", de: "Wenn aktiv, wird eine neue Version im Hintergrund geladen; die Installation erfordert weiterhin deine Bestätigung.", ru: "Если включено, новая версия скачивается в фоне; установка по-прежнему требует твоего подтверждения.", ar: "عند التفعيل يُنزَّل الإصدار الجديد في الخلفية؛ ويبقى التثبيت بتأكيدك.", es: "Si está activo, la nueva versión se descarga en segundo plano; instalar sigue requiriendo tu confirmación.", fr: "Si activé, la nouvelle version est téléchargée en arrière-plan ; l’installation demande toujours ta confirmation.", az: "Açıqdırsa yeni versiya arxa planda yüklənir; quraşdırma yenə də sənin təsdiqinlə olur.",
  },
  extDetails: {
    tr: "Eklenti ayrıntıları", en: "Extension details", de: "Erweiterungsdetails", ru: "Сведения о расширении", ar: "تفاصيل الإضافة", es: "Detalles de la extensión", fr: "Détails de l’extension", az: "Əlavə təfərrüatları",
  },
  extBack: {
    tr: "Geri", en: "Back", de: "Zurück", ru: "Назад", ar: "رجوع", es: "Atrás", fr: "Retour", az: "Geri",
  },
  extReadme: {
    tr: "Açıklama", en: "Details", de: "Beschreibung", ru: "Описание", ar: "الوصف", es: "Descripción", fr: "Description", az: "Təsvir",
  },
  extChangelog: {
    tr: "Değişiklikler", en: "Changelog", de: "Änderungen", ru: "Изменения", ar: "التغييرات", es: "Cambios", fr: "Changements", az: "Dəyişikliklər",
  },
  extPublisher: {
    tr: "Yayıncı", en: "Publisher", de: "Herausgeber", ru: "Издатель", ar: "الناشر", es: "Editor", fr: "Éditeur", az: "Naşir",
  },
  extLicense: {
    tr: "Lisans", en: "License", de: "Lizenz", ru: "Лицензия", ar: "الترخيص", es: "Licencia", fr: "Licence", az: "Lisenziya",
  },
  extRepository: {
    tr: "Depo", en: "Repository", de: "Repository", ru: "Репозиторий", ar: "المستودع", es: "Repositorio", fr: "Dépôt", az: "Depo",
  },
  extCategories: {
    tr: "Kategoriler", en: "Categories", de: "Kategorien", ru: "Категории", ar: "الفئات", es: "Categorías", fr: "Catégories", az: "Kateqoriyalar",
  },
  extVersion: {
    tr: "Sürüm", en: "Version", de: "Version", ru: "Версия", ar: "الإصدار", es: "Versión", fr: "Version", az: "Versiya",
  },
  extDownloadsLabel: {
    tr: "İndirme", en: "Downloads", de: "Downloads", ru: "Загрузки", ar: "التنزيلات", es: "Descargas", fr: "Téléchargements", az: "Yükləmə",
  },
  extRatingLabel: {
    tr: "Puan", en: "Rating", de: "Bewertung", ru: "Оценка", ar: "التقييم", es: "Valoración", fr: "Note", az: "Reytinq",
  },
  extUpdated: {
    tr: "Güncelleme", en: "Last updated", de: "Aktualisiert", ru: "Обновлено", ar: "آخر تحديث", es: "Actualizado", fr: "Mis à jour", az: "Yenilənib",
  },
  extNoReadme: {
    tr: "Bu eklenti için açıklama yok.", en: "This extension has no description.", de: "Für diese Erweiterung gibt es keine Beschreibung.", ru: "У этого расширения нет описания.", ar: "لا يوجد وصف لهذه الإضافة.", es: "Esta extensión no tiene descripción.", fr: "Cette extension n’a pas de description.", az: "Bu əlavə üçün təsvir yoxdur.",
  },
  extOffline: {
    tr: "Open VSX'e ulaşılamadı. İnternet bağlantını, proxy/VPN ayarlarını ve güvenlik duvarını kontrol et.", en: "Could not reach Open VSX. Check your internet connection, proxy/VPN settings and firewall.", de: "Open VSX nicht erreichbar. Prüfe Internetverbindung, Proxy/VPN und Firewall.", ru: "Не удалось подключиться к Open VSX. Проверь интернет, прокси/VPN и брандмауэр.", ar: "تعذّر الوصول إلى Open VSX. تحقق من الإنترنت وإعدادات الوكيل/VPN وجدار الحماية.", es: "No se pudo conectar con Open VSX. Revisa tu conexión, el proxy/VPN y el cortafuegos.", fr: "Open VSX est inaccessible. Vérifie ta connexion, le proxy/VPN et le pare-feu.", az: "Open VSX-ə çatmaq olmadı. İnternet, proxy/VPN və firewall-u yoxla.",
  },
  extTimeout: {
    tr: "Open VSX zamanında yanıt vermedi. Biraz sonra tekrar dene.", en: "Open VSX did not respond in time. Try again shortly.", de: "Open VSX hat nicht rechtzeitig geantwortet. Versuche es gleich erneut.", ru: "Open VSX не ответил вовремя. Повтори чуть позже.", ar: "لم يستجب Open VSX في الوقت المناسب. حاول بعد قليل.", es: "Open VSX no respondió a tiempo. Inténtalo en un momento.", fr: "Open VSX n’a pas répondu à temps. Réessaie dans un instant.", az: "Open VSX vaxtında cavab vermədi. Bir az sonra yenidən cəhd et.",
  },
  extHttp: {
    tr: "Open VSX hata döndürdü (kod {c}). Daha sonra tekrar dene.", en: "Open VSX returned an error (code {c}). Try again later.", de: "Open VSX meldete einen Fehler (Code {c}). Versuche es später erneut.", ru: "Open VSX вернул ошибку (код {c}). Повтори позже.", ar: "أعاد Open VSX خطأً (الرمز {c}). حاول لاحقاً.", es: "Open VSX devolvió un error (código {c}). Inténtalo más tarde.", fr: "Open VSX a renvoyé une erreur (code {c}). Réessaie plus tard.", az: "Open VSX xəta qaytardı (kod {c}). Sonra yenidən cəhd et.",
  },
  setResetAllConfirm: {
    tr: "Tüm ayarlar varsayılana dönecek. Devam edilsin mi?", en: "All settings will return to defaults. Continue?", de: "Alle Einstellungen werden auf Standard zurückgesetzt. Fortfahren?", ru: "Все настройки вернутся к значениям по умолчанию. Продолжить?", ar: "ستعود جميع الإعدادات إلى الافتراضي. هل تريد المتابعة؟", es: "Todos los ajustes volverán a los valores predeterminados. ¿Continuar?", fr: "Tous les paramètres reviendront aux valeurs par défaut. Continuer ?", az: "Bütün ayarlar standart qiymətlərə qayıdacaq. Davam edilsin?",
  },
  cpPlaceholder: {
    tr: "Dosya adı yaz… ( > komut, : satır )", en: "Type a file name… ( > commands, : line )", de: "Dateiname eingeben… ( > Befehle, : Zeile )", ru: "Введи имя файла… ( > команды, : строка )", ar: "اكتب اسم ملف… ( > أوامر، : سطر )", es: "Escribe un archivo… ( > comandos, : línea )", fr: "Tape un nom de fichier… ( > commandes, : ligne )", az: "Fayl adı yaz… ( > komanda, : sətir )",
  },
  extNoInstalled: {
    tr: "Henüz eklenti yok. Mağaza sekmesinden bir tema eklentisi yükleyebilirsin.", en: "No extensions yet. Install a theme extension from the Store tab.", de: "Noch keine Erweiterungen. Installiere im Store-Tab ein Theme.", ru: "Расширений пока нет. Установи тему во вкладке «Магазин».", ar: "لا توجد إضافات بعد. ثبّت سمة من تبويب المتجر.", es: "Aún no hay extensiones. Instala un tema desde la pestaña Tienda.", fr: "Aucune extension. Installe un thème depuis l’onglet Boutique.", az: "Hələ əlavə yoxdur. Mağaza vərəqindən tema əlavəsi quraşdır.",
  },
  extErrRunsCode: {
    tr: "Bu eklenti kod çalıştırıyor; NovaCode yalnız tema eklentilerini destekler.", en: "This extension runs code; NovaCode only supports theme extensions.", de: "Diese Erweiterung führt Code aus; NovaCode unterstützt nur Theme-Erweiterungen.", ru: "Это расширение выполняет код; NovaCode поддерживает только темы.", ar: "هذه الإضافة تشغّل شيفرة؛ يدعم NovaCode إضافات السمات فقط.", es: "Esta extensión ejecuta código; NovaCode solo admite extensiones de temas.", fr: "Cette extension exécute du code ; NovaCode ne gère que les thèmes.", az: "Bu əlavə kod işlədir; NovaCode yalnız tema əlavələrini dəstəkləyir.",
  },
  extErrNothing: {
    tr: "Bu eklentide desteklenen bir içerik (tema) yok.", en: "This extension has no supported content (theme).", de: "Diese Erweiterung enthält nichts Unterstütztes (Theme).", ru: "В этом расширении нет поддерживаемого содержимого (тема).", ar: "لا يحتوي هذا الامتداد على محتوى مدعوم (سمة).", es: "Esta extensión no tiene contenido compatible (tema).", fr: "Cette extension n’a aucun contenu pris en charge (thème).", az: "Bu əlavədə dəstəklənən məzmun (tema) yoxdur.",
  },
  extPartial: {
    tr: "Yüklendi: tema kısmı çalışır, eklentinin kod kısmı çalışmaz.", en: "Installed: the theme part works; the extension’s code part does not run.", de: "Installiert: Der Theme-Teil funktioniert, der Code-Teil läuft nicht.", ru: "Установлено: тема работает, кодовая часть расширения не запускается.", ar: "تم التثبيت: تعمل السمة ولا يعمل جزء الشيفرة.", es: "Instalada: el tema funciona; la parte de código no se ejecuta.", fr: "Installée : le thème fonctionne, la partie code ne s’exécute pas.", az: "Quraşdırıldı: tema işləyir, kod hissəsi işləmir.",
  },
  extNote: {
    tr: "Kaynak: Open VSX (açık kaynak). Yalnız tema eklentileri desteklenir; arama ve indirme sırasında open-vsx.org ile iletişim kurulur, kişisel veri gönderilmez.", en: "Source: Open VSX (open source). Only theme extensions are supported; searching and downloading contacts open-vsx.org, no personal data is sent.", de: "Quelle: Open VSX (Open Source). Nur Theme-Erweiterungen werden unterstützt; Suche und Download kontaktieren open-vsx.org, es werden keine persönlichen Daten gesendet.", ru: "Источник: Open VSX (открытый код). Поддерживаются только темы; поиск и загрузка обращаются к open-vsx.org, личные данные не передаются.", ar: "المصدر: Open VSX (مفتوح المصدر). تُدعم إضافات السمات فقط؛ يتصل البحث والتنزيل بـ open-vsx.org دون إرسال بيانات شخصية.", es: "Fuente: Open VSX (código abierto). Solo se admiten extensiones de temas; la búsqueda y descarga contactan con open-vsx.org sin enviar datos personales.", fr: "Source : Open VSX (open source). Seuls les thèmes sont pris en charge ; la recherche et le téléchargement contactent open-vsx.org sans données personnelles.", az: "Mənbə: Open VSX (açıq mənbə). Yalnız tema əlavələri dəstəklənir; axtarış və yükləmə open-vsx.org ilə əlaqə qurur, şəxsi məlumat göndərilmir.",
  },
  updChannelLabel: {
    tr: "Güncelleme kanalı", en: "Update channel", de: "Update-Kanal", ru: "Канал обновлений", ar: "قناة التحديث", es: "Canal de actualización", fr: "Canal de mise à jour", az: "Yeniləmə kanalı",
  },
  updChannelStable: {
    tr: "Kararlı (kurulu uygulama)", en: "Stable (installed app)", de: "Stabil (installierte App)", ru: "Стабильный (установленное приложение)", ar: "مستقر (تطبيق مثبّت)", es: "Estable (app instalada)", fr: "Stable (app installée)", az: "Sabit (quraşdırılmış tətbiq)",
  },
  updChannelDev: {
    tr: "Geliştirme (kaynak koddan)", en: "Development (from source)", de: "Entwicklung (aus dem Quellcode)", ru: "Разработка (из исходников)", ar: "تطوير (من الشيفرة المصدرية)", es: "Desarrollo (desde el código)", fr: "Développement (depuis le code source)", az: "Hazırlıq (mənbə koddan)",
  },
  cpThemePlaceholder: {
    tr: "Tema ara (ok tuşlarıyla gezin: canlı önizleme, Enter uygular, Esc geri alır)", en: "Search themes (arrow keys: live preview, Enter applies, Esc reverts)", de: "Themes suchen (Pfeiltasten: Live-Vorschau, Enter übernimmt, Esc macht rückgängig)", ru: "Поиск тем (стрелки: живой просмотр, Enter — применить, Esc — отмена)", ar: "ابحث عن سمة (الأسهم: معاينة مباشرة، Enter للتطبيق، Esc للتراجع)", es: "Buscar temas (flechas: vista previa en vivo, Enter aplica, Esc revierte)", fr: "Rechercher des thèmes (flèches : aperçu en direct, Entrée applique, Échap annule)", az: "Tema axtar (oxlar: canlı önizləmə, Enter tətbiq edir, Esc geri qaytarır)",
  },
  pvRefresh: {
    tr: "Yenile", en: "Refresh", de: "Aktualisieren", ru: "Обновить", ar: "تحديث", es: "Actualizar", fr: "Actualiser", az: "Yenilə",
  },
  pvConsole: {
    tr: "Konsol", en: "Console", de: "Konsole", ru: "Консоль", ar: "وحدة التحكم", es: "Consola", fr: "Console", az: "Konsol",
  },
  pvClear: {
    tr: "Temizle", en: "Clear", de: "Leeren", ru: "Очистить", ar: "مسح", es: "Borrar", fr: "Effacer", az: "Təmizlə",
  },
  pvNoPreview: {
    tr: "Bu dosya türü için önizleme yok. HTML, SVG ve Markdown dosyaları önizlenir.", en: "No preview for this file type. HTML, SVG and Markdown files can be previewed.", de: "Für diesen Dateityp gibt es keine Vorschau. HTML-, SVG- und Markdown-Dateien lassen sich anzeigen.", ru: "Для этого типа файла предпросмотра нет. Доступны HTML, SVG и Markdown.", ar: "لا توجد معاينة لهذا النوع من الملفات. تُعاين ملفات HTML وSVG وMarkdown.", es: "No hay vista previa para este tipo de archivo. Se pueden previsualizar HTML, SVG y Markdown.", fr: "Pas d’aperçu pour ce type de fichier. HTML, SVG et Markdown sont prévisualisables.", az: "Bu fayl növü üçün önizləmə yoxdur. HTML, SVG və Markdown fayllarına baxmaq olar.",
  },
  pvNoIndex: {
    tr: "Önizlemek için bu klasörde bir index.html gerekir. Bir HTML dosyası açıp önizle.", en: "Previewing needs an index.html in this folder. Open an HTML file and preview it.", de: "Für die Vorschau wird eine index.html in diesem Ordner benötigt. Öffne eine HTML-Datei.", ru: "Для предпросмотра нужен index.html в этой папке. Откройте HTML-файл.", ar: "تحتاج المعاينة إلى ملف index.html في هذا المجلد. افتح ملف HTML.", es: "La vista previa necesita un index.html en esta carpeta. Abre un archivo HTML.", fr: "L’aperçu nécessite un index.html dans ce dossier. Ouvre un fichier HTML.", az: "Önizləmə üçün bu qovluqda index.html lazımdır. HTML faylı aç.",
  },
  pvBuildFailed: {
    tr: "Önizleme hazırlanamadı. Dosyayı kaydedip yenilemeyi dene.", en: "The preview could not be built. Try saving the file and refreshing.", de: "Die Vorschau konnte nicht erstellt werden. Speichere die Datei und aktualisiere.", ru: "Не удалось подготовить предпросмотр. Сохраните файл и обновите.", ar: "تعذّر إعداد المعاينة. احفظ الملف وحدّث.", es: "No se pudo preparar la vista previa. Guarda el archivo y actualiza.", fr: "L’aperçu n’a pas pu être préparé. Enregistre le fichier et actualise.", az: "Önizləmə hazırlanmadı. Faylı saxla və yenilə.",
  },
  pvLocalServer: {
    tr: "Çalışan sunucu", en: "Running server", de: "Laufender Server", ru: "Запущенный сервер", ar: "الخادم قيد التشغيل", es: "Servidor en ejecución", fr: "Serveur en cours", az: "İşləyən server",
  },
  pvOpenServer: {
    tr: "Önizle", en: "Preview", de: "Vorschau", ru: "Просмотр", ar: "معاينة", es: "Previsualizar", fr: "Prévisualiser", az: "Önizlə",
  },
  pvBackToFile: {
    tr: "Dosya önizlemesine dön", en: "Back to file preview", de: "Zurück zur Dateivorschau", ru: "Вернуться к просмотру файла", ar: "العودة إلى معاينة الملف", es: "Volver a la vista del archivo", fr: "Retour à l’aperçu du fichier", az: "Fayl önizləməsinə qayıt",
  },
  pvUrlPlaceholder: {
    tr: "Yerel sunucu adresi", en: "Local server address", de: "Adresse des lokalen Servers", ru: "Адрес локального сервера", ar: "عنوان الخادم المحلي", es: "Dirección del servidor local", fr: "Adresse du serveur local", az: "Yerli server ünvanı",
  },
  pvBadUrl: {
    tr: "Yalnız yerel adresler önizlenir (http://localhost:PORT veya 127.0.0.1).", en: "Only local addresses can be previewed (http://localhost:PORT or 127.0.0.1).", de: "Nur lokale Adressen sind erlaubt (http://localhost:PORT oder 127.0.0.1).", ru: "Допускаются только локальные адреса (http://localhost:PORT или 127.0.0.1).", ar: "تُعاين العناوين المحلية فقط (http://localhost:PORT أو 127.0.0.1).", es: "Solo se pueden previsualizar direcciones locales (http://localhost:PORT o 127.0.0.1).", fr: "Seules les adresses locales sont prévisualisables (http://localhost:PORT ou 127.0.0.1).", az: "Yalnız yerli ünvanlar önizlənir (http://localhost:PORT və ya 127.0.0.1).",
  },
  setCatRun: {
    tr: "Çalıştır ve önizleme", en: "Run & preview", de: "Ausführen & Vorschau", ru: "Запуск и предпросмотр", ar: "التشغيل والمعاينة", es: "Ejecutar y vista previa", fr: "Exécuter et aperçu", az: "İşlət və önizlə",
  },
  setCatExtensions: {
    tr: "Eklentiler", en: "Extensions", de: "Erweiterungen", ru: "Расширения", ar: "الإضافات", es: "Extensiones", fr: "Extensions", az: "Əlavələr",
  },
  set_previewAutoOpen: {
    tr: "HTML açılınca önizlemeyi otomatik aç", en: "Open the preview automatically for HTML files", de: "Vorschau bei HTML-Dateien automatisch öffnen", ru: "Автоматически открывать предпросмотр для HTML", ar: "فتح المعاينة تلقائياً لملفات HTML", es: "Abrir la vista previa automáticamente para HTML", fr: "Ouvrir automatiquement l’aperçu pour les fichiers HTML", az: "HTML açılanda önizləməni avtomatik aç",
  },
  setDesc_previewAutoOpen: {
    tr: "Bir HTML dosyası ilk kez etkin olunca önizleme paneli açılır (pencere 1100 px'ten genişse ve başka bir sağ panel açık değilse). Sunucu veya localhost gerekmez; yerel CSS/JS/görseller otomatik yüklenir.", en: "When an HTML file first becomes active the preview panel opens (if the window is wider than 1100 px and no other right panel is open). No server or localhost needed; local CSS/JS/images load automatically.", de: "Wird eine HTML-Datei erstmals aktiv, öffnet sich die Vorschau (bei Fensterbreite über 1100 px und ohne anderes rechtes Panel). Kein Server nötig; lokale CSS/JS/Bilder werden automatisch geladen.", ru: "Когда HTML-файл впервые становится активным, открывается предпросмотр (если окно шире 1100 px и нет другой правой панели). Сервер не нужен; локальные CSS/JS/изображения загружаются сами.", ar: "عند تنشيط ملف HTML لأول مرة تُفتح لوحة المعاينة (إذا كان عرض النافذة أكبر من 1100 بكسل ولا توجد لوحة يمنى أخرى). لا حاجة لخادم؛ تُحمَّل ملفات CSS/JS/الصور المحلية تلقائياً.", es: "Cuando un archivo HTML se activa por primera vez se abre la vista previa (si la ventana supera 1100 px y no hay otro panel derecho). No hace falta servidor; el CSS/JS/imágenes locales se cargan solos.", fr: "Quand un fichier HTML devient actif pour la première fois, l’aperçu s’ouvre (si la fenêtre dépasse 1100 px et qu’aucun autre panneau droit n’est ouvert). Aucun serveur requis ; CSS/JS/images locaux chargés automatiquement.", az: "HTML faylı ilk dəfə aktiv olanda önizləmə paneli açılır (pəncərə 1100 px-dən genişdirsə və başqa sağ panel açıq deyilsə). Server lazım deyil; yerli CSS/JS/şəkillər avtomatik yüklənir.",
  },
  set_runSaveBefore: {
    tr: "Çalıştırmadan önce kaydet", en: "Save before running", de: "Vor dem Ausführen speichern", ru: "Сохранять перед запуском", ar: "الحفظ قبل التشغيل", es: "Guardar antes de ejecutar", fr: "Enregistrer avant d’exécuter", az: "İşlətməzdən əvvəl saxla",
  },
  setDesc_runSaveBefore: {
    tr: "Kaydedilmemiş dosya, Çalıştır (F5) ile terminalde çalıştırılmadan önce diske kaydedilir.", en: "An unsaved file is saved to disk before Run (F5) executes it in the terminal.", de: "Eine ungespeicherte Datei wird vor Ausführen (F5) im Terminal gespeichert.", ru: "Несохранённый файл сохраняется на диск перед запуском (F5) в терминале.", ar: "يُحفظ الملف غير المحفوظ على القرص قبل تشغيله (F5) في الطرفية.", es: "Un archivo sin guardar se guarda en disco antes de ejecutarlo (F5) en la terminal.", fr: "Un fichier non enregistré est sauvegardé avant l’exécution (F5) dans le terminal.", az: "Saxlanmamış fayl F5 ilə terminalda işlədilməzdən əvvəl diskə saxlanır.",
  },
  set_runClearTerminal: {
    tr: "Çalıştırmadan önce terminali temizle", en: "Clear the terminal before running", de: "Terminal vor dem Ausführen leeren", ru: "Очищать терминал перед запуском", ar: "مسح الطرفية قبل التشغيل", es: "Limpiar la terminal antes de ejecutar", fr: "Effacer le terminal avant d’exécuter", az: "İşlətməzdən əvvəl terminalı təmizlə",
  },
  set_runCommandNode: {
    tr: "JavaScript çalıştırma komutu", en: "JavaScript run command", de: "JavaScript-Startbefehl", ru: "Команда запуска JavaScript", ar: "أمر تشغيل JavaScript", es: "Comando para ejecutar JavaScript", fr: "Commande d’exécution JavaScript", az: "JavaScript işlətmə komandası",
  },
  setDesc_runCommandNode: {
    tr: "Boşsa yerleşik komut kullanılır (node). Dile özel komutlar şablondur: {file} dosya yolunu, {dir} klasörünü yerleştirir. Değişiklik anında geçerli olur; komut her zaman senin terminalinde çalışır.", en: "If empty the built-in command (node) is used. Per-language commands are templates: {file} inserts the file path, {dir} its folder. Changes apply instantly; the command always runs in your own terminal.", de: "Leer = eingebauter Befehl (node). Sprachbefehle sind Vorlagen: {file} fügt den Dateipfad ein, {dir} den Ordner. Änderungen gelten sofort; der Befehl läuft stets in deinem Terminal.", ru: "Пусто — встроенная команда (node). Команды по языкам — шаблоны: {file} подставляет путь к файлу, {dir} — папку. Изменения применяются сразу; команда всегда выполняется в вашем терминале.", ar: "إذا تُرك فارغاً يُستخدم الأمر المدمج (node). أوامر اللغات قوالب: {file} يدرج مسار الملف و{dir} مجلده. تُطبَّق التغييرات فوراً؛ ويعمل الأمر دائماً في طرفيتك.", es: "Si está vacío se usa el comando integrado (node). Los comandos por lenguaje son plantillas: {file} inserta la ruta del archivo y {dir} su carpeta. Los cambios se aplican al instante; el comando siempre se ejecuta en tu propia terminal.", fr: "Si vide, la commande intégrée (node) est utilisée. Les commandes par langage sont des modèles : {file} insère le chemin du fichier, {dir} son dossier. Les changements s’appliquent immédiatement ; la commande s’exécute toujours dans ton terminal.", az: "Boşdursa daxili komanda (node) işlədilir. Dilə məxsus komandalar şablondur: {file} fayl yolunu, {dir} qovluğu yerləşdirir. Dəyişiklik dərhal qüvvəyə minir; komanda həmişə sənin terminalında işləyir.",
  },
  set_runCommandTs: {
    tr: "TypeScript çalıştırma komutu", en: "TypeScript run command", de: "TypeScript-Startbefehl", ru: "Команда запуска TypeScript", ar: "أمر تشغيل TypeScript", es: "Comando para ejecutar TypeScript", fr: "Commande d’exécution TypeScript", az: "TypeScript işlətmə komandası",
  },
  set_runCommandPython: {
    tr: "Python çalıştırma komutu", en: "Python run command", de: "Python-Startbefehl", ru: "Команда запуска Python", ar: "أمر تشغيل Python", es: "Comando para ejecutar Python", fr: "Commande d’exécution Python", az: "Python işlətmə komandası",
  },
  set_runCommandGo: {
    tr: "Go çalıştırma komutu", en: "Go run command", de: "Go-Startbefehl", ru: "Команда запуска Go", ar: "أمر تشغيل Go", es: "Comando para ejecutar Go", fr: "Commande d’exécution Go", az: "Go işlətmə komandası",
  },
  set_runCommandPhp: {
    tr: "PHP çalıştırma komutu", en: "PHP run command", de: "PHP-Startbefehl", ru: "Команда запуска PHP", ar: "أمر تشغيل PHP", es: "Comando para ejecutar PHP", fr: "Commande d’exécution PHP", az: "PHP işlətmə komandası",
  },
  set_extAutoUpdate: {
    tr: "Eklentileri otomatik güncelle", en: "Update extensions automatically", de: "Erweiterungen automatisch aktualisieren", ru: "Обновлять расширения автоматически", ar: "تحديث الإضافات تلقائياً", es: "Actualizar extensiones automáticamente", fr: "Mettre à jour les extensions automatiquement", az: "Əlavələri avtomatik yenilə",
  },
  setDesc_extAutoUpdate: {
    tr: "Açılıştan kısa süre sonra ve 6 saatte bir yüklü eklentiler için Open VSX'te yeni sürüm aranır ve sessizce yüklenir (arama sözcüğü yok; yalnız IP ve eklenti kimliği gider).", en: "Shortly after startup and every 6 hours Open VSX is checked for newer versions of installed extensions and they are installed silently (no search terms; only IP and extension ID are sent).", de: "Kurz nach dem Start und alle 6 Stunden wird Open VSX nach neueren Versionen installierter Erweiterungen gefragt, die still installiert werden (keine Suchbegriffe; nur IP und Erweiterungs-ID).", ru: "Вскоре после запуска и каждые 6 часов Open VSX проверяется на новые версии установленных расширений, которые ставятся тихо (без поисковых слов; передаются только IP и ID расширения).", ar: "بعد البدء بقليل وكل 6 ساعات يُفحص Open VSX عن إصدارات أحدث للإضافات المثبّتة وتُثبَّت بصمت (دون كلمات بحث؛ يُرسل فقط IP ومعرّف الإضافة).", es: "Poco después de iniciar y cada 6 horas se consulta Open VSX por versiones nuevas de las extensiones instaladas y se instalan en silencio (sin términos de búsqueda; solo IP e ID de la extensión).", fr: "Peu après le démarrage et toutes les 6 heures, Open VSX est interrogé sur les nouvelles versions des extensions installées, installées en silence (aucun terme de recherche ; seulement IP et identifiant).", az: "Açılışdan az sonra və hər 6 saatdan bir quraşdırılmış əlavələr üçün Open VSX-də yeni versiya axtarılır və səssiz quraşdırılır (axtarış sözü yoxdur; yalnız IP və əlavə kimliyi gedir).",
  },
  setExtThemePick: {
    tr: "Renk teması", en: "Color theme", de: "Farbdesign", ru: "Цветовая тема", ar: "سمة الألوان", es: "Tema de color", fr: "Thème de couleur", az: "Rəng teması",
  },
  setExtThemePickDesc: {
    tr: "Yerleşik ve eklentilerden gelen temalar tek listede. Seçim anında editöre ve önizlemeye uygulanır.", en: "Built-in and extension themes in one list. Your choice applies instantly to the editor and the preview.", de: "Integrierte und Erweiterungs-Themes in einer Liste. Die Auswahl gilt sofort für Editor und Vorschau.", ru: "Встроенные темы и темы расширений в одном списке. Выбор сразу применяется к редактору и предпросмотру.", ar: "السمات المدمجة وسمات الإضافات في قائمة واحدة. يُطبَّق اختيارك فوراً على المحرر والمعاينة.", es: "Temas integrados y de extensiones en una sola lista. Tu elección se aplica al instante al editor y a la vista previa.", fr: "Thèmes intégrés et d’extensions dans une seule liste. Ton choix s’applique immédiatement à l’éditeur et à l’aperçu.", az: "Daxili və əlavə temaları tək siyahıda. Seçim dərhal redaktora və önizləməyə tətbiq olunur.",
  },
  setExtBuiltin: {
    tr: "Yerleşik", en: "Built-in", de: "Integriert", ru: "Встроенные", ar: "مدمجة", es: "Integrados", fr: "Intégrés", az: "Daxili",
  },
  setExtOpenStore: {
    tr: "Mağazayı aç", en: "Open store", de: "Store öffnen", ru: "Открыть магазин", ar: "فتح المتجر", es: "Abrir tienda", fr: "Ouvrir la boutique", az: "Mağazanı aç",
  },
} satisfies Record<string, Dict>;

export type ThemeTextKey = keyof typeof THEME_TEXT;

registerTexts(THEME_TEXT);
