/**
 * Vue 集成模块 - 重构版本
 *
 * 提供 Vue 3 的组合式函数、组件和插件
 */

// ============ 类型定义 ============
export type { TemplatePluginOptions, UseTemplateOptions, UseTemplateReturn } from '../types'

// ============ 组件 ============
export { TemplateRenderer } from './components/TemplateRenderer'

// ============ 组合式函数 ============
export { createTemplateManager, useTemplate, useTemplate as useTemplateSystem } from './composables/useTemplate'

// ============ 插件 ============
export {
  createTemplatePlugin,
  destroyGlobalTemplateManager,
  getGlobalTemplateManager,
  TemplatePlugin,
  useTemplateManager,
} from './plugin'
