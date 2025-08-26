/**
 * Vue 插件
 * 提供完整的 Vue 3 集成
 */

import type { App, Plugin } from 'vue'
import type { PluginConfig, TemplateManagerConfig } from '../types'
import { TemplateManager } from '../core/manager'
// // import TemplateRenderer from './components/TemplateRenderer.vue'
// import TemplateRendererWithSelector from './components/TemplateRendererWithSelector.vue'
// import TemplateSelector from './components/TemplateSelector.vue'
import { installTemplateDirectives } from './directives/template'

/**
 * 插件符号
 */
export const TemplateManagerSymbol = Symbol('TemplateManager')

/**
 * 默认插件配置
 */
const defaultConfig: PluginConfig = {
  componentName: 'TemplateRenderer',
  registerGlobalComponent: true,
  registerDirectives: true,
  provideGlobalProperties: true,
  scanner: {
    scanPaths: ['src/templates/**/*.vue'],
  },
  loader: {
    enableCache: true,
    preloadStrategy: 'critical',
  },
  deviceAdapter: {
    autoDetect: true,
    watchDeviceChange: true,
  },
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
  },
}

/**
 * 创建模板管理器插件
 */
export function createTemplatePlugin(userConfig: Partial<PluginConfig> = {}): Plugin {
  const config = { ...defaultConfig, ...userConfig }

  return {
    install(app: App) {
      // 创建模板管理器实例
      const manager = new TemplateManager(config)

      // 提供管理器实例
      app.provide(TemplateManagerSymbol, manager)

      // 注册全局组件
      // if (config.registerGlobalComponent && config.componentName) {
      //   app.component(config.componentName, TemplateRenderer)
      //   app.component('TemplateRendererWithSelector', TemplateRendererWithSelector)
      //   app.component('TemplateSelector', TemplateSelector)
      // }

      // 注册指令
      if (config.registerDirectives) {
        installTemplateDirectives(app)
      }

      // 提供全局属性
      if (config.provideGlobalProperties) {
        app.config.globalProperties.$templateManager = manager

        // 添加便捷方法
        app.config.globalProperties.$loadTemplate = (
          template: string,
          deviceType?: string,
        ) => manager.render(template, deviceType as any)

        app.config.globalProperties.$preloadTemplate = (
          template: string,
          deviceType?: string,
        ) => manager.preloadTemplate(template, deviceType as any)

        app.config.globalProperties.$clearTemplateCache = (
          template?: string,
          deviceType?: string,
        ) => manager.clearCache(template, deviceType as any)
      }

      // 初始化管理器
      manager.initialize().catch((error) => {
        console.error('Failed to initialize TemplateManager:', error)
      })

      // 在应用卸载时清理资源
      const originalUnmount = app.unmount
      app.unmount = function () {
        manager.dispose()
        return originalUnmount.call(this)
      }
    },
  }
}

/**
 * 默认插件实例
 */
export const TemplatePlugin = createTemplatePlugin()

/**
 * 安装函数（兼容性）
 */
export function install(app: App, options: Partial<PluginConfig> = {}) {
  const plugin = createTemplatePlugin(options)
  plugin?.install?.(app)
}

/**
 * 获取模板管理器实例
 */
export function useTemplateManager(): TemplateManager {
  const { inject } = require('vue')
  const manager = inject(TemplateManagerSymbol)

  if (!manager) {
    throw new Error('TemplateManager not found. Make sure to install the TemplatePlugin.')
  }

  return manager
}

/**
 * 全局配置函数
 */
export function configureTemplateManager(config: Partial<TemplateManagerConfig>): void {
  Object.assign(defaultConfig, config)
}

// 默认导出
export default TemplatePlugin

// 类型声明扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $templateManager: TemplateManager
    $loadTemplate: (template: string, deviceType?: string) => Promise<any>
    $preloadTemplate: (template: string, deviceType?: string) => Promise<void>
    $clearTemplateCache: (template?: string, deviceType?: string) => void
  }
}
