import { EventEmitter } from '../core/EventEmitter'
import type { DeviceDetectorOptions } from '../types'
import { deepMerge } from './index'

/**
 * 配置变化事件
 */
export interface ConfigChangeEvent {
  key: string
  oldValue: unknown
  newValue: unknown
  timestamp: number
}

/**
 * 配置管理器事件
 */
export interface ConfigManagerEvents extends Record<string, unknown> {
  configChange: ConfigChangeEvent
  reset: void
}

/**
 * 配置验证器
 */
export type ConfigValidator<T = unknown> = (value: T) => boolean | string

/**
 * 配置模式定义
 */
export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required?: boolean
    default?: unknown
    validator?: ConfigValidator
    description?: string
  }
}

/**
 * 全局配置管理器
 *
 * 特性：
 * - 集中管理应用配置
 * - 运行时配置更新
 * - 配置验证
 * - 配置持久化（可选）
 * - 配置变化监听
 * - 类型安全
 *
 * @example
 * ```typescript
 * // 创建配置管理器
 * const config = new ConfigManager({
 *   debug: false,
 *   theme: 'light',
 *   locale: 'zh-CN'
 * })
 *
 * // 获取配置
 * const debug = config.get('debug')
 *
 * // 更新配置
 * config.set('debug', true)
 *
 * // 监听配置变化
 * config.on('configChange', (event) => {
 *   console.log('配置变更:', event)
 * })
 *
 * // 批量更新
 * config.merge({
 *   theme: 'dark',
 *   locale: 'en-US'
 * })
 *
 * // 重置配置
 * config.reset()
 * ```
 */
export class ConfigManager<T extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter<ConfigManagerEvents> {
  private config: T
  private defaultConfig: T
  private schema?: ConfigSchema
  private enablePersistence: boolean
  private storageKey: string

  // 配置历史记录
  private history: Array<{ config: T, timestamp: number }> = []
  private maxHistorySize = 10

  // 冻结状态（防止配置被修改）
  private frozen = false

  constructor(
    defaultConfig: T,
    options: {
      schema?: ConfigSchema
      enablePersistence?: boolean
      storageKey?: string
    } = {},
  ) {
    super()

    this.defaultConfig = { ...defaultConfig }
    this.schema = options.schema
    this.enablePersistence = options.enablePersistence ?? false
    this.storageKey = options.storageKey ?? 'app-config'

    // 从持久化存储加载配置
    if (this.enablePersistence) {
      const stored = this.loadFromStorage()
      this.config = stored ? deepMerge({ ...defaultConfig }, stored) : { ...defaultConfig }
    }
    else {
      this.config = { ...defaultConfig }
    }

    // 验证初始配置
    this.validateConfig(this.config)
  }

  /**
   * 获取配置值
   */
  get<K extends keyof T>(key: K): T[K] {
    return this.config[key]
  }

  /**
   * 获取所有配置
   */
  getAll(): Readonly<T> {
    return { ...this.config }
  }

  /**
   * 设置配置值
   */
  set<K extends keyof T>(key: K, value: T[K]): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    // 验证新值
    if (this.schema && this.schema[key as string]) {
      const schemaItem = this.schema[key as string]
      if (schemaItem.validator) {
        const result = schemaItem.validator(value)
        if (result !== true) {
          throw new Error(`Validation failed for "${String(key)}": ${result}`)
        }
      }
    }

    const oldValue = this.config[key]

    // 只有值真正变化时才触发更新
    if (oldValue !== value) {
      this.config[key] = value

      // 保存到历史
      this.addToHistory()

      // 触发事件
      this.emit('configChange', {
        key: String(key),
        oldValue,
        newValue: value,
        timestamp: Date.now(),
      })

      // 持久化
      if (this.enablePersistence) {
        this.saveToStorage()
      }
    }
  }

  /**
   * 批量更新配置
   */
  merge(updates: Partial<T>): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    // 验证所有更新
    for (const [key, value] of Object.entries(updates)) {
      if (this.schema && this.schema[key]) {
        const schemaItem = this.schema[key]
        if (schemaItem.validator) {
          const result = schemaItem.validator(value)
          if (result !== true) {
            throw new Error(`Validation failed for "${key}": ${result}`)
          }
        }
      }
    }

    // 批量更新
    const oldConfig = { ...this.config }
    this.config = deepMerge(this.config, updates)

    // 保存到历史
    this.addToHistory()

    // 触发事件（为每个变更的键触发）
    for (const [key, value] of Object.entries(updates)) {
      if (oldConfig[key as keyof T] !== value) {
        this.emit('configChange', {
          key,
          oldValue: oldConfig[key as keyof T],
          newValue: value,
          timestamp: Date.now(),
        })
      }
    }

    // 持久化
    if (this.enablePersistence) {
      this.saveToStorage()
    }
  }

  /**
   * 检查配置键是否存在
   */
  has(key: keyof T): boolean {
    return key in this.config
  }

  /**
   * 删除配置键
   */
  delete(key: keyof T): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    if (this.has(key)) {
      const oldValue = this.config[key]
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.config[key]

      // 保存到历史
      this.addToHistory()

      this.emit('configChange', {
        key: String(key),
        oldValue,
        newValue: undefined,
        timestamp: Date.now(),
      })

      if (this.enablePersistence) {
        this.saveToStorage()
      }
    }
  }

  /**
   * 重置配置到默认值
   */
  reset(): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    this.config = { ...this.defaultConfig }

    // 保存到历史
    this.addToHistory()

    this.emit('reset', undefined)

    if (this.enablePersistence) {
      this.saveToStorage()
    }
  }

  /**
   * 冻结配置（防止修改）
   */
  freeze(): void {
    this.frozen = true
  }

  /**
   * 解冻配置
   */
  unfreeze(): void {
    this.frozen = false
  }

  /**
   * 检查配置是否被冻结
   */
  isFrozen(): boolean {
    return this.frozen
  }

  /**
   * 获取配置历史
   */
  getHistory(): Array<{ config: Readonly<T>, timestamp: number }> {
    return this.history.map(item => ({
      config: { ...item.config },
      timestamp: item.timestamp,
    }))
  }

  /**
   * 清除配置历史
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 验证配置
   */
  validateConfig(config: Partial<T>): void {
    if (!this.schema)
      return

    for (const [key, schemaItem] of Object.entries(this.schema)) {
      const value = config[key as keyof T]

      // 检查必填项
      if (schemaItem.required && value === undefined) {
        throw new Error(`Required configuration "${key}" is missing`)
      }

      // 类型检查
      if (value !== undefined) {
        const actualType = Array.isArray(value) ? 'array' : typeof value
        if (actualType !== schemaItem.type) {
          throw new Error(
            `Type mismatch for "${key}": expected ${schemaItem.type}, got ${actualType}`,
          )
        }
      }

      // 自定义验证
      if (value !== undefined && schemaItem.validator) {
        const result = schemaItem.validator(value)
        if (result !== true) {
          throw new Error(`Validation failed for "${key}": ${result}`)
        }
      }
    }
  }

  /**
   * 导出配置（JSON 格式）
   */
  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * 从 JSON 导入配置
   */
  import(json: string): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    try {
      const imported = JSON.parse(json) as T
      this.validateConfig(imported)
      this.config = imported

      // 保存到历史
      this.addToHistory()

      if (this.enablePersistence) {
        this.saveToStorage()
      }
    }
    catch (error) {
      throw new Error(`Failed to import configuration: ${error}`)
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(): void {
    this.history.push({
      config: { ...this.config },
      timestamp: Date.now(),
    })

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }
  }

  /**
   * 从存储加载配置
   */
  private loadFromStorage(): T | null {
    if (typeof window === 'undefined' || !window.localStorage)
      return null

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) as T : null
    }
    catch (error) {
      console.warn('Failed to load configuration from storage:', error)
      return null
    }
  }

  /**
   * 保存配置到存储
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage)
      return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
    }
    catch (error) {
      console.warn('Failed to save configuration to storage:', error)
    }
  }
}

/**
 * 创建 DeviceDetector 专用的配置管理器
 */
export function createDeviceConfig(
  options: DeviceDetectorOptions = {},
): ConfigManager<Record<string, unknown>> {
  const defaultConfig: DeviceDetectorOptions = {
    enableResize: true,
    enableOrientation: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
    },
    debounceDelay: 100,
    modules: [],
  }

  const schema: ConfigSchema = {
    enableResize: {
      type: 'boolean',
      default: true,
      description: '是否启用窗口大小变化监听',
    },
    enableOrientation: {
      type: 'boolean',
      default: true,
      description: '是否启用屏幕方向变化监听',
    },
    breakpoints: {
      type: 'object',
      default: { mobile: 768, tablet: 1024 },
      description: '设备类型断点配置',
      validator: (value) => {
        const bp = value as { mobile: number, tablet: number }
        if (bp.mobile >= bp.tablet) {
          return 'Mobile breakpoint must be less than tablet breakpoint'
        }
        return true
      },
    },
    debounceDelay: {
      type: 'number',
      default: 100,
      description: '事件防抖延迟（毫秒）',
      validator: (value) => {
        return (value as number) >= 0 || 'Debounce delay must be non-negative'
      },
    },
    modules: {
      type: 'array',
      default: [],
      description: '要加载的扩展模块列表',
    },
  }

  return new ConfigManager(
    deepMerge(defaultConfig as Record<string, unknown>, options as Record<string, unknown>),
    { schema },
  )
}

/**
 * 全局默认配置管理器实例
 */
export const globalConfig = new ConfigManager({
  debug: false,
  logLevel: 'warn',
  enablePerformanceMonitoring: false,
})
