/**
 * React 适配器
 *
 * 为 React 应用提供主题管理功能，包括：
 * - React Context 提供者
 * - 自定义 Hooks
 * - 主题切换组件
 *
 * @version 0.1.0
 * @author ldesign
 */

export { ColorPicker } from './components/ColorPicker'
export { ThemeSelector } from './components/ThemeSelector'
// 导出组件
export { ThemeToggle } from './components/ThemeToggle'
export { useColorGenerator } from './hooks/useColorGenerator'
export { usePerformance } from './hooks/usePerformance'
export { useSystemThemeSync } from './hooks/useSystemThemeSync'
export { useTheme } from './hooks/useTheme'

export { useThemeSelector } from './hooks/useThemeSelector'
export { useThemeToggle } from './hooks/useThemeToggle'
// 导出 React Context 和 Hooks
export { ThemeProvider } from './ThemeProvider'

// 导出类型
export type {
  ColorPickerProps,
  ThemeProviderProps,
  ThemeSelectorProps,
  ThemeToggleProps,
  UseColorGeneratorReturn,
  UsePerformanceReturn,
  UseSystemThemeSyncReturn,
  UseThemeReturn,
  UseThemeSelectorReturn,
  UseThemeToggleReturn,
} from './types'
