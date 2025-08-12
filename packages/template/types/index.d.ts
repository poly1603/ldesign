export { default as TemplateSelector } from './components/TemplateSelector.js'
export { LRUCache, TemplateCache } from './core/cache/index.js'
export { detectDeviceType, getDeviceInfo as getDeviceInfoCore, watchDeviceChange } from './core/device.js'
export { TemplateManager } from './core/TemplateManager.js'
export {
  TemplateEnginePluginOptions,
  createTemplateEnginePlugin,
  defaultTemplateEnginePlugin,
} from './engine/plugin.js'
export {
  DeviceDetectionConfig,
  DeviceType,
  ResponsiveBreakpoints,
  TemplateChangeEvent,
  TemplateComponent,
  TemplateConfig,
  TemplateDirectiveBinding,
  TemplateInfo,
  TemplateLoadResult,
  TemplateLoadingState,
  TemplateManagerConfig,
  TemplateManagerEvents,
  TemplateMetadata,
  TemplatePluginOptions,
  TemplateRenderOptions,
  TemplateRendererProps,
  TemplateScanResult,
  UseTemplateOptions,
  UseTemplateReturn,
} from './types/index.js'
export {
  DEFAULT_BREAKPOINTS,
  DEFAULT_DEVICE_CONFIG,
  checkDeviceSupport,
  createDeviceWatcher,
  detectDevice,
  detectDeviceByUserAgent,
  detectDeviceByViewport,
  getDeviceInfo,
  getViewportHeight,
  getViewportWidth,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
} from './utils/device.js'
export { TemplateScanner } from './utils/scanner.js'
export { default as TemplateRenderer } from './vue/components/TemplateRenderer.js'
export { createTemplateManager, useTemplate } from './vue/composables/useTemplate.js'
export { registerTemplateDirective, default as templateDirective } from './vue/directives/template.js'
export { default as TemplatePlugin, default, getGlobalTemplateManager } from './vue/plugins/index.js'
