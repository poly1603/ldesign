/**
 * 设备组件解析组合式函数
 *
 * 提供设备特定组件解析功能
 */

import type { DeviceType } from '@ldesign/device'
import type { Component, Ref } from 'vue'
import type {
  DeviceComponentResolution,
  RouteComponent,
  RouteLocationNormalized,
  RouteRecordNormalized,
  UseDeviceComponentOptions,
  UseDeviceComponentReturn,
} from '../types'
import { computed, inject, ref, watch } from 'vue'
import { ROUTE_INJECTION_SYMBOL } from '../core/constants'
import { useDeviceRoute } from './useDeviceRoute'

/**
 * 本地 useRoute 实现，避免循环依赖
 */
function useRoute(): Ref<RouteLocationNormalized> {
  const route = inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)

  if (!route) {
    throw new Error(
      'useRoute() can only be used inside a component that has a router instance',
    )
  }

  return route
}

/**
 * 使用设备组件解析功能
 */
export function useDeviceComponent(
  options: UseDeviceComponentOptions = {},
): UseDeviceComponentReturn {
  const {
    viewName = 'default',
    autoResolve = true,
    fallbackComponent,
  } = options

  const route = useRoute()
  const { currentDevice } = useDeviceRoute()

  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 获取设备特定组件
  const getDeviceComponent = (device: DeviceType): RouteComponent | null => {
    const currentRecord = route.value.matched[route.value.matched.length - 1]
    if (!currentRecord)
      return null

    const deviceComponents = (currentRecord as RouteRecordNormalized & {
      deviceComponents?: Record<string, RouteComponent>
    }).deviceComponents
    return deviceComponents?.[device] || null
  }

  // 组件解析结果
  const resolution = computed<DeviceComponentResolution | null>(() => {
    const currentRecord = route.value.matched[route.value.matched.length - 1]
    if (!currentRecord)
      return null

    try {
      // 检查设备特定组件
      const deviceComponents = (currentRecord as RouteRecordNormalized & {
        deviceComponents?: Record<string, RouteComponent>
      }).deviceComponents
      if (deviceComponents) {
        const deviceComponent = getDeviceComponent(currentDevice.value)
        if (deviceComponent) {
          return {
            component: deviceComponent,
            deviceType: currentDevice.value,
            isFallback: false,
            source: 'deviceComponents',
          }
        }

        // 尝试回退到其他设备组件
        const fallbackOrder: DeviceType[] = ['desktop', 'tablet', 'mobile']
        for (const fallbackDevice of fallbackOrder) {
          if (fallbackDevice !== currentDevice.value) {
            const fallbackComp = deviceComponents[fallbackDevice]
            if (fallbackComp) {
              return {
                component: fallbackComp,
                deviceType: fallbackDevice,
                isFallback: true,
                source: 'deviceComponents',
              }
            }
          }
        }
      }

      // 检查常规组件
      if (currentRecord.components && currentRecord.components[viewName]) {
        return {
          component: currentRecord.components[viewName],
          deviceType: currentDevice.value,
          isFallback: false,
          source: 'component',
        }
      }

      return null
    }
    catch (err) {
      error.value = err as Error
      return null
    }
  })

  // 当前解析的组件
  const resolvedComponent = computed<RouteComponent | null>(() => {
    if (resolution.value) {
      return resolution.value.component
    }

    if (fallbackComponent) {
      return fallbackComponent
    }

    return null
  })

  // 手动解析组件
  const resolveComponent = async (): Promise<RouteComponent | null> => {
    loading.value = true
    error.value = null

    try {
      const comp = resolvedComponent.value
      if (!comp)
        return null

      // 如果是异步组件，等待加载
      if (typeof comp === 'function') {
        const loadedComp
          = typeof comp === 'function' && 'then' in comp
            ? await (comp as () => Promise<Component>)()
            : comp
        return loadedComp
      }

      return comp
    }
    catch (err) {
      error.value = err as Error
      return null
    }
    finally {
      loading.value = false
    }
  }

  // 检查是否有设备特定组件
  const hasDeviceComponent = (device: DeviceType): boolean => {
    const currentRecord = route.value.matched[route.value.matched.length - 1]
    if (!currentRecord)
      return false

    const deviceComponents = (currentRecord as RouteRecordNormalized & {
      deviceComponents?: Record<string, RouteComponent>
    }).deviceComponents
    return !!(deviceComponents && deviceComponents[device])
  }

  // 自动解析
  if (autoResolve) {
    watch(
      [route, currentDevice],
      () => {
        if (resolvedComponent.value) {
          resolveComponent()
        }
      },
      { immediate: true },
    )
  }

  return {
    resolvedComponent,
    resolution,
    loading,
    error,
    resolveComponent,
    hasDeviceComponent,
    getDeviceComponent,
  }
}
