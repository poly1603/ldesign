/**
 * 主题管理器
 * 
 * 负责管理表格的主题切换、自定义主题和响应式适配
 */

import { EventManager } from './EventManager'

/**
 * 主题类型定义
 */
export type ThemeType = 
  | 'light' 
  | 'dark' 
  | 'compact' 
  | 'comfortable' 
  | 'minimal' 
  | 'card' 
  | 'bordered' 
  | 'striped' 
  | 'borderless' 
  | 'rounded' 
  | 'custom'

/**
 * 响应式模式定义
 */
export type ResponsiveMode = 'auto' | 'desktop' | 'tablet' | 'mobile' | 'card'

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题类型 */
  type: ThemeType
  /** 响应式模式 */
  responsive: ResponsiveMode
  /** 自定义CSS变量 */
  customVars?: Record<string, string>
  /** 是否启用动画 */
  animations?: boolean
  /** 是否启用阴影 */
  shadows?: boolean
  /** 是否启用圆角 */
  rounded?: boolean
}

/**
 * 主题管理器类
 */
export class ThemeManager {
  private container: HTMLElement
  private eventManager: EventManager
  private config: ThemeConfig
  private mediaQueries: MediaQueryList[] = []
  private resizeObserver?: ResizeObserver

  constructor(container: HTMLElement, eventManager: EventManager) {
    this.container = container
    this.eventManager = eventManager
    this.config = {
      type: 'light',
      responsive: 'auto',
      animations: true,
      shadows: true,
      rounded: true
    }

    this.init()
  }

  /**
   * 初始化主题管理器
   */
  private init(): void {
    this.setupResponsiveListeners()
    this.applyTheme()
    this.setupAccessibilityListeners()
  }

  /**
   * 设置主题配置
   */
  setTheme(config: Partial<ThemeConfig>): void {
    const oldConfig = { ...this.config }
    this.config = { ...this.config, ...config }

    // 移除旧主题类
    if (oldConfig.type !== this.config.type) {
      this.container.classList.remove(`ldesign-table--theme-${oldConfig.type}`)
    }

    this.applyTheme()

    // 触发主题变更事件
    this.eventManager.emit('theme-change', {
      oldTheme: oldConfig,
      newTheme: this.config
    })
  }

  /**
   * 获取当前主题配置
   */
  getTheme(): ThemeConfig {
    return { ...this.config }
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    // 应用主题类
    this.container.classList.add(`ldesign-table--theme-${this.config.type}`)

    // 应用响应式模式
    this.applyResponsiveMode()

    // 应用自定义变量
    if (this.config.customVars) {
      this.applyCustomVars(this.config.customVars)
    }

    // 应用特性开关
    this.applyFeatureToggles()
  }

  /**
   * 应用响应式模式
   */
  private applyResponsiveMode(): void {
    // 移除所有响应式类
    this.container.classList.remove(
      'ldesign-table--mobile',
      'ldesign-table--tablet',
      'ldesign-table--desktop',
      'ldesign-table--mobile-card'
    )

    if (this.config.responsive === 'auto') {
      // 自动响应式模式，根据屏幕尺寸自动切换
      this.updateResponsiveClass()
    } else {
      // 手动指定响应式模式
      const modeClass = this.config.responsive === 'card' 
        ? 'ldesign-table--mobile-card'
        : `ldesign-table--${this.config.responsive}`
      this.container.classList.add(modeClass)
    }
  }

  /**
   * 更新响应式类
   */
  private updateResponsiveClass(): void {
    const width = this.container.offsetWidth || window.innerWidth

    this.container.classList.remove(
      'ldesign-table--mobile',
      'ldesign-table--tablet',
      'ldesign-table--desktop'
    )

    if (width < 768) {
      this.container.classList.add('ldesign-table--mobile')
    } else if (width < 1024) {
      this.container.classList.add('ldesign-table--tablet')
    } else {
      this.container.classList.add('ldesign-table--desktop')
    }
  }

  /**
   * 应用自定义CSS变量
   */
  private applyCustomVars(vars: Record<string, string>): void {
    Object.entries(vars).forEach(([key, value]) => {
      this.container.style.setProperty(key, value)
    })
  }

  /**
   * 应用特性开关
   */
  private applyFeatureToggles(): void {
    // 动画开关
    this.container.classList.toggle('ldesign-table--no-animations', !this.config.animations)
    
    // 阴影开关
    this.container.classList.toggle('ldesign-table--no-shadows', !this.config.shadows)
    
    // 圆角开关
    this.container.classList.toggle('ldesign-table--no-rounded', !this.config.rounded)
  }

  /**
   * 设置响应式监听器
   */
  private setupResponsiveListeners(): void {
    if (this.config.responsive !== 'auto') return

    // 媒体查询监听
    const queries = [
      '(max-width: 767px)',
      '(min-width: 768px) and (max-width: 1023px)',
      '(min-width: 1024px)'
    ]

    this.mediaQueries = queries.map(query => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', () => {
        if (this.config.responsive === 'auto') {
          this.updateResponsiveClass()
        }
      })
      return mq
    })

    // 容器尺寸监听
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.config.responsive === 'auto') {
          this.updateResponsiveClass()
        }
      })
      this.resizeObserver.observe(this.container)
    }
  }

  /**
   * 设置无障碍监听器
   */
  private setupAccessibilityListeners(): void {
    // 监听用户偏好设置
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')

    // 减少动画偏好
    prefersReducedMotion.addEventListener('change', (e) => {
      this.container.classList.toggle('ldesign-table--reduced-motion', e.matches)
    })

    // 高对比度偏好
    prefersHighContrast.addEventListener('change', (e) => {
      this.container.classList.toggle('ldesign-table--high-contrast', e.matches)
    })

    // 深色主题偏好
    prefersDarkScheme.addEventListener('change', (e) => {
      if (this.config.type === 'light' && e.matches) {
        this.setTheme({ type: 'dark' })
      } else if (this.config.type === 'dark' && !e.matches) {
        this.setTheme({ type: 'light' })
      }
    })

    // 初始化状态
    this.container.classList.toggle('ldesign-table--reduced-motion', prefersReducedMotion.matches)
    this.container.classList.toggle('ldesign-table--high-contrast', prefersHighContrast.matches)
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    const newType = this.config.type === 'light' ? 'dark' : 'light'
    this.setTheme({ type: newType })
  }

  /**
   * 切换响应式模式
   */
  toggleResponsiveMode(): void {
    const modes: ResponsiveMode[] = ['auto', 'desktop', 'tablet', 'mobile', 'card']
    const currentIndex = modes.indexOf(this.config.responsive)
    const nextIndex = (currentIndex + 1) % modes.length
    this.setTheme({ responsive: modes[nextIndex] })
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    // 清理媒体查询监听器
    this.mediaQueries.forEach(mq => {
      mq.removeEventListener('change', () => {})
    })
    this.mediaQueries = []

    // 清理尺寸监听器
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = undefined
    }

    // 清理容器类和样式
    this.container.className = this.container.className
      .split(' ')
      .filter(cls => !cls.startsWith('ldesign-table--'))
      .join(' ')

    // 清理自定义CSS变量
    if (this.config.customVars) {
      Object.keys(this.config.customVars).forEach(key => {
        this.container.style.removeProperty(key)
      })
    }
  }
}
