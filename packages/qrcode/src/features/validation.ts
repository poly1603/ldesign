/**
 * LDesign QRCode - 数据验证功能
 * 提供二维码数据验证、URL检查等功能
 */

import type { ValidationOptions } from '../types/advanced'
import { RuntimeTypeChecker } from '../types/advanced'
import { createError } from '../utils'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata?: {
    dataType?: 'url' | 'email' | 'phone' | 'text' | 'json'
    estimatedSize?: number
    complexity?: 'low' | 'medium' | 'high'
  }
}

export class QRDataValidator {
  private defaultOptions: Required<ValidationOptions> = {
    checkUrl: true,
    maxLength: 2000,
    allowedProtocols: ['http:', 'https:', 'mailto:', 'tel:', 'sms:'],
    customValidators: []
  }

  constructor(private options: ValidationOptions = {}) {
    this.options = { ...this.defaultOptions, ...options }
  }

  /**
   * 验证QR码数据
   */
  validate(data: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 基础验证
    if (!data || typeof data !== 'string') {
      errors.push('Data must be a non-empty string')
      return { isValid: false, errors, warnings }
    }

    // 长度验证
    if (data.length > this.options.maxLength!) {
      errors.push(`Data length (${data.length}) exceeds maximum limit (${this.options.maxLength})`)
    }

    if (data.length > 1000) {
      warnings.push('Large data size may result in complex QR codes that are hard to scan')
    }

    // 检测数据类型并验证
    const dataType = this.detectDataType(data)
    const typeValidation = this.validateByType(data, dataType)
    
    errors.push(...typeValidation.errors)
    warnings.push(...typeValidation.warnings)

    // 运行自定义验证器
    for (const validator of this.options.customValidators!) {
      try {
        const result = validator(data)
        if (typeof result === 'string') {
          errors.push(result)
        } else if (result === false) {
          errors.push('Custom validation failed')
        }
      } catch (error) {
        errors.push(`Custom validator error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // 计算复杂度
    const complexity = this.calculateComplexity(data)
    if (complexity === 'high') {
      warnings.push('High complexity data may be difficult to scan on some devices')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        dataType,
        estimatedSize: data.length * 2, // 粗略估算字节大小
        complexity
      }
    }
  }

  /**
   * 检测数据类型
   */
  private detectDataType(data: string): 'url' | 'email' | 'phone' | 'text' | 'json' {
    // URL检测
    if (RuntimeTypeChecker.isValidURL(data)) {
      return 'url'
    }

    // 邮箱检测
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
      return 'email'
    }

    // 电话号码检测
    if (/^(\+?[\d\s\-\(\)]+)$/.test(data) && data.replace(/\D/g, '').length >= 7) {
      return 'phone'
    }

    // JSON检测
    try {
      JSON.parse(data)
      return 'json'
    } catch {
      // Not JSON
    }

    return 'text'
  }

  /**
   * 按类型验证
   */
  private validateByType(data: string, type: string): { errors: string[], warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    switch (type) {
      case 'url':
        if (this.options.checkUrl) {
          try {
            const url = new URL(data)
            if (!this.options.allowedProtocols!.includes(url.protocol)) {
              errors.push(`Protocol ${url.protocol} is not allowed`)
            }
          } catch {
            errors.push('Invalid URL format')
          }
        }
        break

      case 'email':
        if (data.length > 254) {
          errors.push('Email address is too long')
        }
        break

      case 'phone':
        const digits = data.replace(/\D/g, '')
        if (digits.length < 7) {
          errors.push('Phone number is too short')
        }
        if (digits.length > 15) {
          errors.push('Phone number is too long')
        }
        break

      case 'json':
        try {
          const parsed = JSON.parse(data)
          if (typeof parsed === 'object' && parsed !== null) {
            const depth = this.getObjectDepth(parsed)
            if (depth > 5) {
              warnings.push('Deep JSON structures may be hard to encode efficiently')
            }
          }
        } catch (error) {
          errors.push('Invalid JSON format')
        }
        break
    }

    return { errors, warnings }
  }

  /**
   * 计算数据复杂度
   */
  private calculateComplexity(data: string): 'low' | 'medium' | 'high' {
    let score = 0
    
    // 长度评分
    if (data.length > 100) score += 1
    if (data.length > 500) score += 1
    if (data.length > 1000) score += 2

    // 字符类型评分
    if (/[^a-zA-Z0-9\s]/.test(data)) score += 1
    if (/[^\x00-\x7F]/.test(data)) score += 1 // 非ASCII字符

    // 特殊结构评分
    if (data.includes('\n') || data.includes('\t')) score += 1
    if (data.startsWith('{') || data.startsWith('[')) score += 1 // JSON-like

    if (score >= 4) return 'high'
    if (score >= 2) return 'medium'
    return 'low'
  }

  /**
   * 获取对象深度
   */
  private getObjectDepth(obj: any): number {
    if (typeof obj !== 'object' || obj === null) {
      return 0
    }

    let maxDepth = 0
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const depth = this.getObjectDepth(obj[key])
        maxDepth = Math.max(maxDepth, depth)
      }
    }

    return maxDepth + 1
  }

  /**
   * 更新验证选项
   */
  updateOptions(newOptions: Partial<ValidationOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }

  /**
   * 批量验证
   */
  validateBatch(dataArray: string[]): ValidationResult[] {
    return dataArray.map(data => this.validate(data))
  }

  /**
   * 获取验证建议
   */
  getOptimizationSuggestions(data: string): string[] {
    const suggestions: string[] = []
    const validation = this.validate(data)

    if (data.length > 800) {
      suggestions.push('Consider shortening the text or using a URL shortener')
    }

    if (validation.metadata?.complexity === 'high') {
      suggestions.push('Simplify the data structure for better scanning reliability')
    }

    if (/[^\x00-\x7F]/.test(data)) {
      suggestions.push('Non-ASCII characters increase QR code complexity')
    }

    if (data.includes(' '.repeat(3))) {
      suggestions.push('Multiple consecutive spaces can be optimized')
    }

    return suggestions
  }
}

// 预设验证器工厂
export class ValidatorPresets {
  static strict(): QRDataValidator {
    return new QRDataValidator({
      checkUrl: true,
      maxLength: 800,
      allowedProtocols: ['https:'],
      customValidators: [
        (data) => data.trim().length > 0 || 'Data cannot be empty or only whitespace',
        (data) => !/\s{3,}/.test(data) || 'Avoid multiple consecutive spaces'
      ]
    })
  }

  static lenient(): QRDataValidator {
    return new QRDataValidator({
      checkUrl: false,
      maxLength: 2000,
      allowedProtocols: ['http:', 'https:', 'ftp:', 'mailto:', 'tel:', 'sms:'],
      customValidators: []
    })
  }

  static urlOnly(): QRDataValidator {
    return new QRDataValidator({
      checkUrl: true,
      maxLength: 500,
      allowedProtocols: ['https:', 'http:'],
      customValidators: [
        (data) => RuntimeTypeChecker.isValidURL(data) || 'Must be a valid URL'
      ]
    })
  }
}
