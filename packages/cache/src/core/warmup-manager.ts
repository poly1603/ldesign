import type { SetOptions } from '../types'

import type { CacheManager } from './cache-manager'

/**
 * 预热配置项
 */
export interface WarmupItem<T = any> {
  /** 缓存键 */
  key: string
  /** 数据获取函数 */
  fetcher: () => Promise<T> | T
  /** 缓存选项 */
  options?: SetOptions
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 依赖的其他键 */
  dependencies?: string[]
}

/**
 * 预热配置
 */
export interface WarmupConfig {
  /** 并发数限制 */
  concurrency?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 失败重试次数 */
  retries?: number
  /** 重试间隔（毫秒） */
  retryDelay?: number
  /** 是否在失败时继续 */
  continueOnError?: boolean
}

/**
 * 预热结果
 */
export interface WarmupResult {
  /** 成功的键 */
  successful: string[]
  /** 失败的项 */
  failed: Array<{
    key: string
    error: Error
    retries: number
  }>
  /** 总耗时（毫秒） */
  duration: number
  /** 统计信息 */
  stats: {
    total: number
    success: number
    failed: number
    skipped: number
  }
}

/**
 * 缓存预热管理器
 * 
 * 在应用启动时预加载重要数据到缓存中
 */
export class WarmupManager {
  private warmupItems: Map<string, WarmupItem> = new Map()
  private running = false
  
  constructor(
    private cache: CacheManager,
    private config: WarmupConfig = {},
  ) {
    this.config = {
      concurrency: 5,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      continueOnError: true,
      ...config,
    }
  }

  /**
   * 注册预热项
   */
  register<T = any>(item: WarmupItem<T> | WarmupItem<T>[]): void {
    const items = Array.isArray(item) ? item : [item]
    
    for (const i of items) {
      this.warmupItems.set(i.key, i)
    }
  }

  /**
   * 注销预热项
   */
  unregister(key: string | string[]): void {
    const keys = Array.isArray(key) ? key : [key]
    
    for (const k of keys) {
      this.warmupItems.delete(k)
    }
  }

  /**
   * 执行预热
   */
  async warmup(keys?: string[]): Promise<WarmupResult> {
    if (this.running) {
      throw new Error('Warmup is already running')
    }

    this.running = true
    const startTime = Date.now()
    const result: WarmupResult = {
      successful: [],
      failed: [],
      duration: 0,
      stats: {
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0,
      },
    }

    try {
      // 获取要预热的项
      const itemsToWarmup = this.getItemsToWarmup(keys)
      result.stats.total = itemsToWarmup.length

      // 按优先级排序
      const sortedItems = this.sortByPriority(itemsToWarmup)

      // 处理依赖关系
      const orderedItems = this.resolveDependencies(sortedItems)

      // 分批并发执行
      await this.processBatches(orderedItems, result)

      result.duration = Date.now() - startTime
      return result
    }
    finally {
      this.running = false
    }
  }

  /**
   * 获取要预热的项
   */
  private getItemsToWarmup(keys?: string[]): WarmupItem[] {
    if (keys) {
      return keys
        .map(key => this.warmupItems.get(key))
        .filter((item): item is WarmupItem => item !== undefined)
    }
    
    return Array.from(this.warmupItems.values())
  }

  /**
   * 按优先级排序
   */
  private sortByPriority(items: WarmupItem[]): WarmupItem[] {
    return items.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 解析依赖关系
   */
  private resolveDependencies(items: WarmupItem[]): WarmupItem[] {
    const resolved: WarmupItem[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (item: WarmupItem) => {
      if (visited.has(item.key)) { return }
      if (visiting.has(item.key)) {
        throw new Error(`Circular dependency detected: ${item.key}`)
      }

      visiting.add(item.key)

      if (item.dependencies) {
        for (const dep of item.dependencies) {
          const depItem = items.find(i => i.key === dep)
          if (depItem) {
            visit(depItem)
          }
        }
      }

      visiting.delete(item.key)
      visited.add(item.key)
      resolved.push(item)
    }

    for (const item of items) {
      visit(item)
    }

    return resolved
  }

  /**
   * 分批处理
   */
  private async processBatches(
    items: WarmupItem[],
    result: WarmupResult,
  ): Promise<void> {
    const concurrency = this.config?.concurrency || 5

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)
      
      await Promise.all(
        batch.map(async item => this.processItem(item, result)),
      )
    }
  }

  /**
   * 处理单个预热项
   */
  private async processItem(
    item: WarmupItem,
    result: WarmupResult,
  ): Promise<void> {
    let retries = 0
    const maxRetries = this.config?.retries || 3

    while (retries <= maxRetries) {
      try {
        // 检查是否已存在
        const existing = await this.cache.has(item.key)
        if (existing) {
          result.stats.skipped++
          return
        }

        // 带超时的数据获取
        const data = await this.fetchWithTimeout(item.fetcher)
        
        // 存入缓存
        await this.cache.set(item.key, data, item.options)
        
        result.successful.push(item.key)
        result.stats.success++
        return
      }
      catch (error) {
        retries++
        
        if (retries > maxRetries) {
          result.failed.push({
            key: item.key,
            error: error instanceof Error ? error : new Error(String(error)),
            retries: retries - 1,
          })
          result.stats.failed++
          
          if (!this.config?.continueOnError) {
            throw error
          }
          return
        }

        // 等待后重试
        await this.delay(this.config?.retryDelay || 1000)
      }
    }
  }

  /**
   * 带超时的数据获取
   */
  private async fetchWithTimeout<T>(
    fetcher: () => Promise<T> | T,
  ): Promise<T> {
    const timeout = this.config?.timeout || 30000
    
    return Promise.race([
      Promise.resolve(fetcher()),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Warmup timeout')), timeout),
      ),
    ])
  }

  /**
   * 延迟函数
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取预热状态
   */
  getStatus(): {
    running: boolean
    itemCount: number
    items: Array<{ key: string, priority?: number }>
  } {
    return {
      running: this.running,
      itemCount: this.warmupItems.size,
      items: Array.from(this.warmupItems.values()).map(item => ({
        key: item.key,
        priority: item.priority,
      })),
    }
  }

  /**
   * 清空所有预热项
   */
  clear(): void {
    this.warmupItems.clear()
  }
}

/**
 * 创建预热管理器
 */
export function createWarmupManager(
  cache: CacheManager,
  config?: WarmupConfig,
): WarmupManager {
  return new WarmupManager(cache, config)
}
