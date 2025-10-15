/**
 * @ldesign/template - 统一入口
 * 
 * 功能强大、性能卓越的 Vue3 模板管理和渲染系统
 * 
 * @author ldesign
 * @version 1.0.0
 */

// ======== 类型定义 ========
export type * from './types'

// ======== 核心层 ========
export {
  // 事件系统
  EventEmitter,
  getGlobalEmitter,
  resetGlobalEmitter,

  // 注册中心
  TemplateRegistry,
  getRegistry,
  resetRegistry,

  // 缓存管理
  CacheManager,
  getCache,
  resetCache,

  // 模板加载
  TemplateLoader,
  getLoader,
  resetLoader,

  // 设备检测
  DeviceDetector,
  getDeviceDetector,
  resetDeviceDetector,
  isMobile,
  isTablet,
  isDesktop,
} from './core'

export type { LoadOptions } from './core'

// ======== 运行时层 ========
export {
  // 模板管理器
  TemplateManager,
  createTemplateManager,

  // 生命周期
  LifecycleManager,
  getLifecycle,
  resetLifecycle,

  // 性能监控
  PerformanceMonitor,
  getMonitor,
  resetMonitor,
} from './runtime'

// ======== Vue集成层 ========
export {
  // Composables
  useDevice,
  useTemplateManager,
  useTemplate,
  useTemplateList,
  useTemplateScanner,

  // Components
  TemplateRenderer,
  TemplateSelector,

  // Plugin
  createTemplatePlugin,
  TemplatePlugin,
  TEMPLATE_MANAGER_KEY,
} from './vue'

export type {
  UseTemplateOptions,
  UseTemplateListOptions,
  UseTemplateScannerOptions,
  TemplatePluginOptions,
} from './vue'

// ======== 工具函数 ========
export {
  // 模板ID工具
  buildTemplateId,
  parseTemplateId,

  // 常用工具
  delay,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isBrowser,
  isDev,
  isPromise,
  safeExecute,
  formatBytes,
  generateId,
  compareVersion,

  // 常量
  DEFAULT_BREAKPOINTS,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_LOGGER_CONFIG,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_PRELOAD_CONFIG,
  ERROR_MESSAGES,
  PERFORMANCE_THRESHOLDS,
  VERSION,
  PLUGIN_VERSION,
} from './utils'

// ======== 模板扫描器 ========
export { simpleTemplateScanner, SimpleTemplateScanner } from './utils/simpleScanner'

// ======== 插件系统 ========
export { createPreloadPlugin, createLoggerPlugin } from './plugins'

// ======== 默认导出 ========
export { default } from './vue/plugin'

// ======== 版本信息 ========
export const version = '1.0.0'
