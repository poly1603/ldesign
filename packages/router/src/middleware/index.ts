/**
 * @ldesign/router 中间件系统
 *
 * 提供灵活的路由中间件机制，支持认证、权限、日志等功能
 */

import type { NavigationGuardNext, RouteLocationNormalized } from '../types'
import { logger } from '../utils/logger'

/**
 * 中间件函数类型
 */
export type MiddlewareFunction = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  context: MiddlewareContext
) => void | Promise<void>

/**
 * 中间件上下文
 */
export interface MiddlewareContext {
  /** 用户信息 */
  user?: any
  /** 权限列表 */
  permissions?: string[]
  /** 自定义数据 */
  data: Record<string, any>
  /** 中间件链中的位置 */
  index: number
  /** 总中间件数量 */
  total: number
}

/**
 * 中间件配置
 */
export interface MiddlewareConfig {
  /** 中间件名称 */
  name: string
  /** 中间件函数 */
  handler: MiddlewareFunction
  /** 优先级（数字越小优先级越高） */
  priority?: number
  /** 是否启用 */
  enabled?: boolean
  /** 应用条件 */
  condition?: (route: RouteLocationNormalized) => boolean
}

/**
 * 路由中间件管理器
 */
export class MiddlewareManager {
  private middlewares: Map<string, MiddlewareConfig> = new Map()
  private sortedMiddlewares: MiddlewareConfig[] = []

  /**
   * 注册中间件
   */
  register(config: MiddlewareConfig): void {
    this.middlewares.set(config.name, {
      priority: 100,
      enabled: true,
      ...config,
    })
    this.updateSortedMiddlewares()
  }

  /**
   * 注册多个中间件
   */
  registerMultiple(configs: MiddlewareConfig[]): void {
    configs.forEach(config => this.register(config))
  }

  /**
   * 移除中间件
   */
  unregister(name: string): void {
    this.middlewares.delete(name)
    this.updateSortedMiddlewares()
  }

  /**
   * 启用/禁用中间件
   */
  toggle(name: string, enabled: boolean): void {
    const middleware = this.middlewares.get(name)
    if (middleware) {
      middleware.enabled = enabled
      this.updateSortedMiddlewares()
    }
  }

  /**
   * 更新排序后的中间件列表
   */
  private updateSortedMiddlewares(): void {
    this.sortedMiddlewares = Array.from(this.middlewares.values())
      .filter(m => m.enabled)
      .sort((a, b) => (a.priority || 100) - (b.priority || 100))
  }

  /**
   * 执行中间件链
   */
  async execute(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ): Promise<void> {
    const applicableMiddlewares = this.sortedMiddlewares.filter(
      m => !m.condition || m.condition(to),
    )

    if (applicableMiddlewares.length === 0) {
      next()
      return
    }

    let currentIndex = 0
    const context: MiddlewareContext = {
      data: {},
      index: 0,
      total: applicableMiddlewares.length,
    }

    const executeNext = async (): Promise<void> => {
      if (currentIndex >= applicableMiddlewares.length) {
        next()
        return
      }

      const middleware = applicableMiddlewares[currentIndex]
      if (!middleware) {
        next()
        return
      }

      context.index = currentIndex
      currentIndex++

      try {
        await middleware.handler(to, from, executeNext, context)
      }
      catch (error) {
        logger.error(`中间件 "${middleware.name}" 执行失败:`, error)
        next(error as Error)
      }
    }

    await executeNext()
  }

  /**
   * 获取所有中间件
   */
  getAll(): MiddlewareConfig[] {
    return Array.from(this.middlewares.values())
  }

  /**
   * 获取启用的中间件
   */
  getEnabled(): MiddlewareConfig[] {
    return this.sortedMiddlewares
  }

  /**
   * 清空所有中间件
   */
  clear(): void {
    this.middlewares.clear()
    this.sortedMiddlewares = []
  }
}

// ==================== 内置中间件 ====================

/**
 * 认证中间件
 */
export const authMiddleware: MiddlewareConfig = {
  name: 'auth',
  priority: 10,
  handler: async (to, _from, next, context) => {
    if (to.meta?.requiresAuth) {
      // 检查用户是否已登录
      const isAuthenticated = context.user || localStorage.getItem('token')

      if (!isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }
    }
    next()
  },
  condition: route => route.meta?.requiresAuth === true,
}

/**
 * 权限中间件
 */
export const permissionMiddleware: MiddlewareConfig = {
  name: 'permission',
  priority: 20,
  handler: async (to, _from, next, context) => {
    const requiredPermissions = to.meta?.permissions as string[]

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = context.permissions || []
      const hasPermission = requiredPermissions.some(
        permission => userPermissions.includes(permission),
      )

      if (!hasPermission) {
        next({ name: 'Forbidden' })
        return
      }
    }
    next()
  },
  condition: route => Array.isArray(route.meta?.permissions),
}

/**
 * 角色中间件
 */
export const roleMiddleware: MiddlewareConfig = {
  name: 'role',
  priority: 15,
  handler: async (to, _from, next, context) => {
    const requiredRoles = to.meta?.roles as string[]

    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = context.user?.role

      if (!userRole || !requiredRoles.includes(userRole)) {
        next({ name: 'Unauthorized' })
        return
      }
    }
    next()
  },
  condition: route => Array.isArray(route.meta?.roles),
}

/**
 * 日志中间件
 */
export const loggingMiddleware: MiddlewareConfig = {
  name: 'logging',
  priority: 1,
  handler: async (to, from, next, _context) => {
    const startTime = performance.now()
    logger.info(`[Navigation] ${from.path} -> ${to.path}`)
    
    // 继续执行
    next()

    // 记录导航完成时间
    const endTime = performance.now()
    const duration = endTime - startTime
    logger.info(`[Navigation Complete] ${to.path} (${duration.toFixed(2)}ms)`)
  },
}

/**
 * 页面标题中间件
 */
export const titleMiddleware: MiddlewareConfig = {
  name: 'title',
  priority: 90,
  handler: async (to, _from, next, _context) => {
    if (to.meta?.title) {
      document.title = to.meta.title
    }
    next()
  },
  condition: route => !!route.meta?.title,
}

/**
 * 进度条中间件
 */
export const progressMiddleware: MiddlewareConfig = {
  name: 'progress',
  priority: 5,
  handler: async (_to, _from, next, _context) => {
    // 显示进度条
    const progressBar = document.getElementById('router-progress')
    if (progressBar) {
      progressBar.style.display = 'block'
      progressBar.style.width = '30%'
    }

    next()

    // 隐藏进度条
    setTimeout(() => {
      if (progressBar) {
        progressBar.style.width = '100%'
        setTimeout(() => {
          progressBar.style.display = 'none'
          progressBar.style.width = '0%'
        }, 200)
      }
    }, 100)
  },
}

// ==================== 中间件工厂函数 ====================

/**
 * 创建缓存中间件
 */
export function createCacheMiddleware(options: {
  maxAge?: number
  exclude?: string[]
}): MiddlewareConfig {
  const cache = new Map<string, { data: any, timestamp: number }>()
  const maxAge = options.maxAge || 5 * 60 * 1000 // 5分钟

  return {
    name: 'cache',
    priority: 30,
    handler: async (to, _from, next, context) => {
      const cacheKey = to.fullPath
      const cached = cache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < maxAge) {
        context.data.cached = cached.data
      }

      next()

      // 缓存路由数据
      if (!options.exclude?.includes(to.name as string)) {
        cache.set(cacheKey, {
          data: context.data,
          timestamp: Date.now(),
        })
      }
    },
  }
}

/**
 * 创建限流中间件
 */
export function createRateLimitMiddleware(options: {
  maxRequests: number
  windowMs: number
}): MiddlewareConfig {
  const requests = new Map<string, number[]>()

  return {
    name: 'rateLimit',
    priority: 5,
    handler: async (to, _from, next, _context) => {
      const key = to.path
      const now = Date.now()
      const windowStart = now - options.windowMs

      // 清理过期记录
      const userRequests = requests.get(key) || []
      const validRequests = userRequests.filter(time => time > windowStart)

      if (validRequests.length >= options.maxRequests) {
        next(new Error('请求过于频繁，请稍后再试'))
        return
      }

      validRequests.push(now)
      requests.set(key, validRequests)

      next()
    },
  }
}

// 导出默认中间件管理器实例
export const middlewareManager = new MiddlewareManager()

// 注册内置中间件
middlewareManager.registerMultiple([
  loggingMiddleware,
  progressMiddleware,
  authMiddleware,
  roleMiddleware,
  permissionMiddleware,
  titleMiddleware,
])

// ==================== 新增：Koa 风格中间件系统 ====================

export {
  createAuthMiddleware as createAuthMiddlewareV2,
  // 内置中间件
  createLoggerMiddleware,
  createMiddlewareComposer,
  createPerformanceMiddleware,
  createPermissionMiddleware,
  createProgressMiddleware as createProgressMiddlewareV2,
  createRouteContext,
  createScrollMiddleware,
  createTitleMiddleware as createTitleMiddlewareV2,
  MiddlewareComposer,
} from './route-middleware'

export type {
  MiddlewareConfig as MiddlewareConfigV2,
  MiddlewareWrapper,
  RouteContext,
  RouteMiddleware,
} from './route-middleware'
