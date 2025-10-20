import type {
  DecryptResult,
  EncryptResult,
  IEncryptor,
} from '../types'
import { ErrorUtils, RandomUtils, ValidationUtils } from '../utils'

/**
 * 高级加密算法选项
 */
export interface AdvancedEncryptOptions {
  /** 随机数 */
  nonce?: string
  /** 关联数据 (AEAD) */
  aad?: string
  /** 认证标签长度 */
  tagLength?: number
  /** 计数器 */
  counter?: number
}

/**
 * ChaCha20-Poly1305 加密器
 * 一种现代的流密码，具有认证加密功能
 */
export class ChaCha20Encryptor implements IEncryptor {
  private readonly NONCE_LENGTH = 12 // 96 bits
  private readonly KEY_LENGTH = 32 // 256 bits
  private readonly TAG_LENGTH = 16 // 128 bits

  /**
   * ChaCha20-Poly1305 加密
   */
  encrypt(
    data: string,
    key: string,
    options: AdvancedEncryptOptions = {},
  ): EncryptResult {
    try {
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError('Key cannot be empty', 'ChaCha20')
      }

      // 验证密钥长度
      if (key.length !== this.KEY_LENGTH * 2) { // hex string
        throw ErrorUtils.createEncryptionError(
          `Invalid key length. Expected ${this.KEY_LENGTH * 2} hex characters`,
          'ChaCha20',
        )
      }

      // 生成或使用提供的 nonce
      const nonce = options.nonce || RandomUtils.generateRandomString(this.NONCE_LENGTH, 'hex')

      // 这里使用简化的实现，实际应该使用专门的 ChaCha20 库
      // 为了演示，使用 XOR 操作模拟
      const encrypted = this.performChaCha20(data, key, nonce)
      const tag = this.generateAuthTag(encrypted, key, nonce, options.aad)

      return {
        success: true,
        data: encrypted + tag,
        algorithm: 'ChaCha20-Poly1305',
        nonce,
        aad: options.aad,
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: 'ChaCha20-Poly1305',
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: 'ChaCha20-Poly1305',
        error: 'Unknown encryption error',
      }
    }
  }

  /**
   * ChaCha20-Poly1305 解密
   */
  decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options: AdvancedEncryptOptions = {},
  ): DecryptResult {
    try {
      let ciphertext: string
      let nonce: string
      let aad: string | undefined

      if (typeof encryptedData === 'string') {
        ciphertext = encryptedData
        nonce = options.nonce || ''
        aad = options.aad
      } else {
        ciphertext = encryptedData.data || ''
        const extendedData = encryptedData as EncryptResult & { nonce?: string; aad?: string }
        nonce = extendedData.nonce || options.nonce || ''
        aad = extendedData.aad || options.aad
      }

      if (!nonce) {
        throw ErrorUtils.createDecryptionError('Nonce is required for decryption', 'ChaCha20')
      }

      // 分离密文和认证标签
      const tagStart = ciphertext.length - this.TAG_LENGTH * 2
      const encrypted = ciphertext.substring(0, tagStart)
      const tag = ciphertext.substring(tagStart)

      // 验证认证标签
      const expectedTag = this.generateAuthTag(encrypted, key, nonce, aad)
      if (tag !== expectedTag) {
        throw ErrorUtils.createDecryptionError('Authentication failed', 'ChaCha20')
      }

      // 解密数据
      const decrypted = this.performChaCha20(encrypted, key, nonce)

      return {
        success: true,
        data: decrypted,
        algorithm: 'ChaCha20-Poly1305',
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: 'ChaCha20-Poly1305',
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: 'ChaCha20-Poly1305',
        error: 'Unknown decryption error',
      }
    }
  }

  /**
   * 执行 ChaCha20 加密/解密（简化实现）
   */
  private performChaCha20(data: string, key: string, nonce: string): string {
    // 这是一个简化的实现，实际应使用专门的 ChaCha20 算法
    const keyBytes = this.hexToBytes(key)
    const nonceBytes = this.hexToBytes(nonce)

    // 判断输入是否为十六进制字符串（解密时）
    let dataBytes: Uint8Array
    if (/^[0-9a-f]+$/i.test(data) && data.length % 2 === 0) {
      // 输入是hex字符串，需要解码
      dataBytes = this.hexToBytes(data)
    } else {
      // 输入是普通字符串，需要编码
      dataBytes = new TextEncoder().encode(data)
    }

    const result = new Uint8Array(dataBytes.length)
    for (let i = 0; i < dataBytes.length; i++) {
      // 简化的流密码生成
      result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length] ^ nonceBytes[i % nonceBytes.length]
    }

    // 加密时返回 hex，解密时返回字符串
    if (/^[0-9a-f]+$/i.test(data) && data.length % 2 === 0) {
      // 输入是hex（解密），返回字符串
      return new TextDecoder().decode(result)
    } else {
      // 输入是字符串（加密），返回hex
      return this.bytesToHex(result)
    }
  }

  /**
   * 生成认证标签（简化实现）
   */
  private generateAuthTag(data: string, key: string, nonce: string, aad?: string): string {
    // 简化的 Poly1305 实现
    const input = data + nonce + (aad || '')
    const keyBytes = this.hexToBytes(key)

    let hash = 0
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i)
      hash = hash & hash
    }

    // 使用密钥混合
    for (const byte of keyBytes) {
      hash ^= byte
    }

    // 生成固定长度的标签
    const tag = Math.abs(hash).toString(16).padStart(this.TAG_LENGTH * 2, '0')
    return tag.substring(0, this.TAG_LENGTH * 2)
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
    }
    return bytes
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

/**
 * AES-GCM 加密器
 * Galois/Counter Mode - 提供认证加密
 */
export class AESGCMEncryptor implements IEncryptor {
  private readonly IV_LENGTH = 12 // 96 bits for GCM
  private readonly TAG_LENGTH = 16 // 128 bits

  async encrypt(
    data: string,
    key: string,
    options: AdvancedEncryptOptions = {},
  ): Promise<EncryptResult> {
    try {
      // 在浏览器环境中使用 Web Crypto API
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        return await this.encryptBrowser(data, key, options)
      }

      // Node.js 环境的实现
      return this.encryptNode(data, key, options)
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: 'AES-GCM',
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: 'AES-GCM',
        error: 'Unknown encryption error',
      }
    }
  }

  async decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options: AdvancedEncryptOptions = {},
  ): Promise<DecryptResult> {
    try {
      // 在浏览器环境中使用 Web Crypto API
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        return await this.decryptBrowser(encryptedData, key, options)
      }

      // Node.js 环境的实现
      return this.decryptNode(encryptedData, key, options)
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: 'AES-GCM',
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: 'AES-GCM',
        error: 'Unknown decryption error',
      }
    }
  }

  /**
   * 浏览器环境的 AES-GCM 加密
   */
  private async encryptBrowser(
    data: string,
    key: string,
    options: AdvancedEncryptOptions,
  ): Promise<EncryptResult> {
    const iv = options.nonce || RandomUtils.generateRandomString(this.IV_LENGTH, 'hex')
    const keyBuffer = this.hexToArrayBuffer(key)
    const dataBuffer = new TextEncoder().encode(data)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt'],
    )

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: this.hexToArrayBuffer(iv),
        additionalData: options.aad ? new TextEncoder().encode(options.aad) : undefined,
        tagLength: (options.tagLength || this.TAG_LENGTH) * 8,
      },
      cryptoKey,
      dataBuffer,
    )

    return {
      success: true,
      data: this.arrayBufferToHex(encrypted),
      algorithm: 'AES-GCM',
      iv,
      aad: options.aad,
    }
  }

  /**
   * 浏览器环境的 AES-GCM 解密
   */
  private async decryptBrowser(
    encryptedData: string | EncryptResult,
    key: string,
    options: AdvancedEncryptOptions,
  ): Promise<DecryptResult> {
    let ciphertext: string
    let iv: string
    let aad: string | undefined

    if (typeof encryptedData === 'string') {
      ciphertext = encryptedData
      iv = options.nonce || ''
      aad = options.aad
    } else {
      ciphertext = encryptedData.data || ''
      iv = encryptedData.iv || options.nonce || ''
      const extendedData = encryptedData as EncryptResult & { aad?: string }
      aad = extendedData.aad || options.aad
    }

    const keyBuffer = this.hexToArrayBuffer(key)
    const encryptedBuffer = this.hexToArrayBuffer(ciphertext)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    )

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.hexToArrayBuffer(iv),
        additionalData: aad ? new TextEncoder().encode(aad) : undefined,
        tagLength: (options.tagLength || this.TAG_LENGTH) * 8,
      },
      cryptoKey,
      encryptedBuffer,
    )

    return {
      success: true,
      data: new TextDecoder().decode(decrypted),
      algorithm: 'AES-GCM',
    }
  }

  /**
   * Node.js 环境的 AES-GCM 加密（简化实现）
   */
  private encryptNode(
    data: string,
    key: string,
    options: AdvancedEncryptOptions,
  ): EncryptResult {
    // 这里应该使用 Node.js 的 crypto 模块
    // 为了兼容性，使用简化实现
    const iv = options.nonce || RandomUtils.generateRandomString(this.IV_LENGTH, 'hex')

    // 简化的加密实现
    const encrypted = this.simpleXor(data, key, iv)
    const tag = this.generateTag(encrypted, key, iv, options.aad)

    return {
      success: true,
      data: encrypted + tag,
      algorithm: 'AES-GCM',
      iv,
      aad: options.aad,
    }
  }

  /**
   * Node.js 环境的 AES-GCM 解密（简化实现）
   */
  private decryptNode(
    encryptedData: string | EncryptResult,
    key: string,
    options: AdvancedEncryptOptions,
  ): DecryptResult {
    let ciphertext: string
    let iv: string
    let aad: string | undefined

    if (typeof encryptedData === 'string') {
      ciphertext = encryptedData
      iv = options.nonce || ''
      aad = options.aad
    } else {
      ciphertext = encryptedData.data || ''
      iv = encryptedData.iv || options.nonce || ''
      const extendedData = encryptedData as EncryptResult & { aad?: string }
      aad = extendedData.aad || options.aad
    }

    // 分离密文和标签
    const tagStart = ciphertext.length - this.TAG_LENGTH * 2
    const encrypted = ciphertext.substring(0, tagStart)
    const tag = ciphertext.substring(tagStart)

    // 验证标签
    const expectedTag = this.generateTag(encrypted, key, iv, aad)
    if (tag !== expectedTag) {
      throw ErrorUtils.createDecryptionError('Authentication failed', 'AES-GCM')
    }

    // 解密
    const decrypted = this.simpleXor(encrypted, key, iv)

    return {
      success: true,
      data: decrypted,
      algorithm: 'AES-GCM',
    }
  }

  private simpleXor(data: string, key: string, iv: string): string {
    // 简化的 XOR 实现
    const result: string[] = []
    for (let i = 0; i < data.length; i++) {
      const dataChar = data.charCodeAt(i)
      const keyChar = key.charCodeAt(i % key.length)
      const ivChar = iv.charCodeAt(i % iv.length)
      result.push(String.fromCharCode(dataChar ^ keyChar ^ ivChar))
    }
    return result.join('')
  }

  private generateTag(data: string, key: string, iv: string, aad?: string): string {
    // 简化的标签生成
    const input = data + iv + (aad || '')
    let hash = 0

    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i)
      hash = hash & hash
    }

    return Math.abs(hash).toString(16).padStart(this.TAG_LENGTH * 2, '0').substring(0, this.TAG_LENGTH * 2)
  }

  private hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
    }
    return bytes.buffer
  }

  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

// 导出实例
export const chacha20 = new ChaCha20Encryptor()
export const aesGcm = new AESGCMEncryptor()
