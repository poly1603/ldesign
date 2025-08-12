// 临时使用 any 类型，避免循环依赖
type Plugin = {
  name: string
  version: string
  dependencies?: string[]
  install(engine: any): Promise<void>
  uninstall?(engine: any): Promise<void>
  [key: string]: any
}
import TemplatePlugin from '../vue/plugins'
import type { TemplatePluginOptions } from '../vue/plugins'

/**
 * Template Engine 插件选项
 */
export interface TemplateEnginePluginOptions extends TemplatePluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
}

/**
 * 创建 Template Engine 插件
 *
 * 将 Template Vue 插件包装为标准的 Engine 插件，提供统一的插件管理体验
 *
 * @param options Template 配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createTemplateEnginePlugin } from '@ldesign/template'
 *
 * const templatePlugin = createTemplateEnginePlugin({
 *   defaultDevice: 'desktop',
 *   enableCache: true,
 *   autoDetectDevice: true
 * })
 *
 * await engine.use(templatePlugin)
 * ```
 */
export function createTemplateEnginePlugin(options: TemplateEnginePluginOptions = {}): Plugin {
  const { name = 'template', version = '1.0.0', ...templateOptions } = options

  return {
    name,
    version,
    dependencies: [], // Template 插件通常不依赖其他插件

    async install(engine) {
      try {
        // 获取 Vue 应用实例
        const vueApp = engine.getApp()
        if (!vueApp) {
          throw new Error(
            'Vue app not found. Make sure the engine has created a Vue app before installing template plugin.'
          )
        }

        // 记录插件安装开始
        engine.logger.info(`Installing ${name} plugin...`, {
          version,
          options: templateOptions,
        })

        // 安装 Template Vue 插件
        vueApp.use(TemplatePlugin, templateOptions)

        // 获取全局模板管理器实例
        const { getGlobalTemplateManager } = await import('../vue/plugins')
        const templateManager = getGlobalTemplateManager()

        if (templateManager) {
          // 将模板管理器注册到引擎中，便于其他插件访问
          ;(engine as any).templateManager = templateManager

          // 注册全局状态
          engine.state.set('template:currentDevice', templateManager.getCurrentDevice())
          engine.state.set('template:availableTemplates', templateManager.getAvailableTemplates())

          // 监听模板变更事件，与引擎事件系统集成
          templateManager.on('template:load' as any, (event: any) => {
            engine.events.emit('template:loaded', {
              category: event.category,
              device: event.device,
              template: event.template,
              timestamp: Date.now(),
            })
          })

          templateManager.on('template:error', (event: any) => {
            engine.events.emit('template:error', {
              error: event.error,
              category: event.category,
              device: event.device,
              template: event.template,
              timestamp: Date.now(),
            })
          })

          templateManager.on('device:change' as any, (event: any) => {
            engine.state.set('template:currentDevice', event.newDevice)
            engine.events.emit('template:deviceChanged', {
              newDevice: event.newDevice,
              oldDevice: event.oldDevice,
              timestamp: Date.now(),
            })
          })
        }

        // 记录插件安装成功
        const availableTemplates = await templateManager?.getAvailableTemplates()
        engine.logger.info(`${name} plugin installed successfully`, {
          currentDevice: templateManager?.getCurrentDevice(),
          availableTemplates: availableTemplates?.length || 0,
        })

        // 触发插件安装完成事件
        engine.events.emit('plugin:template:installed', {
          manager: templateManager,
          options: templateOptions,
        })
      } catch (error) {
        // 记录安装失败
        engine.logger.error(`Failed to install ${name} plugin`, error)

        // 触发插件安装失败事件
        engine.events.emit('plugin:template:installFailed', {
          error,
          options: templateOptions,
        })

        throw error
      }
    },

    async uninstall(engine) {
      try {
        engine.logger.info(`Uninstalling ${name} plugin...`)

        // 清理全局状态
        engine.state.delete('template:currentDevice')
        engine.state.delete('template:availableTemplates')

        // 清理引擎上的模板管理器实例
        delete (engine as any).templateManager

        // 销毁全局模板管理器
        const { destroyGlobalTemplateManager } = await import('../vue/plugins')
        destroyGlobalTemplateManager()

        // 触发插件卸载完成事件
        engine.events.emit('plugin:template:uninstalled', {
          timestamp: Date.now(),
        })

        engine.logger.info(`${name} plugin uninstalled successfully`)
      } catch (error) {
        engine.logger.error(`Failed to uninstall ${name} plugin`, error)
        throw error
      }
    },
  }
}

/**
 * 默认 Template Engine 插件实例
 *
 * 使用默认配置创建的 Template 插件，可以直接使用
 *
 * @example
 * ```typescript
 * import { defaultTemplateEnginePlugin } from '@ldesign/template'
 *
 * await engine.use(defaultTemplateEnginePlugin)
 * ```
 */
export const defaultTemplateEnginePlugin = createTemplateEnginePlugin({
  defaultDevice: 'desktop',
  enableCache: true,
  cacheLimit: 50,
  componentPrefix: 'L',
  registerComponents: true,
  registerDirectives: true,
  provideGlobalProperties: true,
})
