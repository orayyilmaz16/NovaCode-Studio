// AI paneli ve Ayarlar'a ait arayüz metinleri (8 dil). Ana pakette değil, bu bölümlerle birlikte gecikmeli yüklenir (paket bütçesi).
// Modül yüklenince kendini t() kaydına ekler; kullanan bileşenler bu dosyayı içe aktarmalıdır.
import { registerTexts, type UiLang } from './uiText';

type Dict = Record<UiLang, string>;

export const AI_TEXT = {
  optAuto: {
    tr: "Otomatik", en: "Automatic", de: "Automatisch", ru: "Автоматически", ar: "تلقائي", es: "Automático", fr: "Automatique", az: "Avtomatik",
  },
  optAiAsk: {
    tr: "Sohbet", en: "Chat", de: "Chat", ru: "Чат", ar: "محادثة", es: "Chat", fr: "Chat", az: "Söhbət",
  },
  optAiAgent: {
    tr: "Ajan", en: "Agent", de: "Agent", ru: "Агент", ar: "وكيل", es: "Agente", fr: "Agent", az: "Agent",
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
  set_aiAllowCommands: {
    tr: "Ajan komut çalıştırabilsin", en: "Let the agent run commands", de: "Agent darf Befehle ausführen", ru: "Разрешить агенту запускать команды", ar: "السماح للوكيل بتشغيل الأوامر", es: "Permitir que el agente ejecute comandos", fr: "Autoriser l’agent à exécuter des commandes", az: "Agent komanda işlədə bilsin",
  },
  setDesc_aiAllowCommands: {
    tr: "Her komut çalışmadan önce onayına sunulur.", en: "Every command is shown for your approval before it runs.", de: "Jeder Befehl wird vor der Ausführung zur Genehmigung angezeigt.", ru: "Каждая команда показывается на подтверждение перед запуском.", ar: "يُعرض كل أمر للموافقة قبل تشغيله.", es: "Cada comando se muestra para tu aprobación antes de ejecutarse.", fr: "Chaque commande t’est soumise avant son exécution.", az: "Hər komanda işləməzdən əvvəl təsdiqinə təqdim olunur.",
  },
  set_aiCompletion: {
    tr: "AI kod tamamlama (hayalet metin)", en: "AI code completion (ghost text)", de: "KI-Codevervollständigung (Geistertext)", ru: "ИИ-автодополнение кода (призрачный текст)", ar: "إكمال الشيفرة بالذكاء الاصطناعي (نص شبحي)", es: "Autocompletado de código con IA (texto fantasma)", fr: "Complétion de code par IA (texte fantôme)", az: "AI kod tamamlama (kölgə mətn)",
  },
  setDesc_aiCompletion: {
    tr: "Yazarken imlecin sonrasını gri öneri olarak tamamlar; Tab ile kabul, Esc ile reddedersin. İmleç çevresindeki kod yalnız bu bilgisayardaki Ollama'ya (qwen2.5-coder:7b, 127.0.0.1) gider, üçüncü tarafa veya yurt dışına çıkmaz; kaydedilmez. .env ve anahtar dosyaları gönderilmez. Model kurulu değilse çalışmaz.", en: "Completes what you are typing as grey ghost text; Tab accepts, Esc dismisses. The code around the cursor goes only to Ollama on this computer (qwen2.5-coder:7b, 127.0.0.1), never to a third party or abroad, and is not stored. .env and key files are never sent. Does nothing if the model is not installed.", de: "Vervollständigt beim Tippen als graue Vorschau; Tab übernimmt, Esc verwirft. Der Code um den Cursor geht nur an Ollama auf diesem Computer (qwen2.5-coder:7b, 127.0.0.1), nie an Dritte oder ins Ausland, und wird nicht gespeichert. .env- und Schlüsseldateien werden nie gesendet. Ohne installiertes Modell passiert nichts.", ru: "Дополняет вводимый код серым текстом; Tab принимает, Esc отклоняет. Код вокруг курсора отправляется только в Ollama на этом компьютере (qwen2.5-coder:7b, 127.0.0.1), не третьим лицам и не за границу, и не сохраняется. Файлы .env и ключи не отправляются. Без установленной модели ничего не происходит.", ar: "يُكمل ما تكتبه كنص رمادي؛ Tab للقبول وEsc للرفض. تذهب الشيفرة حول المؤشر فقط إلى Ollama على هذا الحاسوب (qwen2.5-coder:7b، 127.0.0.1) ولا تصل إلى طرف ثالث أو خارج البلد ولا تُخزَّن. لا تُرسل ملفات .env والمفاتيح. لا يعمل إن لم يكن النموذج مثبّتاً.", es: "Completa lo que escribes como texto gris; Tab acepta, Esc descarta. El código alrededor del cursor va solo a Ollama en este equipo (qwen2.5-coder:7b, 127.0.0.1), nunca a terceros ni al extranjero, y no se guarda. Los archivos .env y de claves no se envían. No hace nada si el modelo no está instalado.", fr: "Complète ce que tu tapes en texte grisé ; Tab accepte, Échap refuse. Le code autour du curseur va uniquement à Ollama sur cet ordinateur (qwen2.5-coder:7b, 127.0.0.1), jamais à un tiers ni à l’étranger, et n’est pas conservé. Les fichiers .env et de clés ne sont jamais envoyés. Sans le modèle installé, rien ne se passe.", az: "Yazdıqca gələcəyi boz mətn kimi tamamlayır; Tab qəbul, Esc rədd. Kursor ətrafındakı kod yalnız bu kompüterdəki Ollama-ya (qwen2.5-coder:7b, 127.0.0.1) gedir, üçüncü tərəfə və ya xaricə çıxmır, saxlanmır. .env və açar faylları göndərilmir. Model quraşdırılmayıbsa işləmir.",
  },
  set_aiCompletionDelay: {
    tr: "Tamamlama gecikmesi (ms)", en: "Completion delay (ms)", de: "Vervollständigungs-Verzögerung (ms)", ru: "Задержка автодополнения (мс)", ar: "تأخير الإكمال (مللي ثانية)", es: "Retraso del autocompletado (ms)", fr: "Délai de complétion (ms)", az: "Tamamlama gecikməsi (ms)",
  },
  set_aiMaxTokens: {
    tr: "En çok yanıt uzunluğu (token)", en: "Max response length (tokens)", de: "Max. Antwortlänge (Token)", ru: "Макс. длина ответа (токены)", ar: "أقصى طول للرد (رموز)", es: "Longitud máxima de respuesta (tokens)", fr: "Longueur max. de réponse (tokens)", az: "Maks. cavab uzunluğu (token)",
  },
  set_aiVoiceEnabled: {
    tr: "Sesli dikteyi aç", en: "Enable voice dictation", de: "Sprachdiktat aktivieren", ru: "Включить голосовой ввод", ar: "تفعيل الإملاء الصوتي", es: "Activar dictado por voz", fr: "Activer la dictée vocale", az: "Səsli diktəni aç",
  },
  setDesc_aiVoiceEnabled: {
    tr: "Mikrofon kaydın yalnız bu bilgisayardaki dikte bileşenine (Whisper) gider, cihazdan çıkmaz. Kayıt diske yazılmaz. Rıza vermek için aç; istediğin an kapatırsın.", en: "Your microphone recording goes only to the dictation component on this computer (Whisper) and never leaves the device. The recording is not saved to disk. Turn on to consent; turn off any time.", de: "Deine Mikrofonaufnahme geht nur an die Diktatkomponente auf diesem Computer (Whisper) und verlässt das Gerät nicht. Die Aufnahme wird nicht auf der Festplatte gespeichert. Zum Einwilligen einschalten; jederzeit ausschaltbar.", ru: "Запись с микрофона уходит только в компонент диктовки на этом компьютере (Whisper) и не покидает устройство. Запись не сохраняется на диск. Включите, чтобы дать согласие; отключить можно в любой момент.", ar: "يذهب تسجيل الميكروفون فقط إلى مكوّن الإملاء على هذا الكمبيوتر (Whisper) ولا يغادر الجهاز. لا يُحفظ التسجيل على القرص. فعّل للموافقة، ويمكنك الإيقاف في أي وقت.", es: "La grabación del micrófono va solo al componente de dictado de este equipo (Whisper) y no sale del dispositivo. La grabación no se guarda en disco. Actívalo para dar tu consentimiento; puedes desactivarlo cuando quieras.", fr: "L’enregistrement du micro va uniquement au composant de dictée de cet ordinateur (Whisper) et ne quitte pas l’appareil. L’enregistrement n’est pas écrit sur le disque. Active pour consentir ; désactive à tout moment.", az: "Mikrofon yazısı yalnız bu kompüterdəki diktə komponentinə (Whisper) gedir və cihazdan çıxmır. Yazı diskə yazılmır. Razılıq üçün aç; istənilən vaxt söndürə bilərsən.",
  },
  aiSessions: {
    tr: "Sohbetler", en: "Chats", de: "Chats", ru: "Чаты", ar: "المحادثات", es: "Chats", fr: "Chats", az: "Söhbətlər",
  },
  aiNewSession: {
    tr: "Yeni sohbet", en: "New chat", de: "Neuer Chat", ru: "Новый чат", ar: "محادثة جديدة", es: "Nuevo chat", fr: "Nouveau chat", az: "Yeni söhbət",
  },
  aiDeleteSession: {
    tr: "Sohbeti sil", en: "Delete chat", de: "Chat löschen", ru: "Удалить чат", ar: "حذف المحادثة", es: "Eliminar chat", fr: "Supprimer le chat", az: "Söhbəti sil",
  },
  aiOpenSettings: {
    tr: "Yapay zekâ ayarları", en: "AI settings", de: "KI-Einstellungen", ru: "Настройки ИИ", ar: "إعدادات الذكاء الاصطناعي", es: "Ajustes de IA", fr: "Paramètres IA", az: "Süni intellekt ayarları",
  },
  aiModeAsk: {
    tr: "Sohbet", en: "Chat", de: "Chat", ru: "Чат", ar: "محادثة", es: "Chat", fr: "Chat", az: "Söhbət",
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
    tr: "Mikrofon düğmesine basmak sesli dikteyi açar: kaydın yalnız bu bilgisayarda metne çevrilir, cihazdan çıkmaz. Ayarlardan kapatabilirsin.", en: "Pressing the mic turns on voice dictation: your recording is converted to text on this computer only and never leaves the device. You can turn it off in Settings.", de: "Ein Klick aufs Mikrofon aktiviert das Sprachdiktat: Die Aufnahme wird nur auf diesem Computer in Text umgewandelt und verlässt das Gerät nicht. In den Einstellungen abschaltbar.", ru: "Нажатие на микрофон включает голосовой ввод: запись преобразуется в текст только на этом компьютере и не покидает устройство. Отключить можно в настройках.", ar: "الضغط على الميكروفون يفعّل الإملاء الصوتي: يُحوَّل تسجيلك إلى نص على هذا الكمبيوتر فقط ولا يغادر الجهاز. يمكنك إيقافه من الإعدادات.", es: "Pulsar el micrófono activa el dictado por voz: tu grabación se convierte en texto solo en este equipo y no sale del dispositivo. Puedes desactivarlo en Ajustes.", fr: "Appuyer sur le micro active la dictée vocale : ton enregistrement est converti en texte uniquement sur cet ordinateur et ne quitte pas l’appareil. Tu peux la désactiver dans les Réglages.", az: "Mikrofona basmaq səsli diktəni açır: yazın yalnız bu kompüterdə mətnə çevrilir və cihazdan çıxmır. Ayarlardan söndürə bilərsən.",
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
  aiOllamaDown: {
    tr: "Ollama çalışmıyor. ollama.com adresinden kur ve başlat; her şey bu bilgisayarda, ücretsiz çalışır.", en: "Ollama is not running. Install and start it from ollama.com; everything runs on this computer, free of charge.", de: "Ollama läuft nicht. Installiere und starte es von ollama.com; alles läuft lokal und kostenlos auf diesem Computer.", ru: "Ollama не запущена. Установи и запусти её с ollama.com; всё работает на этом компьютере бесплатно.", ar: "Ollama لا يعمل. ثبّته وشغّله من ollama.com؛ كل شيء يعمل على هذا الحاسوب مجاناً.", es: "Ollama no está en ejecución. Instálalo e inícialo desde ollama.com; todo funciona en este equipo, gratis.", fr: "Ollama n’est pas lancé. Installe-le et démarre-le depuis ollama.com ; tout tourne sur cet ordinateur, gratuitement.", az: "Ollama işləmir. ollama.com saytından quraşdır və başlat; hər şey bu kompüterdə pulsuz işləyir.",
  },
  aiOllamaModelMissing: {
    tr: "Model yüklü değil: {m}. Terminalde şunu çalıştır: ollama pull {m}", en: "Model not installed: {m}. Run this in a terminal: ollama pull {m}", de: "Modell nicht installiert: {m}. Führe im Terminal aus: ollama pull {m}", ru: "Модель не установлена: {m}. Выполни в терминале: ollama pull {m}", ar: "النموذج غير مثبّت: {m}. شغّل في الطرفية: ollama pull {m}", es: "Modelo no instalado: {m}. Ejecuta en una terminal: ollama pull {m}", fr: "Modèle non installé : {m}. Exécute dans un terminal : ollama pull {m}", az: "Model quraşdırılmayıb: {m}. Terminalda işlət: ollama pull {m}",
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
  aiBuiltinTitle: {
    tr: "Yerleşik yapay zekâyı kur", en: "Set up the built-in AI", de: "Integrierte KI einrichten", ru: "Настроить встроенный ИИ", ar: "إعداد الذكاء الاصطناعي المدمج", es: "Configurar la IA integrada", fr: "Configurer l’IA intégrée", az: "Daxili süni intellekti qur",
  },
  aiBuiltinDesc: {
    tr: "API anahtarı, sunucu adresi veya ücret yok. Bir model indir; sonra her şey bu bilgisayarda çalışır.", en: "No API key, server address or fees. Download a model once; afterwards everything runs on this computer.", de: "Kein API-Schlüssel, keine Serveradresse, keine Kosten. Lade einmal ein Modell; danach läuft alles auf diesem Computer.", ru: "Без ключа API, адреса сервера и платы. Скачай модель один раз — дальше всё работает на этом компьютере.", ar: "بدون مفتاح API أو عنوان خادم أو رسوم. نزّل نموذجاً مرة واحدة ثم يعمل كل شيء على هذا الحاسوب.", es: "Sin clave API, dirección de servidor ni costes. Descarga un modelo una vez; después todo funciona en este equipo.", fr: "Sans clé API, adresse de serveur ni frais. Télécharge un modèle une fois ; ensuite tout tourne sur cet ordinateur.", az: "API açarı, server ünvanı və ödəniş yoxdur. Modeli bir dəfə yüklə; sonra hər şey bu kompüterdə işləyir.",
  },
  aiBuiltinDownload: {
    tr: "İndir", en: "Download", de: "Laden", ru: "Скачать", ar: "تنزيل", es: "Descargar", fr: "Télécharger", az: "Yüklə",
  },
  aiBuiltinCancel: {
    tr: "İptal", en: "Cancel", de: "Abbrechen", ru: "Отмена", ar: "إلغاء", es: "Cancelar", fr: "Annuler", az: "Ləğv et",
  },
  aiBuiltinProgress: {
    tr: "%{p} indiriliyor… (kapatsan da devam eder, kaldığı yerden sürer)", en: "{p}% downloading… (resumes where it left off if interrupted)", de: "{p} % wird geladen… (setzt nach Unterbrechung fort)", ru: "Загрузка {p}%… (продолжится с места остановки)", ar: "جارٍ التنزيل {p}%… (يُستأنف من حيث توقف)", es: "Descargando {p}%… (se reanuda donde quedó)", fr: "Téléchargement {p} %… (reprend là où il s’est arrêté)", az: "{p}% yüklənir… (yarımçıq qalsa davam edər)",
  },
  aiBuiltinFailed: {
    tr: "İndirme başarısız. İnternetini kontrol edip tekrar dene; kaldığı yerden sürer.", en: "Download failed. Check your connection and try again; it resumes where it stopped.", de: "Download fehlgeschlagen. Prüfe die Verbindung und versuche es erneut; es setzt fort.", ru: "Загрузка не удалась. Проверь соединение и повтори — продолжится с места остановки.", ar: "فشل التنزيل. تحقق من الاتصال وأعد المحاولة؛ سيُستأنف من حيث توقف.", es: "Falló la descarga. Revisa la conexión e inténtalo de nuevo; se reanuda donde quedó.", fr: "Échec du téléchargement. Vérifie la connexion et réessaie ; il reprend là où il s’est arrêté.", az: "Yükləmə alınmadı. Bağlantını yoxla və yenidən cəhd et; qaldığı yerdən davam edər.",
  },
  aiBuiltinNote: {
    tr: "Model dosyası tek seferlik Hugging Face'ten indirilir (yalnız dosya istenir, senin verin gönderilmez). Sohbet ve kodun bu bilgisayardan çıkmaz.", en: "The model file is downloaded once from Hugging Face (only the file is requested, none of your data is sent). Your chat and code never leave this computer.", de: "Die Modelldatei wird einmalig von Hugging Face geladen (nur die Datei wird angefragt, keine deiner Daten gesendet). Chat und Code verlassen diesen Computer nicht.", ru: "Файл модели скачивается один раз с Hugging Face (запрашивается только файл, твои данные не отправляются). Чат и код не покидают этот компьютер.", ar: "يُنزَّل ملف النموذج مرة واحدة من Hugging Face (يُطلب الملف فقط ولا تُرسل بياناتك). لا تغادر محادثتك وشيفرتك هذا الحاسوب.", es: "El archivo del modelo se descarga una vez de Hugging Face (solo se pide el archivo, no se envían tus datos). Tu chat y código no salen de este equipo.", fr: "Le fichier du modèle est téléchargé une fois depuis Hugging Face (seul le fichier est demandé, aucune de tes données n’est envoyée). Ton chat et ton code ne quittent pas cet ordinateur.", az: "Model faylı Hugging Face-dən bir dəfə yüklənir (yalnız fayl istənir, məlumatın göndərilmir). Söhbət və kodun bu kompüterdən çıxmır.",
  },
  aiTierFast: {
    tr: "Hızlı", en: "Fast", de: "Schnell", ru: "Быстрая", ar: "سريع", es: "Rápido", fr: "Rapide", az: "Sürətli",
  },
  aiTierStrong: {
    tr: "Güçlü", en: "Strong", de: "Stark", ru: "Мощная", ar: "قوي", es: "Potente", fr: "Puissant", az: "Güclü",
  },
  aiRam: {
    tr: "~{n} GB RAM", en: "~{n} GB RAM", de: "~{n} GB RAM", ru: "~{n} ГБ ОЗУ", ar: "~{n} غ.ب ذاكرة", es: "~{n} GB de RAM", fr: "~{n} Go de RAM", az: "~{n} GB RAM",
  },
  aiReady: {
    tr: "Hazır", en: "Ready", de: "Bereit", ru: "Готово", ar: "جاهز", es: "Listo", fr: "Prêt", az: "Hazır",
  },
  aiNoImages: {
    tr: "Yerleşik model görselleri okuyamaz. Görsel için Ollama'da görüntü destekli bir model seç.", en: "The built-in model cannot read images. For images pick a vision-capable model in Ollama.", de: "Das integrierte Modell kann keine Bilder lesen. Wähle für Bilder ein Vision-Modell in Ollama.", ru: "Встроенная модель не читает изображения. Для картинок выбери модель с поддержкой зрения в Ollama.", ar: "النموذج المدمج لا يقرأ الصور. للصور اختر نموذجاً داعماً للرؤية في Ollama.", es: "El modelo integrado no puede leer imágenes. Para imágenes elige un modelo con visión en Ollama.", fr: "Le modèle intégré ne lit pas les images. Pour les images, choisis un modèle vision dans Ollama.", az: "Daxili model şəkilləri oxuya bilmir. Şəkil üçün Ollama-da görmə dəstəkli model seç.",
  },
  aiErrNoModel: {
    tr: "Yerleşik model henüz indirilmedi. Yukarıdaki karttan indirebilirsin.", en: "The built-in model has not been downloaded yet. You can download it from the card above.", de: "Das integrierte Modell wurde noch nicht geladen. Du kannst es über die Karte oben laden.", ru: "Встроенная модель ещё не скачана. Скачай её в карточке выше.", ar: "لم يُنزَّل النموذج المدمج بعد. يمكنك تنزيله من البطاقة أعلاه.", es: "El modelo integrado aún no se ha descargado. Puedes descargarlo desde la tarjeta de arriba.", fr: "Le modèle intégré n’est pas encore téléchargé. Tu peux le télécharger depuis la carte ci-dessus.", az: "Daxili model hələ yüklənməyib. Yuxarıdakı kartdan yükləyə bilərsən.",
  },
  aiVoiceNeedsKey: {
    tr: "Dikte bileşeni (Whisper) bulunamadı. %LOCALAPPDATA%\\NovaWhisper klasöründe kurulu olmalı.", en: "Dictation component (Whisper) not found. It must be installed in %LOCALAPPDATA%\\NovaWhisper.", de: "Diktatkomponente (Whisper) nicht gefunden. Sie muss in %LOCALAPPDATA%\\NovaWhisper installiert sein.", ru: "Компонент диктовки (Whisper) не найден. Он должен быть установлен в %LOCALAPPDATA%\\NovaWhisper.", ar: "لم يُعثر على مكوّن الإملاء (Whisper). يجب تثبيته في %LOCALAPPDATA%\\NovaWhisper.", es: "No se encontró el componente de dictado (Whisper). Debe estar instalado en %LOCALAPPDATA%\\NovaWhisper.", fr: "Composant de dictée (Whisper) introuvable. Il doit être installé dans %LOCALAPPDATA%\\NovaWhisper.", az: "Diktə komponenti (Whisper) tapılmadı. O, %LOCALAPPDATA%\\NovaWhisper qovluğunda quraşdırılmalıdır.",
  },
  aiBuiltinAgentWarn: {
    tr: "Hızlı model ajan modunda yalnızca dosya okur ve arar. Düzenleme ve komut için Güçlü modeli (Ayarlar → Yapay Zekâ) veya Ollama'yı kullan.", en: "In Agent mode the Fast model only reads and searches files. For edits and commands use the Strong model (Settings → AI Assistant) or Ollama.", de: "Im Agent-Modus liest und durchsucht das schnelle Modell nur Dateien. Für Änderungen und Befehle nutze das starke Modell (Einstellungen → KI-Assistent) oder Ollama.", ru: "В режиме агента быстрая модель только читает и ищет файлы. Для правок и команд используй мощную модель (Настройки → ИИ) или Ollama.", ar: "في وضع الوكيل يقرأ النموذج السريع الملفات ويبحث فيها فقط. للتعديل والأوامر استخدم النموذج القوي (الإعدادات ← المساعد الذكي) أو Ollama.", es: "En modo Agente el modelo rápido solo lee y busca archivos. Para editar y ejecutar comandos usa el modelo potente (Ajustes → Asistente IA) u Ollama.", fr: "En mode Agent, le modèle rapide ne fait que lire et chercher des fichiers. Pour modifier et exécuter des commandes, utilise le modèle puissant (Paramètres → Assistant IA) ou Ollama.", az: "Agent rejimində sürətli model yalnız faylları oxuyur və axtarır. Redaktə və komanda üçün güclü modeldən (Ayarlar → Süni intellekt) və ya Ollama-dan istifadə et.",
  },
  aiErrStuck: {
    tr: "Model bu görevi tamamlayamadı. Daha net yaz, Güçlü modeli ya da Ollama'yı dene.", en: "The model could not complete this task. Be more specific, or try the Strong model or Ollama.", de: "Das Modell konnte die Aufgabe nicht abschließen. Formuliere genauer oder nutze das starke Modell bzw. Ollama.", ru: "Модель не смогла выполнить задачу. Уточни запрос или попробуй мощную модель либо Ollama.", ar: "تعذّر على النموذج إكمال المهمة. كن أكثر تحديداً أو جرّب النموذج القوي أو Ollama.", es: "El modelo no pudo completar la tarea. Sé más específico o prueba el modelo potente u Ollama.", fr: "Le modèle n’a pas pu terminer la tâche. Sois plus précis ou essaie le modèle puissant ou Ollama.", az: "Model bu tapşırığı tamamlaya bilmədi. Daha dəqiq yaz, güclü modeli və ya Ollama-nı sına.",
  },
  grpAiGeneral: {
    tr: "Genel", en: "General", de: "Allgemein", ru: "Общие", ar: "عام", es: "General", fr: "Général", az: "Ümumi",
  },
  grpAiVoice: {
    tr: "Ses", en: "Voice", de: "Sprache", ru: "Голос", ar: "الصوت", es: "Voz", fr: "Voix", az: "Səs",
  },
  set_aiAskInstructions: {
    tr: "Sohbet: özel yönerge", en: "Chat: custom instructions", de: "Chat: eigene Anweisungen", ru: "Чат: свои инструкции", ar: "المحادثة: تعليمات مخصصة", es: "Chat: instrucciones propias", fr: "Chat : instructions personnalisées", az: "Söhbət: xüsusi təlimat",
  },
  setDesc_aiAskInstructions: {
    tr: "Sohbet modunda her istekte sistem istemine eklenir (ör. \"Kısa yanıtla\"). Seçili sağlayıcıya gider.", en: "Added to the system prompt of every Chat request (e.g. \"Answer briefly\"). Sent to the selected provider.", de: "Wird jeder Chat-Anfrage im Systemprompt hinzugefügt (z. B. „Antworte kurz“). Geht an den gewählten Anbieter.", ru: "Добавляется к системному промпту каждого запроса в чате (напр. «Отвечай кратко»). Уходит выбранному провайдеру.", ar: "تُضاف إلى موجّه النظام في كل طلب محادثة (مثل «أجب باختصار»). تُرسل إلى المزوّد المحدد.", es: "Se añade al prompt del sistema de cada petición de Chat (p. ej. «Responde breve»). Se envía al proveedor elegido.", fr: "Ajouté au prompt système de chaque requête Chat (ex. « Réponds brièvement »). Envoyé au fournisseur choisi.", az: "Söhbət rejimində hər sorğunun sistem təlimatına əlavə olunur (məs. «Qısa cavab ver»). Seçilmiş provayderə göndərilir.",
  },
  set_aiAgentIncludeContext: {
    tr: "Ajan: açık dosyayı bağlam olarak gönder", en: "Agent: send the open file as context", de: "Agent: geöffnete Datei als Kontext senden", ru: "Агент: отправлять открытый файл как контекст", ar: "الوكيل: إرسال الملف المفتوح كسياق", es: "Agente: enviar el archivo abierto como contexto", fr: "Agent : envoyer le fichier ouvert comme contexte", az: "Agent: açıq faylı kontekst kimi göndər",
  },
  setDesc_aiAgentIncludeContext: {
    tr: "Ajan zaten dosyaları araçlarla okur; kapatırsan yalnız yazdığın görev gider, daha az veri paylaşılır.", en: "The agent already reads files with tools; turn off to send only your task and share less data.", de: "Der Agent liest Dateien ohnehin mit Tools; ausschalten, um nur die Aufgabe zu senden und weniger Daten zu teilen.", ru: "Агент и так читает файлы инструментами; выключите, чтобы отправлялась только задача и меньше данных.", ar: "الوكيل يقرأ الملفات بالأدوات أصلاً؛ أوقفه لإرسال المهمة فقط ومشاركة بيانات أقل.", es: "El agente ya lee archivos con herramientas; desactívalo para enviar solo tu tarea y compartir menos datos.", fr: "L’agent lit déjà les fichiers avec des outils ; désactive pour n’envoyer que ta tâche et partager moins de données.", az: "Agent faylları alətlərlə onsuz da oxuyur; söndürsən yalnız tapşırığın gedir, daha az məlumat paylaşılır.",
  },
  set_aiAgentMaxTokens: {
    tr: "Ajan: en çok yanıt uzunluğu (token)", en: "Agent: max response length (tokens)", de: "Agent: max. Antwortlänge (Token)", ru: "Агент: макс. длина ответа (токены)", ar: "الوكيل: أقصى طول للرد (رموز)", es: "Agente: longitud máxima de respuesta (tokens)", fr: "Agent : longueur max. de réponse (tokens)", az: "Agent: maksimum cavab uzunluğu (token)",
  },
  set_aiAgentInstructions: {
    tr: "Ajan: özel yönerge", en: "Agent: custom instructions", de: "Agent: eigene Anweisungen", ru: "Агент: свои инструкции", ar: "الوكيل: تعليمات مخصصة", es: "Agente: instrucciones propias", fr: "Agent : instructions personnalisées", az: "Agent: xüsusi təlimat",
  },
  setDesc_aiAgentInstructions: {
    tr: "Ajan modunda her istekte sistem istemine eklenir (ör. \"Değişiklikten önce test çalıştır\"). Proje yönergesine ek olarak çalışır. Seçili sağlayıcıya gider.", en: "Added to the system prompt of every Agent request (e.g. \"Run tests before finishing\"). Works in addition to project instructions. Sent to the selected provider.", de: "Wird jeder Agent-Anfrage im Systemprompt hinzugefügt (z. B. „Tests vor Abschluss ausführen“). Zusätzlich zu den Projektanweisungen. Geht an den gewählten Anbieter.", ru: "Добавляется к системному промпту каждого запроса агента (напр. «Запускай тесты перед завершением»). Работает вместе с инструкциями проекта. Уходит выбранному провайдеру.", ar: "تُضاف إلى موجّه النظام في كل طلب وكيل (مثل «شغّل الاختبارات قبل الإنهاء»). تعمل إضافةً إلى تعليمات المشروع. تُرسل إلى المزوّد المحدد.", es: "Se añade al prompt del sistema de cada petición del Agente (p. ej. «Ejecuta las pruebas antes de terminar»). Funciona junto con las instrucciones del proyecto. Se envía al proveedor elegido.", fr: "Ajouté au prompt système de chaque requête Agent (ex. « Lance les tests avant de finir »). S’ajoute aux instructions du projet. Envoyé au fournisseur choisi.", az: "Agent rejimində hər sorğunun sistem təlimatına əlavə olunur (məs. «Bitirməzdən əvvəl testləri işə sal»). Layihə təlimatına əlavə işləyir. Seçilmiş provayderə göndərilir.",
  },
  set_aiAskThinking: {
    tr: "Sohbet: düşünme seviyesi", en: "Chat: thinking level", de: "Chat: Denktiefe", ru: "Чат: уровень размышления", ar: "المحادثة: مستوى التفكير", es: "Chat: nivel de razonamiento", fr: "Chat : niveau de réflexion", az: "Söhbət: düşünmə səviyyəsi",
  },
  setDesc_aiAskThinking: {
    tr: "Hızlı: kısa ve doğrudan yanıt. Dengeli: gerekirse kısa plan. Derin: adım adım düşünür, daha yavaş ama daha doğru. Yerel modelde gerçek düşünme modu yoktur; seviye yanıt biçimini ve kararlılığı ayarlar.", en: "Fast: short, direct answers. Balanced: a short plan when needed. Deep: thinks step by step, slower but more accurate. The local model has no real thinking mode; this level tunes the answer style and consistency.", de: "Schnell: kurze, direkte Antworten. Ausgewogen: bei Bedarf ein kurzer Plan. Tief: denkt Schritt für Schritt, langsamer, aber genauer. Das lokale Modell hat keinen echten Denkmodus; die Stufe steuert Antwortstil und Konsistenz.", ru: "Быстро: короткие прямые ответы. Баланс: при необходимости краткий план. Глубоко: рассуждает пошагово, медленнее, но точнее. У локальной модели нет настоящего режима размышления; уровень настраивает стиль и стабильность ответа.", ar: "سريع: ردود قصيرة ومباشرة. متوازن: خطة قصيرة عند الحاجة. عميق: يفكر خطوة بخطوة، أبطأ لكنه أدق. النموذج المحلي لا يملك وضع تفكير حقيقياً؛ هذا المستوى يضبط أسلوب الرد وثباته.", es: "Rápido: respuestas cortas y directas. Equilibrado: un plan breve si hace falta. Profundo: piensa paso a paso, más lento pero más preciso. El modelo local no tiene un modo de razonamiento real; este nivel ajusta el estilo y la consistencia.", fr: "Rapide : réponses courtes et directes. Équilibré : un court plan si besoin. Approfondi : réfléchit pas à pas, plus lent mais plus précis. Le modèle local n’a pas de vrai mode de réflexion ; ce niveau règle le style et la constance.", az: "Sürətli: qısa və birbaşa cavab. Balanslı: lazım olduqda qısa plan. Dərin: addım-addım düşünür, daha yavaş, amma daha dəqiq. Lokal modeldə real düşünmə rejimi yoxdur; bu səviyyə cavab üslubunu və sabitliyi tənzimləyir.",
  },
  set_aiAgentThinking: {
    tr: "Ajan: düşünme seviyesi", en: "Agent: thinking level", de: "Agent: Denktiefe", ru: "Агент: уровень размышления", ar: "الوكيل: مستوى التفكير", es: "Agente: nivel de razonamiento", fr: "Agent : niveau de réflexion", az: "Agent: düşünmə səviyyəsi",
  },
  setDesc_aiAgentThinking: {
    tr: "Derin seviyede ajan değişiklikten önce ilgili dosyaları okur, etkilenen yerleri arar ve sonucu doğrulamaya çalışır; daha yavaştır ama daha güvenlidir.", en: "At the Deep level the agent reads the relevant files, searches affected places and tries to verify the result before finishing; slower but safer.", de: "Auf der Stufe „Tief“ liest der Agent die betroffenen Dateien, sucht betroffene Stellen und versucht, das Ergebnis zu prüfen; langsamer, aber sicherer.", ru: "На уровне «Глубоко» агент читает нужные файлы, ищет затронутые места и пытается проверить результат; медленнее, но надёжнее.", ar: "في المستوى «عميق» يقرأ الوكيل الملفات ذات الصلة ويبحث عن الأماكن المتأثرة ويحاول التحقق من النتيجة؛ أبطأ لكنه أكثر أماناً.", es: "En el nivel Profundo el agente lee los archivos relevantes, busca los lugares afectados e intenta verificar el resultado; más lento pero más seguro.", fr: "Au niveau Approfondi, l’agent lit les fichiers concernés, cherche les endroits touchés et tente de vérifier le résultat ; plus lent mais plus sûr.", az: "Dərin səviyyədə agent aidiyyatı olan faylları oxuyur, təsirlənən yerləri axtarır və nəticəni yoxlamağa çalışır; daha yavaş, amma daha etibarlıdır.",
  },
  optThinkFast: {
    tr: "Hızlı", en: "Fast", de: "Schnell", ru: "Быстро", ar: "سريع", es: "Rápido", fr: "Rapide", az: "Sürətli",
  },
  optThinkBalanced: {
    tr: "Dengeli", en: "Balanced", de: "Ausgewogen", ru: "Баланс", ar: "متوازن", es: "Equilibrado", fr: "Équilibré", az: "Balanslı",
  },
  optThinkDeep: {
    tr: "Derin", en: "Deep", de: "Tief", ru: "Глубоко", ar: "عميق", es: "Profundo", fr: "Approfondi", az: "Dərin",
  },
  catBug: {
    tr: "Hata", en: "Bug", de: "Fehler", ru: "Ошибка", ar: "خطأ", es: "Error", fr: "Bogue", az: "Xəta",
  },
  catFeature: {
    tr: "Özellik", en: "Feature", de: "Funktion", ru: "Функция", ar: "ميزة", es: "Función", fr: "Fonction", az: "Xüsusiyyət",
  },
  catExplain: {
    tr: "Açıklama", en: "Explanation", de: "Erklärung", ru: "Объяснение", ar: "شرح", es: "Explicación", fr: "Explication", az: "İzah",
  },
  catRefactor: {
    tr: "Refaktör", en: "Refactor", de: "Refactoring", ru: "Рефакторинг", ar: "إعادة هيكلة", es: "Refactorización", fr: "Refactorisation", az: "Refaktorinq",
  },
  catTest: {
    tr: "Test", en: "Test", de: "Test", ru: "Тест", ar: "اختبار", es: "Prueba", fr: "Test", az: "Test",
  },
  catDocs: {
    tr: "Belge", en: "Docs", de: "Doku", ru: "Документация", ar: "توثيق", es: "Docs", fr: "Docs", az: "Sənəd",
  },
  catGeneral: {
    tr: "Genel", en: "General", de: "Allgemein", ru: "Общее", ar: "عام", es: "General", fr: "Général", az: "Ümumi",
  },
  aiGroupBy: {
    tr: "Grupla", en: "Group by", de: "Gruppieren", ru: "Группировка", ar: "تجميع", es: "Agrupar", fr: "Grouper", az: "Qruplaşdır",
  },
  aiGroupByDate: {
    tr: "Tarih", en: "Date", de: "Datum", ru: "Дата", ar: "التاريخ", es: "Fecha", fr: "Date", az: "Tarix",
  },
  aiGroupByCategory: {
    tr: "Kategori", en: "Category", de: "Kategorie", ru: "Категория", ar: "الفئة", es: "Categoría", fr: "Catégorie", az: "Kateqoriya",
  },
  aiSortBy: {
    tr: "Sırala", en: "Sort", de: "Sortieren", ru: "Сортировка", ar: "ترتيب", es: "Ordenar", fr: "Trier", az: "Sırala",
  },
  aiSortRecent: {
    tr: "Son kullanılan", en: "Recent", de: "Zuletzt", ru: "Недавние", ar: "الأحدث", es: "Recientes", fr: "Récents", az: "Son istifadə",
  },
  aiSortName: {
    tr: "Ada göre", en: "By name", de: "Nach Name", ru: "По имени", ar: "حسب الاسم", es: "Por nombre", fr: "Par nom", az: "Ada görə",
  },
  aiSortMessages: {
    tr: "İleti sayısı", en: "Messages", de: "Nachrichten", ru: "Сообщения", ar: "الرسائل", es: "Mensajes", fr: "Messages", az: "Mesaj sayı",
  },
  aiAllCats: {
    tr: "Tümü", en: "All", de: "Alle", ru: "Все", ar: "الكل", es: "Todos", fr: "Tous", az: "Hamısı",
  },
  aiSetCategory: {
    tr: "Kategori ata", en: "Set category", de: "Kategorie festlegen", ru: "Задать категорию", ar: "تعيين فئة", es: "Asignar categoría", fr: "Définir la catégorie", az: "Kateqoriya təyin et",
  },
  aiThinkingLevel: {
    tr: "Düşünme seviyesi", en: "Thinking level", de: "Denktiefe", ru: "Уровень размышления", ar: "مستوى التفكير", es: "Nivel de razonamiento", fr: "Niveau de réflexion", az: "Düşünmə səviyyəsi",
  },
  aiThinkFastDesc: {
    tr: "Kısa ve doğrudan yanıt", en: "Short, direct answers", de: "Kurze, direkte Antworten", ru: "Короткие прямые ответы", ar: "ردود قصيرة ومباشرة", es: "Respuestas cortas y directas", fr: "Réponses courtes et directes", az: "Qısa və birbaşa cavab",
  },
  aiThinkBalancedDesc: {
    tr: "Gerekirse kısa plan, sonra yanıt", en: "A short plan when needed, then the answer", de: "Bei Bedarf kurzer Plan, dann Antwort", ru: "При необходимости краткий план, затем ответ", ar: "خطة قصيرة عند الحاجة ثم الرد", es: "Un plan breve si hace falta, luego la respuesta", fr: "Un court plan si besoin, puis la réponse", az: "Lazım olsa qısa plan, sonra cavab",
  },
  aiThinkDeepDesc: {
    tr: "Adım adım düşünür; yavaş ama daha doğru", en: "Thinks step by step; slower but more accurate", de: "Denkt Schritt für Schritt; langsamer, aber genauer", ru: "Рассуждает пошагово; медленнее, но точнее", ar: "يفكر خطوة بخطوة؛ أبطأ لكن أدق", es: "Piensa paso a paso; más lento pero más preciso", fr: "Réfléchit pas à pas ; plus lent mais plus précis", az: "Addım-addım düşünür; yavaş, amma daha dəqiq",
  },
  aiQuickAgent1: {
    tr: "Projeyi özetle", en: "Summarize this project", de: "Fasse dieses Projekt zusammen", ru: "Кратко опиши проект", ar: "لخّص هذا المشروع", es: "Resume este proyecto", fr: "Résume ce projet", az: "Layihəni xülasə et",
  },
  aiQuickAgent2: {
    tr: "TODO notlarını bul", en: "Find the TODO comments", de: "Finde die TODO-Kommentare", ru: "Найди комментарии TODO", ar: "ابحث عن ملاحظات TODO", es: "Encuentra los comentarios TODO", fr: "Trouve les commentaires TODO", az: "TODO qeydlərini tap",
  },
  aiQuickAgent3: {
    tr: "Testleri çalıştır, hataları düzelt", en: "Run the tests and fix failures", de: "Führe die Tests aus und behebe Fehler", ru: "Запусти тесты и исправь ошибки", ar: "شغّل الاختبارات وأصلح الأخطاء", es: "Ejecuta las pruebas y corrige los fallos", fr: "Lance les tests et corrige les échecs", az: "Testləri işə sal, xətaları düzəlt",
  },
  aiQuickAgent4: {
    tr: "README'yi güncelle", en: "Update the README", de: "Aktualisiere die README", ru: "Обнови README", ar: "حدّث ملف README", es: "Actualiza el README", fr: "Mets à jour le README", az: "README-ni yenilə",
  },
  aiCopyMsg: {
    tr: "Mesajı kopyala", en: "Copy message", de: "Nachricht kopieren", ru: "Копировать сообщение", ar: "نسخ الرسالة", es: "Copiar mensaje", fr: "Copier le message", az: "Mesajı kopyala",
  },
  aiScrollDown: {
    tr: "En alta in", en: "Jump to latest", de: "Zum Ende springen", ru: "К последнему", ar: "إلى الأحدث", es: "Ir al final", fr: "Aller au dernier", az: "Ən aşağı keç",
  },
  aiClickAgainDelete: {
    tr: "Silmek için tekrar tıkla", en: "Click again to delete", de: "Zum Löschen erneut klicken", ru: "Нажми ещё раз для удаления", ar: "انقر مرة أخرى للحذف", es: "Haz clic de nuevo para eliminar", fr: "Clique encore pour supprimer", az: "Silmək üçün yenidən klik et",
  },
  set_aiAgentAutonomy: {
    tr: "Ajan: otonomi", en: "Agent: autonomy", de: "Agent: Autonomie", ru: "Агент: автономность", ar: "الوكيل: الاستقلالية", es: "Agente: autonomía", fr: "Agent : autonomie", az: "Agent: avtonomluq",
  },
  setDesc_aiAgentAutonomy: {
    tr: "Onaylı: her dosya düzenlemesi ve komut için sorar. Düzenlemeler otomatik: dosya yazma/düzenleme sorulmaz, komutlar yine sorar. Otonom: ek olarak güvenli derleme/test/lint komutları (npm run build, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) onaysız çalışır; ajan derle → hatayı oku → düzelt döngüsünü kendi yürütür. package.json veya yapı betikleri değişirse komutlar yine onay ister. Yalnızca güvendiğin klasörlerde kullan.", en: "Ask first: asks for every file edit and command. Auto edits: file writes/edits are not asked, commands still are. Autonomous: additionally safe build/test/lint commands (npm run build, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) run without asking; the agent runs the build → read error → fix loop by itself. If package.json or build scripts change, commands ask again. Use only in folders you trust.", de: "Mit Rückfrage: fragt bei jeder Dateiänderung und jedem Befehl. Änderungen automatisch: Datei-Änderungen ohne Rückfrage, Befehle weiterhin mit. Autonom: zusätzlich laufen sichere Build-/Test-/Lint-Befehle (npm run build, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) ohne Rückfrage; der Agent führt die Schleife Build → Fehler lesen → beheben selbst aus. Ändern sich package.json oder Build-Skripte, fragen Befehle wieder. Nur in vertrauenswürdigen Ordnern verwenden.", ru: "С подтверждением: спрашивает про каждую правку файла и команду. Правки автоматически: правки файлов без вопросов, команды по-прежнему с подтверждением. Автономно: дополнительно безопасные команды сборки/тестов/lint (npm run build, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) выполняются без вопросов; агент сам ведёт цикл сборка → чтение ошибки → исправление. Если меняются package.json или скрипты сборки, команды снова спрашивают. Используйте только в доверенных папках.", ar: "بموافقة: يسأل عن كل تعديل ملف وكل أمر. التعديلات تلقائياً: لا يسأل عن كتابة/تعديل الملفات لكن يسأل عن الأوامر. مستقل: إضافةً إلى ذلك تعمل أوامر البناء/الاختبار/lint الآمنة (npm run build وnpx tsc --noEmit وcargo/go/dotnet build|test وpytest) بلا سؤال؛ ويدير الوكيل بنفسه حلقة البناء ← قراءة الخطأ ← الإصلاح. إذا تغيّر package.json أو سكربتات البناء تعود الأوامر لطلب الموافقة. استخدمه في المجلدات الموثوقة فقط.", es: "Con confirmación: pregunta por cada edición de archivo y cada comando. Ediciones automáticas: no pregunta al escribir/editar archivos, los comandos sí. Autónomo: además, los comandos seguros de build/pruebas/lint (npm run build, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) se ejecutan sin preguntar; el agente ejecuta solo el ciclo compilar → leer error → corregir. Si cambian package.json o los scripts de build, los comandos vuelven a preguntar. Úsalo solo en carpetas de confianza.", fr: "Avec confirmation : demande pour chaque modification de fichier et chaque commande. Modifications automatiques : pas de question pour écrire/modifier des fichiers, les commandes demandent toujours. Autonome : en plus, les commandes sûres de build/test/lint (npm run build, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) s’exécutent sans demander ; l’agent mène seul la boucle build → lecture de l’erreur → correction. Si package.json ou les scripts de build changent, les commandes redemandent. À utiliser uniquement dans des dossiers de confiance.", az: "Təsdiqlə: hər fayl redaktəsi və əmr üçün soruşur. Redaktələr avtomatik: fayl yazma/redaktəsi soruşulmur, əmrlər yenə soruşur. Avtonom: əlavə olaraq təhlükəsiz build/test/lint əmrləri (npm run build, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) soruşmadan işləyir; agent build → xətanı oxu → düzəlt dövrünü özü aparır. package.json və ya build skriptləri dəyişsə əmrlər yenə təsdiq istəyir. Yalnız etibar etdiyin qovluqlarda istifadə et.",
  },
  optAutoAsk: {
    tr: "Onaylı (her adımda sor)", en: "Ask first (every step)", de: "Mit Rückfrage (jeder Schritt)", ru: "С подтверждением (каждый шаг)", ar: "بموافقة (كل خطوة)", es: "Con confirmación (cada paso)", fr: "Avec confirmation (chaque étape)", az: "Təsdiqlə (hər addım)",
  },
  optAutoEdits: {
    tr: "Düzenlemeler otomatik", en: "Auto-approve edits", de: "Änderungen automatisch", ru: "Правки автоматически", ar: "التعديلات تلقائياً", es: "Ediciones automáticas", fr: "Modifications automatiques", az: "Redaktələr avtomatik",
  },
  optAutoFull: {
    tr: "Otonom (derle/test dahil)", en: "Autonomous (incl. build/test)", de: "Autonom (inkl. Build/Test)", ru: "Автономно (со сборкой/тестами)", ar: "مستقل (مع البناء/الاختبار)", es: "Autónomo (con build/pruebas)", fr: "Autonome (build/test inclus)", az: "Avtonom (build/test daxil)",
  },
  aiAutoAskDesc: {
    tr: "Her düzenleme ve komut için onay ister", en: "Asks before every edit and command", de: "Fragt vor jeder Änderung und jedem Befehl", ru: "Спрашивает перед каждой правкой и командой", ar: "يسأل قبل كل تعديل وأمر", es: "Pregunta antes de cada edición y comando", fr: "Demande avant chaque modification et commande", az: "Hər redaktə və əmrdən əvvəl soruşur",
  },
  aiAutoEditsDesc: {
    tr: "Dosya düzenleme onaysız; komutlar onaylı", en: "File edits without asking; commands still ask", de: "Dateiänderungen ohne Rückfrage; Befehle mit Rückfrage", ru: "Правки без вопросов; команды с подтверждением", ar: "تعديل الملفات بلا سؤال؛ الأوامر بموافقة", es: "Ediciones sin preguntar; los comandos sí preguntan", fr: "Modifications sans demander ; commandes avec confirmation", az: "Fayl redaktəsi soruşmadan; əmrlər təsdiqlə",
  },
  aiAutoFullDesc: {
    tr: "Güvenli derleme/test komutları da onaysız: derle → düzelt döngüsü", en: "Safe build/test commands run unasked too: build → fix loop", de: "Sichere Build-/Testbefehle laufen ohne Rückfrage: Build → Fix-Schleife", ru: "Безопасные команды сборки/тестов без вопросов: цикл сборка → исправление", ar: "أوامر البناء/الاختبار الآمنة بلا سؤال: حلقة بناء ← إصلاح", es: "Comandos seguros de build/pruebas sin preguntar: ciclo compilar → corregir", fr: "Commandes sûres de build/test sans demander : boucle build → correction", az: "Təhlükəsiz build/test əmrləri soruşmadan: build → düzəlt dövrü",
  },
  aiAutonomyLabel: {
    tr: "Otonomi", en: "Autonomy", de: "Autonomie", ru: "Автономность", ar: "الاستقلالية", es: "Autonomía", fr: "Autonomie", az: "Avtonomluq",
  },
  aiMaxStepsLabel: {
    tr: "En çok adım", en: "Max steps", de: "Max. Schritte", ru: "Макс. шагов", ar: "أقصى خطوات", es: "Pasos máx.", fr: "Étapes max.", az: "Maks. addım",
  },
  set_aiAgentMaxSteps: {
    tr: "Ajan: en çok adım", en: "Agent: max steps", de: "Agent: max. Schritte", ru: "Агент: макс. шагов", ar: "الوكيل: أقصى عدد خطوات", es: "Agente: pasos máximos", fr: "Agent : étapes max.", az: "Agent: maksimum addım",
  },
  setDesc_aiAgentMaxSteps: {
    tr: "Bir görevde ajanın yapabileceği en çok araç turu. Yüksek değer daha uzun otonom çalışma demektir (daha yavaş).", en: "The most tool rounds the agent may take in one task. Higher means longer autonomous work (slower).", de: "Maximale Anzahl an Werkzeugrunden pro Aufgabe. Höher = längere autonome Arbeit (langsamer).", ru: "Макс. число раундов инструментов за задачу. Больше значение — дольше автономная работа (медленнее).", ar: "أقصى عدد جولات أدوات في المهمة الواحدة. القيمة الأعلى تعني عملاً مستقلاً أطول (أبطأ).", es: "Máximo de rondas de herramientas por tarea. Más alto = trabajo autónomo más largo (más lento).", fr: "Nombre max. de tours d’outils par tâche. Plus élevé = travail autonome plus long (plus lent).", az: "Bir tapşırıqda maksimum alət dövrü sayı. Yüksək dəyər daha uzun avtonom iş deməkdir (daha yavaş).",
  },
  aiAgentWorking: {
    tr: "Ajan çalışıyor", en: "Agent working", de: "Agent arbeitet", ru: "Агент работает", ar: "الوكيل يعمل", es: "Agente trabajando", fr: "Agent au travail", az: "Agent işləyir",
  },
  aiAgentStepN: {
    tr: "Adım {n}", en: "Step {n}", de: "Schritt {n}", ru: "Шаг {n}", ar: "الخطوة {n}", es: "Paso {n}", fr: "Étape {n}", az: "Addım {n}",
  },
  aiAgentChangedFiles: {
    tr: "Değişen dosyalar ({n})", en: "Changed files ({n})", de: "Geänderte Dateien ({n})", ru: "Изменённые файлы ({n})", ar: "الملفات المتغيرة ({n})", es: "Archivos cambiados ({n})", fr: "Fichiers modifiés ({n})", az: "Dəyişən fayllar ({n})",
  },
  aiAgentWaitingApproval: {
    tr: "Onay bekliyor", en: "Waiting for approval", de: "Wartet auf Freigabe", ru: "Ожидает подтверждения", ar: "بانتظار الموافقة", es: "Esperando aprobación", fr: "En attente d’approbation", az: "Təsdiq gözləyir",
  },
  aiAgentOpenFile: {
    tr: "Dosyayı aç", en: "Open file", de: "Datei öffnen", ru: "Открыть файл", ar: "فتح الملف", es: "Abrir archivo", fr: "Ouvrir le fichier", az: "Faylı aç",
  },
  aiTaskBuild: {
    tr: "Derle ve düzelt", en: "Build and fix", de: "Bauen und beheben", ru: "Собрать и исправить", ar: "ابنِ وأصلح", es: "Compilar y corregir", fr: "Compiler et corriger", az: "Build et və düzəlt",
  },
  aiTaskBuildP: {
    tr: "Projeyi derle: önce package.json scripts bölümünden (veya proje türüne göre) build komutunu bul ve çalıştır. Hata varsa dosyaları düzelt ve derleme geçene kadar tekrar dene. Sonunda ne yaptığını kısaca özetle.", en: "Build the project: first find the build command in package.json scripts (or by project type) and run it. If there are errors, fix the files and retry until the build passes. Finish with a short summary.", de: "Baue das Projekt: Finde zuerst den Build-Befehl in den package.json-Scripts (oder je nach Projekttyp) und führe ihn aus. Bei Fehlern korrigiere die Dateien und wiederhole, bis der Build durchläuft. Fasse am Ende kurz zusammen.", ru: "Собери проект: сначала найди команду сборки в scripts файла package.json (или по типу проекта) и запусти её. При ошибках исправь файлы и повторяй, пока сборка не пройдёт. В конце кратко подведи итог.", ar: "ابنِ المشروع: ابحث أولاً عن أمر البناء في scripts داخل package.json (أو حسب نوع المشروع) ونفّذه. إن وُجدت أخطاء فأصلح الملفات وأعد المحاولة حتى ينجح البناء. اختم بملخص قصير.", es: "Compila el proyecto: primero busca el comando de build en los scripts de package.json (o según el tipo de proyecto) y ejecútalo. Si hay errores, corrige los archivos y repite hasta que compile. Termina con un breve resumen.", fr: "Compile le projet : trouve d’abord la commande de build dans les scripts de package.json (ou selon le type de projet) et exécute-la. En cas d’erreur, corrige les fichiers et recommence jusqu’à ce que le build passe. Termine par un court résumé.", az: "Layihəni build et: əvvəlcə package.json-un scripts hissəsindən (və ya layihə növünə görə) build əmrini tap və işə sal. Xəta varsa faylları düzəlt və build keçənə qədər təkrarla. Sonda qısa xülasə ver.",
  },
  aiTaskTest: {
    tr: "Testleri çalıştır", en: "Run tests", de: "Tests ausführen", ru: "Запустить тесты", ar: "شغّل الاختبارات", es: "Ejecutar pruebas", fr: "Lancer les tests", az: "Testləri işə sal",
  },
  aiTaskTestP: {
    tr: "Testleri çalıştır. Başarısız test varsa nedenini bul, kodu düzelt ve testler geçene kadar tekrarla. Testlerin kendisini yalnız gerçekten yanlışsa değiştir.", en: "Run the tests. If any fail, find the cause, fix the code and repeat until they pass. Change the tests themselves only if they are truly wrong.", de: "Führe die Tests aus. Bei Fehlschlägen finde die Ursache, korrigiere den Code und wiederhole, bis alle bestehen. Ändere die Tests selbst nur, wenn sie wirklich falsch sind.", ru: "Запусти тесты. Если какие-то падают, найди причину, исправь код и повторяй, пока все не пройдут. Сами тесты меняй, только если они действительно неверны.", ar: "شغّل الاختبارات. إن فشل أي منها فابحث عن السبب وأصلح الشيفرة وكرّر حتى تنجح. لا تغيّر الاختبارات نفسها إلا إذا كانت خاطئة فعلاً.", es: "Ejecuta las pruebas. Si alguna falla, encuentra la causa, corrige el código y repite hasta que pasen. Cambia las pruebas solo si realmente están mal.", fr: "Lance les tests. Si certains échouent, trouve la cause, corrige le code et recommence jusqu’à ce qu’ils passent. Ne modifie les tests que s’ils sont vraiment faux.", az: "Testləri işə sal. Hər hansı uğursuz olarsa səbəbini tap, kodu düzəlt və keçənə qədər təkrarla. Testlərin özünü yalnız həqiqətən səhvdirsə dəyiş.",
  },
  aiTaskCheck: {
    tr: "Tip/lint denetimi", en: "Type/lint check", de: "Typ-/Lint-Prüfung", ru: "Проверка типов/lint", ar: "فحص الأنواع/lint", es: "Revisión de tipos/lint", fr: "Vérif. types/lint", az: "Tip/lint yoxlaması",
  },
  aiTaskCheckP: {
    tr: "Tip denetimi ve lint komutlarını bul ve çalıştır; çıkan hataları düzelt, temiz çıkana kadar tekrarla.", en: "Find and run the type-check and lint commands; fix the reported errors and repeat until clean.", de: "Finde und führe die Typprüfung und Lint-Befehle aus; behebe gemeldete Fehler und wiederhole, bis alles sauber ist.", ru: "Найди и запусти проверку типов и lint; исправь найденные ошибки и повторяй, пока всё не станет чисто.", ar: "ابحث عن أوامر فحص الأنواع وlint ونفّذها؛ أصلح الأخطاء المبلغ عنها وكرّر حتى يصبح كل شيء نظيفاً.", es: "Busca y ejecuta los comandos de comprobación de tipos y lint; corrige los errores y repite hasta que todo quede limpio.", fr: "Trouve et lance les commandes de vérification des types et de lint ; corrige les erreurs et recommence jusqu’à ce que tout soit propre.", az: "Tip yoxlaması və lint əmrlərini tap və işə sal; çıxan xətaları düzəlt və təmiz olana qədər təkrarla.",
  },
  aiTaskReview: {
    tr: "Değişiklikleri gözden geçir", en: "Review changes", de: "Änderungen prüfen", ru: "Проверить изменения", ar: "راجع التغييرات", es: "Revisar cambios", fr: "Relire les changements", az: "Dəyişiklikləri nəzərdən keçir",
  },
  aiTaskReviewP: {
    tr: "Bu oturumda değiştirilen dosyaları gözden geçir: olası hataları, eksik uç durumları ve gereksiz kodu bul; değişiklikleri kısaca özetle. Dosya değiştirme.", en: "Review the files changed in this session: find possible bugs, missed edge cases and unnecessary code, and summarize the changes briefly. Do not modify files.", de: "Prüfe die in dieser Sitzung geänderten Dateien: finde mögliche Fehler, fehlende Randfälle und überflüssigen Code und fasse die Änderungen kurz zusammen. Ändere keine Dateien.", ru: "Просмотри файлы, изменённые в этой сессии: найди возможные ошибки, пропущенные крайние случаи и лишний код, кратко опиши изменения. Файлы не изменяй.", ar: "راجع الملفات التي تغيّرت في هذه الجلسة: ابحث عن أخطاء محتملة وحالات حدّية مفقودة وشيفرة زائدة، ولخّص التغييرات باختصار. لا تعدّل أي ملف.", es: "Revisa los archivos modificados en esta sesión: encuentra posibles errores, casos límite olvidados y código innecesario, y resume los cambios brevemente. No modifiques archivos.", fr: "Relis les fichiers modifiés pendant cette session : trouve les bogues possibles, les cas limites oubliés et le code inutile, et résume brièvement les changements. Ne modifie aucun fichier.", az: "Bu sessiyada dəyişdirilən faylları nəzərdən keçir: mümkün xətaları, unudulmuş sərhəd hallarını və lazımsız kodu tap, dəyişiklikləri qısa xülasə et. Faylları dəyişmə.",
  },
  aiAutonomyConfirm: {
    tr: "Otonom modda ajan dosyaları onaysız düzenler ve güvenli derleme/test komutlarını (npm run build, npx tsc --noEmit vb.) sormadan çalıştırır. Yalnızca güvendiğin klasörlerde kullan. Etkinleştirilsin mi?", en: "In autonomous mode the agent edits files without asking and runs safe build/test commands (npm run build, npx tsc --noEmit, etc.) unasked. Use it only in folders you trust. Enable it?", de: "Im autonomen Modus ändert der Agent Dateien ohne Rückfrage und führt sichere Build-/Testbefehle (npm run build, npx tsc --noEmit usw.) ohne Rückfrage aus. Nur in vertrauenswürdigen Ordnern verwenden. Aktivieren?", ru: "В автономном режиме агент правит файлы без вопросов и запускает безопасные команды сборки/тестов (npm run build, npx tsc --noEmit и т. д.) без подтверждения. Используйте только в доверенных папках. Включить?", ar: "في الوضع المستقل يعدّل الوكيل الملفات دون سؤال ويشغّل أوامر البناء/الاختبار الآمنة (npm run build وnpx tsc --noEmit وغيرها) دون سؤال. استخدمه في المجلدات الموثوقة فقط. هل تريد تفعيله؟", es: "En modo autónomo el agente edita archivos sin preguntar y ejecuta comandos seguros de build/pruebas (npm run build, npx tsc --noEmit, etc.) sin confirmación. Úsalo solo en carpetas de confianza. ¿Activarlo?", fr: "En mode autonome, l’agent modifie les fichiers sans demander et lance les commandes sûres de build/test (npm run build, npx tsc --noEmit, etc.) sans confirmation. À utiliser uniquement dans des dossiers de confiance. L’activer ?", az: "Avtonom rejimdə agent faylları soruşmadan dəyişir və təhlükəsiz build/test əmrlərini (npm run build, npx tsc --noEmit və s.) soruşmadan işlədir. Yalnız etibar etdiyin qovluqlarda istifadə et. Aktivləşdirilsin?",
  },
  aiScrollLeft: {
    tr: "Sola kaydır", en: "Scroll left", de: "Nach links", ru: "Влево", ar: "تمرير لليسار", es: "Desplazar a la izquierda", fr: "Défiler à gauche", az: "Sola sürüşdür",
  },
  aiScrollRight: {
    tr: "Sağa kaydır", en: "Scroll right", de: "Nach rechts", ru: "Вправо", ar: "تمرير لليمين", es: "Desplazar a la derecha", fr: "Défiler à droite", az: "Sağa sürüşdür",
  },
  aiTaskDebug: {
    tr: "Hata kaynağını bul", en: "Find the root cause", de: "Ursache finden", ru: "Найти причину", ar: "ابحث عن السبب", es: "Encontrar la causa", fr: "Trouver la cause", az: "Səbəbi tap",
  },
  aiTaskDebugP: {
    tr: "Sorunun kök nedenini bul: ilgili dosyaları oku, kodu izle, nedenini açıkla ve en küçük güvenli düzeltmeyi uygula. Düzelttikten sonra derle/test et.", en: "Find the root cause of the problem: read the relevant files, trace the code, explain the cause and apply the smallest safe fix. Then build/test.", de: "Finde die Ursache des Problems: Lies die relevanten Dateien, verfolge den Code, erkläre die Ursache und wende die kleinste sichere Korrektur an. Danach bauen/testen.", ru: "Найди первопричину проблемы: прочитай нужные файлы, проследи код, объясни причину и примени минимальное безопасное исправление. Затем собери/протестируй.", ar: "ابحث عن السبب الجذري للمشكلة: اقرأ الملفات ذات الصلة وتتبّع الشيفرة واشرح السبب وطبّق أصغر إصلاح آمن. ثم ابنِ/اختبر.", es: "Encuentra la causa raíz del problema: lee los archivos relevantes, sigue el código, explica la causa y aplica la corrección segura más pequeña. Luego compila/prueba.", fr: "Trouve la cause racine du problème : lis les fichiers concernés, suis le code, explique la cause et applique la plus petite correction sûre. Puis compile/teste.", az: "Problemin kök səbəbini tap: aidiyyatı olan faylları oxu, kodu izlə, səbəbi izah et və ən kiçik təhlükəsiz düzəlişi tətbiq et. Sonra build/test et.",
  },
  aiTaskDocs: {
    tr: "Belgele", en: "Document", de: "Dokumentieren", ru: "Задокументировать", ar: "وثّق", es: "Documentar", fr: "Documenter", az: "Sənədləşdir",
  },
  aiTaskDocsP: {
    tr: "Projeyi incele ve README.md dosyasını güncelle: ne yaptığı, kurulum, çalıştırma ve ana klasör yapısı. Mevcut doğru bilgileri koru, uydurma bilgi ekleme.", en: "Review the project and update README.md: what it does, setup, how to run it and the main folder structure. Keep correct existing information and do not invent facts.", de: "Prüfe das Projekt und aktualisiere README.md: Zweck, Einrichtung, Start und die wichtigste Ordnerstruktur. Behalte korrekte Angaben bei und erfinde nichts.", ru: "Изучи проект и обнови README.md: что делает, установка, запуск и основная структура папок. Сохрани верные сведения и ничего не выдумывай.", ar: "افحص المشروع وحدّث README.md: ماذا يفعل والإعداد والتشغيل وبنية المجلدات الرئيسية. أبقِ المعلومات الصحيحة ولا تخترع معلومات.", es: "Revisa el proyecto y actualiza README.md: qué hace, instalación, cómo ejecutarlo y la estructura principal de carpetas. Conserva lo correcto y no inventes datos.", fr: "Examine le projet et mets à jour README.md : ce qu’il fait, l’installation, le lancement et la structure principale des dossiers. Conserve les infos justes et n’invente rien.", az: "Layihəni nəzərdən keçir və README.md-ni yenilə: nə edir, quraşdırma, işə salma və əsas qovluq strukturu. Düzgün məlumatı saxla, uydurma.",
  },
  aiTaskSecurity: {
    tr: "Güvenlik denetimi", en: "Security check", de: "Sicherheitsprüfung", ru: "Проверка безопасности", ar: "فحص الأمان", es: "Revisión de seguridad", fr: "Audit de sécurité", az: "Təhlükəsizlik yoxlaması",
  },
  aiTaskSecurityP: {
    tr: "Projede güvenlik sorunlarını tara: sabit yazılmış anahtar/şifre, güvensiz girdi işleme, tehlikeli komut çalıştırma, eksik doğrulama. Bulgularını dosya:satır ile listele; dosya değiştirme.", en: "Scan the project for security issues: hard-coded keys/passwords, unsafe input handling, dangerous command execution, missing validation. List findings as file:line; do not modify files.", de: "Prüfe das Projekt auf Sicherheitsprobleme: fest eingebaute Schlüssel/Passwörter, unsichere Eingabeverarbeitung, gefährliche Befehlsausführung, fehlende Validierung. Liste Funde als Datei:Zeile; ändere keine Dateien.", ru: "Проверь проект на проблемы безопасности: ключи/пароли в коде, небезопасная обработка ввода, опасный запуск команд, отсутствие валидации. Перечисли находки как файл:строка; файлы не изменяй.", ar: "افحص المشروع بحثاً عن مشكلات أمنية: مفاتيح/كلمات مرور مكتوبة في الشيفرة، معالجة مدخلات غير آمنة، تنفيذ أوامر خطرة، غياب التحقق. اذكر النتائج بصيغة ملف:سطر؛ لا تعدّل الملفات.", es: "Analiza el proyecto en busca de problemas de seguridad: claves/contraseñas en el código, manejo inseguro de entradas, ejecución peligrosa de comandos, validación ausente. Lista los hallazgos como archivo:línea; no modifiques archivos.", fr: "Analyse le projet pour des problèmes de sécurité : clés/mots de passe en dur, traitement non sûr des entrées, exécution dangereuse de commandes, validation manquante. Liste les résultats en fichier:ligne ; ne modifie aucun fichier.", az: "Layihədə təhlükəsizlik problemlərini yoxla: koda yazılmış açar/parollar, təhlükəli giriş emalı, təhlükəli əmr icrası, çatışmayan yoxlama. Tapıntıları fayl:sətir kimi sadala; faylları dəyişmə.",
  },
  aiTaskSimplify: {
    tr: "Sadeleştir", en: "Simplify", de: "Vereinfachen", ru: "Упростить", ar: "بسّط", es: "Simplificar", fr: "Simplifier", az: "Sadələşdir",
  },
  aiTaskSimplifyP: {
    tr: "Projede tekrarlanan veya gereksiz karmaşık kodu bul; davranışı değiştirmeden en fazla üç küçük sadeleştirme yap, sonra derle/test et ve özetle.", en: "Find repeated or needlessly complex code; make at most three small simplifications without changing behavior, then build/test and summarize.", de: "Finde wiederholten oder unnötig komplizierten Code; mache höchstens drei kleine Vereinfachungen ohne Verhaltensänderung, dann bauen/testen und zusammenfassen.", ru: "Найди повторяющийся или лишне сложный код; сделай не более трёх небольших упрощений без изменения поведения, затем собери/протестируй и подведи итог.", ar: "ابحث عن شيفرة مكررة أو معقدة بلا داع؛ أجرِ ثلاثة تبسيطات صغيرة كحد أقصى دون تغيير السلوك، ثم ابنِ/اختبر ولخّص.", es: "Encuentra código repetido o innecesariamente complejo; haz como máximo tres simplificaciones pequeñas sin cambiar el comportamiento, luego compila/prueba y resume.", fr: "Trouve le code répété ou inutilement complexe ; fais au plus trois petites simplifications sans changer le comportement, puis compile/teste et résume.", az: "Təkrarlanan və ya lazımsız mürəkkəb kodu tap; davranışı dəyişmədən ən çoxu üç kiçik sadələşdirmə et, sonra build/test et və xülasə ver.",
  },
  aiSessionSearch: {
    tr: "Sohbetlerde ara…", en: "Search chats…", de: "Chats durchsuchen…", ru: "Поиск по чатам…", ar: "ابحث في المحادثات…", es: "Buscar chats…", fr: "Rechercher dans les chats…", az: "Söhbətlərdə axtar…",
  },
  aiSessionNone: {
    tr: "Eşleşen sohbet yok", en: "No matching chats", de: "Keine passenden Chats", ru: "Чаты не найдены", ar: "لا توجد محادثات مطابقة", es: "No hay chats que coincidan", fr: "Aucun chat correspondant", az: "Uyğun söhbət yoxdur",
  },
  aiGroupPinned: {
    tr: "Sabitlenenler", en: "Pinned", de: "Angeheftet", ru: "Закреплённые", ar: "المثبّتة", es: "Fijados", fr: "Épinglés", az: "Sancılanlar",
  },
  aiGroupToday: {
    tr: "Bugün", en: "Today", de: "Heute", ru: "Сегодня", ar: "اليوم", es: "Hoy", fr: "Aujourd’hui", az: "Bu gün",
  },
  aiGroupYesterday: {
    tr: "Dün", en: "Yesterday", de: "Gestern", ru: "Вчера", ar: "أمس", es: "Ayer", fr: "Hier", az: "Dünən",
  },
  aiGroupWeek: {
    tr: "Bu hafta", en: "This week", de: "Diese Woche", ru: "На этой неделе", ar: "هذا الأسبوع", es: "Esta semana", fr: "Cette semaine", az: "Bu həftə",
  },
  aiGroupOlder: {
    tr: "Daha eski", en: "Older", de: "Älter", ru: "Ранее", ar: "أقدم", es: "Anteriores", fr: "Plus ancien", az: "Daha köhnə",
  },
  aiRename: {
    tr: "Yeniden adlandır", en: "Rename", de: "Umbenennen", ru: "Переименовать", ar: "إعادة تسمية", es: "Renombrar", fr: "Renommer", az: "Adını dəyiş",
  },
  aiRenamePlaceholder: {
    tr: "Sohbet adı (boşsa otomatik)", en: "Chat name (empty = auto)", de: "Chat-Name (leer = automatisch)", ru: "Название чата (пусто = авто)", ar: "اسم المحادثة (فارغ = تلقائي)", es: "Nombre del chat (vacío = automático)", fr: "Nom du chat (vide = auto)", az: "Söhbət adı (boş = avtomatik)",
  },
  aiPin: {
    tr: "Sabitle", en: "Pin", de: "Anheften", ru: "Закрепить", ar: "تثبيت", es: "Fijar", fr: "Épingler", az: "Sancı",
  },
  aiUnpin: {
    tr: "Sabitlemeyi kaldır", en: "Unpin", de: "Lösen", ru: "Открепить", ar: "إلغاء التثبيت", es: "Desfijar", fr: "Désépingler", az: "Sancını qaldır",
  },
  aiExport: {
    tr: "Markdown olarak dışa aktar", en: "Export as Markdown", de: "Als Markdown exportieren", ru: "Экспорт в Markdown", ar: "تصدير بصيغة Markdown", es: "Exportar como Markdown", fr: "Exporter en Markdown", az: "Markdown kimi ixrac et",
  },
  aiConfirmDelete: {
    tr: "Silinsin mi?", en: "Delete?", de: "Löschen?", ru: "Удалить?", ar: "حذف؟", es: "¿Eliminar?", fr: "Supprimer ?", az: "Silinsin?",
  },
  aiMsgCount: {
    tr: "{n} ileti", en: "{n} messages", de: "{n} Nachrichten", ru: "сообщений: {n}", ar: "{n} رسائل", es: "{n} mensajes", fr: "{n} messages", az: "{n} mesaj",
  },
  aiClearUnpinned: {
    tr: "Sabitlenmemişleri sil", en: "Delete unpinned chats", de: "Nicht angeheftete löschen", ru: "Удалить незакреплённые", ar: "حذف غير المثبّتة", es: "Eliminar los no fijados", fr: "Supprimer les non épinglés", az: "Sancılmayanları sil",
  },
  aiSessionCount: {
    tr: "{n} sohbet", en: "{n} chats", de: "{n} Chats", ru: "чатов: {n}", ar: "{n} محادثات", es: "{n} chats", fr: "{n} chats", az: "{n} söhbət",
  },
  aiYou: {
    tr: "Sen", en: "You", de: "Du", ru: "Вы", ar: "أنت", es: "Tú", fr: "Toi", az: "Sən",
  },
} satisfies Record<string, Dict>;

export type AiTextKey = keyof typeof AI_TEXT;

registerTexts(AI_TEXT);
