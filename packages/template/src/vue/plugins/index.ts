import type { App, Plugin } from 'vue'
import type { TemplateManagerConfig } from '../../types'
import { TemplateManager } from '../../core/TemplateManager'
import { TemplateRenderer } from '../components/TemplateRenderer'
import { registerTemplateDirective } from '../directives/template'

/**
 * 插件选项
 */
export interface TemplatePluginOptions extends TemplateManagerConfig {
  /** 组件名称前缀 */
  componentPrefix?: string
  /** 是否注册全局组件 */
  registerComponents?: boolean
  /** 是否注册指令 */
  registerDirectives?: boolean
  /** 是否提供全局属性 */
  provideGlobalProperties?: boolean
}

/**
 * 默认插件选项
 */
const defaultOptions: Required<TemplatePluginOptions> = {
  templateRoot: 'src/templates',
  deviceDetection: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 992,
    desktopBreakpoint: 1200,
  },
  enableCache: true,
  cacheLimit: 50,
  enablePreload: false,
  preloadTemplates: [],
  defaultDevice: 'desktop',
  componentPrefix: 'L',
  registerComponents: true,
  registerDirectives: true,
  provideGlobalProperties: true,
}

/**
 * 全局模板管理器实例
 */
let globalManager: TemplateManager | null = null

/**
 * 模板插件
 */
export const TemplatePlugin: Plugin = {
  install(app: App, options: TemplatePluginOptions = {}) {
    const mergedOptions = { ...defaultOptions, ...options }

    // 创建全局模板管理器
    if (!globalManager) {
      globalManager = new TemplateManager(mergedOptions)
    }

    // 注册全局组件
    if (mergedOptions.registerComponents) {
      const componentName = `${mergedOptions.componentPrefix}TemplateRenderer`
      app.component(componentName, TemplateRenderer)
    }

    // 注册指令
    if (mergedOptions.registerDirectives) {
      registerTemplateDirective(app)
    }

    // 提供全局属性
    if (mergedOptions.provideGlobalProperties) {
      app.config.globalProperties.$templateManager = globalManager
      app.provide('templateManager', globalManager)
    }

    // 自动扫描模板
    if (typeof window !== 'undefined') {
      globalManager.scanTemplates().catch(console.warn)
    }
  },
}

/**
 * 获取全局模板管理器
 */
export function getGlobalTemplateManager(): TemplateManager | null {
  return globalManager
}

/**
 * 销毁全局模板管理器
 */
export function destroyGlobalTemplateManager(): void {
  if (globalManager) {
    globalManager.destroy()
    globalManager = null
  }
}

export default TemplatePlugin
