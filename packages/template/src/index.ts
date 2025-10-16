/**
 * @ldesign/template - 多模板管理及动态渲染系统
 * 
 * 核心特性：
 * - 自动扫描模板：使用 import.meta.glob 自动扫描所有模板
 * - 懒加载：按需加载模板组件，优化性能
 * - 类型安全：完整的 TypeScript 类型支持
 * - Vue 集成：提供 Vue 组合式函数和组件
 */

// Vue 组件
export { TemplateRenderer, TemplateSelector } from './components'

// Vue 组合式函数
export {
  useDefaultTemplate,
  useTemplate,
  useTemplateList,
  useTemplateManager,
} from './composables'

// 核心模块
export {
  createTemplateManager,
  getLoader,
  getManager,
  getScanner,
  loadTemplate,
  preloadTemplate,
  scanTemplates,
  TemplateLoader,
  TemplateManager,
  TemplateScanner,
} from './core'

// 默认导出
export { getManager as default } from './core'

// 插件系统
export {
  createTemplatePlugin,
  type TemplatePlugin,
  type TemplatePluginOptions,
  TemplatePluginSymbol,
  useTemplatePlugin,
} from './plugin'

// 类型导出
export type * from './types'
