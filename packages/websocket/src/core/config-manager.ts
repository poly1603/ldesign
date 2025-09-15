/**
 * 配置管理器
 * 
 * 负责管理WebSocket客户端的所有配置选项，包括：
 * - 连接配置（URL、协议、超时等）
 * - 重连配置（策略、间隔、次数等）
 * - 心跳配置（间隔、消息、超时等）
 * - 认证配置（类型、凭据等）
 * - 消息队列配置（大小、持久化等）
 * - 日志配置（级别、调试模式等）
 * - 性能配置（压缩、消息大小限制等）
 */

import { WebSocketEventEmitter } from './event-emitter'
import type {
  WebSocketConfig,
  ReconnectConfig,
  HeartbeatConfig,
  AuthConfig,
  MessageQueueConfig,
  LogLevel
} from '../types'
import { deepMerge, deepClone, isValidUrl } from '../utils'

/**
 * 配置变更事件映射
 */
export interface ConfigEventMap {
  /**
   * 配置变更事件
   */
  configChanged: {
    /** 变更的配置键 */
    key: string
    /** 旧值 */
    oldValue: unknown
    /** 新值 */
    newValue: unknown
    /** 完整的新配置 */
    config: WebSocketConfig
  }

  /**
   * 配置验证失败事件
   */
  configValidationFailed: {
    /** 验证失败的配置键 */
    key: string
    /** 无效的值 */
    value: unknown
    /** 错误信息 */
    error: string
  }

  /**
   * 配置重置事件
   */
  configReset: {
    /** 重置前的配置 */
    oldConfig: WebSocketConfig
    /** 重置后的配置 */
    newConfig: WebSocketConfig
  }
}

/**
 * 配置验证器接口
 */
export interface ConfigValidator<T = unknown> {
  /**
   * 验证配置值
   * 
   * @param value 要验证的值
   * @returns 验证结果，true表示有效，string表示错误信息
   */
  validate(value: T): true | string
}

/**
 * 配置管理器类
 * 
 * 提供配置的获取、设置、验证、监听等功能
 */
export class ConfigManager extends WebSocketEventEmitter<ConfigEventMap> {
  /**
   * 当前配置
   */
  private config: WebSocketConfig

  /**
   * 默认配置
   */
  private readonly defaultConfig: WebSocketConfig

  /**
   * 配置验证器映射
   */
  private readonly validators = new Map<string, ConfigValidator>()

  /**
   * 构造函数
   * 
   * @param initialConfig 初始配置
   */
  constructor(initialConfig: Partial<WebSocketConfig> = {}) {
    super()

    // 设置默认配置
    this.defaultConfig = this.createDefaultConfig()

    // 合并初始配置
    this.config = deepMerge(this.defaultConfig, initialConfig)

    // 注册内置验证器
    this.registerBuiltinValidators()

    // 验证初始配置
    this.validateConfig(this.config)
  }

  /**
   * 获取完整配置
   *
   * @returns 当前配置的深拷贝
   */
  getConfig(): WebSocketConfig {
    return deepClone(this.config)
  }

  /**
   * 获取指定配置项
   *
   * @param key 配置键，支持点号分隔的嵌套路径
   * @returns 配置值
   */
  get<T = unknown>(key: string): T {
    return this.getNestedValue(this.config, key)
  }

  /**
   * 设置配置项
   *
   * @param key 配置键，支持点号分隔的嵌套路径
   * @param value 配置值
   * @param validate 是否验证配置，默认为true
   */
  set<T = unknown>(key: string, value: T, validate = true): void {
    // 验证配置
    if (validate) {
      const validator = this.validators.get(key)
      if (validator) {
        const result = validator.validate(value)
        if (result !== true) {
          this.emit('configValidationFailed', {
            key,
            value,
            error: result
          })
          throw new Error(`配置验证失败: ${key} - ${result}`)
        }
      }
    }

    // 获取旧值
    const oldValue = this.getNestedValue(this.config, key)

    // 设置新值
    this.setNestedValue(this.config, key, value)

    // 触发配置变更事件
    this.emit('configChanged', {
      key,
      oldValue,
      newValue: value,
      config: this.getConfig()
    })
  }

  /**
   * 批量更新配置
   * 
   * @param updates 配置更新对象
   * @param validate 是否验证配置，默认为true
   */
  update(updates: Partial<WebSocketConfig>, validate = true): void {
    const oldConfig = this.getConfig()

    // 合并配置
    this.config = deepMerge(this.config, updates)

    // 验证配置
    if (validate) {
      this.validateConfig(this.config)
    }

    // 触发配置变更事件
    Object.keys(updates).forEach(key => {
      const oldValue = this.getNestedValue(oldConfig, key)
      const newValue = this.getNestedValue(this.config, key)

      if (oldValue !== newValue) {
        this.emit('configChanged', {
          key,
          oldValue,
          newValue,
          config: this.getConfig()
        })
      }
    })
  }

  /**
   * 重置配置到默认值
   * 
   * @param keys 要重置的配置键数组，如果不提供则重置所有配置
   */
  reset(keys?: string[]): void {
    const oldConfig = this.getConfig()

    if (keys) {
      // 重置指定配置
      keys.forEach(key => {
        const defaultValue = this.getNestedValue(this.defaultConfig, key)
        this.setNestedValue(this.config, key, defaultValue)
      })
    } else {
      // 重置所有配置
      this.config = deepClone(this.defaultConfig)
    }

    // 触发重置事件
    this.emit('configReset', {
      oldConfig,
      newConfig: this.getConfig()
    })
  }

  /**
   * 注册配置验证器
   * 
   * @param key 配置键
   * @param validator 验证器
   */
  registerValidator(key: string, validator: ConfigValidator): void {
    this.validators.set(key, validator)
  }

  /**
   * 移除配置验证器
   * 
   * @param key 配置键
   */
  removeValidator(key: string): void {
    this.validators.delete(key)
  }

  /**
   * 验证完整配置
   *
   * @param config 要验证的配置
   */
  private validateConfig(config: WebSocketConfig): void {
    // 验证URL（允许空字符串作为默认值）
    if (config.url && !isValidUrl(config.url)) {
      throw new Error(`无效的WebSocket URL: ${config.url}`)
    }

    // 验证连接超时
    if (config.connectionTimeout <= 0) {
      throw new Error(`连接超时必须大于0: ${config.connectionTimeout}`)
    }

    // 验证重连配置
    this.validateReconnectConfig(config.reconnect)

    // 验证心跳配置
    this.validateHeartbeatConfig(config.heartbeat)

    // 验证消息队列配置
    this.validateMessageQueueConfig(config.messageQueue)

    // 验证最大消息大小
    if (config.maxMessageSize <= 0) {
      throw new Error(`最大消息大小必须大于0: ${config.maxMessageSize}`)
    }
  }

  /**
   * 验证重连配置
   */
  private validateReconnectConfig(config: ReconnectConfig): void {
    if (config.initialDelay <= 0) {
      throw new Error(`初始重连延迟必须大于0: ${config.initialDelay}`)
    }

    if (config.maxDelay <= 0) {
      throw new Error(`最大重连延迟必须大于0: ${config.maxDelay}`)
    }

    if (config.maxAttempts <= 0) {
      throw new Error(`最大重连次数必须大于0: ${config.maxAttempts}`)
    }

    if (config.backoffMultiplier <= 0) {
      throw new Error(`退避倍数必须大于0: ${config.backoffMultiplier}`)
    }

    if (config.jitter < 0) {
      throw new Error(`抖动值不能为负数: ${config.jitter}`)
    }
  }

  /**
   * 验证心跳配置
   */
  private validateHeartbeatConfig(config: HeartbeatConfig): void {
    if (config.interval <= 0) {
      throw new Error(`心跳间隔必须大于0: ${config.interval}`)
    }

    if (config.timeout <= 0) {
      throw new Error(`心跳超时必须大于0: ${config.timeout}`)
    }

    if (config.maxFailures <= 0) {
      throw new Error(`最大心跳失败次数必须大于0: ${config.maxFailures}`)
    }

    if (!config.message) {
      throw new Error('心跳消息不能为空')
    }
  }

  /**
   * 验证消息队列配置
   */
  private validateMessageQueueConfig(config: MessageQueueConfig): void {
    if (config.maxSize <= 0) {
      throw new Error(`消息队列最大大小必须大于0: ${config.maxSize}`)
    }

    if (config.messageExpiry <= 0) {
      throw new Error(`消息过期时间必须大于0: ${config.messageExpiry}`)
    }

    if (!config.storageKey) {
      throw new Error('存储键不能为空')
    }
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfig(): WebSocketConfig {
    return {
      url: '',
      protocols: undefined,
      connectionTimeout: 10000,
      reconnect: {
        enabled: true,
        strategy: 'exponential',
        initialDelay: 1000,
        maxDelay: 30000,
        maxAttempts: 5,
        backoffMultiplier: 2,
        jitter: 1000
      },
      heartbeat: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        message: 'ping',
        messageType: 'text',
        maxFailures: 3
      },
      auth: {
        type: 'none',
        autoRefresh: false
      },
      messageQueue: {
        enabled: true,
        maxSize: 1000,
        persistent: false,
        storageKey: 'websocket_message_queue',
        messageExpiry: 300000,
        deduplication: true
      },
      logLevel: 'info',
      debug: false,
      compression: false,
      maxMessageSize: 1024 * 1024 // 1MB
    }
  }

  /**
   * 注册内置验证器
   */
  private registerBuiltinValidators(): void {
    // URL验证器
    this.registerValidator('url', {
      validate: (value: string) => {
        if (value && !isValidUrl(value)) return '无效的URL格式'
        return true
      }
    })

    // 日志级别验证器
    this.registerValidator('logLevel', {
      validate: (value: LogLevel) => {
        const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error']
        if (!validLevels.includes(value)) {
          return `无效的日志级别: ${value}，有效值: ${validLevels.join(', ')}`
        }
        return true
      }
    })

    // 连接超时验证器
    this.registerValidator('connectionTimeout', {
      validate: (value: number) => {
        if (typeof value !== 'number' || value <= 0) {
          return '连接超时必须是大于0的数字'
        }
        return true
      }
    })
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * 设置嵌套对象的值
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {}
      }
      return current[key]
    }, obj)
    target[lastKey] = value
  }
}
