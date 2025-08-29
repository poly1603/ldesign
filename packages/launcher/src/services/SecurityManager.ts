/**
 * 安全管理器
 * 负责处理SSL证书生成、HTTPS配置和安全头设置
 */

import path from 'node:path'
import type {
  CertificateValidation,
  CSPConfig,
  HTTPSOptions,
  ISecurityManager,
  SecurityConfig,
  SecurityHeaders,
  SecurityStats,
  SSLCertificate,
  SSLCertGenerationOptions,
  SSLConfig,
} from '../types/security'
import { ErrorHandler } from './ErrorHandler'
import { SSLCertificateGenerator, generateDevSSLCert, saveDevSSLCert } from '../utils/ssl-generator'

export class SecurityManager implements ISecurityManager {
  private sslConfig: SSLConfig = { enabled: false }
  private httpsOptions: HTTPSOptions = { enabled: false }
  private securityHeaders: SecurityHeaders = {}
  private cspConfig: CSPConfig = { enabled: false }
  private errorHandler: ErrorHandler
  private certificateCache = new Map<string, SSLCertificate>()
  private stats: SecurityStats = {
    certificates: {
      totalGenerated: 0,
      currentValid: 0,
      expiringSoon: 0,
      expired: 0,
    },
    https: {
      enabledCount: 0,
      disabledCount: 0,
      currentlyEnabled: false,
    },
    violations: {
      totalCount: 0,
    },
  }

  constructor() {
    this.errorHandler = new ErrorHandler()
    this.initializeDefaults()
  }

  /**
   * 初始化默认配置
   */
  private initializeDefaults(): void {
    // 默认安全头配置
    this.securityHeaders = {
      frameOptions: 'SAMEORIGIN',
      contentTypeOptions: true,
      xssProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
    }

    // 默认 CSP 配置
    this.cspConfig = {
      enabled: false,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https:', 'data:'],
        'connect-src': ["'self'"],
      },
      reportOnly: true,
    }
  }

  /**
   * 生成 SSL 证书
   */
  async generateSSLCert(options?: SSLCertGenerationOptions): Promise<SSLCertificate> {
    try {
      const certificate = await SSLCertificateGenerator.generateSelfSignedCert(options)

      // 缓存证书
      this.certificateCache.set(certificate.domain, certificate)

      // 更新统计
      this.stats.certificates.totalGenerated++
      this.updateCertificateStats()

      return certificate
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'generate SSL certificate',
      )
      throw launcherError
    }
  }

  /**
   * 加载 SSL 证书
   */
  async loadSSLCert(certPath: string, keyPath: string, caPath?: string): Promise<SSLCertificate> {
    try {
      const certificate = await SSLCertificateGenerator.loadCertificate(certPath, keyPath, caPath)

      // 缓存证书
      this.certificateCache.set(certificate.domain, certificate)

      // 更新统计
      this.updateCertificateStats()

      return certificate
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'load SSL certificate',
      )
      throw launcherError
    }
  }

  /**
   * 保存 SSL 证书
   */
  async saveSSLCert(certificate: SSLCertificate, certPath: string, keyPath: string): Promise<void> {
    try {
      const directory = path.dirname(certPath)
      await SSLCertificateGenerator.saveCertificate(certificate, {
        directory,
        certFileName: path.basename(certPath),
        keyFileName: path.basename(keyPath),
      })
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'save SSL certificate',
      )
      throw launcherError
    }
  }

  /**
   * 验证 SSL 证书
   */
  validateSSLCert(certificate: SSLCertificate): CertificateValidation {
    return SSLCertificateGenerator.validateCertificate(certificate)
  }

  /**
   * 获取 SSL 配置
   */
  getSSLConfig(): SSLConfig {
    return { ...this.sslConfig }
  }

  /**
   * 配置 SSL
   */
  configureSSL(config: SSLConfig): void {
    try {
      this.sslConfig = { ...this.sslConfig, ...config }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'configure SSL',
      )
      throw launcherError
    }
  }

  /**
   * 启用 HTTPS
   */
  enableHTTPS(options?: HTTPSOptions): void {
    try {
      this.httpsOptions = {
        enabled: true,
        ...options,
      }

      this.sslConfig.enabled = true
      this.stats.https.enabledCount++
      this.stats.https.currentlyEnabled = true
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'enable HTTPS',
      )
      throw launcherError
    }
  }

  /**
   * 禁用 HTTPS
   */
  disableHTTPS(): void {
    this.httpsOptions.enabled = false
    this.sslConfig.enabled = false
    this.stats.https.disabledCount++
    this.stats.https.currentlyEnabled = false
  }

  /**
   * 检查 HTTPS 是否启用
   */
  isHTTPSEnabled(): boolean {
    return this.httpsOptions.enabled === true && this.sslConfig.enabled === true
  }

  /**
   * 配置安全头
   */
  configureSecurityHeaders(headers: SecurityHeaders): void {
    try {
      this.securityHeaders = { ...this.securityHeaders, ...headers }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'configure security headers',
      )
      throw launcherError
    }
  }

  /**
   * 配置 CSP
   */
  configureCSP(csp: CSPConfig): void {
    try {
      this.cspConfig = { ...this.cspConfig, ...csp }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'configure CSP',
      )
      throw launcherError
    }
  }

  /**
   * 生成 Vite HTTPS 配置
   */
  generateViteHTTPSConfig(): any {
    if (!this.isHTTPSEnabled()) {
      return false
    }

    const config: any = {}

    // 如果有证书配置
    if (this.sslConfig.cert && this.sslConfig.key) {
      config.cert = this.sslConfig.cert
      config.key = this.sslConfig.key
      if (this.sslConfig.ca) {
        config.ca = this.sslConfig.ca
      }
    }
    else if (this.sslConfig.certPath && this.sslConfig.keyPath) {
      config.cert = this.sslConfig.certPath
      config.key = this.sslConfig.keyPath
      if (this.sslConfig.caPath) {
        config.ca = this.sslConfig.caPath
      }
    }
    else if (this.sslConfig.autoGenerate) {
      // 自动生成证书的情况下，返回 true 让 Vite 使用默认证书
      return true
    }

    return Object.keys(config).length > 0 ? config : true
  }

  /**
   * 验证安全配置
   */
  validateSecurityConfig(config: SecurityConfig): boolean {
    try {
      // 验证 HTTPS 配置
      if (config.https?.enabled && config.https.ssl) {
        const sslConfig = config.https.ssl
        if (sslConfig.enabled) {
          // 检查证书配置
          if (!sslConfig.autoGenerate) {
            if ((!sslConfig.cert || !sslConfig.key) && (!sslConfig.certPath || !sslConfig.keyPath)) {
              return false
            }
          }
        }
      }

      // 验证 CSP 配置
      if (config.csp?.enabled && config.csp.directives) {
        // 基本的 CSP 验证
        const directives = config.csp.directives
        if (directives['default-src'] && !Array.isArray(directives['default-src'])) {
          return false
        }
      }

      return true
    }
    catch (error) {
      return false
    }
  }

  /**
   * 重置安全配置
   */
  reset(): void {
    this.sslConfig = { enabled: false }
    this.httpsOptions = { enabled: false }
    this.securityHeaders = {}
    this.cspConfig = { enabled: false }
    this.certificateCache.clear()
    this.initializeDefaults()
  }

  /**
   * 获取统计信息
   */
  getStats(): SecurityStats {
    this.updateCertificateStats()
    return { ...this.stats }
  }

  /**
   * 获取缓存的证书
   */
  getCachedCertificate(domain: string): SSLCertificate | undefined {
    return this.certificateCache.get(domain)
  }

  /**
   * 自动生成开发证书
   */
  async generateDevCertificate(domain = 'localhost'): Promise<{
    certificate: SSLCertificate
    paths: { certPath: string; keyPath: string }
  }> {
    try {
      const certificate = await generateDevSSLCert(domain)
      const paths = await saveDevSSLCert(certificate)

      // 应用到当前配置
      this.configureSSL({
        enabled: true,
        certPath: paths.certPath,
        keyPath: paths.keyPath,
        autoGenerate: true,
      })

      return { certificate, paths }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'generate dev certificate',
      )
      throw launcherError
    }
  }

  /**
   * 生成安全头中间件配置
   */
  generateSecurityHeadersConfig(): Record<string, string> {
    const headers: Record<string, string> = {}

    if (this.securityHeaders.frameOptions) {
      headers['X-Frame-Options'] = this.securityHeaders.frameOptions
    }

    if (this.securityHeaders.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff'
    }

    if (this.securityHeaders.xssProtection) {
      headers['X-XSS-Protection'] = typeof this.securityHeaders.xssProtection === 'string'
        ? this.securityHeaders.xssProtection
        : '1; mode=block'
    }

    if (this.securityHeaders.referrerPolicy) {
      headers['Referrer-Policy'] = this.securityHeaders.referrerPolicy
    }

    // CSP 头
    if (this.cspConfig.enabled && this.cspConfig.directives) {
      const cspValue = this.generateCSPValue()
      if (cspValue) {
        const headerName = this.cspConfig.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
        headers[headerName] = cspValue
      }
    }

    // HSTS 头
    if (this.httpsOptions.hsts?.enabled) {
      const hsts = this.httpsOptions.hsts
      let hstsValue = `max-age=${hsts.maxAge || 31536000}`
      if (hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains'
      }
      if (hsts.preload) {
        hstsValue += '; preload'
      }
      headers['Strict-Transport-Security'] = hstsValue
    }

    // 自定义头
    if (this.securityHeaders.custom) {
      Object.assign(headers, this.securityHeaders.custom)
    }

    return headers
  }

  /**
   * 生成 CSP 值
   */
  private generateCSPValue(): string {
    if (!this.cspConfig.directives) {
      return ''
    }

    const directives: string[] = []

    for (const [directive, values] of Object.entries(this.cspConfig.directives)) {
      if (typeof values === 'boolean') {
        if (values) {
          directives.push(directive)
        }
      }
      else if (Array.isArray(values) && values.length > 0) {
        directives.push(`${directive} ${values.join(' ')}`)
      }
    }

    return directives.join('; ')
  }

  /**
   * 更新证书统计信息
   */
  private updateCertificateStats(): void {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let currentValid = 0
    let expiringSoon = 0
    let expired = 0

    for (const certificate of this.certificateCache.values()) {
      if (certificate.expiresAt < now) {
        expired++
      }
      else if (certificate.expiresAt < thirtyDaysFromNow) {
        expiringSoon++
        currentValid++
      }
      else {
        currentValid++
      }
    }

    this.stats.certificates.currentValid = currentValid
    this.stats.certificates.expiringSoon = expiringSoon
    this.stats.certificates.expired = expired
  }
}

/**
 * 默认安全管理器实例
 */
export const securityManager = new SecurityManager()
