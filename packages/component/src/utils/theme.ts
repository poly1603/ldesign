/**
 * 主题切换工具函数
 * 
 * 提供主题切换、主题检测、主题持久化等功能
 * 支持亮色主题、暗色主题、高对比度主题
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 支持的主题类型
 */
export type ThemeType = 'light' | 'dark' | 'high-contrast' | 'auto'

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题类型 */
  theme: ThemeType
  /** 是否启用过渡动画 */
  enableTransition?: boolean
  /** 是否持久化主题设置 */
  persistent?: boolean
  /** 本地存储键名 */
  storageKey?: string
}

/**
 * 主题变更事件接口
 */
export interface ThemeChangeEvent {
  /** 新主题 */
  theme: ThemeType
  /** 旧主题 */
  previousTheme: ThemeType
  /** 是否由系统偏好触发 */
  isSystemTriggered: boolean
}

/**
 * 主题变更监听器类型
 */
export type ThemeChangeListener = (event: ThemeChangeEvent) => void

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<Omit<ThemeConfig, 'theme'>> = {
  enableTransition: true,
  persistent: true,
  storageKey: 'ldesign-theme'
}

/**
 * 主题管理器类
 */
class ThemeManager {
  private currentTheme: ThemeType = 'auto'
  private config: Required<ThemeConfig>
  private listeners: Set<ThemeChangeListener> = new Set()
  private mediaQuery: MediaQueryList | null = null
  private isInitialized = false

  constructor(config: ThemeConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.currentTheme = config.theme
  }

  /**
   * 初始化主题管理器
   */
  init(): void {
    if (this.isInitialized) return

    // 从本地存储恢复主题设置
    if (this.config.persistent) {
      const savedTheme = this.getStoredTheme()
      if (savedTheme) {
        this.currentTheme = savedTheme
      }
    }

    // 监听系统主题变化
    this.setupSystemThemeListener()

    // 应用初始主题
    this.applyTheme(this.currentTheme)

    this.isInitialized = true
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeType): void {
    const previousTheme = this.currentTheme
    this.currentTheme = theme

    // 应用主题
    this.applyTheme(theme)

    // 持久化主题设置
    if (this.config.persistent) {
      this.storeTheme(theme)
    }

    // 触发主题变更事件
    this.notifyThemeChange({
      theme,
      previousTheme,
      isSystemTriggered: false
    })
  }

  /**
   * 获取当前主题
   */
  getTheme(): ThemeType {
    return this.currentTheme
  }

  /**
   * 获取实际应用的主题（解析 auto）
   */
  getResolvedTheme(): Exclude<ThemeType, 'auto'> {
    if (this.currentTheme === 'auto') {
      return this.getSystemTheme()
    }
    return this.currentTheme as Exclude<ThemeType, 'auto'>
  }

  /**
   * 切换主题（在 light 和 dark 之间切换）
   */
  toggleTheme(): void {
    const resolvedTheme = this.getResolvedTheme()
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
  }

  /**
   * 添加主题变更监听器
   */
  addListener(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener)
    
    // 返回移除监听器的函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 移除主题变更监听器
   */
  removeListener(listener: ThemeChangeListener): void {
    this.listeners.delete(listener)
  }

  /**
   * 检查是否支持暗色主题
   */
  supportsDarkMode(): boolean {
    return typeof window !== 'undefined' && 
           window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * 检查是否支持高对比度
   */
  supportsHighContrast(): boolean {
    return typeof window !== 'undefined' && 
           window.matchMedia && 
           window.matchMedia('(prefers-contrast: high)').matches
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange)
    }
    this.listeners.clear()
    this.isInitialized = false
  }

  /**
   * 应用主题到 DOM
   */
  private applyTheme(theme: ThemeType): void {
    if (typeof document === 'undefined') return

    const resolvedTheme = theme === 'auto' ? this.getSystemTheme() : theme
    
    // 移除所有主题类
    document.documentElement.removeAttribute('data-theme')
    
    // 应用新主题
    if (resolvedTheme !== 'light') {
      document.documentElement.setAttribute('data-theme', resolvedTheme)
    }

    // 添加过渡动画类
    if (this.config.enableTransition) {
      document.documentElement.classList.add('theme-transition')
      
      // 动画完成后移除过渡类
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition')
      }, 300)
    }
  }

  /**
   * 获取系统主题偏好
   */
  private getSystemTheme(): Exclude<ThemeType, 'auto'> {
    if (typeof window === 'undefined') return 'light'

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return 'high-contrast'
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  }

  /**
   * 设置系统主题变化监听器
   */
  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined') return

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange)
  }

  /**
   * 处理系统主题变化
   */
  private handleSystemThemeChange = (): void => {
    if (this.currentTheme === 'auto') {
      const previousTheme = this.getResolvedTheme()
      const newTheme = this.getSystemTheme()
      
      if (previousTheme !== newTheme) {
        this.applyTheme('auto')
        this.notifyThemeChange({
          theme: 'auto',
          previousTheme: this.currentTheme,
          isSystemTriggered: true
        })
      }
    }
  }

  /**
   * 通知主题变更
   */
  private notifyThemeChange(event: ThemeChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Theme change listener error:', error)
      }
    })
  }

  /**
   * 从本地存储获取主题
   */
  private getStoredTheme(): ThemeType | null {
    if (typeof localStorage === 'undefined') return null

    try {
      const stored = localStorage.getItem(this.config.storageKey)
      if (stored && ['light', 'dark', 'high-contrast', 'auto'].includes(stored)) {
        return stored as ThemeType
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error)
    }

    return null
  }

  /**
   * 存储主题到本地存储
   */
  private storeTheme(theme: ThemeType): void {
    if (typeof localStorage === 'undefined') return

    try {
      localStorage.setItem(this.config.storageKey, theme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }
}

/**
 * 全局主题管理器实例
 */
let globalThemeManager: ThemeManager | null = null

/**
 * 创建主题管理器
 */
export function createThemeManager(config: ThemeConfig): ThemeManager {
  return new ThemeManager(config)
}

/**
 * 获取全局主题管理器
 */
export function getThemeManager(): ThemeManager {
  if (!globalThemeManager) {
    globalThemeManager = new ThemeManager({ theme: 'auto' })
    globalThemeManager.init()
  }
  return globalThemeManager
}

/**
 * 设置全局主题
 */
export function setTheme(theme: ThemeType): void {
  getThemeManager().setTheme(theme)
}

/**
 * 获取当前主题
 */
export function getTheme(): ThemeType {
  return getThemeManager().getTheme()
}

/**
 * 获取解析后的主题
 */
export function getResolvedTheme(): Exclude<ThemeType, 'auto'> {
  return getThemeManager().getResolvedTheme()
}

/**
 * 切换主题
 */
export function toggleTheme(): void {
  getThemeManager().toggleTheme()
}

/**
 * 添加主题变更监听器
 */
export function addThemeChangeListener(listener: ThemeChangeListener): () => void {
  return getThemeManager().addListener(listener)
}

/**
 * 移除主题变更监听器
 */
export function removeThemeChangeListener(listener: ThemeChangeListener): void {
  getThemeManager().removeListener(listener)
}

/**
 * 检查是否支持暗色主题
 */
export function supportsDarkMode(): boolean {
  return getThemeManager().supportsDarkMode()
}

/**
 * 检查是否支持高对比度
 */
export function supportsHighContrast(): boolean {
  return getThemeManager().supportsHighContrast()
}
