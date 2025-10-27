/**
 * Vue 插件
 */

import type { App } from 'vue'
import { getVueTemplateManager } from '../managers/VueTemplateManager'

export interface TemplatePluginOptions {
  // 插件选项
  autoInitialize?: boolean
  debug?: boolean
}

/**
 * 模板插件
 */
export const TemplatePlugin = {
  install(app: App, options: TemplatePluginOptions = {}) {
    // 初始化管理器
    const manager = getVueTemplateManager(options)

    // 全局属性
    app.config.globalProperties.$templateManager = manager

    // 提供给子组件
    app.provide('templateManager', manager)

    // 自动初始化
    if (options.autoInitialize !== false) {
      manager.initialize().catch(console.error)
    }

    if (options.debug) {
      console.log('[TemplatePlugin] 已安装')
    }
  },
}

/**
 * 创建插件实例
 */
export function createTemplatePlugin(options?: TemplatePluginOptions) {
  return {
    install(app: App) {
      TemplatePlugin.install(app, options)
    },
  }
}

export default TemplatePlugin
