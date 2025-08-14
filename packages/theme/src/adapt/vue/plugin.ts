/**
 * @ldesign/theme - Vue 插件
 *
 * 提供 Vue 应用的主题系统集成
 */

import type { App } from 'vue'
import type { VueThemePluginOptions, ThemeConfig } from './types'
import { createThemeManager } from '../../core/theme-manager'

// 组件
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeButton } from './components/ThemeButton'
import { ThemeSelector } from './components/ThemeSelector'

// 指令
import { vThemeDecoration } from './directives/theme-decoration'
import { vThemeAnimation } from './directives/theme-animation'

// 组合式函数
import {
  useTheme,
  useCurrentTheme,
  useThemeState,
  useThemeToggle,
  useThemePreload,
} from './composables/useTheme'
import {
  useThemeDecorations,
  useDecorationFilter,
  useDecorationBatch,
} from './composables/useThemeDecorations'
import {
  useThemeAnimations,
  useAnimationControl,
  useAnimationSequence,
  useAnimationPerformance,
} from './composables/useThemeAnimations'

/**
 * Vue 主题插件
 */
export const VueThemePlugin = {
  install(app: App, options: VueThemePluginOptions = {}) {
    const {
      themes = [],
      defaultTheme,
      autoActivate = true,
      globalProperties = true,
      components = true,
      directives = true,
      debug = false,
    } = options

    // 创建全局主题管理器
    const themeManager = createThemeManager({
      themes,
      defaultTheme,
      autoActivate,
      debug,
    })

    // 注册组件
    if (components) {
      app.component('ThemeProvider', ThemeProvider)
      app.component('ThemeButton', ThemeButton)
      app.component('ThemeSelector', ThemeSelector)
    }

    // 注册指令
    if (directives) {
      app.directive('theme-decoration', vThemeDecoration)
      app.directive('theme-animation', vThemeAnimation)
    }

    // 添加全局属性
    if (globalProperties) {
      app.config.globalProperties.$theme = themeManager
      app.config.globalProperties.$setTheme = (name: string) =>
        themeManager.setTheme(name)
      app.config.globalProperties.$getCurrentTheme = () =>
        themeManager.getCurrentTheme()
      app.config.globalProperties.$getAvailableThemes = () =>
        themeManager.getAvailableThemes()
    }

    // 提供全局主题管理器
    app.provide('themeManager', themeManager)

    // 初始化主题管理器
    themeManager.init().catch(error => {
      if (debug) {
        console.error(
          '[VueThemePlugin] Failed to initialize theme manager:',
          error
        )
      }
    })

    if (debug) {
      console.log('[VueThemePlugin] Plugin installed with options:', options)
    }
  },
}

/**
 * 创建主题应用
 */
export function createThemeApp(app: App, options: VueThemePluginOptions = {}) {
  app.use(VueThemePlugin, options)
  return app
}

/**
 * 安装主题插件的便捷函数
 */
export function installTheme(
  app: App,
  themes: ThemeConfig[],
  options: Omit<VueThemePluginOptions, 'themes'> = {}
) {
  return app.use(VueThemePlugin, {
    themes,
    ...options,
  })
}

// 导出所有组件
export { ThemeProvider, ThemeButton, ThemeSelector }

// 导出所有指令
export { vThemeDecoration, vThemeAnimation }

// 导出所有组合式函数
export {
  useTheme,
  useCurrentTheme,
  useThemeState,
  useThemeToggle,
  useThemePreload,
  useThemeDecorations,
  useDecorationFilter,
  useDecorationBatch,
  useThemeAnimations,
  useAnimationControl,
  useAnimationSequence,
  useAnimationPerformance,
}

// 导出类型
export type * from './types'

// 默认导出插件
export default VueThemePlugin
