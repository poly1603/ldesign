// 表单相关类型定义

export interface LayoutPreset {
  name: string
  label: string
  config: LayoutConfig
}

export interface LayoutConfig {
  columns?: number | Record<string, number>
  gap?: number | string | Record<string, number | string>
  rowGap?: number | string
  columnGap?: number | string
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: number | string
  labelAlign?: 'left' | 'center' | 'right'
  className?: string
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
}
