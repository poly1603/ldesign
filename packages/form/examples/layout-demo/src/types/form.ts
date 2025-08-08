// 表单相关类型定义

export interface LayoutPreset {
  name: string
  label: string
  config: LayoutConfig
}

export interface LayoutConfig {
  columns?: number | Record<string, number>
  autoColumns?: boolean
  gap?: number | string | Record<string, number | string>
  rowGap?: number | string
  columnGap?: number | string
  unifiedSpacing?: boolean
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: number | string | 'auto'
  labelWidthByColumn?: Record<number, number>
  autoLabelWidth?: boolean
  labelWidthMode?: 'auto' | 'manual' // 标签宽度计算模式
  labelAlign?: 'left' | 'center' | 'right'
  className?: string
  defaultRows?: number
  expandMode?: 'inline' | 'popup'
  showExpandButton?: boolean
  buttonPosition?: 'follow-last-row' | 'separate-row'
}

export interface FormData {
  // 基本信息
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  birthDate: string

  // 地址信息
  country: string
  province: string
  city: string
  address: string
  zipCode: string

  // 职业信息
  company: string
  position: string
  industry: string
  experience: string
  salary: number

  // 偏好设置
  interests: string[]
  newsletter: boolean
  notifications: boolean
  language: string

  // 其他
  bio: string
  website: string
  socialMedia: string
}

export interface FieldGroup {
  title: string
  fields: string[]
  description?: string
}

export interface DemoConfig {
  layout: LayoutConfig
  showGroups: boolean
  showValidation: boolean
  theme: 'light' | 'dark'
  isExpanded: boolean
  expandMode: 'inline' | 'popup'
}

export interface FormState {
  isExpanded: boolean
  visibleFields: string[]
  hiddenFields: string[]
  calculatedColumns: number
  calculatedLabelWidths: Record<number, number>
}
