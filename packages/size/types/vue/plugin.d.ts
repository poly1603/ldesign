import { Plugin } from 'vue'
import { SizeManager, VueSizePluginOptions } from '../types/index.js'

/**
 * Vue 插件
 */

/**
 * Vue Size 插件符号
 */
declare const VueSizeSymbol: unique symbol
/**
 * Vue Size 插件
 */
declare const VueSizePlugin: Plugin
/**
 * 创建 Vue Size 插件
 */
declare function createVueSizePlugin(options?: VueSizePluginOptions): Plugin

declare module 'vue' {
  interface ComponentCustomProperties {
    $size: SizeManager
    $setSize: (mode: string) => void
    $getSizeMode: () => string
    $getSizeConfig: (mode?: string) => any
  }
}

export {
  VueSizePlugin,
  VueSizeSymbol,
  createVueSizePlugin,
  VueSizePlugin as default,
}
