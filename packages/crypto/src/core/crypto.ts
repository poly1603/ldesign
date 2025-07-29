import CryptoJS from 'crypto-js'
import type {
  EncryptionConfig,
  EncryptionResult,
  DecryptionResult,
  EncryptionAlgorithm,
  EncodingFormat
} from '../types'
import { validateEncryptionConfig } from '../utils'

/**
 * 加密解密核心类
 */
export class Crypto {
  private defaultConfig: Partial<EncryptionConfig> = {
    outputFormat: EncodingFormat.BASE64
  }

  /**
   * 设置默认配置
   */
  setDefaultConfig(config: Partial<EncryptionConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * 加密数据
   */
  encrypt(data: string, config: EncryptionConfig): EncryptionResult {
    const finalConfig = { ...this.defaultConfig, ...config }
    validateEncryptionConfig(finalConfig as EncryptionConfig)

    try {
      let encrypted: CryptoJS.lib.CipherParams
      let iv: string | undefined

      switch (finalConfig.algorithm) {
        case EncryptionAlgorithm.AES:
          if (finalConfig.iv) {
            const ivWordArray = CryptoJS.enc.Utf8.parse(finalConfig.iv)
            encrypted = CryptoJS.AES.encrypt(data, finalConfig.key!, {
              iv: ivWordArray,
              mode: this.getMode(finalConfig.mode),
              padding: this.getPadding(finalConfig.padding)
            })
            iv = finalConfig.iv
          } else {
            encrypted = CryptoJS.AES.encrypt(data, finalConfig.key!)
          }
          break

        case EncryptionAlgorithm.DES:
          if (finalConfig.iv) {
            const ivWordArray = CryptoJS.enc.Utf8.parse(finalConfig.iv)
            encrypted = CryptoJS.DES.encrypt(data, finalConfig.key!, {
              iv: ivWordArray,
              mode: this.getMode(finalConfig.mode),
              padding: this.getPadding(finalConfig.padding)
            })
            iv = finalConfig.iv
          } else {
            encrypted = CryptoJS.DES.encrypt(data, finalConfig.key!)
          }
          break

        case EncryptionAlgorithm.TRIPLE_DES:
          if (finalConfig.iv) {
            const ivWordArray = CryptoJS.enc.Utf8.parse(finalConfig.iv)
            encrypted = CryptoJS.TripleDES.encrypt(data, finalConfig.key!, {
              iv: ivWordArray,
              mode: this.getMode(finalConfig.mode),
              padding: this.getPadding(finalConfig.padding)
            })
            iv = finalConfig.iv
          } else {
            encrypted = CryptoJS.TripleDES.encrypt(data, finalConfig.key!)
          }
          break

        case EncryptionAlgorithm.RC4:
          encrypted = CryptoJS.RC4.encrypt(data, finalConfig.key!)
          break

        case EncryptionAlgorithm.RABBIT:
          encrypted = CryptoJS.Rabbit.encrypt(data, finalConfig.key!)
          break

        default:
          throw new Error(`Unsupported encryption algorithm: ${finalConfig.algorithm}`)
      }

      const result = this.formatOutput(encrypted.toString(), finalConfig.outputFormat!)

      return {
        encrypted: result,
        algorithm: finalConfig.algorithm!,
        iv,
        format: finalConfig.outputFormat!
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData: string, config: EncryptionConfig): DecryptionResult {
    const finalConfig = { ...this.defaultConfig, ...config }
    validateEncryptionConfig(finalConfig as EncryptionConfig)

    try {
      let decrypted: CryptoJS.lib.WordArray

      switch (finalConfig.algorithm) {
        case EncryptionAlgorithm.AES:
          if (finalConfig.iv) {
            const ivWordArray = CryptoJS.enc.Utf8.parse(finalConfig.iv)
            decrypted = CryptoJS.AES.decrypt(encryptedData, finalConfig.key!, {
              iv: ivWordArray,
              mode: this.getMode(finalConfig.mode),
              padding: this.getPadding(finalConfig.padding)
            })
          } else {
            decrypted = CryptoJS.AES.decrypt(encryptedData, finalConfig.key!)
          }
          break

        case EncryptionAlgorithm.DES:
          if (finalConfig.iv) {
            const ivWordArray = CryptoJS.enc.Utf8.parse(finalConfig.iv)
            decrypted = CryptoJS.DES.decrypt(encryptedData, finalConfig.key!, {
              iv: ivWordArray,
              mode: this.getMode(finalConfig.mode),
              padding: this.getPadding(finalConfig.padding)
            })
          } else {
            decrypted = CryptoJS.DES.decrypt(encryptedData, finalConfig.key!)
          }
          break

        case EncryptionAlgorithm.TRIPLE_DES:
          if (finalConfig.iv) {
            const ivWordArray = CryptoJS.enc.Utf8.parse(finalConfig.iv)
            decrypted = CryptoJS.TripleDES.decrypt(encryptedData, finalConfig.key!, {
              iv: ivWordArray,
              mode: this.getMode(finalConfig.mode),
              padding: this.getPadding(finalConfig.padding)
            })
          } else {
            decrypted = CryptoJS.TripleDES.decrypt(encryptedData, finalConfig.key!)
          }
          break

        case EncryptionAlgorithm.RC4:
          decrypted = CryptoJS.RC4.decrypt(encryptedData, finalConfig.key!)
          break

        case EncryptionAlgorithm.RABBIT:
          decrypted = CryptoJS.Rabbit.decrypt(encryptedData, finalConfig.key!)
          break

        default:
          throw new Error(`Unsupported encryption algorithm: ${finalConfig.algorithm}`)
      }

      const result = decrypted.toString(CryptoJS.enc.Utf8)

      return {
        decrypted: result,
        algorithm: finalConfig.algorithm!,
        success: result.length > 0
      }
    } catch (error) {
      return {
        decrypted: '',
        algorithm: finalConfig.algorithm!,
        success: false
      }
    }
  }

  /**
   * 获取加密模式
   */
  private getMode(mode?: string): any {
    switch (mode?.toUpperCase()) {
      case 'ECB':
        return CryptoJS.mode.ECB
      case 'CFB':
        return CryptoJS.mode.CFB
      case 'CTR':
        return CryptoJS.mode.CTR
      case 'OFB':
        return CryptoJS.mode.OFB
      case 'CBC':
      default:
        return CryptoJS.mode.CBC
    }
  }

  /**
   * 获取填充模式
   */
  private getPadding(padding?: string): any {
    switch (padding?.toLowerCase()) {
      case 'nopadding':
        return CryptoJS.pad.NoPadding
      case 'zeropadding':
        return CryptoJS.pad.ZeroPadding
      case 'iso10126':
        return CryptoJS.pad.Iso10126
      case 'iso97971':
        return CryptoJS.pad.Iso97971
      case 'ansix923':
        return CryptoJS.pad.AnsiX923
      case 'pkcs7':
      default:
        return CryptoJS.pad.Pkcs7
    }
  }

  /**
   * 格式化输出
   */
  private formatOutput(data: string, format: EncodingFormat): string {
    switch (format) {
      case EncodingFormat.HEX:
        return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Hex)
      case EncodingFormat.BASE64URL:
        return data.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
      case EncodingFormat.BASE64:
      default:
        return data
    }
  }

  /**
   * 生成随机密钥
   */
  generateKey(length = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString()
  }

  /**
   * 生成随机IV
   */
  generateIV(length = 16): string {
    return CryptoJS.lib.WordArray.random(length).toString()
  }
}