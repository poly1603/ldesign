/**
 * Vue 集成层统一导出
 */

// Composables
export * from './composables'

// Components
export * from './components'

// Plugin
export { createTemplatePlugin, TEMPLATE_MANAGER_KEY } from './plugin'
export type { TemplatePluginOptions } from './plugin'
export { default as TemplatePlugin } from './plugin'
