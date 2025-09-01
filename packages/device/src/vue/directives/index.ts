/**
 * Vue 3 自定义指令集合
 * 
 * 提供了一系列用于设备检测和响应式布局的 Vue 指令
 */

// 设备类型指令
export {
  vDevice,
  vDeviceMobile,
  vDeviceTablet,
  vDeviceDesktop,
  cleanupGlobalDetector,
} from './vDevice'

// 屏幕方向指令
export {
  vOrientation,
  vOrientationPortrait,
  vOrientationLandscape,
} from './vOrientation'

// 网络状态指令
export {
  vNetwork,
  vNetworkOnline,
  vNetworkOffline,
  vNetworkSlow,
} from './vNetwork'

// 电池状态指令
export {
  vBattery,
  vBatteryCharging,
  vBatteryLow,
} from './vBattery'
