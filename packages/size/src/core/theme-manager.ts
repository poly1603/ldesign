/**
 * 主题管理系统
 */

import type { SizeMode } from '../types'

export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  shadow: string
}

export interface ThemeConfig {
  name: string
  colors: ThemeColors
  fontFamily?: string
  borderRadius?: string
  shadow?: {
    small: string
    medium: string
    large: string
  }
  transition?: {
    duration: string
    easing: string
  }
}

export interface ThemeManagerOptions {
  defaultTheme?: string
  themes?: Record<string, ThemeConfig>
  autoDetect?: boolean
  persist?: boolean
  storageKey?: string
}

/**
 * 预设主题
 */
export const PRESET_THEMES: Record<string, ThemeConfig> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    borderRadius: '0.375rem',
    shadow: {
      small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    transition: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    borderRadius: '0.375rem',
    shadow: {
      small: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    },
    transition: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  blue: {
    name: 'Blue',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0891b2',
      background: '#eff6ff',
      surface: '#dbeafe',
      text: '#1e3a8a',
      textSecondary: '#3730a3',
      border: '#93c5fd',
      shadow: 'rgba(37, 99, 235, 0.2)',
    },
    borderRadius: '0.5rem',
    shadow: {
      small: '0 1px 3px 0 rgba(37, 99, 235, 0.1)',
      medium: '0 4px 8px -1px rgba(37, 99, 235, 0.2)',
      large: '0 20px 30px -5px rgba(37, 99, 235, 0.3)',
    },
    transition: {
      duration: '250ms',
      easing: 'ease-in-out',
    },
  },
  green: {
    name: 'Green',
    colors: {
      primary: '#16a34a',
      secondary: '#84cc16',
      success: '#15803d',
      warning: '#ca8a04',
      error: '#b91c1c',
      info: '#0e7490',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      textSecondary: '#166534',
      border: '#86efac',
      shadow: 'rgba(34, 197, 94, 0.2)',
    },
    borderRadius: '0.375rem',
    shadow: {
      small: '0 1px 3px 0 rgba(34, 197, 94, 0.1)',
      medium: '0 4px 8px -1px rgba(34, 197, 94, 0.2)',
      large: '0 20px 30px -5px rgba(34, 197, 94, 0.3)',
    },
    transition: {
      duration: '200ms',
      easing: 'ease-out',
    },
  },
}

export class ThemeManager {
  private currentTheme: string = 'light'
  private themes: Map<string, ThemeConfig> = new Map()
  private options: ThemeManagerOptions
  private styleElement: HTMLStyleElement | null = null
  private listeners: Set<(theme: string) => void> = new Set()

  constructor(options: ThemeManagerOptions = {}) {
    this.options = {
      defaultTheme: 'light',
      autoDetect: true,
      persist: true,
      storageKey: 'ldesign-theme',
      ...options,
    }

    // 加载预设主题
    Object.entries(PRESET_THEMES).forEach(([key, config]) => {
      this.themes.set(key, config)
    })

    // 加载自定义主题
    if (options.themes) {
      Object.entries(options.themes).forEach(([key, config]) => {
        this.themes.set(key, config)
      })
    }

    this.init()
  }

  /**
   * 初始化
   */
  private init() {
    // 自动检测系统主题
    if (this.options.autoDetect && typeof window !== 'undefined') {
      this.detectSystemTheme()
    }

    // 从存储中恢复主题
    if (this.options.persist && typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(this.options.storageKey!)
      if (savedTheme && this.themes.has(savedTheme)) {
        this.currentTheme = savedTheme
      }
    }

    // 应用初始主题
    this.applyTheme(this.currentTheme)
  }

  /**
   * 检测系统主题
   */
  private detectSystemTheme() {
    if (typeof window === 'undefined')
      return

    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    this.currentTheme = isDarkMode ? 'dark' : 'light'

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.options.autoDetect) {
        this.setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  /**
   * 设置主题
   */
  setTheme(themeName: string) {
    if (!this.themes.has(themeName)) {
      console.warn(`Theme "${themeName}" not found`)
      return
    }

    this.currentTheme = themeName
    this.applyTheme(themeName)

    // 保存到存储
    if (this.options.persist && typeof window !== 'undefined') {
      localStorage.setItem(this.options.storageKey!, themeName)
    }

    // 通知监听器
    this.listeners.forEach(listener => listener(themeName))
  }

  /**
   * 应用主题
   */
  private applyTheme(themeName: string) {
    const theme = this.themes.get(themeName)
    if (!theme)
      return

    if (typeof document === 'undefined')
      return

    // 创建或更新样式元素
    if (!this.styleElement) {
      this.styleElement = document.createElement('style')
      this.styleElement.setAttribute('data-theme', 'ldesign')
      document.head.appendChild(this.styleElement)
    }

    // 生成CSS变量
    const css = this.generateThemeCSS(theme)
    this.styleElement.textContent = css

    // 设置HTML属性
    document.documentElement.setAttribute('data-theme', themeName)
  }

  /**
   * 生成主题CSS
   */
  private generateThemeCSS(theme: ThemeConfig): string {
    const lines: string[] = [':root {']

    // 颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      lines.push(`  --theme-color-${this.kebabCase(key)}: ${value};`)
    })

    // 字体
    if (theme.fontFamily) {
      lines.push(`  --theme-font-family: ${theme.fontFamily};`)
    }

    // 圆角
    if (theme.borderRadius) {
      lines.push(`  --theme-border-radius: ${theme.borderRadius};`)
    }

    // 阴影
    if (theme.shadow) {
      Object.entries(theme.shadow).forEach(([key, value]) => {
        lines.push(`  --theme-shadow-${key}: ${value};`)
      })
    }

    // 过渡
    if (theme.transition) {
      lines.push(`  --theme-transition-duration: ${theme.transition.duration};`)
      lines.push(`  --theme-transition-easing: ${theme.transition.easing};`)
    }

    lines.push('}')

    // 添加实用类
    lines.push(this.generateUtilityClasses(theme))

    return lines.join('\n')
  }

  /**
   * 生成实用类
   */
  private generateUtilityClasses(_theme: ThemeConfig): string {
    return `
/* Theme utility classes */
.theme-bg-primary { background-color: var(--theme-color-primary); }
.theme-bg-secondary { background-color: var(--theme-color-secondary); }
.theme-bg-success { background-color: var(--theme-color-success); }
.theme-bg-warning { background-color: var(--theme-color-warning); }
.theme-bg-error { background-color: var(--theme-color-error); }
.theme-bg-info { background-color: var(--theme-color-info); }
.theme-bg-background { background-color: var(--theme-color-background); }
.theme-bg-surface { background-color: var(--theme-color-surface); }

.theme-text-primary { color: var(--theme-color-primary); }
.theme-text-secondary { color: var(--theme-color-secondary); }
.theme-text-success { color: var(--theme-color-success); }
.theme-text-warning { color: var(--theme-color-warning); }
.theme-text-error { color: var(--theme-color-error); }
.theme-text-info { color: var(--theme-color-info); }
.theme-text { color: var(--theme-color-text); }
.theme-text-secondary { color: var(--theme-color-text-secondary); }

.theme-border { border-color: var(--theme-color-border); }
.theme-shadow-sm { box-shadow: var(--theme-shadow-small); }
.theme-shadow-md { box-shadow: var(--theme-shadow-medium); }
.theme-shadow-lg { box-shadow: var(--theme-shadow-large); }

.theme-rounded { border-radius: var(--theme-border-radius); }
.theme-transition { 
  transition-duration: var(--theme-transition-duration);
  transition-timing-function: var(--theme-transition-easing);
}
`
  }

  /**
   * 转换为 kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string {
    return this.currentTheme
  }

  /**
   * 获取主题配置
   */
  getTheme(themeName?: string): ThemeConfig | undefined {
    return this.themes.get(themeName || this.currentTheme)
  }

  /**
   * 获取所有主题
   */
  getAllThemes(): string[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 注册主题
   */
  registerTheme(name: string, config: ThemeConfig) {
    this.themes.set(name, config)
  }

  /**
   * 注销主题
   */
  unregisterTheme(name: string) {
    if (name === this.currentTheme) {
      console.warn('Cannot unregister current theme')
      return
    }
    this.themes.delete(name)
  }

  /**
   * 监听主题变化
   */
  onThemeChange(listener: (theme: string) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 创建主题相关的CSS变量（与尺寸模式结合）
   */
  generateSizeThemeCSS(sizeMode: SizeMode): string {
    const theme = this.getTheme()
    if (!theme)
      return ''

    const sizeMultipliers: Record<SizeMode, number> = {
      'small': 0.875,
      'medium': 1,
      'large': 1.125,
      'extra-large': 1.25,
    }

    const multiplier = sizeMultipliers[sizeMode]
    const lines: string[] = []

    // 根据尺寸模式调整某些主题值
    if (theme.borderRadius) {
      const baseRadius = Number.parseFloat(theme.borderRadius)
      lines.push(`--theme-border-radius-${sizeMode}: ${baseRadius * multiplier}rem;`)
    }

    return lines.join('\n')
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
    }
    this.listeners.clear()
  }
}

// 创建全局主题管理器实例
export const themeManager = new ThemeManager()

// 导出便捷方法
export function setTheme(theme: string) {
  themeManager.setTheme(theme)
}

export function getCurrentTheme(): string {
  return themeManager.getCurrentTheme()
}

export function registerTheme(name: string, config: ThemeConfig) {
  themeManager.registerTheme(name, config)
}

export function onThemeChange(listener: (theme: string) => void): () => void {
  return themeManager.onThemeChange(listener)
}
