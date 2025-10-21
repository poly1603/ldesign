/**
 * 动态模块加载器
 * 支持按需加载、代码分割和Tree-Shaking优化
 */

import type { Logger } from '../types'

// 模块元数据
export interface ModuleMetadata {
  name: string
  version?: string
  dependencies: string[]
  exports: string[]
  size?: number
  loaded: boolean
  loadTime?: number
}

// 模块加载选项
export interface ModuleLoadOptions {
  preload?: boolean // 预加载
  priority?: 'high' | 'normal' | 'low'
  timeout?: number // 加载超时
  retry?: number // 重试次数
}

// 模块加载器配置
export interface ModuleLoaderConfig {
  baseUrl?: string
  enableCache?: boolean
  cacheMaxAge?: number
  enablePrefetch?: boolean
  maxConcurrentLoads?: number
  onModuleLoad?: (module: ModuleMetadata) => void
  onModuleError?: (error: Error, moduleName: string) => void
}

/**
 * 模块加载器类
 * 提供智能的模块加载和依赖管理
 */
export class ModuleLoader {
  private modules = new Map<string, ModuleMetadata>()
  private loadingPromises = new Map<string, Promise<any>>()
  private config: Required<ModuleLoaderConfig>
  private moduleCache = new Map<string, { module: any; timestamp: number }>()
  private loadQueue: Array<{ name: string; priority: number }> = []
  private currentLoads = 0

  constructor(
    config: ModuleLoaderConfig = {},
    private logger?: Logger
  ) {
    this.config = {
      baseUrl: config.baseUrl || '',
      enableCache: config.enableCache ?? true,
      cacheMaxAge: config.cacheMaxAge || 5 * 60 * 1000, // 5分钟
      enablePrefetch: config.enablePrefetch ?? true,
      maxConcurrentLoads: config.maxConcurrentLoads || 3,
      onModuleLoad: config.onModuleLoad || (() => { }),
      onModuleError: config.onModuleError || (() => { })
    }
  }

  /**
   * 动态加载模块
   */
  async load<T = any>(
    moduleName: string,
    options: ModuleLoadOptions = {}
  ): Promise<T> {
    // 检查缓存
    if (this.config.enableCache) {
      const cached = this.moduleCache.get(moduleName)
      if (cached) {
        const age = Date.now() - cached.timestamp
        if (age < this.config.cacheMaxAge) {
          this.logger?.debug(`Module loaded from cache: ${moduleName}`)
          return cached.module
        } else {
          this.moduleCache.delete(moduleName)
        }
      }
    }

    // 检查是否正在加载
    const loadingPromise = this.loadingPromises.get(moduleName)
    if (loadingPromise) {
      this.logger?.debug(`Waiting for in-progress load: ${moduleName}`)
      return loadingPromise
    }

    // 开始加载
    const promise = this.loadModule<T>(moduleName, options)
    this.loadingPromises.set(moduleName, promise)

    try {
      const module = await promise
      this.loadingPromises.delete(moduleName)

      // 缓存模块
      if (this.config.enableCache) {
        this.moduleCache.set(moduleName, {
          module,
          timestamp: Date.now()
        })
      }

      return module
    } catch (error) {
      this.loadingPromises.delete(moduleName)
      throw error
    }
  }

  /**
   * 批量加载模块
   */
  async loadBatch<T = any>(
    moduleNames: string[],
    options: ModuleLoadOptions = {}
  ): Promise<T[]> {
    const promises = moduleNames.map(name => this.load<T>(name, options))
    return Promise.all(promises)
  }

  /**
   * 预加载模块（低优先级）
   */
  async prefetch(moduleNames: string[]): Promise<void> {
    if (!this.config.enablePrefetch) {
      return
    }

    const options: ModuleLoadOptions = {
      priority: 'low',
      preload: true
    }

    // 不等待结果，静默加载
    moduleNames.forEach(name => {
      this.load(name, options).catch(error => {
        this.logger?.debug(`Prefetch failed for ${name}`, error)
      })
    })
  }

  /**
   * 注册模块元数据
   */
  register(metadata: Omit<ModuleMetadata, 'loaded' | 'loadTime'>): void {
    this.modules.set(metadata.name, {
      ...metadata,
      loaded: false
    })
    this.logger?.debug(`Module registered: ${metadata.name}`)
  }

  /**
   * 获取模块元数据
   */
  getMetadata(moduleName: string): ModuleMetadata | undefined {
    return this.modules.get(moduleName)
  }

  /**
   * 获取所有已注册模块
   */
  getAllModules(): ModuleMetadata[] {
    return Array.from(this.modules.values())
  }

  /**
   * 获取加载统计
   */
  getStats(): {
    registered: number
    loaded: number
    cached: number
    loading: number
    averageLoadTime: number
  } {
    const allModules = this.getAllModules()
    const loaded = allModules.filter(m => m.loaded)
    const loadTimes = loaded
      .map(m => m.loadTime)
      .filter(t => t !== undefined) as number[]

    const averageLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length
      : 0

    return {
      registered: allModules.length,
      loaded: loaded.length,
      cached: this.moduleCache.size,
      loading: this.loadingPromises.size,
      averageLoadTime
    }
  }

  /**
   * 生成依赖图
   */
  generateDependencyGraph(): string {
    let graph = 'digraph ModuleDependencies {\n'
    graph += '  rankdir=LR;\n'
    graph += '  node [shape=box];\n\n'

    const allModules = this.getAllModules()

    // 添加节点
    for (const module of allModules) {
      const color = module.loaded ? 'lightgreen' : 'lightgray'
      const shape = module.dependencies.length === 0 ? 'ellipse' : 'box'
      graph += `  "${module.name}" [fillcolor=${color}, style=filled, shape=${shape}];\n`
    }

    graph += '\n'

    // 添加边
    for (const module of allModules) {
      for (const dep of module.dependencies) {
        graph += `  "${dep}" -> "${module.name}";\n`
      }
    }

    graph += '}\n'
    return graph
  }

  /**
   * 分析未使用的模块
   */
  findUnusedModules(): string[] {
    const allModules = this.getAllModules()
    return allModules
      .filter(m => !m.loaded)
      .map(m => m.name)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.moduleCache.clear()
    this.logger?.debug('Module cache cleared')
  }

  /**
   * 销毁加载器
   */
  destroy(): void {
    this.loadingPromises.clear()
    this.moduleCache.clear()
    this.modules.clear()
    this.loadQueue = []
  }

  /**
   * 实际加载模块的私有方法
   */
  private async loadModule<T>(
    moduleName: string,
    options: ModuleLoadOptions
  ): Promise<T> {
    const startTime = Date.now()

    // 控制并发加载数量
    while (this.currentLoads >= this.config.maxConcurrentLoads) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    this.currentLoads++

    try {
      // 使用动态导入加载模块
      const module = await this.dynamicImport<T>(moduleName, options)

      const loadTime = Date.now() - startTime

      // 更新模块元数据
      const metadata = this.modules.get(moduleName)
      if (metadata) {
        metadata.loaded = true
        metadata.loadTime = loadTime
      }

      this.config.onModuleLoad({
        name: moduleName,
        dependencies: metadata?.dependencies || [],
        exports: metadata?.exports || [],
        loaded: true,
        loadTime
      })

      this.logger?.debug(`Module loaded: ${moduleName}`, { loadTime: `${loadTime}ms` })

      return module
    } catch (error) {
      this.config.onModuleError(error as Error, moduleName)
      this.logger?.error(`Failed to load module: ${moduleName}`, error)
      throw error
    } finally {
      this.currentLoads--
    }
  }

  /**
   * 动态导入实现
   */
  private async dynamicImport<T>(
    moduleName: string,
    options: ModuleLoadOptions
  ): Promise<T> {
    const retries = options.retry || 3
    const timeout = options.timeout || 30000

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Module load timeout: ${moduleName}`)), timeout)
        })

        // 构造模块路径
        const modulePath = this.config.baseUrl
          ? `${this.config.baseUrl}/${moduleName}`
          : moduleName

        // 动态导入模块
        const importPromise = import(/* @vite-ignore */ modulePath)

        // 竞争：先完成的胜出
        const module = await Promise.race([importPromise, timeoutPromise])

        return module as T
      } catch (error) {
        if (attempt < retries) {
          this.logger?.debug(`Retrying module load: ${moduleName} (attempt ${attempt + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        } else {
          throw error
        }
      }
    }

    throw new Error(`Failed to load module after ${retries} retries: ${moduleName}`)
  }
}

/**
 * 创建模块加载器实例
 */
export function createModuleLoader(
  config?: ModuleLoaderConfig,
  logger?: Logger
): ModuleLoader {
  return new ModuleLoader(config, logger)
}

/**
 * 按需加载装饰器
 * 装饰的方法第一次调用时会动态加载指定模块
 */
export function LazyModule(moduleName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    let moduleLoaded = false
    let cachedModule: any

    descriptor.value = async function (...args: any[]) {
      if (!moduleLoaded) {
        // 创建或获取全局模块加载器
        const loader = getGlobalModuleLoader()
        cachedModule = await loader.load(moduleName)
        moduleLoaded = true
      }

      return originalMethod.apply(this, [cachedModule, ...args])
    }

    return descriptor
  }
}

// 全局模块加载器实例
let globalModuleLoader: ModuleLoader | undefined

export function getGlobalModuleLoader(): ModuleLoader {
  if (!globalModuleLoader) {
    globalModuleLoader = createModuleLoader()
  }
  return globalModuleLoader
}

export function setGlobalModuleLoader(loader: ModuleLoader): void {
  globalModuleLoader = loader
}




