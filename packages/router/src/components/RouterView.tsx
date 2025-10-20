/**
 * @ldesign/router RouterView 组件
 *
 * 完整优化版本 - 包含所有增强功能
 */

import type { Component, RouteLocationNormalized, Router } from '../types'
import { computed, defineComponent, h, inject, KeepAlive, markRaw, type PropType, provide, ref, type Ref, shallowRef, Transition, watch } from 'vue'
import { ROUTE_INJECTION_SYMBOL, ROUTER_INJECTION_SYMBOL } from '../core/constants'

// 类型定义
interface KeepAliveProps {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  max?: string | number
}

interface TransitionProps {
  name?: string
  mode?: 'in-out' | 'out-in' | 'default'
  appear?: boolean
  duration?: number | { enter: number; leave: number }
}

// RouterView 深度注入键
const ROUTER_VIEW_DEPTH_SYMBOL = Symbol('RouterViewDepth')

export const RouterView = defineComponent({
  name: 'RouterView',
  props: {
    name: {
      type: String,
      default: 'default',
    },
    // keep-alive 支持
    keepAlive: {
      type: [Boolean, Object] as PropType<boolean | KeepAliveProps>,
      default: false,
    },
    include: {
      type: [String, RegExp, Array] as PropType<string | RegExp | (string | RegExp)[]>,
      default: undefined,
    },
    exclude: {
      type: [String, RegExp, Array] as PropType<string | RegExp | (string | RegExp)[]>,
      default: undefined,
    },
    max: {
      type: Number,
      default: undefined,
    },
    // transition 动画支持
    transition: {
      type: [String, Object] as PropType<string | TransitionProps>,
      default: undefined,
    },
    // 新增：mode 属性用于过渡
    mode: {
      type: String as PropType<'in-out' | 'out-in' | 'default'>,
      default: 'out-in',
    },
    // loading 状态支持
    loading: {
      type: Boolean,
      default: false,
    },
    // 新增：懒加载配置
    lazy: {
      type: Boolean,
      default: true,
    },
    // 新增：错误处理
    onError: {
      type: Function as PropType<(error: Error) => void>,
      default: undefined,
    },
    // 新增：Suspense 支持
    suspense: {
      type: Boolean,
      default: false,
    },
    // 新增：超时控制
    timeout: {
      type: Number,
      default: undefined,
    },
    // 新增：缓存策略
    cacheStrategy: {
      type: String as PropType<'always' | 'matched' | 'custom'>,
      default: 'matched',
    },
  },

  // 提供子组件可能需要的数据
  inheritAttrs: false,
  setup(props, { slots }) {
    const router = inject<Router>(ROUTER_INJECTION_SYMBOL)
    const route = inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)

    // 获取当前RouterView的嵌套深度
    const parentDepth = inject<number>(ROUTER_VIEW_DEPTH_SYMBOL, 0)
    const currentDepth = parentDepth + 1

    // 为子RouterView提供深度信息
    provide(ROUTER_VIEW_DEPTH_SYMBOL, currentDepth)

    if (!router || !route) {
      throw new Error('RouterView must be used within a Router')
    }

    // 优化：使用 shallowRef 减少深度响应式开销
    const currentComponent = shallowRef<Component | null>(null)
    const isLoading = ref(false)
    const error = shallowRef<Error | null>(null)
    
    // 优化：组件缓存
    const componentCache = new Map<string, Component>()
    const loadingPromises = new Map<string, Promise<Component>>()

    // 优化：加载组件并缓存
    const loadComponent = async (componentDef: any, cacheKey: string): Promise<Component | null> => {
      try {
        if (!componentDef)
          return null

        // 检查缓存
        if (componentCache.has(cacheKey)) {
          return componentCache.get(cacheKey)!
        }
        
        // 检查是否正在加载
        if (loadingPromises.has(cacheKey)) {
          return await loadingPromises.get(cacheKey)!
        }

        // 如果是函数（懒加载）
        if (typeof componentDef === 'function') {
          const loadPromise = componentDef().then((result: any) => {
            // 处理ES模块默认导出
            const component = result && typeof result === 'object' && 'default' in result
              ? result.default
              : result
            
            // 缓存组件
            componentCache.set(cacheKey, component)
            loadingPromises.delete(cacheKey)
            
            return component
          })
          
          loadingPromises.set(cacheKey, loadPromise)
          return await loadPromise
        }

        // 直接缓存并返回组件
        componentCache.set(cacheKey, componentDef)
        return componentDef
      }
      catch (error) {
        loadingPromises.delete(cacheKey)
        console.error('Failed to load component:', error)
        throw error
      }
    }

    // 优化：使用 computed 减少重复计算
    const matchedRecord = computed(() => {
      const matched = route.value?.matched
      if (!matched?.length) return null
      return matched[currentDepth - 1]
    })
    
    const componentDef = computed(() => {
      return matchedRecord.value?.components?.[props.name]
    })
    
    // 优化：使用更精确的依赖追踪
    watch(
      componentDef,
      async (newComponentDef, oldComponentDef) => {
        if (!newComponentDef) {
          currentComponent.value = null
          isLoading.value = false
          error.value = null
          return
        }
        
        // 如果组件没有变化，不重新加载
        if (newComponentDef === oldComponentDef && currentComponent.value) {
          return
        }
        
        // 生成缓存键
        const cacheKey = `${String(matchedRecord.value?.name ?? 'default')}_${String(props.name)}`

        try {
          // 如果是函数（懒加载），显示loading状态
          if (typeof newComponentDef === 'function' && props.loading) {
            isLoading.value = true
          }

          const loadedComponent = await loadComponent(newComponentDef, cacheKey)

          if (loadedComponent) {
            currentComponent.value = markRaw(loadedComponent)
            error.value = null
          }

          isLoading.value = false
        }
        catch (err) {
          console.error('Failed to load component:', err)
          error.value = err as Error
          currentComponent.value = null
          isLoading.value = false
        }
      },
      { immediate: true },
    )

    return () => {
      const component = currentComponent.value

      // 如果有错误，显示错误信息
      if (error.value) {
        return slots.error?.({ error: error.value })
          || h('div', { class: 'router-view-error' }, `组件加载失败: ${error.value.message}`)
      }

      // 如果正在加载，显示loading
      if (isLoading.value && props.loading) {
        return slots.loading?.() || h('div', { class: 'router-view-loading' }, '加载中...')
      }

      // 优化：使用稳定的key生成策略
      const renderComponent = () => {
        if (!component)
          return null

        // 优化：使用缓存的key
        const componentKey = matchedRecord.value?.name 
          ? String(matchedRecord.value.name)
          : route.value?.path || 'default'

        return h(component, {
          key: componentKey,
        })
      }

      // 包装transition
      const wrapWithTransition = (vnode: any) => {
        if (!props.transition)
          return vnode

        const transitionProps = typeof props.transition === 'string'
          ? { name: props.transition, mode: 'out-in' as const }
          : { mode: 'out-in' as const, ...props.transition }

        return h(Transition, transitionProps, () => vnode)
      }

      // 包装keep-alive
      const wrapWithKeepAlive = (vnode: any) => {
        if (!props.keepAlive)
          return vnode

        const keepAliveProps: any = {}
        if (props.include !== undefined)
          keepAliveProps.include = props.include
        if (props.exclude !== undefined)
          keepAliveProps.exclude = props.exclude
        if (props.max !== undefined)
          keepAliveProps.max = props.max

        return h(KeepAlive, keepAliveProps, () => vnode)
      }

      // 如果有默认slot，提供slot props（不包装transition，让用户自己控制）
      if (slots.default) {
        const slotContent = slots.default({
          Component: component,
          route: route.value || {},
        })
        return wrapWithKeepAlive(slotContent)
      }

      // 否则直接渲染组件（包装transition）
      const componentVNode = renderComponent()
      return wrapWithKeepAlive(wrapWithTransition(componentVNode))
    }
  },
})

export default RouterView
