/**
 * Vue 集成模块导出
 * @ldesign/template Vue 3 集成
 */

// 组件 - 在开发环境中直接导入，避免构建问题
// export { default as TemplateRenderer } from './components/TemplateRenderer.vue'
// export { default as TemplateRendererWithSelector } from './components/TemplateRendererWithSelector.vue'
// export { default as TemplateSelector } from './components/TemplateSelector.vue'

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
