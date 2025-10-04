/**
 * Vue 集成导出模块
 * 包含 Vue 组件、组合式 API、插件等
 */

// Vue 集成（组件和组合式 API）
export {
  // ColorPicker, // Temporarily disabled due to missing dependencies
  ColorVuePlugin,
  createColorEnginePlugin,
  createColorPlugin,
  DarkModeToggle,
  ModeToggle,
  // ThemeSelector, // Temporarily disabled due to missing dependencies
  useSystemThemeSync,
  useTheme,
  useThemeSelector,
  useThemeToggle,
} from '../vue'
