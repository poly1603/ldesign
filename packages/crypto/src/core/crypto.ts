import type {
  AESOptions,
  DecryptResult,
  EncodingType,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  RSAKeyPair,
  RSAOptions,
} from '../types'
import { aes, encoding, hash, hmac, rsa } from '../algorithms'
import { CONSTANTS, RandomUtils } from '../utils'

/**
 * 加密类
 */
export class Encrypt {
  /**
   * AES 加密
   */
  aes(data: string, key: string, options?: AESOptions): EncryptResult {
    return aes.encrypt(data, key, options)
  }

  /**
   * AES-128 加密
   */
  aes128(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult {
    return aes.encrypt128(data, key, options)
  }

  /**
   * AES-192 加密
   */
  aes192(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult {
    return aes.encrypt192(data, key, options)
  }

  /**
   * AES-256 加密
   */
  aes256(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult {
    return aes.encrypt256(data, key, options)
  }

  /**
   * RSA 加密
   */
  rsa(data: string, publicKey: string, options?: RSAOptions): EncryptResult {
    return rsa.encrypt(data, publicKey, options)
  }

  /**
   * Base64 编码
   */
  base64(data: string): string {
    return encoding.base64.encode(data)
  }

  /**
   * URL 安全的 Base64 编码
   */
  base64Url(data: string): string {
    return encoding.base64.encodeUrl(data)
  }

  /**
   * Hex 编码
   */
  hex(data: string): string {
    return encoding.hex.encode(data)
  }

  /**
   * 通用编码
   */
  encode(data: string, encodingType: EncodingType): string {
    return encoding.encode(data, encodingType)
  }
}

/**
 * 解密类
 */
export class Decrypt {
  /**
   * AES 解密
   */
  aes(encryptedData: string | EncryptResult, key: string, options?: AESOptions): DecryptResult {
    return aes.decrypt(encryptedData, key, options)
  }

  /**
   * AES-128 解密
   */
  aes128(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult {
    return aes.decrypt128(encryptedData, key, options)
  }

  /**
   * AES-192 解密
   */
  aes192(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult {
    return aes.decrypt192(encryptedData, key, options)
  }

  /**
   * AES-256 解密
   */
  aes256(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult {
    return aes.decrypt256(encryptedData, key, options)
  }

  /**
   * RSA 解密
   */
  rsa(encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions): DecryptResult {
    return rsa.decrypt(encryptedData, privateKey, options)
  }

  /**
   * Base64 解码
   */
  base64(encodedData: string): string {
    return encoding.base64.decode(encodedData)
  }

  /**
   * URL 安全的 Base64 解码
   */
  base64Url(encodedData: string): string {
    return encoding.base64.decodeUrl(encodedData)
  }

  /**
   * Hex 解码
   */
  hex(encodedData: string): string {
    return encoding.hex.decode(encodedData)
  }

  /**
   * 通用解码
   */
  decode(encodedData: string, encoding: EncodingType): string {
    return encoding.decode(encodedData, encoding)
  }
}

/**
 * 哈希类
 */
export class Hash {
  /**
   * MD5 哈希
   */
  md5(data: string, options?: HashOptions): string {
    return hash.md5(data, options)
  }

  /**
   * SHA1 哈希
   */
  sha1(data: string, options?: HashOptions): string {
    return hash.sha1(data, options)
  }

  /**
   * SHA224 哈希
   */
  sha224(data: string, options?: HashOptions): string {
    return hash.sha224(data, options)
  }

  /**
   * SHA256 哈希
   */
  sha256(data: string, options?: HashOptions): string {
    return hash.sha256(data, options)
  }

  /**
   * SHA384 哈希
   */
  sha384(data: string, options?: HashOptions): string {
    return hash.sha384(data, options)
  }

  /**
   * SHA512 哈希
   */
  sha512(data: string, options?: HashOptions): string {
    return hash.sha512(data, options)
  }

  /**
   * 通用哈希
   */
  hash(data: string, algorithm: HashAlgorithm = 'SHA256', options?: HashOptions): string {
    switch (algorithm.toUpperCase()) {
      case 'MD5':
        return this.md5(data, options)
      case 'SHA1':
        return this.sha1(data, options)
      case 'SHA224':
        return this.sha224(data, options)
      case 'SHA256':
        return this.sha256(data, options)
      case 'SHA384':
        return this.sha384(data, options)
      case 'SHA512':
        return this.sha512(data, options)
      default:
        return this.sha256(data, options)
    }
  }

  /**
   * 验证哈希
   */
  verify(data: string, expectedHash: string, algorithm: HashAlgorithm = 'SHA256', options?: HashOptions): boolean {
    return hash.verify(data, expectedHash, algorithm, options)
  }
}

/**
 * HMAC 类
 */
export class HMAC {
  /**
   * HMAC-MD5
   */
  md5(data: string, key: string, options?: HashOptions): string {
    return hmac.md5(data, key, options)
  }

  /**
   * HMAC-SHA1
   */
  sha1(data: string, key: string, options?: HashOptions): string {
    return hmac.sha1(data, key, options)
  }

  /**
   * HMAC-SHA256
   */
  sha256(data: string, key: string, options?: HashOptions): string {
    return hmac.sha256(data, key, options)
  }

  /**
   * HMAC-SHA384
   */
  sha384(data: string, key: string, options?: HashOptions): string {
    return hmac.sha384(data, key, options)
  }

  /**
   * HMAC-SHA512
   */
  sha512(data: string, key: string, options?: HashOptions): string {
    return hmac.sha512(data, key, options)
  }

  /**
   * 通用 HMAC
   */
  hmac(data: string, key: string, algorithm: HashAlgorithm = 'SHA256', options?: HashOptions): string {
    switch (algorithm.toUpperCase()) {
      case 'MD5':
        return this.md5(data, key, options)
      case 'SHA1':
        return this.sha1(data, key, options)
      case 'SHA256':
        return this.sha256(data, key, options)
      case 'SHA384':
        return this.sha384(data, key, options)
      case 'SHA512':
        return this.sha512(data, key, options)
      default:
        return this.sha256(data, key, options)
    }
  }

  /**
   * 验证 HMAC
   */
  verify(data: string, key: string, expectedHmac: string, algorithm: HashAlgorithm = 'SHA256', options?: HashOptions): boolean {
    return hmac.verify(data, key, expectedHmac, algorithm, options)
  }
}

/**
 * 密钥生成类
 */
export class KeyGenerator {
  /**
   * 生成 RSA 密钥对
   */
  generateRSAKeyPair(keySize: number = CONSTANTS.RSA.DEFAULT_KEY_SIZE): RSAKeyPair {
    return rsa.generateKeyPair(keySize)
  }

  /**
   * 生成随机密钥
   */
  generateKey(length: number = 32): string {
    return RandomUtils.generateKey(length)
  }

  /**
   * 生成随机字节
   */
  generateRandomBytes(length: number): string {
    return RandomUtils.generateRandomString(length)
  }

  /**
   * 生成盐值
   */
  generateSalt(length: number = 16): string {
    return RandomUtils.generateSalt(length)
  }

  /**
   * 生成初始化向量
   */
  generateIV(length: number = 16): string {
    return RandomUtils.generateIV(length)
  }
}

/**
 * 数字签名类
 */
export class DigitalSignature {
  /**
   * RSA 签名
   */
  sign(data: string, privateKey: string, algorithm: string = 'sha256'): string {
    return rsa.sign(data, privateKey, algorithm)
  }

  /**
   * RSA 验证签名
   */
  verify(data: string, signature: string, publicKey: string, algorithm: string = 'sha256'): boolean {
    return rsa.verify(data, signature, publicKey, algorithm)
  }
}
