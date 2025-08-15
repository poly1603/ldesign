/**
 * 节日主题配置 - 基于 @ldesign/color
 */

import {
  createCustomTheme,
  injectThemeVariables,
  type ThemeConfig,
  type ThemeManagerInstance,
  createThemeManager,
} from '@ldesign/color'

// 春节主题配置
export const springFestivalTheme: ThemeConfig = createCustomTheme(
  'spring-festival',
  '#dc2626', // 中国红
  {
    displayName: '春节主题',
    description: '传统中国红，喜庆祥和，充满节日氛围',
    darkPrimaryColor: '#ef4444',
    tags: ['节日', '传统', '喜庆'],
    category: 'festival',
  }
)

// 圣诞主题配置
export const christmasTheme: ThemeConfig = createCustomTheme(
  'christmas',
  '#16a34a', // 圣诞绿
  {
    displayName: '圣诞主题',
    description: '经典圣诞绿，温馨浪漫，带来节日温暖',
    darkPrimaryColor: '#22c55e',
    tags: ['节日', '西方', '温馨'],
    category: 'festival',
  }
)

// 默认主题配置
export const defaultTheme: ThemeConfig = createCustomTheme(
  'default',
  '#1890ff', // 经典蓝
  {
    displayName: '默认主题',
    description: '经典蓝色，专业稳重，适合日常使用',
    darkPrimaryColor: '#3b82f6',
    tags: ['经典', '专业', '稳重'],
    category: 'default',
  }
)

// 节日主题映射
export const festivalThemeMap = {
  default: defaultTheme,
  'spring-festival': springFestivalTheme,
  christmas: christmasTheme,
}

// 创建主题管理器实例
let themeManagerInstance: ThemeManagerInstance | null = null

export async function getFestivalThemeManager(): Promise<ThemeManagerInstance> {
  if (!themeManagerInstance) {
    themeManagerInstance = createThemeManager({
      themes: Object.values(festivalThemeMap),
      defaultTheme: 'default',
      autoInject: true,
    })
    await themeManagerInstance.init()
  }
  return themeManagerInstance
}

// 主题元数据
export interface FestivalThemeMetadata {
  name: string
  displayName: string
  description: string
  primary: string
  secondary: string
  accent: string
  background: string
  textColor: string
  widgets: string[]
  animations: string[]
  sounds?: string[]
}

// 完整的节日主题元数据 - 优化版
export const festivalThemeMetadata: Record<string, FestivalThemeMetadata> = {
  default: {
    name: 'default',
    displayName: '默认主题',
    description: '简洁优雅的默认主题，适合日常使用',
    primary: '#1890ff',
    secondary: '#722ed1',
    accent: '#52c41a',
    background:
      'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    textColor: '#1e293b',
    widgets: ['✨', '💫', '⭐', '🌟', '💎', '🔮'],
    animations: ['sparkle', 'float', 'twinkle', 'glow', 'shine', 'rotate'],
  },
  'spring-festival': {
    name: 'spring-festival',
    displayName: '春节主题',
    description: '传统中国红主题，充满节日喜庆氛围',
    primary: '#dc2626',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    background:
      'linear-gradient(135deg, #fef2f2 0%, #fff7ed 30%, #fef3c7 70%, #fecaca 100%)',
    textColor: '#7f1d1d',
    widgets: ['🏮', '🧧', '🎆', '🌸', '🐉', '💰', '🎭', '🥢'],
    animations: [
      'swing',
      'bounce',
      'explode',
      'fall',
      'fly',
      'spin',
      'fade',
      'float',
    ],
  },
  christmas: {
    name: 'christmas',
    displayName: '圣诞主题',
    description: '温馨的圣诞绿主题，带来节日温暖',
    primary: '#16a34a',
    secondary: '#dc2626',
    accent: '#fbbf24',
    background:
      'linear-gradient(135deg, #f0fdf4 0%, #fef2f2 30%, #f0fdf4 70%, #dcfce7 100%)',
    textColor: '#14532d',
    widgets: ['🎄', '🔔', '❄️', '🎁', '⭐', '🎅', '🦌', '🍪'],
    animations: [
      'grow',
      'ring',
      'snow',
      'bounce',
      'twinkle',
      'wave',
      'run',
      'rotate',
    ],
  },
}

/**
 * 获取主题的CSS变量
 */
export function getThemeCSSVariables(themeId: string): Record<string, string> {
  const metadata = festivalThemeMetadata[themeId]
  if (!metadata) return {}

  return {
    '--festival-primary': metadata.primary,
    '--festival-secondary': metadata.secondary,
    '--festival-accent': metadata.accent,
    '--festival-background': metadata.background,
    '--festival-text': metadata.textColor,
    '--festival-theme-name': `"${metadata.displayName}"`,
  }
}

/**
 * 应用主题CSS变量到文档
 */
export async function applyThemeCSSVariables(themeId: string): Promise<void> {
  try {
    // 获取主题管理器
    const manager = await getFestivalThemeManager()

    // 获取主题配置
    const themeConfig =
      festivalThemeMap[themeId as keyof typeof festivalThemeMap]
    if (!themeConfig) {
      console.warn(`主题 "${themeId}" 不存在`)
      return
    }

    // 应用主题到管理器
    await manager.setTheme(themeConfig.name)

    // 手动注入主题变量（确保变量被正确注入）
    injectThemeVariables(themeConfig, 'light')

    // 应用自定义节日变量
    const customVariables = getThemeCSSVariables(themeId)
    const root = document.documentElement

    Object.entries(customVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // 设置主题属性
    root.setAttribute('data-theme', themeId)
    root.setAttribute('data-festival-theme', themeId)

    // 添加主题类名
    root.className = root.className.replace(/theme-\w+/g, '')
    root.classList.add(`theme-${themeId}`)

    console.log(`✅ 主题 CSS 变量已应用: ${themeId}`)
  } catch (error) {
    console.error('❌ 应用主题 CSS 变量失败:', error)

    // 降级处理：直接设置自定义变量
    const variables = getThemeCSSVariables(themeId)
    const root = document.documentElement

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    root.setAttribute('data-theme', themeId)
    root.setAttribute('data-festival-theme', themeId)
  }
}

/**
 * 获取主题推荐 - 简化版本
 */
export function getThemeRecommendation(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // 春节期间 (农历正月，大约1月20日 - 2月20日)
  if ((month === 1 && day >= 20) || (month === 2 && day <= 20)) {
    return 'spring-festival'
  }

  // 圣诞节期间 (12月15日 - 12月31日)
  if (month === 12 && day >= 15) {
    return 'christmas'
  }

  return 'default'
}

/**
 * 获取所有可用主题
 */
export function getAvailableThemes(): FestivalThemeMetadata[] {
  return Object.values(festivalThemeMetadata)
}

/**
 * 根据ID获取主题元数据
 */
export function getThemeMetadata(
  themeId: string
): FestivalThemeMetadata | null {
  return festivalThemeMetadata[themeId] || null
}

/**
 * 检查主题是否存在
 */
export function isValidTheme(themeId: string): boolean {
  return themeId in festivalThemeMetadata
}

/**
 * 获取主题的对比色
 */
export function getThemeContrastColor(themeId: string): string {
  const metadata = festivalThemeMetadata[themeId]
  if (!metadata) return '#ffffff'

  // 简单的对比色计算
  const primary = metadata.primary
  const r = parseInt(primary.slice(1, 3), 16)
  const g = parseInt(primary.slice(3, 5), 16)
  const b = parseInt(primary.slice(5, 7), 16)

  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 128 ? '#000000' : '#ffffff'
}

export default {
  themes: festivalThemeMap,
  metadata: festivalThemeMetadata,
  getThemeCSSVariables,
  applyThemeCSSVariables,
  getThemeRecommendation,
  getAvailableThemes,
  getThemeMetadata,
  isValidTheme,
  getThemeContrastColor,
}
