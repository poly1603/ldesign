/**
 * Vue 插件模块
 *
 * 提供 Vue 插件用于全局注册组件、指令和提供器
 */

import type { App, Plugin } from 'vue'
import type { TemplateManagerConfig } from '../../types'
import { TemplateManager } from '../../core/manager'

// 组件
import { LazyTemplate, PerformanceMonitor, TemplateRenderer } from '../components'

// 指令
import { registerTemplateDirective } from '../directives/template'

// 全局模板管理器实例
let globalTemplateManager: TemplateManager | null = null

/**
 * 插件配置选项
 */
export interface TemplatePluginOptions extends TemplateManagerConfig {
  /** 组件名前缀 */
  componentPrefix?: string
  /** 是否注册指令 */
  registerDirectives?: boolean
  /** 是否注册全局属性 */
  registerGlobalProperties?: boolean
}

/**
 * 默认插件选项
 */
const defaultOptions: TemplatePluginOptions = {
  componentPrefix: 'L',
  registerDirectives: true,
  registerGlobalProperties: true,
  enableCache: true,
  autoDetectDevice: true,
}

/**
 * 模板插件
 */
export const TemplatePlugin: Plugin = {
  install(app: App, options: TemplatePluginOptions = {}) {
    const finalOptions = { ...defaultOptions, ...options }
    const { componentPrefix, registerDirectives, registerGlobalProperties } = finalOptions

    // 创建全局模板管理器
    globalTemplateManager = new TemplateManager(finalOptions)

    // 注册组件
    app.component(`${componentPrefix}TemplateRenderer`, TemplateRenderer)
    app.component(`${componentPrefix}LazyTemplate`, LazyTemplate)
    app.component(`${componentPrefix}PerformanceMonitor`, PerformanceMonitor)

    // 注册指令
    if (registerDirectives) {
      registerTemplateDirective(app)
    }

    // 注册全局属性
    if (registerGlobalProperties) {
      app.config.globalProperties.$templateManager = globalTemplateManager
      app.provide('templateManager', globalTemplateManager)
    }

    // 提供模板管理器
    app.provide('templateManager', globalTemplateManager)
  },
}

/**
 * 获取全局模板管理器
 */
export function getGlobalTemplateManager(): TemplateManager | null {
  return globalTemplateManager
}

/**
 * 销毁全局模板管理器
 */
export function destroyGlobalTemplateManager(): void {
  if (globalTemplateManager) {
    // 这里可以添加清理逻辑
    globalTemplateManager = null
  }
}

/**
 * 创建模板插件
 */
export function createTemplatePlugin(options: TemplatePluginOptions = {}): Plugin {
  return {
    install(app: App) {
      TemplatePlugin.install!(app, options)
    },
  }
}

// 默认导出
export default TemplatePlugin

// 类型声明增强
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $templateManager: TemplateManager
  }
}
