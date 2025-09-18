/**
 * 主题入口文件
 * 导出所有内置主题
 */

// 主题管理器
export { ThemeManager } from '../src/core/theme-manager'

// 内置主题
export { defaultTheme } from './default'
export { darkTheme } from './dark'
export { lightTheme } from './light'

// 类型定义
export type * from '../src/types/theme'

/**
 * 内置主题注册表
 */
export const BUILTIN_THEMES = {
  default: defaultTheme,
  dark: darkTheme,
  light: lightTheme
} as const

/**
 * 主题类型定义
 */
export type BuiltinThemeName = keyof typeof BUILTIN_THEMES
export type BuiltinTheme = typeof BUILTIN_THEMES[BuiltinThemeName]

/**
 * 获取内置主题
 */
export function getBuiltinTheme(name: BuiltinThemeName) {
  return BUILTIN_THEMES[name]
}

/**
 * 获取所有内置主题
 */
export function getAllBuiltinThemes() {
  return Object.values(BUILTIN_THEMES)
}

/**
 * 检查是否为内置主题
 */
export function isBuiltinTheme(name: string): name is BuiltinThemeName {
  return name in BUILTIN_THEMES
}

/**
 * 获取内置主题名称列表
 */
export function getBuiltinThemeNames(): BuiltinThemeName[] {
  return Object.keys(BUILTIN_THEMES) as BuiltinThemeName[]
}

/**
 * 创建主题变体
 * 基于现有主题创建新的主题变体
 */
export function createThemeVariant(
  baseName: BuiltinThemeName,
  variantName: string,
  overrides: Partial<import('../src/types/theme').ThemeConfig>
): import('../src/types/theme').ITheme {
  const baseTheme = BUILTIN_THEMES[baseName]
  
  return {
    name: variantName,
    displayName: `${baseTheme.displayName} (变体)`,
    description: `基于 ${baseTheme.displayName} 的自定义变体`,
    version: '1.0.0',
    author: 'Custom',
    config: {
      ...baseTheme.config,
      ...overrides,
      variables: {
        ...baseTheme.config.variables,
        ...overrides.variables
      },
      responsive: overrides.responsive ? {
        ...baseTheme.config.responsive,
        ...overrides.responsive
      } : baseTheme.config.responsive
    }
  }
}

/**
 * 主题工具函数
 */
export const themeUtils = {
  /**
   * 从CSS变量值中提取颜色
   */
  extractColor(cssVar: string): string {
    if (cssVar.startsWith('var(')) {
      const varName = cssVar.slice(4, -1)
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    }
    return cssVar
  },

  /**
   * 将颜色转换为RGB值
   */
  colorToRgb(color: string): { r: number; g: number; b: number } | null {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = color
    const computedColor = ctx.fillStyle

    const match = computedColor.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (match) {
      return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16)
      }
    }

    return null
  },

  /**
   * 计算颜色的亮度
   */
  getLuminance(color: string): number {
    const rgb = this.colorToRgb(color)
    if (!rgb) return 0

    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  /**
   * 判断颜色是否为暗色
   */
  isDarkColor(color: string): boolean {
    return this.getLuminance(color) < 0.5
  },

  /**
   * 生成对比色
   */
  getContrastColor(backgroundColor: string): string {
    return this.isDarkColor(backgroundColor) ? '#ffffff' : '#000000'
  },

  /**
   * 调整颜色透明度
   */
  adjustOpacity(color: string, opacity: number): string {
    const rgb = this.colorToRgb(color)
    if (!rgb) return color

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
  },

  /**
   * 调整颜色亮度
   */
  adjustBrightness(color: string, amount: number): string {
    const rgb = this.colorToRgb(color)
    if (!rgb) return color

    const adjust = (value: number) => {
      const adjusted = value + (255 * amount)
      return Math.max(0, Math.min(255, Math.round(adjusted)))
    }

    return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`
  }
}

/**
 * 主题预设配置
 */
export const themePresets = {
  /**
   * 简约主题预设
   */
  minimal: {
    variables: {
      'controls-background': 'rgba(0, 0, 0, 0.3)',
      'button-border-radius': '50%',
      'progress-height': '2px',
      'progress-thumb-size': '8px'
    }
  },

  /**
   * 圆角主题预设
   */
  rounded: {
    variables: {
      'button-border-radius': '12px',
      'progress-thumb-size': '16px',
      'controls-border-radius': '12px'
    }
  },

  /**
   * 扁平主题预设
   */
  flat: {
    variables: {
      'button-border-radius': '0',
      'progress-thumb-size': '0',
      'controls-border-radius': '0',
      'shadow-small': 'none',
      'shadow-medium': 'none',
      'shadow-large': 'none'
    }
  },

  /**
   * 渐变主题预设
   */
  gradient: {
    variables: {
      'controls-background': 'linear-gradient(45deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4))',
      'progress-played-background': 'linear-gradient(90deg, var(--ldesign-brand-color), var(--ldesign-brand-color-hover))'
    }
  }
}

/**
 * 创建预设主题
 */
export function createPresetTheme(
  baseName: BuiltinThemeName,
  presetName: keyof typeof themePresets,
  customName?: string
) {
  const preset = themePresets[presetName]
  const name = customName || `${baseName}-${presetName}`
  
  return createThemeVariant(baseName, name, preset)
}
