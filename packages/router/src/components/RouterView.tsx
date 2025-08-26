/**
 * @ldesign/router RouterView 组件
 * 
 * 简化版本 - 专注于核心路由渲染功能
 */

import { defineComponent, h, inject, ref, computed, watch, markRaw } from 'vue'
import { useRoute } from '../composables'
import { ROUTER_INJECTION_SYMBOL } from '../core/constants'
import type { Router, Component } from '../types'

export const RouterView = defineComponent({
  name: 'RouterView',
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  setup(props, { slots }) {
    const router = inject<Router>(ROUTER_INJECTION_SYMBOL)
    const route = useRoute()

    if (!router) {
      throw new Error('RouterView must be used within a Router')
    }

    // 当前组件
    const currentComponent = ref<Component | null>(null)

    // 加载组件
    const loadComponent = async (componentDef: any): Promise<Component | null> => {
      try {
        if (!componentDef) return null

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
      } catch (error) {
        console.error('Failed to load component:', error)
        return null
      }
    }

    // 监听路由变化
    watch(
      () => route.value,
      async (newRoute) => {
        if (!newRoute?.matched?.length) {
          currentComponent.value = null
          return
        }

        // 找到匹配的路由记录
        const matched = newRoute.matched[newRoute.matched.length - 1]
        const component = matched?.components?.[props.name]

        if (component) {
          const loadedComponent = await loadComponent(component)
          if (loadedComponent) {
            currentComponent.value = markRaw(loadedComponent)
          }
        } else {
          currentComponent.value = null
        }
      },
      { immediate: true }
    )

    return () => {
      const component = currentComponent.value

      // 如果有默认slot，总是提供slot props
      if (slots.default) {
        return slots.default({
          Component: component,
          route: route.value
        })
      }

      // 如果没有slot且没有组件，返回null
      if (!component) {
        return null
      }

      // 否则直接渲染组件
      return h(component, {
        key: route.value.path
      })
    }
  }
})

export default RouterView
