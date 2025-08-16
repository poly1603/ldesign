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
import { CSSVariableGenerator } from './css-generator'
import { CSSInjector } from './css-injector'
import { getSizeConfig } from './presets'

/**
 * 默认尺寸管理器选项
 */
const DEFAULT_OPTIONS: Required<SizeManagerOptions> = {
  prefix: '--ls',
  defaultMode: 'medium',
  styleId: 'ldesign-size-variables',
  selector: ':root',
  autoInject: true,
}

/**
 * 尺寸管理器实现
 */
export class SizeManagerImpl implements SizeManager {
  private options: Required<SizeManagerOptions>
  private currentMode: SizeMode
  private cssGenerator: CSSVariableGenerator
  private cssInjector: CSSInjector
  private listeners: Array<(event: SizeChangeEvent) => void> = []

  constructor(options?: SizeManagerOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.currentMode = this.options.defaultMode

    // 初始化CSS生成器和注入器
    this.cssGenerator = new CSSVariableGenerator(this.options.prefix)
    this.cssInjector = new CSSInjector({
      styleId: this.options.styleId,
      selector: this.options.selector,
    })

    // 自动注入初始样式
    if (this.options.autoInject) {
      this.injectCSS()
    }
  }

  /**
   * 获取当前尺寸模式
   */
  getCurrentMode(): SizeMode {
    return this.currentMode
  }

  /**
   * 设置尺寸模式
   */
  setMode(mode: SizeMode): void {
    if (mode === this.currentMode) {
      return
    }

    const previousMode = this.currentMode
    this.currentMode = mode

    // 重新注入CSS
    if (this.options.autoInject) {
      this.injectCSS()
    }

    // 触发变化事件
    this.emitSizeChange({
      previousMode,
      currentMode: mode,
      timestamp: Date.now(),
    })
  }

  /**
   * 获取尺寸配置
   */
  getConfig(mode?: SizeMode): SizeConfig {
    const targetMode = mode || this.currentMode
    return getSizeConfig(targetMode)
  }

  /**
   * 生成CSS变量
   */
  generateCSSVariables(mode?: SizeMode): Record<string, string> {
    const config = this.getConfig(mode)
    return this.cssGenerator.generateVariables(config)
  }

  /**
   * 注入CSS变量
   */
  injectCSS(mode?: SizeMode): void {
    const variables = this.generateCSSVariables(mode)
    this.cssInjector.injectVariables(variables)
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
   * 销毁管理器
   */
  destroy(): void {
    this.removeCSS()
    this.listeners.length = 0
  }

  /**
   * 触发尺寸变化事件
   */
  private emitSizeChange(event: SizeChangeEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
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
  callback: (event: SizeChangeEvent) => void
): () => void {
  return globalSizeManager.onSizeChange(callback)
}
