import type { RequestConfig } from '../types'
import { ErrorHandler } from './error'

/**
 * 取消令牌接口
 */
export interface CancelToken {
  /** 取消原因 */
  reason?: string
  /** 是否已取消 */
  isCancelled: boolean
  /** 取消回调 */
  promise: Promise<string>
  /** 抛出取消错误 */
  throwIfRequested: () => void
}

/**
 * 取消令牌实现
 */
export class CancelTokenImpl implements CancelToken {
  public isCancelled = false
  public reason?: string
  public promise: Promise<string>

  private resolvePromise!: (reason: string) => void

  constructor() {
    this.promise = new Promise<string>(resolve => {
      this.resolvePromise = resolve
    })
  }

  /**
   * 取消请求
   */
  cancel(reason = 'Request cancelled'): void {
    if (this.isCancelled) {
      return
    }

    this.isCancelled = true
    this.reason = reason
    this.resolvePromise(reason)
  }

  /**
   * 如果已取消则抛出错误
   */
  throwIfRequested(): void {
    if (this.isCancelled) {
      throw ErrorHandler.createCancelError({} as RequestConfig)
    }
  }
}

/**
 * 取消令牌源
 */
export class CancelTokenSource {
  public token: CancelToken

  constructor() {
    this.token = new CancelTokenImpl()
  }

  /**
   * 取消请求
   */
  cancel(reason?: string): void {
    ;(this.token as CancelTokenImpl).cancel(reason)
  }
}

/**
 * 请求取消管理器
 */
export class CancelManager {
  private requests = new Map<string, AbortController>()
  private cancelTokens = new Map<string, CancelToken>()

  /**
   * 创建取消令牌源
   */
  static source(): CancelTokenSource {
    return new CancelTokenSource()
  }

  /**
   * 注册请求
   */
  register(
    requestId: string,
    controller: AbortController,
    token?: CancelToken
  ): void {
    this.requests.set(requestId, controller)
    if (token) {
      this.cancelTokens.set(requestId, token)

      // 监听取消令牌
      token.promise
        .then(() => {
          this.cancel(requestId)
        })
        .catch(() => {
          // 忽略错误
        })
    }
  }

  /**
   * 取消指定请求
   */
  cancel(requestId: string, reason = 'Request cancelled'): void {
    const controller = this.requests.get(requestId)
    if (controller) {
      controller.abort()
      this.requests.delete(requestId)
    }

    const token = this.cancelTokens.get(requestId)
    if (token && !token.isCancelled) {
      ;(token as CancelTokenImpl).cancel(reason)
      this.cancelTokens.delete(requestId)
    }
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason = 'All requests cancelled'): void {
    this.requests.forEach((controller, _requestId) => {
      controller.abort()
    })
    this.requests.clear()

    this.cancelTokens.forEach((token, _requestId) => {
      if (!token.isCancelled) {
        ;(token as CancelTokenImpl).cancel(reason)
      }
    })
    this.cancelTokens.clear()
  }

  /**
   * 清理已完成的请求
   */
  cleanup(requestId: string): void {
    this.requests.delete(requestId)
    this.cancelTokens.delete(requestId)
  }

  /**
   * 获取活跃请求数量
   */
  getActiveRequestCount(): number {
    return this.requests.size
  }

  /**
   * 检查请求是否已取消
   */
  isCancelled(requestId: string): boolean {
    const token = this.cancelTokens.get(requestId)
    return token ? token.isCancelled : false
  }

  /**
   * 创建合并的 AbortSignal
   */
  createMergedSignal(signals: (AbortSignal | undefined)[]): AbortSignal {
    const validSignals = signals.filter(
      (signal): signal is AbortSignal => signal !== undefined
    )

    if (validSignals.length === 0) {
      return new AbortController().signal
    }

    if (validSignals.length === 1) {
      return validSignals[0]!
    }

    // 创建一个新的控制器来合并多个信号
    const controller = new AbortController()

    const abortHandler = () => {
      controller.abort()
    }

    validSignals.forEach(signal => {
      if (signal.aborted) {
        controller.abort()
        return
      }
      signal.addEventListener('abort', abortHandler, { once: true })
    })

    return controller.signal
  }
}

/**
 * 全局取消管理器实例
 */
export const globalCancelManager = new CancelManager()

/**
 * 创建取消令牌源
 */
export function createCancelTokenSource(): CancelTokenSource {
  return CancelManager.source()
}

/**
 * 检查是否为取消错误
 */
export function isCancelError(error: any): boolean {
  return (
    error &&
    (error.isCancelError ||
      error.name === 'AbortError' ||
      error.code === 'CANCELED' ||
      error.message?.includes('cancelled') ||
      error.message?.includes('aborted'))
  )
}

/**
 * 超时取消令牌
 */
export function createTimeoutCancelToken(timeout: number): CancelTokenSource {
  const source = createCancelTokenSource()

  setTimeout(() => {
    source.cancel(`Request timeout after ${timeout}ms`)
  }, timeout)

  return source
}
