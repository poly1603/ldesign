import type { HashAlgorithm, HashOptions, HashResult, IHasher } from '../types'
import CryptoJS from 'crypto-js'
import { CONSTANTS, ErrorUtils } from '../utils'

/**
 * 哈希器
 */
export class Hasher implements IHasher {
  private readonly defaultOptions: Required<HashOptions> = {
    encoding: CONSTANTS.ENCODING.DEFAULT,
  }

  /**
   * 计算哈希值
   */
  hash(
    data: string,
    algorithm: HashAlgorithm = 'SHA256',
    options: HashOptions = {},
  ): HashResult {
    try {
      // 允许空字符串哈希
      const opts = { ...this.defaultOptions, ...options }
      let hashFunction: (data: string) => CryptoJS.lib.WordArray

      // 选择哈希算法
      switch (algorithm.toUpperCase()) {
        case 'MD5':
          hashFunction = CryptoJS.MD5
          break
        case 'SHA1':
          hashFunction = CryptoJS.SHA1
          break
        case 'SHA224':
          hashFunction = CryptoJS.SHA224
          break
        case 'SHA256':
          hashFunction = CryptoJS.SHA256
          break
        case 'SHA384':
          hashFunction = CryptoJS.SHA384
          break
        case 'SHA512':
          hashFunction = CryptoJS.SHA512
          break
        default:
          throw ErrorUtils.createHashError(
            `Unsupported hash algorithm: ${algorithm}`,
          )
      }

      // 计算哈希
      const hashWordArray = hashFunction(data)

      // 根据编码类型转换输出
      let hashString: string
      switch (opts.encoding) {
        case 'base64':
          hashString = CryptoJS.enc.Base64.stringify(hashWordArray)
          break
        case 'hex':
          hashString = CryptoJS.enc.Hex.stringify(hashWordArray)
          break
        case 'utf8':
          hashString = CryptoJS.enc.Utf8.stringify(hashWordArray)
          break
        default:
          hashString = CryptoJS.enc.Hex.stringify(hashWordArray)
      }

      return {
        success: true,
        hash: hashString,
        algorithm,
        encoding: opts.encoding,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createHashError('Unknown hash error', algorithm)
    }
  }

  /**
   * 验证哈希值
   */
  verify(
    data: string,
    expectedHash: string,
    algorithm: HashAlgorithm = 'SHA256',
    options: HashOptions = {},
  ): boolean {
    try {
      const result = this.hash(data, algorithm, options)
      return result.hash === expectedHash
    } catch {
      return false
    }
  }

  /**
   * 计算文件哈希（模拟，实际应用中需要处理文件流）
   */
  hashFile(
    fileContent: string,
    algorithm: HashAlgorithm = 'SHA256',
    options: HashOptions = {},
  ): HashResult {
    return this.hash(fileContent, algorithm, options)
  }
}

/**
 * HMAC 哈希器
 */
export class HMACHasher {
  private readonly defaultOptions: Required<HashOptions> = {
    encoding: CONSTANTS.ENCODING.DEFAULT,
  }

  /**
   * 计算 HMAC
   */
  hmac(
    data: string,
    key: string,
    algorithm: HashAlgorithm = 'SHA256',
    options: HashOptions = {},
  ): HashResult {
    try {
      // 允许空字符串数据和空密钥（在某些场景下可能有用）
      // 但如果用户明确不想要空密钥，可以在调用前检查

      const opts = { ...this.defaultOptions, ...options }
      let hmacFunction: (data: string, key: string) => CryptoJS.lib.WordArray

      // 选择 HMAC 算法
      switch (algorithm.toUpperCase()) {
        case 'MD5':
          hmacFunction = CryptoJS.HmacMD5
          break
        case 'SHA1':
          hmacFunction = CryptoJS.HmacSHA1
          break
        case 'SHA224':
          hmacFunction = CryptoJS.HmacSHA224
          break
        case 'SHA256':
          hmacFunction = CryptoJS.HmacSHA256
          break
        case 'SHA384':
          hmacFunction = CryptoJS.HmacSHA384
          break
        case 'SHA512':
          hmacFunction = CryptoJS.HmacSHA512
          break
        default:
          throw ErrorUtils.createHashError(
            `Unsupported HMAC algorithm: ${algorithm}`,
          )
      }

      // 计算 HMAC
      const hmacWordArray = hmacFunction(data, key)

      // 根据编码类型转换输出
      let hmacString: string
      switch (opts.encoding) {
        case 'base64':
          hmacString = CryptoJS.enc.Base64.stringify(hmacWordArray)
          break
        case 'hex':
          hmacString = CryptoJS.enc.Hex.stringify(hmacWordArray)
          break
        case 'utf8':
          hmacString = CryptoJS.enc.Utf8.stringify(hmacWordArray)
          break
        default:
          hmacString = CryptoJS.enc.Hex.stringify(hmacWordArray)
      }

      return {
        success: true,
        hash: hmacString,
        algorithm: `HMAC-${algorithm}`,
        encoding: opts.encoding,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createHashError(
        'Unknown HMAC error',
        `HMAC-${algorithm}`,
      )
    }
  }

  /**
   * 验证 HMAC
   */
  verify(
    data: string,
    key: string,
    expectedHmac: string,
    algorithm: HashAlgorithm = 'SHA256',
    options: HashOptions = {},
  ): boolean {
    try {
      const result = this.hmac(data, key, algorithm, options)
      return result.hash === expectedHmac
    } catch {
      return false
    }
  }
}

/**
 * 哈希便捷函数
 */
export const hash = {
  /**
   * MD5 哈希
   */
  md5: (data: string, options?: HashOptions): string => {
    const hasher = new Hasher()
    return hasher.hash(data, 'MD5', options).hash
  },

  /**
   * SHA1 哈希
   */
  sha1: (data: string, options?: HashOptions): string => {
    const hasher = new Hasher()
    return hasher.hash(data, 'SHA1', options).hash
  },

  /**
   * SHA224 哈希
   */
  sha224: (data: string, options?: HashOptions): string => {
    const hasher = new Hasher()
    return hasher.hash(data, 'SHA224', options).hash
  },

  /**
   * SHA256 哈希
   */
  sha256: (data: string, options?: HashOptions): string => {
    const hasher = new Hasher()
    return hasher.hash(data, 'SHA256', options).hash
  },

  /**
   * SHA384 哈希
   */
  sha384: (data: string, options?: HashOptions): string => {
    const hasher = new Hasher()
    return hasher.hash(data, 'SHA384', options).hash
  },

  /**
   * SHA512 哈希
   */
  sha512: (data: string, options?: HashOptions): string => {
    const hasher = new Hasher()
    return hasher.hash(data, 'SHA512', options).hash
  },

  /**
   * 通用哈希函数
   */
  hash: (
    data: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): string => {
    const hasher = new Hasher()
    return hasher.hash(data, algorithm, options).hash
  },

  /**
   * 验证哈希
   */
  verify: (
    data: string,
    expectedHash: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): boolean => {
    const hasher = new Hasher()
    return hasher.verify(data, expectedHash, algorithm, options)
  },
}

/**
 * HMAC 便捷函数
 */
export const hmac = {
  /**
   * HMAC-MD5
   */
  md5: (data: string, key: string, options?: HashOptions): string => {
    const hasher = new HMACHasher()
    return hasher.hmac(data, key, 'MD5', options).hash
  },

  /**
   * HMAC-SHA1
   */
  sha1: (data: string, key: string, options?: HashOptions): string => {
    const hasher = new HMACHasher()
    return hasher.hmac(data, key, 'SHA1', options).hash
  },

  /**
   * HMAC-SHA256
   */
  sha256: (data: string, key: string, options?: HashOptions): string => {
    const hasher = new HMACHasher()
    return hasher.hmac(data, key, 'SHA256', options).hash
  },

  /**
   * HMAC-SHA384
   */
  sha384: (data: string, key: string, options?: HashOptions): string => {
    const hasher = new HMACHasher()
    return hasher.hmac(data, key, 'SHA384', options).hash
  },

  /**
   * HMAC-SHA512
   */
  sha512: (data: string, key: string, options?: HashOptions): string => {
    const hasher = new HMACHasher()
    return hasher.hmac(data, key, 'SHA512', options).hash
  },

  /**
   * 验证 HMAC
   */
  verify: (
    data: string,
    key: string,
    expectedHmac: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): boolean => {
    const hasher = new HMACHasher()
    return hasher.verify(data, key, expectedHmac, algorithm, options)
  },
}
