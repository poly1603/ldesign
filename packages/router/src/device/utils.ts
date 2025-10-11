/**
 * 设备路由工具函数
 */

import type { DeviceType } from '@ldesign/device'
import type {
  DeviceComponentResolution,
  RouteComponent,
  RouteLocationNormalized,
  RouteLocationRaw,
} from '../types'

/**
 * 检查设备是否被路由支持
 */
export function checkDeviceSupport(
  route: RouteLocationNormalized,
  currentDevice: DeviceType,
): boolean {
  const supportedDevices = getSupportedDevicesFromRoute(route)

  if (!supportedDevices || supportedDevices.length === 0) {
    // 没有限制，支持所有设备
    return true
  }

  return supportedDevices.includes(currentDevice)
}

/**
 * 从路由中获取支持的设备类型
 */
export function getSupportedDevicesFromRoute(
  route: RouteLocationNormalized,
): DeviceType[] | undefined {
  // 优先使用路由元信息中的配置
  if (route.meta.supportedDevices) {
    return route.meta.supportedDevices
  }

  // 检查匹配的路由记录中是否有设备限制
  for (const record of route.matched) {
    if (record.meta.supportedDevices) {
      return record.meta.supportedDevices
    }
  }

  return undefined
}

/**
 * 解析设备特定组件
 */
export function resolveDeviceComponent(
  deviceComponents: Record<DeviceType, RouteComponent>,
  currentDevice: DeviceType,
): DeviceComponentResolution | null {
  // 优先使用当前设备的组件
  if (deviceComponents[currentDevice]) {
    return {
      component: deviceComponents[currentDevice],
      deviceType: currentDevice,
      isFallback: false,
      source: 'deviceComponents',
    }
  }

  // 回退策略：desktop -> tablet -> mobile
  const fallbackOrder: DeviceType[] = ['desktop', 'tablet', 'mobile']
  for (const fallbackDevice of fallbackOrder) {
    if (fallbackDevice !== currentDevice && deviceComponents[fallbackDevice]) {
      return {
        component: deviceComponents[fallbackDevice],
        deviceType: fallbackDevice,
        isFallback: true,
        source: 'deviceComponents',
      }
    }
  }

  return null
}

/**
 * 创建设备不支持的路由
 */
export function createUnsupportedDeviceRoute(
  originalRoute: RouteLocationNormalized,
  currentDevice: DeviceType,
  customMessage?: string,
): RouteLocationRaw {
  const message
    = customMessage
      || originalRoute.meta.unsupportedMessage
      || '当前系统不支持在此设备上查看'

  // 如果路由配置了自定义重定向
  if (originalRoute.meta.unsupportedRedirect) {
    return {
      path: originalRoute.meta.unsupportedRedirect,
      query: {
        from: originalRoute.fullPath,
        device: currentDevice,
        reason: 'unsupported_device',
      },
    }
  }

  // 使用默认的不支持页面
  return {
    path: '/device-unsupported',
    query: {
      from: originalRoute.fullPath,
      device: currentDevice,
      message,
    },
  }
}

/**
 * 检查路由是否有设备特定配置
 */
export function hasDeviceSpecificConfig(
  route: RouteLocationNormalized,
): boolean {
  // 检查是否有设备限制
  if (route.meta.supportedDevices && route.meta.supportedDevices.length > 0) {
    return true
  }

  // 检查匹配的路由记录中是否有设备特定组件
  for (const record of route.matched) {
    if ((record as any).deviceComponents) {
      return true
    }
    if (
      record.meta.supportedDevices
      && record.meta.supportedDevices.length > 0
    ) {
      return true
    }
  }

  return false
}

/**
 * 获取设备友好的名称
 */
export function getDeviceFriendlyName(device: DeviceType): string {
  const names: Record<DeviceType, string> = {
    mobile: '移动设备',
    tablet: '平板设备',
    desktop: '桌面设备',
    tv: '电视设备',
    watch: '智能手表',
    unknown: '未知设备',
  }
  return names[device] || device
}

/**
 * 创建设备信息对象
 */
export function createDeviceInfo(device: DeviceType) {
  return {
    type: device,
    name: getDeviceFriendlyName(device),
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
  }
}

/**
 * 验证设备类型
 */
export function isValidDeviceType(device: string): device is DeviceType {
  return ['mobile', 'tablet', 'desktop'].includes(device)
}

/**
 * 获取设备优先级（用于回退排序）
 */
export function getDevicePriority(device: DeviceType): number {
  const priorities: Record<DeviceType, number> = {
    desktop: 1,
    tablet: 2,
    mobile: 3,
    tv: 4,
    watch: 5,
    unknown: 999,
  }
  return priorities[device] || 999
}

/**
 * 排序设备类型（按优先级）
 */
export function sortDevicesByPriority(devices: DeviceType[]): DeviceType[] {
  return [...devices].sort(
    (a, b) => getDevicePriority(a) - getDevicePriority(b),
  )
}
