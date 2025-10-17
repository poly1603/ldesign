/**
 * @ldesign/router 组合式 API
 *
 * 提供便捷的 Vue 3 Composition API 钩子函数
 */

import type { ComputedRef, Ref } from 'vue'
import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  RouteParams,
  RouteQuery,
  Router,
  RouteRecordNormalized,
  UseRouteReturn,
  UseRouterReturn,
} from '../types'
import {
  computed,
  inject,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  ref,
} from 'vue'
import {
  ROUTE_INJECTION_SYMBOL,
  ROUTER_INJECTION_SYMBOL,
} from '../core/constants'

// ==================== 核心组合式 API ====================

/**
 * 获取路由器实例（增强版）
 */
export function useRouter(): UseRouterReturn & {
  // 新增的便捷方法
  isNavigating: ComputedRef<boolean>
  canGoBack: ComputedRef<boolean>
  canGoForward: ComputedRef<boolean>
  routeHistory: ComputedRef<RouteLocationNormalized[]>
  goHome: () => Promise<void>
  reload: () => Promise<void>
  prefetch: (to: RouteLocationRaw) => Promise<void>
} {
  const router = inject<Router>(ROUTER_INJECTION_SYMBOL)

  if (!router) {
    throw new Error(
      'useRouter() can only be used inside a component that has a router instance',
    )
  }

  // 导航状态跟踪
  const isNavigating = ref(false)
  const routeHistory = ref<RouteLocationNormalized[]>([])

  // 增强的路由器对象 - 使用 Object.create 保留原型链
  const enhancedRouter = Object.create(router) as any

  // 添加增强属性
  Object.assign(enhancedRouter, {
    // 导航状态
    isNavigating: computed(() => isNavigating.value),

    // 历史导航能力
    canGoBack: computed(() => window.history.length > 1),
    canGoForward: computed(() => {
      // 浏览器没有直接的 API 判断是否可以前进
      // 这里简单返回 false，实际项目中可能需要自己维护历史栈
      return false
    }),

    // 路由历史
    routeHistory: computed(() => routeHistory.value),

    // 便捷方法：回到首页
    goHome: async () => {
      isNavigating.value = true
      try {
        await router.push('/')
      } finally {
        isNavigating.value = false
      }
    },

    // 便捷方法：刷新当前路由
    reload: async () => {
      const currentRoute = router.currentRoute.value
      isNavigating.value = true
      try {
        await router.replace({ path: '/redirect', query: { to: currentRoute.fullPath } })
        await router.replace(currentRoute.fullPath)
      } finally {
        isNavigating.value = false
      }
    },

    // 预取路由
    prefetch: async (to: RouteLocationRaw) => {
      try {
        const route = router.resolve(to)
        const matched = route.matched[route.matched.length - 1]
        const component = matched?.components?.default

        if (component && typeof component === 'function') {
          await (component as () => Promise<any>)()
        }
      } catch (error) {
        console.warn('路由预取失败:', error)
      }
    },
  })

  // 包装原始的 push 和 replace 方法以跟踪导航状态
  const originalPush = router.push.bind(router)
  const originalReplace = router.replace.bind(router)

  enhancedRouter.push = async (...args: Parameters<typeof router.push>) => {
    isNavigating.value = true
    try {
      const result = await originalPush(...args)
      // 添加到历史记录
      routeHistory.value.push(router.currentRoute.value)
      // 限制历史记录长度
      if (routeHistory.value.length > 50) {
        routeHistory.value.shift()
      }
      return result
    } finally {
      isNavigating.value = false
    }
  }

  enhancedRouter.replace = async (...args: Parameters<typeof router.replace>) => {
    isNavigating.value = true
    try {
      return await originalReplace(...args)
    } finally {
      isNavigating.value = false
    }
  }

  return enhancedRouter as any
}

/**
 * 获取当前路由信息（增强版）
 */
export function useRoute(): UseRouteReturn & {
  // 新增的便捷属性和方法
  isHome: ComputedRef<boolean>
  isNotFound: ComputedRef<boolean>
  breadcrumbs: ComputedRef<Array<{ name: string; path: string; meta: any }>>
  parent: ComputedRef<RouteRecordNormalized | undefined>
  hasParams: ComputedRef<boolean>
  hasQuery: ComputedRef<boolean>
  paramKeys: ComputedRef<string[]>
  queryKeys: ComputedRef<string[]>
  matchedNames: ComputedRef<string[]>
  depth: ComputedRef<number>
  is: (name: string | string[]) => boolean
  getParam: (key: string, defaultValue?: any) => any
  getQuery: (key: string, defaultValue?: any) => any
} {
  const route = inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)

  if (!route) {
    throw new Error(
      'useRoute() can only be used inside a component that has a router instance',
    )
  }

  const currentRoute = computed(() => {
    // 确保路由对象始终有效，防止初始化时的 undefined 访问
    const r = route.value
    if (!r) {
      // 返回一个安全的默认路由对象
      return {
        path: '/',
        name: '',
        params: {},
        query: {},
        hash: '',
        fullPath: '/',
        matched: [],
        meta: {},
      } as RouteLocationNormalized
    }
    return r
  })

  // 创建增强的路由对象
  const enhancedRoute = computed(() => ({
    ...currentRoute.value,

    // 判断是否是首页
    isHome: computed(() => currentRoute.value.path === '/'),

    // 判断是否是 404 页面
    isNotFound: computed(() =>
      currentRoute.value.name === 'NotFound' ||
      currentRoute.value.matched.length === 0
    ),

    // 生成面包屑
    breadcrumbs: computed(() => {
      return currentRoute.value.matched.map(record => ({
        name: record.name as string || '',
        path: record.path,
        meta: record.meta || {},
      }))
    }),

    // 获取父路由
    parent: computed(() => {
      const matched = currentRoute.value.matched
      return matched.length > 1 ? matched[matched.length - 2] : undefined
    }),

    // 判断是否有参数
    hasParams: computed(() => Object.keys(currentRoute.value.params).length > 0),

    // 判断是否有查询参数
    hasQuery: computed(() => Object.keys(currentRoute.value.query).length > 0),

    // 获取所有参数键
    paramKeys: computed(() => Object.keys(currentRoute.value.params)),

    // 获取所有查询参数键
    queryKeys: computed(() => Object.keys(currentRoute.value.query)),

    // 获取匹配的路由名称
    matchedNames: computed(() =>
      currentRoute.value.matched
        .map(r => r.name)
        .filter(Boolean) as string[]
    ),

    // 获取路由深度
    depth: computed(() => currentRoute.value.matched.length),

    // 检查是否是指定路由
    is: (name: string | string[]): boolean => {
      const names = Array.isArray(name) ? name : [name]
      return names.includes(currentRoute.value.name as string)
    },

    // 获取单个参数
    getParam: (key: string, defaultValue?: any) => {
      return currentRoute.value.params[key] ?? defaultValue
    },

    // 获取单个查询参数
    getQuery: (key: string, defaultValue?: any) => {
      return currentRoute.value.query[key] ?? defaultValue
    },
  }))

  return enhancedRoute.value as any
}

// ==================== 路由参数相关 API ====================

/**
 * 获取路由参数
 */
export function useParams(): ComputedRef<RouteParams> {
  const route = useRoute()
  return computed(() => route.value.params)
}

/**
 * 获取查询参数
 */
export function useQuery(): ComputedRef<RouteQuery> {
  const route = useRoute()
  return computed(() => route.value.query)
}

/**
 * 获取哈希值
 */
export function useHash(): ComputedRef<string> {
  const route = useRoute()
  return computed(() => route.value.hash)
}

/**
 * 获取路由元信息
 */
export function useMeta(): ComputedRef<RouteMeta> {
  const route = useRoute()
  return computed(() => route.value.meta)
}

/**
 * 获取匹配的路由记录
 */
export function useMatched(): ComputedRef<RouteRecordNormalized[]> {
  const route = useRoute()
  return computed(() => route.value.matched)
}

// ==================== 导航相关 API ====================

/**
 * 导航控制钩子
 */
export function useNavigation() {
  const router = useRouter()

  // 创建导航状态的响应式引用
  const isNavigating = ref(false)
  const direction = ref<'forward' | 'backward' | 'unknown'>('unknown')
  const lastNavigationTime = ref(0)

  return {
    /**
     * 导航到指定路由
     */
    push: router.push.bind(router),

    /**
     * 替换当前路由
     */
    replace: router.replace.bind(router),

    /**
     * 历史导航
     */
    go: router.go.bind(router),

    /**
     * 后退
     */
    back: router.back.bind(router),

    /**
     * 前进
     */
    forward: router.forward.bind(router),

    /**
     * 导航状态
     */
    isNavigating: computed(() => isNavigating.value),
    direction: computed(() => direction.value),
    lastNavigationTime: computed(() => lastNavigationTime.value),
  }
}

// ==================== 路由守卫相关 API ====================

/**
 * 组件内路由更新守卫
 */
export function onBeforeRouteUpdate(guard: NavigationGuard): void {
  const router = useRouter()
  const route = useRoute()

  let removeGuard: (() => void) | undefined

  const setupGuard = () => {
    removeGuard = router.beforeEach((to, from, next) => {
      // 只在当前组件的路由更新时触发
      const lastMatchedRecord = route.value.matched[route.value.matched.length - 1]
      if (
        lastMatchedRecord && to.matched.includes(lastMatchedRecord)
      ) {
        guard(to, from, next)
      }
      else {
        next()
      }
    })
  }

  const cleanupGuard = () => {
    if (removeGuard) {
      removeGuard()
      removeGuard = undefined
    }
  }

  // 在组件激活时设置守卫
  onActivated(setupGuard)

  // 在组件失活时清理守卫
  onDeactivated(cleanupGuard)

  // 在组件卸载时清理守卫
  onBeforeUnmount(cleanupGuard)

  // 立即设置守卫（如果组件已经激活）
  setupGuard()
}

/**
 * 组件内路由离开守卫
 */
export function onBeforeRouteLeave(guard: NavigationGuard): void {
  const router = useRouter()
  const route = useRoute()

  let removeGuard: (() => void) | undefined

  const setupGuard = () => {
    removeGuard = router.beforeEach((to, from, next) => {
      // 只在离开当前组件的路由时触发
      const lastMatchedRecord = route.value.matched[route.value.matched.length - 1]
      if (
        lastMatchedRecord
        && from.matched.includes(lastMatchedRecord)
        && !to.matched.includes(lastMatchedRecord)
      ) {
        guard(to, from, next)
      }
      else {
        next()
      }
    })
  }

  const cleanupGuard = () => {
    if (removeGuard) {
      removeGuard()
      removeGuard = undefined
    }
  }

  // 在组件激活时设置守卫
  onActivated(setupGuard)

  // 在组件失活时清理守卫
  onDeactivated(cleanupGuard)

  // 在组件卸载时清理守卫
  onBeforeUnmount(cleanupGuard)

  // 立即设置守卫（如果组件已经激活）
  setupGuard()
}

// ==================== 链接相关 API ====================

/**
 * 链接属性和方法
 */
export interface UseLinkOptions {
  to: ComputedRef<RouteLocationRaw> | RouteLocationRaw
  replace?: boolean
}

/**
 * 链接返回值
 */
export interface UseLinkReturn {
  href: ComputedRef<string>
  route: ComputedRef<RouteLocationNormalized>
  isActive: ComputedRef<boolean>
  isExactActive: ComputedRef<boolean>
  navigate: (e?: Event) => Promise<void>
}

/**
 * 链接功能钩子
 */
export function useLink(options: UseLinkOptions): UseLinkReturn {
  const router = useRouter()
  const currentRoute = useRoute()

  const to = computed(() => {
    if (!options.to) {
      return ''
    }
    if (typeof options.to === 'string') {
      return options.to
    }
    else if (typeof options.to === 'object' && options.to && 'value' in options.to) {
      // ComputedRef<RouteLocationRaw>
      return options.to.value
    }
    else {
      // RouteLocationRaw (object)
      return options.to
    }
  })

  const route = computed(() => {
    return router.resolve(to.value, currentRoute.value)
  })

  const href = computed(() => {
    return route.value?.fullPath || '#'
  })

  const isActive = computed(() => {
    if (!route.value || !currentRoute.value) return false
    return currentRoute.value.path.startsWith(route.value.path)
  })

  const isExactActive = computed(() => {
    if (!route.value || !currentRoute.value) return false
    return (
      currentRoute.value.path === route.value.path
      && JSON.stringify(currentRoute.value.query)
      === JSON.stringify(route.value.query)
      && currentRoute.value.hash === route.value.hash
    )
  })

  const navigate = async (e?: Event) => {
    if (e) {
      e.preventDefault()
    }

    if (options.replace) {
      await router.replace(to.value)
    }
    else {
      await router.push(to.value)
    }
  }

  return {
    href,
    route,
    isActive,
    isExactActive,
    navigate,
  }
}

// ==================== 工具函数 ====================

/**
 * 检查是否在路由器上下文中
 */
export function hasRouter(): boolean {
  try {
    inject<Router>(ROUTER_INJECTION_SYMBOL)
    return true
  }
  catch {
    return false
  }
}

/**
 * 检查是否在路由上下文中
 */
export function hasRoute(): boolean {
  try {
    inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)
    return true
  }
  catch {
    return false
  }
}

// ==================== 默认导出 ====================

export default {
  useRouter,
  useRoute,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useMatched,
  useNavigation,
  useLink,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  hasRouter,
  hasRoute,
}

// ==================== 设备适配 Composables ====================

// 设备组件解析功能
export { useDeviceComponent } from './useDeviceComponent'
export type {
  // UseDeviceComponentOptions,
  // UseDeviceComponentReturn,
} from './useDeviceComponent'

// 设备路由功能
export { useDeviceRoute } from './useDeviceRoute'
export type {
  UseDeviceRouteOptions,
  UseDeviceRouteReturn,
} from './useDeviceRoute'
