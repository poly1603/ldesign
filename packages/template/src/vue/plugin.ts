/**
 * Vue 插件 - 为 Vue 应用提供模板系统支持
 * 
 * @example
 * ```typescript
 * import { createTemplatePlugin } from '@ldesign/template'
 * 
 * const app = createApp(App)
 * app.use(createTemplatePlugin())
 * ```
 */

import type { App } from 'vue'
import type { SystemConfig, TemplateManager } from '../types'
import { createTemplateManager } from '../runtime'
import { registerBuiltinTemplates } from '../templates'
import * as components from './components'

export const TEMPLATE_MANAGER_KEY = Symbol('templateManager')

/**
 * 模板插件配置选项
 */
export interface TemplatePluginOptions extends SystemConfig {
  /**
   * 是否注册全局组件
   * @default true
   */
  registerComponents?: boolean
  
  /**
   * 是否自动注册内置模板
   * @default true
   */
  registerBuiltinTemplates?: boolean
  
  /**
   * 自定义模板注册函数
   */
  registerCustomTemplates?: (manager: TemplateManager) => void
  
  /**
   * 是否在控制台输出调试信息
   * @default false
   */
  debug?: boolean
  
  /**
   * 组件前缀，用于避免组件名冲突
   * @default ''
   */
  componentPrefix?: string
}

/**
 * 模板插件实例
 */
export interface TemplatePlugin {
  /**
   * 模板管理器
   */
  manager: TemplateManager
  
  /**
   * 插件选项
   */
  options: TemplatePluginOptions
  
  /**
   * 安装插件
   */
  install: (app: App) => void
}

/**
 * 创建模板插件
 * 
 * @param options - 插件选项
 * @returns 模板插件实例
 * 
 * @example
 * ```typescript
 * // 基本用法 - 使用默认配置
 * app.use(createTemplatePlugin())
 * 
 * // 自定义配置
 * app.use(createTemplatePlugin({
 *   debug: true,
 *   cache: {
 *     enabled: true,
 *     maxSize: 100
 *   },
 *   registerCustomTemplates: (manager) => {
 *     // 注册自定义模板
 *     manager.register(...)
 *   }
 * }))
 * ```
 */
export function createTemplatePlugin(options: TemplatePluginOptions = {}): TemplatePlugin {
  // 合并默认配置
  const mergedOptions: TemplatePluginOptions = {
    registerComponents: true,
    registerBuiltinTemplates: true,
    debug: false,
    componentPrefix: '',
    ...options,
    // 系统配置
    cache: {
      enabled: true,
      maxSize: 50,
      ttl: 3600000, // 1小时
      ...options.cache,
    },
    device: {
      detectOnMount: true,
      detectOnResize: true,
      ...options.device,
    },
    performance: {
      enableMonitoring: false,
      reportThreshold: 100,
      ...options.performance,
    },
  }

  // 创建管理器实例
  const manager = createTemplateManager(mergedOptions)
  
  // 注册内置模板
  if (mergedOptions.registerBuiltinTemplates) {
    registerBuiltinTemplates(manager)
    
    if (mergedOptions.debug) {
      const templates = manager.query({})
      console.log(`[🎯 @ldesign/template] 已注册 ${templates.length} 个内置模板`)
      
      // 按分类统计
      const categories = new Map<string, number>()
      templates.forEach(t => {
        const count = categories.get(t.metadata.category) || 0
        categories.set(t.metadata.category, count + 1)
      })
      
      categories.forEach((count, category) => {
        console.log(`  - ${category}: ${count} 个模板`)
      })
    }
  }
  
  // 注册自定义模板
  if (mergedOptions.registerCustomTemplates) {
    mergedOptions.registerCustomTemplates(manager)
    
    if (mergedOptions.debug) {
      const templates = manager.query({})
      console.log(`[🎯 @ldesign/template] 总计 ${templates.length} 个模板（含自定义）`)
    }
  }

  // 创建插件实例
  const plugin: TemplatePlugin = {
    manager,
    options: mergedOptions,
    
    install(app: App) {
      // 提供管理器实例 - 使用两种键以确保兼容性
      app.provide(TEMPLATE_MANAGER_KEY, manager)
      app.provide('templateManager', manager) // 字符串键用于 useTemplateManager

      // 注册全局组件
      if (mergedOptions.registerComponents) {
        const prefix = mergedOptions.componentPrefix || ''
        
        Object.entries(components).forEach(([name, component]) => {
          const componentName = prefix ? `${prefix}${name}` : name
          app.component(componentName, component)
          
          if (mergedOptions.debug) {
            console.log(`[🎯 @ldesign/template] 注册组件: ${componentName}`)
          }
        })
      }

      // 全局属性
      app.config.globalProperties.$templateManager = manager
      app.config.globalProperties.$template = {
        manager,
        query: manager.query.bind(manager),
        load: manager.load.bind(manager),
        register: manager.register.bind(manager),
      }
      
      if (mergedOptions.debug) {
        console.log('[✅ @ldesign/template] 插件安装完成')
      }
    },
  }

  return plugin
}

/**
 * 便捷函数 - 使用默认配置创建插件
 */
export const TemplatePlugin = createTemplatePlugin()

// 默认导出
export default createTemplatePlugin
