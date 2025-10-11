import CryptoJS from 'crypto-js'
import type {
  AESOptions,
  DecryptResult,
  EncryptResult,
  IEncryptor,
} from '../types'
import { CONSTANTS, ErrorUtils, RandomUtils, ValidationUtils } from '../utils'
import { LRUCache } from '../utils/lru-cache'

/**
 * AES 加密器
 * 优化：添加密钥派生缓存，减少重复计算
 */
export class AESEncryptor implements IEncryptor {
  private readonly defaultOptions: Required<AESOptions> = {
    mode: CONSTANTS.AES.DEFAULT_MODE,
    keySize: CONSTANTS.AES.DEFAULT_KEY_SIZE,
    iv: '',
    padding: 'Pkcs7',
  }

  /**
   * 获取默认选项（公开方法，用于外部访问）
   */
  static getDefaultOptions(): Required<AESOptions> {
    return {
      mode: CONSTANTS.AES.DEFAULT_MODE,
      keySize: CONSTANTS.AES.DEFAULT_KEY_SIZE,
      iv: '',
      padding: 'Pkcs7',
    }
  }

  // 密钥派生缓存（最多缓存 100 个派生密钥，5 分钟过期）
  // 使用静态缓存，所有实例共享，提高缓存命中率
  private static keyCache = new LRUCache<string, CryptoJS.lib.WordArray>({
    maxSize: 100,
    ttl: 5 * 60 * 1000,
    updateAgeOnGet: true,
  })

  /**
   * AES 加密
   *
   * @param data 明文字符串（允许为空字符串）
   * @param key 加密密钥；可传入普通字符串（将通过 PBKDF2-SHA256 派生），或十六进制字符串（长度需与 keySize 匹配）
   * @param options 可选项：mode、keySize、iv（十六进制）、padding
   * @returns EncryptResult 包含加密后字符串（默认使用 CryptoJS 默认格式，通常为 Base64）以及算法、模式、IV 等信息
   *
   * @example
   * ```ts
   * const res = new AESEncryptor().encrypt('hello', 'secret', { keySize: 256, mode: 'CBC' })
   * if (res.success) console.log(res.data)
   * ```
   */
  encrypt(data: string, key: string, options: AESOptions = {}): EncryptResult {
    const opts = { ...this.defaultOptions, ...options }

    try {
      // 允许空字符串数据，但不允许空密钥
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError('Key cannot be empty', 'AES')
      }

      // 验证密钥长度
      if (opts.keySize && ![128, 192, 256].includes(opts.keySize)) {
        throw ErrorUtils.createEncryptionError('Invalid key size. Must be 128, 192, or 256', 'AES')
      }

      // 验证加密模式
      const validModes = ['CBC', 'ECB', 'CFB', 'OFB', 'CTR']
      if (opts.mode && !validModes.includes(opts.mode)) {
        throw ErrorUtils.createEncryptionError(`Invalid mode. Must be one of: ${validModes.join(', ')}`, 'AES')
      }

      // 验证IV长度（如果提供）- IV是十六进制字符串，所以长度应该是字节数的2倍
      if (opts.iv && opts.iv.length !== CONSTANTS.AES.IV_LENGTH * 2) {
        throw ErrorUtils.createEncryptionError(`Invalid IV length. Must be ${CONSTANTS.AES.IV_LENGTH * 2} characters (hex)`, 'AES')
      }

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
        success: true,
        data: encrypted.toString(),
        algorithm: 'AES',
        mode: opts.mode,
        keySize: opts.keySize,
        iv,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createEncryptionError('Unknown encryption error', 'AES')
    }
  }

  /**
   * AES 解密
   *
   * @param encryptedData 加密后的字符串，或加密结果对象（包含算法、模式、iv、keySize 等）
   * @param key 解密密钥；规则与加密相同
   * @param options 可选项：mode、keySize、iv（十六进制）、padding。若传入字符串且未提供 iv，将尝试使用 CryptoJS 默认格式自动解析
   * @returns DecryptResult 包含解密后的明文字符串
   *
   * @example
   * ```ts
   * const enc = new AESEncryptor().encrypt('hello', 'secret')
   * const dec = new AESEncryptor().decrypt(enc, 'secret')
   * ```
   */
  decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options: AESOptions = {},
  ): DecryptResult {
    const opts = { ...this.defaultOptions, ...options }

    try {
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createDecryptionError('Key cannot be empty', 'AES')
      }
      let ciphertext: string
      let iv: string
      let actualKeySize = opts.keySize
      let actualMode = opts.mode

      // 处理输入数据
      if (typeof encryptedData === 'string') {
        ciphertext = encryptedData
        iv = opts.iv

        // 对于字符串输入，如果没有提供IV，尝试使用CryptoJS的默认解密方式
        if (!iv) {
          try {
            // 首先验证输入是否为有效的Base64格式
            try {
              CryptoJS.enc.Base64.parse(encryptedData)
            } catch {
              throw ErrorUtils.createDecryptionError(
                'Invalid encrypted data format - not valid Base64',
                'AES',
              )
            }

            const decrypted = CryptoJS.AES.decrypt(encryptedData, key)
            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)

            // 检查解密是否成功：sigBytes应该大于等于0
            if (decrypted.sigBytes < 0) {
              throw ErrorUtils.createDecryptionError(
                'Failed to decrypt data - invalid key or corrupted data',
                'AES',
              )
            }

            // 对于非空解密结果，进行额外验证
            if (!this.validateUtf8String(decryptedString)) {
              throw ErrorUtils.createDecryptionError(
                'Decrypted data contains invalid characters - wrong key',
                'AES',
              )
            }

            return {
              success: true,
              data: decryptedString,
              algorithm: 'AES',
              mode: opts.mode,
            }
          } catch (error) {
            if (error instanceof Error) {
              return {
                success: false,
                data: '',
                algorithm: 'AES',
                mode: opts.mode,
                error: error.message,
              }
            }
            return {
              success: false,
              data: '',
              algorithm: 'AES',
              mode: opts.mode,
              error: 'Unknown decryption error',
            }
          }
        }
      } else {
        ciphertext = encryptedData.data || ''
        iv = encryptedData.iv || opts.iv
        // 从加密结果中获取实际使用的参数
        actualKeySize = (encryptedData.keySize as any) || opts.keySize
        actualMode = (encryptedData.mode as any) || opts.mode
        if (!iv) {
          throw ErrorUtils.createDecryptionError(
            'IV not found in encrypted data',
            'AES',
          )
        }
      }

      // 准备密钥和 IV
      const keyWordArray = this.prepareKey(key, actualKeySize)
      const ivWordArray = CryptoJS.enc.Hex.parse(iv)

      // 选择加密模式
      const mode = this.getMode(actualMode)

      // 解密配置
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray,
      }

      // 执行解密
      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, config)
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)

      // 检查解密是否成功
      // 如果解密失败，decrypted.sigBytes 会是负数
      if (decrypted.sigBytes < 0) {
        throw ErrorUtils.createDecryptionError(
          'Failed to decrypt data - invalid key or corrupted data',
          'AES',
        )
      }

      // 对于非空解密结果，进行额外验证
      if (!this.validateUtf8String(decryptedString)) {
        throw ErrorUtils.createDecryptionError(
          'Decrypted data contains invalid characters - wrong key',
          'AES',
        )
      }

      return {
        success: true,
        data: decryptedString,
        algorithm: 'AES',
        mode: actualMode,
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: 'AES',
          mode: opts.mode,
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: 'AES',
        mode: opts.mode,
        error: 'Unknown decryption error',
      }
    }
  }

  /**
   * 验证 UTF-8 字符串有效性
   * 优化：提取为独立方法，避免代码重复
   */
  private validateUtf8String(str: string): boolean {
    if (str.length === 0) {
      return true
    }

    try {
      // 尝试重新编码以验证UTF-8有效性
      const testEncode = CryptoJS.enc.Utf8.parse(str)
      const reEncoded = testEncode.toString(CryptoJS.enc.Utf8)
      return reEncoded === str
    } catch {
      return false
    }
  }

  /**
   * 准备密钥
   * 优化：使用 LRU 缓存，自动管理缓存大小和过期
   */
  private prepareKey(key: string, keySize: number): CryptoJS.lib.WordArray {
    // 生成缓存键（使用哈希避免长密钥导致的内存问题）
    const cacheKey = CryptoJS.MD5(`${key}_${keySize}`).toString()

    // 检查缓存
    const cachedKey = AESEncryptor.keyCache.get(cacheKey)
    if (cachedKey) {
      return cachedKey
    }

    let keyWordArray: CryptoJS.lib.WordArray

    // 如果密钥是十六进制字符串，直接解析
    if (ValidationUtils.isValidHex(key)) {
      keyWordArray = CryptoJS.enc.Hex.parse(key)
      // 确保密钥长度正确
      if (keyWordArray.sigBytes * 8 === keySize) {
        AESEncryptor.keyCache.set(cacheKey, keyWordArray)
        return keyWordArray
      }
    }

    // 否则，使用固定盐值的 PBKDF2 派生密钥，确保相同输入产生相同密钥
    const salt = CryptoJS.enc.Utf8.parse('ldesign-crypto-salt')
    keyWordArray = CryptoJS.PBKDF2(key, salt, {
      keySize: keySize / 32,
      iterations: 1000,
    }) as CryptoJS.lib.WordArray

    // 缓存派生的密钥（LRU 缓存会自动管理大小）
    AESEncryptor.keyCache.set(cacheKey, keyWordArray)

    return keyWordArray
  }

  /**
   * 获取加密模式
   */
  private getMode(mode?: string): any {
    if (!mode) {
      return CryptoJS.mode.CBC
    }
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
    try {
      const encryptor = new AESEncryptor()
      return encryptor.encrypt(data, key, options)
    } catch (error) {
      const opts = { ...AESEncryptor.getDefaultOptions(), ...options }
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: 'AES',
          mode: opts.mode,
          keySize: opts.keySize,
          iv: '',
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: 'AES',
        mode: opts.mode,
        keySize: opts.keySize,
        iv: '',
        error: 'Unknown encryption error',
      }
    }
  },

  /**
   * AES 解密
   */
  decrypt: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: AESOptions,
  ): DecryptResult => {
    try {
      const encryptor = new AESEncryptor()
      return encryptor.decrypt(encryptedData, key, options)
    } catch (error) {
      const opts = { ...AESEncryptor.getDefaultOptions(), ...options }
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: 'AES',
          mode: opts.mode,
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: 'AES',
        mode: opts.mode,
        error: 'Unknown decryption error',
      }
    }
  },

  /**
   * AES-128 加密
   */
  encrypt128: (
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult => {
    return aes.encrypt(data, key, { ...options, keySize: 128 })
  },

  /**
   * AES-192 加密
   */
  encrypt192: (
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult => {
    return aes.encrypt(data, key, { ...options, keySize: 192 })
  },

  /**
   * AES-256 加密
   */
  encrypt256: (
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult => {
    return aes.encrypt(data, key, { ...options, keySize: 256 })
  },

  /**
   * AES-128 解密
   */
  decrypt128: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 128 })
  },

  /**
   * AES-192 解密
   */
  decrypt192: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 192 })
  },

  /**
   * AES-256 解密
   */
  decrypt256: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 256 })
  },
}
