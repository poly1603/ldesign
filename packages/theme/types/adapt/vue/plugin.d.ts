import { App } from 'vue'
import { VueThemePluginOptions } from './types.js'
export {
  ThemeAnimationProps,
  ThemeButtonProps,
  ThemeCardProps,
  ThemeComponentProps,
  ThemeContainerProps,
  ThemeDecorationProps,
  ThemePreviewProps,
  ThemeSelectorProps,
  ThemeToggleProps,
  UseThemeAnimationsReturn,
  UseThemeDecorationsReturn,
  UseThemeReturn,
  VThemeAnimationBinding,
  VThemeDecorationBinding,
  VueDirectiveBinding,
  VueThemeContext,
  VueThemeContextKey,
  VueThemeGlobalProperties,
  VueThemeProviderProps,
} from './types.js'
import { ThemeConfig } from '../../core/types.js'
export {
  AnimationConfig,
  DecorationConfig,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
} from '../../core/types.js'

/**
 * @ldesign/theme - Vue 插件
 *
 * 提供 Vue 应用的主题系统集成
 */

/**
 * Vue 主题插件
 */
declare const VueThemePlugin: {
  install(app: App, options?: VueThemePluginOptions): void
}
/**
 * 创建主题应用
 */
declare function createThemeApp(app: App, options?: VueThemePluginOptions): App
/**
 * 安装主题插件的便捷函数
 */
declare function installTheme(
  app: App,
  themes: ThemeConfig[],
  options?: Omit<VueThemePluginOptions, 'themes'>
): any

export {
  ThemeConfig,
  VueThemePlugin,
  VueThemePluginOptions,
  createThemeApp,
  VueThemePlugin as default,
  installTheme,
}
