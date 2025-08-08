import type {
  Ref,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
} from '../types'
import { isSameRouteLocation, warn } from '../utils'

// Vue 类型定义
export type PropType<_T = any> = any
export interface SetupContext {
  attrs: any
  slots: any
  emit: any
}

// Vue 兼容性导入 - 延迟加载
let vueComputed: any
let vueDefineComponent: any
let vueH: any
let vueInject: any

function initVue() {
  if (vueComputed && vueDefineComponent && vueH && vueInject) return

  try {
    // 尝试从全局获取 Vue
    const vue = (globalThis as any).Vue || (window as any).Vue
    if (vue) {
      vueComputed = vue.computed
      vueDefineComponent = vue.defineComponent
      vueH = vue.h
      vueInject = vue.inject
      return
    }

    // 尝试 require 导入
    // eslint-disable-next-line ts/no-require-imports
    const vueModule = require('vue')
    vueComputed = vueModule.computed
    vueDefineComponent = vueModule.defineComponent
    vueH = vueModule.h
    vueInject = vueModule.inject
  } catch {
    // 如果 Vue 不可用，使用模拟函数
    vueComputed = (fn: () => any) => ({ value: fn() })
    vueDefineComponent = (options: any) => options
    vueH = (tag: any, props?: any, children?: any) => ({ tag, props, children })
    vueInject = (_key: any, defaultValue?: any): any => defaultValue
  }
}

/**
 * RouterLink 组件
 * 用于创建导航链接
 */
export const RouterLink = (() => {
  initVue()
  return vueDefineComponent({
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
    setup(props: any, { slots, attrs }: SetupContext) {
      const router = vueInject('router') as Router
      const currentRoute = vueInject('route') as Ref<RouteLocationNormalized>

      if (!router || !currentRoute) {
        warn('RouterLink must be used within a router context')
        return () => null
      }

      // 解析目标路由
      const resolvedRoute = vueComputed(() => {
        try {
          return router.resolve(props.to, currentRoute.value)
        } catch (error) {
          warn(`Failed to resolve route: ${error}`)
          return null
        }
      })

      // 计算 href
      const href = vueComputed(() => {
        const resolved = resolvedRoute.value
        return resolved ? resolved.href : '#'
      })

      // 计算是否激活
      const isActive = vueComputed(() => {
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
      const isExactActive = vueComputed(() => {
        const resolved = resolvedRoute.value
        const current = currentRoute.value

        if (!resolved) return false

        return isSameRouteLocation(resolved, current)
      })

      // 计算类名
      const classes = vueComputed(() => {
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
        const eventListeners: Record<string, (e: Event) => void> = {}
        const events = Array.isArray(props.event) ? props.event : [props.event]

        events.forEach((event: string) => {
          eventListeners[
            `on${event.charAt(0).toUpperCase() + event.slice(1)}`
          ] = (e: Event) => navigate(e)
        })

        // 创建元素属性
        const elementAttrs = {
          ...attrs,
          ...eventListeners,
          class: [...(attrs.class ? [attrs.class] : []), ...classes.value],
          href: props.tag === 'a' ? href.value : undefined,
          'aria-current': isExactActive.value ? 'page' : undefined,
        }

        return vueH(props.tag, elementAttrs, slots.default?.())
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
})()

export default RouterLink
