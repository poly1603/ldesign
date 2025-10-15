/**
 * 请求去重工具
 *
 * 防止重复的请求同时发送,自动合并相同的请求
 */

import type { RequestConfig, ResponseData } from '../types'

/**
 * 生成请求唯一键
 */
export function generateRequestKey(config: RequestConfig): string {
  const { method = 'GET', url, params, data } = config

  // 基础key
  let key = `${method.toUpperCase()}:${url}`

  // 添加参数
  if (params && Object.keys(params).length > 0) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&')
    key += `?${sortedParams}`
  }

  // 添加数据（仅对POST/PUT等有body的请求）
  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    try {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
      key += `|${dataStr}`
    }
    catch {
      // 无法序列化的数据不参与去重
    }
  }

  return key
}

/**
 * 请求去重管理器
 *
 * @example
 * ```typescript
 * const deduper = new RequestDeduplicator()
 *
 * // 同时发送多个相同的请求
 * const [res1, res2, res3] = await Promise.all([
 *   deduper.execute(config, fetchFn),
 *   deduper.execute(config, fetchFn), // 会复用第一个请求
 *   deduper.execute(config, fetchFn), // 会复用第一个请求
 * ])
 *
 * // 实际只发送了1个请求
 * ```
 */
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()
  private subscribers = new Map<string, Set<{ resolve: Function, reject: Function }>>()

  /**
   * 执行请求（带去重）
   */
  async execute<T>(
    config: RequestConfig,
    fetchFn: () => Promise<ResponseData<T>>,
  ): Promise<ResponseData<T>> {
    const key = generateRequestKey(config)

    // 如果已有相同请求正在进行,等待结果
    if (this.pendingRequests.has(key)) {
      return new Promise((resolve, reject) => {
        if (!this.subscribers.has(key)) {
          this.subscribers.set(key, new Set())
        }
        this.subscribers.get(key)!.add({ resolve, reject })
      })
    }

    // 执行新请求
    const requestPromise = fetchFn()
      .then((response) => {
        // 通知所有订阅者
        this.notifySubscribers(key, response, null)
        return response
      })
      .catch((error) => {
        // 通知所有订阅者
        this.notifySubscribers(key, null, error)
        throw error
      })
      .finally(() => {
        // 清理
        this.pendingRequests.delete(key)
        this.subscribers.delete(key)
      })

    this.pendingRequests.set(key, requestPromise)
    return requestPromise
  }

  /**
   * 通知订阅者
   */
  private notifySubscribers(key: string, response: any, error: any) {
    const subs = this.subscribers.get(key)
    if (!subs)
      return

    subs.forEach((sub) => {
      if (error) {
        sub.reject(error)
      }
      else {
        sub.resolve(response)
      }
    })
  }

  /**
   * 获取待处理请求数量
   */
  getPendingCount(): number {
    return this.pendingRequests.size
  }

  /**
   * 清除所有待处理请求
   */
  clear(): void {
    this.pendingRequests.clear()
    this.subscribers.forEach((subs) => {
      subs.forEach(sub => sub.reject(new Error('Request deduplicator cleared')))
    })
    this.subscribers.clear()
  }

  /**
   * 获取统计信息
   */
  getStats() {
    let totalSubscribers = 0
    this.subscribers.forEach((subs) => {
      totalSubscribers += subs.size
    })

    return {
      pendingRequests: this.pendingRequests.size,
      totalSubscribers,
      savedRequests: totalSubscribers, // 节省的请求数
    }
  }
}

/**
 * 创建请求去重拦截器
 *
 * 可以作为拦截器使用,自动为所有请求添加去重功能
 */
export function createDeduplicationInterceptor() {
  const deduplicator = new RequestDeduplicator()

  return {
    deduplicator,
    interceptor: {
      // 在请求阶段标记配置
      request: (config: RequestConfig) => {
        ;(config as any).__dedup = true
        return config
      },
    },
  }
}

/**
 * 全局请求去重器
 */
export const globalDeduplicator = new RequestDeduplicator()
