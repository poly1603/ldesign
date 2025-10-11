/**
 * 实用工具导出模块
 * 包含主题导入导出、性能监控等实用功能
 */

// 主题导入/导出
export {
  copyThemeToClipboard,
  exportTheme,
  exportThemes,
  exportThemeToFile,
  importTheme,
  importThemeFromClipboard,
  importThemeFromFile,
  importThemeFromUrl,
  importThemes,
  shareTheme,
  validateTheme,
} from '../utils/theme-import-export'

export type {
  ExportedTheme,
  ExportOptions,
  ImportOptions,
  ValidationResult,
} from '../utils/theme-import-export'

// 性能监控增强
export {
  benchmark,
  clearPerformanceData,
  comparePerformance,
  getPerformanceReport,
  globalPerformanceMonitor as performanceMonitor,
  measurePerformance,
  monitored,
  PerformanceMonitor as AdvancedPerformanceMonitor,
  printPerformanceReport,
} from '../utils/performance-monitor'

export type {
  PerformanceMetrics,
  PerformanceReport,
} from '../utils/performance-monitor'

// 品牌类型系统 - 避免与 core 模块的导出冲突
export type {
  CacheKey,
  ColorValue as BrandedColorValue,
  HexColor as BrandedHex,
  HslString,
  RgbString,
  SafeConversionResult,
  ThemeName,
} from '../types/branded'

export {
  createCacheKey,
  createHexColor,
  createHslString,
  createRgbString,
  createThemeName,
  failure,
  isColorValue as isBrandedColorValue,
  isHexColor as isBrandedHexColor,
  isHslString,
  isRgbString,
  isThemeName,
  success,
  TypedCache,
} from '../types/branded'

// 类型守卫工具 - 增强版
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

