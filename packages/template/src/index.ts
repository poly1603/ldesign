// 核心类
export { TemplateManager } from './core/TemplateManager'

// 类型定义
export type * from './types'

export { LRUCache, TemplateCache } from './utils/cache'
// 工具函数
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
export { TemplateScanner } from './utils/scanner'
export { TemplateRenderer } from './vue/components/TemplateRenderer'

// Vue 集成 (从 vue 子包导出)
export { createTemplateManager, useTemplate } from './vue/composables/useTemplate'

export { registerTemplateDirective, templateDirective } from './vue/directives/template'
export { getGlobalTemplateManager, TemplatePlugin } from './vue/plugins'

// 默认导出插件
export { TemplatePlugin as default } from './vue/plugins'

