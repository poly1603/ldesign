import type {
  DecryptResult,
  EncryptResult,
  IEncryptor,
  TripleDESOptions,
} from '../types'
import CryptoJS from 'crypto-js'
import { ErrorUtils, RandomUtils, ValidationUtils } from '../utils'

/**
 * 3DES (Triple DES) 加密器
 */
export class TripleDESEncryptor implements IEncryptor {
  private readonly defaultOptions: Required<TripleDESOptions> = {
    mode: 'CBC',
    iv: '',
    padding: 'Pkcs7',
  }

  /**
   * 3DES 加密
   */
  encrypt(
    data: string,
    key: string,
    options: TripleDESOptions = {},
  ): EncryptResult {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError('Data cannot be empty', '3DES')
      }

      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError('Key cannot be empty', '3DES')
      }

      const opts = { ...this.defaultOptions, ...options }

      // 生成或使用提供的 IV
      const iv = opts.iv || RandomUtils.generateIV(8) // 3DES IV 长度为 8 字节
      const ivWordArray = CryptoJS.enc.Hex.parse(iv)

      // 准备密钥 (3DES 密钥长度为 24 字节)
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
      const encrypted = CryptoJS.TripleDES.encrypt(data, keyWordArray, config)

      return {
        success: true,
        data: encrypted.toString(),
        algorithm: '3DES',
        mode: opts.mode,
        iv,
        keySize: 192, // 3DES 密钥大小为 192 位
      }
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, '3DES encryption'),
        algorithm: '3DES',
      }
    }
  }

  /**
   * 3DES 解密
   */
  decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options: TripleDESOptions = {},
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
          '3DES',
        )
      }

      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createDecryptionError('Key cannot be empty', '3DES')
      }

      const opts = { ...this.defaultOptions, ...options, iv }

      // 准备 IV - 先检查 IV
      if (!opts.iv) {
        throw ErrorUtils.createDecryptionError(
          'IV is required for decryption',
          '3DES',
        )
      }

      // 验证加密数据格式（应该是有效的 Base64 或十六进制）
      if (
        !/^[A-Z0-9+/=]+$/i.test(ciphertext)
        && !/^[0-9a-f]+$/i.test(ciphertext)
      ) {
        throw ErrorUtils.createDecryptionError(
          'Invalid encrypted data format',
          '3DES',
        )
      }

      // 准备密钥
      const keyWordArray = this.prepareKey(key)
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
      let decrypted
      let decryptedText

      try {
        decrypted = CryptoJS.TripleDES.decrypt(ciphertext, keyWordArray, config)
        decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
      } catch {
        throw ErrorUtils.createDecryptionError(
          'Failed to decrypt data - invalid format or corrupted data',
          '3DES',
        )
      }

      if (!decryptedText || decryptedText.length === 0) {
        throw ErrorUtils.createDecryptionError(
          'Failed to decrypt data - invalid key or corrupted data',
          '3DES',
        )
      }

      return {
        success: true,
        data: decryptedText,
        algorithm: '3DES',
        mode: opts.mode,
      }
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, '3DES decryption'),
        algorithm: '3DES',
      }
    }
  }

  /**
   * 准备密钥
   */
  private prepareKey(key: string): CryptoJS.lib.WordArray {
    // 3DES 密钥长度应该是 24 字节 (192 位)
    if (key.length < 24) {
      // 如果密钥太短，重复密钥直到达到 24 字节
      while (key.length < 24) {
        key += key
      }
      key = key.substring(0, 24)
    } else if (key.length > 24) {
      // 如果密钥太长，截取前 24 字节
      key = key.substring(0, 24)
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
 * 3DES 加密便捷函数
 */
export const tripledes = {
  /**
   * 加密
   */
  encrypt: (
    data: string,
    key: string,
    options?: TripleDESOptions,
  ): EncryptResult => {
    const encryptor = new TripleDESEncryptor()
    return encryptor.encrypt(data, key, options)
  },

  /**
   * 解密
   */
  decrypt: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: TripleDESOptions,
  ): DecryptResult => {
    const encryptor = new TripleDESEncryptor()
    return encryptor.decrypt(encryptedData, key, options)
  },

  /**
   * 生成随机密钥
   */
  generateKey: (): string => {
    return RandomUtils.generateKey(24) // 3DES 密钥长度为 24 字节
  },
}

// 别名导出
export const des3 = tripledes
