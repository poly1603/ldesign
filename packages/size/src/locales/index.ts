/**
 * Size Selector 内置国际化
 */

export interface SizeLocale {
  title: string
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

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'zh': zhCN,
  'en': enUS
}

export type LocaleKey = keyof typeof locales

export function getLocale(locale: LocaleKey | string): SizeLocale {
  return locales[locale as LocaleKey] || enUS
}
