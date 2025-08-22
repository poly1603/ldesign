/**
 * Vue 集成模块 - 重构版本
 *
 * 提供 Vue 3 的组合式函数、组件和插件
 */

// ============ 类型定义 ============
export type { TemplatePluginOptions, UseTemplateOptions, UseTemplateReturn } from '../types'

export { default as LazyTemplate } from './components/LazyTemplate'
export { default as PerformanceMonitor } from './components/PerformanceMonitor'
// ============ 组件 ============
export { TemplateRenderer } from './components/TemplateRenderer'
export { TemplateSelector } from './components/TemplateSelector'

// ============ 组合式函数 ============
export { createTemplateManager, useTemplate, useTemplate as useTemplateSystem } from './composables/useTemplate'
export { useTemplateSelector } from './composables/useTemplateSelector'
export { useDynamicVirtualScroll, useSimpleVirtualScroll, useVirtualScroll } from './composables/useVirtualScroll'

// ============ 插件 ============
export {
  createTemplatePlugin,
  destroyGlobalTemplateManager,
  getGlobalTemplateManager,
  TemplatePlugin,
  useTemplateManager,
} from './plugin'

// ============ 模板配置 ============
// 注意：模板配置通过 TemplateScanner 自动扫描获取
// 使用 useTemplate() 或 TemplateManager.scanTemplates() 来获取配置
