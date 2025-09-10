/**
 * Button 组件入口文件
 */

import type { App } from 'vue'
import Button from './Button.vue'
import type { ButtonProps, ButtonInstance } from './types'

// 为组件添加 install 方法，支持 Vue.use() 安装
Button.install = (app: App): void => {
  app.component(Button.name || 'LButton', Button)
}

// 导出组件
export default Button

// 导出组件类型
export type { ButtonProps, ButtonInstance }

// 导出组件相关类型
export type {
  ButtonType,
  ButtonSize,
  ButtonShape,
  ButtonVariant,
  ButtonTheme
} from './types'

// 具名导出
export { Button }

// 支持单独引入
export const LButton = Button
