/**
 * 设备组件解析组合式函数
 *
 * 提供设备特定组件解析功能
 */

import type { DeviceType } from '@ldesign/device'
import type { ComputedRef, Ref } from 'vue'
import type { DeviceComponentResolution, RouteComponent } from '../types'
import { computed, ref, watch } from 'vue'
import { useRoute } from './index'
import { useDeviceRoute } from './useDeviceRoute'

export interface UseDeviceComponentOptions {
  /** 视图名称 */
  viewName?: string
  /** 是否启用自动解析 */
  autoResolve?: boolean
  /** 回退组件 */
  fallbackComponent?: RouteComponent
}

export interface UseDeviceComponentReturn {
  /** 当前解析的组件 */
  resolvedComponent: ComputedRef<RouteComponent | null>
  /** 组件解析结果 */
  resolution: ComputedRef<DeviceComponentResolution | null>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 手动解析组件 */
  resolveComponent: () => Promise<RouteComponent | null>
  /** 检查是否有设备特定组件 */
  hasDeviceComponent: (device: DeviceType) => boolean
  /** 获取设备特定组件 */
  getDeviceComponent: (device: DeviceType) => RouteComponent | null
}

/**
 * 使用设备组件解析功能
 */
export function useDeviceComponent(
  options: UseDeviceComponentOptions = {},
): UseDeviceComponentReturn {
  const { viewName = 'default', autoResolve = true, fallbackComponent } = options

  const route = useRoute()
  const { currentDevice } = useDeviceRoute()

  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 获取设备特定组件
  const getDeviceComponent = (device: DeviceType): RouteComponent | null => {
    const currentRecord = route.value.matched[route.value.matched.length - 1]
    if (!currentRecord)
      return null

    const deviceComponents = (currentRecord as any).deviceComponents
    return deviceComponents?.[device] || null
  }

  // 创建模板组件
  const createTemplateComponent = (record: any): RouteComponent => {
    return async () => {
      try {
        const { TemplateRouteResolver } = await import('../device/template')
        const templateResolver = new TemplateRouteResolver()

        return await templateResolver.resolveTemplate(
          record.meta.templateCategory || 'default',
          record.meta.template!,
          currentDevice.value,
        )
      }
      catch (error) {
        console.error('Failed to resolve template component:', error)
        throw error
      }
    }
  }

  // 组件解析结果
  const resolution = computed<DeviceComponentResolution | null>(() => {
    const currentRecord = route.value.matched[route.value.matched.length - 1]
    if (!currentRecord)
      return null

    try {
      // 检查设备特定组件
      const deviceComponents = (currentRecord as any).deviceComponents
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

      // 检查模板配置
      if (currentRecord.meta.template) {
        return {
          component: createTemplateComponent(currentRecord),
          deviceType: currentDevice.value,
          isFallback: false,
          source: 'template',
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
        const loadedComp = typeof comp === 'function' && 'then' in comp ? await (comp as () => Promise<any>)() : comp
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

    const deviceComponents = (currentRecord as any).deviceComponents
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
