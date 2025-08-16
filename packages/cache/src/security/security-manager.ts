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

    this.encryption = new AESCrypto(this.config.encryption)
    this.obfuscation = new KeyObfuscator(this.config.obfuscation)
  }

  /**
   * 加密数据
   */
  async encrypt(data: string): Promise<string> {
    if (!this.config.encryption.enabled) {
      return data
    }

    try {
      return await this.encryption.encrypt(data)
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * 解密数据
   */
  async decrypt(data: string): Promise<string> {
    if (!this.config.encryption.enabled) {
      return data
    }

    try {
      return await this.encryption.decrypt(data)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * 混淆键名
   */
  async obfuscateKey(key: string): Promise<string> {
    if (!this.config.obfuscation.enabled) {
      return key
    }

    try {
      return await this.obfuscation.obfuscate(key)
    } catch (error) {
      console.error('Key obfuscation failed:', error)
      throw new Error('Failed to obfuscate key')
    }
  }

  /**
   * 反混淆键名
   */
  async deobfuscateKey(key: string): Promise<string> {
    if (!this.config.obfuscation.enabled) {
      return key
    }

    try {
      return await this.obfuscation.deobfuscate(key)
    } catch (error) {
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

    return this.config.encryption.enabled
  }

  /**
   * 检查键名是否需要混淆
   */
  shouldObfuscateKey(options?: { obfuscateKey?: boolean }): boolean {
    if (options?.obfuscateKey !== undefined) {
      return options.obfuscateKey
    }

    return this.config.obfuscation.enabled
  }

  /**
   * 生成安全的随机键
   */
  generateSecureKey(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    if (
      typeof window !== 'undefined' &&
      window.crypto &&
      window.crypto.getRandomValues
    ) {
      const array = new Uint8Array(length)
      window.crypto.getRandomValues(array)

      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length]
      }
    } else {
      // 回退到 Math.random
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
    }

    return result
  }

  /**
   * 验证数据完整性
   */
  async verifyIntegrity(
    originalData: string,
    storedData: string
  ): Promise<boolean> {
    try {
      if (this.config.encryption.enabled) {
        const decrypted = await this.decrypt(storedData)
        return decrypted === originalData
      }

      return storedData === originalData
    } catch {
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
        ...this.config.encryption,
        ...config.encryption,
      },
      obfuscation: {
        ...this.config.obfuscation,
        ...config.obfuscation,
      },
    }

    // 重新初始化加密和混淆器
    this.encryption = new AESCrypto(this.config.encryption)
    this.obfuscation = new KeyObfuscator(this.config.obfuscation)
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
        typeof window !== 'undefined' &&
        'crypto' in window &&
        'subtle' in window.crypto,
    }
  }
}
