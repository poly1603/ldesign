/**
 * Switch 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

/**
 * Switch 组件大小
 */
export type SwitchSize = 'small' | 'medium' | 'large'

/**
 * Switch Props 定义
 */
export const switchProps = {
  /**
   * 绑定值
   */
  modelValue: {
    type: Boolean,
    default: false
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<SwitchSize>,
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
   * 是否加载中
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * 选中时的文本
   */
  checkedText: {
    type: String,
    default: undefined
  },

  /**
   * 未选中时的文本
   */
  uncheckedText: {
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
 * Switch Emits 定义
 */
export const switchEmits = {
  'update:modelValue': (value: boolean) => typeof value === 'boolean',
  change: (value: boolean) => typeof value === 'boolean'
} as const

/**
 * Switch Props 类型
 */

/**
 * Switch Props 类型
 */

/**
 * Switch Props 类型
 */
export type SwitchProps = ExtractPropTypes<typeof switchProps>

/**
 * Switch Emits 类型
 */
export type SwitchEmits = typeof switchEmits

/**
 * Switch 插槽定义
 */
export interface SwitchSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Switch 实例类型
 */
export interface SwitchInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}

/**
 * 泛型 Switch 组件接口
 * 支持不同类型的开关值
 */
export interface GenericSwitchProps<T = boolean> {
  modelValue?: T
  // 其他属性继承自基础 Props
  // 可以根据需要扩展特定的泛型属性
}

/**
 * 泛型 Switch 事件接口
 */
export interface GenericSwitchEmits<T = boolean> {
  'update:modelValue': (value: T) => void
  change: (value: T, oldValue: T) => void
}

/**
 * 泛型 Switch 实例接口
 */
export interface GenericSwitchInstance<T = boolean> {
  getValue(): T
  setValue(value: T): void
  focus(): void
  blur(): void
}

// 类型工具函数
export * from '../../types/utilities'
