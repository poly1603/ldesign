/**
 * @ldesign/theme - Vue 适配层导出
 *
 * 统一导出所有 Vue 集成相关的功能
 */

// 插件
export {
  VueThemePlugin,
  createThemeApp,
  installTheme,
  default as ThemePlugin,
} from './plugin'

// 组件
export { ThemeProvider, ThemeButton, ThemeSelector } from './components'

// 组合式函数
export {
  useTheme,
  useCurrentTheme,
  useThemeState,
  useThemeToggle,
  useThemePreload,
} from './composables/useTheme'

export {
  useThemeDecorations,
  useDecorationFilter,
  useDecorationBatch,
} from './composables/useThemeDecorations'

export {
  useThemeAnimations,
  useAnimationControl,
  useAnimationSequence,
  useAnimationPerformance,
} from './composables/useThemeAnimations'

// 指令
export { vThemeDecoration, vThemeAnimation } from './directives'
export {
  vElementDecoration,
  updateTheme,
} from './directives/element-decoration'

// 指令工具函数
export {
  getElementDecoration,
  hasElementDecoration,
  clearAllDecorations,
} from './directives/theme-decoration'

export {
  getElementAnimation,
  hasElementAnimation,
  triggerElementAnimation,
  stopElementAnimation,
  pauseElementAnimation,
  resumeElementAnimation,
  clearAllAnimations,
} from './directives/theme-animation'

// 简化API - 临时注释掉
// export {
//   SimpleThemeAPI,
//   simpleTheme,
//   setTheme,
//   setFestivalTheme,
//   randomTheme,
//   resetTheme,
//   toggleMode,
//   setIntensity,
//   setAnimation,
//   onThemeChange,
// } from './simple-api'

// export type { ThemeOptions } from './simple-api'

// 类型
export type * from './types'

// 上下文键
export { VueThemeContextKey } from './types'
