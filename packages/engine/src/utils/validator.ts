/**
 * 数据验证Schema工具
 * ✅ 提供类型安全的数据验证和Schema定义
 */

/**
 * 验证规则类型
 */
export type ValidationRule<T = unknown> = (value: T) => boolean | string

/**
 * Schema字段配置
 */
export interface SchemaField<T = unknown> {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'any'
  required?: boolean
  default?: T
  rules?: ValidationRule<T>[]
  message?: string
  transform?: (value: unknown) => T
  children?: Schema // 用于object和array类型
}

/**
 * Schema定义
 */
export type Schema = Record<string, SchemaField>

/**
 * 验证错误
 */
export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

/**
 * 验证结果
 */
export interface ValidationResult<T = unknown> {
  valid: boolean
  data?: T
  errors: ValidationError[]
}

/**
 * 数据验证器类
 */
export class DataValidator {
  /**
   * 验证数据
   */
  static validate<T = unknown>(
    data: unknown,
    schema: Schema
  ): ValidationResult<T> {
    const errors: ValidationError[] = []
    const result: Record<string, unknown> = {}

    for (const [field, config] of Object.entries(schema)) {
      const value = (data as Record<string, unknown>)?.[field]

      // 检查必填字段
      if (config.required && (value === undefined || value === null)) {
        errors.push({
          field,
          message: config.message || `${field} is required`,
          value,
        })
        continue
      }

      // 使用默认值
      if (value === undefined && config.default !== undefined) {
        result[field] = config.default
        continue
      }

      // 跳过可选字段
      if (!config.required && (value === undefined || value === null)) {
        continue
      }

      // 类型转换
      let processedValue = value
      if (config.transform) {
        try {
          processedValue = config.transform(value)
        } catch (error) {
          errors.push({
            field,
            message: `Failed to transform ${field}: ${(error as Error).message}`,
            value,
          })
          continue
        }
      }

      // 类型验证
      const typeError = this.validateType(field, processedValue, config.type)
      if (typeError) {
        errors.push(typeError)
        continue
      }

      // 自定义规则验证
      if (config.rules) {
        for (const rule of config.rules) {
          const ruleResult = rule(processedValue)
          if (ruleResult !== true) {
            errors.push({
              field,
              message: typeof ruleResult === 'string' ? ruleResult : config.message || `${field} validation failed`,
              value: processedValue,
            })
            break
          }
        }
      }

      // 嵌套对象验证
      if (config.type === 'object' && config.children) {
        const nestedResult = this.validate(processedValue, config.children)
        if (!nestedResult.valid) {
          errors.push(...nestedResult.errors.map(err => ({
            ...err,
            field: `${field}.${err.field}`,
          })))
        } else {
          processedValue = nestedResult.data
        }
      }

      // 数组验证
      if (config.type === 'array' && config.children && Array.isArray(processedValue)) {
        const arrayErrors: ValidationError[] = []
        const arrayResult: unknown[] = []

        for (let i = 0; i < processedValue.length; i++) {
          const itemResult = this.validate(processedValue[i], config.children)
          if (!itemResult.valid) {
            arrayErrors.push(...itemResult.errors.map(err => ({
              ...err,
              field: `${field}[${i}].${err.field}`,
            })))
          } else {
            arrayResult.push(itemResult.data)
          }
        }

        if (arrayErrors.length > 0) {
          errors.push(...arrayErrors)
        } else {
          processedValue = arrayResult
        }
      }

      result[field] = processedValue
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? (result as T) : undefined,
      errors,
    }
  }

  /**
   * 验证类型
   */
  private static validateType(
    field: string,
    value: unknown,
    type: SchemaField['type']
  ): ValidationError | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { field, message: `${field} must be a string`, value }
        }
        break
      case 'number':
        if (typeof value !== 'number' || Number.isNaN(value)) {
          return { field, message: `${field} must be a number`, value }
        }
        break
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { field, message: `${field} must be a boolean`, value }
        }
        break
      case 'array':
        if (!Array.isArray(value)) {
          return { field, message: `${field} must be an array`, value }
        }
        break
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return { field, message: `${field} must be an object`, value }
        }
        break
      case 'date':
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
          return { field, message: `${field} must be a valid date`, value }
        }
        break
      case 'any':
        // 任意类型，不验证
        break
    }

    return null
  }
}

/**
 * 内置验证规则
 */
export const Rules = {
  /**
   * 最小长度
   */
  minLength: (min: number): ValidationRule<string | unknown[]> => (value) => {
    const length = typeof value === 'string' ? value.length : (value as unknown[]).length
    return length >= min || `Length must be at least ${min}`
  },

  /**
   * 最大长度
   */
  maxLength: (max: number): ValidationRule<string | unknown[]> => (value) => {
    const length = typeof value === 'string' ? value.length : (value as unknown[]).length
    return length <= max || `Length must be at most ${max}`
  },

  /**
   * 最小值
   */
  min: (min: number): ValidationRule<number> => (value) => {
    return value >= min || `Value must be at least ${min}`
  },

  /**
   * 最大值
   */
  max: (max: number): ValidationRule<number> => (value) => {
    return value <= max || `Value must be at most ${max}`
  },

  /**
   * 正则表达式匹配
   */
  pattern: (regex: RegExp, message?: string): ValidationRule<string> => (value) => {
    return regex.test(value) || message || 'Value does not match pattern'
  },

  /**
   * 邮箱验证
   */
  email: (): ValidationRule<string> => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return emailRegex.test(value) || 'Invalid email address'
  },

  /**
   * URL验证
   */
  url: (): ValidationRule<string> => (value) => {
    try {
      // eslint-disable-next-line no-new
      new URL(value)
      return true
    } catch {
      return 'Invalid URL'
    }
  },

  /**
   * 枚举值验证
   */
  enum: <T>(values: T[]): ValidationRule<T> => (value) => {
    return values.includes(value) || `Value must be one of: ${values.join(', ')}`
  },

  /**
   * 自定义验证
   */
  custom: <T>(
    predicate: (value: T) => boolean,
    message: string
  ): ValidationRule<T> => (value) => {
    return predicate(value) || message
  },

  /**
   * 范围验证
   */
  range: (min: number, max: number): ValidationRule<number> => (value) => {
    return (value >= min && value <= max) || `Value must be between ${min} and ${max}`
  },

  /**
   * 整数验证
   */
  integer: (): ValidationRule<number> => (value) => {
    return Number.isInteger(value) || 'Value must be an integer'
  },

  /**
   * 正数验证
   */
  positive: (): ValidationRule<number> => (value) => {
    return value > 0 || 'Value must be positive'
  },

  /**
   * 负数验证
   */
  negative: (): ValidationRule<number> => (value) => {
    return value < 0 || 'Value must be negative'
  },

  /**
   * 非空验证
   */
  notEmpty: (): ValidationRule<string | unknown[]> => (value) => {
    const length = typeof value === 'string' ? value.trim().length : (value as unknown[]).length
    return length > 0 || 'Value must not be empty'
  },

  /**
   * 唯一值验证（数组）
   */
  unique: (): ValidationRule<unknown[]> => (value) => {
    const set = new Set(value)
    return set.size === value.length || 'Array must contain unique values'
  },

  /**
   * 日期范围验证
   */
  dateRange: (min: Date, max: Date): ValidationRule<Date> => (value) => {
    return (value >= min && value <= max) || `Date must be between ${min.toISOString()} and ${max.toISOString()}`
  },

  /**
   * 未来日期验证
   */
  futureDate: (): ValidationRule<Date> => (value) => {
    return value > new Date() || 'Date must be in the future'
  },

  /**
   * 过去日期验证
   */
  pastDate: (): ValidationRule<Date> => (value) => {
    return value < new Date() || 'Date must be in the past'
  },
}

/**
 * Schema构建器
 */
export class SchemaBuilder {
  private schema: Schema = {}

  /**
   * 添加字符串字段
   */
  string(field: string, config?: Omit<SchemaField<string>, 'type'>): this {
    this.schema[field] = { type: 'string', ...config } as SchemaField
    return this
  }

  /**
   * 添加数字字段
   */
  number(field: string, config?: Omit<SchemaField<number>, 'type'>): this {
    this.schema[field] = { type: 'number', ...config } as SchemaField
    return this
  }

  /**
   * 添加布尔字段
   */
  boolean(field: string, config?: Omit<SchemaField<boolean>, 'type'>): this {
    this.schema[field] = { type: 'boolean', ...config } as SchemaField
    return this
  }

  /**
   * 添加数组字段
   */
  array(field: string, config?: Omit<SchemaField<unknown[]>, 'type'>): this {
    this.schema[field] = { type: 'array', ...config } as SchemaField
    return this
  }

  /**
   * 添加对象字段
   */
  object(field: string, config?: Omit<SchemaField<Record<string, unknown>>, 'type'>): this {
    this.schema[field] = { type: 'object', ...config } as SchemaField
    return this
  }

  /**
   * 添加日期字段
   */
  date(field: string, config?: Omit<SchemaField<Date>, 'type'>): this {
    this.schema[field] = { type: 'date', ...config } as SchemaField
    return this
  }

  /**
   * 添加任意类型字段
   */
  any(field: string, config?: Omit<SchemaField<unknown>, 'type'>): this {
    this.schema[field] = { type: 'any', ...config } as SchemaField
    return this
  }

  /**
   * 构建Schema
   */
  build(): Schema {
    return this.schema
  }

  /**
   * 验证数据
   */
  validate<T = unknown>(data: unknown): ValidationResult<T> {
    return DataValidator.validate<T>(data, this.schema)
  }
}

/**
 * 创建Schema构建器
 */
export function createSchema(): SchemaBuilder {
  return new SchemaBuilder()
}

/**
 * 快速验证
 */
export function validate<T = unknown>(
  data: unknown,
  schema: Schema
): ValidationResult<T> {
  return DataValidator.validate<T>(data, schema)
}

/**
 * 异步验证
 */
export async function validateAsync<T = unknown>(
  data: unknown,
  schema: Schema
): Promise<ValidationResult<T>> {
  return Promise.resolve(DataValidator.validate<T>(data, schema))
}

/**
 * 批量验证
 */
export function validateBatch<T = unknown>(
  dataArray: unknown[],
  schema: Schema
): ValidationResult<T>[] {
  return dataArray.map(data => DataValidator.validate<T>(data, schema))
}

/**
 * 验证中间件（用于请求拦截等）
 */
export function validationMiddleware(schema: Schema) {
  return (data: unknown): ValidationResult => {
    const result = DataValidator.validate(data, schema)
    if (!result.valid) {
      throw new Error(`Validation failed: ${result.errors.map(e => e.message).join(', ')}`)
    }
    return result
  }
}
