/**
 * @ldesign/size - A powerful size management system for web applications
 */

// Accessibility exports
export {
  a11y,
  AccessibilityEnhancer,
  type ColorBlindnessType,
  type ComplianceReport,
  type ContrastRatio,
  getAccessibilityEnhancer,
  type WCAGLevel
} from './core/AccessibilityEnhancer'

// AI Optimizer exports
export {
  ai,
  AIOptimizer,
  type AIOptimizerConfig,
  getAIOptimizer,
  type OptimizationSuggestion,
  type PageContext,
  type ReadabilityOptions
} from './core/AIOptimizer'

// Animation exports
export { 
  animate,
  AnimationManager,
  type AnimationOptions,
  getAnimationManager
} from './core/AnimationManager'

// CSS Generator exports
export {
  generateCSS,
  generateCSSString,
  generateCSSVariables,
  injectCSS,
  removeCSS
} from './core/cssGenerator'

// Device Detection exports
export {
  DEFAULT_BREAKPOINTS,
  device,
  DeviceDetector,
  getDeviceDetector
} from './core/DeviceDetector'

// Fluid Size exports
export {
  fluid,
  FluidSizeCalculator,
  fluidTypographyPresets,
  getFluidSizeCalculator,
  modularScaleRatios
} from './core/FluidSize'

// Size class exports
export {
  em,
  percent,
  px,
  rem,
  Size,
  size,
  vh,
  vw
} from './core/Size'

// Size Analyzer exports
export {
  analyze,
  getSizeAnalyzer,
  type PerformanceMetrics,
  SizeAnalyzer,
  type SizeSpecDoc,
  type SizeUsageReport,
  type ValidationReport
} from './core/SizeAnalyzer'

// Core exports
export { 
  type SizeChangeListener, 
  type SizeConfig, 
  SizeManager, 
  sizeManager, 
  type SizePreset 
} from './core/SizeManager'
// Migration Tool exports
export {
  createMigrationGuide,
  detectFramework,
  type Framework,
  migrateFrom,
  type MigrationConfig,
  type MigrationReport,
  SizeMigration
} from './core/SizeMigration'

// Theme exports
export {
  getThemeManager,
  theme,
  type Theme,
  type ThemeConfig,
  ThemeManager,
  type ThemeManagerOptions
} from './core/ThemeManager'
// Unit Strategy exports
export {
  getUnitStrategyManager,
  units,
  UnitStrategyManager
} from './core/UnitStrategy'

// Locale exports
export { 
  deDE, 
  enUS, 
  esES, 
  frFR, 
  getLocale, 
  itIT, 
  jaJP, 
  koKR, 
  locales, 
  ptBR, 
  ruRU,
  zhCN
} from './locales'

export type { LocaleKey, SizeLocale } from './locales'

// Plugin exports
export { createSizePlugin, SizePluginSymbol } from './plugin'

export type { SizePlugin, SizePluginOptions } from './plugin'

// Engine plugin integration
export { createSizeEnginePlugin, useSizeFromEngine } from './plugin/engine'
export type { SizeEnginePluginOptions } from './plugin/engine'

// Utility exports
export {
  batchProcessSizes,
  memoize,
  optimizeCSSVariables,
  requestIdleCallback
} from './utils'

// Version
export const version = '2.0.0'
