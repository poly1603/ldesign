import type {
  DecryptResult,
  EncryptionAlgorithm,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  RSAKeyPair,
} from '../types'

import { Decrypt, Encrypt, Hash, HMAC, KeyGenerator } from './crypto'
import {
  type BatchOperation,
  type BatchResult,
  PerformanceOptimizer,
} from './performance'

/**
 * 加密配置选项
 */
export interface CryptoConfig {
  // 默认算法
  defaultAlgorithm?: EncryptionAlgorithm

  // 性能优化选项
  enableCache?: boolean
  maxCacheSize?: number
  enableParallel?: boolean

  // 安全选项
  autoGenerateIV?: boolean
  keyDerivation?: boolean

  // 调试选项
  debug?: boolean
  logLevel?: 'error' | 'warn' | 'info' | 'debug'
}

/**
 * 统一的加解密管理器（CryptoManager）
 *
 * 在 Encrypt/Decrypt/Hash/HMAC/KeyGenerator 基础上提供更易用的一致入口，并内置批量、并行与结果缓存等性能优化能力。
 *
 * 能力概览：
 * - encryptData/decryptData：统一算法选择与错误捕获，返回标准结构体
 * - batchEncrypt/batchDecrypt：可按配置启用并行（Web Worker/模拟）
 * - 配置项：默认算法、缓存、并行、自动 IV、KDF、调试日志等级等
 * - 性能：通过 PerformanceOptimizer 统计与缓存，getPerformanceStats 获取指标
 *
 * 使用示例：
 * ```ts
 * import { cryptoManager } from '@ldesign/crypto'
 * const enc = await cryptoManager.encryptData('hello', 'secret', 'AES')
 * const dec = await cryptoManager.decryptData(enc, 'secret')
 * ```
 */
export class CryptoManager {
  private encrypt: Encrypt
  private decrypt: Decrypt
  private hash: Hash
  private hmac: HMAC
  private keyGenerator: KeyGenerator
  private optimizer: PerformanceOptimizer
  private config: Required<CryptoConfig>

  constructor(config: CryptoConfig = {}) {
    this.config = {
      defaultAlgorithm: 'AES',
      enableCache: true,
      maxCacheSize: 1000,
      enableParallel: true,
      autoGenerateIV: true,
      keyDerivation: false,
      debug: false,
      logLevel: 'error',
      ...config,
    }

    this.encrypt = new Encrypt()
    this.decrypt = new Decrypt()
    this.hash = new Hash()
    this.hmac = new HMAC()
    this.keyGenerator = new KeyGenerator()
    this.optimizer = new PerformanceOptimizer()

    this.log('info', 'CryptoManager initialized', this.config)
  }

  /**
   * 简化的加密方法
   */
  async encryptData(
    data: string,
    key: string,
    algorithm?: EncryptionAlgorithm,
    options?: Record<string, unknown>,
  ): Promise<EncryptResult> {
    const targetAlgorithm = algorithm || this.config?.defaultAlgorithm

    try {
      this.log('debug', `Encrypting data with ${targetAlgorithm}`)

      const result = this.encrypt.encrypt(data, key, targetAlgorithm, options)

      this.log('debug', 'Encryption completed', {
        algorithm: targetAlgorithm,
        success: result.success,
      })

      return result
    }
    catch (error) {
      this.log('error', 'Encryption failed', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown encryption error',
        algorithm: targetAlgorithm,
      }
    }
  }

  /**
   * 简化的解密方法
   */
  async decryptData(
    encryptedData: string | EncryptResult,
    key: string,
    algorithm?: EncryptionAlgorithm,
    options?: Record<string, unknown>,
  ): Promise<DecryptResult> {
    try {
      this.log('debug', 'Decrypting data')

      const result = this.decrypt.decrypt(
        encryptedData,
        key,
        algorithm,
        options,
      )

      this.log('debug', 'Decryption completed', { success: result.success })

      return result
    }
    catch (error) {
      this.log('error', 'Decryption failed', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown decryption error',
        algorithm: algorithm || 'Unknown',
      }
    }
  }

  /**
   * 批量加密
   */
  async batchEncrypt(
    operations: BatchOperation[],
  ): Promise<Array<{ id: string, result: EncryptResult }>> {
    if (!this.config?.enableParallel || operations.length <= 1) {
      // 串行处理
      const results = []
      for (const op of operations) {
        const result = await this.encryptData(
          op.data,
          op.key,
          op.algorithm,
          op.options,
        )
        results.push({ id: op.id, result })
      }
      return results
    }

    // 并行处理
    return this.optimizer.batchEncrypt(operations)
  }

  /**
   * 批量解密
   */
  async batchDecrypt(
    operations: BatchOperation[],
  ): Promise<Array<{ id: string, result: DecryptResult }>> {
    if (!this.config?.enableParallel || operations.length <= 1) {
      // 串行处理
      const results = []
      for (const op of operations) {
        const result = await this.decryptData(
          op.data,
          op.key,
          op.algorithm,
          op.options,
        )
        results.push({ id: op.id, result })
      }
      return results
    }

    // 并行处理
    return this.optimizer.batchDecrypt(operations)
  }

  /**
   * 哈希计算
   */
  hashData(
    data: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): string {
    return this.hash.hash(data, algorithm, options).hash
  }

  /**
   * HMAC 计算
   */
  hmacData(
    data: string,
    key: string,
    algorithm: HashAlgorithm = 'SHA256',
  ): string {
    // 直接调用对应的 HMAC 方法
    switch (algorithm) {
      case 'MD5':
        return this.hmac.md5(data, key)
      case 'SHA1':
        return this.hmac.sha1(data, key)
      case 'SHA256':
        return this.hmac.sha256(data, key)
      case 'SHA384':
        return this.hmac.sha384(data, key)
      case 'SHA512':
        return this.hmac.sha512(data, key)
      default:
        return this.hmac.sha256(data, key)
    }
  }

  /**
   * 生成密钥
   */
  generateKey(
    algorithm: EncryptionAlgorithm,
    keySize?: number,
  ): string | RSAKeyPair {
    switch (algorithm.toUpperCase()) {
      case 'AES':
        return this.keyGenerator.generateKey((keySize || 256) / 8)
      case 'RSA': {
        const rsaKeySize = (keySize as 1024 | 2048 | 3072 | 4096 | undefined) || 2048
        return this.keyGenerator.generateRSAKeyPair(rsaKeySize)
      }
      case 'DES':
        return this.keyGenerator.generateRandomBytes(8)
      case '3DES':
        return this.keyGenerator.generateRandomBytes(24)
      case 'BLOWFISH':
        return this.keyGenerator.generateRandomBytes(keySize || 16)
      default:
        throw new Error(
          `Unsupported algorithm for key generation: ${algorithm}`,
        )
    }
  }

  /**
   * 获取支持的算法列表
   */
  getSupportedAlgorithms(): EncryptionAlgorithm[] {
    return ['AES', 'RSA', 'DES', '3DES', 'Blowfish']
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): import('./performance').CacheStats {
    return this.optimizer.getCacheStats()
  }

  /**
   * 获取缓存统计（别名）
   */
  getCacheStats(): import('./performance').CacheStats {
    return this.optimizer.getCacheStats()
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): import('./performance').PerformanceMetrics {
    return this.optimizer.getPerformanceMetrics()
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(): number {
    const cleaned = this.optimizer.cleanupCache()
    this.log('info', `Cleaned ${cleaned} expired cache entries`)
    return cleaned
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.optimizer.clearCache()
    this.log('info', 'Cache cleared')
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<CryptoConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.log('info', 'Configuration updated', newConfig)
  }

  /**
   * 获取当前配置
   */
  getConfig(): CryptoConfig {
    return { ...this.config }
  }

  /**
   * 日志记录
   */
  private log(
    level: 'error' | 'warn' | 'info' | 'debug',
    message: string,
    data?: unknown,
  ): void {
    if (!this.config?.debug) { return }

    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.config?.logLevel)
    const messageLevelIndex = levels.indexOf(level)

    if (messageLevelIndex <= currentLevelIndex) {
      // 日志输出在浏览器库中禁用，避免控制台污染
      // 可在集成方通过注入自定义 logger 实现
      void level
      void message
      void data
    }
  }
}

// 导出默认实例
export const cryptoManager = new CryptoManager()

// 重新导出类型
export type { BatchOperation, BatchResult }
