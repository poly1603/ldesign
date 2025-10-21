/**
 * React 适配器入口
 */

// 导出组件
export { Chart, default } from './components/Chart'
export type { ChartProps, ChartRef } from './components/Chart'

// 导出 Hooks
export * from './hooks/useChart'

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

