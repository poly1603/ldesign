/**
 * 工具函数模块
 */

// 类型定义
export interface FormatOptions {
  locale?: string
  currency?: string
  precision?: number
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// 字符串工具
export const stringUtils = {
  /**
   * 首字母大写
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  /**
   * 驼峰命名转换
   */
  camelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^[A-Z]/, char => char.toLowerCase())
  },

  /**
   * 短横线命名转换
   */
  kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  },

  /**
   * 截断字符串
   */
  truncate(str: string, length: number, suffix = '...'): string {
    if (str.length <= length) return str
    return str.slice(0, length - suffix.length) + suffix
  }
}

// 数字工具
export const numberUtils = {
  /**
   * 格式化数字
   */
  format(num: number, options: FormatOptions = {}): string {
    const { locale = 'zh-CN', precision = 2 } = options
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(num)
  },

  /**
   * 格式化货币
   */
  formatCurrency(num: number, options: FormatOptions = {}): string {
    const { locale = 'zh-CN', currency = 'CNY' } = options
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(num)
  },

  /**
   * 生成随机数
   */
  random(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min
  },

  /**
   * 生成随机整数
   */
  randomInt(min: number = 0, max: number = 100): number {
    return Math.floor(this.random(min, max + 1))
  }
}

// 日期工具
export const dateUtils = {
  /**
   * 格式化日期
   */
  format(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },

  /**
   * 相对时间
   */
  relative(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  },

  /**
   * 添加天数
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
}

// 验证工具
export const validationUtils = {
  /**
   * 验证邮箱
   */
  email(value: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value)
  },

  /**
   * 验证手机号
   */
  phone(value: string): boolean {
    const pattern = /^1[3-9]\d{9}$/
    return pattern.test(value)
  },

  /**
   * 验证身份证号
   */
  idCard(value: string): boolean {
    const pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    return pattern.test(value)
  },

  /**
   * 通用验证
   */
  validate(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = []

    for (const rule of rules) {
      if (rule.required && (!value || value === '')) {
        errors.push(rule.message || '此字段为必填项')
        continue
      }

      if (rule.min !== undefined && value.length < rule.min) {
        errors.push(rule.message || `最少需要${rule.min}个字符`)
      }

      if (rule.max !== undefined && value.length > rule.max) {
        errors.push(rule.message || `最多允许${rule.max}个字符`)
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || '格式不正确')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// 存储工具
export const storageUtils = {
  /**
   * 设置 localStorage
   */
  setLocal(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('localStorage 设置失败:', error)
    }
  },

  /**
   * 获取 localStorage
   */
  getLocal<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.warn('localStorage 读取失败:', error)
      return defaultValue || null
    }
  },

  /**
   * 删除 localStorage
   */
  removeLocal(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('localStorage 删除失败:', error)
    }
  },

  /**
   * 设置 sessionStorage
   */
  setSession(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('sessionStorage 设置失败:', error)
    }
  },

  /**
   * 获取 sessionStorage
   */
  getSession<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.warn('sessionStorage 读取失败:', error)
      return defaultValue || null
    }
  }
}
