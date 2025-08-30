/**
 * Vue 插件系统
 * 支持全局注册模板管理器，提供便捷的使用方式
 */

import type { App, Plugin } from 'vue'
import { TemplateManager } from '../core/template-manager'
import TemplateRenderer from './components/TemplateRenderer'
import TemplateSelector from './components/TemplateSelector'
import { TEMPLATE_MANAGER_KEY } from './composables/useTemplate'
import type { TemplatePluginOptions, TemplateManagerConfig } from '../types'

// 使用统一的符号
export { TEMPLATE_MANAGER_KEY as TemplateManagerSymbol } from './composables/useTemplate'

/**
 * 模板插件类
 */
export class TemplatePlugin {
  private manager: TemplateManager
  private options: TemplatePluginOptions

  constructor(options: TemplatePluginOptions = {}) {
    this.options = {
      componentPrefix: 'L',
      registerComponents: true,
      registerDirectives: true,
      provideGlobalProperties: true,
      ...options,
    }

    // 创建模板管理器
    this.manager = new TemplateManager(options as TemplateManagerConfig)
  }

  /**
   * 安装插件
   */
  install(app: App) {
    // 提供模板管理器实例
    app.provide(TEMPLATE_MANAGER_KEY, this.manager)

    // 注册全局组件
    if (this.options.registerComponents) {
      this.registerComponents(app)
    }

    // 注册指令
    if (this.options.registerDirectives) {
      this.registerDirectives(app)
    }

    // 提供全局属性
    if (this.options.provideGlobalProperties) {
      this.provideGlobalProperties(app)
    }

    // 初始化管理器
    this.initializeManager()

    // 确保设备适配器立即初始化
    this.manager.getCurrentDevice()
  }

  /**
   * 注册全局组件
   */
  private registerComponents(app: App) {
    const prefix = this.options.componentPrefix || 'L'

    app.component(`${prefix}TemplateRenderer`, TemplateRenderer)
    app.component(`${prefix}TemplateSelector`, TemplateSelector)
  }

  /**
   * 注册指令
   */
  private registerDirectives(app: App) {
    // v-template 指令：根据表达式渲染模板
    app.directive('template', {
      mounted(el, binding) {
        const { value } = binding
        if (typeof value === 'string') {
          // 简单用法：v-template="'login'"
          el.setAttribute('data-template-category', value)
        } else if (typeof value === 'object') {
          // 复杂用法：v-template="{ category: 'login', device: 'mobile' }"
          Object.keys(value).forEach(key => {
            el.setAttribute(`data-template-${key}`, value[key])
          })
        }
      },
    })

    // v-template-device 指令：根据设备类型显示/隐藏元素
    app.directive('template-device', {
      mounted(el, binding, vnode) {
        const { value } = binding
        const manager = vnode.appContext?.provides?.[TemplateManagerSymbol] as TemplateManager

        if (manager) {
          const currentDevice = manager.getCurrentDevice()
          const targetDevices = Array.isArray(value) ? value : [value]

          if (!targetDevices.includes(currentDevice)) {
            el.style.display = 'none'
          }

          // 监听设备变化
          manager.on('device:change', (from, to) => {
            if (targetDevices.includes(to)) {
              el.style.display = ''
            } else {
              el.style.display = 'none'
            }
          })
        }
      },
    })

    // v-template-preload 指令：预加载模板
    app.directive('template-preload', {
      mounted(el, binding, vnode) {
        const { value } = binding
        const manager = vnode.appContext?.provides?.[TemplateManagerSymbol] as TemplateManager

        if (manager && value) {
          const templates = Array.isArray(value) ? value : [value]
          manager.preloadTemplates(templates).catch(error => {
            console.warn('Template preload failed:', error)
          })
        }
      },
    })
  }

  /**
   * 提供全局属性
   */
  private provideGlobalProperties(app: App) {
    app.config.globalProperties.$templateManager = this.manager

    // 便捷方法
    app.config.globalProperties.$renderTemplate = (
      category: string,
      deviceType?: string,
      templateName?: string,
      props?: Record<string, any>
    ) => {
      return this.manager.render(category, deviceType as any, templateName, props)
    }

    app.config.globalProperties.$switchTemplate = (
      category: string,
      templateName: string,
      deviceType?: string
    ) => {
      return this.manager.switchTemplate(category, templateName, deviceType as any)
    }

    app.config.globalProperties.$getCurrentDevice = () => {
      return this.manager.getCurrentDevice()
    }

    app.config.globalProperties.$getTemplates = (category?: string, deviceType?: string) => {
      return this.manager.getTemplates(category, deviceType as any)
    }


  }

  /**
   * 初始化管理器
   */
  private async initializeManager() {
    try {
      // 首先注册内置模板
      await this.registerBuiltinTemplates()

      // 然后初始化管理器（这会扫描文件系统中的模板）
      await this.manager.initialize()

      console.log('Template manager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize template manager:', error)
    }
  }

  /**
   * 注册内置模板
   */
  private async registerBuiltinTemplates() {
    try {
      // 动态导入内置模板
      const { BUILTIN_TEMPLATES } = await import('../templates')

      // 注册所有内置模板
      this.manager.registerTemplates(BUILTIN_TEMPLATES)

      if (this.options.debug) {
        console.log(`Registered ${BUILTIN_TEMPLATES.length} builtin templates`)
      }
    } catch (error) {
      console.error('Failed to register builtin templates:', error)
    }
  }

  /**
   * 获取管理器实例
   */
  getManager(): TemplateManager {
    return this.manager
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<TemplatePluginOptions>) {
    this.options = { ...this.options, ...config }
    this.manager.updateConfig(config as Partial<TemplateManagerConfig>)
  }
}

/**
 * 创建模板插件
 */
export function createTemplatePlugin(options: TemplatePluginOptions = {}): TemplatePlugin {
  return new TemplatePlugin(options)
}

/**
 * 配置模板管理器
 */
export function configureTemplateManager(config: TemplatePluginOptions): Plugin {
  const plugin = createTemplatePlugin(config)

  return {
    install(app: App) {
      plugin.install(app)
    },
  }
}

/**
 * 默认插件安装函数
 */
export function install(app: App, options: TemplatePluginOptions = {}) {
  const plugin = createTemplatePlugin(options)
  plugin.install(app)
}

/**
 * 默认导出插件
 */
export default {
  install,
}

// 类型声明扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $templateManager: TemplateManager
    $renderTemplate: (
      category: string,
      deviceType?: string,
      templateName?: string,
      props?: Record<string, any>
    ) => Promise<any>
    $switchTemplate: (
      category: string,
      templateName: string,
      deviceType?: string
    ) => Promise<any>
    $getCurrentDevice: () => string
    $getTemplates: (category?: string, deviceType?: string) => any[]
  }
}
