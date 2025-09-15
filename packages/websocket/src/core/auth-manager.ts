/**
 * WebSocket 认证管理器
 * 
 * 提供多种认证方式和Token自动刷新功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { WebSocketEventEmitter } from './event-emitter'
import { AuthConfig, AuthType } from '@/types'
import { delay, now } from '@/utils'

/** 认证状态枚举 */
export enum AuthState {
  /** 未认证 */
  UNAUTHENTICATED = 'unauthenticated',
  /** 认证中 */
  AUTHENTICATING = 'authenticating',
  /** 已认证 */
  AUTHENTICATED = 'authenticated',
  /** 认证失败 */
  FAILED = 'failed',
  /** Token过期 */
  EXPIRED = 'expired',
  /** 刷新中 */
  REFRESHING = 'refreshing'
}

/** 认证事件映射 */
export interface AuthEventMap {
  /** 认证状态变化 */
  stateChange: { from: AuthState; to: AuthState }
  /** 认证成功 */
  authenticated: { type: AuthType; token?: string }
  /** 认证失败 */
  authenticationFailed: { error: Error; type: AuthType }
  /** Token刷新成功 */
  tokenRefreshed: { oldToken?: string; newToken: string }
  /** Token刷新失败 */
  tokenRefreshFailed: { error: Error }
  /** Token即将过期 */
  tokenExpiring: { expiresIn: number }
}

/** 认证策略接口 */
export interface AuthStrategy {
  /** 执行认证 */
  authenticate(): Promise<AuthResult>
  /** 获取认证头 */
  getAuthHeaders(): Record<string, string>
  /** 验证认证是否有效 */
  isValid(): boolean
}

/** 认证结果 */
export interface AuthResult {
  /** 是否成功 */
  success: boolean
  /** Token */
  token?: string
  /** 错误信息 */
  error?: string
  /** 过期时间 */
  expiresAt?: number
  /** 额外数据 */
  data?: Record<string, unknown>
}

/**
 * 无认证策略
 */
class NoneAuthStrategy implements AuthStrategy {
  async authenticate(): Promise<AuthResult> {
    return { success: true }
  }

  getAuthHeaders(): Record<string, string> {
    return {}
  }

  isValid(): boolean {
    return true
  }
}

/**
 * Token认证策略
 */
class TokenAuthStrategy implements AuthStrategy {
  constructor(
    private token: string,
    private expiresAt?: number
  ) { }

  async authenticate(): Promise<AuthResult> {
    if (!this.token) {
      return { success: false, error: 'Token不能为空' }
    }

    return {
      success: true,
      token: this.token,
      expiresAt: this.expiresAt
    }
  }

  getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`
    }
  }

  isValid(): boolean {
    if (!this.token) {
      return false
    }

    if (this.expiresAt && now() >= this.expiresAt) {
      return false
    }

    return true
  }

  updateToken(token: string, expiresAt?: number): void {
    this.token = token
    this.expiresAt = expiresAt
  }
}

/**
 * 基础认证策略
 */
class BasicAuthStrategy implements AuthStrategy {
  constructor(
    private username: string,
    private password: string
  ) { }

  async authenticate(): Promise<AuthResult> {
    if (!this.username || !this.password) {
      return { success: false, error: '用户名和密码不能为空' }
    }

    return { success: true }
  }

  getAuthHeaders(): Record<string, string> {
    const credentials = btoa(`${this.username}:${this.password}`)
    return {
      'Authorization': `Basic ${credentials}`
    }
  }

  isValid(): boolean {
    return !!(this.username && this.password)
  }
}

/**
 * 自定义认证策略
 */
class CustomAuthStrategy implements AuthStrategy {
  private authData?: Record<string, unknown>

  constructor(
    private customAuth: () => Promise<Record<string, unknown>>
  ) { }

  async authenticate(): Promise<AuthResult> {
    try {
      this.authData = await this.customAuth()
      return {
        success: true,
        data: this.authData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '自定义认证失败'
      }
    }
  }

  getAuthHeaders(): Record<string, string> {
    if (!this.authData) {
      return {}
    }

    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(this.authData)) {
      if (typeof value === 'string') {
        headers[key] = value
      }
    }

    return headers
  }

  isValid(): boolean {
    return !!this.authData
  }
}

/**
 * WebSocket 认证管理器
 * 
 * 提供多种认证方式和Token自动刷新功能
 * 
 * @example
 * ```typescript
 * const authManager = new AuthManager({
 *   type: AuthType.TOKEN,
 *   token: 'your-token',
 *   autoRefresh: true,
 *   refreshToken: async () => {
 *     // 刷新Token的逻辑
 *     return 'new-token'
 *   }
 * })
 * 
 * await authManager.authenticate()
 * const headers = authManager.getAuthHeaders()
 * ```
 */
export class AuthManager extends WebSocketEventEmitter<AuthEventMap> {
  /** 当前认证状态 */
  private state: AuthState = AuthState.UNAUTHENTICATED

  /** 认证策略 */
  private strategy?: AuthStrategy

  /** Token刷新定时器 */
  private refreshTimer?: NodeJS.Timeout

  /** 是否正在刷新Token */
  private isRefreshing = false

  /**
   * 创建认证管理器实例
   * 
   * @param config 认证配置
   */
  constructor(private config: AuthConfig) {
    super()

    // 延迟创建认证策略，在authenticate方法中创建
    // 这样可以让测试用例按预期工作

    // 如果启用自动刷新，设置刷新定时器
    if (config.autoRefresh && config.tokenExpiry) {
      this.scheduleTokenRefresh()
    }
  }

  /**
   * 执行认证
   * 
   * @returns 认证结果
   */
  async authenticate(): Promise<AuthResult> {
    this.setState(AuthState.AUTHENTICATING)

    try {
      // 如果策略还未创建，先创建策略
      if (!this.strategy) {
        try {
          this.strategy = this.createStrategy(this.config)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '创建认证策略失败'
          this.setState(AuthState.FAILED)
          this.emit('authenticationFailed', {
            error: error instanceof Error ? error : new Error(errorMessage),
            type: this.config.type
          })

          return {
            success: false,
            error: errorMessage
          }
        }
      }

      const result = await this.strategy.authenticate()

      if (result.success) {
        this.setState(AuthState.AUTHENTICATED)
        this.emit('authenticated', {
          type: this.config.type,
          token: result.token
        })

        // 如果有Token过期时间，设置刷新定时器
        if (result.expiresAt && this.config.autoRefresh) {
          this.scheduleTokenRefresh(result.expiresAt)
        }
      } else {
        this.setState(AuthState.FAILED)
        this.emit('authenticationFailed', {
          error: new Error(result.error || '认证失败'),
          type: this.config.type
        })
      }

      return result
    } catch (error) {
      this.setState(AuthState.FAILED)
      const authError = error instanceof Error ? error : new Error('认证过程中发生未知错误')

      this.emit('authenticationFailed', {
        error: authError,
        type: this.config.type
      })

      return {
        success: false,
        error: authError.message
      }
    }
  }

  /**
   * 获取认证头
   * 
   * @returns 认证头对象
   */
  getAuthHeaders(): Record<string, string> {
    if (this.state !== AuthState.AUTHENTICATED || !this.strategy) {
      return {}
    }

    return this.strategy.getAuthHeaders()
  }

  /**
   * 检查认证是否有效
   * 
   * @returns 是否有效
   */
  isAuthenticated(): boolean {
    return this.state === AuthState.AUTHENTICATED && this.strategy?.isValid() === true
  }

  /**
   * 获取当前认证状态
   * 
   * @returns 认证状态
   */
  getState(): AuthState {
    return this.state
  }

  /**
   * 刷新Token
   *
   * @returns 刷新结果
   */
  async refreshToken(): Promise<boolean> {
    if (!this.config.refreshToken || this.isRefreshing) {
      return false
    }

    this.isRefreshing = true
    this.setState(AuthState.REFRESHING)

    try {
      const oldToken = this.config.token
      const newToken = await this.config.refreshToken()

      // 更新配置中的Token
      this.config.token = newToken

      // 如果是Token认证策略，更新Token
      if (this.strategy && this.strategy instanceof TokenAuthStrategy) {
        const expiresAt = this.config.tokenExpiry ? now() + this.config.tokenExpiry : undefined
        this.strategy.updateToken(newToken, expiresAt)
      }

      this.setState(AuthState.AUTHENTICATED)
      this.emit('tokenRefreshed', { oldToken, newToken })

      // 重新设置刷新定时器
      if (this.config.autoRefresh && this.config.tokenExpiry) {
        this.scheduleTokenRefresh()
      }

      return true
    } catch (error) {
      this.setState(AuthState.EXPIRED)
      this.emit('tokenRefreshFailed', {
        error: error instanceof Error ? error : new Error('Token刷新失败')
      })

      return false
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 销毁认证管理器
   */
  destroy(): void {
    // 清除刷新定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
    }

    // 重置状态
    this.state = AuthState.UNAUTHENTICATED
    this.isRefreshing = false

    // 清除事件监听器
    this.removeAllListeners()
  }

  /**
   * 更新认证配置
   *
   * @param config 新的认证配置
   */
  updateConfig(config: Partial<AuthConfig>): void {
    // 合并配置
    this.config = { ...this.config, ...config }

    // 清除现有策略，将在下次authenticate时重新创建
    this.strategy = undefined

    // 重置状态
    this.setState(AuthState.UNAUTHENTICATED)

    // 清除刷新定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
    }

    // 如果启用自动刷新，重新设置定时器
    if (this.config.autoRefresh && this.config.tokenExpiry) {
      this.scheduleTokenRefresh()
    }
  }

  /**
   * 创建认证策略
   *
   * @param config 认证配置
   * @returns 认证策略实例
   */
  private createStrategy(config: AuthConfig): AuthStrategy {
    switch (config.type) {
      case AuthType.NONE:
        return new NoneAuthStrategy()

      case AuthType.TOKEN:
        if (!config.token) {
          throw new Error('Token认证需要提供token')
        }
        const expiresAt = config.tokenExpiry ? now() + config.tokenExpiry : undefined
        return new TokenAuthStrategy(config.token, expiresAt)

      case AuthType.BASIC:
        if (!config.username || !config.password) {
          throw new Error('基础认证需要提供用户名和密码')
        }
        return new BasicAuthStrategy(config.username, config.password)

      case AuthType.CUSTOM:
        if (!config.customAuth) {
          throw new Error('自定义认证需要提供customAuth函数')
        }
        return new CustomAuthStrategy(config.customAuth)

      default:
        throw new Error(`不支持的认证类型: ${config.type}`)
    }
  }

  /**
   * 设置认证状态
   *
   * @param newState 新状态
   */
  private setState(newState: AuthState): void {
    if (this.state !== newState) {
      const oldState = this.state
      this.state = newState

      this.emit('stateChange', {
        from: oldState,
        to: newState
      })
    }
  }

  /**
   * 安排Token刷新
   *
   * @param expiresAt Token过期时间
   */
  private scheduleTokenRefresh(expiresAt?: number): void {
    // 清除现有定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    if (!this.config.tokenExpiry) {
      return
    }

    // 计算刷新时间（在过期前5分钟刷新）
    const refreshBuffer = 5 * 60 * 1000 // 5分钟
    const expiry = expiresAt || (now() + this.config.tokenExpiry)
    const refreshTime = Math.max(expiry - now() - refreshBuffer, 1000) // 至少1秒后刷新

    // 在Token即将过期前发出警告
    const warningTime = Math.max(refreshTime - 60000, 0) // 提前1分钟警告
    if (warningTime > 0) {
      setTimeout(() => {
        this.emit('tokenExpiring', {
          expiresIn: 60000 // 1分钟后过期
        })
      }, warningTime)
    }

    // 设置刷新定时器
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken()
    }, refreshTime)
  }
}
