/**
 * Template Engine 插件
 * 将模板管理系统集成到 LDesign Engine 中
 */

import type { Plugin } from '@ldesign/engine'
import type { App } from 'vue'
import type { PluginConfig, TemplateManagerConfig } from '../types'
import { TemplateManager } from '../core/manager'
import { installTemplateDirectives } from '../vue/directives/template'

/**
 * Template Engine 插件配置选项
 */
export interface TemplateEnginePluginOptions extends Partial<PluginConfig> {
  name?: string
  version?: string
  dependencies?: string[]
}

/**
 * 默认插件配置
 */
const defaultConfig: TemplateEnginePluginOptions = {
  name: 'template',
  version: '1.0.0',
  dependencies: [],
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
 * 创建模板 Engine 插件
 * 将模板管理系统集成到 LDesign Engine 中，提供统一的模板管理体验
 */
export function createTemplateEnginePlugin(
  options: TemplateEnginePluginOptions = {},
): Plugin {
  // 合并配置
  const config = { ...defaultConfig, ...options }

  const {
    name = 'template',
    version = '1.0.0',
    dependencies = [],
  } = config

  return {
    name,
    version,
    dependencies,

    async install(context: any) {
      try {
        // 从上下文中获取引擎实例
        const engine = context.engine || context

        // 定义实际的安装逻辑
        const performInstall = async () => {
          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing template plugin.',
            )
          }

          // 记录插件安装开始
          engine.logger.info(`Installing ${name} plugin...`, {
            version,
            config: {
              scanner: config.scanner,
              cache: config.cache,
              deviceAdapter: config.deviceAdapter,
            },
          })

          // 创建模板管理器实例
          const manager = new TemplateManager(config)

          // 将模板管理器注册到 engine 上
          const templateAdapter = {
            install: (_engine: any) => {
              // 已经安装，无需重复安装
            },
            render: manager.render.bind(manager),
            preloadTemplate: manager.preloadTemplate.bind(manager),
            clearCache: manager.clearCache.bind(manager),
            getTemplates: manager.getTemplates.bind(manager),
            scanTemplates: manager.scanTemplates.bind(manager),
            getManager: () => manager, // 返回原始管理器实例
          }

          // 注册到引擎
          engine.template = templateAdapter

          // 安装Vue插件功能
          await installVueIntegration(vueApp, manager, config)

          // 初始化管理器
          await manager.initialize()

          engine.logger.info(`${name} plugin installed successfully`, {
            version,
            templatesCount: manager.getTemplates().length,
          })
        }

        // 如果引擎已经有Vue应用，立即安装
        if (engine.getApp && engine.getApp()) {
          await performInstall()
        } else {
          // 否则等待Vue应用创建后再安装
          engine.onAppCreated = engine.onAppCreated || []
          engine.onAppCreated.push(performInstall)
        }
      } catch (error) {
        const engine = context.engine || context
        if (
          engine
          && engine.logger
          && typeof engine.logger.error === 'function'
        ) {
          engine.logger.error(`Failed to install ${name} plugin:`, error)
        } else {
          console.error(`Failed to install ${name} plugin:`, error)
        }
        throw error
      }
    },

    async uninstall(context: any) {
      try {
        const engine = context.engine || context

        engine.logger.info(`Uninstalling ${name} plugin...`)

        // 清理模板管理器
        if (engine.template && engine.template.getManager) {
          const manager = engine.template.getManager()
          if (manager && typeof manager.dispose === 'function') {
            manager.dispose()
          }
        }

        // 从引擎中移除
        delete engine.template

        engine.logger.info(`${name} plugin uninstalled successfully`)
      } catch (error) {
        const engine = context.engine || context
        if (
          engine
          && engine.logger
          && typeof engine.logger.error === 'function'
        ) {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        } else {
          console.error(`Failed to uninstall ${name} plugin:`, error)
        }
        throw error
      }
    },
  }
}

/**
 * 安装Vue集成功能
 */
async function installVueIntegration(
  app: App,
  manager: TemplateManager,
  config: TemplateEnginePluginOptions,
) {
  // 提供管理器实例
  const TemplateManagerSymbol = Symbol('TemplateManager')
  app.provide(TemplateManagerSymbol, manager)

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
}

/**
 * 默认模板 Engine 插件实例
 */
export function createDefaultTemplateEnginePlugin(): Plugin {
  return createTemplateEnginePlugin({
    name: 'template',
    version: '1.0.0',
  })
}

// 类型声明扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $templateManager: TemplateManager
    $loadTemplate: (template: string, deviceType?: string) => Promise<any>
    $preloadTemplate: (template: string, deviceType?: string) => Promise<void>
    $clearTemplateCache: (template?: string, deviceType?: string) => void
  }
}

// 扩展Engine类型
declare global {
  namespace LDesign {
    interface Engine {
      template?: {
        render: (template: string, deviceType?: string) => Promise<any>
        preloadTemplate: (template: string, deviceType?: string) => Promise<void>
        clearCache: (template?: string, deviceType?: string) => void
        getTemplates: () => any[]
        scanTemplates: () => Promise<void>
        getManager: () => TemplateManager
      }
    }
  }
}
