/**
 * @ldesign/theme - Vue 适配层导出
 *
 * 统一导出所有 Vue 集成相关的功能
 */

// 组件
export { ThemeButton, ThemeProvider, ThemeSelector } from './components'

// 组合式函数
export {
  useCurrentTheme,
  useTheme,
  useThemePreload,
  useThemeState,
  useThemeToggle,
} from './composables/useTheme'

export {
  useAnimationControl,
  useAnimationPerformance,
  useAnimationSequence,
  useThemeAnimations,
} from './composables/useThemeAnimations'

export {
  useDecorationBatch,
  useDecorationFilter,
  useThemeDecorations,
} from './composables/useThemeDecorations'

// 指令
export { vThemeAnimation, vThemeDecoration } from './directives'

export {
  clearAllAnimations,
  getElementAnimation,
  hasElementAnimation,
  pauseElementAnimation,
  resumeElementAnimation,
  stopElementAnimation,
  triggerElementAnimation,
} from './directives/theme-animation'

// 指令工具函数
export {
  clearAllDecorations,
  getElementDecoration,
  hasElementDecoration,
} from './directives/theme-decoration'

// 插件
export {
  createThemeApp,
  installTheme,
  default as ThemePlugin,
  VueThemePlugin,
} from './plugin'

// 类型
export type * from './types'

// 上下文键
export { VueThemeContextKey } from './types'
