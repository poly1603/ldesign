import type { EncryptionConfig } from '../types'

/**
 * AES 加密实现
 */
export class AESCrypto {
  private config: EncryptionConfig
  private cryptoKey: CryptoKey | null = null

  constructor(config: EncryptionConfig) {
    this.config = {
      enabled: config.enabled,
      algorithm: config.algorithm || 'AES',
      secretKey: config.secretKey || 'ldesign-cache-default-key',
      customEncrypt: config.customEncrypt,
      customDecrypt: config.customDecrypt,
    }
  }

  /**
   * 检查加密功能是否可用
   */
  isAvailable(): boolean {
    return (
      typeof window !== 'undefined'
      && 'crypto' in window
      && 'subtle' in window.crypto
    )
  }

  /**
   * 初始化加密密钥
   */
  private async initializeKey(): Promise<void> {
    if (this.cryptoKey || !this.isAvailable()) {
      return
    }

    try {
      const keyData = new TextEncoder().encode(this.config?.secretKey)

      // 使用 SHA-256 生成固定长度的密钥
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', keyData)

      this.cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt'],
      )
    }
    catch (error) {
      console.error('Failed to initialize crypto key:', error)
      throw new Error('Failed to initialize encryption key')
    }
  }

  /**
   * 加密数据
   */
  async encrypt(data: string): Promise<string> {
    if (!this.config?.enabled) {
      return data
    }

    // 使用自定义加密函数
    if (this.config?.customEncrypt) {
      return this.config?.customEncrypt(data)
    }

    // 使用内置 AES 加密
    if (this.config?.algorithm === 'AES') {
      return this.encryptAES(data)
    }

    // 使用简单的 Base64 编码作为回退
    return this.encodeBase64(data)
  }

  /**
   * 解密数据
   */
  async decrypt(data: string): Promise<string> {
    if (!this.config?.enabled) {
      return data
    }

    // 使用自定义解密函数
    if (this.config?.customDecrypt) {
      return this.config?.customDecrypt(data)
    }

    // 使用内置 AES 解密
    if (this.config?.algorithm === 'AES') {
      return this.decryptAES(data)
    }

    // 使用简单的 Base64 解码作为回退
    return this.decodeBase64(data)
  }

  /**
   * AES-GCM 加密
   */
  private async encryptAES(data: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Web Crypto API is not available')
    }

    await this.initializeKey()

    if (!this.cryptoKey) {
      throw new Error('Crypto key is not initialized')
    }

    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      // 生成随机 IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.cryptoKey,
        dataBuffer,
      )

      // 将 IV 和加密数据组合
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encryptedBuffer), iv.length)

      // 转换为 Base64
      return this.arrayBufferToBase64(combined.buffer)
    }
    catch (error) {
      console.error('AES encryption failed:', error)
      throw new Error('AES encryption failed')
    }
  }

  /**
   * AES-GCM 解密
   *
   * @param data - 需要解密的Base64编码数据
   * @returns 解密后的原始字符串
   * @throws {Error} 当数据格式无效或解密失败时抛出错误
   */
  private async decryptAES(data: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Web Crypto API is not available')
    }

    await this.initializeKey()

    if (!this.cryptoKey) {
      throw new Error('Crypto key is not initialized')
    }

    try {
      // 验证输入数据格式
      if (!data || typeof data !== 'string') {
        throw new Error('Invalid encrypted data format')
      }

      // 从 Base64 转换
      const combined = new Uint8Array(this.base64ToArrayBuffer(data))

      // 验证数据长度（至少需要12字节的IV + 一些加密数据）
      if (combined.length < 13) {
        throw new Error('Encrypted data is too small - minimum 13 bytes required (12 bytes IV + 1 byte data)')
      }

      // 分离 IV 和加密数据
      const iv = combined.slice(0, 12)
      const encryptedData = combined.slice(12)

      // 验证加密数据不为空
      if (encryptedData.length === 0) {
        throw new Error('No encrypted data found after IV')
      }

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.cryptoKey,
        encryptedData,
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    }
    catch (error) {
      console.error('AES decryption failed:', error)

      // 提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('too small')) {
          throw new Error(`AES decryption failed: ${error.message}`)
        }
        if (error.name === 'OperationError') {
          throw new Error('AES decryption failed: Invalid encrypted data or wrong key')
        }
      }

      throw new Error(`AES decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Base64 编码 - 使用更安全的方法
   */
  private encodeBase64(data: string): string {
    try {
      // 使用 TextEncoder 处理 UTF-8 字符
      const encoder = new TextEncoder()
      const bytes = encoder.encode(data)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary)
    }
    catch (error) {
      console.error('Base64 encoding failed:', error)
      // 回退到简单编码
      try {
        return btoa(unescape(encodeURIComponent(data)))
      }
      catch (fallbackError) {
        console.error('Fallback Base64 encoding failed:', fallbackError)
        return data
      }
    }
  }

  /**
   * Base64 解码 - 使用更安全的方法
   */
  private decodeBase64(data: string): string {
    try {
      const binary = atob(data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      // 使用 TextDecoder 处理 UTF-8 字符
      const decoder = new TextDecoder()
      return decoder.decode(bytes)
    }
    catch (error) {
      console.error('Base64 decoding failed:', error)
      // 回退到简单解码
      try {
        return decodeURIComponent(escape(atob(data)))
      }
      catch (fallbackError) {
        console.error('Fallback Base64 decoding failed:', fallbackError)
        return data
      }
    }
  }

  /**
   * ArrayBuffer 转 Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Base64 转 ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * 更新加密配置
   */
  updateConfig(config: Partial<EncryptionConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    }

    // 重置密钥，下次使用时重新初始化
    this.cryptoKey = null
  }

  /**
   * 获取加密配置
   */
  getConfig(): EncryptionConfig {
    return { ...this.config }
  }
}
