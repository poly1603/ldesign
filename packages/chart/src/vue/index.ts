/**
 * Vue 支持入口文件
 * 
 * 导出所有 Vue 相关的组件、Composables 和指令
 */

// ============================================================================
// 组件导出
// ============================================================================

export { default as LChart } from './components/LChart.vue'
export { default as LLineChart } from './components/LLineChart.vue'
export { default as LBarChart } from './components/LBarChart.vue'
export { default as LPieChart } from './components/LPieChart.vue'
export { default as LScatterChart } from './components/LScatterChart.vue'

// ============================================================================
// Composables 导出
// ============================================================================

export { useChart } from './composables/useChart'
export { useLineChart, useTimeSeriesChart, useMultiLineChart } from './composables/useLineChart'
export { useBarChart, useStackedBarChart, useHorizontalBarChart, useGroupedBarChart } from './composables/useBarChart'
export { usePieChart, useDonutChart, useRoseChart, useNestedPieChart } from './composables/usePieChart'
export { useScatterChart, useBubbleChart, useRegressionChart, useCategoricalScatterChart } from './composables/useScatterChart'

// ============================================================================
// 指令导出
// ============================================================================

export { chartDirective, getChartInstance, install as installChartDirective } from './directives/chart'

// ============================================================================
// 类型导出
// ============================================================================

export type * from './types'

// ============================================================================
// Vue 插件
// ============================================================================

import type { App } from 'vue'
import LChart from './components/LChart.vue'
import LLineChart from './components/LLineChart.vue'
import LBarChart from './components/LBarChart.vue'
import LPieChart from './components/LPieChart.vue'
import LScatterChart from './components/LScatterChart.vue'
import { chartDirective } from './directives/chart'

/**
 * Vue 插件安装函数
 * 
 * @param app - Vue 应用实例
 * @param options - 插件选项
 */
export function install(app: App, options: {
  /** 组件名前缀 */
  prefix?: string
  /** 是否注册指令 */
  directive?: boolean
} = {}) {
  const { prefix = 'L', directive = true } = options

  // 注册组件
  app.component(`${prefix}Chart`, LChart)
  app.component(`${prefix}LineChart`, LLineChart)
  app.component(`${prefix}BarChart`, LBarChart)
  app.component(`${prefix}PieChart`, LPieChart)
  app.component(`${prefix}ScatterChart`, LScatterChart)

  // 注册指令
  if (directive) {
    app.directive('chart', chartDirective)
  }
}

/**
 * 默认插件对象
 */
const plugin = {
  install
}

export default plugin

// ============================================================================
// 便捷创建函数
// ============================================================================

/**
 * 创建 Vue 图表应用
 * 
 * @param app - Vue 应用实例
 * @param options - 配置选项
 */
export function createChartApp(app: App, options?: {
  prefix?: string
  directive?: boolean
  theme?: string
  globalConfig?: any
}) {
  // 安装插件
  install(app, options)

  // 设置全局配置
  if (options?.globalConfig) {
    app.config.globalProperties.$chartConfig = options.globalConfig
  }

  // 设置全局主题
  if (options?.theme) {
    app.config.globalProperties.$chartTheme = options.theme
  }

  return app
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查 Vue 环境
 */
export function isVueEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' && 'Vue' in window
  } catch {
    return false
  }
}

/**
 * 获取 Vue 版本
 */
export function getVueVersion(): string | null {
  try {
    if (typeof window !== 'undefined' && 'Vue' in window) {
      return (window as any).Vue.version || null
    }
    return null
  } catch {
    return null
  }
}

/**
 * 检查是否为 Vue 3
 */
export function isVue3(): boolean {
  const version = getVueVersion()
  return version ? version.startsWith('3.') : false
}

// ============================================================================
// 开发工具支持
// ============================================================================

/**
 * 开发工具信息
 */
export const devtools = {
  name: '@ldesign/chart/vue',
  version: '0.1.0',
  components: ['LChart', 'LLineChart', 'LBarChart', 'LPieChart', 'LScatterChart'],
  composables: ['useChart', 'useLineChart', 'useBarChart', 'usePieChart', 'useScatterChart'],
  directives: ['v-chart']
}

// 在开发环境中注册到 Vue devtools
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) {
      const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
      if (hook) {
        hook.emit('app:init', devtools)
      }
    }
  } catch (error) {
    // 忽略 devtools 注册错误
  }
}
