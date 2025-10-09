/**
 * @ldesign/router 设备适配模块
 *
 * 提供路由系统的设备适配功能，包括设备检测、访问控制、组件解析等
 */

// 类型定义
export type {
  DeviceComponentResolution,
  DeviceGuardOptions,
  DeviceRouteConfig,
  DeviceRouterPluginOptions,
} from '../types'
// 核心功能
export { DeviceRouteGuard } from './guard'
export { createDeviceRouterPlugin } from './plugin'
export { DeviceComponentResolver } from './resolver'

// 工具函数
export {
  checkDeviceSupport,
  createUnsupportedDeviceRoute,
  resolveDeviceComponent,
} from './utils'
