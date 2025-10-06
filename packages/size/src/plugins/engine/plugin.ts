/**
 * Size Engine 插件
 */

import type { SizeMode } from '../../types'
import type { SizeAdapter, SizeEnginePluginOptions } from './types'
import { SizeManagerImpl } from '../../core/size-manager'
import { SizePlugin } from '../vue/plugin'

/**
 * 创建尺寸管理器实例
 */
async function createSizeManagerInstance(
  options: SizeEnginePluginOptions = {},
): Promise<SizeManagerImpl> {
  console.log('[Size Plugin] Creating size manager with options:', options)

  const sizeManager = new SizeManagerImpl({
    prefix: options.prefix || '--ls',
    defaultMode: options.defaultMode || 'medium',
    styleId: options.styleId || 'ldesign-size-variables',
    selector: options.selector || ':root',
    autoInject: options.autoInject !== false,
    enableStorage: options.enableStorage !== false,
    storageType: options.storageType || 'localStorage',
    enableTransition: options.enableTransition !== false,
    transitionDuration: options.transitionDuration || '0.3s',
  })

  // 初始化尺寸管理器
  await sizeManager.init()

  // 只在开发模式下输出日志
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info('[Size Plugin] Size manager created and initialized')
  }
  return sizeManager
}

/**
 * Engine 插件接口
 */
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (context: any) => Promise<void>
  uninstall?: (context: any) => Promise<void>
}

/**
 * Engine 插件上下文
 */
export interface EnginePluginContext {
  engine: any
  logger: any
  config: any
}

/**
 * 创建 Size Engine 插件
 * @param options 插件配置选项
 * @returns Engine 插件
 */
export function createSizeEnginePlugin(
  options: SizeEnginePluginOptions = {},
): Plugin {
  const {
    name = 'size',
    version = '1.0.0',
    customSizes,
    enableDeepMerge = true,
    ...sizeManagerOptions
  } = options

  // 只在开发模式下输出日志
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info('[Size Plugin] createSizeEnginePlugin called with options:', options)
  }

  return {
    name,
    version,
    dependencies: [],

    async install(context) {
      try {
        console.log('[Size Plugin] install method called with context:', context)

        // 从上下文中获取引擎实例
        const engine = context.engine || context
        console.log('[Size Plugin] engine instance:', !!engine)

        // 定义实际的安装逻辑
        const performInstall = async () => {
          engine.logger.info(`[Size Plugin] performInstall called`)

          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing size plugin.',
            )
          }

          engine.logger.info(`[Size Plugin] Vue app found, proceeding with installation`)

          // 记录插件安装开始
          engine.logger.info(`Installing ${name} plugin...`, {
            version,
            enableDeepMerge,
          })

          // 创建尺寸管理器
          const sizeManager = await createSizeManagerInstance(sizeManagerOptions)

          // 设置尺寸变化回调
          if (options.onSizeChanged) {
            sizeManager.on('size-changed', options.onSizeChanged)
          }

          // 设置错误处理回调
          if (options.onError) {
            sizeManager.on('error', options.onError)
          }

          // 创建响应式状态
          let forceUpdateCounter = 0
          const forceUpdateCallbacks: Array<() => void> = []

          // 创建 Size 适配器
          const sizeAdapter: SizeAdapter = {
            install: (engine: any) => {
              console.log('[Size Plugin] sizeAdapter.install called')

              // 安装 Vue 插件
              const vueApp = engine.getApp()
              if (vueApp) {
                console.log('[Size Plugin] Installing Vue plugin')
                vueApp.use(SizePlugin, {
                  sizeManager,
                  globalProperties: true,
                })
              }
            },
            getCurrentMode: () => sizeManager.getCurrentMode(),
            getAvailableModes: () => ['small', 'medium', 'large', 'extra-large'] as SizeMode[],
            on: (event: any, callback: Function) => sizeManager.on(event, callback),
            off: (event: any, callback: Function) => sizeManager.off(event, callback),
            emit: (event: any, data: any) => sizeManager.emit(event, data),
            destroy: () => sizeManager.destroy(),
            setMode: async (mode: SizeMode) => {
              await sizeManager.setMode(mode)
              console.log('[Size Plugin] Reactive size changed to:', mode)

              // 触发所有组件重新渲染
              forceUpdateCounter++
              forceUpdateCallbacks.forEach((callback) => {
                try {
                  callback()
                }
                catch (error) {
                  console.warn('[Size Plugin] Force update callback error:', error)
                }
              })
            },
          }

          // 只在开发模式下输出调试日志
          if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
            console.info('[Size Plugin] sizeAdapter created:', {
              'adapter': !!sizeAdapter,
              'adapter.install': typeof sizeAdapter.install,
            })
          }

          // 设置到引擎
          engine.size = sizeAdapter

          // 只在开发模式下输出调试日志
          if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
            console.info('[Size Plugin] sizeAdapter set to engine.size:', {
              'adapter': !!sizeAdapter,
              'adapter.install': typeof sizeAdapter.install,
              'engine.size': !!engine.size,
              'engine.size.install': typeof engine.size?.install,
            })
          }

          // 手动调用adapter.install，因为Engine的install方法已经执行过了
          if (typeof sizeAdapter.install === 'function') {
            if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
              console.info('[Size Plugin] Manually calling adapter.install')
            }
            sizeAdapter.install(engine)
          }

          engine.logger.info(`${name} plugin installed successfully`)
        }

        // 检查 Vue 应用是否已经创建
        const vueApp = engine.getApp()
        if (vueApp) {
          engine.logger.info(`[Size Plugin] Vue app found, installing immediately`)
          await performInstall()
        }
        else {
          engine.logger.info(`[Size Plugin] Vue app not found, registering event listener`)
          // 如果 Vue 应用还没有创建，监听 app:created 事件
          engine.events.once('app:created', async () => {
            engine.logger.info(`[Size Plugin] app:created event received, installing now`)
            await performInstall()
          })
        }

        engine.logger.info(`${name} plugin registered, waiting for Vue app creation...`)
      }
      catch (error) {
        // 使用engine.logger记录错误，如果不可用则使用console.error
        if (context.engine?.logger) {
          context.engine.logger.error(`[Size Plugin] Installation failed:`, error)
        }
        else {
          console.error(`[Size Plugin] Installation failed:`, error)
        }
        throw error
      }
    },
  }
}

// createSizeManagerInstance 导出
export { createSizeManagerInstance }

// 向后兼容的导出
export { createSizeEnginePlugin as default }
