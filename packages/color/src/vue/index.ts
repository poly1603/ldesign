/**
 * Vue 集成模块导出
 */

export { default as DarkModeToggle } from './components/DarkModeToggle.vue'

export { default as ModeToggle } from './components/DarkModeToggle.vue'
// 导出组件
export { default as ThemeSelector } from './components/ThemeSelector.vue'
// 别名导出（向后兼容）
export { default as ColorPicker } from './components/ThemeSelector.vue'

export { useSystemThemeSync } from './composables/useSystemThemeSync'
// 导出组合式API
export { useThemeSelector } from './composables/useThemeSelector'

export { useThemeToggle } from './composables/useThemeToggle'

// 导出插件
export {
  default as ColorVuePlugin,
  createColorEnginePlugin,
  createColorPlugin,
  useTheme,
} from './plugin'
// 导出类型
export type { ColorPluginOptions } from './plugin'
