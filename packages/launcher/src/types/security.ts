/**
 * 安全配置相关类型定义
 */

/**
 * SSL 证书信息
 */
export interface SSLCertificate {
  /** 证书内容 (PEM 格式) */
  cert: string
  /** 私钥内容 (PEM 格式) */
  key: string
  /** CA 证书内容 (PEM 格式，可选) */
  ca?: string | undefined
  /** 证书域名 */
  domain: string
  /** 证书过期时间 */
  expiresAt: Date
  /** 证书创建时间 */
  createdAt: Date
  /** 证书序列号 */
  serialNumber: string
  /** 证书指纹 */
  fingerprint: string
  /** 是否为自签名证书 */
  selfSigned: boolean
}

/**
 * SSL 证书生成选项
 */
export interface SSLCertGenerationOptions {
  /** 证书域名 */
  domain?: string
  /** 证书有效期（天数） */
  validityDays?: number
  /** 证书密钥长度 */
  keySize?: 2048 | 4096
  /** 证书算法 */
  algorithm?: 'RSA' | 'ECDSA'
  /** 组织信息 */
  organization?: {
    /** 组织名称 */
    name?: string
    /** 组织单位 */
    unit?: string
    /** 国家代码 */
    country?: string
    /** 州/省 */
    state?: string
    /** 城市 */
    city?: string
    /** 邮箱 */
    email?: string
  }
  /** 扩展域名 (SAN) */
  altNames?: string[]
  /** 是否包含本地主机名 */
  includeLocalhost?: boolean
}

/**
 * SSL 配置
 */
export interface SSLConfig {
  /** 是否启用 SSL */
  enabled: boolean
  /** 证书文件路径 */
  certPath?: string
  /** 私钥文件路径 */
  keyPath?: string
  /** CA 证书文件路径 */
  caPath?: string
  /** 证书内容 */
  cert?: string
  /** 私钥内容 */
  key?: string
  /** CA 证书内容 */
  ca?: string
  /** 是否自动生成证书 */
  autoGenerate?: boolean
  /** 证书生成选项 */
  generationOptions?: SSLCertGenerationOptions
}

/**
 * HTTPS 配置选项
 */
export interface HTTPSOptions {
  /** 是否启用 HTTPS */
  enabled?: boolean
  /** SSL 配置 */
  ssl?: SSLConfig
  /** 是否强制 HTTPS */
  force?: boolean
  /** HTTP 到 HTTPS 重定向端口 */
  redirectPort?: number
  /** HSTS 配置 */
  hsts?: {
    /** 是否启用 HSTS */
    enabled?: boolean
    /** 最大年龄（秒） */
    maxAge?: number
    /** 是否包含子域名 */
    includeSubDomains?: boolean
    /** 是否预加载 */
    preload?: boolean
  }
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  /** HTTPS 配置 */
  https?: HTTPSOptions
  /** SSL 配置 */
  ssl?: SSLConfig
  /** 安全头配置 */
  headers?: SecurityHeaders
  /** CSP 配置 */
  csp?: CSPConfig
  /** CORS 安全配置 */
  cors?: CORSSecurityConfig
}

/**
 * 安全头配置
 */
export interface SecurityHeaders {
  /** X-Frame-Options */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string
  /** X-Content-Type-Options */
  contentTypeOptions?: boolean
  /** X-XSS-Protection */
  xssProtection?: boolean | string
  /** Referrer-Policy */
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
  /** Permissions-Policy */
  permissionsPolicy?: Record<string, string[]>
  /** 自定义安全头 */
  custom?: Record<string, string>
}

/**
 * CSP (Content Security Policy) 配置
 */
export interface CSPConfig {
  /** 是否启用 CSP */
  enabled?: boolean
  /** CSP 指令 */
  directives?: {
    'default-src'?: string[]
    'script-src'?: string[]
    'style-src'?: string[]
    'img-src'?: string[]
    'font-src'?: string[]
    'connect-src'?: string[]
    'media-src'?: string[]
    'object-src'?: string[]
    'child-src'?: string[]
    'frame-src'?: string[]
    'worker-src'?: string[]
    'manifest-src'?: string[]
    'base-uri'?: string[]
    'form-action'?: string[]
    'frame-ancestors'?: string[]
    'plugin-types'?: string[]
    'sandbox'?: string[]
    'upgrade-insecure-requests'?: boolean
    'block-all-mixed-content'?: boolean
  }
  /** 是否仅报告模式 */
  reportOnly?: boolean
  /** 报告 URI */
  reportUri?: string
}

/**
 * CORS 安全配置
 */
export interface CORSSecurityConfig {
  /** 允许的源白名单 */
  allowedOrigins?: string[]
  /** 是否允许凭证 */
  credentials?: boolean
  /** 最大年龄 */
  maxAge?: number
  /** 是否启用预检请求缓存 */
  preflightCaching?: boolean
}

/**
 * 证书验证结果
 */
export interface CertificateValidation {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
  /** 证书信息 */
  certificate?: SSLCertificate
}

/**
 * 安全管理器接口
 */
export interface ISecurityManager {
  /** 生成 SSL 证书 */
  generateSSLCert(options?: SSLCertGenerationOptions): Promise<SSLCertificate>

  /** 加载 SSL 证书 */
  loadSSLCert(certPath: string, keyPath: string, caPath?: string): Promise<SSLCertificate>

  /** 保存 SSL 证书 */
  saveSSLCert(certificate: SSLCertificate, certPath: string, keyPath: string): Promise<void>

  /** 验证 SSL 证书 */
  validateSSLCert(certificate: SSLCertificate): CertificateValidation

  /** 获取 SSL 配置 */
  getSSLConfig(): SSLConfig

  /** 配置 SSL */
  configureSSL(config: SSLConfig): void

  /** 启用 HTTPS */
  enableHTTPS(options?: HTTPSOptions): void

  /** 禁用 HTTPS */
  disableHTTPS(): void

  /** 检查 HTTPS 是否启用 */
  isHTTPSEnabled(): boolean

  /** 配置安全头 */
  configureSecurityHeaders(headers: SecurityHeaders): void

  /** 配置 CSP */
  configureCSP(csp: CSPConfig): void

  /** 生成 Vite HTTPS 配置 */
  generateViteHTTPSConfig(): any

  /** 验证安全配置 */
  validateSecurityConfig(config: SecurityConfig): boolean

  /** 重置安全配置 */
  reset(): void
}

/**
 * 证书存储选项
 */
export interface CertificateStorageOptions {
  /** 存储目录 */
  directory?: string
  /** 证书文件名 */
  certFileName?: string
  /** 私钥文件名 */
  keyFileName?: string
  /** CA 证书文件名 */
  caFileName?: string
  /** 文件权限 */
  permissions?: string
}

/**
 * 证书缓存信息
 */
export interface CertificateCache {
  /** 缓存的证书 */
  certificates: Map<string, SSLCertificate>
  /** 缓存过期时间 */
  expiresAt: Map<string, Date>
  /** 最大缓存数量 */
  maxSize: number
}

/**
 * 安全事件类型
 */
export type SecurityEventType = 'cert-generated' | 'cert-loaded' | 'cert-expired' | 'https-enabled' | 'https-disabled' | 'security-violation'

/**
 * 安全事件数据
 */
export interface SecurityEventData {
  /** 事件类型 */
  type: SecurityEventType
  /** 证书信息 */
  certificate?: SSLCertificate
  /** 错误信息 */
  error?: Error
  /** 时间戳 */
  timestamp: number
  /** 额外数据 */
  metadata?: Record<string, any>
}

/**
 * 安全统计信息
 */
export interface SecurityStats {
  /** 证书统计 */
  certificates: {
    /** 总生成数量 */
    totalGenerated: number
    /** 当前有效数量 */
    currentValid: number
    /** 即将过期数量 */
    expiringSoon: number
    /** 已过期数量 */
    expired: number
  }
  /** HTTPS 统计 */
  https: {
    /** 启用次数 */
    enabledCount: number
    /** 禁用次数 */
    disabledCount: number
    /** 当前状态 */
    currentlyEnabled: boolean
  }
  /** 安全违规统计 */
  violations: {
    /** 总违规次数 */
    totalCount: number
    /** 最近违规时间 */
    lastViolation?: Date
  }
}
