/**
 * @ldesign/color 插件导出
 */

// Engine 插件
export {
  createColorEnginePlugin,
  createThemeManagerInstance,
  type ColorEnginePluginOptions,
  type EnginePluginContext,
} from './engine'

// Vue 插件
export {
  useTheme,
  useColor,
  useThemeMode,
  useThemeSwitch,
  ThemeColorPicker,
  ThemeSwitcher,
  ModeToggler,
} from './vue'

// 默认导出 Engine 插件
export { createColorEnginePlugin as default } from './engine'
