/**
 * Vue 适配器入口
 */

import type { App, Plugin } from 'vue'
import ChartComponent from './components/Chart.vue'

// 导出组件
export { default as Chart } from './components/Chart.vue'

// 导出组合式函数
export * from './composables/useChart'

// 导出类型
export type {
  ChartConfig,
  ChartData,
  ChartType,
  ChartInstance,
  SimpleChartData,
  Dataset,
} from '../../types'

// 导出核心功能
export { Chart as ChartCore, createChart } from '../../index'

/**
 * Vue 插件配置
 */
export interface ChartPluginOptions {
  /** 默认配置 */
  defaultConfig?: any
  /** 组件名称 */
  componentName?: string
}

/**
 * Vue 插件
 */
export const ChartPlugin: Plugin = {
  install(app: App, options: ChartPluginOptions = {}) {
    const { defaultConfig = {}, componentName = 'Chart' } = options

    // 注册组件
    app.component(componentName, ChartComponent)

    // 提供默认配置
    app.provide('chart-default-config', defaultConfig)

    // 全局属性
    app.config.globalProperties.$chart = {
      defaultConfig,
    }
  },
}

/**
 * 默认导出插件
 */
export default ChartPlugin

