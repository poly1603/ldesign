import CryptoJS from 'crypto-js'
import type {
  HashConfig,
  HashResult,
  HMACConfig,
  HashAlgorithm,
  HMACAlgorithm,
  EncodingFormat
} from '../types'
import { validateHashConfig, validateHMACConfig } from '../utils'

/**
 * 哈希处理核心类
 */
export class Hash {
  private defaultConfig: Partial<HashConfig> = {
    outputFormat: EncodingFormat.HEX,
    uppercase: false
  }

  /**
   * 设置默认配置
   */
  setDefaultConfig(config: Partial<HashConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * 计算哈希值
   */
  hash(data: string, config: HashConfig): HashResult {
    const finalConfig = { ...this.defaultConfig, ...config }
    validateHashConfig(finalConfig as HashConfig)

    try {
      let hash: CryptoJS.lib.WordArray

      switch (finalConfig.algorithm) {
        case HashAlgorithm.MD5:
          hash = CryptoJS.MD5(data)
          break
        case HashAlgorithm.SHA1:
          hash = CryptoJS.SHA1(data)
          break
        case HashAlgorithm.SHA256:
          hash = CryptoJS.SHA256(data)
          break
        case HashAlgorithm.SHA512:
          hash = CryptoJS.SHA512(data)
          break
        case HashAlgorithm.SHA3:
          hash = CryptoJS.SHA3(data)
          break
        case HashAlgorithm.RIPEMD160:
          hash = CryptoJS.RIPEMD160(data)
          break
        default:
          throw new Error(`Unsupported hash algorithm: ${finalConfig.algorithm}`)
      }

      let result = this.formatHashOutput(hash, finalConfig.outputFormat!)
      
      if (finalConfig.uppercase) {
        result = result.toUpperCase()
      }

      return {
        hash: result,
        algorithm: finalConfig.algorithm!,
        format: finalConfig.outputFormat!
      }
    } catch (error) {
      throw new Error(`Hash calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 计算HMAC
   */
  hmac(data: string, config: HMACConfig): HashResult {
    validateHMACConfig(config)

    try {
      let hmac: CryptoJS.lib.WordArray

      switch (config.algorithm) {
        case HMACAlgorithm.HMAC_MD5:
          hmac = CryptoJS.HmacMD5(data, config.key)
          break
        case HMACAlgorithm.HMAC_SHA1:
          hmac = CryptoJS.HmacSHA1(data, config.key)
          break
        case HMACAlgorithm.HMAC_SHA256:
          hmac = CryptoJS.HmacSHA256(data, config.key)
          break
        case HMACAlgorithm.HMAC_SHA512:
          hmac = CryptoJS.HmacSHA512(data, config.key)
          break
        default:
          throw new Error(`Unsupported HMAC algorithm: ${config.algorithm}`)
      }

      let result = this.formatHashOutput(hmac, config.outputFormat || EncodingFormat.HEX)
      
      if (config.uppercase) {
        result = result.toUpperCase()
      }

      return {
        hash: result,
        algorithm: config.algorithm as any,
        format: config.outputFormat || EncodingFormat.HEX
      }
    } catch (error) {
      throw new Error(`HMAC calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 格式化哈希输出
   */
  private formatHashOutput(hash: CryptoJS.lib.WordArray, format: EncodingFormat): string {
    switch (format) {
      case EncodingFormat.HEX:
        return hash.toString(CryptoJS.enc.Hex)
      case EncodingFormat.BASE64:
        return hash.toString(CryptoJS.enc.Base64)
      case EncodingFormat.BASE64URL:
        return hash.toString(CryptoJS.enc.Base64)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')
      case EncodingFormat.UTF8:
        return hash.toString(CryptoJS.enc.Utf8)
      case EncodingFormat.LATIN1:
        return hash.toString(CryptoJS.enc.Latin1)
      default:
        return hash.toString(CryptoJS.enc.Hex)
    }
  }

  /**
   * MD5哈希（快捷方法）
   */
  md5(data: string, uppercase = false): string {
    const result = this.hash(data, {
      algorithm: HashAlgorithm.MD5,
      outputFormat: EncodingFormat.HEX,
      uppercase
    })
    return result.hash
  }

  /**
   * SHA1哈希（快捷方法）
   */
  sha1(data: string, uppercase = false): string {
    const result = this.hash(data, {
      algorithm: HashAlgorithm.SHA1,
      outputFormat: EncodingFormat.HEX,
      uppercase
    })
    return result.hash
  }

  /**
   * SHA256哈希（快捷方法）
   */
  sha256(data: string, uppercase = false): string {
    const result = this.hash(data, {
      algorithm: HashAlgorithm.SHA256,
      outputFormat: EncodingFormat.HEX,
      uppercase
    })
    return result.hash
  }

  /**
   * SHA512哈希（快捷方法）
   */
  sha512(data: string, uppercase = false): string {
    const result = this.hash(data, {
      algorithm: HashAlgorithm.SHA512,
      outputFormat: EncodingFormat.HEX,
      uppercase
    })
    return result.hash
  }

  /**
   * 验证哈希值
   */
  verify(data: string, expectedHash: string, config: HashConfig): boolean {
    try {
      const result = this.hash(data, config)
      return result.hash.toLowerCase() === expectedHash.toLowerCase()
    } catch {
      return false
    }
  }

  /**
   * 验证HMAC
   */
  verifyHMAC(data: string, expectedHMAC: string, config: HMACConfig): boolean {
    try {
      const result = this.hmac(data, config)
      return result.hash.toLowerCase() === expectedHMAC.toLowerCase()
    } catch {
      return false
    }
  }
}