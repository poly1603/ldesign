// 与 Engine 接口保持一致：从实现处引入这些管理器的类型
import type { EnvironmentManager } from '../environment/environment-manager'
import type { LifecycleManager } from '../lifecycle/lifecycle-manager'
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
  NotificationManager,
  Plugin,
  PluginManager,
  RouterAdapter,
  StateAdapter,
  StateManager, ThemeAdapter
} from '../types'

import type { Engine } from '../types/engine'
import { type App, type Component, createApp, type Directive } from 'vue'
import { type CacheConfig, type CacheManager, createCacheManager } from '../cache/unified-cache-manager'
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
import { createNotificationManager } from '../notifications/notification-manager'
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

  /** 插件管理器 - 负责插件的加载、卸载和生命周期管理 */
  plugins!: PluginManager

  /** 中间件管理器 - 提供请求/响应处理管道 */
  middleware!: MiddlewareManager

  /** 事件管理器 - 负责事件的发布订阅机制 */
  events!: EventManager

  /** 状态管理器 - 管理应用的全局状态 */
  state!: StateManager

  /** 环境管理器 - 检测和管理运行环境信息 */
  readonly environment: EnvironmentManager

  /** 生命周期管理器 - 管理组件和应用的生命周期钩子 */
  readonly lifecycle: LifecycleManager

  /** 指令管理器 - 管理Vue自定义指令 */
  directives!: DirectiveManager

  /** 错误管理器 - 统一的错误处理和报告 */
  errors!: ErrorManager

  /** 日志记录器 - 提供分级日志记录功能 */
  readonly logger: Logger

  /** 通知管理器 - 管理用户通知和提示 */
  notifications!: NotificationManager

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
        this.config.get('cache', {}) as CacheConfig
      )
      const initTime = Date.now() - startTime
      // 在管理器注册表中标记为已初始化
      this.managerRegistry.markInitialized('cache')
      this.logger.debug('Cache manager initialized lazily', {
        initTime: `${initTime}ms`,
      })
    }
    return this._cache!
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
    return this._performance!
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
    return this._security!
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
    // 1. 首先创建配置管理器 - 所有其他组件都可能需要读取配置
    this.config = createConfigManager({
      debug: false,
      ...config,
    })

    // 设置默认配置Schema，确保配置项的类型安全
    this.config.setSchema(defaultConfigSchema)

    // 2. 基于配置创建日志器 - 所有组件都需要记录日志
    this.logger = createLogger(
      this.config.get('debug', false) ? 'debug' : 'info'
    )

    // 3. 创建管理器注册表 - 管理所有管理器的依赖关系和初始化顺序
    this.managerRegistry = new ManagerRegistry(this.logger)
    this.registerManagers()

    // 4. 初始化环境管理器（优先级最高，其他管理器可能依赖环境信息）
    this.environment = createEnvironmentManager(this.logger)

    // 5. 初始化生命周期管理器 - 管理整个应用的生命周期钩子
    this.lifecycle = createLifecycleManager(this.logger)

    // 6. 按依赖顺序初始化核心管理器 - 确保依赖关系正确
    this.initializeManagers()

    // 设置全局错误处理机制
    this.setupErrorHandling()

    // 设置配置变化监听器，实现响应式配置
    this.setupConfigWatchers()

    this.logger.info('Engine initialized', {
      environment: this.config.getEnvironment(),
      features: this.config.get('features', {}),
    })

    // 执行初始化后的生命周期钩子
    this.lifecycle.execute('afterInit', this).catch(error => {
      this.logger.error('Error in afterInit lifecycle hooks', error)
    })
  }

  /**
   * 设置全局错误处理机制
   *
   * 这个方法设置了一个统一的错误处理系统，能够：
   * 1. 捕获所有未处理的错误
   * 2. 记录错误日志供调试使用
   * 3. 发送错误事件供其他模块监听
   * 4. 在调试模式下显示用户友好的错误通知
   *
   * @private
   */
  private setupErrorHandling(): void {
    // 注册全局错误监听器
    this.errors.onError(errorInfo => {
      // 1. 记录详细的错误信息到日志系统
      this.logger.error('Global error captured', errorInfo)

      // 2. 发送错误事件，允许其他模块做相应处理
      this.events.emit('engine:error', errorInfo)

      // 3. 在开发环境下显示错误通知，帮助开发者快速发现问题
      if (this.config.get('debug', false)) {
        this.notifications.show({
          type: 'error',
          title: 'Error Captured',
          message: errorInfo.message,
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
    // 使用防抖优化配置监听，避免频繁触发
    const debouncedDebugChange = this.debounce((newValue: unknown) => {
      this.logger.setLevel(newValue ? 'debug' : 'info')
      this.logger.info('Debug mode changed', { debug: newValue })
    }, 300)

    // 监听调试模式变化
    this.config.watch('debug', debouncedDebugChange)

    // 使用防抖优化日志级别监听
    const debouncedLevelChange = this.debounce((newValue: unknown) => {
      const allowed: LogLevel[] = ['debug', 'info', 'warn', 'error']
      const level = typeof newValue === 'string' && (allowed as string[]).includes(newValue)
        ? (newValue as LogLevel)
        : this.logger.getLevel()
      this.logger.setLevel(level)
      this.logger.info('Log level changed', { level })
    }, 300)

    // 监听日志级别变化
    this.config.watch('logger.level', debouncedLevelChange)
  }

  /**
   * 防抖函数 - 优化性能
   * @private
   */
  private debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | undefined
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
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

    this.logger.info('Vue app created with engine')
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

    // 注册全局指令
    const directiveNames = this.directives.getNames()
    directiveNames.forEach(name => {
      const eng = this.directives.get(name)
      if (eng) {
        const vueDir = convertEngineToVueDirective(eng)
        app.directive(name, vueDir as Directive)
      }
    })

    // 设置Vue错误处理
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

    this.logger.info('Engine installed to Vue app')
    this.events.emit('engine:installed', { app })
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

    this.logger.info('Engine mounted', { target: selector })
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

  // 销毁引擎
  async destroy(): Promise<void> {
    // 执行销毁前的生命周期钩子
    await this.lifecycle.execute('beforeDestroy', this)

    if (this._mounted) {
      await this.unmount()
    }

    // 清理资源
    this.events.emit('engine:destroy')
    this.errors.clearErrors()
    this.logger.clearLogs()
    this.notifications.hideAll()
    this.state.clear()

    // 清理懒加载的管理器（如果已初始化）
    if (this._cache) {
      this._cache.clear()
    }
    if (this._performance) {
      // this._performance.stopMonitoring()
    }

    // 禁用配置自动保存
    this.config.disableAutoSave()

    // 重置引擎状态
    this._isReady = false
    this._mounted = false

    this.logger.info('Engine destroyed')

    // 执行销毁后的生命周期钩子
    await this.lifecycle.execute('afterDestroy', this)
  }

  // 配置相关方法
  updateConfig(config: Partial<Record<string, unknown>>): void {
    this.config.merge(config)
    this.logger.info('Engine configuration updated', {
      keys: Object.keys(config),
    })
  }

  getConfig<T = unknown>(path: string, defaultValue?: T): T {
    return this.config.get(path, defaultValue) as T
  }

  setConfig(path: string, value: unknown): void {
    this.config.set(path, value)
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

  // 私有方法：注册管理器
  private registerManagers(): void {
    // 注册核心管理器（按依赖顺序）
    this.managerRegistry.register('config', [])
    this.managerRegistry.register('logger', ['config'])
    this.managerRegistry.register('environment', ['logger'])
    this.managerRegistry.register('events', ['logger'])
    this.managerRegistry.register('state', ['logger'])
    this.managerRegistry.register('errors', [])
    this.managerRegistry.register('directives', [])
    this.managerRegistry.register('notifications', ['logger'])
    this.managerRegistry.register('middleware', ['logger'])
    this.managerRegistry.register('plugins', ['events', 'state', 'middleware'])

    // 注册懒加载管理器
    this.managerRegistry.register('cache', ['config'], true)
    this.managerRegistry.register('performance', ['config', 'logger'], true)
    this.managerRegistry.register('security', ['config', 'logger'], true)

    this.logger.debug('Managers registered in registry')
  }

  // 私有方法：初始化管理器
  private initializeManagers(): void {
    try {
      // 验证依赖图
      const validation = this.managerRegistry.validateDependencyGraph()
      if (!validation.valid) {
        this.logger.error('Manager dependency validation failed', {
          errors: validation.errors,
          warnings: validation.warnings,
        })
      }

      // 获取初始化顺序
      const initOrder = this.managerRegistry.getInitializationOrder()
      this.logger.debug('Manager initialization order', { order: initOrder })

      // 按顺序初始化管理器
      this.initializeManagersInOrder(initOrder)
    } catch (error) {
      this.logger.error('Failed to initialize managers', error)
      throw error
    }
  }

  // 管理器初始化工厂映射 - 提高可维护性
  private readonly managerFactories: Record<string, () => unknown> = {
    events: () => createEventManager(this.logger),
    state: () => createStateManager(this.logger),
    errors: () => createErrorManager(),
    directives: () => createDirectiveManager(),
    notifications: () => createNotificationManager(this.logger),
    middleware: () => createMiddlewareManager(this.logger),
    plugins: () => createPluginManager(this),
  }

  // 私有方法：按顺序初始化管理器
  private initializeManagersInOrder(order: string[]): void {
    for (const managerName of order) {
      this.initializeSingleManager(managerName)
    }
  }

  // 私有方法：初始化单个管理器
  private initializeSingleManager(managerName: string): void {
    try {
      const startTime = Date.now()

      // 跳过已经初始化的核心管理器
      if (['config', 'logger', 'environment'].includes(managerName)) {
        this.managerRegistry.markInitialized(managerName)
        this.logger.debug(`Manager "${managerName}" already initialized`)
        return
      }

      const factory = this.managerFactories[managerName]
      if (!factory) {
        this.logger.warn(`Unknown manager: ${managerName}`)
        return
      }

      // 使用工厂函数创建管理器
      const manager = factory()

      // 将管理器分配到对应的属性
      this.assignManagerToProperty(managerName, manager)

      const initTime = Date.now() - startTime
      this.managerRegistry.markInitialized(managerName)
      this.logger.debug(`Manager "${managerName}" initialized`, {
        initTime: `${initTime}ms`,
      })
    } catch (error) {
      this.managerRegistry.markInitialized(managerName, error as Error)
      this.logger.error(
        `Failed to initialize manager "${managerName}"`,
        error
      )
      throw error
    }
  }

  // 私有方法：将管理器分配到对应的属性
  private assignManagerToProperty(managerName: string, manager: unknown): void {
    switch (managerName) {
      case 'events':
        this.events = manager as EventManager
        break
      case 'state':
        this.state = manager as StateManager
        break
      case 'errors':
        this.errors = manager as ErrorManager
        break
      case 'directives':
        this.directives = manager as DirectiveManager
        break
      case 'notifications':
        this.notifications = manager as NotificationManager
        break
      case 'middleware':
        this.middleware = manager as MiddlewareManager
        break
      case 'plugins':
        this.plugins = manager as PluginManager
        break
    }
  }
}
