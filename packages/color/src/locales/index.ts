/**
 * Color/Theme Picker 内置国际化
 */

export interface ColorLocale {
  theme: {
    title: string
    selectThemeColor: string
    customColor: string
    custom: string
    apply: string
    addCustomTheme: string
    themeName: string
    add: string
    remove: string
    confirmRemove: string
    searchPlaceholder: string
    presets: {
      [key: string]: string
    }
  }
  themeMode: {
    light: string
    dark: string
    system: string
  }
}

export const zhCN: ColorLocale = {
  theme: {
    title: '主题色',
    selectThemeColor: '选择主题色',
    customColor: '自定义颜色',
    custom: '当前颜色',
    apply: '应用',
    addCustomTheme: '添加自定义主题',
    themeName: '主题名称',
    add: '添加',
    remove: '移除',
    confirmRemove: '确定移除主题 "%s" 吗？',
    searchPlaceholder: '搜索颜色...',
    presets: {
      blue: '蓝色',
      cyan: '青色',
      green: '绿色',
      orange: '橙色',
      red: '红色',
      purple: '紫色',
      pink: '粉色',
      gray: '灰色',
      yellow: '黄色',
      teal: '青绿色',
      indigo: '靛蓝',
      lime: '青柠',
      sunset: '日落橙',
      forest: '森林绿',
      midnight: '午夜蓝',
      lavender: '薰衣草',
      coral: '珊瑚红'
    }
  },
  themeMode: {
    light: '浅色',
    dark: '深色',
    system: '跟随系统'
  }
}

export const enUS: ColorLocale = {
  theme: {
    title: 'Theme Color',
    selectThemeColor: 'Select Theme Color',
    customColor: 'Custom Color',
    custom: 'Current Color',
    apply: 'Apply',
    addCustomTheme: 'Add Custom Theme',
    themeName: 'Theme name',
    add: 'Add',
    remove: 'Remove',
    confirmRemove: 'Remove theme "%s"?',
    searchPlaceholder: 'Search colors...',
    presets: {
      blue: 'Blue',
      cyan: 'Cyan',
      green: 'Green',
      orange: 'Orange',
      red: 'Red',
      purple: 'Purple',
      pink: 'Pink',
      gray: 'Gray',
      yellow: 'Yellow',
      teal: 'Teal',
      indigo: 'Indigo',
      lime: 'Lime',
      sunset: 'Sunset Orange',
      forest: 'Forest Green',
      midnight: 'Midnight Blue',
      lavender: 'Lavender',
      coral: 'Coral'
    }
  },
  themeMode: {
    light: 'Light',
    dark: 'Dark',
    system: 'Follow System'
  }
}

export const jaJP: ColorLocale = {
  theme: {
    title: 'テーマカラー',
    selectThemeColor: 'テーマカラーを選択',
    customColor: 'カスタムカラー',
    custom: '現在の色',
    apply: '適用',
    addCustomTheme: 'カスタムテーマを追加',
    themeName: 'テーマ名',
    add: '追加',
    remove: '削除',
    confirmRemove: 'テーマ「%s」を削除しますか？',
    searchPlaceholder: '色を検索...',
    presets: {
      blue: '青',
      cyan: 'シアン',
      green: '緑',
      orange: 'オレンジ',
      red: '赤',
      purple: '紫',
      pink: 'ピンク',
      gray: '灰色',
      yellow: '黄色',
      teal: '鴨羽色',
      indigo: '藍色',
      lime: 'ライム',
      sunset: '夕焼けオレンジ',
      forest: '森林の緑',
      midnight: '真夜中の青',
      lavender: 'ラベンダー',
      coral: '珊瑚色'
    }
  },
  themeMode: {
    light: 'ライト',
    dark: 'ダーク',
    system: 'システムに従う'
  }
}

export const koKR: ColorLocale = {
  theme: {
    title: '테마 색상',
    selectThemeColor: '테마 색상 선택',
    customColor: '사용자 지정 색상',
    custom: '현재 색상',
    apply: '적용',
    addCustomTheme: '사용자 지정 테마 추가',
    themeName: '테마 이름',
    add: '추가',
    remove: '제거',
    confirmRemove: '테마 "%s"를 제거하시겠습니까?',
    searchPlaceholder: '색상 검색...',
    presets: {
      blue: '파랑',
      cyan: '청록',
      green: '초록',
      orange: '주황',
      red: '빨강',
      purple: '보라',
      pink: '분홍',
      gray: '회색',
      yellow: '노랑',
      teal: '청록색',
      indigo: '남색',
      lime: '라임',
      sunset: '일몰 주황',
      forest: '숲 초록',
      midnight: '자정 파랑',
      lavender: '라벤더',
      coral: '산호색'
    }
  },
  themeMode: {
    light: '밝은 테마',
    dark: '어두운 테마',
    system: '시스템 따라가기'
  }
}

export const deDE: ColorLocale = {
  theme: {
    title: 'Themenfarbe',
    selectThemeColor: 'Themenfarbe auswählen',
    customColor: 'Benutzerdefinierte Farbe',
    custom: 'Aktuelle Farbe',
    apply: 'Anwenden',
    addCustomTheme: 'Benutzerdefiniertes Thema hinzufügen',
    themeName: 'Themenname',
    add: 'Hinzufügen',
    remove: 'Entfernen',
    confirmRemove: 'Thema "%s" entfernen?',
    searchPlaceholder: 'Farben suchen...',
    presets: {
      blue: 'Blau',
      cyan: 'Cyan',
      green: 'Grün',
      orange: 'Orange',
      red: 'Rot',
      purple: 'Lila',
      pink: 'Rosa',
      gray: 'Grau',
      yellow: 'Gelb',
      teal: 'Türkis',
      indigo: 'Indigo',
      lime: 'Limette',
      sunset: 'Sonnenuntergang Orange',
      forest: 'Waldgrün',
      midnight: 'Mitternachtsblau',
      lavender: 'Lavendel',
      coral: 'Koralle'
    }
  },
  themeMode: {
    light: 'Hell',
    dark: 'Dunkel',
    system: 'Systemeinstellung folgen'
  }
}

export const frFR: ColorLocale = {
  theme: {
    title: 'Couleur du thème',
    selectThemeColor: 'Sélectionner la couleur du thème',
    customColor: 'Couleur personnalisée',
    custom: 'Couleur actuelle',
    apply: 'Appliquer',
    addCustomTheme: 'Ajouter un thème personnalisé',
    themeName: 'Nom du thème',
    add: 'Ajouter',
    remove: 'Supprimer',
    confirmRemove: 'Supprimer le thème "%s" ?',
    searchPlaceholder: 'Rechercher des couleurs...',
    presets: {
      blue: 'Bleu',
      cyan: 'Cyan',
      green: 'Vert',
      orange: 'Orange',
      red: 'Rouge',
      purple: 'Violet',
      pink: 'Rose',
      gray: 'Gris',
      yellow: 'Jaune',
      teal: 'Sarcelle',
      indigo: 'Indigo',
      lime: 'Citron vert',
      sunset: 'Orange couché de soleil',
      forest: 'Vert forêt',
      midnight: 'Bleu minuit',
      lavender: 'Lavande',
      coral: 'Corail'
    }
  },
  themeMode: {
    light: 'Clair',
    dark: 'Sombre',
    system: 'Suivre le système'
  }
}

export const esES: ColorLocale = {
  theme: {
    title: 'Color del tema',
    selectThemeColor: 'Seleccionar color del tema',
    customColor: 'Color personalizado',
    custom: 'Color actual',
    apply: 'Aplicar',
    addCustomTheme: 'Añadir tema personalizado',
    themeName: 'Nombre del tema',
    add: 'Añadir',
    remove: 'Eliminar',
    confirmRemove: '¿Eliminar tema "%s"?',
    searchPlaceholder: 'Buscar colores...',
    presets: {
      blue: 'Azul',
      cyan: 'Cian',
      green: 'Verde',
      orange: 'Naranja',
      red: 'Rojo',
      purple: 'Morado',
      pink: 'Rosa',
      gray: 'Gris',
      yellow: 'Amarillo',
      teal: 'Verde azulado',
      indigo: 'Índigo',
      lime: 'Lima',
      sunset: 'Naranja atardecer',
      forest: 'Verde bosque',
      midnight: 'Azul medianoche',
      lavender: 'Lavanda',
      coral: 'Coral'
    }
  },
  themeMode: {
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Seguir sistema'
  }
}

export const itIT: ColorLocale = {
  theme: {
    title: 'Colore del tema',
    selectThemeColor: 'Seleziona colore del tema',
    customColor: 'Colore personalizzato',
    custom: 'Colore corrente',
    apply: 'Applica',
    addCustomTheme: 'Aggiungi tema personalizzato',
    themeName: 'Nome del tema',
    add: 'Aggiungi',
    remove: 'Rimuovi',
    confirmRemove: 'Rimuovere tema "%s"?',
    searchPlaceholder: 'Cerca colori...',
    presets: {
      blue: 'Blu',
      cyan: 'Ciano',
      green: 'Verde',
      orange: 'Arancione',
      red: 'Rosso',
      purple: 'Viola',
      pink: 'Rosa',
      gray: 'Grigio',
      yellow: 'Giallo',
      teal: 'Turchese',
      indigo: 'Indaco',
      lime: 'Lime',
      sunset: 'Arancione tramonto',
      forest: 'Verde foresta',
      midnight: 'Blu mezzanotte',
      lavender: 'Lavanda',
      coral: 'Corallo'
    }
  },
  themeMode: {
    light: 'Chiaro',
    dark: 'Scuro',
    system: 'Segui sistema'
  }
}

export const ptBR: ColorLocale = {
  theme: {
    title: 'Cor do tema',
    selectThemeColor: 'Selecionar cor do tema',
    customColor: 'Cor personalizada',
    custom: 'Cor atual',
    apply: 'Aplicar',
    addCustomTheme: 'Adicionar tema personalizado',
    themeName: 'Nome do tema',
    add: 'Adicionar',
    remove: 'Remover',
    confirmRemove: 'Remover tema "%s"?',
    searchPlaceholder: 'Buscar cores...',
    presets: {
      blue: 'Azul',
      cyan: 'Ciano',
      green: 'Verde',
      orange: 'Laranja',
      red: 'Vermelho',
      purple: 'Roxo',
      pink: 'Rosa',
      gray: 'Cinza',
      yellow: 'Amarelo',
      teal: 'Azul-petróleo',
      indigo: 'Índigo',
      lime: 'Lima',
      sunset: 'Laranja pôr do sol',
      forest: 'Verde floresta',
      midnight: 'Azul meia-noite',
      lavender: 'Lavanda',
      coral: 'Coral'
    }
  },
  themeMode: {
    light: 'Claro',
    dark: 'Escuro',
    system: 'Seguir sistema'
  }
}

export const ruRU: ColorLocale = {
  theme: {
    title: 'Цвет темы',
    selectThemeColor: 'Выбрать цвет темы',
    customColor: 'Пользовательский цвет',
    custom: 'Текущий цвет',
    apply: 'Применить',
    addCustomTheme: 'Добавить пользовательскую тему',
    themeName: 'Название темы',
    add: 'Добавить',
    remove: 'Удалить',
    confirmRemove: 'Удалить тему "%s"?',
    searchPlaceholder: 'Поиск цветов...',
    presets: {
      blue: 'Синий',
      cyan: 'Голубой',
      green: 'Зеленый',
      orange: 'Оранжевый',
      red: 'Красный',
      purple: 'Фиолетовый',
      pink: 'Розовый',
      gray: 'Серый',
      yellow: 'Желтый',
      teal: 'Бирюзовый',
      indigo: 'Индиго',
      lime: 'Лайм',
      sunset: 'Оранжевый закат',
      forest: 'Лесной зеленый',
      midnight: 'Полуночный синий',
      lavender: 'Лаванда',
      coral: 'Коралловый'
    }
  },
  themeMode: {
    light: 'Светлая',
    dark: 'Темная',
    system: 'Следовать за системой'
  }
}

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'de-DE': deDE,
  'fr-FR': frFR,
  'es-ES': esES,
  'it-IT': itIT,
  'pt-BR': ptBR,
  'ru-RU': ruRU,
  // Shortcuts
  'zh': zhCN,
  'en': enUS,
  'ja': jaJP,
  'ko': koKR,
  'de': deDE,
  'fr': frFR,
  'es': esES,
  'it': itIT,
  'pt': ptBR,
  'ru': ruRU
}

export type LocaleKey = keyof typeof locales

export function getLocale(locale: LocaleKey | string): ColorLocale {
  return locales[locale as LocaleKey] || enUS
}
