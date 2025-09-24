/**
 * Vue 插件
 * 提供 Vue 3 集成功能
 */

import type { App, Plugin } from 'vue'
import type { ApiEngine, ApiEngineConfig } from '../types'
import { createApiEngine } from '../core/factory'

// 扩展 Vue 应用类型
declare module 'vue' {
  interface App {
    _apiEngine?: ApiEngine
  }

  interface ComponentCustomProperties {
    $api: ApiEngine
  }
}

/**
 * Vue 插件选项
 */
export interface ApiVuePluginOptions {
  /** API 引擎实例 */
  engine?: ApiEngine
  /** API 引擎配置 */
  config?: ApiEngineConfig
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 是否注册组合式 API */
  registerComposables?: boolean
  /** 是否提供依赖注入 */
  provideDependencyInjection?: boolean
  /** 依赖注入键 */
  injectionKey?: string | symbol
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否在开发模式下显示安装信息 */
  showInstallInfo?: boolean
}

/**
 * 默认依赖注入键
 */
export const API_ENGINE_INJECTION_KEY = Symbol('api-engine')

/**
 * Vue 插件实现
 */
export const ApiVuePlugin: Plugin = {
  install(app: App, options: ApiVuePluginOptions = {}) {
    const {
      engine: providedEngine,
      config = {},
      globalPropertyName = '$api',
      // registerComposables 目前未使用，保留以兼容未来扩展
      registerComposables: _registerComposables = true,
      provideDependencyInjection = true,
      injectionKey = API_ENGINE_INJECTION_KEY,
      debug = false,
      showInstallInfo = true,
    } = options

    try {
      // 创建或使用提供的 API 引擎
      const engine = providedEngine || createApiEngine(config)

      // 注册全局属性
      if (globalPropertyName) {
        app.config.globalProperties[globalPropertyName] = engine
      }

      // 提供依赖注入
      if (provideDependencyInjection) {
        app.provide(injectionKey, engine)
      }

      // 存储引擎实例到应用实例
      app._apiEngine = engine

      // 开发模式下的调试信息
      const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
      if ((debug || config.debug || isDev) && showInstallInfo) {
        console.info('[API Vue Plugin] Vue 插件已安装', {
          globalProperty: globalPropertyName,
          dependencyInjection: provideDependencyInjection,
          engineProvided: !!providedEngine,
        })
      }
    }
    catch (error) {
      console.error('[API Vue Plugin] 插件安装失败:', error)
      throw error
    }
  },
}

/**
 * 创建 API Vue 插件
 *
 * @param options 插件选项
 * @returns Vue 插件
 *
 * @example
 * ```typescript
 * import { createApiVuePlugin } from '@ldesign/api/vue'
 *
 * const apiPlugin = createApiVuePlugin({
 *   config: {
 *     http: { baseURL: 'https://api.example.com' },
 *   },
 *   globalPropertyName: '$api',
 * })
 *
 * app.use(apiPlugin)
 * ```
 */
export function createApiVuePlugin(options: ApiVuePluginOptions = {}): Plugin {
  return {
    install(app: App) {
      ApiVuePlugin.install!(app, options)
    },
  }
}

/**
 * 安装 API Vue 插件的便捷函数
 *
 * @param app Vue 应用实例
 * @param options 插件选项
 *
 * @example
 * ```typescript
 * import { installApiVuePlugin } from '@ldesign/api/vue'
 *
 * installApiVuePlugin(app, {
 *   config: {
 *     http: { baseURL: 'https://api.example.com' },
 *   },
 * })
 * ```
 */
export function installApiVuePlugin(
  app: App,
  options: ApiVuePluginOptions = {},
): void {
  app.use(ApiVuePlugin, options)
}

/**
 * 从 Vue 应用实例获取 API 引擎
 *
 * @param app Vue 应用实例
 * @returns API 引擎实例
 */
export function getApiEngineFromApp(app: App): ApiEngine | undefined {
  return app._apiEngine
}
