/**
 * 核心引擎实现
 * 整合所有管理器，提供统一的引擎接口
 */

import { createCacheManager } from './cache'
import { createConfigManager } from './config'
import { createDIContainer } from './di'
import { createEventManager } from './events'
import { createLifecycleManager } from './lifecycle'
import { createLogger } from './logger'
import { createMiddlewareManager } from './middleware'
import { createPluginManager } from './plugin'
import { createStateManager } from './state'
import type {
  CacheManager,
  ConfigManager,
  CoreEngine,
  CoreEngineConfig,
  DIContainer,
  EventManager,
  LifecycleManager,
  Logger,
  MiddlewareManager,
  Plugin,
  PluginManager,
  StateManager,
} from './types'

/**
 * 核心引擎类
 */
export class CoreEngineImpl implements CoreEngine {
  // 核心管理器
  readonly plugins: PluginManager
  readonly middleware: MiddlewareManager
  readonly lifecycle: LifecycleManager
  readonly events: EventManager
  readonly state: StateManager
  readonly cache: CacheManager
  readonly logger: Logger
  readonly config: ConfigManager
  readonly di: DIContainer

  // 引擎状态
  private initialized = false
  private destroyed = false

  constructor(config: CoreEngineConfig = {}) {
    // 创建配置管理器
    this.config = createConfigManager(config)

    // 创建日志器
    this.logger = createLogger({
      level: config.logger?.level ?? (config.debug ? 'debug' : 'info'),
      enabled: config.logger?.enabled ?? true,
      prefix: `[${config.name || 'Engine'}]`,
    })

    // 创建事件管理器
    this.events = createEventManager()

    // 创建生命周期管理器
    this.lifecycle = createLifecycleManager()

    // 创建状态管理器
    this.state = createStateManager()

    // 创建缓存管理器
    this.cache = createCacheManager(config.cache)

    // 创建中间件管理器
    this.middleware = createMiddlewareManager()

    // 创建依赖注入容器
    this.di = createDIContainer()

    // 创建插件管理器（需要引擎上下文）
    this.plugins = createPluginManager({
      engine: this,
      logger: this.logger,
      config: this.config,
      events: this.events,
    })

    this.logger.debug('CoreEngine created')
  }

  /**
   * 初始化引擎
   */
  async init(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Engine already initialized')
      return
    }

    if (this.destroyed) {
      throw new Error('Cannot initialize destroyed engine')
    }

    this.logger.info('Initializing engine...')

    // 执行 beforeInit 生命周期
    await this.lifecycle.execute('beforeInit', this)

    try {
      // 初始化所有管理器
      await this.initializeManagers()

      // 标记为已初始化
      this.initialized = true

      // 执行 init 生命周期
      await this.lifecycle.execute('init', this)

      // 执行 afterInit 生命周期
      await this.lifecycle.execute('afterInit', this)

      this.logger.info('Engine initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize engine:', error)
      await this.lifecycle.execute('error', this, { error })
      throw error
    }
  }

  /**
   * 销毁引擎
   */
  async destroy(): Promise<void> {
    if (this.destroyed) {
      this.logger.warn('Engine already destroyed')
      return
    }

    this.logger.info('Destroying engine...')

    // 执行 beforeDestroy 生命周期
    await this.lifecycle.execute('beforeDestroy', this)

    try {
      // 标记为已销毁
      this.destroyed = true
      this.initialized = false

      // 执行 destroy 生命周期
      await this.lifecycle.execute('destroy', this)

      // 执行 afterDestroy 生命周期
      await this.lifecycle.execute('afterDestroy', this)

      // 销毁所有管理器（在所有生命周期钩子执行后）
      await this.destroyManagers()

      this.logger.info('Engine destroyed successfully')
    } catch (error) {
      this.logger.error('Failed to destroy engine:', error)
      throw error
    }
  }

  /**
   * 注册插件
   */
  async use(plugin: Plugin): Promise<void> {
    if (!this.initialized) {
      this.logger.warn('Engine not initialized yet, auto-initializing...')
      await this.init()
    }

    await this.plugins.register(plugin)
    this.logger.debug(`Plugin "${plugin.name}" registered`)
  }

  /**
   * 获取引擎状态
   */
  getStatus(): {
    initialized: boolean
    destroyed: boolean
    pluginCount: number
    middlewareCount: number
  } {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      pluginCount: this.plugins.getAll().length,
      middlewareCount: this.middleware.getAll().length,
    }
  }

  /**
   * 初始化所有管理器
   */
  private async initializeManagers(): Promise<void> {
    const managers = [
      this.config,
      this.logger,
      this.events,
      this.lifecycle,
      this.state,
      this.cache,
      this.middleware,
      this.di,
      this.plugins,
    ]

    for (const manager of managers) {
      if (manager.init) {
        await manager.init()
      }
    }
  }

  /**
   * 销毁所有管理器
   */
  private async destroyManagers(): Promise<void> {
    const managers = [
      this.plugins,
      this.middleware,
      this.cache,
      this.state,
      this.lifecycle,
      this.events,
      this.di,
      this.logger,
      this.config,
    ]

    for (const manager of managers) {
      if (manager.destroy) {
        try {
          await manager.destroy()
        } catch (error) {
          this.logger.error('Error destroying manager:', error)
        }
      }
    }
  }
}

/**
 * 创建核心引擎
 */
export function createCoreEngine(config?: CoreEngineConfig): CoreEngine {
  return new CoreEngineImpl(config)
}

