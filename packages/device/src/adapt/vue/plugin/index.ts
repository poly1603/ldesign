import type { App, Plugin } from 'vue'
import type { DevicePluginOptions } from '../../../types'
import { inject } from 'vue'
import { DeviceDetector } from '../../../core/DeviceDetector'
import { vDevice, vDeviceDesktop, vDeviceMobile, vDeviceTablet } from '../directives/vDevice'

/**
 * Vue3 设备检测插件
 */
export const DevicePlugin: Plugin = {
  install(app: App, options: DevicePluginOptions = {}) {
    const {
      globalPropertyName = '$device',
      ...detectorOptions
    } = options

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
 */
export function createDevicePlugin(options: DevicePluginOptions = {}): Plugin {
  return {
    install(app: App) {
      DevicePlugin.install!(app, options)
    },
  }
}

/**
 * 在组合式 API 中获取设备检测器实例
 */
export function useDeviceDetector(): DeviceDetector {
  const detector = inject('device-detector') as DeviceDetector

  if (!detector) {
    throw new Error('DeviceDetector not found. Make sure to install DevicePlugin first.')
  }

  return detector
}

// 默认导出
export default DevicePlugin
