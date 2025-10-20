/**
 * 高级输入验证系统
 * 提供更严格的安全验证，防止常见的安全问题
 */

import type { AESKeySize, AESMode } from '../types'

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 高级验证工具类
 */
export class AdvancedValidator {
  /**
   * 验证加密数据
   */
  static validateEncryptionInput(
    data: string,
    options: {
      minLength?: number
      maxLength?: number
      allowEmpty?: boolean
    } = {},
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const minLength = options.minLength || 0
    const maxLength = options.maxLength || 10 * 1024 * 1024 // 默认 10MB
    const allowEmpty = options.allowEmpty || false

    // 检查空值
    if (!data || data.length === 0) {
      if (!allowEmpty) {
        errors.push('数据不能为空')
      }
      return { valid: errors.length === 0, errors, warnings }
    }

    // 检查长度限制
    if (data.length < minLength) {
      errors.push(`数据长度不能小于 ${minLength} 字符`)
    }

    if (data.length > maxLength) {
      errors.push(`数据长度不能超过 ${maxLength} 字符`)
    }

    // 检查特殊字符（可能导致编码问题）
    if (/[\x00-\x08\v\f\x0E-\x1F\x7F]/.test(data)) {
      warnings.push('数据包含控制字符，可能导致编码问题')
    }

    // 检查是否包含有效的 UTF-8 字符
    try {
      encodeURIComponent(data)
    } catch {
      errors.push('数据包含无效的 UTF-8 字符')
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证密钥强度
   */
  static validateKeyStrength(
    key: string,
    algorithm: string,
    options: {
      requireComplex?: boolean
      minEntropy?: number
    } = {},
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const requireComplex = options.requireComplex || false
    const minEntropy = options.minEntropy || 50

    // 检查空值
    if (!key || key.length === 0) {
      errors.push('密钥不能为空')
      return { valid: false, errors, warnings }
    }

    // 算法特定的密钥长度检查
    const algorithmRequirements: Record<string, { min: number, recommended: number }> = {
      'AES': { min: 16, recommended: 32 },
      'DES': { min: 8, recommended: 8 },
      '3DES': { min: 24, recommended: 24 },
      'RSA': { min: 128, recommended: 256 },
      'BLOWFISH': { min: 4, recommended: 16 },
    }

    const requirement = algorithmRequirements[algorithm.toUpperCase()]
    if (requirement) {
      if (key.length < requirement.min) {
        errors.push(`${algorithm} 密钥长度至少需要 ${requirement.min} 字节`)
      } else if (key.length < requirement.recommended) {
        warnings.push(`${algorithm} 推荐密钥长度为 ${requirement.recommended} 字节`)
      }
    }

    // 检查密钥复杂度
    if (requireComplex) {
      const hasLower = /[a-z]/.test(key)
      const hasUpper = /[A-Z]/.test(key)
      const hasDigit = /\d/.test(key)
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(key)

      const complexity = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length

      if (complexity < 3) {
        warnings.push('密钥复杂度较低，建议包含大小写字母、数字和特殊字符')
      }
    }

    // 计算熵值（简化版）
    const entropy = this.calculateEntropy(key)
    if (entropy < minEntropy) {
      warnings.push(`密钥熵值较低 (${entropy.toFixed(2)} < ${minEntropy})，可能不够安全`)
    }

    // 检查常见弱密钥
    const weakKeys = ['password', '123456', 'admin', 'qwerty', 'secret']
    if (weakKeys.some(weak => key.toLowerCase().includes(weak))) {
      warnings.push('密钥包含常见弱口令模式')
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证 AES 选项
   */
  static validateAESOptions(options: {
    keySize?: number
    mode?: string
    iv?: string
  }): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证密钥大小
    if (options.keySize !== undefined) {
      const validKeySizes: AESKeySize[] = [128, 192, 256]
      if (!validKeySizes.includes(options.keySize as AESKeySize)) {
        errors.push(`无效的 AES 密钥大小: ${options.keySize}。有效值: 128, 192, 256`)
      } else if (options.keySize < 256) {
        warnings.push('建议使用 AES-256 以获得更好的安全性')
      }
    }

    // 验证加密模式
    if (options.mode !== undefined) {
      const validModes: AESMode[] = ['CBC', 'ECB', 'CFB', 'OFB', 'CTR', 'GCM']
      if (!validModes.includes(options.mode.toUpperCase() as AESMode)) {
        errors.push(`无效的 AES 模式: ${options.mode}`)
      }
      
      if (options.mode.toUpperCase() === 'ECB') {
        warnings.push('ECB 模式不推荐使用，因为它不提供语义安全性')
      }
    }

    // 验证 IV
    if (options.iv !== undefined) {
      if (options.mode !== 'ECB') {
        if (options.iv.length !== 32) { // 16 字节的十六进制表示
          errors.push(`IV 长度应为 32 个十六进制字符 (16 字节)`)
        }
        
        if (!/^[0-9a-f]+$/i.test(options.iv)) {
          errors.push('IV 应为十六进制字符串')
        }
      }
    } else {
      if (options.mode !== 'ECB') {
        warnings.push('未提供 IV，将自动生成')
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 计算字符串熵值
   */
  private static calculateEntropy(str: string): number {
    const len = str.length
    const frequencies = new Map<string, number>()

    // 统计字符频率
    for (const char of str) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1)
    }

    // 计算香农熵
    let entropy = 0
    for (const freq of frequencies.values()) {
      const p = freq / len
      entropy -= p * Math.log2(p)
    }

    return entropy * len
  }

  /**
   * 验证 Base64 字符串
   */
  static validateBase64(str: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!str || str.length === 0) {
      errors.push('Base64 字符串不能为空')
      return { valid: false, errors, warnings }
    }

    // 检查长度（应为 4 的倍数）
    if (str.length % 4 !== 0) {
      errors.push('Base64 字符串长度应为 4 的倍数')
    }

    // 检查字符集
    if (!/^[A-Z0-9+/]*={0,2}$/i.test(str)) {
      errors.push('Base64 字符串包含无效字符')
    }

    // 检查填充
    const paddingCount = (str.match(/=/g) || []).length
    if (paddingCount > 2) {
      errors.push('Base64 填充字符过多')
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证十六进制字符串
   */
  static validateHex(str: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!str || str.length === 0) {
      errors.push('十六进制字符串不能为空')
      return { valid: false, errors, warnings }
    }

    // 检查字符集
    if (!/^[0-9a-f]+$/i.test(str)) {
      errors.push('十六进制字符串包含无效字符')
    }

    // 检查长度（应为偶数）
    if (str.length % 2 !== 0) {
      errors.push('十六进制字符串长度应为偶数')
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 批量验证
   */
  static validateAll(validations: Array<() => ValidationResult>): ValidationResult {
    const allErrors: string[] = []
    const allWarnings: string[] = []

    let allValid = true

    for (const validate of validations) {
      const result = validate()
      if (!result.valid) {
        allValid = false
      }
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    }

    return {
      valid: allValid,
      errors: allErrors,
      warnings: allWarnings,
    }
  }
}

