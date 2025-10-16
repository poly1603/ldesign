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
