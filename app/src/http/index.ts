/**
 * HTTP 客户端插件配置
 * 
 * 为应用提供完整的 HTTP 请求功能，包括：
 * - 多适配器支持（Fetch、Axios、Alova）
 * - 智能缓存系统
 * - 自动重试机制
 * - 请求去重功能
 * - 错误处理和恢复
 * - 拦截器系统
 * - 并发控制
 * - 文件上传下载
 * - Vue 3 深度集成
 */

import { createHttpEnginePlugin } from '@ldesign/http'
import type { HttpClientConfig, Plugin } from '@ldesign/http'

/**
 * HTTP 客户端基础配置
 * 
 * 配置了适合演示应用的 HTTP 客户端参数，包括超时时间、
 * 缓存策略、重试机制等，支持多种 API 服务的调用
 */
const httpClientConfig: HttpClientConfig = {
  // 基础配置
  baseURL: 'https://jsonplaceholder.typicode.com', // 使用免费的测试 API
  timeout: 10000, // 10秒超时

  // 默认请求头
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // 适配器配置 - 优先使用 Fetch API
  adapter: 'fetch',

  // 缓存配置
  cache: {
    enabled: true, // 启用缓存
    ttl: 300000, // 5分钟缓存时间
    maxSize: 100, // 最大缓存条目数
    strategy: 'lru', // LRU 缓存策略
  },

  // 重试配置
  retry: {
    enabled: true, // 启用自动重试
    maxAttempts: 3, // 最大重试次数
    delay: 1000, // 初始延迟时间
    backoff: 'exponential', // 指数退避策略
    retryCondition: (error: any) => {
      // 只对网络错误和 5xx 状态码重试
      return !error.response || (error.response.status >= 500)
    }
  },

  // 请求去重配置
  deduplication: {
    enabled: true, // 启用请求去重
    keyGenerator: (config: any) => {
      // 基于 URL、方法和参数生成去重键
      return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`
    }
  },

  // 并发控制
  concurrency: {
    limit: 10, // 最大并发请求数
    queue: true, // 启用请求队列
  },

  // 拦截器配置
  interceptors: {
    request: [
      // 请求日志拦截器
      (config: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 [HTTP] 发送请求: ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
      }
    ],
    response: [
      // 响应日志拦截器
      (response: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ [HTTP] 响应成功: ${response.status} ${response.config?.url}`)
        }
        return response
      },
      // 错误处理拦截器
      (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ [HTTP] 请求失败:`, error.message)
        }
        return Promise.reject(error)
      }
    ]
  }
}

/**
 * 创建自定义 HTTP 引擎插件
 *
 * 由于原始插件存在 engine.getApp() 方法调用问题，我们创建一个
 * 自定义插件来正确处理 Vue 应用的生命周期
 */
export const httpPlugin: Plugin = {
  name: 'http',
  version: '1.0.0',
  dependencies: [],

  async install(engine) {
    try {
      // 定义实际的安装逻辑
      const performInstall = async (vueApp: any) => {
        if (!vueApp) {
          throw new Error(
            'Vue app not found. Make sure the engine has created a Vue app before installing HTTP plugin.',
          )
        }

        // 记录插件安装开始
        engine.logger.info(`Installing http plugin...`, {
          version: '1.0.0',
          options: {
            baseURL: httpClientConfig.baseURL,
            timeout: httpClientConfig.timeout,
            globalPropertyName: '$http',
          },
        })

        // 创建 HTTP 客户端
        const { createHttpClient } = await import('@ldesign/http')

        const httpClient = createHttpClient(httpClientConfig)

        // 安装 Vue 插件
        const { HttpPlugin } = await import('@ldesign/http/vue')
        vueApp.use(HttpPlugin, {
          client: httpClient,
          globalConfig: httpClientConfig,
          globalProperty: '$http',
        })

        // 将客户端实例添加到 engine
        engine.httpClient = httpClient

        // 记录插件安装成功
        engine.logger.info(`http plugin installed successfully`, {
          version: '1.0.0',
          clientType: httpClient.constructor.name,
        })
      }

      // 监听 app:created 事件
      engine.events.once('app:created', async (vueApp: any) => {
        engine.logger.info(`[HTTP Plugin] app:created event received, installing now`)
        await performInstall(vueApp)
      })

      engine.logger.info(`http plugin registered, waiting for Vue app creation...`)
    } catch (error) {
      engine.logger.error(`Failed to install http plugin:`, error)
      throw error
    }
  },

  async uninstall(engine) {
    try {
      // 清理 HTTP 客户端
      if (engine.httpClient) {
        const httpClient = engine.httpClient
        // 取消所有请求
        if (httpClient.cancelAll) {
          httpClient.cancelAll()
        }
        // 清除缓存
        if (httpClient.clearCache) {
          httpClient.clearCache()
        }
        delete engine.httpClient
      }

      engine.logger.info(`http plugin uninstalled successfully`)
    } catch (error) {
      engine.logger.error(`Failed to uninstall http plugin:`, error)
      throw error
    }
  }
}

/**
 * 导出 HTTP 插件实例
 * 
 * 使用示例：
 * ```typescript
 * import { httpPlugin } from './http'
 * 
 * // 在 engine 中使用
 * const engine = createAndMountApp(App, '#app', {
 *   plugins: [httpPlugin]
 * })
 * 
 * // 在组件中使用
 * import { useHttp } from '@ldesign/http/vue'
 * 
 * const { get, post } = useHttp()
 * const data = await get('/posts')
 * ```
 */
export default httpPlugin
