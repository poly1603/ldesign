/**
 * Radio 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

/**
 * Radio 组件大小
 */
export type RadioSize = 'small' | 'medium' | 'large'

/**
 * Radio Props 定义
 */
export const radioProps = {
  /**
   * 绑定值
   */
  modelValue: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined
  },

  /**
   * 单选框的值
   */
  value: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    required: true
  },

  /**
   * 单选框标签文本
   */
  label: {
    type: String,
    default: undefined
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<RadioSize>,
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
 * Radio Emits 定义
 */
export const radioEmits = {
  'update:modelValue': (value: string | number | boolean) => true,
  change: (value: string | number | boolean, event: Event) => event instanceof Event
} as const

/**
 * Radio Props 类型
 */

/**
 * Radio Props 类型
 */

/**
 * Radio Props 类型
 */
export type RadioProps = ExtractPropTypes<typeof radioProps>

/**
 * Radio Emits 类型
 */
export type RadioEmits = typeof radioEmits

/**
 * Radio 插槽定义
 */
export interface RadioSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Radio 实例类型
 */
export interface RadioInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}

/**
 * 泛型 Radio 组件接口
 * 支持不同类型的选中值
 */
export interface GenericRadioProps<T = string | number> {
  modelValue?: T
  // 其他属性继承自基础 Props
  // 可以根据需要扩展特定的泛型属性
}

/**
 * 泛型 Radio 事件接口
 */
export interface GenericRadioEmits<T = string | number> {
  'update:modelValue': (value: T) => void
  change: (value: T, oldValue: T) => void
}

/**
 * 泛型 Radio 实例接口
 */
export interface GenericRadioInstance<T = string | number> {
  getValue(): T
  setValue(value: T): void
  focus(): void
  blur(): void
}

// 类型工具函数
export * from '../../types/utilities'
