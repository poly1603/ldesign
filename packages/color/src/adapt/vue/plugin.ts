/**
 * Vue 主题管理器插件
 */

import type { App, Plugin } from 'vue'
import type { VueThemePluginOptions } from './types'
import { ThemeManager } from '../../core/theme-manager'
import { presetThemes } from '../../themes/presets'
import ColorPicker from './components/ColorPicker'

// 导入组件
import ThemeProvider from './components/ThemeProvider'
import ThemeSelector from './components/ThemeSelector'
import ThemeToggle from './components/ThemeToggle'
// 导入指令
import { vTheme } from './directives'

import { THEME_MANAGER_KEY } from './types'

/**
 * Vue 主题管理器插件
 */
export const ThemePlugin: Plugin = {
  install(app: App, options: VueThemePluginOptions = {}) {
    const {
      injectKey = THEME_MANAGER_KEY,
      themes = presetThemes,
      registerComponents = true,
      registerDirectives = true,
      componentPrefix = 'L',
      ...managerOptions
    } = options

    // 创建主题管理器实例
    const themeManager = new ThemeManager({
      themes,
      ...managerOptions,
    })

    // 初始化主题管理器
    themeManager.init().catch((error) => {
      console.error('Failed to initialize theme manager:', error)
    })

    // 提供主题管理器实例
    app.provide(injectKey, themeManager)

    // 全局属性
    app.config.globalProperties.$themeManager = themeManager
    app.config.globalProperties.$theme = {
      current: themeManager.getCurrentTheme(),
      mode: themeManager.getCurrentMode(),
      setTheme: themeManager.setTheme.bind(themeManager),
      setMode: themeManager.setMode.bind(themeManager),
      toggleMode: async () => {
        const currentMode = themeManager.getCurrentMode()
        const newMode = currentMode === 'light' ? 'dark' : 'light'
        await themeManager.setMode(newMode)
      },
    }

    // 注册组件
    if (registerComponents) {
      app.component(`${componentPrefix}ThemeProvider`, ThemeProvider)
      app.component(`${componentPrefix}ThemeToggle`, ThemeToggle)
      app.component(`${componentPrefix}ColorPicker`, ColorPicker)
      app.component(`${componentPrefix}ThemeSelector`, ThemeSelector)
    }

    // 注册指令
    if (registerDirectives) {
      app.directive('theme', vTheme)
    }

    // 开发模式下的调试信息
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('🎨 LDesign Color Theme Plugin installed', {
        themes: themes.length,
        defaultTheme: managerOptions.defaultTheme,
        components: registerComponents,
        directives: registerDirectives,
      })
    }
  },
}

/**
 * 便捷的安装函数
 */
export function installThemePlugin(
  app: App,
  options?: VueThemePluginOptions,
): void {
  app.use(ThemePlugin, options)
}

/**
 * 创建主题插件实例
 */
export function createThemePlugin(options?: VueThemePluginOptions): Plugin {
  return {
    install(app: App) {
      app.use(ThemePlugin, options)
    },
  }
}

export default ThemePlugin
