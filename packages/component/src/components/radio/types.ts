/**
 * Radio 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

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
} as const

/**
 * Radio Emits 定义
 */
export const radioEmits = {
  'update:modelValue': (value: string | number | boolean) => true,
  change: (value: string | number | boolean, event: Event) => event instanceof Event
}

/**
 * Radio Props 类型
 */
export type RadioProps = ExtractPropTypes<typeof radioProps>

/**
 * Radio 实例类型
 */
export interface RadioInstance {
  $el: HTMLElement
  focus: () => void
  blur: () => void
}

/**
 * Radio Props 类型
 */
export type RadioProps = ExtractPropTypes<typeof radioProps>

/**
 * Radio Emits 类型
 */
export type RadioEmits = typeof radioEmits

/**
 * Radio 实例类型
 */
export interface RadioInstance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}