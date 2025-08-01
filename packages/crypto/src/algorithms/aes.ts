import type { AESOptions, DecryptResult, EncryptResult, IEncryptor } from '../types'
import CryptoJS from 'crypto-js'
import { CONSTANTS, ErrorUtils, RandomUtils, ValidationUtils } from '../utils'

/**
 * AES 加密器
 */
export class AESEncryptor implements IEncryptor {
  private readonly defaultOptions: Required<AESOptions> = {
    mode: CONSTANTS.AES.DEFAULT_MODE,
    keySize: CONSTANTS.AES.DEFAULT_KEY_SIZE,
    iv: '',
    padding: 'Pkcs7',
  }

  /**
   * AES 加密
   */
  encrypt(data: string, key: string, options: AESOptions = {}): EncryptResult {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError('Data cannot be empty', 'AES')
      }

      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError('Key cannot be empty', 'AES')
      }

      const opts = { ...this.defaultOptions, ...options }

      // 生成或使用提供的 IV
      const iv = opts.iv || RandomUtils.generateIV(CONSTANTS.AES.IV_LENGTH)
      const ivWordArray = CryptoJS.enc.Hex.parse(iv)

      // 准备密钥
      const keyWordArray = this.prepareKey(key, opts.keySize)

      // 选择加密模式
      const mode = this.getMode(opts.mode)

      // 加密配置
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray,
      }

      // 执行加密
      const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, config)

      return {
        data: encrypted.toString(),
        algorithm: `AES-${opts.keySize}-${opts.mode}`,
        iv,
      }
    }
    catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createEncryptionError('Unknown encryption error', 'AES')
    }
  }

  /**
   * AES 解密
   */
  decrypt(encryptedData: string | EncryptResult, key: string, options: AESOptions = {}): DecryptResult {
    try {
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createDecryptionError('Key cannot be empty', 'AES')
      }

      const opts = { ...this.defaultOptions, ...options }
      let ciphertext: string
      let iv: string

      // 处理输入数据
      if (typeof encryptedData === 'string') {
        ciphertext = encryptedData
        iv = opts.iv
        if (!iv) {
          throw ErrorUtils.createDecryptionError('IV is required for decryption', 'AES')
        }
      }
      else {
        ciphertext = encryptedData.data
        iv = encryptedData.iv || opts.iv
        if (!iv) {
          throw ErrorUtils.createDecryptionError('IV not found in encrypted data', 'AES')
        }
      }

      // 准备密钥和 IV
      const keyWordArray = this.prepareKey(key, opts.keySize)
      const ivWordArray = CryptoJS.enc.Hex.parse(iv)

      // 选择加密模式
      const mode = this.getMode(opts.mode)

      // 解密配置
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray,
      }

      // 执行解密
      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, config)
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)

      if (!decryptedString) {
        throw ErrorUtils.createDecryptionError('Failed to decrypt data - invalid key or corrupted data', 'AES')
      }

      return {
        data: decryptedString,
        success: true,
      }
    }
    catch (error) {
      if (error instanceof Error) {
        return {
          data: '',
          success: false,
          error: error.message,
        }
      }
      return {
        data: '',
        success: false,
        error: 'Unknown decryption error',
      }
    }
  }

  /**
   * 准备密钥
   */
  private prepareKey(key: string, keySize: number): CryptoJS.lib.WordArray {
    // 如果密钥是十六进制字符串，直接解析
    if (ValidationUtils.isValidHex(key)) {
      const keyWordArray = CryptoJS.enc.Hex.parse(key)
      // 确保密钥长度正确
      if (keyWordArray.sigBytes * 8 === keySize) {
        return keyWordArray
      }
    }

    // 否则，使用固定盐值的 PBKDF2 派生密钥，确保相同输入产生相同密钥
    const salt = CryptoJS.enc.Utf8.parse('ldesign-crypto-salt')
    return CryptoJS.PBKDF2(key, salt, {
      keySize: keySize / 32,
      iterations: 1000,
    })
  }

  /**
   * 获取加密模式
   */
  private getMode(mode: string): any {
    switch (mode.toUpperCase()) {
      case 'CBC':
        return CryptoJS.mode.CBC
      case 'ECB':
        return CryptoJS.mode.ECB
      case 'CFB':
        return CryptoJS.mode.CFB
      case 'OFB':
        return CryptoJS.mode.OFB
      case 'CTR':
        return CryptoJS.mode.CTR
      default:
        return CryptoJS.mode.CBC
    }
  }
}

/**
 * AES 加密便捷函数
 */
export const aes = {
  /**
   * AES 加密
   */
  encrypt: (data: string, key: string, options?: AESOptions): EncryptResult => {
    const encryptor = new AESEncryptor()
    return encryptor.encrypt(data, key, options)
  },

  /**
   * AES 解密
   */
  decrypt: (encryptedData: string | EncryptResult, key: string, options?: AESOptions): DecryptResult => {
    const encryptor = new AESEncryptor()
    return encryptor.decrypt(encryptedData, key, options)
  },

  /**
   * AES-128 加密
   */
  encrypt128: (data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult => {
    return aes.encrypt(data, key, { ...options, keySize: 128 })
  },

  /**
   * AES-192 加密
   */
  encrypt192: (data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult => {
    return aes.encrypt(data, key, { ...options, keySize: 192 })
  },

  /**
   * AES-256 加密
   */
  encrypt256: (data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult => {
    return aes.encrypt(data, key, { ...options, keySize: 256 })
  },

  /**
   * AES-128 解密
   */
  decrypt128: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 128 })
  },

  /**
   * AES-192 解密
   */
  decrypt192: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 192 })
  },

  /**
   * AES-256 解密
   */
  decrypt256: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 256 })
  },
}
