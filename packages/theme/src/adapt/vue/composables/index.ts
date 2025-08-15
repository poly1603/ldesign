/**
 * @ldesign/theme - Vue Composables 导出
 *
 * 统一导出所有 Vue 组合式函数
 */

export { useTheme, useThemePreload } from './useTheme'
export { useThemeAnimations } from './useThemeAnimations'
export { useThemeDecorations } from './useThemeDecorations'

// 重新导出类型
export type {
  UseThemeReturn,
  UseThemeAnimationsReturn,
  UseThemeDecorationsReturn,
} from '../types'
