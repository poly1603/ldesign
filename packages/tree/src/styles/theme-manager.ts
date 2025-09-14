/**
 * 主题管理器
 * 用于运行时主题切换和自定义
 */

export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 主题显示名称 */
  displayName: string
  /** 主题类型 */
  type: 'light' | 'dark' | 'auto'
  /** CSS变量 */
  variables: Record<string, string>
  /** 是否为内置主题 */
  builtin?: boolean
}

export interface ThemeManagerOptions {
  /** 默认主题 */
  defaultTheme?: string
  /** 是否自动检测系统主题 */
  autoDetect?: boolean
  /** 主题存储键名 */
  storageKey?: string
  /** 主题变化回调 */
  onChange?: (theme: ThemeConfig) => void
}

export class ThemeManager {
  private themes = new Map<string, ThemeConfig>()
  private currentTheme: string = 'default'
  private options: Required<ThemeManagerOptions>
  private mediaQuery?: MediaQueryList

  constructor(options: ThemeManagerOptions = {}) {
    this.options = {
      defaultTheme: 'default',
      autoDetect: true,
      storageKey: 'tree-theme',
      onChange: () => {},
      ...options,
    }

    this.initBuiltinThemes()
    this.initMediaQuery()
    this.loadTheme()
  }

  /**
   * 初始化内置主题
   */
  private initBuiltinThemes(): void {
    // 默认主题
    this.registerTheme({
      name: 'default',
      displayName: '默认',
      type: 'light',
      builtin: true,
      variables: {},
    })

    // 暗色主题
    this.registerTheme({
      name: 'dark',
      displayName: '暗色',
      type: 'dark',
      builtin: true,
      variables: {},
    })

    // 紧凑主题
    this.registerTheme({
      name: 'compact',
      displayName: '紧凑',
      type: 'light',
      builtin: true,
      variables: {},
    })

    // 舒适主题
    this.registerTheme({
      name: 'comfortable',
      displayName: '舒适',
      type: 'light',
      builtin: true,
      variables: {},
    })

    // 高对比度主题
    this.registerTheme({
      name: 'high-contrast',
      displayName: '高对比度',
      type: 'light',
      builtin: true,
      variables: {},
    })

    // 自动主题
    this.registerTheme({
      name: 'auto',
      displayName: '跟随系统',
      type: 'auto',
      builtin: true,
      variables: {},
    })
  }

  /**
   * 初始化媒体查询
   */
  private initMediaQuery(): void {
    if (typeof window === 'undefined') return

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.mediaQuery.addEventListener('change', this.handleMediaQueryChange.bind(this))
  }

  /**
   * 处理媒体查询变化
   */
  private handleMediaQueryChange(): void {
    if (this.currentTheme === 'auto') {
      this.applyTheme('auto')
    }
  }

  /**
   * 注册主题
   */
  registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.name, theme)
  }

  /**
   * 获取主题
   */
  getTheme(name: string): ThemeConfig | undefined {
    return this.themes.get(name)
  }

  /**
   * 获取所有主题
   */
  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values())
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig | undefined {
    return this.themes.get(this.currentTheme)
  }

  /**
   * 设置主题
   */
  setTheme(name: string): void {
    const theme = this.themes.get(name)
    if (!theme) {
      console.warn(`主题 "${name}" 不存在`)
      return
    }

    this.currentTheme = name
    this.applyTheme(name)
    this.saveTheme(name)
    this.options.onChange(theme)
  }

  /**
   * 应用主题
   */
  private applyTheme(name: string): void {
    if (typeof document === 'undefined') return

    const theme = this.themes.get(name)
    if (!theme) return

    const root = document.documentElement

    // 移除所有主题类
    this.themes.forEach((t) => {
      root.classList.remove(`tree-theme-${t.name}`)
      root.removeAttribute(`data-theme-${t.name}`)
    })

    // 处理自动主题
    if (name === 'auto') {
      const isDark = this.mediaQuery?.matches || false
      const actualTheme = isDark ? 'dark' : 'default'
      root.setAttribute('data-theme', actualTheme)
      root.classList.add(`tree-theme-${actualTheme}`)
      
      // 应用实际主题的变量
      const actualThemeConfig = this.themes.get(actualTheme)
      if (actualThemeConfig) {
        this.applyVariables(actualThemeConfig.variables)
      }
    } else {
      // 应用指定主题
      root.setAttribute('data-theme', name)
      root.classList.add(`tree-theme-${name}`)
      this.applyVariables(theme.variables)
    }
  }

  /**
   * 应用CSS变量
   */
  private applyVariables(variables: Record<string, string>): void {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  /**
   * 保存主题到本地存储
   */
  private saveTheme(name: string): void {
    if (typeof localStorage === 'undefined') return

    try {
      localStorage.setItem(this.options.storageKey, name)
    } catch (error) {
      console.warn('无法保存主题到本地存储:', error)
    }
  }

  /**
   * 从本地存储加载主题
   */
  private loadTheme(): void {
    if (typeof localStorage === 'undefined') {
      this.setTheme(this.options.defaultTheme)
      return
    }

    try {
      const savedTheme = localStorage.getItem(this.options.storageKey)
      const themeToUse = savedTheme && this.themes.has(savedTheme) 
        ? savedTheme 
        : this.options.defaultTheme

      this.setTheme(themeToUse)
    } catch (error) {
      console.warn('无法从本地存储加载主题:', error)
      this.setTheme(this.options.defaultTheme)
    }
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme()
    if (!currentTheme) return

    let nextTheme: string
    switch (currentTheme.name) {
      case 'default':
        nextTheme = 'dark'
        break
      case 'dark':
        nextTheme = 'default'
        break
      default:
        nextTheme = currentTheme.type === 'dark' ? 'default' : 'dark'
    }

    this.setTheme(nextTheme)
  }

  /**
   * 自定义CSS变量
   */
  customizeVariables(variables: Record<string, string>): void {
    this.applyVariables(variables)
  }

  /**
   * 重置CSS变量
   */
  resetVariables(): void {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const currentTheme = this.getCurrentTheme()
    
    // 清除所有自定义变量
    const computedStyle = getComputedStyle(root)
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i]
      if (property.startsWith('--tree-')) {
        root.style.removeProperty(property)
      }
    }

    // 重新应用当前主题变量
    if (currentTheme) {
      this.applyVariables(currentTheme.variables)
    }
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleMediaQueryChange.bind(this))
    }
  }
}

// 默认主题管理器实例
export const themeManager = new ThemeManager()

// 导出主题相关工具函数
export const themeUtils = {
  /**
   * 获取CSS变量值
   */
  getCSSVariable(name: string): string {
    if (typeof document === 'undefined') return ''
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  },

  /**
   * 设置CSS变量值
   */
  setCSSVariable(name: string, value: string): void {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty(name, value)
  },

  /**
   * 检测系统主题偏好
   */
  getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  },

  /**
   * 检测高对比度偏好
   */
  prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-contrast: high)').matches
  },

  /**
   * 检测减少动画偏好
   */
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
}
