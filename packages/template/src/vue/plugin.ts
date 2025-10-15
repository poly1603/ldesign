/**
 * Vue 插件
 */

import type { App } from 'vue'
import type { SystemConfig } from '../types'
import { createTemplateManager } from '../runtime'
import * as components from './components'

export const TEMPLATE_MANAGER_KEY = Symbol('templateManager')

export interface TemplatePluginOptions extends SystemConfig {
  registerComponents?: boolean
}

export function createTemplatePlugin(options: TemplatePluginOptions = {}) {
  const { registerComponents = true, ...config } = options

  return {
    install(app: App) {
      // 创建管理器实例
      const manager = createTemplateManager(config)

      // 提供管理器实例
      app.provide(TEMPLATE_MANAGER_KEY, manager)

      // 注册全局组件
      if (registerComponents) {
        Object.entries(components).forEach(([name, component]) => {
          app.component(name, component)
        })
      }

      // 全局属性
      app.config.globalProperties.$templateManager = manager
    },
  }
}

// 默认导出
export default createTemplatePlugin
