/**
 * Icon 图标组件
 */

import Icon from './Icon.vue'
import type { App } from 'vue'

// 导出组件类型
export type { IconProps, IconEmits, IconInstance, IconSize } from './types'

// 组件安装函数
Icon.install = (app: App) => {
  app.component('LIcon', Icon)
  app.component('l-icon', Icon)
}

// 导出组件
export { Icon }
export default Icon
