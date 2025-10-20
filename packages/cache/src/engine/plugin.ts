/**
 * Cache Engine 插件
 * 
 * 将 Cache 功能集成到 LDesign Engine 中，提供统一的缓存管理体验
 */

// 临时类型定义，等待 @ldesign/engine 包完成
// import type { Plugin } from '@ldesign/engine/types'
import type { CacheOptions } from '../types'
import { CacheManager } from '../core/cache-manager'
import { StorageEngineFactory } from '../engines/factory'
import {
  CACHE_MANAGER_KEY,
  CacheProvider,
} from '../vue/cache-provider'

interface Plugin {
  name: string
  version?: string
  install?: (app: any, options?: any) => void
  destroy?: (app: any) => void
}

/**
 * Cache Engine 插件配置选项
 */
export interface CacheEnginePluginOptions extends CacheOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 插件描述 */
  description?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 是否自动安装到 Vue 应用 */
  autoInstall?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 是否注册组合式 API */
  registerComposables?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
  /** 缓存配置 */
  cacheConfig?: CacheOptions
}

/**
 * 默认配置
 */
const defaultConfig: Partial<CacheEnginePluginOptions> = {
  name: 'cache',
  version: '1.0.0',
  description: 'LDesign Cache Engine Plugin',
  dependencies: [],
  autoInstall: true,
  globalPropertyName: '$cache',
  registerComposables: true,
  enablePerformanceMonitoring: false,
  debug: false,
  cacheConfig: {
    defaultEngine: 'localStorage',
    defaultTTL: 24 * 60 * 60 * 1000, // 24小时
    security: {
      encryption: { enabled: false },
      obfuscation: { enabled: false },
    },
    engines: {
      memory: { maxSize: 10 * 1024 * 1024 }, // 10MB
    },
  },
}

/**
 * 创建全局 Cache 实例
 */
function createGlobalCacheInstance(options?: CacheEnginePluginOptions) {
  const cacheManager = new CacheManager(options?.cacheConfig || defaultConfig.cacheConfig)

  return {
    // 核心功能
    manager: cacheManager,

    // 便捷方法
    get: cacheManager.get.bind(cacheManager),
    set: cacheManager.set.bind(cacheManager),
    delete: cacheManager.remove.bind(cacheManager),
    clear: cacheManager.clear.bind(cacheManager),
    has: cacheManager.has.bind(cacheManager),
    keys: cacheManager.keys.bind(cacheManager),
    size: async () => (await cacheManager.getStats()).totalItems,

    // 工厂方法
    factory: StorageEngineFactory,

    // 配置
    config: options?.cacheConfig || defaultConfig.cacheConfig,
  }
}

/**
 * 创建 Cache Engine 插件
 * 
 * 将 Cache 功能集成到 LDesign Engine 中，提供统一的缓存管理体验
 * 
 * @param options 插件配置选项
 * @returns Engine 插件实例
 * 
 * @example
 * ```typescript
 * import { createCacheEnginePlugin } from '@ldesign/cache'
 * 
 * const cachePlugin = createCacheEnginePlugin({
 *   cacheConfig: {
 *     defaultEngine: 'localStorage',
 *     enableEncryption: true,
 *     maxSize: 50 * 1024 * 1024 // 50MB
 *   },
 *   globalPropertyName: '$cache',
 *   enablePerformanceMonitoring: true
 * })
 * 
 * await engine.use(cachePlugin)
 * ```
 */
export function createCacheEnginePlugin(
  options: CacheEnginePluginOptions = {},
): Plugin {
  // 合并配置
  const config = { ...defaultConfig, ...options }

  const {
    name = 'cache',
    version = '1.0.0',
    dependencies: _dependencies = [],
    autoInstall = true,
    enablePerformanceMonitoring = false,
    debug = false,
  } = config

  if (debug) {
    console.warn('[Cache Plugin] createCacheEnginePlugin called with options:', options)
  }

  return {
    name,
    version,

    async install(context: any) {
      try {
        if (debug) {
          console.warn('[Cache Plugin] install method called with context:', context)
        }

        // 从上下文中获取引擎实例
        const engine = context.engine || context

        if (debug) {
          console.warn('[Cache Plugin] engine instance:', !!engine)
        }

        // 定义实际的安装逻辑
        const performInstall = async () => {
          engine.logger?.info('[Cache Plugin] performInstall called')

          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing cache plugin.',
            )
          }

          engine.logger?.info('[Cache Plugin] Vue app found, proceeding with installation')

          // 记录插件安装开始
          engine.logger?.info(`Installing ${name} plugin...`, {
            version,
            enablePerformanceMonitoring,
          })

          // 创建全局 Cache 实例
          const globalCache = createGlobalCacheInstance(config)

          // 注册到 Engine 状态管理
          if (engine.state) {
            engine.state.set('cache:instance', globalCache)
            engine.state.set('cache:config', config.cacheConfig)
            engine.state.set('cache:manager', globalCache.manager)
          }

          // 安装 Vue 集成
          if (autoInstall) {
            // 提供全局缓存管理器
            vueApp.provide(CACHE_MANAGER_KEY, globalCache.manager)

            // 注册全局属性
            if (config.globalPropertyName) {
              ; (vueApp.config.globalProperties)[config.globalPropertyName] = globalCache
            }

            // 注册全局组件
            vueApp.component('CacheProvider', CacheProvider)

            if (debug) {
              console.warn('[Cache Plugin] Vue integration installed successfully')
            }
          }
          else {
            // 如果不自动安装，则手动注册全局提供者
            vueApp.provide('cache', globalCache)
            vueApp.provide('cacheConfig', config.cacheConfig)
            vueApp.provide('cacheManager', globalCache.manager)
          }
          // 性能监控
          if (enablePerformanceMonitoring) {
            engine.logger?.info('[Cache Plugin] Performance monitoring enabled')
            // 这里可以添加性能监控逻辑
          }

          // 记录插件安装完成
          engine.logger?.info(`${name} plugin installed successfully`, {
            version,
            globalPropertyName: config.globalPropertyName,
            autoInstall,
          })

          if (debug) {
            console.warn('[Cache Plugin] Installation completed successfully')
          }
        }

        // 获取 Vue 应用实例
        const vueApp = engine.getApp()
        if (!vueApp) {
          engine.logger?.info('[Cache Plugin] Vue app not found, registering event listener')
          // 如果 Vue 应用还没有创建，等待 app:created 事件
          await new Promise<void>((resolve, reject) => {
            engine.events?.once('app:created', async () => {
              try {
                engine.logger?.info('[Cache Plugin] app:created event received, installing now')
                await performInstall()
                resolve()
              }
              catch (error) {
                engine.logger?.error('[Cache Plugin] Failed to install after app creation:', error)
                reject(error)
              }
            })
          })
        }
        else {
          // 如果 Vue 应用已经存在，直接安装
          await performInstall()
        }
      }
      catch (error) {
        const errorMessage = `Failed to install ${name} plugin: ${error instanceof Error ? error.message : String(error)}`

        if (debug) {
          console.error('[Cache Plugin] Installation failed:', error)
        }

        // 从上下文中获取引擎实例
        const engine = context.engine || context
        engine.logger?.error(errorMessage, { error })

        throw new Error(errorMessage)
      }
    },

    // 卸载方法（可选）
    destroy(context: any) {
      try {
        if (debug) {
          console.warn('[Cache Plugin] destroy method called')
        }

        // 从上下文中获取引擎实例
        const engine = context.engine || context

        // 清理状态
        if (engine.state) {
          engine.state.delete('cache:instance')
          engine.state.delete('cache:config')
          engine.state.delete('cache:manager')
        }

        engine.logger?.info(`${name} plugin uninstalled successfully`)

        if (debug) {
          console.warn('[Cache Plugin] Uninstallation completed successfully')
        }
      }
      catch (error) {
        const errorMessage = `Failed to uninstall ${name} plugin: ${error instanceof Error ? error.message : String(error)}`

        if (debug) {
          console.error('[Cache Plugin] Uninstallation failed:', error)
        }

        // 从上下文中获取引擎实例
        const engine = context.engine || context
        engine.logger?.error(errorMessage, { error })

        throw new Error(errorMessage)
      }
    },
  }
}

/**
 * 导出默认插件实例创建函数
 */
export default createCacheEnginePlugin
