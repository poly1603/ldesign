/**
 * Input 输入框组件
 */

import Input from './Input.vue'
import type { App } from 'vue'

// 导出组件类型
export type { InputProps, InputEmits, InputInstance, InputType, InputSize, InputStatus } from './types'

// 组件安装函数
Input.install = (app: App) => {
  app.component('LInput', Input)
  app.component('l-input', Input)
}

// 导出组件
export { Input }
export default Input
