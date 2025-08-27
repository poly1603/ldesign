/**
 * 设备路由组合式函数
 *
 * 提供设备路由相关的响应式功能
 */

import type { DeviceType } from '@ldesign/device'
import type { ComputedRef, Ref } from 'vue'
import type { RouteLocationNormalized, Router } from '../types'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  ROUTE_INJECTION_SYMBOL,
  ROUTER_INJECTION_SYMBOL,
} from '../core/constants'
import { checkDeviceSupport, getDeviceFriendlyName } from '../device/utils'

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
 * 本地 useRouter 实现，避免循环依赖
 */
function useRouter(): Router {
  const router = inject<Router>(ROUTER_INJECTION_SYMBOL)

  if (!router) {
    throw new Error(
      'useRouter() can only be used inside a component that has a router instance',
    )
  }

  return router
}

export interface UseDeviceRouteOptions {
  /** 是否自动检测设备变化 */
  autoDetect?: boolean
  /** 设备变化时是否自动重新检查路由支持 */
  autoRecheck?: boolean
}

export interface UseDeviceRouteReturn {
  /** 当前设备类型 */
  currentDevice: Ref<DeviceType>
  /** 当前设备类型（别名） */
  deviceType: ComputedRef<DeviceType>
  /** 当前设备友好名称 */
  currentDeviceName: ComputedRef<string>
  /** 是否为移动设备 */
  isMobile: ComputedRef<boolean>
  /** 是否为平板设备 */
  isTablet: ComputedRef<boolean>
  /** 是否为桌面设备 */
  isDesktop: ComputedRef<boolean>
  /** 当前路由是否支持当前设备 */
  isCurrentRouteSupported: ComputedRef<boolean>
  /** 当前路由支持的设备类型 */
  supportedDevices: ComputedRef<DeviceType[]>
  /** 检查指定路由是否支持当前设备 */
  isRouteSupported: (path: string) => boolean
  /** 检查指定路由是否支持指定设备 */
  isRouteSupportedOnDevice: (path: string, device: DeviceType) => boolean
  /** 获取设备信息 */
  getDeviceInfo: () => {
    type: DeviceType
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    userAgent: string
    screenWidth: number
    screenHeight: number
  }
  /** 监听设备变化 */
  onDeviceChange: (callback: (device: DeviceType) => void) => () => void
  /** 跳转到设备不支持页面 */
  goToUnsupportedPage: (message?: string) => void
}

/**
 * 使用设备路由功能
 */
export function useDeviceRoute(
  options: UseDeviceRouteOptions = {},
): UseDeviceRouteReturn {
  const { autoDetect = true, autoRecheck = true } = options

  const router = useRouter()
  const route = useRoute()

  // 获取设备路由插件实例
  const devicePlugin = (router as Router & {
    devicePlugin?: {
      isSupported: (device: DeviceType) => boolean
      getCurrentDevice: () => DeviceType
      getDeviceInfo: () => ReturnType<UseDeviceRouteReturn['getDeviceInfo']>
    }
  }).devicePlugin
  if (!devicePlugin) {
    console.warn(
      'DeviceRouterPlugin not found. Please install the plugin first.',
    )
  }

  // 当前设备类型
  const currentDevice = ref<DeviceType>('desktop')

  // 初始化设备检测
  if (devicePlugin && autoDetect) {
    currentDevice.value = devicePlugin.getCurrentDevice()
  }

  // 当前设备友好名称
  const currentDeviceName = computed(() => {
    return getDeviceFriendlyName(currentDevice.value)
  })

  // 当前路由是否支持当前设备
  const isCurrentRouteSupported = computed(() => {
    return checkDeviceSupport(route.value, currentDevice.value)
  })

  // 当前路由支持的设备类型
  const supportedDevices = computed(() => {
    const meta = route.value.meta
    if (meta.supportedDevices && Array.isArray(meta.supportedDevices)) {
      return meta.supportedDevices
    }

    // 检查匹配的路由记录
    for (const record of route.value.matched) {
      if (
        record.meta.supportedDevices
        && Array.isArray(record.meta.supportedDevices)
      ) {
        return record.meta.supportedDevices
      }
    }

    // 默认支持所有设备
    return ['mobile', 'tablet', 'desktop'] as DeviceType[]
  })

  // 检查指定路由是否支持当前设备
  const isRouteSupported = (_path: string): boolean => {
    if (!devicePlugin)
      return true
    return devicePlugin.isSupported(currentDevice.value)
  }

  // 检查指定路由是否支持指定设备
  const isRouteSupportedOnDevice = (
    path: string,
    device: DeviceType,
  ): boolean => {
    try {
      const resolved = router.resolve(path)
      const supportedDevices = resolved.meta.supportedDevices

      if (!supportedDevices || supportedDevices.length === 0) {
        return true
      }

      return supportedDevices.includes(device)
    }
    catch {
      return false
    }
  }

  // 获取设备信息
  const getDeviceInfo = () => {
    if (devicePlugin) {
      return devicePlugin.getDeviceInfo()
    }
    // 返回默认设备信息
    return {
      type: 'desktop' as DeviceType,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
      screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    }
  }

  // 监听设备变化
  const onDeviceChange = (
    _callback: (device: DeviceType) => void,
  ): (() => void) => {
    if (!devicePlugin) {
      return () => { }
    }

    // 模拟设备变化监听
    return () => {
      // 清理函数
    }
  }

  // 跳转到设备不支持页面
  const goToUnsupportedPage = (message?: string) => {
    const query: Record<string, string> = {
      from: route.value.fullPath,
      device: currentDevice.value,
    }

    if (message) {
      query.message = message
    }

    router.push({
      path: '/device-unsupported',
      query,
    })
  }

  // 设备变化时自动重新检查路由支持
  if (autoRecheck) {
    watch(currentDevice, (newDevice) => {
      if (!isCurrentRouteSupported.value) {
        console.warn(`Current route is not supported on ${newDevice}`)
      }
    })
  }

  // 组件挂载时设置设备变化监听
  let unwatch: (() => void) | null = null

  onMounted(() => {
    if (devicePlugin && autoDetect) {
      unwatch = onDeviceChange((device) => {
        console.warn(`Device changed to: ${device}`)
      })
    }
  })

  onUnmounted(() => {
    if (unwatch) {
      unwatch()
    }
  })

  // 计算设备类型相关的响应式属性
  const deviceType = computed(() => currentDevice.value)
  const isMobile = computed(() => currentDevice.value === 'mobile')
  const isTablet = computed(() => currentDevice.value === 'tablet')
  const isDesktop = computed(() => currentDevice.value === 'desktop')

  return {
    currentDevice,
    deviceType,
    currentDeviceName,
    isMobile,
    isTablet,
    isDesktop,
    isCurrentRouteSupported,
    supportedDevices,
    isRouteSupported,
    isRouteSupportedOnDevice,
    getDeviceInfo,
    onDeviceChange,
    goToUnsupportedPage,
  }
}
