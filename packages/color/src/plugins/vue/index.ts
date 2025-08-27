/**
 * Vue 插件 for @ldesign/color
 */

// 导出组合式 API
export {
  useTheme,
  useColor,
  useThemeMode,
  useThemeSwitch,
} from './composables'

// 导出组件
export {
  ThemeColorPicker,
  ThemeSwitcher,
  ModeToggler,
} from './components'

// 导出类型
export type { ThemeManagerInstance, ColorMode, ThemeConfig } from '../../core/types'
