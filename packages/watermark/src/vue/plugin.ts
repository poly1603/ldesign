/**
 * Vue3 水印插件
 */

import type { App } from 'vue'
import { WatermarkCore, createWatermark, destroyWatermark } from '../index'
import type { WatermarkConfig, WatermarkInstance } from '../types'
import type { WatermarkPluginOptions } from './types'

// 组件
import Watermark from './components/Watermark.vue'
import WatermarkProvider from './components/WatermarkProvider.vue'

// 指令
import { vWatermark } from './directives/watermark'

// 组合式API
import { useWatermark, useSimpleWatermark } from './composables/useWatermark'

/**
 * 默认插件选项
 */
const defaultOptions: Required<WatermarkPluginOptions> = {
  globalConfig: {},
  componentPrefix: 'L',
  directiveName: 'watermark',
  registerComponents: true,
  registerDirective: true,
  registerGlobalMethods: true
}

/**
 * Vue3 水印插件
 */
export const WatermarkPlugin = {
  install(app: App, options: WatermarkPluginOptions = {}) {
    const opts = { ...defaultOptions, ...options }

    // 注册全局组件
    if (opts.registerComponents) {
      app.component(`${opts.componentPrefix}Watermark`, Watermark)
      app.component(`${opts.componentPrefix}WatermarkProvider`, WatermarkProvider)
    }

    // 注册指令
    if (opts.registerDirective) {
      app.directive(opts.directiveName, vWatermark)
    }

    // 注册全局方法
    if (opts.registerGlobalMethods) {
      // 全局配置
      app.config.globalProperties.$watermarkConfig = opts.globalConfig
      
      // 全局方法
      app.config.globalProperties.$watermark = {
        // 创建水印
        create: async (
          container: Element | string,
          config: Partial<WatermarkConfig>
        ): Promise<WatermarkInstance> => {
          const mergedConfig = { ...opts.globalConfig, ...config }
          return createWatermark(container, mergedConfig)
        },
        
        // 销毁水印
        destroy: destroyWatermark,
        
        // 创建核心实例
        createCore: () => new WatermarkCore(),
        
        // 组合式API
        useWatermark,
        useSimpleWatermark
      }
    }

    // 提供全局配置
    app.provide('watermarkGlobalConfig', opts.globalConfig)
    
    // 开发模式下的调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('[WatermarkPlugin] Installed with options:', opts)
    }
  }
}

/**
 * 创建插件实例的工厂函数
 */
export function createWatermarkPlugin(options: WatermarkPluginOptions = {}) {
  return {
    install(app: App) {
      WatermarkPlugin.install(app, options)
    }
  }
}

// 默认导出
export default WatermarkPlugin

// 类型声明扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $watermarkConfig: Partial<WatermarkConfig>
    $watermark: {
      create: (
        container: Element | string,
        config: Partial<WatermarkConfig>
      ) => Promise<WatermarkInstance>
      destroy: (instance: WatermarkInstance) => Promise<void>
      createCore: () => WatermarkCore
      useWatermark: typeof useWatermark
      useSimpleWatermark: typeof useSimpleWatermark
    }
  }
}