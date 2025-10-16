import type { SecurityConfig } from '../types'

import { AESCrypto } from './aes-crypto'
import { KeyObfuscator } from './key-obfuscator'

/**
 * 安全管理器
 */
export class SecurityManager {
  private encryption: AESCrypto
  private obfuscation: KeyObfuscator
  private config: Required<SecurityConfig>

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      encryption: {
        enabled: false,
        algorithm: 'AES',
        secretKey: 'ldesign-cache-default-key',
        ...config?.encryption,
      },
      obfuscation: {
        enabled: false,
        prefix: 'ld_',
        algorithm: 'hash',
        ...config?.obfuscation,
      },
    }

    this.encryption = new AESCrypto(this.config?.encryption)
    this.obfuscation = new KeyObfuscator(this.config?.obfuscation)
  }

  /**
   * 加密数据
   */
  async encrypt(data: string): Promise<string> {
    if (!this.config?.encryption.enabled) {
      return data
    }

    try {
      return await this.encryption.encrypt(data)
    }
    catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * 解密数据
   */
  async decrypt(data: string): Promise<string> {
    if (!this.config?.encryption.enabled) {
      return data
    }

    try {
      return await this.encryption.decrypt(data)
    }
    catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * 混淆键名
   */
  async obfuscateKey(key: string): Promise<string> {
    if (!this.config?.obfuscation.enabled) {
      return key
    }

    try {
      return await this.obfuscation.obfuscate(key)
    }
    catch (error) {
      console.error('Key obfuscation failed:', error)
      throw new Error('Failed to obfuscate key')
    }
  }

  /**
   * 反混淆键名
   */
  async deobfuscateKey(key: string): Promise<string> {
    if (!this.config?.obfuscation.enabled) {
      return key
    }

    try {
      return await this.obfuscation.deobfuscate(key)
    }
    catch (error) {
      console.error('Key deobfuscation failed:', error)
      throw new Error('Failed to deobfuscate key')
    }
  }

  /**
   * 检查数据是否需要加密
   */
  shouldEncrypt(data: any, options?: { encrypt?: boolean }): boolean {
    if (options?.encrypt !== undefined) {
      return options.encrypt
    }

    return this.config?.encryption.enabled
  }

  /**
   * 检查键名是否需要混淆
   */
  shouldObfuscateKey(options?: { obfuscateKey?: boolean }): boolean {
    if (options?.obfuscateKey !== undefined) {
      return options.obfuscateKey
    }

    return this.config?.obfuscation.enabled
  }

  /**
   * 生成安全的随机键
   */
  generateSecureKey(length: number = 32): string {
    const chars
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    if (
      typeof window !== 'undefined'
      && window.crypto
      && window.crypto.getRandomValues
    ) {
      const array = new Uint8Array(length)
      window.crypto.getRandomValues(array)

      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length]
      }
    }
    else {
      // 回退到 Math.random
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
    }

    return result
  }

  /**
   * 验证数据完整性
   *
   * 通过比较原始数据和存储数据来验证数据完整性
   * 如果启用了加密，会先解密存储数据再进行比较
   *
   * @param originalData - 原始数据
   * @param storedData - 存储的数据（可能已加密）
   * @returns 数据完整性验证结果
   *
   * @example
   * ```typescript
   * const isValid = await securityManager.verifyIntegrity('original', 'stored')
   *  // true 或 false
   * ```
   */
  async verifyIntegrity(
    originalData: string,
    storedData: string,
  ): Promise<boolean> {
    try {
      // 输入验证
      if (typeof originalData !== 'string' || typeof storedData !== 'string') {
        console.warn('Invalid data types for integrity verification')
        return false
      }

      // 如果两个数据都为空，认为是相等的
      if (!originalData && !storedData) {
        return true
      }

      // 如果其中一个为空，另一个不为空，则不相等
      if (!originalData || !storedData) {
        return false
      }

      if (this.config?.encryption.enabled) {
        try {
          const decrypted = await this.decrypt(storedData)
          return decrypted === originalData
        }
        catch (error) {
          // 解密失败可能意味着数据被篡改或使用了错误的密钥
          console.warn('Decryption failed during integrity verification:', error instanceof Error ? error.message : 'Unknown error')
          return false
        }
      }

      return storedData === originalData
    }
    catch (error) {
      console.error('Integrity verification failed:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }

  /**
   * 获取安全配置
   */
  getConfig(): SecurityConfig {
    return { ...this.config }
  }

  /**
   * 更新安全配置
   */
  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      encryption: {
        ...this.config?.encryption,
        ...config.encryption,
      },
      obfuscation: {
        ...this.config?.obfuscation,
        ...config.obfuscation,
      },
    }

    // 重新初始化加密和混淆器
    this.encryption = new AESCrypto(this.config?.encryption)
    this.obfuscation = new KeyObfuscator(this.config?.obfuscation)
  }

  /**
   * 检查安全功能是否可用
   */
  isSecurityAvailable(): {
    encryption: boolean
    obfuscation: boolean
    webCrypto: boolean
  } {
    return {
      encryption: this.encryption.isAvailable(),
      obfuscation: this.obfuscation.isAvailable(),
      webCrypto:
        typeof window !== 'undefined'
        && 'crypto' in window
        && 'subtle' in window.crypto,
    }
  }
}
