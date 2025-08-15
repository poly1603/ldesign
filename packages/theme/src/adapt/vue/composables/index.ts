/**
 * @ldesign/theme - Vue Composables 导出
 *
 * 统一导出所有Vue组合式函数
 */

export { useTheme } from './useTheme'
export { useThemeAnimations } from './useThemeAnimations'
export { useThemeDecorations } from './useThemeDecorations'

// 导出类型
export type {
  UseThemeReturn,
  UseThemeAnimationsReturn,
  UseThemeDecorationsReturn,
} from '../types'
