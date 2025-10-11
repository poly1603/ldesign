/**
 * 安全增强工具模块
 * 
 * 提供输入验证、路径检查、XSS 防护等安全功能
 */

import { SecurityError, ErrorCode } from './errors'

/**
 * 路径验证选项
 */
export interface PathValidationOptions {
  /** 允许的路径前缀 */
  allowedPrefixes?: string[]
  /** 禁止的路径模式 */
  deniedPatterns?: RegExp[]
  /** 是否允许父级路径引用 (..) */
  allowParentReference?: boolean
  /** 是否允许绝对路径 */
  allowAbsolutePath?: boolean
  /** 最大路径长度 */
  maxLength?: number
}

/**
 * 输入验证选项
 */
export interface InputValidationOptions {
  /** 最大长度 */
  maxLength?: number
  /** 最小长度 */
  minLength?: number
  /** 允许的字符模式 */
  allowedPattern?: RegExp
  /** 禁止的字符模式 */
  deniedPattern?: RegExp
  /** 是否允许特殊字符 */
  allowSpecialChars?: boolean
}

/**
 * CSP (Content Security Policy) 配置
 */
export interface CSPConfig {
  /** 默认来源 */
  'default-src'?: string[]
  /** 脚本来源 */
  'script-src'?: string[]
  /** 样式来源 */
  'style-src'?: string[]
  /** 图片来源 */
  'img-src'?: string[]
  /** 字体来源 */
  'font-src'?: string[]
  /** 连接来源 */
  'connect-src'?: string[]
  /** 框架来源 */
  'frame-src'?: string[]
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 路径安全验证器
 */
export class PathValidator {
  private options: Required<PathValidationOptions>

  constructor(options: PathValidationOptions = {}) {
    this.options = {
      allowedPrefixes: options.allowedPrefixes || [],
      deniedPatterns: options.deniedPatterns || [
        /\.\./g, // 父级路径引用
        /[<>"|?*]/g, // 危险字符
        /^\/\//g, // 协议相对路径
        /^https?:\/\//gi, // 绝对 URL
      ],
      allowParentReference: options.allowParentReference ?? false,
      allowAbsolutePath: options.allowAbsolutePath ?? false,
      maxLength: options.maxLength || 255,
    }

    // 如果不允许父级引用，添加到禁止模式
    if (!this.options.allowParentReference) {
      this.options.deniedPatterns.push(/\.\./g)
    }
  }

  /**
   * 验证路径安全性
   */
  validate(path: string): { valid: boolean; error?: string } {
    // 检查路径长度
    if (path.length > this.options.maxLength) {
      return {
        valid: false,
        error: `Path length exceeds maximum (${this.options.maxLength})`,
      }
    }

    // 检查禁止的模式
    for (const pattern of this.options.deniedPatterns) {
      if (pattern.test(path)) {
        return {
          valid: false,
          error: `Path contains forbidden pattern: ${pattern}`,
        }
      }
    }

    // 检查绝对路径
    if (!this.options.allowAbsolutePath && /^\//.test(path)) {
      return {
        valid: false,
        error: 'Absolute paths are not allowed',
      }
    }

    // 检查允许的前缀
    if (this.options.allowedPrefixes.length > 0) {
      const hasAllowedPrefix = this.options.allowedPrefixes.some((prefix) =>
        path.startsWith(prefix)
      )
      if (!hasAllowedPrefix) {
        return {
          valid: false,
          error: 'Path does not start with an allowed prefix',
        }
      }
    }

    return { valid: true }
  }

  /**
   * 安全的路径验证（抛出异常）
   */
  validateOrThrow(path: string): void {
    const result = this.validate(path)
    if (!result.valid) {
      throw new SecurityError(
        `Invalid path: ${result.error}`,
        ErrorCode.INVALID_PATH
      )
    }
  }

  /**
   * 规范化路径
   */
  normalize(path: string): string {
    // 移除多余的斜杠
    let normalized = path.replace(/\/+/g, '/')

    // 移除末尾斜杠
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1)
    }

    // 解析相对路径
    const parts = normalized.split('/').filter(Boolean)
    const stack: string[] = []

    for (const part of parts) {
      if (part === '..') {
        if (this.options.allowParentReference && stack.length > 0) {
          stack.pop()
        } else if (!this.options.allowParentReference) {
          throw new SecurityError(
            'Parent path reference is not allowed',
            ErrorCode.INVALID_PATH
          )
        }
      } else if (part !== '.') {
        stack.push(part)
      }
    }

    return stack.join('/')
  }
}

/**
 * 输入验证器
 */
export class InputValidator {
  private options: Required<InputValidationOptions>

  constructor(options: InputValidationOptions = {}) {
    this.options = {
      maxLength: options.maxLength || 1000,
      minLength: options.minLength || 0,
      allowedPattern: options.allowedPattern || /.*/,
      deniedPattern: options.deniedPattern || /<script|javascript:|on\w+=/gi,
      allowSpecialChars: options.allowSpecialChars ?? true,
    }
  }

  /**
   * 验证输入
   */
  validate(input: string): { valid: boolean; error?: string } {
    // 检查长度
    if (input.length < this.options.minLength) {
      return {
        valid: false,
        error: `Input too short (minimum: ${this.options.minLength})`,
      }
    }

    if (input.length > this.options.maxLength) {
      return {
        valid: false,
        error: `Input too long (maximum: ${this.options.maxLength})`,
      }
    }

    // 检查禁止的模式
    if (this.options.deniedPattern.test(input)) {
      return {
        valid: false,
        error: 'Input contains forbidden patterns',
      }
    }

    // 检查允许的模式
    if (!this.options.allowedPattern.test(input)) {
      return {
        valid: false,
        error: 'Input does not match allowed pattern',
      }
    }

    // 检查特殊字符
    if (!this.options.allowSpecialChars && /[<>'"&]/.test(input)) {
      return {
        valid: false,
        error: 'Special characters are not allowed',
      }
    }

    return { valid: true }
  }

  /**
   * 安全的输入验证（抛出异常）
   */
  validateOrThrow(input: string): void {
    const result = this.validate(input)
    if (!result.valid) {
      throw new SecurityError(
        `Invalid input: ${result.error}`,
        ErrorCode.SECURITY_VIOLATION
      )
    }
  }

  /**
   * 清理输入
   */
  sanitize(input: string): string {
    // 移除 HTML 标签
    let sanitized = input.replace(/<[^>]*>/g, '')

    // 转义特殊字符
    sanitized = this.escapeHtml(sanitized)

    // 限制长度
    if (sanitized.length > this.options.maxLength) {
      sanitized = sanitized.substring(0, this.options.maxLength)
    }

    return sanitized
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    }

    return text.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char)
  }
}

/**
 * XSS 防护工具
 */
export class XSSProtector {
  /**
   * 检测潜在的 XSS 攻击
   */
  static detect(input: string): boolean {
    const xssPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
    ]

    return xssPatterns.some((pattern) => pattern.test(input))
  }

  /**
   * 清理潜在的 XSS 代码
   */
  static sanitize(input: string): string {
    // 移除 script 标签
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // 移除事件处理器
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')

    // 移除 javascript: 协议
    sanitized = sanitized.replace(/javascript:/gi, '')

    // 移除 data: 协议（可能包含 base64 编码的脚本）
    sanitized = sanitized.replace(/data:text\/html/gi, '')

    // 转义特殊字符
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')

    return sanitized
  }

  /**
   * 验证并清理
   */
  static validateAndSanitize(input: string): string {
    if (this.detect(input)) {
      console.warn('[Security] Potential XSS detected, sanitizing input')
      return this.sanitize(input)
    }
    return input
  }
}

/**
 * CSP 管理器
 */
export class CSPManager {
  private config: CSPConfig

  constructor(config: CSPConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      'default-src': config['default-src'] || ["'self'"],
      'script-src': config['script-src'] || ["'self'", "'unsafe-inline'"],
      'style-src': config['style-src'] || ["'self'", "'unsafe-inline'"],
      'img-src': config['img-src'] || ["'self'", 'data:', 'https:'],
      'font-src': config['font-src'] || ["'self'", 'data:'],
      'connect-src': config['connect-src'] || ["'self'"],
      'frame-src': config['frame-src'] || ["'none'"],
    }
  }

  /**
   * 生成 CSP 头部字符串
   */
  generate(): string {
    if (!this.config.enabled) {
      return ''
    }

    const directives: string[] = []

    for (const [key, values] of Object.entries(this.config)) {
      if (key !== 'enabled' && Array.isArray(values) && values.length > 0) {
        directives.push(`${key} ${values.join(' ')}`)
      }
    }

    return directives.join('; ')
  }

  /**
   * 应用 CSP（通过 meta 标签）
   */
  apply(): void {
    if (typeof document === 'undefined' || !this.config.enabled) {
      return
    }

    const cspString = this.generate()
    if (!cspString) return

    // 检查是否已存在 CSP meta 标签
    let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]')

    if (metaTag) {
      metaTag.setAttribute('content', cspString)
    } else {
      metaTag = document.createElement('meta')
      metaTag.setAttribute('http-equiv', 'Content-Security-Policy')
      metaTag.setAttribute('content', cspString)
      document.head.appendChild(metaTag)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CSPConfig>): void {
    this.config = { ...this.config, ...config }
    this.apply()
  }
}

/**
 * 数据加密/解密工具（简化版）
 */
export class DataEncryptor {
  private key: string

  constructor(key?: string) {
    this.key = key || this.generateKey()
  }

  /**
   * 生成密钥
   */
  private generateKey(): string {
    return btoa(Math.random().toString(36).substring(2, 15))
  }

  /**
   * 简单的 XOR 加密（仅用于示例，生产环境应使用 Web Crypto API）
   */
  encrypt(data: string): string {
    const keyBytes = this.stringToBytes(this.key)
    const dataBytes = this.stringToBytes(data)
    const encrypted: number[] = []

    for (let i = 0; i < dataBytes.length; i++) {
      encrypted.push(dataBytes[i] ^ keyBytes[i % keyBytes.length])
    }

    return btoa(String.fromCharCode(...encrypted))
  }

  /**
   * 解密
   */
  decrypt(encryptedData: string): string {
    try {
      const encrypted = atob(encryptedData)
      const keyBytes = this.stringToBytes(this.key)
      const encryptedBytes = this.stringToBytes(encrypted)
      const decrypted: number[] = []

      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted.push(encryptedBytes[i] ^ keyBytes[i % keyBytes.length])
      }

      return String.fromCharCode(...decrypted)
    } catch (error) {
      throw new SecurityError(
        'Failed to decrypt data',
        ErrorCode.SECURITY_VIOLATION
      )
    }
  }

  /**
   * 字符串转字节数组
   */
  private stringToBytes(str: string): number[] {
    const bytes: number[] = []
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i))
    }
    return bytes
  }
}

/**
 * 全局安全管理器
 */
export class SecurityManager {
  private pathValidator: PathValidator
  private inputValidator: InputValidator
  private cspManager: CSPManager
  private encryptor: DataEncryptor

  constructor(options: {
    pathValidation?: PathValidationOptions
    inputValidation?: InputValidationOptions
    csp?: CSPConfig
    encryptionKey?: string
  } = {}) {
    this.pathValidator = new PathValidator(options.pathValidation)
    this.inputValidator = new InputValidator(options.inputValidation)
    this.cspManager = new CSPManager(options.csp)
    this.encryptor = new DataEncryptor(options.encryptionKey)
  }

  /**
   * 验证模板路径
   */
  validateTemplatePath(path: string): boolean {
    const result = this.pathValidator.validate(path)
    if (!result.valid) {
      console.error(`[Security] Invalid template path: ${result.error}`)
      return false
    }
    return true
  }

  /**
   * 验证输入数据
   */
  validateInput(input: string): boolean {
    const result = this.inputValidator.validate(input)
    if (!result.valid) {
      console.error(`[Security] Invalid input: ${result.error}`)
      return false
    }
    return true
  }

  /**
   * 清理用户输入
   */
  sanitizeInput(input: string): string {
    // 检测 XSS
    if (XSSProtector.detect(input)) {
      return XSSProtector.sanitize(input)
    }
    return this.inputValidator.sanitize(input)
  }

  /**
   * 应用 CSP
   */
  applyCSP(): void {
    this.cspManager.apply()
  }

  /**
   * 加密敏感数据
   */
  encryptData(data: string): string {
    return this.encryptor.encrypt(data)
  }

  /**
   * 解密数据
   */
  decryptData(encryptedData: string): string {
    return this.encryptor.decrypt(encryptedData)
  }

  /**
   * 安全评分
   */
  getSecurityScore(): {
    score: number
    details: Record<string, boolean>
  } {
    const checks = {
      cspEnabled: this.cspManager['config'].enabled ?? false,
      pathValidationEnabled: true,
      inputValidationEnabled: true,
      xssProtectionEnabled: true,
      encryptionEnabled: true,
    }

    const score = Object.values(checks).filter(Boolean).length * 20

    return {
      score,
      details: checks,
    }
  }
}

/**
 * 全局安全管理器实例
 */
export const globalSecurityManager = new SecurityManager({
  pathValidation: {
    allowedPrefixes: ['src/templates/', 'templates/'],
    allowParentReference: false,
    allowAbsolutePath: false,
    maxLength: 255,
  },
  inputValidation: {
    maxLength: 10000,
    allowSpecialChars: false,
  },
  csp: {
    enabled: true,
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
  },
})

/**
 * 便捷函数
 */

/**
 * 验证模板路径
 */
export function validateTemplatePath(path: string): boolean {
  return globalSecurityManager.validateTemplatePath(path)
}

/**
 * 清理输入
 */
export function sanitizeInput(input: string): string {
  return globalSecurityManager.sanitizeInput(input)
}

/**
 * 检测 XSS
 */
export function detectXSS(input: string): boolean {
  return XSSProtector.detect(input)
}

/**
 * 应用 CSP
 */
export function applyCSP(): void {
  globalSecurityManager.applyCSP()
}

/**
 * 安全的模板加载包装器
 */
export function secureTemplateLoader<T>(
  loader: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // 可以在这里添加额外的安全检查
      const result = await loader()
      resolve(result)
    } catch (error) {
      reject(
        new SecurityError(
          'Template loading failed security check',
          ErrorCode.SECURITY_VIOLATION
        )
      )
    }
  })
}
