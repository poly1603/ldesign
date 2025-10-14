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

// Version
export const VERSION = '1.0.0';

// Default export
import { Color } from './core';
export default Color;