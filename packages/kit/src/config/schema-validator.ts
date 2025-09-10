/**
 * 配置模式验证器
 * 提供基于 JSON Schema 的配置验证功能
 */

import type { ConfigSchema, SchemaValidationError } from '../types'
import { EventEmitter } from 'node:events'

/**
 * 模式验证器选项
 */
export interface SchemaValidatorOptions {
  strict?: boolean
  allowAdditionalProperties?: boolean
  coerceTypes?: boolean
  removeAdditional?: boolean
  useDefaults?: boolean
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: SchemaValidationError[]
  data?: unknown
}

/**
 * 配置模式验证器类
 */
export class SchemaValidator extends EventEmitter {
  private schema?: ConfigSchema
  private options: Required<SchemaValidatorOptions>
  private errors: SchemaValidationError[] = []

  constructor(options: SchemaValidatorOptions = {}) {
    super()

    this.options = {
      strict: options.strict !== false,
      allowAdditionalProperties: options.allowAdditionalProperties !== false,
      coerceTypes: options.coerceTypes !== false,
      removeAdditional: options.removeAdditional !== false,
      useDefaults: options.useDefaults !== false,
    }
  }

  /**
   * 设置验证模式
   */
  setSchema(schema: ConfigSchema): void {
    this.schema = schema
    this.emit('schemaSet', schema)
  }

  /**
   * 获取验证模式
   */
  getSchema(): ConfigSchema | undefined {
    return this.schema
  }

  /**
   * 验证数据
   */
  async validate(data: unknown): Promise<boolean> {
    if (!this.schema) {
      throw new Error('No schema defined for validation')
    }

    this.errors = []

    try {
      const result = this.validateValue(data, this.schema, '')

      if (result.valid) {
        this.emit('validated', result.data || data)
        return true
      }
      else {
        this.errors = result.errors
        this.emit('validationError', this.errors)
        return false
      }
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 验证值
   */
  private validateValue(value: unknown, schema: ConfigSchema, path: string): ValidationResult {
    const errors: SchemaValidationError[] = []
    let processedValue: unknown = value

    // 处理默认值
    if (value === undefined && schema.default !== undefined && this.options.useDefaults) {
      processedValue = schema.default
    }

    // 类型验证
    if (schema.type && !this.validateType(processedValue, schema.type)) {
      // 尝试类型转换
      if (this.options.coerceTypes) {
        const coerced = this.coerceType(processedValue, schema.type)
        if (coerced.success) {
          processedValue = coerced.value
        }
        else {
          errors.push({
            path,
            message: `Expected type ${schema.type}, got ${typeof processedValue}`,
            value: processedValue,
            schema,
          })
        }
      }
      else {
        errors.push({
          path,
          message: `Expected type ${schema.type}, got ${typeof processedValue}`,
          value: processedValue,
          schema,
        })
      }
    }

    // 必填验证
    if (schema.required && (processedValue === undefined || processedValue === null)) {
      errors.push({
        path,
        message: `Field is required`,
        value: processedValue,
        schema,
      })
    }

    // 枚举验证
    if (schema.enum && !schema.enum.includes(processedValue)) {
      errors.push({
        path,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        value: processedValue,
        schema,
      })
    }

    // 数值范围验证
    if (typeof processedValue === 'number') {
      if (schema.minimum !== undefined && processedValue < schema.minimum) {
        errors.push({
          path,
          message: `Value must be >= ${schema.minimum}`,
          value: processedValue,
          schema,
        })
      }

      if (schema.maximum !== undefined && processedValue > schema.maximum) {
        errors.push({
          path,
          message: `Value must be <= ${schema.maximum}`,
          value: processedValue,
          schema,
        })
      }
    }

    // 字符串长度验证
    if (typeof processedValue === 'string') {
      if (schema.minLength !== undefined && processedValue.length < schema.minLength) {
        errors.push({
          path,
          message: `String must be at least ${schema.minLength} characters`,
          value: processedValue,
          schema,
        })
      }

      if (schema.maxLength !== undefined && processedValue.length > schema.maxLength) {
        errors.push({
          path,
          message: `String must be at most ${schema.maxLength} characters`,
          value: processedValue,
          schema,
        })
      }

      if (schema.pattern && !new RegExp(schema.pattern).test(processedValue as string)) {
        errors.push({
          path,
          message: `String does not match pattern: ${schema.pattern}`,
          value: processedValue,
          schema,
        })
      }
    }

    // 数组验证
    if (Array.isArray(processedValue) && schema.type === 'array') {
      if (schema.minItems !== undefined && processedValue.length < schema.minItems) {
        errors.push({
          path,
          message: `Array must have at least ${schema.minItems} items`,
          value: processedValue,
          schema,
        })
      }

      if (schema.maxItems !== undefined && processedValue.length > schema.maxItems) {
        errors.push({
          path,
          message: `Array must have at most ${schema.maxItems} items`,
          value: processedValue,
          schema,
        })
      }

      // 验证数组项
      if (schema.items) {
        const validatedItems: unknown[] = []
        for (let i = 0; i < processedValue.length; i++) {
          const itemResult = this.validateValue(processedValue[i], schema.items, `${path}[${i}]`)
          errors.push(...itemResult.errors)
          validatedItems.push(itemResult.data ?? processedValue[i])
        }
        processedValue = validatedItems
      }
    }

    // 对象验证
    if (
      typeof processedValue === 'object'
      && processedValue !== null
      && !Array.isArray(processedValue)
      && schema.type === 'object'
    ) {
      const validatedObject: Record<string, unknown> = {}

      // 验证已定义的属性
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          const propPath = path ? `${path}.${key}` : key
          const propResult = this.validateValue((processedValue as Record<string, unknown>)[key], propSchema, propPath)
          errors.push(...propResult.errors)

          if (propResult.data !== undefined || (processedValue as Record<string, unknown>)[key] !== undefined) {
            validatedObject[key]
              = propResult.data !== undefined ? propResult.data : (processedValue as Record<string, unknown>)[key]
          }
        }
      }

      // 处理额外属性
      for (const [key, value] of Object.entries(processedValue as Record<string, unknown>)) {
        if (!schema.properties || !(key in schema.properties)) {
          if (this.options.allowAdditionalProperties) {
            if (!this.options.removeAdditional) {
              validatedObject[key] = value
            }
          }
          else if (this.options.strict) {
            errors.push({
              path: path ? `${path}.${key}` : key,
              message: `Additional property '${key}' is not allowed`,
              value,
              schema,
            })
          }
        }
      }

      processedValue = validatedObject
    }

    // 自定义验证
    if (schema.validate && typeof schema.validate === 'function') {
      try {
        const customResult = schema.validate(processedValue)
        if (customResult !== true) {
          errors.push({
            path,
            message: typeof customResult === 'string' ? customResult : 'Custom validation failed',
            value: processedValue,
            schema,
          })
        }
      }
      catch (error) {
        errors.push({
          path,
          message: `Custom validation error: ${error}`,
          value: processedValue,
          schema,
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data: processedValue,
    }
  }

  /**
   * 验证类型
   */
  private validateType(value: unknown, type: string | string[]): boolean {
    const types = Array.isArray(type) ? type : [type]

    return types.some((t) => {
      switch (t) {
        case 'string':
          return typeof value === 'string'
        case 'number':
          return typeof value === 'number' && !Number.isNaN(value)
        case 'integer':
          return typeof value === 'number' && Number.isInteger(value)
        case 'boolean':
          return typeof value === 'boolean'
        case 'array':
          return Array.isArray(value)
        case 'object':
          return typeof value === 'object' && value !== null && !Array.isArray(value)
        case 'null':
          return value === null
        default:
          return true
      }
    })
  }

  /**
   * 类型转换
   */
  private coerceType(value: unknown, type: string | string[]): { success: boolean, value?: unknown } {
    const targetType = Array.isArray(type) ? type[0] : type

    try {
      switch (targetType) {
        case 'string':
          return { success: true, value: String(value) }

        case 'number': {
          const num = Number(value)
          return { success: !Number.isNaN(num), value: num }
        }

        case 'integer': {
          const int = Number.parseInt(String(value), 10)
          return { success: !Number.isNaN(int), value: int }
        }

        case 'boolean':
          if (typeof value === 'string') {
            const lower = value.toLowerCase()
            if (lower === 'true' || lower === '1')
              return { success: true, value: true }
            if (lower === 'false' || lower === '0')
              return { success: true, value: false }
          }
          return { success: true, value: Boolean(value) }

        case 'array':
          return { success: true, value: Array.isArray(value) ? value : [value] }

        default:
          return { success: false }
      }
    }
    catch {
      return { success: false }
    }
  }

  /**
   * 获取验证错误
   */
  getErrors(): SchemaValidationError[] {
    return [...this.errors]
  }

  /**
   * 获取错误消息
   */
  getErrorMessages(): string[] {
    return this.errors.map(error => `${error.path}: ${error.message}`)
  }

  /**
   * 清除错误
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * 创建基础模式
   */
  static createBasicSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        app: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            version: { type: 'string', required: true },
            port: { type: 'number', minimum: 1, maximum: 65535, default: 3000 },
            host: { type: 'string', default: 'localhost' },
            debug: { type: 'boolean', default: false },
          },
        },
        database: {
          type: 'object',
          properties: {
            host: { type: 'string', required: true },
            port: { type: 'number', minimum: 1, maximum: 65535 },
            name: { type: 'string', required: true },
            username: { type: 'string', required: true },
            password: { type: 'string', required: true },
          },
        },
      },
    }
  }

  /**
   * 创建模式验证器实例
   */
  static create(options?: SchemaValidatorOptions): SchemaValidator {
    return new SchemaValidator(options)
  }

  /**
   * 快速验证
   */
  static async quickValidate(data: unknown, schema: ConfigSchema): Promise<ValidationResult> {
    const validator = new SchemaValidator()
    validator.setSchema(schema)
    const valid = await validator.validate(data)
    return {
      valid,
      errors: validator.getErrors(),
      data,
    }
  }


}
