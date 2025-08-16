import type {
  DirectiveManager,
  Engine,
  EngineConfig,
  ErrorManager,
  EventManager,
  I18nAdapter,
  Logger,
  MiddlewareManager,
  NotificationManager,
  Plugin,
  PluginManager,
  RouterAdapter,
  StateAdapter,
  StateManager,
  ThemeAdapter,
} from '../types'
import { type App, type Component, createApp } from 'vue'
import { createDirectiveManager } from '../directives/directive-manager'
import { createErrorManager } from '../errors/error-manager'
import { createEventManager } from '../events/event-manager'
import { createLogger } from '../logger/logger'
import { createMiddlewareManager } from '../middleware/middleware-manager'
import { createNotificationManager } from '../notifications/notification-manager'
import { createPluginManager } from '../plugins/plugin-manager'
import { createStateManager } from '../state/state-manager'

export class EngineImpl implements Engine {
  private _app?: App
  private _mounted = false
  private _mountTarget?: string | Element

  readonly config: EngineConfig
  readonly plugins: PluginManager
  readonly middleware: MiddlewareManager
  readonly events: EventManager
  readonly state: StateManager
  readonly directives: DirectiveManager
  readonly errors: ErrorManager
  readonly logger: Logger
  readonly notifications: NotificationManager

  // 扩展接口
  router?: RouterAdapter
  store?: StateAdapter
  i18n?: I18nAdapter
  theme?: ThemeAdapter

  constructor(config: EngineConfig = {}) {
    this.config = {
      debug: false,
      ...config,
    }

    // 初始化核心模块
    this.logger = createLogger(this.config.debug ? 'debug' : 'info')
    this.events = createEventManager()
    this.state = createStateManager()
    this.errors = createErrorManager()
    this.directives = createDirectiveManager()
    this.middleware = createMiddlewareManager()
    this.plugins = createPluginManager(this)
    this.notifications = createNotificationManager()

    // 设置错误处理
    this.setupErrorHandling()

    this.logger.info('Engine initialized', { config: this.config })
  }

  private setupErrorHandling(): void {
    // 监听全局错误
    this.errors.onError(errorInfo => {
      this.logger.error('Global error captured', errorInfo)

      // 发送错误事件
      this.events.emit('engine:error', errorInfo)

      // 显示错误通知（仅在非生产环境）
      if (this.config.debug) {
        this.notifications.show({
          type: 'error',
          title: 'Error Captured',
          message: errorInfo.message,
          duration: 5000,
        })
      }
    })
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

    // 触发应用创建事件，让适配器知道 Vue 应用已创建
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
    const directives = this.directives.getAll()
    Object.entries(directives).forEach(([name, directive]) => {
      app.directive(name, directive)
    })

    // 设置Vue错误处理
    app.config.errorHandler = (error, component, info) => {
      this.errors.captureError(error as Error, component || undefined, info)
    }

    // 安装扩展适配器
    if (this.router) {
      this.router.install(this)
    }
    if (this.store) {
      this.store.install(this)
    }
    if (this.i18n) {
      this.i18n.install(this)
    }
    if (this.theme) {
      this.theme.install(this)
    }

    this.logger.info('Engine installed to Vue app')
    this.events.emit('engine:installed', { app })
  }

  async use(plugin: Plugin): Promise<void> {
    await this.plugins.register(plugin)
  }

  mount(selector: string | Element): void {
    if (!this._app) {
      throw new Error(
        'Engine must have a Vue app before mounting. Use createApp() first.'
      )
    }

    if (this._mounted) {
      this.logger.warn('Engine already mounted')
      return
    }

    this._mountTarget = selector
    this._app.mount(selector)
    this._mounted = true

    this.logger.info('Engine mounted', { target: selector })
    this.events.emit('engine:mounted', { target: selector })
  }

  unmount(): void {
    if (!this._app || !this._mounted) {
      this.logger.warn('Engine not mounted')
      return
    }

    this._app.unmount()
    this._mounted = false

    this.logger.info('Engine unmounted')
    this.events.emit('engine:unmounted')
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
  destroy(): void {
    if (this._mounted) {
      this.unmount()
    }

    // 清理资源
    this.events.emit('engine:destroy')
    this.errors.clearErrors()
    this.logger.clearLogs()
    this.notifications.hideAll()
    this.state.clear()

    this.logger.info('Engine destroyed')
  }
}
