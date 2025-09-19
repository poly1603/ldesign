/**
 * Tag 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

/**
 * Tag 组件大小
 */
export type TagSize = 'small' | 'medium' | 'large'

/**
 * Tag 组件类型
 */
export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * Tag 组件变体
 */
export type TagVariant = 'filled' | 'outlined' | 'light'

/**
 * Tag Props 定义
 */
export const tagProps = {
  /**
   * 类型
   */
  type: {
    type: String as PropType<TagType>,
    default: 'default'
  },

  /**
   * 变体
   */
  variant: {
    type: String as PropType<TagVariant>,
    default: 'filled'
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<TagSize>,
    default: 'medium'
  },

  /**
   * 是否可关闭
   */
  closable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * 是否可点击
   */
  clickable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否选中
   */
  checked: {
    type: Boolean,
    default: false
  },

  /**
   * 图标
   */
  icon: {
    type: String,
    default: undefined
  },

  /**
   * 颜色
   */
  color: {
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
 * Tag Emits 定义
 */
export const tagEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
  close: (event: MouseEvent) => event instanceof MouseEvent,
  'update:checked': (checked: boolean) => typeof checked === 'boolean'
} as const

/**
 * Tag Props 类型
 */

/**
 * Tag Props 类型
 */
export type TagProps = ExtractPropTypes<typeof tagProps>

/**
 * Tag Emits 类型
 */
export type TagEmits = typeof tagEmits

/**
 * Tag 插槽定义
 */
export interface TagSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Tag 实例类型
 */
export interface TagInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}
// 类型工具函数
export * from '../../types/utilities'
