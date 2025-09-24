/**
 * Engine 插件集成
 * 提供与 @ldesign/engine 的集成功能
 */

import type { Plugin as EnginePlugin } from '@ldesign/engine'
import type { ApiEngine, ApiEngineConfig } from '../types'
import type { ApiVuePluginOptions } from './plugin'
import { createApiEngine } from '../core/factory'
import { version as libVersion } from '../version'
import { ApiVuePlugin } from './plugin'

/**
 * API Engine 插件选项
 */
export interface ApiEnginePluginOptions extends ApiVuePluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** API 引擎配置 */
  clientConfig?: ApiEngineConfig
  /** 是否启用全局注入 */
  globalInjection?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 全局配置 */
  globalConfig?: ApiEngineConfig
  /** API 引擎实例 */
  client?: ApiEngine
}

/**
 * 创建 API Engine 插件
 *
 * @param options 插件选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createApiEnginePlugin } from '@ldesign/api'
 *
 * const apiPlugin = createApiEnginePlugin({
 *   name: 'api',
 *   version: '1.0.0',
 *   clientConfig: {
 *     http: {
 *       baseURL: 'https://api.example.com',
 *       timeout: 10000,
 *     },
 *   },
 *   globalInjection: true,
 *   globalPropertyName: '$api',
 * })
 *
 * await engine.use(apiPlugin)
 * ```
 */
export function createApiEnginePlugin(
  options: ApiEnginePluginOptions = {},
): EnginePlugin {
  const {
    name = 'api',
    version: pluginVersion = libVersion,
    clientConfig = {},
    globalInjection = true,
    globalPropertyName = '$api',
    globalConfig,
    client: providedClient,
    ...vueOptions
  } = options

  interface VueAppLike { use: (plugin: unknown, options?: unknown) => unknown }

  return {
    name,
    version: pluginVersion,
    dependencies: [],

    async install(engine) {
      // 只在开发模式下输出日志
      if (clientConfig.debug) {
        console.info(`[API Engine Plugin] Installing plugin \"${name}\"...`)
      }

      // 监听 app:created 事件
      engine.events.once('app:created', async (vueApp: VueAppLike) => {
        try {
          // 创建或使用提供的 API 引擎
          const apiEngine
            = providedClient
              || createApiEngine({
                ...clientConfig,
                ...globalConfig,
              })

          // 安装 Vue 插件
          vueApp.use(ApiVuePlugin, {
            engine: apiEngine,
            config: globalConfig || clientConfig,
            globalPropertyName: globalInjection
              ? globalPropertyName
              : undefined,
            registerComposables: true,
            provideDependencyInjection: true,
            ...vueOptions,
          })

          // 将 API 引擎实例添加到 engine
          engine.apiEngine = apiEngine

          // 只在开发模式下输出日志
          if (clientConfig.debug) {
            console.info(
              `[API Engine Plugin] Plugin \"${name}\" installed successfully`,
            )
          }
        }
        catch (error) {
          // 只在开发模式下输出错误日志
          if (clientConfig.debug) {
            console.error(
              `[API Engine Plugin] Failed to install plugin "${name}":`,
              error,
            )
          }
          throw error
        }
      })
    },

    async uninstall(engine) {
      console.warn(`[API Engine Plugin] Uninstalling plugin \"${name}\"...`)

      // 清理 API 引擎
      if (engine.apiEngine) {
        engine.apiEngine.destroy()
        delete engine.apiEngine
      }

      // 只在开发模式下输出日志
      if (clientConfig.debug) {
        console.info(
          `[API Engine Plugin] Plugin \"${name}\" uninstalled successfully`,
        )
      }
    },
  }
}

/**
 * 默认 API Engine 插件
 */
export const defaultApiEnginePlugin = createApiEnginePlugin({
  name: 'api',
  clientConfig: {
    debug: false,
    http: {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5分钟
      maxSize: 100,
      storage: 'memory',
    },
    debounce: {
      enabled: true,
      delay: 300,
    },
    deduplication: {
      enabled: true,
    },
  },
  globalInjection: true,
  globalPropertyName: '$api',
})

/**
 * API 插件（别名）
 */
export const apiPlugin = defaultApiEnginePlugin

/**
 * 创建开发环境 API Engine 插件
 *
 * @param baseURL API 基础地址
 * @param options 额外选项
 * @returns Engine 插件实例
 */
export function createDevelopmentApiEnginePlugin(
  baseURL: string,
  options: Omit<ApiEnginePluginOptions, 'clientConfig'> & {
    clientConfig?: Omit<ApiEngineConfig, 'debug' | 'http'> & {
      http?: Omit<ApiEngineConfig['http'], 'baseURL'>
    }
  } = {},
): EnginePlugin {
  return createApiEnginePlugin({
    ...options,
    clientConfig: {
      debug: true,
      http: {
        baseURL,
        timeout: 30000, // 开发环境超时时间更长
        ...options.clientConfig?.http,
      },
      cache: {
        enabled: false, // 开发环境默认禁用缓存
      },
      ...options.clientConfig,
    },
  })
}

/**
 * 创建生产环境 API Engine 插件
 *
 * @param baseURL API 基础地址
 * @param options 额外选项
 * @returns Engine 插件实例
 */
export function createProductionApiEnginePlugin(
  baseURL: string,
  options: Omit<ApiEnginePluginOptions, 'clientConfig'> & {
    clientConfig?: Omit<ApiEngineConfig, 'debug' | 'http'> & {
      http?: Omit<ApiEngineConfig['http'], 'baseURL'>
    }
  } = {},
): EnginePlugin {
  return createApiEnginePlugin({
    ...options,
    clientConfig: {
      debug: false,
      http: {
        baseURL,
        timeout: 10000,
        ...options.clientConfig?.http,
      },
      cache: {
        enabled: true,
        ttl: 600000, // 生产环境缓存时间更长
        maxSize: 200,
        storage: 'memory',
      },
      debounce: {
        enabled: true,
        delay: 500, // 生产环境防抖时间更长
      },
      deduplication: {
        enabled: true,
      },
      ...options.clientConfig,
    },
  })
}

/**
 * 根据环境创建 API Engine 插件
 *
 * @param baseURL API 基础地址
 * @param options 额外选项
 * @returns Engine 插件实例
 */
export function createApiEnginePluginByEnv(
  baseURL: string,
  options: Omit<ApiEnginePluginOptions, 'clientConfig'> & {
    clientConfig?: Omit<ApiEngineConfig, 'http'> & {
      http?: Omit<ApiEngineConfig['http'], 'baseURL'>
    }
  } = {},
): EnginePlugin {
  // 检测环境
  const isDevelopment
    = (typeof process !== 'undefined'
      && process.env?.NODE_ENV === 'development')
    || (typeof import.meta !== 'undefined' && import.meta.env?.DEV)
    || (typeof import.meta !== 'undefined'
      && import.meta.env?.MODE === 'development')

  if (isDevelopment) {
    return createDevelopmentApiEnginePlugin(baseURL, options)
  }
  else {
    return createProductionApiEnginePlugin(baseURL, options)
  }
}

// 扩展 Engine 类型
declare module '@ldesign/engine' {
  interface Engine {
    apiEngine?: ApiEngine
  }
}
