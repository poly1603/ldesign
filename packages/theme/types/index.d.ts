import { createThemeManager } from './core/theme-manager.js'
export { ThemeManager } from './core/theme-manager.js'
export { default as ThemeButton } from './adapt/vue/components/ThemeButton.js'
export { default as ThemeProvider } from './adapt/vue/components/ThemeProvider.js'
export { default as ThemeSelector } from './adapt/vue/components/ThemeSelector.js'
export {
  useCurrentTheme,
  useTheme,
  useThemePreload,
  useThemeState,
  useThemeToggle,
} from './adapt/vue/composables/useTheme.js'
export {
  useAnimationControl,
  useAnimationPerformance,
  useAnimationSequence,
  useThemeAnimations,
} from './adapt/vue/composables/useThemeAnimations.js'
export {
  useDecorationBatch,
  useDecorationFilter,
  useThemeDecorations,
} from './adapt/vue/composables/useThemeDecorations.js'
export {
  clearAllAnimations,
  getElementAnimation,
  hasElementAnimation,
  pauseElementAnimation,
  resumeElementAnimation,
  stopElementAnimation,
  triggerElementAnimation,
  default as vThemeAnimation,
} from './adapt/vue/directives/theme-animation.js'
export {
  clearAllDecorations,
  getElementDecoration,
  hasElementDecoration,
  default as vThemeDecoration,
} from './adapt/vue/directives/theme-decoration.js'
export {
  default as ThemePlugin,
  default as VueThemePlugin,
  createThemeApp,
  installTheme,
} from './adapt/vue/plugin.js'
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
} from './adapt/vue/types.js'
export {
  AnimationManager,
  createAnimationManager,
} from './core/animation-manager.js'
export {
  DecorationManager,
  createDecorationManager,
} from './core/decoration-manager.js'
export {
  ResourceManager,
  createResourceManager,
} from './core/resource-manager.js'
export {
  AnimationConfig,
  AnimationKeyframe,
  AnimationManagerInstance,
  AnimationPerformance,
  AnimationType,
  DecorationCondition,
  DecorationConfig,
  DecorationManagerInstance,
  DecorationPosition,
  DecorationStyle,
  DecorationType,
  FestivalType,
  PerformanceOptions,
  Position,
  ResourceConfig,
  ResourceManagerInstance,
  ResourceStats,
  Size,
  StorageOptions,
  ThemeCategory,
  ThemeCompatibility,
  ThemeConfig,
  ThemeEventData,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
  ThemeManagerOptions,
  TimeRange,
} from './core/types.js'
export { BaseDecoration } from './decorations/elements/base.js'
export {
  FireworkDecoration,
  createCelebrationFireworks,
  createFireworkDecoration,
} from './decorations/elements/firework.js'
export {
  LanternDecoration,
  createLanternDecoration,
  createSpringFestivalLanterns,
} from './decorations/elements/lantern.js'
export {
  SnowflakeDecoration,
  createSnowfallEffect,
  createSnowflakeDecoration,
} from './decorations/elements/snowflake.js'
export { DecorationFactory } from './decorations/factory.js'
export { BaseAnimation } from './decorations/animations/base.js'
export { AnimationFactory } from './decorations/animations/factory.js'
export {
  FallingAnimation,
  createFallingAnimation,
} from './decorations/animations/falling.js'
export {
  FloatingAnimation,
  createFloatingAnimation,
} from './decorations/animations/floating.js'
export {
  SparklingAnimation,
  createSparklingAnimation,
} from './decorations/animations/sparkling.js'
export {
  createCustomTheme,
  defaultTheme,
  festivalThemes,
  getActiveThemeByTime,
  getFestivalTheme,
  getPresetTheme,
  getPresetThemeNames,
  getRandomPresetTheme,
  getSeasonalThemes,
  getThemeStats,
  getThemesByCategory,
  getThemesByTag,
  isPresetTheme,
  presetThemes,
  recommendedThemes,
  searchThemes,
  themesByCategory,
  themesByTag,
  validateTheme,
} from './themes/presets.js'
export {
  DeepPartial,
  OptionalKeys,
  Prettify,
  RequiredKeys,
  UnionToIntersection,
} from './types/utils.js'
export {
  EventEmitterImpl,
  createEventEmitter,
  defaultEventEmitter,
} from './utils/event-emitter.js'

/**
 * @ldesign/theme - 主题系统
 *
 * 提供完整的主题管理功能，包括节日主题、装饰元素和动画效果
 *
 * @version 0.1.0
 * @author LDesign Team
 */

declare const version = '0.1.0'
declare const _default: {
  version: string
  createThemeManager: typeof createThemeManager
}

export { createThemeManager, _default as default, version }
