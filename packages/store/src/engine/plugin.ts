/**
 * Store Engine 插件
 *
 * 将 Store 功能集成到 LDesign Engine 中，提供统一的状态管理体验
 */

import type { App } from 'vue'
import type { StoreOptions } from '../types'
import { createPinia, setActivePinia } from 'pinia'
import { PerformanceOptimizer } from '../core/PerformanceOptimizer'
import { StoreFactory, StoreType } from '../core/StoreFactory'

/**
 * Store Engine 插件配置选项
 */
export interface StoreEnginePluginOptions {
  // 插件基础信息
  name?: string
  version?: string
  description?: string
  dependencies?: string[]

  // Store 配置
  storeConfig?: {
    // 是否启用性能优化
    enablePerformanceOptimization?: boolean
    // 是否启用持久化
    enablePersistence?: boolean
    // 是否启用调试模式
    debug?: boolean
    // 默认缓存配置
    defaultCacheOptions?: {
      ttl?: number
      maxSize?: number
    }
    // 默认持久化配置
    defaultPersistOptions?: {
      key?: string
      storage?: Storage
      paths?: string[]
    }
  }

  // Vue 插件配置
  globalInjection?: boolean
  globalPropertyName?: string

  // 自动安装配置
  autoInstall?: boolean
  enablePerformanceMonitoring?: boolean
  debug?: boolean

  // 全局配置
  globalConfig?: StoreOptions
}

/**
 * Engine 插件接口
 */
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (context: any) => Promise<void>
  uninstall?: (context: any) => Promise<void>
}

/**
 * Engine 插件上下文
 */
export interface EnginePluginContext {
  engine: any
  logger: any
  config: any
  app?: App
}

/**
 * 默认配置
 */
const defaultConfig: StoreEnginePluginOptions = {
  name: 'store',
  version: '1.0.0',
  description: 'LDesign Store Engine Plugin',
  dependencies: [],
  autoInstall: true,
  enablePerformanceMonitoring: false,
  debug: false,
  globalInjection: true,
  globalPropertyName: '$store',
  storeConfig: {
    enablePerformanceOptimization: true,
    enablePersistence: false,
    debug: false,
    defaultCacheOptions: {
      ttl: 300000, // 5分钟
      maxSize: 100
    },
    defaultPersistOptions: {
      key: 'ldesign-store',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      paths: []
    }
  }
}

/**
 * 创建 Store Engine 插件
 *
 * 将 Store 功能集成到 LDesign Engine 中，提供统一的状态管理体验
 *
 * @param options 插件配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createStoreEnginePlugin } from '@ldesign/store'
 *
 * const storePlugin = createStoreEnginePlugin({
 *   storeConfig: {
 *     enablePerformanceOptimization: true,
 *     enablePersistence: true,
 *     debug: true
 *   },
 *   globalPropertyName: '$store',
 *   enablePerformanceMonitoring: true
 * })
 *
 * await engine.use(storePlugin)
 * ```
 */
export function createStoreEnginePlugin(
  options: StoreEnginePluginOptions = {}
): Plugin {
  // 合并配置
  const config = { ...defaultConfig, ...options }

  const {
    name = 'store',
    version = '1.0.0',
    dependencies = [],
    enablePerformanceMonitoring = false,
    // debug = false,
    globalInjection = true,
    globalPropertyName = '$store',
    storeConfig = {},
  } = config

  return {
    name,
    version,
    dependencies,

    async install(context: EnginePluginContext) {
      try {
        // 从上下文中获取引擎实例和 Vue 应用实例
        const engine = context.engine || context
        const app = context.app || engine?.app

        // 创建 Pinia 实例
        const pinia = createPinia()

        // 设置为活跃的 Pinia 实例
        setActivePinia(pinia)

        // 如果有 Vue 应用实例，安装 Pinia
        if (app) {
          app.use(pinia)
        }

        // 创建性能优化器实例
        let performanceOptimizer: PerformanceOptimizer | undefined
        if (storeConfig.enablePerformanceOptimization) {
          performanceOptimizer = new PerformanceOptimizer()
        }

        // 创建 Store 工厂实例
        const storeFactory = new StoreFactory()

        // 将 Store 相关实例注册到引擎中
        if (engine) {
          // 注册到引擎状态管理器
          if (engine.state) {
            engine.state.set('pinia', pinia)
            engine.state.set('storeFactory', storeFactory)
            if (performanceOptimizer) {
              engine.state.set('storePerformanceOptimizer', performanceOptimizer)
            }
          }

          // 如果有 Vue 应用实例，立即注册全局属性
          if (globalInjection && app && globalPropertyName) {
            app.config.globalProperties[globalPropertyName] = {
              pinia,
              factory: storeFactory,
              optimizer: performanceOptimizer
            }
          } else if (globalInjection && globalPropertyName) {
            // 如果没有 Vue 应用实例，监听应用创建事件
            if (engine.events) {
              engine.events.on('app:created', (createdApp: App) => {
                createdApp.config.globalProperties[globalPropertyName] = {
                  pinia,
                  factory: storeFactory,
                  optimizer: performanceOptimizer
                }
              })
            }
          }

          // 注册事件监听器
          if (engine.events) {
            engine.events.on('store:create', (storeOptions: any) => {
              // 确保 storeOptions 有正确的类型
              const options = {
                ...storeOptions,
                type: storeOptions.type || StoreType.FUNCTIONAL
              }
              return storeFactory.createStore(options)
            })

            engine.events.on('store:destroy', (_storeName: string) => {
              // 这里可以添加 store 销毁逻辑
            })
          }

          // 性能监控
          if (enablePerformanceMonitoring && engine.performance) {
            engine.performance.mark('store-plugin-installed')
          }
        }
      } catch (error) {
        console.error('[Store Plugin] Failed to install store plugin:', error)
        throw error
      }
    },

    async uninstall(context: EnginePluginContext) {
      try {
        const engine = context.engine || context

        // 清理引擎状态
        if (engine?.state) {
          engine.state.delete('pinia')
          engine.state.delete('storeFactory')
          engine.state.delete('storePerformanceOptimizer')
        }

        // 清理事件监听器
        if (engine?.events) {
          engine.events.off('store:create')
          engine.events.off('store:destroy')
        }
      } catch (error) {
        console.error('[Store Plugin] Failed to uninstall store plugin:', error)
        throw error
      }
    }
  }
}

/**
 * 创建默认 Store 插件
 */
export function createDefaultStoreEnginePlugin(): Plugin {
  return createStoreEnginePlugin(defaultConfig)
}

/**
 * 创建高性能 Store 插件
 */
export function createPerformanceStoreEnginePlugin(
  options?: Partial<StoreEnginePluginOptions>
): Plugin {
  return createStoreEnginePlugin({
    ...defaultConfig,
    enablePerformanceMonitoring: true,
    storeConfig: {
      ...defaultConfig.storeConfig,
      enablePerformanceOptimization: true,
      enablePersistence: true,
    },
    ...options
  })
}

/**
 * 创建调试模式 Store 插件
 */
export function createDebugStoreEnginePlugin(
  options?: Partial<StoreEnginePluginOptions>
): Plugin {
  return createStoreEnginePlugin({
    ...defaultConfig,
    debug: true,
    enablePerformanceMonitoring: true,
    storeConfig: {
      ...defaultConfig.storeConfig,
      debug: true,
    },
    ...options
  })
}

// 导出默认插件
export default createStoreEnginePlugin
