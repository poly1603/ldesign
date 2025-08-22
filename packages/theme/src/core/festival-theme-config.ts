/**
 * @ldesign/theme - 节日主题配置系统
 *
 * 集成 @ldesign/color 包，为节日主题提供完整的颜色和挂件配置
 */

import type { ThemeConfig as ColorThemeConfig } from '@ldesign/color'
import type { WidgetConfig } from '../widgets/element-decorations'

/**
 * 节日主题配置接口
 */
export interface FestivalThemeConfig {
  /** 主题唯一标识 */
  id: string
  /** 主题显示名称 */
  name: string
  /** 主题描述 */
  description: string
  /** 主题版本 */
  version: string
  /** 主题作者 */
  author?: string

  /** 颜色主题配置（使用 @ldesign/color） */
  colorConfig: ColorThemeConfig

  /** 挂件配置列表 */
  widgets: WidgetConfig[]

  /** CSS 变量映射 */
  cssVariables: {
    /** 主要节日色彩变量 */
    '--festival-primary': string
    /** 次要节日色彩变量 */
    '--festival-secondary': string
    /** 强调色变量 */
    '--festival-accent': string
    /** 背景色变量 */
    '--festival-background': string
    /** 文本色变量 */
    '--festival-text': string
    /** 边框色变量 */
    '--festival-border': string
    /** 阴影色变量 */
    '--festival-shadow': string
    /** 自定义变量 */
    [key: string]: string
  }

  /** 动画配置 */
  animations?: {
    /** 动画名称 */
    name: string
    /** 动画持续时间 */
    duration: string
    /** 动画时间函数 */
    timingFunction: string
    /** 动画迭代次数 */
    iterationCount: string
    /** 动画方向 */
    direction?: string
    /** 动画延迟 */
    delay?: string
  }[]

  /** 响应式配置 */
  responsive?: {
    /** 移动端配置 */
    mobile?: {
      /** 是否在移动端启用 */
      enabled: boolean
      /** 移动端特定的挂件配置 */
      widgets?: Partial<WidgetConfig>[]
    }
    /** 平板端配置 */
    tablet?: {
      enabled: boolean
      widgets?: Partial<WidgetConfig>[]
    }
  }

  /** 主题元数据 */
  metadata?: {
    /** 主题标签 */
    tags: string[]
    /** 主题关键词 */
    keywords: string[]
    /** 预览图片 */
    preview?: string
    /** 缩略图 */
    thumbnail?: string
    /** 激活时间段 */
    activationPeriod?: {
      start: { month: number; day: number }
      end: { month: number; day: number }
    }
  }
}

/**
 * 创建节日主题配置的辅助函数
 */
export function createFestivalTheme(config: {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  widgets: WidgetConfig[]
  metadata?: FestivalThemeConfig['metadata']
}): FestivalThemeConfig {
  const {
    id,
    name,
    description,
    primaryColor,
    secondaryColor = primaryColor,
    accentColor = '#FFD700', // 默认金色作为强调色
    widgets,
    metadata,
  } = config

  // 创建颜色主题配置
  const colorConfig: ColorThemeConfig = {
    name: id,
    displayName: name,
    description,
    light: {
      primary: primaryColor,
      secondary: secondaryColor,
      success: '#16A34A',
      warning: '#F59E0B',
      danger: '#DC2626',
      gray: '#6B7280',
    },
    dark: {
      primary: adjustColorBrightness(primaryColor, 20),
      secondary: adjustColorBrightness(secondaryColor, 20),
      success: '#22C55E',
      warning: '#FBBF24',
      danger: '#EF4444',
      gray: '#9CA3AF',
    },
  }

  // 生成 CSS 变量
  const cssVariables = {
    '--festival-primary': primaryColor,
    '--festival-secondary': secondaryColor,
    '--festival-accent': accentColor,
    '--festival-background': 'var(--color-background-primary)',
    '--festival-text': 'var(--color-text-primary)',
    '--festival-border': 'var(--color-border)',
    '--festival-shadow': 'var(--shadow-medium)',
  }

  return {
    id,
    name,
    description,
    version: '1.0.0',
    colorConfig,
    widgets,
    cssVariables,
    metadata,
  }
}

/**
 * 调整颜色亮度的辅助函数
 */
function adjustColorBrightness(color: string, percent: number): string {
  // 简单的颜色亮度调整实现
  // 在实际项目中，可以使用更复杂的颜色处理库
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const factor = 1 + percent / 100
  const newR = Math.min(255, Math.round(r * factor))
  const newG = Math.min(255, Math.round(g * factor))
  const newB = Math.min(255, Math.round(b * factor))

  return `#${newR.toString(16).padStart(2, '0')}${newG
    .toString(16)
    .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * 验证节日主题配置
 */
export function validateFestivalTheme(config: FestivalThemeConfig): boolean {
  try {
    // 基本字段验证
    if (!config.id || !config.name || !config.description) {
      return false
    }

    // 颜色配置验证
    if (!config.colorConfig || !config.colorConfig.name) {
      return false
    }

    // 挂件配置验证
    if (!Array.isArray(config.widgets)) {
      return false
    }

    // CSS 变量验证
    if (!config.cssVariables || typeof config.cssVariables !== 'object') {
      return false
    }

    return true
  } catch (error) {
    console.error('Festival theme validation error:', error)
    return false
  }
}

/**
 * 合并节日主题配置
 */
export function mergeFestivalThemes(
  base: FestivalThemeConfig,
  override: Partial<FestivalThemeConfig>
): FestivalThemeConfig {
  return {
    ...base,
    ...override,
    colorConfig: {
      ...base.colorConfig,
      ...override.colorConfig,
    },
    widgets: override.widgets || base.widgets,
    cssVariables: {
      ...base.cssVariables,
      ...override.cssVariables,
    },
    metadata: {
      ...base.metadata,
      ...override.metadata,
    },
  }
}
