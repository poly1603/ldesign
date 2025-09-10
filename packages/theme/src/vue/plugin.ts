/**
 * @file Vue 3 插件
 * @description Vue 3 主题插件的实现
 */

import type { App } from 'vue'
import type { VueThemePluginOptions, VueThemePluginInstance } from './types'
import { FestivalThemeManager } from '../core/theme-manager'
import { allThemes } from '../themes'

/**
 * Vue 主题插件
 */
export const VueThemePlugin: VueThemePluginInstance = {
  install(app: App, options: VueThemePluginOptions = {}) {
    const {
      themes = allThemes,
      registerComponents = true,
      registerDirectives = true,
      componentPrefix = 'LTheme',
      directivePrefix = 'theme',
      ...managerConfig
    } = options

    // 创建主题管理器实例
    const themeManager = new FestivalThemeManager({
      themes,
      ...managerConfig
    })

    // 提供主题管理器给整个应用
    app.provide('themeManager', themeManager)

    // 全局属性
    app.config.globalProperties.$themeManager = themeManager

    // 注册组件（如果启用）
    if (registerComponents) {
      // 动态导入组件以避免循环依赖
      import('./components/ThemeProvider.vue').then((module) => {
        app.component(`${componentPrefix}Provider`, module.default)
      })

      import('./components/ThemeSelector.vue').then((module) => {
        app.component(`${componentPrefix}Selector`, module.default)
      })

      import('./components/ThemeButton.vue').then((module) => {
        app.component(`${componentPrefix}Button`, module.default)
      })

      import('./components/WidgetContainer.vue').then((module) => {
        app.component(`${componentPrefix}WidgetContainer`, module.default)
      })

      import('./components/AnimationWrapper.vue').then((module) => {
        app.component(`${componentPrefix}AnimationWrapper`, module.default)
      })
    }

    // 注册指令（如果启用）
    if (registerDirectives) {
      // 动态导入指令以避免循环依赖
      import('./directives').then(({ vThemeDecoration, vThemeAnimation, vWidgetContainer }) => {
        app.directive(`${directivePrefix}-decoration`, vThemeDecoration)
        app.directive(`${directivePrefix}-animation`, vThemeAnimation)
        app.directive(`${directivePrefix}-widget-container`, vWidgetContainer)
      })
    }

    // 初始化主题管理器
    themeManager.init().catch(console.error)
  }
}

/**
 * 创建 Vue 主题插件
 * @param options 插件选项
 * @returns Vue 插件实例
 */
export function createVueThemePlugin(options: VueThemePluginOptions = {}): VueThemePluginInstance {
  return {
    install(app: App) {
      VueThemePlugin.install(app, options)
    }
  }
}

// 默认导出
export default VueThemePlugin
