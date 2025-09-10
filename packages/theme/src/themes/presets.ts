/**
 * 主题预设和工具函数
 * 
 * 提供主题搜索、验证和管理功能
 */

import type { FestivalThemeConfig, FestivalType } from '../core/types'
import { 
  springFestivalTheme,
  christmasTheme,
  halloweenTheme,
  valentinesDayTheme,
  midAutumnTheme,
  defaultTheme
} from './index'

/**
 * 所有预设主题的集合
 */
export const allThemes: FestivalThemeConfig[] = [
  defaultTheme,
  springFestivalTheme,
  christmasTheme,
  halloweenTheme,
  valentinesDayTheme,
  midAutumnTheme
]

/**
 * 主题映射表，用于快速查找
 */
export const themeMap = new Map<string, FestivalThemeConfig>(
  allThemes.map(theme => [theme.name, theme])
)

/**
 * 根据节日类型获取主题配置
 * 
 * @param festival 节日类型
 * @returns 主题配置，如果未找到则返回默认主题
 */
export function getThemeByFestival(festival: FestivalType): FestivalThemeConfig {
  const theme = themeMap.get(festival)
  return theme || defaultTheme
}

/**
 * 搜索主题
 * 
 * @param query 搜索关键词
 * @returns 匹配的主题列表
 */
export function searchThemes(query: string): FestivalThemeConfig[] {
  const lowerQuery = query.toLowerCase()
  
  return allThemes.filter(theme => {
    // 搜索主题名称
    if (theme.name.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    // 搜索显示名称
    if (theme.displayName.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    // 搜索描述
    if (theme.description.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    // 搜索标签
    if (theme.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      return true
    }
    
    return false
  })
}

/**
 * 验证主题配置
 * 
 * @param theme 主题配置
 * @returns 验证结果
 */
export function validateTheme(theme: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 检查必需字段
  if (!theme.name || typeof theme.name !== 'string') {
    errors.push('主题名称是必需的且必须是字符串')
  }
  
  if (!theme.displayName || typeof theme.displayName !== 'string') {
    errors.push('显示名称是必需的且必须是字符串')
  }
  
  if (!theme.description || typeof theme.description !== 'string') {
    errors.push('描述是必需的且必须是字符串')
  }
  
  if (!theme.category || typeof theme.category !== 'string') {
    errors.push('分类是必需的且必须是字符串')
  }
  
  if (!theme.version || typeof theme.version !== 'string') {
    errors.push('版本是必需的且必须是字符串')
  }
  
  if (!theme.author || typeof theme.author !== 'string') {
    errors.push('作者是必需的且必须是字符串')
  }
  
  // 检查颜色配置
  if (!theme.colors || typeof theme.colors !== 'object') {
    errors.push('颜色配置是必需的且必须是对象')
  } else {
    if (!theme.colors.name || typeof theme.colors.name !== 'string') {
      errors.push('颜色配置名称是必需的')
    }
    
    if (!theme.colors.light || typeof theme.colors.light !== 'object') {
      errors.push('浅色模式颜色配置是必需的')
    }
    
    if (!theme.colors.dark || typeof theme.colors.dark !== 'object') {
      errors.push('深色模式颜色配置是必需的')
    }
  }
  
  // 检查装饰配置
  if (!Array.isArray(theme.decorations)) {
    errors.push('装饰配置必须是数组')
  }
  
  // 检查动画配置
  if (!Array.isArray(theme.animations)) {
    errors.push('动画配置必须是数组')
  }
  
  // 检查资源配置
  if (!theme.resources || typeof theme.resources !== 'object') {
    errors.push('资源配置是必需的且必须是对象')
  } else {
    if (!theme.resources.images || typeof theme.resources.images !== 'object') {
      errors.push('图片资源配置是必需的')
    }
    
    if (!theme.resources.icons || typeof theme.resources.icons !== 'object') {
      errors.push('图标资源配置是必需的')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 根据分类获取主题
 * 
 * @param category 分类名称
 * @returns 该分类下的主题列表
 */
export function getThemesByCategory(category: string): FestivalThemeConfig[] {
  return allThemes.filter(theme => theme.category === category)
}

/**
 * 获取所有分类
 * 
 * @returns 分类列表
 */
export function getAllCategories(): string[] {
  const categories = new Set(allThemes.map(theme => theme.category))
  return Array.from(categories)
}

/**
 * 根据标签获取主题
 * 
 * @param tag 标签名称
 * @returns 包含该标签的主题列表
 */
export function getThemesByTag(tag: string): FestivalThemeConfig[] {
  return allThemes.filter(theme => theme.tags?.includes(tag))
}

/**
 * 获取所有标签
 * 
 * @returns 标签列表
 */
export function getAllTags(): string[] {
  const tags = new Set<string>()
  allThemes.forEach(theme => {
    theme.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
}

/**
 * 获取推荐主题
 * 
 * @param currentTheme 当前主题名称
 * @returns 推荐主题列表
 */
export function getRecommendedThemes(currentTheme?: string): FestivalThemeConfig[] {
  // 简单的推荐逻辑：排除当前主题，返回其他主题
  return allThemes.filter(theme => theme.name !== currentTheme).slice(0, 3)
}

/**
 * 检查主题是否存在
 * 
 * @param themeName 主题名称
 * @returns 是否存在
 */
export function themeExists(themeName: string): boolean {
  return themeMap.has(themeName)
}

/**
 * 获取主题统计信息
 * 
 * @returns 统计信息
 */
export function getThemeStats() {
  const categories = getAllCategories()
  const tags = getAllTags()
  
  return {
    totalThemes: allThemes.length,
    categories: categories.length,
    tags: tags.length,
    categoriesBreakdown: categories.map(category => ({
      name: category,
      count: getThemesByCategory(category).length
    })),
    tagsBreakdown: tags.map(tag => ({
      name: tag,
      count: getThemesByTag(tag).length
    }))
  }
}
