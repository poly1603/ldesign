/**
 * 加密算法类型
 */
export type EncryptionAlgorithm =
  | 'AES'
  | 'RSA'
  | 'DES'
  | '3DES'
  | 'Blowfish'

/**
 * AES 加密模式
 */
export type AESMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM'

/**
 * AES 密钥长度
 */
export type AESKeySize = 128 | 192 | 256

/**
 * 哈希算法类型
 */
export type HashAlgorithm =
  | 'MD5'
  | 'SHA1'
  | 'SHA224'
  | 'SHA256'
  | 'SHA384'
  | 'SHA512'

/**
 * HMAC 算法类型
 */
export type HMACAlgorithm =
  | 'HMAC-MD5'
  | 'HMAC-SHA1'
  | 'HMAC-SHA256'
  | 'HMAC-SHA384'
  | 'HMAC-SHA512'

/**
 * 编码类型
 */
export type EncodingType = 'base64' | 'hex' | 'utf8'

/**
 * RSA 密钥格式
 */
export type RSAKeyFormat = 'pkcs1' | 'pkcs8' | 'spki'

/**
 * RSA 密钥对
 */
export interface RSAKeyPair {
  publicKey: string
  privateKey: string
}

/**
 * AES 加密选项
 */
export interface AESOptions {
  mode?: AESMode
  keySize?: AESKeySize
  iv?: string
  padding?: string
  /**
   * 密钥派生盐值（十六进制字符串）
   * 安全建议：使用随机盐值以提高安全性
   * 如果不提供，将使用密钥的SHA-256哈希作为盐值（确定性但更安全）
   */
  salt?: string
  /**
   * PBKDF2迭代次数
   * 默认：100,000（符合OWASP 2023推荐）
   * 警告：较低的迭代次数会降低安全性
   */
  iterations?: number
}

/**
 * RSA 加密选项
 */
export interface RSAOptions {
  keyFormat?: RSAKeyFormat
  keySize?: number
  padding?: string
}

/**
 * DES 加密选项
 */
export interface DESOptions {
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB'
  iv?: string
  padding?: string
}

/**
 * 3DES 加密选项
 */
export interface TripleDESOptions {
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB'
  iv?: string
  padding?: string
}

/**
 * Blowfish 加密选项
 */
export interface BlowfishOptions {
  mode?: 'CBC' | 'ECB'
  iv?: string
  padding?: boolean
}

/**
 * 加密选项联合类型 - 用于泛型加密方法
 */
export type EncryptionOptions =
  | AESOptions
  | RSAOptions
  | DESOptions
  | TripleDESOptions
  | BlowfishOptions

/**
 * 哈希选项
 */
export interface HashOptions {
  encoding?: EncodingType
}

/**
 * HMAC 选项
 */
export interface HMACOptions {
  encoding?: EncodingType
}

/**
 * 加密结果
 */
export interface EncryptResult {
  success: boolean
  data?: string
  algorithm: string
  mode?: string
  iv?: string
  salt?: string
  keySize?: number
  nonce?: string
  aad?: string
  error?: string
}

/**
 * 解密结果
 */
export interface DecryptResult {
  success: boolean
  data?: string
  algorithm: string
  mode?: string
  error?: string
}

/**
 * 哈希结果
 */
export interface HashResult {
  success: boolean
  hash: string
  algorithm: string
  encoding: EncodingType
  error?: string
}

/**
 * 密钥生成选项
 */
export interface KeyGenerationOptions {
  algorithm: EncryptionAlgorithm
  keySize?: number
  format?: string
}

/**
 * 加密器接口
 * 注意：使用any以支持各算法的特定选项类型，各算法实现内部保持类型安全
 */
export interface IEncryptor {
  encrypt: (data: string, key: string, options?: Record<string, unknown>) => EncryptResult | Promise<EncryptResult>
  decrypt: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: Record<string, unknown>
  ) => DecryptResult | Promise<DecryptResult>
}

/**
 * 哈希器接口
 */
export interface IHasher {
  hash: (
    data: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => HashResult
  verify: (
    data: string,
    expectedHash: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => boolean
}

/**
 * HMAC 接口
 */
export interface IHMACer {
  hmac: (
    data: string,
    key: string,
    algorithm: HMACAlgorithm,
    options?: HMACOptions
  ) => HashResult
  verify: (
    data: string,
    key: string,
    hmac: string,
    algorithm: HMACAlgorithm,
    options?: HMACOptions
  ) => boolean
}

/**
 * 编码器接口
 */
export interface IEncoder {
  encode: (data: string, encoding: EncodingType) => string
  decode: (encodedData: string, encoding: EncodingType) => string
}

/**
 * 密钥生成器接口
 */
export interface IKeyGenerator {
  generateKey: (options: KeyGenerationOptions) => string | RSAKeyPair
  generateRandomBytes: (length: number) => string
  generateSalt: (length?: number) => string
  generateIV: (length?: number) => string
}

/**
 * 导出 CryptoJS 类型定义
 */
export type * from './cryptojs'