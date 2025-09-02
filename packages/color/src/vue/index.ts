/**
 * Vue 集成模块导出
 */

// 导出插件
export {
  createColorEnginePlugin,
  createColorPlugin,
  useTheme,
  default as ColorVuePlugin
} from './plugin'

// 导出组件
export { default as ThemeSelector } from './components/ThemeSelector.vue'
export { default as DarkModeToggle } from './components/DarkModeToggle.vue'

// 导出类型
export type { ColorPluginOptions } from './plugin'
