export { default as ThemeButton } from './components/ThemeButton.js'
export { default as ThemeProvider } from './components/ThemeProvider.js'
export { default as ThemeSelector } from './components/ThemeSelector.js'
export {
  useCurrentTheme,
  useTheme,
  useThemePreload,
  useThemeState,
  useThemeToggle,
} from './composables/useTheme.js'
export {
  useAnimationControl,
  useAnimationPerformance,
  useAnimationSequence,
  useThemeAnimations,
} from './composables/useThemeAnimations.js'
export {
  useDecorationBatch,
  useDecorationFilter,
  useThemeDecorations,
} from './composables/useThemeDecorations.js'
export {
  clearAllAnimations,
  getElementAnimation,
  hasElementAnimation,
  pauseElementAnimation,
  resumeElementAnimation,
  stopElementAnimation,
  triggerElementAnimation,
  default as vThemeAnimation,
} from './directives/theme-animation.js'
export {
  clearAllDecorations,
  getElementDecoration,
  hasElementDecoration,
  default as vThemeDecoration,
} from './directives/theme-decoration.js'
export {
  default as ThemePlugin,
  default as VueThemePlugin,
  createThemeApp,
  installTheme,
} from './plugin.js'
export {
  ThemeAnimationProps,
  ThemeButtonProps,
  ThemeCardProps,
  ThemeComponentProps,
  ThemeContainerProps,
  ThemeDecorationProps,
  ThemePreviewProps,
  ThemeSelectorProps,
  ThemeToggleProps,
  UseThemeAnimationsReturn,
  UseThemeDecorationsReturn,
  UseThemeReturn,
  VThemeAnimationBinding,
  VThemeDecorationBinding,
  VueDirectiveBinding,
  VueThemeContext,
  VueThemeContextKey,
  VueThemeGlobalProperties,
  VueThemePluginOptions,
  VueThemeProviderProps,
} from './types.js'
export {
  AnimationConfig,
  DecorationConfig,
  ThemeConfig,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
} from '../../core/types.js'
