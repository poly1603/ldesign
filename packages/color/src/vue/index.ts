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

// 导出组合式API
export { useThemeSelector } from './composables/useThemeSelector'
export { useThemeToggle } from './composables/useThemeToggle'
export { useSystemThemeSync } from './composables/useSystemThemeSync'

// 导出组件
export { default as ThemeSelector } from './components/ThemeSelector.vue'
export { default as DarkModeToggle } from './components/DarkModeToggle.vue'

// 导出类型
export type { ColorPluginOptions } from './plugin'

// 别名导出（向后兼容）
export { default as ColorPicker } from './components/ThemeSelector.vue'
export { default as ModeToggle } from './components/DarkModeToggle.vue'