/**
 * @ldesign/form - Core Type Definitions
 * 核心类型定义
 */

/**
 * 基础值类型
 */
export type Primitive = string | number | boolean | null | undefined

/**
 * 任意对象类型
 */
export type AnyObject = Record<string, any>

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 表单值类型
 */
export type FormValues = Record<string, any>

/**
 * 字段路径类型
 */
export type FieldPath = string

/**
 * 验证规则类型
 */
export type ValidatorType =
  | 'required'
  | 'email'
  | 'url'
  | 'phone'
  | 'number'
  | 'integer'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom'

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误消息 */
  message?: string
  /** 错误详情 */
  errors?: string[]
}

/**
 * 验证规则配置
 */
export interface ValidationRule {
  /** 规则类型 */
  type: ValidatorType
  /** 错误消息 */
  message?: string
  /** 验证器函数 */
  validator?: (value: any, values: FormValues) => boolean | Promise<boolean> | ValidationResult | Promise<ValidationResult>
  /** 规则参数 */
  params?: any
  /** 触发时机 */
  trigger?: 'change' | 'blur' | 'submit'
}

/**
 * 字段状态
 */
export interface FieldState {
  /** 字段值 */
  value: any
  /** 初始值 */
  initialValue?: any
  /** 是否被触摸 */
  touched: boolean
  /** 是否脏数据 */
  dirty: boolean
  /** 是否验证中 */
  validating: boolean
  /** 是否有效 */
  valid: boolean
  /** 错误消息 */
  errors: string[]
  /** 是否禁用 */
  disabled: boolean
  /** 是否只读 */
  readonly: boolean
  /** 是否可见 */
  visible: boolean
}

/**
 * 表单状态
 */
export interface FormState {
  /** 是否提交中 */
  submitting: boolean
  /** 是否验证中 */
  validating: boolean
  /** 是否有效 */
  valid: boolean
  /** 是否脏数据 */
  dirty: boolean
  /** 是否被触摸 */
  touched: boolean
  /** 是否原始状态 */
  pristine: boolean
  /** 错误数量 */
  errorCount: number
  /** 字段数量 */
  fieldCount: number
}

/**
 * 事件监听器
 */
export type EventListener<T = any> = (event: T) => void | Promise<void>

/**
 * 事件映射
 */
export interface EventMap {
  [eventName: string]: any
}

/**
 * 销毁函数
 */
export type Disposer = () => void

/**
 * 订阅函数
 */
export type Subscriber<T = any> = (value: T) => void

/**
 * 取消订阅函数
 */
export type Unsubscribe = () => void




