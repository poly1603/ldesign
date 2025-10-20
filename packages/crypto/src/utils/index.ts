import type { EncodingType } from '../types'
import CryptoJS from 'crypto-js'

export * from './advanced-validation'

/**
 * 字符串转换工具
 *
 * 提供字符串与常见编码（Base64、Hex、Utf8）之间的转换便捷方法。
 */
export class StringUtils {
  /**
   * 字符串转 WordArray
   * @param str 输入的 UTF-8 字符串
   * @returns CryptoJS 的 WordArray 表示
   */
  static stringToWordArray(str: string): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Utf8.parse(str)
  }

  /**
   * WordArray 转字符串
   * @param wordArray CryptoJS WordArray
   * @returns UTF-8 字符串
   */
  static wordArrayToString(wordArray: CryptoJS.lib.WordArray): string {
    return CryptoJS.enc.Utf8.stringify(wordArray)
  }

  /**
   * 字符串转 Base64
   * @param str 输入 UTF-8 字符串
   * @returns Base64 字符串
   */
  static stringToBase64(str: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str))
  }

  /**
   * Base64 转字符串
   * @param base64 Base64 字符串
   * @returns UTF-8 字符串
   */
  static base64ToString(base64: string): string {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64))
  }

  /**
   * 字符串转 Hex
   * @param str 输入 UTF-8 字符串
   * @returns 十六进制字符串
   */
  static stringToHex(str: string): string {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(str))
  }

  /**
   * Hex 转字符串
   * @param hex 十六进制字符串
   * @returns UTF-8 字符串
   */
  static hexToString(hex: string): string {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(hex))
  }

  /**
   * 根据编码类型转换字符串
   * @param str 输入 UTF-8 字符串
   * @param encoding 'base64' | 'hex' | 'utf8'
   */
  static encodeString(str: string, encoding: EncodingType): string {
    switch (encoding) {
      case 'base64':
        return this.stringToBase64(str)
      case 'hex':
        return this.stringToHex(str)
      case 'utf8':
      default:
        return str
    }
  }

  /**
   * 根据编码类型解码字符串
   * @param encodedStr 已编码的字符串
   * @param encoding 'base64' | 'hex' | 'utf8'
   */
  static decodeString(encodedStr: string, encoding: EncodingType): string {
    switch (encoding) {
      case 'base64':
        return this.base64ToString(encodedStr)
      case 'hex':
        return this.hexToString(encodedStr)
      case 'utf8':
      default:
        return encodedStr
    }
  }
}

/**
 * 随机数生成工具
 */
export class RandomUtils {
  /**
   * 生成随机字节
   * @param length 字节长度
   */
  static generateRandomBytes(length: number): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(length)
  }

  /**
   * 生成随机字符串
   * @param length 字节长度（将被转换为不同编码的字符串）
   * @param encoding 输出编码类型：'base64' | 'hex' | 'utf8'（默认 hex）
   */
  static generateRandomString(
    length: number,
    encoding: EncodingType = 'hex',
  ): string {
    const randomBytes = this.generateRandomBytes(length)
    switch (encoding) {
      case 'base64':
        return CryptoJS.enc.Base64.stringify(randomBytes)
      case 'hex':
        return CryptoJS.enc.Hex.stringify(randomBytes)
      case 'utf8':
        return CryptoJS.enc.Utf8.stringify(randomBytes)
      default:
        return CryptoJS.enc.Hex.stringify(randomBytes)
    }
  }

  /**
   * 生成盐值
   * @param length 盐值字节长度（默认 16）
   * @returns 十六进制字符串
   */
  static generateSalt(length: number = 16): string {
    return this.generateRandomString(length, 'hex')
  }

  /**
   * 生成初始化向量 (IV)
   * @param length IV 字节长度（默认 16）
   * @returns 十六进制字符串
   */
  static generateIV(length: number = 16): string {
    return this.generateRandomString(length, 'hex')
  }

  /**
   * 生成随机密钥
   * @param length 期望的字节长度，返回的十六进制字符串长度为 length * 2
   * @returns 十六进制字符串
   */
  static generateKey(length: number = 32): string {
    // length 是字节长度，生成对应的十六进制字符串（长度为 length * 2）
    return this.generateRandomString(length, 'hex')
  }
}

/**
 * 验证工具
 */
export class ValidationUtils {
  /**
   * 验证字符串是否为空
   * @param str 目标字符串
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0
  }

  /**
   * 验证是否为有效的 Base64 字符串
   * 兼容浏览器与 Node 环境（无 atob/btoa 时使用正则与 CryptoJS 校验）
   * @param str Base64 字符串
   */
  static isValidBase64(str: string): boolean {
    if (typeof str !== 'string') { return false }
    // 允许空字符串作为有效 Base64（某些场景下编码空字符串）
    if (str.length === 0) { return true }

    // 基础格式校验：长度为 4 的倍数，允许 0~2 个 '=' 结尾填充
    if (str.length % 4 !== 0) { return false }
    if (!/^[A-Z0-9+/]+={0,2}$/i.test(str)) { return false }

    // 优先尝试浏览器原生 API（若存在）
    try {
      // 在浏览器环境优先使用原生 API
      if (typeof atob === 'function' && typeof btoa === 'function') {
        return btoa(atob(str)) === str
      }
    }
    catch {
      // 若原生 API 失败，继续使用 CryptoJS 进行校验
    }

    // 使用 CryptoJS 进行安全的解析/回写校验
    try {
      const wa = CryptoJS.enc.Base64.parse(str)
      const roundtrip = CryptoJS.enc.Base64.stringify(wa)
      // 去除末尾填充后比较，避免等价的不同填充形式导致误判
      return roundtrip.replace(/=+$/, '') === str.replace(/=+$/, '')
    }
    catch {
      return false
    }
  }

  /**
   * 验证是否为有效的 Hex 字符串
   * @param str 十六进制字符串
   */
  static isValidHex(str: string): boolean {
    // 空字符串是有效的Hex字符串
    if (str === '') { return true }
    return /^[0-9a-f]+$/i.test(str) && str.length % 2 === 0
  }

  /**
   * 验证密钥长度
   * @param key 密钥字符串
   * @param expectedLength 期望字节长度
   */
  static validateKeyLength(key: string, expectedLength: number): boolean {
    return key.length === expectedLength
  }

  /**
   * 验证 AES 密钥长度
   * @param key 明文密钥字符串
   * @param keySize 位数（128/192/256）
   */
  static validateAESKeyLength(key: string, keySize: number): boolean {
    const expectedLength = keySize / 8 // 转换为字节长度
    return key.length >= expectedLength
  }
}

/**
 * 错误处理工具
 */
export class ErrorUtils {
  /**
   * 创建加密错误
   */
  static createEncryptionError(message: string, algorithm?: string): Error {
    const error = new Error(
      `Encryption Error${algorithm ? ` (${algorithm})` : ''}: ${message}`,
    )
    error.name = 'EncryptionError'
    return error
  }

  /**
   * 创建解密错误
   */
  static createDecryptionError(message: string, algorithm?: string): Error {
    const error = new Error(
      `Decryption Error${algorithm ? ` (${algorithm})` : ''}: ${message}`,
    )
    error.name = 'DecryptionError'
    return error
  }

  /**
   * 创建哈希错误
   */
  static createHashError(message: string, algorithm?: string): Error {
    const error = new Error(
      `Hash Error${algorithm ? ` (${algorithm})` : ''}: ${message}`,
    )
    error.name = 'HashError'
    return error
  }

  /**
   * 创建验证错误
   */
  static createValidationError(message: string): Error {
    const error = new Error(`Validation Error: ${message}`)
    error.name = 'ValidationError'
    return error
  }

  /**
   * 处理错误
   */
  static handleError(error: unknown, context?: string): string {
    const message = error instanceof Error ? error.message : String(error)
    return context ? `${context}: ${message}` : message
  }
}

/**
 * 常量定义
 */
export const CONSTANTS = {
  // AES 相关常量
  AES: {
    KEY_SIZES: [128, 192, 256] as const,
    MODES: ['CBC', 'ECB', 'CFB', 'OFB', 'CTR', 'GCM'] as const,
    DEFAULT_MODE: 'CBC' as const,
    DEFAULT_KEY_SIZE: 256 as const,
    IV_LENGTH: 16,
  },

  // RSA 相关常量
  RSA: {
    KEY_SIZES: [1024, 2048, 3072, 4096] as const,
    DEFAULT_KEY_SIZE: 2048 as const,
  },

  // 哈希相关常量
  HASH: {
    ALGORITHMS: [
      'MD5',
      'SHA1',
      'SHA224',
      'SHA256',
      'SHA384',
      'SHA512',
    ] as const,
  },

  // HMAC 相关常量
  HMAC: {
    ALGORITHMS: [
      'HMAC-MD5',
      'HMAC-SHA1',
      'HMAC-SHA256',
      'HMAC-SHA384',
      'HMAC-SHA512',
    ] as const,
  },

  // 编码相关常量
  ENCODING: {
    TYPES: ['base64', 'hex', 'utf8'] as const,
    DEFAULT: 'hex' as const,
  },
} as const

export * from './benchmark'
// 导出新增实用工具
export * from './compression'
export * from './crypto-helpers'
export * from './errors'
export * from './key-derivation'
export * from './key-rotation'
// 导出 LRU 缓存
export { LRUCache, type LRUCacheOptions } from './lru-cache'
export * from './object-pool'
export * from './performance-logger'
export * from './rate-limiter'
export * from './secure-storage'
