/**
 * 设备类型检测和管理 - 核心模块入口
 * 重新导出utils/device中的功能，保持API一致性
 */

import type { DeviceType } from '../types'
import {
  detectDevice as utilsDetectDevice,
  getDeviceInfo as utilsGetDeviceInfo,
  createDeviceWatcher as utilsCreateDeviceWatcher,
} from '../utils/device'

// 重新导出DeviceType
export type { DeviceType }

// 重新导出utils中的类型和常量
export type { DeviceDetectionConfig } from '../types'
export { DEFAULT_DEVICE_CONFIG, DEFAULT_BREAKPOINTS } from '../utils/device'

export interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  isTouch: boolean
  userAgent: string
  timestamp: number
}

/**
 * 检测当前设备类型 - 委托给utils实现
 */
export function detectDeviceType(): DeviceType {
  return utilsDetectDevice()
}

/**
 * 获取设备信息 - 委托给utils实现并适配接口
 */
export function getDeviceInfo(): DeviceInfo {
  const utilsInfo = utilsGetDeviceInfo()
  return {
    type: utilsInfo.device,
    width: utilsInfo.width,
    height: utilsInfo.height,
    isTouch: utilsInfo.isTouch,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: Date.now(),
  }
}

// 重新导出utils中的设备检测功能
export {
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
  getViewportWidth,
  getViewportHeight,
} from '../utils/device'

/**
 * 监听设备变化 - 使用utils实现并适配接口
 */
export function watchDeviceChange(
  callback: (deviceInfo: DeviceInfo) => void
): () => void {
  return utilsCreateDeviceWatcher(_deviceType => {
    // 当设备类型变化时，获取完整的设备信息
    const deviceInfo = getDeviceInfo()
    callback(deviceInfo)
  })
}

/**
 * 获取设备类型的CSS类名
 */
export function getDeviceClassName(deviceType?: DeviceType): string {
  const type = deviceType ?? detectDeviceType()
  return `device-${type}`
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

/**
 * 检测是否为高分辨率设备
 */
export function isHighDPIDevice(): boolean {
  return getDevicePixelRatio() > 1
}
