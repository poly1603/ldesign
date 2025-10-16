/**
 * Color/Theme Picker 内置国际化
 */

export interface ColorLocale {
  theme: {
    selectThemeColor: string
    customColor: string
    apply: string
    addCustomTheme: string
    themeName: string
    add: string
    remove: string
    searchPlaceholder: string
    presets: {
      [key: string]: string
    }
  }
}

export const zhCN: ColorLocale = {
  theme: {
    selectThemeColor: '选择主题色',
    customColor: '自定义颜色',
    apply: '应用',
    addCustomTheme: '添加自定义主题',
    themeName: '主题名称',
    add: '添加',
    remove: '移除',
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
  }
}

export const enUS: ColorLocale = {
  theme: {
    selectThemeColor: 'Select Theme Color',
    customColor: 'Custom Color',
    apply: 'Apply',
    addCustomTheme: 'Add Custom Theme',
    themeName: 'Theme name',
    add: 'Add',
    remove: 'Remove',
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
  }
}

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'zh': zhCN,
  'en': enUS
}

export type LocaleKey = keyof typeof locales

export function getLocale(locale: LocaleKey | string): ColorLocale {
  return locales[locale as LocaleKey] || enUS
}
