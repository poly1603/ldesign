/**
 * LDesign Engine 插件支持
 *
 * 为 @ldesign/engine 提供模板系统插件
 */

import type { DeviceType, TemplateManagerConfig } from '../types'

/**
 * Engine 插件配置
 */
export interface TemplateEnginePluginConfig extends TemplateManagerConfig {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 默认设备类型 */
  defaultDevice?: DeviceType
  /** 插件依赖 */
  dependencies?: string[]
}

/**
 * Engine 插件接口（简化版本）
 */
export interface EnginePlugin {
  name: string
  version?: string
  dependencies?: string[]
  install: (engine: any) => void | Promise<void>
  uninstall?: (engine: any) => void | Promise<void>
}

/**
 * 创建 Template Engine 插件
 */
export function createTemplateEnginePlugin(config: TemplateEnginePluginConfig): EnginePlugin {
  const { name, version = '1.0.0', defaultDevice = 'desktop', dependencies = [], ...managerConfig } = config

  return {
    name,
    version,
    dependencies,

    async install(context: any) {
      console.log(`🎨 安装 Template 插件: ${name} v${version}`)

      // 从 context 中获取 engine（与 I18n 插件保持一致）
      const engine = context.engine || context

      try {

        console.log('🔍 Template 插件安装开始')
        console.log('🔍 Context 对象:', context)
        console.log('🔍 Engine 对象:', engine)
        console.log('🔍 Engine 类型:', typeof engine)
        // 动态导入模板管理器
        const { TemplateManager } = await import('../core/manager')

        // 创建模板管理器实例
        const manager = new TemplateManager({
          autoDetectDevice: true,
          enableCache: true,
          debug: engine.config?.debug || false,
          ...managerConfig,
        })

        // 扫描模板
        await manager.scanTemplates()

        // 注册到引擎状态
        if (engine.state) {
          engine.state.set('template:manager', manager)
          engine.state.set('template:currentDevice', defaultDevice)
          engine.state.set('template:currentTemplate', null)
        }

        // 注册全局属性和指令（如果引擎有Vue应用实例）
        console.log('🔍 检查引擎是否有 getApp 方法:', !!engine.getApp)
        console.log('🔍 getApp 方法类型:', typeof engine.getApp)

        if (engine.getApp && typeof engine.getApp === 'function') {
          console.log('🔍 开始获取 Vue 应用实例...')
          const app = engine.getApp()
          console.log('🔍 获取到的 Vue 应用实例:', app)
          console.log('🔍 应用实例类型:', typeof app)
          console.log('🔍 应用实例配置:', app?.config)
          console.log('🔍 应用实例全局属性:', app?.config?.globalProperties)
          console.log('🔍 应用实例指令方法:', typeof app?.directive)

          if (app && app.config && app.config.globalProperties) {
            console.log('🔍 Vue 应用实例验证通过，开始注册全局属性和指令...')
            // 注册全局属性
            app.config.globalProperties.$templateManager = manager
            app.config.globalProperties.$template = {
              manager,
              render: manager.render.bind(manager),
              switchTemplate: manager.switchTemplate.bind(manager),
              getCurrentDevice: manager.getCurrentDevice.bind(manager),
              getTemplates: manager.getTemplates.bind(manager),
            }

            // 注册 v-template 指令
            app.directive('template', {
              async mounted(el: HTMLElement, binding: any, vnode: any) {
                const { category, device, template, props = {} } = binding.value || {}

                if (!category || !template) {
                  console.warn('v-template 指令需要 category 和 template 参数')
                  return
                }

                console.log(`🎨 v-template 指令开始渲染: ${category}/${device || 'auto'}/${template}`)

                try {
                  const result = await manager.render({
                    category,
                    device: device || manager.getCurrentDevice(),
                    template: template,
                    props,
                  })

                  console.log(`✅ v-template 指令渲染成功:`, result)

                  // 使用 Vue 的 createApp 来渲染组件到指定元素
                  const { createApp, h } = await import('vue')

                  // 清空原有内容
                  el.innerHTML = ''

                  // 创建一个新的 Vue 应用来渲染模板组件
                  const templateApp = createApp({
                    render() {
                      return h(result.component, props)
                    },
                  })

                  // 挂载到元素
                  templateApp.mount(el)

                    // 保存应用实例以便后续清理
                    ; (el as any).__templateApp = templateApp
                } catch (error) {
                  console.error('❌ v-template 指令渲染失败:', error)
                  // 保持原有内容作为备用
                }
              },

              async updated(el: HTMLElement, binding: any) {
                // 处理指令更新
                if (binding.value !== binding.oldValue) {
                  // 清理旧的应用实例
                  if ((el as any).__templateApp) {
                    ; (el as any).__templateApp.unmount()
                    delete (el as any).__templateApp
                  }

                  // 重新渲染
                  const { category, deviceType, templateId, props = {} } = binding.value || {}

                  if (category && templateId) {
                    try {
                      const result = await manager.render({
                        category,
                        device: deviceType || manager.getCurrentDevice(),
                        template: templateId,
                        props,
                      })

                      const { createApp, h } = await import('vue')

                      el.innerHTML = ''

                      const templateApp = createApp({
                        render() {
                          return h(result.component, props)
                        },
                      })

                      templateApp.mount(el)
                        ; (el as any).__templateApp = templateApp
                    } catch (error) {
                      console.error('❌ v-template 指令更新失败:', error)
                    }
                  }
                }
              },

              unmounted(el: HTMLElement) {
                // 清理应用实例
                if ((el as any).__templateApp) {
                  ; (el as any).__templateApp.unmount()
                  delete (el as any).__templateApp
                }
              },
            })

            console.log('✅ 注册 v-template 指令成功')
          }
        }

        // 监听设备变化事件
        manager.on('device:change', (event: any) => {
          if (engine.state) {
            engine.state.set('template:currentDevice', event.newDevice)
          }
          if (engine.events) {
            engine.events.emit('template:device:change', event)
          }
        })

        // 监听模板变化事件
        manager.on('template:change', (event: any) => {
          if (engine.state) {
            engine.state.set('template:currentTemplate', event.newTemplate)
          }
          if (engine.events) {
            engine.events.emit('template:template:change', event)
          }
        })

        // 发射插件安装事件
        if (engine.events) {
          engine.events.emit('plugin:template:installed', {
            name,
            version,
            manager,
          })
        }

        // 记录日志
        if (engine.logger) {
          engine.logger.info(`Template plugin ${name} v${version} installed successfully`)
        }

        console.log(`✅ Template 插件安装成功: ${name} v${version}`)
      } catch (error) {
        console.error(`❌ Template 插件安装失败: ${name}`, error)
        if (engine.logger) {
          engine.logger.error(`Failed to install template plugin ${name}`, error)
        }
        throw error
      }
    },

    async uninstall(engine: any) {
      console.log(`🗑️ 卸载 Template 插件: ${name}`)

      try {
        // 获取管理器实例
        const manager = engine.state?.get('template:manager')
        if (manager && typeof manager.destroy === 'function') {
          manager.destroy()
        }

        // 清理状态
        if (engine.state) {
          engine.state.delete('template:manager')
          engine.state.delete('template:currentDevice')
          engine.state.delete('template:currentTemplate')
        }

        // 清理全局属性
        if (engine.getApp && typeof engine.getApp === 'function') {
          const app = engine.getApp()
          if (app && app.config && app.config.globalProperties) {
            delete app.config.globalProperties.$templateManager
            delete app.config.globalProperties.$template
          }
        }

        // 发射插件卸载事件
        if (engine.events) {
          engine.events.emit('plugin:template:uninstalled', {
            name,
            version,
          })
        }

        // 记录日志
        if (engine.logger) {
          engine.logger.info(`Template plugin ${name} uninstalled successfully`)
        }

        console.log(`✅ Template 插件卸载成功: ${name}`)
      } catch (error) {
        console.error(`❌ Template 插件卸载失败: ${name}`, error)
        if (engine.logger) {
          engine.logger.error(`Failed to uninstall template plugin ${name}`, error)
        }
        throw error
      }
    },
  }
}

/**
 * 默认的 Template Engine 插件配置
 */
export const defaultTemplateEnginePluginConfig: Partial<TemplateEnginePluginConfig> = {
  name: 'template',
  version: '1.0.0',
  defaultDevice: 'desktop',
  enableCache: true,
  autoDetectDevice: true,
  debug: false,
  dependencies: [],
}

/**
 * 创建默认的 Template Engine 插件
 */
export function createDefaultTemplateEnginePlugin(overrides: Partial<TemplateEnginePluginConfig> = {}): EnginePlugin {
  return createTemplateEnginePlugin({
    ...defaultTemplateEnginePluginConfig,
    ...overrides,
  } as TemplateEnginePluginConfig)
}
