/**
 * @ldesign/theme - 节日主题配置统一导出
 *
 * 统一管理所有节日主题配置
 */

// 导出类型定义
export type { FestivalThemeConfig } from '../../core/festival-theme-config'
export {
  createFestivalTheme,
  validateFestivalTheme,
  mergeFestivalThemes,
} from '../../core/festival-theme-config'

// 导出具体主题配置
export { default as defaultThemeConfig } from './default-config'
export { default as springFestivalThemeConfig } from './spring-festival-config'
export { default as christmasThemeConfig } from './christmas-config'

// 导入所有主题配置
import defaultThemeConfig from './default-config'
import springFestivalThemeConfig from './spring-festival-config'
import christmasThemeConfig from './christmas-config'

/**
 * 所有可用的节日主题配置
 */
export const allFestivalThemes = {
  default: defaultThemeConfig,
  'spring-festival': springFestivalThemeConfig,
  christmas: christmasThemeConfig,
} as const

/**
 * 支持的主题 ID 类型
 */
export type SupportedThemeId = keyof typeof allFestivalThemes

/**
 * 获取主题配置
 */
export function getThemeConfig(themeId: SupportedThemeId) {
  return allFestivalThemes[themeId]
}

/**
 * 获取所有主题配置
 */
export function getAllThemeConfigs() {
  return Object.values(allFestivalThemes)
}

/**
 * 获取所有支持的主题 ID
 */
export function getSupportedThemeIds(): SupportedThemeId[] {
  return Object.keys(allFestivalThemes) as SupportedThemeId[]
}

/**
 * 检查主题 ID 是否受支持
 */
export function isSupportedThemeId(
  themeId: string
): themeId is SupportedThemeId {
  return themeId in allFestivalThemes
}

/**
 * 根据当前日期获取推荐的主题
 */
export function getRecommendedTheme(): SupportedThemeId {
  const now = new Date()
  const month = now.getMonth() + 1 // getMonth() 返回 0-11
  const day = now.getDate()

  // 检查每个主题的激活时间段
  for (const [themeId, config] of Object.entries(allFestivalThemes)) {
    if (config.metadata?.activationPeriod) {
      const { start, end } = config.metadata.activationPeriod

      // 处理跨年的情况（如圣诞节 12月1日 - 1月6日）
      if (start.month > end.month) {
        if (
          (month === start.month && day >= start.day) ||
          (month === end.month && day <= end.day) ||
          month > start.month ||
          month < end.month
        ) {
          return themeId as SupportedThemeId
        }
      } else {
        // 同年内的时间段
        if (
          (month === start.month &&
            day >= start.day &&
            month === end.month &&
            day <= end.day) ||
          (month === start.month && day >= start.day && month < end.month) ||
          (month > start.month && month === end.month && day <= end.day) ||
          (month > start.month && month < end.month)
        ) {
          return themeId as SupportedThemeId
        }
      }
    }
  }

  // 如果没有匹配的节日主题，返回默认主题
  return 'default'
}

/**
 * 主题配置缓存
 */
const themeConfigCache = new Map<SupportedThemeId, any>()

/**
 * 获取缓存的主题配置
 */
export function getCachedThemeConfig(themeId: SupportedThemeId) {
  if (themeConfigCache.has(themeId)) {
    return themeConfigCache.get(themeId)
  }

  const config = getThemeConfig(themeId)
  themeConfigCache.set(themeId, config)
  return config
}

/**
 * 清除主题配置缓存
 */
export function clearThemeConfigCache(themeId?: SupportedThemeId) {
  if (themeId) {
    themeConfigCache.delete(themeId)
  } else {
    themeConfigCache.clear()
  }
}

/**
 * 预加载所有主题配置
 */
export function preloadAllThemeConfigs() {
  getSupportedThemeIds().forEach(themeId => {
    getCachedThemeConfig(themeId)
  })
}

/**
 * 主题配置验证
 */
export function validateAllThemeConfigs(): boolean {
  return getAllThemeConfigs().every(config => {
    try {
      return validateFestivalTheme(config)
    } catch (error) {
      console.error(`Theme validation failed for ${config.id}:`, error)
      return false
    }
  })
}
