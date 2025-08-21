/**
 * 设备路由守卫
 *
 * 提供设备访问控制功能，检查当前设备是否被路由支持
 */

import type { DeviceType } from '@ldesign/device'
import type {
  DeviceGuardOptions,
  NavigationGuard,
  RouteLocationNormalized,
  RouteLocationRaw,
} from '../types'

/**
 * 设备路由守卫类
 */
export class DeviceRouteGuard {
  private options: DeviceGuardOptions
  private getCurrentDevice: () => DeviceType

  constructor(
    getCurrentDevice: () => DeviceType,
    options: DeviceGuardOptions = {},
  ) {
    this.getCurrentDevice = getCurrentDevice
    this.options = {
      checkSupportedDevices: this.defaultCheckSupportedDevices,
      onUnsupportedDevice: this.defaultOnUnsupportedDevice,
      ...options,
    }
  }

  /**
   * 创建导航守卫
   */
  createGuard(): NavigationGuard {
    return async (to, _from, next) => {
      const currentDevice = this.getCurrentDevice()

      // 检查路由是否配置了设备限制
      const supportedDevices = this.getSupportedDevices(to)

      if (!supportedDevices || supportedDevices.length === 0) {
        // 没有设备限制，允许访问
        next()
        return
      }

      // 检查当前设备是否被支持
      const isSupported = this.options.checkSupportedDevices!(
        supportedDevices,
        currentDevice,
        to,
      )

      if (isSupported) {
        next()
      }
      else {
        // 设备不支持，执行处理逻辑
        const result = this.options.onUnsupportedDevice!(currentDevice, to)
        if (result) {
          next(result)
        }
        else {
          // 如果没有返回重定向，则阻止导航
          next(false)
        }
      }
    }
  }

  /**
   * 获取路由支持的设备类型
   */
  private getSupportedDevices(
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
   * 默认的设备支持检查函数
   */
  private defaultCheckSupportedDevices = (
    supportedDevices: DeviceType[],
    currentDevice: DeviceType,
    _route: RouteLocationNormalized,
  ): boolean => {
    return supportedDevices.includes(currentDevice)
  }

  /**
   * 默认的不支持设备处理函数
   */
  private defaultOnUnsupportedDevice = (
    currentDevice: DeviceType,
    route: RouteLocationNormalized,
  ): RouteLocationRaw | void => {
    // 优先使用路由配置的重定向
    if (route.meta.unsupportedRedirect) {
      return {
        path: route.meta.unsupportedRedirect,
        query: {
          from: route.fullPath,
          device: currentDevice,
          reason: 'unsupported_device',
        },
      }
    }

    // 使用默认的不支持页面
    return {
      path: '/device-unsupported',
      query: {
        from: route.fullPath,
        device: currentDevice,
        message:
          route.meta.unsupportedMessage || '当前系统不支持在此设备上查看',
      },
    }
  }
}

/**
 * 创建设备路由守卫的便捷函数
 */
export function createDeviceGuard(
  getCurrentDevice: () => DeviceType,
  options?: DeviceGuardOptions,
): NavigationGuard {
  const guard = new DeviceRouteGuard(getCurrentDevice, options)
  return guard.createGuard()
}
