import type { DeviceDetectorOptions } from './types'
// 核心类
// 工厂函数
import { DeviceDetector } from './core/DeviceDetector'

export { DeviceDetector } from './core/DeviceDetector'
// 默认导出
export { DeviceDetector as default } from './core/DeviceDetector'
export { EventEmitter } from './core/EventEmitter'

/**
 * 创建设备检测器实例的工厂函数
 * 
 * @param options - 设备检测器配置选项
 * @returns DeviceDetector 实例
 * 
 * @example
 * ```typescript
 * // 使用默认配置
 * const detector = createDeviceDetector()
 * 
 * // 使用自定义配置
 * const detector = createDeviceDetector({
 *   enableResize: true,
 *   enableOrientation: true,
 *   modules: ['network', 'battery']
 * })
 * ```
 */
export function createDeviceDetector(options?: DeviceDetectorOptions): DeviceDetector {
  return new DeviceDetector(options)
}

export { ModuleLoader } from './core/ModuleLoader'
// Engine集成
export * from './engine'
export { BatteryModule } from './modules/BatteryModule'

// 新增模块
export { FeatureDetectionModule } from './modules/FeatureDetectionModule'
export type { FeatureDetectionEvents, FeatureDetectionInfo } from './modules/FeatureDetectionModule'

export { GeolocationModule } from './modules/GeolocationModule'

export { MediaModule } from './modules/MediaModule'

export type { MediaDeviceInfo, MediaDeviceItem, MediaModuleEvents } from './modules/MediaModule'
// 扩展模块
export { NetworkModule } from './modules/NetworkModule'

export { PerformanceModule } from './modules/PerformanceModule'
export type { DevicePerformanceInfo, PerformanceModuleEvents, PerformanceTestOptions } from './modules/PerformanceModule'

// 类型定义
export type {
  BatteryInfo,
  DeviceDetectorEvents,
  DeviceDetectorOptions,
  DeviceInfo,
  DeviceModule,
  DeviceType,
  EventListener,
  GeolocationInfo,
  ModuleLoader as IModuleLoader,
  NetworkInfo,
  NetworkStatus,
  NetworkType,
  Orientation,
} from './types'

// 工具函数
export {
  debounce,
  formatBytes,
  generateId,
  getDeviceTypeByWidth,
  getPixelRatio,
  getScreenOrientation,
  isAPISupported,
  isMobileDevice,
  isTouchDevice,
  parseBrowser,
  parseOS,
  safeNavigatorAccess,
  throttle,
} from './utils'

// Vue集成
export * from './vue'
