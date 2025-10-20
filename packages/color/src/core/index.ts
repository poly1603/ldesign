/**
 * @ldesign/color - Core Module
 * 
 * Export all core color functionality
 */

// CSS Variables and theming
export {
  generateSemanticCssVariables,
  generateThemedCssVariables,
  getThemeMode,
  initThemeMode,
  injectThemedCssVariables,
  saveThemeMode,
  setThemeMode,
  toggleThemeMode
} from '../palette/cssVariables';

// Dark mode palette generation
export {
  generateDarkSemanticColors,
  generateTailwindDarkGrayScale,
  generateTailwindDarkScale,
  generateThemePalettes,
  type ThemePalettes
} from '../palette/darkMode';

// Analysis functions
export {
  areColorsSimilar,
  getBestTextColor,
  getColorDifference,
  getColorIntensity,
  getColorPurity,
  getColorTemperature,
  getContrast,
  getDominantChannel,
  getLuminance,
  getPerceivedBrightness,
  getRequiredContrast,
  isDark,
  isLight,
  isWCAGCompliant
} from './analysis';

// Main Color class
export { Color, Colors } from './Color';

// Conversion functions
export {
  hexToRgb,
  hslToHsv,
  hslToRgb,
  hsvToHsl,
  hsvToRgb,
  hwbToRgb,
  parseColorString,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToHwb
} from './conversions';

// Manipulation functions
export {
  adjustBrightness,
  adjustContrast,
  blend,
  gammaCorrection,
  grayscale,
  mix,
  negative,
  posterize,
  sepia,
  shade,
  tint,
  tone
} from './manipulations';

// Natural palette generation
export {
  ANTD_SHADES,
  DEFAULT_SHADES,
  generateAccessiblePairs,
  generateNaturalGrayScale,
  generateNaturalScale,
  generateNaturalSemanticColors,
  generateNaturalTheme,
  generateSmartPalette,
  GRAY_SHADES,
  MATERIAL_SHADES,
  type ShadeConfig
} from './naturalPalette';

// Palette and theme functions
export {
  applyTheme,
  generateCSSVariables,
  generateGrayScale,
  generateMaterialPalette,
  generateNumberedPalette,
  generateScale,
  generateSemanticColors,
  generateTailwindPalette,
  generateThemePalette,
  insertCSSVariables
} from './palette';

// Tailwind-style palette generation
export {
  applyThemeCssVars,
  type CssVarOptions,
  type CssVarSuffixFormat,
  generatePaletteCssVars,
  generateTailwindGrayScale,
  generateTailwindPalettes,
  generateTailwindScale,
  generateTailwindSemanticColors,
  generateTailwindTheme,
  generateThemeCssVars,
  insertCssVars,
  TAILWIND_SHADES
} from './tailwindPalette';
