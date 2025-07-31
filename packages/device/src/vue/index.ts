// Composition API
export {
  useDevice,
  useNetwork,
  useBattery,
  useGeolocation,
} from './composables/useDevice'

// 指令
export {
  vDevice,
  vDeviceMobile,
  vDeviceTablet,
  vDeviceDesktop,
  cleanupGlobalDetector,
} from './directives/vDevice'

// 插件
export {
  DevicePlugin,
  createDevicePlugin,
  useDeviceDetector,
} from './plugin'

// 组件
// export { default as DeviceInfo } from './components/DeviceInfo.vue'

// 重新导出核心功能
export {
  DeviceDetector,
  EventEmitter,
  ModuleLoader,
  NetworkModule,
  BatteryModule,
  GeolocationModule,
} from '../index'

// 重新导出类型
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
  UseDeviceReturn,
  DeviceDirectiveValue,
  DevicePluginOptions,
} from '../types'

// 默认导出插件
export { DevicePlugin as default } from './plugin'
