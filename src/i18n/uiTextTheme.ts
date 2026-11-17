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
} satisfies Record<string, Dict>;

export type ThemeTextKey = keyof typeof THEME_TEXT;

registerTexts(THEME_TEXT);
