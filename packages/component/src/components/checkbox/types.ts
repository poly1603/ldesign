/**
 * Checkbox 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

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
 * Checkbox Emits 定义
 */
export const checkboxEmits = {
  'update:modelValue': (value: boolean) => typeof value === 'boolean',
  change: (value: boolean, event: Event) => typeof value === 'boolean' && event instanceof Event
} as const

/**
 * Checkbox Props 类型
 */

/**
 * Checkbox Props 类型
 */

/**
 * Checkbox Props 类型
 */
export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>

/**
 * Checkbox Emits 类型
 */
export type CheckboxEmits = typeof checkboxEmits

/**
 * Checkbox 插槽定义
 */
export interface CheckboxSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Checkbox 实例类型
 */
export interface CheckboxInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}

/**
 * 泛型 Checkbox 组件接口
 * 支持不同类型的选中值
 */
export interface GenericCheckboxProps<T = boolean> {
  modelValue?: T
  // 其他属性继承自基础 Props
  // 可以根据需要扩展特定的泛型属性
}

/**
 * 泛型 Checkbox 事件接口
 */
export interface GenericCheckboxEmits<T = boolean> {
  'update:modelValue': (value: T) => void
  change: (value: T, oldValue: T) => void
}

/**
 * 泛型 Checkbox 实例接口
 */
export interface GenericCheckboxInstance<T = boolean> {
  getValue(): T
  setValue(value: T): void
  focus(): void
  blur(): void
}

// 类型工具函数
export * from '../../types/utilities'
