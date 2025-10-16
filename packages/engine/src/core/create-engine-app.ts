/**
 * 统一的引擎应用创建函数
 * 提供单一入口配置和创建整个应用
 */

import type { Component, App as VueApp } from 'vue'
import type { Middleware } from '../types/middleware'
import type { Plugin } from '../types/plugin'
import { commonDirectives } from '../directives/directive-manager'
import { type PerformanceBudget, PerformanceBudgetManager, type PerformanceMetric } from '../performance/performance-budget'
import { type ShortcutHandler, type ShortcutOptions, ShortcutsManager } from '../shortcuts/shortcuts-manager'
import {
  createQuickCacheManager,
  createQuickLogger,
  createQuickPerformanceManager
} from '../utils/quick-setup'
import { EngineImpl } from './engine'

/**
 * 引擎应用配置选项
 */
export interface EngineAppOptions {
  /**
   * 根组件（可选，如果不提供则只创建引擎实例）
   */
  rootComponent?: Component

  /**
   * 挂载元素（可选，提供时会自动挂载）
   */
  mountElement?: string | Element

  /**
   * 基础配置
   */
  config?: {
    /** 应用名称 */
    name?: string
    /** 应用版本 */
    version?: string
    /** 是否开启调试模式 */
    debug?: boolean
    /** 应用描述 */
    description?: string
    /** 应用环境 */
    environment?: 'development' | 'production' | 'testing'
    /** 其他自定义配置 */
    [key: string]: unknown
  }

  /**
   * 功能特性开关
   */
  features?: {
    /** 启用热重载 */
    enableHotReload?: boolean
    /** 启用开发工具 */
    enableDevTools?: boolean
    /** 启用性能监控 */
    enablePerformanceMonitoring?: boolean
    /** 启用错误上报 */
    enableErrorReporting?: boolean
    /** 启用安全防护 */
    enableSecurityProtection?: boolean
    /** 启用缓存 */
    enableCaching?: boolean
    /** 启用通知系统 */
    enableNotifications?: boolean
  }

  /**
   * 日志配置
   */
  logger?: {
    /** 是否启用日志 */
    enabled?: boolean
    /** 日志级别 */
    level?: 'debug' | 'info' | 'warn' | 'error'
    /** 最大日志数 */
    maxLogs?: number
    /** 是否显示时间戳 */
    showTimestamp?: boolean
    /** 是否显示上下文 */
    showContext?: boolean
    /** 自定义日志前缀 */
    prefix?: string
  }

  /**
   * 缓存配置
   */
  cache?: {
    /** 是否启用缓存 */
    enabled?: boolean
    /** 默认缓存大小 */
    maxSize?: number
    /** 默认TTL（毫秒） */
    defaultTTL?: number
    /** 清理间隔（毫秒） */
    cleanupInterval?: number
    /** 是否启用内存限制 */
    enableMemoryLimit?: boolean
    /** 内存限制（MB） */
    memoryLimit?: number
  }

  /**
   * 性能监控配置
   */
  performance?: {
    /** 是否启用性能监控 */
    enabled?: boolean
    /** 采样率 (0-1) */
    sampleRate?: number
    /** 是否监控内存 */
    monitorMemory?: boolean
    /** 是否监控网络 */
    monitorNetwork?: boolean
    /** 是否监控组件性能 */
    monitorComponents?: boolean
    /** 报告间隔（毫秒） */
    reportInterval?: number
    /** 性能预算 */
    budget?: PerformanceBudget
    /** 预算超出回调 */
    onBudgetExceeded?: (metric: PerformanceMetric) => void
  }

  /**
   * 插件列表
   */
  plugins?: Plugin[]

  /**
   * 中间件列表
   */
  middleware?: Middleware[]

  /**
   * Vue应用配置函数
   * 用于在挂载前配置Vue应用实例
   */
  setupApp?: (app: VueApp) => void | Promise<void>

  /**
   * 引擎初始化完成回调
   */
  onReady?: (engine: EngineImpl) => void | Promise<void>

  /**
   * 应用挂载完成回调
   */
  onMounted?: (engine: EngineImpl) => void | Promise<void>

  /**
   * 错误处理
   */
  onError?: (error: Error, context: string) => void

  /**
   * 快捷键配置
   */
  shortcuts?: {
    /** 快捷键映射 */
    keys?: Record<string, ShortcutHandler | [ShortcutHandler, ShortcutOptions]>
    /** 作用域快捷键 */
    scopes?: Record<string, Record<string, ShortcutHandler>>
    /** 冲突处理模式 */
    conflictMode?: 'error' | 'warn' | 'override'
    /** 是否启用 */
    enabled?: boolean
  }
}

/**
 * 创建引擎应用
 *
 * 这是引擎的唯一入口函数，通过配置项控制所有功能
 *
 * @param options 引擎应用配置选项
 * @returns 引擎实例
 *
 * @example
 * ```typescript
 * // 最简单的使用
 * const engine = createEngineApp({
 *   rootComponent: App,
 *   mountElement: '#app'
 * })
 *
 * // 完整配置示例
 * const engine = createEngineApp({
 *   rootComponent: App,
 *   mountElement: '#app',
 *   config: {
 *     name: 'My App',
 *     version: '1.0.0',
 *     debug: true
 *   },
 *   features: {
 *     enableHotReload: true,
 *     enablePerformanceMonitoring: true,
 *     enableCaching: true
 *   },
 *   logger: {
 *     enabled: true,
 *     level: 'debug',
 *     maxLogs: 100
 *   },
 *   cache: {
 *     enabled: true,
 *     maxSize: 100,
 *     defaultTTL: 300000
 *   },
 *   performance: {
 *     enabled: true,
 *     sampleRate: 0.5,
 *     monitorMemory: true
 *   },
 *   plugins: [routerPlugin, storePlugin],
 *   middleware: [authMiddleware],
 *   setupApp: async (app) => {
 *     // 自定义Vue应用配置
 *     app.config.performance = true
 *   },
 *   onReady: async (engine) => {
 *     
 *   },
 *   onMounted: async (engine) => {
 *     
 *   },
 *   onError: (error, context) => {
 *     console.error(`Error in ${context}:`, error)
 *   }
 * })
 * ```
 */
export async function createEngineApp(options: EngineAppOptions = {}): Promise<EngineImpl> {
  const {
    rootComponent,
    mountElement,
    config = {},
    features = {},
    logger: loggerOptions = {},
    cache: cacheOptions = {},
    performance: performanceOptions = {},
    plugins = [],
    middleware = [],
    shortcuts: shortcutsOptions = {},
    setupApp,
    onReady,
    onMounted,
    onError = (error, context) => console.error(`[EngineApp] Error in ${context}:`, error)
  } = options

  try {
    // 1. 准备引擎配置
    const engineConfig = {
      app: {
        name: config.name || 'LDesign App',
        version: config.version || '1.0.0',
        description: config.description || '',
        environment: config.environment || 'development'
      },
      debug: config.debug ?? false,
      features: {
        enableHotReload: features.enableHotReload ?? false,
        enableDevTools: features.enableDevTools ?? false,
        enablePerformanceMonitoring: features.enablePerformanceMonitoring ?? false,
        enableErrorReporting: features.enableErrorReporting ?? true,
        enableSecurityProtection: features.enableSecurityProtection ?? false,
        enableCaching: features.enableCaching ?? true,
        enableNotifications: features.enableNotifications ?? false
      },
      ...config // 其他自定义配置
    }

    // 2. 创建引擎实例
    const engine = new EngineImpl(engineConfig)

    // 3. 配置日志系统（如果启用）
    if (loggerOptions.enabled !== false) {
      const logger = createQuickLogger({
        level: loggerOptions.level || (config.debug ? 'debug' : 'warn'),
        maxLogs: loggerOptions.maxLogs || 100,
        showTimestamp: loggerOptions.showTimestamp ?? false,
        showContext: loggerOptions.showContext ?? false,
        prefix: loggerOptions.prefix
      })

      // 替换默认日志器
      Object.defineProperty(engine, 'logger', {
        value: logger,
        writable: false,
        configurable: false
      })
    }

    // 4. 配置缓存系统（如果启用）
    if (cacheOptions.enabled !== false && features.enableCaching !== false) {
      const cacheManager = createQuickCacheManager({
        maxSize: cacheOptions.maxSize || 100,
        defaultTTL: cacheOptions.defaultTTL || 300000, // 5分钟
        cleanupInterval: cacheOptions.cleanupInterval || 60000, // 1分钟
        enableMemoryLimit: cacheOptions.enableMemoryLimit ?? true,
        memoryLimit: cacheOptions.memoryLimit || 10
      })

      // 将缓存管理器注入到引擎中
      Object.defineProperty(engine, 'cache', {
        value: cacheManager,
        writable: false,
        configurable: false
      })
    }

    // 5. 配置性能监控（如果启用）
    if (performanceOptions.enabled === true || features.enablePerformanceMonitoring === true) {
      const performanceManager = createQuickPerformanceManager({
        sampleRate: performanceOptions.sampleRate || 1,
        monitorMemory: performanceOptions.monitorMemory ?? false,
        monitorNetwork: performanceOptions.monitorNetwork ?? false,
        monitorComponents: performanceOptions.monitorComponents ?? false,
        reportInterval: performanceOptions.reportInterval || 5000
      })

      // 将性能管理器注入到引擎中
      Object.defineProperty(engine, 'performance', {
        value: performanceManager,
        writable: false,
        configurable: false
      })
    }

    // 5.1 配置性能预算（如果提供）
    if (performanceOptions.budget) {
      const budgetManager = new PerformanceBudgetManager(
        performanceOptions.budget,
        performanceOptions.onBudgetExceeded || ((metric) => {
          console.warn(`[性能预算超标] ${metric.name}: ${metric.value}${metric.unit} > ${metric.limit}${metric.unit} (${metric.percentage.toFixed(1)}%)`)
        })
      )

      // 将预算管理器添加到引擎
      Object.defineProperty(engine, 'performanceBudget', {
        value: budgetManager,
        writable: false,
        configurable: false
      })

      // 自动开始监控
      if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
          budgetManager.startMonitoring()
        })
      }
    }

    // 6. 注册内置指令
    engine.directives.registerBatch(commonDirectives)

    // 6.1 配置快捷键管理（如果提供）
    if (shortcutsOptions.keys || shortcutsOptions.scopes) {
      const shortcutsManager = new ShortcutsManager()

      // 设置冲突模式
      if (shortcutsOptions.conflictMode) {
        shortcutsManager.setConflictMode(shortcutsOptions.conflictMode)
      }

      // 注册全局快捷键
      if (shortcutsOptions.keys) {
        shortcutsManager.registerBatch(shortcutsOptions.keys)
      }

      // 注册作用域快捷键
      if (shortcutsOptions.scopes) {
        Object.entries(shortcutsOptions.scopes).forEach(([scopeName, shortcuts]) => {
          shortcutsManager.registerScope(scopeName, shortcuts)
        })
      }

      // 设置启用状态
      if (shortcutsOptions.enabled !== undefined) {
        shortcutsManager.setManagerEnabled(shortcutsOptions.enabled)
      }

      // 将快捷键管理器添加到引擎
      Object.defineProperty(engine, 'shortcuts', {
        value: shortcutsManager,
        writable: false,
        configurable: false
      })
    }

    // 7. 注册中间件
    for (const m of middleware) {
      try {
        engine.middleware.use(m)
      } catch (error) {
        onError(error as Error, `middleware registration: ${m.name}`)
      }
    }

    // 8. 注册插件
    for (const plugin of plugins) {
      try {
        await engine.use(plugin)
      } catch (error) {
        onError(error as Error, `plugin installation: ${plugin.name}`)
      }
    }

    // 9. 触发就绪回调
    if (onReady) {
      try {
        await onReady(engine)
      } catch (error) {
        onError(error as Error, 'onReady callback')
      }
    }

    // 10. 创建和挂载Vue应用（如果提供了根组件）
    if (rootComponent) {
      try {
        // 创建Vue应用
        const app = engine.createApp(rootComponent)

        // 执行自定义应用配置
        if (setupApp) {
          await setupApp(app)
        }

        // 自动挂载（如果提供了挂载元素）
        if (mountElement) {
          await engine.mount(mountElement)

          // 触发挂载完成回调
          if (onMounted) {
            try {
              await onMounted(engine)
            } catch (error) {
              onError(error as Error, 'onMounted callback')
            }
          }
        }
      } catch (error) {
        onError(error as Error, 'app creation/mounting')
        throw error
      }
    }

    // 11. 返回引擎实例
    return engine
  } catch (error) {
    onError(error as Error, 'engine initialization')
    throw error
  }
}

/**
 * 创建引擎应用的简化版本
 * 自动挂载到 #app
 *
 * @param rootComponent 根组件
 * @param options 配置选项（不包括rootComponent和mountElement）
 * @returns 引擎实例
 *
 * @example
 * ```typescript
 * const engine = await createAndMountEngineApp(App, {
 *   config: { debug: true },
 *   plugins: [routerPlugin]
 * })
 * ```
 */
export async function createAndMountEngineApp(
  rootComponent: Component,
  options: Omit<EngineAppOptions, 'rootComponent' | 'mountElement'> = {}
): Promise<EngineImpl> {
  return createEngineApp({
    ...options,
    rootComponent,
    mountElement: '#app'
  })
}
