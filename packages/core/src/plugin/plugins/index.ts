/**
 * 内置插件模块
 * 
 * 导出所有内置插件及其相关类型和工具函数
 * 
 * @module plugins
 */

// i18n 插件
export {
  createI18nPlugin,
  LOCALE_CODES,
  type I18nPluginConfig,
  type I18nEngineExtensions,
  type LocaleCode,
} from './i18n-plugin'

// 主题插件
export {
  createThemePlugin,
  PRESET_THEMES,
  type ThemePluginConfig,
  type ThemeDefinition,
  type ThemeEngineExtensions,
} from './theme-plugin'

// 尺寸插件
export {
  createSizePlugin,
  PRESET_SIZES,
  COMMON_SIZE_SETS,
  type SizePluginConfig,
  type SizeConfig,
  type SizeEngineExtensions,
  type Size,
} from './size-plugin'
