/**
 * Input 组件类型定义
 */

import type { ExtractPropTypes, PropType, VNode } from 'vue'

/**
 * 输入框类型
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'

/**
 * 输入框尺寸
 */
export type InputSize = 'small' | 'medium' | 'large'

/**
 * 输入框状态
 */
export type InputStatus = 'default' | 'success' | 'warning' | 'error'

/**
 * Input Props 定义
 */
export const inputProps = {
  /**
   * 输入框值
   */
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: undefined
  },

  /**
   * 输入框类型
   * @default 'text'
   */
  type: {
    type: String as PropType<InputType>,
    default: 'text'
  },

  /**
   * 输入框尺寸
   * @default 'medium'
   */
  size: {
    type: String as PropType<InputSize>,
    default: 'medium'
  },

  /**
   * 输入框状态
   * @default 'default'
   */
  status: {
    type: String as PropType<InputStatus>,
    default: 'default'
  },

  /**
   * 占位符文本
   */
  placeholder: {
    type: String,
    default: undefined
  },

  /**
   * 是否禁用
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * 是否只读
   * @default false
   */
  readonly: {
    type: Boolean,
    default: false
  },

  /**
   * 是否必填
   * @default false
   */
  required: {
    type: Boolean,
    default: false
  },

  /**
   * 是否可清空
   * @default false
   */
  clearable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否显示密码切换按钮（仅 type="password" 时有效）
   * @default false
   */
  showPassword: {
    type: Boolean,
    default: false
  },

  /**
   * 最大长度
   */
  maxlength: {
    type: Number,
    default: undefined
  },

  /**
   * 是否显示字数统计
   * @default false
   */
  showCount: {
    type: Boolean,
    default: false
  },

  /**
   * 前缀图标
   */
  prefixIcon: {
    type: [String, Object] as PropType<string | any>,
    default: undefined
  },

  /**
   * 后缀图标
   */
  suffixIcon: {
    type: [String, Object] as PropType<string | any>,
    default: undefined
  },

  /**
   * 输入框前置内容
   */
  prepend: {
    type: String,
    default: undefined
  },

  /**
   * 输入框后置内容
   */
  append: {
    type: String,
    default: undefined
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
 * Input Emits 定义
 */
export const inputEmits = {
  /**
   * 值更新事件
   */
  'update:modelValue': (value: string | number) => typeof value === 'string' || typeof value === 'number',

  /**
   * 输入事件
   */
  input: (value: string | number, event: Event) => (typeof value === 'string' || typeof value === 'number') && event instanceof Event,

  /**
   * 变化事件
   */
  change: (value: string | number, event: Event) => (typeof value === 'string' || typeof value === 'number') && event instanceof Event,

  /**
   * 获得焦点事件
   */
  focus: (event: FocusEvent) => event instanceof FocusEvent,

  /**
   * 失去焦点事件
   */
  blur: (event: FocusEvent) => event instanceof FocusEvent,

  /**
   * 清空事件
   */
  clear: () => true,

  /**
   * 按键事件
   */
  keydown: (event: KeyboardEvent) => event instanceof KeyboardEvent,

  /**
   * 回车事件
   */
  enter: (event: KeyboardEvent) => event instanceof KeyboardEvent
} as const

/**
 * Input Props 类型
 */
export interface InputProps {
  modelValue?: string | number
  type?: InputType
  size?: InputSize
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  showPassword?: boolean
  maxlength?: number
  minlength?: number
  max?: number | string
  min?: number | string
  step?: number | string
  autocomplete?: string
  autofocus?: boolean
  form?: string
  name?: string
  required?: boolean
  pattern?: string
  multiple?: boolean
  accept?: string
  capture?: string
  inputmode?: string
  enterkeyhint?: string
  spellcheck?: boolean
  tabindex?: number
  title?: string
  class?: string | string[] | Record<string, boolean>
  style?: string | Record<string, string>
  id?: string
  'data-testid'?: string
}

/**
 * 泛型 Input Props 类型
 */
export interface GenericInputProps<T = string | number> {
  modelValue?: T
  type?: InputType
  size?: InputSize
  status?: InputStatus
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  showPassword?: boolean
  maxlength?: number
  showCount?: boolean
  prefixIcon?: string | any
  suffixIcon?: string | any
  prepend?: string
  append?: string
  class?: string | string[] | Record<string, boolean>
  style?: string | Record<string, any>
}

/**
 * Input Emits 类型
 */
export type InputEmits = typeof inputEmits

/**
 * Input 插槽定义
 */
export interface InputSlots {
  /**
   * 前缀插槽
   */
  prefix?: () => VNode | VNode[]

  /**
   * 后缀插槽
   */
  suffix?: () => VNode | VNode[]

  /**
   * 前置内容插槽
   */
  prepend?: () => VNode | VNode[]

  /**
   * 后置内容插槽
   */
  append?: () => VNode | VNode[]
}

/**
 * Input 组件实例接口
 */
export interface InputInstance {
  /**
   * 获取输入框元素
   */
  getInputElement: () => HTMLInputElement | null

  /**
   * 获取焦点
   */
  focus: () => void

  /**
   * 失去焦点
   */
  blur: () => void

  /**
   * 选中所有文本
   */
  select: () => void

  /**
   * 清空输入框
   */
  clear: () => void
}

// 类型工具函数
export * from '../../types/utilities'
