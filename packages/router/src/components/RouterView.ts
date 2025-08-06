import type {
  Component,
  Ref,
} from 'vue'
import type {
  RouteComponent,
  RouteLocationNormalized,
} from '../types'
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  inject,
} from 'vue'
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
    const injectedRoute = inject<Ref<RouteLocationNormalized>>('route')

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
        return slots.default?.({ Component: null, route: currentRoute }) || null
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
    // 检查是否是异步组件函数
    try {
      const result = (component as () => Promise<Component>)()
      if (result && typeof result.then === 'function') {
        // 使用Vue的defineAsyncComponent处理异步组件
        return defineAsyncComponent(component as () => Promise<Component>)
      }
      return result as Component
    }
    catch {
      // 如果调用失败，可能是普通的函数组件
      return component as Component
    }
  }

  return component as Component
}

export default RouterView
