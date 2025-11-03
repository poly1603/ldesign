/**
 * 核心引擎类型定义
 */

import type { CacheManager } from './cache'
import type { ConfigManager, EngineConfig } from './config'
import type { DIContainer } from './di'
import type { EventManager } from './events'
import type { LifecycleManager } from './lifecycle'
import type { Logger } from './logger'
import type { MiddlewareManager } from './middleware'
import type { Plugin, PluginManager } from './plugin'
import type { StateManager } from './state'

/**
 * 核心引擎配置
 */
export interface CoreEngineConfig extends EngineConfig {
  /** 日志配置 */
  logger?: {
    level?: 'debug' | 'info' | 'warn' | 'error'
    enabled?: boolean
  }

  /** 缓存配置 */
  cache?: {
    maxSize?: number
    defaultTTL?: number
    strategy?: 'lru' | 'lfu' | 'fifo' | 'ttl'
  }

  /** 插件配置 */
  plugins?: {
    autoInit?: boolean
  }
}

/**
 * 核心引擎接口
 */
export interface CoreEngine {
  /** 核心管理器 */
  readonly plugins: PluginManager
  readonly middleware: MiddlewareManager
  readonly lifecycle: LifecycleManager
  readonly events: EventManager
  readonly state: StateManager
  readonly cache: CacheManager
  readonly logger: Logger
  readonly config: ConfigManager
  readonly di: DIContainer

  /** 生命周期方法 */
  init(): Promise<void>
  destroy(): Promise<void>

  /** 插件注册 */
  use(plugin: Plugin): Promise<void>

  /** 获取引擎状态 */
  getStatus(): {
    initialized: boolean
    destroyed: boolean
    pluginCount: number
    middlewareCount: number
  }
}

/**
 * 创建引擎选项
 */
export interface CreateEngineOptions {
  config?: CoreEngineConfig
}

