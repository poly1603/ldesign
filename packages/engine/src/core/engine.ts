import type { CacheConfig, CacheManager } from '../cache/cache-manager'
// 与 Engine 接口保持一致：从实现处引入这些管理器的类型
import type { EnvironmentManager } from '../environment/environment-manager'
import type { LifecycleManager } from '../lifecycle/lifecycle-manager'
import type { NotificationSystem } from '../notifications/notification-system';
import type { PerformanceManager } from '../performance/performance-manager'

import type { SecurityManager } from '../security/security-manager'
import type {
  ConfigManager,
  DirectiveManager,
  EngineConfig,
  ErrorManager,
  EventManager,
  I18nAdapter,
  Logger,
  LogLevel,
  MiddlewareManager,
  Plugin,
  PluginManager,
  RouterAdapter,
  StateAdapter,
  StateManager, ThemeAdapter
} from '../types'
import type { Engine } from '../types/engine'
import { type App, type Component, createApp, type Directive } from 'vue'
import { createCacheManager } from '../cache/cache-manager'
import {
  createConfigManager,
  defaultConfigSchema,
} from '../config/config-manager'
import { createDirectiveManager } from '../directives/directive-manager'
import { convertEngineToVueDirective } from '../directives/utils/directive-compatibility'
import { createEnvironmentManager } from '../environment/environment-manager'
import { createErrorManager } from '../errors/error-manager'
import { createEventManager } from '../events/event-manager'
import { createLifecycleManager } from '../lifecycle/lifecycle-manager'
import { createLogger } from '../logger/logger'
import { createMiddlewareManager } from '../middleware/middleware-manager'
import { createNotificationSystem } from '../notifications/notification-system'
import { createPerformanceManager } from '../performance/performance-manager'
import { createPluginManager } from '../plugins/plugin-manager'
import { createSecurityManager } from '../security/security-manager'
import { createStateManager } from '../state/state-manager'
import { ManagerRegistry } from './manager-registry'

/**
 * 引擎核心实现类
 *
 * 这个类是整个引擎系统的核心，负责：
 * - 管理所有子管理器的生命周期
 * - 提供统一的插件系统
 * - 集成Vue应用
 * - 协调各个模块之间的通信
 *
 * @example
 * ```typescript
 * const engine = createEngine({
 *   debug: true,
 *   performance: { enabled: true }
 * })
 *
 * await engine.mount('#app')
 * ```
 */
export class EngineImpl implements Engine {
  /** Vue应用实例 */
  private _app?: App

  /** 引擎是否已挂载 */
  private _mounted = false

  /** 引擎是否已准备就绪 */
  private _isReady = false

  /** 挂载目标元素 */
  private _mountTarget?: string | Element

  /** 配置管理器 - 负责管理所有配置项 */
  readonly config: ConfigManager

  /** 插件管理器 - 负责插件的加载、卸载和生命周期管理（懒加载） */
  private _plugins?: PluginManager

  /** 中间件管理器 - 提供请求/响应处理管道（懒加载） */
  private _middleware?: MiddlewareManager

  /** 事件管理器 - 负责事件的发布订阅机制（懒加载） */
  private _events?: EventManager

  /** 状态管理器 - 管理应用的全局状态（懒加载） */
  private _state?: StateManager

  /** 环境管理器 - 检测和管理运行环境信息 */
  readonly environment: EnvironmentManager

  /** 生命周期管理器 - 管理组件和应用的生命周期钩子 */
  readonly lifecycle: LifecycleManager

  /** 指令管理器 - 管理Vue自定义指令（懒加载） */
  private _directives?: DirectiveManager

  /** 错误管理器 - 统一的错误处理和报告（懒加载） */
  private _errors?: ErrorManager

  /** 日志记录器 - 提供分级日志记录功能 */
  readonly logger: Logger

  /** 通知管理器 - 管理用户通知和提示（懒加载） */
  private _notifications?: NotificationSystem

  /** 缓存管理器实例 - 懒加载，提供多级缓存策略 */
  private _cache?: CacheManager

  /** 性能管理器实例 - 懒加载，监控和优化应用性能 */
  private _performance?: PerformanceManager

  /** 安全管理器实例 - 懒加载，提供安全防护机制 */
  private _security?: SecurityManager

  /** 管理器注册表 - 管理所有管理器的依赖关系和初始化顺序 */
  private readonly managerRegistry: ManagerRegistry

  /** 路由适配器 - 可选的路由集成接口 */
  router?: RouterAdapter

  /** 状态适配器 - 可选的状态管理集成接口 */
  store?: StateAdapter

  /** 国际化适配器 - 可选的多语言支持接口 */
  i18n?: I18nAdapter

  /** 主题适配器 - 可选的主题切换接口 */
  theme?: ThemeAdapter

  /**
   * 懒加载事件管理器访问器
   */
  get events(): EventManager {
    if (!this._events) {
      const startTime = Date.now()
      this._events = createEventManager(this.logger)
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('events')
      this.logger.debug('Event manager initialized lazily', { initTime: `${initTime}ms` })
    }
    return this._events
  }

  /**
   * 懒加载状态管理器访问器
   */
  get state(): StateManager {
    if (!this._state) {
      const startTime = Date.now()
      this._state = createStateManager(this.logger)
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('state')
      this.logger.debug('State manager initialized lazily', { initTime: `${initTime}ms` })
    }
    return this._state
  }

  /**
   * 懒加载错误管理器访问器
   */
  get errors(): ErrorManager {
    if (!this._errors) {
      const startTime = Date.now()
      this._errors = createErrorManager()
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('errors')
      this.logger.debug('Error manager initialized lazily', { initTime: `${initTime}ms` })
      // 设置错误处理
      this.ensureErrorHandling()
    }
    return this._errors
  }

  /**
   * 懒加载指令管理器访问器
   */
  get directives(): DirectiveManager {
    if (!this._directives) {
      const startTime = Date.now()
      this._directives = createDirectiveManager()
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('directives')
      this.logger.debug('Directive manager initialized lazily', { initTime: `${initTime}ms` })
    }
    return this._directives
  }

  /**
   * 懒加载通知管理器访问器
   */
  get notifications(): NotificationSystem {
    if (!this._notifications) {
      const startTime = Date.now()
      this._notifications = createNotificationSystem(this)
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('notifications')
      this.logger.debug('Notification system initialized lazily', { initTime: `${initTime}ms` })
    }
    return this._notifications
  }

  /**
   * 懒加载中间件管理器访问器
   */
  get middleware(): MiddlewareManager {
    if (!this._middleware) {
      const startTime = Date.now()
      this._middleware = createMiddlewareManager(this.logger)
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('middleware')
      this.logger.debug('Middleware manager initialized lazily', { initTime: `${initTime}ms` })
    }
    return this._middleware
  }

  /**
   * 懒加载插件管理器访问器
   */
  get plugins(): PluginManager {
    if (!this._plugins) {
      const startTime = Date.now()
      this._plugins = createPluginManager(this)
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('plugins')
      this.logger.debug('Plugin manager initialized lazily', { initTime: `${initTime}ms` })
    }
    return this._plugins
  }

  /**
   * 懒加载缓存管理器访问器
   *
   * 使用懒加载模式来优化应用启动性能，只有在实际需要缓存功能时才初始化
   * 缓存管理器。这种方式可以显著减少应用的初始化时间。
   *
   * @returns {CacheManager} 缓存管理器实例
   *
   * @example
   * ```typescript
   * // 第一次访问时会自动初始化
   * const cache = engine.cache
   * cache.set('key', 'value')
   * ```
   */
  get cache(): CacheManager {
    if (!this._cache) {
      const startTime = Date.now()
      // 从配置中获取缓存设置，使用默认配置作为备用
      this._cache = createCacheManager(
        this.config?.get('cache', {}) as CacheConfig
      )
      const initTime = Date.now() - startTime
      // 在管理器注册表中标记为已初始化
      this.managerRegistry.markInitialized('cache')
      this.logger.debug('Cache manager initialized lazily', {
        initTime: `${initTime}ms`,
      })
    }
    return this._cache as CacheManager
  }

  /**
   * 懒加载性能管理器访问器
   *
   * 性能管理器用于监控和优化应用性能，包括：
   * - 应用加载时间监控
   * - 组件渲染性能监控
   * - 内存使用情况监控
   * - 网络请求性能监控
   *
   * @returns {PerformanceManager} 性能管理器实例
   */
  get performance(): PerformanceManager {
    if (!this._performance) {
      const startTime = Date.now()
      // 创建性能管理器并传入引擎实例作为上下文
      this._performance = createPerformanceManager(undefined, this)
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('performance')
      this.logger.debug('Performance manager initialized lazily', {
        initTime: `${initTime}ms`,
      })
    }
    return this._performance as PerformanceManager
  }

  /**
   * 懒加载安全管理器访问器
   *
   * 安全管理器提供应用安全防护功能，包括：
   * - XSS 攻击防护
   * - CSRF 攻击防护
   * - 内容安全策略 (CSP)
   * - 输入验证和清理
   * - 敏感操作权限检查
   *
   * @returns {SecurityManager} 安全管理器实例
   */
  get security(): SecurityManager {
    if (!this._security) {
      const startTime = Date.now()
      // 创建安全管理器并传入引擎实例作为上下文
      this._security = createSecurityManager(undefined, this)
      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized('security')
      this.logger.debug('Security manager initialized lazily', {
        initTime: `${initTime}ms`,
      })
    }
    return this._security as SecurityManager
  }

  /**
   * 构造函数 - 按照依赖顺序初始化所有管理器
   *
   * 初始化顺序非常重要：
   * 1. 配置管理器 - 其他组件需要读取配置
   * 2. 日志器 - 所有组件都需要记录日志
   * 3. 管理器注册表 - 管理组件依赖关系
   * 4. 环境管理器 - 提供运行环境信息
   * 5. 生命周期管理器 - 管理组件生命周期
   * 6. 其他核心管理器 - 按依赖关系顺序初始化
   *
   * @param config 引擎配置对象
   */
  constructor(config: EngineConfig = {}) {
    try {
      // 1. 首先创建配置管理器 - 所有其他组件都可能需要读取配置
      this.config = createConfigManager({
        debug: false,
        ...config,
      })

      // 设置默认配置Schema，确保配置项的类型安全
      this.config?.setSchema(defaultConfigSchema)

      // 2. 基于配置创建日志器 - 所有组件都需要记录日志
      const logLevel = this.config?.get('debug', false) ? 'debug' : 'info'
      this.logger = createLogger(logLevel)

      // 3. 创建管理器注册表 - 管理所有管理器的依赖关系和初始化顺序
      this.managerRegistry = new ManagerRegistry(this.logger)
      this.registerManagers()

      // 4. 初始化环境管理器（优先级最高，其他管理器可能依赖环境信息）
      this.environment = createEnvironmentManager(this.logger)

      // 5. 初始化生命周期管理器 - 管理整个应用的生命周期钩子
      this.lifecycle = createLifecycleManager(this.logger)

      // 6. 不再立即初始化管理器，改为懒加载（大幅提升启动性能）
      // 核心管理器（events、state、plugins等）将在首次访问时初始化

      // 设置配置变化监听器，实现响应式配置
      this.setupConfigWatchers()

      // 异步执行初始化后的生命周期钩子，避免构造函数阻塞
      Promise.resolve().then(() => {
        this.lifecycle.execute('afterInit', this).catch(error => {
          this.logger.error('Error in afterInit lifecycle hooks', error)
        })
      })
    } catch (error) {
      // 构造函数错误处理，确保资源清理
      console.error('Failed to initialize engine:', error)
      this.emergencyCleanup()
      throw error
    }
  }

  /**
   * 确保错误处理已设置（延迟初始化）
   * @private
   */
  private ensureErrorHandling(): void {
    // 只在首次访问errors时设置一次
    if (!this._errors) return

    // 检查是否已经设置
    if ((this._errors as any)._handlingSetup) return
      ; (this._errors as any)._handlingSetup = true

    // 注册全局错误监听器
    this._errors.onError(errorInfo => {
      // 1. 记录详细的错误信息到日志系统
      this.logger.error('Global error captured', errorInfo)

      // 2. 发送错误事件，允许其他模块做相应处理
      if (this._events) {
        this._events.emit('engine:error', errorInfo)
      }

      // 3. 在开发环境下显示错误通知，帮助开发者快速发现问题
      if (this.config?.get('debug', false) && this._notifications) {
        this._notifications.show({
          type: 'error',
          title: 'Error Captured',
          content: errorInfo.message,
          duration: 5000, // 5秒后自动消失
        })
      }
    })
  }

  /**
   * 设置配置变化监听器
   *
   * @private
   */
  private setupConfigWatchers(): void {
    // 存储防抖函数引用，便于清理
    if (!this.configWatchers) {
      this.configWatchers = new Map()
    }

    // 使用防抖优化配置监听，避免频繁触发
    const debouncedDebugChange = this.debounce((newValue: unknown) => {
      this.logger.setLevel(newValue ? 'debug' : 'info')
      this.logger.info('Debug mode changed', { debug: newValue })
    }, 300)
    this.configWatchers.set('debug', debouncedDebugChange)

    // 监听调试模式变化
    this.config?.watch('debug', debouncedDebugChange)

    // 使用防抖优化日志级别监听
    const debouncedLevelChange = this.debounce((newValue: unknown) => {
      const allowed: LogLevel[] = ['debug', 'info', 'warn', 'error']
      const level = typeof newValue === 'string' && (allowed as string[]).includes(newValue)
        ? (newValue as LogLevel)
        : this.logger.getLevel()
      this.logger.setLevel(level)
      this.logger.info('Log level changed', { level })
    }, 300)
    this.configWatchers.set('logger.level', debouncedLevelChange)

    // 监听日志级别变化
    this.config?.watch('logger.level', debouncedLevelChange)
  }

  /** 存储配置监听器的防抖函数，用于清理 */
  private configWatchers?: Map<string, { cancel: () => void }>

  /**
   * 防抖函数 - 优化性能和内存
   * @private
   * @template T 函数类型
   * @param func 要防抖的函数
   * @param wait 等待时间（毫秒）
   * @returns 防抖后的函数
   */
  private debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) & { cancel: () => void } {
    let timeoutId: number | undefined

    const debounced = (...args: Parameters<T>): void => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        func(...args)
        timeoutId = undefined
      }, wait)
    }

    // 添加取消方法，用于清理
    debounced.cancel = (): void => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
        timeoutId = undefined
      }
    }

    return debounced
  }

  // 核心方法
  async init(): Promise<void> {
    try {
      // 执行初始化前的生命周期钩子
      await this.lifecycle.execute('beforeInit', this)

      // 执行插件初始化
      await this.plugins.initializeAll()

      // 标记引擎为就绪状态
      this._isReady = true

      // 执行初始化后的生命周期钩子
      await this.lifecycle.execute('afterInit', this)

      this.logger.info('Engine initialization completed successfully')
    } catch (error) {
      this.logger.error('Engine initialization failed', error)
      this._isReady = false
      throw error
    }
  }

  isReady(): boolean {
    return this._isReady
  }

  // 创建Vue应用
  createApp(rootComponent: Component): App {
    if (this._app) {
      this.logger.warn('Vue app already created')
      return this._app
    }

    this._app = createApp(rootComponent)

    // 自动安装引擎
    this.install(this._app)

    // 触发应用创建事件，让扩展系统知道 Vue 应用已创建
    this.events.emit('app:created', this._app)

    // Vue app created with engine (日志已禁用)
    return this._app
  }

  install(app: App): void {
    if (this._app && this._app !== app) {
      this.logger.warn('Engine already installed to different app')
      return
    }

    this._app = app

    // 安装全局属性
    app.config.globalProperties.$engine = this

    // 提供引擎注入
    app.provide('engine', this)

    // 注册全局指令（只在directives已初始化时）
    if (this._directives) {
      const directiveNames = this._directives.getNames()
      directiveNames.forEach(name => {
        const eng = this._directives!.get(name)
        if (eng) {
          const vueDir = convertEngineToVueDirective(eng)
          app.directive(name, vueDir as Directive)
        }
      })
    }

    // 设置Vue错误处理（懒加载errors manager）
    app.config.errorHandler = (error, component, info) => {
      this.errors.captureError(error as Error, component || undefined, info)
    }

    // 安装适配器（只安装已经设置的适配器）
    if (this.router && typeof this.router.install === 'function') {
      this.router.install(this)
    }
    if (this.store && typeof this.store.install === 'function') {
      this.store.install(this)
    }
    if (this.i18n && typeof this.i18n.install === 'function') {
      this.i18n.install(this)
    }
    if (this.theme && typeof this.theme.install === 'function') {
      this.theme.install(this)
    }

    // Engine installed to Vue app (日志已禁用)
    // 只在events已初始化时触发
    if (this._events) {
      this._events.emit('engine:installed', { app })
    }
  }

  async use(plugin: Plugin): Promise<void> {
    await this.plugins.register(plugin)
  }

  async mount(selector: string | Element): Promise<void> {
    if (!this._app) {
      throw new Error(
        'Engine must have a Vue app before mounting. Use createApp() first.'
      )
    }

    if (this._mounted) {
      this.logger.warn('Engine already mounted')
      return
    }

    // 执行挂载前的生命周期钩子
    await this.lifecycle.execute('beforeMount', this)

    this._mountTarget = selector
    this._app.mount(selector)
    this._mounted = true

    // Engine mounted (日志已禁用)
    this.events.emit('engine:mounted', { target: selector })

    // 执行挂载后的生命周期钩子
    await this.lifecycle.execute('afterMount', this)
  }

  async unmount(): Promise<void> {
    if (!this._app || !this._mounted) {
      this.logger.warn('Engine not mounted')
      return
    }

    // 执行卸载前的生命周期钩子
    await this.lifecycle.execute('beforeUnmount', this)

    this._app.unmount()
    this._mounted = false

    this.logger.info('Engine unmounted')
    this.events.emit('engine:unmounted')

    // 执行卸载后的生命周期钩子
    await this.lifecycle.execute('afterUnmount', this)
  }

  // 扩展方法
  setRouter(router: RouterAdapter): void {
    this.router = router
    if (this._app) {
      router.install(this)
    }
    this.logger.info('Router adapter set')
  }

  setStore(store: StateAdapter): void {
    this.store = store
    if (this._app) {
      store.install(this)
    }
    this.logger.info('Store adapter set')
  }

  setI18n(i18n: I18nAdapter): void {
    this.i18n = i18n
    if (this._app) {
      i18n.install(this)
    }
    this.logger.info('I18n adapter set')
  }

  setTheme(theme: ThemeAdapter): void {
    this.theme = theme
    if (this._app) {
      theme.install(this)
    }
    this.logger.info('Theme adapter set')
  }

  // 获取Vue应用实例
  getApp(): App | undefined {
    return this._app
  }

  // 检查是否已挂载
  isMounted(): boolean {
    return this._mounted
  }

  // 获取挂载目标
  getMountTarget(): string | Element | undefined {
    return this._mountTarget
  }

  /**
   * 销毁引擎 - 完全清理所有资源和内存
   * 
   * 按照依赖关系的反向顺序清理资源，确保没有内存泄漏
   * @returns Promise<void>
   */
  async destroy(): Promise<void> {
    try {
      // 执行销毁前的生命周期钩子
      await this.lifecycle.execute('beforeDestroy', this)

      // 如果已挂载，先卸载
      if (this._mounted) {
        await this.unmount()
      }

      // 发送销毁事件
      this.events.emit('engine:destroy')

      // 清理所有核心管理器
      await this.cleanupManagers()

      // 清理懒加载的管理器（如果已初始化）
      if (this._cache) {
        if ('destroy' in this._cache && typeof this._cache.destroy === 'function') {
          (this._cache as any).destroy()
        } else {
          this._cache.clear()
        }
        this._cache = undefined
      }

      if (this._performance) {
        if ('destroy' in this._performance && typeof this._performance.destroy === 'function') {
          (this._performance as any).destroy()
        }
        this._performance = undefined
      }

      if (this._security) {
        if ('destroy' in this._security && typeof this._security.destroy === 'function') {
          (this._security as any).destroy()
        }
        this._security = undefined
      }

      // 清理 Vue 应用
      if (this._app) {
        delete (this._app.config.globalProperties as any).$engine
        this._app = undefined
      }
      this._mountTarget = undefined

      // 禁用配置自动保存
      this.config?.disableAutoSave()

      // 重置引擎状态
      this._isReady = false
      this._mounted = false

      // 清理管理器注册表
      this.managerRegistry.clear()

      this.logger.info('Engine destroyed successfully')

      // 执行销毁后的生命周期钩子
      await this.lifecycle.execute('afterDestroy', this)

      // 最后清理日志器引用
      // @ts-expect-error - 清理引用
      this.logger = undefined
    } catch (error) {
      console.error('Error during engine destruction:', error)
      // 紧急清理
      this.emergencyCleanup()
    }
  }

  // 配置相关方法
  updateConfig(config: Partial<Record<string, unknown>>): void {
    this.config?.merge(config)
    this.logger.info('Engine configuration updated', {
      keys: Object.keys(config),
    })
  }

  getConfig<T = unknown>(path: string, defaultValue?: T): T {
    return this.config?.get(path, defaultValue) as T
  }

  setConfig(path: string, value: unknown): void {
    this.config?.set(path, value)
    this.logger.debug('Engine configuration set', { path, value })
  }

  // 获取管理器初始化统计
  getManagerStats(): Record<string, unknown> {
    return this.managerRegistry.getInitializationStats() as unknown as Record<string, unknown>
  }

  // 验证管理器依赖图
  validateManagers(): { valid: boolean; errors: string[] } {
    const { valid, errors } = this.managerRegistry.validateDependencyGraph()
    return { valid, errors }
  }

  // 私有方法：注册管理器（更新为懒加载模式）
  private registerManagers(): void {
    // 注册立即初始化的核心管理器
    this.managerRegistry.register('config', [])
    this.managerRegistry.register('logger', ['config'])
    this.managerRegistry.register('environment', ['logger'])
    this.managerRegistry.register('lifecycle', ['logger'])

    // 注册懒加载管理器（所有业务管理器都改为懒加载）
    this.managerRegistry.register('events', ['logger'], true)
    this.managerRegistry.register('state', ['logger'], true)
    this.managerRegistry.register('errors', [], true)
    this.managerRegistry.register('directives', [], true)
    this.managerRegistry.register('notifications', ['logger'], true)
    this.managerRegistry.register('middleware', ['logger'], true)
    this.managerRegistry.register('plugins', ['events', 'state', 'middleware'], true)
    this.managerRegistry.register('cache', ['config'], true)
    this.managerRegistry.register('performance', ['config', 'logger'], true)
    this.managerRegistry.register('security', ['config', 'logger'], true)

    this.logger.debug('Managers registered in registry (lazy-load mode)')
  }

  /**
   * 清理所有管理器 - 优化版（支持懒加载的管理器）
   * @private
   */
  private async cleanupManagers(): Promise<void> {
    try {
      // 清理配置监听器的防抖函数
      if (this.configWatchers) {
        for (const watcher of this.configWatchers.values()) {
          watcher.cancel()
        }
        this.configWatchers.clear()
        this.configWatchers = undefined
      }

      // 按照反向顺序清理已初始化的懒加载管理器
      const cleanupOrder: Array<{ key: string; name: string }> = [
        { key: '_plugins', name: 'plugins' },
        { key: '_middleware', name: 'middleware' },
        { key: '_notifications', name: 'notifications' },
        { key: '_directives', name: 'directives' },
        { key: '_errors', name: 'errors' },
        { key: '_state', name: 'state' },
        { key: '_events', name: 'events' },
      ]

      for (const { key, name } of cleanupOrder) {
        const manager = (this as any)[key]
        if (manager) {
          // 检查是否有 destroy 方法
          if ('destroy' in manager && typeof manager.destroy === 'function') {
            await Promise.resolve(manager.destroy())
          } else if ('clear' in manager && typeof manager.clear === 'function') {
            manager.clear()
          }
          (this as any)[key] = undefined
          this.logger?.debug(`Manager "${name}" cleaned up`)
        }
      }
    } catch (error) {
      this.logger?.error('Error cleaning up managers:', error)
    }
  }

  /**
   * 紧急清理 - 在发生严重错误时使用
   * @private
   */
  private emergencyCleanup(): void {
    try {
      // 清理所有可能的资源（懒加载和立即加载的）
      const managersToClean = [
        this._events, this._state, this._errors, this._directives,
        this._notifications, this._middleware, this._plugins,
        this._cache, this._performance, this._security
      ]

      for (const manager of managersToClean) {
        if (manager && typeof manager === 'object') {
          if ('destroy' in manager && typeof manager.destroy === 'function') {
            try {
              (manager as any).destroy()
            } catch {
              // 忽略清理错误
            }
          } else if ('clear' in manager && typeof manager.clear === 'function') {
            try {
              (manager as any).clear()
            } catch {
              // 忽略清理错误
            }
          }
        }
      }

      // 清理 Vue 应用
      if (this._app) {
        try {
          delete (this._app.config.globalProperties as any).$engine
        } catch {
          // 忽略错误
        }
      }

      // 重置状态
      this._isReady = false
      this._mounted = false
    } catch (error) {
      console.error('Emergency cleanup failed:', error)
    }
  }
}
