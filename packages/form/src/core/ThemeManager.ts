// 主题管理器

import type {
  ThemeConfig,
  ThemeManager as IThemeManager,
  ThemeType,
} from '../types/theme'
import { SimpleEventEmitter } from '../utils/event'
import { deepClone, deepMerge } from '../utils/common'

/**
 * 默认主题配置
 */
const defaultTheme: ThemeConfig = {
  name: 'default',
  type: 'light',
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff',
    text: {
      primary: '#262626',
      secondary: '#595959',
      disabled: '#bfbfbf',
      placeholder: '#bfbfbf',
      link: '#1890ff',
    },
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      hover: '#f5f5f5',
      active: '#e6f7ff',
      disabled: '#f5f5f5',
    },
    border: {
      default: '#d9d9d9',
      hover: '#40a9ff',
      active: '#1890ff',
      error: '#f5222d',
      success: '#52c41a',
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 600,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    base: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  border: {
    width: '1px',
    style: 'solid',
    radius: {
      none: '0',
      sm: '2px',
      base: '4px',
      lg: '8px',
      full: '50%',
    },
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    enabled: true,
  },
}

/**
 * 暗色主题配置
 */
const darkTheme: ThemeConfig = {
  ...defaultTheme,
  name: 'dark',
  type: 'dark',
  colors: {
    ...defaultTheme.colors,
    text: {
      primary: '#ffffff',
      secondary: '#a6a6a6',
      disabled: '#595959',
      placeholder: '#595959',
      link: '#40a9ff',
    },
    background: {
      primary: '#141414',
      secondary: '#1f1f1f',
      hover: '#262626',
      active: '#111b26',
      disabled: '#262626',
    },
    border: {
      default: '#434343',
      hover: '#40a9ff',
      active: '#1890ff',
      error: '#f5222d',
      success: '#52c41a',
    },
  },
}

/**
 * 主题管理器实现
 */
export class ThemeManager extends SimpleEventEmitter implements IThemeManager {
  private currentTheme: ThemeConfig = defaultTheme
  private registeredThemes: Map<string, ThemeConfig> = new Map()
  private appliedCssVars: Set<string> = new Set()

  constructor() {
    super()

    // 注册默认主题
    this.registerTheme('default', defaultTheme)
    this.registerTheme('dark', darkTheme)

    // 应用默认主题
    this.setTheme(defaultTheme)
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeConfig): void {
    const oldTheme = this.currentTheme
    this.currentTheme = deepClone(theme)

    // 应用主题样式
    this.applyThemeStyles(theme)

    this.emit('themeChanged', theme, oldTheme)
  }

  /**
   * 获取当前主题
   */
  getTheme(): ThemeConfig {
    return deepClone(this.currentTheme)
  }

  /**
   * 切换主题类型
   */
  toggleTheme(): void {
    const currentType = this.currentTheme.type || 'light'
    const newType: ThemeType = currentType === 'light' ? 'dark' : 'light'

    const newTheme =
      this.registeredThemes.get(newType) ||
      (newType === 'dark' ? darkTheme : defaultTheme)

    this.setTheme(newTheme)
  }

  /**
   * 注册主题
   */
  registerTheme(name: string, theme: ThemeConfig): void {
    // 与默认主题合并
    const mergedTheme = deepMerge(deepClone(defaultTheme), theme)
    mergedTheme.name = name

    this.registeredThemes.set(name, mergedTheme)
    this.emit('themeRegistered', name, mergedTheme)
  }

  /**
   * 获取注册的主题
   */
  getRegisteredTheme(name: string): ThemeConfig | undefined {
    const theme = this.registeredThemes.get(name)
    return theme ? deepClone(theme) : undefined
  }

  /**
   * 应用CSS变量
   */
  applyCssVars(vars: Record<string, string>): void {
    const root = document.documentElement

    Object.entries(vars).forEach(([key, value]) => {
      const cssVar = key.startsWith('--') ? key : `--${key}`
      root.style.setProperty(cssVar, value)
      this.appliedCssVars.add(cssVar)
    })

    this.emit('cssVarsApplied', vars)
  }

  /**
   * 移除CSS变量
   */
  removeCssVars(keys: string[]): void {
    const root = document.documentElement

    keys.forEach(key => {
      const cssVar = key.startsWith('--') ? key : `--${key}`
      root.style.removeProperty(cssVar)
      this.appliedCssVars.delete(cssVar)
    })

    this.emit('cssVarsRemoved', keys)
  }

  /**
   * 应用主题样式
   */
  private applyThemeStyles(theme: ThemeConfig): void {
    const cssVars = this.generateCssVars(theme)

    // 清除之前的CSS变量
    this.removeCssVars(Array.from(this.appliedCssVars))

    // 应用新的CSS变量
    this.applyCssVars(cssVars)

    // 应用自定义CSS变量
    if (theme.cssVars) {
      this.applyCssVars(theme.cssVars)
    }
  }

  /**
   * 生成CSS变量
   */
  private generateCssVars(theme: ThemeConfig): Record<string, string> {
    const vars: Record<string, string> = {}

    // 颜色变量
    if (theme.colors) {
      vars['--form-color-primary'] = theme.colors.primary || ''
      vars['--form-color-success'] = theme.colors.success || ''
      vars['--form-color-warning'] = theme.colors.warning || ''
      vars['--form-color-error'] = theme.colors.error || ''
      vars['--form-color-info'] = theme.colors.info || ''

      if (theme.colors.text) {
        vars['--form-text-primary'] = theme.colors.text.primary || ''
        vars['--form-text-secondary'] = theme.colors.text.secondary || ''
        vars['--form-text-disabled'] = theme.colors.text.disabled || ''
        vars['--form-text-placeholder'] = theme.colors.text.placeholder || ''
        vars['--form-text-link'] = theme.colors.text.link || ''
      }

      if (theme.colors.background) {
        vars['--form-bg-primary'] = theme.colors.background.primary || ''
        vars['--form-bg-secondary'] = theme.colors.background.secondary || ''
        vars['--form-bg-hover'] = theme.colors.background.hover || ''
        vars['--form-bg-active'] = theme.colors.background.active || ''
        vars['--form-bg-disabled'] = theme.colors.background.disabled || ''
      }

      if (theme.colors.border) {
        vars['--form-border-default'] = theme.colors.border.default || ''
        vars['--form-border-hover'] = theme.colors.border.hover || ''
        vars['--form-border-active'] = theme.colors.border.active || ''
        vars['--form-border-error'] = theme.colors.border.error || ''
        vars['--form-border-success'] = theme.colors.border.success || ''
      }
    }

    // 字体变量
    if (theme.typography) {
      vars['--form-font-family'] = theme.typography.fontFamily || ''

      if (theme.typography.fontSize) {
        vars['--form-font-size-xs'] = theme.typography.fontSize.xs || ''
        vars['--form-font-size-sm'] = theme.typography.fontSize.sm || ''
        vars['--form-font-size-base'] = theme.typography.fontSize.base || ''
        vars['--form-font-size-lg'] = theme.typography.fontSize.lg || ''
        vars['--form-font-size-xl'] = theme.typography.fontSize.xl || ''
        vars['--form-font-size-xxl'] = theme.typography.fontSize.xxl || ''
      }

      if (theme.typography.fontWeight) {
        vars['--form-font-weight-light'] = String(
          theme.typography.fontWeight.light || ''
        )
        vars['--form-font-weight-normal'] = String(
          theme.typography.fontWeight.normal || ''
        )
        vars['--form-font-weight-medium'] = String(
          theme.typography.fontWeight.medium || ''
        )
        vars['--form-font-weight-bold'] = String(
          theme.typography.fontWeight.bold || ''
        )
      }

      if (theme.typography.lineHeight) {
        vars['--form-line-height-tight'] = String(
          theme.typography.lineHeight.tight || ''
        )
        vars['--form-line-height-normal'] = String(
          theme.typography.lineHeight.normal || ''
        )
        vars['--form-line-height-loose'] = String(
          theme.typography.lineHeight.loose || ''
        )
      }
    }

    // 间距变量
    if (theme.spacing) {
      vars['--form-spacing-xs'] = theme.spacing.xs || ''
      vars['--form-spacing-sm'] = theme.spacing.sm || ''
      vars['--form-spacing-base'] = theme.spacing.base || ''
      vars['--form-spacing-lg'] = theme.spacing.lg || ''
      vars['--form-spacing-xl'] = theme.spacing.xl || ''
      vars['--form-spacing-xxl'] = theme.spacing.xxl || ''
    }

    // 边框变量
    if (theme.border) {
      vars['--form-border-width'] = theme.border.width || ''
      vars['--form-border-style'] = theme.border.style || ''

      if (theme.border.radius) {
        vars['--form-border-radius-none'] = theme.border.radius.none || ''
        vars['--form-border-radius-sm'] = theme.border.radius.sm || ''
        vars['--form-border-radius-base'] = theme.border.radius.base || ''
        vars['--form-border-radius-lg'] = theme.border.radius.lg || ''
        vars['--form-border-radius-full'] = theme.border.radius.full || ''
      }
    }

    // 阴影变量
    if (theme.shadow) {
      vars['--form-shadow-none'] = theme.shadow.none || ''
      vars['--form-shadow-sm'] = theme.shadow.sm || ''
      vars['--form-shadow-base'] = theme.shadow.base || ''
      vars['--form-shadow-lg'] = theme.shadow.lg || ''
      vars['--form-shadow-xl'] = theme.shadow.xl || ''
    }

    // 动画变量
    if (theme.animation) {
      if (theme.animation.duration) {
        vars['--form-animation-duration-fast'] =
          theme.animation.duration.fast || ''
        vars['--form-animation-duration-normal'] =
          theme.animation.duration.normal || ''
        vars['--form-animation-duration-slow'] =
          theme.animation.duration.slow || ''
      }

      if (theme.animation.easing) {
        vars['--form-animation-easing-linear'] =
          theme.animation.easing.linear || ''
        vars['--form-animation-easing-ease-in'] =
          theme.animation.easing.easeIn || ''
        vars['--form-animation-easing-ease-out'] =
          theme.animation.easing.easeOut || ''
        vars['--form-animation-easing-ease-in-out'] =
          theme.animation.easing.easeInOut || ''
      }
    }

    return vars
  }

  /**
   * 获取所有注册的主题名称
   */
  getRegisteredThemeNames(): string[] {
    return Array.from(this.registeredThemes.keys())
  }

  /**
   * 移除注册的主题
   */
  removeRegisteredTheme(name: string): void {
    if (this.registeredThemes.has(name)) {
      this.registeredThemes.delete(name)
      this.emit('themeRemoved', name)
    }
  }

  /**
   * 检查主题是否存在
   */
  hasTheme(name: string): boolean {
    return this.registeredThemes.has(name)
  }

  /**
   * 获取主题统计信息
   */
  getStats(): {
    currentTheme: string
    registeredThemes: number
    appliedCssVars: number
    themeType: ThemeType
  } {
    return {
      currentTheme: this.currentTheme.name || 'unknown',
      registeredThemes: this.registeredThemes.size,
      appliedCssVars: this.appliedCssVars.size,
      themeType: this.currentTheme.type || 'light',
    }
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    // 清除所有CSS变量
    this.removeCssVars(Array.from(this.appliedCssVars))

    this.registeredThemes.clear()
    this.appliedCssVars.clear()
    this.removeAllListeners()
  }
}
