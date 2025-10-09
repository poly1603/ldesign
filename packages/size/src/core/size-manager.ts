/**
 * 尺寸管理器
 */

import type {
  SizeChangeEvent,
  SizeConfig,
  SizeManager,
  SizeManagerOptions,
  SizeMode,
} from '../types'
import { globalConfigCache, globalCSSVariableCache } from './cache-manager'
import { CSSVariableGenerator } from './css-generator'
import { CSSInjector } from './css-injector'
import { globalPerformanceMonitor } from './performance-monitor'
import { getSizeConfig } from './presets'
import { SizeStorageManager } from './storage-manager'

/**
 * 默认尺寸管理器选项
 */
const DEFAULT_OPTIONS: Required<SizeManagerOptions> = {
  prefix: '--ls',
  defaultMode: 'medium',
  styleId: 'ldesign-size-variables',
  selector: ':root',
  autoInject: true,
  enableStorage: true,
  storageType: 'localStorage',
  enableTransition: true,
  transitionDuration: '0.3s',
}

/**
 * 尺寸管理器实现
 */
export class SizeManagerImpl implements SizeManager {
  private options: Required<SizeManagerOptions>
  private currentMode: SizeMode
  private cssGenerator: CSSVariableGenerator
  private cssInjector: CSSInjector
  private storageManager: SizeStorageManager
  private listeners: Array<(event: SizeChangeEvent) => void> = []
  private eventListeners: Map<string, Function[]> = new Map()

  constructor(options?: SizeManagerOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }

    // 初始化存储管理器
    this.storageManager = new SizeStorageManager({
      enabled: this.options.enableStorage,
      type: this.options.storageType === 'memory' ? 'localStorage' : this.options.storageType,
    })

    // 从存储中恢复尺寸模式，如果没有则使用默认值
    this.currentMode = this.storageManager.getSavedMode() || this.options.defaultMode

    // 初始化CSS生成器和注入器
    this.cssGenerator = new CSSVariableGenerator(this.options.prefix)
    this.cssInjector = new CSSInjector({
      styleId: this.options.styleId,
      selector: this.options.selector,
      enableTransition: this.options.enableTransition,
      transitionDuration: this.options.transitionDuration,
    })
  }

  /**
   * 获取当前尺寸模式
   */
  getCurrentMode(): SizeMode {
    return this.currentMode
  }

  /**
   * 设置尺寸模式（带性能监控）
   * @param mode - 要设置的尺寸模式
   * @throws {Error} 当传入无效的尺寸模式时抛出错误
   */
  async setMode(mode: SizeMode): Promise<void> {
    const endMeasure = globalPerformanceMonitor.startMeasure('mode-switch', { from: this.currentMode, to: mode })

    try {
      // 输入验证
      if (!mode || typeof mode !== 'string') {
        throw new Error('Invalid size mode: mode must be a non-empty string')
      }

      const validModes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
      if (!validModes.includes(mode)) {
        throw new Error(`Invalid size mode: ${mode}. Valid modes are: ${validModes.join(', ')}`)
      }

      if (mode === this.currentMode) {
        return
      }

      const previousMode = this.currentMode
      this.currentMode = mode

      // 保存到存储
      if (this.options.enableStorage) {
        this.storageManager.saveCurrentMode(mode)
      }

      // 重新注入CSS
      if (this.options.autoInject) {
        this.injectCSS()
      }

      // 触发变化事件
      const changeEvent = {
        previousMode,
        currentMode: mode,
        timestamp: Date.now(),
      }

      this.emitSizeChange(changeEvent)
      this.emit('size-changed', changeEvent)
    }
    catch (error) {
      // 如果出错，恢复之前的模式
      throw new Error(`Failed to set size mode: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    finally {
      endMeasure()
    }
  }

  /**
   * 获取尺寸配置（带缓存）
   */
  getConfig(mode?: SizeMode): SizeConfig {
    const targetMode = mode || this.currentMode

    // 尝试从缓存获取
    const cached = globalConfigCache.get(targetMode)
    if (cached) {
      return cached
    }

    // 获取配置并缓存
    const config = getSizeConfig(targetMode)
    globalConfigCache.set(targetMode, config)
    return config
  }

  /**
   * 生成CSS变量（带缓存）
   */
  generateCSSVariables(mode?: SizeMode): Record<string, string> {
    const targetMode = mode || this.currentMode

    // 尝试从缓存获取
    const cached = globalCSSVariableCache.get(targetMode)
    if (cached) {
      return cached
    }

    // 生成变量并缓存
    const endMeasure = globalPerformanceMonitor.startMeasure('css-injection', { mode: targetMode })
    const config = this.getConfig(targetMode)
    const variables = this.cssGenerator.generateVariables(config)
    globalCSSVariableCache.set(targetMode, variables)
    endMeasure()

    return variables
  }

  /**
   * 注入CSS变量（带性能监控）
   */
  injectCSS(mode?: SizeMode): void {
    const endMeasure = globalPerformanceMonitor.startMeasure('css-injection', { mode })
    const variables = this.generateCSSVariables(mode)
    this.cssInjector.injectVariables(variables)
    endMeasure()
  }

  /**
   * 移除CSS变量
   */
  removeCSS(): void {
    this.cssInjector.removeCSS()
  }

  /**
   * 监听尺寸变化
   */
  onSizeChange(callback: (event: SizeChangeEvent) => void): () => void {
    this.listeners.push(callback)

    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 初始化管理器
   */
  async init(): Promise<void> {
    // 自动注入初始样式
    if (this.options.autoInject) {
      this.injectCSS()
    }
  }

  /**
   * 监听事件
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  /**
   * 移除事件监听
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data)
        }
        catch (error) {
          console.error(`[SizeManager] Event callback error for "${event}":`, error)
        }
      })
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.removeCSS()
    this.listeners.length = 0
    this.eventListeners.clear()
  }

  /**
   * 触发尺寸变化事件
   */
  private emitSizeChange(event: SizeChangeEvent): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event)
      }
      catch (error) {
        console.error('Error in size change callback:', error)
      }
    })
  }

  /**
   * 获取CSS生成器
   */
  getCSSGenerator(): CSSVariableGenerator {
    return this.cssGenerator
  }

  /**
   * 获取CSS注入器
   */
  getCSSInjector(): CSSInjector {
    return this.cssInjector
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<SizeManagerOptions>): void {
    const oldOptions = { ...this.options }
    this.options = { ...this.options, ...options }

    // 如果前缀改变，更新CSS生成器
    if (options.prefix && options.prefix !== oldOptions.prefix) {
      this.cssGenerator.updatePrefix(options.prefix)
    }

    // 如果注入器选项改变，更新CSS注入器
    if (options.styleId || options.selector) {
      this.cssInjector.updateOptions({
        styleId: options.styleId,
        selector: options.selector,
      })
    }

    // 如果自动注入开启，重新注入CSS
    if (this.options.autoInject) {
      this.injectCSS()
    }
  }

  /**
   * 获取当前选项
   */
  getOptions(): Required<SizeManagerOptions> {
    return { ...this.options }
  }

  /**
   * 检查是否已注入CSS
   */
  isInjected(): boolean {
    return this.cssInjector.isInjected()
  }
}

/**
 * 全局尺寸管理器实例
 */
export const globalSizeManager = new SizeManagerImpl()

/**
 * 创建尺寸管理器实例
 */
export function createSizeManager(options?: SizeManagerOptions): SizeManager {
  return new SizeManagerImpl(options)
}

/**
 * 便捷函数：设置全局尺寸模式
 */
export function setGlobalSizeMode(mode: SizeMode): void {
  globalSizeManager.setMode(mode)
}

/**
 * 便捷函数：获取全局尺寸模式
 */
export function getGlobalSizeMode(): SizeMode {
  return globalSizeManager.getCurrentMode()
}

/**
 * 便捷函数：监听全局尺寸变化
 */
export function onGlobalSizeChange(
  callback: (event: SizeChangeEvent) => void,
): () => void {
  return globalSizeManager.onSizeChange(callback)
}
