import type {
  Component,
} from 'vue'
import {
  computed,
  defineComponent,
  h,
  inject,
} from 'vue'
import type {
  RouteComponent,
  RouteLocationNormalized,
  Router,
} from '../types'
import { warn } from '../utils'

/**
 * RouterView 组件
 * 用于渲染匹配的路由组件
 */
export const RouterView = defineComponent({
  name: 'RouterView',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: 'default',
    },
    route: Object,
  },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject<RouteLocationNormalized>('route')
    const injectedRouter = inject<Router>('router')

    if (!injectedRoute) {
      warn('RouterView must be used within a router context')
      return () => null
    }

    const route = computed(() => props.route || injectedRoute.value)

    const matchedRoute = computed(() => {
      const matched = route.value.matched
      return matched[matched.length - 1]
    })

    const ViewComponent = computed(() => {
      const matched = matchedRoute.value
      if (!matched) {
        return null
      }

      const components = matched.components
      if (!components) {
        return null
      }

      return components[props.name] || components.default
    })

    return () => {
      const component = ViewComponent.value
      const currentRoute = route.value

      if (!component) {
        return slots.default?.({ Component: null, route: currentRoute })
      }

      // 处理异步组件
      const resolvedComponent = resolveComponent(component)

      if (!resolvedComponent) {
        return null
      }

      // 创建组件实例
      const componentInstance = h(
        resolvedComponent,
        {
          ...attrs,
          key: currentRoute.fullPath,
        },
      )

      // 如果有插槽，使用插槽渲染
      if (slots.default) {
        return slots.default({
          Component: componentInstance,
          route: currentRoute,
        })
      }

      return componentInstance
    }
  },
})

/**
 * 解析组件
 */
function resolveComponent(component: RouteComponent): Component | null {
  if (typeof component === 'function') {
    // 处理异步组件
    const result = component()
    if (result && typeof result.then === 'function') {
      // 返回 Promise 的异步组件
      return defineComponent({
        async setup() {
          try {
            const resolved = await result
            return () => h(resolved.default || resolved)
          }
          catch (error) {
            warn(`Failed to load async component: ${error}`)
            return () => null
          }
        },
      })
    }
    return result as Component
  }

  return component as Component
}

export default RouterView
