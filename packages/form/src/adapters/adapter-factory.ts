/**
 * 适配器工厂
 * 
 * 负责创建和管理不同框架的适配器实例
 * 提供统一的适配器创建接口
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { BaseAdapter } from './base-adapter'
import { VanillaAdapter } from './vanilla-adapter'
import type { AdapterConfig } from './base-adapter'

/**
 * 支持的框架类型
 */
export type SupportedFramework = 'vanilla' | 'vue' | 'react' | 'angular'

/**
 * 适配器实例类型
 */
export type AdapterInstance = BaseAdapter

/**
 * 适配器构造函数类型
 */
type AdapterConstructor = new (config?: Partial<AdapterConfig>) => BaseAdapter

/**
 * 适配器工厂类
 * 
 * 提供适配器的创建、注册和管理功能
 */
export class AdapterFactory {
  /** 适配器注册表 */
  private static adapters: Map<SupportedFramework, AdapterConstructor> = new Map()
  
  /** 适配器实例缓存 */
  private static instances: Map<string, BaseAdapter> = new Map()

  /**
   * 初始化内置适配器
   */
  static {
    this.registerBuiltinAdapters()
  }

  /**
   * 注册适配器
   * 
   * @param framework 框架名称
   * @param AdapterClass 适配器类
   */
  static registerAdapter(framework: SupportedFramework, AdapterClass: AdapterConstructor): void {
    this.adapters.set(framework, AdapterClass)
  }

  /**
   * 创建适配器实例
   * 
   * @param framework 框架名称
   * @param config 适配器配置
   * @returns 适配器实例
   */
  static createAdapter(
    framework: SupportedFramework,
    config: Partial<AdapterConfig> = {}
  ): BaseAdapter {
    const AdapterClass = this.adapters.get(framework)
    
    if (!AdapterClass) {
      throw new Error(`Unsupported framework: ${framework}`)
    }
    
    // 检查缓存
    const cacheKey = this.getCacheKey(framework, config)
    const cachedInstance = this.instances.get(cacheKey)
    
    if (cachedInstance && !cachedInstance.isDestroyed()) {
      return cachedInstance
    }
    
    // 创建新实例
    const adapter = new AdapterClass(config)
    
    // 检查是否支持当前环境
    if (!adapter.isSupported()) {
      throw new Error(`Framework "${framework}" is not supported in this environment`)
    }
    
    // 缓存实例
    this.instances.set(cacheKey, adapter)
    
    return adapter
  }

  /**
   * 获取适配器实例（如果存在）
   * 
   * @param framework 框架名称
   * @param config 适配器配置
   * @returns 适配器实例或undefined
   */
  static getAdapter(
    framework: SupportedFramework,
    config: Partial<AdapterConfig> = {}
  ): BaseAdapter | undefined {
    const cacheKey = this.getCacheKey(framework, config)
    const instance = this.instances.get(cacheKey)
    
    return instance && !instance.isDestroyed() ? instance : undefined
  }

  /**
   * 销毁适配器实例
   * 
   * @param framework 框架名称
   * @param config 适配器配置
   */
  static destroyAdapter(
    framework: SupportedFramework,
    config: Partial<AdapterConfig> = {}
  ): void {
    const cacheKey = this.getCacheKey(framework, config)
    const instance = this.instances.get(cacheKey)
    
    if (instance) {
      instance.destroy()
      this.instances.delete(cacheKey)
    }
  }

  /**
   * 销毁所有适配器实例
   */
  static destroyAllAdapters(): void {
    for (const instance of this.instances.values()) {
      instance.destroy()
    }
    this.instances.clear()
  }

  /**
   * 检查框架是否受支持
   * 
   * @param framework 框架名称
   * @returns 是否受支持
   */
  static isFrameworkSupported(framework: string): framework is SupportedFramework {
    return this.adapters.has(framework as SupportedFramework)
  }

  /**
   * 获取所有支持的框架
   * 
   * @returns 支持的框架列表
   */
  static getSupportedFrameworks(): SupportedFramework[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * 检测当前环境最适合的框架
   * 
   * @returns 推荐的框架名称
   */
  static detectFramework(): SupportedFramework {
    // 检测Vue
    if (typeof window !== 'undefined' && (window as any).Vue) {
      return 'vue'
    }
    
    // 检测React
    if (typeof window !== 'undefined' && (window as any).React) {
      return 'react'
    }
    
    // 检测Angular
    if (typeof window !== 'undefined' && (window as any).ng) {
      return 'angular'
    }
    
    // 默认使用原生JavaScript
    return 'vanilla'
  }

  /**
   * 自动创建适配器
   * 
   * 根据当前环境自动选择最适合的适配器
   * 
   * @param config 适配器配置
   * @returns 适配器实例
   */
  static createAutoAdapter(config: Partial<AdapterConfig> = {}): BaseAdapter {
    const framework = this.detectFramework()
    return this.createAdapter(framework, config)
  }

  /**
   * 注册内置适配器
   */
  private static registerBuiltinAdapters(): void {
    // 注册原生JavaScript适配器
    this.registerAdapter('vanilla', VanillaAdapter)
    
    // TODO: 注册其他框架适配器
    // this.registerAdapter('vue', VueAdapter)
    // this.registerAdapter('react', ReactAdapter)
    // this.registerAdapter('angular', AngularAdapter)
  }

  /**
   * 生成缓存键
   */
  private static getCacheKey(framework: SupportedFramework, config: Partial<AdapterConfig>): string {
    const configStr = JSON.stringify(config, Object.keys(config).sort())
    return `${framework}:${configStr}`
  }
}

/**
 * 便捷函数：创建原生JavaScript适配器
 * 
 * @param config 适配器配置
 * @returns 原生JavaScript适配器实例
 */
export function createVanillaAdapter(config: Partial<AdapterConfig> = {}): VanillaAdapter {
  return AdapterFactory.createAdapter('vanilla', config) as VanillaAdapter
}

/**
 * 便捷函数：自动创建适配器
 * 
 * @param config 适配器配置
 * @returns 适配器实例
 */
export function createAutoAdapter(config: Partial<AdapterConfig> = {}): BaseAdapter {
  return AdapterFactory.createAutoAdapter(config)
}

/**
 * 便捷函数：检测当前环境
 * 
 * @returns 推荐的框架名称
 */
export function detectFramework(): SupportedFramework {
  return AdapterFactory.detectFramework()
}
