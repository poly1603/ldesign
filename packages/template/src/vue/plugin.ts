/**
 * Vue 3 插件支持 - 重构版本
 *
 * 提供完整的 Vue 3 插件功能
 */

import type { App, Plugin } from 'vue'
import type { TemplateManagerConfig, DeviceType } from '../types'
import { TemplateManager } from '../core/manager'
import { TemplateRenderer } from './components/TemplateRenderer'

/**
 * Vue 插件配置
 */
export interface TemplatePluginOptions extends TemplateManagerConfig {
  /** 默认设备类型 */
  defaultDevice?: DeviceType
  /** 组件前缀 */
  componentPrefix?: string
  /** 是否注册全局组件 */
  registerComponents?: boolean
  /** 是否注册全局指令 */
  registerDirectives?: boolean
  /** 是否提供全局属性 */
  provideGlobalProperties?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
}

/**
 * 全局模板管理器实例
 */
let globalTemplateManager: TemplateManager | null = null

/**
 * 获取全局模板管理器
 */
export function getGlobalTemplateManager(): TemplateManager {
  if (!globalTemplateManager) {
    throw new Error('Template plugin not installed. Please install the plugin first.')
  }
  return globalTemplateManager
}

/**
 * 销毁全局模板管理器
 */
export function destroyGlobalTemplateManager(): void {
  if (globalTemplateManager) {
    globalTemplateManager.destroy()
    globalTemplateManager = null
  }
}

/**
 * 创建 v-template 指令
 */
function createTemplateDirective() {
  return {
    mounted(el: HTMLElement, binding: any) {
      const { category, device, template, props = {} } = binding.value || {}

      if (!category || !template) {
        console.warn('v-template directive requires category and template')
        return
      }

      const manager = getGlobalTemplateManager()

      manager
        .render({
          category,
          device: device || manager.getCurrentDevice(),
          template,
          props,
        })
        .then(result => {
          // 简单的组件渲染到元素
          if (result.component && el) {
            el.innerHTML = '<div>Template rendered via directive</div>'
          }
        })
        .catch(error => {
          console.error('Template directive render failed:', error)
          el.innerHTML = '<div>Template render failed</div>'
        })
    },

    updated(el: HTMLElement, binding: any) {
      // 处理指令更新
      const { category, device, template, props = {} } = binding.value || {}

      if (!category || !template) {
        return
      }

      // 重新渲染
      const manager = getGlobalTemplateManager()
      manager
        .render({
          category,
          device: device || manager.getCurrentDevice(),
          template,
          props,
        })
        .catch(error => {
          console.error('Template directive update failed:', error)
        })
    },
  }
}

/**
 * LDesign Template Vue 插件
 */
export const TemplatePlugin: Plugin = {
  install(app: App, options: TemplatePluginOptions = {}) {
    const {
      defaultDevice = 'desktop',
      componentPrefix = 'L',
      registerComponents = true,
      registerDirectives = true,
      provideGlobalProperties = true,
      globalPropertyName = '$template',
      ...managerConfig
    } = options

    console.log('🎨 安装 LDesign Template Vue 插件...')

    try {
      // 创建全局模板管理器
      globalTemplateManager = new TemplateManager({
        autoDetectDevice: true,
        enableCache: true,
        debug: false,
        ...managerConfig,
      })

      // 注册全局组件
      if (registerComponents) {
        app.component(`${componentPrefix}TemplateRenderer`, TemplateRenderer)
        console.log(`✅ 注册全局组件: ${componentPrefix}TemplateRenderer`)
      }

      // 注册全局指令
      if (registerDirectives) {
        app.directive('template', createTemplateDirective())
        console.log('✅ 注册全局指令: v-template')
      }

      // 提供全局属性
      if (provideGlobalProperties) {
        app.config.globalProperties[globalPropertyName] = {
          manager: globalTemplateManager,
          render: globalTemplateManager.render.bind(globalTemplateManager),
          switchTemplate: globalTemplateManager.switchTemplate.bind(globalTemplateManager),
          getCurrentDevice: globalTemplateManager.getCurrentDevice.bind(globalTemplateManager),
          getTemplates: globalTemplateManager.getTemplates.bind(globalTemplateManager),
          scanTemplates: globalTemplateManager.scanTemplates.bind(globalTemplateManager),
        }
        console.log(`✅ 注册全局属性: ${globalPropertyName}`)
      }

      // 提供依赖注入
      app.provide('template-manager', globalTemplateManager)
      app.provide('template-options', options)

      // 扫描模板（异步）
      globalTemplateManager
        .scanTemplates()
        .then(result => {
          console.log(`✅ 模板扫描完成，发现 ${result.count} 个模板`)
        })
        .catch(error => {
          console.warn('⚠️ 模板扫描失败:', error)
        })

      // 在应用卸载时清理资源
      const originalUnmount = app.unmount
      app.unmount = function () {
        destroyGlobalTemplateManager()
        return originalUnmount.call(this)
      }

      console.log('✅ LDesign Template Vue 插件安装成功')
    } catch (error) {
      console.error('❌ LDesign Template Vue 插件安装失败:', error)
      throw error
    }
  },
}

/**
 * 创建 Template Vue 插件
 */
export function createTemplatePlugin(options: TemplatePluginOptions = {}): Plugin {
  return {
    install(app: App) {
      TemplatePlugin.install!(app, options)
    },
  }
}

/**
 * 在组合式 API 中获取模板管理器
 */
export function useTemplateManager(): TemplateManager {
  return getGlobalTemplateManager()
}

// 默认导出
export default TemplatePlugin
