import type { CacheOptions, SerializableValue, SetOptions } from '../types'

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
  async set<T extends SerializableValue = SerializableValue>(key: string, value: T, options?: SetOptions): Promise<void> {
    return this.manager.set(key, value, options)
  }

  /**
   * 获取缓存
   */
  async get<T extends SerializableValue = SerializableValue>(key: string): Promise<T | null> {
    return this.manager.get<T>(key)
  }

  /**
   * 删除缓存
   */
  async remove(key: string): Promise<void> {
    return this.manager.remove(key)
  }

  /**
   * 检查键是否存在
   */
  async has(key: string): Promise<boolean> {
    return this.manager.has(key)
  }

  /**
   * 获取元数据
   */
  async getMetadata(key: string): Promise<any> {
    return this.manager.getMetadata(key)
  }

  /**
   * 清空当前命名空间的所有缓存
   * 
   * @param includeChildren - 是否包含子命名空间
   */
  async clear(includeChildren = false): Promise<void> {
    // 清空当前命名空间
    const keys = await this.manager.keys()
    await Promise.all(keys.map(async key => this.manager.remove(key)))

    // 递归清空子命名空间
    if (includeChildren) {
      await Promise.all(
        Array.from(this.children.values()).map(async child => child.clear(true)),
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
      Array.from(this.children.values()).map(async child => child.keys(true)),
    )
    
    return currentKeys.concat(...childKeysArrays)
  }

  /**
   * 批量操作
   */
  async mset<T extends SerializableValue = SerializableValue>(
    items: Array<{ key: string, value: T, options?: SetOptions }> | Record<string, T>,
    options?: SetOptions,
  ): Promise<{ success: string[], failed: Array<{ key: string, error: Error }> }> {
    return this.manager.mset(items, options)
  }

  async mget<T extends SerializableValue = SerializableValue>(keys: string[]): Promise<Record<string, T | null>> {
    return this.manager.mget<T>(keys)
  }

  async mremove(keys: string[] | string): Promise<{ success: string[], failed: Array<{ key: string, error: Error }> }> {
    return this.manager.mremove(keys)
  }

  /**
   * 获取或设置
   */
  async remember<T extends SerializableValue = SerializableValue>(
    key: string,
    fetcher: () => Promise<T> | T,
    options?: SetOptions & { refresh?: boolean },
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
        Array.from(this.children.values()).map(async child => child.destroy(true)),
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
   * 
   * @param filter - 可选的过滤函数
   * @returns 导出的键值对数组
   */
  async export(filter?: (key: string) => boolean): Promise<Array<{ key: string, value: any }>> {
    const keys = await this.keys(false)
    const result: Array<{ key: string, value: any }> = []
    
    for (const key of keys) {
      // 应用过滤器
      if (filter && !filter(key)) {
        continue
      }
      
      const value = await this.get(key)
      if (value !== null) {
        result.push({ key, value })
      }
    }

    return result
  }

  /**
   * 导出完整的命名空间数据（包含子命名空间）
   */
  async exportFull(includeChildren = true): Promise<{
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
        childData[name] = await child.exportFull(true)
      }
      
      result.children = childData
    }

    return result
  }

  /**
   * 导入命名空间数据
   *
   * @param data - 要导入的数据，支持数组或对象格式
   * @param options - 导入选项
   * @param options.transform - 导入前对条目进行转换（如键重命名/结构升级）
   */
  async import(
    data: Array<{ key: string, value: any }> | { data?: Record<string, any>, children?: Record<string, any> },
    options?: { transform?: (item: { key: string, value: any }) => { key: string, value: any } },
  ): Promise<void> {
    // 处理数组格式
    if (Array.isArray(data)) {
      let items = data
      
      // 应用转换函数
      if (options?.transform) {
        items = items.map(options.transform)
      }
      
      // 转换为对象格式并批量设置
      const itemsObj: Record<string, any> = {}
      for (const item of items) {
        itemsObj[item.key] = item.value
      }
      await this.mset(itemsObj)
    } 
    // 处理对象格式（全量导入）
    else {
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
          await child.import(childData)
        }
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
