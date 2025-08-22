/**
 * Vue 插件
 */

import type { App, Plugin } from 'vue'
import type { SizeManager, VueSizePluginOptions } from '../types'
import { createSizeManager } from '../core/size-manager'

/**
 * Vue Size 插件符号
 */
export const VueSizeSymbol = Symbol('VueSize')

/**
 * Vue Size 插件
 */
export const VueSizePlugin: Plugin = {
  install(app: App, options: VueSizePluginOptions = {}) {
    // 创建尺寸管理器实例
    const sizeManager = createSizeManager(options)

    // 提供给子组件使用
    app.provide(VueSizeSymbol, sizeManager)

    // 全局属性
    const globalPropertyName = options.globalPropertyName || '$size'
    app.config.globalProperties[globalPropertyName] = sizeManager

    // 全局方法
    app.config.globalProperties.$setSize = (mode: string) => {
      if (['small', 'medium', 'large', 'extra-large'].includes(mode)) {
        sizeManager.setMode(mode as any)
      }
    }

    app.config.globalProperties.$getSizeMode = () => {
      return sizeManager.getCurrentMode()
    }

    app.config.globalProperties.$getSizeConfig = (mode?: string) => {
      return sizeManager.getConfig(mode as any)
    }

    // 应用卸载时清理
    const originalUnmount = app.unmount
    app.unmount = function (...args) {
      sizeManager.destroy()
      return originalUnmount.apply(this, args)
    }
  },
}

/**
 * 创建 Vue Size 插件
 */
export function createVueSizePlugin(options?: VueSizePluginOptions): Plugin {
  return {
    install(app: App) {
      VueSizePlugin.install?.(app, options)
    },
  }
}

/**
 * 默认导出插件
 */
export default VueSizePlugin

// 扩展 Vue 全局属性类型
declare module 'vue' {
  interface ComponentCustomProperties {
    $size: SizeManager
    $setSize: (mode: string) => void
    $getSizeMode: () => string
    $getSizeConfig: (mode?: string) => any
  }
}
