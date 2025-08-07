// 字段配置相关类型定义

import type { Component } from 'vue'
import type { ConditionalRenderConfig } from './conditional'
import type { ValidationRule } from './validation'

/**
 * 表单字段配置
 */
export interface FormItemConfig {
  /** 字段名称，用于数据绑定 */
  name: string

  /** 字段标题/标签 */
  title: string

  /** 所占列数，支持数值(1,2,3)或百分比("50%","33.33%") */
  span?: number | string

  /** 表单组件类型 */
  component: string | Component

  /** 传递给表单组件的属性对象 */
  props?: Record<string, any>

  /** 字段默认值 */
  defaultValue?: any

  /** 是否必填 */
  required?: boolean

  /** 是否禁用 */
  disabled?: boolean

  /** 是否隐藏 */
  hidden?: boolean

  /** 是否只读 */
  readonly?: boolean

  /** 字段描述 */
  description?: string

  /** 占位符 */
  placeholder?: string

  /** 验证规则 */
  rules?: ValidationRule[]

  /** 条件渲染配置 */
  conditionalRender?: ConditionalRenderConfig

  /** 字段分组 */
  group?: string

  /** 自定义CSS类名 */
  className?: string

  /** 自定义样式 */
  style?: Record<string, any>

  /** 字段顺序 */
  order?: number

  /** 字段提示信息 */
  tooltip?: string

  /** 字段前缀 */
  prefix?: string

  /** 字段后缀 */
  suffix?: string

  /** 字段标签宽度 */
  labelWidth?: number | string

  /** 字段标签位置 */
  labelPosition?: LabelPosition

  /** 是否显示标签后的冒号 */
  showColon?: boolean

  /** 字段联动配置 */
  linkage?: FieldLinkageConfig

  /** 字段扩展属性 */
  extra?: Record<string, any>
}

/**
 * 标签位置
 */
export type LabelPosition = 'left' | 'right' | 'top'

/**
 * 字段联动配置
 */
export interface FieldLinkageConfig {
  /** 依赖的字段名 */
  dependsOn: string | string[]

  /** 联动处理函数 */
  handler: (
    values: Record<string, any>,
    currentField: FormItemConfig
  ) => Partial<FormItemConfig>
}

/**
 * 字段选项配置（用于选择类型字段）
 */
export interface FieldOption {
  /** 选项标签 */
  label: string

  /** 选项值 */
  value: any

  /** 是否禁用 */
  disabled?: boolean

  /** 选项描述 */
  description?: string

  /** 选项图标 */
  icon?: string

  /** 选项颜色 */
  color?: string

  /** 选项分组 */
  group?: string

  /** 子选项（用于级联选择） */
  children?: FieldOption[]
}

/**
 * 字段组件类型
 */
export type FieldComponentType =
  | 'FormInput'
  | 'FormTextarea'
  | 'FormSelect'
  | 'FormRadio'
  | 'FormCheckbox'
  | 'FormDatePicker'
  | 'FormTimePicker'
  | 'FormSwitch'
  | 'FormSlider'
  | 'FormRate'
  | 'FormUpload'
  | 'FormColorPicker'
  | 'FormCascader'
  | 'FormTreeSelect'
  | 'FormTransfer'
  | 'FormAutoComplete'
  | 'FormMention'
  | string

/**
 * 字段渲染上下文
 */
export interface FieldRenderContext {
  /** 字段配置 */
  field: FormItemConfig

  /** 字段值 */
  value: any

  /** 表单数据 */
  formData: Record<string, any>

  /** 字段错误 */
  errors: string[]

  /** 是否禁用 */
  disabled: boolean

  /** 是否只读 */
  readonly: boolean

  /** 更新字段值 */
  updateValue: (value: any) => void

  /** 触发验证 */
  validate: () => Promise<boolean>
}

/**
 * 字段渲染器接口
 */
export interface FieldRenderer {
  /** 渲染字段 */
  render(context: FieldRenderContext): any

  /** 字段类型 */
  type: string

  /** 是否支持该字段配置 */
  supports(field: FormItemConfig): boolean
}
