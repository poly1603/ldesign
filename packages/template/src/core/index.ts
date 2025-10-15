/**
 * 核心层统一导出
 * 
 * 零依赖的核心功能模块
 */

// 事件系统
export { EventEmitter, getGlobalEmitter, resetGlobalEmitter } from './events'

// 注册中心
export { TemplateRegistry, getRegistry, resetRegistry } from './registry'

// 缓存管理
export { CacheManager, getCache, resetCache } from './cache'

// 模板加载
export { TemplateLoader, getLoader, resetLoader } from './loader'
export type { LoadOptions } from './loader'

// 设备检测
export {
  DeviceDetector,
  getDeviceDetector,
  resetDeviceDetector,
  isMobile,
  isTablet,
  isDesktop,
} from './device'
