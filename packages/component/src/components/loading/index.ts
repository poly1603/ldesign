/**
 * Loading 组件入口文件
 */

import type { App } from 'vue'
import Loading from './Loading.vue'
import type { LoadingProps, LoadingInstance } from './types'

// 组件安装函数
Loading.install = (app: App): void => {
  app.component(Loading.name!, Loading)
}

// 导出组件
export default Loading

// 导出类型
export type { LoadingProps, LoadingInstance }
export * from './types'