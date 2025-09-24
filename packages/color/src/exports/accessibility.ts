/**
 * 可访问性功能导出模块
 * 包含 WCAG 检查、颜色盲模拟等可访问性相关功能
 */

// 颜色盲模拟器
export { ColorBlindnessSimulator, colorBlindnessSimulator } from '../accessibility/color-blindness'

export type { ColorBlindnessType as AccessibilityColorBlindnessType } from '../accessibility/color-blindness'

// 可访问性检查功能
export {
  checkAccessibility,
  checkColorBlindnessAccessibility,
  getAccessibleColorSuggestions,
  simulateColorBlindness,
} from '../utils/accessibility'

export type {
  AccessibilityResult,
  ColorBlindnessSimulation,
  ColorBlindnessType,
} from '../utils/accessibility'
