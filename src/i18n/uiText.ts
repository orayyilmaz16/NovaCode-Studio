// Kullanıcı arayüzü metinleri: her metin 8 dilde tanımlanır (tr, en, de, ru, ar, es, fr, az).
// Dil, tarayıcı/sistem diline göre seçilir; desteklenmeyen dillerde Türkçe kullanılır.

export const UI_LANGS = ['tr', 'en', 'de', 'ru', 'ar', 'es', 'fr', 'az'] as const;
export type UiLang = (typeof UI_LANGS)[number];

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

const currentLang: UiLang = detectLang();

export function t(key: UiTextKey): string {
  return UI_TEXT[key][currentLang];
}
