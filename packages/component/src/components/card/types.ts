/**
 * Card 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Card 组件大小
 */
export type CardSize = 'small' | 'medium' | 'large'

/**
 * Card Props 定义
 */
export const cardProps = {
  /**
   * 卡片标题
   */
  title: {
    type: String,
    default: undefined
  },

  /**
   * 卡片右上角的操作区域
   */
  extra: {
    type: String,
    default: undefined
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<CardSize>,
    default: 'medium'
  },

  /**
   * 是否显示边框
   */
  bordered: {
    type: Boolean,
    default: true
  },

  /**
   * 是否显示阴影
   */
  shadow: {
    type: String as PropType<'always' | 'hover' | 'never'>,
    default: 'always'
  },

  /**
   * 是否可悬停
   */
  hoverable: {
    type: Boolean,
    default: false
  },

  /**
   * 自定义类名
   */
  class: {
    type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    default: undefined
  },

  /**
   * 自定义样式
   */
  style: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: undefined
  }
} as const

/**
 * Card Emits 定义
 */
export const cardEmits = {
  // TODO: 添加事件定义
  // click: (event: MouseEvent) => event instanceof MouseEvent
}

/**
 * Card Props 类型
 */
export type CardProps = ExtractPropTypes<typeof cardProps>

/**
 * Card Emits 类型
 */
export type CardEmits = typeof cardEmits

/**
 * Card 实例类型
 */
export interface CardInstance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}