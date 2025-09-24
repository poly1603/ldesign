/**
 * 颜色处理功能导出模块
 * 包含颜色转换、生成、分析、工具函数等
 */

// 颜色和谐分析器
export { ColorHarmonyAnalyzer, colorHarmonyAnalyzer } from '../harmony/color-harmony'

export type {
  ColorRelationship,
  HarmonyAnalysis,
  HSL as HarmonyHSL,
  RGB as HarmonyRGB,
  HarmonyType,
} from '../harmony/color-harmony'

// 颜色分析工具
export {
  analyzeColor,
  analyzeColors,
  calculateHarmonyScore,
  extractDominantColors,
  findSimilarColors,
  getColorName,
} from '../utils/color-analyzer'

export type {
  ColorAnalysis,
  ColorEmotion,
  ColorSeason,
  ColorTemperature,
} from '../utils/color-analyzer'

// 颜色转换工具
export {
  clamp,
  hexToHsl,
  hexToHsv,
  hexToRgb,
  hslToHex,
  hslToHsv,
  hslToRgb,
  hsvToHex,
  hsvToHsl,
  hsvToRgb,
  isValidHex,
  normalizeHex,
  normalizeHue,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from '../utils/color-converter'

export type { HSL, HSV, LAB, RGB } from '../utils/color-converter'

// 颜色生成器
export {
  COLOR_GENERATION_PRESETS,
  ColorGeneratorImpl,
  createColorGenerator,
  createNeutralGrayGenerator,
  createTintedGrayGenerator,
  defaultColorGenerator,
  generateColorConfig,
  safeGenerateColorConfig,
} from '../utils/color-generator'

// 色阶生成器
export {
  ColorScaleGenerator,
  colorScaleGenerator,
  generateColorScale,
  generateColorScales,
} from '../utils/color-scale'

// 颜色工具函数
export {
  adjustBrightness,
  adjustHue,
  adjustSaturation,
  blendColors,
  generateAnalogousPalette,
  generateColorGradient,
  generateComplementaryPalette,
  generateLinearGradient,
  generateMonochromaticPalette,
  generateRadialGradient,
  generateTetradicPalette,
  generateTriadicPalette,
  getBestTextColor,
  getContrastRatio,
  getPerceivedBrightness,
  interpolateColors,
  isAccessible,
  isDark,
  isLight,
} from '../utils/color-utils'

export type {
  BlendMode,
  GradientConfig,
  GradientDirection,
  GradientStop,
} from '../utils/color-utils'

// 类型守卫和验证函数
export {
  assertColorConfig,
  assertColorValue,
  assertThemeConfig,
  getColorFormat,
  isColorConfig,
  isColorFormat,
  isColorValue,
  isHexColor,
  isHslColor,
  isHsvColor,
  isLABColor,
  isLCHColor,
  isNamedColor,
  isPreciseHSL,
  isPreciseHSV,
  isPreciseRGB,
  isRgbColor,
  isThemeConfig,
  validateColorValue,
} from '../utils/type-guards'
