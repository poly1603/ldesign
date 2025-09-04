/**
 * 基础构建器抽象类
 * @module BaseBuilder
 * @description 提供所有构建器的基础功能和通用接口定义
 * 
 * @example
 * ```typescript
 * // 继承BaseBuilder创建自定义构建器
 * class MyBuilder extends BaseBuilder<MyConfig> {
 *   async build(): Promise<BuildResult> {
 *     // 实现构建逻辑
 *   }
 * }
 * ```
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import type { 
  BuildResult, 
  BuildMode, 
  BuildEnvironment,
  BaseBuilderConfig,
  BuilderEvents,
  PluginConfig 
} from '../types'

/**
 * 构建器抽象基类
 * @abstract
 * @class BaseBuilder
 * @extends EventEmitter
 * @description 所有构建器的基础抽象类，提供通用功能实现和标准化接口
 */
export abstract class BaseBuilder<T extends BaseBuilderConfig = BaseBuilderConfig> extends EventEmitter {
  /**
   * 构建器配置
   * @protected
   * @type {T}
   */
  protected config: T

  /**
   * 构建器是否已销毁
   * @protected
   * @type {boolean}
   */
  protected isDestroyed: boolean = false

  /**
   * 构建器名称
   * @protected
   * @type {string}
   */
  protected readonly builderName: string

  /**
   * 插件列表
   * @protected
   * @type {any[]}
   */
  protected plugins: any[] = []

  /**
   * 构建开始时间
   * @protected
   * @type {number}
   */
  protected buildStartTime?: number

  /**
   * 构建器构造函数
   * @constructor
   * @param {T} config - 构建器配置对象
   * @param {string} builderName - 构建器名称
   */
  constructor(config: T, builderName: string) {
    super()
    this.builderName = builderName
    this.config = this.normalizeConfig(config)
    this.initializePlugins()
  }

  /**
   * 标准化配置
   * @protected
   * @abstract
   * @param {T} config - 原始配置对象
   * @returns {T} 标准化后的配置对象
   * @description 子类必须实现此方法来标准化特定的配置
   */
  protected abstract normalizeConfig(config: T): T

  /**
   * 执行构建
   * @abstract
   * @returns {Promise<BuildResult>} 构建结果
   * @description 子类必须实现此方法来执行实际的构建过程
   */
  abstract build(): Promise<BuildResult>

  /**
   * 监听模式构建
   * @abstract
   * @returns {Promise<void>}
   * @description 子类必须实现此方法来支持监听模式
   */
  abstract watch(): Promise<void>

  /**
   * 初始化插件
   * @protected
   * @description 初始化配置中定义的插件
   */
  protected initializePlugins(): void {
    // 如果配置中有插件，进行初始化
    if (this.config.plugins) {
      this.plugins = this.config.plugins as any[]
    }
  }

  /**
   * 触发构建开始事件
   * @protected
   * @param {BuildMode} mode - 构建模式
   */
  protected emitBuildStart(mode: BuildMode): void {
    this.buildStartTime = Date.now()
    this.emit('build:start', { 
      mode, 
      config: this.config,
      builderName: this.builderName 
    })
  }

  /**
   * 触发构建结束事件
   * @protected
   * @param {BuildResult} result - 构建结果
   */
  protected emitBuildEnd(result: BuildResult): void {
    this.emit('build:end', { 
      result,
      builderName: this.builderName 
    })
  }

  /**
   * 触发构建错误事件
   * @protected
   * @param {Error} error - 错误对象
   */
  protected emitBuildError(error: Error): void {
    this.emit('build:error', { 
      error,
      builderName: this.builderName 
    })
  }

  /**
   * 创建构建结果对象
   * @protected
   * @param {boolean} success - 是否成功
   * @param {any[]} outputs - 输出文件列表
   * @param {string[]} errors - 错误信息列表
   * @param {string[]} warnings - 警告信息列表
   * @returns {BuildResult} 构建结果对象
   */
  protected createBuildResult(
    success: boolean,
    outputs: any[] = [],
    errors: string[] = [],
    warnings: string[] = []
  ): BuildResult {
    const duration = this.buildStartTime 
      ? Date.now() - this.buildStartTime 
      : 0

    return {
      success,
      duration,
      outputs,
      errors,
      warnings,
      metadata: {
        builderName: this.builderName,
        environment: this.config.env,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 获取配置
   * @returns {T} 当前配置的副本
   * @description 返回配置的深拷贝，防止外部修改
   */
  getConfig(): T {
    return JSON.parse(JSON.stringify(this.config))
  }

  /**
   * 更新配置
   * @param {Partial<T>} config - 要更新的配置项
   * @description 合并新配置到现有配置中
   */
  setConfig(config: Partial<T>): void {
    if (this.isDestroyed) {
      throw new Error(`${this.builderName} 已被销毁`)
    }
    
    this.config = this.normalizeConfig({
      ...this.config,
      ...config
    })
    
    // 重新初始化插件
    this.initializePlugins()
  }

  /**
   * 添加插件
   * @param {any} plugin - 要添加的插件
   * @description 动态添加插件到构建器
   */
  addPlugin(plugin: any): void {
    if (this.isDestroyed) {
      throw new Error(`${this.builderName} 已被销毁`)
    }

    if (!this.plugins) {
      this.plugins = []
    }
    
    this.plugins.push(plugin)
    
    // 同步更新配置中的插件列表
    if (!this.config.plugins) {
      (this.config as any).plugins = []
    }
    (this.config.plugins as any[]).push(plugin)
  }

  /**
   * 移除插件
   * @param {string} pluginName - 插件名称
   * @description 根据名称移除插件
   */
  removePlugin(pluginName: string): void {
    if (this.isDestroyed) {
      throw new Error(`${this.builderName} 已被销毁`)
    }

    // 从插件列表中移除
    this.plugins = this.plugins.filter(
      plugin => plugin.name !== pluginName
    )
    
    // 同步更新配置中的插件列表
    if (this.config.plugins) {
      (this.config as any).plugins = (this.config.plugins as any[]).filter(
        plugin => plugin.name !== pluginName
      )
    }
  }

  /**
   * 获取所有插件
   * @returns {any[]} 插件列表
   */
  getPlugins(): any[] {
    return [...this.plugins]
  }

  /**
   * 检查构建器是否已销毁
   * @protected
   * @throws {Error} 如果构建器已销毁则抛出错误
   */
  protected checkDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error(`${this.builderName} 已被销毁`)
    }
  }

  /**
   * 销毁构建器
   * @returns {Promise<void>}
   * @description 清理资源并销毁构建器实例
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true
    
    // 清理插件
    this.plugins = []
    
    // 移除所有事件监听器
    this.removeAllListeners()
    
    // 触发销毁事件
    this.emit('builder:destroyed', { 
      builderName: this.builderName 
    })
  }

  /**
   * 验证配置
   * @protected
   * @param {T} config - 要验证的配置
   * @returns {boolean} 配置是否有效
   * @description 子类可以重写此方法来添加特定的验证逻辑
   */
  protected validateConfig(config: T): boolean {
    // 基础验证逻辑
    if (!config) {
      return false
    }

    // 检查环境配置
    if (config.env && !['development', 'production', 'test'].includes(config.env)) {
      console.warn(`无效的环境配置: ${config.env}`)
      return false
    }

    return true
  }

  /**
   * 合并配置
   * @protected
   * @param {Partial<T>} base - 基础配置
   * @param {Partial<T>} override - 覆盖配置
   * @returns {T} 合并后的配置
   * @description 深度合并两个配置对象
   */
  protected mergeConfig(base: Partial<T>, override: Partial<T>): T {
    const result = { ...base } as T

    for (const [key, value] of Object.entries(override)) {
      if (value !== undefined) {
        if (
          typeof value === 'object' && 
          value !== null && 
          !Array.isArray(value) &&
          typeof base[key as keyof T] === 'object' &&
          base[key as keyof T] !== null &&
          !Array.isArray(base[key as keyof T])
        ) {
          // 递归合并对象
          (result as any)[key] = this.mergeConfig(
            base[key as keyof T] as any,
            value
          )
        } else {
          // 直接覆盖
          (result as any)[key] = value
        }
      }
    }

    return result
  }

  /**
   * 获取构建器名称
   * @returns {string} 构建器名称
   */
  getBuilderName(): string {
    return this.builderName
  }

  /**
   * 获取构建器状态
   * @returns {object} 构建器状态信息
   */
  getStatus(): {
    name: string
    isDestroyed: boolean
    hasPlugins: boolean
    pluginCount: number
    environment: BuildEnvironment | undefined
  } {
    return {
      name: this.builderName,
      isDestroyed: this.isDestroyed,
      hasPlugins: this.plugins.length > 0,
      pluginCount: this.plugins.length,
      environment: this.config.env
    }
  }
}
