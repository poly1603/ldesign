/**
 * Vue 3 自定义指令集合
 *
 * 提供了一系列用于设备检测和响应式布局的 Vue 指令
 */

// 电池状态指令
export {
  vBattery,
  vBatteryCharging,
  vBatteryLow,
} from './vBattery'

// 设备类型指令
export {
  cleanupGlobalDetector,
  vDevice,
  vDeviceDesktop,
  vDeviceMobile,
  vDeviceTablet,
} from './vDevice'

// 网络状态指令
export {
  vNetwork,
  vNetworkOffline,
  vNetworkOnline,
  vNetworkSlow,
} from './vNetwork'

// 屏幕方向指令
export {
  vOrientation,
  vOrientationLandscape,
  vOrientationPortrait,
} from './vOrientation'
