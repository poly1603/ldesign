// 核心类
export { DeviceDetector } from './core/DeviceDetector'
// 默认导出
export { DeviceDetector as default } from './core/DeviceDetector'
export { EventEmitter } from './core/EventEmitter'

export { ModuleLoader } from './core/ModuleLoader'
// Engine集成
export * from './engine'
export { BatteryModule } from './modules/BatteryModule'

export { GeolocationModule } from './modules/GeolocationModule'
export { MediaModule } from './modules/MediaModule'

export type { MediaDeviceInfo, MediaDeviceItem, MediaModuleEvents } from './modules/MediaModule'

// 扩展模块
export { NetworkModule } from './modules/NetworkModule'

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
