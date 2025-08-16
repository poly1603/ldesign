import type { Engine } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createSecurityManager,
  type SecurityEvent,
  SecurityEventType,
  type SecurityManager,
} from '../src/security/security-manager'

describe('securityManager', () => {
  let securityManager: SecurityManager
  let mockEngine: Partial<Engine>

  beforeEach(() => {
    mockEngine = {
      logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
      },
      events: {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
      },
    } as any

    securityManager = createSecurityManager({}, mockEngine as Engine)
  })

  describe('xSS防护', () => {
    it('应该检测和移除脚本标签', () => {
      const maliciousHTML
        = '<p>Hello</p><script>alert("xss")</script><p>World</p>'
      const result = securityManager.sanitizeHTML(maliciousHTML)

      expect(result.safe).toBe(false)
      expect(result.sanitized).toBe('<p>Hello</p><p>World</p>')
      expect(result.threats).toContain('Script tags detected')
    })

    it('应该检测和移除事件处理器', () => {
      const maliciousHTML = '<div onclick="alert(\'xss\')">Click me</div>'
      const result = securityManager.sanitizeHTML(maliciousHTML)

      expect(result.safe).toBe(false)
      expect(result.sanitized).not.toContain('onclick')
      expect(result.threats).toContain('Event handlers detected')
    })

    it('应该检测和移除javascript协议', () => {
      const maliciousHTML = '<a href="javascript:alert(\'xss\')">Link</a>'
      const result = securityManager.sanitizeHTML(maliciousHTML)

      expect(result.safe).toBe(false)
      expect(result.sanitized).not.toContain('javascript:')
      expect(result.threats).toContain('JavaScript protocol detected')
    })

    it('应该检测和移除可疑的data协议', () => {
      const maliciousHTML
        = '<object data="data:text/html,<script>alert(\'xss\')</script>"></object>'
      const result = securityManager.sanitizeHTML(maliciousHTML)

      expect(result.safe).toBe(false)
      expect(result.threats).toContain('Suspicious data protocol detected')
    })

    it('应该允许安全的HTML标签', () => {
      const safeHTML
        = '<p>Hello <strong>world</strong>!</p><br><em>Emphasis</em>'
      const result = securityManager.sanitizeHTML(safeHTML)

      expect(result.safe).toBe(true)
      expect(result.sanitized).toBe(safeHTML)
      expect(result.threats).toHaveLength(0)
    })

    it('应该移除不允许的标签', () => {
      const htmlWithDisallowedTags
        = '<p>Safe</p><iframe src="evil.com"></iframe><p>Also safe</p>'
      const result = securityManager.sanitizeHTML(htmlWithDisallowedTags)

      expect(result.safe).toBe(false)
      expect(result.sanitized).toBe('<p>Safe</p><p>Also safe</p>')
      expect(result.threats).toContain('Disallowed tag: iframe')
    })

    it('应该移除不允许的属性', () => {
      const htmlWithDisallowedAttrs
        = '<p class="test" style="color: red;">Text</p>'
      const result = securityManager.sanitizeHTML(htmlWithDisallowedAttrs)

      expect(result.safe).toBe(false)
      expect(result.sanitized).toBe('<p>Text</p>')
      expect(result.threats).toContain('Disallowed attribute: class')
      expect(result.threats).toContain('Disallowed attribute: style')
    })

    it('应该允许配置的标签和属性', () => {
      const customSecurityManager = createSecurityManager({
        xss: {
          allowedTags: ['p', 'a', 'img'],
          allowedAttributes: {
            a: ['href', 'title'],
            img: ['src', 'alt'],
          },
        },
      })

      const html
        = '<p>Text</p><a href="https://example.com" title="Example">Link</a><img src="image.jpg" alt="Image">'
      const result = customSecurityManager.sanitizeHTML(html)

      expect(result.safe).toBe(true)
      expect(result.sanitized).toBe(html)
      expect(result.threats).toHaveLength(0)
    })

    it('应该在XSS被禁用时返回原始HTML', () => {
      const disabledXSSManager = createSecurityManager({
        xss: { enabled: false },
      })

      const maliciousHTML = '<script>alert("xss")</script>'
      const result = disabledXSSManager.sanitizeHTML(maliciousHTML)

      expect(result.safe).toBe(true)
      expect(result.sanitized).toBe(maliciousHTML)
      expect(result.threats).toHaveLength(0)
    })
  })

  describe('输入验证', () => {
    it('应该验证文本输入', () => {
      expect(securityManager.validateInput('Hello world')).toBe(true)
      expect(securityManager.validateInput('Safe text 123')).toBe(true)
      expect(
        securityManager.validateInput('<script>alert("xss")</script>'),
      ).toBe(false)
      expect(securityManager.validateInput('javascript:alert("xss")')).toBe(
        false,
      )
    })

    it('应该验证HTML输入', () => {
      expect(securityManager.validateInput('<p>Safe HTML</p>', 'html')).toBe(
        true,
      )
      expect(
        securityManager.validateInput('<script>alert("xss")</script>', 'html'),
      ).toBe(false)
      expect(
        securityManager.validateInput(
          '<div onclick="alert()">Bad</div>',
          'html',
        ),
      ).toBe(false)
    })

    it('应该验证URL输入', () => {
      expect(securityManager.validateInput('https://example.com', 'url')).toBe(
        true,
      )
      expect(securityManager.validateInput('http://example.com', 'url')).toBe(
        true,
      )
      expect(securityManager.validateInput('ftp://example.com', 'url')).toBe(
        true,
      )
      expect(
        securityManager.validateInput('javascript:alert("xss")', 'url'),
      ).toBe(false)
      expect(securityManager.validateInput('not-a-url', 'url')).toBe(false)
    })
  })

  describe('cSRF防护', () => {
    it('应该生成CSRF令牌', () => {
      const token = securityManager.generateCSRFToken()

      expect(token).toBeDefined()
      expect(token.token).toMatch(/^[a-f0-9]{64}$/)
      expect(token.timestamp).toBeTypeOf('number')
      expect(token.expires).toBeGreaterThan(token.timestamp)
    })

    it('应该验证有效的CSRF令牌', () => {
      const token = securityManager.generateCSRFToken()
      const isValid = securityManager.validateCSRFToken(token.token)

      expect(isValid).toBe(true)
    })

    it('应该拒绝无效的CSRF令牌', () => {
      const isValid = securityManager.validateCSRFToken('invalid-token')

      expect(isValid).toBe(false)
    })

    it('应该拒绝过期的CSRF令牌', () => {
      // 创建一个已过期的令牌（通过修改内部状态模拟）
      const token = securityManager.generateCSRFToken()

      // 等待一小段时间然后手动设置过期时间
      vi.useFakeTimers()
      vi.advanceTimersByTime(25 * 60 * 60 * 1000) // 25小时后

      const isValid = securityManager.validateCSRFToken(token.token)
      expect(isValid).toBe(false)

      vi.useRealTimers()
    })

    it('应该在CSRF被禁用时抛出错误', () => {
      const disabledCSRFManager = createSecurityManager({
        csrf: { enabled: false },
      })

      expect(() => disabledCSRFManager.generateCSRFToken()).toThrow(
        'CSRF protection is disabled',
      )
    })

    it('应该在CSRF被禁用时总是返回true', () => {
      const disabledCSRFManager = createSecurityManager({
        csrf: { enabled: false },
      })

      const isValid = disabledCSRFManager.validateCSRFToken('any-token')
      expect(isValid).toBe(true)
    })
  })

  describe('cSP管理', () => {
    it('应该生成CSP头', () => {
      const cspHeader = securityManager.generateCSPHeader()

      expect(cspHeader).toContain('Content-Security-Policy:')
      expect(cspHeader).toContain('default-src \'self\'')
      expect(cspHeader).toContain('script-src \'self\' \'unsafe-inline\'')
    })

    it('应该生成仅报告模式的CSP头', () => {
      const reportOnlyManager = createSecurityManager({
        csp: {
          reportOnly: true,
        },
      })

      const cspHeader = reportOnlyManager.generateCSPHeader()
      expect(cspHeader).toContain('Content-Security-Policy-Report-Only:')
    })

    it('应该在CSP被禁用时返回空字符串', () => {
      const disabledCSPManager = createSecurityManager({
        csp: { enabled: false },
      })

      const cspHeader = disabledCSPManager.generateCSPHeader()
      expect(cspHeader).toBe('')
    })

    it('应该报告CSP违规', () => {
      const violation = {
        'blocked-uri': 'https://evil.com/script.js',
        'document-uri': 'https://example.com',
        'violated-directive': 'script-src',
      }

      securityManager.reportCSPViolation(violation)

      expect(mockEngine.logger?.warn).toHaveBeenCalledWith(
        'Security event detected',
        expect.objectContaining({
          type: SecurityEventType.CSP_VIOLATION,
          details: violation,
        }),
      )
    })
  })

  describe('安全头管理', () => {
    it('应该生成所有安全头', () => {
      const headers = securityManager.getSecurityHeaders()

      expect(headers).toHaveProperty('Content-Security-Policy')
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY')
      expect(headers).toHaveProperty('Strict-Transport-Security')
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff')
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block')
      expect(headers).toHaveProperty(
        'Referrer-Policy',
        'strict-origin-when-cross-origin',
      )
    })

    it('应该根据配置生成不同的X-Frame-Options', () => {
      const sameOriginManager = createSecurityManager({
        clickjacking: { policy: 'sameorigin' },
      })

      const headers = sameOriginManager.getSecurityHeaders()
      expect(headers['X-Frame-Options']).toBe('SAMEORIGIN')
    })

    it('应该生成HSTS头', () => {
      const hstsManager = createSecurityManager({
        https: {
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        },
      })

      const headers = hstsManager.getSecurityHeaders()
      expect(headers['Strict-Transport-Security']).toBe(
        'max-age=31536000; includeSubDomains; preload',
      )
    })
  })

  describe('安全事件处理', () => {
    it('应该注册和触发安全事件回调', () => {
      const callback = vi.fn()
      securityManager.onSecurityEvent(callback)

      const event: SecurityEvent = {
        type: SecurityEventType.XSS_DETECTED,
        message: 'Test XSS event',
        details: {},
        timestamp: Date.now(),
      }

      securityManager.reportSecurityEvent(event)

      expect(callback).toHaveBeenCalledWith(event)
      expect(mockEngine.logger?.warn).toHaveBeenCalledWith(
        'Security event detected',
        event,
      )
      expect(mockEngine.events?.emit).toHaveBeenCalledWith(
        'security:event',
        event,
      )
    })

    it('应该处理事件回调中的错误', () => {
      const faultyCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error')
      })

      securityManager.onSecurityEvent(faultyCallback)

      const event: SecurityEvent = {
        type: SecurityEventType.CSRF_ATTACK,
        message: 'Test CSRF event',
        details: {},
        timestamp: Date.now(),
      }

      expect(() => securityManager.reportSecurityEvent(event)).not.toThrow()
      expect(mockEngine.logger?.error).toHaveBeenCalledWith(
        'Error in security event callback',
        expect.any(Error),
      )
    })
  })

  describe('配置管理', () => {
    it('应该更新配置', () => {
      const newConfig = {
        xss: { enabled: false },
        csrf: { tokenName: 'custom_token' },
      }

      securityManager.updateConfig(newConfig)
      const config = securityManager.getConfig()

      expect(config.xss?.enabled).toBe(false)
      expect(config.csrf?.tokenName).toBe('custom_token')
    })

    it('应该返回配置的副本', () => {
      const config1 = securityManager.getConfig()
      const config2 = securityManager.getConfig()

      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2) // 不是同一个对象引用
    })

    it('应该在配置更新后重新初始化保护器', () => {
      // 先生成一个令牌
      const token1 = securityManager.generateCSRFToken()
      expect(securityManager.validateCSRFToken(token1.token)).toBe(true)

      // 更新配置
      securityManager.updateConfig({
        csrf: { tokenName: 'new_token_name' },
      })

      // 配置更新后，保护器被重新初始化，旧令牌可能失效
      // 但我们可以生成新的令牌
      const token2 = securityManager.generateCSRFToken()
      expect(securityManager.validateCSRFToken(token2.token)).toBe(true)
    })
  })
})
