/**
 * 请求取消管理器
 * 提供请求取消功能，支持单个取消、批量取消和自动取消
 */

/**
 * 取消令牌
 */
export class CancellationToken {
  private _isCancelled = false
  private _reason: string | undefined
  private _callbacks: Array<(reason?: string) => void> = []

  /**
   * 是否已取消
   */
  get isCancelled(): boolean {
    return this._isCancelled
  }

  /**
   * 取消原因
   */
  get reason(): string | undefined {
    return this._reason
  }

  /**
   * 取消请求
   */
  cancel(reason?: string): void {
    if (this._isCancelled) {
      return
    }

    this._isCancelled = true
    this._reason = reason

    // 触发所有回调
    this._callbacks.forEach((callback) => {
      try {
        callback(reason)
      }
      catch (error) {
        console.error('Error in cancellation callback:', error)
      }
    })

    // 清空回调列表
    this._callbacks = []
  }

  /**
   * 注册取消回调
   */
  onCancel(callback: (reason?: string) => void): () => void {
    if (this._isCancelled) {
      // 如果已经取消，立即执行回调
      callback(this._reason)
      return () => {}
    }

    this._callbacks.push(callback)

    // 返回取消注册的函数
    return () => {
      const index = this._callbacks.indexOf(callback)
      if (index !== -1) {
        this._callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 抛出取消错误
   */
  throwIfCancelled(): void {
    if (this._isCancelled) {
      throw new CancellationError(this._reason || 'Request cancelled')
    }
  }
}

/**
 * 取消错误
 */
export class CancellationError extends Error {
  readonly name = 'CancellationError'
  readonly isCancellation = true

  constructor(message: string = 'Request cancelled') {
    super(message)
    Object.setPrototypeOf(this, CancellationError.prototype)
  }
}

/**
 * 检查是否为取消错误
 */
export function isCancellationError(error: unknown): error is CancellationError {
  return error instanceof CancellationError || (error as any)?.isCancellation === true
}

/**
 * 请求取消管理器
 */
export class RequestCancellationManager {
  private tokens = new Map<string, CancellationToken>()
  private groups = new Map<string, Set<string>>()

  /**
   * 创建取消令牌
   */
  createToken(requestId: string, group?: string): CancellationToken {
    // 如果已存在，先取消旧的
    this.cancel(requestId)

    const token = new CancellationToken()
    this.tokens.set(requestId, token)

    // 添加到组
    if (group) {
      if (!this.groups.has(group)) {
        this.groups.set(group, new Set())
      }
      this.groups.get(group)!.add(requestId)
    }

    // 当令牌被取消时，自动清理
    token.onCancel(() => {
      this.cleanup(requestId)
    })

    return token
  }

  /**
   * 获取取消令牌
   */
  getToken(requestId: string): CancellationToken | null {
    return this.tokens.get(requestId) || null
  }

  /**
   * 取消请求
   */
  cancel(requestId: string, reason?: string): boolean {
    const token = this.tokens.get(requestId)
    if (!token) {
      return false
    }

    token.cancel(reason)
    return true
  }

  /**
   * 取消组内所有请求
   */
  cancelGroup(group: string, reason?: string): number {
    const requestIds = this.groups.get(group)
    if (!requestIds) {
      return 0
    }

    let count = 0
    requestIds.forEach((requestId) => {
      if (this.cancel(requestId, reason)) {
        count++
      }
    })

    return count
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason?: string): number {
    let count = 0
    this.tokens.forEach((token, _requestId) => {
      if (!token.isCancelled) {
        token.cancel(reason)
        count++
      }
    })

    return count
  }

  /**
   * 检查请求是否已取消
   */
  isCancelled(requestId: string): boolean {
    const token = this.tokens.get(requestId)
    return token ? token.isCancelled : false
  }

  /**
   * 清理已完成的请求
   */
  cleanup(requestId: string): void {
    this.tokens.delete(requestId)

    // 从所有组中移除
    this.groups.forEach((requestIds) => {
      requestIds.delete(requestId)
    })
  }

  /**
   * 清理组
   */
  cleanupGroup(group: string): void {
    const requestIds = this.groups.get(group)
    if (requestIds) {
      requestIds.forEach((requestId) => {
        this.tokens.delete(requestId)
      })
      this.groups.delete(group)
    }
  }

  /**
   * 清理所有
   */
  clear(): void {
    this.tokens.clear()
    this.groups.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalTokens: number
    activeTokens: number
    cancelledTokens: number
    totalGroups: number
  } {
    let activeTokens = 0
    let cancelledTokens = 0

    this.tokens.forEach((token) => {
      if (token.isCancelled) {
        cancelledTokens++
      }
      else {
        activeTokens++
      }
    })

    return {
      totalTokens: this.tokens.size,
      activeTokens,
      cancelledTokens,
      totalGroups: this.groups.size,
    }
  }

  /**
   * 获取组信息
   */
  getGroupInfo(group: string): {
    totalRequests: number
    activeRequests: number
    cancelledRequests: number
  } | null {
    const requestIds = this.groups.get(group)
    if (!requestIds) {
      return null
    }

    let activeRequests = 0
    let cancelledRequests = 0

    requestIds.forEach((requestId) => {
      const token = this.tokens.get(requestId)
      if (token) {
        if (token.isCancelled) {
          cancelledRequests++
        }
        else {
          activeRequests++
        }
      }
    })

    return {
      totalRequests: requestIds.size,
      activeRequests,
      cancelledRequests,
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.cancelAll('Manager destroyed')
    this.clear()
  }
}

/**
 * 创建请求取消管理器
 */
export function createRequestCancellationManager(): RequestCancellationManager {
  return new RequestCancellationManager()
}

/**
 * 全局请求取消管理器
 */
export const globalCancellationManager = new RequestCancellationManager()

