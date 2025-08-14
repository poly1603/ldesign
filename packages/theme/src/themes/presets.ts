/**
 * @ldesign/theme - 主题预设
 *
 * 提供所有预设主题的统一管理和导出
 */

import type { ThemeConfig, ThemeCategory, FestivalType } from '../core/types'
import { christmasTheme } from './festivals/christmas'
import { springFestivalTheme } from './festivals/spring-festival'
import { halloweenTheme } from './festivals/halloween'

/**
 * 所有预设主题
 */
export const presetThemes: ThemeConfig[] = [
  christmasTheme,
  springFestivalTheme,
  halloweenTheme,
]

/**
 * 节日主题映射
 */
export const festivalThemes: Record<FestivalType, ThemeConfig> = {
  christmas: christmasTheme,
  'spring-festival': springFestivalTheme,
  halloween: halloweenTheme,
  valentine: christmasTheme, // 暂时使用圣诞节主题
  easter: springFestivalTheme, // 暂时使用春节主题
  thanksgiving: halloweenTheme, // 暂时使用万圣节主题
}

/**
 * 按类别分组的主题
 */
export const themesByCategory: Record<ThemeCategory, ThemeConfig[]> = {
  festival: [christmasTheme, springFestivalTheme, halloweenTheme],
  seasonal: [],
  custom: [],
  business: [],
}

/**
 * 主题标签映射
 */
export const themesByTag: Record<string, ThemeConfig[]> = {
  // 节日标签
  festival: [christmasTheme, springFestivalTheme, halloweenTheme],
  christmas: [christmasTheme],
  'spring-festival': [springFestivalTheme],
  'chinese-new-year': [springFestivalTheme],
  halloween: [halloweenTheme],

  // 颜色标签
  red: [christmasTheme, springFestivalTheme],
  green: [christmasTheme],
  gold: [springFestivalTheme],
  orange: [halloweenTheme],
  black: [halloweenTheme],

  // 季节标签
  winter: [christmasTheme],
  spring: [springFestivalTheme],
  autumn: [halloweenTheme],

  // 装饰标签
  snow: [christmasTheme],
  lantern: [springFestivalTheme],
  pumpkin: [halloweenTheme],

  // 动画标签
  falling: [christmasTheme, springFestivalTheme],
  floating: [halloweenTheme],
  glowing: [christmasTheme, springFestivalTheme, halloweenTheme],
}

/**
 * 获取预设主题
 */
export function getPresetTheme(name: string): ThemeConfig | undefined {
  return presetThemes.find(theme => theme.name === name)
}

/**
 * 获取所有预设主题名称
 */
export function getPresetThemeNames(): string[] {
  return presetThemes.map(theme => theme.name)
}

/**
 * 检查是否为预设主题
 */
export function isPresetTheme(name: string): boolean {
  return presetThemes.some(theme => theme.name === name)
}

/**
 * 按类别获取主题
 */
export function getThemesByCategory(category: ThemeCategory): ThemeConfig[] {
  return themesByCategory[category] || []
}

/**
 * 按标签获取主题
 */
export function getThemesByTag(tag: string): ThemeConfig[] {
  return themesByTag[tag] || []
}

/**
 * 获取节日主题
 */
export function getFestivalTheme(
  festival: FestivalType
): ThemeConfig | undefined {
  return festivalThemes[festival]
}

/**
 * 获取当前季节推荐的主题
 */
export function getSeasonalThemes(): ThemeConfig[] {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12

  // 根据月份推荐主题
  if (month === 12 || month === 1) {
    return [christmasTheme]
  } else if (month === 2) {
    return [springFestivalTheme]
  } else if (month === 10) {
    return [halloweenTheme]
  }

  return []
}

/**
 * 获取随机预设主题
 */
export function getRandomPresetTheme(): ThemeConfig {
  const randomIndex = Math.floor(Math.random() * presetThemes.length)
  return presetThemes[randomIndex]
}

/**
 * 根据时间获取应该激活的主题
 */
export function getActiveThemeByTime(
  date: Date = new Date()
): ThemeConfig | undefined {
  for (const theme of presetThemes) {
    if (theme.timeRange && isInTimeRange(date, theme.timeRange)) {
      return theme
    }
  }
  return undefined
}

/**
 * 检查日期是否在时间范围内
 */
function isInTimeRange(
  date: Date,
  timeRange: { start: string; end: string }
): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const currentDate = `${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`

  const { start, end } = timeRange

  // 处理跨年的情况（如圣诞节主题：12-01 到 01-07）
  if (start > end) {
    return currentDate >= start || currentDate <= end
  } else {
    return currentDate >= start && currentDate <= end
  }
}

/**
 * 搜索主题
 */
export function searchThemes(query: string): ThemeConfig[] {
  const lowerQuery = query.toLowerCase()

  return presetThemes.filter(theme => {
    // 搜索名称
    if (theme.name.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // 搜索显示名称
    if (theme.displayName.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // 搜索描述
    if (theme.description?.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // 搜索标签
    if (theme.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      return true
    }

    // 搜索类别
    if (theme.category.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // 搜索节日类型
    if (theme.festival?.toLowerCase().includes(lowerQuery)) {
      return true
    }

    return false
  })
}

/**
 * 获取主题统计信息
 */
export function getThemeStats() {
  const stats = {
    total: presetThemes.length,
    byCategory: {} as Record<ThemeCategory, number>,
    byFestival: {} as Record<FestivalType, number>,
    withAnimations: 0,
    withDecorations: 0,
    withSounds: 0,
  }

  // 统计各类别主题数量
  for (const category of Object.keys(themesByCategory) as ThemeCategory[]) {
    stats.byCategory[category] = themesByCategory[category].length
  }

  // 统计各节日主题数量
  for (const festival of Object.keys(festivalThemes) as FestivalType[]) {
    if (festivalThemes[festival]) {
      stats.byFestival[festival] = 1
    }
  }

  // 统计功能特性
  for (const theme of presetThemes) {
    if (theme.animations.length > 0) {
      stats.withAnimations++
    }
    if (theme.decorations.length > 0) {
      stats.withDecorations++
    }
    if (
      theme.resources.sounds &&
      Object.keys(theme.resources.sounds).length > 0
    ) {
      stats.withSounds++
    }
  }

  return stats
}

/**
 * 验证主题配置
 */
export function validateTheme(theme: ThemeConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 检查必需字段
  if (!theme.name) {
    errors.push('Theme name is required')
  }

  if (!theme.displayName) {
    errors.push('Theme displayName is required')
  }

  if (!theme.version) {
    errors.push('Theme version is required')
  }

  if (!theme.colors) {
    errors.push('Theme colors configuration is required')
  }

  // 检查装饰元素
  for (const decoration of theme.decorations) {
    if (!decoration.id) {
      errors.push(`Decoration missing id: ${decoration.name}`)
    }

    if (!decoration.src) {
      errors.push(`Decoration missing src: ${decoration.id}`)
    }
  }

  // 检查动画配置
  for (const animation of theme.animations) {
    if (!animation.name) {
      errors.push('Animation missing name')
    }

    if (!animation.duration || animation.duration <= 0) {
      errors.push(`Invalid animation duration: ${animation.name}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 创建自定义主题
 */
export function createCustomTheme(
  name: string,
  displayName: string,
  options: Partial<ThemeConfig> = {}
): ThemeConfig {
  return {
    name,
    displayName,
    description: options.description || `自定义主题：${displayName}`,
    category: 'custom',
    version: '1.0.0',
    author: 'User',
    colors: options.colors || christmasTheme.colors, // 使用默认颜色
    decorations: options.decorations || [],
    animations: options.animations || [],
    resources: options.resources || { images: {}, icons: {} },
    tags: options.tags || ['custom'],
    ...options,
  }
}

// 导出默认主题（圣诞节主题）
export const defaultTheme = christmasTheme

// 导出推荐主题列表
export const recommendedThemes = [
  christmasTheme,
  springFestivalTheme,
  halloweenTheme,
]
