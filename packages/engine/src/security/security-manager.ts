import type { Engine } from '../types'

// 安全策略配置
export interface SecurityConfig {
  xss?: {
    enabled?: boolean
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[]>
    stripIgnoreTag?: boolean
  }
  csrf?: {
    enabled?: boolean
    tokenName?: string
    headerName?: string
    cookieName?: string
    sameSite?: 'strict' | 'lax' | 'none'
  }
  csp?: {
    enabled?: boolean
    directives?: Record<string, string[]>
    reportOnly?: boolean
    reportUri?: string
  }
  clickjacking?: {
    enabled?: boolean
    policy?: 'deny' | 'sameorigin' | 'allow-from'
    allowFrom?: string
  }
  https?: {
    enabled?: boolean
    hsts?: {
      maxAge?: number
      includeSubDomains?: boolean
      preload?: boolean
    }
  }
}

// XSS防护结果
export interface XSSResult {
  safe: boolean
  sanitized: string
  threats: string[]
}

// CSRF令牌信息
export interface CSRFToken {
  token: string
  timestamp: number
  expires: number
}

// 安全事件类型
export enum SecurityEventType {
  XSS_DETECTED = 'xss_detected',
  CSRF_ATTACK = 'csrf_attack',
  CSP_VIOLATION = 'csp_violation',
  CLICKJACKING_ATTEMPT = 'clickjacking_attempt',
  INSECURE_REQUEST = 'insecure_request',
}

// 安全事件信息
export interface SecurityEvent {
  type: SecurityEventType
  message: string
  details: unknown
  timestamp: number
  userAgent?: string
  ip?: string
  url?: string
}

// 安全管理器接口
export interface SecurityManager {
  // XSS防护
  sanitizeHTML: (html: string) => XSSResult
  sanitize: (input: string) => string
  validateInput: (input: string, type?: 'html' | 'text' | 'url') => boolean

  // CSRF防护
  generateCSRFToken: () => CSRFToken
  validateCSRFToken: (token: string) => boolean
  getCSRFToken: () => string | null

  // CSP管理
  generateCSPHeader: () => string
  reportCSPViolation: (violation: unknown) => void

  // 安全头设置
  getSecurityHeaders: () => Record<string, string>

  // 事件处理
  onSecurityEvent: (callback: (event: SecurityEvent) => void) => void
  reportSecurityEvent: (event: SecurityEvent) => void

  // 配置管理
  updateConfig: (config: Partial<SecurityConfig>) => void
  getConfig: () => SecurityConfig
}

// XSS防护实现
class XSSProtector {
  private allowedTags: Set<string>
  private allowedAttributes: Map<string, Set<string>>
  private stripIgnoreTag: boolean

  constructor(config: SecurityConfig['xss'] = {}) {
    this.allowedTags = new Set(
      config.allowedTags || [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'i',
        'b',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
      ]
    )

    this.allowedAttributes = new Map()
    const attrs = config.allowedAttributes || {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      blockquote: ['cite'],
    }

    for (const [tag, attrList] of Object.entries(attrs)) {
      this.allowedAttributes.set(tag, new Set(attrList))
    }

    this.stripIgnoreTag = config.stripIgnoreTag ?? true
  }

  sanitize(html: string): XSSResult {
    const threats: string[] = []
    let sanitized = html

    // 检测和移除脚本标签
    const scriptRegex = /<script[^>]*>[\s\S]*?<\/script>/gi
    const scripts = html.match(scriptRegex)
    if (scripts) {
      threats.push('Script tags detected')
      sanitized = sanitized.replace(scriptRegex, '')
    }

    // 检测和移除事件处理器
    const eventRegex = /\s*on\w+\s*=\s*["'][^"']*["']/gi
    const events = html.match(eventRegex)
    if (events) {
      threats.push('Event handlers detected')
      sanitized = sanitized.replace(eventRegex, '')
    }

    // 检测和移除javascript:协议
    const jsProtocolRegex = /javascript\s*:/gi
    if (jsProtocolRegex.test(html)) {
      threats.push('JavaScript protocol detected')
      sanitized = sanitized.replace(jsProtocolRegex, '')
    }

    // 检测和移除data:协议（除了图片）
    const dataProtocolRegex = /data\s*:(?!image\/)\w+/giu
    if (dataProtocolRegex.test(html)) {
      threats.push('Suspicious data protocol detected')
      sanitized = sanitized.replace(dataProtocolRegex, '')
    }

    // 移除不允许的标签
    sanitized = this.filterTags(sanitized, threats)

    // 移除不允许的属性
    sanitized = this.filterAttributes(sanitized, threats)

    return {
      safe: threats.length === 0,
      sanitized,
      threats,
    }
  }

  private filterTags(html: string, threats: string[]): string {
    // 匹配完整的标签，包括自闭合标签和开闭标签对
    // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation
    const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/giu

    return html.replace(tagRegex, (match, tagName) => {
      const tag = tagName.toLowerCase()

      if (!this.allowedTags.has(tag)) {
        threats.push(`Disallowed tag: ${tag}`)
        return this.stripIgnoreTag
          ? ''
          : match.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }

      return match
    })
  }

  private filterAttributes(html: string, threats: string[]): string {
    // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation
    const tagRegex = /<([a-z][a-z0-9]*)[^>]*>/giu

    return html.replace(tagRegex, (match, tagName) => {
      const tag = tagName.toLowerCase()
      const allowedAttrs = this.allowedAttributes.get(tag) || new Set()

      // 提取属性部分 - 从标签名后开始到 '>' 之前
      const tagNameEndIndex = match.indexOf(tagName) + tagName.length
      const attributesStr = match.substring(tagNameEndIndex, match.length - 1)

      if (!attributesStr || !attributesStr.trim()) {
        return `<${tag}>`
      }

      const attrRegex = /\s+([a-z][a-z0-9-]*)\s*=\s*["']([^"']*)["']/giu
      let filteredAttributes = ''
      let attrExecMatch

      // eslint-disable-next-line no-cond-assign
      while ((attrExecMatch = attrRegex.exec(attributesStr)) !== null) {
        const [, attrName, attrValue] = attrExecMatch
        const attr = attrName.toLowerCase()

        if (allowedAttrs.has(attr)) {
          // 验证属性值
          if (this.isValidAttributeValue(attr, attrValue)) {
            filteredAttributes += ` ${attrName}="${attrValue}"`
          } else {
            threats.push(`Invalid attribute value: ${attr}="${attrValue}"`)
          }
        } else {
          threats.push(`Disallowed attribute: ${attr}`)
        }
      }

      return `<${tagName}${filteredAttributes}>`
    })
  }

  private isValidAttributeValue(_attr: string, value: string): boolean {
    // 检查常见的危险属性值
    const dangerousPatterns = [
      /javascript\s*:/i,
      /vbscript\s*:/i,
      /data\s*:(?!image\/)/i,
      /expression\s*\(/i,
    ]

    return !dangerousPatterns.some(pattern => pattern.test(value))
  }
}

// CSRF防护实现
class CSRFProtector {
  private tokens = new Map<string, CSRFToken>()

  constructor(_config: SecurityConfig['csrf'] = {}) {
    // 当前实现未使用CSRF配置，保留构造参数以兼容未来扩展
  }

  generateToken(): CSRFToken {
    const token = this.generateRandomToken()
    const now = Date.now()
    const expires = now + 24 * 60 * 60 * 1000 // 24小时

    const csrfToken: CSRFToken = {
      token,
      timestamp: now,
      expires,
    }

    this.tokens.set(token, csrfToken)

    // 清理过期令牌
    this.cleanupExpiredTokens()

    return csrfToken
  }

  validateToken(token: string): boolean {
    const csrfToken = this.tokens.get(token)

    if (!csrfToken) {
      return false
    }

    if (Date.now() > csrfToken.expires) {
      this.tokens.delete(token)
      return false
    }

    return true
  }

  private generateRandomToken(): string {
    const array = new Uint8Array(32)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array)
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [token, csrfToken] of this.tokens.entries()) {
      if (now > csrfToken.expires) {
        this.tokens.delete(token)
      }
    }
  }
}

// 安全管理器实现
export class SecurityManagerImpl implements SecurityManager {
  private config: Required<SecurityConfig>
  private xssProtector: XSSProtector
  private csrfProtector: CSRFProtector
  private eventCallbacks: ((event: SecurityEvent) => void)[] = []
  private engine?: Engine

  constructor(config: SecurityConfig = {}, engine?: Engine) {
    this.engine = engine
    this.config = {
      xss: {
        enabled: true,
        allowedTags: config.xss?.allowedTags || undefined, // 让 XSSProtector 使用默认值
        allowedAttributes: config.xss?.allowedAttributes || undefined, // 让 XSSProtector 使用默认值
        stripIgnoreTag: true,
        ...config.xss,
      },
      csrf: {
        enabled: true,
        tokenName: '_csrf_token',
        headerName: 'X-CSRF-Token',
        cookieName: 'csrf_token',
        sameSite: 'strict',
        ...config.csrf,
      },
      csp: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'font-src': ["'self'"],
          'connect-src': ["'self'"],
          'frame-ancestors': ["'none'"],
        },
        reportOnly: false,
        reportUri: '/csp-report',
        ...config.csp,
      },
      clickjacking: {
        enabled: true,
        policy: 'deny',
        ...config.clickjacking,
      },
      https: {
        enabled: true,
        hsts: {
          maxAge: 31536000, // 1年
          includeSubDomains: true,
          preload: false,
          ...config.https?.hsts,
        },
        ...config.https,
      },
    }

    this.xssProtector = new XSSProtector(this.config?.xss)
    this.csrfProtector = new CSRFProtector(this.config?.csrf)
  }

  sanitizeHTML(html: string): XSSResult {
    if (!this.config?.xss.enabled) {
      return {
        safe: true,
        sanitized: html,
        threats: [],
      }
    }

    const result = this.xssProtector.sanitize(html)

    if (!result.safe) {
      this.reportSecurityEvent({
        type: SecurityEventType.XSS_DETECTED,
        message: 'XSS attempt detected and blocked',
        details: {
          originalHTML: html,
          sanitizedHTML: result.sanitized,
          threats: result.threats,
        },
        timestamp: Date.now(),
      })
    }

    return result
  }

  sanitize(input: string): string {
    return this.sanitizeHTML(input).sanitized
  }

  validateInput(
    input: string,
    type: 'html' | 'text' | 'url' = 'text'
  ): boolean {
    switch (type) {
      case 'html':
        return this.sanitizeHTML(input).safe
      case 'url':
        try {
          // eslint-disable-next-line no-new
          new URL(input)
          return !input.toLowerCase().startsWith('javascript:')
        } catch {
          return false
        }
      case 'text':
      default:
        // 检查是否包含HTML标签或脚本
        return !/<[^>]*>/.test(input) && !/javascript\s*:/i.test(input)
    }
  }

  generateCSRFToken(): CSRFToken {
    if (!this.config?.csrf.enabled) {
      throw new Error('CSRF protection is disabled')
    }

    return this.csrfProtector.generateToken()
  }

  validateCSRFToken(token: string): boolean {
    if (!this.config?.csrf.enabled) {
      return true
    }

    const isValid = this.csrfProtector.validateToken(token)

    if (!isValid) {
      this.reportSecurityEvent({
        type: SecurityEventType.CSRF_ATTACK,
        message: 'Invalid CSRF token detected',
        details: { token },
        timestamp: Date.now(),
      })
    }

    return isValid
  }

  getCSRFToken(): string | null {
    if (!this.config?.csrf.enabled) {
      return null
    }

    // 尝试从cookie或meta标签获取
    if (typeof document !== 'undefined') {
      const meta = document.querySelector(
        `meta[name="${this.config?.csrf.tokenName}"]`
      )
      if (meta) {
        return meta.getAttribute('content')
      }
    }

    return null
  }

  generateCSPHeader(): string {
    if (!this.config?.csp.enabled) {
      return ''
    }

    const directives = Object.entries(this.config?.csp.directives || {})
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ')

    const headerName = this.config?.csp.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'

    return `${headerName}: ${directives}`
  }

  reportCSPViolation(violation: unknown): void {
    this.reportSecurityEvent({
      type: SecurityEventType.CSP_VIOLATION,
      message: 'Content Security Policy violation',
      details: violation,
      timestamp: Date.now(),
    })
  }

  getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}

    // CSP头
    if (this.config?.csp.enabled) {
      const cspHeader = this.generateCSPHeader()
      if (cspHeader) {
        const [headerName, headerValue] = cspHeader.split(': ', 2)
        headers[headerName] = headerValue
      }
    }

    // 点击劫持防护
    if (this.config?.clickjacking.enabled) {
      switch (this.config?.clickjacking.policy) {
        case 'deny':
          headers['X-Frame-Options'] = 'DENY'
          break
        case 'sameorigin':
          headers['X-Frame-Options'] = 'SAMEORIGIN'
          break
        case 'allow-from':
          if (this.config?.clickjacking.allowFrom) {
            headers['X-Frame-Options'] =
              `ALLOW-FROM ${this.config?.clickjacking.allowFrom}`
          }
          break
      }
    }

    // HTTPS相关头
    if (this.config?.https.enabled) {
      const { hsts } = this.config?.https
      if (hsts) {
        let hstsValue = `max-age=${hsts.maxAge}`
        if (hsts.includeSubDomains) {
          hstsValue += '; includeSubDomains'
        }
        if (hsts.preload) {
          hstsValue += '; preload'
        }
        headers['Strict-Transport-Security'] = hstsValue
      }
    }

    // 其他安全头
    headers['X-Content-Type-Options'] = 'nosniff'
    headers['X-XSS-Protection'] = '1; mode=block'
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    return headers
  }

  onSecurityEvent(callback: (event: SecurityEvent) => void): void {
    this.eventCallbacks.push(callback)
  }

  reportSecurityEvent(event: SecurityEvent): void {
    // 记录到引擎日志
    if (this.engine?.logger) {
      this.engine.logger.warn('Security event detected', event)
    }

    // 触发事件回调
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        if (this.engine?.logger) {
          this.engine.logger.error('Error in security event callback', error)
        }
      }
    })

    // 发送到引擎事件系统
    if (this.engine?.events) {
      this.engine.events.emit('security:event', event)
    }
  }

  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      xss: { ...this.config?.xss, ...config.xss },
      csrf: { ...this.config?.csrf, ...config.csrf },
      csp: { ...this.config?.csp, ...config.csp },
      clickjacking: { ...this.config?.clickjacking, ...config.clickjacking },
      https: { ...this.config?.https, ...config.https },
    }

    // 重新初始化保护器
    this.xssProtector = new XSSProtector(this.config?.xss)
    this.csrfProtector = new CSRFProtector(this.config?.csrf)
  }

  getConfig(): SecurityConfig {
    return JSON.parse(JSON.stringify(this.config))
  }
}

// 创建安全管理器
export function createSecurityManager(
  config?: SecurityConfig,
  engine?: Engine
): SecurityManager {
  return new SecurityManagerImpl(config, engine)
}
