/**
 * Card 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

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
   * 是否禁用
   * @default false
   */
  disabled: {
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
  /**
   * 点击事件
   */
  click: (event: MouseEvent) => event instanceof MouseEvent
} as const

/**
 * Card Props 类型
 */
export type CardProps = ExtractPropTypes<typeof cardProps>

/**
 * Card Emits 类型
 */
export type CardEmits = typeof cardEmits

/**
 * Card 插槽定义
 */
export interface CardSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]

  /**
   * 头部插槽
   */
  header?: () => VNode | VNode[]

  /**
   * 标题插槽
   */
  title?: () => VNode | VNode[]

  /**
   * 额外内容插槽
   */
  extra?: () => VNode | VNode[]

  /**
   * 底部插槽
   */
  footer?: () => VNode | VNode[]
}

/**
 * Card 实例类型
 */
export interface CardInstance {
  /** 组件根元素 */
  $el: HTMLElement
}
// 类型工具函数
export * from '../../types/utilities'
