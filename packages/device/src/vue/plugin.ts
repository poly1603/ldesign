import type { App, Plugin } from 'vue'
import type { DevicePluginOptions } from '../types'
import { inject } from 'vue'
import { DeviceDetector } from '../core/DeviceDetector'
import {
  vDevice,
  vDeviceDesktop,
  vDeviceMobile,
  vDeviceTablet,
} from './directives/vDevice'

/**
 * Vue3 设备检测插件
 *
 * 提供全局的设备检测功能，包括：
 * - 全局属性注入
 * - 依赖注入支持
 * - 自定义指令注册
 * - 自动资源清理
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { DevicePlugin } from '@ldesign/device/vue'
 *
 * const app = createApp(App)
 *
 * // 使用默认配置
 * app.use(DevicePlugin)
 *
 * // 使用自定义配置
 * app.use(DevicePlugin, {
 *   globalPropertyName: '$device',
 *   enableResize: true,
 *   enableOrientation: true,
 *   modules: ['network', 'battery']
 * })
 * ```
 */
export const DevicePlugin: Plugin = {
  install(app: App, options: DevicePluginOptions = {}) {
    const { globalPropertyName = '$device', ...detectorOptions } = options

    // 创建全局设备检测器实例
    const detector = new DeviceDetector(detectorOptions)

    // 注册全局属性
    app.config.globalProperties[globalPropertyName] = detector

    // 提供依赖注入
    app.provide('device-detector', detector)

    // 注册指令
    app.directive('device', vDevice)
    app.directive('device-mobile', vDeviceMobile)
    app.directive('device-tablet', vDeviceTablet)
    app.directive('device-desktop', vDeviceDesktop)

    // 在应用卸载时清理资源
    const originalUnmount = app.unmount
    app.unmount = function () {
      detector.destroy()
      return originalUnmount.call(this)
    }
  },
}

/**
 * 创建设备检测插件
 *
 * 工厂函数，用于创建带有预配置选项的插件实例
 *
 * @param options 插件配置选项
 * @returns Vue 插件实例
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { createDevicePlugin } from '@ldesign/device/vue'
 *
 * const app = createApp(App)
 * const devicePlugin = createDevicePlugin({
 *   enableResize: true,
 *   modules: ['network']
 * })
 *
 * app.use(devicePlugin)
 * ```
 */
export function createDevicePlugin(options: DevicePluginOptions = {}): Plugin {
  return {
    install(app: App) {
      if (DevicePlugin.install) {
        DevicePlugin.install(app, options)
      }
    },
  }
}

/**
 * 在组合式 API 中获取设备检测器实例
 *
 * 通过依赖注入获取全局设备检测器实例，必须在安装 DevicePlugin 后使用
 *
 * @returns DeviceDetector 实例
 * @throws 如果未安装 DevicePlugin 则抛出错误
 *
 * @example
 * ```typescript
 * import { useDeviceDetector } from '@ldesign/device/vue'
 *
 * export default {
 *   setup() {
 *     const detector = useDeviceDetector()
 *
 *     // 获取设备信息
 *     const deviceInfo = detector.getDeviceInfo()
 *
 *     // 监听设备变化
 *     detector.on('deviceChange', (info) => {
 *       
 *     })
 *
 *     return {
 *       deviceInfo
 *     }
 *   }
 * }
 * ```
 */
export function useDeviceDetector(): DeviceDetector {
  const detector = inject('device-detector') as DeviceDetector

  if (!detector) {
    throw new Error(
      'DeviceDetector not found. Make sure to install DevicePlugin first.',
    )
  }

  return detector
}

// 默认导出
export default DevicePlugin
