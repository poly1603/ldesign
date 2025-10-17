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

// Plugin system
export { createColorPlugin, ColorPluginSymbol } from './plugin';
export type { ColorPlugin, ColorPluginOptions } from './plugin';
export { useColorPlugin } from './plugin/useColorPlugin';

// Engine plugin integration
export { createColorEnginePlugin, useColorFromEngine } from './plugin/engine'
export type { ColorEnginePluginOptions } from './plugin/engine'

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
