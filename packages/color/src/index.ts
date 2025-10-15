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

// Vue 3 support
// Note: Vue components should be imported from '@ldesign/color/vue'

// React support
// Note: React components should be imported from '@ldesign/color/react'

// Version
export const VERSION = '1.0.0';

// Default export
import { Color } from './core';
export default Color;