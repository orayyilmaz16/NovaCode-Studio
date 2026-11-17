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
} satisfies Record<string, Dict>;

export type ThemeTextKey = keyof typeof THEME_TEXT;

registerTexts(THEME_TEXT);
