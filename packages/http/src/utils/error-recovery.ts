/**
 * 错误恢复策略模块
 * 
 * 提供各种错误恢复策略的实现
 */

import type { HttpError } from '../types'

/**
 * 错误恢复策略接口
 */
export interface ErrorRecoveryStrategy {
  /** 策略名称 */
  name: string
  /** 是否可以处理该错误 */
  canHandle: (error: HttpError) => boolean
  /** 执行恢复策略 */
  recover: (error: HttpError) => Promise<boolean>
  /** 策略优先级（数字越大优先级越高） */
  priority?: number
}

/**
 * 内置恢复策略
 */
export const builtInStrategies = {
  /**
   * 网络重连策略
   */
  networkReconnect: {
    name: 'network-reconnect',
    priority: 10,
    canHandle: (error: HttpError) => error.isNetworkError === true,
    recover: async (_error: HttpError): Promise<boolean> => {
      // 简单的网络连通性检查
      try {
        // 尝试请求一个简单的端点
        const response = await fetch('/ping', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000),
        })
        return response.ok
      }
      catch {
        return false
      }
    },
  } as ErrorRecoveryStrategy,

  /**
   * 认证刷新策略
   */
  authRefresh: {
    name: 'auth-refresh',
    priority: 20,
    canHandle: (error: HttpError) => error.response?.status === 401,
    recover: async (_error: HttpError): Promise<boolean> => {
      try {
        // 尝试刷新认证令牌
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          return false
        }

        const response = await fetch('/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          return true
        }
      }
      catch {
        // 刷新失败，清除所有令牌
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }

      return false
    },
  } as ErrorRecoveryStrategy,

  /**
   * 服务降级策略
   */
  serviceFallback: {
    name: 'service-fallback',
    priority: 5,
    canHandle: (error: HttpError) => {
      const status = error.response?.status
      return status === 503 || status === 502 || status === 504
    },
    recover: async (error: HttpError): Promise<boolean> => {
      // 检查是否有备用服务端点
      const fallbackUrl = error.config?.url?.replace('/api/', '/api-fallback/')
      if (fallbackUrl && fallbackUrl !== error.config?.url) {
        try {
          const response = await fetch(fallbackUrl, {
            method: 'HEAD',
            signal: AbortSignal.timeout(3000),
          })
          return response.ok
        }
        catch {
          return false
        }
      }
      return false
    },
  } as ErrorRecoveryStrategy,

  /**
   * 缓存回退策略
   */
  cacheFailback: {
    name: 'cache-fallback',
    priority: 1,
    canHandle: (error: HttpError) => {
      // 只对GET请求使用缓存回退
      return error.config?.method?.toUpperCase() === 'GET'
    },
    recover: async (error: HttpError): Promise<boolean> => {
      try {
        // 尝试从缓存中获取数据
        const cacheKey = `http_cache_${error.config?.url}`
        const cachedData = localStorage.getItem(cacheKey)

        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          const now = Date.now()

          // 检查缓存是否过期（24小时）
          if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
            // 可以使用缓存数据
            return true
          }
        }
      }
      catch {
        // 缓存解析失败
      }

      return false
    },
  } as ErrorRecoveryStrategy,
}

/**
 * 错误恢复管理器
 */
export class ErrorRecoveryManager {
  private strategies: ErrorRecoveryStrategy[] = []

  constructor() {
    // 添加内置策略
    this.addStrategy(builtInStrategies.authRefresh)
    this.addStrategy(builtInStrategies.networkReconnect)
    this.addStrategy(builtInStrategies.serviceFallback)
    this.addStrategy(builtInStrategies.cacheFailback)
  }

  /**
   * 添加恢复策略
   */
  addStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.push(strategy)
    // 按优先级排序
    this.strategies.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 移除恢复策略
   */
  removeStrategy(name: string): void {
    this.strategies = this.strategies.filter(s => s.name !== name)
  }

  /**
   * 尝试恢复错误
   */
  async attemptRecovery(error: HttpError): Promise<{
    recovered: boolean
    strategy?: string
  }> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        try {
          const recovered = await strategy.recover(error)
          if (recovered) {
            return {
              recovered: true,
              strategy: strategy.name,
            }
          }
        }
        catch {
          // 策略执行失败，尝试下一个
          continue
        }
      }
    }

    return { recovered: false }
  }

  /**
   * 获取所有策略
   */
  getStrategies(): ErrorRecoveryStrategy[] {
    return [...this.strategies]
  }

  /**
   * 清除所有策略
   */
  clearStrategies(): void {
    this.strategies = []
  }

  /**
   * 批量尝试恢复
   */
  async attemptBatchRecovery(errors: HttpError[]): Promise<Map<HttpError, {
    recovered: boolean
    strategy?: string
  }>> {
    const results = new Map<HttpError, { recovered: boolean; strategy?: string }>()

    await Promise.all(
      errors.map(async (error) => {
        const result = await this.attemptRecovery(error)
        results.set(error, result)
      })
    )

    return results
  }
}