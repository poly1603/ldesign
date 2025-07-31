/**
 * 路由守卫增强功能
 * 提供更强大的路由守卫机制，支持异步守卫、条件守卫等
 */

import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export type GuardResult = boolean | string | Error | void
export type AsyncGuardResult = Promise<GuardResult> | GuardResult

export interface GuardContext {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  next: NavigationGuardNext
  meta: Record<string, any>
}

export interface GuardConfig {
  name: string
  priority: number
  enabled: boolean
  conditions?: GuardCondition[]
  handler: GuardHandler
}

export type GuardHandler = (context: GuardContext) => AsyncGuardResult
export type GuardCondition = (context: GuardContext) => boolean

export interface AuthGuardConfig {
  /** 需要认证的路由模式 */
  requireAuth?: string[]
  /** 不需要认证的路由模式 */
  excludeAuth?: string[]
  /** 登录页面路径 */
  loginPath: string
  /** 认证检查函数 */
  checkAuth: () => boolean | Promise<boolean>
  /** 权限检查函数 */
  checkPermission?: (permissions: string[]) => boolean | Promise<boolean>
}

export interface LoadingGuardConfig {
  /** 显示加载状态的最小时间(ms) */
  minLoadingTime: number
  /** 加载状态管理器 */
  loadingManager: {
    show: () => void
    hide: () => void
  }
}

/**
 * 路由守卫管理器
 */
export class RouteGuardManager {
  private guards: Map<string, GuardConfig> = new Map()
  private globalConditions: GuardCondition[] = []

  /**
   * 注册守卫
   */
  register(config: GuardConfig): void {
    this.guards.set(config.name, config)
  }

  /**
   * 注销守卫
   */
  unregister(name: string): boolean {
    return this.guards.delete(name)
  }

  /**
   * 启用/禁用守卫
   */
  toggle(name: string, enabled: boolean): void {
    const guard = this.guards.get(name)
    if (guard) {
      guard.enabled = enabled
    }
  }

  /**
   * 添加全局条件
   */
  addGlobalCondition(condition: GuardCondition): void {
    this.globalConditions.push(condition)
  }

  /**
   * 执行所有守卫
   */
  async execute(context: GuardContext): Promise<GuardResult> {
    // 检查全局条件
    for (const condition of this.globalConditions) {
      if (!condition(context)) {
        return false
      }
    }

    // 按优先级排序守卫
    const sortedGuards = Array.from(this.guards.values())
      .filter(guard => guard.enabled)
      .sort((a, b) => b.priority - a.priority)

    // 执行守卫
    for (const guard of sortedGuards) {
      // 检查守卫条件
      if (guard.conditions) {
        const conditionsMet = guard.conditions.every(condition => condition(context))
        if (!conditionsMet) {
          continue
        }
      }

      try {
        const result = await guard.handler(context)
        if (result !== undefined && result !== true) {
          return result
        }
      } catch (error) {
        console.error(`Guard ${guard.name} failed:`, error)
        return error instanceof Error ? error : new Error(String(error))
      }
    }

    return true
  }

  /**
   * 获取所有守卫
   */
  getGuards(): GuardConfig[] {
    return Array.from(this.guards.values())
  }

  /**
   * 清空所有守卫
   */
  clear(): void {
    this.guards.clear()
    this.globalConditions.length = 0
  }
}

/**
 * 认证守卫
 */
export function createAuthGuard(config: AuthGuardConfig): GuardConfig {
  return {
    name: