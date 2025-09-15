/**
 * Radio 组件入口文件
 */

import type { App } from 'vue'
import Radio from './Radio.vue'
import type { RadioProps, RadioInstance } from './types'

// 组件安装函数
;(Radio as any).install = (app: App): void => {
  app.component(Radio.name!, Radio)
}

// 导出组件
export default Radio

// 导出类型
export type { RadioProps, RadioInstance }
export * from './types'