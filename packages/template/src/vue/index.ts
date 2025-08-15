/**
 * Vue 集成模块 - 重构版本
 *
 * 提供 Vue 3 的组合式函数、组件和插件
 */

// ============ 组合式函数 ============
export { createTemplateManager, useTemplate, useTemplate as useTemplateSystem } from './composables/useTemplate'

// ============ 组件 ============
export { TemplateRenderer } from './components/TemplateRenderer'

// ============ 插件 ============
export {
  TemplatePlugin,
  createTemplatePlugin,
  getGlobalTemplateManager,
  destroyGlobalTemplateManager,
  useTemplateManager,
} from './plugin'

// ============ 类型定义 ============
export type { UseTemplateOptions, UseTemplateReturn, TemplatePluginOptions } from '../types'
