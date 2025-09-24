/**
 * 打包优化工具
 * 🚀 提供代码分割、懒加载和打包优化功能
 */

/**
 * 懒加载模块配置
 */
interface LazyModuleConfig {
  /** 模块名称 */
  name: string
  /** 模块加载器 */
  loader: () => Promise<any>
  /** 预加载条件 */
  preload?: boolean
  /** 优先级 */
  priority?: number
}

/**
 * 代码分割配置
 */
interface CodeSplitConfig {
  /** 分割点名称 */
  name: string
  /** 分割条件 */
  condition: (module: string) => boolean
  /** 分割优先级 */
  priority?: number
}

/**
 * 打包优化器
 */
export class BundleOptimizer {
  private lazyModules = new Map<string, LazyModuleConfig>()
  private loadedModules = new Map<string, any>()
  private loadingPromises = new Map<string, Promise<any>>()
  private codeSplits = new Map<string, CodeSplitConfig>()

  // 性能监控
  private loadTimes = new Map<string, number>()
  private loadCounts = new Map<string, number>()

  /**
   * 注册懒加载模块
   */
  registerLazyModule(config: LazyModuleConfig): void {
    this.lazyModules.set(config.name, config)

    // 如果需要预加载，添加到预加载队列
    if (config.preload) {
      this.preloadModule(config.name)
    }
  }

  /**
   * 批量注册懒加载模块
   */
  registerLazyModules(configs: LazyModuleConfig[]): void {
    // 按优先级排序
    const sortedConfigs = configs.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    for (const config of sortedConfigs) {
      this.registerLazyModule(config)
    }
  }

  /**
   * 懒加载模块
   */
  async loadModule<T = any>(name: string): Promise<T> {
    // 如果已经加载，直接返回
    if (this.loadedModules.has(name)) {
      return this.loadedModules.get(name)
    }

    // 如果正在加载，返回加载Promise
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)
    }

    const config = this.lazyModules.get(name)
    if (!config) {
      throw new Error(`Lazy module "${name}" not registered`)
    }

    // 开始加载
    const startTime = performance.now()
    const loadingPromise = this.loadModuleInternal(config)
    this.loadingPromises.set(name, loadingPromise)

    try {
      const module = await loadingPromise

      // 记录加载时间和次数
      const loadTime = performance.now() - startTime
      this.loadTimes.set(name, loadTime)
      this.loadCounts.set(name, (this.loadCounts.get(name) || 0) + 1)

      // 缓存模块
      this.loadedModules.set(name, module)
      this.loadingPromises.delete(name)

      return module
    } catch (error) {
      this.loadingPromises.delete(name)
      throw error
    }
  }

  /**
   * 内部模块加载逻辑
   */
  private async loadModuleInternal(config: LazyModuleConfig): Promise<any> {
    try {
      const module = await config.loader()
      return module.default || module
    } catch (error) {
      console.error(`Failed to load lazy module "${config.name}":`, error)
      throw error
    }
  }

  /**
   * 预加载模块
   */
  async preloadModule(name: string): Promise<void> {
    try {
      await this.loadModule(name)
    } catch (error) {
      console.warn(`Failed to preload module "${name}":`, error)
    }
  }

  /**
   * 批量预加载模块
   */
  async preloadModules(names: string[]): Promise<void> {
    const promises = names.map(name => this.preloadModule(name))
    await Promise.allSettled(promises)
  }

  /**
   * 注册代码分割点
   */
  registerCodeSplit(config: CodeSplitConfig): void {
    this.codeSplits.set(config.name, config)
  }

  /**
   * 获取模块分割建议
   */
  getCodeSplitSuggestions(modules: string[]): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {}

    for (const [splitName, config] of this.codeSplits) {
      const matchingModules = modules.filter(config.condition)
      if (matchingModules.length > 0) {
        suggestions[splitName] = matchingModules
      }
    }

    return suggestions
  }

  /**
   * 获取加载统计信息
   */
  getLoadStats(): {
    totalModules: number
    loadedModules: number
    averageLoadTime: number
    slowestModule: { name: string; time: number } | null
    mostLoadedModule: { name: string; count: number } | null
  } {
    const totalModules = this.lazyModules.size
    const loadedModules = this.loadedModules.size

    // 计算平均加载时间
    const loadTimes = Array.from(this.loadTimes.values())
    const averageLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0

    // 找出最慢的模块
    let slowestModule: { name: string; time: number } | null = null
    for (const [name, time] of this.loadTimes) {
      if (!slowestModule || time > slowestModule.time) {
        slowestModule = { name, time }
      }
    }

    // 找出加载次数最多的模块
    let mostLoadedModule: { name: string; count: number } | null = null
    for (const [name, count] of this.loadCounts) {
      if (!mostLoadedModule || count > mostLoadedModule.count) {
        mostLoadedModule = { name, count }
      }
    }

    return {
      totalModules,
      loadedModules,
      averageLoadTime,
      slowestModule,
      mostLoadedModule
    }
  }

  /**
   * 清理未使用的模块
   */
  cleanupUnusedModules(): void {
    const _now = Date.now()
    const _unusedThreshold = 5 * 60 * 1000 // 5分钟

    for (const [name, module] of this.loadedModules) {
      // 如果模块有清理方法，调用它
      if (module && typeof module.cleanup === 'function') {
        try {
          module.cleanup()
        } catch (error) {
          console.warn(`Error cleaning up module "${name}":`, error)
        }
      }
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): {
    loadedModulesCount: number
    loadingPromisesCount: number
    estimatedMemoryUsage: string
  } {
    return {
      loadedModulesCount: this.loadedModules.size,
      loadingPromisesCount: this.loadingPromises.size,
      estimatedMemoryUsage: `${Math.round((this.loadedModules.size * 50) / 1024)}KB` // 粗略估算
    }
  }

  /**
   * 重置优化器
   */
  reset(): void {
    this.loadedModules.clear()
    this.loadingPromises.clear()
    this.loadTimes.clear()
    this.loadCounts.clear()
  }
}

// 全局打包优化器实例
export const globalBundleOptimizer = new BundleOptimizer()

/**
 * 创建懒加载装饰器
 */
export function LazyLoad(moduleName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // 确保模块已加载
      await globalBundleOptimizer.loadModule(moduleName)
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 动态导入工具函数
 */
export async function dynamicImport<T = any>(
  moduleLoader: () => Promise<any>,
  fallback?: T
): Promise<T> {
  try {
    const module = await moduleLoader()
    return module.default || module
  } catch (error) {
    console.error('Dynamic import failed:', error)
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}

/**
 * 预加载关键模块
 */
export function preloadCriticalModules(): void {
  // 预加载Vue相关模块
  globalBundleOptimizer.registerLazyModule({
    name: 'vue-composables',
    loader: () => import('../vue/composables'),
    preload: true,
    priority: 10
  })

  // 预加载性能分析模块
  globalBundleOptimizer.registerLazyModule({
    name: 'performance-analyzer',
    loader: () => import('./performance-analyzer'),
    preload: true,
    priority: 8
  })

  // 预加载内存管理模块
  globalBundleOptimizer.registerLazyModule({
    name: 'memory-manager',
    loader: () => import('./memory-manager'),
    preload: true,
    priority: 9
  })
}
