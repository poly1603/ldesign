/**
 * @ldesign/router RouterView 组件
 *
 * 增强的路由视图组件，支持动画、缓存、错误边界等功能
 */

import type { RouteLocationNormalized } from '../types'
import type {
  AnimationType,
  CacheItem,
  CacheStrategy,
  RouterViewSlotProps,
} from './types'
import {
  type Component,
  computed,
  defineComponent,
  h,
  inject,
  KeepAlive,
  markRaw,
  onUnmounted,
  type PropType,
  provide,
  ref,
  Suspense,
  Transition,
  type VNode,
  watch,
} from 'vue'
import { useRoute } from '../composables'
import { DEFAULT_VIEW_NAME } from '../core/constants'

// RouterView 深度注入键
const ROUTER_VIEW_DEPTH_KEY = Symbol('RouterViewDepth')

// ==================== 缓存管理器 ====================

class ComponentCache {
  private cache = new Map<string, CacheItem>()
  private maxSize: number
  // 缓存策略，用于后续扩展
  private _strategy: CacheStrategy

  constructor(maxSize: number = 10, strategy: CacheStrategy = 'memory') {
    this.maxSize = maxSize
    this._strategy = strategy
  }

  get(key: string): CacheItem | undefined {
    const item = this.cache.get(key)
    if (item) {
      item.lastAccessedAt = Date.now()
      item.accessCount++
    }
    return item
  }

  set(key: string, component: Component, route: RouteLocationNormalized): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evict()
    }

    const item: CacheItem = {
      component,
      route,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 1,
    }

    this.cache.set(key, item)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private evict(): void {
    // LRU 淘汰策略
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache) {
      if (item.lastAccessedAt < oldestTime) {
        oldestTime = item.lastAccessedAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

// ==================== RouterView 组件 ====================

export const RouterView = defineComponent({
  name: 'RouterView',
  inheritAttrs: false,

  props: {
    // 基础属性
    name: {
      type: String,
      default: DEFAULT_VIEW_NAME,
    },
    route: {
      type: Object as PropType<RouteLocationNormalized>,
      default: undefined,
    },

    // 动画属性
    animation: {
      type: String as PropType<AnimationType>,
      default: 'none',
    },
    animationDuration: {
      type: Number,
      default: 300,
    },

    // 缓存属性
    keepAlive: {
      type: Boolean,
      default: false,
    },
    cacheStrategy: {
      type: String as PropType<CacheStrategy>,
      default: 'memory',
    },
    maxCache: {
      type: Number,
      default: 10,
    },
    include: {
      type: [String, RegExp, Array] as PropType<
        string | RegExp | Array<string | RegExp>
      >,
      default: undefined,
    },
    exclude: {
      type: [String, RegExp, Array] as PropType<
        string | RegExp | Array<string | RegExp>
      >,
      default: undefined,
    },

    // 状态组件
    loading: {
      type: Object as PropType<Component>,
      default: undefined,
    },
    error: {
      type: Object as PropType<Component>,
      default: undefined,
    },
    empty: {
      type: Object as PropType<Component>,
      default: undefined,
    },

    // 加载配置
    timeout: {
      type: Number,
      default: 10000,
    },
    showLoading: {
      type: Boolean,
      default: true,
    },
    loadingDelay: {
      type: Number,
      default: 200,
    },
  },

  emits: [
    'beforeEnter',
    'enter',
    'afterEnter',
    'beforeLeave',
    'leave',
    'afterLeave',
    'error',
    'retry',
  ],

  setup(props, { slots, attrs, emit }) {
    // 获取路由信息
    const injectedRoute = useRoute()
    const currentRoute = computed(() => props.route || injectedRoute.value)

    // 获取视图深度
    const depth = inject(ROUTER_VIEW_DEPTH_KEY, 0)
    const childDepth = depth + 1
    provide(ROUTER_VIEW_DEPTH_KEY, childDepth)

    // 缓存管理
    const cache = new ComponentCache(props.maxCache, props.cacheStrategy)

    // 组件状态
    const isLoading = ref(false)
    const hasError = ref(false)
    const errorInfo = ref<Error | null>(null)
    const retryCount = ref(0)
    const maxRetries = 3

    // 异步组件加载状态
    const componentLoadingPromises = new Map<string, Promise<Component>>()

    // 匹配的路由记录和组件
    const matchedRoute = computed(() => {
      const route = currentRoute.value
      return route.matched[depth] || null
    })

    const viewComponent = computed(() => {
      const route = matchedRoute.value
      if (!route)
        return null

      const components = route.components || {}
      return components[props.name] || null
    })

    // 组件解析和缓存
    const resolvedComponent = ref<Component | null>(null)

    // 异步组件加载函数（优化版）
    const loadComponent = async (component: Component): Promise<Component> => {
      // 如果不是函数组件，直接返回
      if (typeof component !== 'function') {
        return component
      }

      // 生成缓存键
      const cacheKey = `${currentRoute.value.fullPath}_${props.name}_${depth}`

      try {
        // 检查是否已在加载中
        const existingPromise = componentLoadingPromises.get(cacheKey)
        if (existingPromise) {
          return await existingPromise
        }

        // 检查缓存
        if (props.keepAlive) {
          const cached = cache.get(cacheKey)
          if (cached) {
            return cached.component
          }
        }

        // 标记为加载中
        isLoading.value = true
        hasError.value = false
        errorInfo.value = null

        // 创建加载Promise，带超时和取消机制
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => {
          abortController.abort()
        }, props.timeout)

        const loadingPromise = Promise.race([
          Promise.resolve((component as () => Promise<Component>)()),
          new Promise<never>((_, reject) => {
            abortController.signal.addEventListener('abort', () => {
              reject(new Error(`组件加载超时 (${props.timeout}ms)`))
            })
          }),
        ]) as Promise<Component>

        componentLoadingPromises.set(cacheKey, loadingPromise)

        const loadedComponent = await loadingPromise
        clearTimeout(timeoutId)

        // 验证加载的组件
        if (!loadedComponent || typeof loadedComponent !== 'object') {
          throw new Error('加载的组件无效')
        }

        // 缓存组件
        if (props.keepAlive) {
          cache.set(cacheKey, markRaw(loadedComponent), currentRoute.value)
        }

        // 重置重试计数
        retryCount.value = 0

        return loadedComponent
      }
      catch (error) {
        // 记录错误
        hasError.value = true
        errorInfo.value = error as Error

        // 发出错误事件
        emit('error', error)

        // 如果有重试机制且未达到最大重试次数
        if (retryCount.value < maxRetries) {
          console.warn(`组件加载失败，尝试 ${retryCount.value + 1}/${maxRetries}:`, error)
          // 不抛出错误，允许重试
          return component
        }

        throw error
      }
      finally {
        // 清理加载状态
        componentLoadingPromises.delete(cacheKey)
        isLoading.value = false
      }
    }

    // 重试函数
    const retry = async () => {
      if (retryCount.value < maxRetries && viewComponent.value) {
        retryCount.value++
        emit('retry', retryCount.value)

        try {
          const component = await loadComponent(viewComponent.value)
          if (component) {
            resolvedComponent.value = component
            hasError.value = false
            errorInfo.value = null
          }
        }
        catch (error) {
          console.error('Retry failed:', error)
        }
      }
    }

    // 监听路由变化，解析组件
    watch([viewComponent, currentRoute], async ([component, route]) => {
      if (!component || !route) {
        resolvedComponent.value = null
        return
      }

      try {
        const resolved = await loadComponent(component)
        if (resolved) {
          resolvedComponent.value = resolved
        }
      }
      catch (error) {
        console.error('Component loading failed:', error)
        // 组件已设置错误状态，这里不需要额外处理
      }
    }, { immediate: true })

    // 清理函数
    const cleanup = () => {
      // 清理所有加载中的Promise
      componentLoadingPromises.clear()
      // 如果需要，清理缓存
      if (props.cacheStrategy === 'memory') {
        cache.clear()
      }
    }

    // 组件卸载时清理
    onUnmounted(() => {
      cleanup()
    })

    // 渲染函数
    const renderComponent = (): VNode | null => {
      const route = currentRoute.value
      const component = resolvedComponent.value

      // 没有匹配的路由
      if (!matchedRoute.value) {
        return props.empty ? h(props.empty) : null
      }

      // 加载状态
      if (isLoading.value && props.showLoading) {
        return props.loading ? h(props.loading) : h('div', 'Loading...')
      }

      // 错误状态
      if (hasError.value && errorInfo.value) {
        if (props.error) {
          return h(props.error, {
            error: errorInfo.value,
            retry,
            retryCount: retryCount.value,
            maxRetries,
          })
        }

        // 默认错误UI
        return h('div', {
          class: 'router-view-error',
        }, [
          h('p', 'Component loading failed'),
          h('p', { class: 'error-message' }, errorInfo.value.message),
          retryCount.value < maxRetries
            ? h('button', { onClick: retry }, `Retry (${retryCount.value}/${maxRetries})`)
            : null,
        ])
      }

      // 没有组件
      if (!component) {
        return props.empty ? h(props.empty) : null
      }

      // 创建组件实例
      const componentInstance = h(component, {
        ...attrs,
        key: route.fullPath,
      })

      // 包装slot内容
      const slotProps: RouterViewSlotProps = {
        Component: component,
        route,
        isLoading: isLoading.value,
        error: errorInfo.value,
        retry,
      }

      if (slots.default) {
        const slotResult = slots.default(slotProps)
        return Array.isArray(slotResult) ? slotResult[0] : slotResult
      }
      return componentInstance
    }

    // 过渡和缓存包装
    const renderWithFeatures = (): VNode | null => {
      const content = renderComponent()

      if (!content)
        return null

      let wrappedContent = content

      // KeepAlive 包装
      if (props.keepAlive) {
        wrappedContent = h(KeepAlive, {
          include: props.include,
          exclude: props.exclude,
          max: props.maxCache,
        }, () => wrappedContent)
      }

      // Suspense 包装（异步组件支持）
      wrappedContent = h(Suspense, {
        timeout: props.timeout,
        onResolve: () => {
          isLoading.value = false
        },
        onReject: (error: Error) => {
          hasError.value = true
          errorInfo.value = error
          emit('error', error)
        },
      }, {
        default: () => wrappedContent,
        fallback: () => props.loading ? h(props.loading) : h('div', 'Loading...'),
      })

      // Transition 包装
      if (props.animation !== 'none') {
        const transitionProps = {
          name: `router-${props.animation}`,
          mode: 'out-in' as const,
          duration: props.animationDuration,
          onBeforeEnter: (el: Element) => emit('beforeEnter', el),
          onEnter: (el: Element, done: () => void) => {
            emit('enter', el)
            setTimeout(done, props.animationDuration)
          },
          onAfterEnter: (el: Element) => emit('afterEnter', el),
          onBeforeLeave: (el: Element) => emit('beforeLeave', el),
          onLeave: (el: Element, done: () => void) => {
            emit('leave', el)
            setTimeout(done, props.animationDuration)
          },
          onAfterLeave: (el: Element) => emit('afterLeave', el),
        }

        wrappedContent = h(Transition, transitionProps, () => wrappedContent)
      }

      return wrappedContent
    }

    return renderWithFeatures
  },
})

export default RouterView
