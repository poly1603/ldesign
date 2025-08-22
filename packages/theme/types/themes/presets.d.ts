import { ThemeConfig, FestivalType, ThemeCategory } from '../core/types.js'

/**
 * @ldesign/theme - 主题预设
 *
 * 提供所有预设主题的统一管理和导出
 */

/**
 * 所有预设主题
 */
declare const presetThemes: ThemeConfig[]
/**
 * 节日主题映射
 */
declare const festivalThemes: Record<FestivalType, ThemeConfig>
/**
 * 按类别分组的主题
 */
declare const themesByCategory: Record<ThemeCategory, ThemeConfig[]>
/**
 * 主题标签映射
 */
declare const themesByTag: Record<string, ThemeConfig[]>
/**
 * 获取预设主题
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
 * 按类别获取主题
 */
declare function getThemesByCategory(category: ThemeCategory): ThemeConfig[]
/**
 * 按标签获取主题
 */
declare function getThemesByTag(tag: string): ThemeConfig[]
/**
 * 获取节日主题
 */
declare function getFestivalTheme(
  festival: FestivalType
): ThemeConfig | undefined
/**
 * 获取当前季节推荐的主题
 */
declare function getSeasonalThemes(): ThemeConfig[]
/**
 * 获取随机预设主题
 */
declare function getRandomPresetTheme(): ThemeConfig
/**
 * 根据时间获取应该激活的主题
 */
declare function getActiveThemeByTime(date?: Date): ThemeConfig | undefined
/**
 * 搜索主题
 */
declare function searchThemes(query: string): ThemeConfig[]
/**
 * 获取主题统计信息
 */
declare function getThemeStats(): {
  total: number
  byCategory: Record<ThemeCategory, number>
  byFestival: Record<FestivalType, number>
  withAnimations: number
  withDecorations: number
  withSounds: number
}
/**
 * 验证主题配置
 */
declare function validateTheme(theme: ThemeConfig): {
  valid: boolean
  errors: string[]
}
/**
 * 创建自定义主题
 */
declare function createCustomTheme(
  name: string,
  displayName: string,
  options?: Partial<ThemeConfig>
): ThemeConfig
declare const defaultTheme: ThemeConfig
declare const recommendedThemes: ThemeConfig[]

export {
  createCustomTheme,
  defaultTheme,
  festivalThemes,
  getActiveThemeByTime,
  getFestivalTheme,
  getPresetTheme,
  getPresetThemeNames,
  getRandomPresetTheme,
  getSeasonalThemes,
  getThemeStats,
  getThemesByCategory,
  getThemesByTag,
  isPresetTheme,
  presetThemes,
  recommendedThemes,
  searchThemes,
  themesByCategory,
  themesByTag,
  validateTheme,
}
