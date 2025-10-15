/**
 * Chunk Processor - 分块加密/解密处理器
 *
 * 核心功能：
 * - 将数据分块处理，避免一次性加载大文件到内存
 * - 支持所有加密算法的流式处理
 * - 处理分块边界和填充问题
 */

import CryptoJS from 'crypto-js'
import type { EncryptionAlgorithm } from '../types'
import type { IStreamEncryptor, IStreamDecryptor } from './types'
import { createCryptoJSConfig } from '../utils/crypto-helpers'

/**
 * 分块加密处理器
 */
export class ChunkEncryptor implements IStreamEncryptor {
  readonly algorithm: string
  readonly options: Record<string, any>

  private buffer: Buffer = Buffer.alloc(0)
  private bytesProcessed = 0
  private chunksProcessed = 0
  private errors = 0
  private derivedKey: any = null // CryptoJS.lib.WordArray

  constructor(
    algorithm: EncryptionAlgorithm,
    private key: string,
    options: Record<string, any> = {},
  ) {
    this.algorithm = algorithm.toUpperCase()
    this.options = options

    // 预先派生密钥（如果需要）
    this.initializeKey()
  }

  /**
   * 初始化密钥
   */
  private initializeKey(): void {
    if (this.algorithm === 'AES') {
      const keySize = this.options.keySize || 256
      // 使用密钥的SHA-256哈希作为确定性盐值（更安全）
      const salt = CryptoJS.SHA256(this.key)
      this.derivedKey = CryptoJS.PBKDF2(this.key, salt, {
        keySize: keySize / 32,
        iterations: 100000, // OWASP 2023推荐
      })
    }
  }

  /**
   * 处理数据块
   */
  async processChunk(chunk: Buffer): Promise<Buffer> {
    try {
      this.chunksProcessed++
      this.bytesProcessed += chunk.length

      // 将新数据追加到缓冲区
      this.buffer = Buffer.concat([this.buffer, chunk])

      // 对于流式加密，我们需要处理完整的块
      // 这里使用简化策略：累积一定量数据后再加密
      const chunkSize = this.options.chunkSize || 64 * 1024 // 64KB

      if (this.buffer.length >= chunkSize) {
        const dataToEncrypt = this.buffer.slice(0, chunkSize)
        this.buffer = this.buffer.slice(chunkSize)

        const encrypted = await this.encryptData(dataToEncrypt)
        return Buffer.from(encrypted, 'base64')
      }

      // 数据不足一个块，暂不返回
      return Buffer.alloc(0)
    }
    catch (error) {
      this.errors++
      throw error
    }
  }

  /**
   * 完成处理（处理剩余数据）
   */
  async finalize(): Promise<Buffer | null> {
    try {
      if (this.buffer.length > 0) {
        const encrypted = await this.encryptData(this.buffer)
        this.buffer = Buffer.alloc(0)
        return Buffer.from(encrypted, 'base64')
      }
      return null
    }
    catch (error) {
      this.errors++
      throw error
    }
  }

  /**
   * 加密数据
   */
  private async encryptData(data: Buffer): Promise<string> {
    const text = data.toString('utf8')

    switch (this.algorithm) {
      case 'AES': {
        const config = createCryptoJSConfig({
          mode: this.options.mode || 'CBC',
          padding: this.options.padding || 'Pkcs7',
          iv: this.options.iv,
        })

        const encrypted = CryptoJS.AES.encrypt(text, this.derivedKey!, config)
        return encrypted.toString()
      }

      case 'DES': {
        const config = createCryptoJSConfig({
          mode: this.options.mode || 'CBC',
          iv: this.options.iv,
        })
        const encrypted = CryptoJS.DES.encrypt(text, this.key, config)
        return encrypted.toString()
      }

      case '3DES':
      case 'TRIPLEDES': {
        const config = createCryptoJSConfig({
          mode: this.options.mode || 'CBC',
          iv: this.options.iv,
        })
        const encrypted = CryptoJS.TripleDES.encrypt(text, this.key, config)
        return encrypted.toString()
      }

      case 'RSA': {
        // RSA 不适合流式加密大文件，但支持小块
        const forge = require('node-forge')
        const publicKey = forge.pki.publicKeyFromPem(this.key)
        const encrypted = publicKey.encrypt(text, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
        })
        return forge.util.encode64(encrypted)
      }

      default:
        throw new Error(`Unsupported algorithm for streaming: ${this.algorithm}`)
    }
  }

  /**
   * 重置处理器
   */
  reset(): void {
    this.buffer = Buffer.alloc(0)
    this.bytesProcessed = 0
    this.chunksProcessed = 0
    this.errors = 0
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      bytesProcessed: this.bytesProcessed,
      chunksProcessed: this.chunksProcessed,
      errors: this.errors,
    }
  }
}

/**
 * 分块解密处理器
 */
export class ChunkDecryptor implements IStreamDecryptor {
  readonly algorithm: string
  readonly options: Record<string, any>

  private buffer: Buffer = Buffer.alloc(0)
  private bytesProcessed = 0
  private chunksProcessed = 0
  private errors = 0
  private derivedKey: any = null // CryptoJS.lib.WordArray

  constructor(
    algorithm: EncryptionAlgorithm,
    private key: string,
    options: Record<string, any> = {},
  ) {
    this.algorithm = algorithm.toUpperCase()
    this.options = options

    // 预先派生密钥（如果需要）
    this.initializeKey()
  }

  /**
   * 初始化密钥
   */
  private initializeKey(): void {
    if (this.algorithm === 'AES') {
      const keySize = this.options.keySize || 256
      // 使用密钥的SHA-256哈希作为确定性盐值（更安全）
      const salt = CryptoJS.SHA256(this.key)
      this.derivedKey = CryptoJS.PBKDF2(this.key, salt, {
        keySize: keySize / 32,
        iterations: 100000, // OWASP 2023推荐
      })
    }
  }

  /**
   * 处理数据块
   */
  async processChunk(chunk: Buffer): Promise<Buffer> {
    try {
      this.chunksProcessed++
      this.bytesProcessed += chunk.length

      // 将新数据追加到缓冲区
      this.buffer = Buffer.concat([this.buffer, chunk])

      // 累积数据后解密
      // 注意：解密时需要完整的加密块
      const minBufferSize = 1024 // 最小缓冲区大小

      if (this.buffer.length >= minBufferSize) {
        try {
          const decrypted = await this.decryptData(this.buffer.toString('base64'))
          this.buffer = Buffer.alloc(0)
          return Buffer.from(decrypted, 'utf8')
        }
        catch (error) {
          // 可能数据不完整，继续累积
          return Buffer.alloc(0)
        }
      }

      return Buffer.alloc(0)
    }
    catch (error) {
      this.errors++
      throw error
    }
  }

  /**
   * 完成处理（处理剩余数据）
   */
  async finalize(): Promise<Buffer | null> {
    try {
      if (this.buffer.length > 0) {
        const decrypted = await this.decryptData(this.buffer.toString('base64'))
        this.buffer = Buffer.alloc(0)
        return Buffer.from(decrypted, 'utf8')
      }
      return null
    }
    catch (error) {
      this.errors++
      throw error
    }
  }

  /**
   * 解密数据
   */
  private async decryptData(encryptedText: string): Promise<string> {
    switch (this.algorithm) {
      case 'AES': {
        const config = createCryptoJSConfig({
          mode: this.options.mode || 'CBC',
          padding: this.options.padding || 'Pkcs7',
          iv: this.options.iv,
        })

        const decrypted = CryptoJS.AES.decrypt(encryptedText, this.derivedKey!, config)
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

        if (!decryptedStr) {
          throw new Error('Decryption failed - invalid key or corrupted data')
        }

        return decryptedStr
      }

      case 'DES': {
        const config = createCryptoJSConfig({
          mode: this.options.mode || 'CBC',
          iv: this.options.iv,
        })
        const decrypted = CryptoJS.DES.decrypt(encryptedText, this.key, config)
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

        if (!decryptedStr) {
          throw new Error('Decryption failed')
        }

        return decryptedStr
      }

      case '3DES':
      case 'TRIPLEDES': {
        const config = createCryptoJSConfig({
          mode: this.options.mode || 'CBC',
          iv: this.options.iv,
        })
        const decrypted = CryptoJS.TripleDES.decrypt(encryptedText, this.key, config)
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

        if (!decryptedStr) {
          throw new Error('Decryption failed')
        }

        return decryptedStr
      }

      case 'RSA': {
        const forge = require('node-forge')
        const privateKey = forge.pki.privateKeyFromPem(this.key)
        const encrypted = forge.util.decode64(encryptedText)
        const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
        })
        return decrypted
      }

      default:
        throw new Error(`Unsupported algorithm for streaming: ${this.algorithm}`)
    }
  }

  /**
   * 重置处理器
   */
  reset(): void {
    this.buffer = Buffer.alloc(0)
    this.bytesProcessed = 0
    this.chunksProcessed = 0
    this.errors = 0
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      bytesProcessed: this.bytesProcessed,
      chunksProcessed: this.chunksProcessed,
      errors: this.errors,
    }
  }
}
