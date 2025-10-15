/**
 * @ldesign/template - 统一入口
 *
 * 功能强大、性能卓越的 Vue3 模板管理和渲染系统
 *
 * @author ldesign
 * @version 1.0.0
 */

// ======== 核心层 ========
export {
  // 缓存管理
  CacheManager,
  // 设备检测
  DeviceDetector,
  // 事件系统
  EventEmitter,

  getCache,
  getDeviceDetector,
  getGlobalEmitter,

  getLoader,
  getRegistry,
  isDesktop,

  isMobile,
  isTablet,
  resetCache,

  resetDeviceDetector,
  resetGlobalEmitter,
  resetLoader,
  resetRegistry,
  // 模板加载
  TemplateLoader,
  // 注册中心
  TemplateRegistry,
} from './core'

export type { LoadOptions } from './core'

// ======== 插件系统 ========
export { createLoggerPlugin, createPreloadPlugin } from './plugins'

// ======== 运行时层 ========
export {
  createTemplateManager,
  getLifecycle,

  getMonitor,
  // 生命周期
  LifecycleManager,
  // 性能监控
  PerformanceMonitor,

  resetLifecycle,
  resetMonitor,
  // 模板管理器
  TemplateManager,
} from './runtime'

// ======== 类型定义 ========
export type * from './types'

// ======== 工具函数 ========
export {
  // 模板ID工具
  buildTemplateId,
  compareVersion,

  debounce,
  deepClone,
  deepMerge,
  DEFAULT_ANIMATION_DURATION,
  // 常量
  DEFAULT_BREAKPOINTS,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_LOGGER_CONFIG,
  DEFAULT_PRELOAD_CONFIG,
  // 常用工具
  delay,
  ERROR_MESSAGES,
  formatBytes,
  generateId,

  isBrowser,
  isDev,
  isPromise,
  parseTemplateId,
  PERFORMANCE_THRESHOLDS,
  PLUGIN_VERSION,
  safeExecute,
  throttle,
  VERSION,
} from './utils'

// ======== 模板扫描器 ========
export { simpleTemplateScanner, SimpleTemplateScanner } from './utils/simpleScanner'

// ======== Vue集成层 ========
export {
  // Plugin
  createTemplatePlugin,
  TEMPLATE_MANAGER_KEY,
  TemplatePlugin,
  // Components
  TemplateRenderer,
  TemplateSelector,
  EnhancedTemplateSwitcher,

  // Composables
  useDevice,
  useTemplate,

  useTemplateList,
  useTemplateManager,
  useTemplateScanner,
} from './vue'

export type {
  TemplatePluginOptions,
  UseTemplateListOptions,
  UseTemplateOptions,
  UseTemplateScannerOptions,
} from './vue'

// ======== 默认导出 ========
export { default } from './vue/plugin'

// ======== 版本信息 ========
export const version = '1.0.0'
