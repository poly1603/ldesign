/**
 * 请求签名功能
 * 提供请求签名和验证，提高 API 安全性
 */

import type { RequestConfig } from '../types'

/**
 * 签名配置
 */
export interface SignatureConfig {
  /** 签名密钥 */
  secret: string
  /** 签名算法 */
  algorithm?: 'sha256' | 'sha1' | 'md5'
  /** 签名头名称 */
  headerName?: string
  /** 时间戳头名称 */
  timestampHeaderName?: string
  /** 随机数头名称 */
  nonceHeaderName?: string
  /** 签名有效期（秒） */
  expiresIn?: number
  /** 是否包含请求体 */
  includeBody?: boolean
  /** 是否包含查询参数 */
  includeParams?: boolean
  /** 自定义签名生成器 */
  customGenerator?: (data: string, secret: string) => string | Promise<string>
}

/**
 * 签名结果
 */
export interface SignatureResult {
  /** 签名值 */
  signature: string
  /** 时间戳 */
  timestamp: number
  /** 随机数 */
  nonce: string
}

/**
 * 请求签名管理器
 * 
 * 功能：
 * 1. 生成请求签名
 * 2. 验证请求签名
 * 3. 防重放攻击
 * 4. 支持多种签名算法
 */
export class SignatureManager {
  private config: Required<Omit<SignatureConfig, 'customGenerator'>> & Pick<SignatureConfig, 'customGenerator'>
  private usedNonces = new Set<string>()
  private nonceCleanupTimer?: ReturnType<typeof setTimeout>

  constructor(config: SignatureConfig) {
    this.config = {
      secret: config.secret,
      algorithm: config.algorithm ?? 'sha256',
      headerName: config.headerName ?? 'X-Signature',
      timestampHeaderName: config.timestampHeaderName ?? 'X-Timestamp',
      nonceHeaderName: config.nonceHeaderName ?? 'X-Nonce',
      expiresIn: config.expiresIn ?? 300, // 5分钟
      includeBody: config.includeBody ?? true,
      includeParams: config.includeParams ?? true,
      customGenerator: config.customGenerator,
    }

    // 启动随机数清理定时器
    this.startNonceCleanup()
  }

  /**
   * 为请求生成签名
   */
  async sign(config: RequestConfig): Promise<RequestConfig> {
    const timestamp = Date.now()
    const nonce = this.generateNonce()

    // 构建签名数据
    const signData = this.buildSignData(config, timestamp, nonce)

    // 生成签名
    const signature = await this.generateSignature(signData)

    // 添加签名头
    const headers = {
      ...config.headers,
      [this.config?.headerName]: signature,
      [this.config?.timestampHeaderName]: timestamp.toString(),
      [this.config?.nonceHeaderName]: nonce,
    }

    return {
      ...config,
      headers,
    }
  }

  /**
   * 验证请求签名
   */
  async verify(config: RequestConfig): Promise<boolean> {
    const signature = config.headers?.[this.config?.headerName]
    const timestamp = config.headers?.[this.config?.timestampHeaderName]
    const nonce = config.headers?.[this.config?.nonceHeaderName]

    if (!signature || !timestamp || !nonce) {
      return false
    }

    // 检查时间戳是否过期
    const now = Date.now()
    const requestTime = Number.parseInt(timestamp, 10)
    if (now - requestTime > this.config?.expiresIn * 1000) {
      return false
    }

    // 检查随机数是否已使用（防重放攻击）
    if (this.usedNonces.has(nonce)) {
      return false
    }

    // 构建签名数据
    const signData = this.buildSignData(config, requestTime, nonce)

    // 生成期望的签名
    const expectedSignature = await this.generateSignature(signData)

    // 比较签名
    const isValid = signature === expectedSignature

    // 如果签名有效，记录随机数
    if (isValid) {
      this.usedNonces.add(nonce)
    }

    return isValid
  }

  /**
   * 构建签名数据
   */
  private buildSignData(config: RequestConfig, timestamp: number, nonce: string): string {
    const parts: string[] = [
      config.method || 'GET',
      config.url || '',
      timestamp.toString(),
      nonce,
    ]

    // 包含查询参数
    if (this.config?.includeParams && config.params) {
      const sortedParams = this.sortObject(config.params)
      parts.push(JSON.stringify(sortedParams))
    }

    // 包含请求体
    if (this.config?.includeBody && config.data) {
      if (typeof config.data === 'string') {
        parts.push(config.data)
      }
      else {
        parts.push(JSON.stringify(config.data))
      }
    }

    return parts.join('&')
  }

  /**
   * 生成签名
   */
  private async generateSignature(data: string): Promise<string> {
    // 如果有自定义生成器，使用自定义生成器
    if (this.config?.customGenerator) {
      return this.config?.customGenerator(data, this.config?.secret)
    }

    // 使用内置算法
    return this.hash(data + this.config?.secret, this.config?.algorithm)
  }

  /**
   * 哈希函数
   */
  private async hash(data: string, algorithm: string): Promise<string> {
    // 浏览器环境使用 SubtleCrypto
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      
      let algoName: string
      switch (algorithm) {
        case 'sha256':
          algoName = 'SHA-256'
          break
        case 'sha1':
          algoName = 'SHA-1'
          break
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`)
      }

      const hashBuffer = await crypto.subtle.digest(algoName, dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    // Node.js 环境使用 crypto 模块（ESM 动态导入）
    try {
      const { createHash } = await import('node:crypto')
      return createHash(algorithm).update(data).digest('hex')
    }
    catch {
      // 如果 crypto 模块不可用，降级到简单哈希
    }

    // 降级方案：使用简单的哈希（不安全，仅用于开发）
    return this.simpleHash(data)
  }

  /**
   * 简单哈希（不安全，仅用于开发）
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * 生成随机数
   */
  private generateNonce(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    return `${timestamp}${random}`
  }

  /**
   * 对象排序（用于生成一致的签名）
   */
  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {}
    Object.keys(obj).sort().forEach((key) => {
      sorted[key] = obj[key]
    })
    return sorted
  }

  /**
   * 启动随机数清理定时器
   */
  private startNonceCleanup(): void {
    // 每分钟清理一次过期的随机数
    this.nonceCleanupTimer = setInterval(() => {
      // 简单实现：清空所有随机数
      // 更好的实现应该记录随机数的时间戳，只清理过期的
      this.usedNonces.clear()
    }, 60000)
  }

  /**
   * 清空已使用的随机数
   */
  clearNonces(): void {
    this.usedNonces.clear()
  }

  /**
   * 销毁签名管理器
   */
  destroy(): void {
    if (this.nonceCleanupTimer) {
      clearInterval(this.nonceCleanupTimer)
      this.nonceCleanupTimer = undefined
    }
    this.usedNonces.clear()
  }
}

/**
 * 创建签名管理器
 */
export function createSignatureManager(config: SignatureConfig): SignatureManager {
  return new SignatureManager(config)
}

/**
 * 创建签名拦截器
 */
export function createSignatureInterceptor(config: SignatureConfig) {
  const manager = new SignatureManager(config)

  return async (requestConfig: RequestConfig): Promise<RequestConfig> => {
    return manager.sign(requestConfig)
  }
}

