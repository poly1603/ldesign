/**
 * @ldesign/router RouterView 组件
 *
 * 增强版本 - 核心功能 + 适度增强
 */

import type { Component, Router } from '../types'
import { defineComponent, h, inject, KeepAlive, markRaw, type PropType, ref, Transition, watch } from 'vue'
import { useRoute } from '../composables'
import { ROUTER_INJECTION_SYMBOL } from '../core/constants'

export const RouterView = defineComponent({
  name: 'RouterView',
  props: {
    name: {
      type: String,
      default: 'default',
    },
    // keep-alive 支持
    keepAlive: {
      type: Boolean,
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
      type: [String, Object] as PropType<string | object>,
      default: undefined,
    },
    // loading 状态支持
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const router = inject<Router>(ROUTER_INJECTION_SYMBOL)
    const route = useRoute()

    if (!router) {
      throw new Error('RouterView must be used within a Router')
    }

    // 当前组件和状态
    const currentComponent = ref<Component | null>(null)
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    // 加载组件
    const loadComponent = async (componentDef: any): Promise<Component | null> => {
      try {
        if (!componentDef)
          return null

        // 如果是函数（懒加载）
        if (typeof componentDef === 'function') {
          const result = await componentDef()

          // 处理ES模块默认导出
          if (result && typeof result === 'object' && 'default' in result) {
            return result.default
          }

          return result
        }

        // 直接返回组件
        return componentDef
      }
      catch (error) {
        console.error('Failed to load component:', error)
        throw error
      }
    }

    // 监听路由变化
    watch(
      () => route.value,
      async (newRoute) => {
        if (!newRoute?.matched?.length) {
          currentComponent.value = null
          isLoading.value = false
          return
        }

        // 找到匹配的路由记录
        const matched = newRoute.matched[newRoute.matched.length - 1]
        const component = matched?.components?.[props.name]

        if (component) {
          try {
            // 如果是函数（懒加载），显示loading状态
            if (typeof component === 'function' && props.loading) {
              isLoading.value = true
            }

            const loadedComponent = await loadComponent(component)
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
        }
        else {
          currentComponent.value = null
          isLoading.value = false
          error.value = null
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

      // 渲染组件的函数
      const renderComponent = () => {
        if (!component)
          return null

        return h(component, {
          key: route.value.path,
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
          route: route.value,
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
