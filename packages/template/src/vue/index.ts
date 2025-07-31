// Vue 专用导出
export { useTemplate } from './composables/useTemplate'
export { TemplateRenderer } from './components/TemplateRenderer'
export { templateDirective, registerTemplateDirective } from './directives/template'
export { TemplatePlugin, getGlobalTemplateManager } from './plugins'

// 类型定义
export type {
  TemplateRendererProps,
  TemplateDirectiveBinding,
  UseTemplateOptions,
  UseTemplateReturn,
  TemplatePluginOptions
} from './types'

// 默认导出插件
export { TemplatePlugin as default } from './plugins'
