import type { HttpAdapter } from '@/types'
import { FetchAdapter } from './fetch'
import { AxiosAdapter } from './axios'
import { AlovaAdapter } from './alova'

export { BaseAdapter } from './base'
export { FetchAdapter } from './fetch'
export { AxiosAdapter } from './axios'
export { AlovaAdapter } from './alova'

/**
 * 适配器工厂
 */
export class AdapterFactory {
  private static adapters: Map<string, () => HttpAdapter> = new Map([
    ['fetch', () => new FetchAdapter()],
    ['axios', () => new AxiosAdapter()],
    ['alova', () => new AlovaAdapter()],
  ])

  /**
   * 注册适配器
   */
  static register(name: string, factory: () => HttpAdapter): void {
    this.adapters.set(name, factory)
  }

  /**
   * 创建适配器
   */
  static create(name: string): HttpAdapter {
    const factory = this.adapters.get(name)
    if (!factory) {
      throw new Error(`Unknown adapter: ${name}`)
    }
    return factory()
  }

  /**
   * 获取可用的适配器
   */
  static getAvailable(): string[] {
    const available: string[] = []
    
    this.adapters.forEach((factory, name) => {
      try {
        const adapter = factory()
        if (adapter.isSupported()) {
          available.push(name)
        }
      } catch {
        // 忽略不可用的适配器
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

  if (typeof adapter === 'object' && adapter.request && adapter.isSupported) {
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
  } catch {
    return false
  }
}
