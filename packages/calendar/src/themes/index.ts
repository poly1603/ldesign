/**
 * 主题系统入口文件
 * 
 * 导出所有主题和主题管理器
 */

// 导出主题管理器
export { ThemeManager } from './theme-manager'

// 导出内置主题
export { DefaultTheme } from './default'
export { DarkTheme } from './dark'
export { BlueTheme } from './blue'
export { GreenTheme } from './green'

// 导出主题类型
export type {
  CalendarTheme,
  IThemeManager,
  ThemeEvent,
  ThemeVariables,
  ThemeColors,
  ThemeFonts,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeAnimations,
  ThemeCalendarConfig,
} from '../types/theme'

/**
 * 内置主题列表
 */
import { DefaultTheme } from './default'
import { DarkTheme } from './dark'
import { BlueTheme } from './blue'
import { GreenTheme } from './green'
import type { CalendarTheme } from '../types/theme'

export const BUILTIN_THEMES: CalendarTheme[] = [
  DefaultTheme,
  DarkTheme,
  BlueTheme,
  GreenTheme,
]

/**
 * 主题名称映射
 */
export const THEME_NAMES = {
  DEFAULT: 'default',
  DARK: 'dark',
  BLUE: 'blue',
  GREEN: 'green',
} as const

/**
 * 主题显示名称映射
 */
export const THEME_DISPLAY_NAMES = {
  [THEME_NAMES.DEFAULT]: '默认主题',
  [THEME_NAMES.DARK]: '暗色主题',
  [THEME_NAMES.BLUE]: '蓝色主题',
  [THEME_NAMES.GREEN]: '绿色主题',
} as const

/**
 * 创建主题管理器实例
 * @param autoRegisterBuiltins 是否自动注册内置主题
 */
export function createThemeManager(autoRegisterBuiltins: boolean = true) {
  const themeManager = new ThemeManager()

  if (autoRegisterBuiltins) {
    // 注册所有内置主题
    BUILTIN_THEMES.forEach(theme => {
      try {
        themeManager.register(theme)
      } catch (error) {
        console.warn(`注册主题 ${theme.name} 失败:`, error)
      }
    })

    // 应用默认主题
    try {
      themeManager.apply(THEME_NAMES.DEFAULT)
    } catch (error) {
      console.warn('应用默认主题失败:', error)
    }
  }

  return themeManager
}

/**
 * 获取主题预览信息
 * @param theme 主题对象
 */
export function getThemePreview(theme: CalendarTheme) {
  return {
    name: theme.name,
    displayName: theme.displayName,
    description: theme.description,
    dark: theme.dark,
    primaryColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    textColor: theme.colors.text,
    preview: {
      header: theme.calendar?.header?.backgroundColor || theme.colors.surface,
      dateCell: theme.calendar?.dateCell?.backgroundColor || 'transparent',
      event: theme.calendar?.event?.backgroundColor || theme.colors.primary,
      border: theme.colors.border,
    },
  }
}

/**
 * 主题工具函数
 */
export const ThemeUtils = {
  /**
   * 检查是否为暗色主题
   */
  isDarkTheme(theme: CalendarTheme): boolean {
    return theme.dark === true
  },

  /**
   * 获取主题对比色
   */
  getContrastColor(color: string): string {
    // 简单的对比色计算
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  },

  /**
   * 生成主题CSS变量
   */
  generateCSSVariables(theme: CalendarTheme): Record<string, string> {
    const variables: Record<string, string> = {}

    // 颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      variables[`--ldesign-calendar-color-${key}`] = value
    })

    // 字体变量
    if (theme.fonts) {
      Object.entries(theme.fonts).forEach(([key, value]) => {
        variables[`--ldesign-calendar-font-${key}`] = String(value)
      })
    }

    // 间距变量
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        variables[`--ldesign-calendar-spacing-${key}`] = value
      })
    }

    // 圆角变量
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        variables[`--ldesign-calendar-border-radius-${key}`] = value
      })
    }

    // 阴影变量
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        variables[`--ldesign-calendar-shadow-${key}`] = value
      })
    }

    // 自定义变量
    if (theme.customVariables) {
      Object.entries(theme.customVariables).forEach(([key, value]) => {
        variables[key] = value
      })
    }

    return variables
  },

  /**
   * 验证主题配置
   */
  validateTheme(theme: Partial<CalendarTheme>): string[] {
    const errors: string[] = []

    if (!theme.name) {
      errors.push('主题名称不能为空')
    }

    if (!theme.colors) {
      errors.push('主题颜色配置不能为空')
    } else {
      const requiredColors = ['primary', 'background', 'text']
      requiredColors.forEach(color => {
        if (!theme.colors![color as keyof typeof theme.colors]) {
          errors.push(`缺少必需的颜色配置: ${color}`)
        }
      })
    }

    return errors
  },

  /**
   * 合并主题配置
   */
  mergeThemes(baseTheme: CalendarTheme, overrides: Partial<CalendarTheme>): CalendarTheme {
    return {
      ...baseTheme,
      ...overrides,
      colors: { ...baseTheme.colors, ...overrides.colors },
      fonts: { ...baseTheme.fonts, ...overrides.fonts },
      spacing: { ...baseTheme.spacing, ...overrides.spacing },
      borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
      shadows: { ...baseTheme.shadows, ...overrides.shadows },
      animations: { ...baseTheme.animations, ...overrides.animations },
      calendar: { ...baseTheme.calendar, ...overrides.calendar },
      customVariables: { ...baseTheme.customVariables, ...overrides.customVariables },
    }
  },
}
