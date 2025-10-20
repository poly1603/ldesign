/**
 * 连接预热和 Keep-Alive 管理器
 * 
 * 提供连接预热、DNS预解析、TCP连接复用等功能
 * 提升首次请求性能和整体吞吐量
 */

import type { HttpClient } from '../types'

/**
 * 预热配置
 */
export interface WarmupConfig {
  /** 要预热的URL列表 */
  urls: string[]
  /** 预热方法，默认为 HEAD */
  method?: 'HEAD' | 'OPTIONS' | 'GET'
  /** 并发预热数量 */
  concurrency?: number
  /** 预热超时时间（毫秒） */
  timeout?: number
  /** 是否启用DNS预解析 */
  dnsPrefetch?: boolean
  /** 是否启用预连接 */
  preconnect?: boolean
  /** 失败时是否静默（不抛出错误） */
  silent?: boolean
}

/**
 * 预热结果
 */
export interface WarmupResult {
  /** 成功预热的URL */
  succeeded: string[]
  /** 失败的URL */
  failed: Array<{ url: string, error: Error }>
  /** 总耗时 */
  duration: number
  /** 统计信息 */
  stats: {
    total: number
    success: number
    failed: number
    averageTime: number
  }
}

/**
 * Keep-Alive 配置
 */
export interface KeepAliveConfig {
  /** 是否启用 Keep-Alive */
  enabled?: boolean
  /** 最大空闲时间（毫秒） */
  maxIdleTime?: number
  /** 最大连接数 */
  maxConnections?: number
  /** 每个主机的最大连接数 */
  maxConnectionsPerHost?: number
}

/**
 * 连接预热管理器
 * 
 * @example
 * ```typescript
 * const warmupManager = new WarmupManager(client)
 * 
 * // 预热关键API端点
 * await warmupManager.warmup({
 *   urls: [
 *     'https://api.example.com/users',
 *     'https://api.example.com/posts',
 *     'https://api.example.com/comments'
 *   ],
 *   concurrency: 3
 * })
 * 
 * // 预连接到多个域名
 * warmupManager.preconnect([
 *   'https://api.example.com',
 *   'https://cdn.example.com',
 *   'https://static.example.com'
 * ])
 * ```
 */
export class WarmupManager {
  private client: HttpClient
  private preconnectedDomains = new Set<string>()

  constructor(client: HttpClient) {
    this.client = client
  }

  /**
   * 预热连接
   * 
   * 通过发送轻量级请求（HEAD/OPTIONS）来建立连接，
   * 使后续请求可以复用连接，减少延迟
   * 
   * @param config - 预热配置
   * @returns 预热结果
   */
  async warmup(config: WarmupConfig): Promise<WarmupResult> {
    const {
      urls,
      method = 'HEAD',
      concurrency = 5,
      timeout = 5000,
      dnsPrefetch = true,
      preconnect = true,
      silent = true,
    } = config

    const startTime = Date.now()
    const succeeded: string[] = []
    const failed: Array<{ url: string, error: Error }> = []
    const timings: number[] = []

    // DNS 预解析
    if (dnsPrefetch && typeof document !== 'undefined') {
      this.dnsPrefetch(urls)
    }

    // 预连接
    if (preconnect && typeof document !== 'undefined') {
      const origins = [...new Set(urls.map(url => new URL(url).origin))]
      this.preconnect(origins)
    }

    // 分批并发预热
    const batches = this.createBatches(urls, concurrency)

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (url) => {
          const requestStartTime = Date.now()

          try {
            await this.client.request({
              url,
              method,
              timeout,
              // 标记为预热请求，避免触发某些拦截器
              metadata: { isWarmup: true },
            })

            const requestTime = Date.now() - requestStartTime
            timings.push(requestTime)
            succeeded.push(url)
          }
          catch (error) {
            if (!silent) {
              console.warn(`预热失败 ${url}:`, error)
            }
            failed.push({
              url,
              error: error as Error,
            })
          }
        }),
      )
    }

    const duration = Date.now() - startTime
    const averageTime = timings.length > 0
      ? timings.reduce((a, b) => a + b, 0) / timings.length
      : 0

    return {
      succeeded,
      failed,
      duration,
      stats: {
        total: urls.length,
        success: succeeded.length,
        failed: failed.length,
        averageTime,
      },
    }
  }

  /**
   * DNS 预解析
   * 
   * 在浏览器中添加 dns-prefetch link 标签
   * 
   * @param urls - URL列表
   */
  dnsPrefetch(urls: string[]): void {
    if (typeof document === 'undefined') {
      return
    }

    const domains = [...new Set(
      urls.map((url) => {
        try {
          return new URL(url).origin
        }
        catch {
          return null
        }
      }).filter(Boolean) as string[],
    )]

    domains.forEach((domain) => {
      if (!this.hasLinkTag(domain, 'dns-prefetch')) {
        const link = document.createElement('link')
        link.rel = 'dns-prefetch'
        link.href = domain
        document.head.appendChild(link)
      }
    })
  }

  /**
   * 预连接
   * 
   * 在浏览器中添加 preconnect link 标签
   * 建立早期连接（DNS + TCP + TLS）
   * 
   * @param origins - 源地址列表
   */
  preconnect(origins: string[]): void {
    if (typeof document === 'undefined') {
      return
    }

    origins.forEach((origin) => {
      if (this.preconnectedDomains.has(origin)) {
        return
      }

      if (!this.hasLinkTag(origin, 'preconnect')) {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = origin
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)

        this.preconnectedDomains.add(origin)
      }
    })
  }

  /**
   * 预加载资源
   * 
   * @param url - 资源URL
   * @param as - 资源类型
   */
  preload(url: string, as: 'fetch' | 'script' | 'style' | 'image' = 'fetch'): void {
    if (typeof document === 'undefined') {
      return
    }

    if (!this.hasLinkTag(url, 'preload')) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url
      link.as = as
      document.head.appendChild(link)
    }
  }

  /**
   * 批量预热（自动重试失败的URL）
   * 
   * @param config - 预热配置
   * @param maxRetries - 最大重试次数
   * @returns 预热结果
   */
  async warmupWithRetry(
    config: WarmupConfig,
    maxRetries = 2,
  ): Promise<WarmupResult> {
    let result = await this.warmup(config)

    for (let retry = 0; retry < maxRetries && result.failed.length > 0; retry++) {
      const failedUrls = result.failed.map(f => f.url)

      console.info(`Retrying ${failedUrls.length} failed URLs...`)

      const retryResult = await this.warmup({
        ...config,
        urls: failedUrls,
      })

      // 合并结果
      result = {
        succeeded: [...result.succeeded, ...retryResult.succeeded],
        failed: retryResult.failed,
        duration: result.duration + retryResult.duration,
        stats: {
          total: config.urls.length,
          success: result.succeeded.length + retryResult.succeeded.length,
          failed: retryResult.failed.length,
          averageTime: (result.stats.averageTime + retryResult.stats.averageTime) / 2,
        },
      }
    }

    return result
  }

  /**
   * 智能预热
   * 
   * 根据访问频率自动预热常用端点
   * 
   * @param urlPatterns - URL模式列表
   * @param threshold - 预热阈值（访问次数）
   */
  async smartWarmup(
    urlPatterns: string[],
    threshold = 5,
  ): Promise<WarmupResult> {
    // 这里可以集成访问统计，实际应用中可以从本地存储读取
    const accessCounts = this.getAccessCounts()
    const frequentUrls = urlPatterns.filter(
      url => (accessCounts.get(url) || 0) >= threshold,
    )

    if (frequentUrls.length === 0) {
      return {
        succeeded: [],
        failed: [],
        duration: 0,
        stats: { total: 0, success: 0, failed: 0, averageTime: 0 },
      }
    }

    return this.warmup({
      urls: frequentUrls,
      silent: true,
    })
  }

  /**
   * 清理预热资源
   */
  cleanup(): void {
    if (typeof document === 'undefined') {
      return
    }

    // 移除预热相关的 link 标签
    const links = document.querySelectorAll(
      'link[rel="dns-prefetch"], link[rel="preconnect"], link[rel="preload"]',
    )

    links.forEach(link => link.remove())

    this.preconnectedDomains.clear()
  }

  /**
   * 创建批次
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    return batches
  }

  /**
   * 检查是否已存在 link 标签
   */
  private hasLinkTag(href: string, rel: string): boolean {
    if (typeof document === 'undefined') {
      return false
    }

    return !!document.querySelector(`link[rel="${rel}"][href="${href}"]`)
  }

  /**
   * 获取访问计数（模拟，实际应该从本地存储读取）
   */
  private getAccessCounts(): Map<string, number> {
    // 实际应用中，这应该从 localStorage 或其他持久化存储中读取
    return new Map()
  }
}

/**
 * 创建预热管理器
 * 
 * @param client - HTTP 客户端实例
 * @returns 预热管理器实例
 */
export function createWarmupManager(client: HttpClient): WarmupManager {
  return new WarmupManager(client)
}

/**
 * Keep-Alive 管理器
 * 
 * 管理长连接，优化连接复用
 */
export class KeepAliveManager {
  private config: KeepAliveConfig
  private connections = new Map<string, {
    count: number
    lastUsed: number
    timer?: ReturnType<typeof setTimeout>
  }>()

  constructor(config: KeepAliveConfig = {}) {
    this.config = {
      enabled: true,
      maxIdleTime: 60000, // 60秒
      maxConnections: 100,
      maxConnectionsPerHost: 6,
      ...config,
    }
  }

  /**
   * 获取或创建连接
   */
  acquire(host: string): void {
    if (!this.config?.enabled) {
      return
    }

    let connection = this.connections.get(host)

    if (!connection) {
      connection = { count: 0, lastUsed: Date.now() }
      this.connections.set(host, connection)
    }

    connection.count++
    connection.lastUsed = Date.now()

    // 清除现有定时器
    if (connection.timer) {
      clearTimeout(connection.timer)
    }

    // 设置空闲超时
    connection.timer = setTimeout(() => {
      this.release(host)
    }, this.config?.maxIdleTime)
  }

  /**
   * 释放连接
   */
  release(host: string): void {
    const connection = this.connections.get(host)

    if (!connection) {
      return
    }

    connection.count--

    if (connection.count <= 0) {
      if (connection.timer) {
        clearTimeout(connection.timer)
      }
      this.connections.delete(host)
    }
  }

  /**
   * 获取连接统计
   */
  getStats() {
    const stats = {
      totalConnections: this.connections.size,
      activeConnections: 0,
      idleConnections: 0,
      connectionsByHost: {} as Record<string, number>,
    }

    const now = Date.now()

    this.connections.forEach((connection, host) => {
      const idle = now - connection.lastUsed

      const halfIdle = (this.config?.maxIdleTime ?? 0) / 2
      if (idle > halfIdle) {
        stats.idleConnections++
      }
      else {
        stats.activeConnections++
      }

      stats.connectionsByHost[host] = connection.count
    })

    return stats
  }

  /**
   * 清理所有连接
   */
  cleanup(): void {
    this.connections.forEach((connection) => {
      if (connection.timer) {
        clearTimeout(connection.timer)
      }
    })

    this.connections.clear()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<KeepAliveConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * 创建 Keep-Alive 管理器
 */
export function createKeepAliveManager(config?: KeepAliveConfig): KeepAliveManager {
  return new KeepAliveManager(config)
}

/**
 * 全局预热工具函数
 * 
 * @param client - HTTP 客户端
 * @param urls - 要预热的URL列表
 * @param options - 预热选项
 */
export async function warmupConnections(
  client: HttpClient,
  urls: string[],
  options?: Partial<WarmupConfig>,
): Promise<WarmupResult> {
  const manager = new WarmupManager(client)
  return manager.warmup({ urls, ...options })
}
