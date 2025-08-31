/**
 * 配置验证工具
 * 
 * 提供模板配置的验证功能
 */

import type { TemplateConfig, DeviceType } from '../types/template'

/**
 * 验证错误接口
 */
export interface ValidationError {
  /** 错误字段 */
  field: string
  /** 错误消息 */
  message: string
  /** 错误值 */
  value?: any
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationError[]
  /** 警告列表 */
  warnings: ValidationError[]
}

/**
 * 验证规则接口
 */
interface ValidationRule<T = any> {
  /** 规则名称 */
  name: string
  /** 验证函数 */
  validate: (value: T, config: TemplateConfig) => boolean
  /** 错误消息 */
  message: string
  /** 是否为警告（非错误） */
  warning?: boolean
}

/**
 * 配置验证器
 */
export class ConfigValidator {
  private rules: Map<string, ValidationRule[]> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * 验证模板配置
   */
  validate(config: TemplateConfig): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // 验证每个字段
    for (const [field, rules] of this.rules) {
      const value = (config as any)[field]

      for (const rule of rules) {
        if (!rule.validate(value, config)) {
          const error: ValidationError = {
            field,
            message: rule.message,
            value
          }

          if (rule.warning) {
            warnings.push(error)
          } else {
            errors.push(error)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 添加验证规则
   */
  addRule(field: string, rule: ValidationRule): void {
    if (!this.rules.has(field)) {
      this.rules.set(field, [])
    }
    this.rules.get(field)!.push(rule)
  }

  /**
   * 移除验证规则
   */
  removeRule(field: string, ruleName: string): void {
    const rules = this.rules.get(field)
    if (rules) {
      const index = rules.findIndex(rule => rule.name === ruleName)
      if (index !== -1) {
        rules.splice(index, 1)
      }
    }
  }

  /**
   * 初始化默认验证规则
   */
  private initializeDefaultRules(): void {
    // name字段验证
    this.addRule('name', {
      name: 'required',
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
      message: 'Template name is required and must be a non-empty string'
    })

    this.addRule('name', {
      name: 'format',
      validate: (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value),
      message: 'Template name must contain only letters, numbers, underscores, and hyphens'
    })

    this.addRule('name', {
      name: 'length',
      validate: (value) => typeof value === 'string' && value.length <= 50,
      message: 'Template name must be 50 characters or less'
    })

    // displayName字段验证
    this.addRule('displayName', {
      name: 'required',
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
      message: 'Display name is required and must be a non-empty string'
    })

    this.addRule('displayName', {
      name: 'length',
      validate: (value) => typeof value === 'string' && value.length <= 100,
      message: 'Display name must be 100 characters or less'
    })

    // description字段验证
    this.addRule('description', {
      name: 'required',
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
      message: 'Description is required and must be a non-empty string'
    })

    this.addRule('description', {
      name: 'length',
      validate: (value) => typeof value === 'string' && value.length <= 500,
      message: 'Description must be 500 characters or less'
    })

    // version字段验证
    this.addRule('version', {
      name: 'required',
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
      message: 'Version is required and must be a non-empty string'
    })

    this.addRule('version', {
      name: 'semver',
      validate: (value) => typeof value === 'string' && /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(value),
      message: 'Version must be a valid semantic version (e.g., 1.0.0)'
    })

    // isDefault字段验证
    this.addRule('isDefault', {
      name: 'type',
      validate: (value) => value === undefined || typeof value === 'boolean',
      message: 'isDefault must be a boolean value'
    })

    // author字段验证
    this.addRule('author', {
      name: 'type',
      validate: (value) => value === undefined || typeof value === 'string',
      message: 'Author must be a string'
    })

    this.addRule('author', {
      name: 'length',
      validate: (value) => value === undefined || (typeof value === 'string' && value.length <= 100),
      message: 'Author name must be 100 characters or less'
    })

    // tags字段验证
    this.addRule('tags', {
      name: 'type',
      validate: (value) => value === undefined || Array.isArray(value),
      message: 'Tags must be an array'
    })

    this.addRule('tags', {
      name: 'items',
      validate: (value) => {
        if (value === undefined) return true
        if (!Array.isArray(value)) return false
        return value.every(tag => typeof tag === 'string' && tag.trim().length > 0)
      },
      message: 'All tags must be non-empty strings'
    })

    this.addRule('tags', {
      name: 'length',
      validate: (value) => value === undefined || (Array.isArray(value) && value.length <= 20),
      message: 'Maximum 20 tags allowed'
    })

    // preview字段验证
    this.addRule('preview', {
      name: 'type',
      validate: (value) => value === undefined || typeof value === 'string',
      message: 'Preview must be a string'
    })

    this.addRule('preview', {
      name: 'format',
      validate: (value) => {
        if (value === undefined) return true
        if (typeof value !== 'string') return false
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value)
      },
      message: 'Preview must be a valid image file path'
    })

    // slots字段验证
    this.addRule('slots', {
      name: 'type',
      validate: (value) => value === undefined || Array.isArray(value),
      message: 'Slots must be an array'
    })

    this.addRule('slots', {
      name: 'items',
      validate: (value) => {
        if (value === undefined) return true
        if (!Array.isArray(value)) return false
        return value.every(slot => typeof slot === 'string' && slot.trim().length > 0)
      },
      message: 'All slot names must be non-empty strings'
    })

    // dependencies字段验证
    this.addRule('dependencies', {
      name: 'type',
      validate: (value) => value === undefined || Array.isArray(value),
      message: 'Dependencies must be an array'
    })

    this.addRule('dependencies', {
      name: 'items',
      validate: (value) => {
        if (value === undefined) return true
        if (!Array.isArray(value)) return false
        return value.every(dep => typeof dep === 'string' && dep.trim().length > 0)
      },
      message: 'All dependencies must be non-empty strings'
    })

    // minVueVersion字段验证
    this.addRule('minVueVersion', {
      name: 'type',
      validate: (value) => value === undefined || typeof value === 'string',
      message: 'minVueVersion must be a string'
    })

    this.addRule('minVueVersion', {
      name: 'semver',
      validate: (value) => {
        if (value === undefined) return true
        if (typeof value !== 'string') return false
        return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(value)
      },
      message: 'minVueVersion must be a valid semantic version'
    })

    // 警告规则
    this.addRule('author', {
      name: 'recommended',
      validate: (value) => value !== undefined && typeof value === 'string' && value.trim().length > 0,
      message: 'It is recommended to specify an author',
      warning: true
    })

    this.addRule('tags', {
      name: 'recommended',
      validate: (value) => value !== undefined && Array.isArray(value) && value.length > 0,
      message: 'It is recommended to add tags for better discoverability',
      warning: true
    })

    this.addRule('preview', {
      name: 'recommended',
      validate: (value) => value !== undefined && typeof value === 'string' && value.trim().length > 0,
      message: 'It is recommended to provide a preview image',
      warning: true
    })
  }
}

/**
 * 设备类型验证
 */
export function validateDeviceType(device: string): device is DeviceType {
  return ['desktop', 'tablet', 'mobile'].includes(device)
}

/**
 * 验证模板配置
 *
 * @param config 模板配置对象
 * @returns 验证结果
 */
export function validateTemplate(config: TemplateConfig): ValidationResult {
  const validator = new ConfigValidator()
  return validator.validate(config)
}

/**
 * 路径验证
 */
export function validateTemplatePath(path: string): boolean {
  // 验证路径格式: /src/templates/{category}/{device}/{templateName}/
  const pathRegex = /^\/.*\/templates\/[^\/]+\/(desktop|tablet|mobile)\/[^\/]+\/$/
  return pathRegex.test(path)
}

/**
 * 全局验证器实例
 */
export const configValidator = new ConfigValidator()

/**
 * 验证工具函数
 */
export const validationUtils = {
  /**
   * 快速验证配置
   */
  validateConfig(config: TemplateConfig): ValidationResult {
    return configValidator.validate(config)
  },

  /**
   * 检查配置是否有效
   */
  isValidConfig(config: TemplateConfig): boolean {
    return configValidator.validate(config).valid
  },

  /**
   * 验证设备类型
   */
  isValidDeviceType(device: string): device is DeviceType {
    return validateDeviceType(device)
  },

  /**
   * 验证模板路径
   */
  isValidTemplatePath(path: string): boolean {
    return validateTemplatePath(path)
  }
}
