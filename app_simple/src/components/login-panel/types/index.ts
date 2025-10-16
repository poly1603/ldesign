// 登录类型
export type LoginType = 'username' | 'phone'

// 登录表单数据
export interface LoginFormData {
  username?: string
  password?: string
  phone?: string
  smsCode?: string
  captcha?: string
  remember?: boolean
}

// 第三方登录类型
export type SocialLoginType = 'wechat' | 'qq' | 'github' | 'google' | 'facebook'

// 第三方登录配置
export interface SocialLoginConfig {
  type: SocialLoginType
  icon: string
  title: string
  color?: string
}

// 验证码类型
export type CaptchaType = 'image' | 'sms'

// Tab项配置
export interface TabItem {
  key: string
  label: string
  icon?: string
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  message: string
  validator?: (value: any) => boolean
}

// 表单字段配置
export interface FormField {
  name: string
  type: string
  placeholder?: string
  rules?: ValidationRule[]
}