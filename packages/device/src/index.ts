// 核心类
export { DeviceDetector } from './core/DeviceDetector'
export { EventEmitter } from './core/EventEmitter'
export { ModuleLoader } from './core/ModuleLoader'

// 扩展模块
export { NetworkModule } from './modules/NetworkModule'
export { BatteryModule } from './modules/BatteryModule'
export { GeolocationModule } from './modules/GeolocationModule'

// 工具函数
export {
  debounce,
  throttle,
  isMobileDevice,
  isTouchDevice,
  getDeviceTypeByWidth,
  getScreenOrientation,
  parseOS,
  parseBrowser,
  getPixelRatio,
  isAPISupported,
  safeNavigatorAccess,
  formatBytes,
  generateId,
} from './utils'

// 类型定义
export type {
  DeviceType,
  Orientation,
  NetworkType,
  NetworkStatus,
  DeviceDetectorOptions,
  DeviceInfo,
  NetworkInfo,
  BatteryInfo,
  GeolocationInfo,
  EventListener,
  DeviceDetectorEvents,
  ModuleLoader as IModuleLoader,
  DeviceModule,
} from './types'

// 默认导出
export { DeviceDetector as default } from './core/DeviceDetector'
