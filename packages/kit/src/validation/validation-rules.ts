/**
 * 预定义验证规则
 * 提供常用的验证规则集合
 */

import type { FormValidationRule, ValidationRule } from '../types'
import { ValidationUtils } from '../utils'

/**
 * 验证规则集合
 */
export class ValidationRules {
  /**
   * 必填验证
   */
  static required(message?: string): ValidationRule {
    return {
      code: 'REQUIRED',
      message: message || '此字段为必填项',
      validator: (value: any) => {
        if (value === null || value === undefined)
          return false
        if (typeof value === 'string')
          return value.trim().length > 0
        if (Array.isArray(value))
          return value.length > 0
        return true
      },
    }
  }

  /**
   * 字符串长度验证
   */
  static stringLength(min?: number, max?: number, message?: string): ValidationRule {
    return {
      code: 'LENGTH',
      message: message || `长度必须在 ${min || 0} 到 ${max || '∞'} 之间`,
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        const len = value.length
        if (min !== undefined && len < min)
          return false
        if (max !== undefined && len > max)
          return false
        return true
      },
    }
  }

  /**
   * 最小长度验证
   */
  static minLength(min: number, message?: string): ValidationRule {
    return {
      code: 'MIN_LENGTH',
      message: message || `最小长度为 ${min}`,
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return value.length >= min
      },
    }
  }

  /**
   * 最大长度验证
   */
  static maxLength(max: number, message?: string): ValidationRule {
    return {
      code: 'MAX_LENGTH',
      message: message || `最大长度为 ${max}`,
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return value.length <= max
      },
    }
  }

  /**
   * 数值范围验证
   */
  static range(min?: number, max?: number, message?: string): ValidationRule {
    return {
      code: 'RANGE',
      message: message || `数值必须在 ${min || '-∞'} 到 ${max || '∞'} 之间`,
      validator: (value: any) => {
        const num = Number(value)
        if (Number.isNaN(num))
          return false
        if (min !== undefined && num < min)
          return false
        if (max !== undefined && num > max)
          return false
        return true
      },
    }
  }

  /**
   * 最小值验证
   */
  static min(min: number, message?: string): ValidationRule {
    return {
      code: 'MIN',
      message: message || `最小值为 ${min}`,
      validator: (value: any) => {
        const num = Number(value)
        return !Number.isNaN(num) && num >= min
      },
    }
  }

  /**
   * 最大值验证
   */
  static max(max: number, message?: string): ValidationRule {
    return {
      code: 'MAX',
      message: message || `最大值为 ${max}`,
      validator: (value: any) => {
        const num = Number(value)
        return !Number.isNaN(num) && num <= max
      },
    }
  }

  /**
   * 正则表达式验证
   */
  static pattern(regex: RegExp, message?: string): ValidationRule {
    return {
      code: 'PATTERN',
      message: message || '格式不正确',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return regex.test(value)
      },
    }
  }

  /**
   * 邮箱验证
   */
  static email(message?: string): ValidationRule {
    return {
      code: 'EMAIL',
      message: message || '请输入有效的邮箱地址',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return ValidationUtils.isEmail(value)
      },
    }
  }

  /**
   * URL验证
   */
  static url(message?: string): ValidationRule {
    return {
      code: 'URL',
      message: message || '请输入有效的URL',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return ValidationUtils.isUrl(value)
      },
    }
  }

  /**
   * 手机号验证
   */
  static phone(message?: string): ValidationRule {
    return {
      code: 'PHONE',
      message: message || '请输入有效的手机号',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return ValidationUtils.isChinesePhone(value)
      },
    }
  }

  /**
   * 身份证号验证
   */
  static idCard(message?: string): ValidationRule {
    return {
      code: 'ID_CARD',
      message: message || '请输入有效的身份证号',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return ValidationUtils.isChineseIdCard(value)
      },
    }
  }

  /**
   * 数字验证
   */
  static numeric(message?: string): ValidationRule {
    return {
      code: 'NUMERIC',
      message: message || '请输入数字',
      validator: (value: any) => {
        return !Number.isNaN(Number(value))
      },
    }
  }

  /**
   * 整数验证
   */
  static integer(message?: string): ValidationRule {
    return {
      code: 'INTEGER',
      message: message || '请输入整数',
      validator: (value: any) => {
        const num = Number(value)
        return !Number.isNaN(num) && Number.isInteger(num)
      },
    }
  }

  /**
   * 字母验证
   */
  static alpha(message?: string): ValidationRule {
    return {
      code: 'ALPHA',
      message: message || '只能包含字母',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return /^[a-z]+$/i.test(value)
      },
    }
  }

  /**
   * 字母数字验证
   */
  static alphaNumeric(message?: string): ValidationRule {
    return {
      code: 'ALPHA_NUMERIC',
      message: message || '只能包含字母和数字',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return /^[a-z0-9]+$/i.test(value)
      },
    }
  }

  /**
   * 日期验证
   */
  static date(message?: string): ValidationRule {
    return {
      code: 'DATE',
      message: message || '请输入有效的日期',
      validator: (value: any) => {
        if (!value)
          return false
        const date = new Date(value)
        return !Number.isNaN(date.getTime())
      },
    }
  }

  /**
   * 时间验证
   */
  static time(message?: string): ValidationRule {
    return {
      code: 'TIME',
      message: message || '请输入有效的时间格式 (HH:MM)',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return /^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(value)
      },
    }
  }

  /**
   * 日期时间验证
   */
  static dateTime(message?: string): ValidationRule {
    return {
      code: 'DATETIME',
      message: message || '请输入有效的日期时间',
      validator: (value: any) => {
        if (!value)
          return false
        const date = new Date(value)
        return !Number.isNaN(date.getTime())
      },
    }
  }

  /**
   * 枚举值验证
   */
  static oneOf(values: any[], message?: string): ValidationRule {
    return {
      code: 'ONE_OF',
      message: message || `值必须是以下之一: ${values.join(', ')}`,
      validator: (value: any) => {
        return values.includes(value)
      },
    }
  }

  /**
   * 数组验证
   */
  static array(message?: string): ValidationRule {
    return {
      code: 'ARRAY',
      message: message || '必须是数组',
      validator: (value: any) => {
        return Array.isArray(value)
      },
    }
  }

  /**
   * 对象验证
   */
  static object(message?: string): ValidationRule {
    return {
      code: 'OBJECT',
      message: message || '必须是对象',
      validator: (value: any) => {
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      },
    }
  }

  /**
   * 布尔值验证
   */
  static boolean(message?: string): ValidationRule {
    return {
      code: 'BOOLEAN',
      message: message || '必须是布尔值',
      validator: (value: any) => {
        return typeof value === 'boolean'
      },
    }
  }

  /**
   * 自定义验证
   */
  static custom(
    validator: (value: any, data?: any, context?: any) => boolean | Promise<boolean>,
    message?: string,
    code?: string,
  ): ValidationRule {
    return {
      code: code || 'CUSTOM',
      message: message || '验证失败',
      validator,
    }
  }

  /**
   * 条件验证
   */
  static when(
    condition: (value: any, data?: any, context?: any) => boolean,
    rule: ValidationRule,
  ): ValidationRule {
    return {
      ...rule,
      condition,
    }
  }

  /**
   * 密码强度验证
   */
  static password(
    options: {
      minLength?: number
      requireUppercase?: boolean
      requireLowercase?: boolean
      requireNumbers?: boolean
      requireSpecialChars?: boolean
      message?: string
    } = {},
  ): ValidationRule {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
      message = '密码强度不够',
    } = options

    return {
      code: 'PASSWORD',
      message,
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false

        if (value.length < minLength)
          return false
        if (requireUppercase && !/[A-Z]/.test(value))
          return false
        if (requireLowercase && !/[a-z]/.test(value))
          return false
        if (requireNumbers && !/\d/.test(value))
          return false
        if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value))
          return false

        return true
      },
    }
  }

  /**
   * 确认密码验证
   */
  static confirmPassword(passwordField: string, message?: string): FormValidationRule {
    return {
      code: 'CONFIRM_PASSWORD',
      message: message || '两次输入的密码不一致',
      fields: [passwordField],
      validator: (value: any, formData: any) => {
        return value === formData[passwordField]
      },
    }
  }

  /**
   * 文件类型验证
   */
  static fileType(allowedTypes: string[], message?: string): ValidationRule {
    return {
      code: 'FILE_TYPE',
      message: message || `只允许以下文件类型: ${allowedTypes.join(', ')}`,
      validator: (value: any) => {
        if (!value || !value.name)
          return false
        const extension = value.name.split('.').pop()?.toLowerCase()
        return allowedTypes.includes(extension || '')
      },
    }
  }

  /**
   * 文件大小验证
   */
  static fileSize(maxSize: number, message?: string): ValidationRule {
    return {
      code: 'FILE_SIZE',
      message: message || `文件大小不能超过 ${maxSize} 字节`,
      validator: (value: any) => {
        if (!value || !value.size)
          return false
        return value.size <= maxSize
      },
    }
  }

  /**
   * 信用卡号验证
   */
  static creditCard(message?: string): ValidationRule {
    return {
      code: 'CREDIT_CARD',
      message: message || '请输入有效的信用卡号',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return ValidationUtils.isCreditCard(value)
      },
    }
  }

  /**
   * IP地址验证
   */
  static ip(version?: 'v4' | 'v6', message?: string): ValidationRule {
    return {
      code: 'IP',
      message: message || '请输入有效的IP地址',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        if (version === 'v4')
          return ValidationUtils.isIPv4(value)
        if (version === 'v6')
          return ValidationUtils.isIPv6(value)
        return ValidationUtils.isIPv4(value) || ValidationUtils.isIPv6(value)
      },
    }
  }

  /**
   * MAC地址验证
   */
  static mac(message?: string): ValidationRule {
    return {
      code: 'MAC',
      message: message || '请输入有效的MAC地址',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return /^(?:[0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/i.test(value)
      },
    }
  }

  /**
   * UUID验证
   */
  static uuid(version?: number, message?: string): ValidationRule {
    return {
      code: 'UUID',
      message: message || '请输入有效的UUID',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        const patterns = {
          1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          2: /^[0-9a-f]{8}-[0-9a-f]{4}-2[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        }

        if (version && patterns[version as keyof typeof patterns]) {
          return patterns[version as keyof typeof patterns].test(value)
        }

        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value,
        )
      },
    }
  }

  /**
   * 颜色值验证（十六进制）
   */
  static color(message?: string): ValidationRule {
    return {
      code: 'COLOR',
      message: message || '请输入有效的颜色值',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        return /^#(?:[A-F0-9]{6}|[A-F0-9]{3})$/i.test(value)
      },
    }
  }

  /**
   * Base64验证
   */
  static base64(message?: string): ValidationRule {
    return {
      code: 'BASE64',
      message: message || '请输入有效的Base64编码',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        try {
          return btoa(atob(value)) === value
        }
        catch {
          return false
        }
      },
    }
  }

  /**
   * JSON验证
   */
  static json(message?: string): ValidationRule {
    return {
      code: 'JSON',
      message: message || '请输入有效的JSON格式',
      validator: (value: any) => {
        if (typeof value !== 'string')
          return false
        try {
          JSON.parse(value)
          return true
        }
        catch {
          return false
        }
      },
    }
  }

  /**
   * 组合多个验证规则
   */
  static combine(...rules: ValidationRule[]): ValidationRule {
    return {
      code: 'COMBINED',
      message: '验证失败',
      validator: async (value: any, data?: any, context?: any) => {
        for (const rule of rules) {
          const result = await rule.validator(value, data, context)
          if (!result)
            return false
        }
        return true
      },
    }
  }

  /**
   * 任一规则通过即可
   */
  static anyOf(...rules: ValidationRule[]): ValidationRule {
    return {
      code: 'ANY_OF',
      message: '至少需要满足一个验证条件',
      validator: async (value: any, data?: any, context?: any) => {
        for (const rule of rules) {
          const result = await rule.validator(value, data, context)
          if (result)
            return true
        }
        return false
      },
    }
  }
}
