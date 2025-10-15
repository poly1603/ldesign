/**
 * Vue 集成层统一导出
 */

// Components
export * from './components'

// Composables
export * from './composables'

// Plugin
export { createTemplatePlugin, TEMPLATE_MANAGER_KEY } from './plugin'
export type { TemplatePluginOptions } from './plugin'
export { default as TemplatePlugin } from './plugin'
