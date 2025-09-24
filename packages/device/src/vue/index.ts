// 重新导出核心功能
export { DeviceDetector } from '../core/DeviceDetector'
export { EventEmitter } from '../core/EventEmitter'
export { ModuleLoader } from '../core/ModuleLoader'
export { BatteryModule } from '../modules/BatteryModule'
export { GeolocationModule } from '../modules/GeolocationModule'
export { NetworkModule } from '../modules/NetworkModule'

// 重新导出类型
export type {
  BatteryInfo,
  DeviceDetectorEvents,
  DeviceDetectorOptions,
  DeviceDirectiveValue,
  DeviceInfo as DeviceInfoType,
  DeviceModule,
  DevicePluginOptions,
  DeviceType,
  EventListener,
  GeolocationInfo,
  ModuleLoader as IModuleLoader,
  NetworkInfo,
  NetworkStatus as NetworkStatusType,
  NetworkType,
  Orientation,
  UseDeviceReturn,
} from '../types'

// 组件 - Vue组件
export { DeviceInfo, NetworkStatus } from './components'

// Composition API - 主要的Vue集成API
export {
  useBattery,
  useBreakpoints,
  useDevice,
  useGeolocation,
  useNetwork,
  useOrientation,
} from './composables'

// 指令 - Vue指令集成
export {
  cleanupGlobalDetector,
  vDevice,
  vDeviceDesktop,
  vDeviceMobile,
  vDeviceTablet,
} from './directives'

// 插件 - Vue插件系统
export { createDevicePlugin, DevicePlugin, useDeviceDetector } from './plugin'

// 默认导出插件 - 便于快速使用
export { DevicePlugin as default } from './plugin'
