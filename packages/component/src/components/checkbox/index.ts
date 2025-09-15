/**
 * Checkbox 组件入口文件
 */

import type { App } from 'vue'
import Checkbox from './Checkbox.vue'
import type { CheckboxProps, CheckboxInstance } from './types'

// 组件安装函数
;(Checkbox as any).install = (app: App): void => {
  app.component(Checkbox.name!, Checkbox)
}

// 导出组件
export default Checkbox

// 导出类型
export type { CheckboxProps, CheckboxInstance }
export * from './types'