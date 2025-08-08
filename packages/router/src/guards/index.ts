import type {
  NavigationFailure,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
  RouteLocationNormalized,
} from '../types'
import { NavigationFailureType } from '../core/constants'
import { createNavigationFailure, isNavigationFailure, warn } from '../utils'

/**
 * 导航守卫管理器
 */
export class GuardManager {
  private beforeGuards: NavigationGuard[] = []
  private beforeResolveGuards: NavigationGuard[] = []
  private afterGuards: NavigationHookAfter[] = []

  /**
   * 添加全局前置守卫
   */
  beforeEach(guard: NavigationGuard): () => void {
    this.beforeGuards.push(guard)
    return () => {
      const index = this.beforeGuards.indexOf(guard)
      if (index > -1) {
        this.beforeGuards.splice(index, 1)
      }
    }
  }

  /**
   * 添加全局解析守卫
   */
  beforeResolve(guard: NavigationGuard): () => void {
    this.beforeResolveGuards.push(guard)
    return () => {
      const index = this.beforeResolveGuards.indexOf(guard)
      if (index > -1) {
        this.beforeResolveGuards.splice(index, 1)
      }
    }
  }

  /**
   * 添加全局后置钩子
   */
  afterEach(hook: NavigationHookAfter): () => void {
    this.afterGuards.push(hook)
    return () => {
      const index = this.afterGuards.indexOf(hook)
      if (index > -1) {
        this.afterGuards.splice(index, 1)
      }
    }
  }

  /**
   * 执行导航守卫
   */
  async runGuards(
    guards: NavigationGuard[],
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    for (const guard of guards) {
      try {
        const result = await this.runSingleGuard(guard, to, from)
        if (result !== undefined) {
          return result
        }
      } catch (error) {
        warn(`Navigation guard error: ${error}`)
        return createNavigationFailure(NavigationFailureType.aborted, from, to)
      }
    }
    return undefined
  }

  /**
   * 执行单个守卫
   */
  private runSingleGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    return new Promise((resolve, reject) => {
      let isResolved = false

      const next: NavigationGuardNext = (result?: NavigationGuardReturn) => {
        if (isResolved) {
          warn('Navigation guard called next() multiple times')
          return
        }
        isResolved = true
        resolve(result)
      }

      // 执行守卫
      try {
        const result = guard(to, from, next)

        // 如果守卫返回 Promise
        if (
          result &&
          typeof result === 'object' &&
          'then' in result &&
          typeof result.then === 'function'
        ) {
          ;(result as Promise<NavigationGuardReturn>).then(
            (res: NavigationGuardReturn) => {
              if (!isResolved) {
                isResolved = true
                resolve(res)
              }
            },
            (error: Error) => {
              if (!isResolved) {
                isResolved = true
                reject(error)
              }
            }
          )
        }
        // 如果守卫直接返回结果
        else if (result !== undefined && !isResolved) {
          isResolved = true
          resolve(result)
        }

        // 设置超时
        setTimeout(() => {
          if (!isResolved) {
            warn('Navigation guard timeout')
            isResolved = true
            resolve(undefined)
          }
        }, 5000) // 5秒超时
      } catch (error) {
        if (!isResolved) {
          isResolved = true
          reject(error)
        }
      }
    })
  }

  /**
   * 执行前置守卫
   */
  async runBeforeGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    return this.runGuards(this.beforeGuards, to, from)
  }

  /**
   * 执行解析守卫
   */
  async runBeforeResolveGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    return this.runGuards(this.beforeResolveGuards, to, from)
  }

  /**
   * 执行后置钩子
   */
  runAfterGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    failure?: NavigationFailure
  ): void {
    for (const hook of this.afterGuards) {
      try {
        hook(to, from, failure)
      } catch (error) {
        warn(`After navigation hook error: ${error}`)
      }
    }
  }

  /**
   * 清除所有守卫
   */
  clear(): void {
    this.beforeGuards.length = 0
    this.beforeResolveGuards.length = 0
    this.afterGuards.length = 0
  }

  /**
   * 获取守卫数量
   */
  getGuardCounts(): {
    before: number
    beforeResolve: number
    after: number
  } {
    return {
      before: this.beforeGuards.length,
      beforeResolve: this.beforeResolveGuards.length,
      after: this.afterGuards.length,
    }
  }
}

/**
 * 创建守卫管理器实例
 */
export function createGuardManager(): GuardManager {
  return new GuardManager()
}

/**
 * 导出守卫相关工具函数
 */
export { NavigationFailureType } from '../core/constants'

export { createNavigationFailure, isNavigationFailure } from '../utils'

// 默认导出
export default {
  GuardManager,
  createGuardManager,
  NavigationFailureType,
  createNavigationFailure,
  isNavigationFailure,
}
