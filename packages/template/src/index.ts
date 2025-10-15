/**
 * @ldesign/template - 多模板管理及动态渲染系统
 * 
 * 核心特性：
 * - 自动扫描模板：使用 import.meta.glob 自动扫描所有模板
 * - 懒加载：按需加载模板组件，优化性能
 * - 类型安全：完整的 TypeScript 类型支持
 * - Vue 集成：提供 Vue 组合式函数和组件
 */

// 类型导出
export type * from './types'

// 核心模块
export {
  TemplateScanner,
  TemplateLoader,
  TemplateManager,
  getScanner,
  getLoader,
  getManager,
  scanTemplates,
  loadTemplate,
  preloadTemplate,
  createTemplateManager,
} from './core'

// Vue 组合式函数
export {
  useTemplate,
  useTemplateList,
  useDefaultTemplate,
  useTemplateManager,
} from './composables'

// Vue 组件
export { TemplateRenderer, TemplateSelector } from './components'

// 默认导出
export { getManager as default } from './core'
