/**
 * Size Vue 插件
 */

import type { App, Plugin } from 'vue'
import type { SizeManager } from '../../types'
import { SizeSwitcher } from '../../vue/SizeSwitcher'

/**
 * Size 插件选项
 */
export interface SizePluginOptions {
  /** 尺寸管理器实例 */
  sizeManager?: SizeManager
  /** 是否注册全局属性 */
  globalProperties?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
}

/**
 * Size Vue 插件符号
 */
export const SizeSymbol = Symbol('Size')

/**
 * Size Vue 插件
 */
export const SizePlugin: Plugin = {
  install(app: App, options: SizePluginOptions = {}) {
    const {
      sizeManager,
      globalProperties = true,
      globalPropertyName = '$size',
    } = options

    if (!sizeManager) {
      console.warn('[Size Plugin] No size manager provided')
      return
    }

    // 提供给子组件使用
    app.provide(SizeSymbol, sizeManager)

    // 注册全局组件
    app.component('SizeSwitcher', SizeSwitcher)

    // 全局属性
    if (globalProperties) {
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
 * 创建 Size Vue 插件
 */
export function createSizePlugin(options?: SizePluginOptions): Plugin {
  return {
    install(app: App) {
      SizePlugin.install?.(app, options)
    },
  }
}

/**
 * 默认导出插件
 */
export default SizePlugin

// 扩展 Vue 全局属性类型
declare module 'vue' {
  interface ComponentCustomProperties {
    $size: SizeManager
    $setSize: (mode: string) => void
    $getSizeMode: () => string
    $getSizeConfig: (mode?: string) => any
  }
}
