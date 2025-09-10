/**
 * 配置验证器
 * 提供配置数据验证功能
 */

import { EventEmitter } from 'node:events'

/**
 * 验证规则
 */
export interface ValidationRule {
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function'
  required?: boolean
  default?: unknown
  min?: number
  max?: number
  pattern?: RegExp
  enum?: unknown[]
  custom?: (value: unknown) => boolean | string
  message?: string
}

/**
 * 验证错误
 */
export interface ValidationError {
  path: string
  message: string
  value: unknown
  rule: ValidationRule
}

/**
 * 配置验证器选项
 */
export interface ConfigValidatorOptions {
  strict?: boolean
  allowUnknown?: boolean
  removeUnknown?: boolean
  coerceTypes?: boolean
}

/**
 * 配置验证器类
 */
export class ConfigValidator extends EventEmitter {
  private options: Required<ConfigValidatorOptions>
  private rules: Map<string, ValidationRule> = new Map()
  private errors: ValidationError[] = []

  constructor(options: ConfigValidatorOptions = {}) {
    super()

    this.options = {
      strict: options.strict !== false,
      allowUnknown: options.allowUnknown !== false,
      removeUnknown: options.removeUnknown !== false,
      coerceTypes: options.coerceTypes !== false,
    }
  }

  /**
   * 添加验证规则
   */
  addRule(path: string, rule: ValidationRule): void {
    this.rules.set(path, rule)
    this.emit('ruleAdded', { path, rule })
  }

  /**
   * 添加多个验证规则
   */
  addRules(rules: Record<string, ValidationRule>): void {
    for (const [path, rule] of Object.entries(rules)) {
      this.addRule(path, rule)
    }
  }

  /**
   * 移除验证规则
   */
  removeRule(path: string): boolean {
    const removed = this.rules.delete(path)
    if (removed) {
      this.emit('ruleRemoved', { path })
    }
    return removed
  }

  /**
   * 获取验证规则
   */
  getRule(path: string): ValidationRule | undefined {
    return this.rules.get(path)
  }

  /**
   * 获取所有验证规则
   */
  getAllRules(): Map<string, ValidationRule> {
    return new Map(this.rules)
  }

  /**
   * 验证配置
   */
  validate(config: Record<string, unknown>): boolean {
    this.errors = []

    // 验证已定义的规则
    for (const [path, rule] of this.rules) {
      this.validatePath(config, path, rule)
    }

    // 检查未知字段
    if (!this.options.allowUnknown) {
      this.checkUnknownFields(config)
    }

    const isValid = this.errors.length === 0

    if (isValid) {
      this.emit('validated', config)
    }
    else {
      this.emit('error', this.errors)
    }

    return isValid
  }

  /**
   * 验证指定路径
   */
  private validatePath(config: Record<string, unknown>, path: string, rule: ValidationRule): void {
    const value = this.getValue(config, path)
    const exists = this.hasValue(config, path)

    // 检查必填字段
    if (rule.required && !exists) {
      this.addError(path, rule.message || `Field '${path}' is required`, value, rule)
      return
    }

    // 如果字段不存在且有默认值，设置默认值
    if (!exists && rule.default !== undefined) {
      this.setValue(config, path, rule.default)
      return
    }

    // 如果字段不存在且不是必填，跳过验证
    if (!exists) {
      return
    }

    // 类型验证
    if (rule.type && !this.validateType(value, rule.type)) {
      // 尝试类型转换
      if (this.options.coerceTypes) {
        const coerced = this.coerceType(value, rule.type)
        if (coerced !== undefined) {
          this.setValue(config, path, coerced)
          return
        }
      }

      this.addError(
        path,
        rule.message || `Field '${path}' must be of type ${rule.type}`,
        value,
        rule,
      )
      return
    }

    // 枚举验证
    if (rule.enum && !rule.enum.includes(value)) {
      this.addError(
        path,
        rule.message || `Field '${path}' must be one of: ${rule.enum.join(', ')}`,
        value,
        rule,
      )
      return
    }

    // 范围验证
    if (rule.min !== undefined && this.isComparable(value)) {
      const numValue = typeof value === 'string' ? value.length : value as number
      if (numValue < rule.min) {
        this.addError(
          path,
          rule.message || `Field '${path}' must be at least ${rule.min}`,
          value,
          rule,
        )
        return
      }
    }

    if (rule.max !== undefined && this.isComparable(value)) {
      const numValue = typeof value === 'string' ? value.length : value as number
      if (numValue > rule.max) {
        this.addError(
          path,
          rule.message || `Field '${path}' must be at most ${rule.max}`,
          value,
          rule,
        )
        return
      }

      // 正则表达式验证
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        this.addError(
          path,
          rule.message || `Field '${path}' does not match required pattern`,
          value,
          rule,
        )
        return
      }

      // 自定义验证
      if (rule.custom) {
        const result = rule.custom(value)
        if (result !== true) {
          const message
            = typeof result === 'string'
              ? result
              : rule.message || `Field '${path}' failed custom validation`
          this.addError(path, message, value, rule)
        }
      }
    }
  }

  /**
   * 验证类型
   */
  private validateType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !Number.isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'function':
        return typeof value === 'function'
      default:
        return true
    }
  }

  /**
   * 类型转换
   */
  private coerceType(value: unknown, type: string): unknown {
    try {
      switch (type) {
        case 'string':
          return String(value)
        case 'number': {
          const num = Number(value)
          return Number.isNaN(num) ? undefined : num
        }
        case 'boolean':
          if (typeof value === 'string') {
            const lower = value.toLowerCase()
            if (lower === 'true' || lower === '1')
              return true
            if (lower === 'false' || lower === '0')
              return false
          }
          return Boolean(value)
        case 'array':
          return Array.isArray(value) ? value : [value]
        default:
          return undefined
      }
    }
    catch {
      return undefined
    }
  }

  /**
   * 检查值是否可比较（数值或字符串）
   */
  private isComparable(value: unknown): value is number | string {
    return typeof value === 'number' || typeof value === 'string'
  }

  /**
   * 检查未知字段
   */
  private checkUnknownFields(config: Record<string, unknown>, prefix = ''): void {
    for (const [key, value] of Object.entries(config)) {
      const path = prefix ? `${prefix}.${key}` : key

      if (!this.rules.has(path)) {
        if (this.options.removeUnknown) {
          delete config[key]
        }
        else if (this.options.strict) {
          this.addError(path, `Unknown field '${path}'`, value, {})
        }
      }
      else if (this.isRecord(value)) {
        this.checkUnknownFields(value, path)
      }
    }
  }

  /**
   * 获取值
   */
  private getValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (!this.isRecord(current) || !(key in current)) {
        return undefined
      }
      current = (current as Record<string, unknown>)[key]
    }

    return current
  }

  /**
   * 检查值是否存在
   */
  private hasValue(obj: Record<string, unknown>, path: string): boolean {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (!this.isRecord(current) || !(key in current)) {
        return false
      }
      current = (current as Record<string, unknown>)[key]
    }

    return true
  }

  /**
   * 设置值
   */
  private setValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.')
    let current: Record<string, unknown> = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!key) {
        continue
      }

      const next = current[key]
      if (!this.isRecord(next)) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey) {
      current[lastKey] = value
    }
  }

  /**
   * 添加错误
   */
  private addError(path: string, message: string, value: unknown, rule: ValidationRule): void {
    this.errors.push({ path, message, value, rule })
  }

  /**
   * 获取验证错误
   */
  getErrors(): ValidationError[] {
    return [...this.errors]
  }

  /**
   * 获取错误消息
   */
  getErrorMessages(): string[] {
    return this.errors.map(error => error.message)
  }

  /**
   * 清除错误
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * 获取验证统计
   */
  getStats(): ValidationStats {
    const errorsByPath: Record<string, number> = {}
    const errorsByType: Record<string, number> = {}

    for (const error of this.errors) {
      errorsByPath[error.path] = (errorsByPath[error.path] || 0) + 1
      const type = error.rule.type || 'unknown'
      errorsByType[type] = (errorsByType[type] || 0) + 1
    }

    return {
      totalRules: this.rules.size,
      totalErrors: this.errors.length,
      errorsByPath,
      errorsByType,
      isValid: this.errors.length === 0,
    }
  }

  /**
   * 创建预定义规则
   */
  static createCommonRules(): Record<string, ValidationRule> {
    return {
      'app.name': {
        type: 'string',
        required: true,
        min: 1,
        max: 100,
      },
      'app.version': {
        type: 'string',
        required: true,
        pattern: /^\d+\.\d+\.\d+$/,
      },
      'app.port': {
        type: 'number',
        required: true,
        min: 1,
        max: 65535,
      },
      'app.host': {
        type: 'string',
        default: 'localhost',
      },
      'app.debug': {
        type: 'boolean',
        default: false,
      },
      'database.host': {
        type: 'string',
        required: true,
      },
      'database.port': {
        type: 'number',
        min: 1,
        max: 65535,
      },
      'database.name': {
        type: 'string',
        required: true,
      },
      'database.username': {
        type: 'string',
        required: true,
      },
      'database.password': {
        type: 'string',
        required: true,
      },
    }
  }

  /**
   * 创建配置验证器实例
   */
  static create(options?: ConfigValidatorOptions): ConfigValidator {
    return new ConfigValidator(options)
  }

  /**
   * 简单对象类型守卫
   */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}

/**
 * 验证统计信息
 */
export interface ValidationStats {
  totalRules: number
  totalErrors: number
  errorsByPath: Record<string, number>
  errorsByType: Record<string, number>
  isValid: boolean
}
