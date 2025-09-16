/**
 * 安全工具模块
 * 提供XSS防护、内容净化、CSP支持和速率限制等安全功能
 */

import type { CalendarEvent } from '../types'

/**
 * HTML净化器
 * 用于清理用户输入的HTML内容，防止XSS攻击
 */
export class HTMLSanitizer {
  // 允许的HTML标签白名单
  private static allowedTags = [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 
    'span', 'div', 'ul', 'ol', 'li', 'h1', 'h2', 
    'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
  ]
  
  // 允许的属性白名单
  private static allowedAttributes: Record<string, string[]> = {
    'a': ['href', 'title', 'target'],
    'span': ['class'],
    'div': ['class'],
    'p': ['class'],
    'code': ['class']
  }
  
  // 危险的协议列表（需要过滤）
  private static dangerousProtocols = [
    'javascript:', 'data:', 'vbscript:', 'file:', 'about:'
  ]
  
  /**
   * 净化HTML字符串
   */
  static sanitize(html: string): string {
    if (!html) return ''
    
    // 创建临时DOM元素
    const temp = document.createElement('div')
    temp.innerHTML = html
    
    // 递归净化所有节点
    this.sanitizeNode(temp)
    
    return temp.innerHTML
  }
  
  /**
   * 递归净化DOM节点
   */
  private static sanitizeNode(node: Node): void {
    // 处理所有子节点
    const children = Array.from(node.childNodes)
    
    children.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element
        const tagName = element.tagName.toLowerCase()
        
        // 检查是否是允许的标签
        if (!this.allowedTags.includes(tagName)) {
          // 保留文本内容但移除标签
          const text = document.createTextNode(element.textContent || '')
          node.replaceChild(text, element)
        } else {
          // 净化属性
          this.sanitizeAttributes(element, tagName)
          // 递归处理子节点
          this.sanitizeNode(element)
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        // 文本节点不需要特殊处理
      } else {
        // 移除其他类型的节点（如注释、CDATA等）
        node.removeChild(child)
      }
    })
  }
  
  /**
   * 净化元素属性
   */
  private static sanitizeAttributes(element: Element, tagName: string): void {
    const allowedAttrs = this.allowedAttributes[tagName] || []
    const attributes = Array.from(element.attributes)
    
    attributes.forEach(attr => {
      const attrName = attr.name.toLowerCase()
      
      // 检查是否是允许的属性
      if (!allowedAttrs.includes(attrName)) {
        element.removeAttribute(attr.name)
      } else {
        // 检查属性值是否包含危险内容
        const value = attr.value.toLowerCase()
        
        // 检查危险协议
        if (attrName === 'href' || attrName === 'src') {
          for (const protocol of this.dangerousProtocols) {
            if (value.startsWith(protocol)) {
              element.removeAttribute(attr.name)
              break
            }
          }
        }
        
        // 检查事件处理器
        if (attrName.startsWith('on')) {
          element.removeAttribute(attr.name)
        }
        
        // 检查style属性中的危险内容
        if (attrName === 'style' && value.includes('javascript')) {
          element.removeAttribute(attr.name)
        }
      }
    })
  }
  
  /**
   * 转义HTML特殊字符
   */
  static escapeHTML(str: string): string {
    if (!str) return ''
    
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    }
    
    return str.replace(/[&<>"'/]/g, char => escapeMap[char])
  }
  
  /**
   * 净化事件对象
   */
  static sanitizeEvent(event: Partial<CalendarEvent>): Partial<CalendarEvent> {
    const sanitized = { ...event }
    
    // 净化文本字段
    if (sanitized.title) {
      sanitized.title = this.escapeHTML(sanitized.title)
    }
    
    if (sanitized.description) {
      sanitized.description = this.sanitize(sanitized.description)
    }
    
    if (sanitized.location) {
      sanitized.location = this.escapeHTML(sanitized.location)
    }
    
    if (sanitized.category) {
      sanitized.category = this.escapeHTML(sanitized.category)
    }
    
    // 净化自定义属性
    if (sanitized.customData) {
      sanitized.customData = this.sanitizeObject(sanitized.customData)
    }
    
    return sanitized
  }
  
  /**
   * 递归净化对象
   */
  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.escapeHTML(obj)
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {}
      for (const key in obj) {
        // 净化键名
        const safeKey = this.escapeHTML(key)
        // 递归净化值
        sanitized[safeKey] = this.sanitizeObject(obj[key])
      }
      return sanitized
    }
    
    return obj
  }
}

/**
 * 内容安全策略(CSP)管理器
 */
export class CSPManager {
  private static directives: Map<string, string[]> = new Map()
  
  /**
   * 初始化默认CSP策略
   */
  static initializeDefaultPolicy(): void {
    this.directives.set('default-src', ["'self'"])
    this.directives.set('script-src', ["'self'", "'unsafe-inline'"])
    this.directives.set('style-src', ["'self'", "'unsafe-inline'"])
    this.directives.set('img-src', ["'self'", 'data:', 'https:'])
    this.directives.set('font-src', ["'self'", 'data:'])
    this.directives.set('connect-src', ["'self'"])
    this.directives.set('frame-ancestors', ["'none'"])
    this.directives.set('base-uri', ["'self'"])
    this.directives.set('form-action', ["'self'"])
  }
  
  /**
   * 添加CSP指令
   */
  static addDirective(directive: string, sources: string[]): void {
    const existing = this.directives.get(directive) || []
    this.directives.set(directive, [...new Set([...existing, ...sources])])
  }
  
  /**
   * 移除CSP指令
   */
  static removeDirective(directive: string): void {
    this.directives.delete(directive)
  }
  
  /**
   * 生成CSP头字符串
   */
  static generateCSPHeader(): string {
    const policies: string[] = []
    
    this.directives.forEach((sources, directive) => {
      policies.push(`${directive} ${sources.join(' ')}`)
    })
    
    return policies.join('; ')
  }
  
  /**
   * 应用CSP到meta标签
   */
  static applyToMeta(): void {
    // 移除旧的CSP meta标签
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (existingMeta) {
      existingMeta.remove()
    }
    
    // 创建新的CSP meta标签
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = this.generateCSPHeader()
    document.head.appendChild(meta)
  }
  
  /**
   * 生成nonce值用于内联脚本
   */
  static generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
  }
  
  /**
   * 报告CSP违规
   */
  static reportViolation(violation: SecurityPolicyViolationEvent): void {
    const report = {
      documentURI: violation.documentURI,
      violatedDirective: violation.violatedDirective,
      blockedURI: violation.blockedURI,
      lineNumber: violation.lineNumber,
      columnNumber: violation.columnNumber,
      sourceFile: violation.sourceFile,
      timestamp: new Date().toISOString()
    }
    
    // 在生产环境中，这里应该发送到服务器
    console.warn('CSP Violation:', report)
  }
}

/**
 * 速率限制器
 * 用于限制API调用频率，防止滥用
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number
  
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }
  
  /**
   * 检查是否允许请求
   */
  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // 清理过期的请求记录
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    // 检查是否超过限制
    if (validRequests.length >= this.maxRequests) {
      this.requests.set(key, validRequests)
      return false
    }
    
    // 记录新请求
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }
  
  /**
   * 获取剩余请求次数
   */
  getRemainingRequests(key: string): number {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
  
  /**
   * 获取重置时间（毫秒）
   */
  getResetTime(key: string): number {
    const requests = this.requests.get(key) || []
    
    if (requests.length === 0) {
      return 0
    }
    
    const oldestRequest = Math.min(...requests)
    const resetTime = oldestRequest + this.windowMs - Date.now()
    
    return Math.max(0, resetTime)
  }
  
  /**
   * 重置特定键的限制
   */
  reset(key: string): void {
    this.requests.delete(key)
  }
  
  /**
   * 清空所有记录
   */
  clear(): void {
    this.requests.clear()
  }
}

/**
 * 输入验证器
 * 提供各种输入验证功能
 */
export class InputValidator {
  /**
   * 验证日期范围
   */
  static validateDateRange(start: Date, end?: Date): boolean {
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      return false
    }
    
    if (end) {
      if (!(end instanceof Date) || isNaN(end.getTime())) {
        return false
      }
      
      if (end < start) {
        return false
      }
    }
    
    // 检查日期是否在合理范围内（例如：1900-2100）
    const minDate = new Date('1900-01-01')
    const maxDate = new Date('2100-12-31')
    
    if (start < minDate || start > maxDate) {
      return false
    }
    
    if (end && (end < minDate || end > maxDate)) {
      return false
    }
    
    return true
  }
  
  /**
   * 验证事件标题
   */
  static validateEventTitle(title: string): boolean {
    if (!title || typeof title !== 'string') {
      return false
    }
    
    // 检查长度（1-200字符）
    if (title.length < 1 || title.length > 200) {
      return false
    }
    
    // 检查是否只包含空白字符
    if (title.trim().length === 0) {
      return false
    }
    
    return true
  }
  
  /**
   * 验证颜色值
   */
  static validateColor(color: string): boolean {
    if (!color || typeof color !== 'string') {
      return false
    }
    
    // 验证HEX颜色
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    
    // 验证RGB/RGBA颜色
    const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/
    
    // 验证HSL/HSLA颜色
    const hslPattern = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/
    
    // 验证颜色名称
    const colorNames = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 
      'pink', 'brown', 'black', 'white', 'gray', 'grey'
    ]
    
    return hexPattern.test(color) || 
           rgbPattern.test(color) || 
           hslPattern.test(color) || 
           colorNames.includes(color.toLowerCase())
  }
  
  /**
   * 验证邮箱地址
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }
  
  /**
   * 验证URL
   */
  static validateURL(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false
    }
    
    try {
      const urlObj = new URL(url)
      // 只允许http和https协议
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }
  
  /**
   * 验证JSON字符串
   */
  static validateJSON(jsonString: string): boolean {
    if (!jsonString || typeof jsonString !== 'string') {
      return false
    }
    
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }
  
  /**
   * 验证文件类型
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    if (!file || !(file instanceof File)) {
      return false
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type.toLowerCase()
    
    // 检查文件扩展名
    if (fileExtension && !allowedTypes.includes(`.${fileExtension}`)) {
      return false
    }
    
    // 检查MIME类型
    const allowedMimeTypes = allowedTypes.map(type => {
      const mimeMap: Record<string, string> = {
        '.json': 'application/json',
        '.csv': 'text/csv',
        '.ics': 'text/calendar',
        '.xml': 'application/xml'
      }
      return mimeMap[type] || ''
    }).filter(Boolean)
    
    if (!allowedMimeTypes.includes(mimeType)) {
      return false
    }
    
    return true
  }
  
  /**
   * 验证文件大小
   */
  static validateFileSize(file: File, maxSizeInMB: number): boolean {
    if (!file || !(file instanceof File)) {
      return false
    }
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }
}

/**
 * 安全的事件处理器包装器
 */
export class SecureEventHandler {
  private static rateLimiter = new RateLimiter(50, 1000) // 每秒最多50个事件
  
  /**
   * 包装事件处理器，添加安全检查
   */
  static wrap<T extends Event>(
    handler: (event: T) => void,
    options?: {
      preventDefault?: boolean
      stopPropagation?: boolean
      rateLimitKey?: string
      sanitizeTarget?: boolean
    }
  ): (event: T) => void {
    return (event: T) => {
      // 速率限制检查
      if (options?.rateLimitKey) {
        if (!this.rateLimiter.isAllowed(options.rateLimitKey)) {
          console.warn('Event rate limit exceeded')
          return
        }
      }
      
      // 阻止默认行为
      if (options?.preventDefault) {
        event.preventDefault()
      }
      
      // 停止事件传播
      if (options?.stopPropagation) {
        event.stopPropagation()
      }
      
      // 净化事件目标的值
      if (options?.sanitizeTarget && event.target) {
        const target = event.target as HTMLInputElement
        if (target.value) {
          target.value = HTMLSanitizer.escapeHTML(target.value)
        }
      }
      
      // 在try-catch中执行处理器
      try {
        handler(event)
      } catch (error) {
        console.error('Error in event handler:', error)
        // 在生产环境中，这里应该发送错误报告
      }
    }
  }
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  enableXSSProtection: boolean
  enableCSP: boolean
  enableRateLimiting: boolean
  maxRequestsPerMinute: number
  allowedFileTypes: string[]
  maxFileSizeInMB: number
  sanitizeInput: boolean
  reportViolations: boolean
}

/**
 * 默认安全配置
 */
export const defaultSecurityConfig: SecurityConfig = {
  enableXSSProtection: true,
  enableCSP: true,
  enableRateLimiting: true,
  maxRequestsPerMinute: 100,
  allowedFileTypes: ['.json', '.csv', '.ics'],
  maxFileSizeInMB: 10,
  sanitizeInput: true,
  reportViolations: true
}

/**
 * 安全管理器
 * 统一管理所有安全功能
 */
export class SecurityManager {
  private config: SecurityConfig
  private rateLimiter: RateLimiter
  
  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultSecurityConfig, ...config }
    this.rateLimiter = new RateLimiter(this.config.maxRequestsPerMinute, 60000)
    
    if (this.config.enableCSP) {
      CSPManager.initializeDefaultPolicy()
      CSPManager.applyToMeta()
      
      // 监听CSP违规
      if (this.config.reportViolations) {
        document.addEventListener('securitypolicyviolation', (event) => {
          CSPManager.reportViolation(event)
        })
      }
    }
  }
  
  /**
   * 净化用户输入
   */
  sanitizeInput(input: string): string {
    if (!this.config.sanitizeInput) {
      return input
    }
    
    return HTMLSanitizer.escapeHTML(input)
  }
  
  /**
   * 净化HTML内容
   */
  sanitizeHTML(html: string): string {
    if (!this.config.enableXSSProtection) {
      return html
    }
    
    return HTMLSanitizer.sanitize(html)
  }
  
  /**
   * 净化事件对象
   */
  sanitizeEvent(event: Partial<CalendarEvent>): Partial<CalendarEvent> {
    if (!this.config.enableXSSProtection) {
      return event
    }
    
    return HTMLSanitizer.sanitizeEvent(event)
  }
  
  /**
   * 检查速率限制
   */
  checkRateLimit(key: string): boolean {
    if (!this.config.enableRateLimiting) {
      return true
    }
    
    return this.rateLimiter.isAllowed(key)
  }
  
  /**
   * 验证文件
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // 验证文件类型
    if (!InputValidator.validateFileType(file, this.config.allowedFileTypes)) {
      return { 
        valid: false, 
        error: `不支持的文件类型。允许的类型: ${this.config.allowedFileTypes.join(', ')}` 
      }
    }
    
    // 验证文件大小
    if (!InputValidator.validateFileSize(file, this.config.maxFileSizeInMB)) {
      return { 
        valid: false, 
        error: `文件太大。最大允许: ${this.config.maxFileSizeInMB}MB` 
      }
    }
    
    return { valid: true }
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (config.maxRequestsPerMinute) {
      this.rateLimiter = new RateLimiter(config.maxRequestsPerMinute, 60000)
    }
  }
  
  /**
   * 获取当前配置
   */
  getConfig(): Readonly<SecurityConfig> {
    return { ...this.config }
  }
}

export default {
  HTMLSanitizer,
  CSPManager,
  RateLimiter,
  InputValidator,
  SecureEventHandler,
  SecurityManager,
  defaultSecurityConfig
}