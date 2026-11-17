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
} satisfies Record<string, Dict>;

export type CompTextKey = keyof typeof COMP_TEXT;

registerTexts(COMP_TEXT);
