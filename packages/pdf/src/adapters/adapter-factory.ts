/**
 * 适配器工厂实现
 * 提供统一的适配器创建和管理接口
 */

import { createPdfError, ErrorCode } from '../utils/error-handler'
import { createReactAdapter } from './react-adapter'
import {
  type AdapterConfig,
  type AdapterFactory,
  type FrameworkAdapter,
  FrameworkType,
} from './types'
import { createVanillaAdapter } from './vanilla-adapter'
import { createVueAdapter } from './vue-adapter'

/**
 * 适配器注册表
 */
type AdapterConstructor = (config?: Partial<AdapterConfig>) => FrameworkAdapter

const adapterRegistry = new Map<FrameworkType, AdapterConstructor>([
  [FrameworkType.VUE, createVueAdapter],
  [FrameworkType.REACT, createReactAdapter],
  [FrameworkType.VANILLA, createVanillaAdapter],
])

/**
 * 适配器工厂实现
 */
export class PdfAdapterFactory implements AdapterFactory {
  private _adapters = new Map<FrameworkType, FrameworkAdapter>()
  private _defaultConfig: Partial<AdapterConfig>

  constructor(defaultConfig: Partial<AdapterConfig> = {}) {
    this._defaultConfig = defaultConfig
  }

  /**
   * 创建适配器实例
   */
  createAdapter(
    framework: FrameworkType,
    config?: Partial<AdapterConfig>,
  ): FrameworkAdapter {
    const constructor = adapterRegistry.get(framework)
    if (!constructor) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        `Unsupported framework: ${framework}`,
      )
    }

    const mergedConfig = {
      ...this._defaultConfig,
      ...config,
      framework,
    }

    const adapter = constructor(mergedConfig)

    // 缓存适配器实例
    this._adapters.set(framework, adapter)

    return adapter
  }

  /**
   * 获取已创建的适配器实例
   */
  getAdapter(framework: FrameworkType): FrameworkAdapter | undefined {
    return this._adapters.get(framework)
  }

  /**
   * 获取或创建适配器实例
   */
  getOrCreateAdapter(
    framework: FrameworkType,
    config?: Partial<AdapterConfig>,
  ): FrameworkAdapter {
    let adapter = this._adapters.get(framework)
    if (!adapter) {
      adapter = this.createAdapter(framework, config)
    }
    return adapter
  }

  /**
   * 检查框架是否支持
   */
  isSupported(framework: FrameworkType): boolean {
    return adapterRegistry.has(framework)
  }

  /**
   * 获取支持的框架列表
   */
  getSupportedFrameworks(): FrameworkType[] {
    return Array.from(adapterRegistry.keys())
  }

  /**
   * 注册自定义适配器
   */
  registerAdapter(
    framework: FrameworkType,
    constructor: AdapterConstructor,
  ): void {
    adapterRegistry.set(framework, constructor)
  }

  /**
   * 注销适配器
   */
  unregisterAdapter(framework: FrameworkType): boolean {
    const adapter = this._adapters.get(framework)
    if (adapter) {
      // 销毁适配器实例
      adapter.destroy()
      this._adapters.delete(framework)
    }
    return adapterRegistry.delete(framework)
  }

  /**
   * 销毁所有适配器实例
   */
  destroyAll(): void {
    this._adapters.forEach((adapter) => {
      try {
        adapter.destroy()
      }
      catch (error) {
        console.error('[AdapterFactory] Error destroying adapter:', error)
      }
    })
    this._adapters.clear()
  }

  /**
   * 自动检测当前环境的框架类型
   */
  detectFramework(): FrameworkType {
    // 检测Vue
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window.Vue || (typeof global !== 'undefined' && global.Vue)) {
        return FrameworkType.VUE
      }

      // 检测React
      // @ts-ignore
      if (window.React || (typeof global !== 'undefined' && global.React)) {
        return FrameworkType.REACT
      }
    }

    // 检测Node.js环境中的框架
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        // 尝试检测Vue
        require.resolve('vue')
        return FrameworkType.VUE
      }
      catch {
        // Vue未安装
      }

      try {
        // 尝试检测React
        require.resolve('react')
        return FrameworkType.REACT
      }
      catch {
        // React未安装
      }
    }

    // 默认返回原生JavaScript
    return FrameworkType.VANILLA
  }

  /**
   * 创建自适应适配器（自动检测框架）
   */
  createAutoAdapter(config?: Partial<AdapterConfig>): FrameworkAdapter {
    const framework = this.detectFramework()
    return this.createAdapter(framework, config)
  }

  /**
   * 批量创建适配器
   */
  createAdapters(
    frameworks: FrameworkType[],
    config?: Partial<AdapterConfig>,
  ): Map<FrameworkType, FrameworkAdapter> {
    const adapters = new Map<FrameworkType, FrameworkAdapter>()

    frameworks.forEach((framework) => {
      try {
        const adapter = this.createAdapter(framework, config)
        adapters.set(framework, adapter)
      }
      catch (error) {
        console.error(`[AdapterFactory] Failed to create ${framework} adapter:`, error)
      }
    })

    return adapters
  }

  /**
   * 获取适配器统计信息
   */
  getStats(): {
    supported: number
    created: number
    frameworks: FrameworkType[]
    createdFrameworks: FrameworkType[]
  } {
    return {
      supported: adapterRegistry.size,
      created: this._adapters.size,
      frameworks: this.getSupportedFrameworks(),
      createdFrameworks: Array.from(this._adapters.keys()),
    }
  }

  /**
   * 验证适配器配置
   */
  validateConfig(config: Partial<AdapterConfig>): boolean {
    if (config.framework && !this.isSupported(config.framework)) {
      return false
    }

    if (config.componentName && typeof config.componentName !== 'string') {
      return false
    }

    if (config.debug !== undefined && typeof config.debug !== 'boolean') {
      return false
    }

    return true
  }

  /**
   * 克隆工厂实例
   */
  clone(newDefaultConfig?: Partial<AdapterConfig>): PdfAdapterFactory {
    const config = newDefaultConfig || this._defaultConfig
    return new PdfAdapterFactory(config)
  }
}

/**
 * 默认适配器工厂实例
 */
export const defaultAdapterFactory = new PdfAdapterFactory({
  debug: false,
})

/**
 * 创建适配器工厂实例
 */
export function createAdapterFactory(
  defaultConfig?: Partial<AdapterConfig>,
): PdfAdapterFactory {
  return new PdfAdapterFactory(defaultConfig)
}

/**
 * 便捷函数：创建指定框架的适配器
 */
export function createAdapter(
  framework: FrameworkType,
  config?: Partial<AdapterConfig>,
): FrameworkAdapter {
  return defaultAdapterFactory.createAdapter(framework, config)
}

/**
 * 便捷函数：自动检测并创建适配器
 */
export function createAutoAdapter(
  config?: Partial<AdapterConfig>,
): FrameworkAdapter {
  return defaultAdapterFactory.createAutoAdapter(config)
}

/**
 * 便捷函数：检查框架支持
 */
export function isFrameworkSupported(framework: FrameworkType): boolean {
  return defaultAdapterFactory.isSupported(framework)
}

/**
 * 便捷函数：获取支持的框架列表
 */
export function getSupportedFrameworks(): FrameworkType[] {
  return defaultAdapterFactory.getSupportedFrameworks()
}

/**
 * 便捷函数：检测当前框架
 */
export function detectCurrentFramework(): FrameworkType {
  return defaultAdapterFactory.detectFramework()
}
