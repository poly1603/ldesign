/**
 * Card 组件入口文件
 */

import type { App } from 'vue'
import Card from './Card.vue'
import type { CardProps, CardInstance } from './types'

// 组件安装函数
Card.install = (app: App): void => {
  app.component(Card.name!, Card)
}

// 导出组件
export default Card

// 导出类型
export type { CardProps, CardInstance }
export * from './types'