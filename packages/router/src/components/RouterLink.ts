import type { PropType, Ref } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
} from '../types'
import { computed, defineComponent, h, inject } from 'vue'
import { isSameRouteLocation, warn } from '../utils'

/**
 * RouterLink 组件
 * 用于创建导航链接
 */
export const RouterLink = defineComponent({
  name: 'RouterLink',
  inheritAttrs: false,
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
    replace: {
      type: Boolean,
      default: false,
    },
    activeClass: {
      type: String,
      default: 'router-link-active',
    },
    exactActiveClass: {
      type: String,
      default: 'router-link-exact-active',
    },
    exact: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: 'a',
    },
    event: {
      type: [String, Array] as PropType<string | string[]>,
      default: 'click',
    },
    append: {
      type: Boolean,
      default: false,
    },
    custom: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    const router = inject<Router>('router')
    const currentRoute = inject<Ref<RouteLocationNormalized>>('route')

    if (!router || !currentRoute) {
      warn('RouterLink must be used within a router context')
      return () => null
    }

    // 解析目标路由
    const resolvedRoute = computed(() => {
      try {
        return router.resolve(props.to, currentRoute.value)
      } catch (error) {
        warn(`Failed to resolve route: ${error}`)
        return null
      }
    })

    // 计算 href
    const href = computed(() => {
      const resolved = resolvedRoute.value
      return resolved ? resolved.href : '#'
    })

    // 计算是否激活
    const isActive = computed(() => {
      const resolved = resolvedRoute.value
      const current = currentRoute.value

      if (!resolved) return false

      if (props.exact) {
        return isSameRouteLocation(resolved, current)
      }

      // 检查路径是否匹配
      return current.path.startsWith(resolved.path)
    })

    // 计算是否精确激活
    const isExactActive = computed(() => {
      const resolved = resolvedRoute.value
      const current = currentRoute.value

      if (!resolved) return false

      return isSameRouteLocation(resolved, current)
    })

    // 计算类名
    const classes = computed(() => {
      const classList: string[] = []

      if (isActive.value) {
        classList.push(props.activeClass)
      }

      if (isExactActive.value) {
        classList.push(props.exactActiveClass)
      }

      return classList
    })

    // 导航处理函数
    const navigate = (e: Event) => {
      if (guardEvent(e)) {
        const resolved = resolvedRoute.value
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
            router.replace(locationRaw)
          } else {
            router.push(locationRaw)
          }
        }
      }
    }

    return () => {
      const resolved = resolvedRoute.value

      // 如果是自定义渲染
      if (props.custom) {
        return slots.default?.({
          href: href.value,
          route: resolved,
          navigate,
          isActive: isActive.value,
          isExactActive: isExactActive.value,
        })
      }

      // 创建事件监听器
      const eventListeners: Record<string, () => void> = {}
      const events = Array.isArray(props.event) ? props.event : [props.event]

      events.forEach(event => {
        eventListeners[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] =
          navigate
      })

      // 创建元素属性
      const elementAttrs = {
        ...attrs,
        ...eventListeners,
        class: [...(attrs.class ? [attrs.class] : []), ...classes.value],
        href: props.tag === 'a' ? href.value : undefined,
        'aria-current': isExactActive.value ? 'page' : undefined,
      }

      return h(props.tag, elementAttrs, slots.default?.())
    }
  },
})

/**
 * 检查事件是否应该被处理
 */
function guardEvent(e: Event): boolean {
  // 不要重定向带有修饰键的点击
  if (
    (e as MouseEvent).metaKey ||
    (e as MouseEvent).altKey ||
    (e as MouseEvent).ctrlKey ||
    (e as MouseEvent).shiftKey
  ) {
    return false
  }

  // 不要重定向右键点击
  if (
    (e as MouseEvent).button !== undefined &&
    (e as MouseEvent).button !== 0
  ) {
    return false
  }

  // 不要重定向如果 preventDefault 被调用
  if (e.defaultPrevented) {
    return false
  }

  // 不要重定向如果目标是 _blank
  const target = (e.target as HTMLElement)?.getAttribute?.('target')
  if (target && target !== '_self') {
    return false
  }

  e.preventDefault()
  return true
}

export default RouterLink
