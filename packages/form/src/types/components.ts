// 组件相关类型定义

import type { Component, VNode } from 'vue'
import type { FormItemConfig, FieldOption } from './field'

/**
 * 表单组件属性基类
 */
export interface BaseFormComponentProps {
  /** 组件值 */
  modelValue?: any

  /** 是否禁用 */
  disabled?: boolean

  /** 是否只读 */
  readonly?: boolean

  /** 占位符 */
  placeholder?: string

  /** 组件大小 */
  size?: ComponentSize

  /** 自定义CSS类名 */
  class?: string

  /** 自定义样式 */
  style?: Record<string, any>

  /** 组件ID */
  id?: string

  /** 组件名称 */
  name?: string

  /** 是否自动获取焦点 */
  autofocus?: boolean

  /** Tab索引 */
  tabindex?: number

  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'top' | 'none'

  /** 标签宽度 */
  labelWidth?: string | number

  /** 标签对齐方式 */
  labelAlign?: 'left' | 'center' | 'right'

  /** 标签与组件间距 */
  labelGap?: number

  /** 是否显示标签后的冒号 */
  showLabelColon?: boolean
}

/**
 * 组件大小
 */
export type ComponentSize = 'small' | 'medium' | 'large'

/**
 * 复选框组件属性
 */
export interface FormCheckboxProps extends BaseFormComponentProps {
  /** 选项列表 */
  options?: (string | number | FieldOption)[]

  /** 是否必填 */
  required?: boolean

  /** 标签文本 */
  label?: string

  /** 提示信息 */
  tooltip?: string

  /** 描述文本 */
  description?: string

  /** 是否显示标签 */
  showLabel?: boolean

  /** 是否显示冒号 */
  showColon?: boolean

  /** 排列方向 */
  direction?: 'horizontal' | 'vertical'

  /** 最大选择数量 */
  max?: number

  /** 最小选择数量 */
  min?: number

  /** 错误信息 */
  errors?: string[]
}

/**
 * 输入框组件属性
 */
export interface FormInputProps extends BaseFormComponentProps {
  /** 输入框类型 */
  type?: InputType

  /** 最大长度 */
  maxlength?: number

  /** 最小长度 */
  minlength?: number

  /** 是否显示字符计数 */
  showCount?: boolean

  /** 是否可清空 */
  clearable?: boolean

  /** 前缀图标 */
  prefixIcon?: string

  /** 后缀图标 */
  suffixIcon?: string

  /** 前缀文本 */
  prefix?: string

  /** 后缀文本 */
  suffix?: string

  /** 输入框前置内容 */
  prepend?: string | VNode

  /** 输入框后置内容 */
  append?: string | VNode
}

/**
 * 输入框类型
 */
export type InputType =
  | 'text'
  | 'password'
  | 'number'
  | 'email'
  | 'tel'
  | 'url'
  | 'search'

/**
 * 文本域组件属性
 */
export interface FormTextareaProps extends BaseFormComponentProps {
  /** 行数 */
  rows?: number

  /** 最小行数 */
  minRows?: number

  /** 最大行数 */
  maxRows?: number

  /** 是否自适应高度 */
  autosize?: boolean

  /** 最大长度 */
  maxlength?: number

  /** 是否显示字符计数 */
  showCount?: boolean

  /** 是否可清空 */
  clearable?: boolean

  /** 调整大小方式 */
  resize?: ResizeType
}

/**
 * 调整大小方式
 */
export type ResizeType = 'none' | 'both' | 'horizontal' | 'vertical'

/**
 * 选择器组件属性
 */
export interface FormSelectProps extends BaseFormComponentProps {
  /** 选项列表 */
  options?: FieldOption[]

  /** 是否多选 */
  multiple?: boolean

  /** 是否可搜索 */
  filterable?: boolean

  /** 是否允许创建新选项 */
  allowCreate?: boolean

  /** 是否可清空 */
  clearable?: boolean

  /** 多选时的折叠标签 */
  collapseTags?: boolean

  /** 最多显示的标签数量 */
  maxTagCount?: number

  /** 选项过滤函数 */
  filterMethod?: (query: string, option: FieldOption) => boolean

  /** 远程搜索函数 */
  remoteMethod?: (query: string) => Promise<FieldOption[]>

  /** 是否正在加载 */
  loading?: boolean

  /** 加载文本 */
  loadingText?: string

  /** 无数据文本 */
  noDataText?: string

  /** 无匹配数据文本 */
  noMatchText?: string
}

/**
 * 单选框组件属性
 */
export interface FormRadioProps extends BaseFormComponentProps {
  /** 选项列表 */
  options?: FieldOption[]

  /** 布局方向 */
  direction?: Direction

  /** 按钮样式 */
  buttonStyle?: boolean
}

/**
 * 复选框组件属性
 */
export interface FormCheckboxProps extends BaseFormComponentProps {
  /** 选项列表 */
  options?: FieldOption[]

  /** 布局方向 */
  direction?: Direction

  /** 最小选择数量 */
  min?: number

  /** 最大选择数量 */
  max?: number

  /** 是否全选 */
  checkAll?: boolean

  /** 是否半选状态 */
  indeterminate?: boolean
}

/**
 * 布局方向
 */
export type Direction = 'horizontal' | 'vertical'

/**
 * 日期选择器组件属性
 */
export interface FormDatePickerProps extends BaseFormComponentProps {
  /** 日期格式 */
  format?: string

  /** 值格式 */
  valueFormat?: string

  /** 选择器类型 */
  type?: DatePickerType

  /** 是否可清空 */
  clearable?: boolean

  /** 开始日期占位符 */
  startPlaceholder?: string

  /** 结束日期占位符 */
  endPlaceholder?: string

  /** 范围分隔符 */
  rangeSeparator?: string

  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean

  /** 快捷选项 */
  shortcuts?: DateShortcut[]
}

/**
 * 日期选择器类型
 */
export type DatePickerType =
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'datetimerange'
  | 'month'
  | 'monthrange'
  | 'year'
  | 'yearrange'

/**
 * 日期快捷选项
 */
export interface DateShortcut {
  /** 快捷选项文本 */
  text: string

  /** 快捷选项值 */
  value: Date | Date[] | (() => Date | Date[])
}

/**
 * 时间选择器组件属性
 */
export interface FormTimePickerProps extends BaseFormComponentProps {
  /** 时间格式 */
  format?: string

  /** 值格式 */
  valueFormat?: string

  /** 是否可清空 */
  clearable?: boolean

  /** 是否范围选择 */
  isRange?: boolean

  /** 开始时间占位符 */
  startPlaceholder?: string

  /** 结束时间占位符 */
  endPlaceholder?: string

  /** 范围分隔符 */
  rangeSeparator?: string

  /** 禁用时间函数 */
  disabledTime?: (date: Date) => boolean
}

/**
 * 开关组件属性
 */
export interface FormSwitchProps extends BaseFormComponentProps {
  /** 开启时的值 */
  activeValue?: any

  /** 关闭时的值 */
  inactiveValue?: any

  /** 开启时的文本 */
  activeText?: string

  /** 关闭时的文本 */
  inactiveText?: string

  /** 开启时的颜色 */
  activeColor?: string

  /** 关闭时的颜色 */
  inactiveColor?: string

  /** 是否显示文本 */
  showText?: boolean
}

/**
 * 滑块组件属性
 */
export interface FormSliderProps extends BaseFormComponentProps {
  /** 最小值 */
  min?: number

  /** 最大值 */
  max?: number

  /** 步长 */
  step?: number

  /** 是否显示刻度 */
  showStops?: boolean

  /** 是否显示提示 */
  showTooltip?: boolean

  /** 是否范围选择 */
  range?: boolean

  /** 是否垂直模式 */
  vertical?: boolean

  /** 滑块高度（垂直模式） */
  height?: string

  /** 格式化提示文本 */
  formatTooltip?: (value: number) => string

  /** 标记点 */
  marks?: Record<number, string>
}

/**
 * 评分组件属性
 */
export interface FormRateProps extends BaseFormComponentProps {
  /** 最大分值 */
  max?: number

  /** 是否允许半选 */
  allowHalf?: boolean

  /** 是否显示文本 */
  showText?: boolean

  /** 是否显示分数 */
  showScore?: boolean

  /** 评分文本数组 */
  texts?: string[]

  /** 评分颜色数组 */
  colors?: string[]

  /** 图标类名 */
  iconClass?: string

  /** 未选中图标类名 */
  voidIconClass?: string

  /** 禁用图标类名 */
  disabledVoidIconClass?: string
}

/**
 * 组件注册器接口
 */
export interface ComponentRegistry {
  /** 注册组件 */
  register(name: string, component: Component): void

  /** 获取组件 */
  get(name: string): Component | undefined

  /** 移除组件 */
  remove(name: string): void

  /** 获取所有组件 */
  getAll(): Record<string, Component>

  /** 清空所有组件 */
  clear(): void
}
