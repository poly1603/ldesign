import type { Component } from 'vue'
import type { CreateEngineOptions, Engine, Middleware, Plugin } from './types'
import { EngineImpl } from './core/engine'
import { commonDirectives } from './directives/directive-manager'
import { createErrorManager } from './errors/error-manager'
import { createLogger } from './logger/logger'
import { commonMiddleware } from './middleware/middleware-manager'

// import './styles/index.less' // 暂时注释掉，需要配置CSS处理插件

// 导出缓存管理器
export {
  CacheManagerImpl,
  CacheStrategy,
  createCacheManager,
} from './cache/cache-manager'

// 导出配置管理器
export {
  ConfigManagerImpl,
  createConfigManager,
  defaultConfigSchema,
  NamespacedConfigManager,
} from './config/config-manager'

// 导出常量
export * from './constants'

// 导出核心类
export { EngineImpl } from './core/engine'

export {
  commonDirectives,
  createDirectiveManager,
} from './directives/directive-manager'

export { createErrorManager, errorHandlers } from './errors/error-manager'

export { createEventManager, ENGINE_EVENTS } from './events/event-manager'
export { createLogger, logFormatters, logTransports } from './logger/logger'
export {
  commonMiddleware,
  createMiddlewareManager,
} from './middleware/middleware-manager'
export {
  createNotificationManager,
  notificationTypes,
} from './notifications/notification-manager'
// 导出性能管理器
export {
  createPerformanceManager,
  PerformanceEventType,
} from './performance/performance-manager'
// 导出管理器
export { createPluginManager } from './plugins/plugin-manager'
// 导出安全管理器
export {
  createSecurityManager,
  SecurityEventType,
} from './security/security-manager'
export { createStateManager, stateModules } from './state/state-manager'

/**
 * 创建Vue3应用引擎实例
 * @param options 引擎配置选项
 * @returns 引擎实例
 */
export function createEngine(options: CreateEngineOptions = {}): Engine {
  const {
    config = {},
    plugins = [],
    middleware = [],
    router,
    store,
    i18n,
    theme,
    configSchema,
    enableAutoSave = false,
    autoSaveInterval = 30000,
  } = options

  // 创建引擎实例
  const engine = new EngineImpl(config as any)

  // 设置自定义配置Schema
  if (configSchema) {
    engine.config.setSchema(configSchema)
  }

  // 启用配置自动保存
  if (enableAutoSave) {
    engine.config.enableAutoSave(autoSaveInterval)
  }

  // 注册常用指令
  engine.directives.registerBatch(commonDirectives)

  // 设置扩展适配器
  if (router) {
    engine.setRouter(router)
  }
  if (store) {
    engine.setStore(store)
  }
  if (i18n) {
    engine.setI18n(i18n)
  }
  if (theme) {
    engine.setTheme(theme)
  }

  // 注册中间件
  middleware.forEach((m) => {
    engine.middleware.use(m)
  })

  // 注册插件（异步）
  Promise.all(plugins.map(plugin => engine.use(plugin))).catch((error) => {
    engine.logger.error('Failed to register plugins', error)
  })

  return engine
}

/**
 * 创建Vue3应用（简化版API）
 * @param rootComponent 根组件
 * @param options 引擎配置选项
 * @returns 引擎实例
 */
export function createApp(
  rootComponent: Component,
  options: CreateEngineOptions = {},
): Engine {
  // 创建引擎实例
  const engine = createEngine(options)

  // 创建Vue应用
  engine.createApp(rootComponent)

  return engine
}

// 注意：为了避免混合导出警告，我们不使用默认导出
// 用户可以使用 import { createEngine } from '@ldesign/engine'

// 版本信息
export const version = '0.1.0'

// 便捷创建器
export const creators = {
  engine: createEngine,
  plugin: (
    name: string,
    install: Plugin['install'],
    options?: Partial<Plugin>,
  ): Plugin => ({
    name,
    install,
    ...options,
  }),
  middleware: (
    name: string,
    handler: Middleware['handler'],
    priority?: number,
  ): Middleware => ({
    name,
    handler,
    priority,
  }),
}

// 工具函数
export const utils = {
  // 检查是否为浏览器环境
  isBrowser: () => typeof window !== 'undefined',

  // 检查是否为开发环境
  isDev: () => {
    try {
      // eslint-disable-next-line ts/no-require-imports
      const nodeProcess = require('node:process')
      return (
        typeof nodeProcess !== 'undefined'
        && nodeProcess.env?.NODE_ENV === 'development'
      )
    }
    catch {
      return false
    }
  },

  // 生成唯一ID
  generateId: (prefix = 'engine') =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // 深度合并对象
  deepMerge: <T extends Record<string, any>>(
    target: T,
    source: Partial<T>,
  ): T => {
    const result = { ...target }

    for (const key in source) {
      if (
        source[key]
        && typeof source[key] === 'object'
        && !Array.isArray(source[key])
      ) {
        result[key] = utils.deepMerge(
          result[key] || ({} as any),
          source[key]!,
        ) as any
      }
      else {
        result[key] = source[key]!
      }
    }

    return result
  },

  // 防抖函数
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout

    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // 节流函数
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): ((...args: Parameters<T>) => void) => {
    let lastTime = 0

    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastTime >= wait) {
        lastTime = now
        func(...args)
      }
    }
  },
}

// 常量
export const constants = {
  // 默认配置
  DEFAULT_CONFIG: {
    debug: false,
    appName: 'Vue3 Engine App',
    version: '1.0.0',
  },

  // 事件名称
  EVENTS: {
    ENGINE_MOUNTED: 'engine:mounted',
    ENGINE_UNMOUNTED: 'engine:unmounted',
    ENGINE_ERROR: 'engine:error',
    PLUGIN_REGISTERED: 'plugin:registered',
    PLUGIN_UNREGISTERED: 'plugin:unregistered',
    MIDDLEWARE_ADDED: 'middleware:added',
    MIDDLEWARE_REMOVED: 'middleware:removed',
    STATE_CHANGED: 'state:changed',
    ERROR_CAPTURED: 'error:captured',
    NOTIFICATION_SHOWN: 'notification:shown',
    NOTIFICATION_HIDDEN: 'notification:hidden',
  },

  // 日志级别
  LOG_LEVELS: ['debug', 'info', 'warn', 'error'] as const,

  // 通知类型
  NOTIFICATION_TYPES: ['success', 'error', 'warning', 'info'] as const,
}

// 预设配置
export const presets = {
  // 开发环境预设
  development: (): CreateEngineOptions => {
    const logger = createLogger('debug')
    return {
      config: {
        app: {
          name: 'Development App',
          version: '1.0.0',
        },
        environment: 'development',
        debug: true,
        features: {
          enableHotReload: true,
          enableDevTools: true,
          enablePerformanceMonitoring: true,
          enableErrorReporting: true,
          enableSecurityProtection: true,
          enableCaching: true,
          enableNotifications: true,
        },
        logger: {
          level: 'debug',
          maxLogs: 1000,
          enableConsole: true,
          enableStorage: true,
          storageKey: 'engine-logs-dev',
          transports: ['console', 'localStorage'],
        },
        cache: {
          enabled: true,
          maxSize: 500,
          defaultTTL: 5 * 60 * 1000, // 5分钟
          strategy: 'lru',
          enableStats: true,
          cleanupInterval: 60000,
        },
      },
      enableAutoSave: true,
      autoSaveInterval: 10000, // 10秒
      middleware: [
        commonMiddleware.logger(logger),
        commonMiddleware.performance(logger),
      ],
    }
  },

  // 生产环境预设
  production: (): CreateEngineOptions => ({
    config: {
      app: {
        name: 'Production App',
        version: '1.0.0',
      },
      environment: 'production',
      debug: false,
      features: {
        enableHotReload: false,
        enableDevTools: false,
        enablePerformanceMonitoring: true,
        enableErrorReporting: true,
        enableSecurityProtection: true,
        enableCaching: true,
        enableNotifications: true,
      },
      logger: {
        level: 'warn',
        maxLogs: 500,
        enableConsole: false,
        enableStorage: true,
        storageKey: 'engine-logs-prod',
        transports: ['localStorage'],
      },
      cache: {
        enabled: true,
        maxSize: 1000,
        defaultTTL: 30 * 60 * 1000, // 30分钟
        strategy: 'lru',
        enableStats: false,
        cleanupInterval: 300000, // 5分钟
      },
    },
    enableAutoSave: true,
    autoSaveInterval: 60000, // 1分钟
    middleware: [commonMiddleware.errorHandler(createErrorManager())],
  }),

  // 最小配置预设
  minimal: (): CreateEngineOptions => ({
    config: {
      app: {
        name: 'Minimal App',
        version: '1.0.0',
      },
      environment: 'production',
      debug: false,
      features: {
        enableHotReload: false,
        enableDevTools: false,
        enablePerformanceMonitoring: false,
        enableErrorReporting: false,
        enableSecurityProtection: false,
        enableCaching: false,
        enableNotifications: false,
      },
    },
    enableAutoSave: false,
  }),
}

// Vue插件安装函数
export function install(app: any, options: CreateEngineOptions = {}) {
  const engine = createEngine(options)
  engine.install(app)
  return engine
}

// 导出主要类型
export type {
  CacheConfig,
  // 管理器类型
  CacheManager,
  // 配置管理器类型
  ConfigManager,
  ConfigSchema,

  ConfigSnapshot,
  ConfigWatcher,
  // 核心类型
  CreateEngineOptions,
  DirectiveManager,
  Engine,
  EngineConfig,

  EnhancedEngineConfig,
  ErrorHandler,
  ErrorInfo,
  ErrorManager,
  EventHandler,

  EventManager,
  // 适配器类型
  I18nAdapter,
  LogEntry,
  Logger,
  // 各模块配置类型
  LoggerConfig,
  LogLevel,
  Middleware,
  MiddlewareContext,
  MiddlewareManager,
  MiddlewareNext,
  NotificationConfig,
  NotificationManager,
  NotificationOptions,
  NotificationType,
  PerformanceConfig,
  PerformanceManager,
  Plugin,
  PluginManager,
  RouterAdapter,
  SecurityConfig,
  SecurityManager,
  StateAdapter,
  StateManager,

  ThemeAdapter,
  UnwatchFunction,
  ValidationResult,
} from './types'

// 导出工具函数
export * from './utils'

// Vue集成
export * from './vue'

// 为了支持 @ldesign/engine/vue 导入方式，我们需要在package.json中配置exports
