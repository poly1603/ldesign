/**
 * @ldesign/theme - Vue Composables 导出
 *
 * 统一导出所有 Vue 组合式函数
 */

// 重新导出类型
export type {
  UseThemeAnimationsReturn,
  UseThemeDecorationsReturn,
  UseThemeReturn,
} from '../types'
export { useTheme, useThemePreload } from './useTheme'
export { useThemeAnimations } from './useThemeAnimations'

export { useThemeDecorations } from './useThemeDecorations'
