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

import { createHttpEnginePlugin } from '@ldesign/http/index.ts'
import type { HttpClientConfig } from '@ldesign/http/index.ts'

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
    keyGenerator: (config: any) => {
      // 基于 URL、方法和参数生成缓存键
      return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`
    }
  },

  // 重试配置
  retry: {
    retries: 3, // 最大重试次数
    retryDelay: 1000, // 初始延迟时间
    retryCondition: (error: any) => {
      // 只对网络错误和 5xx 状态码重试
      return !error.response || (error.response.status >= 500)
    }
  },

  // 并发控制
  concurrency: {
    maxConcurrent: 10, // 最大并发请求数
    maxQueueSize: 100, // 队列大小限制
    deduplication: true, // 启用请求去重
  },

  // 拦截器配置
  interceptors: {
    request: [
      // 请求日志拦截器（已禁用）
      (config: any) => {
        // 已禁用调试日志输出
        return config
      }
    ],
    response: [
      // 响应日志拦截器（已禁用）
      (response: any) => {
        // 已禁用调试日志输出
        return response
      },
      // 错误处理拦截器（已禁用）
      (error: any) => {
        // 已禁用调试日志输出
        return Promise.reject(error)
      }
    ]
  }
}

/**
 * 创建标准化的 HTTP 引擎插件
 *
 * 使用 @ldesign/http 包提供的标准插件创建函数，
 * 确保与其他已集成包保持一致的插件创建模式
 */
export const httpPlugin = createHttpEnginePlugin({
  // 插件基础信息
  name: 'http',
  version: '1.0.0',

  // HTTP 客户端配置
  clientConfig: httpClientConfig,

  // Vue 插件配置
  globalInjection: true,
  globalPropertyName: '$http',

  // 全局配置（用于 Vue 插件）
  globalConfig: httpClientConfig,
})

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
