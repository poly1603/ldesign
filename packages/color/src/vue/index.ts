/**
 * Vue 集成模块导出
 */

// Vue 组件暂时不导出，需要单独构建
// export { default as DarkModeToggle } from './components/DarkModeToggle.vue'
// export { default as ModeToggle } from './components/DarkModeToggle.vue'
// export { default as ThemeSelector } from './components/ThemeSelector.vue'
// export { default as ColorPicker } from './components/ThemeSelector.vue'

// 导出组合式API
export { useSystemThemeSync } from './composables/useSystemThemeSync'
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
