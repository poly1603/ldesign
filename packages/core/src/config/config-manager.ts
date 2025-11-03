/**
 * 配置管理器实现
 * 提供配置的获取、设置、合并等功能
 */

import type { ConfigManager } from '../types'

export class CoreConfigManager implements ConfigManager {
  private config: Record<string, any> = {}

  constructor(initialConfig: Record<string, any> = {}) {
    this.config = { ...initialConfig }
  }

  /**
   * 获取配置
   */
  get<T = any>(path: string, defaultValue?: T): T {
    const value = this.getNestedValue(this.config, path)
    return value !== undefined ? value : (defaultValue as T)
  }

  /**
   * 设置配置
   */
  set(path: string, value: any): void {
    this.setNestedValue(this.config, path, value)
  }

  /**
   * 检查配置是否存在
   */
  has(path: string): boolean {
    return this.getNestedValue(this.config, path) !== undefined
  }

  /**
   * 删除配置
   */
  delete(path: string): boolean {
    const parts = path.split('.')
    let current = this.config

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!(part in current)) {
        return false
      }
      current = current[part]
    }

    const lastPart = parts[parts.length - 1]
    if (lastPart in current) {
      delete current[lastPart]
      return true
    }

    return false
  }

  /**
   * 合并配置
   */
  merge(config: Record<string, any>): void {
    this.config = this.deepMerge(this.config, config)
  }

  /**
   * 获取所有配置
   */
  getAll(): Record<string, any> {
    return { ...this.config }
  }

  /**
   * 重置配置
   */
  reset(): void {
    this.config = {}
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined
      }
      current = current[part]
    }

    return current
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.')
    let current = obj

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part]
    }

    current[parts[parts.length - 1]] = value
  }

  /**
   * 深度合并
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.deepMerge(result[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }

    return result
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    this.config = {}
  }
}

/**
 * 创建配置管理器
 */
export function createConfigManager(initialConfig?: Record<string, any>): ConfigManager {
  return new CoreConfigManager(initialConfig)
}

