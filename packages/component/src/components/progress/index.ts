/**
 * Progress 组件入口文件
 */

import type { App } from 'vue'
import Progress from './Progress.vue'
import type { ProgressProps, ProgressInstance } from './types'

// 组件安装函数
Progress.install = (app: App): void => {
  app.component(Progress.name!, Progress)
}

// 导出组件
export default Progress

// 导出类型
export type { ProgressProps, ProgressInstance }
export * from './types'