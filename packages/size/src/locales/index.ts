/**
 * Size Selector 内置国际化
 */

export interface SizeLocale {
  title: string
  close: string
  ariaLabel: string
  presets: {
    compact: string
    comfortable: string
    default: string
    spacious: string
    [key: string]: string
  }
  descriptions: {
    compact: string
    comfortable: string
    default: string
    spacious: string
    [key: string]: string
  }
}

export const zhCN: SizeLocale = {
  title: '调整尺寸',
  close: '关闭',
  ariaLabel: '调整尺寸',
  presets: {
    compact: '紧凑',
    comfortable: '舒适',
    default: '默认',
    spacious: '宽松',
    'extra-compact': '超紧凑',
    'extra-spacious': '超宽松'
  },
  descriptions: {
    compact: '高密度，最大化内容显示',
    comfortable: '平衡的间距，日常使用',
    default: '标准尺寸设置',
    spacious: '低密度，更好的可读性',
    'extra-compact': '超高密度，适合信息密集场景',
    'extra-spacious': '超低密度，提升可读性'
  }
}

export const enUS: SizeLocale = {
  title: 'Adjust Size',
  close: 'Close',
  ariaLabel: 'Adjust Size',
  presets: {
    compact: 'Compact',
    comfortable: 'Comfortable',
    default: 'Default',
    spacious: 'Spacious',
    'extra-compact': 'Extra Compact',
    'extra-spacious': 'Extra Spacious'
  },
  descriptions: {
    compact: 'High density for maximum content',
    comfortable: 'Balanced spacing for everyday use',
    default: 'Standard size settings',
    spacious: 'Lower density for better readability',
    'extra-compact': 'Very high density for maximum content',
    'extra-spacious': 'Very low density for enhanced readability'
  }
}

export const jaJP: SizeLocale = {
  title: 'サイズ調整',
  close: '閉じる',
  ariaLabel: 'サイズ調整',
  presets: {
    compact: 'コンパクト',
    comfortable: '快適',
    default: 'デフォルト',
    spacious: 'ゆったり',
    'extra-compact': '超コンパクト',
    'extra-spacious': '超ゆったり'
  },
  descriptions: {
    compact: '高密度で最大限のコンテンツを表示',
    comfortable: '日常使用に最適なバランスの取れた間隔',
    default: '標準サイズ設定',
    spacious: '低密度で読みやすさ向上',
    'extra-compact': '超高密度で最大限のコンテンツを表示',
    'extra-spacious': '超低密度で読みやすさを強化'
  }
}

export const koKR: SizeLocale = {
  title: '크기 조정',
  close: '닫기',
  ariaLabel: '크기 조정',
  presets: {
    compact: '간결',
    comfortable: '편안함',
    default: '기본',
    spacious: '여유',
    'extra-compact': '초간결',
    'extra-spacious': '초여유'
  },
  descriptions: {
    compact: '최대 콘텐츠를 위한 높은 밀도',
    comfortable: '일상 사용을 위한 균형잡힌 간격',
    default: '표준 크기 설정',
    spacious: '더 나은 가독성을 위한 낮은 밀도',
    'extra-compact': '최대 콘텐츠를 위한 매우 높은 밀도',
    'extra-spacious': '향상된 가독성을 위한 매우 낮은 밀도'
  }
}

export const deDE: SizeLocale = {
  title: 'Größe anpassen',
  close: 'Schließen',
  ariaLabel: 'Größe anpassen',
  presets: {
    compact: 'Kompakt',
    comfortable: 'Komfortabel',
    default: 'Standard',
    spacious: 'Geräumig',
    'extra-compact': 'Extra Kompakt',
    'extra-spacious': 'Extra Geräumig'
  },
  descriptions: {
    compact: 'Hohe Dichte für maximalen Inhalt',
    comfortable: 'Ausgewogener Abstand für den täglichen Gebrauch',
    default: 'Standard-Größeneinstellungen',
    spacious: 'Niedrigere Dichte für bessere Lesbarkeit',
    'extra-compact': 'Sehr hohe Dichte für maximalen Inhalt',
    'extra-spacious': 'Sehr niedrige Dichte für verbesserte Lesbarkeit'
  }
}

export const frFR: SizeLocale = {
  title: 'Ajuster la taille',
  close: 'Fermer',
  ariaLabel: 'Ajuster la taille',
  presets: {
    compact: 'Compact',
    comfortable: 'Confortable',
    default: 'Par défaut',
    spacious: 'Spacieux',
    'extra-compact': 'Extra Compact',
    'extra-spacious': 'Extra Spacieux'
  },
  descriptions: {
    compact: 'Haute densité pour un contenu maximal',
    comfortable: 'Espacement équilibré pour un usage quotidien',
    default: 'Paramètres de taille standard',
    spacious: 'Densité plus faible pour une meilleure lisibilité',
    'extra-compact': 'Très haute densité pour un contenu maximal',
    'extra-spacious': 'Très faible densité pour une lisibilité améliorée'
  }
}

export const esES: SizeLocale = {
  title: 'Ajustar tamaño',
  close: 'Cerrar',
  ariaLabel: 'Ajustar tamaño',
  presets: {
    compact: 'Compacto',
    comfortable: 'Cómodo',
    default: 'Predeterminado',
    spacious: 'Espacioso',
    'extra-compact': 'Extra Compacto',
    'extra-spacious': 'Extra Espacioso'
  },
  descriptions: {
    compact: 'Alta densidad para máximo contenido',
    comfortable: 'Espaciado equilibrado para uso diario',
    default: 'Configuración de tamaño estándar',
    spacious: 'Menor densidad para mejor legibilidad',
    'extra-compact': 'Muy alta densidad para máximo contenido',
    'extra-spacious': 'Muy baja densidad para legibilidad mejorada'
  }
}

export const itIT: SizeLocale = {
  title: 'Regola dimensione',
  close: 'Chiudi',
  ariaLabel: 'Regola dimensione',
  presets: {
    compact: 'Compatto',
    comfortable: 'Confortevole',
    default: 'Predefinito',
    spacious: 'Spazioso',
    'extra-compact': 'Extra Compatto',
    'extra-spacious': 'Extra Spazioso'
  },
  descriptions: {
    compact: 'Alta densità per massimo contenuto',
    comfortable: 'Spaziatura bilanciata per uso quotidiano',
    default: 'Impostazioni dimensione standard',
    spacious: 'Densità inferiore per migliore leggibilità',
    'extra-compact': 'Densità molto alta per massimo contenuto',
    'extra-spacious': 'Densità molto bassa per leggibilità migliorata'
  }
}

export const ptBR: SizeLocale = {
  title: 'Ajustar tamanho',
  close: 'Fechar',
  ariaLabel: 'Ajustar tamanho',
  presets: {
    compact: 'Compacto',
    comfortable: 'Confortável',
    default: 'Padrão',
    spacious: 'Espaçoso',
    'extra-compact': 'Extra Compacto',
    'extra-spacious': 'Extra Espaçoso'
  },
  descriptions: {
    compact: 'Alta densidade para máximo conteúdo',
    comfortable: 'Espaçamento balanceado para uso diário',
    default: 'Configurações de tamanho padrão',
    spacious: 'Densidade menor para melhor legibilidade',
    'extra-compact': 'Densidade muito alta para máximo conteúdo',
    'extra-spacious': 'Densidade muito baixa para legibilidade aprimorada'
  }
}

export const ruRU: SizeLocale = {
  title: 'Настроить размер',
  close: 'Закрыть',
  ariaLabel: 'Настроить размер',
  presets: {
    compact: 'Компактный',
    comfortable: 'Комфортный',
    default: 'По умолчанию',
    spacious: 'Просторный',
    'extra-compact': 'Очень компактный',
    'extra-spacious': 'Очень просторный'
  },
  descriptions: {
    compact: 'Высокая плотность для максимального контента',
    comfortable: 'Сбалансированные отступы для повседневного использования',
    default: 'Стандартные настройки размера',
    spacious: 'Меньшая плотность для лучшей читаемости',
    'extra-compact': 'Очень высокая плотность для максимального контента',
    'extra-spacious': 'Очень низкая плотность для улучшенной читаемости'
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

export function getLocale(locale: LocaleKey | string): SizeLocale {
  return locales[locale as LocaleKey] || enUS
}
