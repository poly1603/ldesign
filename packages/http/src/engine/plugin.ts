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
    // globalInjection is currently unused
    globalPropertyName = '$http',
    client: providedClient,
    globalConfig,
    ...httpOptions
  } = options

  return {
    name,
    version,
    dependencies: [], // HTTP 插件通常不依赖其他插件

    async install(context) {
      try {
        // 检查是否直接传入了Vue应用实例（标准Vue插件用法）
        if (context && typeof context.config === 'object' && typeof context.provide === 'function') {
          // 直接使用Vue应用实例
          const vueApp = context

          // 定义实际的安装逻辑
          const performInstall = async () => {
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

            // 创建HTTP方法的快捷方式
            const httpMethods = {
              get: (url: string, config?: any) => httpClient.get(url, config),
              post: (url: string, data?: any, config?: any) => httpClient.post(url, data, config),
              put: (url: string, data?: any, config?: any) => httpClient.put(url, data, config),
              delete: (url: string, config?: any) => httpClient.delete(url, config),
              patch: (url: string, data?: any, config?: any) => httpClient.patch(url, data, config),
              head: (url: string, config?: any) => httpClient.head(url, config),
              options: (url: string, config?: any) => httpClient.options(url, config),
              upload: (url: string, data?: any, config?: any) => httpClient.upload ? httpClient.upload(url, data, config) : httpClient.post(url, data, config),
              download: (url: string, config?: any) => httpClient.download ? httpClient.download(url, config) : httpClient.get(url, config),
            }

            // 注册到全局属性
            try {
              if (vueApp.config && vueApp.config.globalProperties) {
                vueApp.config.globalProperties.$http = httpMethods
                vueApp.config.globalProperties.$httpClient = httpClient
              }
            }
            catch (error) {
              console.warn('Failed to register global properties:', error)
            }

            // 提供依赖注入
            try {
              if (typeof vueApp.provide === 'function') {
                vueApp.provide('http', httpMethods)
                vueApp.provide('httpClient', httpClient)
              }
            }
            catch (error) {
              console.warn('Failed to provide dependencies:', error)
            }
          }

          // 直接执行安装
          await performInstall()
        }
        else {
          // 从上下文中获取引擎实例（引擎模式）
          const engine = context.engine || context

          // 确保engine存在必要的方法
          if (!engine || typeof engine.getApp !== 'function') {
            console.warn('Invalid engine context: missing required methods')
            return
          }

          // 定义实际的安装逻辑
          const performInstall = async () => {
            // 获取 Vue 应用实例
            const vueApp = engine.getApp()
            if (!vueApp) {
              throw new Error(
                'Vue app not found. Make sure the engine has created a Vue app before installing HTTP plugin.',
              )
            }

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
            if (engine.logger) {
              engine.logger.info(`${name} plugin installed successfully`, {
                version,
                clientType: httpClient.constructor.name,
              })
            }
          }

          // 检查 Vue 应用是否已经创建
          const vueApp = engine.getApp()
          if (vueApp) {
            if (engine.logger) {
              engine.logger.info(`[HTTP Plugin] Vue app found, installing immediately`)
            }
            await performInstall()
          }
          else {
            if (engine.logger) {
              engine.logger.info(`[HTTP Plugin] Vue app not found, registering event listener`)
            }
            // 如果 Vue 应用还没有创建，等待 app:created 事件
            await new Promise<void>((resolve, reject) => {
              engine.events.once('app:created', async () => {
                try {
                  if (engine.logger) {
                    engine.logger.info(`[HTTP Plugin] app:created event received, installing now`)
                  }
                  await performInstall()
                  resolve()
                }
                catch (error) {
                  if (engine.logger) {
                    engine.logger.error(`[HTTP Plugin] Failed to install after app creation:`, error)
                  }
                  reject(error)
                }
              })
            })
          }

          if (engine.logger) {
            engine.logger.info(`${name} plugin registered, waiting for Vue app creation...`)
          }
        }
      }
      catch (error) {
        console.error(`Failed to install http plugin:`, error)
        throw error
      }
    },

    async uninstall(context) {
      try {
        // 从上下文中获取引擎实例
        const engine = context.engine || context

        // 确保engine存在必要的方法
        if (!engine) {
          throw new Error('Invalid engine context')
        }

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
        const engine = context.engine || context
        if (engine && engine.logger) {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        }
        else {
          console.error(`Failed to uninstall ${name} plugin:`, error)
        }
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

/**
 * 创建HTTP插件的别名函数（用于测试兼容性）
 */
export function createHttpPlugin(options?: HttpEnginePluginOptions): Plugin {
  return createHttpEnginePlugin(options || {})
}
