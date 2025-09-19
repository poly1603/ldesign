/**
 * Alert 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

/**
 * Alert 组件类型
 */
export type AlertType = 'info' | 'success' | 'warning' | 'error'

/**
 * Alert Props 定义
 */
export const alertProps = {
  /**
   * 警告类型
   */
  type: {
    type: String as PropType<AlertType>,
    default: 'info'
  },

  /**
   * 标题
   */
  title: {
    type: String,
    default: undefined
  },

  /**
   * 描述内容
   */
  description: {
    type: String,
    default: undefined
  },

  /**
   * 是否可关闭
   */
  closable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否显示图标
   */
  showIcon: {
    type: Boolean,
    default: true
  },

  /**
   * 自定义图标
   */
  icon: {
    type: String,
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
 * Alert Emits 定义
 */
export const alertEmits = {
  close: () => true
} as const

/**
 * Alert Props 类型
 */

/**
 * Alert Props 类型
 */

/**
 * Alert Props 类型
 */
export type AlertProps = ExtractPropTypes<typeof alertProps>

/**
 * Alert Emits 类型
 */
export type AlertEmits = typeof alertEmits

/**
 * Alert 插槽定义
 */
export interface AlertSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Alert 实例类型
 */
export interface AlertInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}
// 类型工具函数
export * from '../../types/utilities'
