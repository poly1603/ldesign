/**
 * @ldesign/router 路由守卫
 *
 * 提供常用的路由守卫实现
 */

import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteLocationRaw,
} from '../types'

// ==================== 权限守卫 ====================

/**
 * 权限检查函数类型
 */
export type PermissionChecker = (
  permissions: string | string[],
  route: RouteLocationNormalized
) => boolean | Promise<boolean>

/**
 * 权限守卫选项
 */
export interface PermissionGuardOptions {
  /** 权限检查函数 */
  checker: PermissionChecker
  /** 无权限时的重定向路由 */
  redirectTo?: RouteLocationRaw
  /** 无权限时的错误消息 */
  errorMessage?: string
  /** 权限字段名 */
  permissionField?: string
}

/**
 * 创建权限守卫
 */
export function createPermissionGuard(
  options: PermissionGuardOptions,
): NavigationGuard {
  const {
    checker,
    redirectTo = '/login',
    errorMessage = '没有访问权限',
    permissionField = 'requiresAuth',
  } = options

  return async (to, _from, next) => {
    // 检查路由是否需要权限验证
    const requiresPermission = to.matched.some((record) => {
      return record.meta[permissionField] || record.meta.permissions
    })

    if (!requiresPermission) {
      next()
      return
    }

    try {
      // 获取所需权限
      const permissions = to.meta.permissions || to.meta.roles || []

      // 执行权限检查
      const hasPermission = await checker(
        Array.isArray(permissions) ? permissions : [permissions],
        to,
      )

      if (hasPermission) {
        next()
      }
      else {
        console.warn(errorMessage, { route: to.path, permissions })
        next(redirectTo)
      }
    }
    catch (error) {
      console.error('权限检查失败:', error)
      next(redirectTo)
    }
  }
}

// ==================== 认证守卫 ====================

/**
 * 认证检查函数类型
 */
export type AuthChecker = () => boolean | Promise<boolean>

/**
 * 认证守卫选项
 */
export interface AuthGuardOptions {
  /** 认证检查函数 */
  checker: AuthChecker
  /** 未认证时的重定向路由 */
  redirectTo?: RouteLocationRaw
  /** 认证字段名 */
  authField?: string
}

/**
 * 创建认证守卫
 */
export function createAuthGuard(options: AuthGuardOptions): NavigationGuard {
  const { checker, redirectTo = '/login', authField = 'requiresAuth' } = options

  return async (to, _from, next) => {
    // 检查路由是否需要认证
    const requiresAuth = to.matched.some(record => record.meta[authField])

    if (!requiresAuth) {
      next()
      return
    }

    try {
      const isAuthenticated = await checker()

      if (isAuthenticated) {
        next()
      }
      else {
        console.warn('用户未认证，重定向到登录页面')
        next({
          ...(typeof redirectTo === 'object'
            ? redirectTo
            : { path: redirectTo }),
          query: { redirect: to.fullPath },
        } as RouteLocationRaw)
      }
    }
    catch (error) {
      console.error('认证检查失败:', error)
      next(redirectTo)
    }
  }
}

// ==================== 加载守卫 ====================

/**
 * 加载守卫选项
 */
export interface LoadingGuardOptions {
  /** 显示加载状态 */
  showLoading?: (to: RouteLocationNormalized) => void
  /** 隐藏加载状态 */
  hideLoading?: (to: RouteLocationNormalized) => void
  /** 最小加载时间（毫秒） */
  minLoadingTime?: number
}

/**
 * 创建加载守卫
 */
export function createLoadingGuard(options: LoadingGuardOptions = {}): {
  beforeEach: NavigationGuard
  afterEach: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => void
} {
  const { showLoading, hideLoading, minLoadingTime = 300 } = options

  let loadingStartTime = 0

  const beforeEach: NavigationGuard = (to, _from, next) => {
    loadingStartTime = Date.now()

    if (showLoading) {
      showLoading(to)
    }

    next()
  }

  const afterEach = (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
  ) => {
    const loadingTime = Date.now() - loadingStartTime
    const remainingTime = Math.max(0, minLoadingTime - loadingTime)

    setTimeout(() => {
      if (hideLoading) {
        hideLoading(to)
      }
    }, remainingTime)
  }

  return { beforeEach, afterEach }
}

// ==================== 标题守卫 ====================

/**
 * 标题守卫选项
 */
export interface TitleGuardOptions {
  /** 默认标题 */
  defaultTitle?: string
  /** 标题模板 */
  titleTemplate?: (title: string) => string
  /** 标题字段名 */
  titleField?: string
}

/**
 * 创建标题守卫
 */
export function createTitleGuard(
  options: TitleGuardOptions = {},
): NavigationGuard {
  const {
    defaultTitle = '',
    titleTemplate = (title: string) => title,
    titleField = 'title',
  } = options

  return (to, _from, next) => {
    // 获取路由标题
    let title = ''

    // 从匹配的路由记录中查找标题
    for (let i = to.matched.length - 1; i >= 0; i--) {
      const record = to.matched[i]
      if (record && record.meta[titleField]) {
        title = record.meta[titleField] as string
        break
      }
    }

    // 使用默认标题
    if (!title) {
      title = defaultTitle
    }

    // 应用标题模板
    if (title) {
      document.title = titleTemplate(title)
    }

    next()
  }
}

// ==================== 滚动守卫 ====================

/**
 * 滚动守卫选项
 */
export interface ScrollGuardOptions {
  /** 滚动行为 */
  behavior?: 'auto' | 'smooth'
  /** 滚动到顶部 */
  scrollToTop?: boolean
  /** 保存滚动位置 */
  savePosition?: boolean
}

/**
 * 创建滚动守卫
 */
export function createScrollGuard(options: ScrollGuardOptions = {}): {
  beforeEach: NavigationGuard
  afterEach: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => void
} {
  const { behavior = 'auto', scrollToTop = true, savePosition = true } = options

  const savedPositions = new Map<string, { x: number, y: number }>()

  const beforeEach: NavigationGuard = (_to, from, next) => {
    // 保存当前滚动位置
    if (savePosition && from.path !== '/') {
      savedPositions.set(from.fullPath, {
        x: window.scrollX,
        y: window.scrollY,
      })
    }

    next()
  }

  const afterEach = (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
  ) => {
    // 恢复滚动位置或滚动到顶部
    setTimeout(() => {
      const savedPosition = savedPositions.get(to.fullPath)

      if (savedPosition) {
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior,
        })
      }
      else if (scrollToTop) {
        window.scrollTo({
          left: 0,
          top: 0,
          behavior,
        })
      }
    }, 0)
  }

  return { beforeEach, afterEach }
}

// ==================== 进度守卫 ====================

/**
 * 进度守卫选项
 */
export interface ProgressGuardOptions {
  /** 进度条颜色 */
  color?: string
  /** 进度条高度 */
  height?: string
  /** 最小进度时间 */
  minTime?: number
  /** 最大进度时间 */
  maxTime?: number
}

/**
 * 创建进度守卫
 */
export function createProgressGuard(options: ProgressGuardOptions = {}): {
  beforeEach: NavigationGuard
  afterEach: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => void
} {
  const {
    color = '#3b82f6',
    height = '2px',
    minTime = 300,
    maxTime = 3000,
  } = options

  let progressBar: HTMLElement | null = null
  let progressTimer: number | null = null

  const createProgressBar = () => {
    if (progressBar)
      return

    progressBar = document.createElement('div')
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: ${height};
      background-color: ${color};
      transition: width 0.3s ease;
      z-index: 9999;
    `
    document.body.appendChild(progressBar)
  }

  const updateProgress = (percent: number) => {
    if (progressBar) {
      progressBar.style.width = `${percent}%`
    }
  }

  const removeProgressBar = () => {
    if (progressBar) {
      progressBar.remove()
      progressBar = null
    }
    if (progressTimer) {
      clearTimeout(progressTimer)
      progressTimer = null
    }
  }

  const beforeEach: NavigationGuard = (_to, _from, next) => {
    createProgressBar()
    updateProgress(10)

    // 模拟进度增长
    let progress = 10
    const increment = 80 / (maxTime / 100) // 在最大时间内增长到90%

    const timer = setInterval(() => {
      progress += increment
      if (progress >= 90) {
        clearInterval(timer)
        progress = 90
      }
      updateProgress(progress)
    }, 100)

    progressTimer = timer as any

    next()
  }

  const afterEach = (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
  ) => {
    // 完成进度条
    updateProgress(100)

    setTimeout(() => {
      removeProgressBar()
    }, minTime)
  }

  return { beforeEach, afterEach }
}

// ==================== 组合守卫 ====================

/**
 * 组合多个守卫
 */
export function combineGuards(...guards: NavigationGuard[]): NavigationGuard {
  return async (to, from, next) => {
    let index = 0

    const runNext = (result?: any) => {
      if (
        result === false
        || result instanceof Error
        || (result && typeof result === 'object')
      ) {
        next(result)
        return
      }

      if (index >= guards.length) {
        next()
        return
      }

      const guard = guards[index++]
      if (guard) {
        guard(to, from, runNext)
      }
      else {
        runNext()
      }
    }

    runNext()
  }
}

// ==================== 默认导出 ====================

export default {
  createPermissionGuard,
  createAuthGuard,
  createLoadingGuard,
  createTitleGuard,
  createScrollGuard,
  createProgressGuard,
  combineGuards,
}
