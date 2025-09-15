/**
 * Alert 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

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
} as const

/**
 * Alert Emits 定义
 */
export const alertEmits = {
  close: () => true
}

/**
 * Alert Props 类型
 */
export type AlertProps = ExtractPropTypes<typeof alertProps>

/**
 * Alert 实例类型
 */
export interface AlertInstance {
  $el: HTMLElement
}

/**
 * Alert Props 类型
 */
export type AlertProps = ExtractPropTypes<typeof alertProps>

/**
 * Alert Emits 类型
 */
export type AlertEmits = typeof alertEmits

/**
 * Alert 实例类型
 */
export interface AlertInstance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}