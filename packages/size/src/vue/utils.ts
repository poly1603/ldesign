/**
 * Vue 工具函数
 * 提供更简化的使用方式
 */

import type { App } from 'vue'
import type { VueSizePluginOptions } from '../types'
import { VueSizePlugin } from './plugin'

/**
 * 一键安装Size插件的便捷函数
 * 
 * @example
 * ```ts
 * import { createApp } from 'vue'
 * import { installSizePlugin } from '@ldesign/size/vue'
 * 
 * const app = createApp(App)
 * installSizePlugin(app) // 使用默认配置
 * 
 * // 或者自定义配置
 * installSizePlugin(app, {
 *   initialMode: 'large',
 *   responsive: true
 * })
 * ```
 */
export function installSizePlugin(app: App, options?: VueSizePluginOptions) {
  app.use(VueSizePlugin, options)
  return app
}

/**
 * 创建带有Size插件的Vue应用
 * 
 * @example
 * ```ts
 * import { createSizeApp } from '@ldesign/size/vue'
 * import App from './App.vue'
 * 
 * const app = createSizeApp(App, {
 *   initialMode: 'medium',
 *   responsive: true
 * })
 * 
 * app.mount('#app')
 * ```
 */
export function createSizeApp(rootComponent: any, options?: VueSizePluginOptions) {
  const { createApp } = require('vue')
  const app = createApp(rootComponent)
  return installSizePlugin(app, options)
}

/**
 * 预设配置
 */
export const sizePresets = {
  /**
   * 默认配置
   */
  default: {
    initialMode: 'medium' as const,
    responsive: false,
    globalPropertyName: '$size',
  },

  /**
   * 响应式配置
   */
  responsive: {
    initialMode: 'medium' as const,
    responsive: true,
    globalPropertyName: '$size',
  },

  /**
   * 移动端优先配置
   */
  mobile: {
    initialMode: 'small' as const,
    responsive: true,
    globalPropertyName: '$size',
  },

  /**
   * 桌面端优先配置
   */
  desktop: {
    initialMode: 'large' as const,
    responsive: true,
    globalPropertyName: '$size',
  },
} as const

/**
 * 使用预设配置安装插件
 * 
 * @example
 * ```ts
 * import { installWithPreset } from '@ldesign/size/vue'
 * 
 * // 使用响应式预设
 * installWithPreset(app, 'responsive')
 * 
 * // 使用移动端预设
 * installWithPreset(app, 'mobile')
 * ```
 */
export function installWithPreset(
  app: App, 
  preset: keyof typeof sizePresets,
  overrides?: Partial<VueSizePluginOptions>
) {
  const config = { ...sizePresets[preset], ...overrides }
  return installSizePlugin(app, config)
}

/**
 * Vue组件快速导入
 */
export const SizeComponents = {
  SizeSwitcher: () => import('./SizeSwitcher').then(m => m.SizeSwitcher),
  SizeIndicator: () => import('./SizeIndicator').then(m => m.SizeIndicator),
  SizeControlPanel: () => import('./SizeControlPanel').then(m => m.SizeControlPanel),
}

/**
 * 批量注册Size组件
 * 
 * @example
 * ```ts
 * import { registerSizeComponents } from '@ldesign/size/vue'
 * 
 * registerSizeComponents(app) // 注册所有组件
 * registerSizeComponents(app, ['SizeSwitcher', 'SizeIndicator']) // 只注册指定组件
 * ```
 */
export async function registerSizeComponents(
  app: App, 
  components?: Array<keyof typeof SizeComponents>
) {
  const componentsToRegister = components || Object.keys(SizeComponents) as Array<keyof typeof SizeComponents>
  
  for (const componentName of componentsToRegister) {
    const componentLoader = SizeComponents[componentName]
    const component = await componentLoader()
    app.component(componentName, component)
  }
  
  return app
}
