/**
 * Vue 组合式 API 集合
 */

// 类型导出
export type {
  UseColorGeneratorReturn,
  UsePerformanceReturn,
  UseSystemThemeSyncReturn,
  UseThemeReturn,
  UseThemeSelectorReturn,
  UseThemeToggleReturn,
} from '../types'
export { useColorGenerator } from './useColorGenerator'
export { usePerformance } from './usePerformance'
export { useSystemThemeSync } from './useSystemThemeSync'
export { useTheme } from './useTheme'
export { injectThemeManager, provideThemeManager } from './useThemeProvider'
export { useThemeSelector } from './useThemeSelector'

export { useThemeToggle } from './useThemeToggle'
