/**
 * @ldesign/theme - 主题管理器
 *
 * 核心主题管理器，负责主题的切换、装饰和动画管理
 */

import type {
  DecorationConfig,
  ThemeConfig,
  ThemeEventData,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
  ThemeManagerOptions,
} from './types'
import { createThemeManager as createColorThemeManager } from '@ldesign/color'
import { createEventEmitter } from '../utils/event-emitter'
import { createAnimationManager } from './animation-manager'
import { createDecorationManager } from './decoration-manager'
import { createResourceManager } from './resource-manager'

/**
 * 主题管理器实现
 */
export class ThemeManager implements ThemeManagerInstance {
  private themes = new Map<string, ThemeConfig>()
  private currentTheme?: string
  private container: HTMLElement
  private eventEmitter = createEventEmitter()
  private colorThemeManager: any
  private resourceManager: any
  private decorationManager: any
  private animationManager: any
  private options: ThemeManagerOptions
  private initialized = false

  constructor(options: ThemeManagerOptions = {}) {
    this.options = {
      autoActivate: true,
      performance: {
        enableGPU: true,
        maxDecorations: 50,
        animationQuality: 'medium',
        preloadStrategy: 'critical',
        memoryLimit: 100 * 1024 * 1024, // 100MB
      },
      storage: {
        key: 'ldesign-theme',
        storage: 'localStorage',
      },
      debug: false,
      ...options,
    }

    // 设置容器
    this.container = document.body

    // 初始化主题
    if (options.themes) {
      options.themes.forEach(theme => this.addTheme(theme))
    }
  }

  /**
   * 初始化主题管理器
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // 初始化颜色主题管理器
      this.colorThemeManager = createColorThemeManager({
        storage: this.options.storage,
        debug: this.options.debug,
      })
      await this.colorThemeManager.init()

      // 初始化资源管理器
      this.resourceManager = createResourceManager(this.eventEmitter, {
        maxCacheSize: this.options.performance?.memoryLimit,
      })

      // 初始化装饰管理器
      this.decorationManager = createDecorationManager(
        this.container,
        this.eventEmitter,
        this.resourceManager
      )

      // 初始化动画管理器
      this.animationManager = createAnimationManager(
        this.container,
        this.eventEmitter
      )

      // 设置默认主题
      if (
        this.options.defaultTheme &&
        this.themes.has(this.options.defaultTheme)
      ) {
        await this.setTheme(this.options.defaultTheme)
      }

      // 自动激活节日主题
      if (this.options.autoActivate) {
        this.setupAutoActivation()
      }

      this.initialized = true
      this.eventEmitter.emit('theme-loaded', {})
    } catch (error) {
      this.eventEmitter.emit('theme-error', { error: error as Error })
      throw error
    }
  }

  /**
   * 设置主题
   */
  async setTheme(name: string): Promise<void> {
    const theme = this.themes.get(name)
    if (!theme) {
      throw new Error(`Theme "${name}" not found`)
    }

    try {
      // 清理当前主题
      if (this.currentTheme) {
        await this.cleanupCurrentTheme()
      }

      // 预加载资源
      if (theme.resources.preload) {
        await this.resourceManager.preload(theme.resources.preload)
      }

      // 应用颜色主题
      if (this.colorThemeManager) {
        await this.colorThemeManager.setTheme(theme.colors)
      }

      // 应用装饰元素
      theme.decorations.forEach(decoration => {
        this.decorationManager.add(decoration)
      })

      // 注册动画
      theme.animations.forEach(animation => {
        this.animationManager.register(animation)
      })

      // 自动开始动画
      theme.animations.forEach(animation => {
        if (animation.playState !== 'paused') {
          this.animationManager.start(animation.name)
        }
      })

      this.currentTheme = name
      this.saveCurrentTheme()
      this.eventEmitter.emit('theme-changed', { theme: name })
    } catch (error) {
      this.eventEmitter.emit('theme-error', {
        theme: name,
        error: error as Error,
      })
      throw error
    }
  }

  /**
   * 获取主题配置
   */
  getTheme(name: string): ThemeConfig | undefined {
    return this.themes.get(name)
  }

  /**
   * 获取当前主题名称
   */
  getCurrentTheme(): string | undefined {
    return this.currentTheme
  }

  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 添加主题
   */
  addTheme(theme: ThemeConfig): void {
    this.themes.set(theme.name, theme)
  }

  /**
   * 移除主题
   */
  removeTheme(name: string): void {
    if (this.currentTheme === name) {
      this.currentTheme = undefined
    }
    this.themes.delete(name)
  }

  /**
   * 添加装饰元素
   */
  addDecoration(decoration: DecorationConfig): void {
    this.decorationManager.add(decoration)
  }

  /**
   * 移除装饰元素
   */
  removeDecoration(id: string): void {
    this.decorationManager.remove(id)
  }

  /**
   * 更新装饰元素
   */
  updateDecoration(id: string, updates: Partial<DecorationConfig>): void {
    this.decorationManager.update(id, updates)
  }

  /**
   * 获取装饰元素列表
   */
  getDecorations(): DecorationConfig[] {
    return this.decorationManager.getAll()
  }

  /**
   * 开始动画
   */
  startAnimation(name: string): void {
    this.animationManager.start(name)
  }

  /**
   * 停止动画
   */
  stopAnimation(name: string): void {
    this.animationManager.stop(name)
  }

  /**
   * 暂停动画
   */
  pauseAnimation(name: string): void {
    this.animationManager.pause(name)
  }

  /**
   * 恢复动画
   */
  resumeAnimation(name: string): void {
    this.animationManager.resume(name)
  }

  /**
   * 预加载资源
   */
  async preloadResources(theme: string): Promise<void> {
    const themeConfig = this.themes.get(theme)
    if (!themeConfig) {
      throw new Error(`Theme "${theme}" not found`)
    }

    const resources = [
      ...Object.values(themeConfig.resources.images),
      ...Object.values(themeConfig.resources.icons),
      ...(themeConfig.resources.preload || []),
    ]

    await this.resourceManager.preload(resources)
  }

  /**
   * 清理资源
   */
  clearResources(theme?: string): void {
    if (theme) {
      const themeConfig = this.themes.get(theme)
      if (themeConfig) {
        const pattern = `(${Object.values(themeConfig.resources.images).join(
          '|'
        )}|${Object.values(themeConfig.resources.icons).join('|')})`
        this.resourceManager.clear(pattern)
      }
    } else {
      this.resourceManager.clear()
    }
  }

  /**
   * 添加事件监听器
   */
  on(event: ThemeEventType, listener: ThemeEventListener): void {
    this.eventEmitter.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: ThemeEventType, listener: ThemeEventListener): void {
    this.eventEmitter.off(event, listener)
  }

  /**
   * 发射事件
   */
  emit(
    event: ThemeEventType,
    data: Omit<ThemeEventData, 'type' | 'timestamp'>
  ): void {
    this.eventEmitter.emit(event, data)
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    this.cleanupCurrentTheme()
    this.decorationManager?.destroy()
    this.animationManager?.destroy()
    this.resourceManager?.destroy()
    this.colorThemeManager?.destroy()
    this.eventEmitter.destroy()
    this.initialized = false
  }

  /**
   * 清理当前主题
   */
  private async cleanupCurrentTheme(): Promise<void> {
    if (!this.currentTheme) {
      return
    }

    // 停止所有动画
    this.animationManager.getAll().forEach((animation: any) => {
      this.animationManager.stop(animation.name)
      this.animationManager.unregister(animation.name)
    })

    // 清理装饰元素
    this.decorationManager.clear()

    // 清理资源（可选）
    if (this.options.performance?.preloadStrategy !== 'all') {
      this.clearResources(this.currentTheme)
    }
  }

  /**
   * 设置自动激活
   */
  private setupAutoActivation(): void {
    // 检查节日主题的时间范围
    const checkFestivalThemes = () => {
      const now = new Date()

      for (const [name, theme] of this.themes.entries()) {
        if (theme.festival && theme.timeRange) {
          if (this.isInTimeRange(now, theme.timeRange)) {
            if (this.currentTheme !== name) {
              this.setTheme(name).catch(error => {
                console.error(`Failed to auto-activate theme "${name}":`, error)
              })
            }
            return
          }
        }
      }
    }

    // 每小时检查一次
    setInterval(checkFestivalThemes, 60 * 60 * 1000)

    // 立即检查一次
    checkFestivalThemes()
  }

  /**
   * 检查是否在时间范围内
   */
  private isInTimeRange(date: Date, timeRange: any): boolean {
    // 这里可以实现更复杂的时间范围检查逻辑
    // 支持年度循环、时区等
    return false
  }

  /**
   * 保存当前主题
   */
  private saveCurrentTheme(): void {
    if (!this.currentTheme || !this.options.storage) {
      return
    }

    try {
      const storage = this.getStorage()
      const key = this.options.storage.key || 'ldesign-theme'
      const data = this.options.storage.serialize
        ? this.options.storage.serialize(this.currentTheme)
        : JSON.stringify(this.currentTheme)

      storage.setItem(key, data)
    } catch (error) {
      console.warn('Failed to save current theme:', error)
    }
  }

  /**
   * 获取存储对象
   */
  private getStorage(): Storage {
    switch (this.options.storage?.storage) {
      case 'sessionStorage':
        return sessionStorage
      case 'localStorage':
      default:
        return localStorage
    }
  }
}

/**
 * 创建主题管理器实例
 */
export function createThemeManager(
  options?: ThemeManagerOptions
): ThemeManagerInstance {
  return new ThemeManager(options)
}
