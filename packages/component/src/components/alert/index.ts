/**
 * Alert 组件入口文件
 */

import type { App } from 'vue'
import Alert from './Alert.vue'
import type { AlertProps, AlertInstance } from './types'

// 组件安装函数
Alert.install = (app: App): void => {
  app.component(Alert.name!, Alert)
}

// 导出组件
export default Alert

// 导出类型
export type { AlertProps, AlertInstance }
export * from './types'