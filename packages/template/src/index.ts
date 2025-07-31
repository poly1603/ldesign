// 核心类
export { TemplateManager } from './core/TemplateManager'

// 类型定义
export type * from './types'

// Vue 集成 (从 vue 子包导出)
export { useTemplate, createTemplateManager } from './vue/composables/useTemplate'
export { TemplateRenderer } from './vue/components/TemplateRenderer'
export { templateDirective, registerTemplateDirective } from './vue/directives/template'
export { TemplatePlugin, getGlobalTemplateManager } from './vue/plugins'

// 工具函数
export {
  detectDevice,
  detectDeviceByViewport,
  detectDeviceByUserAgent,
  createDeviceWatcher,
  getDeviceInfo,
  checkDeviceSupport,
  getViewportWidth,
  getViewportHeight,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
  DEFAULT_BREAKPOINTS,
  DEFAULT_DEVICE_CONFIG
} from './utils/device'

export { TemplateScanner } from './utils/scanner'
export { TemplateCache, LRUCache } from './utils/cache'

// 默认导出插件
export { TemplatePlugin as default } from './vue/plugins'
