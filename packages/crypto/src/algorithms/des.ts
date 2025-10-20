import type {
  DecryptResult,
  DESOptions,
  EncryptResult,
  IEncryptor,
} from '../types'
import CryptoJS from 'crypto-js'
import { ErrorUtils, RandomUtils, ValidationUtils } from '../utils'

/**
 * DES 加密器
 */
export class DESEncryptor implements IEncryptor {
  private readonly defaultOptions: Required<DESOptions> = {
    mode: 'CBC',
    iv: '',
    padding: 'Pkcs7',
  }

  /**
   * DES 加密
   */
  encrypt(data: string, key: string, options: DESOptions = {}): EncryptResult {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError('Data cannot be empty', 'DES')
      }

      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError('Key cannot be empty', 'DES')
      }

      const opts = { ...this.defaultOptions, ...options }

      // 生成或使用提供的 IV
      const iv = opts.iv || RandomUtils.generateIV(8) // DES IV 长度为 8 字节
      const ivWordArray = CryptoJS.enc.Hex.parse(iv)

      // 准备密钥 (DES 密钥长度为 8 字节)
      const keyWordArray = this.prepareKey(key)

      // 选择加密模式
      const mode = this.getMode(opts.mode)

      // 加密配置
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray,
      }

      // 执行加密
      const encrypted = CryptoJS.DES.encrypt(data, keyWordArray, config)

      return {
        success: true,
        data: encrypted.toString(),
        algorithm: 'DES',
        mode: opts.mode,
        iv,
        keySize: 64, // DES 密钥大小为 64 位
      }
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, 'DES encryption'),
        algorithm: 'DES',
      }
    }
  }

  /**
   * DES 解密
   */
  decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options: DESOptions = {},
  ): DecryptResult {
    try {
      // 处理输入数据
      let ciphertext: string
      let iv: string | undefined

      if (typeof encryptedData === 'string') {
        ciphertext = encryptedData
        iv = options.iv
      } else {
        ciphertext = encryptedData.data || ''
        iv = encryptedData.iv || options.iv
      }

      if (ValidationUtils.isEmpty(ciphertext)) {
        throw ErrorUtils.createDecryptionError(
          'Encrypted data cannot be empty',
          'DES',
        )
      }

      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createDecryptionError('Key cannot be empty', 'DES')
      }

      const opts = { ...this.defaultOptions, ...options, iv }

      // 准备密钥
      const keyWordArray = this.prepareKey(key)

      // 准备 IV
      if (!opts.iv) {
        throw ErrorUtils.createDecryptionError(
          'IV is required for decryption',
          'DES',
        )
      }
      const ivWordArray = CryptoJS.enc.Hex.parse(opts.iv)

      // 选择解密模式
      const mode = this.getMode(opts.mode)

      // 解密配置
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray,
      }

      // 执行解密
      const decrypted = CryptoJS.DES.decrypt(ciphertext, keyWordArray, config)
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

      if (!decryptedText) {
        throw ErrorUtils.createDecryptionError(
          'Failed to decrypt data - invalid key or corrupted data',
          'DES',
        )
      }

      return {
        success: true,
        data: decryptedText,
        algorithm: 'DES',
        mode: opts.mode,
      }
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, 'DES decryption'),
        algorithm: 'DES',
      }
    }
  }

  /**
   * 准备密钥
   */
  private prepareKey(key: string): CryptoJS.lib.WordArray {
    // DES 密钥长度必须是 8 字节 (64 位)
    if (key.length < 8) {
      // 如果密钥太短，用零填充
      key = key.padEnd(8, '0')
    } else if (key.length > 8) {
      // 如果密钥太长，截取前 8 字节
      key = key.substring(0, 8)
    }

    return CryptoJS.enc.Utf8.parse(key)
  }

  /**
   * 获取加密模式
   */
  private getMode(mode: string): unknown {
    switch (mode.toUpperCase()) {
      case 'CBC':
        return CryptoJS.mode.CBC
      case 'ECB':
        return CryptoJS.mode.ECB
      case 'CFB':
        return CryptoJS.mode.CFB
      case 'OFB':
        return CryptoJS.mode.OFB
      default:
        return CryptoJS.mode.CBC
    }
  }
}

/**
 * DES 加密便捷函数
 */
export const des = {
  /**
   * 加密
   */
  encrypt: (data: string, key: string, options?: DESOptions): EncryptResult => {
    const encryptor = new DESEncryptor()
    return encryptor.encrypt(data, key, options)
  },

  /**
   * 解密
   */
  decrypt: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: DESOptions,
  ): DecryptResult => {
    const encryptor = new DESEncryptor()
    return encryptor.decrypt(encryptedData, key, options)
  },

  /**
   * 生成随机密钥
   */
  generateKey: (): string => {
    return RandomUtils.generateKey(8) // DES 密钥长度为 8 字节
  },
}
