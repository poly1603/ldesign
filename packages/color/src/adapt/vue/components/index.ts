/**
 * Vue 组件集合
 */

// 类型导出
export type {
  ColorPickerProps,
  ThemeProviderProps,
  ThemeSelectorProps,
  ThemeToggleProps,
} from '../types'

export type { AccessibilityCheckerProps } from './AccessibilityChecker'
export { default as AccessibilityChecker } from './AccessibilityChecker'
// 新增组件类型导出
export type { ColorMixerProps } from './ColorMixer'

export { default as ColorMixer } from './ColorMixer'
// 组件导出
export { default as ColorPicker } from './ColorPicker'
export type { PaletteGeneratorProps } from './PaletteGenerator'
export { default as PaletteGenerator } from './PaletteGenerator'
export { default as ThemeProvider } from './ThemeProvider'
export { default as ThemeSelector } from './ThemeSelector'
export { default as ThemeToggle } from './ThemeToggle'
