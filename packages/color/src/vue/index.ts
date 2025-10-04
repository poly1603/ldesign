/**
 * Vue 集成模块导出
 */

// Vue 组件暂时不导出，需要单独构建
// export { default as DarkModeToggle } from './components/DarkModeToggle.vue'
// export { default as ModeToggle } from './components/DarkModeToggle.vue'
// export { default as ThemeSelector } from './components/ThemeSelector.vue'
// export { default as ColorPicker } from './components/ThemeSelector.vue'

export { default as ColorThemeProvider } from './components/ColorThemeProvider.vue'
export { default as ModeToggle } from './components/DarkModeToggle.vue'
export { default as DarkModeToggle } from './components/DarkModeToggle.vue'
export { default as SimpleThemeToggle } from './components/SimpleThemeToggle.vue'
// Temporarily disabled due to missing LSelect, LDialog, LPopup components in @ldesign/shared
// export { default as ColorPicker } from './components/ThemeSelector.vue'
// export { default as ThemeSelector } from './components/ThemeSelector.vue'
// 导出组合式API
export { useColorTheme } from './composables/useColorTheme'
export type { UseColorThemeOptions, UseColorThemeReturn } from './composables/useColorTheme'
export { useSystemThemeSync } from './composables/useSystemThemeSync'
export type {
  UseSystemThemeSyncOptions,
  UseSystemThemeSyncReturn,
} from './composables/useSystemThemeSync'
export { useThemeSelector } from './composables/useThemeSelector'
export type {
  UseThemeSelectorOptions,
  UseThemeSelectorReturn,
} from './composables/useThemeSelector'
export { useThemeToggle } from './composables/useThemeToggle'
export type { UseThemeToggleOptions, UseThemeToggleReturn } from './composables/useThemeToggle'
// 导出插件
export {
  default as ColorVuePlugin,
  createColorEnginePlugin,
  createColorPlugin,
  useTheme,
} from './plugin'
// 导出类型
export type { ColorPluginOptions, UseThemeReturn } from './plugin'
