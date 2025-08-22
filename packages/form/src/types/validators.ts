/**
 * @fileoverview Validator types and interfaces for the form system
 * @author LDesign Team
 */

import type { FormData, FormFieldValue } from './index'

// ================================
// 验证器核心类型
// ================================

/**
 * 验证器上下文
 */
export interface ValidatorContext {
  /** 当前字段名 */
  field: string
  /** 当前字段值 */
  value: FormFieldValue
  /** 所有表单数据 */
  formData: FormData
  /** 验证器参数 */
  params?: Record<string, any>
}

/**
 * 验证器函数类型
 */
export type Validator = (context: ValidatorContext) => boolean | string | Promise<boolean | string>

/**
 * 内置验证器映射
 */
export interface BuiltInValidators {
  /** 必填验证 */
  required: Validator
  /** 邮箱格式验证 */
  email: Validator
  /** 手机号验证 */
  phone: Validator
  /** URL格式验证 */
  url: Validator
  /** 数字验证 */
  number: Validator
  /** 最小值验证 */
  min: Validator
  /** 最大值验证 */
  max: Validator
  /** 最小长度验证 */
  minLength: Validator
  /** 最大长度验证 */
  maxLength: Validator
  /** 正则表达式验证 */
  pattern: Validator
  /** 整数验证 */
  integer: Validator
  /** 浮点数验证 */
  float: Validator
  /** 日期验证 */
  date: Validator
  /** 时间验证 */
  time: Validator
  /** 日期时间验证 */
  datetime: Validator
  /** 身份证号验证 */
  idCard: Validator
  /** 银行卡号验证 */
  bankCard: Validator
  /** 中文姓名验证 */
  chineseName: Validator
  /** 英文姓名验证 */
  englishName: Validator
  /** 强密码验证 */
  strongPassword: Validator
  /** 弱密码验证 */
  weakPassword: Validator
  /** 颜色值验证 */
  color: Validator
  /** IPv4地址验证 */
  ipv4: Validator
  /** IPv6地址验证 */
  ipv6: Validator
  /** MAC地址验证 */
  mac: Validator
  /** 域名验证 */
  domain: Validator
  /** 文件大小验证 */
  fileSize: Validator
  /** 文件类型验证 */
  fileType: Validator
  /** JSON格式验证 */
  json: Validator
  /** Base64格式验证 */
  base64: Validator
  /** UUID格式验证 */
  uuid: Validator
  /** 经度验证 */
  longitude: Validator
  /** 纬度验证 */
  latitude: Validator
  /** 中国邮政编码验证 */
  zipCode: Validator
  /** 车牌号验证 */
  licensePlate: Validator
  /** 统一社会信用代码验证 */
  creditCode: Validator
}

/**
 * 验证器参数配置
 */
export interface ValidatorParams {
  required?: {}
  email?: {
    /** 是否允许多个邮箱 */
    multiple?: boolean
    /** 邮箱分隔符 */
    separator?: string
  }
  phone?: {
    /** 国家代码 */
    country?: string
    /** 是否允许座机号 */
    allowLandline?: boolean
  }
  url?: {
    /** 允许的协议 */
    protocols?: string[]
    /** 是否要求协议 */
    requireProtocol?: boolean
  }
  number?: {
    /** 是否允许负数 */
    allowNegative?: boolean
    /** 精度 */
    precision?: number
  }
  min?: {
    /** 最小值 */
    value: number
    /** 是否包含边界值 */
    inclusive?: boolean
  }
  max?: {
    /** 最大值 */
    value: number
    /** 是否包含边界值 */
    inclusive?: boolean
  }
  minLength?: {
    /** 最小长度 */
    length: number
  }
  maxLength?: {
    /** 最大长度 */
    length: number
  }
  pattern?: {
    /** 正则表达式 */
    regexp: RegExp | string
    /** 修饰符 */
    flags?: string
  }
  strongPassword?: {
    /** 最小长度 */
    minLength?: number
    /** 是否要求大写字母 */
    requireUppercase?: boolean
    /** 是否要求小写字母 */
    requireLowercase?: boolean
    /** 是否要求数字 */
    requireNumbers?: boolean
    /** 是否要求特殊字符 */
    requireSpecialChars?: boolean
    /** 特殊字符集合 */
    specialChars?: string
  }
  fileSize?: {
    /** 最大文件大小，单位字节 */
    maxSize: number
    /** 最小文件大小，单位字节 */
    minSize?: number
  }
  fileType?: {
    /** 允许的文件类型 */
    types: string[]
    /** 是否严格检查 */
    strict?: boolean
  }
}

/**
 * 验证规则扩展配置
 */
export interface ValidationRuleExtended {
  /** 验证器名称或函数 */
  validator: keyof BuiltInValidators | Validator
  /** 验证器参数 */
  params?: ValidatorParams[keyof ValidatorParams]
  /** 错误信息 */
  message?: string
  /** 何时触发验证 */
  trigger?: 'change' | 'blur' | 'submit' | 'manual'
  /** 是否异步验证 */
  async?: boolean
  /** 验证优先级 */
  priority?: number
  /** 验证条件 */
  condition?: (context: ValidatorContext) => boolean
  /** 验证器依赖 */
  dependsOn?: string[]
}

/**
 * 验证组配置
 */
export interface ValidationGroup {
  /** 组名 */
  name: string
  /** 包含的字段 */
  fields: string[]
  /** 组级别验证规则 */
  rules?: ValidationRuleExtended[]
  /** 验证策略 */
  strategy?: 'all' | 'first' | 'abort-early'
}

/**
 * 验证策略
 */
export type ValidationStrategy = 'all' | 'first' | 'abort-early'

/**
 * 批量验证选项
 */
export interface BatchValidationOptions {
  /** 验证策略 */
  strategy?: ValidationStrategy
  /** 是否并行验证 */
  parallel?: boolean
  /** 验证超时时间 */
  timeout?: number
  /** 验证分组 */
  groups?: ValidationGroup[]
  /** 要跳过的字段 */
  skipFields?: string[]
  /** 只验证的字段 */
  onlyFields?: string[]
}

/**
 * 验证结果详情
 */
export interface ValidationResultDetail {
  /** 字段名 */
  field: string
  /** 验证值 */
  value: FormFieldValue
  /** 是否通过 */
  valid: boolean
  /** 错误信息 */
  message?: string
  /** 失败的验证器 */
  failedValidator?: string
  /** 验证耗时 */
  duration?: number
  /** 验证时间戳 */
  timestamp: number
}

/**
 * 批量验证结果
 */
export interface BatchValidationResult {
  /** 整体是否通过 */
  valid: boolean
  /** 详细结果 */
  details: ValidationResultDetail[]
  /** 错误汇总 */
  errors: Record<string, string>
  /** 验证统计 */
  stats: {
    total: number
    passed: number
    failed: number
    skipped: number
    duration: number
  }
}

/**
 * 自定义验证器注册接口
 */
export interface ValidatorRegistry {
  /** 注册验证器 */
  register(name: string, validator: Validator): void
  /** 注册多个验证器 */
  registerBatch(validators: Record<string, Validator>): void
  /** 获取验证器 */
  get(name: string): Validator | undefined
  /** 检查验证器是否存在 */
  has(name: string): boolean
  /** 移除验证器 */
  remove(name: string): void
  /** 获取所有验证器名称 */
  getNames(): string[]
  /** 清空所有验证器 */
  clear(): void
}

/**
 * 验证引擎接口
 */
export interface ValidationEngine {
  /** 验证器注册表 */
  registry: ValidatorRegistry
  /** 验证单个字段 */
  validateField(
    field: string,
    value: FormFieldValue,
    rules: ValidationRuleExtended[],
    formData: FormData
  ): Promise<ValidationResultDetail>
  /** 批量验证 */
  validateBatch(
    data: FormData,
    rules: Record<string, ValidationRuleExtended[]>,
    options?: BatchValidationOptions
  ): Promise<BatchValidationResult>
  /** 设置默认错误信息 */
  setDefaultMessages(messages: Record<string, string>): void
  /** 获取默认错误信息 */
  getDefaultMessage(validator: string): string
  /** 设置验证策略 */
  setStrategy(strategy: ValidationStrategy): void
  /** 获取验证策略 */
  getStrategy(): ValidationStrategy
}

// ================================
// 异步验证相关类型
// ================================

/**
 * 异步验证器上下文
 */
export interface AsyncValidatorContext extends ValidatorContext {
  /** 中止信号 */
  signal?: AbortSignal
  /** 超时时间 */
  timeout?: number
}

/**
 * 异步验证器函数类型
 */
export type AsyncValidator = (context: AsyncValidatorContext) => Promise<boolean | string>

/**
 * 异步验证控制器
 */
export interface AsyncValidationController {
  /** 中止验证 */
  abort(): void
  /** 是否已中止 */
  isAborted(): boolean
  /** 验证状态 */
  status: 'pending' | 'resolved' | 'rejected' | 'aborted'
  /** 验证promise */
  promise: Promise<ValidationResultDetail>
}

/**
 * 防抖验证配置
 */
export interface DebounceValidationConfig {
  /** 防抖延迟 */
  delay: number
  /** 是否在首次立即执行 */
  immediate?: boolean
  /** 最大等待时间 */
  maxWait?: number
}

// ================================
// 国际化相关类型
// ================================

/**
 * 验证信息国际化配置
 */
export interface ValidationI18nConfig {
  /** 当前语言 */
  locale: string
  /** 消息映射 */
  messages: Record<string, Record<string, string>>
  /** 默认语言 */
  fallbackLocale?: string
  /** 插值函数 */
  interpolate?: (message: string, params: Record<string, any>) => string
}

/**
 * 验证器错误信息模板
 */
export interface ValidationMessageTemplates {
  required: string
  email: string
  phone: string
  url: string
  number: string
  min: string
  max: string
  minLength: string
  maxLength: string
  pattern: string
  integer: string
  float: string
  date: string
  time: string
  datetime: string
  idCard: string
  bankCard: string
  chineseName: string
  englishName: string
  strongPassword: string
  weakPassword: string
  color: string
  ipv4: string
  ipv6: string
  mac: string
  domain: string
  fileSize: string
  fileType: string
  json: string
  base64: string
  uuid: string
  longitude: string
  latitude: string
  zipCode: string
  licensePlate: string
  creditCode: string
}

// ================================
// 导出所有类型
// ================================

export type {
  Validator,
  AsyncValidator,
  ValidatorContext,
  AsyncValidatorContext,
  BuiltInValidators,
  ValidatorParams,
  ValidationRuleExtended,
  ValidationGroup,
  ValidationStrategy,
  BatchValidationOptions,
  ValidationResultDetail,
  BatchValidationResult,
  ValidatorRegistry,
  ValidationEngine,
  AsyncValidationController,
  DebounceValidationConfig,
  ValidationI18nConfig,
  ValidationMessageTemplates,
}