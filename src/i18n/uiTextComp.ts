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
  set_aiCompletionOffLangs: {
    tr: "Kapalı diller", en: "Disabled languages", de: "Deaktivierte Sprachen", ru: "Отключённые языки", ar: "اللغات المعطّلة", es: "Lenguajes desactivados", fr: "Langages désactivés", az: "Deaktiv dillər",
  },
  setDesc_aiCompletionOffLangs: {
    tr: "Virgülle ayır (ör. markdown, json). Alt çubuktaki ✦ menüsünden geçerli dili de kapatabilirsin.", en: "Comma-separated (e.g. markdown, json). You can also disable the current language from the ✦ menu in the status bar.", de: "Kommagetrennt (z. B. markdown, json). Die aktuelle Sprache lässt sich auch im ✦-Menü der Statusleiste deaktivieren.", ru: "Через запятую (напр. markdown, json). Текущий язык можно отключить и в меню ✦ в строке состояния.", ar: "افصل بفاصلة (مثل markdown, json). يمكنك أيضاً تعطيل اللغة الحالية من قائمة ✦ في شريط الحالة.", es: "Separados por comas (p. ej. markdown, json). También puedes desactivar el lenguaje actual en el menú ✦ de la barra de estado.", fr: "Séparés par des virgules (ex. markdown, json). Tu peux aussi désactiver le langage courant depuis le menu ✦ de la barre d’état.", az: "Vergüllə ayır (məs. markdown, json). Cari dili status panelindəki ✦ menyusundan da söndürə bilərsən.",
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
    tr: "Model kurulu değil: ollama pull qwen2.5-coder:7b", en: "Model not installed: ollama pull qwen2.5-coder:7b", de: "Modell nicht installiert: ollama pull qwen2.5-coder:7b", ru: "Модель не установлена: ollama pull qwen2.5-coder:7b", ar: "النموذج غير مثبّت: ollama pull qwen2.5-coder:7b", es: "Modelo no instalado: ollama pull qwen2.5-coder:7b", fr: "Modèle non installé : ollama pull qwen2.5-coder:7b", az: "Model quraşdırılmayıb: ollama pull qwen2.5-coder:7b",
  },
  cmNoOllama: {
    tr: "Ollama çalışmıyor", en: "Ollama is not running", de: "Ollama läuft nicht", ru: "Ollama не запущен", ar: "Ollama لا يعمل", es: "Ollama no está activo", fr: "Ollama n’est pas actif", az: "Ollama işləmir",
  },
  cmThisLang: {
    tr: "Bu dilde etkin ({l})", en: "Enabled for this language ({l})", de: "Für diese Sprache aktiv ({l})", ru: "Включено для этого языка ({l})", ar: "مفعّل لهذه اللغة ({l})", es: "Activado para este lenguaje ({l})", fr: "Activé pour ce langage ({l})", az: "Bu dildə aktiv ({l})",
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
