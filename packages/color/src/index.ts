/**
 * @ldesign/color
 * 
 * A powerful, performant, and easy-to-use color manipulation library
 * 
 * @packageDocumentation
 */

// Export all types
export * from './types';

// Export core functionality
export * from './core';

// Export constants
export { namedColors, getNamedColor, isNamedColor, getNamedColorNames, getColorName } from './constants/namedColors';

// Export utilities
export { ColorCache, globalColorCache, memoize, createCacheKey } from './utils/cache';
export { 
  clamp, 
  round, 
  lerp, 
  degreesToRadians, 
  radiansToDegrees,
  euclideanDistance,
  mapRange,
  average,
  normalize,
  randomRange,
  randomInt
} from './utils/math';
export { 
  validateRGB,
  validateHSL,
  validateHSV,
  validateHWB,
  validateHex,
  isColorInput,
  parseColorInput,
  sanitizeChannel,
  sanitizeAlpha,
  isValidColorFormat
} from './utils/validators';

// Export palette generators
export * from './core/tailwindPalette';

// Theme management
export * from './themes/presets';
export { ThemeManager, defaultThemeManager } from './themes/themeManager';
export type { ThemeState, ThemeOptions } from './themes/themeManager';

// Accessibility tools
export { 
  ColorAccessibility,
  simulateColorBlindness,
  autoAdjustForWCAG,
  suggestAccessiblePairs,
  getAccessibilityReport
} from './accessibility';
export type { ColorBlindnessType } from './accessibility';

// Gradient generator
export {
  GradientGenerator,
  linearGradient,
  radialGradient,
  conicGradient,
  meshGradient,
  smoothGradient,
  animatedGradient
} from './gradient';
export type { GradientStop, LinearGradientOptions, RadialGradientOptions } from './gradient';

// Color analyzer
export {
  ColorAnalyzer,
  extractPalette,
  findDominantColors,
  analyzeColorDistribution,
  generateColorReport
} from './analyzer';
export type { ColorStatistics, ColorDistribution, AnalyzerOptions } from './analyzer';

// Brand manager
export {
  BrandColorManager,
  createBrandManager
} from './brand';
export type { BrandColors, BrandPalette, BrandConfig } from './brand';

// AI color assistant
export {
  ColorAI,
  colorAI,
  createColorAI
} from './ai/colorAI';
export type { AIColorOptions, AIColorSuggestion, ColorContext } from './ai/colorAI';

// Error handling
export {
  ColorError,
  InputValidationError,
  ColorConversionError,
  ColorManipulationError,
  ThemeOperationError,
  ErrorLogger,
  ErrorRecovery,
  logError,
  safeExecute,
  retryExecute
} from './utils/errors';
export type { ErrorSeverity, ErrorCategory, RecoverySuggestion } from './utils/errors';

// Advanced cache
export {
  AdvancedColorCache,
  globalColorCache as advancedGlobalCache
} from './utils/advancedCache';
export type { CacheStrategy, CacheStats } from './utils/advancedCache';

// Performance optimization
export {
  BatchColorProcessor,
  LazyColorLoader,
  ColorPerformance,
  batchProcess,
  batchConvert,
  batchManipulate,
  batchAnalyze,
  lazyLoad,
  preloadModules
} from './performance';
export type { BatchOptions, PerformanceMetrics } from './performance';

// Color schemes generator
export {
  ColorSchemeGenerator,
  generateColorScheme,
  generateAdaptiveScheme,
  generateAllSchemes,
  evaluateHarmony
} from './schemes';
export type { ColorSchemeType, ColorSchemeOptions, ColorScheme } from './schemes';

// Plugin system
export { createColorPlugin, ColorPluginSymbol } from './plugin';
export type { ColorPlugin, ColorPluginOptions } from './plugin';
export { useColorPlugin } from './plugin/useColorPlugin';

// Locales
export { 
  zhCN, 
  enUS, 
  jaJP, 
  koKR, 
  deDE, 
  frFR, 
  esES, 
  itIT, 
  ptBR, 
  ruRU, 
  getLocale, 
  locales 
} from './locales'
export type { ColorLocale, LocaleKey } from './locales'

// Vue 3 support
// Note: Vue components should be imported from '@ldesign/color/vue'

// React support
// Note: React components should be imported from '@ldesign/color/react'

// Version
export const VERSION = '1.0.0'

// Default export
import { Color } from './core'
export default Color
