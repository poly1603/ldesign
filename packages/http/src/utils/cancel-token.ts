/**
 * 取消令牌模块
 * 
 * 提供请求取消令牌的实现
 */

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
    this.promise = new Promise<string>((resolve) => {
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

  /**
   * 创建新的取消令牌源
   */
  static create(): CancelTokenSource {
    return new CancelTokenSource()
  }
}

/**
 * 超时取消令牌
 */
export class TimeoutCancelToken extends CancelTokenImpl {
  private timeoutId?: NodeJS.Timeout

  constructor(timeout: number, reason = `Timeout exceeded: ${timeout}ms`) {
    super()
    
    this.timeoutId = setTimeout(() => {
      this.cancel(reason)
    }, timeout)
  }

  /**
   * 取消请求
   */
  cancel(reason = 'Request cancelled'): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
    super.cancel(reason)
  }

  /**
   * 重置超时
   */
  reset(timeout: number): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    
    if (!this.isCancelled) {
      this.timeoutId = setTimeout(() => {
        this.cancel(`Timeout exceeded: ${timeout}ms`)
      }, timeout)
    }
  }
}

/**
 * 组合取消令牌
 */
export class CombinedCancelToken implements CancelToken {
  public isCancelled = false
  public reason?: string
  public promise: Promise<string>

  private resolvePromise!: (reason: string) => void
  private tokens: CancelToken[]

  constructor(...tokens: CancelToken[]) {
    this.tokens = tokens
    
    this.promise = new Promise<string>((resolve) => {
      this.resolvePromise = resolve
    })

    // 监听所有令牌
    this.setupListeners()
  }

  private setupListeners(): void {
    this.tokens.forEach(token => {
      if (token.isCancelled) {
        this.handleTokenCancel(token.reason || 'Request cancelled')
        return
      }

      token.promise.then(reason => {
        this.handleTokenCancel(reason)
      }).catch(() => {
        // 忽略错误
      })
    })
  }

  private handleTokenCancel(reason: string): void {
    if (this.isCancelled) {
      return
    }

    this.isCancelled = true
    this.reason = reason
    this.resolvePromise(reason)
  }

  throwIfRequested(): void {
    if (this.isCancelled) {
      throw ErrorHandler.createCancelError({} as RequestConfig)
    }
    
    // 检查所有子令牌
    this.tokens.forEach(token => {
      if (token.isCancelled) {
        this.handleTokenCancel(token.reason || 'Request cancelled')
        this.throwIfRequested()
      }
    })
  }
}

/**
 * 取消令牌工厂
 */
export class CancelTokenFactory {
  /**
   * 创建基础取消令牌
   */
  static create(): CancelTokenSource {
    return new CancelTokenSource()
  }

  /**
   * 创建超时取消令牌
   */
  static createWithTimeout(timeout: number, reason?: string): TimeoutCancelToken {
    return new TimeoutCancelToken(timeout, reason)
  }

  /**
   * 组合多个取消令牌
   */
  static combine(...tokens: CancelToken[]): CombinedCancelToken {
    return new CombinedCancelToken(...tokens)
  }

  /**
   * 从 AbortSignal 创建取消令牌
   */
  static fromAbortSignal(signal: AbortSignal): CancelToken {
    const token = new CancelTokenImpl()

    if (signal.aborted) {
      token.cancel(signal.reason as string || 'Aborted')
    } else {
      signal.addEventListener('abort', () => {
        token.cancel(signal.reason as string || 'Aborted')
      }, { once: true })
    }

    return token
  }

  /**
   * 创建永不取消的令牌
   */
  static never(): CancelToken {
    return {
      isCancelled: false,
      reason: undefined,
      promise: new Promise(() => {}), // 永不resolve
      throwIfRequested: () => {},
    }
  }
}

/**
 * 创建取消令牌源
 */
export function createCancelTokenSource(): CancelTokenSource {
  return CancelTokenSource.create()
}

/**
 * 创建超时取消令牌
 */
export function createTimeoutToken(timeout: number, reason?: string): TimeoutCancelToken {
  return new TimeoutCancelToken(timeout, reason)
}

/**
 * 组合多个取消令牌
 */
export function combineCancelTokens(...tokens: CancelToken[]): CombinedCancelToken {
  return new CombinedCancelToken(...tokens)
}