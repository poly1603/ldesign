/**
 * Switch 组件入口文件
 */

import type { App } from 'vue'
import Switch from './Switch.vue'
import type { SwitchProps, SwitchInstance } from './types'

// 组件安装函数
Switch.install = (app: App): void => {
  app.component(Switch.name!, Switch)
}

// 导出组件
export default Switch

// 导出类型
export type { SwitchProps, SwitchInstance }
export * from './types'