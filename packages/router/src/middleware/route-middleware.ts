/**
 * @ldesign/router 路由中间件系统
 *
 * 提供类似 Koa 的洋葱模型中间件机制
 */

import type { RouteLocationNormalized } from '../types'

// ==================== 中间件类型定义 ====================

/**
 * 路由上下文
 * 包含当前导航的所有信息和状态
 */
export interface RouteContext {
  /** 目标路由 */
  to: RouteLocationNormalized
  /** 来源路由 */
  from: RouteLocationNormalized
  /** 导航状态数据 */
  state: Record<string, any>
  /** 是否已中止 */
  aborted: boolean
  /** 重定向目标 */
  redirectTo?: string | RouteLocationNormalized
  /** 错误信息 */
  error?: Error
  /** 开始时间 */
  startTime: number
  /** 元数据 */
  meta: Record<string, any>
}

/**
 * 中间件函数类型
 * @param context - 路由上下文
 * @param next - 下一个中间件
 */
export type RouteMiddleware = (
  context: RouteContext,
  next: () => Promise<void>
) => Promise<void> | void

/**
 * 中间件配置
 */
export interface MiddlewareConfig {
  /** 中间件名称 */
  name?: string
  /** 是否启用 */
  enabled?: boolean
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 应用条件 */
  condition?: (context: RouteContext) => boolean
}

/**
 * 中间件包装器
 */
export interface MiddlewareWrapper {
  /** 中间件函数 */
  middleware: RouteMiddleware
  /** 配置 */
  config: Required<MiddlewareConfig>
}

// ==================== 中间件组合器 ====================

/**
 * 中间件组合器
 * 实现洋葱模型的中间件执行机制
 */
export class MiddlewareComposer {
  private middlewares: MiddlewareWrapper[] = []
  private executionCount: number = 0
  private errorHandlers: Array<(error: Error, context: RouteContext) => void> = []

  /**
   * 注册中间件
   */
  use(middleware: RouteMiddleware, config?: MiddlewareConfig): this {
    const wrapper: MiddlewareWrapper = {
      middleware,
      config: {
        name: config?.name || `middleware_${this.middlewares.length}`,
        enabled: config?.enabled ?? true,
        priority: config?.priority ?? 0,
        condition: config?.condition || (() => true),
      },
    }

    this.middlewares.push(wrapper)

    // 按优先级排序（降序）
    this.middlewares.sort((a, b) => b.config.priority - a.config.priority)

    return this
  }

  /**
   * 批量注册中间件
   */
  useMultiple(middlewares: Array<RouteMiddleware | [RouteMiddleware, MiddlewareConfig]>): this {
    for (const item of middlewares) {
      if (Array.isArray(item)) {
        this.use(item[0], item[1])
      }
      else {
        this.use(item)
      }
    }
    return this
  }

  /**
   * 执行中间件链
   */
  async execute(context: RouteContext): Promise<void> {
    // 过滤出启用且满足条件的中间件
    const activeMiddlewares = this.middlewares.filter(
      wrapper => wrapper.config.enabled && wrapper.config.condition(context),
    )

    if (activeMiddlewares.length === 0) {
      return
    }

    let index = 0
    this.executionCount++

    const dispatch = async (i: number): Promise<void> => {
      // 防止 next() 被多次调用
      if (i <= index && i !== 0) {
        throw new Error(
          `next() called multiple times in middleware "${activeMiddlewares[index - 1]?.config.name}"`,
        )
      }

      // 检查是否已中止
      if (context.aborted) {
        return
      }

      index = i
      const wrapper = activeMiddlewares[i]

      // 所有中间件都已执行完毕
      if (!wrapper) {
        return
      }

      try {
        // 执行当前中间件
        await Promise.resolve(
          wrapper.middleware(context, () => dispatch(i + 1)),
        )
      }
      catch (error) {
        // 错误处理
        this.handleError(error as Error, context)
        throw error
      }
    }

    await dispatch(0)
  }

  /**
   * 注册错误处理器
   */
  onError(handler: (error: Error, context: RouteContext) => void): this {
    this.errorHandlers.push(handler)
    return this
  }

  /**
   * 处理错误
   */
  private handleError(error: Error, context: RouteContext): void {
    context.error = error

    for (const handler of this.errorHandlers) {
      try {
        handler(error, context)
      }
      catch (handlerError) {
        console.error('Error in middleware error handler:', handlerError)
      }
    }
  }

  /**
   * 移除中间件
   */
  remove(name: string): boolean {
    const index = this.middlewares.findIndex(w => w.config.name === name)
    if (index !== -1) {
      this.middlewares.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 清空所有中间件
   */
  clear(): void {
    this.middlewares = []
    this.errorHandlers = []
  }

  /**
   * 获取中间件列表
   */
  getMiddlewares(): MiddlewareWrapper[] {
    return [...this.middlewares]
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalMiddlewares: this.middlewares.length,
      activeMiddlewares: this.middlewares.filter(w => w.config.enabled).length,
      executionCount: this.executionCount,
    }
  }
}

// ==================== 内置中间件 ====================

/**
 * 日志中间件
 */
export function createLoggerMiddleware(options?: {
  /** 是否记录详细信息 */
  verbose?: boolean
  /** 自定义日志函数 */
  logger?: (message: string, data?: any) => void
}): RouteMiddleware {
  const verbose = options?.verbose ?? false
  const logger = options?.logger || console.info

  return async (context, next) => {
    const start = Date.now()

    logger(
      `🚀 Navigation: ${context.from.path} → ${context.to.path}`,
      verbose ? context : undefined,
    )

    await next()

    const duration = Date.now() - start
    logger(
      `✅ Navigation completed in ${duration}ms`,
      verbose ? { duration, path: context.to.path } : undefined,
    )
  }
}

/**
 * 性能监控中间件
 */
export function createPerformanceMiddleware(options?: {
  /** 慢导航阈值（毫秒） */
  threshold?: number
  /** 慢导航回调 */
  onSlow?: (duration: number, context: RouteContext) => void
}): RouteMiddleware {
  const threshold = options?.threshold ?? 500

  return async (context, next) => {
    const start = performance.now()

    await next()

    const duration = performance.now() - start

    if (duration > threshold) {
      options?.onSlow?.(duration, context)
      console.warn(
        `⚠️ Slow navigation detected: ${context.to.path} took ${duration.toFixed(2)}ms`,
      )
    }

    // 记录到 context.meta
    context.meta.navigationDuration = duration
  }
}

/**
 * 认证中间件
 */
export function createAuthMiddleware(options: {
  /** 检查认证状态 */
  checkAuth: () => boolean | Promise<boolean>
  /** 未认证时的重定向路径 */
  redirectTo?: string
  /** 需要认证的路由判断 */
  requiresAuth?: (context: RouteContext) => boolean
}): RouteMiddleware {
  const { checkAuth, redirectTo = '/login', requiresAuth } = options

  return async (context, next) => {
    // 判断是否需要认证
    const needsAuth = requiresAuth
      ? requiresAuth(context)
      : context.to.meta?.requiresAuth === true

    if (!needsAuth) {
      await next()
      return
    }

    // 检查认证状态
    const isAuthenticated = await Promise.resolve(checkAuth())

    if (!isAuthenticated) {
      // 未认证，重定向到登录页
      context.aborted = true
      context.redirectTo = redirectTo
      return
    }

    await next()
  }
}

/**
 * 权限检查中间件
 */
export function createPermissionMiddleware(options: {
  /** 检查权限 */
  checkPermission: (permissions: string[]) => boolean | Promise<boolean>
  /** 权限不足时的重定向路径 */
  redirectTo?: string
  /** 获取所需权限 */
  getRequiredPermissions?: (context: RouteContext) => string[]
}): RouteMiddleware {
  const { checkPermission, redirectTo = '/403', getRequiredPermissions } = options

  return async (context, next) => {
    // 获取所需权限
    const requiredPermissions = getRequiredPermissions
      ? getRequiredPermissions(context)
      : (context.to.meta?.permissions as string[] | undefined)

    if (!requiredPermissions || requiredPermissions.length === 0) {
      await next()
      return
    }

    // 检查权限
    const hasPermission = await Promise.resolve(
      checkPermission(requiredPermissions),
    )

    if (!hasPermission) {
      // 权限不足
      context.aborted = true
      context.redirectTo = redirectTo
      return
    }

    await next()
  }
}

/**
 * 页面标题中间件
 */
export function createTitleMiddleware(options?: {
  /** 默认标题 */
  defaultTitle?: string
  /** 标题后缀 */
  suffix?: string
  /** 标题前缀 */
  prefix?: string
}): RouteMiddleware {
  const { defaultTitle = '', suffix = '', prefix = '' } = options || {}

  return async (context, next) => {
    await next()

    // 只在客户端设置标题
    if (typeof document !== 'undefined') {
      const title = context.to.meta?.title as string | undefined
      const fullTitle = title
        ? `${prefix}${title}${suffix}`
        : `${prefix}${defaultTitle}${suffix}`

      document.title = fullTitle
    }
  }
}

/**
 * 进度条中间件
 */
export function createProgressMiddleware(options?: {
  /** 进度条颜色 */
  color?: string
  /** 进度条高度 */
  height?: string
  /** 显示延迟（毫秒） */
  showDelay?: number
}): RouteMiddleware {
  let progressBar: HTMLElement | null = null

  return async (_context, next) => {
    const showDelay = options?.showDelay ?? 200

    // 延迟显示进度条
    const timer = setTimeout(() => {
      if (typeof document !== 'undefined' && !progressBar) {
        progressBar = document.createElement('div')
        progressBar.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 0%;
          height: ${options?.height || '2px'};
          background: ${options?.color || '#4CAF50'};
          transition: width 0.3s;
          z-index: 9999;
        `
        document.body.appendChild(progressBar)

        // 开始进度
        setTimeout(() => {
          if (progressBar) {
            progressBar.style.width = '70%'
          }
        }, 10)
      }
    }, showDelay)

    try {
      await next()

      // 完成进度
      if (progressBar) {
        progressBar.style.width = '100%'
        setTimeout(() => {
          if (progressBar) {
            progressBar.remove()
            progressBar = null
          }
        }, 300)
      }
    }
    catch (error) {
      // 出错时也移除进度条
      if (progressBar) {
        progressBar.remove()
        progressBar = null
      }
      throw error
    }
    finally {
      clearTimeout(timer)
    }
  }
}

/**
 * 滚动行为中间件
 */
export function createScrollMiddleware(options?: {
  /** 滚动行为 */
  behavior?: 'auto' | 'smooth'
  /** 滚动位置 */
  position?: 'top' | 'saved' | { x: number, y: number }
}): RouteMiddleware {
  const scrollPositions = new Map<string, { x: number, y: number }>()

  return async (context, next) => {
    // 保存当前滚动位置
    if (typeof window !== 'undefined') {
      const key = context.from.fullPath || context.from.path
      scrollPositions.set(key, {
        x: window.scrollX,
        y: window.scrollY,
      })
    }

    await next()

    // 恢复或设置滚动位置
    if (typeof window !== 'undefined') {
      const behavior = options?.behavior || 'auto'

      let scrollTo: { x: number, y: number } | undefined

      if (options?.position === 'saved') {
        const key = context.to.fullPath || context.to.path
        scrollTo = scrollPositions.get(key)
      }
      else if (options?.position && typeof options.position === 'object') {
        scrollTo = options.position
      }
      else {
        scrollTo = { x: 0, y: 0 }
      }

      if (scrollTo) {
        window.scrollTo({
          left: scrollTo.x,
          top: scrollTo.y,
          behavior: behavior as ScrollBehavior,
        })
      }
    }
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建中间件组合器实例
 */
export function createMiddlewareComposer(): MiddlewareComposer {
  return new MiddlewareComposer()
}

/**
 * 创建路由上下文
 */
export function createRouteContext(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
): RouteContext {
  return {
    to,
    from,
    state: {},
    aborted: false,
    startTime: Date.now(),
    meta: {},
  }
}

// ==================== 导出 ====================

export {
  MiddlewareComposer as default,
}
