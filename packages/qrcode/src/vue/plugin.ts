/**
 * Vue QRCode插件
 */

import type { App } from 'vue'
import type { QRCodePluginOptions } from './types'
import QRCode from './QRCode.vue'

/**
 * Vue QRCode插件
 */
export const QRCodePlugin = {
  install(app: App, options: QRCodePluginOptions = {}) {
    const {
      componentName = 'QRCode',
      registerGlobally = true,
      defaultOptions = {},
    } = options

    // 注册全局组件
    if (registerGlobally) {
      app.component(componentName, QRCode)
    }

    // 提供全局默认选项
    if (Object.keys(defaultOptions).length > 0) {
      app.provide('qrcode-default-options', defaultOptions)
    }

    // 添加全局属性
    app.config.globalProperties.$qrcode = {
      defaultOptions,
    }
  },
}

/**
 * 默认导出插件
 */
export default QRCodePlugin

/**
 * 便捷安装函数
 */
export function createQRCodePlugin(options?: QRCodePluginOptions) {
  return {
    install(app: App) {
      QRCodePlugin.install(app, options)
    },
  }
}
