import type { EncodingType, IEncoder } from '../types'
import CryptoJS from 'crypto-js'
import { ErrorUtils, ValidationUtils } from '../utils'

/**
 * 编码器
 * 优化：使用单例模式，避免重复创建实例
 */
export class Encoder implements IEncoder {
  private static instance: Encoder | null = null

  /**
   * 获取单例实例
   */
  static getInstance(): Encoder {
    if (!Encoder.instance) {
      Encoder.instance = new Encoder()
    }
    return Encoder.instance
  }

  /**
   * 私有构造函数，防止外部直接实例化
   */
  private constructor() { }

  /**
   * 编码字符串
   */
  encode(data: string, encoding: EncodingType): string {
    try {
      // 允许空字符串编码
      switch (encoding.toLowerCase()) {
        case 'base64':
          return this.encodeBase64(data)
        case 'hex':
          return this.encodeHex(data)
        case 'utf8':
          return data // UTF-8 是默认编码，无需转换
        default:
          throw ErrorUtils.createEncryptionError(
            `Unsupported encoding type: ${encoding}`,
            'Encoding',
          )
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createEncryptionError(
        'Unknown encoding error',
        'Encoding',
      )
    }
  }

  /**
   * 解码字符串
   */
  decode(encodedData: string, encoding: EncodingType): string {
    try {
      // 允许空字符串解码，空字符串的编码结果解码后应该还是空字符串
      switch (encoding.toLowerCase()) {
        case 'base64':
          return this.decodeBase64(encodedData)
        case 'hex':
          return this.decodeHex(encodedData)
        case 'utf8':
          return encodedData // UTF-8 是默认编码，无需转换
        default:
          throw ErrorUtils.createDecryptionError(
            `Unsupported encoding type: ${encoding}`,
            'Decoding',
          )
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createDecryptionError(
        'Unknown decoding error',
        'Decoding',
      )
    }
  }

  /**
   * Base64 编码
   */
  private encodeBase64(data: string): string {
    try {
      // 优先使用浏览器原生 API
      if (typeof btoa !== 'undefined') {
        return btoa(unescape(encodeURIComponent(data)))
      } else {
        // 使用 CryptoJS 作为后备
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
      }
    } catch {
      throw ErrorUtils.createEncryptionError(
        'Failed to encode Base64',
        'Base64',
      )
    }
  }

  /**
   * Base64 解码
   */
  private decodeBase64(encodedData: string): string {
    try {
      // 验证 Base64 格式
      if (!ValidationUtils.isValidBase64(encodedData)) {
        throw ErrorUtils.createDecryptionError(
          'Invalid Base64 format',
          'Base64',
        )
      }

      // 优先使用浏览器原生 API
      if (typeof atob !== 'undefined') {
        return decodeURIComponent(escape(atob(encodedData)))
      } else {
        // 使用 CryptoJS 作为后备
        return CryptoJS.enc.Utf8.stringify(
          CryptoJS.enc.Base64.parse(encodedData),
        )
      }
    } catch {
      throw ErrorUtils.createDecryptionError(
        'Failed to decode Base64',
        'Base64',
      )
    }
  }

  /**
   * Hex 编码
   */
  private encodeHex(data: string): string {
    try {
      // 使用 CryptoJS
      return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(data))
    } catch {
      throw ErrorUtils.createEncryptionError('Failed to encode Hex', 'Hex')
    }
  }

  /**
   * Hex 解码
   */
  private decodeHex(encodedData: string): string {
    try {
      // 验证 Hex 格式
      if (!ValidationUtils.isValidHex(encodedData)) {
        throw ErrorUtils.createDecryptionError('Invalid Hex format', 'Hex')
      }

      // 使用 CryptoJS
      return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(encodedData))
    } catch {
      throw ErrorUtils.createDecryptionError('Failed to decode Hex', 'Hex')
    }
  }

  /**
   * URL 安全的 Base64 编码
   */
  encodeBase64Url(data: string): string {
    const base64 = this.encodeBase64(data)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  /**
   * URL 安全的 Base64 解码
   */
  decodeBase64Url(encodedData: string): string {
    // 恢复标准 Base64 格式
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/')

    // 添加必要的填充
    const padding = base64.length % 4
    if (padding) {
      base64 += '='.repeat(4 - padding)
    }

    return this.decodeBase64(base64)
  }
}

/**
 * 编码便捷函数
 * 优化：使用单例实例，避免重复创建
 */
export const encoding = {
  /**
   * Base64 编码
   */
  base64: {
    encode: (data: string): string => {
      return Encoder.getInstance().encode(data, 'base64')
    },
    decode: (encodedData: string): string => {
      return Encoder.getInstance().decode(encodedData, 'base64')
    },
    encodeUrl: (data: string): string => {
      return Encoder.getInstance().encodeBase64Url(data)
    },
    decodeUrl: (encodedData: string): string => {
      return Encoder.getInstance().decodeBase64Url(encodedData)
    },
  },

  /**
   * Hex 编码
   */
  hex: {
    encode: (data: string): string => {
      return Encoder.getInstance().encode(data, 'hex')
    },
    decode: (encodedData: string): string => {
      return Encoder.getInstance().decode(encodedData, 'hex')
    },
  },

  /**
   * 通用编码函数
   */
  encode: (data: string, encoding: EncodingType): string => {
    return Encoder.getInstance().encode(data, encoding)
  },

  /**
   * 通用解码函数
   */
  decode: (encodedData: string, encoding: EncodingType): string => {
    return Encoder.getInstance().decode(encodedData, encoding)
  },
}

/**
 * 向后兼容的别名
 */
export const base64 = encoding.base64
export const hex = encoding.hex
