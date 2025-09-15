/**
 * Progress 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Progress 组件大小
 */
export type ProgressSize = 'small' | 'medium' | 'large'

/**
 * Progress Props 定义
 */
export const progressProps = {
  /**
   * 组件大小
   */
  size: {
    type: String as PropType<ProgressSize>,
    default: 'medium'
  },
  
  /**
   * 是否禁用
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
 * Progress Emits 定义
 */
export const progressEmits = {
  // TODO: 添加事件定义
  // click: (event: MouseEvent) => event instanceof MouseEvent
}

/**
 * Progress Props 类型
 */
export type ProgressProps = ExtractPropTypes<typeof progressProps>

/**
 * Progress Emits 类型
 */
export type ProgressEmits = typeof progressEmits

/**
 * Progress 实例类型
 */
export interface ProgressInstance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}