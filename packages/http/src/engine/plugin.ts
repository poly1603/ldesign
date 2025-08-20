import type { HttpClient, HttpClientConfig } from '../types'
import type { HttpPluginOptions } from '../types/vue'
import { createAdapter } from '../adapters'
import { HttpClientImpl } from '../client'
import { HttpPlugin } from '../vue/plugin'

// 临时使用 any 类型，避免循环依赖
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (engine: any) => Promise<void>
  uninstall?: (engine: any) => Promise<void>
  [key: string]: any
}

/**
 * HTTP Engine 插件选项
 */
export interface HttpEnginePluginOptions extends HttpPluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** HTTP 客户端配置 */
  clientConfig?: HttpClientConfig
  /** 是否启用全局注入 */
  globalInjection?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
}

/**
 * 创建 HTTP Engine 插件
 *
 * 将 HTTP Vue 插件包装为标准的 Engine 插件，提供统一的插件管理体验
 *
 * @param options HTTP 配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createHttpEnginePlugin } from '@ldesign/http'
 *
 * const httpPlugin = createHttpEnginePlugin({
 *   clientConfig: {
 *     baseURL: 'https://api.example.com',
 *     timeout: 10000
 *   },
 *   globalInjection: true,
 *   globalPropertyName: '$http'
 * })
 *
 * await engine.use(httpPlugin)
 * ```
 */
export function createHttpEnginePlugin(
  options: HttpEnginePluginOptions = {},
): Plugin {
  const {
    name = 'http',
    version = '1.0.0',
    clientConfig = {},
    globalInjection: _globalInjection = true,
    globalPropertyName = '$http',
    client: providedClient,
    globalConfig,
    ...httpOptions
  } = options

  return {
    name,
    version,
    dependencies: [], // HTTP 插件通常不依赖其他插件

    async install(engine) {
      try {
        // 获取 Vue 应用实例
        const vueApp = engine.getApp()
        if (!vueApp) {
          throw new Error(
            'Vue app not found. Make sure the engine has created a Vue app before installing HTTP plugin.',
          )
        }

        // 记录插件安装开始
        engine.logger.info(`Installing ${name} plugin...`, {
          version,
          options: {
            baseURL: clientConfig.baseURL,
            timeout: clientConfig.timeout,
            globalPropertyName,
          },
        })

        // 创建或使用提供的 HTTP 客户端
        const httpClient
          = providedClient
            || (() => {
              const adapter = createAdapter(clientConfig.adapter)
              return new HttpClientImpl(
                {
                  ...clientConfig,
                  ...globalConfig,
                },
                adapter,
              )
            })()

        // 安装 HTTP Vue 插件
        vueApp.use(HttpPlugin, {
          client: httpClient,
          globalConfig: globalConfig || clientConfig,
          globalProperty: globalPropertyName,
          ...httpOptions,
        })

        // 将 HTTP 客户端注册到引擎中，便于其他插件访问
        if (engine.http) {
          // 如果引擎支持 HTTP 适配器，设置适配器
          engine.http.setInstance(httpClient)
        }
        else {
          // 否则直接挂载到引擎上
          ; (engine as any).httpClient = httpClient
        }

        // 记录插件安装成功
        engine.logger.info(`${name} plugin installed successfully`, {
          version,
          clientType: httpClient.constructor.name,
        })
      }
      catch (error) {
        engine.logger.error(`Failed to install ${name} plugin:`, error)
        throw error
      }
    },

    async uninstall(engine) {
      try {
        // 清理 HTTP 客户端
        if ((engine as any).httpClient) {
          const httpClient = (engine as any).httpClient as HttpClient
          // 取消所有进行中的请求
          httpClient.cancelAll()
          // 清理缓存
          httpClient.clearCache()
          // 移除引用
          delete (engine as any).httpClient
        }

        engine.logger.info(`${name} plugin uninstalled successfully`)
      }
      catch (error) {
        engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        throw error
      }
    },
  }
}

/**
 * HTTP 插件工厂函数（向后兼容）
 *
 * @param options HTTP 配置选项
 * @returns HTTP Engine 插件实例
 *
 * @example
 * ```typescript
 * import { httpPlugin } from '@ldesign/http'
 *
 * await engine.use(httpPlugin({
 *   clientConfig: {
 *     baseURL: 'https://api.example.com'
 *   }
 * }))
 * ```
 */
export function httpPlugin(options: HttpEnginePluginOptions): Plugin {
  return createHttpEnginePlugin(options)
}

/**
 * 默认 HTTP Engine 插件实例
 *
 * 使用默认配置创建的 HTTP 插件，可以直接使用
 *
 * @example
 * ```typescript
 * import { defaultHttpEnginePlugin } from '@ldesign/http'
 *
 * await engine.use(defaultHttpEnginePlugin)
 * ```
 */
export const defaultHttpEnginePlugin = createHttpEnginePlugin({
  globalInjection: true,
  globalPropertyName: '$http',
  clientConfig: {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

// 导出类型已在接口定义处导出
