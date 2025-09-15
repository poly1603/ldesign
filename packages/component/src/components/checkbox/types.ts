/**
 * Checkbox 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Checkbox 组件大小
 */
export type CheckboxSize = 'small' | 'medium' | 'large'

/**
 * Checkbox Props 定义
 */
export const checkboxProps = {
  /**
   * 是否选中
   */
  modelValue: {
    type: Boolean,
    default: false
  },

  /**
   * 复选框的值，用于复选框组
   */
  value: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined
  },

  /**
   * 复选框标签文本
   */
  label: {
    type: String,
    default: undefined
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<CheckboxSize>,
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
   * 是否为不确定状态
   */
  indeterminate: {
    type: Boolean,
    default: false
  },

  /**
   * 原生 name 属性
   */
  name: {
    type: String,
    default: undefined
  }
} as const

/**
 * Checkbox Emits 定义
 */
export const checkboxEmits = {
  'update:modelValue': (value: boolean) => typeof value === 'boolean',
  change: (value: boolean, event: Event) => typeof value === 'boolean' && event instanceof Event
}

/**
 * Checkbox Props 类型
 */
export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>

/**
 * Checkbox 实例类型
 */
export interface CheckboxInstance {
  $el: HTMLElement
  focus: () => void
  blur: () => void
}

/**
 * Checkbox Props 类型
 */
export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>

/**
 * Checkbox Emits 类型
 */
export type CheckboxEmits = typeof checkboxEmits

/**
 * Checkbox 实例类型
 */
export interface CheckboxInstance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}