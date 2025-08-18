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
 * 获取路由器实例
 */
export function useRouter(): UseRouterReturn {
  const router = inject<Router>(ROUTER_INJECTION_SYMBOL)

  if (!router) {
    throw new Error(
      'useRouter() can only be used inside a component that has a router instance'
    )
  }

  return router as UseRouterReturn
}

/**
 * 获取当前路由信息
 */
export function useRoute(): UseRouteReturn {
  const route = inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)

  if (!route) {
    throw new Error(
      'useRoute() can only be used inside a component that has a router instance'
    )
  }

  return computed(() => {
    // 确保路由对象始终有效，防止初始化时的 undefined 访问
    const currentRoute = route.value
    if (!currentRoute) {
      // 返回一个安全的默认路由对象
      return {
        path: '/',
        name: undefined,
        params: {},
        query: {},
        hash: '',
        fullPath: '/',
        matched: [],
        meta: {},
      } as RouteLocationNormalized
    }
    return currentRoute
  }) as UseRouteReturn
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
      if (
        to.matched.includes(route.value.matched[route.value.matched.length - 1])
      ) {
        guard(to, from, next)
      } else {
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
      if (
        from.matched.includes(
          route.value.matched[route.value.matched.length - 1]
        ) &&
        !to.matched.includes(
          route.value.matched[route.value.matched.length - 1]
        )
      ) {
        guard(to, from, next)
      } else {
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
    if (typeof options.to === 'string') {
      return options.to
    } else if (typeof options.to === 'object' && 'value' in options.to) {
      // ComputedRef<RouteLocationRaw>
      return options.to.value
    } else {
      // RouteLocationRaw (object)
      return options.to
    }
  })

  const route = computed(() => {
    return router.resolve(to.value, currentRoute.value)
  })

  const href = computed(() => {
    return route.value.fullPath
  })

  const isActive = computed(() => {
    return currentRoute.value.path.startsWith(route.value.path)
  })

  const isExactActive = computed(() => {
    return (
      currentRoute.value.path === route.value.path &&
      JSON.stringify(currentRoute.value.query) ===
        JSON.stringify(route.value.query) &&
      currentRoute.value.hash === route.value.hash
    )
  })

  const navigate = async (e?: Event) => {
    if (e) {
      e.preventDefault()
    }

    if (options.replace) {
      await router.replace(to.value)
    } else {
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
  } catch {
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
  } catch {
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
  UseDeviceComponentOptions,
  UseDeviceComponentReturn,
} from './useDeviceComponent'

// 设备路由功能
export { useDeviceRoute } from './useDeviceRoute'
export type {
  UseDeviceRouteOptions,
  UseDeviceRouteReturn,
} from './useDeviceRoute'
