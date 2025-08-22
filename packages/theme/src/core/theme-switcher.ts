/**
 * @ldesign/theme - 动态主题切换器
 *
 * 实现主题联动系统，确保颜色系统和挂件系统同步切换
 */

import { ThemeManager as ColorThemeManager } from '@ldesign/color'
import { globalWidgetManager } from './widget-manager'
import type { FestivalThemeConfig } from './festival-theme-config'
import {
  allFestivalThemes,
  getRecommendedTheme,
  type SupportedThemeId,
} from '../themes/festivals'

/**
 * 主题切换事件类型
 */
export interface ThemeSwitchEvent {
  theme: SupportedThemeId
  previousTheme: SupportedThemeId
  timestamp: number
  source: 'manual' | 'auto' | 'scheduled'
}

/**
 * 主题切换器配置
 */
export interface ThemeSwitcherOptions {
  /** 默认主题 */
  defaultTheme?: SupportedThemeId
  /** 是否启用自动主题切换 */
  autoSwitch?: boolean
  /** 是否启用过渡动画 */
  enableTransitions?: boolean
  /** 过渡动画持续时间 */
  transitionDuration?: number
  /** 是否保存主题到本地存储 */
  persistTheme?: boolean
  /** 本地存储键名 */
  storageKey?: string
  /** 主题切换回调 */
  onThemeChange?: (event: ThemeSwitchEvent) => void
}

/**
 * 动态主题切换器
 */
export class ThemeSwitcher {
  private currentTheme: SupportedThemeId = 'default'
  private colorThemeManager: ColorThemeManager | null = null
  private options: Required<ThemeSwitcherOptions>
  private transitionElement: HTMLElement | null = null
  private autoSwitchTimer: number | null = null

  constructor(options: ThemeSwitcherOptions = {}) {
    this.options = {
      defaultTheme: 'default',
      autoSwitch: false,
      enableTransitions: true,
      transitionDuration: 300,
      persistTheme: true,
      storageKey: 'ldesign-festival-theme',
      onThemeChange: () => {},
      ...options,
    }

    this.initialize()
  }

  /**
   * 初始化主题切换器
   */
  private async initialize(): Promise<void> {
    try {
      // 初始化颜色主题管理器
      await this.initializeColorThemeManager()

      // 注册所有节日主题到挂件管理器
      this.registerAllThemes()

      // 恢复保存的主题或使用默认主题
      const savedTheme = this.getSavedTheme()
      const initialTheme = savedTheme || this.options.defaultTheme

      // 应用初始主题
      await this.switchTheme(initialTheme, 'auto')

      // 启用自动主题切换
      if (this.options.autoSwitch) {
        this.enableAutoSwitch()
      }

      // 创建过渡元素
      if (this.options.enableTransitions) {
        this.createTransitionElement()
      }
    } catch (error) {
      console.error('Failed to initialize theme switcher:', error)
    }
  }

  /**
   * 初始化颜色主题管理器
   */
  private async initializeColorThemeManager(): Promise<void> {
    // 收集所有主题的颜色配置
    const colorThemes = Object.values(allFestivalThemes).map(
      theme => theme.colorConfig
    )

    this.colorThemeManager = new ColorThemeManager({
      themes: colorThemes,
      defaultTheme: this.options.defaultTheme,
      storage: this.options.persistTheme ? 'localStorage' : 'memory',
      storageKey: `${this.options.storageKey}-color`,
      autoDetect: false, // 我们手动控制主题切换
    })

    await this.colorThemeManager.init()
  }

  /**
   * 注册所有主题到挂件管理器
   */
  private registerAllThemes(): void {
    Object.values(allFestivalThemes).forEach(themeConfig => {
      globalWidgetManager.registerThemeWidgets(themeConfig)
    })
  }

  /**
   * 切换主题
   */
  async switchTheme(
    theme: SupportedThemeId,
    source: ThemeSwitchEvent['source'] = 'manual'
  ): Promise<void> {
    const previousTheme = this.currentTheme

    if (theme === previousTheme) {
      return // 主题相同，无需切换
    }

    try {
      // 开始过渡动画
      if (this.options.enableTransitions) {
        this.startTransition()
      }

      // 切换颜色主题
      if (this.colorThemeManager) {
        await this.colorThemeManager.setTheme(theme)
      }

      // 切换挂件主题
      globalWidgetManager.switchTheme(theme)

      // 更新文档属性
      this.updateDocumentTheme(theme)

      // 应用主题特定的CSS变量
      this.applyThemeVariables(theme)

      // 更新当前主题
      this.currentTheme = theme

      // 保存主题
      if (this.options.persistTheme) {
        this.saveTheme(theme)
      }

      // 结束过渡动画
      if (this.options.enableTransitions) {
        setTimeout(() => {
          this.endTransition()
        }, this.options.transitionDuration)
      }

      // 触发主题切换事件
      const event: ThemeSwitchEvent = {
        theme,
        previousTheme,
        timestamp: Date.now(),
        source,
      }

      this.options.onThemeChange(event)
      this.dispatchThemeChangeEvent(event)
    } catch (error) {
      console.error('Failed to switch theme:', error)
      throw error
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): SupportedThemeId {
    return this.currentTheme
  }

  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): SupportedThemeId[] {
    return Object.keys(allFestivalThemes) as SupportedThemeId[]
  }

  /**
   * 启用自动主题切换
   */
  enableAutoSwitch(): void {
    // 立即检查推荐主题
    this.checkAndSwitchRecommendedTheme()

    // 每小时检查一次
    this.autoSwitchTimer = window.setInterval(() => {
      this.checkAndSwitchRecommendedTheme()
    }, 60 * 60 * 1000) // 1小时
  }

  /**
   * 禁用自动主题切换
   */
  disableAutoSwitch(): void {
    if (this.autoSwitchTimer) {
      clearInterval(this.autoSwitchTimer)
      this.autoSwitchTimer = null
    }
  }

  /**
   * 检查并切换到推荐主题
   */
  private async checkAndSwitchRecommendedTheme(): Promise<void> {
    const recommendedTheme = getRecommendedTheme()
    if (recommendedTheme !== this.currentTheme) {
      await this.switchTheme(recommendedTheme, 'auto')
    }
  }

  /**
   * 更新文档主题属性
   */
  private updateDocumentTheme(theme: SupportedThemeId): void {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-festival-theme', theme)

    // 更新body类名
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim()
    document.body.classList.add(`theme-${theme}`)
  }

  /**
   * 应用主题特定的CSS变量
   */
  private applyThemeVariables(theme: SupportedThemeId): void {
    const themeConfig = allFestivalThemes[theme]
    if (!themeConfig) return

    const root = document.documentElement

    // 应用主题CSS变量
    Object.entries(themeConfig.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 应用动画变量
    if (themeConfig.animations) {
      themeConfig.animations.forEach(animation => {
        root.style.setProperty(
          `--animation-${animation.name}-duration`,
          animation.duration
        )
        root.style.setProperty(
          `--animation-${animation.name}-timing`,
          animation.timingFunction
        )
        root.style.setProperty(
          `--animation-${animation.name}-iteration`,
          animation.iterationCount
        )
        if (animation.direction) {
          root.style.setProperty(
            `--animation-${animation.name}-direction`,
            animation.direction
          )
        }
        if (animation.delay) {
          root.style.setProperty(
            `--animation-${animation.name}-delay`,
            animation.delay
          )
        }
      })
    }
  }

  /**
   * 创建过渡元素
   */
  private createTransitionElement(): void {
    this.transitionElement = document.createElement('div')
    this.transitionElement.className = 'ldesign-theme-transition'
    this.transitionElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--festival-background, #ffffff);
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      transition: opacity ${this.options.transitionDuration}ms ease-in-out;
    `
    document.body.appendChild(this.transitionElement)
  }

  /**
   * 开始过渡动画
   */
  private startTransition(): void {
    if (this.transitionElement) {
      this.transitionElement.style.opacity = '0.3'
    }
  }

  /**
   * 结束过渡动画
   */
  private endTransition(): void {
    if (this.transitionElement) {
      this.transitionElement.style.opacity = '0'
    }
  }

  /**
   * 保存主题到本地存储
   */
  private saveTheme(theme: SupportedThemeId): void {
    try {
      localStorage.setItem(this.options.storageKey, theme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }

  /**
   * 从本地存储获取保存的主题
   */
  private getSavedTheme(): SupportedThemeId | null {
    try {
      const saved = localStorage.getItem(this.options.storageKey)
      return saved && saved in allFestivalThemes
        ? (saved as SupportedThemeId)
        : null
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
      return null
    }
  }

  /**
   * 派发主题切换事件
   */
  private dispatchThemeChangeEvent(event: ThemeSwitchEvent): void {
    const customEvent = new CustomEvent('festival-theme-changed', {
      detail: event,
      bubbles: true,
    })
    document.dispatchEvent(customEvent)
  }

  /**
   * 销毁主题切换器
   */
  destroy(): void {
    this.disableAutoSwitch()

    if (this.transitionElement) {
      this.transitionElement.remove()
      this.transitionElement = null
    }
  }
}

/**
 * 创建主题切换器实例
 */
export function createThemeSwitcher(
  options?: ThemeSwitcherOptions
): ThemeSwitcher {
  return new ThemeSwitcher(options)
}

/**
 * 全局主题切换器实例
 */
export const globalThemeSwitcher = createThemeSwitcher({
  autoSwitch: true,
  enableTransitions: true,
  persistTheme: true,
})
