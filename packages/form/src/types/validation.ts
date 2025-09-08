/**
 * 表单验证类型定义
 * 
 * 本文件定义了表单验证系统相关的类型，包括：
 * - 验证器类型
 * - 验证结果类型
 * - 内置验证规则类型
 * - 自定义验证器类型
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 验证是否通过 */
  valid: boolean
  /** 错误消息，验证失败时存在 */
  message?: string
  /** 验证器名称 */
  validator?: string
}

/**
 * 异步验证结果接口
 */
export interface AsyncValidationResult extends ValidationResult {
  /** 是否为异步验证 */
  async: true
}

/**
 * 验证上下文接口
 */
export interface ValidationContext {
  /** 当前字段值 */
  value: any
  /** 所有表单值 */
  values: Record<string, any>
  /** 字段名称 */
  fieldName: string
  /** 验证规则 */
  rule: ValidationRule
  /** 表单实例 */
  form?: any
}

/**
 * 验证器函数类型
 */
export type ValidatorFunction = (
  context: ValidationContext
) => boolean | string | ValidationResult | Promise<boolean | string | ValidationResult>

/**
 * 验证规则接口（扩展版本）
 */
export interface ValidationRule {
  /** 验证规则类型 */
  type: ValidationRuleType
  /** 验证失败时的错误消息 */
  message: string
  /** 自定义验证器函数 */
  validator?: ValidatorFunction
  /** 验证规则的参数 */
  params?: any
  /** 验证触发时机 */
  trigger?: ValidationTrigger | ValidationTrigger[]
  /** 是否为异步验证 */
  async?: boolean
  /** 验证优先级，数字越小优先级越高 */
  priority?: number
  /** 是否在其他验证失败时跳过此验证 */
  skipOnError?: boolean
  /** 验证条件，返回 false 时跳过验证 */
  condition?: (values: Record<string, any>) => boolean
}

/**
 * 验证规则类型枚举
 */
export type ValidationRuleType =
  | 'required'      // 必填验证
  | 'pattern'       // 正则表达式验证
  | 'min'          // 最小值/最小长度验证
  | 'max'          // 最大值/最大长度验证
  | 'minLength'    // 最小长度验证
  | 'maxLength'    // 最大长度验证
  | 'email'        // 邮箱格式验证
  | 'url'          // URL格式验证
  | 'phone'        // 手机号格式验证
  | 'idCard'       // 身份证号格式验证
  | 'number'       // 数字验证
  | 'integer'      // 整数验证
  | 'float'        // 浮点数验证
  | 'date'         // 日期验证
  | 'array'        // 数组验证
  | 'object'       // 对象验证
  | 'enum'         // 枚举值验证
  | 'custom'       // 自定义验证

/**
 * 验证触发时机枚举
 */
export type ValidationTrigger =
  | 'change'       // 值改变时触发
  | 'blur'         // 失去焦点时触发
  | 'focus'        // 获得焦点时触发
  | 'submit'       // 表单提交时触发
  | 'manual'       // 手动触发

/**
 * 内置验证器配置接口
 */
export interface BuiltinValidatorConfig {
  /** 必填验证配置 */
  required?: {
    /** 是否去除首尾空格 */
    trim?: boolean
    /** 空数组是否视为无效 */
    emptyArray?: boolean
    /** 空对象是否视为无效 */
    emptyObject?: boolean
  }
  
  /** 正则表达式验证配置 */
  pattern?: {
    /** 正则表达式 */
    regexp: RegExp
    /** 是否忽略大小写 */
    ignoreCase?: boolean
  }
  
  /** 数值范围验证配置 */
  range?: {
    /** 最小值 */
    min?: number
    /** 最大值 */
    max?: number
    /** 是否包含边界值 */
    inclusive?: boolean
  }
  
  /** 长度验证配置 */
  length?: {
    /** 最小长度 */
    min?: number
    /** 最大长度 */
    max?: number
    /** 精确长度 */
    exact?: number
  }
  
  /** 邮箱验证配置 */
  email?: {
    /** 是否允许国际化域名 */
    allowIdn?: boolean
    /** 是否允许IP地址 */
    allowIp?: boolean
  }
  
  /** URL验证配置 */
  url?: {
    /** 允许的协议 */
    protocols?: string[]
    /** 是否要求协议 */
    requireProtocol?: boolean
  }
  
  /** 枚举验证配置 */
  enum?: {
    /** 允许的值列表 */
    values: any[]
    /** 是否严格比较 */
    strict?: boolean
  }
}

/**
 * 验证器注册接口
 */
export interface ValidatorRegistry {
  /** 注册验证器 */
  register: (name: string, validator: ValidatorFunction) => void
  /** 注销验证器 */
  unregister: (name: string) => void
  /** 获取验证器 */
  get: (name: string) => ValidatorFunction | undefined
  /** 检查验证器是否存在 */
  has: (name: string) => boolean
  /** 获取所有验证器名称 */
  list: () => string[]
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  /** 字段名称 */
  field: string
  /** 错误消息 */
  message: string
  /** 验证规则类型 */
  rule: string
  /** 字段值 */
  value: any
  /** 验证器名称 */
  validator?: string
}

/**
 * 验证结果汇总接口
 */
export interface ValidationSummary {
  /** 验证是否通过 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationError[]
  /** 按字段分组的错误 */
  fieldErrors: Record<string, ValidationError[]>
  /** 验证的字段数量 */
  fieldCount: number
  /** 有错误的字段数量 */
  errorCount: number
}

/**
 * 验证选项接口
 */
export interface ValidationOptions {
  /** 要验证的字段列表，为空时验证所有字段 */
  fields?: string[]
  /** 验证触发方式 */
  trigger?: ValidationTrigger
  /** 是否在第一个错误时停止验证 */
  stopOnFirstError?: boolean
  /** 是否跳过隐藏字段 */
  skipHidden?: boolean
  /** 是否跳过禁用字段 */
  skipDisabled?: boolean
  /** 是否跳过只读字段 */
  skipReadonly?: boolean
  /** 自定义验证上下文 */
  context?: Record<string, any>
}

/**
 * 异步验证队列项接口
 */
export interface AsyncValidationTask {
  /** 字段名称 */
  field: string
  /** 验证规则 */
  rule: ValidationRule
  /** 验证上下文 */
  context: ValidationContext
  /** Promise 实例 */
  promise: Promise<ValidationResult>
  /** 取消函数 */
  cancel?: () => void
}

/**
 * 验证状态接口
 */
export interface ValidationState {
  /** 是否正在验证 */
  validating: boolean
  /** 验证中的字段 */
  validatingFields: Set<string>
  /** 异步验证任务队列 */
  asyncTasks: Map<string, AsyncValidationTask[]>
  /** 验证错误缓存 */
  errorCache: Map<string, ValidationError[]>
  /** 最后一次验证时间 */
  lastValidationTime: number
}

/**
 * 验证引擎接口
 */
export interface ValidationEngine {
  /** 验证单个字段 */
  validateField: (
    field: string,
    value: any,
    rules: ValidationRule[],
    values: Record<string, any>,
    options?: ValidationOptions
  ) => Promise<ValidationResult[]>
  
  /** 验证多个字段 */
  validateFields: (
    fields: Record<string, any>,
    rules: Record<string, ValidationRule[]>,
    options?: ValidationOptions
  ) => Promise<ValidationSummary>
  
  /** 取消验证 */
  cancelValidation: (fields?: string[]) => void
  
  /** 清除验证缓存 */
  clearCache: (fields?: string[]) => void
  
  /** 获取验证状态 */
  getState: () => ValidationState
}

/**
 * 预定义的正则表达式
 */
export const VALIDATION_PATTERNS = {
  /** 邮箱格式 */
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /** URL格式 */
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  /** 手机号格式（中国大陆） */
  PHONE: /^1[3-9]\d{9}$/,
  /** 身份证号格式（中国大陆） */
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  /** 数字格式 */
  NUMBER: /^-?\d+(\.\d+)?$/,
  /** 整数格式 */
  INTEGER: /^-?\d+$/,
  /** 正整数格式 */
  POSITIVE_INTEGER: /^\d+$/,
  /** 浮点数格式 */
  FLOAT: /^-?\d+\.\d+$/,
  /** 中文字符 */
  CHINESE: /^[\u4e00-\u9fa5]+$/,
  /** 英文字符 */
  ENGLISH: /^[a-zA-Z]+$/,
  /** 字母数字 */
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const

/**
 * 预定义的错误消息
 */
export const VALIDATION_MESSAGES = {
  required: '此字段为必填项',
  pattern: '格式不正确',
  min: '值不能小于 {min}',
  max: '值不能大于 {max}',
  minLength: '长度不能少于 {min} 个字符',
  maxLength: '长度不能超过 {max} 个字符',
  email: '请输入有效的邮箱地址',
  url: '请输入有效的URL地址',
  phone: '请输入有效的手机号码',
  idCard: '请输入有效的身份证号码',
  number: '请输入有效的数字',
  integer: '请输入有效的整数',
  float: '请输入有效的小数',
  date: '请输入有效的日期',
  array: '必须是数组类型',
  object: '必须是对象类型',
  enum: '值必须是预定义选项之一',
} as const
