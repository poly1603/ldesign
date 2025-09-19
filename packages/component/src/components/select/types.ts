/**
 * Select 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

/**
 * Select 选项类型
 */
export interface SelectOption<T = string | number> {
  label: string
  value: T
  disabled?: boolean
  children?: SelectOption<T>[]
}

/**
 * 基础选项类型（向后兼容）
 */
export type BaseSelectOption = SelectOption<string | number>

/**
 * Select 组件大小
 */
export type SelectSize = 'small' | 'medium' | 'large'

/**
 * Select Props 定义
 */
export const selectProps = {
  /**
   * 选中的值
   */
  modelValue: {
    type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
    default: undefined
  },

  /**
   * 选项数据
   */
  options: {
    type: Array as PropType<BaseSelectOption[]>,
    default: () => []
  },

  /**
   * 占位符
   */
  placeholder: {
    type: String,
    default: '请选择'
  },

  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * 是否可清空
   */
  clearable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否可搜索
   */
  filterable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否多选
   */
  multiple: {
    type: Boolean,
    default: false
  },

  /**
   * 多选时最多选择的项目数
   */
  multipleLimit: {
    type: Number,
    default: 0
  },

  /**
   * 组件大小
   */
  size: {
    type: String as PropType<SelectSize>,
    default: 'medium'
  },

  /**
   * 是否加载中
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * 加载文本
   */
  loadingText: {
    type: String,
    default: '加载中...'
  },

  /**
   * 无数据文本
   */
  noDataText: {
    type: String,
    default: '无数据'
  },

  /**
   * 无匹配数据文本
   */
  noMatchText: {
    type: String,
    default: '无匹配数据'
  },

  /**
   * 下拉面板的类名
   */
  popperClass: {
    type: String,
    default: undefined
  },

  /**
   * 是否将弹出框插入至 body 元素
   */
  teleported: {
    type: Boolean,
    default: true
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
 * Select Emits 定义
 */
export const selectEmits = {
  'update:modelValue': (_value: string | number | (string | number)[]) => true,
  change: (_value: string | number | (string | number)[]) => true,
  'visible-change': (visible: boolean) => typeof visible === 'boolean',
  clear: () => true,
  'remove-tag': (_value: string | number) => true,
  blur: (event: FocusEvent) => event instanceof FocusEvent,
  focus: (event: FocusEvent) => event instanceof FocusEvent
} as const

/**
 * Select Props 类型
 */

/**
 * Select Props 类型
 */
export type SelectProps = ExtractPropTypes<typeof selectProps>

/**
 * Select Emits 类型
 */
export type SelectEmits = typeof selectEmits

/**
 * Select 插槽定义
 */
export interface SelectSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Select 实例类型
 */
export interface SelectInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}
// 类型工具函数
export * from '../../types/utilities'
