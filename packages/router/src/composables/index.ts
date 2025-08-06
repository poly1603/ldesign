import type { ComputedRef } from 'vue'
import type {
  RouteLocationNormalized,
  Router,
} from '../types'
import { computed, inject } from 'vue'
import { warn } from '../utils'

/**
 * 获取当前路由器实例
 */
export function useRouter(): Router {
  const router = inject<Router>('router')

  if (!router) {
    warn('useRouter() must be called within a router context')
    throw new Error('useRouter() must be called within a router context')
  }

  return router
}

/**
 * 获取当前路由信息
 */
export function useRoute(): ComputedRef<RouteLocationNormalized> {
  const route = inject<ComputedRef<RouteLocationNormalized>>('route')

  if (!route) {
    warn('useRoute() must be called within a router context')
    throw new Error('useRoute() must be called within a router context')
  }

  return route
}

/**
 * 获取路由链接信息
 */
export function useLink(props: {
  to: string | object
  replace?: boolean
}) {
  const router = useRouter()
  const currentRoute = useRoute()

  const route = computed(() => {
    try {
      return router.resolve(props.to, currentRoute.value)
    }
    catch (error) {
      warn(`Failed to resolve route: ${error}`)
      return null
    }
  })

  const href = computed(() => {
    const resolved = route.value
    return resolved ? resolved.href : '#'
  })

  const navigate = (e?: Event) => {
    if (e) {
      e.preventDefault()
    }

    const resolved = route.value
    if (resolved) {
      // 转换 RouteLocation 为 RouteLocationRaw
      const locationRaw = {
        name: resolved.name,
        path: resolved.path,
        params: resolved.params,
        query: resolved.query,
        hash: resolved.hash,
      }

      if (props.replace) {
        return router.replace(locationRaw)
      }
      else {
        return router.push(locationRaw)
      }
    }
    return Promise.resolve()
  }

  return {
    route,
    href,
    navigate,
  }
}

/**
 * 监听路由变化
 */
export function onBeforeRouteUpdate(
  updateGuard: (to: RouteLocationNormalized, from: RouteLocationNormalized) => any,
) {
  const router = useRouter()

  // 在组件实例中注册路由守卫
  router.beforeEach((to, from, next) => {
    const result = updateGuard(to, from)
    if (result === false) {
      next(false)
    }
    else if (typeof result === 'string' || typeof result === 'object') {
      next(result)
    }
    else {
      next()
    }
  })
}

/**
 * 离开路由守卫
 */
export function onBeforeRouteLeave(
  leaveGuard: (to: RouteLocationNormalized, from: RouteLocationNormalized) => any,
) {
  const router = useRouter()

  // 在组件实例中注册路由守卫
  router.beforeEach((to, from, next) => {
    const result = leaveGuard(to, from)
    if (result === false) {
      next(false)
    }
    else if (typeof result === 'string' || typeof result === 'object') {
      next(result)
    }
    else {
      next()
    }
  })
}

/**
 * 获取路由参数
 */
export function useParams() {
  const route = useRoute()
  return computed(() => route.value.params)
}

/**
 * 获取路由查询参数
 */
export function useQuery() {
  const route = useRoute()
  return computed(() => route.value.query)
}

/**
 * 获取路由哈希
 */
export function useHash() {
  const route = useRoute()
  return computed(() => route.value.hash)
}

/**
 * 获取路由元信息
 */
export function useMeta() {
  const route = useRoute()
  return computed(() => route.value.meta)
}

/**
 * 获取匹配的路由记录
 */
export function useMatched() {
  const route = useRoute()
  return computed(() => route.value.matched)
}

// 导出所有组合式API
export default {
  useRouter,
  useRoute,
  useLink,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useMatched,
}
