/**
 * Switch 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

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
} as const

/**
 * Switch Emits 定义
 */
export const switchEmits = {
  'update:modelValue': (value: boolean) => typeof value === 'boolean',
  change: (value: boolean) => typeof value === 'boolean'
}

/**
 * Switch Props 类型
 */
export type SwitchProps = ExtractPropTypes<typeof switchProps>

/**
 * Switch 实例类型
 */
export interface SwitchInstance {
  $el: HTMLElement
  focus: () => void
  blur: () => void
}

/**
 * Switch Props 类型
 */
export type SwitchProps = ExtractPropTypes<typeof switchProps>

/**
 * Switch Emits 类型
 */
export type SwitchEmits = typeof switchEmits

/**
 * Switch 实例类型
 */
export interface SwitchInstance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}