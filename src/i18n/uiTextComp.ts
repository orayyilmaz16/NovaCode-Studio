// AI kod tamamlama ayarları ve menüsü metinleri (8 dil). Ayarlar sayfası ve ✦ menüsüyle birlikte gecikmeli yüklenir.
import { registerTexts, type UiLang } from './uiText';

type Dict = Record<UiLang, string>;

export const COMP_TEXT = {
  grpAiCompletion: {
    tr: "AI kod tamamlama", en: "AI code completion", de: "KI-Codevervollständigung", ru: "ИИ-автодополнение кода", ar: "إكمال الشيفرة بالذكاء الاصطناعي", es: "Autocompletado de código con IA", fr: "Complétion de code par IA", az: "AI kod tamamlama",
  },
  set_aiCompletionTrigger: {
    tr: "Öneri tetikleme", en: "Suggestion trigger", de: "Vorschlags-Auslöser", ru: "Запуск подсказок", ar: "تشغيل الاقتراحات", es: "Activación de sugerencias", fr: "Déclenchement des suggestions", az: "Təklif tetikləmə",
  },
  setDesc_aiCompletionTrigger: {
    tr: "Otomatik: yazarken önerir. Manuel: yalnız Alt+\\ ile istediğinde önerir (daha az işlemci kullanır).", en: "Automatic: suggests while you type. Manual: only when you press Alt+\\ (uses less CPU).", de: "Automatisch: schlägt beim Tippen vor. Manuell: nur mit Alt+\\ (weniger CPU).", ru: "Автоматически: подсказывает при вводе. Вручную: только по Alt+\\ (меньше нагрузки на CPU).", ar: "تلقائي: يقترح أثناء الكتابة. يدوي: فقط عند الضغط على Alt+\\ (استهلاك أقل للمعالج).", es: "Automático: sugiere mientras escribes. Manual: solo con Alt+\\ (menos CPU).", fr: "Automatique : suggère pendant la frappe. Manuel : seulement avec Alt+\\ (moins de CPU).", az: "Avtomatik: yazdıqca təklif edir. Əl ilə: yalnız Alt+\\ ilə (daha az CPU).",
  },
  optCompAuto: {
    tr: "Otomatik", en: "Automatic", de: "Automatisch", ru: "Автоматически", ar: "تلقائي", es: "Automático", fr: "Automatique", az: "Avtomatik",
  },
  optCompManual: {
    tr: "Manuel (Alt+\\)", en: "Manual (Alt+\\)", de: "Manuell (Alt+\\)", ru: "Вручную (Alt+\\)", ar: "يدوي (Alt+\\)", es: "Manual (Alt+\\)", fr: "Manuel (Alt+\\)", az: "Əl ilə (Alt+\\)",
  },
  set_aiCompletionEffort: {
    tr: "Düşünme seviyesi / çaba", en: "Thinking level / effort", de: "Denkstufe / Aufwand", ru: "Уровень рассуждений / усилие", ar: "مستوى التفكير / الجهد", es: "Nivel de razonamiento / esfuerzo", fr: "Niveau de réflexion / effort", az: "Düşünmə səviyyəsi / səy",
  },
  setDesc_aiCompletionEffort: {
    tr: "Ön ayar: Hızlı kısa ve çabuk önerir; Derin daha çok bağlam ve uzun öneri kullanır. Seçince gecikme, uzunluk ve bağlam ayarları bu ön ayara göre güncellenir; sonra tek tek değiştirebilirsin.", en: "Preset: Fast gives short, quick suggestions; Deep uses more context and longer suggestions. Choosing one updates delay, length and context settings; you can then tweak them individually.", de: "Voreinstellung: Schnell liefert kurze, rasche Vorschläge; Tief nutzt mehr Kontext und längere Vorschläge. Die Auswahl aktualisiert Verzögerung, Länge und Kontext; danach einzeln anpassbar.", ru: "Пресет: «Быстро» — короткие и быстрые подсказки; «Глубоко» — больше контекста и длиннее. Выбор обновляет задержку, длину и контекст; затем можно настроить по отдельности.", ar: "إعداد مسبق: السريع يقترح باختصار وسرعة؛ العميق يستخدم سياقاً أكبر واقتراحات أطول. اختياره يحدّث التأخير والطول والسياق، ثم يمكنك التعديل فردياً.", es: "Preajuste: Rápido da sugerencias cortas y ágiles; Profundo usa más contexto y sugerencias largas. Al elegirlo se actualizan retraso, longitud y contexto; luego puedes ajustarlos uno a uno.", fr: "Préréglage : Rapide donne des suggestions courtes et vives ; Profond utilise plus de contexte et des suggestions longues. Le choix met à jour délai, longueur et contexte ; ajustables ensuite.", az: "Ön ayar: Sürətli qısa və tez təklif verir; Dərin daha çox kontekst və uzun təklif işlədir. Seçəndə gecikmə, uzunluq və kontekst yenilənir; sonra ayrı-ayrılıqda dəyişə bilərsən.",
  },
  set_aiCompletionCooldown: {
    tr: "Tamamlama soğuma süresi (ms)", en: "Completion cooldown (ms)", de: "Vervollständigungs-Abkühlzeit (ms)", ru: "Пауза между подсказками (мс)", ar: "فترة التهدئة بين الاقتراحات (مللي ثانية)", es: "Enfriamiento del autocompletado (ms)", fr: "Temps de récupération de la complétion (ms)", az: "Tamamlama soyuma müddəti (ms)",
  },
  optCompInstant: {
    tr: "Anında", en: "Instant", de: "Sofort", ru: "Мгновенно", ar: "فوري", es: "Instantáneo", fr: "Instantané", az: "Ani",
  },
  cmFasterHint: {
    tr: "Daha hızlı için küçük model: ollama pull qwen2.5-coder:1.5b, sonra yukarıdan seç.", en: "For faster suggestions use a smaller model: ollama pull qwen2.5-coder:1.5b, then pick it above.", de: "Für schnellere Vorschläge ein kleineres Modell nutzen: ollama pull qwen2.5-coder:1.5b, dann oben wählen.", ru: "Для более быстрых подсказок возьмите малую модель: ollama pull qwen2.5-coder:1.5b, затем выберите её выше.", ar: "لاقتراحات أسرع استخدم نموذجًا أصغر: ollama pull qwen2.5-coder:1.5b ثم اخترْه أعلاه.", es: "Para sugerencias más rápidas usa un modelo menor: ollama pull qwen2.5-coder:1.5b y elígelo arriba.", fr: "Pour des suggestions plus rapides, utilisez un modèle plus petit : ollama pull qwen2.5-coder:1.5b, puis choisissez-le ci-dessus.", az: "Daha sürətli təkliflər üçün kiçik model: ollama pull qwen2.5-coder:1.5b, sonra yuxarıdan seçin.",
  },
  set_aiCompletionModel: {
    tr: "Tamamlama modeli", en: "Completion model", de: "Vervollständigungsmodell", ru: "Модель автодополнения", ar: "نموذج الإكمال", es: "Modelo de autocompletado", fr: "Modèle de complétion", az: "Tamamlama modeli",
  },
  setDesc_aiCompletionModel: {
    tr: "Yalnız Qwen2.5-Coder ailesi (ör. qwen2.5-coder:1.5b). Küçük model kat kat hızlıdır, büyük model daha doğrudur. Kurmak için: ollama pull qwen2.5-coder:1.5b", en: "Qwen2.5-Coder family only (e.g. qwen2.5-coder:1.5b). Smaller models are many times faster, larger ones are more accurate. To install: ollama pull qwen2.5-coder:1.5b", de: "Nur die Qwen2.5-Coder-Familie (z. B. qwen2.5-coder:1.5b). Kleine Modelle sind um ein Vielfaches schneller, große genauer. Installieren: ollama pull qwen2.5-coder:1.5b", ru: "Только семейство Qwen2.5-Coder (например, qwen2.5-coder:1.5b). Малые модели во много раз быстрее, большие точнее. Установка: ollama pull qwen2.5-coder:1.5b", ar: "عائلة Qwen2.5-Coder فقط (مثل qwen2.5-coder:1.5b). النماذج الصغيرة أسرع بعدة مرات والكبيرة أدق. للتثبيت: ollama pull qwen2.5-coder:1.5b", es: "Solo la familia Qwen2.5-Coder (p. ej. qwen2.5-coder:1.5b). Los modelos pequeños son mucho más rápidos y los grandes más precisos. Para instalar: ollama pull qwen2.5-coder:1.5b", fr: "Famille Qwen2.5-Coder uniquement (ex. qwen2.5-coder:1.5b). Les petits modèles sont bien plus rapides, les grands plus précis. Pour installer : ollama pull qwen2.5-coder:1.5b", az: "Yalnız Qwen2.5-Coder ailəsi (məs. qwen2.5-coder:1.5b). Kiçik modellər dəfələrlə sürətlidir, böyüklər daha dəqiqdir. Quraşdırmaq üçün: ollama pull qwen2.5-coder:1.5b",
  },
  set_aiCompletionMaxTokens: {
    tr: "Öneri uzunluğu üst sınırı (token)", en: "Max suggestion length (tokens)", de: "Max. Vorschlagslänge (Token)", ru: "Макс. длина подсказки (токены)", ar: "أقصى طول للاقتراح (رموز)", es: "Longitud máxima de sugerencia (tokens)", fr: "Longueur max. de suggestion (tokens)", az: "Maks. təklif uzunluğu (token)",
  },
  set_aiCompletionPrefix: {
    tr: "İmleçten önceki bağlam (karakter)", en: "Context before cursor (characters)", de: "Kontext vor dem Cursor (Zeichen)", ru: "Контекст до курсора (символы)", ar: "السياق قبل المؤشر (حروف)", es: "Contexto antes del cursor (caracteres)", fr: "Contexte avant le curseur (caractères)", az: "Kursordan əvvəlki kontekst (simvol)",
  },
  set_aiCompletionSuffix: {
    tr: "İmleçten sonraki bağlam (karakter)", en: "Context after cursor (characters)", de: "Kontext nach dem Cursor (Zeichen)", ru: "Контекст после курсора (символы)", ar: "السياق بعد المؤشر (حروف)", es: "Contexto después del cursor (caracteres)", fr: "Contexte après le curseur (caractères)", az: "Kursordan sonrakı kontekst (simvol)",
  },
  set_aiCompletionTemperature: {
    tr: "Yaratıcılık (sıcaklık)", en: "Creativity (temperature)", de: "Kreativität (Temperatur)", ru: "Креативность (температура)", ar: "الإبداع (درجة الحرارة)", es: "Creatividad (temperatura)", fr: "Créativité (température)", az: "Yaradıcılıq (temperatur)",
  },
  set_aiCompletionCount: {
    tr: "Alternatif öneri sayısı", en: "Number of alternative suggestions", de: "Anzahl alternativer Vorschläge", ru: "Число вариантов подсказки", ar: "عدد الاقتراحات البديلة", es: "Número de sugerencias alternativas", fr: "Nombre de suggestions alternatives", az: "Alternativ təklif sayı",
  },
  setDesc_aiCompletionCount: {
    tr: "1'den fazlaysa Alt+] / Alt+[ ile diğer önerilere geçersin; her ek öneri bekleme süresini uzatır.", en: "Above 1, Alt+] / Alt+[ cycles through other suggestions; each extra suggestion adds waiting time.", de: "Bei mehr als 1 wechselst du mit Alt+] / Alt+[ zwischen Vorschlägen; jeder zusätzliche verlängert die Wartezeit.", ru: "Если больше 1, Alt+] / Alt+[ переключает варианты; каждый дополнительный увеличивает ожидание.", ar: "إذا كان أكثر من 1 فتنتقل بين الاقتراحات بـ Alt+] / Alt+[؛ كل اقتراح إضافي يزيد وقت الانتظار.", es: "Con más de 1, Alt+] / Alt+[ alterna entre sugerencias; cada extra aumenta la espera.", fr: "Au-delà de 1, Alt+] / Alt+[ parcourt les suggestions ; chaque ajout allonge l’attente.", az: "1-dən çoxdursa Alt+] / Alt+[ ilə digər təkliflərə keçirsən; hər əlavə təklif gözləməni uzadır.",
  },
  set_aiCompletionLength: {
    tr: "Öneri biçimi", en: "Suggestion style", de: "Vorschlagsstil", ru: "Формат подсказки", ar: "نمط الاقتراح", es: "Estilo de sugerencia", fr: "Style de suggestion", az: "Təklif forması",
  },
  optLenLine: {
    tr: "Tek satır", en: "Single line", de: "Einzelne Zeile", ru: "Одна строка", ar: "سطر واحد", es: "Una línea", fr: "Une ligne", az: "Tək sətir",
  },
  optLenBlock: {
    tr: "Blok (boş satıra kadar)", en: "Block (up to blank line)", de: "Block (bis Leerzeile)", ru: "Блок (до пустой строки)", ar: "كتلة (حتى سطر فارغ)", es: "Bloque (hasta línea en blanco)", fr: "Bloc (jusqu’à une ligne vide)", az: "Blok (boş sətrə qədər)",
  },
  optLenLong: {
    tr: "Uzun (en çok 24 satır)", en: "Long (up to 24 lines)", de: "Lang (bis 24 Zeilen)", ru: "Длинный (до 24 строк)", ar: "طويل (حتى 24 سطراً)", es: "Largo (hasta 24 líneas)", fr: "Long (jusqu’à 24 lignes)", az: "Uzun (24 sətrə qədər)",
  },
  set_aiCompletionToolbar: {
    tr: "Öneri araç çubuğunu göster", en: "Show suggestion toolbar", de: "Vorschlags-Symbolleiste anzeigen", ru: "Показывать панель подсказки", ar: "إظهار شريط أدوات الاقتراح", es: "Mostrar barra de sugerencias", fr: "Afficher la barre de suggestion", az: "Təklif alət panelini göstər",
  },
  setDesc_aiCompletionToolbar: {
    tr: "Öneri görünürken kabul et, kelime, satır ve sonraki öneri düğmelerini gösterir (önizleme).", en: "While a suggestion is shown, displays accept, word, line and next-suggestion buttons (preview).", de: "Zeigt bei einem Vorschlag Schaltflächen für Übernehmen, Wort, Zeile und nächster Vorschlag (Vorschau).", ru: "Пока показана подсказка, отображает кнопки «принять», «слово», «строка» и «следующая» (предпросмотр).", ar: "أثناء عرض اقتراح تظهر أزرار القبول والكلمة والسطر والاقتراح التالي (معاينة).", es: "Mientras hay una sugerencia, muestra botones de aceptar, palabra, línea y siguiente (vista previa).", fr: "Pendant une suggestion, affiche les boutons accepter, mot, ligne et suivante (aperçu).", az: "Təklif görünərkən qəbul, söz, sətir və növbəti təklif düymələrini göstərir (önbaxış).",
  },
  cmStatusOn: {
    tr: "Hazır", en: "Ready", de: "Bereit", ru: "Готово", ar: "جاهز", es: "Listo", fr: "Prêt", az: "Hazır",
  },
  cmStatusOff: {
    tr: "Kapalı", en: "Off", de: "Aus", ru: "Выключено", ar: "متوقف", es: "Desactivado", fr: "Désactivé", az: "Söndürülüb",
  },
  cmNoApi: {
    tr: "Uygulama güncellendi: yeniden başlatman gerekiyor", en: "App was updated: restart required", de: "App wurde aktualisiert: Neustart nötig", ru: "Приложение обновлено: нужен перезапуск", ar: "تم تحديث التطبيق: يلزم إعادة التشغيل", es: "App actualizada: reinicia la aplicación", fr: "Application mise à jour : redémarrage requis", az: "Tətbiq yeniləndi: yenidən başlatmaq lazımdır",
  },
  cmNoModel: {
    tr: "Model kurulu değil: ollama pull {m}", en: "Model not installed: ollama pull {m}", de: "Modell nicht installiert: ollama pull {m}", ru: "Модель не установлена: ollama pull {m}", ar: "النموذج غير مثبّت: ollama pull {m}", es: "Modelo no instalado: ollama pull {m}", fr: "Modèle non installé : ollama pull {m}", az: "Model quraşdırılmayıb: ollama pull {m}",
  },
  cmNoOllama: {
    tr: "Ollama çalışmıyor", en: "Ollama is not running", de: "Ollama läuft nicht", ru: "Ollama не запущен", ar: "Ollama لا يعمل", es: "Ollama no está activo", fr: "Ollama n’est pas actif", az: "Ollama işləmir",
  },
  cmNow: {
    tr: "Şimdi öneri iste (Alt+\\)", en: "Suggest now (Alt+\\)", de: "Jetzt vorschlagen (Alt+\\)", ru: "Предложить сейчас (Alt+\\)", ar: "اقترح الآن (Alt+\\)", es: "Sugerir ahora (Alt+\\)", fr: "Suggérer maintenant (Alt+\\)", az: "İndi təklif et (Alt+\\)",
  },
  cmAllSettings: {
    tr: "Tüm ayarlar", en: "All settings", de: "Alle Einstellungen", ru: "Все настройки", ar: "كل الإعدادات", es: "Todos los ajustes", fr: "Tous les réglages", az: "Bütün ayarlar",
  },
  cmShortcuts: {
    tr: "Tab: tümünü kabul · Ctrl+→: kelime · Ctrl+Alt+→: satır · Alt+] / [: diğer öneri · Esc: reddet", en: "Tab: accept all · Ctrl+→: word · Ctrl+Alt+→: line · Alt+] / [: other suggestion · Esc: dismiss", de: "Tab: alles übernehmen · Strg+→: Wort · Strg+Alt+→: Zeile · Alt+] / [: anderer Vorschlag · Esc: verwerfen", ru: "Tab: принять всё · Ctrl+→: слово · Ctrl+Alt+→: строка · Alt+] / [: другой вариант · Esc: отклонить", ar: "Tab: قبول الكل · Ctrl+→: كلمة · Ctrl+Alt+→: سطر · Alt+] / [: اقتراح آخر · Esc: رفض", es: "Tab: aceptar todo · Ctrl+→: palabra · Ctrl+Alt+→: línea · Alt+] / [: otra sugerencia · Esc: descartar", fr: "Tab : tout accepter · Ctrl+→ : mot · Ctrl+Alt+→ : ligne · Alt+] / [ : autre suggestion · Échap : refuser", az: "Tab: hamısını qəbul · Ctrl+→: söz · Ctrl+Alt+→: sətir · Alt+] / [: digər təklif · Esc: rədd",
  },
  cmModel: {
    tr: "Model: {m} · yalnız bu bilgisayarda çalışır", en: "Model: {m} · runs only on this computer", de: "Modell: {m} · läuft nur auf diesem Computer", ru: "Модель: {m} · работает только на этом компьютере", ar: "النموذج: {m} · يعمل على هذا الحاسوب فقط", es: "Modelo: {m} · se ejecuta solo en este equipo", fr: "Modèle : {m} · fonctionne uniquement sur cet ordinateur", az: "Model: {m} · yalnız bu kompüterdə işləyir",
  },
  cmAdvanced: {
    tr: "Gelişmiş", en: "Advanced", de: "Erweitert", ru: "Дополнительно", ar: "متقدم", es: "Avanzado", fr: "Avancé", az: "Əlavə",
  },
  appBootLog: {
    tr: "NovaCode IDE v{v} başlatıldı. Gerçek zamanlı dosya ve Git motoru devrede.", en: "NovaCode IDE v{v} started. Live file and Git engine are running.", de: "NovaCode IDE v{v} gestartet. Datei- und Git-Engine laufen in Echtzeit.", ru: "NovaCode IDE v{v} запущена. Файловый и Git-движок работают в реальном времени.", ar: "تم تشغيل NovaCode IDE v{v}. محرك الملفات وGit يعملان لحظياً.", es: "NovaCode IDE v{v} iniciado. El motor de archivos y Git funciona en tiempo real.", fr: "NovaCode IDE v{v} démarré. Le moteur de fichiers et Git fonctionne en temps réel.", az: "NovaCode IDE v{v} işə düşdü. Fayl və Git mühərriki real vaxtda işləyir.",
  },
  appTreeRefreshFail: {
    tr: "Dosya ağacı yenilenemedi: {e}", en: "Could not refresh the file tree: {e}", de: "Dateibaum konnte nicht aktualisiert werden: {e}", ru: "Не удалось обновить дерево файлов: {e}", ar: "تعذّر تحديث شجرة الملفات: {e}", es: "No se pudo actualizar el árbol de archivos: {e}", fr: "Impossible d’actualiser l’arborescence : {e}", az: "Fayl ağacı yenilənmədi: {e}",
  },
  appWorkspaceOpened: {
    tr: "Çalışma alanı açıldı: {p}", en: "Workspace opened: {p}", de: "Arbeitsbereich geöffnet: {p}", ru: "Рабочая область открыта: {p}", ar: "تم فتح مساحة العمل: {p}", es: "Espacio de trabajo abierto: {p}", fr: "Espace de travail ouvert : {p}", az: "İş sahəsi açıldı: {p}",
  },
  appFolderOpenFail: {
    tr: "Klasör açılamadı: {e}", en: "Could not open the folder: {e}", de: "Ordner konnte nicht geöffnet werden: {e}", ru: "Не удалось открыть папку: {e}", ar: "تعذّر فتح المجلد: {e}", es: "No se pudo abrir la carpeta: {e}", fr: "Impossible d’ouvrir le dossier : {e}", az: "Qovluq açılmadı: {e}",
  },
  appFilesLoaded: {
    tr: "{n} dosya çalışma alanına yüklendi.", en: "{n} files loaded into the workspace.", de: "{n} Dateien in den Arbeitsbereich geladen.", ru: "{n} файлов загружено в рабочую область.", ar: "تم تحميل {n} ملف في مساحة العمل.", es: "{n} archivos cargados en el espacio de trabajo.", fr: "{n} fichiers chargés dans l’espace de travail.", az: "{n} fayl iş sahəsinə yükləndi.",
  },
  appFilesOpened: {
    tr: "{n} dosya editörde açıldı.", en: "{n} files opened in the editor.", de: "{n} Dateien im Editor geöffnet.", ru: "{n} файлов открыто в редакторе.", ar: "تم فتح {n} ملف في المحرر.", es: "{n} archivos abiertos en el editor.", fr: "{n} fichiers ouverts dans l’éditeur.", az: "{n} fayl redaktorda açıldı.",
  },
  appReadFail: {
    tr: "Dosya okunamadı: {e}", en: "Could not read the file: {e}", de: "Datei konnte nicht gelesen werden: {e}", ru: "Не удалось прочитать файл: {e}", ar: "تعذّرت قراءة الملف: {e}", es: "No se pudo leer el archivo: {e}", fr: "Impossible de lire le fichier : {e}", az: "Fayl oxunmadı: {e}",
  },
  appFileTooLarge: {
    tr: "Dosya çok büyük olduğu için açılmadı: {n}", en: "File not opened because it is too large: {n}", de: "Datei wegen ihrer Größe nicht geöffnet: {n}", ru: "Файл не открыт: слишком большой: {n}", ar: "لم يُفتح الملف لأنه كبير جداً: {n}", es: "Archivo no abierto por ser demasiado grande: {n}", fr: "Fichier non ouvert car trop volumineux : {n}", az: "Fayl çox böyük olduğu üçün açılmadı: {n}",
  },
  appFileBinary: {
    tr: "İkili (binary) dosya metin olarak açılmadı: {n}", en: "Binary file not opened as text: {n}", de: "Binärdatei nicht als Text geöffnet: {n}", ru: "Двоичный файл не открыт как текст: {n}", ar: "لم يُفتح الملف الثنائي كنص: {n}", es: "Archivo binario no abierto como texto: {n}", fr: "Fichier binaire non ouvert comme texte : {n}", az: "İkili (binary) fayl mətn kimi açılmadı: {n}",
  },
  appSaved: {
    tr: "Kaydedildi: {n}", en: "Saved: {n}", de: "Gespeichert: {n}", ru: "Сохранено: {n}", ar: "تم الحفظ: {n}", es: "Guardado: {n}", fr: "Enregistré : {n}", az: "Yadda saxlanıldı: {n}",
  },
  appSaveFail: {
    tr: "Kaydetme hatası: {e}", en: "Save error: {e}", de: "Speicherfehler: {e}", ru: "Ошибка сохранения: {e}", ar: "خطأ في الحفظ: {e}", es: "Error al guardar: {e}", fr: "Erreur d’enregistrement : {e}", az: "Yadda saxlama xətası: {e}",
  },
  appSavedLocal: {
    tr: "Yerel belleğe kaydedildi: {n}", en: "Saved to local memory: {n}", de: "Im lokalen Speicher gesichert: {n}", ru: "Сохранено в локальной памяти: {n}", ar: "تم الحفظ في الذاكرة المحلية: {n}", es: "Guardado en la memoria local: {n}", fr: "Enregistré en mémoire locale : {n}", az: "Yerli yaddaşa saxlanıldı: {n}",
  },
  appDownloaded: {
    tr: "Adsız dosya bilgisayarına indirildi: {n}", en: "Untitled file downloaded to your computer: {n}", de: "Unbenannte Datei auf deinen Computer heruntergeladen: {n}", ru: "Безымянный файл скачан на компьютер: {n}", ar: "تم تنزيل الملف بلا اسم إلى حاسوبك: {n}", es: "Archivo sin nombre descargado a tu equipo: {n}", fr: "Fichier sans nom téléchargé sur ton ordinateur : {n}", az: "Adsız fayl kompüterinə endirildi: {n}",
  },
  appCreateFail: {
    tr: "Oluşturulamadı: {e}", en: "Could not create: {e}", de: "Erstellen fehlgeschlagen: {e}", ru: "Не удалось создать: {e}", ar: "تعذّر الإنشاء: {e}", es: "No se pudo crear: {e}", fr: "Création impossible : {e}", az: "Yaradılmadı: {e}",
  },
  appCreatedFolder: {
    tr: "Yeni klasör oluşturuldu: {n}", en: "New folder created: {n}", de: "Neuer Ordner erstellt: {n}", ru: "Создана новая папка: {n}", ar: "تم إنشاء مجلد جديد: {n}", es: "Carpeta nueva creada: {n}", fr: "Nouveau dossier créé : {n}", az: "Yeni qovluq yaradıldı: {n}",
  },
  appCreatedFile: {
    tr: "Yeni dosya oluşturuldu: {n}", en: "New file created: {n}", de: "Neue Datei erstellt: {n}", ru: "Создан новый файл: {n}", ar: "تم إنشاء ملف جديد: {n}", es: "Archivo nuevo creado: {n}", fr: "Nouveau fichier créé : {n}", az: "Yeni fayl yaradıldı: {n}",
  },
  appRenameFail: {
    tr: "Yeniden adlandırılamadı: {e}", en: "Could not rename: {e}", de: "Umbenennen fehlgeschlagen: {e}", ru: "Не удалось переименовать: {e}", ar: "تعذّرت إعادة التسمية: {e}", es: "No se pudo renombrar: {e}", fr: "Renommage impossible : {e}", az: "Yenidən adlandırılmadı: {e}",
  },
  appRenamed: {
    tr: "Yeniden adlandırıldı: {a} → {b}", en: "Renamed: {a} → {b}", de: "Umbenannt: {a} → {b}", ru: "Переименовано: {a} → {b}", ar: "تمت إعادة التسمية: {a} ← {b}", es: "Renombrado: {a} → {b}", fr: "Renommé : {a} → {b}", az: "Yenidən adlandırıldı: {a} → {b}",
  },
  appMoveFail: {
    tr: "Taşınamadı: {e}", en: "Could not move: {e}", de: "Verschieben fehlgeschlagen: {e}", ru: "Не удалось переместить: {e}", ar: "تعذّر النقل: {e}", es: "No se pudo mover: {e}", fr: "Déplacement impossible : {e}", az: "Köçürülmədi: {e}",
  },
  appMoved: {
    tr: "Taşındı: {a} → {b}", en: "Moved: {a} → {b}", de: "Verschoben: {a} → {b}", ru: "Перемещено: {a} → {b}", ar: "تم النقل: {a} ← {b}", es: "Movido: {a} → {b}", fr: "Déplacé : {a} → {b}", az: "Köçürüldü: {a} → {b}",
  },
  appDeleteFail: {
    tr: "Silinemedi: {e}", en: "Could not delete: {e}", de: "Löschen fehlgeschlagen: {e}", ru: "Не удалось удалить: {e}", ar: "تعذّر الحذف: {e}", es: "No se pudo eliminar: {e}", fr: "Suppression impossible : {e}", az: "Silinmədi: {e}",
  },
  appDeleted: {
    tr: "Silindi: {n}", en: "Deleted: {n}", de: "Gelöscht: {n}", ru: "Удалено: {n}", ar: "تم الحذف: {n}", es: "Eliminado: {n}", fr: "Supprimé : {n}", az: "Silindi: {n}",
  },
  appRunning: {
    tr: "[Çalıştırılıyor: {n}]", en: "[Running: {n}]", de: "[Wird ausgeführt: {n}]", ru: "[Выполняется: {n}]", ar: "[قيد التشغيل: {n}]", es: "[Ejecutando: {n}]", fr: "[Exécution : {n}]", az: "[İşlədilir: {n}]",
  },
  appSidebarWidth: {
    tr: "Kenar çubuğu genişliği", en: "Sidebar width", de: "Breite der Seitenleiste", ru: "Ширина боковой панели", ar: "عرض الشريط الجانبي", es: "Ancho de la barra lateral", fr: "Largeur de la barre latérale", az: "Yan panelin eni",
  },
  appTerminalHeight: {
    tr: "Terminal yüksekliği", en: "Terminal height", de: "Höhe des Terminals", ru: "Высота терминала", ar: "ارتفاع الطرفية", es: "Altura de la terminal", fr: "Hauteur du terminal", az: "Terminalın hündürlüyü",
  },
  appActivityBar: {
    tr: "Etkinlik çubuğu", en: "Activity bar", de: "Aktivitätsleiste", ru: "Панель действий", ar: "شريط الأنشطة", es: "Barra de actividad", fr: "Barre d’activité", az: "Fəaliyyət paneli",
  },
  appBreadcrumbs: {
    tr: "Dosya yolu", en: "File path", de: "Dateipfad", ru: "Путь к файлу", ar: "مسار الملف", es: "Ruta del archivo", fr: "Chemin du fichier", az: "Fayl yolu",
  },
  appUnsavedTitle: {
    tr: "Kaydedilmemiş değişiklikler", en: "Unsaved changes", de: "Nicht gespeicherte Änderungen", ru: "Несохранённые изменения", ar: "تغييرات غير محفوظة", es: "Cambios sin guardar", fr: "Modifications non enregistrées", az: "Yadda saxlanmamış dəyişikliklər",
  },
  appUnsavedOne: {
    tr: "“{n}” dosyasında kaydedilmemiş değişiklikler var. Kapatmadan önce kaydedilsin mi?", en: "“{n}” has unsaved changes. Save before closing?", de: "„{n}“ enthält nicht gespeicherte Änderungen. Vor dem Schließen speichern?", ru: "В «{n}» есть несохранённые изменения. Сохранить перед закрытием?", ar: "يحتوي «{n}» على تغييرات غير محفوظة. هل تريد الحفظ قبل الإغلاق؟", es: "«{n}» tiene cambios sin guardar. ¿Guardar antes de cerrar?", fr: "« {n} » contient des modifications non enregistrées. Enregistrer avant de fermer ?", az: "“{n}” faylında yadda saxlanmamış dəyişikliklər var. Bağlamazdan əvvəl saxlansın?",
  },
  appUnsavedMany: {
    tr: "{n} dosyada kaydedilmemiş değişiklikler var. Kapatmadan önce kaydedilsin mi?", en: "{n} files have unsaved changes. Save before closing?", de: "{n} Dateien enthalten nicht gespeicherte Änderungen. Vor dem Schließen speichern?", ru: "В {n} файлах есть несохранённые изменения. Сохранить перед закрытием?", ar: "هناك {n} ملفات بها تغييرات غير محفوظة. هل تريد الحفظ قبل الإغلاق؟", es: "{n} archivos tienen cambios sin guardar. ¿Guardar antes de cerrar?", fr: "{n} fichiers contiennent des modifications non enregistrées. Enregistrer avant de fermer ?", az: "{n} faylda yadda saxlanmamış dəyişikliklər var. Bağlamazdan əvvəl saxlansın?",
  },
  appUntitledNote: {
    tr: "Adsız dosyalar “Kaydet” ile bilgisayarına indirilir.", en: "Untitled files are downloaded to your computer on “Save”.", de: "Unbenannte Dateien werden bei „Speichern“ heruntergeladen.", ru: "Безымянные файлы при «Сохранить» скачиваются на компьютер.", ar: "تُنزَّل الملفات بلا اسم إلى حاسوبك عند «حفظ».", es: "Los archivos sin nombre se descargan en tu equipo con «Guardar».", fr: "Les fichiers sans nom sont téléchargés avec « Enregistrer ».", az: "Adsız fayllar “Saxla” ilə kompüterinə endirilir.",
  },
  appSaveBtn: {
    tr: "Kaydet", en: "Save", de: "Speichern", ru: "Сохранить", ar: "حفظ", es: "Guardar", fr: "Enregistrer", az: "Saxla",
  },
  appDontSave: {
    tr: "Kaydetme", en: "Don’t save", de: "Nicht speichern", ru: "Не сохранять", ar: "عدم الحفظ", es: "No guardar", fr: "Ne pas enregistrer", az: "Saxlama",
  },
  appCancel: {
    tr: "İptal", en: "Cancel", de: "Abbrechen", ru: "Отмена", ar: "إلغاء", es: "Cancelar", fr: "Annuler", az: "Ləğv et",
  },
  appMissingOnDisk: {
    tr: "Bu dosya diskte yok (silinmiş veya taşınmış). Kaydedersen yeniden oluşturulur.", en: "This file no longer exists on disk (deleted or moved). Saving will recreate it.", de: "Diese Datei existiert nicht mehr auf dem Datenträger (gelöscht oder verschoben). Speichern erstellt sie neu.", ru: "Файла больше нет на диске (удалён или перемещён). Сохранение создаст его заново.", ar: "لم يعد هذا الملف موجوداً على القرص (حُذف أو نُقل). سيعيد الحفظ إنشاءه.", es: "Este archivo ya no existe en el disco (eliminado o movido). Al guardar se recreará.", fr: "Ce fichier n’existe plus sur le disque (supprimé ou déplacé). L’enregistrement le recréera.", az: "Bu fayl diskdə yoxdur (silinib və ya köçürülüb). Saxlasan yenidən yaranacaq.",
  },
  appChangedOnDisk: {
    tr: "Bu dosya diskte değişti. Senin düzenlemelerin duruyor; kaydedersen diskteki sürümün üzerine yazılır.", en: "This file changed on disk. Your edits are kept; saving overwrites the disk version.", de: "Diese Datei wurde auf dem Datenträger geändert. Deine Änderungen bleiben; Speichern überschreibt die Datenträgerversion.", ru: "Файл изменён на диске. Ваши правки сохранены; сохранение перезапишет версию на диске.", ar: "تغيّر هذا الملف على القرص. تعديلاتك محفوظة؛ سيؤدي الحفظ إلى استبدال نسخة القرص.", es: "Este archivo cambió en el disco. Tus ediciones se conservan; al guardar se sobrescribe la versión del disco.", fr: "Ce fichier a changé sur le disque. Tes modifications sont conservées ; l’enregistrement écrase la version du disque.", az: "Bu fayl diskdə dəyişib. Düzənləmələrin qalır; saxlasan diskdəki versiyanın üzərinə yazılır.",
  },
  appReloadDisk: {
    tr: "Diskten yükle", en: "Reload from disk", de: "Vom Datenträger laden", ru: "Загрузить с диска", ar: "إعادة التحميل من القرص", es: "Recargar desde el disco", fr: "Recharger depuis le disque", az: "Diskdən yüklə",
  },
  appKeepMine: {
    tr: "Benimkini koru", en: "Keep mine", de: "Meine behalten", ru: "Оставить моё", ar: "الإبقاء على نسختي", es: "Conservar la mía", fr: "Garder la mienne", az: "Mənimkini saxla",
  },
  appTabMissing: {
    tr: "Diskte yok", en: "Missing on disk", de: "Nicht auf Datenträger", ru: "Нет на диске", ar: "غير موجود على القرص", es: "No está en el disco", fr: "Absent du disque", az: "Diskdə yoxdur",
  },
  appErrTitle: {
    tr: "Bir şey ters gitti", en: "Something went wrong", de: "Etwas ist schiefgelaufen", ru: "Что-то пошло не так", ar: "حدث خطأ ما", es: "Algo salió mal", fr: "Un problème est survenu", az: "Nəsə səhv getdi",
  },
  appErrPanel: {
    tr: "Bu bölüm yüklenemedi.", en: "This section could not be loaded.", de: "Dieser Bereich konnte nicht geladen werden.", ru: "Не удалось загрузить этот раздел.", ar: "تعذّر تحميل هذا القسم.", es: "No se pudo cargar esta sección.", fr: "Cette section n’a pas pu être chargée.", az: "Bu bölmə yüklənmədi.",
  },
  appErrRoot: {
    tr: "Uygulama beklenmedik bir hatayla durdu. Kaydedilmemiş çalışmaların bu bilgisayarda saklandı; yeniden yükleyince geri yükleme önerilir.", en: "The app stopped on an unexpected error. Your unsaved work is kept on this computer; after reloading you will be offered a restore.", de: "Die App wurde durch einen unerwarteten Fehler gestoppt. Nicht gespeicherte Arbeit bleibt auf diesem Computer; nach dem Neuladen wird eine Wiederherstellung angeboten.", ru: "Приложение остановилось из-за непредвиденной ошибки. Несохранённая работа хранится на этом компьютере; после перезагрузки предложим восстановить.", ar: "توقف التطبيق بسبب خطأ غير متوقع. عملك غير المحفوظ محفوظ على هذا الحاسوب؛ بعد إعادة التحميل سيُعرض عليك استرجاعه.", es: "La app se detuvo por un error inesperado. Tu trabajo sin guardar se conserva en este equipo; al recargar se te ofrecerá restaurarlo.", fr: "L’app s’est arrêtée sur une erreur inattendue. Ton travail non enregistré reste sur cet ordinateur ; après rechargement, une restauration te sera proposée.", az: "Tətbiq gözlənilməz xəta ilə dayandı. Yadda saxlanmamış işin bu kompüterdə qalır; yenidən yükləyəndə bərpa təklif olunacaq.",
  },
  appReload: {
    tr: "Yeniden yükle", en: "Reload", de: "Neu laden", ru: "Перезагрузить", ar: "إعادة التحميل", es: "Recargar", fr: "Recharger", az: "Yenidən yüklə",
  },
  appRestoreTitle: {
    tr: "Önceki oturum", en: "Previous session", de: "Vorherige Sitzung", ru: "Предыдущий сеанс", ar: "الجلسة السابقة", es: "Sesión anterior", fr: "Session précédente", az: "Əvvəlki sessiya",
  },
  appRestoreBody: {
    tr: "Önceki oturumdan {n} sekme var ({m} tanesinde kaydedilmemiş değişiklik). Geri yüklensin mi?", en: "The previous session has {n} tabs ({m} with unsaved changes). Restore them?", de: "Die vorherige Sitzung hat {n} Tabs ({m} mit nicht gespeicherten Änderungen). Wiederherstellen?", ru: "В предыдущем сеансе {n} вкладок ({m} с несохранёнными изменениями). Восстановить?", ar: "تحتوي الجلسة السابقة على {n} علامة تبويب ({m} بتغييرات غير محفوظة). هل تريد استرجاعها؟", es: "La sesión anterior tiene {n} pestañas ({m} con cambios sin guardar). ¿Restaurarlas?", fr: "La session précédente a {n} onglets ({m} avec des modifications non enregistrées). Les restaurer ?", az: "Əvvəlki sessiyada {n} vərəq var ({m} ədədində yadda saxlanmamış dəyişiklik). Bərpa edilsin?",
  },
  appRestoreBtn: {
    tr: "Geri yükle", en: "Restore", de: "Wiederherstellen", ru: "Восстановить", ar: "استرجاع", es: "Restaurar", fr: "Restaurer", az: "Bərpa et",
  },
  appRestoreDismiss: {
    tr: "Yoksay", en: "Dismiss", de: "Verwerfen", ru: "Пропустить", ar: "تجاهل", es: "Descartar", fr: "Ignorer", az: "Keç",
  },
  appReopenTab: {
    tr: "Kapatılan sekmeyi yeniden aç", en: "Reopen closed tab", de: "Geschlossenen Tab erneut öffnen", ru: "Снова открыть закрытую вкладку", ar: "إعادة فتح علامة التبويب المغلقة", es: "Reabrir pestaña cerrada", fr: "Rouvrir l’onglet fermé", az: "Bağlanan vərəqi yenidən aç",
  },
  cmdQuitApp: {
    tr: "Uygulamadan çık", en: "Quit the app", de: "Anwendung beenden", ru: "Выйти из приложения", ar: "الخروج من التطبيق", es: "Salir de la aplicación", fr: "Quitter l’application", az: "Tətbiqdən çıx",
  },
  cmdSplitRight: {
    tr: "Editörü sağa böl", en: "Split editor right", de: "Editor nach rechts teilen", ru: "Разделить редактор вправо", ar: "تقسيم المحرر إلى اليمين", es: "Dividir editor a la derecha", fr: "Fractionner l’éditeur à droite", az: "Redaktoru sağa böl",
  },
  cmdSplitDown: {
    tr: "Editörü alta böl", en: "Split editor down", de: "Editor nach unten teilen", ru: "Разделить редактор вниз", ar: "تقسيم المحرر إلى الأسفل", es: "Dividir editor hacia abajo", fr: "Fractionner l’éditeur vers le bas", az: "Redaktoru aşağı böl",
  },
  cmdFocusOtherGroup: {
    tr: "Diğer editör grubuna geç", en: "Focus other editor group", de: "Zur anderen Editorgruppe wechseln", ru: "Перейти в другую группу редактора", ar: "الانتقال إلى مجموعة المحرر الأخرى", es: "Ir al otro grupo de editores", fr: "Passer à l’autre groupe d’éditeurs", az: "Digər redaktor qrupuna keç",
  },
  cmdCloseSplit: {
    tr: "Bölmeyi kapat", en: "Close split", de: "Teilung schließen", ru: "Закрыть разделение", ar: "إغلاق التقسيم", es: "Cerrar división", fr: "Fermer la division", az: "Bölməni bağla",
  },
  kbOpen: {
    tr: "Klavye kısayollarını aç", en: "Open keyboard shortcuts", de: "Tastenkürzel öffnen", ru: "Открыть сочетания клавиш", ar: "فتح اختصارات لوحة المفاتيح", es: "Abrir atajos de teclado", fr: "Ouvrir les raccourcis clavier", az: "Klaviatura qısayollarını aç",
  },
  kbTitle: {
    tr: "Klavye kısayolları", en: "Keyboard shortcuts", de: "Tastenkürzel", ru: "Сочетания клавиш", ar: "اختصارات لوحة المفاتيح", es: "Atajos de teclado", fr: "Raccourcis clavier", az: "Klaviatura qısayolları",
  },
  kbSearch: {
    tr: "Komut ara…", en: "Search commands…", de: "Befehle suchen…", ru: "Поиск команд…", ar: "ابحث عن أمر…", es: "Buscar comandos…", fr: "Rechercher des commandes…", az: "Əmr axtar…",
  },
  kbColCommand: {
    tr: "Komut", en: "Command", de: "Befehl", ru: "Команда", ar: "الأمر", es: "Comando", fr: "Commande", az: "Əmr",
  },
  kbColKey: {
    tr: "Kısayol", en: "Shortcut", de: "Kürzel", ru: "Сочетание", ar: "الاختصار", es: "Atajo", fr: "Raccourci", az: "Qısayol",
  },
  kbChange: {
    tr: "Değiştir", en: "Change", de: "Ändern", ru: "Изменить", ar: "تغيير", es: "Cambiar", fr: "Modifier", az: "Dəyiş",
  },
  kbRemove: {
    tr: "Kaldır", en: "Remove", de: "Entfernen", ru: "Удалить", ar: "إزالة", es: "Quitar", fr: "Supprimer", az: "Sil",
  },
  kbReset: {
    tr: "Sıfırla", en: "Reset", de: "Zurücksetzen", ru: "Сбросить", ar: "إعادة تعيين", es: "Restablecer", fr: "Réinitialiser", az: "Sıfırla",
  },
  kbResetAll: {
    tr: "Tümünü varsayılana döndür", en: "Reset all to defaults", de: "Alle auf Standard zurücksetzen", ru: "Сбросить всё по умолчанию", ar: "إعادة الكل إلى الافتراضي", es: "Restablecer todo a los valores predeterminados", fr: "Tout réinitialiser par défaut", az: "Hamısını susmaya görə qaytar",
  },
  kbPress: {
    tr: "Yeni kısayola bas… (Esc: vazgeç)", en: "Press the new shortcut… (Esc: cancel)", de: "Neues Kürzel drücken… (Esc: abbrechen)", ru: "Нажмите новое сочетание… (Esc: отмена)", ar: "اضغط الاختصار الجديد… (Esc: إلغاء)", es: "Pulsa el nuevo atajo… (Esc: cancelar)", fr: "Appuyez sur le nouveau raccourci… (Échap : annuler)", az: "Yeni qısayola bas… (Esc: ləğv)",
  },
  kbConflict: {
    tr: "{k} kısayolu “{c}” komutunda kullanılıyor.", en: "{k} is already used by “{c}”.", de: "{k} wird bereits von „{c}“ verwendet.", ru: "{k} уже используется командой «{c}».", ar: "الاختصار {k} مستخدم بالفعل للأمر «{c}».", es: "{k} ya lo usa «{c}».", fr: "{k} est déjà utilisé par « {c} ».", az: "{k} qısayolu artıq “{c}” əmrində işlənir.",
  },
  kbAssignAnyway: {
    tr: "Yine de ata (çakışan komutun kısayolu kalkar)", en: "Assign anyway (the other command loses its shortcut)", de: "Trotzdem zuweisen (der andere Befehl verliert sein Kürzel)", ru: "Всё равно назначить (у другой команды сочетание удалится)", ar: "تعيين على أي حال (يفقد الأمر الآخر اختصاره)", es: "Asignar igualmente (el otro comando pierde su atajo)", fr: "Attribuer quand même (l’autre commande perd son raccourci)", az: "Yenə də təyin et (digər əmr qısayolunu itirir)",
  },
  kbNeedMod: {
    tr: "Kısayol Ctrl veya Alt içermeli (ya da F1–F12 tuşu olmalı); düz harf yazmayı bozar.", en: "A shortcut needs Ctrl or Alt (or must be an F1–F12 key); plain letters would break typing.", de: "Ein Kürzel braucht Strg oder Alt (oder eine F1–F12-Taste); einfache Buchstaben würden das Tippen stören.", ru: "Сочетание должно включать Ctrl или Alt (или быть клавишей F1–F12); одиночные буквы мешают вводу.", ar: "يجب أن يتضمن الاختصار Ctrl أو Alt (أو مفتاح F1–F12)؛ الأحرف المفردة تعطّل الكتابة.", es: "Un atajo necesita Ctrl o Alt (o ser una tecla F1–F12); las letras sueltas impedirían escribir.", fr: "Un raccourci doit contenir Ctrl ou Alt (ou être une touche F1–F12) ; les lettres seules gêneraient la saisie.", az: "Qısayolda Ctrl və ya Alt olmalıdır (ya da F1–F12 düyməsi); tək hərflər yazmağı pozar.",
  },
  kbReserved: {
    tr: "Bu tuş sabit (kopyala/yapıştır, geri al, hata ayıklama, yardım) ve atanamaz.", en: "This key is fixed (copy/paste, undo, debugging, help) and cannot be assigned.", de: "Diese Taste ist fest belegt (Kopieren/Einfügen, Rückgängig, Debuggen, Hilfe) und kann nicht zugewiesen werden.", ru: "Эта клавиша зарезервирована (копирование/вставка, отмена, отладка, справка) и не назначается.", ar: "هذا المفتاح ثابت (نسخ/لصق، تراجع، تصحيح، مساعدة) ولا يمكن تعيينه.", es: "Esta tecla es fija (copiar/pegar, deshacer, depuración, ayuda) y no se puede asignar.", fr: "Cette touche est fixe (copier/coller, annuler, débogage, aide) et ne peut pas être attribuée.", az: "Bu düymə sabitdir (kopyala/yapışdır, geri al, sazlama, kömək) və təyin edilə bilməz.",
  },
  kbCustom: {
    tr: "Özel", en: "Custom", de: "Benutzerdefiniert", ru: "Свое", ar: "مخصص", es: "Personalizado", fr: "Personnalisé", az: "Xüsusi",
  },
  kbNone: {
    tr: "Atanmamış", en: "Unassigned", de: "Nicht zugewiesen", ru: "Не назначено", ar: "غير معيّن", es: "Sin asignar", fr: "Non attribué", az: "Təyin edilməyib",
  },
  kbNote: {
    tr: "Kısayollar yalnız bu bilgisayarda saklanır. F1, F5, F10, F11, Esc ve kopyala/yapıştır/geri al tuşları sabittir.", en: "Shortcuts are stored only on this computer. F1, F5, F10, F11, Esc and copy/paste/undo keys are fixed.", de: "Kürzel werden nur auf diesem Computer gespeichert. F1, F5, F10, F11, Esc sowie Kopieren/Einfügen/Rückgängig sind fest.", ru: "Сочетания хранятся только на этом компьютере. F1, F5, F10, F11, Esc и копирование/вставка/отмена зарезервированы.", ar: "تُحفظ الاختصارات على هذا الجهاز فقط. المفاتيح F1 وF5 وF10 وF11 وEsc ونسخ/لصق/تراجع ثابتة.", es: "Los atajos se guardan solo en este equipo. F1, F5, F10, F11, Esc y copiar/pegar/deshacer son fijos.", fr: "Les raccourcis sont stockés uniquement sur cet ordinateur. F1, F5, F10, F11, Échap et copier/coller/annuler sont fixes.", az: "Qısayollar yalnız bu kompüterdə saxlanır. F1, F5, F10, F11, Esc və kopyala/yapışdır/geri al sabitdir.",
  },
  kbEditorTag: {
    tr: "Editör", en: "Editor", de: "Editor", ru: "Редактор", ar: "المحرر", es: "Editor", fr: "Éditeur", az: "Redaktor",
  },
  kbConflictsBanner: {
    tr: "Çakışan kısayol var: aynı tuş birden fazla komuta atanmış.", en: "Conflicting shortcuts: the same key is assigned to more than one command.", de: "Kürzelkonflikt: dieselbe Taste ist mehreren Befehlen zugewiesen.", ru: "Конфликт сочетаний: одна клавиша назначена нескольким командам.", ar: "اختصارات متعارضة: المفتاح نفسه معيّن لأكثر من أمر.", es: "Atajos en conflicto: la misma tecla está asignada a más de un comando.", fr: "Raccourcis en conflit : la même touche est attribuée à plusieurs commandes.", az: "Toqquşan qısayollar: eyni düymə bir neçə əmrə təyin edilib.",
  },
} satisfies Record<string, Dict>;

export type CompTextKey = keyof typeof COMP_TEXT;

registerTexts(COMP_TEXT);
