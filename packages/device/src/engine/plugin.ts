/**
 * Device Engine 插件
 *
 * 将 Device 功能集成到 LDesign Engine 中，提供统一的设备检测管理体验
 */

import type { DevicePluginOptions, EngineContext } from '../types'
import { DeviceDetector } from '../core/DeviceDetector'
// import type { Plugin } from '@ldesign/engine/types' // 暂时注释，等待外部包安装
import { DevicePlugin } from '../vue/plugin'

// 本地 EngineLike 类型，避免使用 any
// 注意：必须在所有 import 之后声明，以满足 import/first 规则
type EngineLike = NonNullable<EngineContext['engine']>

/**
 * Device Engine 插件配置选项
 */
export interface DeviceEnginePluginOptions extends DevicePluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 插件描述 */
  description?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 是否自动安装到 Vue 应用 */
  autoInstall?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * Plugin 接口定义（临时）
 */
export interface Plugin {
  name: string
  version?: string
  dependencies?: string[]
  install: (context: unknown) => Promise<void> | void
  uninstall?: (context: unknown) => Promise<void> | void
}

/**
 * 默认配置
 */
const defaultConfig: Partial<DeviceEnginePluginOptions> = {
  name: 'device',
  version: '1.0.0',
  description: 'LDesign Device Engine Plugin',
  dependencies: [],
  autoInstall: true,
  enablePerformanceMonitoring: false,
  debug: false,
  globalPropertyName: '$device',
  enableResize: true,
  enableOrientation: true,
  modules: ['network', 'battery', 'geolocation'],
}

/**
 * 创建全局 Device 实例
 *
 * @param config 配置选项
 * @returns DeviceDetector 实例
 */
function createGlobalDeviceInstance(config: DeviceEnginePluginOptions): DeviceDetector {
  const {
    enableResize = true,
    enableOrientation = true,
    modules = ['network', 'battery', 'geolocation'],
    debug = false,
  } = config

  if (debug) {
    console.warn('[Device Plugin] Creating global device instance with config:', {
      enableResize,
      enableOrientation,
      modules,
    })
  }

  // 创建设备检测器实例
  const detector = new DeviceDetector({
    enableResize,
    enableOrientation,
  })

  // 根据配置加载模块
  if (modules.includes('network')) {
    detector.loadModule('network')
  }
  if (modules.includes('battery')) {
    detector.loadModule('battery')
  }
  if (modules.includes('geolocation')) {
    detector.loadModule('geolocation')
  }

  if (debug) {
    console.warn('[Device Plugin] Global device instance created successfully')
  }

  return detector
}

/**
 * 创建 Device Engine 插件
 *
 * 将 Device 功能集成到 LDesign Engine 中，提供统一的设备检测管理体验
 *
 * @param options 插件配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createDeviceEnginePlugin } from '@ldesign/device'
 *
 * const devicePlugin = createDeviceEnginePlugin({
 *   enableResize: true,
 *   enableOrientation: true,
 *   modules: ['network', 'battery'],
 *   globalPropertyName: '$device',
 *   enablePerformanceMonitoring: true
 * })
 *
 * await engine.use(devicePlugin)
 * ```
 */
export function createDeviceEnginePlugin(
  options: DeviceEnginePluginOptions = {},
): Plugin {
  // 合并配置
  const config = { ...defaultConfig, ...options }

  const {
    name = 'device',
    version = '1.0.0',
    description = 'LDesign Device Engine Plugin',
    dependencies = [],
    autoInstall = true,
    enablePerformanceMonitoring = false,
    debug = false,
  } = config

  if (debug) {
    console.warn('[Device Plugin] createDeviceEnginePlugin called with options:', options)
  }

  return {
    name,
    version,
    dependencies,

    async install(context: unknown) {
      try {
        if (debug) {
          console.warn('[Device Plugin] install method called with context:', context)
        }

        // 从上下文中获取引擎实例
        const engineRaw = (context as { engine?: unknown }).engine ?? context
        const engine = engineRaw as EngineLike

        if (debug) {
          console.warn('[Device Plugin] engine instance:', !!engine)
        }

        // 定义实际的安装逻辑
        const performInstall = async () => {
          engine.logger?.info(`[Device Plugin] performInstall called`)

          // 获取 Vue 应用实例
          const vueApp = engine.getApp() as any
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing device plugin.',
            )
          }

          engine.logger?.info(`[Device Plugin] Vue app found, proceeding with installation`)

          // 记录插件安装开始
          engine.logger?.info(`Installing ${name} plugin...`, {
            version,
            enablePerformanceMonitoring,
            description,
          })

          // 创建全局 Device 实例
          const globalDevice = createGlobalDeviceInstance(config)

          // 注册到 Engine 状态管理
          if (engine.state) {
            engine.state.set('device', globalDevice)
            engine.logger?.info(`[Device Plugin] Device instance registered to engine state`)
          }

          // 安装 Vue 插件
          if (autoInstall) {
            vueApp.use(DevicePlugin, config)
            engine.logger?.info(`[Device Plugin] Vue plugin installed`)
          }

          // 添加到全局属性
          const globalPropertyName = config.globalPropertyName || '$device'
          if (!vueApp.config?.globalProperties[globalPropertyName]) {
            vueApp.config.globalProperties[globalPropertyName] = globalDevice
            engine.logger?.info(`[Device Plugin] Global property ${globalPropertyName} added`)
          }

          // 性能监控
          if (enablePerformanceMonitoring) {
            const startTime = performance.now()

            // 监听设备变化事件
            globalDevice.on('deviceChange', (deviceInfo) => {
              const endTime = performance.now()
              engine.logger?.info(`[Device Plugin] Device change detected in ${endTime - startTime}ms`, deviceInfo)
            })

            engine.logger?.info(`[Device Plugin] Performance monitoring enabled`)
          }

          // 注册事件监听器
          engine.events?.on('app:beforeUnmount', () => {
            globalDevice.destroy()
            engine.logger?.info(`[Device Plugin] Device detector destroyed on app unmount`)
          })

          engine.logger?.info(`[Device Plugin] ${name} plugin installed successfully`)
        }

        // 检查 Vue 应用是否已创建
        if (engine.getApp()) {
          // Vue 应用已存在，直接安装
          await performInstall()
        }
        else {
          // Vue 应用尚未创建，等待创建事件
          await new Promise<void>((resolve, reject) => {
            engine.events?.once('app:created', async () => {
              try {
                await performInstall()
                resolve()
              }
              catch (error) {
                engine.logger?.error(`[Device Plugin] Failed to install after app creation:`, error)
                reject(error)
              }
            })
          })
        }
      }
      catch (error) {
        const errorMessage = `Failed to install ${name} plugin: ${error instanceof Error ? error.message : String(error)}`

        // 记录错误日志
        const ctx = context as EngineContext
        if (ctx.engine?.logger) {
          ctx.engine.logger.error(errorMessage, { error })
        }
        else {
          console.error(errorMessage)
        }

        throw new Error(errorMessage)
      }
    },

    async uninstall(context: unknown) {
      try {
        if (debug) {
          console.warn('[Device Plugin] uninstall method called')
        }

        const engineRaw = (context as { engine?: unknown }).engine ?? context
        const engine = engineRaw as EngineLike

        // 从状态管理中移除
        if (engine.state) {
          const deviceInstance = engine.state.get('device') as any
          if (deviceInstance && typeof deviceInstance.destroy === 'function') {
            deviceInstance.destroy()
          }
          engine.state.delete('device')
        }

        // 移除全局属性
          const vueApp = engine.getApp() as any
          if (vueApp) {
            const globalPropertyName = config.globalPropertyName || '$device'
            if (vueApp.config?.globalProperties) {
              delete vueApp.config.globalProperties[globalPropertyName]
            }
          }

        engine.logger?.info(`[Device Plugin] ${name} plugin uninstalled successfully`)
      }
      catch (error) {
        const errorMessage = `Failed to uninstall ${name} plugin: ${error instanceof Error ? error.message : String(error)}`

        const ctx = context as EngineContext
        if (ctx.engine?.logger) {
          ctx.engine.logger.error(errorMessage, { error })
        }
        else {
          console.error(errorMessage)
        }

        throw new Error(errorMessage)
      }
    },
  }
}

/**
 * 默认导出插件创建函数
 */
export default createDeviceEnginePlugin
