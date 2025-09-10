/**
 * @file 主题管理器
 * @description 节日主题管理器的核心实现，负责主题切换、挂件管理和事件处理
 */

// 暂时注释掉 @ldesign/color 的导入，等待该包完善
// import type { ThemeManagerInstance } from '@ldesign/color'
// import { createThemeManager as createColorThemeManager } from '@ldesign/color'

// 临时类型定义
interface ThemeManagerInstance {
  init(): Promise<void>
  setTheme(theme: any): Promise<void>
}
import type {
  FestivalType,
  FestivalThemeConfig,
  ThemeManagerConfig,
  IThemeManager,
  ThemeEventType,
  ThemeEventListener,
  ThemeEventData
} from './types'
import { WidgetManager } from './widget-manager'
import { AnimationEngine } from './animation-engine'

/**
 * 节日主题管理器
 * 
 * 负责管理节日主题的切换、挂件的显示隐藏、动画效果等
 * 基于 @ldesign/color 包的主题管理功能进行扩展
 * 
 * @example
 * ```typescript
 * const themeManager = new FestivalThemeManager({
 *   themes: [springFestivalTheme, christmasTheme],
 *   defaultTheme: FestivalType.SPRING_FESTIVAL,
 *   autoActivate: true
 * })
 * 
 * await themeManager.init()
 * await themeManager.setTheme(FestivalType.CHRISTMAS)
 * ```
 */
export class FestivalThemeManager implements IThemeManager {
  private _config: ThemeManagerConfig
  private _colorThemeManager: ThemeManagerInstance | null = null
  private _widgetManager: WidgetManager | null = null
  private _animationEngine: AnimationEngine | null = null
  private _currentTheme: FestivalType | null = null
  private _themes: Map<FestivalType, FestivalThemeConfig> = new Map()
  private _eventListeners: Map<ThemeEventType, Set<ThemeEventListener>> = new Map()
  private _isInitialized = false
  private _isTransitioning = false

  /**
   * 创建节日主题管理器实例
   * @param config 主题管理器配置
   */
  constructor(config: ThemeManagerConfig) {
    this._config = {
      autoActivate: true,
      enableCache: true,
      cacheKey: 'ldesign-festival-theme',
      syncSystemTheme: false,
      ...config
    }

    // 注册主题
    this._config.themes.forEach(theme => {
      this._themes.set(theme.festival, theme)
    })
  }

  /**
   * 当前激活的主题
   */
  get currentTheme(): FestivalType | null {
    return this._currentTheme
  }

  /**
   * 可用主题列表
   */
  get availableThemes(): FestivalType[] {
    return Array.from(this._themes.keys())
  }

  /**
   * 是否已初始化
   */
  get isInitialized(): boolean {
    return this._isInitialized
  }

  /**
   * 是否正在切换主题
   */
  get isTransitioning(): boolean {
    return this._isTransitioning
  }

  /**
   * 初始化主题管理器
   */
  async init(): Promise<void> {
    if (this._isInitialized) {
      console.warn('FestivalThemeManager is already initialized')
      return
    }

    try {
      // 初始化颜色主题管理器（暂时使用模拟实现）
      // this._colorThemeManager = createColorThemeManager({
      //   enableCache: this._config.enableCache,
      //   cacheKey: `${this._config.cacheKey}-colors`
      // })
      // await this._colorThemeManager.init()

      // 临时模拟实现
      this._colorThemeManager = {
        init: async () => { },
        setTheme: async (theme: any) => { }
      }

      // 初始化挂件管理器
      this._widgetManager = new WidgetManager({
        enablePerformanceMonitoring: true,
        maxWidgets: 50,
        enableCollisionDetection: false
      })
      await this._widgetManager.init()

      // 初始化动画引擎
      this._animationEngine = new AnimationEngine()

      // 加载缓存的主题
      if (this._config.enableCache) {
        const cachedTheme = this._loadCachedTheme()
        if (cachedTheme && this._themes.has(cachedTheme)) {
          this._currentTheme = cachedTheme
        }
      }

      // 设置默认主题
      if (!this._currentTheme && this._config.defaultTheme) {
        this._currentTheme = this._config.defaultTheme
      }

      // 自动激活主题
      if (this._config.autoActivate && this._currentTheme) {
        await this._activateTheme(this._currentTheme, false)
      }

      this._isInitialized = true

      // 触发初始化完成事件
      this._emitEvent({
        type: 'after-theme-change' as ThemeEventType,
        currentTheme: this._currentTheme,
        timestamp: Date.now()
      })

    } catch (error) {
      console.error('Failed to initialize FestivalThemeManager:', error)
      throw error
    }
  }

  /**
   * 切换主题
   * @param theme 目标主题
   */
  async setTheme(theme: FestivalType): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('ThemeManager is not initialized. Call init() first.')
    }

    if (!this._themes.has(theme)) {
      throw new Error(`Theme "${theme}" is not registered`)
    }

    if (this._currentTheme === theme) {
      console.warn(`Theme "${theme}" is already active`)
      return
    }

    if (this._isTransitioning) {
      console.warn('Theme transition is already in progress')
      return
    }

    const previousTheme = this._currentTheme

    try {
      this._isTransitioning = true

      // 触发主题切换前事件
      await this._emitEvent({
        type: 'before-theme-change' as ThemeEventType,
        currentTheme: this._currentTheme,
        previousTheme,
        timestamp: Date.now()
      })

      // 停用当前主题
      if (this._currentTheme) {
        await this._deactivateTheme(this._currentTheme)
      }

      // 激活新主题
      await this._activateTheme(theme, true)

      this._currentTheme = theme

      // 缓存主题
      if (this._config.enableCache) {
        this._saveCachedTheme(theme)
      }

      // 触发主题切换后事件
      await this._emitEvent({
        type: 'after-theme-change' as ThemeEventType,
        currentTheme: this._currentTheme,
        previousTheme,
        timestamp: Date.now()
      })

    } catch (error) {
      console.error(`Failed to switch to theme "${theme}":`, error)
      throw error
    } finally {
      this._isTransitioning = false
    }
  }

  /**
   * 获取主题配置
   * @param theme 主题类型
   */
  getThemeConfig(theme: FestivalType): FestivalThemeConfig | null {
    return this._themes.get(theme) || null
  }

  /**
   * 添加主题
   * @param config 主题配置
   */
  addTheme(config: FestivalThemeConfig): void {
    this._themes.set(config.festival, config)
  }

  /**
   * 移除主题
   * @param theme 主题类型
   */
  removeTheme(theme: FestivalType): void {
    if (this._currentTheme === theme) {
      console.warn(`Cannot remove active theme "${theme}"`)
      return
    }
    this._themes.delete(theme)
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  addEventListener(type: ThemeEventType, listener: ThemeEventListener): void {
    if (!this._eventListeners.has(type)) {
      this._eventListeners.set(type, new Set())
    }
    this._eventListeners.get(type)!.add(listener)
  }

  /**
   * 添加事件监听器（别名方法）
   * @param type 事件类型
   * @param listener 监听器函数
   */
  on(type: ThemeEventType, listener: ThemeEventListener): void {
    this.addEventListener(type, listener)
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  removeEventListener(type: ThemeEventType, listener: ThemeEventListener): void {
    const listeners = this._eventListeners.get(type)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * 移除事件监听器（别名方法）
   * @param type 事件类型
   * @param listener 监听器函数
   */
  off(type: ThemeEventType, listener: ThemeEventListener): void {
    this.removeEventListener(type, listener)
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    // 清理事件监听器
    this._eventListeners.clear()

    // 销毁子组件
    this._animationEngine?.destroy()
    this._widgetManager?.destroy()

    // 重置状态
    this._currentTheme = null
    this._isInitialized = false
    this._isTransitioning = false
  }

  /**
   * 激活主题
   * @param theme 主题类型
   * @param withTransition 是否使用过渡动画
   */
  private async _activateTheme(theme: FestivalType, withTransition: boolean): Promise<void> {
    const config = this._themes.get(theme)
    if (!config) {
      throw new Error(`Theme configuration for "${theme}" not found`)
    }

    try {
      // 应用颜色主题
      if (this._colorThemeManager) {
        await this._colorThemeManager.setTheme(config.colors)
      }

      // 清空现有挂件
      if (this._widgetManager) {
        await this._widgetManager.clearWidgets()
      }

      // 添加主题挂件
      if (this._widgetManager && config.widgets) {
        for (const widget of config.widgets) {
          await this._widgetManager.addWidget(widget)
        }
      }

      // 播放全局动画
      if (this._animationEngine && config.globalAnimations) {
        for (const animation of config.globalAnimations) {
          // 这里可以添加全局动画逻辑
        }
      }

      // 执行主题激活回调
      if (config.onActivate) {
        await config.onActivate()
      }

    } catch (error) {
      console.error(`Failed to activate theme "${theme}":`, error)
      throw error
    }
  }

  /**
   * 停用主题
   * @param theme 主题类型
   */
  private async _deactivateTheme(theme: FestivalType): Promise<void> {
    const config = this._themes.get(theme)
    if (!config) {
      return
    }

    try {
      // 执行主题停用回调
      if (config.onDeactivate) {
        await config.onDeactivate()
      }

      // 清空挂件
      if (this._widgetManager) {
        await this._widgetManager.clearWidgets()
      }

    } catch (error) {
      console.error(`Failed to deactivate theme "${theme}":`, error)
    }
  }

  /**
   * 触发事件
   * @param event 事件数据
   */
  private async _emitEvent(event: ThemeEventData): Promise<void> {
    const listeners = this._eventListeners.get(event.type)
    if (!listeners || listeners.size === 0) {
      return
    }

    const promises = Array.from(listeners).map(listener => {
      try {
        return Promise.resolve(listener(event))
      } catch (error) {
        console.error('Error in theme event listener:', error)
        return Promise.resolve()
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * 加载缓存的主题
   */
  private _loadCachedTheme(): FestivalType | null {
    try {
      const cached = localStorage.getItem(this._config.cacheKey!)
      return cached as FestivalType || null
    } catch {
      return null
    }
  }

  /**
   * 保存主题到缓存
   * @param theme 主题类型
   */
  private _saveCachedTheme(theme: FestivalType): void {
    try {
      localStorage.setItem(this._config.cacheKey!, theme)
    } catch (error) {
      console.warn('Failed to cache theme:', error)
    }
  }
}
