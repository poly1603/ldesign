import type { Ref, RouteComponent, RouteLocationNormalized } from '../types'
import { warn } from '../utils'

// Vue 类型定义
export type Component = any
export interface SetupContext {
  attrs: any
  slots: any
  emit: any
}

// Vue 兼容性导入 - 延迟加载
let vueComputed: any
let vueDefineAsyncComponent: any
let vueDefineComponent: any
let vueH: any
let vueInject: any

function initVue() {
  if (
    vueComputed &&
    vueDefineAsyncComponent &&
    vueDefineComponent &&
    vueH &&
    vueInject
  )
    return

  try {
    // 尝试从全局获取 Vue
    const vue = (globalThis as any).Vue || (window as any).Vue
    if (vue) {
      vueComputed = vue.computed
      vueDefineAsyncComponent = vue.defineAsyncComponent
      vueDefineComponent = vue.defineComponent
      vueH = vue.h
      vueInject = vue.inject
      return
    }

    // 尝试 require 导入
    // eslint-disable-next-line ts/no-require-imports
    const vueModule = require('vue')
    vueComputed = vueModule.computed
    vueDefineAsyncComponent = vueModule.defineAsyncComponent
    vueDefineComponent = vueModule.defineComponent
    vueH = vueModule.h
    vueInject = vueModule.inject
  } catch {
    // 如果 Vue 不可用，使用模拟函数
    vueComputed = (fn: () => any) => ({ value: fn() })
    vueDefineAsyncComponent = (loader: () => Promise<any>) => loader
    vueDefineComponent = (options: any) => options
    vueH = (tag: any, props?: any, children?: any) => ({ tag, props, children })
    vueInject = (_key: any, defaultValue?: any): any => defaultValue
  }
}

/**
 * RouterView 组件
 * 用于渲染匹配的路由组件
 */
export const RouterView = (() => {
  initVue()
  return vueDefineComponent({
    name: 'RouterView',
    inheritAttrs: false,
    props: {
      name: {
        type: String,
        default: 'default',
      },
      route: Object,
    },
    setup(props: any, { attrs, slots }: SetupContext) {
      const injectedRoute = vueInject('route') as Ref<RouteLocationNormalized>

      if (!injectedRoute) {
        warn('RouterView must be used within a router context')
        return () => null
      }

      const route = vueComputed(() => props.route || injectedRoute.value)

      const matchedRoute = vueComputed(() => {
        const matched = route.value.matched
        return matched[matched.length - 1]
      })

      const ViewComponent = vueComputed(() => {
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
          return (
            slots.default?.({ Component: null, route: currentRoute }) || null
          )
        }

        // 处理异步组件
        const resolvedComponent = resolveComponent(component)

        if (!resolvedComponent) {
          return null
        }

        // 创建组件实例
        const componentInstance = vueH(resolvedComponent, {
          ...attrs,
          key: currentRoute.fullPath,
        })

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
          return vueDefineAsyncComponent(component as () => Promise<Component>)
        }
        return result as Component
      } catch {
        // 如果调用失败，可能是普通的函数组件
        return component as Component
      }
    }

    return component as Component
  }
})()

export default RouterView
