/**
 * Lit 适配器入口
 */

// 导出 Web Component
export { ChartElement } from './components/chart-element'

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

