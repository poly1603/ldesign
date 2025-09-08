import type { CacheOptions, SetOptions } from '../types'
import { CacheManager } from './cache-manager'

/**
 * 命名空间配置
 */
export interface NamespaceOptions extends CacheOptions {
  /** 命名空间名称 */
  name: string
  /** 父命名空间 */
  parent?: CacheNamespace
  /** 子命名空间自动继承父配置 */
  inheritConfig?: boolean
}

/**
 * 缓存命名空间
 * 
 * 提供隔离的缓存空间，支持层级结构和批量操作
 */
export class CacheNamespace {
  private readonly manager: CacheManager
  private readonly children: Map<string, CacheNamespace> = new Map()
  private readonly prefix: string

  constructor(private options: NamespaceOptions) {
    // 构建完整前缀
    this.prefix = options.parent 
      ? `${options.parent.prefix}:${options.name}`
      : options.name

    // 创建带前缀的缓存管理器
    const managerOptions: CacheOptions = {
      ...options,
      keyPrefix: this.prefix,
    }
    
    // 如果有父命名空间且需要继承配置
    if (options.parent && options.inheritConfig) {
      Object.assign(managerOptions, options.parent.options)
    }
    
    this.manager = new CacheManager(managerOptions)
  }

  /**
   * 获取完整前缀
   */
  getPrefix(): string {
    return this.prefix
  }

  /**
   * 创建子命名空间
   * 
   * @param name - 子命名空间名称
   * @param options - 配置选项
   * @returns 子命名空间实例
   * 
   * @example
   * ```typescript
   * const userNs = rootNs.namespace('user')
   * const profileNs = userNs.namespace('profile')
   * // 键会自动加前缀: root:user:profile:key
   * ```
   */
  namespace(name: string, options?: Partial<NamespaceOptions>): CacheNamespace {
    if (this.children.has(name)) {
      return this.children.get(name)!
    }

    const child = new CacheNamespace({
      ...options,
      name,
      parent: this,
      inheritConfig: options?.inheritConfig ?? true,
    })

    this.children.set(name, child)
    return child
  }

  /**
   * 设置缓存
   */
  async set<T = any>(key: string, value: T, options?: SetOptions): Promise<void> {
    return this.manager.set(key, value, options)
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string): Promise<T | null> {
    return this.manager.get<T>(key)
  }

  /**
   * 删除缓存
   */
  async remove(key: string): Promise<void> {
    return this.manager.remove(key)
  }

  /**
   * 清空当前命名空间的所有缓存
   * 
   * @param includeChildren - 是否包含子命名空间
   */
  async clear(includeChildren = false): Promise<void> {
    // 清空当前命名空间
    const keys = await this.manager.keys()
    await Promise.all(keys.map(key => this.manager.remove(key)))

    // 递归清空子命名空间
    if (includeChildren) {
      await Promise.all(
        Array.from(this.children.values()).map(child => child.clear(true))
      )
    }
  }

  /**
   * 获取所有键
   * 
   * @param includeChildren - 是否包含子命名空间的键
   */
  async keys(includeChildren = false): Promise<string[]> {
    const currentKeys = await this.manager.keys()
    
    if (!includeChildren) {
      return currentKeys
    }

    // 递归获取子命名空间的键
    const childKeysArrays = await Promise.all(
      Array.from(this.children.values()).map(child => child.keys(true))
    )
    
    return currentKeys.concat(...childKeysArrays)
  }

  /**
   * 批量操作
   */
  async mset<T = any>(
    items: Array<{ key: string, value: T, options?: SetOptions }>
  ): Promise<Array<{ key: string, success: boolean, error?: Error }>> {
    return this.manager.mset(items)
  }

  async mget<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    return this.manager.mget<T>(keys)
  }

  async mremove(keys: string[]): Promise<Array<{ key: string, success: boolean, error?: Error }>> {
    return this.manager.mremove(keys)
  }

  /**
   * 获取或设置
   */
  async remember<T = any>(
    key: string,
    fetcher: () => Promise<T> | T,
    options?: SetOptions & { refresh?: boolean }
  ): Promise<T> {
    return this.manager.remember(key, fetcher, options)
  }

  /**
   * 获取统计信息
   * 
   * @param includeChildren - 是否包含子命名空间的统计
   */
  async getStats(includeChildren = false): Promise<{
    namespace: string
    stats: any
    children?: Record<string, any>
  }> {
    const stats = await this.manager.getStats()
    
    const result: any = {
      namespace: this.prefix,
      stats,
    }

    if (includeChildren && this.children.size > 0) {
      const childStats: Record<string, any> = {}
      
      for (const [name, child] of this.children) {
        childStats[name] = await child.getStats(true)
      }
      
      result.children = childStats
    }

    return result
  }

  /**
   * 销毁命名空间
   * 
   * @param includeChildren - 是否销毁子命名空间
   */
  async destroy(includeChildren = true): Promise<void> {
    if (includeChildren) {
      await Promise.all(
        Array.from(this.children.values()).map(child => child.destroy(true))
      )
      this.children.clear()
    }

    await this.manager.destroy()
  }

  /**
   * 获取子命名空间
   */
  getChild(name: string): CacheNamespace | undefined {
    return this.children.get(name)
  }

  /**
   * 获取所有子命名空间
   */
  getChildren(): Map<string, CacheNamespace> {
    return new Map(this.children)
  }

  /**
   * 导出命名空间数据
   */
  async export(includeChildren = true): Promise<{
    namespace: string
    data: Record<string, any>
    children?: Record<string, any>
  }> {
    const keys = await this.keys(false)
    const data: Record<string, any> = {}
    
    for (const key of keys) {
      data[key] = await this.get(key)
    }

    const result: any = {
      namespace: this.prefix,
      data,
    }

    if (includeChildren && this.children.size > 0) {
      const childData: Record<string, any> = {}
      
      for (const [name, child] of this.children) {
        childData[name] = await child.export(true)
      }
      
      result.children = childData
    }

    return result
  }

  /**
   * 导入命名空间数据
   */
  async import(data: {
    data?: Record<string, any>
    children?: Record<string, any>
  }): Promise<void> {
    // 导入当前命名空间数据
    if (data.data) {
      const items = Object.entries(data.data).map(([key, value]) => ({
        key,
        value,
      }))
      await this.mset(items)
    }

    // 递归导入子命名空间数据
    if (data.children) {
      for (const [name, childData] of Object.entries(data.children)) {
        const child = this.namespace(name)
        await child.import(childData as any)
      }
    }
  }
}

/**
 * 创建根命名空间
 */
export function createNamespace(name: string, options?: Partial<CacheOptions>): CacheNamespace {
  return new CacheNamespace({
    ...options,
    name,
  })
}
