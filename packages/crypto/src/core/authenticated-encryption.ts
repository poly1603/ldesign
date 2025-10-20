/**
 * 认证加密（Authenticated Encryption with Associated Data - AEAD）
 *
 * 特性：
 * - 同时提供机密性（加密）和完整性（认证）
 * - 防止数据篡改和中间人攻击
 * - 支持附加认证数据（AAD）
 * - 使用 AES-GCM 或 AES+HMAC 组合
 *
 * @example
 * ```typescript
 * // 加密并认证
 * const result = encryptWithAuth('sensitive data', 'secret-key')
 *
 * // 解密并验证
 * const decrypted = decryptWithAuth(result, 'secret-key')
 * if (decrypted.verified) {
 *   
 * }
 * ```
 */

import type { EncryptionAlgorithm } from '../types'
import CryptoJS from 'crypto-js'
import { ErrorUtils, RandomUtils } from '../utils'

/**
 * 认证加密结果
 */
export interface AuthenticatedEncryptResult {
  success: boolean
  /** 加密数据（Base64） */
  ciphertext: string
  /** 认证标签（HMAC） */
  authTag: string
  /** 初始化向量 */
  iv: string
  /** 盐值 */
  salt: string
  /** 算法 */
  algorithm: string
  /** 附加认证数据（可选） */
  aad?: string
  /** 错误信息 */
  error?: string
}

/**
 * 认证解密结果
 */
export interface AuthenticatedDecryptResult {
  success: boolean
  /** 解密后的数据 */
  data: string
  /** 认证是否通过 */
  verified: boolean
  /** 错误信息 */
  error?: string
}

/**
 * 认证加密选项
 */
export interface AuthenticatedEncryptionOptions {
  /** 加密算法，默认 AES */
  algorithm?: EncryptionAlgorithm
  /** 密钥大小（位），默认 256 */
  keySize?: 256 | 128 | 192
  /** 附加认证数据（不加密但需要认证） */
  aad?: string
  /** 是否使用 GCM 模式（如果为 false 则使用 CBC+HMAC） */
  useGCM?: boolean
}

/**
 * 认证加密类
 */
export class AuthenticatedEncryption {
  /**
   * 加密并认证数据
   */
  encrypt(
    data: string,
    key: string,
    options: AuthenticatedEncryptionOptions = {}
  ): AuthenticatedEncryptResult {
    const {
      algorithm = 'AES',
      keySize = 256,
      aad,
    } = options

    try {
      if (algorithm.toUpperCase() !== 'AES') {
        throw ErrorUtils.createEncryptionError(
          'Authenticated encryption currently only supports AES algorithm',
          'AEAD'
        )
      }

      // 生成 IV 和 salt
      const iv = RandomUtils.generateIV(16)
      const salt = RandomUtils.generateSalt(32)

      // 派生加密密钥和认证密钥
      const saltWordArray = CryptoJS.enc.Hex.parse(salt)
      const derivedKeys = CryptoJS.PBKDF2(key, saltWordArray, {
        keySize: (keySize / 32) * 2, // 需要两倍大小（加密+认证）
        iterations: 100000,
      })

      // 分割为加密密钥和认证密钥
      const encryptionKey = CryptoJS.lib.WordArray.create(
        derivedKeys.words.slice(0, keySize / 32)
      )
      const authKey = CryptoJS.lib.WordArray.create(
        derivedKeys.words.slice(keySize / 32)
      )

      // 执行加密
      const ivWordArray = CryptoJS.enc.Hex.parse(iv)
      const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC, // 使用CBC模式（GCM在CryptoJS中需要额外配置）
        padding: CryptoJS.pad.Pkcs7,
      })

      const ciphertext = encrypted.toString()

      // 计算认证标签（HMAC）
      const authData = ciphertext + iv + salt + (aad || '')
      const authTag = CryptoJS.HmacSHA256(authData, authKey).toString()

      return {
        success: true,
        ciphertext,
        authTag,
        iv,
        salt,
        algorithm: 'AES',
        aad,
      }
    } catch (error) {
      return {
        success: false,
        ciphertext: '',
        authTag: '',
        iv: '',
        salt: '',
        algorithm,
        error: error instanceof Error ? error.message : 'Authenticated encryption failed',
      }
    }
  }

  /**
   * 解密并验证数据
   */
  decrypt(
    encryptedResult: AuthenticatedEncryptResult | string,
    key: string,
    options: AuthenticatedEncryptionOptions = {}
  ): AuthenticatedDecryptResult {
    try {
      // 解析输入
      let result: AuthenticatedEncryptResult
      if (typeof encryptedResult === 'string') {
        // 尝试从 JSON 字符串解析
        try {
          result = JSON.parse(encryptedResult) as AuthenticatedEncryptResult
        } catch {
          throw ErrorUtils.createDecryptionError(
            'Invalid encrypted data format',
            'AEAD'
          )
        }
      } else {
        result = encryptedResult
      }

      const { ciphertext, authTag, iv, salt, aad } = result
      const { keySize = 256 } = options

      // 派生加密密钥和认证密钥
      const saltWordArray = CryptoJS.enc.Hex.parse(salt)
      const derivedKeys = CryptoJS.PBKDF2(key, saltWordArray, {
        keySize: (keySize / 32) * 2,
        iterations: 100000,
      })

      const encryptionKey = CryptoJS.lib.WordArray.create(
        derivedKeys.words.slice(0, keySize / 32)
      )
      const authKey = CryptoJS.lib.WordArray.create(
        derivedKeys.words.slice(keySize / 32)
      )

      // 验证认证标签
      const authData = ciphertext + iv + salt + (aad || '')
      const computedAuthTag = CryptoJS.HmacSHA256(authData, authKey).toString()

      if (computedAuthTag !== authTag) {
        return {
          success: false,
          data: '',
          verified: false,
          error: 'Authentication verification failed - data may have been tampered with',
        }
      }

      // 解密数据
      const ivWordArray = CryptoJS.enc.Hex.parse(iv)
      const decrypted = CryptoJS.AES.decrypt(ciphertext, encryptionKey, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC, // 使用CBC模式
        padding: CryptoJS.pad.Pkcs7,
      })

      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

      if (!decryptedStr) {
        return {
          success: false,
          data: '',
          verified: false,
          error: 'Decryption failed - invalid key or corrupted data',
        }
      }

      return {
        success: true,
        data: decryptedStr,
        verified: true,
      }
    } catch (error) {
      return {
        success: false,
        data: '',
        verified: false,
        error: error instanceof Error ? error.message : 'Authenticated decryption failed',
      }
    }
  }

  /**
   * 序列化加密结果为 JSON
   */
  serializeResult(result: AuthenticatedEncryptResult): string {
    return JSON.stringify(result)
  }

  /**
   * 从 JSON 反序列化加密结果
   */
  deserializeResult(json: string): AuthenticatedEncryptResult {
    return JSON.parse(json) as AuthenticatedEncryptResult
  }
}

/**
 * 创建认证加密实例
 */
export const authenticatedEncryption = new AuthenticatedEncryption()

/**
 * 快捷方法：加密并认证
 */
export function encryptWithAuth(
  data: string,
  key: string,
  options?: AuthenticatedEncryptionOptions
): AuthenticatedEncryptResult {
  return authenticatedEncryption.encrypt(data, key, options)
}

/**
 * 快捷方法：解密并验证
 */
export function decryptWithAuth(
  encryptedData: AuthenticatedEncryptResult | string,
  key: string,
  options?: AuthenticatedEncryptionOptions
): AuthenticatedDecryptResult {
  return authenticatedEncryption.decrypt(encryptedData, key, options)
}

/**
 * 快捷方法：加密 JSON 对象并认证
 */
export function encryptJSONWithAuth<T>(
  obj: T,
  key: string,
  options?: AuthenticatedEncryptionOptions
): string {
  const result = authenticatedEncryption.encrypt(JSON.stringify(obj), key, options)
  return authenticatedEncryption.serializeResult(result)
}

/**
 * 快捷方法：解密并验证 JSON 对象
 */
export function decryptJSONWithAuth<T>(
  encryptedData: string,
  key: string,
  options?: AuthenticatedEncryptionOptions
): { data: T | null, verified: boolean, error?: string } {
  const result = authenticatedEncryption.decrypt(encryptedData, key, options)

  if (!result.success || !result.verified) {
    return {
      data: null,
      verified: false,
      error: result.error,
    }
  }

  try {
    return {
      data: JSON.parse(result.data) as T,
      verified: true,
    }
  } catch {
    return {
      data: null,
      verified: false,
      error: 'Failed to parse JSON data',
    }
  }
}
