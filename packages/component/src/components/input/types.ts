/**
 * Input 组件类型定义
 */

import type { Component } from 'vue'

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
 * Input 组件属性接口
 */
export interface InputProps {
  /**
   * 输入框值
   */
  modelValue?: string | number

  /**
   * 输入框类型
   * @default 'text'
   */
  type?: InputType

  /**
   * 输入框尺寸
   * @default 'medium'
   */
  size?: InputSize

  /**
   * 输入框状态
   * @default 'default'
   */
  status?: InputStatus

  /**
   * 占位符文本
   */
  placeholder?: string

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否只读
   * @default false
   */
  readonly?: boolean

  /**
   * 是否必填
   * @default false
   */
  required?: boolean

  /**
   * 是否可清空
   * @default false
   */
  clearable?: boolean

  /**
   * 是否显示密码切换按钮（仅 type="password" 时有效）
   * @default false
   */
  showPassword?: boolean

  /**
   * 最大长度
   */
  maxlength?: number

  /**
   * 是否显示字数统计
   * @default false
   */
  showCount?: boolean

  /**
   * 前缀图标
   */
  prefixIcon?: string | Component

  /**
   * 后缀图标
   */
  suffixIcon?: string | Component

  /**
   * 输入框前置内容
   */
  prepend?: string

  /**
   * 输入框后置内容
   */
  append?: string

  /**
   * 自动获取焦点
   * @default false
   */
  autofocus?: boolean

  /**
   * 自动完成
   */
  autocomplete?: string

  /**
   * 表单名称
   */
  name?: string

  /**
   * 表单 ID
   */
  id?: string

  /**
   * 自定义类名
   */
  class?: string

  /**
   * 自定义样式
   */
  style?: string | Record<string, any>
}

/**
 * Input 组件事件接口
 */
export interface InputEmits {
  /**
   * 值更新事件
   */
  'update:modelValue': [value: string | number]

  /**
   * 输入事件
   */
  input: [value: string | number, event: Event]

  /**
   * 变化事件
   */
  change: [value: string | number, event: Event]

  /**
   * 获得焦点事件
   */
  focus: [event: FocusEvent]

  /**
   * 失去焦点事件
   */
  blur: [event: FocusEvent]

  /**
   * 清空事件
   */
  clear: []

  /**
   * 按键事件
   */
  keydown: [event: KeyboardEvent]

  /**
   * 回车事件
   */
  enter: [event: KeyboardEvent]
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
