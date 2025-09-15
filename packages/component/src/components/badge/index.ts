/**
 * Badge 组件入口文件
 */

import type { App } from 'vue'
import Badge from './Badge.vue'
import type { BadgeProps, BadgeInstance } from './types'

// 为组件添加 install 方法，支持 Vue.use() 安装
const BadgeComponent = Badge as any
BadgeComponent.install = (app: App): void => {
  app.component(Badge.name || 'LBadge', Badge)
}

// 导出组件
export default BadgeComponent

// 导出类型
export type { BadgeProps, BadgeInstance }
export * from './types'