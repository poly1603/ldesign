/**
 * 模式验证器
 * 提供基于JSON Schema的数据验证
 */

import type { SchemaValidationResult, SchemaValidatorOptions, ValidationSchema } from '../types'
import { EventEmitter } from 'node:events'

/**
 * 模式验证器类
 */
export class SchemaValidator extends EventEmitter {
  private schemas: Map<string, ValidationSchema> = new Map()
  private options: Required<SchemaValidatorOptions>

  constructor(options: SchemaValidatorOptions = {}) {
    super()

    this.options = {
      strict: options.strict !== false,
      allowAdditionalProperties: options.allowAdditionalProperties !== false,
      removeAdditionalProperties: options.removeAdditionalProperties !== false,
      useDefaults: options.useDefaults !== false,
      coerceTypes: options.coerceTypes !== false,
      validateFormats: options.validateFormats !== false,
      enableCustomKeywords: options.enableCustomKeywords !== false,
    }
  }

  /**
   * 添加模式
   */
  addSchema(id: string, schema: ValidationSchema): this {
    this.schemas.set(id, schema)
    this.emit('schemaAdded', { id, schema })
    return this
  }

  /**
   * 移除模式
   */
  removeSchema(id: string): boolean {
    const removed = this.schemas.delete(id)
    if (removed) {
      this.emit('schemaRemoved', id)
    }
    return removed
  }

  /**
   * 获取模式
   */
  getSchema(id: string): ValidationSchema | undefined {
    return this.schemas.get(id)
  }

  /**
   * 验证数据
   */
  validate(data: any, schemaId: string): SchemaValidationResult {
    const schema = this.schemas.get(schemaId)
    if (!schema) {
      throw new Error(`Schema not found: ${schemaId}`)
    }

    return this.validateWithSchema(data, schema)
  }

  /**
   * 使用模式验证数据
   */
  validateWithSchema(data: any, schema: ValidationSchema): SchemaValidationResult {
    const result: SchemaValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      data: this.options.removeAdditionalProperties ? {} : { ...data },
    }

    try {
      this.emit('validationStart', { data, schema })

      // 验证根级别
      this.validateValue(data, schema, '', result)

      this.emit('validationEnd', result)
      return result
    }
    catch (error) {
      this.emit('validationError', error)
      result.valid = false
      result.errors.push({
        path: '',
        message: `Validation error: ${error}`,
        code: 'VALIDATION_ERROR',
        value: data,
      })
      return result
    }
  }

  /**
   * 验证值
   */
  private validateValue(
    value: any,
    schema: ValidationSchema,
    path: string,
    result: SchemaValidationResult,
  ): void {
    // 类型验证
    if (schema.type && !this.validateType(value, schema.type)) {
      if (this.options.coerceTypes) {
        const coerced = this.coerceType(value, schema.type)
        if (coerced.success) {
          value = coerced.value
          this.setValueAtPath(result.data, path, value)
        }
        else {
          result.valid = false
          result.errors.push({
            path,
            message: `Expected type ${schema.type}, got ${typeof value}`,
            code: 'TYPE_MISMATCH',
            value,
          })
          return
        }
      }
      else {
        result.valid = false
        result.errors.push({
          path,
          message: `Expected type ${schema.type}, got ${typeof value}`,
          code: 'TYPE_MISMATCH',
          value,
        })
        return
      }
    }

    // 枚举验证
    if (schema.enum && !schema.enum.includes(value)) {
      result.valid = false
      result.errors.push({
        path,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        code: 'ENUM_MISMATCH',
        value,
      })
      return
    }

    // 常量验证
    if (schema.const !== undefined && value !== schema.const) {
      result.valid = false
      result.errors.push({
        path,
        message: `Value must be: ${schema.const}`,
        code: 'CONST_MISMATCH',
        value,
      })
      return
    }

    // 字符串验证
    if (schema.type === 'string' && typeof value === 'string') {
      this.validateString(value, schema, path, result)
    }

    // 数字验证
    if ((schema.type === 'number' || schema.type === 'integer') && typeof value === 'number') {
      this.validateNumber(value, schema, path, result)
    }

    // 数组验证
    if (schema.type === 'array' && Array.isArray(value)) {
      this.validateArray(value, schema, path, result)
    }

    // 对象验证
    if (schema.type === 'object' && typeof value === 'object' && value !== null) {
      this.validateObject(value, schema, path, result)
    }

    // 自定义验证
    if (schema.custom) {
      const customResult = schema.custom(value, schema, path)
      if (!customResult.valid) {
        result.valid = false
        result.errors.push({
          path,
          message: customResult.message || 'Custom validation failed',
          code: customResult.code || 'CUSTOM_VALIDATION_ERROR',
          value,
        })
      }
    }
  }

  /**
   * 验证字符串
   */
  private validateString(
    value: string,
    schema: ValidationSchema,
    path: string,
    result: SchemaValidationResult,
  ): void {
    // 长度验证
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      result.valid = false
      result.errors.push({
        path,
        message: `String length must be at least ${schema.minLength}`,
        code: 'MIN_LENGTH',
        value,
      })
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      result.valid = false
      result.errors.push({
        path,
        message: `String length must be at most ${schema.maxLength}`,
        code: 'MAX_LENGTH',
        value,
      })
    }

    // 模式验证
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern)
      if (!regex.test(value)) {
        result.valid = false
        result.errors.push({
          path,
          message: `String does not match pattern: ${schema.pattern}`,
          code: 'PATTERN_MISMATCH',
          value,
        })
      }
    }

    // 格式验证
    if (schema.format && this.options.validateFormats) {
      if (!this.validateFormat(value, schema.format)) {
        result.valid = false
        result.errors.push({
          path,
          message: `String does not match format: ${schema.format}`,
          code: 'FORMAT_MISMATCH',
          value,
        })
      }
    }
  }

  /**
   * 验证数字
   */
  private validateNumber(
    value: number,
    schema: ValidationSchema,
    path: string,
    result: SchemaValidationResult,
  ): void {
    // 最小值验证
    if (schema.minimum !== undefined && value < schema.minimum) {
      result.valid = false
      result.errors.push({
        path,
        message: `Number must be at least ${schema.minimum}`,
        code: 'MINIMUM',
        value,
      })
    }

    // 最大值验证
    if (schema.maximum !== undefined && value > schema.maximum) {
      result.valid = false
      result.errors.push({
        path,
        message: `Number must be at most ${schema.maximum}`,
        code: 'MAXIMUM',
        value,
      })
    }

    // 排他最小值验证
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
      result.valid = false
      result.errors.push({
        path,
        message: `Number must be greater than ${schema.exclusiveMinimum}`,
        code: 'EXCLUSIVE_MINIMUM',
        value,
      })
    }

    // 排他最大值验证
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
      result.valid = false
      result.errors.push({
        path,
        message: `Number must be less than ${schema.exclusiveMaximum}`,
        code: 'EXCLUSIVE_MAXIMUM',
        value,
      })
    }

    // 倍数验证
    if (schema.multipleOf !== undefined && value % schema.multipleOf !== 0) {
      result.valid = false
      result.errors.push({
        path,
        message: `Number must be a multiple of ${schema.multipleOf}`,
        code: 'MULTIPLE_OF',
        value,
      })
    }

    // 整数验证
    if (schema.type === 'integer' && !Number.isInteger(value)) {
      result.valid = false
      result.errors.push({
        path,
        message: 'Value must be an integer',
        code: 'NOT_INTEGER',
        value,
      })
    }
  }

  /**
   * 验证数组
   */
  private validateArray(
    value: any[],
    schema: ValidationSchema,
    path: string,
    result: SchemaValidationResult,
  ): void {
    // 长度验证
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      result.valid = false
      result.errors.push({
        path,
        message: `Array must have at least ${schema.minItems} items`,
        code: 'MIN_ITEMS',
        value,
      })
    }

    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      result.valid = false
      result.errors.push({
        path,
        message: `Array must have at most ${schema.maxItems} items`,
        code: 'MAX_ITEMS',
        value,
      })
    }

    // 唯一性验证
    if (schema.uniqueItems) {
      const seen = new Set()
      for (let i = 0; i < value.length; i++) {
        const item = JSON.stringify(value[i])
        if (seen.has(item)) {
          result.valid = false
          result.errors.push({
            path: `${path}[${i}]`,
            message: 'Array items must be unique',
            code: 'UNIQUE_ITEMS',
            value: value[i],
          })
        }
        seen.add(item)
      }
    }

    // 项目验证
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        this.validateValue(value[i], schema.items, `${path}[${i}]`, result)
      }
    }
  }

  /**
   * 验证对象
   */
  private validateObject(
    value: Record<string, any>,
    schema: ValidationSchema,
    path: string,
    result: SchemaValidationResult,
  ): void {
    // 必需属性验证
    if (schema.required) {
      for (const prop of schema.required) {
        if (!(prop in value)) {
          result.valid = false
          result.errors.push({
            path: path ? `${path}.${prop}` : prop,
            message: `Required property '${prop}' is missing`,
            code: 'REQUIRED_PROPERTY',
            value: undefined,
          })
        }
      }
    }

    // 属性验证
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        const propPath = path ? `${path}.${prop}` : prop
        if (prop in value) {
          this.validateValue(value[prop], propSchema, propPath, result)
        }
        else if (propSchema.default !== undefined && this.options.useDefaults) {
          // 应用默认值
          value[prop] = propSchema.default
          this.setValueAtPath(result.data, propPath, propSchema.default)
        }
      }
    }

    // 附加属性验证
    if (!this.options.allowAdditionalProperties && schema.additionalProperties === false) {
      const allowedProps = new Set(Object.keys(schema.properties || {}))
      for (const prop of Object.keys(value)) {
        if (!allowedProps.has(prop)) {
          result.valid = false
          result.errors.push({
            path: path ? `${path}.${prop}` : prop,
            message: `Additional property '${prop}' is not allowed`,
            code: 'ADDITIONAL_PROPERTY',
            value: value[prop],
          })
        }
      }
    }

    // 属性数量验证
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) {
      result.valid = false
      result.errors.push({
        path,
        message: `Object must have at least ${schema.minProperties} properties`,
        code: 'MIN_PROPERTIES',
        value,
      })
    }

    if (schema.maxProperties !== undefined && Object.keys(value).length > schema.maxProperties) {
      result.valid = false
      result.errors.push({
        path,
        message: `Object must have at most ${schema.maxProperties} properties`,
        code: 'MAX_PROPERTIES',
        value,
      })
    }
  }

  /**
   * 验证类型
   */
  private validateType(value: any, type: string): boolean {
    switch (type) {
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
  }

  /**
   * 类型强制转换
   */
  private coerceType(value: any, type: string): { success: boolean, value: any } {
    try {
      switch (type) {
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
          return { success: false, value }
        default:
          return { success: false, value }
      }
    }
    catch {
      return { success: false, value }
    }
  }

  /**
   * 验证格式
   */
  private validateFormat(value: string, format: string): boolean {
    const formats: Record<string, RegExp> = {
      'email': /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,
      'uri': /^https?:\/\/.+/,
      'date': /^\d{4}-\d{2}-\d{2}$/,
      'time': /^\d{2}:\d{2}:\d{2}$/,
      'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
      'uuid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'ipv4': /^(\d{1,3}\.){3}\d{1,3}$/,
      'ipv6': /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
    }

    const regex = formats[format]
    return regex ? regex.test(value) : true
  }

  /**
   * 在路径设置值
   */
  private setValueAtPath(obj: any, path: string, value: any): void {
    if (!path) {
      return
    }

    const keys = path.split('.')
    let current: any = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]!
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey !== undefined) {
      current[lastKey] = value
    }
  }

  /**
   * 获取所有模式ID
   */
  getSchemaIds(): string[] {
    return Array.from(this.schemas.keys())
  }

  /**
   * 清空所有模式
   */
  clear(): this {
    this.schemas.clear()
    this.emit('schemasCleared')
    return this
  }

  /**
   * 创建模式验证器实例
   */
  static create(options?: SchemaValidatorOptions): SchemaValidator {
    return new SchemaValidator(options)
  }
}
