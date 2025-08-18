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
  onMounted,
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
    // const router = useRouter()
    const currentRoute = useRoute()

    // 计算 RouterView 深度
    const parentDepth = inject(ROUTER_VIEW_DEPTH_KEY, 0)
    const depth = parentDepth + 1
    provide(ROUTER_VIEW_DEPTH_KEY, depth)

    // 状态管理
    const isLoading = ref(false)
    const error = ref<Error | null>(null)
    const componentCache = new ComponentCache(
      props.maxCache,
      props.cacheStrategy
    )
    const loadingTimer = ref<number>()

    // 当前路由和组件
    const route = computed(() => props.route || currentRoute.value)
    const currentComponent = ref<Component | null>(null)

    // 缓存键生成
    const getCacheKey = (route: RouteLocationNormalized): string => {
      return `${route.path}-${JSON.stringify(route.params)}-${JSON.stringify(
        route.query
      )}`
    }

    // 检查是否应该缓存
    const shouldCache = (componentName: string): boolean => {
      if (!props.keepAlive) return false

      if (props.include) {
        const include = Array.isArray(props.include)
          ? props.include
          : [props.include]
        return include.some(pattern => {
          if (typeof pattern === 'string') {
            return componentName === pattern
          }
          return pattern.test(componentName)
        })
      }

      if (props.exclude) {
        const exclude = Array.isArray(props.exclude)
          ? props.exclude
          : [props.exclude]
        return !exclude.some(pattern => {
          if (typeof pattern === 'string') {
            return componentName === pattern
          }
          return pattern.test(componentName)
        })
      }

      return true
    }

    // 加载组件
    const loadComponent = async (
      route: RouteLocationNormalized
    ): Promise<Component | null> => {
      const cacheKey = getCacheKey(route)

      // 检查缓存
      if (props.keepAlive && componentCache.has(cacheKey)) {
        const cached = componentCache.get(cacheKey)
        return cached?.component || null
      }

      // 获取匹配的路由记录
      if (!route.matched || route.matched.length === 0) {
        return null
      }

      // 根据深度选择正确的路由记录
      const matchedIndex = depth - 1
      if (matchedIndex >= route.matched.length) {
        return null
      }

      const matched = route.matched[matchedIndex]
      if (!matched || !matched.components) {
        return null
      }

      const component = matched.components[props.name]
      if (!component) {
        return null
      }

      try {
        // 异步组件加载
        let resolvedComponent: Component
        if (typeof component === 'function') {
          const result = await (component as () => Promise<any>)()
          // 检查是否是模块对象（动态导入的结果）
          if (result && typeof result === 'object' && 'default' in result) {
            resolvedComponent = result.default
          } else {
            resolvedComponent = result
          }
        } else {
          resolvedComponent = component
        }

        // 验证组件是否有效
        if (
          !resolvedComponent ||
          (typeof resolvedComponent !== 'function' &&
            typeof resolvedComponent !== 'object')
        ) {
          throw new Error(
            'Invalid component: component must be a function or object'
          )
        }

        // 使用 markRaw 避免组件被响应式化
        const rawComponent = markRaw(resolvedComponent)

        // 缓存组件
        if (props.keepAlive && shouldCache(rawComponent.name || 'Anonymous')) {
          componentCache.set(cacheKey, rawComponent, route)
        }

        return rawComponent
      } catch (err) {
        throw new Error(`Failed to load component: ${err}`)
      }
    }

    // 加载当前组件
    const loadCurrentComponent = async () => {
      if (isLoading.value) return

      try {
        isLoading.value = true
        error.value = null

        // 延迟显示加载状态
        if (props.showLoading && props.loadingDelay > 0) {
          loadingTimer.value = window.setTimeout(() => {
            // 加载状态已经在这里设置了
          }, props.loadingDelay)
        }

        const component = await Promise.race([
          loadComponent(route.value),
          new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error('Component load timeout')),
              props.timeout
            )
          }),
        ])

        currentComponent.value = component
      } catch (err) {
        error.value = err as Error
        emit('error', err)
      } finally {
        isLoading.value = false
        if (loadingTimer.value) {
          clearTimeout(loadingTimer.value)
          loadingTimer.value = undefined
        }
      }
    }

    // 重试加载
    const retry = async () => {
      error.value = null
      await loadCurrentComponent()
      emit('retry')
    }

    // 监听路由变化
    watch(
      () => route.value,
      (newRoute, oldRoute) => {
        if (
          !newRoute ||
          (oldRoute && getCacheKey(newRoute) === getCacheKey(oldRoute))
        ) {
          return
        }
        loadCurrentComponent()
      },
      { immediate: true }
    )

    // 动画事件处理
    const handleBeforeEnter = (el: Element) => {
      emit('beforeEnter', el)
    }

    const handleEnter = (el: Element, done: () => void) => {
      emit('enter', el, done)
      done()
    }

    const handleAfterEnter = (el: Element) => {
      emit('afterEnter', el)
    }

    const handleBeforeLeave = (el: Element) => {
      emit('beforeLeave', el)
    }

    const handleLeave = (el: Element, done: () => void) => {
      emit('leave', el, done)
      done()
    }

    const handleAfterLeave = (el: Element) => {
      emit('afterLeave', el)
    }

    // 生命周期
    onMounted(() => {
      loadCurrentComponent()
    })

    onUnmounted(() => {
      if (loadingTimer.value) {
        clearTimeout(loadingTimer.value)
      }
      componentCache.clear()
    })

    // 渲染函数
    return () => {
      // 插槽属性 - 在渲染函数内部创建，确保响应式更新
      const slotProps: RouterViewSlotProps = {
        Component: currentComponent.value,
        route: route.value,
        isLoading: isLoading.value,
        error: error.value,
        retry,
      }

      // 自定义渲染
      if (slots.default) {
        return slots.default(slotProps)
      }

      // 错误状态
      if (error.value) {
        if (props.error) {
          return h(props.error as any, { error: error.value, retry })
        }
        return h('div', { class: 'router-view__error' }, [
          h('p', {}, ['加载失败: ', error.value.message]),
          h('button', { onClick: retry }, '重试'),
        ])
      }

      // 加载状态
      if (isLoading.value && props.showLoading) {
        if (props.loading) {
          return h(props.loading as any)
        }
        return h('div', { class: 'router-view__loading' }, [
          h('div', { class: 'router-view__spinner' }),
          h('p', '加载中...'),
        ])
      }

      // 空状态
      if (!currentComponent.value) {
        if (props.empty) {
          return h(props.empty as any)
        }
        return h('div', { class: 'router-view__empty' }, [
          h('p', '没有找到匹配的组件'),
        ])
      }

      // 渲染组件
      const renderComponent = () => {
        const Component = currentComponent.value!
        return h(Component as any, { key: getCacheKey(route.value), ...attrs })
      }

      // 包装缓存
      const wrapWithKeepAlive = (content: VNode) => {
        if (!props.keepAlive) return content

        return h(
          KeepAlive,
          {
            include: props.include || undefined,
            exclude: props.exclude || undefined,
            max: props.maxCache,
          },
          () => content
        )
      }

      // 包装动画
      const wrapWithTransition = (content: VNode) => {
        if (props.animation === 'none') return content

        return h(
          Transition,
          {
            name: `router-view-${props.animation}`,
            mode: 'out-in',
            duration: props.animationDuration,
            onBeforeEnter: handleBeforeEnter,
            onEnter: handleEnter,
            onAfterEnter: handleAfterEnter,
            onBeforeLeave: handleBeforeLeave,
            onLeave: handleLeave,
            onAfterLeave: handleAfterLeave,
          },
          () => content
        )
      }

      // 包装 Suspense
      const wrapWithSuspense = (content: VNode) => {
        return h(
          Suspense,
          {},
          {
            default: () => content,
            fallback: () =>
              props.loading
                ? h(props.loading as any)
                : h('div', { class: 'router-view__loading' }, '加载中...'),
          }
        )
      }

      let content = renderComponent()
      content = wrapWithKeepAlive(content)
      content = wrapWithTransition(content)
      content = wrapWithSuspense(content)

      return content
    }
  },
})

export default RouterView
