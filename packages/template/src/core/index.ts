/**
 * 核心层统一导出
 *
 * 零依赖的核心功能模块
 */

// 缓存管理
export { CacheManager, getCache, resetCache } from './cache'

// 设备检测
export {
  DeviceDetector,
  getDeviceDetector,
  isDesktop,
  isMobile,
  isTablet,
  resetDeviceDetector,
} from './device'

// 事件系统
export { EventEmitter, getGlobalEmitter, resetGlobalEmitter } from './events'

// 模板加载
export { getLoader, resetLoader, TemplateLoader } from './loader'
export type { LoadOptions } from './loader'

// 注册中心
export { getRegistry, resetRegistry, TemplateRegistry } from './registry'
