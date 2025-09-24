/**
 * Vue 3 组合式 API 集合
 *
 * 提供了一系列用于设备检测和状态监听的组合式函数
 */

// 电池状态检测
export { useBattery } from './useBattery'

// 响应式断点管理
export { useBreakpoints } from './useBreakpoints'

export type { BreakpointConfig } from './useBreakpoints'

// 设备检测相关
export { useDevice, useNetwork } from './useDevice'

// 地理位置检测
export { useGeolocation } from './useGeolocation'
// 屏幕方向检测
export { useOrientation } from './useOrientation'
