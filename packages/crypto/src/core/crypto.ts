import type {
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  EncodingType,
  EncryptionAlgorithm,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  RSAKeyPair,
  RSAOptions,
  TripleDESOptions,
} from '../types'
import {
  aes,
  blowfish,
  des,
  des3,
  encoding,
  hash,
  hmac,
  rsa,
  tripledes,
} from '../algorithms'
import { Encoder } from '../algorithms/encoding'
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
  aes128(
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult {
    return aes.encrypt128(data, key, options)
  }

  /**
   * AES-192 加密
   */
  aes192(
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult {
    return aes.encrypt192(data, key, options)
  }

  /**
   * AES-256 加密
   */
  aes256(
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult {
    return aes.encrypt256(data, key, options)
  }

  /**
   * RSA 加密
   */
  rsa(data: string, publicKey: string, options?: RSAOptions): EncryptResult {
    return rsa.encrypt(data, publicKey, options)
  }

  /**
   * DES 加密
   */
  des(data: string, key: string, options?: DESOptions): EncryptResult {
    return des.encrypt(data, key, options)
  }

  /**
   * 3DES 加密
   */
  des3(data: string, key: string, options?: TripleDESOptions): EncryptResult {
    return des3.encrypt(data, key, options)
  }

  /**
   * Triple DES 加密 (别名)
   */
  tripledes(
    data: string,
    key: string,
    options?: TripleDESOptions,
  ): EncryptResult {
    return tripledes.encrypt(data, key, options)
  }

  /**
   * Blowfish 加密
   */
  blowfish(
    data: string,
    key: string,
    options?: BlowfishOptions,
  ): EncryptResult {
    return blowfish.encrypt(data, key, options)
  }

  /**
   * 通用加密方法
   * 根据算法类型自动选择合适的加密方法
   */
  encrypt(
    data: string,
    key: string,
    algorithm: EncryptionAlgorithm,
    options?: any,
  ): EncryptResult {
    switch (algorithm.toUpperCase()) {
      case 'AES':
        return this.aes(data, key, options as AESOptions)
      case 'RSA':
        return this.rsa(data, key, options as RSAOptions)
      case 'DES':
        return this.des(data, key, options as DESOptions)
      case '3DES':
        return this.des3(data, key, options as TripleDESOptions)
      case 'BLOWFISH':
        return this.blowfish(data, key, options as BlowfishOptions)
      default:
        return {
          success: false,
          error: `Unsupported encryption algorithm: ${algorithm}`,
          algorithm,
        }
    }
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
  private encoder = new Encoder()
  /**
   * AES 解密
   */
  aes(
    encryptedData: string | EncryptResult,
    key: string,
    options?: AESOptions,
  ): DecryptResult {
    return aes.decrypt(encryptedData, key, options)
  }

  /**
   * AES-128 解密
   */
  aes128(
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult {
    return aes.decrypt128(encryptedData, key, options)
  }

  /**
   * AES-192 解密
   */
  aes192(
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult {
    return aes.decrypt192(encryptedData, key, options)
  }

  /**
   * AES-256 解密
   */
  aes256(
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult {
    return aes.decrypt256(encryptedData, key, options)
  }

  /**
   * RSA 解密
   */
  rsa(
    encryptedData: string | EncryptResult,
    privateKey: string,
    options?: RSAOptions,
  ): DecryptResult {
    return rsa.decrypt(encryptedData, privateKey, options)
  }

  /**
   * DES 解密
   */
  des(
    encryptedData: string | EncryptResult,
    key: string,
    options?: DESOptions,
  ): DecryptResult {
    return des.decrypt(encryptedData, key, options)
  }

  /**
   * 3DES 解密
   */
  des3(
    encryptedData: string | EncryptResult,
    key: string,
    options?: TripleDESOptions,
  ): DecryptResult {
    return des3.decrypt(encryptedData, key, options)
  }

  /**
   * Triple DES 解密 (别名)
   */
  tripledes(
    encryptedData: string | EncryptResult,
    key: string,
    options?: TripleDESOptions,
  ): DecryptResult {
    return tripledes.decrypt(encryptedData, key, options)
  }

  /**
   * Blowfish 解密
   */
  blowfish(
    encryptedData: string | EncryptResult,
    key: string,
    options?: BlowfishOptions,
  ): DecryptResult {
    return blowfish.decrypt(encryptedData, key, options)
  }

  /**
   * 通用解密方法
   * 根据算法类型自动选择合适的解密方法
   */
  decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    algorithm?: EncryptionAlgorithm,
    options?: any,
  ): DecryptResult {
    // 如果传入的是 EncryptResult 对象，尝试从中获取算法信息
    let targetAlgorithm = algorithm
    if (typeof encryptedData === 'object' && encryptedData.algorithm) {
      targetAlgorithm = encryptedData.algorithm as EncryptionAlgorithm
    }

    if (!targetAlgorithm) {
      return {
        success: false,
        error: 'Algorithm must be specified for decryption',
        algorithm: 'Unknown',
      }
    }

    switch (targetAlgorithm.toUpperCase()) {
      case 'AES':
        return this.aes(encryptedData, key, options as AESOptions)
      case 'RSA':
        return this.rsa(encryptedData, key, options as RSAOptions)
      case 'DES':
        return this.des(encryptedData, key, options as DESOptions)
      case '3DES':
        return this.des3(encryptedData, key, options as TripleDESOptions)
      case 'BLOWFISH':
        return this.blowfish(encryptedData, key, options as BlowfishOptions)
      default:
        return {
          success: false,
          error: `Unsupported decryption algorithm: ${targetAlgorithm}`,
          algorithm: targetAlgorithm,
        }
    }
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
    return this.encoder.decode(encodedData, encoding)
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
  hash(
    data: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): string {
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
  verify(
    data: string,
    expectedHash: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): boolean {
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
  hmac(
    data: string,
    key: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): string {
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
  verify(
    data: string,
    key: string,
    expectedHmac: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): boolean {
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
  generateRSAKeyPair(
    keySize: number = CONSTANTS.RSA.DEFAULT_KEY_SIZE,
  ): RSAKeyPair {
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
  verify(
    data: string,
    signature: string,
    publicKey: string,
    algorithm: string = 'sha256',
  ): boolean {
    return rsa.verify(data, signature, publicKey, algorithm)
  }
}
