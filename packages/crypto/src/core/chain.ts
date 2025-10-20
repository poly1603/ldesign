/**
 * 链式调用 API - 提供流畅的加解密操作体验
 *
 * 特性：
 * - 链式调用，代码更简洁
 * - 自动类型推导
 * - 支持加密、哈希、编码等所有操作
 * - 支持数据转换和格式化
 *
 * @example
 * ```typescript
 * // 加密并编码
 * const result = crypto.chain('hello world')
 *  .encrypt('AES', 'secret-key')
 *  .base64()
 *  .execute()
 *
 * // 解密
 * const decrypted = crypto.chain(result)
 *  .fromBase64()
 *  .decrypt('AES', 'secret-key')
 *  .execute()
 *
 * // 哈希链
 * const hash = crypto.chain('password')
 *  .hash('SHA256')
 *  .hash('SHA256') // 二次哈希
 *  .execute()
 * ```
 */

import type {
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  EncryptionAlgorithm,
  EncryptResult,
  HashAlgorithm,
  RSAOptions,
  TripleDESOptions,
} from '../types'
import { aes, blowfish, des, des3, encoding, Hasher, rsa  } from '../algorithms'

import { ErrorUtils } from '../utils'

/**
 * 链式操作结果类型
 */
type ChainData = string | EncryptResult

/**
 * CryptoChain - 链式加解密操作类
 * 优化：改进内存管理，减少字符串复制
 */
export class CryptoChain {
  private data: ChainData
  private errorOccurred = false
  private lastError?: Error
  // 内存优化：使用WeakRef避免循环引用
  private resultCache = new WeakMap<object, ChainData>()

  constructor(data: ChainData) {
    this.data = data
  }

  /**
   * 加密数据
   */
  encrypt(algorithm: 'AES', key: string, options?: AESOptions): CryptoChain
  encrypt(algorithm: 'RSA', key: string, options?: RSAOptions): CryptoChain
  encrypt(algorithm: 'DES' | '3DES', key: string, options?: Record<string, unknown>): CryptoChain
  encrypt(algorithm: EncryptionAlgorithm, key: string, options?: AESOptions | RSAOptions | Record<string, unknown>): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      let result: EncryptResult

      switch (algorithm.toUpperCase()) {
        case 'AES':
          result = aes.encrypt(text, key, options as AESOptions)
          break
        case 'RSA':
          result = rsa.encrypt(text, key, options as RSAOptions)
          break
        case 'DES':
          result = des.encrypt(text, key, options as DESOptions)
          break
        case '3DES':
          result = des3.encrypt(text, key, options as TripleDESOptions)
          break
        case 'BLOWFISH':
          result = blowfish.encrypt(text, key, options as BlowfishOptions)
          break
        default:
          throw ErrorUtils.createEncryptionError(
            `Unsupported algorithm: ${algorithm}`,
            'CHAIN'
          )
      }

      if (!result.success) {
        throw new Error(result.error || 'Encryption failed')
      }

      this.data = result
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * 解密数据
   */
  decrypt(algorithm: 'AES', key: string, options?: AESOptions): CryptoChain
  decrypt(algorithm: 'RSA', key: string, options?: RSAOptions): CryptoChain
  decrypt(algorithm: 'DES' | '3DES', key: string, options?: Record<string, unknown>): CryptoChain
  decrypt(algorithm: EncryptionAlgorithm, key: string, options?: AESOptions | RSAOptions | Record<string, unknown>): CryptoChain {
    if (this.errorOccurred) return this

    try {
      let result: DecryptResult

      switch (algorithm.toUpperCase()) {
        case 'AES':
          result = aes.decrypt(this.data, key, options as AESOptions)
          break
        case 'RSA':
          result = rsa.decrypt(this.data, key, options as RSAOptions)
          break
        case 'DES':
          result = des.decrypt(this.data, key, options as DESOptions)
          break
        case '3DES':
          result = des3.decrypt(this.data, key, options as TripleDESOptions)
          break
        case 'BLOWFISH':
          result = blowfish.decrypt(this.data, key, options as BlowfishOptions)
          break
        default:
          throw ErrorUtils.createDecryptionError(
            `Unsupported algorithm: ${algorithm}`,
            'CHAIN'
          )
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Decryption failed')
      }

      this.data = result.data
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * 哈希数据
   */
  hash(algorithm: HashAlgorithm = 'SHA256'): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const hasher = new Hasher()
      const text = this.getStringData()
      const result = hasher.hash(text, algorithm)

      if (!result.success) {
        throw new Error(result.error || 'Hashing failed')
      }

      this.data = result.hash
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * Base64 编码
   */
  base64(): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      this.data = encoding.encode(text, 'base64')
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * Base64 解码
   */
  fromBase64(): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      this.data = encoding.decode(text, 'base64')
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * Hex 编码
   */
  hex(): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      this.data = encoding.encode(text, 'hex')
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * Hex 解码
   */
  fromHex(): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      this.data = encoding.decode(text, 'hex')
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * 转大写
   */
  toUpperCase(): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      this.data = text.toUpperCase()
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * 转小写
   */
  toLowerCase(): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      this.data = text.toLowerCase()
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * JSON 序列化
   */
  toJSON<T>(obj: T): CryptoChain {
    if (this.errorOccurred) return this

    try {
      this.data = JSON.stringify(obj)
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * JSON 反序列化
   */
  fromJSON<T>(): T | null {
    if (this.errorOccurred) {
      throw this.lastError || new Error('Chain execution failed')
    }

    try {
      const text = this.getStringData()
      return JSON.parse(text) as T
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * 执行链式操作，返回最终结果
   */
  execute(): string {
    if (this.errorOccurred) {
      throw this.lastError || new Error('Chain execution failed')
    }

    return this.getStringData()
  }

  /**
   * 执行链式操作，返回 EncryptResult
   */
  executeAsResult(): EncryptResult | string {
    if (this.errorOccurred) {
      throw this.lastError || new Error('Chain execution failed')
    }

    return this.data
  }

  /**
   * 获取当前错误
   */
  getError(): Error | undefined {
    return this.lastError
  }

  /**
   * 检查是否发生错误
   */
  hasError(): boolean {
    return this.errorOccurred
  }

  /**
   * 清除错误状态，继续执行链
   */
  clearError(): CryptoChain {
    this.errorOccurred = false
    this.lastError = undefined
    return this
  }

  /**
   * 条件执行
   */
  if(condition: boolean, fn: (chain: CryptoChain) => CryptoChain): CryptoChain {
    if (condition && !this.errorOccurred) {
      return fn(this)
    }
    return this
  }

  /**
   * 自定义转换
   */
  transform(fn: (data: string) => string): CryptoChain {
    if (this.errorOccurred) return this

    try {
      const text = this.getStringData()
      this.data = fn(text)
      return this
    } catch (error) {
      this.handleError(error)
      return this
    }
  }

  /**
   * 获取字符串形式的数据
   */
  private getStringData(): string {
    if (typeof this.data === 'string') {
      return this.data
    }
    // EncryptResult 类型
    return this.data.data || ''
  }

  /**
   * 处理错误（优化内存使用）
   */
  private handleError(error: unknown): void {
    this.errorOccurred = true
    // 限制错误消息长度，避免内存泄漏
    const message = error instanceof Error 
      ? error.message.slice(0, 500) 
      : String(error).slice(0, 500)
    this.lastError = new Error(message)
  }
  
  /**
   * 清理内部状态，释放内存
   */
  dispose(): void {
    // 清理敏感数据
    if (typeof this.data === 'string') {
      this.data = ''
    } else if (this.data && typeof this.data === 'object') {
      this.data.data = ''
    }
    this.lastError = undefined
    this.resultCache = new WeakMap()
  }
}

/**
 * 创建链式调用实例
 */
export function chain(data: string | EncryptResult): CryptoChain {
  return new CryptoChain(data)
}

/**
 * 快捷加密方法 - 加密 + Base64 编码
 */
export function encryptToBase64(
  data: string,
  algorithm: EncryptionAlgorithm,
  key: string,
  options?: AESOptions | RSAOptions | Record<string, unknown>
): string {
  const chainInstance = chain(data)
  return chainInstance.encrypt(algorithm as 'AES', key, options as AESOptions).base64().execute()
}

/**
 * 快捷解密方法 - Base64 解码 + 解密
 */
export function decryptFromBase64(
  data: string,
  algorithm: EncryptionAlgorithm,
  key: string,
  options?: AESOptions | RSAOptions | Record<string, unknown>
): string {
  const chainInstance = chain(data).fromBase64()
  return chainInstance.decrypt(algorithm as 'AES', key, options as AESOptions).execute()
}

/**
 * 快捷 JSON 加密
 */
export function encryptJSON<T>(
  obj: T,
  algorithm: EncryptionAlgorithm,
  key: string,
  options?: AESOptions | RSAOptions | Record<string, unknown>
): string {
  const chainInstance = chain(JSON.stringify(obj))
  return chainInstance.encrypt(algorithm as 'AES', key, options as AESOptions).base64().execute()
}

/**
 * 快捷 JSON 解密
 */
export function decryptJSON<T>(
  data: string,
  algorithm: EncryptionAlgorithm,
  key: string,
  options?: AESOptions | RSAOptions | Record<string, unknown>
): T {
  const chainInstance = chain(data).fromBase64()
  const decrypted = chainInstance.decrypt(algorithm as 'AES', key, options as AESOptions).execute()
  return JSON.parse(decrypted) as T
}

/**
 * 密码哈希（多次）- 优化内存使用
 */
export function hashPassword(password: string, iterations = 10000): string {
  let chainInstance = chain(password)
  
  // 批量处理，减少中间对象创建
  const batchSize = 100
  for (let i = 0; i < iterations; i += batchSize) {
    const count = Math.min(batchSize, iterations - i)
    for (let j = 0; j < count; j++) {
      chainInstance = chainInstance.hash('SHA256')
    }
    // 定期清理，避免内存累积
    if (i % 1000 === 0 && i > 0) {
      const intermediate = chainInstance.execute()
      chainInstance.dispose()
      chainInstance = chain(intermediate)
    }
  }
  
  const result = chainInstance.execute()
  chainInstance.dispose()
  return result
}
