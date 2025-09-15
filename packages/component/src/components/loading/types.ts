/**
 * Loading 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Loading 组件大小
 */
export type LoadingSize = 'small' | 'medium' | 'large'

/**
 * Loading Props 定义
 */
export const loadingProps = {
  /**
   * 是否显示加载状态
   */
  loading: {
    type: Boolean,
    default: true
  },

  /**
   * 加载文本
   */
  text: {
    type: String,
    default: undefined
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<LoadingSize>,
    default: 'medium'
  },

  /**
   * 是否显示遮罩层
   */
  overlay: {
    type: Boolean,
    default: true
  },

  /**
   * 是否使用绝对定位
   */
  absolute: {
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
 * Loading Emits 定义
 */
export const loadingEmits = {
  // TODO: 添加事件定义
  // click: (event: MouseEvent) => event instanceof MouseEvent
}

/**
 * Loading Props 类型
 */
export type LoadingProps = ExtractPropTypes<typeof loadingProps>

/**
 * Loading Emits 类型
 */
export type LoadingEmits = typeof loadingEmits

/**
 * Loading 实例类型
 */
export interface LoadingInstance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}