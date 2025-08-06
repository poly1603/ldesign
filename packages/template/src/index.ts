// ============ 核心模块 ============
export { TemplateManager } from './core/TemplateManager'

// ============ 类型定义 ============
export type * from './types'

// ============ 缓存管理 ============
export { LRUCache, TemplateCache } from './utils/cache'

// ============ 设备检测 ============
export {
  checkDeviceSupport,
  createDeviceWatcher,
  DEFAULT_BREAKPOINTS,
  DEFAULT_DEVICE_CONFIG,
  detectDevice,
  detectDeviceByUserAgent,
  detectDeviceByViewport,
  getDeviceInfo,
  getViewportHeight,
  getViewportWidth,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
} from './utils/device'

// 新的设备检测模块导出
export {
  detectDeviceType,
  getDeviceInfo as getDeviceInfoCore,
  watchDeviceChange,
} from './core/device'

// ============ 模板扫描 ============
export { TemplateScanner } from './utils/scanner'
export { TemplateRenderer } from './vue/components/TemplateRenderer'

// Vue 集成 (从 vue 子包导出)
export { createTemplateManager, useTemplate } from './vue/composables/useTemplate'

export { registerTemplateDirective, templateDirective } from './vue/directives/template'
export { getGlobalTemplateManager, TemplatePlugin } from './vue/plugins'

// 默认导出插件
export { TemplatePlugin as default } from './vue/plugins'
