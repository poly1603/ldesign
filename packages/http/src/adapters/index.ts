import type { HttpAdapter } from '../types'
import { AlovaAdapter } from './alova'
import { AxiosAdapter } from './axios'
import { FetchAdapter } from './fetch'

export { AlovaAdapter } from './alova'
export { AxiosAdapter } from './axios'
export { BaseAdapter } from './base'
export { FetchAdapter } from './fetch'

/**
 * 适配器工厂（优化版）
 */
export class AdapterFactory {
  private static adapters = new Map<string, () => HttpAdapter>([
    ['fetch', () => new FetchAdapter()],
    ['axios', () => new AxiosAdapter()],
    ['alova', () => new AlovaAdapter()],
  ])

  // 缓存已创建的适配器实例
  private static adapterCache = new Map<string, HttpAdapter>()

  // 缓存可用性检查结果
  private static availabilityCache = new Map<string, boolean>()

  /**
   * 注册适配器
   */
  static register(name: string, factory: () => HttpAdapter): void {
    this.adapters.set(name, factory)
  }

  /**
   * 创建适配器（带缓存）
   */
  static create(name: string): HttpAdapter {
    // 检查缓存
    if (this.adapterCache.has(name)) {
      return this.adapterCache.get(name)!
    }

    const factory = this.adapters.get(name)
    if (!factory) {
      throw new Error(`Unknown adapter: ${name}`)
    }

    const adapter = factory()

    // 验证适配器是否可用
    if (!adapter.isSupported()) {
      throw new Error(
        `Adapter '${name}' is not supported in current environment`,
      )
    }

    // 缓存适配器实例
    this.adapterCache.set(name, adapter)
    return adapter
  }

  /**
   * 获取可用的适配器（带缓存）
   */
  static getAvailable(): string[] {
    const available: string[] = []

    this.adapters.forEach((factory, name) => {
      // 检查缓存
      if (this.availabilityCache.has(name)) {
        if (this.availabilityCache.get(name)) {
          available.push(name)
        }
        return
      }

      try {
        const adapter = factory()
        const isSupported = adapter.isSupported()

        // 缓存可用性结果
        this.availabilityCache.set(name, isSupported)

        if (isSupported) {
          available.push(name)
        }
      }
      catch {
        // 缓存不可用结果
        this.availabilityCache.set(name, false)
      }
    })

    return available
  }

  /**
   * 获取默认适配器
   */
  static getDefault(): HttpAdapter {
    const available = this.getAvailable()

    if (available.length === 0) {
      throw new Error('No available HTTP adapter found')
    }

    // 优先级：fetch > axios > alova
    const priority = ['fetch', 'axios', 'alova']

    for (const name of priority) {
      if (available.includes(name)) {
        return this.create(name)
      }
    }

    // 如果没有找到优先的适配器，使用第一个可用的
    return this.create(available[0]!)
  }

  /**
   * 获取所有注册的适配器名称
   */
  static getRegistered(): string[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * 清理缓存（用于测试或重置）
   */
  static clearCache(): void {
    this.adapterCache.clear()
    this.availabilityCache.clear()
  }

  /**
   * 预热适配器（提前检查可用性）
   */
  static warmup(): void {
    this.getAvailable() // 触发可用性检查和缓存
  }
}

/**
 * 创建 HTTP 适配器
 */
export function createAdapter(adapter?: string | HttpAdapter): HttpAdapter {
  if (!adapter) {
    return AdapterFactory.getDefault()
  }

  if (typeof adapter === 'string') {
    return AdapterFactory.create(adapter)
  }

  if (
    typeof adapter === 'object'
    && 'request' in adapter
    && 'isSupported' in adapter
  ) {
    return adapter
  }

  throw new Error('Invalid adapter configuration')
}

/**
 * 检查适配器是否可用
 */
export function isAdapterAvailable(name: string): boolean {
  try {
    const adapter = AdapterFactory.create(name)
    return adapter.isSupported()
  }
  catch {
    return false
  }
}
