import type { EncodingType } from '../types'
import CryptoJS from 'crypto-js'

/**
 * 字符串转换工具
 */
export class StringUtils {
  /**
   * 字符串转 WordArray
   */
  static stringToWordArray(str: string): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Utf8.parse(str)
  }

  /**
   * WordArray 转字符串
   */
  static wordArrayToString(wordArray: CryptoJS.lib.WordArray): string {
    return CryptoJS.enc.Utf8.stringify(wordArray)
  }

  /**
   * 字符串转 Base64
   */
  static stringToBase64(str: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str))
  }

  /**
   * Base64 转字符串
   */
  static base64ToString(base64: string): string {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64))
  }

  /**
   * 字符串转 Hex
   */
  static stringToHex(str: string): string {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(str))
  }

  /**
   * Hex 转字符串
   */
  static hexToString(hex: string): string {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(hex))
  }

  /**
   * 根据编码类型转换字符串
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
   */
  static generateRandomBytes(length: number): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(length)
  }

  /**
   * 生成随机字符串
   */
  static generateRandomString(length: number, encoding: EncodingType = 'hex'): string {
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
   */
  static generateSalt(length: number = 16): string {
    return this.generateRandomString(length, 'hex')
  }

  /**
   * 生成初始化向量 (IV)
   */
  static generateIV(length: number = 16): string {
    return this.generateRandomString(length, 'hex')
  }

  /**
   * 生成随机密钥
   */
  static generateKey(length: number = 32): string {
    return this.generateRandomString(length, 'hex')
  }
}

/**
 * 验证工具
 */
export class ValidationUtils {
  /**
   * 验证字符串是否为空
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0
  }

  /**
   * 验证是否为有效的 Base64 字符串
   */
  static isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str
    }
    catch {
      return false
    }
  }

  /**
   * 验证是否为有效的 Hex 字符串
   */
  static isValidHex(str: string): boolean {
    return /^[0-9a-f]+$/i.test(str) && str.length % 2 === 0
  }

  /**
   * 验证密钥长度
   */
  static validateKeyLength(key: string, expectedLength: number): boolean {
    return key.length === expectedLength
  }

  /**
   * 验证 AES 密钥长度
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
    const error = new Error(`Encryption Error${algorithm ? ` (${algorithm})` : ''}: ${message}`)
    error.name = 'EncryptionError'
    return error
  }

  /**
   * 创建解密错误
   */
  static createDecryptionError(message: string, algorithm?: string): Error {
    const error = new Error(`Decryption Error${algorithm ? ` (${algorithm})` : ''}: ${message}`)
    error.name = 'DecryptionError'
    return error
  }

  /**
   * 创建哈希错误
   */
  static createHashError(message: string, algorithm?: string): Error {
    const error = new Error(`Hash Error${algorithm ? ` (${algorithm})` : ''}: ${message}`)
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
    ALGORITHMS: ['MD5', 'SHA1', 'SHA224', 'SHA256', 'SHA384', 'SHA512'] as const,
  },

  // HMAC 相关常量
  HMAC: {
    ALGORITHMS: ['HMAC-MD5', 'HMAC-SHA1', 'HMAC-SHA256', 'HMAC-SHA384', 'HMAC-SHA512'] as const,
  },

  // 编码相关常量
  ENCODING: {
    TYPES: ['base64', 'hex', 'utf8'] as const,
    DEFAULT: 'hex' as const,
  },
} as const
