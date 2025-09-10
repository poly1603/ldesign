/**
 * @file Vue 3 集成
 * @description Vue 3 组件、指令、组合式函数和插件的导出
 */

// 导出 Vue 插件
export { VueThemePlugin } from './plugin'

// 导出 Vue 组件
export { default as ThemeProvider } from './components/ThemeProvider.vue'
export { default as ThemeSelector } from './components/ThemeSelector.vue'
export { default as ThemeButton } from './components/ThemeButton.vue'
export { default as WidgetContainer } from './components/WidgetContainer.vue'
export { default as AnimationWrapper } from './components/AnimationWrapper.vue'

// 导出组合式函数
export {
  useTheme,
  useThemeSelector,
  useThemeToggle,
  useWidgets,
  useAnimations,
  useResponsiveWidgets
} from './composables'

// 导出指令
export {
  vThemeDecoration,
  vThemeAnimation,
  vWidgetContainer
} from './directives'

// 导出类型
export type {
  VueThemePluginOptions,
  ThemeProviderProps,
  ThemeSelectorProps,
  ThemeButtonProps,
  WidgetContainerProps,
  AnimationWrapperProps
} from './types'
