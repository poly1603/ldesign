/**
 * Badge 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

/**
 * Badge 组件大小
 */
export type BadgeSize = 'small' | 'medium' | 'large'

/**
 * Badge 组件类型
 */
export type BadgeType = 'primary' | 'success' | 'warning' | 'error' | 'info'

/**
 * Badge Props 定义
 */
export const badgeProps = {
  /**
   * 显示值
   */
  value: {
    type: [String, Number],
    default: undefined
  },

  /**
   * 最大值，超过最大值会显示 '{max}+'
   */
  max: {
    type: Number,
    default: 99
  },

  /**
   * 当数值为 0 时，是否展示 Badge
   */
  showZero: {
    type: Boolean,
    default: false
  },

  /**
   * 是否显示小红点
   */
  dot: {
    type: Boolean,
    default: false
  },

  /**
   * 类型
   */
  type: {
    type: String as PropType<BadgeType>,
    default: 'error'
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<BadgeSize>,
    default: 'medium'
  },

  /**
   * 是否隐藏
   */
  hidden: {
    type: Boolean,
    default: false
  },

  /**
   * 设置状态点的位置偏移
   */
  offset: {
    type: Array as unknown as PropType<[number, number]>,
    default: undefined
  }
,
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
 * Badge Emits 定义
 */
export const badgeEmits = {
  // TODO: 添加事件定义
  // click: (event: MouseEvent) => event instanceof MouseEvent
} as const

/**
 * Badge Props 类型
 */

/**
 * Badge Props 类型
 */
export type BadgeProps = ExtractPropTypes<typeof badgeProps>

/**
 * Badge Emits 类型
 */
export type BadgeEmits = typeof badgeEmits

/**
 * Badge 插槽定义
 */
export interface BadgeSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Badge 实例类型
 */
export interface BadgeInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}
// 类型工具函数
export * from '../../types/utilities'
