import { ThemeConfig } from '../core/types.js'

/**
 * 预设主题配置
 */

/**
 * Arco蓝主题 - 专业稳重（使用Arco Design官方颜色）
 */
declare const defaultTheme: ThemeConfig
/**
 * Arco绿主题 - 自然清新（使用Arco Design官方颜色）
 */
declare const greenTheme: ThemeConfig
/**
 * Arco紫主题 - 优雅神秘（使用Arco Design官方颜色）
 */
declare const purpleTheme: ThemeConfig
/**
 * Arco红主题 - 温暖活力（使用Arco Design官方颜色）
 */
declare const redTheme: ThemeConfig
/**
 * 日落橙主题 - 温暖治愈
 */
declare const orangeTheme: ThemeConfig
/**
 * 天空青主题 - 清澈宁静
 */
declare const cyanTheme: ThemeConfig
/**
 * 樱花粉主题 - 浪漫温柔
 */
declare const pinkTheme: ThemeConfig
/**
 * 金盏花主题 - 明亮活泼
 */
declare const yellowTheme: ThemeConfig
/**
 * 午夜蓝主题 - 深邃专业
 */
declare const darkTheme: ThemeConfig
/**
 * 石墨灰主题 - 简约现代
 */
declare const minimalTheme: ThemeConfig
/**
 * 薰衣草主题 - 宁静舒缓
 */
declare const lavenderTheme: ThemeConfig
/**
 * 森林绿主题 - 自然沉稳
 */
declare const forestTheme: ThemeConfig
/**
 * 所有预设主题
 */
declare const presetThemes: ThemeConfig[]
/**
 * 按名称获取预设主题
 */
declare function getPresetTheme(name: string): ThemeConfig | undefined
/**
 * 获取所有预设主题名称
 */
declare function getPresetThemeNames(): string[]
/**
 * 检查是否为预设主题
 */
declare function isPresetTheme(name: string): boolean
/**
 * 创建自定义主题配置
 */
declare function createCustomTheme(
  name: string,
  primaryColor: string,
  options?: {
    displayName?: string
    description?: string
    darkPrimaryColor?: string
  }
): ThemeConfig
/**
 * 主题分类
 */
declare const themeCategories: {
  /** 基础主题 */
  readonly basic: readonly [ThemeConfig, ThemeConfig, ThemeConfig]
  /** 彩色主题 */
  readonly colorful: readonly [
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig
  ]
  /** 所有主题 */
  readonly all: ThemeConfig[]
}
/**
 * 按分类获取主题
 */
declare function getThemesByCategory(
  category: keyof typeof themeCategories
): ThemeConfig[]
/**
 * 主题标签
 */
declare const themeTags: {
  readonly professional: readonly [
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig
  ]
  readonly vibrant: readonly [
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig
  ]
  readonly calm: readonly [ThemeConfig, ThemeConfig, ThemeConfig, ThemeConfig]
  readonly modern: readonly [ThemeConfig, ThemeConfig, ThemeConfig, ThemeConfig]
  readonly classic: readonly [
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig
  ]
  readonly natural: readonly [ThemeConfig, ThemeConfig, ThemeConfig]
  readonly elegant: readonly [
    ThemeConfig,
    ThemeConfig,
    ThemeConfig,
    ThemeConfig
  ]
}
/**
 * 按标签获取主题
 */
declare function getThemesByTag(tag: keyof typeof themeTags): ThemeConfig[]
/**
 * 随机获取一个预设主题
 */
declare function getRandomPresetTheme(): ThemeConfig
/**
 * 根据颜色偏好推荐主题
 */
declare function recommendThemes(preferences: {
  brightness?: 'light' | 'dark' | 'auto'
  style?: 'professional' | 'vibrant' | 'calm' | 'modern' | 'classic'
  excludeColors?: string[]
}): ThemeConfig[]

export {
  createCustomTheme,
  cyanTheme,
  darkTheme,
  defaultTheme,
  forestTheme,
  getPresetTheme,
  getPresetThemeNames,
  getRandomPresetTheme,
  getThemesByCategory,
  getThemesByTag,
  greenTheme,
  isPresetTheme,
  lavenderTheme,
  minimalTheme,
  orangeTheme,
  pinkTheme,
  presetThemes,
  purpleTheme,
  recommendThemes,
  redTheme,
  themeCategories,
  themeTags,
  yellowTheme,
}
