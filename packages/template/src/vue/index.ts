/**
 * Vue 集成模块导出
 * @ldesign/template Vue 3 集成
 */

// 组件 - Vue组件通过Vite单独构建
// 在构建的esm/vue/index.js中可以找到：
// export { TemplateRenderer, TemplateSelector }
//
// 为了避免Rollup构建冲突，这里不直接导出Vue组件
// Vue组件的导出由Vite构建处理

// 重新导出类型
export type * from '../types'

// 组合式函数
export {
  useTemplate,
  useTemplateCache,
  useTemplateScanner,
} from './composables/useTemplate'

export {
  createExternalTemplate,
  createExternalTemplateFromPath,
  useTemplateExtension,
} from './composables/useTemplateExtension'

export {
  useTemplateRegistry,
} from './composables/useTemplateRegistry'

// 指令
export {
  installTemplateDirectives,
  templateDirectives,
  vTemplate,
  vTemplateCache,
  vTemplateLazy,
  vTemplatePreload,
} from './directives/template'

// 插件
export {
  configureTemplateManager,
  createTemplatePlugin,
  install,
  TemplateManagerSymbol,
  TemplatePlugin,
  useTemplateManager,
} from './plugin'

// 默认导出插件
export { TemplatePlugin as default } from './plugin'
export * from './components'