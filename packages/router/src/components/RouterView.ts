import type { Component } from 'vue'
import type { Ref, RouteComponent, RouteLocationNormalized } from '../types'
import type { ComponentEnhancementConfig } from './types'
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  inject,
  KeepAlive,
  onMounted,
  ref,
  Suspense,
  Transition,
} from 'vue'
import { warn } from '../utils'

// Vue 类型定义
export interface SetupContext {
  attrs: Record<string, unknown>
  slots: Record<string, (...args: unknown[]) => any[]>
  emit: (event: string, ...args: unknown[]) => void
}

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

    // 增强属性
    transition: {
      type: [String, Object],
      default: 'fade',
    },
    transitionMode: {
      type: String,
      default: 'out-in',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingComponent: {
      type: Object,
      default: undefined,
    },
    errorComponent: {
      type: Object,
      default: undefined,
    },
    emptyComponent: {
      type: Object,
      default: undefined,
    },
    keepAlive: {
      type: Boolean,
      default: false,
    },
    keepAliveInclude: {
      type: [String, RegExp, Array],
      default: undefined,
    },
    keepAliveExclude: {
      type: [String, RegExp, Array],
      default: undefined,
    },
    keepAliveMax: {
      type: Number,
      default: undefined,
    },
    requireAuth: {
      type: Boolean,
      default: false,
    },
    fallbackComponent: {
      type: Object,
      default: undefined,
    },
    layout: {
      type: String,
      default: undefined,
    },
    layoutProps: {
      type: Object,
      default: () => ({}),
    },
    trackPerformance: {
      type: Boolean,
      default: false,
    },
    errorBoundary: {
      type: Boolean,
      default: true,
    },
    scrollToTop: {
      type: Boolean,
      default: false,
    },
    scrollBehavior: {
      type: String,
      default: 'auto',
    },
    updateTitle: {
      type: Boolean,
      default: false,
    },
    showProgress: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['performance', 'error', 'transition-start', 'transition-end'],
  setup(props: any, { attrs, slots, emit }: any) {
    const injectedRoute = inject('route') as Ref<RouteLocationNormalized>
    const config = inject('routerEnhancementConfig') as
      | ComponentEnhancementConfig
      | undefined

    // 状态管理
    const error = ref<Error | null>(null)
    const isLoading = ref(false)
    const performanceStart = ref<number>(0)

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

      return components[props.name || 'default'] || components.default
    })

    // 权限检查
    const hasPermission = computed(() => {
      if (!props.requireAuth) return true

      const checker = config?.permissionChecker
      if (checker) {
        return checker('authenticated') // 简化的权限检查
      }

      return true
    })

    // 过渡配置
    const transitionConfig = computed(() => {
      if (typeof props.transition === 'string') {
        return {
          name: props.transition,
          mode: props.transitionMode,
        }
      }
      return {
        mode: props.transitionMode,
        ...props.transition,
      }
    })

    // 布局组件
    const LayoutComponent = computed(() => {
      if (!props.layout) return null

      if (config?.layoutResolver) {
        return config.layoutResolver(props.layout)
      }

      return null
    })

    // 性能监控
    const startPerformanceTracking = () => {
      if (props.trackPerformance) {
        performanceStart.value = performance.now()
      }
    }

    const endPerformanceTracking = () => {
      if (props.trackPerformance && performanceStart.value) {
        const duration = performance.now() - performanceStart.value
        emit('performance', {
          route: route.value.path,
          duration,
          component: ViewComponent.value?.name,
        })
      }
    }

    // 错误处理
    // const handleError = (err: Error) => {
    //   error.value = err
    //   emit('error', err)
    // }

    const retry = () => {
      error.value = null
      // 重新渲染组件
    }

    // 滚动处理
    const handleScroll = () => {
      if (props.scrollToTop) {
        window.scrollTo({ top: 0, behavior: props.scrollBehavior })
      }
    }

    // 页面标题更新
    const updatePageTitle = () => {
      if (props.updateTitle && route.value.meta?.title) {
        document.title = route.value.meta.title as string
      }
    }

    // 生命周期
    onMounted(() => {
      updatePageTitle()
    })

    // 渲染组件
    const renderComponent = () => {
      const component = ViewComponent.value

      if (!component) {
        if (props.emptyComponent) {
          return h(props.emptyComponent)
        }

        return (
          slots.default?.({
            Component: null,
            route: route.value,
            isLoading: isLoading.value,
            error: error.value,
            retry,
          }) || null
        )
      }

      if (!hasPermission.value) {
        return props.fallbackComponent ? h(props.fallbackComponent) : null
      }

      if (error.value && props.errorComponent) {
        return h(props.errorComponent, { error: error.value, retry })
      }

      // 处理异步组件
      const resolvedComponent = resolveComponent(component)

      if (!resolvedComponent) {
        return null
      }

      // 创建组件实例
      const componentInstance = h(resolvedComponent, {
        ...attrs,
        key: route.value.fullPath,
        onVnodeMounted: () => {
          endPerformanceTracking()
          handleScroll()
          updatePageTitle()
        },
        onVnodeBeforeMount: startPerformanceTracking,
      })

      // 使用插槽渲染
      if (slots.default) {
        return slots.default({
          Component: componentInstance,
          route: route.value,
          isLoading: isLoading.value,
          error: error.value,
          retry,
        })
      }

      return componentInstance
    }

    // 渲染带缓存的组件
    const renderWithKeepAlive = (content: any) => {
      if (!props.keepAlive) return content

      return h(
        KeepAlive,
        {
          include: props.keepAliveInclude,
          exclude: props.keepAliveExclude,
          max: props.keepAliveMax,
        },
        () => content
      )
    }

    // 渲染带过渡的组件
    const renderWithTransition = (content: any) => {
      return h(
        Transition,
        {
          ...transitionConfig.value,
          onBeforeEnter: () => {
            error.value = null
            emit('transition-start')
          },
          onAfterEnter: () => {
            emit('transition-end')
          },
        },
        () => content
      )
    }

    // 渲染带布局的组件
    const renderWithLayout = (content: any) => {
      if (!LayoutComponent.value) return content

      return h(LayoutComponent.value, props.layoutProps, () => content)
    }

    return () => {
      let content = renderComponent()

      // 应用各种包装器
      content = renderWithKeepAlive(content)
      content = renderWithTransition(content)
      content = renderWithLayout(content)

      // 加载状态
      if (props.loading && props.loadingComponent) {
        return h(Suspense, {
          default: () => content,
          fallback: () => h(props.loadingComponent),
        })
      }

      return content
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
        return defineAsyncComponent(
          component as () => Promise<Component>
        ) as Component
      }
      return result as Component
    } catch {
      // 如果调用失败，可能是普通的函数组件
      return component as Component
    }
  }

  return component as Component
}

export default RouterView
