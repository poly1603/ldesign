/**
 * @ldesign/color - Core Module
 * 
 * Export all core color functionality
 */

// Main Color class
export { Color, Colors } from './Color';

// Conversion functions
export {
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToHwb,
  hwbToRgb,
  hslToHsv,
  hsvToHsl,
  parseColorString
} from './conversions';

// Analysis functions
export {
  getLuminance,
  getContrast,
  isWCAGCompliant,
  getRequiredContrast,
  getPerceivedBrightness,
  isLight,
  isDark,
  getBestTextColor,
  getColorDifference,
  areColorsSimilar,
  getDominantChannel,
  getColorIntensity,
  getColorTemperature,
  getColorPurity
} from './analysis';

// Manipulation functions
export {
  mix,
  blend,
  tint,
  shade,
  tone,
  adjustBrightness,
  adjustContrast,
  gammaCorrection,
  sepia,
  grayscale,
  negative,
  posterize
} from './manipulations';

// Palette and theme functions
export {
  generateScale,
  generateNumberedPalette,
  generateSemanticColors,
  generateGrayScale,
  generateThemePalette,
  generateCSSVariables,
  insertCSSVariables,
  applyTheme,
  generateMaterialPalette,
  generateTailwindPalette
} from './palette';

// Natural palette generation
export {
  generateNaturalSemanticColors,
  generateNaturalScale,
  generateNaturalGrayScale,
  generateNaturalTheme,
  generateSmartPalette,
  generateAccessiblePairs,
  DEFAULT_SHADES,
  GRAY_SHADES,
  MATERIAL_SHADES,
  ANTD_SHADES,
  type ShadeConfig
} from './naturalPalette';

// Tailwind-style palette generation
export {
  generateTailwindScale,
  generateTailwindSemanticColors,
  generateTailwindGrayScale,
  generateTailwindTheme,
  generateTailwindPalettes,
  TAILWIND_SHADES
} from './tailwindPalette';

// Dark mode palette generation
export {
  generateTailwindDarkScale,
  generateDarkSemanticColors,
  generateTailwindDarkGrayScale,
  generateThemePalettes,
  type ThemePalettes
} from '../palette/darkMode';

// CSS Variables and theming
export {
  generateThemedCssVariables,
  generateSemanticCssVariables,
  injectThemedCssVariables,
  setThemeMode,
  getThemeMode,
  toggleThemeMode,
  initThemeMode,
  saveThemeMode
} from '../palette/cssVariables';
