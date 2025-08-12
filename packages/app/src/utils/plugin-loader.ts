/**
 * 插件懒加载工具
 *
 * 提供插件的按需加载和性能优化功能
 */

import type { EnginePlugin } from '@ldesign/engine'

/**
 * 插件加载配置
 */
export interface PluginLoadConfig {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 是否立即加载 */
  immediate?: boolean
  /** 延迟加载时间（毫秒） */
  delay?: number
  /** 加载条件 */
  condition?: () => boolean | Promise<boolean>
  /** 依赖的插件 */
  dependencies?: string[]
  /** 插件创建函数 */
  factory: () => Promise<EnginePlugin>
}

/**
 * 插件加载器
 */
export class PluginLoader {
  private loadedPlugins = new Map<string, EnginePlugin>()
  private loadingPromises = new Map<string, Promise<EnginePlugin>>()
  private configs = new Map<string, PluginLoadConfig>()

  /**
   * 注册插件配置
   */
  register(config: PluginLoadConfig): void {
    this.configs.set(config.name, config)
    console.log(`📋 注册插件配置: ${config.name}@${config.version}`)
  }

  /**
   * 批量注册插件配置
   */
  registerAll(configs: PluginLoadConfig[]): void {
    configs.forEach(config => this.register(config))
  }

  /**
   * 加载插件
   */
  async load(name: string): Promise<EnginePlugin> {
    // 如果已经加载，直接返回
    if (this.loadedPlugins.has(name)) {
      return this.loadedPlugins.get(name)!
    }

    // 如果正在加载，返回加载 Promise
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!
    }

    const config = this.configs.get(name)
    if (!config) {
      throw new Error(`插件配置未找到: ${name}`)
    }

    console.log(`⏳ 开始加载插件: ${name}`)
    const startTime = performance.now()

    // 创建加载 Promise
    const loadingPromise = this.loadPlugin(config)
    this.loadingPromises.set(name, loadingPromise)

    try {
      const plugin = await loadingPromise
      this.loadedPlugins.set(name, plugin)
      this.loadingPromises.delete(name)

      const loadTime = Math.round(performance.now() - startTime)
      console.log(`✅ 插件加载完成: ${name} (${loadTime}ms)`)

      return plugin
    } catch (error) {
      this.loadingPromises.delete(name)
      console.error(`❌ 插件加载失败: ${name}`, error)
      throw error
    }
  }

  /**
   * 批量加载插件
   */
  async loadAll(names: string[]): Promise<EnginePlugin[]> {
    console.log(`🚀 批量加载插件: [${names.join(', ')}]`)
    const startTime = performance.now()

    const plugins = await Promise.all(names.map(name => this.load(name)))

    const totalTime = Math.round(performance.now() - startTime)
    console.log(`✅ 批量加载完成: ${names.length} 个插件 (${totalTime}ms)`)

    return plugins
  }

  /**
   * 预加载插件（不等待完成）
   */
  preload(name: string): void {
    const config = this.configs.get(name)
    if (
      !config ||
      this.loadedPlugins.has(name) ||
      this.loadingPromises.has(name)
    ) {
      return
    }

    console.log(`🔄 预加载插件: ${name}`)

    // 延迟预加载
    const delay = config.delay || 0
    setTimeout(() => {
      this.load(name).catch(error => {
        console.warn(`⚠️ 预加载失败: ${name}`, error)
      })
    }, delay)
  }

  /**
   * 检查插件是否已加载
   */
  isLoaded(name: string): boolean {
    return this.loadedPlugins.has(name)
  }

  /**
   * 获取已加载的插件
   */
  getLoaded(name: string): EnginePlugin | undefined {
    return this.loadedPlugins.get(name)
  }

  /**
   * 获取加载统计信息
   */
  getStats(): {
    loaded: number
    loading: number
    registered: number
    loadedPlugins: string[]
    loadingPlugins: string[]
  } {
    return {
      loaded: this.loadedPlugins.size,
      loading: this.loadingPromises.size,
      registered: this.configs.size,
      loadedPlugins: Array.from(this.loadedPlugins.keys()),
      loadingPlugins: Array.from(this.loadingPromises.keys()),
    }
  }

  /**
   * 内部加载插件方法
   */
  private async loadPlugin(config: PluginLoadConfig): Promise<EnginePlugin> {
    // 检查加载条件
    if (config.condition) {
      const shouldLoad = await config.condition()
      if (!shouldLoad) {
        throw new Error(`插件加载条件不满足: ${config.name}`)
      }
    }

    // 加载依赖插件
    if (config.dependencies && config.dependencies.length > 0) {
      console.log(`📦 加载依赖插件: ${config.dependencies.join(', ')}`)
      await Promise.all(config.dependencies.map(dep => this.load(dep)))
    }

    // 创建插件实例
    return await config.factory()
  }

  /**
   * 清理资源
   */
  clear(): void {
    this.loadedPlugins.clear()
    this.loadingPromises.clear()
    this.configs.clear()
    console.log('🧹 插件加载器已清理')
  }
}

/**
 * 全局插件加载器实例
 */
export const pluginLoader = new PluginLoader()

/**
 * 创建插件加载配置的辅助函数
 */
export function createPluginConfig(config: PluginLoadConfig): PluginLoadConfig {
  return config
}

/**
 * 性能监控装饰器
 */
export function withPerformanceMonitoring<T extends EnginePlugin>(
  pluginFactory: () => Promise<T>
): () => Promise<T> {
  return async () => {
    const startTime = performance.now()
    const plugin = await pluginFactory()
    const loadTime = Math.round(performance.now() - startTime)

    console.log(`⚡ 插件性能: ${plugin.name} 创建耗时 ${loadTime}ms`)

    return plugin
  }
}

/**
 * 缓存装饰器
 */
export function withCache<T extends EnginePlugin>(
  pluginFactory: () => Promise<T>
): () => Promise<T> {
  let cachedPlugin: T | null = null

  return async () => {
    if (cachedPlugin) {
      console.log(`💾 使用缓存插件: ${cachedPlugin.name}`)
      return cachedPlugin
    }

    cachedPlugin = await pluginFactory()
    console.log(`💾 缓存插件: ${cachedPlugin.name}`)
    return cachedPlugin
  }
}
