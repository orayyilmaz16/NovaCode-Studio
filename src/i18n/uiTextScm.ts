// Kaynak denetimi (Git) genişletmeleri, Sorunlar paneli ve dal seçici metinleri (8 dil). Ana pakette değil, bu bölümlerle birlikte gecikmeli yüklenir.
// Modül yüklenince kendini t() kaydına ekler; kullanan bileşenler bu dosyayı içe aktarmalıdır.
import { registerTexts, type UiLang } from './uiText';

type Dict = Record<UiLang, string>;

export const SCM_TEXT = {
  scmDiffSide: {
    tr: "Yan yana göster", en: "Show side by side", de: "Nebeneinander anzeigen", ru: "Показать рядом", ar: "عرض جنباً إلى جنب", es: "Ver en paralelo", fr: "Afficher côte à côte", az: "Yan-yana göstər",
  },
  scmDiffInline: {
    tr: "Satır içi göster", en: "Show inline", de: "Inline anzeigen", ru: "Показать в одной колонке", ar: "عرض ضمن السطر", es: "Ver en línea", fr: "Afficher en ligne", az: "Sətir daxilində göstər",
  },
  scmOpenFile: {
    tr: "Dosyayı aç", en: "Open file", de: "Datei öffnen", ru: "Открыть файл", ar: "فتح الملف", es: "Abrir archivo", fr: "Ouvrir le fichier", az: "Faylı aç",
  },
  scmDiffBinary: {
    tr: "İkili dosya: fark gösterilemez", en: "Binary file: no diff to show", de: "Binärdatei: kein Vergleich möglich", ru: "Двоичный файл: различия недоступны", ar: "ملف ثنائي: لا يمكن عرض الفروق", es: "Archivo binario: no se puede mostrar la diferencia", fr: "Fichier binaire : aucune différence à afficher", az: "İkili fayl: fərq göstərilə bilməz",
  },
  scmDiffTooLarge: {
    tr: "Dosya çok büyük: fark gösterilemiyor", en: "File too large to show a diff", de: "Datei zu groß für einen Vergleich", ru: "Файл слишком большой для сравнения", ar: "الملف كبير جداً لعرض الفروق", es: "Archivo demasiado grande para mostrar la diferencia", fr: "Fichier trop volumineux pour afficher la différence", az: "Fayl çox böyükdür: fərq göstərilə bilmir",
  },
  scmDiffWorking: {
    tr: "{n} (Çalışma ağacı)", en: "{n} (Working tree)", de: "{n} (Arbeitsverzeichnis)", ru: "{n} (Рабочее дерево)", ar: "{n} (شجرة العمل)", es: "{n} (Árbol de trabajo)", fr: "{n} (Arbre de travail)", az: "{n} (İş ağacı)",
  },
  scmDiffStaged: {
    tr: "{n} (Sahnede)", en: "{n} (Staged)", de: "{n} (Gestaged)", ru: "{n} (В индексе)", ar: "{n} (مُجهَّز)", es: "{n} (Preparado)", fr: "{n} (Indexé)", az: "{n} (Mərhələdə)",
  },
  scmDiffCommit: {
    tr: "{n} ({h})", en: "{n} ({h})", de: "{n} ({h})", ru: "{n} ({h})", ar: "{n} ({h})", es: "{n} ({h})", fr: "{n} ({h})", az: "{n} ({h})",
  },
  prbTab: {
    tr: "Sorunlar", en: "Problems", de: "Probleme", ru: "Проблемы", ar: "المشاكل", es: "Problemas", fr: "Problèmes", az: "Problemlər",
  },
  prbEmpty: {
    tr: "Açık dosyalarda sorun yok", en: "No problems in open files", de: "Keine Probleme in geöffneten Dateien", ru: "В открытых файлах проблем нет", ar: "لا توجد مشاكل في الملفات المفتوحة", es: "Sin problemas en los archivos abiertos", fr: "Aucun problème dans les fichiers ouverts", az: "Açıq fayllarda problem yoxdur",
  },
  prbTip: {
    tr: "Sorunlar (açık dosyalar): {e} hata, {w} uyarı", en: "Problems (open files): {e} errors, {w} warnings", de: "Probleme (geöffnete Dateien): {e} Fehler, {w} Warnungen", ru: "Проблемы (открытые файлы): ошибок {e}, предупреждений {w}", ar: "المشاكل (الملفات المفتوحة): {e} أخطاء، {w} تحذيرات", es: "Problemas (archivos abiertos): {e} errores, {w} advertencias", fr: "Problèmes (fichiers ouverts) : {e} erreurs, {w} avertissements", az: "Problemlər (açıq fayllar): {e} xəta, {w} xəbərdarlıq",
  },
  bpPlaceholder: {
    tr: "Dal veya etiket seç", en: "Select a branch or tag", de: "Branch oder Tag auswählen", ru: "Выберите ветку или тег", ar: "اختر فرعاً أو وسماً", es: "Selecciona una rama o etiqueta", fr: "Sélectionner une branche ou un tag", az: "Budaq və ya teq seç",
  },
  bpCreate: {
    tr: "Yeni dal oluştur…", en: "Create new branch…", de: "Neuen Branch erstellen…", ru: "Создать новую ветку…", ar: "إنشاء فرع جديد…", es: "Crear nueva rama…", fr: "Créer une branche…", az: "Yeni budaq yarat…",
  },
  bpCreateFrom: {
    tr: "Şuradan yeni dal oluştur…", en: "Create new branch from…", de: "Neuen Branch erstellen von…", ru: "Создать ветку из…", ar: "إنشاء فرع جديد من…", es: "Crear nueva rama desde…", fr: "Créer une branche à partir de…", az: "Buradan yeni budaq yarat…",
  },
  bpLocal: {
    tr: "Dallar", en: "Branches", de: "Branches", ru: "Ветки", ar: "الفروع", es: "Ramas", fr: "Branches", az: "Budaqlar",
  },
  bpRemote: {
    tr: "Uzak dallar", en: "Remote branches", de: "Remote-Branches", ru: "Удалённые ветки", ar: "الفروع البعيدة", es: "Ramas remotas", fr: "Branches distantes", az: "Uzaq budaqlar",
  },
  bpTags: {
    tr: "Etiketler", en: "Tags", de: "Tags", ru: "Теги", ar: "الوسوم", es: "Etiquetas", fr: "Tags", az: "Teqlər",
  },
  bpCurrent: {
    tr: "geçerli", en: "current", de: "aktuell", ru: "текущая", ar: "الحالي", es: "actual", fr: "actuelle", az: "cari",
  },
  bpMergeTitle: {
    tr: "Geçerli dala birleştirilecek dalı seç", en: "Select a branch to merge into the current one", de: "Branch zum Zusammenführen auswählen", ru: "Выберите ветку для слияния с текущей", ar: "اختر فرعاً لدمجه في الفرع الحالي", es: "Selecciona una rama para fusionar en la actual", fr: "Sélectionner une branche à fusionner dans la courante", az: "Cari budağa birləşdiriləcək budağı seç",
  },
  bpDeleteTitle: {
    tr: "Silinecek dalı seç", en: "Select a branch to delete", de: "Zu löschenden Branch auswählen", ru: "Выберите ветку для удаления", ar: "اختر فرعاً للحذف", es: "Selecciona una rama para eliminar", fr: "Sélectionner une branche à supprimer", az: "Silinəcək budağı seç",
  },
  bpDeleteTagTitle: {
    tr: "Silinecek etiketi seç", en: "Select a tag to delete", de: "Zu löschenden Tag auswählen", ru: "Выберите тег для удаления", ar: "اختر وسماً للحذف", es: "Selecciona una etiqueta para eliminar", fr: "Sélectionner un tag à supprimer", az: "Silinəcək teqi seç",
  },
  bpFromTitle: {
    tr: "Yeni dal hangi daldan/etiketten başlasın?", en: "Select a ref to create the branch from", de: "Ausgangspunkt für den neuen Branch wählen", ru: "Выберите точку начала новой ветки", ar: "اختر نقطة بداية الفرع الجديد", es: "Selecciona el origen de la nueva rama", fr: "Choisir le point de départ de la branche", az: "Yeni budaq haradan başlasın?",
  },
  bpNameTitle: {
    tr: "Yeni dalın adı", en: "New branch name", de: "Name des neuen Branches", ru: "Имя новой ветки", ar: "اسم الفرع الجديد", es: "Nombre de la nueva rama", fr: "Nom de la nouvelle branche", az: "Yeni budağın adı",
  },
  bpNameHint: {
    tr: "Adı yaz, Enter'a bas", en: "Type a name and press Enter", de: "Namen eingeben und Enter drücken", ru: "Введите имя и нажмите Enter", ar: "اكتب الاسم ثم اضغط Enter", es: "Escribe un nombre y pulsa Enter", fr: "Saisissez un nom puis Entrée", az: "Adı yaz və Enter bas",
  },
  bpNoResults: {
    tr: "Eşleşme yok", en: "No matches", de: "Keine Treffer", ru: "Нет совпадений", ar: "لا توجد نتائج", es: "Sin coincidencias", fr: "Aucun résultat", az: "Uyğunluq yoxdur",
  },
  scmMergeChanges: {
    tr: "Birleştirme değişiklikleri", en: "Merge changes", de: "Merge-Änderungen", ru: "Изменения слияния", ar: "تغييرات الدمج", es: "Cambios de fusión", fr: "Changements de fusion", az: "Birləşdirmə dəyişiklikləri",
  },
  scmMerging: {
    tr: "Birleştirme sürüyor", en: "Merge in progress", de: "Merge läuft", ru: "Идёт слияние", ar: "الدمج قيد التنفيذ", es: "Fusión en curso", fr: "Fusion en cours", az: "Birləşdirmə davam edir",
  },
  scmMergeContinue: {
    tr: "Birleştirmeyi tamamla", en: "Complete merge", de: "Merge abschließen", ru: "Завершить слияние", ar: "إكمال الدمج", es: "Completar fusión", fr: "Terminer la fusion", az: "Birləşdirməni tamamla",
  },
  scmMergeAbort: {
    tr: "Birleştirmeyi iptal et", en: "Abort merge", de: "Merge abbrechen", ru: "Отменить слияние", ar: "إلغاء الدمج", es: "Cancelar fusión", fr: "Annuler la fusion", az: "Birləşdirməni ləğv et",
  },
  scmMergeAbortConfirm: {
    tr: "Birleştirme iptal edilsin mi? Çözülmemiş değişiklikler kaybolur.", en: "Abort the merge? Unresolved changes will be lost.", de: "Merge abbrechen? Ungelöste Änderungen gehen verloren.", ru: "Отменить слияние? Неразрешённые изменения будут потеряны.", ar: "إلغاء الدمج؟ ستضيع التغييرات غير المحلولة.", es: "¿Cancelar la fusión? Se perderán los cambios sin resolver.", fr: "Annuler la fusion ? Les changements non résolus seront perdus.", az: "Birləşdirmə ləğv edilsin? Həll olunmamış dəyişikliklər itəcək.",
  },
  scmMergeConflictMsg: {
    tr: "Birleştirme çakışması: çakışan dosyaları çöz, sonra birleştirmeyi tamamla.", en: "Merge conflict: resolve the conflicting files, then complete the merge.", de: "Merge-Konflikt: Konflikte lösen, dann Merge abschließen.", ru: "Конфликт слияния: разрешите конфликты и завершите слияние.", ar: "تعارض في الدمج: حلّ الملفات المتعارضة ثم أكمل الدمج.", es: "Conflicto de fusión: resuelve los archivos en conflicto y completa la fusión.", fr: "Conflit de fusion : résolvez les fichiers en conflit puis terminez la fusion.", az: "Birləşdirmə ziddiyyəti: ziddiyyətli faylları həll et, sonra birləşdirməni tamamla.",
  },
  scmMergedOk: {
    tr: "Birleştirildi", en: "Merged", de: "Zusammengeführt", ru: "Слияние выполнено", ar: "تم الدمج", es: "Fusionado", fr: "Fusionné", az: "Birləşdirildi",
  },
  scmAcceptOurs: {
    tr: "Bizimkini al (geçerli dal)", en: "Accept current (ours)", de: "Eigene Version übernehmen", ru: "Принять текущую (нашу)", ar: "اعتماد الحالي (نسختنا)", es: "Aceptar actual (nuestra)", fr: "Garder la version courante", az: "Cari versiyanı qəbul et",
  },
  scmAcceptTheirs: {
    tr: "Gelen değişikliği al", en: "Accept incoming (theirs)", de: "Eingehende Version übernehmen", ru: "Принять входящую (их)", ar: "اعتماد الوارد (نسختهم)", es: "Aceptar entrante (suya)", fr: "Garder la version entrante", az: "Gələn dəyişikliyi qəbul et",
  },
  scmMore: {
    tr: "Diğer eylemler", en: "More actions", de: "Weitere Aktionen", ru: "Другие действия", ar: "إجراءات أخرى", es: "Más acciones", fr: "Autres actions", az: "Digər əməliyyatlar",
  },
  scmFetch: {
    tr: "Getir (fetch)", en: "Fetch", de: "Abrufen (Fetch)", ru: "Получить (fetch)", ar: "جلب (fetch)", es: "Traer (fetch)", fr: "Récupérer (fetch)", az: "Gətir (fetch)",
  },
  scmMerge: {
    tr: "Dal birleştir…", en: "Merge branch…", de: "Branch zusammenführen…", ru: "Слить ветку…", ar: "دمج فرع…", es: "Fusionar rama…", fr: "Fusionner une branche…", az: "Budağı birləşdir…",
  },
  scmNewTag: {
    tr: "Etiket oluştur…", en: "Create tag…", de: "Tag erstellen…", ru: "Создать тег…", ar: "إنشاء وسم…", es: "Crear etiqueta…", fr: "Créer un tag…", az: "Teq yarat…",
  },
  scmTagName: {
    tr: "Etiket adı (ör. v1.0.0)", en: "Tag name (e.g. v1.0.0)", de: "Tag-Name (z. B. v1.0.0)", ru: "Имя тега (напр. v1.0.0)", ar: "اسم الوسم (مثل v1.0.0)", es: "Nombre de etiqueta (p. ej. v1.0.0)", fr: "Nom du tag (ex. v1.0.0)", az: "Teq adı (məs. v1.0.0)",
  },
  scmTagMsg: {
    tr: "Etiket iletisi (isteğe bağlı)", en: "Tag message (optional)", de: "Tag-Nachricht (optional)", ru: "Сообщение тега (необязательно)", ar: "رسالة الوسم (اختياري)", es: "Mensaje de etiqueta (opcional)", fr: "Message du tag (facultatif)", az: "Teq mesajı (könüllü)",
  },
  scmTagPushAsk: {
    tr: "Etiket oluşturuldu. Uzak depoya da gönderilsin mi?", en: "Tag created. Push it to the remote too?", de: "Tag erstellt. Auch zum Remote pushen?", ru: "Тег создан. Отправить его и на удалённый репозиторий?", ar: "تم إنشاء الوسم. هل ترسله إلى المستودع البعيد أيضاً؟", es: "Etiqueta creada. ¿Enviarla también al remoto?", fr: "Tag créé. L’envoyer aussi au dépôt distant ?", az: "Teq yaradıldı. Uzaq depoya da göndərilsin?",
  },
  scmDeleteBranch: {
    tr: "Dal sil…", en: "Delete branch…", de: "Branch löschen…", ru: "Удалить ветку…", ar: "حذف فرع…", es: "Eliminar rama…", fr: "Supprimer une branche…", az: "Budağı sil…",
  },
  scmDeleteTag: {
    tr: "Etiket sil…", en: "Delete tag…", de: "Tag löschen…", ru: "Удалить тег…", ar: "حذف وسم…", es: "Eliminar etiqueta…", fr: "Supprimer un tag…", az: "Teqi sil…",
  },
  scmNotMerged: {
    tr: "Bu dal henüz birleştirilmemiş. Yine de silinsin mi?", en: "This branch is not fully merged. Delete it anyway?", de: "Dieser Branch ist nicht vollständig gemergt. Trotzdem löschen?", ru: "Ветка не полностью слита. Всё равно удалить?", ar: "هذا الفرع لم يُدمج بالكامل. هل تحذفه رغم ذلك؟", es: "Esta rama no está totalmente fusionada. ¿Eliminarla igualmente?", fr: "Cette branche n’est pas entièrement fusionnée. La supprimer quand même ?", az: "Bu budaq tam birləşdirilməyib. Yenə də silinsin?",
  },
  scmStash: {
    tr: "Rafa kaldır (stash)…", en: "Stash changes…", de: "Änderungen stashen…", ru: "Спрятать изменения (stash)…", ar: "إخفاء التغييرات (stash)…", es: "Guardar cambios (stash)…", fr: "Mettre de côté (stash)…", az: "Rafa qoy (stash)…",
  },
  scmStashPrompt: {
    tr: "Stash iletisi (isteğe bağlı)", en: "Stash message (optional)", de: "Stash-Nachricht (optional)", ru: "Сообщение stash (необязательно)", ar: "رسالة stash (اختياري)", es: "Mensaje del stash (opcional)", fr: "Message du stash (facultatif)", az: "Stash mesajı (könüllü)",
  },
  scmStashes: {
    tr: "Raf (stash)", en: "Stashes", de: "Stashes", ru: "Stash", ar: "المخبأ (stash)", es: "Stashes", fr: "Stashes", az: "Raf (stash)",
  },
  scmStashApply: {
    tr: "Uygula", en: "Apply", de: "Anwenden", ru: "Применить", ar: "تطبيق", es: "Aplicar", fr: "Appliquer", az: "Tətbiq et",
  },
  scmStashPop: {
    tr: "Uygula ve sil", en: "Pop", de: "Pop", ru: "Применить и удалить", ar: "تطبيق وحذف", es: "Aplicar y eliminar", fr: "Appliquer et supprimer", az: "Tətbiq et və sil",
  },
  scmStashDrop: {
    tr: "Sil", en: "Drop", de: "Verwerfen", ru: "Удалить", ar: "حذف", es: "Eliminar", fr: "Supprimer", az: "Sil",
  },
  scmStashDropConfirm: {
    tr: "Bu raf kaydı silinsin mi?", en: "Drop this stash?", de: "Diesen Stash verwerfen?", ru: "Удалить этот stash?", ar: "حذف هذا المخبأ؟", es: "¿Eliminar este stash?", fr: "Supprimer ce stash ?", az: "Bu raf qeydi silinsin?",
  },
  scmStashDone: {
    tr: "Değişiklikler rafa kaldırıldı", en: "Changes stashed", de: "Änderungen gestasht", ru: "Изменения спрятаны", ar: "تم إخفاء التغييرات", es: "Cambios guardados en stash", fr: "Changements mis de côté", az: "Dəyişikliklər rafa qoyuldu",
  },
  scmUndoCommit: {
    tr: "Son commit'i geri al", en: "Undo last commit", de: "Letzten Commit rückgängig machen", ru: "Отменить последний коммит", ar: "التراجع عن آخر commit", es: "Deshacer último commit", fr: "Annuler le dernier commit", az: "Son commit-i geri al",
  },
  scmUndoConfirm: {
    tr: "Son commit geri alınsın mı? Değişiklikler sahnede kalır, silinmez.", en: "Undo the last commit? Changes stay staged, nothing is deleted.", de: "Letzten Commit rückgängig machen? Änderungen bleiben gestaged.", ru: "Отменить последний коммит? Изменения останутся в индексе.", ar: "التراجع عن آخر commit؟ تبقى التغييرات مُجهَّزة ولا يُحذف شيء.", es: "¿Deshacer el último commit? Los cambios quedan preparados.", fr: "Annuler le dernier commit ? Les changements restent indexés.", az: "Son commit geri alınsın? Dəyişikliklər mərhələdə qalır, silinmir.",
  },
  scmAmend: {
    tr: "Son commit'i düzelt (amend)", en: "Amend last commit", de: "Letzten Commit ändern (amend)", ru: "Изменить последний коммит (amend)", ar: "تعديل آخر commit (amend)", es: "Modificar último commit (amend)", fr: "Modifier le dernier commit (amend)", az: "Son commit-i düzəlt (amend)",
  },
  scmAmendConfirm: {
    tr: "Son commit sahnedeki değişikliklerle (ve yukarıdaki iletiyle) yeniden yazılsın mı? Uzağa gönderilmişse sorun çıkarabilir.", en: "Rewrite the last commit with the staged changes (and the message above)? This can cause trouble if it was already pushed.", de: "Letzten Commit mit gestagten Änderungen (und obiger Nachricht) neu schreiben? Problematisch, wenn bereits gepusht.", ru: "Перезаписать последний коммит с индексом (и сообщением выше)? Это может вызвать проблемы, если он уже отправлен.", ar: "إعادة كتابة آخر commit بالتغييرات المُجهَّزة (والرسالة أعلاه)؟ قد يسبب مشاكل إن كان قد أُرسل.", es: "¿Reescribir el último commit con los cambios preparados (y el mensaje de arriba)? Puede dar problemas si ya se envió.", fr: "Réécrire le dernier commit avec les changements indexés (et le message ci-dessus) ? Risqué s’il est déjà poussé.", az: "Son commit mərhələdəki dəyişikliklərlə (və yuxarıdakı mesajla) yenidən yazılsın? Göndərilibsə problem yarada bilər.",
  },
  scmCommitPush: {
    tr: "Commit ve gönder", en: "Commit & push", de: "Commit & Push", ru: "Коммит и отправка", ar: "Commit وإرسال", es: "Commit y enviar", fr: "Commit et push", az: "Commit və göndər",
  },
  scmDiscardAll: {
    tr: "Tüm değişiklikleri at", en: "Discard all changes", de: "Alle Änderungen verwerfen", ru: "Отменить все изменения", ar: "تجاهل كل التغييرات", es: "Descartar todos los cambios", fr: "Annuler tous les changements", az: "Bütün dəyişiklikləri at",
  },
  scmDiscardAllConfirm: {
    tr: "Tüm değişiklikler geri alınamaz şekilde atılsın mı?", en: "Discard ALL changes? This cannot be undone.", de: "ALLE Änderungen verwerfen? Das kann nicht rückgängig gemacht werden.", ru: "Отменить ВСЕ изменения? Это нельзя вернуть.", ar: "تجاهل كل التغييرات؟ لا يمكن التراجع.", es: "¿Descartar TODOS los cambios? No se puede deshacer.", fr: "Annuler TOUS les changements ? Irréversible.", az: "BÜTÜN dəyişikliklər atılsın? Geri qaytarıla bilməz.",
  },
  scmBranchDeleted: {
    tr: "Dal silindi", en: "Branch deleted", de: "Branch gelöscht", ru: "Ветка удалена", ar: "تم حذف الفرع", es: "Rama eliminada", fr: "Branche supprimée", az: "Budaq silindi",
  },
  scmFiles: {
    tr: "Dosyalar", en: "Files", de: "Dateien", ru: "Файлы", ar: "الملفات", es: "Archivos", fr: "Fichiers", az: "Fayllar",
  },
  scmBranchTip: {
    tr: "Dal veya etiket seç", en: "Select a branch or tag", de: "Branch oder Tag auswählen", ru: "Выбрать ветку или тег", ar: "اختر فرعاً أو وسماً", es: "Seleccionar rama o etiqueta", fr: "Sélectionner une branche ou un tag", az: "Budaq və ya teq seç",
  },
  scmSyncTip: {
    tr: "Eşzamanla (çek ve gönder)", en: "Synchronize (pull and push)", de: "Synchronisieren (Pull und Push)", ru: "Синхронизировать (pull и push)", ar: "مزامنة (سحب وإرسال)", es: "Sincronizar (pull y push)", fr: "Synchroniser (pull et push)", az: "Sinxronlaşdır (çək və göndər)",
  },
  scmRefreshTip: {
    tr: "Yenile", en: "Refresh", de: "Aktualisieren", ru: "Обновить", ar: "تحديث", es: "Actualizar", fr: "Actualiser", az: "Yenilə",
  },
  scmCollapse: {
    tr: "Daralt/Genişlet", en: "Collapse/Expand", de: "Ein-/Ausklappen", ru: "Свернуть/развернуть", ar: "طي/توسيع", es: "Contraer/Expandir", fr: "Réduire/Développer", az: "Yığ/Genişlət",
  },
  scmChecked: {
    tr: "{n} dalına geçildi", en: "Switched to {n}", de: "Zu {n} gewechselt", ru: "Переключено на {n}", ar: "تم التبديل إلى {n}", es: "Cambiado a {n}", fr: "Basculé vers {n}", az: "{n} budağına keçildi",
  },
  bpError: {
    tr: "Dal listesi alınamadı. Uygulamayı kapatıp yeniden başlat (güncelleme sonrası gerekir); sürerse klasörün bir Git deposu olduğundan emin ol.", en: "Could not load the branch list. Quit and restart the app (needed after an update); if it persists, make sure the folder is a Git repository.", de: "Branch-Liste konnte nicht geladen werden. App beenden und neu starten (nach einem Update nötig); falls es bleibt, prüfen, ob der Ordner ein Git-Repository ist.", ru: "Не удалось загрузить список веток. Закройте и перезапустите приложение (нужно после обновления); если не помогло, убедитесь, что папка — Git-репозиторий.", ar: "تعذّر تحميل قائمة الفروع. أغلق التطبيق وأعد تشغيله (مطلوب بعد التحديث)؛ وإن استمر الأمر فتأكد أن المجلد مستودع Git.", es: "No se pudo cargar la lista de ramas. Cierra y reinicia la app (necesario tras una actualización); si persiste, comprueba que la carpeta sea un repositorio Git.", fr: "Impossible de charger la liste des branches. Quittez et relancez l’application (nécessaire après une mise à jour) ; si cela persiste, vérifiez que le dossier est un dépôt Git.", az: "Budaq siyahısı yüklənmədi. Tətbiqi bağlayıb yenidən başlat (yeniləmədən sonra lazımdır); davam edərsə qovluğun Git deposu olduğunu yoxla.",
  },
  scmLnCol: {
    tr: "Sat {l}, Süt {c}", en: "Ln {l}, Col {c}", de: "Z {l}, Sp {c}", ru: "Стр {l}, Стб {c}", ar: "س {l}، ع {c}", es: "Ln {l}, Col {c}", fr: "Ln {l}, Col {c}", az: "Sət {l}, Süt {c}",
  },
  scmSelected: {
    tr: "({n} seçili)", en: "({n} selected)", de: "({n} ausgewählt)", ru: "(выбрано {n})", ar: "({n} محدد)", es: "({n} seleccionados)", fr: "({n} sélectionnés)", az: "({n} seçilib)",
  },
  aiCompReady: {
    tr: "AI kod tamamlama hazır (Tab ile kabul)", en: "AI code completion ready (Tab to accept)", de: "KI-Vervollständigung bereit (Tab zum Übernehmen)", ru: "ИИ-автодополнение готово (Tab — принять)", ar: "إكمال الذكاء الاصطناعي جاهز (Tab للقبول)", es: "Autocompletado con IA listo (Tab para aceptar)", fr: "Complétion IA prête (Tab pour accepter)", az: "AI tamamlama hazırdır (qəbul üçün Tab)",
  },
  aiCompBusy: {
    tr: "AI öneri hazırlıyor…", en: "AI is preparing a suggestion…", de: "KI bereitet einen Vorschlag vor…", ru: "ИИ готовит подсказку…", ar: "الذكاء الاصطناعي يُحضّر اقتراحاً…", es: "La IA está preparando una sugerencia…", fr: "L’IA prépare une suggestion…", az: "AI təklif hazırlayır…",
  },
  aiCompUnavailable: {
    tr: "AI kod tamamlama kullanılamıyor: Ollama çalışmıyor veya qwen2.5-coder:7b kurulu değil", en: "AI completion unavailable: Ollama is not running or qwen2.5-coder:7b is not installed", de: "KI-Vervollständigung nicht verfügbar: Ollama läuft nicht oder qwen2.5-coder:7b fehlt", ru: "ИИ-автодополнение недоступно: Ollama не запущен или нет qwen2.5-coder:7b", ar: "إكمال الذكاء الاصطناعي غير متاح: Ollama لا يعمل أو qwen2.5-coder:7b غير مثبّت", es: "Autocompletado con IA no disponible: Ollama no está activo o falta qwen2.5-coder:7b", fr: "Complétion IA indisponible : Ollama inactif ou qwen2.5-coder:7b absent", az: "AI tamamlama mövcud deyil: Ollama işləmir və ya qwen2.5-coder:7b yoxdur",
  },
  histTip: {
    tr: "Commit geçmişi", en: "Commit history", de: "Commit-Verlauf", ru: "История коммитов", ar: "سجل الإيداعات", es: "Historial de commits", fr: "Historique des commits", az: "Commit tarixçəsi",
  },
  histTitle: {
    tr: "Commit geçmişi", en: "Commit history", de: "Commit-Verlauf", ru: "История коммитов", ar: "سجل الإيداعات", es: "Historial de commits", fr: "Historique des commits", az: "Commit tarixçəsi",
  },
  histEmpty: {
    tr: "Bu depoda henüz commit yok.", en: "No commits in this repository yet.", de: "In diesem Repository gibt es noch keine Commits.", ru: "В этом репозитории пока нет коммитов.", ar: "لا توجد إيداعات في هذا المستودع بعد.", es: "Aún no hay commits en este repositorio.", fr: "Aucun commit dans ce dépôt pour l'instant.", az: "Bu depoda hələ commit yoxdur.",
  },
  histError: {
    tr: "Geçmiş okunamadı.", en: "Could not read the history.", de: "Der Verlauf konnte nicht gelesen werden.", ru: "Не удалось прочитать историю.", ar: "تعذّرت قراءة السجل.", es: "No se pudo leer el historial.", fr: "Impossible de lire l'historique.", az: "Tarixçəni oxumaq mümkün olmadı.",
  },
  histLocalOnly: {
    tr: "Yalnız yerel depo (uzak bağlantı yok)", en: "Local repository only (no remote)", de: "Nur lokales Repository (kein Remote)", ru: "Только локальный репозиторий (нет remote)", ar: "مستودع محلي فقط (لا يوجد مستودع بعيد)", es: "Solo repositorio local (sin remoto)", fr: "Dépôt local uniquement (pas de remote)", az: "Yalnız lokal depo (uzaq bağlantı yoxdur)",
  },
  histRemoteSet: {
    tr: "Uzak depo bağlı", en: "Remote connected", de: "Remote verbunden", ru: "Remote подключён", ar: "المستودع البعيد متصل", es: "Remoto conectado", fr: "Remote connecté", az: "Uzaq depo qoşulub",
  },
  histOpenRepo: {
    tr: "GitHub'da aç", en: "Open on GitHub", de: "Auf GitHub öffnen", ru: "Открыть на GitHub", ar: "فتح على GitHub", es: "Abrir en GitHub", fr: "Ouvrir sur GitHub", az: "GitHub-da aç",
  },
  histOpenPanel: {
    tr: "Git panelinde aç", en: "Open in Git panel", de: "Im Git-Panel öffnen", ru: "Открыть в панели Git", ar: "فتح في لوحة Git", es: "Abrir en el panel de Git", fr: "Ouvrir dans le panneau Git", az: "Git panelində aç",
  },
  histRefresh: {
    tr: "Yenile", en: "Refresh", de: "Aktualisieren", ru: "Обновить", ar: "تحديث", es: "Actualizar", fr: "Actualiser", az: "Yenilə",
  },
  histLoading: {
    tr: "Yükleniyor…", en: "Loading…", de: "Wird geladen…", ru: "Загрузка…", ar: "جارٍ التحميل…", es: "Cargando…", fr: "Chargement…", az: "Yüklənir…",
  },
  histClosePanel: {
    tr: "Git panelini kapat", en: "Close Git panel", de: "Git-Panel schließen", ru: "Закрыть панель Git", ar: "إغلاق لوحة Git", es: "Cerrar el panel de Git", fr: "Fermer le panneau Git", az: "Git panelini bağla",
  },
  histLastCommit: {
    tr: "Son commit", en: "Last commit", de: "Letzter Commit", ru: "Последний коммит", ar: "آخر إيداع", es: "Último commit", fr: "Dernier commit", az: "Son commit",
  },
  histAddedTip: {
    tr: "{n} satır eklendi", en: "{n} lines added", de: "{n} Zeilen hinzugefügt", ru: "Добавлено строк: {n}", ar: "تمت إضافة {n} سطر", es: "{n} líneas añadidas", fr: "{n} lignes ajoutées", az: "{n} sətir əlavə edildi",
  },
  histDeletedTip: {
    tr: "{n} satır silindi", en: "{n} lines deleted", de: "{n} Zeilen gelöscht", ru: "Удалено строк: {n}", ar: "تم حذف {n} سطر", es: "{n} líneas eliminadas", fr: "{n} lignes supprimées", az: "{n} sətir silindi",
  },
  histFilesTip: {
    tr: "{n} dosya değişti", en: "{n} files changed", de: "{n} Dateien geändert", ru: "Изменено файлов: {n}", ar: "تم تغيير {n} ملف", es: "{n} archivos modificados", fr: "{n} fichiers modifiés", az: "{n} fayl dəyişdi",
  },
  histCardCopy: {
    tr: "Karmayı kopyala", en: "Copy hash", de: "Hash kopieren", ru: "Копировать хеш", ar: "نسخ المعرّف", es: "Copiar hash", fr: "Copier le hash", az: "Hash-i kopyala",
  },
  histCardCopied: {
    tr: "Kopyalandı", en: "Copied", de: "Kopiert", ru: "Скопировано", ar: "تم النسخ", es: "Copiado", fr: "Copié", az: "Kopyalandı",
  },
  histCardAuthor: {
    tr: "Yazar", en: "Author", de: "Autor", ru: "Автор", ar: "المؤلف", es: "Autor", fr: "Auteur", az: "Müəllif",
  },
  histCardDate: {
    tr: "Tarih", en: "Date", de: "Datum", ru: "Дата", ar: "التاريخ", es: "Fecha", fr: "Date", az: "Tarix",
  },
  histCardParents: {
    tr: "Üst commit", en: "Parent", de: "Übergeordnet", ru: "Родитель", ar: "الأصل", es: "Padre", fr: "Parent", az: "Valideyn commit",
  },
  histCardMerge: {
    tr: "Birleştirme", en: "Merge of", de: "Zusammenführung", ru: "Слияние", ar: "دمج", es: "Fusión de", fr: "Fusion de", az: "Birləşdirmə",
  },
  histCardHint: {
    tr: "Dosyaları görmek için tıkla", en: "Click to see the files", de: "Klicken, um die Dateien zu sehen", ru: "Нажмите, чтобы увидеть файлы", ar: "انقر لعرض الملفات", es: "Haz clic para ver los archivos", fr: "Cliquez pour voir les fichiers", az: "Faylları görmək üçün klikləyin",
  },
  histNeedRestart: {
    tr: "Satır sayıları için uygulamayı yeniden başlat.", en: "Restart the app to see line counts.", de: "Starte die App neu, um Zeilenzahlen zu sehen.", ru: "Перезапустите приложение, чтобы увидеть число строк.", ar: "أعد تشغيل التطبيق لرؤية عدد الأسطر.", es: "Reinicia la aplicación para ver el recuento de líneas.", fr: "Redémarrez l'application pour voir le nombre de lignes.", az: "Sətir sayını görmək üçün tətbiqi yenidən başladın.",
  },
  gitSumConflicts: {
    tr: "çakışma", en: "conflicts", de: "Konflikte", ru: "конфликтов", ar: "تعارضات", es: "conflictos", fr: "conflits", az: "konflikt",
  },
  gitSumDetached: {
    tr: "Ayrık HEAD", en: "Detached HEAD", de: "Losgelöster HEAD", ru: "Отсоединённый HEAD", ar: "HEAD منفصل", es: "HEAD separado", fr: "HEAD détaché", az: "Ayrılmış HEAD",
  },
  gitSumStagedTip: {
    tr: "Commit için hazırlanan dosyalar", en: "Files staged for commit", de: "Für Commit vorgemerkte Dateien", ru: "Файлы, подготовленные к коммиту", ar: "ملفات جاهزة للإيداع", es: "Archivos preparados para commit", fr: "Fichiers indexés pour le commit", az: "Commit üçün hazırlanan fayllar",
  },
  gitSumChangedTip: {
    tr: "Hazırlanmamış değişiklikler", en: "Unstaged changes", de: "Nicht vorgemerkte Änderungen", ru: "Неподготовленные изменения", ar: "تغييرات غير مجهزة", es: "Cambios sin preparar", fr: "Modifications non indexées", az: "Hazırlanmamış dəyişikliklər",
  },
  scmResizeSection: {
    tr: "Bölüm yüksekliğini sürükleyerek ayarla", en: "Drag to resize this section", de: "Zum Ändern der Höhe ziehen", ru: "Перетащите, чтобы изменить высоту", ar: "اسحب لتغيير الارتفاع", es: "Arrastra para cambiar la altura", fr: "Faites glisser pour redimensionner", az: "Hündürlüyü dəyişmək üçün sürüşdürün",
  },
  scmResizeReset: {
    tr: "çift tıkla: otomatik", en: "double-click: auto", de: "Doppelklick: automatisch", ru: "двойной щелчок: авто", ar: "نقر مزدوج: تلقائي", es: "doble clic: automático", fr: "double-clic : auto", az: "iki dəfə klik: avtomatik",
  },
  gitHistAll: {
    tr: "Tüm dallar", en: "All branches", de: "Alle Branches", ru: "Все ветки", ar: "كل الفروع", es: "Todas las ramas", fr: "Toutes les branches", az: "Bütün budaqlar",
  },
  gitHistCurrent: {
    tr: "Geçerli dal", en: "Current branch", de: "Aktueller Branch", ru: "Текущая ветка", ar: "الفرع الحالي", es: "Rama actual", fr: "Branche actuelle", az: "Cari budaq",
  },
} satisfies Record<string, Dict>;

export type ScmTextKey = keyof typeof SCM_TEXT;

registerTexts(SCM_TEXT);
