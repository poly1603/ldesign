/**
 * @ldesign/color
 * 
 * A powerful, performant, and easy-to-use color manipulation library
 * 
 * @packageDocumentation
 */

// Export all types
// Default export
import { Color } from './core'

// Accessibility tools
export { 
  autoAdjustForWCAG,
  ColorAccessibility,
  getAccessibilityReport,
  simulateColorBlindness,
  suggestAccessiblePairs
} from './accessibility';

export type { ColorBlindnessType } from './accessibility';

// AI color assistant
export {
  ColorAI,
  colorAI,
  createColorAI
} from './ai/colorAI';

export type { AIColorOptions, AIColorSuggestion, ColorContext } from './ai/colorAI';
// Color analyzer
export {
  analyzeColorDistribution,
  ColorAnalyzer,
  extractPalette,
  findDominantColors,
  generateColorReport
} from './analyzer';
export type { AnalyzerOptions, ColorDistribution, ColorStatistics } from './analyzer';

// Brand manager
export {
  BrandColorManager,
  createBrandManager
} from './brand';

export type { BrandColors, BrandConfig, BrandPalette } from './brand';
// Export constants
export { getColorName, getNamedColor, getNamedColorNames, isNamedColor, namedColors } from './constants/namedColors';
// Export core functionality
export * from './core';

// Export palette generators
export * from './core/tailwindPalette';
// Gradient generator
export {
  animatedGradient,
  conicGradient,
  GradientGenerator,
  linearGradient,
  meshGradient,
  radialGradient,
  smoothGradient
} from './gradient';

export type { GradientStop, LinearGradientOptions, RadialGradientOptions } from './gradient';
// Locales
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

export type { ColorLocale, LocaleKey } from './locales'
// Performance optimization
export {
  batchAnalyze,
  BatchColorProcessor,
  batchConvert,
  batchManipulate,
  batchProcess,
  ColorPerformance,
  LazyColorLoader,
  lazyLoad,
  preloadModules
} from './performance';

export type { BatchOptions, PerformanceMetrics } from './performance';
// Plugin system
export { ColorPluginSymbol, createColorPlugin } from './plugin';

export type { ColorPlugin, ColorPluginOptions } from './plugin';
export { useColorPlugin } from './plugin/useColorPlugin';

// Color schemes generator
export {
  ColorSchemeGenerator,
  evaluateHarmony,
  generateAdaptiveScheme,
  generateAllSchemes,
  generateColorScheme
} from './schemes';
export type { ColorScheme, ColorSchemeOptions, ColorSchemeType } from './schemes';

// Theme management
export * from './themes/presets';
export { defaultThemeManager, ThemeManager } from './themes/themeManager';

export type { ThemeOptions, ThemeState } from './themes/themeManager';
export * from './types';

// Advanced cache
export {
  AdvancedColorCache,
  globalColorCache as advancedGlobalCache
} from './utils/advancedCache';
export type { CacheStats, CacheStrategy } from './utils/advancedCache';

// Export utilities
export { ColorCache, createCacheKey, globalColorCache, memoize } from './utils/cache';
// Error handling
export {
  ColorConversionError,
  ColorError,
  ColorManipulationError,
  ErrorLogger,
  ErrorRecovery,
  InputValidationError,
  logError,
  retryExecute,
  safeExecute,
  ThemeOperationError
} from './utils/errors';

export type { ErrorCategory, ErrorSeverity, RecoverySuggestion } from './utils/errors';
export { 
  average, 
  clamp, 
  degreesToRadians, 
  euclideanDistance, 
  lerp,
  mapRange,
  normalize,
  radiansToDegrees,
  randomInt,
  randomRange,
  round
} from './utils/math';
// Memory management
export {
  cleanupMemory,
  getMemoryStats,
  memoryManager,
  resetMemory,
  setAutoCleanup,
  setMemoryLimit
} from './utils/memoryManager';

export type { MemoryStats } from './utils/memoryManager';
export { 
  isColorInput,
  isValidColorFormat,
  parseColorInput,
  sanitizeAlpha,
  sanitizeChannel,
  validateHex,
  validateHSL,
  validateHSV,
  validateHWB,
  validateRGB
} from './utils/validators';

// Vue 3 support
// Note: Vue components should be imported from '@ldesign/color/vue'

// React support
// Note: React components should be imported from '@ldesign/color/react'

// Version
export const VERSION = '1.0.0'
export default Color
