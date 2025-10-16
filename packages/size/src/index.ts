/**
 * @ldesign/size - A powerful size management system for web applications
 * 
 * Features:
 * - Multiple size presets (compact, comfortable, spacious, etc.)
 * - Size calculations and conversions
 * - CSS variable generation
 * - Responsive size utilities
 * - Framework agnostic
 */

// Core exports
export { Size, size, px, rem, em, vw, vh, percent } from './core/Size';
export { SizeManager, defaultSizeManager, setScheme, applyPreset, getCurrentScheme, getCSSVariable, restoreScheme, resetScheme } from './core/SizeManager';

// Preset exports
export {
  compactScheme,
  comfortableScheme,
  spaciousScheme,
  cozyScheme,
  mobileScheme,
  presetSchemes,
  getPresetScheme,
  getPresetSchemeNames,
  schemeMetadata,
  type SchemeMetadata
} from './core/presets';

// CSS generation exports
export {
  generateCSSVariables,
  generateCSSString,
  generateCSS,
  injectCSS,
  removeCSS
} from './core/cssGenerator';

// Utility exports
export {
  parseSizeInput,
  formatSize,
  convertSize,
  scaleSize,
  addSizes,
  subtractSizes,
  clampSize,
  roundSize,
  generateSizeScale,
  isValidSize,
  getCSSVarName,
  cssVar,
  deepMerge,
  throttle,
  debounce
} from './utils';

// Type exports
export type {
  // Basic types
  SizeValue,
  SizeUnit,
  ScaleFactor,
  SizeInput,
  
  // Preset types
  PresetScheme,
  SizeCategory,
  SizeScale,
  
  // Configuration types
  FontSizeConfig,
  SpacingConfig,
  RadiusConfig,
  LineHeightConfig,
  LetterSpacingConfig,
  ComponentSizeConfig,
  SizeScheme,
  
  // Manager types
  SizeManagerOptions,
  SizeManagerState,
  
  // Operation types
  SizeCalculationOptions,
  SizeAnimationConfig,
  EasingFunction,
  
  // CSS types
  CSSVariableOptions,
  GeneratedCSS,
  
  // Utility types
  DeepPartial,
  SizeModifier,
  SizeValidator,
  
  // Event types
  SizeChangeEvent,
  SizeErrorEvent,
  
  // Plugin types
  SizePlugin,
  PluginOptions
} from './types';

/**
 * Quick start function
 */
export function initSize(options?: import('./types').SizeManagerOptions): SizeManager {
  return new SizeManager(options);
}

/**
 * Version
 */
export const version = '1.0.0';

/**
 * Default export
 */
export default {
  Size,
  SizeManager,
  defaultSizeManager,
  initSize,
  presets: presetSchemes,
  version
};