// 重新导出核心功能
export {
  BatteryModule,
  DeviceDetector,
  EventEmitter,
  GeolocationModule,
  ModuleLoader,
  NetworkModule,
} from '../../index'

// 重新导出类型
export type {
  BatteryInfo,
  DeviceDetectorEvents,
  DeviceDetectorOptions,
  DeviceDirectiveValue,
  DeviceInfo,
  DeviceModule,
  DevicePluginOptions,
  DeviceType,
  EventListener,
  GeolocationInfo,
  ModuleLoader as IModuleLoader,
  NetworkInfo,
  NetworkStatus,
  NetworkType,
  Orientation,
  UseDeviceReturn,
} from '../../types'

// Composition API
export {
  useBattery,
  useDevice,
  useGeolocation,
  useNetwork,
} from './composables/useDevice'

// 组件
// export { default as DeviceInfo } from './components/DeviceInfo.vue'

// 指令
export {
  cleanupGlobalDetector,
  vDevice,
  vDeviceDesktop,
  vDeviceMobile,
  vDeviceTablet,
} from './directives/vDevice'

// 插件
export { createDevicePlugin, DevicePlugin, useDeviceDetector } from './plugin'

// 默认导出插件
export { DevicePlugin as default } from './plugin'
