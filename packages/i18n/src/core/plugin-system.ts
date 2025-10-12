/**
 * 插件系统
 * 
 * 提供灵活的插件架构，支持按需加载功能
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import type { I18n } from './i18n'
import { getGlobalMemoryOptimizer } from './memory-optimizer'

/**
 * 插件生命周期钩子
 */
export interface PluginHooks {
  beforeInit?: () => void | Promise<void>
  afterInit?: (i18n: I18n) => void | Promise<void>
  beforeTranslate?: (key: string, locale: string) => void | string
  afterTranslate?: (key: string, result: string) => string
  beforeLocaleChange?: (oldLocale: string, newLocale: string) => boolean | Promise<boolean>
  afterLocaleChange?: (locale: string) => void | Promise<void>
  onError?: (error: Error) => void
  onDestroy?: () => void | Promise<void>
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  priority?: number // 执行优先级，数字越小优先级越高
  lazy?: boolean // 是否懒加载
}

/**
 * 插件接口
 */
export interface I18nPlugin {
  metadata: PluginMetadata
  hooks?: PluginHooks
  install: (i18n: I18n, options?: any) => void | Promise<void>
  uninstall?: () => void | Promise<void>
}

/**
 * 插件加载选项
 */
export interface PluginLoadOptions {
  lazy?: boolean
  priority?: number
  enabled?: boolean
  options?: any
}

/**
 * 插件状态
 */
export enum PluginStatus {
  PENDING = 'pending',
  LOADING = 'loading',
  LOADED = 'loaded',
  FAILED = 'failed',
  DISABLED = 'disabled',
}

/**
 * 插件注册项
 */
interface PluginEntry {
  plugin: I18nPlugin
  status: PluginStatus
  options?: any
  error?: Error
  loadTime?: number
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins = new Map<string, PluginEntry>()
  private hooks = new Map<keyof PluginHooks, Array<(...args: any[]) => any>>()
  private i18n?: I18n
  private memoryOptimizer = getGlobalMemoryOptimizer()
  
  /**
   * 注册插件
   */
  async register(plugin: I18nPlugin, options?: PluginLoadOptions): Promise<void> {
    const name = plugin.metadata.name
    
    // 检查是否已注册
    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`)
    }
    
    // 检查依赖
    await this.checkDependencies(plugin)
    
    // 注册插件
    this.plugins.set(name, {
      plugin,
      status: PluginStatus.PENDING,
      options: options?.options,
    })
    
    // 如果不是懒加载，立即加载
    if (!plugin.metadata.lazy && !options?.lazy) {
      await this.load(name)
    }
  }
  
  /**
   * 加载插件
   */
  async load(name: string): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry) {
      throw new Error(`Plugin "${name}" not found`)
    }
    
    if (entry.status === PluginStatus.LOADED) {
      return // 已加载
    }
    
    entry.status = PluginStatus.LOADING
    const startTime = performance.now()
    
    try {
      // 执行安装
      if (this.i18n) {
        await entry.plugin.install(this.i18n, entry.options)
      }
      
      // 注册钩子
      this.registerHooks(entry.plugin)
      
      entry.status = PluginStatus.LOADED
      entry.loadTime = performance.now() - startTime
      
      // 内存优化
      this.memoryOptimizer.set(`plugin:${name}`, {
        name,
        loadTime: entry.loadTime,
      })
      
      console.log(`Plugin "${name}" loaded in ${entry.loadTime.toFixed(2)}ms`)
    } catch (error) {
      entry.status = PluginStatus.FAILED
      entry.error = error as Error
      throw error
    }
  }
  
  /**
   * 卸载插件
   */
  async unload(name: string): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry) return
    
    // 执行卸载钩子
    if (entry.plugin.uninstall) {
      await entry.plugin.uninstall()
    }
    
    // 移除钩子
    this.unregisterHooks(entry.plugin)
    
    // 清理内存
    this.memoryOptimizer.delete(`plugin:${name}`)
    
    this.plugins.delete(name)
  }
  
  /**
   * 启用插件
   */
  async enable(name: string): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry) {
      throw new Error(`Plugin "${name}" not found`)
    }
    
    if (entry.status === PluginStatus.DISABLED) {
      await this.load(name)
    }
  }
  
  /**
   * 禁用插件
   */
  disable(name: string): void {
    const entry = this.plugins.get(name)
    if (!entry) return
    
    // 移除钩子但保留注册
    this.unregisterHooks(entry.plugin)
    entry.status = PluginStatus.DISABLED
  }
  
  /**
   * 获取插件
   */
  get(name: string): I18nPlugin | undefined {
    return this.plugins.get(name)?.plugin
  }
  
  /**
   * 获取所有插件
   */
  getAll(): I18nPlugin[] {
    return Array.from(this.plugins.values())
      .filter(entry => entry.status === PluginStatus.LOADED)
      .map(entry => entry.plugin)
  }
  
  /**
   * 检查插件是否已加载
   */
  isLoaded(name: string): boolean {
    const entry = this.plugins.get(name)
    return entry?.status === PluginStatus.LOADED
  }
  
  /**
   * 执行钩子
   */
  async executeHook<K extends keyof PluginHooks>(
    hook: K,
    ...args: Parameters<NonNullable<PluginHooks[K]>>
  ): Promise<any> {
    const handlers = this.hooks.get(hook) || []
    let result = args[0]
    
    for (const handler of handlers) {
      const handlerResult = await handler(...args)
      // 某些钩子返回值会影响流程
      if (hook === 'beforeTranslate' && handlerResult) {
        result = handlerResult
      } else if (hook === 'afterTranslate' && handlerResult) {
        result = handlerResult
      } else if (hook === 'beforeLocaleChange' && handlerResult === false) {
        return false // 阻止语言切换
      }
    }
    
    return result
  }
  
  /**
   * 设置i18n实例
   */
  setI18n(i18n: I18n): void {
    this.i18n = i18n
    
    // 为已加载的插件设置i18n
    for (const entry of this.plugins.values()) {
      if (entry.status === PluginStatus.LOADED && !this.i18n) {
        entry.plugin.install(i18n, entry.options)
      }
    }
  }
  
  /**
   * 获取插件状态
   */
  getStatus(): Record<string, {
    status: PluginStatus
    loadTime?: number
    error?: string
  }> {
    const status: Record<string, any> = {}
    
    for (const [name, entry] of this.plugins) {
      status[name] = {
        status: entry.status,
        loadTime: entry.loadTime,
        error: entry.error?.message,
      }
    }
    
    return status
  }
  
  // 私有方法
  
  private async checkDependencies(plugin: I18nPlugin): Promise<void> {
    const dependencies = plugin.metadata.dependencies || []
    
    for (const dep of dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Plugin "${plugin.metadata.name}" requires "${dep}" to be registered first`)
      }
      
      // 确保依赖已加载
      await this.load(dep)
    }
  }
  
  private registerHooks(plugin: I18nPlugin): void {
    if (!plugin.hooks) return
    
    for (const [hookName, handler] of Object.entries(plugin.hooks)) {
      if (handler) {
        const handlers = this.hooks.get(hookName as keyof PluginHooks) || []
        handlers.push(handler as any)
        
        // 按优先级排序
        handlers.sort((a, b) => {
          const aPriority = (a as any).__priority || 100
          const bPriority = (b as any).__priority || 100
          return aPriority - bPriority
        })
        
        this.hooks.set(hookName as keyof PluginHooks, handlers)
      }
    }
  }
  
  private unregisterHooks(plugin: I18nPlugin): void {
    if (!plugin.hooks) return
    
    for (const [hookName, handler] of Object.entries(plugin.hooks)) {
      if (handler) {
        const handlers = this.hooks.get(hookName as keyof PluginHooks) || []
        const index = handlers.indexOf(handler as any)
        if (index > -1) {
          handlers.splice(index, 1)
        }
        this.hooks.set(hookName as keyof PluginHooks, handlers)
      }
    }
  }
}

// ============ 内置插件 ============

/**
 * 性能监控插件
 */
export class PerformancePlugin implements I18nPlugin {
  metadata: PluginMetadata = {
    name: 'performance',
    version: '1.0.0',
    description: 'Performance monitoring plugin',
    priority: 1,
  }
  
  private metrics = new Map<string, number[]>()
  
  hooks: PluginHooks = {
    beforeTranslate: (key: string) => {
      this.startMeasure(key)
    },
    afterTranslate: (key: string, result: string) => {
      this.endMeasure(key)
      return result
    },
  }
  
  install(i18n: I18n): void {
    console.log('Performance monitoring enabled')
  }
  
  private startMeasure(key: string): void {
    this.metrics.set(key, [performance.now()])
  }
  
  private endMeasure(key: string): void {
    const start = this.metrics.get(key)?.[0]
    if (start) {
      const duration = performance.now() - start
      const durations = this.metrics.get(key) || []
      durations.push(duration)
      this.metrics.set(key, durations)
    }
  }
  
  getMetrics(): Record<string, { avg: number; min: number; max: number }> {
    const result: Record<string, any> = {}
    
    for (const [key, durations] of this.metrics) {
      if (durations.length > 1) {
        const validDurations = durations.slice(1) // 第一个是开始时间
        result[key] = {
          avg: validDurations.reduce((a, b) => a + b, 0) / validDurations.length,
          min: Math.min(...validDurations),
          max: Math.max(...validDurations),
        }
      }
    }
    
    return result
  }
}

/**
 * 缓存插件
 */
export class CachePlugin implements I18nPlugin {
  metadata: PluginMetadata = {
    name: 'cache',
    version: '1.0.0',
    description: 'Translation caching plugin',
    priority: 2,
  }
  
  private cache = new Map<string, string>()
  private hits = 0
  private misses = 0
  
  hooks: PluginHooks = {
    beforeTranslate: (key: string, locale: string) => {
      const cacheKey = `${locale}:${key}`
      const cached = this.cache.get(cacheKey)
      
      if (cached) {
        this.hits++
        return cached // 返回缓存的翻译
      }
      
      this.misses++
    },
    afterTranslate: (key: string, result: string) => {
      // 缓存翻译结果
      const locale = 'current' // 需要从上下文获取
      const cacheKey = `${locale}:${key}`
      this.cache.set(cacheKey, result)
      
      // 限制缓存大小
      if (this.cache.size > 1000) {
        const firstKey = this.cache.keys().next().value
        if (firstKey) this.cache.delete(firstKey)
      }
      
      return result
    },
  }
  
  install(i18n: I18n): void {
    console.log('Cache plugin enabled')
  }
  
  getStats(): { hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    }
  }
}

/**
 * 验证插件
 */
export class ValidationPlugin implements I18nPlugin {
  metadata: PluginMetadata = {
    name: 'validation',
    version: '1.0.0',
    description: 'Translation validation plugin',
    priority: 3,
  }
  
  private errors: Array<{ key: string; error: string }> = []
  
  hooks: PluginHooks = {
    afterTranslate: (key: string, result: string) => {
      // 验证翻译
      if (!result) {
        this.errors.push({ key, error: 'Empty translation' })
      }
      
      if (result.includes('{{') && !result.includes('}}')) {
        this.errors.push({ key, error: 'Unclosed interpolation' })
      }
      
      return result
    },
  }
  
  install(i18n: I18n): void {
    console.log('Validation plugin enabled')
  }
  
  getErrors(): Array<{ key: string; error: string }> {
    return [...this.errors]
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(): PluginManager {
  return new PluginManager()
}

/**
 * 创建自定义插件
 */
export function createPlugin(
  metadata: PluginMetadata,
  install: (i18n: I18n, options?: any) => void | Promise<void>,
  hooks?: PluginHooks
): I18nPlugin {
  return {
    metadata,
    hooks,
    install,
  }
}

// 全局插件管理器
let globalPluginManager: PluginManager | null = null

export function getGlobalPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = createPluginManager()
  }
  return globalPluginManager
}